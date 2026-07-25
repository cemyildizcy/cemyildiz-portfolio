---
title: "Zaman Serisi Analizinde Klasik Modeller (ARIMA) ve Derin Öğrenme (LSTM/Transformer) Karşılaştırması"
date: "2026-07-24"
tags: ["Machine Learning", "Deep Learning", "Zaman Serisi", "Python"]
readTime: "8 dk"
coverEmoji: "📈"
description: "Zaman serisi tahminlemede geleneksel istatistiksel modeller ile modern derin öğrenme yaklaşımlarını karşılaştırıyor, doğru modeli seçmenin kurallarını inceliyoruz."
---

Zaman serisi tahmini (Time Series Forecasting), finansal piyasalardan enerji talebine, envanter yönetiminden hava durumu tahminlerine kadar birçok endüstride kritik öneme sahiptir. Geçmiş veriye bakarak geleceği öngörmek, işletmelerin kaynaklarını optimize etmesini sağlar. 

Ancak zaman serisi projelerinde her zaman en karmaşık derin öğrenme modelini seçmek doğru çözüm müdür? Yoksa onlarca yıllık istatistiksel modeller hala tahtını koruyor mu? Bu yazıda klasik ARIMA/SARIMA yöntemlerini, LSTM ve son dönemde popülerleşen Transformer mimarileriyle karşılaştıracağız.

## Zaman Serisi Tahmininde Problem Tanımı

Zaman serisi verileri, belirli zaman aralıklarıyla (saatlik, günlük, aylık vb.) kaydedilmiş sıralı gözlemlerdir. Bu verileri analiz ederken karşılaştığımız temel bileşenler şunlardır:
1. **Trend:** Verinin uzun vadedeki artış veya azalış eğilimi.
2. **Mevsimsellik (Seasonality):** Belirli dönemlerde (haftalık, yıllık) tekrarlayan düzenli dalgalanmalar.
3. **Gürültü (Noise):** Rastgele, açıklanamayan sapmalar.

Klasik modeller veriyi bu bileşenlere ayırarak matematiksel formüllerle modellerken; derin öğrenme modelleri veri içerisindeki karmaşık, doğrusal olmayan (non-linear) ilişkileri ve uzun vadeli bağımlılıkları öğrenmeye çalışır.

---

## 1. Klasik Modeller: ARIMA ve SARIMA

ARIMA (AutoRegressive Integrated Moving Average), zaman serilerinde doğrusal ilişkileri tahmin etmek için geliştirilmiş istatistiksel bir yöntemdir. SARIMA ise buna mevsimsellik (Seasonal) bileşenini ekler.

### Nasıl Çalışırlar?
ARIMA üç temel parametre üzerinden kurulur:
- **p (Autoregression - AR):** Geçmiş gözlemlerin bugünkü değer üzerindeki etkisi (gecikme / lag).
- **d (Integration - I):** Seriyi durağan (stationary) hale getirmek için yapılan fark alma (differencing) sayısı.
- **q (Moving Average - MA):** Geçmiş tahmin hatalarının bugünkü değer üzerindeki etkisi.

Klasik modellerin en büyük gücü **durağanlık** varsayımı üzerine kurulmuş olmalarıdır. Zaman serisinin ortalama ve varyansının zaman içinde sabit kalması gerekir. Eğer seri durağan değilse, `d` parametresi ile fark alınarak durağanlaştırılır.

---

## 2. Derin Öğrenme Modelleri: LSTM ve Transformer

Klasik modeller tek değişkenli ve doğrusal ilişkilerde mükemmel çalışırken, çok değişkenli (multivariate) ve doğrusal olmayan karmaşık örüntülerde yetersiz kalırlar. Burada devreye derin öğrenme girer.

### LSTM (Long Short-Term Memory)
LSTM, Tekrarlayan Sinir Ağlarının (RNN) uzun vadeli bağımlılıkları öğrenememe (vanishing gradient) problemini çözmek için tasarlanmıştır. İçerisindeki kapı (gate) mekanizmaları sayesinde, geçmişteki hangi bilginin saklanacağına, hangisinin unutulacağına karar verir. Sıralı verileri işlemek için oldukça başarılıdır.

### Transformer (Temporal Fusion Transformer / PatchTST)
Doğal dil işlemede devrim yaratan dikkat (attention) mekanizması, zaman serilerine de uyarlandı. Transformer modelleri, LSTM'lerin aksine tüm seriyi paralel olarak işleyebilir ve çok daha uzak geçmişteki ilişkileri "dikkat ağırlıkları" sayesinde doğrudan yakalayabilir. Özellikle uzun vadeli tahminlerde (long-range forecasting) geleneksel yöntemlere kıyasla büyük üstünlük sağlarlar.

---

## Python ile Karşılaştırmalı Uygulama

Aşağıdaki kod bloğunda, basit bir sentetik zaman serisi veri seti üzerinde klasik `SARIMAX` ile temel bir `LSTM` modelinin nasıl kurulacağını görebilirsiniz.

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# 1. Sentetik Zaman Serisi Oluşturma (Trend + Mevsimsellik + Gürültü)
np.random.seed(42)
time = np.arange(200)
values = 10 + 0.1 * time + 5 * np.sin(2 * np.pi * time / 12) + np.random.normal(0, 1, 200)
data = pd.DataFrame({"Value": values}, index=pd.date_range("2024-01-01", periods=200, freq="D"))

train_data = data.iloc[:-30]
test_data = data.iloc[-30:]

