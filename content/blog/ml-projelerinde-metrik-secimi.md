---
title: "ML Projelerinde Doğru Metrik Nasıl Seçilir?"
date: "2026-07-06"
tags: ["Makine Öğrenimi", "Model Değerlendirme", "Veri Bilimi", "Metrikler"]
readTime: "14 dk"
coverEmoji: "📏"
description: "Accuracy, precision, recall, F1, ROC-AUC ve PR-AUC metriklerini pratik örneklerle karşılaştıran; yanlış metrik seçiminin model kararlarını nasıl bozduğunu anlatan rehber."
---

# ML Projelerinde Doğru Metrik Nasıl Seçilir?

Bir makine öğrenimi projesinde model seçimi kadar metrik seçimi de önemlidir. Hatta çoğu projede asıl karar metrikte saklıdır. Yanlış metriği optimize edersen model teknik olarak iyi görünür ama gerçek problemi çözmez.

En basit örnek accuracy'dir. Bir sınıflandırma modeli %95 accuracy alıyorsa kulağa güçlü gelir. Ama veri setindeki örneklerin %95'i zaten negatif sınıftaysa, hiçbir şey öğrenmeyen ve herkese "negatif" diyen model de %95 accuracy alır. Skor iyi görünür; ürün, analiz veya karar sistemi kötü çalışır.

Bu yazıda sınıflandırma problemlerinde metrik seçimini pratik taraftan anlatıyorum. Amaç formül ezberlemek değil, hangi durumda hangi metriğin yanıltabileceğini anlamak.

## Problem metriği belirler

Metrik seçmeden önce şu soruyu netleştirmek gerekir: Model hata yaptığında ne olur?

Spam filtresi düşünelim. Model normal bir e-postayı spam sanarsa kullanıcı önemli bir mesajı kaçırabilir. Bu ciddi bir hatadır. Ama spam e-postayı normal sanarsa gelen kutusu kirlenir, yine kötü ama etkisi farklıdır.

Sağlık alanında hastalık tahmini yapıyorsan, hasta bir kişiye "sağlıklı" demek çok daha pahalı olabilir. Bir dolandırıcılık tespit sisteminde ise her şüpheli işlemi engellemek müşteri deneyimini bozar. Yani hata türleri aynı ağırlıkta değildir.

Bu yüzden metrik teknik bir detay değil, problemin maliyet modelidir.

## Confusion matrix: metriklerin başladığı yer

Binary classification için model sonuçlarını dört grupta düşünebiliriz:

| Terim | Anlam |
|---|---|
| True Positive (TP) | Pozitif olanı pozitif tahmin etti |
| True Negative (TN) | Negatif olanı negatif tahmin etti |
| False Positive (FP) | Negatif olanı pozitif tahmin etti |
| False Negative (FN) | Pozitif olanı negatif tahmin etti |

Metriklerin çoğu bu dört sayının farklı kombinasyonudur. Bu tabloyu okumadan accuracy, precision veya recall yorumlamak kolayca yanlış sonuca götürür.

Örneğin kanser taraması modelinde FN, yani hasta kişiyi sağlıklı tahmin etmek çok pahalıdır. Spam filtresinde FP, yani normal e-postayı spam yapmak daha rahatsız edici olabilir. Fraud detection tarafında ise FP ve FN maliyetleri iş kurallarına göre değişir.

## Accuracy ne zaman işe yarar?

Accuracy, doğru tahminlerin tüm tahminlere oranıdır.

```text
accuracy = (TP + TN) / (TP + TN + FP + FN)
```

Sınıflar dengeliyse ve hata türleri benzer maliyetteyse accuracy iyi bir başlangıç metriğidir. Örneğin iki sınıflı, dengeli bir görsel sınıflandırma probleminde accuracy hızlı fikir verebilir.

Ama sınıf dağılımı bozuksa accuracy tehlikelidir.

Diyelim 10.000 işlem var. Bunların 9.900'ü normal, 100'ü dolandırıcılık. Model her işleme "normal" derse:

- 9.900 doğru tahmin yapar.
- 100 dolandırıcılığı kaçırır.
- Accuracy %99 olur.

Bu model iş açısından işe yaramaz. Çünkü yakalaması gereken sınıfı hiç yakalamamıştır.

