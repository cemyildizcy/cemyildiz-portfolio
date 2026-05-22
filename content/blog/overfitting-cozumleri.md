---
title: "Modeliniz Ezberliyor mu? Overfitting ve Çözümleri"
date: "2026-05-24"
excerpt: "Makine öğreniminin en büyük düşmanı overfitting (aşırı öğrenme) nedir? Regularization, Dropout ve Early Stopping ile modelinizi nasıl genelleştirebilirsiniz?"
tags: ["Makine Öğrenimi", "Overfitting", "Veri Bilimi", "Model Optimizasyonu"]
readTime: "7 dk"
coverEmoji: "🎯"
---

# Modeliniz Ezberliyor mu? Overfitting (Aşırı Öğrenme)

Bir öğrenci düşünün. Sınava çalışırken sadece geçmiş yılların çıkmış sorularını **kelimesi kelimesine** ezberliyor. Deneme sınavlarında (Eğitim Verisi) 100 tam puan alıyor. Ancak gerçek sınava (Test Verisi) girdiğinde, sorular hafifçe değiştirildiği için başarısız oluyor.

İşte makine öğreniminde bu duruma **Overfitting (Aşırı Öğrenme)** diyoruz. Modeliniz verinin içindeki genel kuralı (pattern) öğrenmek yerine, verideki "gürültüyü" ve istisnaları ezberlemiştir.

## Overfitting Nasıl Tespit Edilir?

En klasik yöntem, eğitim (Training) ve doğrulama (Validation) loss/accuracy grafiklerini çizmektir.

Eğer Eğitim hatası sürekli düşüyor, ancak Doğrulama hatası bir noktadan sonra **artmaya başlıyorsa**, tebrikler: Modeliniz ezberliyor.

## Overfitting'i Önleme Teknikleri

### 1. Daha Fazla Veri (Data Augmentation)
En iyi çözüm her zaman daha fazla veridir. Eğer görüntü işleme yapıyorsanız, mevcut resimleri döndürerek, kırparak veya renklerini değiştirerek (Data Augmentation) veri setinizi yapay olarak büyütebilirsiniz.

### 2. Regularization (Düzenlileştirme - L1 / L2)
Modelin çok karmaşık olmasını cezalandıran matematiksel bir yöntemdir. Loss fonksiyonuna ekstra bir ceza terimi ekleriz.

- **L1 (Lasso):** Önemsiz feature'ların ağırlıklarını tamamen 0 yapar. Feature selection (özellik seçimi) gibi çalışır.
- **L2 (Ridge):** Ağırlıkları 0 yapmaz ama çok küçük değerlere çeker. Modelin tek bir özelliğe çok fazla bel bağlamasını engeller.

```python
from sklearn.linear_model import Ridge

# alpha değeri cezanın büyüklüğüdür.
ridge_model = Ridge(alpha=1.0)
ridge_model.fit(X_train, y_train)
```

### 3. Dropout (Derin Öğrenme İçin)
Sinir ağlarında kullanılan inanılmaz basit ama etkili bir yöntemdir. Eğitim sırasında rastgele seçilen nöronları (örneğin %20'sini) "kapatırız". 

Böylece ağ, hiçbir nörona veya bağlantıya aşırı güvenemez. Bilgiyi tüm ağa yaymak zorunda kalır.

```python
from tensorflow.keras.layers import Dropout

# Bir önceki katmandaki nöronların %30'unu rastgele devreden çıkar
model.add(Dropout(0.3))
```

### 4. Early Stopping (Erken Durdurma)
Neden modelin hata yapmasını bekleyelim? Doğrulama (Validation) hatasının düşmeyi bıraktığı ve artmaya başladığı o "tatlı noktada" eğitimi otomatik olarak durduran mekanizmadır.

```python
from tensorflow.keras.callbacks import EarlyStopping

# val_loss 5 epoch boyunca düzelmezse eğitimi durdur
early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

model.fit(X_train, y_train, validation_data=(X_val, y_val), callbacks=[early_stop])
```

## Özet

Mükemmel doğruluk (Accuracy) oranı her zaman iyi bir şey değildir. Bir model eğitim verisinde %99.9 başarılıysa, kutlama yapmadan önce şüphelenin. Gerçek dünyada değer yaratan modeller, ezberleyenler değil, **genelleştirebilen** (generalization) modellerdir.
