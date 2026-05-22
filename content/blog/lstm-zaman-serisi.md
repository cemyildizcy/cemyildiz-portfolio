---
title: "LSTM ile Zaman Serisi: Hisse Senedi Tahmini"
date: "2026-05-23"
excerpt: "Sıralı verilerde neden standart sinir ağları yerine LSTM kullanıyoruz? Borsa tahmini ve zaman serisi analizi üzerinden LSTM mimarisinin anatomisi."
tags: ["Deep Learning", "LSTM", "Python", "Keras", "Zaman Serisi"]
readTime: "8 dk"
coverEmoji: "📈"
---

# LSTM Ağları ile Zaman Serisi Analizi

Hisse senedi fiyatları, hava durumu veya metin çevirisi... Bunların ortak noktası nedir? **Sıralı veri (Sequential Data)** olmaları. Klasik sinir ağları (Feedforward Neural Networks) geçmişi hatırlamaz. Bir girdi alır ve çıktı üretir. Ancak borsa gibi dünün bugünü etkilediği sistemlerde "hafızaya" ihtiyacımız vardır.

İşte burada **RNN (Recurrent Neural Networks)** ve onun çok daha gelişmiş bir versiyonu olan **LSTM (Long Short-Term Memory)** devreye giriyor.

## Neden RNN Değil de LSTM?

RNN'ler teoride harikadır, ancak pratikte **Vanishing Gradient (Kaybolan Gradyan)** problemi yaşarlar. Uzun bir cümlenin başındaki kelimeyi veya 30 gün önceki hisse fiyatını hatırlamakta zorlanırlar. Gradyanlar geriye doğru çarpıldıkça sıfıra yaklaşır ve ağ "unutur".

LSTM, bu sorunu özel **Hücre Durumu (Cell State)** ve **Kapılar (Gates)** ile çözer.

## LSTM'in 3 Temel Kapısı (Gates)

LSTM hücresi, bilgi akışını 3 kapı ile yönetir. Her kapı $0$ ile $1$ arasında değer üreten bir Sigmoid aktivasyon fonksiyonu kullanır ($0$: hiçbir şeyi geçirme, $1$: her şeyi geçir).

### 1. Forget Gate (Unutma Kapısı)
Hangi bilgilerin gereksiz olduğuna ve atılacağına karar verir. Örneğin, yeni bir hisse senedi trendi başladıysa, eski yatay seyir bilgisi unutulmalıdır.

### 2. Input Gate (Giriş Kapısı)
Yeni gelen bilginin hangisinin hücre durumuna (hafızaya) ekleneceğine karar verir. Gelen yeni fiyat verisi ne kadar önemli?

### 3. Output Gate (Çıkış Kapısı)
Hücre durumunun hangi kısmının bir sonraki adıma (gizli durum / hidden state) çıktı olarak verileceğini belirler.

## Keras ile Basit Bir LSTM Modeli

Geçmiş projemde (stock-price-prediction-lstm) hisse senedi tahmini için aşağıdaki gibi bir mimari kullandım:

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

model = Sequential()

# İlk LSTM katmanı ve Dropout (Overfitting'i önlemek için)
model.add(LSTM(units=50, return_sequences=True, input_shape=(X_train.shape[1], 1)))
model.add(Dropout(0.2))

# İkinci LSTM katmanı
model.add(LSTM(units=50, return_sequences=False))
model.add(Dropout(0.2))

# Çıkış katmanı
model.add(Dense(units=1))

model.compile(optimizer='adam', loss='mean_squared_error')
model.fit(X_train, y_train, epochs=50, batch_size=32)
```

## Borsa Tahmini Gerçekten Mümkün mü?

Modeli eğittikten sonra test verisi üzerinde çok iyi sonuçlar alabilirsiniz. Ancak piyasa **stokastik (rastgele)** bir yapıya sahiptir. LSTM geçmiş desenleri mükemmel öğrenir, ancak pandemi, siyasi krizler veya ani şirket haberleri gibi veride olmayan dış şokları (Black Swan events) tahmin edemez.

Bu yüzden LSTM borsada kesin bir "para basma makinesi" değil, ancak trendleri ve momentumu analiz etmek için güçlü bir **destek aracıdır**.
