// Portfolio data for Cem Yıldız
// Updated with UX design spec copy and editorial tone.
// Brand-strategist copy will be integrated when available (t_f6ccf64e).

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
  image?: string;
  /** Whether this project is prominently featured */
  featured: boolean;
  /** Display order — lower number = shown first */
  order: number;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
  graduationYear: number;
  description?: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface PortfolioData {
  hero: {
    name: string;
    title: string;
    subtitle: string;
    description: string;
    cta: string;
    /** Eyebrow line above hero title */
    eyebrow: string;
  };
  about: {
    title: string;
    description: string;
    location: string;
    email: string;
    /** Current focus areas shown as tags/chips */
    currentFocus: string[];
  };
  projects: Project[];
  skills: Skill[];
  education: Education[];
  contact: {
    title: string;
    description: string;
    email: string;
  };
  navigation: NavItem[];
  socialLinks: SocialLink[];
  /** Workflow steps for hero visual card */
  workflow: { step: number; label: string; detail: string }[];
  /** Section heading copy */
  sectionCopy: {
    projects: { title: string; subtitle: string };
    blog: { title: string; subtitle: string };
    contact: { title: string; description: string };
  };
}

export const portfolioData: PortfolioData = {
  hero: {
    name: "Cem Yıldız",
    eyebrow: "ESOGÜ Mat-Bil · 3. sınıf · Veri Bilimi",
    title: "Veriyi projeye, projeyi anlatılabilir ürüne çeviriyorum.",
    subtitle: "Veri Bilimi / ML",
    description:
      "ESOGÜ Matematik & Bilgisayar Bilimleri 3. sınıf öğrencisiyim. Python, makine öğrenimi ve web tabanlı ürünler geliştiriyorum.",
    cta: "Projeleri gör",
  },

  about: {
    title: "Hakkımda",
    description:
      "Eskişehir Osmangazi Üniversitesi Matematik ve Bilgisayar Bilimleri bölümünde 3. sınıf öğrencisiyim. Veri bilimi ve makine öğrenimini sadece notebook içinde bırakmadan, çalışan dashboard'lara, API'lere ve okunabilir case study'lere dönüştürmeye odaklanıyorum. Son projelerimde Dünya Kupası turnuva simülasyonu, uyku kalitesi tahmini, müşteri churn analizi, deprem risk modelleme ve öğrenci başarı tahmini gibi farklı veri problemleri üzerinde çalıştım. Ortak hedefim aynı: ham veriyi temizlemek, anlamlı özellikler üretmek, modeli doğru metriklerle değerlendirmek ve sonucu teknik olmayan kişilerin de anlayabileceği bir ürüne çevirmek.",
    location: "Odunpazarı, Eskişehir, Turkey",
    email: "cemyildizcy@hotmail.com",
    currentFocus: [
      "Model evaluation",
      "Dashboard design",
      "Case-study writing",
      "ML projects",
    ],
  },

  projects: [
    {
      id: 7,
      title: "2026 Dünya Kupası AI Simülatörü",
      description:
        "48 takımlı 2026 Dünya Kupası formatını Poisson modeli ve 10.000 Monte Carlo simülasyonu ile modelleyen proje. Takım gücü sinyallerini birleştirerek şampiyonluk, tur geçme ve skor dağılımı olasılıklarını Streamlit dashboard'da sunar.",
      technologies: [
        "Python",
        "Pandas",
        "NumPy",
        "Poisson Model",
        "Monte Carlo Simulation",
        "StatsBomb",
        "Plotly",
        "Streamlit",
        "Feature Engineering",
      ],
      liveUrl: "https://wc2026-ai-simulator.streamlit.app",
      githubUrl: "https://github.com/cemyildizcy/wc2026-ai-simulator",
      highlights: [
        "48 takımlı 2026 formatı ve 104 maçlık turnuva akışı",
        "10.000 Monte Carlo simülasyonu ile şampiyonluk olasılıkları",
        "EA FC 25 + StatsBomb + FIFA/ELO feature birleşimi",
        "Türkçe Streamlit dashboard ve skor dağılımı analizi",
      ],
      image: "/images/projects/wc2026/champion-probabilities.png",
      featured: true,
      order: 1,
    },
    {
      id: 1,
      title: "SleepInfo",
      description:
        "Uyku kalitesini tahmin eden full-stack ML platformu. XGBoost, Random Forest ve Gradient Boosting modellerini karşılaştırır; FastAPI backend, React/Vite frontend ve Supabase entegrasyonu ile kullanıcıya tahmin + AI uyku koçluğu sunar.",
      technologies: [
        "XGBoost",
        "Random Forest",
        "Gradient Boosting",
        "FastAPI",
        "React",
        "Vite",
        "Supabase",
        "Vercel",
        "Render",
        "Google Gemini 2.5 Flash API",
      ],
      liveUrl: "https://sleepinfo.com.tr",
      highlights: [
        "%95.3 doğruluk oranı",
        "AI Uyku Koçluğu",
        "FastAPI + React/Vite full-stack",
        "Supabase veritabanı entegrasyonu",
        "Vercel + Render deployment",
      ],
      featured: true,
      order: 2,
    },
    {
      id: 3,
      title: "E-Ticaret Churn Analizi",
      description:
        "E-ticaret müşterilerinde churn riskini analiz eden iş odaklı ML projesi. RFM feature engineering, segmentasyon ve sınıflandırma modelleriyle müşterilerin ayrılma olasılığını yorumlanabilir metriklerle açıklar.",
      technologies: [
        "Python",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "Feature Engineering",
      ],
      githubUrl: "https://github.com/cemyildizcy/ecommerce-churn-analysis",
      highlights: [
        "%50.85 churn oranı tespiti",
        "RFM feature engineering",
        "Risk Segmentasyonu",
        "Kapsamlı veri analizi",
      ],
      featured: false,
      order: 3,
    },
    {
      id: 5,
      title: "Türkiye Deprem Risk Analizi",
      description:
        "USGS veritabanından çekilen 30 yıllık Türkiye deprem verileri (9.300+ kayıt) kullanılarak geliştirilmiş uçtan uca Makine Öğrenmesi pipeline'ı. Gözetimsiz (K-Means) ve Gözetimli (Random Forest, SVM, LR) modeller ile sismik bölge kümeleme ve deprem risk seviyesi tahminleme.",
      technologies: [
        "Python",
        "Pandas",
        "Scikit-learn",
        "K-Means Clustering",
        "Random Forest",
        "Feature Engineering",
        "Matplotlib/Seaborn",
      ],
      githubUrl:
        "https://github.com/cemyildizcy/turkey-earthquake-risk-analysis",
      highlights: [
        "30 yıllık (1994-2025) gerçek veri analizi",
        "K-Means ile 4 sismik bölge tespiti",
        "Random Forest ile %84.7 doğruluk oranlı risk tahmini",
        "Feature Importance analizi ile sismik belirleyicilerin tespiti",
      ],
      featured: false,
      order: 4,
    },
    {
      id: 6,
      title: "Öğrenci Alışkanlıkları ve Akademik Başarı Analizi",
      description:
        "1.000 öğrencinin günlük alışkanlıklarını (çalışma, uyku, sosyal medya, Netflix) analiz ederek akademik başarıyı tahminleyen uçtan uca ML pipeline'ı. Feature Engineering, K-Means kümeleme, DBSCAN anomali tespiti ve SVM/Random Forest sınıflandırma.",
      technologies: [
        "Python",
        "Pandas",
        "Scikit-learn",
        "SVM",
        "Random Forest",
        "K-Means",
        "DBSCAN",
        "Feature Engineering",
        "Matplotlib/Seaborn",
      ],
      githubUrl: "https://github.com/cemyildizcy/ogrenci-performans",
      highlights: [
        "SVM ile %81 doğruluk oranı",
        "K-Means ile 4 öğrenci profili tespiti",
        "DBSCAN ile aykırı öğrenci anomali tespiti",
        "Feature Importance: Derse katılım > Çalışma saati",
      ],
      featured: false,
      order: 5,
    },
    {
      id: 2,
      title: "Asteroid Risk Analysis",
      description:
        "NASA NeoWs API verilerini kullanarak asteroit risk analizi yapan platform. Özel risk skoru algoritması, OOP mimarisi ve kapsamlı veri görselleştirme.",
      technologies: [
        "Python",
        "Pandas",
        "NumPy",
        "Seaborn",
        "Matplotlib",
        "NASA NeoWs API",
        "OOP",
      ],
      githubUrl: "https://github.com/cemyildizcy/asteroid-risk-platform",
      highlights: [
        "NASA NeoWs API entegrasyonu",
        "Risk Skoru Algoritması",
        "OOP mimari tasarım",
        "Seaborn/Matplotlib görselleştirme",
      ],
      featured: false,
      order: 6,
    },
    {
      id: 4,
      title: "ÇizgiSavaşları.com",
      description:
        "Vibe Coding yaklaşımıyla geliştirilen interaktif oyun platformu. Oyun modülleri, leaderboard sistemi ve REST API altyapısı.",
      technologies: ["Vibe Coding", "REST API", "Leaderboard"],
      liveUrl: "https://cizgisavaslari.com",
      highlights: [
        "İnteraktif oyun modülleri",
        "Leaderboard sistemi",
        "REST API altyapısı",
        "Vibe Coding yaklaşımı",
      ],
      featured: false,
      order: 7,
    },
  ],

  skills: [
    {
      category: "Programlama",
      items: ["Python", "SQL", "C#", "Matlab"],
    },
    {
      category: "Veri Bilimi & ML",
      items: [
        "Scikit-learn",
        "XGBoost",
        "Pandas",
        "NumPy",
        "Feature Engineering",
        "Veri Ön İşleme",
      ],
    },
    {
      category: "Web & Araçlar",
      items: [
        "FastAPI",
        "React",
        "Vite",
        "Git",
        "GitHub",
        "Supabase",
        "REST API",
        "Matplotlib",
        "Seaborn",
      ],
    },
  ],

  education: [
    {
      institution: "Eskişehir Osmangazi Üniversitesi",
      degree: "Lisans",
      field: "Matematik ve Bilgisayar Bilimleri",
      year: "3. sınıf",
      graduationYear: 2028,
      description:
        "Veri bilimi, makine öğrenimi ve Python tabanlı veri analizi projeleri üzerine yoğunlaşıyor.",
    },
  ],

  contact: {
    title: "İletişim",
    description: "Bir proje, staj veya fikir konuşalım.",
    email: "cemyildizcy@hotmail.com",
  },

  navigation: [
    { label: "Projeler", href: "#projects" },
    { label: "Blog", href: "/blog" },
    { label: "Hakkımda", href: "/about" },
    { label: "İletişim", href: "#contact" },
  ],

  socialLinks: [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/cemyildizcy/",
      icon: "linkedin",
    },
    {
      name: "GitHub",
      url: "https://github.com/cemyildizcy",
      icon: "github",
    },
    {
      name: "Email",
      url: "mailto:cemyildizcy@hotmail.com",
      icon: "mail",
    },
  ],

  workflow: [
    {
      step: 1,
      label: "Veriyi oku",
      detail: "ham veri → temiz tablo",
    },
    {
      step: 2,
      label: "Modeli kur",
      detail: "feature → deney → metrik",
    },
    {
      step: 3,
      label: "Ürüne taşı",
      detail: "dashboard → case study → paylaşım",
    },
  ],

  sectionCopy: {
    projects: {
      title: "Seçili projeler",
      subtitle:
        "Notebook değil; problem, veri, model ve çıktısıyla anlatılan işler.",
    },
    blog: {
      title: "Notlar / Yazılar",
      subtitle:
        "Projelerde öğrendiklerimi, veri temizleme notlarını ve makine öğrenimi denemelerini burada topluyorum.",
    },
    contact: {
      title: "Bir proje, staj veya fikir konuşalım.",
      description:
        "Yeni projeler, staj fırsatları veya veri bilimi hakkında konuşmak isterseniz yazın.",
    },
  },
};
