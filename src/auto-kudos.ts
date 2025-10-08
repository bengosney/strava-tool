import { chromium, Browser, Page } from "playwright";
import { promises as fs } from "fs";
import path from "path";

interface StravaConfig {
  strava: {
    email: string;
    password: string;
    club_id: string;
  };
}

const loadConfig = async (): Promise<StravaConfig> => {
  const configPath = path.resolve("./config.json");
  const raw = await fs.readFile(configPath, "utf-8");
  return JSON.parse(raw);
};

const log = (message: string, ...options: any[]) =>
  console.log(`[${new Date().toISOString()}] ${message}`, ...options);

const authFile: string = path.resolve("./auth.json");

(async () => {
  log("Starting auto-kudos script");

  log("Loading configuration");
  const config = await loadConfig();

  log("Launching browser");
  const browser: Browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const storageState = await fs
    .readFile(authFile, "utf-8")
    .then((data: string) => JSON.parse(data))
    .catch(() => undefined);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 2000 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0",
    storageState: storageState,
  });
  const page: Page = await context.newPage();

  const clubURL = `https://www.strava.com/clubs/${config.strava.club_id}/recent_activity`;
  log("Navigating to club page", config.strava.club_id);
  await page.goto(clubURL);
  await page.waitForLoadState("networkidle");

  if (page.url().includes("/login")) {
    log("Logging in");

    await page
      .getByRole("textbox", { name: "Email" })
      .fill(config.strava.email);
    await page.getByRole("button", { name: "Log In" }).click();
    await page.getByRole("button", { name: "Use password instead" }).click();
    await page
      .getByRole("textbox", { name: "Password" })
      .fill(config.strava.password);
    await page.getByRole("button", { name: "Log in" }).click();

    await page.waitForTimeout(5000);
    await page.waitForLoadState("networkidle");

    await page.goto(clubURL);
    if (page.url().includes("/login")) {
      throw new Error("Login failed");
    }
    await page.context().storageState({ path: authFile });
  }

  await page.waitForLoadState("networkidle");

  log("Add kudos all activities");
  const kudosButtons = await page.getByRole("button", { name: "Give Kudos" });
  log(`Found ${await kudosButtons.count()} kudos buttons`);
  (await kudosButtons.all()).forEach(async (button) => {
    await button.click();
  });

  await browser.close();
  log("Auto-kudos script completed");
})();
