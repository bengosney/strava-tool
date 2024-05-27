import puppeteer from "puppeteer";
import config from './config.js';

(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 2000 });
  await page.goto("https://www.strava.com/login");

  await page.type("#email", config.strava.username);
  await page.type("#password", config.strava.password);
  await Promise.all([
    page.click("#login-button"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  await page.goto(`https://www.strava.com/clubs/${config.strava.club_id}/recent_activity`);
  await page.$$eval(
    'button[data-testid="kudos_button"]:has([data-testid="unfilled_kudos"])',
    (buttons) => buttons.forEach((button) => button.click())
  );

  await browser.close();
})();
