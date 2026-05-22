---
title: "XGBoost ile %95.3 Doğruluk: SleepInfo'nun Hikayesi"
date: "2026-05-20"
excerpt: "Uyku kalitesini tahmin eden AI destekli bir platform nasıl geliştirilir? XGBoost, FastAPI ve React ile SleepInfo'yu sıfırdan inşa etme sürecim."
tags: ["XGBoost", "FastAPI", "React", "Makine Öğrenimi", "Veri Bilimi"]
readTime: "8 dk"
coverEmoji: "🧠"
---

# XGBoost ile %95.3 Doğruluk: SleepInfo'nun Hikayesi

Uyku, sağlığımızın en temel yapı taşlarından biri. Peki ya uyku kalitemizi verilerle ölçüp, yapay zeka ile tahmin edebilseydik?

**SleepInfo** tam olarak bu soruya cevap veren bir proje. Bu yazıda, projenin fikir aşamasından canlıya çıkışına kadar tüm süreci paylaşacağım.

## Problem Tanımı

İnsanların büyük çoğunluğu uyku kalitelerinin farkında değil. Sabah yorgun kalkmak, gün içinde dikkat dağınıklığı yaşamak — bunların hepsi kötü uyku kalitesiyle doğrudan ilişkili.

Hedefim şuydu: **Kullanıcıdan aldığım basit verilerle (uyku süresi, stres seviyesi, fiziksel aktivite vb.) uyku kalitesini tahmin eden bir model oluşturmak.**

## Veri ve Feature Engineering

Kaggle'dan aldığım uyku sağlığı veri setini kullandım. 400+ kayıt, 13 özellik. İlk iş **veri ön işleme** oldu:

- **Eksik veri kontrolü:** Neyse ki bu veri setinde eksik veri yoktu.
- **Kategorik değişkenler:** Label encoding ile sayısallaştırdım.
- **Feature scaling:** StandardScaler ile normalize ettim.
- **Korelasyon analizi:** Seaborn heatmap ile hangi özelliklerin uyku kalitesiyle en çok ilişkili olduğunu buldum.

En güçlü korelasyonlar: **Uyku süresi (0.88)**, **Fiziksel aktivite (0.71)** ve **Stres seviyesi (-0.67)**.

## Model Seçimi ve Karşılaştırma

Üç farklı model denedim:

| Model | Doğruluk | F1 Skoru |
|-------|---------|----------|
| Random Forest | %92.1 | 0.91 |
| Gradient Boosting | %93.7 | 0.93 |
| **XGBoost** | **%95.3** | **0.95** |

XGBoost açık ara kazandı. Hyperparameter tuning için GridSearchCV kullandım:

```python
from xgboost import XGBClassifier
from sklearn.model_selection import GridSearchCV

param_grid = {
    'max_depth': [3, 5, 7],
    'learning_rate': [0.01, 0.1, 0.2],
    'n_estimators': [100, 200, 300],
    'subsample': [0.8, 0.9, 1.0]
}

xgb = XGBClassifier(random_state=42)
grid_search = GridSearchCV(xgb, param_grid, cv=5, scoring='accuracy')
grid_search.fit(X_train, y_train)
```

## Full-Stack Mimari

Modeli eğittikten sonra sıra **gerçek bir ürün** haline getirmeye geldi:

- **Backend:** FastAPI ile REST API. Model pickle dosyası olarak yükleniyor, `/predict` endpoint'i ile tahmin yapılıyor.
- **Frontend:** React + Vite. Kullanıcı formu dolduruyor, sonuç anında ekrana geliyor.
- **Veritabanı:** Supabase (PostgreSQL). Kullanıcı kayıtları ve tahmin geçmişi burada tutuluyor.
- **AI Koçluk:** Google Gemini 2.5 Flash API entegrasyonu. Tahmin sonucuna göre kişiselleştirilmiş uyku tavsiyeleri.
- **Deployment:** Frontend → Vercel, Backend → Render.

## Karşılaştığım Zorluklar

1. **CORS hatası:** FastAPI'de CORS middleware eklemek ilk başta aklıma gelmedi. React'ten API'ye istek atınca hata aldım. `CORSMiddleware` ekleyerek çözdüm.
2. **Model boyutu:** Pickle dosyası 15MB çıktı. Render'ın free tier'ında yavaş yükleniyordu. Model sıkıştırma ile 4MB'a düşürdüm.
3. **Gemini API rate limiti:** Free tier'da dakikada 15 istek sınırı var. Caching mekanizması ekleyerek çözdüm.

## Sonuç

SleepInfo benim için sadece bir proje değil, **veri biliminden full-stack'e kadar tüm pipeline'ı tek başıma kurabildiğimin kanıtı**. Eğer siz de benzer bir proje yapmak istiyorsanız:

1. Küçük başlayın — önce modeli notebook'ta çalıştırın.
2. API'yi minimalist tutun — tek endpoint yeter.
3. Frontend'i basit yapın — kullanıcı deneyimi her şeydir.
4. Deploy edin — localhost'ta kalan proje, proje değildir.

**Proje linki:** [sleepinfo.com.tr](https://sleepinfo.com.tr)
