---
title: "Sınıflandırıcı kalibrasyonu: predict_proba çıktısı ne kadar güvenilir?"
date: "2026-09-07"
tags: ["Makine Öğrenmesi", "Model Kalibrasyonu", "Scikit-learn", "İstatistik", "Olasılık"]
readTime: "8 dk"
coverEmoji: "🎯"
description: "predict_proba çıktısının gerçek olasılığı yansıtıp yansıtmadığını anlamak, Brier skoru, güvenilirlik eğrileri ve CalibratedClassifierCV ile kalibrasyon rehberi."
---

Bir ikili sınıflandırma modelinde `model.predict_proba(X)` çağırdığımızda elimize sıfır ile bir arasında iki sütunlu bir dizi geçer. Çoğu zaman bu sayıları doğrudan olasılık olarak yorumlarız. Model bir hasta için `0.85`, şüpheli bir işlem için `0.92` ürettiğinde hastanın yüzde 85 ihtimalle risk taşıdığını ya da işlemin yüzde 92 ihtimalle sahte olduğunu varsayarız.

Bu varsayım çoğu zaman yanıltıcıdır.

Bir model çıktısının sıfır ile bir arasında yer alması veya satır toplamının bire eşit olması, onun istatistiksel anlamda bir gerçekleşme frekansı yansıttığını kanıtlamaz. Model güçlü bir ayırt etme yeteneğine (örneğin 0.90 ROC-AUC) sahip olabilir; yani pozitifleri negatiflerden kusursuz bir sırayla ayırabilir. Ancak ürettiği sayılar gerçek hayattaki oranlarla tamamen tutarsız kalabilir.

Bu yazı, sınıflandırıcı kalibrasyonunun mantığını, popüler modellerin neden kalibre olmadığını, kalibrasyonun nasıl teşhis edileceğini ve scikit-learn ile bu sapmaların nasıl düzeltileceğini anlatıyor.

## Kalibrasyonun matematiksel karşılığı

İyi kalibre edilmiş bir modelden ne bekleriz?

Modelin tahmin ettiği pozitif sınıf olasılığını `p_hat` ve gerçek ikili etiketi `y in {0, 1}` ile gösterelim. İdeal kalibrasyon koşulu şudur:

P(y = 1 | p_hat = p) = p

Bu eşitliğin pratik karşılığı basittir: Modelin `%80` olasılık atadığı tüm durumları bir araya getirdiğimizde, bu durumların tam olarak yüzde 80'i pozitif sonuçlanmalıdır. Benzer biçimde `%10` dediği durumların onda biri, `%50` dediği durumların tam yarısı pozitif çıkmalıdır.

Bir spor müsabakası simülatöründe veya kredi riski değerlendirmesinde bu ayrım belirleyicidir. Model bir takımın maçı kazanma ihtimaline yüzde 70 diyorsa, o profildeki 100 maçın yaklaşık 70'i kazanılmalıdır. Model yalnızca sıralamayı doğru yapıp tüm olasılıkları 0.45 ile 0.55 arasına sıkıştırırsa veya her tahminde 0.01 ve 0.99 gibi uçlara savrulursa, olasılığa dayalı karar mekanizması işlevini yitirir.

## Ayırt edicilik ve kalibrasyon aynı şey değildir

Model değerlendirmede iki temel boyutu ayırmak gerekir:

- **Ayırt edicilik (Discrimination / Ranking):** Model pozitif örnekleri negatif örneklerin üzerine yerleştirebiliyor mu? ROC-AUC ve ortalama kesinlik (PR-AUC) bunu ölçer.
- **Kalibrasyon (Reliability):** Modelin ürettiği olasılık değeri gerçek dünyadaki frekansa uyuyor mu? Brier skoru ve güvenilirlik diyagramları bunu ölçer.