# ==========================================
# YÖNTEM A: Klasik SARIMA Modeli
# ==========================================
sarima_model = SARIMAX(train_data["Value"], order=(1, 1, 1), seasonal_order=(1, 1, 1, 12))
sarima_results = sarima_model.fit(disp=False)
sarima_pred = sarima_results.get_forecast(steps=30).predicted_mean

# ==========================================
# YÖNTEM B: LSTM Modeli
# ==========================================
# Veri Ölçeklendirme
scaler = MinMaxScaler()
scaled_train = scaler.fit_transform(train_data)

# LSTM için veri hazırlama (Look-back window = 12 gün)
def create_dataset(dataset, look_back=12):
    X, Y = [], []
    for i in range(len(dataset) - look_back):
        X.append(dataset[i:(i + look_back), 0])
        Y.append(dataset[i + look_back, 0])
    return np.array(X), np.array(Y)

look_back = 12
X_train, y_train = create_dataset(scaled_train, look_back)
X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))

# LSTM Yapısının Kurulması
lstm_model = Sequential([
    LSTM(50, activation='relu', input_shape=(look_back, 1)),
    Dense(1)
])
lstm_model.compile(optimizer='adam', loss='mse')
lstm_model.fit(X_train, y_train, epochs=50, batch_size=8, verbose=0)

# Tahmin Süreci
inputs = scaled_train[-look_back:]
lstm_pred = []
for _ in range(30):
    pred = lstm_model.predict(inputs.reshape(1, look_back, 1), verbose=0)
    lstm_pred.append(pred[0, 0])
    inputs = np.append(inputs[1:], pred)

# Ölçeği Geri Çevirme
lstm_pred = scaler.inverse_transform(np.array(lstm_pred).reshape(-1, 1)).flatten()

# 2. Sonuçların Görselleştirilmesi
plt.figure(figsize=(12, 6))
plt.plot(train_data.index[-50:], train_data["Value"][-50:], label="Eğitim Verisi")
plt.plot(test_data.index, test_data["Value"], label="Gerçek Değerler", color="black")
plt.plot(test_data.index, sarima_pred, label="SARIMA Tahmini", linestyle="--", color="blue")
plt.plot(test_data.index, lstm_pred, label="LSTM Tahmini", linestyle="--", color="red")
plt.legend()
plt.title("SARIMA ve LSTM Tahmin Karşılaştırması")
plt.show()
```

---

## Hangi Modeli Ne Zaman Seçmeliyiz?

Model seçimini belirleyen kurallar karmaşıklıktan ziyade verinin ve problemin doğası ile ilgilidir:

| Özellik / Kriter | Klasik Modeller (ARIMA/SARIMA) | Derin Öğrenme (LSTM/Transformer) |
| :--- | :--- | :--- |
| **Veri İhtiyacı** | Düşük (50-100 gözlem yeterli olabilir) | Çok Yüksek (Binlerce satır/zaman adımı) |
| **Durağanlık Şartı**| Evet (Fark alma işlemleri zorunlu) | Hayır (Model örüntüyü kendisi öğrenir) |
| **Hesaplama Maliyeti**| Çok Düşük (Saniyeler içinde eğitilir) | Yüksek (GPU/CPU zamanı ve bellek ister) |
| **Yorumlanabilirlik**| Yüksek (Katsayılar ve p-değerleri nettir)| Düşük (Kara kutu modellerdir) |
| **Çok Değişkenli Veri**| Zor (VAR/VARIMAX gibi karmaşık uzantılar)| Çok Kolay (Farklı feature'lar kolayca eklenir) |

### Altın Kurallar:
- Elinizde **az miktarda veri** (örneğin sadece aylık satış verisi) ve net bir **mevsimsellik** varsa **SARIMA** ile başlayın.
- Veriniz **binlerce satırdan oluşuyorsa**, dışsal faktörler (hava durumu, indirim günleri, fiyat endeksleri) gibi **çok sayıda değişken** tahmini etkiliyorsa **LSTM** veya **Transformer** tabanlı modelleri tercih edin.
- Her zaman basit bir ARIMA modelini **baseline** (kıyaslama noktası) olarak kurun. Derin öğrenme modelinizin ARIMA'dan daha iyi performans gösterdiğinden emin olmadan karmaşık mimarileri üretime (production) taşımayın.

---

## Sık Yapılan Hatalar

1. **Durağan Olmayan Veriyi ARIMA'ya Vermek:** Seride güçlü bir trend varken fark almadan (d=0) ARIMA çalıştırmak, modelin saçma tahminler üretmesine yol açar.
2. **Veri Sızıntısı (Data Leakage):** Derin öğrenme için veri hazırlarken, MinMaxScaler gibi ölçeklendiricileri tüm veri setine (train + test) birden uygulamak test verisindeki bilginin eğitim verisine sızmasına yol açar. Ölçeklendirici sadece `train` verisiyle eğitilmelidir (`fit_transform`), test verisi ise sadece `transform` edilmelidir.
3. **Geleceği Girdilerde Kullanmak:** Kaydırmalı pencere (look-back window) oluştururken, gelecekteki değerlerin eğitim matrisine yanlışlıkla dahil edilmediğinden emin olun.

---

## Kaynaklar

1. [Forecasting: Principles and Practice (3rd ed) - Rob J Hyndman and George Athanasopoulos](https://otexts.com/fpp3/)
2. [Deep Learning for Time Series Forecasting - Jason Brownlee (Machine Learning Mastery)](https://machinelearningmastery.com/deep-learning-for-time-series-forecasting/)
3. [Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting](https://arxiv.org/abs/1912.09363)
4. [PatchTST: A Time Series is Worth 64 Words](https://arxiv.org/abs/2211.14731)
