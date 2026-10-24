import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const baseURL = "http://127.0.0.1:3100";
const server = spawn("npm", ["run", "start", "--", "--hostname", "127.0.0.1", "--port", "3100"], {
  stdio: "ignore",
  env: { ...process.env, PORT: "3100" },
  shell: process.platform === "win32"
});
let browser;
try {
  await fs.mkdir("artifacts/screenshots", { recursive: true });
  let ready = false;
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (!ready) throw new Error("Next.js production server did not become ready.");
  browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const routes = [
    { path: "/", file: "home-desktop.png" },
    { path: "/login", file: "login-desktop.png" },
    { path: "/ai", file: "ai-desktop.png" },
    { path: "/cart", file: "cart-desktop.png" },
    { path: "/checkout", file: "checkout-desktop.png" }
  ];
  for (const route of routes) {
    const response = await desktop.goto(baseURL + route.path, { waitUntil: "networkidle", timeout: 30000 });
    if (!response || response.status() >= 500) throw new Error(route.path + " returned HTTP " + (response?.status() ?? "no response"));
    await desktop.screenshot({ path: "artifacts/screenshots/" + route.file, fullPage: true });
    console.log("Screenshot saved: " + route.file + " (HTTP " + response.status() + ")");
  }
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const response = await mobile.goto(baseURL + "/", { waitUntil: "networkidle", timeout: 30000 });
  if (!response || response.status() >= 500) throw new Error("Mobile homepage returned HTTP " + (response?.status() ?? "no response"));
  await mobile.screenshot({ path: "artifacts/screenshots/home-mobile.png", fullPage: true });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  if (overflow) throw new Error("Mobile homepage has horizontal overflow.");
  console.log("Screenshot saved: home-mobile.png; mobile overflow check passed.");
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
