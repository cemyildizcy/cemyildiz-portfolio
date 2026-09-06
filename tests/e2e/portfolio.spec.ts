import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["gundem-ai", "wc2026-ai-simulator", "sleepinfo"];

test("ana sayfa Türkçe içerik ve belge dili sunar", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.getByRole("heading", { name: "İddianın yanına kanıtı koyarım." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Ana gezinme" })).toBeVisible();
  await expect(page).toHaveTitle(/Kanıt defteri/);
});

test("sekmeler roving tabindex ve klavye seçimi uygular", async ({ page }) => {
  await page.goto("/");
  const tabs = page.getByRole("tab");
  await expect(tabs.nth(0)).toHaveAttribute("tabindex", "0");
  await expect(tabs.nth(1)).toHaveAttribute("tabindex", "-1");
  await tabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.nth(2)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tabs.nth(0)).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.nth(2)).toBeFocused();
});

for (const slug of routes) {
  test(`${slug} Türkçe vaka sayfasını taşma olmadan gösterir`, async ({ page }) => {
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { name: "Soru" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test("404 Türkçe açıklama ve dönüş bağlantısı sunar", async ({ page }) => {
  await page.goto("/olmayan-sayfa");
  await expect(page.getByRole("heading", { name: "Bu not masada değil." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ana sayfaya dön" })).toBeVisible();
});

test("sitemap üç vaka rotasını içerir", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  for (const slug of routes) expect(body).toContain(`/work/${slug}`);
});

test("ana sayfada ciddi erişilebilirlik ihlali veya yatay taşma yoktur", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
