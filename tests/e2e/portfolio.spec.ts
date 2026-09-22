import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["gundem-ai", "wc2026-ai-simulator", "sleepinfo", "bike-demand-temporal-ml", "fashion-mnist-numpy-capacity"];

test("ana sayfa Cem'i açık ve dürüst bir konumlandırmayla tanıtır", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.getByRole("heading", { level: 1, name: "Cem Yıldız" })).toBeVisible();
  await expect(page.locator(".hero-position")).toContainText("ESOGÜ Matematik ve Bilgisayar Bilimleri öğrencisiyim");
  await expect(page.locator(".hero-position")).toContainText("İstatistik ve klasik makine öğrenmesi temellerimi güçlendiriyor");
  await expect(page.locator(".hero-position")).toContainText(/derin öğrenme temellerini deneylerle çalışıyorum/i);
  await expect(page).toHaveTitle(/Cem Yıldız \| Yapay zekâ projeleri/);
});

test("ilk görünüm Cem'i ve GündemAI Google Play ürününü birlikte gösterir", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const portrait = page.getByAltText("Cem Yıldız profil fotoğrafı");
  const product = page.locator(".hero-product").getByAltText(/GündemAI.*gerçek Google Play ekran görüntüsü/i);
  await expect(portrait).toBeVisible();
  await expect(product).toBeVisible();
  await expect(page.locator(".hero-product").getByRole("link", { name: "Google Play'de görüntüle" })).toHaveAttribute(
    "href",
    "https://play.google.com/store/apps/details?id=com.gundemai.app",
  );
  const productBox = await product.boundingBox();
  expect(productBox).toBeTruthy();
  expect(productBox?.y).toBeLessThan(844);
});

test("ana sayfa dört seçili işi gösterir; SleepInfo'yu vitrinde göstermez", async ({ page }) => {
  await page.goto("/");
  const work = page.locator("#work");
  await expect(work.getByRole("heading", { level: 2, name: "Üretilen işler" })).toBeVisible();
  await expect(work.getByRole("heading", { name: "GündemAI" })).toBeVisible();
  await expect(work.getByRole("heading", { name: "Bike Demand: Temporal ML" })).toBeVisible();
  await expect(work.getByRole("heading", { name: "Fashion-MNIST: NumPy ile MLP" })).toBeVisible();
  await expect(work.getByRole("heading", { name: "WC2026 AI Simulator" })).toBeVisible();
  await expect(work.getByAltText(/Kronolojik test MAE karşılaştırması.*77.79/i)).toBeVisible();
  await expect(work.getByAltText(/Fashion-MNIST resmi 10.000 örnekli test kümesi.*%87.03/i)).toBeVisible();
  await expect(work.getByAltText(/WC2026.*çıktı grafiği/i)).toBeVisible();
  await expect(work.getByRole("link", { name: /GündemAI.*vaka/i })).toHaveAttribute("href", "/work/gundem-ai");
  await expect(work.getByText(/SleepInfo/)).toHaveCount(0);
  await expect(work.getByRole("link", { name: /Bike Demand: Temporal ML.*vaka/i })).toHaveAttribute("href", "/work/bike-demand-temporal-ml");
  await expect(work.getByRole("link", { name: /Fashion-MNIST: NumPy ile MLP.*vaka/i })).toHaveAttribute("href", "/work/fashion-mnist-numpy-capacity");
  await expect(work.getByRole("link", { name: /WC2026.*vaka/i })).toHaveAttribute("href", "/work/wc2026-ai-simulator");
});

test("Bike Demand vaka sayfası test metriğini ve hava durumu sınırını açıklar", async ({ page }) => {
  await page.goto("/work/bike-demand-temporal-ml");
  await expect(page.getByRole("heading", { level: 1, name: "Bike Demand: Temporal ML" })).toBeVisible();
  await expect(page.getByText(/MAE 77\.79/)).toBeVisible();
  await expect(page.getByText(/103\.54/)).toBeVisible();
  await expect(page.getByText(/Hava durumu girdileri geçmiş gözlemlerdir/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Test sonuçlarını gör" })).toHaveAttribute(
    "href",
    "https://github.com/cemyildizcy/bike-demand-temporal-ml/blob/main/reports/2026-09-22-bike-demand-results.md",
  );
});

test("Fashion-MNIST vaka sayfası ölçümleri ve deney sınırlarını açıklar", async ({ page }) => {
  await page.goto("/work/fashion-mnist-numpy-capacity");
  await expect(page.getByRole("heading", { level: 1, name: "Fashion-MNIST: NumPy ile MLP" })).toBeVisible();
  await expect(page.getByText(/temiz test doğruluğu.*%83\.56.*%87\.03/i)).toBeVisible();
  await expect(page.getByText(/tek seed ve tek train\/validation split/i)).toBeVisible();
  await expect(page.getByText(/sentetik iki piksel bozulması/i)).toBeVisible();
  await expect(page.getByText(/AI desteği/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Dondurulmuş sonuç raporunu gör" })).toHaveAttribute(
    "href",
    "https://github.com/cemyildizcy/fashion-mnist-numpy-capacity/blob/36ac847/reports/results.json",
  );
});

test("ana sayfa X-Ray, harness, simülasyon ve ajan tiyatrosu içermez", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#harness, #projects-ledger, [role=tablist], [role=tabpanel]")).toHaveCount(0);
  await expect(page.getByText(/Production X-Ray|Mavi Masa|Canlı Kesit|Ajan Filosu|Nolan|Marcus|Liam|Felix|Ethan|telemetri|testi geçti/i)).toHaveCount(0);
});

test("ana gezinme ikincil İnceleme Masası rotasını korur", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("navigation", { name: "Ana gezinme" }).getByRole("link", { name: "İnceleme Masası" });
  await expect(link).toHaveAttribute("href", "/ai-inceleme-masasi");
  await link.click();
  await expect(page.getByRole("heading", { level: 1, name: "AI İnceleme Masası" })).toBeVisible();
});

