---
title: "Feature Engineering Nedir? Veri Biliminin Gizli Silahı"
date: "2026-05-15"
excerpt: "Makine öğreniminde model performansını belirleyen en kritik adım: Feature Engineering. Gerçek projelerden örneklerle anlatıyorum."
tags: ["Veri Bilimi", "Feature Engineering", "Python", "Pandas", "Scikit-learn"]
readTime: "6 dk"
coverEmoji: "⚙️"
---

# Feature Engineering Nedir? Veri Biliminin Gizli Silahı

Makine öğreniminde en çok vakit harcanan yer model seçimi değil, **veri hazırlığıdır**. Ve veri hazırlığının kalbi de **Feature Engineering** — yani özellik mühendisliğidir.

## Neden Bu Kadar Önemli?

Bir gerçeği paylaşayım: E-Ticaret Churn Analizi projemde ham veriyle eğittiğim Random Forest modeli **%72** doğruluk verdi. Aynı model, feature engineering sonrası **%86**'ya çıktı. **Model aynı, veri farklı.**

Andrew Ng'nin meşhur sözü var: *"Applied machine learning is basically feature engineering."*

## Temel Teknikler

### 1. Eksik Veri Yönetimi

```python
import pandas as pd

# Eksik verileri medyan ile doldur
df['gelir'].fillna(df['gelir'].median(), inplace=True)

# Kategorik değişkenlerde mod kullan
df['sehir'].fillna(df['sehir'].mode()[0], inplace=True)
```

Dikkat: Her zaman **neden** eksik olduğunu sorgulayın. Eksiklik kendisi bir bilgi olabilir!

### 2. Encoding (Kodlama)

Kategorik verileri modelin anlayacağı sayılara çevirmek gerekir:

```python
from sklearn.preprocessing import LabelEncoder, OneHotEncoder

# Sıralı kategoriler → Label Encoding
le = LabelEncoder()
df['egitim_seviyesi'] = le.fit_transform(df['egitim_seviyesi'])

# Sırasız kategoriler → One-Hot Encoding
df = pd.get_dummies(df, columns=['sehir'], drop_first=True)
```

### 3. Yeni Özellikler Türetme

Bu kısım yaratıcılık gerektirir:

```python
# Tarihten yeni özellikler
df['gun'] = df['tarih'].dt.day
df['ay'] = df['tarih'].dt.month
df['haftasonu'] = df['tarih'].dt.dayofweek >= 5

# Oranlar
df['gelir_harcama_orani'] = df['gelir'] / (df['harcama'] + 1)

# Gruplama
df['yas_grubu'] = pd.cut(df['yas'], bins=[0, 25, 35, 50, 100], 
                          labels=['Genç', 'Orta', 'Olgun', 'Kıdemli'])
```

### 4. Scaling (Ölçekleme)

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# Standart ölçekleme (ortalama=0, std=1)
scaler = StandardScaler()
df[['gelir', 'yas']] = scaler.fit_transform(df[['gelir', 'yas']])
```

## Gerçek Proje: Churn Analizi

E-Ticaret Churn Analizi projemde şu feature'ları türettim:

- **Recency:** Son alışverişten bu yana geçen gün sayısı
- **Frequency:** Toplam sipariş sayısı
- **Monetary:** Toplam harcama tutarı
- **Ortalama sepet değeri:** Monetary / Frequency
- **İade oranı:** İade sayısı / Sipariş sayısı

Bu RFM (Recency-Frequency-Monetary) yaklaşımı, müşteri segmentasyonunun temelini oluşturdu ve **%50.85 churn oranını** tespit etmemizi sağladı.

## Sık Yapılan Hatalar

1. **Data leakage:** Test verisinden bilgi sızdırmak. Scaling ve encoding'i her zaman **sadece train seti üzerinde** fit edin.
2. **Çok fazla özellik:** 100 özellik eklemek yerine, korelasyon analizi ve feature importance ile en anlamlı 15-20'sini seçin.
3. **Domain bilgisi eksikliği:** Veriyi anlamadan mühendislik yapmak, karanlıkta ok atmak gibidir.

## Sonuç

Feature engineering, makine öğreniminin **en zor ama en ödüllendirici** kısmıdır. İyi bir veri bilimci, model seçmeden önce veriye hakim olur. Unutmayın: **Çöp girerse, çöp çıkar (Garbage In, Garbage Out).**
