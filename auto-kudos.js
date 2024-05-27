import puppeteer from "puppeteer";
import config from './config.js';

(async () => {
  console.log("Starting auto-kudos script");
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 2000 });
  await page.goto("https://www.strava.com/login");

  console.log("Logging in");
  await page.type("#email", config.strava.username);
  await page.type("#password", config.strava.password);
  await Promise.all([
    page.click("#login-button"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  console.log("Navigating to club page", config.strava.club_id);
  await page.goto(`https://www.strava.com/clubs/${config.strava.club_id}/recent_activity`);
  await page.$$eval(
    'button[data-testid="kudos_button"]:has([data-testid="unfilled_kudos"])',
    (buttons) => {
      console.log(`Kudos buttons found: ${buttons.length}`);
      buttons.forEach((button) => button.click());
    }
  );

  await browser.close();
  console.log("Auto-kudos script completed");
})();
