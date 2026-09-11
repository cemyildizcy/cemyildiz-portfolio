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


test("kalibrasyon yazısı kod, tablo ve kaynak bağlantılarını biçimli gösterir", async ({ page }) => {
  await page.goto("/blog/siniflandirici-kalibrasyonu-predict-proba-guvenilirligi");
  await expect(page.getByRole("heading", { name: "Sınıflandırıcı kalibrasyonu: predict_proba çıktısı ne kadar güvenilir?" })).toBeVisible();
  await expect(page.locator("pre code.language-python")).toHaveCount(4);
  await expect(page.locator("pre code").first()).toContainText("from sklearn.calibration import calibration_curve");
  await expect(page.locator("table")).toHaveCount(1);
  await expect(page.locator("table tbody tr")).toHaveCount(5);
  const source = page.getByRole("link", { name: "scikit-learn: Probability calibration" });
  await expect(source).toHaveAttribute(
    "href",
    "https://scikit-learn.org/stable/modules/calibration.html",
  );
  await expect(source).toHaveAttribute("rel", "noopener noreferrer");
});

test("ana sayfada ciddi erişilebilirlik ihlali veya yatay taşma yoktur", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("ai-inceleme-masasi rotası başlık, editoryal açıklama ve insan denetimi etiketini sunar", async ({ page }) => {
  await page.goto("/ai-inceleme-masasi");
  await expect(page).toHaveTitle(/AI İnceleme Masası \| Cem Yıldız/);
  await expect(page.getByRole("heading", { level: 1, name: "AI İnceleme Masası" })).toBeVisible();
  await expect(page.getByText("Son kontrol: Cem.")).toBeVisible();
});

test("vaka ve mod seçimi hipotezi günceller", async ({ page }) => {
  await page.goto("/ai-inceleme-masasi");
  await expect(page.getByText("Yüksek doğruluk (accuracy), modelin güvenilir olduğunu kanıtlar mı?")).toBeVisible();

  const claim2Btn = page.getByRole("button", { name: /GündemAI Çok Kaynaklı Habercilik/i });
  await claim2Btn.click();
  await expect(page.getByText("Farklı kaynaklar aynı olayı aynı şekilde mi anlatır?")).toBeVisible();
});

test("claim-1 ve hızlı mod ile tam akış doğrulanmış bulguları, kararı ve makbuzu canlı gösterir", async ({ page }) => {
  await page.goto("/ai-inceleme-masasi");

  const startBtn = page.getByRole("button", { name: /İncelemeyi Başlat/i });
  await expect(startBtn).toBeVisible();
  await startBtn.click();

  // Rollerin ve bulguların akması
  await expect(page.getByTestId("verdict-badge")).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId("verdict-badge")).toContainText("Desteklendi");
  await expect(page.getByTestId("receipt-card")).toBeVisible();
  await expect(page.getByTestId("receipt-card")).toContainText("Son kontrol: Cem.");

  // Kaynak bağlantısı güvenlik öznitelikleri
  const sourceLink = page.locator("a[data-source-id='src-ml-guo-2017']").first();
  await expect(sourceLink).toBeVisible();
  await expect(sourceLink).toHaveAttribute("href", "https://arxiv.org/abs/1706.04599");
  await expect(sourceLink).toHaveAttribute("target", "_blank");
  await expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("çalışma esnasında inceleme iptal edilebilir ve sıfırlanabilir", async ({ page }) => {
  await page.goto("/ai-inceleme-masasi");

  // İptal düğmesini test etmek için akış yanıtını kontrollü beklet
  await page.route("/api/review/runs", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue().catch(() => {});
  });

  const startBtn = page.getByRole("button", { name: /İncelemeyi Başlat/i });
  await startBtn.click();

  const cancelBtn = page.getByRole("button", { name: /İptal Et/i });
  await expect(cancelBtn).toBeVisible();
  await cancelBtn.click();
  await expect(page.getByText(/İnceleme iptal edildi/i).first()).toBeVisible();

  const resetBtn = page.getByRole("button", { name: /Sıfırla/i });
  await expect(resetBtn).toBeVisible();
  await resetBtn.click();
  await expect(page.getByText(/İnceleme sıfırlandı/i)).toBeVisible();
});


test("ai-inceleme-masasi rotasında buton dokunma hedefleri en az 44x44 pikseldir ve yatay taşma yoktur", async ({ page }) => {
  await page.goto("/ai-inceleme-masasi");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  const buttons = page.locator("button");
  const count = await buttons.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    if (await btn.isVisible()) {
      const box = await btn.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
});

test("ai-inceleme-masasi rotasında Axe denetiminde 0 ihlal vardır", async ({ page }) => {
  await page.goto("/ai-inceleme-masasi");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("klavye ile vaka seçimi ve inceleme başlatma çalışır", async ({ page }) => {
  await page.goto("/ai-inceleme-masasi");

  // Tab ile vaka butonuna odaklan ve Enter ile seç
  const claim1Btn = page.getByRole("button", { name: /Model Doğruluğu/i });
  await claim1Btn.focus();
  await page.keyboard.press("Enter");
  await expect(claim1Btn).toHaveAttribute("aria-pressed", "true");

  // İncelemeyi başlat butonuna odaklan ve Space ile tetikle
  const startBtn = page.getByRole("button", { name: /İncelemeyi Başlat/i });
  await startBtn.focus();
  await page.keyboard.press("Space");

  await expect(page.getByTestId("verdict-badge")).toBeVisible({ timeout: 10000 });
});

test("azaltılmış hareket (prefers-reduced-motion) modunda sayfa sorunsuz yüklenir ve çalışır", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ai-inceleme-masasi");
  await expect(page.getByRole("heading", { level: 1, name: "AI İnceleme Masası" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("taslak vaka seçildiğinde inceleme başlatılırsa erişilemezlik bildirimi gösterir", async ({ page }) => {
  await page.goto("/ai-inceleme-masasi");
  const claim2Btn = page.getByRole("button", { name: /GündemAI Çok Kaynaklı Habercilik/i });
  await claim2Btn.click();

  const startBtn = page.getByRole("button", { name: /İncelemeyi Başlat/i });
  await startBtn.click();

  await expect(page.getByText(/Bu iddia veya inceleme modu henüz erişilebilir değil/i).first()).toBeVisible();
});
