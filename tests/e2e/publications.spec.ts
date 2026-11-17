import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public work journal links a dated update and a real project page", async ({page, request}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", {name:"Masanın üstünde."})).toBeVisible();
  await page.getByRole("link", {name:"Çalışma günlüğü", exact:true}).click();
  await expect(page.getByRole("heading", {level:1})).toHaveText("Yaparkenöğrendiklerim.");
  await page.getByRole("link", {name:"Kendini güncel tutan bir portföy", exact:true}).click();
  await expect(page.locator("main")).toContainText("Geliştiriliyor");
  await expect(page.locator("main")).toContainText("henüz tamamlanmadı");
  await page.getByRole("link", {name:"Proje dosyası", exact:true}).click();
  await expect(page.getByRole("heading", {name:"Problem", exact:true})).toBeVisible();
  await expect(page.locator("main")).not.toContainText("source_ref");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/updates/portfolio-yenileme");
  expect(sitemap).toContain("/work/portfolio-yenileme");
});

for (const route of ["/updates", "/updates/portfolio-yenileme", "/work/portfolio-yenileme"]) {
  test(`${route} is accessible and does not overflow`, async ({page}) => {
    await page.goto(route);
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("unknown public IDs produce the actual not-found page", async ({page}) => {
  const response = await page.goto("/updates/not-a-published-project");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", {name:"Bu sayfa bulunamadı."})).toBeVisible();
});