Bu yüzden dengesiz veri setlerinde accuracy tek başına raporlanmamalıdır. Yanına en azından precision, recall, F1 ve confusion matrix eklenmelidir.

## Precision: pozitif dediğinde ne kadar haklısın?

Precision, modelin pozitif tahminlerinin ne kadarının gerçekten pozitif olduğunu söyler.

```text
precision = TP / (TP + FP)
```

Precision şu soruya cevap verir: Model "evet" dediğinde ona ne kadar güvenebiliriz?

Örneğin bir sistem "bu işlem dolandırıcılık" dediğinde gerçekten dolandırıcılık çıkma oranı precision'dır. Eğer precision düşükse sistem çok fazla false alarm üretiyordur.

Precision'ın önemli olduğu durumlar:

- Yanlış alarm maliyetliyse.
- Pozitif tahmin sonrası manuel inceleme yapılacaksa.
- Kullanıcıya doğrudan aksiyon uygulanacaksa.
- Kaynak sınırlıysa ve sadece en güvenilir pozitifleri görmek istiyorsan.

Örnek: Bir satış ekibine "bu müşteri satın almaya yakın" diye lead listesi veriyorsan precision önemlidir. Liste çok yanlışsa ekip zaman kaybeder.

Ama precision tek başına yeterli değildir. Model sadece en emin olduğu 5 pozitif örneği seçip hepsinde doğru çıkarsa precision %100 olabilir. Fakat geride 500 gerçek pozitif bırakmış olabilir.

## Recall: gerçek pozitiflerin ne kadarını yakaladın?

Recall, gerçekten pozitif olan örneklerin ne kadarının yakalandığını söyler.

```text
recall = TP / (TP + FN)
```

Recall şu soruya cevap verir: Kaçırmamamız gereken şeylerin ne kadarını yakaladık?

Recall'ın önemli olduğu durumlar:

- Pozitif sınıfı kaçırmak pahalıysa.
- Tarama, erken uyarı veya risk tespiti yapılıyorsa.
- İlk aşamada geniş aday havuzu oluşturulacaksa.

Örnek: Hastalık tarama modelinde recall genelde çok önemlidir. Çünkü hasta kişiyi kaçırmak ciddi sonuç doğurabilir. Model biraz fazla false alarm üretse bile doktor kontrolü gibi ikinci bir aşama varsa bu kabul edilebilir.

Ama recall da tek başına tehlikelidir. Model herkese "pozitif" derse gerçek pozitiflerin tamamını yakalar, recall %100 olur. Fakat false positive sayısı patlar.

## Precision ve recall dengesi

Precision ve recall çoğu zaman birbirine ters hareket eder. Karar eşiğini düşürürsen model daha çok pozitif tahmin yapar. Recall artar, çünkü daha fazla gerçek pozitifi yakalarsın. Ama false positive de artabileceği için precision düşebilir.

Karar eşiğini yükseltirsen model daha seçici davranır. Precision artabilir ama recall düşebilir.

Bu yüzden modelin verdiği olasılık skorlarını sadece `0.5` eşiğiyle kullanmak her zaman doğru değildir. Eşik seçimi iş problemine göre yapılmalıdır.

Örneğin fraud detection sisteminde ilk aşamada recall yüksek tutulabilir. Sonra şüpheli işlemler ikinci bir kuralla, insan incelemesiyle veya daha pahalı bir modelle elenebilir. Tam tersine otomatik hesap kapatma gibi sert bir aksiyon alınacaksa precision çok daha kritik hale gelir.

## F1 skoru ne zaman mantıklı?

F1, precision ve recall'ın harmonik ortalamasıdır.

```text
F1 = 2 * precision * recall / (precision + recall)
```

F1, precision ve recall arasında tek sayı isteyen durumlarda faydalıdır. Özellikle sınıflar dengesizse accuracy'ye göre daha anlamlı bir özet verebilir.

Ama F1'in de sınırı var. Precision ve recall'a eşit önem verir. Halbuki her problemde bu iki hata türü eşit maliyetli değildir.

Eğer false negative, false positive'den çok daha pahalıysa F1 yerine recall odaklı bir metrik veya F-beta skoru daha mantıklı olabilir. F-beta, recall'a veya precision'a daha fazla ağırlık vermeyi sağlar.