Bir modelin ROC-AUC skoru 1.00 olabilir ama kalibrasyonu tamamen bozuk kalabilir. Gerçek etiketleri pozitif olan tüm örneklere `0.51`, negatif olanlara `0.49` skoru atayan bir model düşünün. Sıralama kusursuzdur, ROC-AUC 1.00 çıkar. Ancak karar eşiğini 0.80 seçtiğiniz anda sistem tek bir pozitif bile yakalayamaz. Çünkü modelin olasılık skalası gerçek dünyadan kopmuştur.

## Popüler modeller neden kalibrasyon hatası yapar?

Her makine öğrenmesi algoritmasının optimize ettiği amaç fonksiyonu ve mimarisi farklıdır. Bu nedenle modeller karakteristik sapmalar gösterir:

### Lojistik regresyon
Lojistik regresyon doğrudan log-loss (cross-entropy) optimize ettiği ve sigmoid fonksiyonu üzerinden olasılık modellediği için eğitim dağılımında genellikle en iyi kalibre olan modellerden biridir. Veride aşırı çokludoğrusallık (multicollinearity) veya aşırı sert bir regülarizasyon cezası yoksa olasılıkları doğaldır.

### Random Forest ve Bagging
Random Forest, birden çok karar ağacının tahminlerinin basit ortalamasını alır. Tek bir ağacın yaprağında aşırı olasılıklar (0 ya da 1) çıksa bile, yüzlerce ağacın ortalaması alındığında tahminler merkeze (0.50 çevresine) doğru çekilir. Bu nedenle Random Forest tahminleri uç noktalardan kaçınır; aşırı temkinli davranır. Güvenilirlik grafiğinde ters-S şeklinde bir bozulma görülür.

### Boosting modelleri (Gradient Boosting, AdaBoost)
Boosting yöntemleri sınır bölgelerindeki zor örneklere odaklanır ve marjini maksimize etmeye çalışır. Ağaçlar ardışık eğitilirken logit değerleri hızla büyür. Bu durum tahminlerin 0 ve 1 uçlarına aşırı yığılmasına yol açar. Model yüzde 98 emin olduğunu söylerken o dilimdeki gerçek pozitif oranı yüzde 75 kalabilir. Boosting modelleri sıklıkla aşırı özgüvenli olur ve S-şekilli bir distorsiyon üretir.

### Naive Bayes
Naive Bayes özniteliklerin birbirinden koşullu bağımsız olduğunu varsayar. Gerçekte birbiriyle ilişkili olan öznitelikler aynı yönde sinyal verdiğinde, bağımsızlık varsayımı olasılıkları çarpım yoluyla aşırı biçimde 0 veya 1 uçlarına fırlatır.

### Destek vektör makineleri (SVM)
Klasik SVM bir olasılık modeli değildir; örneklerin ayırıcı hiperdüzleme olan işaretli geometrik mesafesini hesaplar. `predict_proba` çağrıldığında scikit-learn bu mesafelere arka planda Platt dönüşümü uygular.

## Kalibrasyon nasıl teşhis edilir?

Bir modelin kalibrasyonunu iki temel araçla inceleriz: güvenilirlik diyagramı (calibration curve) ve Brier skoru.

### Güvenilirlik diyagramı (Calibration curve)
Tahmin edilen olasılıklar örneğin 10 eşit aralığa bölünür: `[0.0 - 0.1]`, `[0.1 - 0.2]` gibi. Her aralık için iki değer hesaplanır:
- O aralıktaki tahminlerin ortalama olasılığı (x ekseni).
- O aralıktaki gerçek pozitiflerin oranı (y ekseni).

Kusursuz kalibre bir modelde noktalar tam olarak köşegen (`y = x`) doğrusu üzerinde dizilir. Eğri doğrunun altındaysa model aşırı özgüvenlidir (tahmin ettiğinden daha az pozitif var). Eğri doğrunun üstündeyse model temkinlidir (tahmin ettiğinden daha fazla pozitif var).

```python
from sklearn.calibration import calibration_curve

prob_pos = model.predict_proba(X_test)[:, 1]
fraction_of_positives, mean_predicted_value = calibration_curve(
    y_test,
    prob_pos,
    n_bins=10,
    strategy="uniform",
)
```

