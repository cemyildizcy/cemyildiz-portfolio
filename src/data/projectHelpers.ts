import { portfolioData, type Project } from './portfolio';

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

export const projectCaseStudies = portfolioData.projects.map((project) => ({
  ...project,
  slug: project.id === 7 ? 'wc2026-ai-simulator' : slugifyProject(project.title),
  category: inferCategory(project),
  result: project.highlights[0] ?? 'Uçtan uca proje çıktısı',
  timeline: project.id === 7 ? 'Hafta 6' : `Proje ${project.id}`,
  problem: buildProblem(project),
  approach: buildApproach(project),
  outputs: buildOutputs(project),
  learnings: buildLearnings(project),
  nextSteps: buildNextSteps(project),
  visual: project.id === 7 ? '/images/projects/wc2026/champion-probabilities.png' : undefined,
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
};

export function getProjectBySlug(slug: string) {
  return projectCaseStudies.find((project) => project.slug === slug);
}

function inferCategory(project: Project) {
  const text = `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase();
  if (text.includes('simülatör') || text.includes('monte carlo')) return 'Sports Analytics / Simulation';
  if (text.includes('deprem')) return 'Risk Analytics';
  if (text.includes('uyku') || text.includes('sleep')) return 'Health AI';
  if (text.includes('churn')) return 'Business Analytics';
  if (text.includes('asteroid')) return 'API Data Product';
  if (text.includes('oyun')) return 'Web Product';
  return 'Machine Learning';
}

function buildProblem(project: Project) {
  if (project.id === 7) return '2026 Dünya Kupası yeni 48 takımlı formatıyla klasik turnuva tahminlerinden daha karmaşık. Tek maç sonucu yerine grup aşaması, eleme ağacı, takım gücü ve skor dağılımını aynı sistemde modellemek gerekiyordu.';
  if (project.id === 6) return 'Öğrenci başarısı sadece çalışma saatiyle açıklanmıyor. Uyku, ekran süresi, derse katılım ve alışkanlıkların akademik başarıyla ilişkisini ölçülebilir hale getirmek gerekiyordu.';
  if (project.id === 5) return 'Türkiye deprem verisi ham haliyle teknik ve dağınık. Bölgesel risk paternlerini, sismik kümeleri ve risk seviyelerini okunabilir bir analiz akışına çevirmek gerekiyordu.';
  if (project.title.includes('Sleep')) return 'Uyku kalitesini etkileyen faktörler kişiden kişiye değişiyor. Kullanıcıya sadece skor değil, anlaşılır tahmin ve aksiyona dönük öneri sunan bir yapı kurmak gerekiyordu.';
  if (project.title.includes('Asteroid')) return 'NASA NeoWs verisi güçlü ama ham API çıktısı son kullanıcı için anlamlı değil. Asteroitleri risk skoru, filtreleme ve görselleştirmeyle okunabilir hale getirmek gerekiyordu.';
  if (project.title.includes('Churn')) return 'E-ticarette müşteri kaybı tek bir metrikle açıklanamıyor. Kullanıcı davranışlarından churn oranı ve risk segmentleri çıkarıp iş kararı üretecek analiz kurmak gerekiyordu.';
  if (project.title.includes('Çizgi')) return 'Oyun fikrini sadece statik bir web sayfası olarak değil, oynanabilir ve paylaşılabilir bir ürün deneyimi olarak tasarlamak gerekiyordu.';
  return 'Ham veriyi veya ürün fikrini anlaşılır, ölçülebilir ve paylaşılabilir bir çıktıya dönüştürmek hedeflendi.';
}

function buildApproach(project: Project) {
  if (project.id === 7) return 'EA FC 25 oyuncu verileri, StatsBomb maç verisi ve güncel ELO sinyalleri takım feature setinde birleştirildi. Poisson tabanlı xG modeliyle maç skor dağılımları üretildi, ardından 10.000 Monte Carlo koşusuyla şampiyonluk, final ve tur olasılıkları hesaplandı. Streamlit dashboard ile sonuçlar canlı okunabilir hale getirildi.';
  if (project.id === 6) return 'Veri temizliği sonrası alışkanlık değişkenleri ölçeklendi, öğrenci profilleri K-Means ile kümelendi ve DBSCAN ile uç davranışlar incelendi. SVM ve Random Forest modelleriyle başarı tahmini yapıldı; feature importance çıktısı ile hangi alışkanlıkların daha belirleyici olduğu yorumlandı.';
  if (project.id === 5) return 'USGS deprem kayıtları konum, büyüklük, derinlik ve zaman boyutunda işlendi. K-Means ile sismik bölgeler çıkarıldı; Random Forest, SVM ve lojistik regresyon ile risk seviyesi tahmini karşılaştırıldı. Sonuçlar harita, grafik ve model metrikleriyle raporlandı.';
  if (project.title.includes('Sleep')) return 'Uyku verisi önce modellemeye uygun hale getirildi, ardından XGBoost, Random Forest ve Gradient Boosting modelleri karşılaştırıldı. Tahmin katmanı FastAPI ile servis edildi, React arayüz ve Gemini destekli koçluk akışıyla kullanıcıya öneri üreten full-stack ürün haline getirildi.';
  if (project.title.includes('Asteroid')) return 'NASA NeoWs API’den çekilen yakın geçiş verileri OOP mimarisiyle işlendi. Çap, hız, yaklaşma mesafesi ve tehlike bayrağı üzerinden özel risk skoru tasarlandı. Pandas analizi ve Matplotlib/Seaborn görselleriyle riskli nesneler anlaşılır hale getirildi.';
  if (project.title.includes('Churn')) return 'Müşteri davranış metrikleri Pandas ile temizlenip segmentlere ayrıldı. Churn oranı, risk grupları ve kullanıcı davranış farkları hesaplandı. Çıktı, e-ticaret ekibinin aksiyon alabileceği basit risk analizi formatına dönüştürüldü.';
  if (project.title.includes('Çizgi')) return 'Oyun akışı önce temel mekanikler üzerinden kurgulandı, ardından web arayüzü ve oynanabilir etkileşimler geliştirildi. Amaç hızlı açılan, anlaşılır ve linkle paylaşılabilir bir mini ürün deneyimi oluşturmaktı.';
  return 'Projede veri yapısı incelendi, temizleme ve feature engineering adımları kuruldu. Sonuçlar model, görselleştirme, README ve mümkünse canlı demo ile sunulabilir hale getirildi.';
}

function buildOutputs(project: Project) {
  const base = ['GitHub deposu / teknik dokümantasyon', 'README ve proje anlatımı', 'LinkedIn proje paylaşımı'];
  if (project.id === 7) return ['Türkçe Streamlit dashboard', 'Şampiyonluk ve tur olasılıkları CSV çıktıları', 'Most-likely bracket ve skor dağılımı görselleri', ...base];
  if (project.liveUrl) return ['Canlı demo / ürün linki', 'Model veya analiz çıktısı', ...base];
  return ['Model metrikleri ve analiz çıktıları', 'Görselleştirme / rapor akışı', ...base];
}

function buildLearnings(project: Project) {
  if (project.id === 7) return ['Turnuva simülasyonunda tek skor değil dağılım göstermek daha doğru.', 'ELO gibi güncel güç sinyalleri model güvenini artırıyor.', 'Dashboard cache yönetimi canlı veri projelerinde kritik.'];
  if (project.id === 6) return ['Davranış değişkenleri başarı tahmininde tek başına nottan daha açıklayıcı olabilir.', 'Kümeleme, sınıflandırmadan önce veri hikayesini anlamayı kolaylaştırıyor.', 'Feature importance sonuçları proje anlatımını güçlendiriyor.'];
  if (project.id === 5) return ['Coğrafi veride görselleştirme, model metriği kadar önemli.', 'K-Means risk bölgelerini anlatmak için iyi bir başlangıç sağlıyor.', 'Sismik veride zaman ve derinlik özellikleri sonucu ciddi etkiliyor.'];
  if (project.title.includes('Sleep')) return ['ML çıktısı kullanıcıya öneri olarak dönünce ürün değeri artıyor.', 'Backend, frontend ve model katmanını birlikte düşünmek gerekiyor.', 'AI koçluk katmanı model sonucunu daha anlaşılır hale getiriyor.'];
  if (project.title.includes('Asteroid')) return ['API verisini ürüne çevirmek için iyi bir risk skoru şart.', 'OOP yapı veri çekme ve analiz akışını temiz tutuyor.', 'Görseller teknik veriyi hızlı anlaşılır hale getiriyor.'];
  if (project.title.includes('Churn')) return ['İş problemi tarafında sade segmentler karmaşık modelden daha değerli olabilir.', 'Churn oranı tek başına değil, risk gruplarıyla birlikte okunmalı.', 'Pandas ile hızlı analiz doğru sorularla güçlü içgörü üretebilir.'];
  return ['Küçük ürünlerde net kullanıcı akışı teknik karmaşıklıktan daha önemli.', 'Paylaşılabilir demo, proje etkisini artırıyor.', 'Basit fikir iyi sunulursa portfolio değeri kazanıyor.'];
}

function buildNextSteps(project: Project) {
  if (project.id === 7) return ['Skor gösterimini top-scoreline dağılımıyla zenginleştirmek', 'Kadro sakatlık/form verisi eklemek', 'Dashboard içine senaryo karşılaştırması koymak'];
  if (project.id === 6) return ['Daha büyük öğrenci veri setiyle tekrar denemek', 'Model açıklanabilirliği için SHAP eklemek', 'Mini dashboard ile sonuçları interaktif yapmak'];
  if (project.id === 5) return ['Harita katmanını daha interaktif yapmak', 'Güncel USGS verisini otomatik çekmek', 'Bölgesel karşılaştırma paneli eklemek'];
  if (project.title.includes('Sleep')) return ['Kullanıcı geri bildirimiyle önerileri kişiselleştirmek', 'Model drift takibi eklemek', 'Uyku trend grafikleri geliştirmek'];
  if (project.title.includes('Asteroid')) return ['API güncellemesini zamanlayıcıya bağlamak', 'Risk alarm eşiği eklemek', 'Dashboard filtrelerini genişletmek'];
  if (project.title.includes('Churn')) return ['Kampanya önerisi simülasyonu eklemek', 'Daha fazla davranış metriğiyle modeli genişletmek', 'Dashboard ile segmentleri izlenebilir yapmak'];
  return ['Mobil deneyimi geliştirmek', 'Kullanıcı geri bildirimi toplamak', 'Yeni özellikleri küçük iterasyonlarla eklemek'];
}
