"use client";

import { useState, useRef, type KeyboardEvent } from "react";

type HarnessTabId = "fleet" | "steps" | "audit" | "telemetry";

interface HarnessTab {
  id: HarnessTabId;
  label: string;
}

const TABS: readonly HarnessTab[] = [
  { id: "fleet", label: "Ajan Filosu" },
  { id: "steps", label: "Kod Öncesi 7 Adım" },
  { id: "audit", label: "Hasmane Denetim & TDD" },
  { id: "telemetry", label: "Canlı Sistem Röntgeni" },
] as const;

export function EngineeringHarness() {
  const [activeTab, setActiveTab] = useState<HarnessTabId>("fleet");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % TABS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = TABS.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      const nextTab = TABS[nextIndex];
      setActiveTab(nextTab.id);
      tabRefs.current[nextTab.id]?.focus();
    }
  }

  return (
    <section id="harness" className="harness-section" aria-labelledby="harness-title">
      <div className="section-head harness-head">
        <h2 id="harness-title">Nasıl üretiyorum?</h2>
        <p className="harness-lede">
          Vibe coding değil; 6 uzman ajan, kod öncesi 7 hazırlık adımı ve hasmane denetim kapısı.
        </p>
      </div>

      <div className="harness-terminal">
        <div className="harness-terminal-header">
          <div className="terminal-dots" aria-hidden="true">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="terminal-title">cemyildiz@harness:~/cemyildizos</div>
          <div className="terminal-status">
            <span className="status-indicator" aria-hidden="true" />
            <span className="status-text">6/6 AJAN AKTİF // SİSTEM ÇEVRİMİÇİ</span>
          </div>
        </div>

        <div
          className="harness-tablist"
          role="tablist"
          aria-label="Mühendislik üretim prensipleri"
        >
          {TABS.map((tab, index) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(element) => {
                  tabRefs.current[tab.id] = element;
                }}
                type="button"
                role="tab"
                id={`harness-tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls="harness-panel"
                tabIndex={isSelected ? 0 : -1}
                className={`harness-tab ${isSelected ? "harness-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id="harness-panel"
          role="tabpanel"
          aria-labelledby={`harness-tab-${activeTab}`}
          tabIndex={0}
          className="harness-panel"
        >
          {activeTab === "fleet" && (
            <div className="harness-panel-content harness-fleet">
              <div className="panel-intro">
                <span className="panel-kicker">ROL AYRIMI // MUTLAK SINIRLAR</span>
                <h3 className="panel-title">6 Uzman Ajan: Şartnameye Bağlı Otonomi</h3>
                <p className="panel-summary">
                  Geliştirme süreci genel amaçlı sohbet botlarıyla değil; kesin yetki sınırları, dosya matrisleri ve bağımsız denetim protokolleriyle tanımlanmış 6 uzman ajanla yürütülür.
                </p>
              </div>

              <div className="agents-grid">
                <div className="agent-card">
                  <div className="agent-card-head">
                    <span className="agent-avatar agent-avatar-nolan" aria-hidden="true">N</span>
                    <div>
                      <h4 className="agent-title">Nolan</h4>
                      <span className="agent-badge">Baş Mimar</span>
                    </div>
                  </div>
                  <p className="agent-role-desc">
                    Sistem mimarisini kurar, bileşen şartnamelerini (<code>specs/</code>) ve sözleşmeleri tanımlar.
                  </p>
                  <div className="agent-boundary">
                    <strong>Kesin Sınır:</strong> Üretim kodu yazmaz; sistem sınırlarını ve kabul kriterlerini dondurur.
                  </div>
                </div>

                <div className="agent-card">
                  <div className="agent-card-head">
                    <span className="agent-avatar agent-avatar-marcus" aria-hidden="true">M</span>
                    <div>
                      <h4 className="agent-title">Marcus</h4>
                      <span className="agent-badge">Arayüz &amp; Etkileşim</span>
                    </div>
                  </div>
                  <p className="agent-role-desc">
                    Semantik Next.js/React arayüzlerini, CSS mimarisini ve 44px erişilebilir bileşenleri üretir.
                  </p>
                  <div className="agent-boundary">
                    <strong>Kesin Sınır:</strong> Veri motoruna ve iş mantığına müdahale etmez; saf arayüz sözleşmesine bağlı kalır.
                  </div>
                </div>

                <div className="agent-card">
                  <div className="agent-card-head">
                    <span className="agent-avatar agent-avatar-liam" aria-hidden="true">L</span>
                    <div>
                      <h4 className="agent-title">Liam</h4>
                      <span className="agent-badge">Veri &amp; Çekirdek Motor</span>
                    </div>
                  </div>
                  <p className="agent-role-desc">
                    Makine öğrenmesi çıkarım hatlarını, simülasyon algoritmalarını ve veri işleme mantığını kurar.
                  </p>
                  <div className="agent-boundary">
                    <strong>Kesin Sınır:</strong> Arayüz tasarımına müdahale etmez; tip güvenli veri çıktıları üretir.
                  </div>
                </div>

                <div className="agent-card">
                  <div className="agent-card-head">
                    <span className="agent-avatar agent-avatar-felix" aria-hidden="true">F</span>
                    <div>
                      <h4 className="agent-title">Felix</h4>
                      <span className="agent-badge">TDD Mühendisi</span>
                    </div>
                  </div>
                  <p className="agent-role-desc">
                    Red-Green-Refactor döngüsünü işletir. Kod öncesi başarısız testleri yazar, ardından kodu yeşile çevirir.
                  </p>
                  <div className="agent-boundary">
                    <strong>Kesin Sınır:</strong> Testi geçirecek en yalın uygulama dışında mimariyi değiştiremez.
                  </div>
                </div>

                <div className="agent-card">
                  <div className="agent-card-head">
                    <span className="agent-avatar agent-avatar-leo" aria-hidden="true">L</span>
                    <div>
                      <h4 className="agent-title">Leo</h4>
                      <span className="agent-badge">Araştırma &amp; Değerlendirme</span>
                    </div>
                  </div>
                  <p className="agent-role-desc">
                    Akademik literatür analizi, benchmark testleri ve model doğrulama metriklerini hesaplar.
                  </p>
                  <div className="agent-boundary">
                    <strong>Kesin Sınır:</strong> Şartnamede yer almayan spekülatif hipotezleri üretim hattına alamaz.
                  </div>
                </div>

                <div className="agent-card agent-card-highlight">
                  <div className="agent-card-head">
                    <span className="agent-avatar agent-avatar-ethan" aria-hidden="true">E</span>
                    <div>
                      <h4 className="agent-title">Ethan</h4>
                      <span className="agent-badge agent-badge-audit">Hasmane Denetçi</span>
                    </div>
                  </div>
                  <p className="agent-role-desc">
                    Acımasız kod incelemesi yapar. WCAG kontrastı, ARIA ihlalleri, veri sızıntısı ve sınır sapmalarını tarar.
                  </p>
                  <div className="agent-boundary">
                    <strong>Kesin Sınır:</strong> Mutlak veto yetkisine sahiptir; onayı olmadan hiçbir PR ana dala geçemez.
                  </div>
                </div>
              </div>

              <div className="boundary-banner">
                <span className="boundary-icon" aria-hidden="true">⚠</span>
                <div>
                  <strong>Kurucu Mühendis &amp; Nihai Onay:</strong> Tüm mimari şartnamelerin, sistem kararlarının ve nihai kabulün tek yetkilisi Cem Yıldız&apos;dır. Hiçbir ajan kendi kodunu denetimsiz ana dala alamaz.
                </div>
              </div>
            </div>
          )}

          {activeTab === "steps" && (
            <div className="harness-panel-content harness-steps">
              <div className="panel-intro">
                <span className="panel-kicker">METODOLOJİ // AVENOX DİSİPLİNİ</span>
                <h3 className="panel-title">Avenox Şartname Odaklı Metodoloji vs. Vibe Coding</h3>
                <p className="panel-summary">
                  Tek satır üretim kodu yazılmadan önce 7 katı hazırlık adımı tamamlanır. Kodlama bir keşif değil; doğrulanmış bir şartnamenin mekanik icrasıdır.
                </p>
              </div>

              <div className="methodology-compare">
                <div className="compare-card compare-vibe">
                  <div className="compare-header">
                    <span className="compare-tag">VİBE CODİNG</span>
                    <h4>Doğaçlama ve Teknik Borç</h4>
                  </div>
                  <ul className="compare-list">
                    <li>Doğrudan editöre girip plansız prompt verme</li>
                    <li>Belirsiz hedefler ve sürekli kırılan kod blokları</li>
                    <li>Denetimsiz AI halüsinasyonları ve sızıntılar</li>
                    <li>Kırılgan mimari, sonradan çözülemeyen regresyonlar</li>
                  </ul>
                </div>

                <div className="compare-card compare-avenox">
                  <div className="compare-header">
                    <span className="compare-tag tag-success">AVENOX METODOLOJİSİ</span>
                    <h4>Şartname Odaklı Mühendislik</h4>
                  </div>
                  <ul className="compare-list">
                    <li>Kod öncesi dondurulan 7 hazırlık dokümanı</li>
                    <li>Rol matrisiyle ayrıştırılmış uzman ajan filosu</li>
                    <li>Hasmane denetimle korunan TDD kapıları</li>
                    <li>Ölçülebilir kabul kriterleri ve sıfır sapma</li>
                  </ul>
                </div>
              </div>

              <div className="steps-timeline">
                <div className="step-item">
                  <div className="step-num">01</div>
                  <div className="step-content">
                    <h4><code>specs/</code> — Şartname Dosyası</h4>
                    <p>Ürün hedefleri, kullanıcı senaryoları, kabul kriterleri ve negatif sınır durumları dondurulur.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-num">02</div>
                  <div className="step-content">
                    <h4><code>AGENTS.md</code> — Ajan Sözleşmesi</h4>
                    <p>Ajanların çalışma sınırları, yetki alanları, ortak hafıza kuralları ve komut dizgeleri tanımlanır.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-num">03</div>
                  <div className="step-content">
                    <h4><code>Constants.md</code> — Sistem Sabitleri</h4>
                    <p>Değişmez tasarım token&apos;ları, renk paletleri, tipografik ölçekler ve yapılandırma sabitleri kilitlenir.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-num">04</div>
                  <div className="step-content">
                    <h4><code>Roles.md</code> — Görev Matrisi</h4>
                    <p>Hangi ajanın hangi dosya ve modüllere dokunabileceği, bağımlılıklar ve onay hiyerarşisi belirlenir.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-num">05</div>
                  <div className="step-content">
                    <h4><code>Backlog.md</code> — Atomik İş Paketleri</h4>
                    <p>Gereksinimler bağımsız, test edilebilir ve tek seferde tamamlanabilir küçük iş birimlerine bölünür.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-num">06</div>
                  <div className="step-content">
                    <h4><code>Notes.md</code> — Karar Defteri</h4>
                    <p>Alınan teknik kararlar, reddedilen alternatifler, mimari ödünler ve gerekçeleri belgelenir.</p>
                  </div>
                </div>

                <div className="step-item">
                  <div className="step-num">07</div>
                  <div className="step-content">
                    <h4><code>Git Checkpoint</code> — Sıfır Noktası Kilidi</h4>
                    <p>İlk kod satırı yazılmadan önce temiz git durumu kaydedilir, geri dönüş kapısı güvene alınır.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="harness-panel-content harness-audit">
              <div className="panel-intro">
                <span className="panel-kicker">GÜVENCE KAPISI // ADVERSARIAL AUDIT</span>
                <h3 className="panel-title">Hasmane Denetim ve Katı TDD Döngüsü</h3>
                <p className="panel-summary">
                  Kodlama bir red-green döngüsüdür; ancak yeşile dönmek yetmez. Hasmane denetçi Ethan, kodu kırmak için bilerek sınır durumları, kontrast eksikliklerini ve erişilebilirlik açıklarını arar.
                </p>
              </div>

              <div className="audit-flow">
                <div className="flow-card flow-card-red">
                  <div className="flow-phase-tag tag-red">ADIM 1 // RED TEST</div>
                  <h4>Felix Başarısız Testi Yazar</h4>
                  <p>Sıfır uygulama koduyla başlanır. Beklenen davranışı ve sınır durumlarını doğrulayan birim veya e2e test yazılır; testin başarısız olduğu kanıtlanır.</p>
                  <div className="flow-code-snippet">
                    <code>$ vitest run src/feature.test.ts // FAIL (Expected)</code>
                  </div>
                </div>

                <div className="flow-card flow-card-green">
                  <div className="flow-phase-tag tag-green">ADIM 2 // GREEN KOD</div>
                  <h4>Marcus / Liam Testi Geçirir</h4>
                  <p>Yalnızca testi geçirmek için gereken en yalın, şartnameye tam uygun üretim kodu yazılır. Fazla soyutlama ve spekülatif kod eklenmez.</p>
                  <div className="flow-code-snippet">
                    <code>$ vitest run src/feature.test.ts // PASS (100%)</code>
                  </div>
                </div>

                <div className="flow-card flow-card-reject">
                  <div className="flow-phase-tag tag-reject">ADIM 3 // HASMANE VETO</div>
                  <h4>Ethan REJECT [contrast / a11y]</h4>
                  <p>Ethan hasmane denetim başlatır. Yetersiz WCAG kontrastı (&lt;4.5:1), eksik ARIA rolleri, 44px altı dokunma hedefleri veya veri sızıntısı tespit edip akışı VETO eder.</p>
                  <div className="flow-code-snippet">
                    <code>[ETHAN REJECT] Contrast ratio 3.8:1 &lt; 4.5:1 AA gate. Vetoed!</code>
                  </div>
                </div>

                <div className="flow-card flow-card-fix">
                  <div className="flow-phase-tag tag-fix">ADIM 4 // ONARIM</div>
                  <h4>Kusursuzlaştırma &amp; Yeniden Test</h4>
                  <p>Geliştirici ajan tespit edilen kusurları kök nedenden çözer. Kontrast oranları &gt;7:1&apos;e yükseltilir, ARIA ilişkileri onarılır ve tüm testler yeniden koşturulur.</p>
                  <div className="flow-code-snippet">
                    <code>$ npx tsc &amp;&amp; npm run lint &amp;&amp; npm test // 0 Errors</code>
                  </div>
                </div>

                <div className="flow-card flow-card-approved">
                  <div className="flow-phase-tag tag-approved">ADIM 5 // KABUL KAPISI</div>
                  <h4>Ethan APPROVED &amp; Cem Kabulü</h4>
                  <p>Axe-core 0 ihlal, Vitest %100 geçiş, sıfır yatay taşma ve şartnameye tam uyum kanıtlanır. Ethan onay verir, Cem Yıldız ana dala birleştirir.</p>
                  <div className="flow-code-snippet">
                    <code>[ETHAN APPROVED] 0 violations. Gate passed. Ready for merge.</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "telemetry" && (
            <div className="harness-panel-content harness-telemetry">
              <div className="panel-intro">
                <span className="panel-kicker">CANLI ÖLÇÜM // SİSTEM TELEMETRİSİ</span>
                <h3 className="panel-title">cemyildiz.net Canlı Telemetri ve Kalite Kanıtı</h3>
                <p className="panel-summary">
                  İddia değil, ölçülebilir mühendislik kanıtı. Canlı portföyün test kapsamı, erişilebilirlik güvencesi ve mimari sağlık karnesi.
                </p>
              </div>

              <div className="telemetry-stats">
                <div className="stat-card">
                  <span className="stat-num">185</span>
                  <span className="stat-label">Vitest Testi</span>
                  <p className="stat-detail">%100 Başarı (Birim, Veri Sözleşmesi, State)</p>
                </div>

                <div className="stat-card">
                  <span className="stat-num">80</span>
                  <span className="stat-label">Playwright &amp; Axe</span>
                  <p className="stat-detail">0 İhlal (Erişilebilirlik, Klavye, Taşma Yok)</p>
                </div>

                <div className="stat-card">
                  <span className="stat-num">17</span>
                  <span className="stat-label">Statik Sayfa</span>
                  <p className="stat-detail">Server-rendered, tam sitemap kayıtlı rotalar</p>
                </div>

                <div className="stat-card">
                  <span className="stat-num">Next 16</span>
                  <span className="stat-label">React 19 Mimarisi</span>
                  <p className="stat-detail">Strict Mode, App Router, Sıfır Runtime Fazlalığı</p>
                </div>
              </div>

              <div className="telemetry-terminal-box">
                <div className="box-header">
                  <span>TELEMETRY VERIFICATION LOG // LIVE SESSION</span>
                  <span className="badge-live">VERIFIED</span>
                </div>
                <div className="box-content">
                  <pre className="telemetry-log">
<code>{`$ telemetry --project cemyildiz.net --verify-all
[TEST_SUITE] Vitest 3.2.7: 13 test files, 185 tests passed (100% green)
[E2E_AUDIT] Playwright E2E: 80 assertions passed across Desktop & Mobile
[A11Y_GATE] Axe-core: 0 violations (AAA contrast >7:1, roving-tabindex, 44px touch)
[RESPONSIVE] Viewports 1440px, 390px, 320px: 0 horizontal overflow
[BUILD] Next.js 16.1.6 App Router, React 19, TypeScript Strict Mode
[STATUS] Sistem bütünlüğü ve şartname uyumu: %100 ONAYLANDI`}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