### Brier skoru
Glenn W. Brier tarafından 1950 yılında önerilen Brier skoru, tahmin edilen olasılık ile gerçek ikili etiket arasındaki ortalama kare hatadır:

BS = (1 / N) * sum((p_i - y_i) ** 2)

Brier skoru 0.0 ile 1.0 arasındadır; 0.0 kusursuz tahmini gösterir. Yüzde 50 pozitif oranına sahip dengeli bir veri kümesinde her örneğe 0.50 tahmini yapan bilgisiz bir modelin Brier skoru 0.25 çıkar. 0.25 üzeri skorlar, modelin rastgele tahminden daha kötü olasılık ürettiğini gösterir.

Brier skoru `proper scoring rule` niteliğindedir; bu skoru minimize etmenin tek yolu gerçek olasılığı tahmin etmektir.

```python
from sklearn.metrics import brier_score_loss

brier = brier_score_loss(y_test, prob_pos)
```

## Kalibrasyon yöntemleri: Platt Scaling ve Isotonic Regression

Bozulmuş olasılıkları düzeltmek için modelin çıktıları üzerine tek değişkenli ikinci bir dönüştürücü oturtulur:

### 1. Platt Scaling (Sigmoid yöntemi)
John Platt tarafından SVM çıktıları için önerilen bu yöntem, sınıflandırıcı skorunu tek değişkenli bir lojistik regresyona sokar:

P(y = 1 | s) = 1 / (1 + exp(A * s + B))

Burada A ve B parametreleri log-loss minimize edilerek öğrenilir. Yalnızca iki parametre öğrenildiği için küçük veri kümelerinde bile kararlıdır ve aşırı öğrenme (overfitting) riski düşüktür. S-şekilli bozulmaları düzeltmede etkilidir. Bozulma S-biçimli değilse yetersiz kalır.

### 2. İzotonik regresyon (Isotonic regression)
İzotonik regresyon, sıralamayı koruyan (monoton artan) serbest parçalı sabit bir fonksiyon uydurur. Parametrik değildir; her türlü monoton bozulmayı düzeltebilir. Ancak serbestlik derecesi yüksek olduğu için küçük veri setlerinde (özellikle 1.000 örnekten az doğrulama verisinde) aşırı öğrenmeye yatkındır.

## Karşılaştırma tablosu

| Model türü | Tipik bozulma | Önerilen kalibrasyon | Asgari doğrulama boyutu | Temel risk |
| --- | --- | --- | --- | --- |
| Lojistik regresyon | Genelde yok veya hafif | Ham model | Yok | Kalibrasyon varyansı gereksiz artırabilir |
| Random Forest | Ters-S (uçlardan kaçınma) | İzotonik veya Sigmoid | 1000+ örnek | Küçük veride izotonik basamak hatası |
| Gradient Boosting | S-şekilli (aşırı özgüven) | Sigmoid (Platt) | 500+ örnek | Aşırı düzleştirme ile sıralama kaybı |
| Naive Bayes | Uçlara sert savrulma | İzotonik regresyon | 1500+ örnek | Küçük veride aşırı uyum |
| Destek Vektör Makineleri | Geometrik mesafe orantısızlığı | Sigmoid (Platt) | 300+ örnek | Aykırı mesafelerde kalibrasyon sapması |

## scikit-learn ile CalibratedClassifierCV

scikit-learn kütüphanesindeki `CalibratedClassifierCV` sınıfı bu işlemi otomatikleştirir. En kritik kural şudur: **Kalibrasyon modeli, temel modelin eğitildiği veri üzerinde eğitilmemelidir.** Model kendi eğitim verisinde zaten yüksek skor aldığı için aynı veride kalibre edilirse aşırı özgüvenli kalmaya devam eder.

### Çapraz doğrulama ile kalibrasyon (Önerilen)
Temel model k-fold mantığıyla eğitilir, her katlamanın doğrulama tahminleri üzerinde kalibratör öğrenilir ve tahmin anında modellerin ortalaması alınır:

