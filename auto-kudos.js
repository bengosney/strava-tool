import puppeteer from "puppeteer";
import process from 'node:process';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 2000 });
  await page.goto("https://www.strava.com/login");

  await page.type("#email", process.env.STRAVA_USERNAME);
  await page.type("#password", process.env.STRAVA_PASSWORD);
  await Promise.all([
    page.click("#login-button"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  await page.goto(`https://www.strava.com/clubs/${process.env.STRAVA_CLUB_ID}/recent_activity`);
  await page.$$eval(
    'button[data-testid="kudos_button"]:has([data-testid="unfilled_kudos"])',
    (buttons) => buttons.forEach((button) => button.click())
  );

  await browser.close();
})();