Pratikte F1'i şöyle kullanmak daha sağlıklı:

- İlk model karşılaştırmasında özet skor olarak bak.
- Son kararı verirken precision, recall ve confusion matrix'i ayrı ayrı incele.
- İş maliyeti eşit değilse sadece F1'e güvenme.

## ROC-AUC: sıralama kalitesine bakar

ROC eğrisi, farklı karar eşiklerinde true positive rate ve false positive rate ilişkisini gösterir. ROC-AUC ise bu eğrinin altında kalan alanı özetler.

ROC-AUC yüksekse model pozitif örnekleri negatiflerden genel olarak iyi ayırıyordur. Bu, özellikle eşik henüz belirlenmemişken yararlı olabilir.

Fakat dengesiz veri setlerinde ROC-AUC bazen fazla iyimser görünebilir. Çünkü false positive rate, negatif sınıfın tamamına göre hesaplanır. Negatif sınıf çok büyükse, gerçek hayatta can sıkacak kadar fazla false positive üretildiği halde oran küçük görünebilir.

Örneğin 1 milyon normal işlem içinde 5.000 false positive varsa operasyon ekibi için bu büyük yüktür. Ama oran olarak baktığında FPR sadece %0,5 görünür.

Bu yüzden nadir pozitif sınıflarda ROC-AUC tek başına yeterli değildir.

## PR-AUC: dengesiz sınıflarda daha açıklayıcı olabilir

Precision-Recall eğrisi, farklı eşiklerde precision ve recall ilişkisini gösterir. PR-AUC ise bu eğriyi özetler.

Pozitif sınıf azsa PR-AUC çoğu zaman ROC-AUC'den daha açıklayıcıdır. Çünkü doğrudan pozitif tahminlerin kalitesine ve gerçek pozitifleri yakalama oranına odaklanır.

Fraud detection, hastalık tarama, anomali tespiti, churn riski gibi pozitif sınıfın az olduğu problemlerde PR eğrisine bakmak iyi alışkanlıktır.

Basit kural:

- Sınıflar dengeli ve genel ayırma gücünü görmek istiyorsan ROC-AUC işe yarar.
- Pozitif sınıf nadirse ve pozitif tahminlerin kalitesi önemliyse PR-AUC daha anlamlıdır.

## Regression problemlerinde kısa not

Bu yazı ağırlıklı olarak sınıflandırmaya odaklandı ama regresyon tarafında da aynı mantık geçerlidir: Metrik, problemin hata maliyetine uymalıdır.

MAE, hataların mutlak ortalamasını verir. Aykırı değerlerden MSE veya RMSE kadar etkilenmez. Ev fiyatı tahmini gibi yorumlanabilirlik istediğin durumlarda MAE daha anlaşılır olabilir.

RMSE büyük hataları daha fazla cezalandırır. Büyük sapmalar gerçekten pahalıysa RMSE daha uygun olabilir.

R² ise modelin varyansı ne kadar açıkladığını gösterir ama tek başına iş hatasını anlatmaz. Bir modelin R² skoru yüksek olabilir, fakat belirli fiyat aralıklarında sistematik hata yapıyor olabilir.

Regresyonda da artık hatalara grafikle bakmak gerekir. Sadece tek skorla model seçmek çoğu zaman eksik kalır.

## Pratik örnek: churn modeli

Bir abonelik ürününde kullanıcıların ayrılıp ayrılmayacağını tahmin eden bir model kurduğunu düşünelim. Pozitif sınıf "churn edecek" kullanıcılar olsun.

Eğer amacın müşteri başarı ekibine aranacak kullanıcı listesi vermekse precision önemlidir. Çünkü ekip sınırlı sayıda kişiyi arayabilir. Liste yanlışlarla doluysa zaman boşa gider.

Eğer amacın otomatik düşük maliyetli bir e-posta kampanyası göndermekse recall daha önemli olabilir. Çünkü yanlış kişiye e-posta gitmesinin maliyeti düşüktür, churn edecek kullanıcıyı kaçırmak daha pahalıdır.

Aynı model, aynı veri seti, aynı tahminler. Ama hedef aksiyon değiştiğinde en iyi metrik de değişir.

Bu yüzden model raporunda sadece "F1 0.78" yazmak yeterli değildir. Modelin hangi aksiyon için kullanılacağı da yazılmalıdır.