```python
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier

base_model = HistGradientBoostingClassifier(random_state=42)
calibrated_model = CalibratedClassifierCV(
    estimator=base_model,
    method="sigmoid",
    cv=5,
)
calibrated_model.fit(X_train, y_train)
calibrated_probs = calibrated_model.predict_proba(X_test)[:, 1]
```

### Ayrı doğrulama kümesi ile kalibrasyon (cv="prefit")
Temel model zaten büyük bir veri kümesinde eğitilmişse ve yeniden eğitmek pahalıysa, bağımsız bir doğrulama kümesiyle kalibratör fit edilir:

```python
base_model.fit(X_train, y_train)
calibrated_model = CalibratedClassifierCV(
    estimator=base_model,
    method="isotonic",
    cv="prefit",
)
calibrated_model.fit(X_val, y_val)
calibrated_probs = calibrated_model.predict_proba(X_test)[:, 1]
```

## Hangi durumlarda kalibrasyon gerekir?

Her projede kalibrasyon katmanı kurmak gerekmez. İhtiyaç kullanım senaryosuna göre belirlenir:

- **Sadece sıralama gerekiyorsa:** Arama motorunda en alakalı 10 sonucu göstermek veya pazarlamada en yüksek skorlu 500 kullanıcıya ulaşmak istiyorsanız sıralama yeterlidir. ROC-AUC veya Precision@K optimize edilir; kalibrasyon sıralamayı değiştirmez.
- **Karar eşiği maliyete göre hesaplanıyorsa:** Yanlış pozitif ve yanlış negatif maliyetleri birbirinden çok farklıysa ve optimal eşik değeri Bayes karar kuralıyla belirleniyorsa, olasılıkların doğruluğu şarttır.
- **Olasılık doğrudan ürün çıktısıysa:** Kredi temerrüt olasılığı, hastalık riski skoru veya maç simülasyonu gibi senaryolarda son kullanıcıya sunulan değer olasılıktır. Yanlış kalibre edilmiş bir model, gerçekte yüzde 60 olan riski yüzde 95 göstererek yanlış aksiyon alınmasına yol açar.

## Kapanış

`predict_proba` bir fonksiyon çağrısıdır; istatistiksel bir teminat değildir.

Bir modelin ROC-AUC skorunun yüksek olması, ürettiği olasılıkların gerçek dünyadaki gerçekleşme sıklığına uyduğunu göstermez. Model değerlendirirken yalnızca sıralama metriklerine değil, Brier skoruna ve güvenilirlik eğrisine bakmak bu kör noktayı görünür kılar.

Doğrulama veriniz kısıtlıysa sigmoid (Platt scaling) daha güvenli bir başlangıçtır; elinizde yeterli veri ve karmaşık bir sapma varsa izotonik regresyon tercih edilebilir. Ancak her koşulda kalibrasyon katmanı bağımsız bir veri üzerinde fit edilmelidir. Olasılığa dayalı kararlar alıyorsanız, önce modelinizin olasılıklarının ne kadar dürüst olduğunu ölçün.

## Kaynaklar

1. [scikit-learn: Probability calibration](https://scikit-learn.org/stable/modules/calibration.html)
2. [scikit-learn: CalibratedClassifierCV](https://scikit-learn.org/stable/modules/generated/sklearn.calibration.CalibratedClassifierCV.html)
3. [scikit-learn: calibration_curve](https://scikit-learn.org/stable/modules/generated/sklearn.calibration.calibration_curve.html)
4. [scikit-learn: brier_score_loss](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.brier_score_loss.html)
5. [Niculescu-Mizil & Caruana (2005): Predicting Good Probabilities With Supervised Learning](https://www.cs.cornell.edu/~alexn/papers/calibration.icml05.crc.rev3.pdf)
6. [Guo et al. (2017): On Calibration of Modern Neural Networks](https://arxiv.org/abs/1706.04599)
