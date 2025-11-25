/* Minimal smoke test using Puppeteer.
 * Assumes your Next.js app is already running locally
 * at BASE_URL (default http://localhost:3000).
 */

const puppeteer = require("puppeteer");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const PATHS = [
  "/",
  "/warehouse",
  "/shipments",
  "/customers",
  "/invoices",
  "/rates",
  "/aircargo",
  "/barcodes",
  "/alerts",
  "/support",
  "/analytics",
  "/admin",
];

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  try {
    for (const path of PATHS) {
      const page = await browser.newPage();
      const url = `${BASE_URL}${path}`;
      console.log(`Checking ${url} ...`);

      const res = await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      const status = res?.status?.() ?? 0;
      if (!status || status >= 400) {
        throw new Error(`Non-OK status ${status} for ${url}`);
      }

      await page.close();
    }

    console.log("Smoke tests passed: all routes responded successfully.");
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error("Smoke tests failed:", err);
    await browser.close();
    process.exit(1);
  }
})();
