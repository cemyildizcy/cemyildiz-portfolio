export type Project = {
  slug: string;
  title: string;
  short: string;
  status: string;
  premise: string;
  evidence: string[];
  contribution: string[];
  aiRole: string;
  limits: string;
  links: { label: string; href: string }[];
  note: string;
  caseHref: string;
  image: { src: string; alt: string; width: number; height: number };
};

export const projects: Project[] = [
  {
    slug: "gundem-ai",
    title: "GündemAI",
    short: "Günün öne çıkan haberlerini daha sakin ve takip edilebilir bir mobil deneyimde sunan Android uygulaması.",
    status: "Google Play'de yayında",
    premise: "Yoğun gündem akışı, kaynakları kaybetmeden daha kısa ve okunabilir bir mobil ürüne nasıl dönüşür?",
    evidence: [
      "Android uygulaması Google Play'in production kanalında yayımlandı.",
      "Ürün, gündemi konu başlıkları ve kaynak bağlantılarıyla okunabilir bir akışta sunuyor.",
    ],
    contribution: [
      "Ürün problemini, bilgi mimarisini ve mobil deneyimi şekillendirdim.",
      "Araştırma, üretim ve eleştiri döngülerini yönetip yayımlama kararlarını verdim.",
    ],
    aiRole: "Yapay zekâyı araştırma, seçenek üretme, uygulama ve eleştiri için yoğun biçimde kullandım. Ürün kararları ve son kontrol bana ait.",
    limits: "Google Play erişimi ülke ve cihaz uygunluğuna göre değişebilir. Haber özetleri bağlam kaybedebilir; kullanıcılar özgün kaynağı açabilir.",
    links: [
      {
        label: "Google Play'de görüntüle",
        href: "https://play.google.com/store/apps/details?id=com.gundemai.app",
      },
    ],
    note: "Yayımlanmış Android ürünü.",
    caseHref: "/work/gundem-ai",
    image: {
      src: "/images/projects/gundemai/bugunun-gundemi.png",
      alt: "GündemAI'nin bugünün gündemi akışını gösteren gerçek Google Play ekran görüntüsü",
      width: 1080,
      height: 1920,
    },
  },
  {
    slug: "sleepinfo",
    title: "SleepInfo",
    short: "Uyku verilerinden tahmin üreten modeli anlaşılır bir web deneyimine taşıyan eğitim projesi.",
    status: "Ürün ve kaynak kodu yayında",
    premise: "Yanıtı doğrudan ele veren değişkenler çıkarıldığında uyku verilerinden yararlı bir tahmin üretilebilir mi?",
    evidence: [
      "Çalışan ürün sleepinfo.com.tr adresinde, kaynak kodu GitHub'da yayımlanıyor.",
      "Kaynak deposunda veri hazırlama ve model değerlendirme süreci belgeleniyor.",
    ],
    contribution: [
      "Problemi tanımladım, modelleri karşılaştırdım ve tahmini web ürününe dönüştürdüm.",
      "Sonucu kullanıcıların anlayabileceği bir deneyimde birleştirdim.",
    ],
    aiRole: "Yapay zekâyı uygulama, hata ayıklama ve ürün iyileştirmede kullandım; bu destek çerçeve uzmanlığı iddiası değildir.",
    limits: "Bu bir eğitim projesidir. Yayımlanmış model metriklerini bağımsız doğrulamadım; sonuçlar tıbbi tavsiye veya klinik değerlendirme değildir.",
    links: [
      { label: "Ürünü aç", href: "https://sleepinfo.com.tr" },
      { label: "GitHub deposunu aç", href: "https://github.com/cemyildizcy/uyku-sagligi-tahmincisi" },
    ],
    note: "Gerçek ürün deposundan alınan illüstrasyon.",
    caseHref: "/work/sleepinfo",
    image: {
      src: "/images/projects/sleepinfo/hero.png",
      alt: "SleepInfo ürün deposundaki özgün hero illüstrasyonu: uyuyan kişi ve gece manzarası",
      width: 343,
      height: 361,
    },
  },
  {
    slug: "bike-demand-temporal-ml",
    title: "Bike Demand: Temporal ML",
    short: "Saatlik bisiklet kiralamalarında mevsimsel taban çizgisini takvim ve gözlenen hava durumu Ridge modelleriyle kronolojik olarak karşılaştıran çalışma.",
    status: "Kronolojik test raporlandı",
    premise: "Takvim ve gözlenen hava durumu, sonraki dönem tahminlerini mevsimsel bir taban çizgisinden daha iyi hâle getiriyor mu?",
    evidence: [
      "UCI Bike Sharing veri setindeki Washington, DC'den 2011–2012 yıllarına ait 17.379 saatlik kayıt kullanılıyor; veri CC BY 4.0 lisanslı.",
      "Veri, eğitim/doğrulama/test bölümlerine zaman sırasını koruyan %70/%15/%15 oranıyla ayrılıyor; ön işleme yalnızca eğitim verisine uyduruluyor.",
      "2.607 satırlık final test bölümünde, doğrulamada seçilen takvim+gözlenen hava durumu Ridge modeli MAE 77.79 bisiklet/saat bildirdi; mevsimsel taban çizgisi 103.54 oldu.",
    ],
    contribution: [
      "Takvim ve hava durumu özellikli Ridge modellerini haftanın günü/saatine dayalı mevsimsel taban çizgisiyle karşılaştırdım.",
      "Zaman sırasını koruyan ayrım kullandım ve ön işlemeyi yalnızca eğitim verisine uydurdum.",
    ],
    aiRole: "Depo, kod ve değerlendirme iskeletinin AI yardımıyla geliştirildiğini belirtiyor; yöntem ve ölçümler sürüm kontrolündeki raporda yer alıyor.",
    limits: "Bu çalışma tek bir şehrin iki yıllık verisinden ayrılan kronolojik bir testtir; başka şehirler veya dönemler için dış doğrulama değildir. Hava durumu girdileri geçmiş gözlemlerdir; geleceğe dönük tahmin becerisini kanıtlamaz.",
    links: [
      { label: "GitHub deposunu aç", href: "https://github.com/cemyildizcy/bike-demand-temporal-ml" },
      { label: "Test sonuçlarını gör", href: "https://github.com/cemyildizcy/bike-demand-temporal-ml/blob/main/reports/2026-09-22-bike-demand-results.md" },
      { label: "UCI veri kaynağını gör", href: "https://doi.org/10.24432/C5W894" },
    ],
    note: "Ölçümler repodaki kronolojik test raporundan alınmıştır; dış doğrulama iddiası yoktur.",
    caseHref: "/work/bike-demand-temporal-ml",
    image: {
      src: "/images/projects/bike-demand/temporal-test-mae.svg",
      alt: "Kronolojik test MAE karşılaştırması: mevsimsel taban çizgisi 103.54, takvim ve gözlenen hava durumu Ridge modeli 77.79; düşük değer daha iyi.",
      width: 860,
      height: 480,
    },
  },
  {
    slug: "wc2026-ai-simulator",
    title: "WC2026 AI Simulator",
    short: "Özellik ağırlıkları, Poisson ve Monte Carlo yöntemleriyle çalışan eğitim amaçlı istatistiksel turnuva tahmin motoru.",
    status: "Kaynak kodu yayında",
    premise: "Eğitim amaçlı bir istatistiksel model, özellik ağırlıkları, Poisson ve Monte Carlo ile 48 takımlı turnuva belirsizliğini nasıl görünür kılar?",
    evidence: [
      "Simülasyon şampiyonluk olasılıklarını ve turnuva senaryolarını karşılaştırmalı üretiyor.",
      "Kaynak kodu ve örnek çıktı grafiği herkese açık.",
    ],
    contribution: [
      "Futbol verilerini istatistiksel turnuva akışında bir araya getirdim.",
      "Varsayımları, sonuç arayüzünü ve çıktıların nasıl okunacağını belgeledim.",
    ],
    aiRole: "Yapay zekâdan araştırma, üretim ve iyileştirmede destek aldım. Modelleme tercihleri ve yayımlanan sonuçların son kontrolü bana ait.",
    limits: "Bu eğitilmiş bir makine öğrenmesi modeli değildir; sonuçlar varsayımlara bağlı olasılık tahminleridir.",
    links: [
      { label: "GitHub deposunu aç", href: "https://github.com/cemyildizcy/wc2026-ai-simulator" },
    ],
    note: "Canlı demo bağlantısı, kimlik doğrulamaya yönlendirdiği için ana sayfada sunulmuyor.",
    caseHref: "/work/wc2026-ai-simulator",
    image: {
      src: "/images/projects/wc2026/champion-probabilities.png",
      alt: "WC2026 istatistiksel simülasyonunun şampiyonluk olasılıkları çıktı grafiği",
      width: 1971,
      height: 1382,
    },
  },
];

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
