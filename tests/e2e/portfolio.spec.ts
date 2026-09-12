import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["gundem-ai", "wc2026-ai-simulator", "sleepinfo"];

test("ana sayfa Cem'i ve çalışma yönünü açık Türkçeyle tanıtır", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.getByRole("heading", { name: "Matematikten yapay zekâ ürünlerine." })).toBeVisible();
  await expect(page.getByText("ESOGÜ Matematik ve Bilgisayar Bilimleri öğrencisiyim.")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Ana gezinme" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Ana gezinme" }).getByRole("link", { name: "İnceleme Masası" })).toBeVisible();
  await expect(page).toHaveTitle(/Cem Yıldız \| Yapay zekâ projeleri/);
  await expect(page.getByText(/kanıt defteri|iddia/i)).toHaveCount(0);
});

test("ana gezinme çubuğu İnceleme Masası bağlantısını sunar ve tıklandığında sayfaya gider", async ({ page }) => {
  await page.goto("/");
  const reviewDeskLink = page.getByRole("navigation", { name: "Ana gezinme" }).getByRole("link", { name: "İnceleme Masası" });
  await expect(reviewDeskLink).toBeVisible();
  await expect(reviewDeskLink).toHaveAttribute("href", "/ai-inceleme-masasi");
  await reviewDeskLink.click();
  await expect(page).toHaveURL(/\/ai-inceleme-masasi/);
  await expect(page.getByRole("heading", { level: 1, name: "AI İnceleme Masası" })).toBeVisible();
});

