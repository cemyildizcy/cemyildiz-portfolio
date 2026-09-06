---
title: "Overfitting Nedir, Nasıl Anlaşılır ve Nasıl Önlenir?"
date: "2026-07-04"
tags: ["Makine Öğrenimi", "Model Değerlendirme", "Python", "Veri Bilimi"]
readTime: "12 dk"
coverEmoji: "🎯"
description: "Overfitting'i ezber tanımıyla değil, train/validation davranışı, veri sızıntısı, regularization ve doğru doğrulama stratejileriyle pratik şekilde anlatan rehber."
---

# Overfitting Nedir, Nasıl Anlaşılır ve Nasıl Önlenir?

Makine öğreniminde iyi skor almak her zaman iyi model kurduğun anlamına gelmez. Bazen model gerçekten öğrenmez, sadece eğitim verisini ezberler. Bu duruma overfitting denir. Türkçeye genelde "aşırı öğrenme" diye çevrilir ama pratikte daha doğru kelime "ezberleme" olabilir.

Bir model eğitim verisinde çok iyi, yeni veride kötü performans gösteriyorsa büyük ihtimalle overfitting vardır. Bu yazıda konuyu sadece tanım olarak değil, projede nasıl fark edileceği ve nasıl azaltılacağı üzerinden anlatıyorum.

## Overfitting neden olur?

Bir modelin amacı verideki genel deseni öğrenmektir. Örneğin bir öğrenci başarı tahmin modeli kuruyorsan, modelin çalışma süresi, devamsızlık, önceki notlar gibi değişkenlerden genel ilişkiler çıkarmasını beklersin. Ama model eğitim verisindeki gürültüyü, rastlantısal detayları veya hatalı kayıtları da öğrenirse yeni öğrencilere genelleyemez.

Overfitting genelde şu durumlarda görülür:

- Veri azdır, model çok karmaşıktır.
- Feature sayısı fazladır ama örnek sayısı düşüktür.
- Train/test ayrımı yanlış yapılmıştır.
- Veri sızıntısı vardır.
- Model uzun süre eğitilmiştir.
- Hiperparametreler validasyon setine fazla uyarlanmıştır.

Özetle modelin kapasitesi, eldeki veriyle öğrenmesi gereken gerçek desenden daha fazladır.

## Basit işaret: train skoru çok iyi, validation skoru kötü

En klasik sinyal şudur:

| Durum | Train skoru | Validation skoru | Yorum |
|---|---:|---:|---|
| İyi genelleme | Yüksek | Yüksek | Model makul öğrenmiş |
| Underfitting | Düşük | Düşük | Model yetersiz kalmış |
| Overfitting | Çok yüksek | Belirgin düşük | Model eğitim verisini ezberlemiş |

Örneğin Random Forest ile train accuracy %99, validation accuracy %74 ise modelin gerçek performansı %99 değildir. Bu durumda %99 sadece eğitim verisine uyumdur.

Regresyonda da benzer düşünülür. Train RMSE çok düşük ama validation RMSE yüksekse model yeni veride hata yapıyordur.

## Loss grafiği nasıl okunur?

Derin öğrenmede train ve validation loss grafiği çok şey anlatır.

Genel senaryo:

1. İlk epoch'larda train loss düşer, validation loss da düşer.
2. Bir noktadan sonra train loss düşmeye devam eder.
3. Validation loss durur veya yükselmeye başlar.

İşte o kırılma noktası overfitting'in başladığı yerdir. Model eğitim verisindeki daha ince, daha rastlantısal ayrıntılara uyum sağlamaya başlamıştır.

Bu yüzden deep learning projelerinde early stopping çok kullanılır. Model validation loss iyileşmediğinde eğitim durdurulur.

## Veri sızıntısı overfitting gibi görünür ama daha tehlikelidir

Data leakage yani veri sızıntısı, modelin tahmin anında bilmemesi gereken bilgiyi eğitim sırasında görmesidir. Bu durumda skorlar çok iyi görünür ama gerçek hayatta model çöker.

Örnekler:

- Müşteri churn tahmininde, churn olduktan sonra oluşan bir kolonun feature olarak kullanılması.
- Kredi risk modelinde, karar sonrası oluşan bir bilginin modele verilmesi.
- Zaman serisinde gelecekteki verinin geçmiş tahmininde kullanılması.
- Preprocessing işlemlerinin train/test ayrımından önce tüm veri üzerinde yapılması.

Bu yüzden pipeline kurarken önce train/test ayrımı yapılmalı, scaler/imputer/encoder gibi dönüşümler sadece train set üzerinde fit edilmelidir.

Yanlış:

```python
scaler.fit_transform(all_data)
train, test = train_test_split(all_data)
```

Daha doğru:

```python
train, test = train_test_split(data, test_size=0.2, random_state=42)
scaler.fit(train[features])
train_scaled = scaler.transform(train[features])
test_scaled = scaler.transform(test[features])
```

## Model karmaşıklığını azaltmak

Overfitting'in en pratik çözümü modelin gereksiz karmaşıklığını azaltmaktır. Bu, modele göre değişir.

Decision Tree için:

