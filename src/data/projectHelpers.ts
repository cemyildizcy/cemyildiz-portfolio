import { portfolioData, type Project } from './portfolio';

/**
 * Turkish-safe slug generation.
 * Maps Turkish characters to ASCII equivalents and strips non-alphanumeric.
 */
export function slugifyProject(title: string) {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Category inference from project content.
 * Uses title, description and tech stack keywords.
 */
function inferCategory(project: Project): string {
  const text =
    `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase();

  if (text.includes('simülatör') || text.includes('monte carlo') || text.includes('sports'))
    return 'Sports Analytics / Simulation';
  if (text.includes('deprem') || text.includes('earthquake'))
    return 'Risk Analytics';
  if (text.includes('uyku') || text.includes('sleep'))
    return 'Health AI';
  if (text.includes('öğrenci') || text.includes('habits') || text.includes('akademik'))
    return 'Education Analytics / ML';
  if (text.includes('churn'))
    return 'Business Analytics';
  if (text.includes('asteroid') || text.includes('api'))
    return 'API Data Product';
  if (text.includes('oyun') || text.includes('çizgi'))
    return 'Web Product';
  return 'Machine Learning';
}

// ─── Case study content builders ────────────────────────────

function buildProblem(project: Project): string {
  const problems: Record<number, string> = {
    7: '2026 Dünya Kupası yeni 48 takımlı formatıyla klasik turnuva tahminlerinden daha karmaşık. Tek maç sonucu yerine grup aşaması, eleme ağacı, takım gücü ve skor dağılımını aynı sistemde modellemek gerekiyordu.',
    6: 'Öğrenci başarısı sadece çalışma saatiyle açıklanmıyor. Uyku, ekran süresi, derse katılım ve alışkanlıkların akademik başarıyla ilişkisini ölçülebilir hale getirmek gerekiyordu.',
    5: 'Türkiye deprem verisi ham haliyle teknik ve dağınık. Bölgesel risk paternlerini, sismik kümeleri ve risk seviyelerini okunabilir bir analiz akışına çevirmek gerekiyordu.',
    1: 'Uyku kalitesini etkileyen faktörler kişiden kişiye değişiyor. Kullanıcıya sadece skor değil, anlaşılır tahmin ve aksiyona dönük öneri sunan bir yapı kurmak gerekiyordu.',
    2: 'NASA NeoWs verisi güçlü ama ham API çıktısı son kullanıcı için anlamlı değil. Asteroitleri risk skoru, filtreleme ve görselleştirmeyle okunabilir hale getirmek gerekiyordu.',
    3: 'E-ticarette müşteri kaybı tek bir metrikle açıklanamıyor. Kullanıcı davranışlarından churn oranı ve risk segmentleri çıkarıp iş kararı üretecek analiz kurmak gerekiyordu.',
    4: 'Oyun fikrini sadece statik bir web sayfası olarak değil, oynanabilir ve paylaşılabilir bir ürün deneyimi olarak tasarlamak gerekiyordu.',
  };
  return problems[project.id] ?? 'Ham veriyi veya ürün fikrini anlaşılır, ölçülebilir ve paylaşılabilir bir çıktıya dönüştürmek hedeflendi.';
}

function buildApproach(project: Project): string {
  const approaches: Record<number, string> = {
    7: 'EA FC 25 oyuncu verileri, StatsBomb maç verisi ve güncel ELO sinyalleri takım feature setinde birleştirildi. Poisson tabanlı xG modeliyle maç skor dağılımları üretildi, ardından 10.000 Monte Carlo koşusuyla şampiyonluk, final ve tur olasılıkları hesaplandı. Streamlit dashboard ile sonuçlar canlı okunabilir hale getirildi.',
    6: 'Veri temizliği sonrası alışkanlık değişkenleri ölçeklendi, öğrenci profilleri K-Means ile kümelendi ve DBSCAN ile uç davranışlar incelendi. SVM ve Random Forest modelleriyle başarı tahmini yapıldı; feature importance çıktısı ile hangi alışkanlıkların daha belirleyici olduğu yorumlandı.',
    5: 'USGS deprem kayıtları konum, büyüklük, derinlik ve zaman boyutunda işlendi. K-Means ile sismik bölgeler çıkarıldı; Random Forest, SVM ve lojistik regresyon ile risk seviyesi tahmini karşılaştırıldı. Sonuçlar harita, grafik ve model metrikleriyle raporlandı.',
    1: 'Uyku verisi önce modellemeye uygun hale getirildi, ardından XGBoost, Random Forest ve Gradient Boosting modelleri karşılaştırıldı. Tahmin katmanı FastAPI ile servis edildi, React arayüz ve Gemini destekli koçluk akışıyla kullanıcıya öneri üreten full-stack ürün haline getirildi.',
    2: 'NASA NeoWs API\'den çekilen yakın geçiş verileri OOP mimarisiyle işlendi. Çap, hız, yaklaşma mesafesi ve tehlike bayrağı üzerinden özel risk skoru tasarlandı. Pandas analizi ve Matplotlib/Seaborn görselleriyle riskli nesneler anlaşılır hale getirildi.',
    3: 'Müşteri davranış metrikleri Pandas ile temizlenip segmentlere ayrıldı. Churn oranı, risk grupları ve kullanıcı davranış farkları hesaplandı. Çıktı, e-ticaret ekibinin aksiyon alabileceği basit risk analizi formatına dönüştürüldü.',
    4: 'Oyun akışı önce temel mekanikler üzerinden kurgulandı, ardından web arayüzü ve oynanabilir etkileşimler geliştirildi. Amaç hızlı açılan, anlaşılır ve linkle paylaşılabilir bir mini ürün deneyimi oluşturmaktı.',
  };
  return approaches[project.id] ?? 'Projede veri yapısı incelendi, temizleme ve feature engineering adımları kuruldu. Sonuçlar model, görselleştirme, README ve mümkünse canlı demo ile sunulabilir hale getirildi.';
}

function buildOutputs(project: Project): string[] {
  const base = [
    'GitHub deposu / teknik dokümantasyon',
    'README ve proje anlatımı',
    'LinkedIn proje paylaşımı',
  ];
  if (project.id === 7)
    return [
      'Türkçe Streamlit dashboard',
      'Şampiyonluk ve tur olasılıkları CSV çıktıları',
      'Most-likely bracket ve skor dağılımı görselleri',
      ...base,
    ];
  if (project.liveUrl)
    return ['Canlı demo / ürün linki', 'Model veya analiz çıktısı', ...base];
  return ['Model metrikleri ve analiz çıktıları', 'Görselleştirme / rapor akışı', ...base];
}

function buildLearnings(project: Project): string[] {
  const learnings: Record<number, string[]> = {
    7: [
      'Turnuva simülasyonunda tek skor değil dağılım göstermek daha doğru.',
      'ELO gibi güncel güç sinyalleri model güvenini artırıyor.',
      'Dashboard cache yönetimi canlı veri projelerinde kritik.',
    ],
    6: [
      'Davranış değişkenleri başarı tahmininde tek başına nottan daha açıklayıcı olabilir.',
      'Kümeleme, sınıflandırmadan önce veri hikayesini anlamayı kolaylaştırıyor.',
      'Feature importance sonuçları proje anlatımını güçlendiriyor.',
    ],
    5: [
      'Coğrafi veride görselleştirme, model metriği kadar önemli.',
      'K-Means risk bölgelerini anlatmak için iyi bir başlangıç sağlıyor.',
      'Sismik veride zaman ve derinlik özellikleri sonucu ciddi etkiliyor.',
    ],
    1: [
      'ML çıktısı kullanıcıya öneri olarak dönünce ürün değeri artıyor.',
      'Backend, frontend ve model katmanını birlikte düşünmek gerekiyor.',
      'AI koçluk katmanı model sonucunu daha anlaşılır hale getiriyor.',
    ],
    2: [
      'API verisini ürüne çevirmek için iyi bir risk skoru şart.',
      'OOP yapı veri çekme ve analiz akışını temiz tutuyor.',
      'Görseller teknik veriyi hızlı anlaşılır hale getiriyor.',
    ],
    3: [
      'İş problemi tarafında sade segmentler karmaşık modelden daha değerli olabilir.',
      'Churn oranı tek başına değil, risk gruplarıyla birlikte okunmalı.',
      'Pandas ile hızlı analiz doğru sorularla güçlü içgörü üretebilir.',
    ],
  };
  return learnings[project.id] ?? [
    'Küçük ürünlerde net kullanıcı akışı teknik karmaşıklıktan daha önemli.',
    'Paylaşılabilir demo, proje etkisini artırıyor.',
    'Basit fikir iyi sunulursa portfolio değeri kazanıyor.',
  ];
}

function buildNextSteps(project: Project): string[] {
  const steps: Record<number, string[]> = {
    7: [
      'Skor gösterimini top-scoreline dağılımıyla zenginleştirmek',
      'Kadro sakatlık/form verisi eklemek',
      'Dashboard içine senaryo karşılaştırması koymak',
    ],
    6: [
      'Daha büyük öğrenci veri setiyle tekrar denemek',
      'Model açıklanabilirliği için SHAP eklemek',
      'Mini dashboard ile sonuçları interaktif yapmak',
    ],
    5: [
      'Harita katmanını daha interaktif yapmak',
      'Güncel USGS verisini otomatik çekmek',
      'Bölgesel karşılaştırma paneli eklemek',
    ],
    1: [
      'Kullanıcı geri bildirimiyle önerileri kişiselleştirmek',
      'Model drift takibi eklemek',
      'Uyku trend grafikleri geliştirmek',
    ],
    2: [
      'API güncellemesini zamanlayıcıya bağlamak',
      'Risk alarm eşiği eklemek',
      'Dashboard filtrelerini genişletmek',
    ],
    3: [
      'Kampanya önerisi simülasyonu eklemek',
      'Daha fazla davranış metriğiyle modeli genişletmek',
      'Dashboard ile segmentleri izlenebilir yapmak',
    ],
  };
  return steps[project.id] ?? [
    'Mobil deneyimi geliştirmek',
    'Kullanıcı geri bildirimi toplamak',
    'Yeni özellikleri küçük iterasyonlarla eklemek',
  ];
}

function getLinkedinPostId(id: number): string | undefined {
  const posts: Record<number, string> = {
    7: 'ugcPost:7470769047601664000',
    6: 'activity:7467981878382465024',
    5: 'activity:7465489993902411776',
    3: 'ugcPost:7463283781307863041',
    1: 'ugcPost:7459681620892192768',
    2: 'activity:7457482069338669056',
  };
  return posts[id];
}

// ─── Derived case study data ────────────────────────────────

/**
 * Projects sorted by `order` field, enriched with case-study content.
 * WC2026 gets a hardcoded slug for URL stability.
 */
export const projectCaseStudies = [...portfolioData.projects]
  .sort((a, b) => a.order - b.order)
  .map((project) => ({
    ...project,
    slug:
      project.id === 7
        ? 'wc2026-ai-simulator'
        : slugifyProject(project.title),
    category: inferCategory(project),
    result: project.highlights[0] ?? 'Uçtan uca proje çıktısı',
    timeline: project.id === 7 ? 'Hafta 6' : `Proje ${project.id}`,
    problem: buildProblem(project),
    approach: buildApproach(project),
    outputs: buildOutputs(project),
    learnings: buildLearnings(project),
    nextSteps: buildNextSteps(project),
    visual:
      project.image ??
      (project.id === 7
        ? '/images/projects/wc2026/champion-probabilities.png'
        : undefined),
    linkedinPostId: getLinkedinPostId(project.id),
  }));

export type ProjectCaseStudy = Project & {
  slug: string;
  category: string;
  result: string;
  timeline: string;
  problem: string;
  approach: string;
  outputs: string[];
  learnings: string[];
  nextSteps: string[];
  visual?: string;
  linkedinPostId?: string;
};

/**
 * Look up a project case study by its URL slug.
 */
export function getProjectBySlug(
  slug: string,
): (typeof projectCaseStudies)[number] | undefined {
  return projectCaseStudies.find((project) => project.slug === slug);
}

/**
 * Get all unique project categories for filtering UI.
 */
export function getProjectCategories(): string[] {
  return Array.from(new Set(projectCaseStudies.map((p) => p.category)));
}

/**
 * Get featured projects only.
 */
export function getFeaturedProjects() {
  return projectCaseStudies.filter((p) => p.featured);
}
