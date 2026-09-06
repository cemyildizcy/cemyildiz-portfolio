import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["gundem-ai", "wc2026-ai-simulator", "sleepinfo"];

test("ana sayfa Cem'i ve çalışma yönünü açık Türkçeyle tanıtır", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.getByRole("heading", { name: "Matematikten yapay zekâ ürünlerine." })).toBeVisible();
  await expect(page.getByText("ESOGÜ Matematik ve Bilgisayar Bilimleri öğrencisiyim.")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Ana gezinme" })).toBeVisible();
  await expect(page).toHaveTitle(/Cem Yıldız \| Yapay zekâ projeleri/);
  await expect(page.getByText(/kanıt defteri|iddia/i)).toHaveCount(0);
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
    await expect(page.getByRole("heading", { name: "Problem" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ne yaptım?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Yapay zekânın katkısı" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ne öğrendim, sınırlar neler?" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}

test("404 Türkçe açıklama ve dönüş bağlantısı sunar", async ({ page }) => {
  await page.goto("/olmayan-sayfa");
  await expect(page.getByRole("heading", { name: "Bu sayfa bulunamadı." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ana sayfaya dön" })).toBeVisible();
});

test("sitemap üç vaka rotasını içerir", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  for (const slug of routes) expect(body).toContain(`/work/${slug}`);
});

test("temel kişisel içerik ve doğrulanmış dış bağlantılar görünür", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByAltText("Cem Yıldız profil fotoğrafı")).toBeVisible();
  await expect(page.getByRole("link", { name: /CV.*indir/i }).first()).toHaveAttribute("href", "/documents/Cem_Yildiz_CV.pdf");
  await expect(page.getByRole("heading", { name: "Eğitim" })).toBeVisible();
  await expect(page.getByRole("link", { name: "2026 Dünya Kupası AI Simülatörü" })).toHaveAttribute("href", /7470769047601664000/);
  await expect(page.getByRole("link", { name: "Tüm yazılar" })).toHaveAttribute("href", "/blog");
});

test("seçilmiş blog yazıları tam sayfalar ve sitemap girdileri sunar", async ({ page, request }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Seçilmiş yazılar" })).toBeVisible();
  const article = page.getByRole("link", { name: /Makine Öğrenmesinde Veri Sızıntısı/ });
  await expect(article).toBeVisible();
  await article.click();
  await expect(page.getByText("Problem: model hangi bilgiyi ne zaman bilebilir?")).toBeVisible();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/blog/makine-ogrenmesinde-veri-sizintisi");
});

test("cross-validation yazısı kod, tablo ve kaynak bağlantılarını biçimli gösterir", async ({ page }) => {
  await page.goto("/blog/cross-validation-stratejisi-nasil-secilir");
  await expect(page.getByRole("heading", { name: "Cross-validation stratejisi nasıl seçilir?" })).toBeVisible();
  await expect(page.locator("pre code.language-python")).toHaveCount(7);
  await expect(page.locator("pre code").first()).toContainText("results = cross_validate(\n    model,");
  await expect(page.locator("table")).toHaveCount(1);
  await expect(page.locator("table tbody tr")).toHaveCount(5);
  const source = page.getByRole("link", { name: "scikit-learn: Cross-validation" });
  await expect(source).toHaveAttribute(
    "href",
    "https://scikit-learn.org/stable/modules/cross_validation.html",
  );
  await expect(source).toHaveAttribute("rel", "noopener noreferrer");
});

test("ana sayfada ciddi erişilebilirlik ihlali veya yatay taşma yoktur", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