- `max_depth` düşürülür.
- `min_samples_leaf` artırılır.
- `min_samples_split` artırılır.

Random Forest için:

- Ağaç derinliği sınırlanır.
- Minimum leaf sayısı artırılır.
- Çok küçük sample'lara bölünme engellenir.

Gradient boosting için:

- Learning rate düşürülür.
- Tree depth azaltılır.
- Early stopping kullanılır.
- Subsample oranı ayarlanır.

Neural network için:

- Katman sayısı azaltılır.
- Dropout eklenir.
- Weight decay kullanılır.
- Early stopping uygulanır.
- Daha fazla veri veya augmentation kullanılır.

Buradaki amaç modeli güçsüzleştirmek değil, gereksiz ezber kapasitesini azaltmaktır.

## Regularization ne yapar?

Regularization, modele "çok karmaşık açıklama yapma" diyen bir frendir.

L1 regularization bazı ağırlıkları sıfıra yaklaştırabilir. Bu yüzden feature selection etkisi yaratabilir. L2 regularization ise ağırlıkları küçük tutmaya çalışır. Neural network tarafında weight decay genelde L2 regularization mantığıyla kullanılır.

Basit fikir şu: Model eğitim verisine mükemmel oturmak için çok büyük ağırlıklar öğreniyorsa, regularization bunu cezalandırır. Böylece model biraz daha sade ve genellenebilir hale gelir.

## Cross-validation neden önemli?

Tek bir train/test ayrımı bazen yanıltıcı olabilir. Veri küçükse test setine denk gelen örnekler sonucu fazla etkileyebilir. Cross-validation bu sorunu azaltır.

K-fold cross-validation'da veri k parçaya bölünür. Model farklı train/validation kombinasyonlarıyla eğitilir. Sonuç olarak tek bir skora değil, skor dağılımına bakarsın.

Örneğin 5-fold CV sonucunda accuracy değerleri şöyleyse:

```text
0.84, 0.82, 0.85, 0.83, 0.84
```

Model daha stabil görünür. Ama şöyleyse:

```text
0.92, 0.71, 0.88, 0.65, 0.90
```

Model veri bölünmesine çok hassas olabilir. Bu da genelleme riskidir.

## Zaman serisinde normal train/test split yetmez

Zaman serilerinde geleceği tahmin ediyorsan veriyi rastgele bölmek yanlıştır. Çünkü model gelecekteki örüntüleri eğitimde görmüş olur.

Bunun yerine zaman sırasına göre bölmek gerekir:

- İlk %70 eğitim
- Sonraki %15 validasyon
- Son %15 test

Ya da rolling/expanding window validation kullanılabilir. Bu yaklaşım gerçek hayata daha yakındır çünkü model geçmişten öğrenip geleceği tahmin eder.

## Feature engineering overfitting'i artırabilir

Feature engineering genelde performansı artırır ama yanlış yapılırsa overfitting'i de büyütebilir. Çok fazla türetilmiş özellik oluşturmak, özellikle veri azsa modeli gereksiz ayrıntılara bağlayabilir.

Örneğin 500 satırlık veriyle 300 feature kullanmak risklidir. Model gerçek ilişkiyi değil, eğitim verisine özgü kombinasyonları yakalayabilir.

Feature engineering sonrası şu soruları sormak gerekir:

- Bu feature tahmin anında gerçekten bilinecek mi?
- Bu feature target değişkene dolaylı yoldan sızıntı taşıyor mu?
- Bu feature farklı veri bölünmelerinde aynı katkıyı sağlıyor mu?
- Feature sayısı veri boyutuna göre makul mü?

## Pratik kontrol listesi

Bir modelde overfitting şüphesi varsa şu sırayı izlerim:

1. Train ve validation skorlarını karşılaştır.
2. Loss/metric grafiği varsa incele.
3. Veri sızıntısı ihtimalini kontrol et.
4. Cross-validation uygula.
5. Model karmaşıklığını azalt.
6. Regularization ekle.
7. Feature sayısını ve kalitesini gözden geçir.
8. Daha fazla veri veya data augmentation düşün.
9. Test setini en sona sakla.

Bu liste basit görünebilir ama çoğu projede sorunu yakalamaya yeter.

## Sonuç

Overfitting, modelin "çok iyi" görünmesini sağlayan ama gerçek hayatta performansı bozan bir problemdir. Bu yüzden sadece tek bir skorla karar vermemek gerekir. Train/validation farkı, cross-validation sonuçları, veri sızıntısı kontrolü ve model karmaşıklığı birlikte değerlendirilmelidir.

İyi model, eğitim verisini ezberleyen model değildir. Yeni veri geldiğinde makul davranan modeldir.

## Kaynaklar

- scikit-learn, "Underfitting vs. Overfitting": https://scikit-learn.org/stable/auto_examples/model_selection/plot_underfitting_overfitting.html
- scikit-learn, "Cross-validation": https://scikit-learn.org/stable/modules/cross_validation.html
- Google Machine Learning Crash Course, "Overfitting": https://developers.google.com/machine-learning/crash-course/overfitting/overfitting
- TensorFlow Tutorials, "Overfit and underfit": https://www.tensorflow.org/tutorials/keras/overfit_and_underfit