for (const slug of routes) {
  test(`${slug} Türkçe vaka sayfasını taşma olmadan gösterir`, async ({ page }) => {
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { name: "Problem" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ne yaptım?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Yapay zekânın katkısı" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ne öğrendim, sınırlar neler?" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    const touchTargets = page.locator(".case-links a, .back");
    const count = await touchTargets.count();
    for (let i = 0; i < count; i++) {
      const el = touchTargets.nth(i);
      if (await el.isVisible()) {
        const box = await el.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("404 Türkçe açıklama ve dönüş bağlantısı sunar", async ({ page }) => {
  await page.goto("/olmayan-sayfa");
  await expect(page.getByRole("heading", { name: "Bu sayfa bulunamadı." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ana sayfaya dön" })).toBeVisible();
});

test("sitemap tüm beş vaka rotasını içerir", async ({ request }) => {
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
  await expect(page.getByRole("link", { name: "GitHub", exact: true })).toHaveAttribute("href", "https://github.com/cemyildizcy");
  await expect(page.getByRole("link", { name: "LinkedIn", exact: true })).toHaveAttribute("href", "https://www.linkedin.com/in/cemyildizcy/");
  await expect(page.getByRole("link", { name: "E-posta", exact: true })).toHaveAttribute("href", "mailto:cemyildizcy@hotmail.com");
  await expect(page.getByRole("link", { name: "Tüm yazılar" })).toHaveAttribute("href", "/blog");
});

test("seçilmiş blog yazıları tam sayfalar ve sitemap girdileri sunar", async ({ page, request }) => {
  await page.goto("/blog");
  const axeResults = await new AxeBuilder({ page }).analyze();
  expect(axeResults.violations).toEqual([]);
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

test("ana sayfada erişilebilirlik ihlali veya yatay taşma yoktur", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
  { width: 320, height: 844 },
]) {
  test(`ana sayfa ${viewport.width}px genişlikte taşmaz ve gerçek görselleri yükler`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true);
    const images = page.locator("main img");
    for (let index = 0; index < await images.count(); index += 1) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      const source = await image.getAttribute("src");
      await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth), {
        message: `Image failed to load: ${source}`,
      }).toBeGreaterThan(0);
    }
  });
}

test("ana sayfadaki ziyaretçi bağlantıları en az 44x44 dokunma alanı sunar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const links = page.locator("main a");
  expect(await links.count()).toBeGreaterThan(0);
  for (let index = 0; index < await links.count(); index += 1) {
    const box = await links.nth(index).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test("ana sayfa azaltılmış hareket tercihinde animasyon ve yumuşak kaydırma kullanmaz", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  expect(await page.locator(".hero-product").evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
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
  await expect(sourceLink).toHaveAttribute("href", "https://arxiv.org/abs/1706.04599v2");
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

test("sayfa 200% yakınlaştırmada (zoom reflow) yatay taşma yapmaz", async ({ page, context }) => {
  await page.goto("/");
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  const homeMetrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(homeMetrics.scrollWidth).toBe(homeMetrics.clientWidth);

  await page.goto("/work/gundem-ai");
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  const subMetrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(subMetrics.scrollWidth).toBe(subMetrics.clientWidth);
});

test("skip link boşta gizlidir ve odaklandığında görünür", async ({ page }) => {
  await page.goto("/");
  const skip = page.locator(".skip");

  // When idle, top is negative (outside viewport)
  const idleBox = await skip.boundingBox();
  expect(idleBox ? idleBox.y + idleBox.height <= 0 : true).toBe(true);

  // Focus the skip link
  await skip.focus();
  const focusedBox = await skip.boundingBox();
  expect(focusedBox).toBeTruthy();
  if (focusedBox) {
    expect(focusedBox.y).toBeGreaterThanOrEqual(0);
  }
});

const allBlogSlugs = [
  "cross-validation-stratejisi-nasil-secilir",
  "siniflandirici-kalibrasyonu-predict-proba-guvenilirligi",
  "makine-ogrenmesinde-veri-sizintisi",
  "ml-projelerinde-metrik-secimi",
  "overfitting-nedir-nasil-onlenir",
];

for (const slug of allBlogSlugs) {
  test(`blog yazısı ${slug} Axe denetiminde scrollable-region-focusable ve diğer ihlaller olmadan geçer`, async ({ page }) => {
    await page.goto(`/blog/${slug}`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}





