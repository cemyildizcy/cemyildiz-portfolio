import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

test.describe("QA Screenshots and Audits", () => {
  test.beforeAll(async () => {
    const dir = path.join(process.cwd(), "docs", "qa");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test("Capture desktop 1440x1000", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(overflow).toBe(true);

    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations).toEqual([]);

    await page.screenshot({ path: "docs/qa/homepage-1440x1000.png", fullPage: true });
    await page.screenshot({ path: "docs/qa/homepage-1440x1000-viewport.png", fullPage: false });
  });

  test("Capture mobile 390x844 and initial viewport evidence", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(overflow).toBe(true);

    // Initial mobile viewport must show hero and real GündemAI screenshot
    const gundemImg = page.locator(".hero-product img");
    await expect(gundemImg).toBeVisible();
    const box = await gundemImg.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Must be partially or wholly within initial 844px height viewport
      expect(box.y).toBeLessThan(844);
    }

    await page.screenshot({ path: "docs/qa/homepage-390x844-initial-viewport.png", fullPage: false });
    await page.screenshot({ path: "docs/qa/homepage-390x844-full.png", fullPage: true });
  });

  test("Capture narrow mobile 320x844", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(overflow).toBe(true);

    await page.screenshot({ path: "docs/qa/homepage-320x844-full.png", fullPage: true });
    await page.screenshot({ path: "docs/qa/homepage-320x844-viewport.png", fullPage: false });
  });

  test("Capture 200% zoom reflow", async ({ page }) => {
    // 200% zoom on 1280x800 viewport is effectively 640x400 CSS pixels
    await page.setViewportSize({ width: 640, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(overflow).toBe(true);

    await page.screenshot({ path: "docs/qa/homepage-zoom200-full.png", fullPage: true });
    await page.screenshot({ path: "docs/qa/homepage-zoom200-viewport.png", fullPage: false });
  });
});
