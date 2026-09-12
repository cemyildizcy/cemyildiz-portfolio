export const layerOrder = ["output", "decision", "ai", "limits"] as const;

export type LayerKey = (typeof layerOrder)[number];

export type ProjectLayer = {
  label: string;
  title: string;
  body: string;
  facts: string[];
  note: string;
};

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
  fileLabel: string;
  layers: Record<LayerKey, ProjectLayer>;
  image?: { src: string; alt: string };
};

export const projects: Project[] = [
  {
    slug: "gundem-ai",
    title: "GündemAI",
    short: "Yoğun bilgi akışını daha kolay takip edip okumaya yardımcı olmayı amaçlayan güncel projem.",
    status: "Geliştiriliyor",
    premise:
      "Farklı kaynaklardan gelen yoğun bilgi, yapay zekâ desteğiyle daha anlaşılır ve takip edilebilir hâle getirilebilir mi?",
    evidence: [
      "Bilgi yoğunluğunu azaltan, kaynakları takip etmeyi kolaylaştıran bir okuma ürünü geliştiriyorum.",
      "Proje henüz geliştirme aşamasında; herkese açık depo veya demo hazır olduğunda buraya eklenecek.",
    ],
    contribution: [
      "Ürün problemini belirledim ve kullanıcıya sunulacak deneyimi şekillendiriyorum.",
      "Yapay zekâ desteğiyle araştırma, tasarım ve geliştirme adımlarını tekrar tekrar iyileştiriyorum.",
    ],
    aiRole:
      "Yapay zekâyı araştırma, seçenek üretme, uygulama ve eleştiri aşamalarında üretim ortağı olarak kullanıyorum. Ürün kararları ve son kontroller bana ait.",
    limits:
      "Proje geliştirme aşamasında. Bu nedenle henüz teknik performans veya kullanım sonucu iddiasında bulunmuyorum.",
    links: [],
    note: "Geliştikçe öğrendiklerimi de güncelliyorum.",
    caseHref: "/work/gundem-ai",
    fileLabel: "GA–01",
    layers: {
      output: {
        label: "MEVCUT ÇIKTI",
        title: "Yoğun akış için daha sakin bir okuma deneyimi.",
        body: "Farklı kaynaklardan gelen yoğun bilgiyi daha anlaşılır ve takip edilebilir hâle getiren bir ürün geliştiriyorum.",
        facts: ["Ürün henüz geliştirme aşamasında.", "Herkese açık depo veya demo hazır olduğunda eklenecek."],
        note: "Geliştikçe öğrendiklerimi de güncelliyorum.",
      },
      decision: {
        label: "ÜRÜN KARARI",
        title: "Önce bilgi yoğunluğu problemi.",
        body: "Çözümü teknoloji gösterisine değil, kaynakları takip etmeyi kolaylaştıran okuma deneyimine bağlıyorum.",
        facts: ["Ürün problemini tanımladım.", "Kullanıcıya sunulacak deneyimi şekillendiriyorum."],
        note: "Henüz doğrulanmamış özellikleri vaat etmiyorum.",
      },
      ai: {
        label: "ÜRETİM ORTAĞI",
        title: "Döngüsel araştırma, tasarım ve eleştiri.",
        body: "Yapay zekâyı araştırma, seçenek üretme, uygulama ve eleştiri aşamalarında kullanıyorum.",
        facts: ["Ürün kararları bana ait.", "Son kontroller bana ait."],
        note: "AI rolü süreçte açık, ürün iddiasından ayrı.",
      },
      limits: {
        label: "SINIR NOTU",
        title: "Erken aşama, erken iddia.",
        body: "Proje geliştirme aşamasında olduğu için teknik performans veya kullanım sonucu iddiasında bulunmuyorum.",
        facts: ["Kamuya açık demo henüz yok.", "Kullanıcı sonucu verisi henüz yok."],
        note: "Eksik kanıt saklanmıyor; dosyada yerini koruyor.",
      },
    },
  },
  {
    slug: "wc2026-ai-simulator",
    title: "WC2026 AI Simulator",
    short: "48 takımlı 2026 Dünya Kupası için farklı sonuç olasılıklarını hesaplayan turnuva simülasyonu.",
    status: "Depo ve demo yayında",
    premise:
      "2026 Dünya Kupası'nın genişletilmiş formatında tek bir sonuç tahmini yerine farklı senaryoların olasılığı nasıl gösterilebilir?",
    evidence: [
      "Takımların şampiyonluk olasılıklarını ve turnuva senaryolarını gösteren çalışan bir simülasyon hazırladım.",
      "GitHub deposu ve Streamlit demosu herkese açık.",
      "Projede şampiyonluk olasılıklarını gösteren görsel çıktı bulunuyor.",
    ],
    contribution: [
      "Futbol verilerini bir turnuva simülasyonunda bir araya getirdim.",
      "Simülasyon akışını ve Türkçe sonuç arayüzünü oluşturdum.",
      "Varsayımları ve sonuçların nasıl okunması gerektiğini belgeledim.",
    ],
    aiRole:
      "Yapay zekâdan araştırma, üretim ve iyileştirme süreçlerinde destek aldım. Modelleme tercihleri, proje kapsamı ve yayımlanan sonuçların son kontrolü bana ait.",
    limits:
      "Sonuçlar olasılık tahminidir; maç sonucu garantisi değildir. Veri kalitesi ve model varsayımları tahminleri sınırlar.",
    links: [
      { label: "GitHub deposunu aç", href: "https://github.com/cemyildizcy/wc2026-ai-simulator" },
      { label: "Canlı demoyu aç", href: "https://wc2026-ai-simulator.streamlit.app" },
    ],
    note: "Amaç geleceği bilmek değil, belirsizliği okunabilir kılmak.",
    caseHref: "/work/wc2026-ai-simulator",
    fileLabel: "WC–26",
    layers: {
      output: {
        label: "ÇALIŞAN ÇIKTI",
        title: "Tek tahmin değil, olasılık dağılımı.",
        body: "48 takımlı 2026 Dünya Kupası için takımların şampiyonluk olasılıklarını ve farklı turnuva senaryolarını gösteren çalışan bir simülasyon hazırladım.",
        facts: [
          "GitHub deposu ve Streamlit demosu herkese açık.",
          "Türkçe sonuç arayüzü olasılıkları karşılaştırmalı gösteriyor.",
        ],
        note: "Amaç geleceği bilmek değil, belirsizliği okunabilir kılmak.",
      },
      decision: {
        label: "TASARIM KARARI",
        title: "Tek kazanan yerine olasılık dağılımı.",
        body: "Genişletilmiş turnuva formatında kesin sonuç iddiası yerine farklı senaryoları görünür kılmayı seçtim.",
        facts: [
          "Futbol verilerini turnuva simülasyonunda bir araya getirdim.",
          "Varsayımların ve sonuçların nasıl okunacağını belgeledim.",
        ],
        note: "Modelleme tercihi, son kullanıcıya güven değil bağlam vermeli.",
      },
      ai: {
        label: "ÜRETİM ORTAĞI",
        title: "Araştırma ve iyileştirmede destek.",
        body: "Yapay zekâdan araştırma, üretim ve iyileştirme süreçlerinde destek aldım.",
        facts: [
          "Modelleme tercihleri bana ait.",
          "Proje kapsamı ve yayımlanan sonuçların son kontrolü bana ait.",
        ],
        note: "Destek görünür; sorumluluk devredilmiş değil.",
      },
      limits: {
        label: "SINIR NOTU",
        title: "Tahmin, maç sonucu garantisi değildir.",
        body: "Veri kalitesi ve model varsayımları tahminleri sınırlar. Sonuçlar olasılık tahminidir.",
        facts: [
          "Gelecek sonuçlar doğrulanmış bilgi olarak sunulmuyor.",
          "Grafikler yalnız modelin ürettiği senaryoları özetliyor.",
        ],
        note: "İddia sınırı, çıktının parçasıdır.",
      },
    },
    image: {
      src: "/images/projects/wc2026/champion-probabilities.png",
      alt: "WC2026 simülasyonu şampiyonluk olasılıkları grafiği",
    },
  },
  {
    slug: "sleepinfo",
    title: "SleepInfo",
    short: "Uyku kalitesi ve sağlık riski tahminlerini kullanıcıya dönük bir üründe birleştiren eğitim projesi.",
    status: "Depo ve ürün yayında",
    premise:
      "Uyku verilerinden tahmin üreten bir makine öğrenmesi çalışması, yanıta doğrudan işaret eden değişkenler çıkarıldığında da yararlı kalabilir mi?",
    evidence: [
      "Uyku bilgilerini değerlendirip tahmin sonucunu kullanıcıya sunan bir ürün geliştirdim.",
      "GitHub deposu ve sleepinfo.com.tr adresindeki ürün herkese açık.",
      "Proje dokümanı veri sızıntısını önleme yaklaşımını ve model karşılaştırmasını açıklıyor.",
    ],
    contribution: [
      "Makine öğrenmesi problemini tanımlama, modeli ürüne dönüştürme ve parçaları birleştirme süreçlerinde çalıştım.",
      "Farklı modelleri karşılaştırdım ve sonucu kullanıcıların anlayabileceği bir deneyime dönüştürdüm.",
    ],
    aiRole:
      "Yapay zekâyı uygulama, hata ayıklama ve ürün iyileştirmede kullandım. Bu destek, kullandığım araç ve çerçevelerde ileri düzey uzmanlık iddiası anlamına gelmiyor.",
    limits:
      "Bu bir eğitim projesidir ve tıbbi tavsiye vermez. Model sonucu klinik değerlendirme yerine kullanılamaz.",
    links: [
      { label: "GitHub deposunu aç", href: "https://github.com/cemyildizcy/uyku-sagligi-tahmincisi" },
      { label: "Ürünü aç", href: "https://sleepinfo.com.tr" },
    ],
    note: "En önemli öğrenme: kolay görünen veri kestirmeleri sonucu yanıltabilir.",
    caseHref: "/work/sleepinfo",
    fileLabel: "SI–03",
    layers: {
      output: {
        label: "ÇALIŞAN ÇIKTI",
        title: "Tahmini kullanıcıya dönük ürüne taşıdım.",
        body: "Uyku bilgilerini değerlendirip tahmin sonucunu kullanıcıya sunan bir ürün geliştirdim.",
        facts: [
          "GitHub deposu ve sleepinfo.com.tr ürünü herkese açık.",
          "Model karşılaştırması proje dokümanında açıklanıyor.",
        ],
        note: "En önemli öğrenme: kolay görünen veri kestirmeleri sonucu yanıltabilir.",
      },
      decision: {
        label: "MODEL KARARI",
        title: "Yanıta işaret eden değişkenleri çıkardım.",
        body: "Veri sızıntısını önlemek için hedefi doğrudan ele veren değişkenler olmadan modelin yararlı kalıp kalmadığını sınadım.",
        facts: ["Farklı modelleri karşılaştırdım.", "Sonucu anlaşılır bir ürün deneyimine dönüştürdüm."],
        note: "Yüksek skor kadar skorun nasıl oluştuğu da önemli.",
      },
      ai: {
        label: "ÜRETİM ORTAĞI",
        title: "Uygulama, hata ayıklama, iyileştirme.",
        body: "Yapay zekâyı uygulama, hata ayıklama ve ürün iyileştirmede kullandım.",
        facts: [
          "Problem tanımı ve parçaları birleştirme sürecinde çalıştım.",
          "AI desteği ileri düzey araç uzmanlığı iddiası değildir.",
        ],
        note: "Yardımın kapsamını da yetkinliğin sınırını da yazıyorum.",
      },
      limits: {
        label: "SINIR NOTU",
        title: "Tıbbi tavsiye değildir.",
        body: "Bu bir eğitim projesidir. Model sonucu klinik değerlendirme yerine kullanılamaz.",
        facts: ["Sağlık kararı için kullanılmamalı.", "Tahmin, tanı anlamına gelmiyor."],
        note: "Ürün sınırı kullanıcı görmeden önce söylenir.",
      },
    },
  },
];

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
