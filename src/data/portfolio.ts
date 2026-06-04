// Portfolio data for Cem Yıldız

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
  image?: string;
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
  };
  about: {
    title: string;
    description: string;
    location: string;
    email: string;
    phone: string;
  };
  projects: Project[];
  skills: Skill[];
  education: Education[];
  contact: {
    title: string;
    description: string;
    email: string;
    phone: string;
    location: string;
  };
  navigation: NavItem[];
  socialLinks: SocialLink[];
}

export const portfolioData: PortfolioData = {
  hero: {
    name: "Cem Yıldız",
    title: "Veri Bilimi & Makine Öğrenimi",
    subtitle: "Matematik ve Bilgisayar Bilimleri Öğrencisi",
    description:
      "Veri bilimi, makine öğrenimi ve Python tabanlı veri analizi projeleri üzerine yoğunlaşıyor.",
    cta: "Projelerimi Gör",
  },

  about: {
    title: "Hakkımda",
    description:
      "Eskişehir Osmangazi Üniversitesi Matematik ve Bilgisayar Bilimleri bölümü 2. sınıf öğrencisiyim. Veri bilimi, makine öğrenimi ve Python tabanlı veri analizi projeleri üzerine yoğunlaşıyorum. Gerçek dünya problemlerine veri odaklı çözümler üretmeye tutkuyla bağlıyım.",
    location: "Odunpazarı, Eskişehir, Turkey",
    email: "cemyildizcy@hotmail.com",
    phone: "5344630465",
  },

  projects: [
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
        "Matplotlib/Seaborn"
      ],
      githubUrl: "https://github.com/cemyildizcy/turkey-earthquake-risk-analysis",
      highlights: [
        "30 yıllık (1994-2025) gerçek veri analizi",
        "K-Means ile 4 sismik bölge tespiti",
        "Random Forest ile %84.7 doğruluk oranlı risk tahmini",
        "Feature Importance analizi ile sismik belirleyicilerin tespiti"
      ],
    },
    {
      id: 1,
      title: "SleepInfo",
      description:
        "AI destekli uyku analiz platformu. XGBoost, Random Forest ve Gradient Boosting modelleri ile %95.3 doğruluk oranına ulaşan uyku kalitesi tahmini. Google Gemini 2.5 Flash API entegrasyonu ile kişiselleştirilmiş AI Uyku Koçluğu.",
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
    },
    {
      id: 3,
      title: "E-Ticaret Churn Analizi",
      description:
        "E-ticaret müşteri kayıp analizi projesi. Risk segmentasyonu ve veri analizi ile %50.85 churn oranı tespit edildi.",
      technologies: ["Python", "Pandas", "NumPy"],
      githubUrl: "https://github.com/cemyildizcy/ecommerce-churn-analysis",
      highlights: [
        "%50.85 churn oranı tespiti",
        "Risk Segmentasyonu",
        "Kapsamlı veri analizi",
      ],
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
      year: "2. sınıf",
      graduationYear: 2028,
      description:
        "Veri bilimi, makine öğrenimi ve Python tabanlı veri analizi projeleri üzerine yoğunlaşıyor.",
    },
  ],

  contact: {
    title: "İletişim",
    description: "Benimle iletişime geçmekten çekinmeyin.",
    email: "cemyildizcy@hotmail.com",
    phone: "5344630465",
    location: "Odunpazarı, Eskişehir, Turkey",
  },

  navigation: [
    { label: "Ana Sayfa", href: "#hero" },
    { label: "Hakkımda", href: "#about" },
    { label: "Projeler", href: "#projects" },
    { label: "Yetenekler", href: "#skills" },
    { label: "Eğitim", href: "#education" },
    { label: "İletişim", href: "#contact" },
  ],

  socialLinks: [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/cemyildizcy/",
      icon: "linkedin",
    },
    {
      name: "Son Postum",
      url: "https://www.linkedin.com/feed/update/urn:li:activity:7467981878382465024/",
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
};