test("canlı kesit bağımsız proje ve dosya katmanları sekmelerini yönetir", async ({ page }) => {
  await page.goto("/");

  const projectTabs = page.getByRole("tablist", { name: "Proje dosyaları" });
  const layerTabs = page.getByRole("tablist", { name: "Dosya katmanları" });
  await expect(projectTabs).toBeVisible();
  await expect(layerTabs).toBeVisible();
  await expect(projectTabs.getByRole("tab").filter({ hasText: "WC2026" })).toHaveAttribute("aria-selected", "true");
  await expect(layerTabs.getByRole("tab", { name: "Çıktı", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(projectTabs.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
  await expect(layerTabs.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);

  const projectPanel = page.getByRole("tabpanel", { name: /WC2026 AI Simulator/ });
  const layerPanel = page.getByRole("tabpanel", { name: "Çıktı" });
  await expect(projectPanel).toContainText("WC2026 AI Simulator");
  await expect(layerPanel).toContainText("Tek tahmin değil, olasılık dağılımı.");

  await layerTabs.getByRole("tab", { name: "AI desteği", exact: true }).click();
  await expect(page.getByRole("tabpanel", { name: "AI desteği" })).toContainText("Araştırma ve iyileştirmede destek.");
  await expect(projectPanel).toContainText("WC2026 AI Simulator");

  await projectTabs.getByRole("tab").filter({ hasText: "SleepInfo" }).click();
  await expect(projectTabs.getByRole("tab").filter({ hasText: "SleepInfo" })).toHaveAttribute("aria-selected", "true");
  await expect(layerTabs.getByRole("tab", { name: "Çıktı", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Çıktı" })).toContainText("Tahmini kullanıcıya dönük ürüne taşıdım.");
});

test("dosya katmanları ve proje sekmeleri tüm yön tuşlarıyla otomatik etkinleşir", async ({ page }) => {
  await page.goto("/");

  const projectTablist = page.getByRole("tablist", { name: "Proje dosyaları" });
  const layerTablist = page.getByRole("tablist", { name: "Dosya katmanları" });
  const projectTabs = projectTablist.getByRole("tab");
  const layerTabs = layerTablist.getByRole("tab");

  // Initial active tabs: WC2026 (index 1) for projects, Çıktı (index 0) for layers
  const initialActiveProject = projectTablist.locator('[role="tab"][tabindex="0"]');
  const initialActiveLayer = layerTablist.locator('[role="tab"][tabindex="0"]');
  await expect(initialActiveProject).toHaveAttribute("aria-selected", "true");
  await expect(initialActiveProject).toContainText("WC2026");
  await expect(initialActiveLayer).toHaveAttribute("aria-selected", "true");
  await expect(initialActiveLayer).toHaveText("Çıktı");

  // 1. Proje dosyaları: start keyboard navigation from the active tab (tabIndex="0")
  await initialActiveProject.focus();
  await expect(initialActiveProject).toBeFocused();

  // Forward sequential navigation with ArrowRight (moves to next index: SleepInfo)
  await page.keyboard.press("ArrowRight");
  await expect(projectTabs.nth(2)).toBeFocused();
  await expect(projectTabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(projectTabs.nth(2)).toHaveAttribute("tabindex", "0");

  // Forward step with ArrowDown (wraps to next index: GündemAI)
  await page.keyboard.press("ArrowDown");
  await expect(projectTabs.nth(0)).toBeFocused();
  await expect(projectTabs.nth(0)).toHaveAttribute("aria-selected", "true");
  await expect(projectTabs.nth(0)).toHaveAttribute("tabindex", "0");

  // Backward navigation with ArrowLeft (wraps to End)
  await page.keyboard.press("ArrowLeft");
  await expect(projectTabs.nth(2)).toBeFocused();
  await expect(projectTabs.nth(2)).toHaveAttribute("aria-selected", "true");

  // Backward step with ArrowUp
  await page.keyboard.press("ArrowUp");
  await expect(projectTabs.nth(1)).toBeFocused();
  await expect(projectTabs.nth(1)).toHaveAttribute("aria-selected", "true");

  // Boundary navigation: Home and End
  await page.keyboard.press("Home");
  await expect(projectTabs.nth(0)).toBeFocused();
  await expect(projectTabs.nth(0)).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("End");
  await expect(projectTabs.nth(2)).toBeFocused();
  await expect(projectTabs.nth(2)).toHaveAttribute("aria-selected", "true");

  // Group independence: moving through Proje dosyaları does not change the active Dosya katmanları tab
  await expect(layerTablist.locator('[role="tab"][tabindex="0"]')).toHaveText("Çıktı");
  await expect(layerTabs.nth(0)).toHaveAttribute("aria-selected", "true");

  // 2. Dosya katmanları: start keyboard navigation from the active tab (tabIndex="0")
  const activeLayerTab = layerTablist.locator('[role="tab"][tabindex="0"]');
  await activeLayerTab.focus();
  await expect(activeLayerTab).toBeFocused();
  await expect(activeLayerTab).toHaveAttribute("aria-selected", "true");

  // Forward sequential navigation with ArrowRight (moves to next index: Karar)
  await page.keyboard.press("ArrowRight");
  await expect(layerTabs.nth(1)).toBeFocused();
  await expect(layerTabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(layerTabs.nth(1)).toHaveAttribute("tabindex", "0");

  // Forward step with ArrowDown (moves to next index: AI desteği)
  await page.keyboard.press("ArrowDown");
  await expect(layerTabs.nth(2)).toBeFocused();
  await expect(layerTabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(layerTabs.nth(2)).toHaveAttribute("tabindex", "0");

  // Backward navigation with ArrowLeft
  await page.keyboard.press("ArrowLeft");
  await expect(layerTabs.nth(1)).toBeFocused();
  await expect(layerTabs.nth(1)).toHaveAttribute("aria-selected", "true");

  // Backward step with ArrowUp
  await page.keyboard.press("ArrowUp");
  await expect(layerTabs.nth(0)).toBeFocused();
  await expect(layerTabs.nth(0)).toHaveAttribute("aria-selected", "true");

  // Boundary navigation: End and Home
  await page.keyboard.press("End");
  await expect(layerTabs.nth(3)).toBeFocused();
  await expect(layerTabs.nth(3)).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("Home");
  await expect(layerTabs.nth(0)).toBeFocused();
  await expect(layerTabs.nth(0)).toHaveAttribute("aria-selected", "true");

  // Move to a different layer tab to verify independence when layer != 0
  await page.keyboard.press("ArrowRight");
  await expect(layerTabs.nth(1)).toBeFocused();
  await expect(layerTabs.nth(1)).toHaveAttribute("aria-selected", "true");

  // Group independence: moving through Dosya katmanları leaves the active Proje dosyaları tab unchanged
  await expect(projectTablist.locator('[role="tab"][tabindex="0"]')).toHaveAttribute("aria-selected", "true");
  await expect(projectTabs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(projectTabs.nth(2)).toContainText("SleepInfo");
});

test("canlı kesit sekmelerinin aria-controls ve aria-labelledby ilişkileri geçerlidir", async ({ page }) => {
  await page.goto("/");
  for (const tab of await page.getByRole("tab").all()) {
    const panelId = await tab.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    await expect(page.locator(`#${panelId}`)).toHaveCount(1);
  }

  for (const panel of await page.getByRole("tabpanel").all()) {
    const tabId = await panel.getAttribute("aria-labelledby");
    expect(tabId).toBeTruthy();
    await expect(page.locator(`#${tabId}`)).toHaveAttribute("aria-selected", "true");
  }
});

for (const slug of routes) {
  test(`${slug} Türkçe vaka sayfasını taşma olmadan gösterir`, async ({ page }) => {
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { name: "Problem" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ne yaptım?" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Yapay zekânın katkısı" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ne öğrendim, sınırlar neler?" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
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

const homeViewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 844 },
];

for (const vp of homeViewports) {
  test(`canlı kesit görsel sistemi ve sayfa düzeni ${vp.name} (${vp.width}px) genişlikte yatay taşma yapmaz`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true);

    const projectTabs = page.getByRole("tablist", { name: "Proje dosyaları" });
    const layerTabs = page.getByRole("tablist", { name: "Dosya katmanları" });
    await expect(projectTabs).toBeVisible();
    await expect(layerTabs).toBeVisible();
    await expect(page.locator(".file, .proof-sheet")).toBeVisible();
  });
}

test("canlı kesit ve ana sayfa etkileşimli kontrol öğeleri en az 44x44 dokunma hedefine sahiptir", async ({ page }) => {
  await page.goto("/");
  const controls = page.locator(".project-tab, .layer-tab, .file-links a, .case-link-wrap a, .hero-actions a, .site-header nav a, .contact-links a");
  const count = await controls.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const el = controls.nth(i);
    if (await el.isVisible()) {
      const box = await el.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
});

for (const mobileWidth of [390, 320]) {
  test(`mobil ${mobileWidth}px genişlikte WC2026 kanıt grafiği sınırlandırılmış kaydırma bölgesinde yatay incelenebilir`, async ({ page }) => {
    await page.setViewportSize({ width: mobileWidth, height: 844 });
    await page.goto("/");

    // Default is WC2026 / Çıktı
    const graphRegion = page.getByRole("region", { name: /WC2026.*şampiyonluk olasılıkları grafiği/i });
    await expect(graphRegion).toBeVisible();
    await expect(graphRegion).toHaveAttribute("tabindex", "0");

    // Check bounded height (~270px)
    const box = await graphRegion.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(250);
      expect(box.height).toBeLessThanOrEqual(300);
      expect(box.width).toBeLessThanOrEqual(mobileWidth);
    }

    // Check visible hint
    await expect(page.getByText("Yana kaydırarak incele")).toBeVisible();

    // Check scrollable behavior
    const scrollInfo = await graphRegion.evaluate((el) => {
      const startLeft = el.scrollLeft;
      el.scrollLeft = 120;
      return {
        startLeft,
        newLeft: el.scrollLeft,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
      };
    });
    expect(scrollInfo.scrollWidth).toBeGreaterThan(scrollInfo.clientWidth);
    expect(scrollInfo.newLeft).toBeGreaterThan(0);

    // No document level overflow
    expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true);

    // Absent for GündemAI and SleepInfo
    const projectTabs = page.getByRole("tablist", { name: "Proje dosyaları" });
    await projectTabs.getByRole("tab").filter({ hasText: "GündemAI" }).click();
    await expect(page.getByRole("region", { name: /şampiyonluk olasılıkları grafiği/i })).toHaveCount(0);

    await projectTabs.getByRole("tab").filter({ hasText: "SleepInfo" }).click();
    await expect(page.getByRole("region", { name: /şampiyonluk olasılıkları grafiği/i })).toHaveCount(0);
  });
}

test("ana sayfa ve canlı kesit azaltılmış hareket (prefers-reduced-motion) desteği sunar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const fileAnim = await page.locator(".file, .proof-sheet").first().evaluate((el) => {
    return window.getComputedStyle(el).animationName;
  });
  expect(["none", ""].includes(fileAnim)).toBe(true);
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

