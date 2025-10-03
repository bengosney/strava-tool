import puppeteer, { Browser, Page } from "puppeteer";
import { readFileSync } from "fs";
import path from "path";

interface StravaConfig {
  strava: {
    username: string;
    password: string;
    club_id: string;
  };
}

function loadConfig(): StravaConfig {
  const configPath = path.resolve(__dirname, "./config.json");
  const raw = readFileSync(configPath, "utf-8");
  return JSON.parse(raw);
}

const log = (message: string, ...options: any[]) =>
  console.log(`[${new Date().toISOString()}] ${message}`, ...options);

(async () => {
  log("Starting auto-kudos script");

  log("Loading configuration");
  const config = loadConfig();

  log("Launching browser");
  const browser: Browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 2000 });
  await page.goto("https://www.strava.com/login");

  log("Logging in");
  await page.type("#email", config.strava.username);
  await page.type("#password", config.strava.password);
  await Promise.all([
    page.click("#login-button"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  log("Navigating to club page", config.strava.club_id);
  await page.goto(
    `https://www.strava.com/clubs/${config.strava.club_id}/recent_activity`,
  );

  log("Add kudos all activities");
  await page.$$eval(
    'button[data-testid="kudos_button"]:has([data-testid="unfilled_kudos"])',
    (buttons) => buttons.forEach((button) => button.click()),
  );

  await browser.close();
  log("Auto-kudos script completed");
})();
