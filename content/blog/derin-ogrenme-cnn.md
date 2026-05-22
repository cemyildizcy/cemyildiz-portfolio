---
title: "Yapay Zeka Nasıl Görür? CNN (Evrişimli Sinir Ağları)"
date: "2026-05-25"
excerpt: "Görüntü işleme projelerinin kalbi olan CNN mimarisine giriş. Filtreler, Pooling katmanları ve makinenin piksellerden anlam çıkarma süreci."
tags: ["Deep Learning", "CNN", "Görüntü İşleme", "Yapay Zeka"]
readTime: "9 dk"
coverEmoji: "👁️"
---

# Yapay Zeka Nasıl Görür? CNN Mimarisine Giriş

Bilgisayarlar için bir fotoğraf, içinde kedi olan sevimli bir anı değil; devasa bir sayı matrisidir (Pikseller). Uzun yıllar boyunca, bilgisayarlara bu sayı yığınından "anlam" çıkarmayı öğretmek yapay zekanın en büyük sınavı oldu.

Klasik Yapay Sinir Ağları (MLP) ile pikselleri tek boyuta indirgeyip ağa verdiğimizde, **uzamsal bilgiyi (spatial information)** kaybediyorduk. Gözün burnun üstünde olduğu veya kulağın yanda olduğu bilgisi yok oluyordu.

Bunu çözen mimari: **CNN (Convolutional Neural Networks - Evrişimli Sinir Ağları)** oldu.

## CNN'in Yapıtaşları

CNN, görüntüdeki özellikleri (kenarlar, çizgiler, şekiller) adım adım öğrenen katmanlardan oluşur.

### 1. Convolution (Evrişim) Katmanı ve Filtreler
CNN'in sihirli değneği **Filtrelerdir (Kernels)**. 3x3 veya 5x5 boyutlarında küçük matrisler düşünün. Bu filtreler görüntünün üzerinde piksel piksel kayarak gezer ve bir matematiksel çarpım (nokta çarpım) yapar.

- İlk katmanlardaki filtreler yatay veya dikey **çizgileri, kenarları** tespit eder.
- Derin katmanlardaki filtreler bu çizgileri birleştirip **göz, tekerlek, yaprak** gibi şekilleri bulur.
- En derin katmanlar ise bir **kedi yüzü veya araba** gibi yüksek seviyeli özellikleri algılar.

Önemli olan şudur: Bu filtreleri biz elle yazmayız. Sinir ağı, eğitimi (Backpropagation) sırasında hangi filtrenin neye bakması gerektiğini **kendisi öğrenir**.

### 2. ReLU (Aktivasyon)
Evrişim işleminden çıkan değerler negatif olabilir. ReLU (Rectified Linear Unit) fonksiyonu, tüm negatif değerleri sıfırlar. Bu, modele "doğrusal olmama" (non-linearity) özelliği katar.

### 3. Pooling (Ortaklama/Havuzlama) Katmanı
Görüntü boyutunu küçültmek, işlem yükünü azaltmak ve modelin objenin tam konumundan bağımsız (Translation Invariance) çalışmasını sağlamak için kullanılır.

En yaygını **Max Pooling**'dir. 2x2'lik bir pencere içinde sadece en yüksek (en belirgin) piksel değerini alır, diğerlerini atar.

## Mimari Nasıl Birleşir?

Tipik bir CNN mimarisi şuna benzer:

1. **Giriş Görüntüsü** (Örn: 224x224 RGB)
2. `Conv2D` -> `ReLU` -> `MaxPooling` (Çizgiler algılandı, boyut küçüldü)
3. `Conv2D` -> `ReLU` -> `MaxPooling` (Şekiller algılandı, boyut daha da küçüldü)
4. `Flatten` (Matris tek boyutlu bir vektöre düzleştirilir)
5. `Dense (Fully Connected)` (Karar verme aşaması)
6. `Softmax` (Çıktı olasılıkları - %90 Kedi, %10 Köpek)

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

model = Sequential([
    # Evrişim ve Havuzlama
    Conv2D(32, (3,3), activation='relu', input_shape=(64, 64, 3)),
    MaxPooling2D((2,2)),
    
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D((2,2)),
    
    # Düzleştirme ve Karar
    Flatten(),
    Dense(128, activation='relu'),
    Dense(10, activation='softmax') # 10 Sınıflı sınıflandırma
])
```

## Neden Çok Önemli?

CNN'ler sadece kedi-köpek ayırt etmez. Tıbbi görüntülerden kanserli tümörleri bulmak, otonom araçların yayaları tanımasını sağlamak ve yüz tanıma sistemleri gibi hayatımızı değiştiren tüm "Görüntü İşleme" (Computer Vision) projelerinin temelinde bu mimari yatar.