## Sık yapılan hatalar

### 1. Sadece accuracy raporlamak

Dengesiz veri setlerinde accuracy kolayca yanıltır. Confusion matrix olmadan accuracy görmek, modelin neyi doğru yaptığını anlamaya yetmez.

### 2. Test setine göre eşik ayarlamak

Karar eşiğini test setine bakarak seçmek veri sızıntısına benzer bir etki yaratır. Eşik validasyon setinde seçilmeli, test seti en son tarafsız ölçüm için kullanılmalıdır.

### 3. Cross-validation sonucunu tek sayı sanmak

Cross-validation ortalaması faydalıdır ama dağılımı da önemlidir. Bir fold çok düşük, diğerleri yüksekse veri bölünmesi veya segment farkı olabilir.

### 4. Metrik ile iş hedefini ayırmak

Model skoru yükselirken iş sonucu kötüleşebilir. Örneğin daha yüksek recall, operasyon ekibine kaldıramayacağı kadar fazla alarm üretebilir. Bu yüzden teknik metrik ile operasyon kapasitesi birlikte düşünülmelidir.

### 5. Probability calibration'a bakmamak

Bazı modellerin olasılık skorları iyi kalibre değildir. Model `0.80` diyorsa bu her zaman %80 olasılık anlamına gelmez. Karar eşiği ve risk skoru kullanılacaksa calibration kontrol edilmelidir.

## Ben nasıl raporlarım?

Bir sınıflandırma projesinde minimum rapor formatı şöyle olabilir:

- Sınıf dağılımı
- Confusion matrix
- Accuracy
- Precision
- Recall
- F1
- ROC-AUC veya PR-AUC
- Seçilen karar eşiği
- Eşik seçiminin gerekçesi
- Hata örnekleri

Dengesiz veri setinde buna PR eğrisi ve farklı eşiklerde precision/recall tablosu eklerim. Eğer model bir iş sürecine bağlanacaksa "günde kaç alarm üretir?" gibi operasyonel metrikleri de hesaplarım.

Çünkü model sadece notebook içinde yaşamaz. Bir noktada bir liste üretir, bir aksiyon tetikler, bir kullanıcıyı etkiler veya bir analistin zamanını alır. Metrik seçimi bunu hesaba katmadığında model iyi görünür ama sistem kötü çalışır.

## Kısa karar rehberi

| Durum | Öncelikli metrik |
|---|---|
| Sınıflar dengeli, hata maliyetleri benzer | Accuracy, F1 |
| Pozitif tahminlerin doğru olması kritik | Precision |
| Pozitif sınıfı kaçırmak pahalı | Recall |
| Precision ve recall dengesi isteniyor | F1 veya F-beta |
| Eşik bağımsız ayırma gücü inceleniyor | ROC-AUC |
| Pozitif sınıf nadir | PR-AUC, precision, recall |
| Büyük regresyon hataları çok pahalı | RMSE |
| Ortalama mutlak hata daha yorumlanabilir | MAE |

## Sonuç

İyi metrik, modelin gerçek kullanımına benzeyen metriktir. Accuracy bazen yeterlidir, bazen tamamen yanıltır. Precision ve recall ayrı ayrı okunmadan F1 eksik kalır. ROC-AUC ayırma gücünü gösterir ama dengesiz veri setinde PR-AUC daha dürüst olabilir.

Model değerlendirirken önce problemde hangi hatanın daha pahalı olduğunu yazmak gerekir. Sonra metrik seçilir. Tersi yapılırsa model skoru yükselir ama karar kalitesi düşebilir.

## Kaynaklar

- Scikit-learn User Guide: Classification metrics — https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics
- Scikit-learn User Guide: Precision, recall and F-measures — https://scikit-learn.org/stable/modules/model_evaluation.html#precision-recall-f-measure-metrics
- Google Machine Learning Crash Course: Classification metrics — https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall
- Fawcett, T. (2006). An introduction to ROC analysis — https://www.sciencedirect.com/science/article/pii/S016786550500303X
- Saito, T. & Rehmsmeier, M. (2015). The Precision-Recall Plot Is More Informative than the ROC Plot When Evaluating Binary Classifiers on Imbalanced Datasets — https://doi.org/10.1371/journal.pone.0118432
