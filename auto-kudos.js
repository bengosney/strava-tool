import puppeteer from "puppeteer";
import config from "./config.js";

const log = (message, ...options) => console.log(`[${new Date().toISOString()}] ${message}`, ...options);

(async () => {
  log("Starting auto-kudos script");
  const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
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
  await page.goto(`https://www.strava.com/clubs/${config.strava.club_id}/recent_activity`);

  log("Add kudos all activities");
  await page.$$eval(
    'button[data-testid="kudos_button"]:has([data-testid="unfilled_kudos"])',
    (buttons) => buttons.forEach((button) => button.click())
  );

  await browser.close();
  log("Auto-kudos script completed");
})();
