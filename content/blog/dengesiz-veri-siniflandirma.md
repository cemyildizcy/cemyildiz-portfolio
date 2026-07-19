---
title: "Dengesiz Veriyle Sınıflandırma: Accuracy Tuzağından Doğru Değerlendirmeye"
date: "2026-07-19"
tags: ["Makine Öğrenmesi", "Sınıflandırma", "Imbalanced Learning", "Scikit-learn", "SMOTE"]
readTime: "15 dk"
coverEmoji: "⚖️"
description: "Sınıf dengesizliğini doğru bölme, uygun metrikler, class weight, örnekleme ve veri sızıntısını önleyen pipeline ile ele alan uygulamalı rehber."
---

Bir sahtekârlık veri kümesinde işlemlerin yalnızca %1'i şüpheli olsun. Her işleme "normal" diyen bir model %99 accuracy elde eder. Kâğıt üzerinde güçlü görünen bu model, çözmesi gereken vakaların tamamını kaçırır.

Sorun yalnızca accuracy metriği değildir. Veri bölme biçimi, karar eşiği, yeniden örnekleme yöntemi ve model çıktısının kullanım amacı birlikte düşünülmelidir. Aksi hâlde yüksek bir skor, işe yaramayan bir sistemi gizleyebilir.

Bu yazıda ikili sınıflandırma üzerinden ilerleyeceğiz. Yaklaşım; arıza tespiti, hastalık taraması, müşteri kaybı ve sahtekârlık analizi gibi azınlık sınıfının önemli olduğu problemlere uyarlanabilir.

## Problem

Sınıf dengesizliği, hedef değişkenin sınıfları arasında belirgin örnek sayısı farkı bulunmasıdır. Örneğin:

| Sınıf | Örnek sayısı | Oran |
|---|---:|---:|
| Normal işlem | 99.000 | %99 |
| Şüpheli işlem | 1.000 | %1 |

Bu dağılım tek başına verinin hatalı olduğu anlamına gelmez. Gerçek dünyada bazı olaylar gerçekten seyrektir. Asıl soru şudur: Model, iş hedefi açısından önemli olan azınlık sınıfını öğrenebiliyor mu?

Bir sınıflandırıcının sonuçlarını confusion matrix ile ayırabiliriz:

- True positive (TP): Şüpheli işlem doğru yakalandı.
- False positive (FP): Normal işlem yanlış alarm üretti.
- False negative (FN): Şüpheli işlem kaçırıldı.
- True negative (TN): Normal işlem doğru elendi.

Accuracy, doğru tahminlerin tüm tahminlere oranıdır:

```text
accuracy = (TP + TN) / (TP + TN + FP + FN)
```

Çoğunluk sınıfı çok büyükse TN sayısı diğer hücreleri bastırır. Bu yüzden accuracy tek başına operasyonel kaliteyi göstermez.

## Temel sezgi

Dengesiz sınıflandırmada tek bir "en iyi metrik" yoktur. Hata türlerinin maliyeti seçimi belirler.

### Precision: Üretilen alarmların ne kadarı doğru?

```text
precision = TP / (TP + FP)
```

İncelenecek her alarm zaman veya para tüketiyorsa precision önem kazanır. Precision düşük olduğunda ekip çok sayıda yanlış alarmı kontrol eder.

### Recall: Gerçek pozitiflerin ne kadarı yakalandı?

```text
recall = TP / (TP + FN)
```

Bir pozitif vakayı kaçırmanın maliyeti yüksekse recall öne çıkar. Hastalık taramasında veya kritik arıza tespitinde false negative ciddi sonuç doğurabilir.

### F1 skoru: Precision ile recall arasında denge

```text
F1 = 2 × (precision × recall) / (precision + recall)
```

F1, iki metriğin harmonik ortalamasıdır. Her ikisini tek sayıda özetler fakat iş maliyetlerini açıkça içermez. Recall'ın precision'dan iki kat önemli olduğu bir problemde F2 gibi ağırlıklı bir ölçü daha uygun olabilir.

### PR-AUC ve ROC-AUC aynı şeyi anlatmaz

ROC eğrisi true positive rate ile false positive rate arasındaki ilişkiyi gösterir. PR eğrisi ise precision ile recall'u karşılaştırır. Azınlık sınıfı çok seyrek olduğunda çok sayıdaki true negative, ROC-AUC değerinin iyimser görünmesine yol açabilir. Bu durumda precision-recall eğrisi ve Average Precision daha açıklayıcıdır.

Örneğin 100.000 işlemin 500'ü pozitif olsun. Model 400 pozitif yakalarken 2.000 yanlış alarm üretirse recall %80'dir; precision ise yalnızca yaklaşık %16,7'dir. ROC tarafındaki false positive rate yaklaşık %2 görünür. Operasyon ekibi açısından asıl sorun, 2.400 alarmın 2.000'inin yanlış olmasıdır. PR metrikleri bunu doğrudan görünür kılar.

### Karar eşiği modelden ayrı bir tercihtir

`predict_proba` kullanan ikili sınıflandırıcılarda varsayılan eşik çoğunlukla 0,5'tir. Bu değer evrensel bir kural değildir. Eşiği düşürmek genellikle daha fazla pozitif yakalar; aynı anda yanlış alarm sayısını da artırır.

Doğru eşik şu kısıtlarla seçilebilir:

- En az %90 recall sağlarken en yüksek precision,
- Günlük en fazla 200 alarm üretirken en fazla pozitif vaka,
- FP ve FN maliyetlerinin toplamını en aza indiren nokta.

Eşiği test setinde seçmek test sonucuna bilgi sızdırır. Eşik validation verisinde belirlenmeli, nihai performans daha önce görülmemiş test setinde bir kez ölçülmelidir.

## Önce doğru veri bölme

Dengesiz veride rastgele bölme, özellikle az sayıda pozitif örnek varsa validation veya test setinde temsil sorununa yol açabilir. `train_test_split(..., stratify=y)` her parçadaki sınıf oranını yaklaşık olarak korur. Çapraz doğrulamada `StratifiedKFold` aynı fikri fold düzeyinde uygular.

Zaman bağımlı veride stratification tek başına doğru değildir. Gelecekten geçmişe veri taşımamak için zaman sıralı bölme gerekir. Örneğin model ocak-haziran verisiyle eğitilip temmuz verisiyle doğrulanabilir. Aynı müşteri, cihaz veya hastaya ait kayıtlar varsa grup bazlı bölme de düşünülmelidir. Aksi hâlde aynı varlığın çok benzer kayıtları hem eğitim hem test tarafına düşebilir.

## Çözüm seçenekleri

### 1. Class weight ile hatanın maliyetini değiştir

Birçok scikit-learn modeli `class_weight` parametresini destekler. `class_weight="balanced"`, sınıf ağırlıklarını frekanslarla ters orantılı hesaplar. Azınlık sınıfındaki hatalar eğitim kaybında daha pahalı hâle gelir.

```python
from sklearn.linear_model import LogisticRegression

model = LogisticRegression(
    class_weight="balanced",
    max_iter=1000,
    random_state=42,
)
```

Bu yaklaşım yeni sentetik veri üretmez. Güçlü bir başlangıç çizgisidir; özellikle lojistik regresyon, karar ağacı ve bazı boosting yöntemlerinde ilk denenmesi gereken seçeneklerden biridir. Yine de olasılıkların kalibrasyonunu değiştirebilir. Çıktı olasılık olarak kullanılacaksa calibration eğrisi ve Brier skoru ayrıca incelenmelidir.

### 2. Random undersampling ile çoğunluk sınıfını küçült

Undersampling, çoğunluk sınıfından örnek çıkarır. Eğitim süresini azaltabilir ve modelin azınlık sınıfına daha fazla dikkat etmesini sağlayabilir. Bedeli, faydalı örneklerin kaybedilmesidir.

Çoğunluk sınıfında milyonlarca birbirine benzeyen kayıt varsa mantıklı olabilir. Küçük veri kümelerinde agresif undersampling karar sınırını zayıflatabilir. Örnekleme oranı çapraz doğrulamayla seçilmelidir.

### 3. Random oversampling ile azınlık örneklerini çoğalt

Random oversampling, azınlık örneklerini tekrar seçerek eğitim setini dengeler. Uygulaması basittir fakat aynı örneklerin tekrarlanması overfitting riskini artırabilir.

### 4. SMOTE ile sentetik örnek üret

SMOTE, azınlık sınıfındaki komşu noktalar arasında yeni örnekler oluşturur. Amaç, mevcut satırları yalnızca kopyalamak yerine özellik uzayındaki boşlukları doldurmaktır.

SMOTE her veri türüne uygun değildir. Kategorik sütunlar doğrudan sayısal kodlanıp standart SMOTE'a verilirse anlamsız ara değerler oluşabilir. Gürültülü veya birbiriyle örtüşen sınıflarda sentetik noktalar yanlış bölgeye düşebilir. Yüksek boyutlu uzayda komşuluk kavramı da zayıflar. Bu nedenle SMOTE otomatik bir iyileştirme değil, validation sonucuyla sınanacak bir hiperparametredir.

## Pratik örnek

Aşağıdaki örnek sentetik bir dengesiz veri kümesi oluşturur. Lojistik regresyonu önce ağırlıksız, sonra class weight ile değerlendirir. Son bölümde SMOTE'u veri sızıntısı oluşturmadan pipeline içine alır.

### Baseline ve ağırlıklı model

```python
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    average_precision_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = make_classification(
    n_samples=20_000,
    n_features=20,
    n_informative=8,
    n_redundant=4,
    weights=[0.98, 0.02],
    class_sep=1.0,
    flip_y=0.01,
    random_state=42,
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42,
)

baseline = Pipeline([
    ("scale", StandardScaler()),
    ("model", LogisticRegression(max_iter=1000, random_state=42)),
])

weighted = Pipeline([
    ("scale", StandardScaler()),
    ("model", LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42,
    )),
])

for name, model in [("baseline", baseline), ("weighted", weighted)]:
    model.fit(X_train, y_train)
    probability = model.predict_proba(X_test)[:, 1]
    prediction = model.predict(X_test)

    print(name)
    print(confusion_matrix(y_test, prediction))
    print(classification_report(y_test, prediction, digits=3))
    print("Average Precision:", average_precision_score(y_test, probability))
```

Bu karşılaştırmada yalnızca accuracy değerine bakmak yerine pozitif sınıfın precision, recall ve F1 değerlerini incelemek gerekir. Average Precision, tüm eşiklerdeki precision-recall davranışını özetler. Ağırlıklı modelin recall'u artarken precision'ı düşebilir; bu tek başına kötü sonuç değildir. Kabul edilebilir denge iş maliyetine bağlıdır.

### SMOTE'u pipeline içinde kullanmak

`imbalanced-learn` paketindeki `Pipeline`, örnekleme adımını yalnızca eğitim sırasında uygular:

```python
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.model_selection import StratifiedKFold, cross_validate

smote_model = ImbPipeline([
    ("scale", StandardScaler()),
    ("smote", SMOTE(random_state=42)),
    ("model", LogisticRegression(max_iter=1000, random_state=42)),
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_validate(
    smote_model,
    X_train,
    y_train,
    cv=cv,
    scoring={
        "ap": "average_precision",
        "roc_auc": "roc_auc",
        "f1": "f1",
        "recall": "recall",
        "precision": "precision",
    },
    n_jobs=-1,
)

for metric in scores:
    if metric.startswith("test_"):
        print(metric, scores[metric].mean(), scores[metric].std())
```

Pipeline burada kritik bir görev üstlenir. Her fold için scaler ve SMOTE yalnızca o fold'un eğitim bölümüne fit edilir. Validation bölümü sentetik örnek üretiminde kullanılmaz.

### Validation setinde eşik seçmek

Örneğin hedefimiz en az %85 recall olsun. Bu koşulu sağlayan noktalar arasından en yüksek precision değerini seçebiliriz:

```python
import numpy as np
from sklearn.metrics import precision_recall_curve

X_fit, X_valid, y_fit, y_valid = train_test_split(
    X_train,
    y_train,
    test_size=0.25,
    stratify=y_train,
    random_state=42,
)

weighted.fit(X_fit, y_fit)
valid_probability = weighted.predict_proba(X_valid)[:, 1]

precision, recall, thresholds = precision_recall_curve(
    y_valid,
    valid_probability,
)

# thresholds dizisi, precision ve recall dizilerinden bir eleman kısadır.
valid_positions = np.where(recall[:-1] >= 0.85)[0]
best_position = valid_positions[np.argmax(precision[:-1][valid_positions])]
best_threshold = thresholds[best_position]

print("Seçilen eşik:", best_threshold)
print("Validation precision:", precision[best_position])
print("Validation recall:", recall[best_position])

test_probability = weighted.predict_proba(X_test)[:, 1]
test_prediction = (test_probability >= best_threshold).astype(int)
print(confusion_matrix(y_test, test_prediction))
print(classification_report(y_test, test_prediction, digits=3))
```

Burada test seti yalnızca son ölçümde kullanılır. Gerçek projede eşik seçimini iş kısıtlarıyla birleştirmek daha anlamlıdır. Bir alarmı incelemek 3 dakika sürüyorsa günlük ekip kapasitesi doğrudan eşik seçimine girdi olur.

## Olasılık kalibrasyonu neden önemli?

Sıralama kalitesi ile olasılık kalitesi farklıdır. Model pozitif vakaları üst sıralara taşıyabilir; yine de verdiği `0.80` değerinin gerçekten yaklaşık %80 gerçekleşme oranına karşılık gelmesi gerekmez.

Olasılık doğrudan fiyatlama, risk skoru veya beklenen maliyet hesabında kullanılacaksa calibration curve incelenmelidir. `CalibratedClassifierCV`, sigmoid veya isotonic yöntemleriyle kalibrasyon yapabilir. Kalibrasyonun da eğitim verisinden ayrı fold'larda öğrenilmesi gerekir. scikit-learn bu ayrımı çapraz doğrulama yoluyla destekler.

Yeniden örnekleme, modelin eğitim sırasında gördüğü sınıf öncüllerini değiştirir. Bu yüzden oversampling sonrasında çıkan ham olasılıkları gerçek dünyadaki olay oranı gibi yorumlamak risklidir. Sınıflandırma metriği iyileşse bile kalibrasyon bozulabilir.

## Sık yapılan hatalar

### Tüm veriye SMOTE uygulayıp sonra bölmek

En ciddi hata budur. Sentetik örnekler testteki noktaların komşuluk bilgisini taşıyabilir. Model, değerlendirme verisinden dolaylı biçimde bilgi alır ve skor yapay olarak yükselir.

Doğru sıra şöyledir:

1. Veriyi train ve test olarak ayır.
2. Ön işleme ile örneklemeyi yalnızca train tarafında fit et.
3. Çapraz doğrulamada tüm adımları pipeline içinde çalıştır.
4. Test setinin doğal sınıf dağılımını koru.

### Test setini dengelemek

Test seti üretimde karşılaşılacak dağılımı temsil etmelidir. Testi %50-%50 yapmak, precision ve alarm hacmi gibi dağılıma duyarlı sonuçları gerçeklikten koparır. Ayrı bir dengeli teşhis seti kullanılabilir; ancak nihai raporda doğal dağılımlı test sonucu bulunmalıdır.

### Accuracy'yi ana başarı ölçütü yapmak

Accuracy rapordan tamamen çıkarılmak zorunda değildir. Confusion matrix, pozitif sınıf precision/recall değerleri ve PR-AUC yanında ikincil bir ölçü olarak verilebilir. Tek başına model seçtirmemelidir.

### Yalnızca tek bir train-test bölmesine güvenmek

Azınlık örneği az olduğunda sonuç, hangi satırların teste düştüğüne duyarlı olur. Stratified çapraz doğrulamanın ortalamasını ve standart sapmasını raporlamak daha güvenilir bir karşılaştırma sağlar. Zaman veya grup bağımlılığı varsa probleme uygun splitter seçilmelidir.

### SMOTE'u varsayılan çözüm saymak

SMOTE bazen faydalıdır, bazen class weight'ten daha kötü sonuç verir. Ağırlıklı baseline, random sampling ve SMOTE aynı validation düzeninde karşılaştırılmalıdır. Model ailesi, veri boyutu ve özellik türleri sonucu değiştirir.

### Varsayılan 0,5 eşiğini sorgulamamak

Model eğitimi bittikten sonra eşik seçimi ayrı bir optimizasyon problemidir. İş kapasitesi, hata maliyetleri ve hedef recall değeri yazılı hâle getirilmeden eşik seçmek teknik skoru iş sonucuyla karıştırır.

### Veri toplama sorununu algoritmayla örtmek

Azınlık etiketlerinde sistematik hata varsa oversampling bu hatayı çoğaltır. Önce etiket kalitesi, eksik örnek grupları ve veri toplama süreci incelenmelidir. Bazen en etkili çözüm yeni bir model değil, daha güvenilir pozitif örnek toplamaktır.

## Uygulanabilir çalışma planı

Dengesiz bir sınıflandırma problemi için şu sıra pratik çalışır:

1. Sınıf sayılarını, oranları ve zaman içindeki değişimi incele.
2. Hangi hata türünün daha pahalı olduğunu iş sahibiyle tanımla.
3. Zaman, grup ve tekrar eden kayıt risklerini dikkate alan veri bölmesini kur.
4. Basit bir model ile confusion matrix, precision, recall, F1, PR-AUC ve ROC-AUC raporla.
5. `class_weight="balanced"` seçeneğini güçlü baseline olarak dene.
6. Gerekirse undersampling, oversampling ve SMOTE'u pipeline içinde karşılaştır.
7. Eşiği validation verisinde operasyonel kısıtlarla seç.
8. Doğal dağılımlı test setinde tek nihai ölçüm yap.
9. Olasılık kullanılacaksa kalibrasyonu ayrıca doğrula.
10. Canlıda sınıf oranını, skor dağılımını, alarm hacmini ve gecikmeli gerçek etiketleri izle.

Dengesiz veri problemi, veri setini mekanik biçimde %50-%50 yapmakla çözülmez. Sağlam çözüm; değerlendirme tasarımı, hata maliyeti ve veri sızıntısını önleyen eğitim akışından oluşur. Model ancak bu çerçeve kurulduktan sonra anlamlı biçimde karşılaştırılabilir.

## Kaynaklar

1. [scikit-learn: Precision, recall and F-measures](https://scikit-learn.org/stable/modules/model_evaluation.html#precision-recall-f-measure-metrics)
2. [scikit-learn API: StratifiedKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedKFold.html)
3. [imbalanced-learn API: SMOTE](https://imbalanced-learn.org/stable/references/generated/imblearn.over_sampling.SMOTE.html)
4. [imbalanced-learn: Common pitfalls and recommended practices](https://imbalanced-learn.org/stable/common_pitfalls.html)
5. [scikit-learn: Probability calibration](https://scikit-learn.org/stable/modules/calibration.html)
6. [Chawla, Bowyer, Hall ve Kegelmeyer (2002): SMOTE: Synthetic Minority Over-sampling Technique](https://www.jair.org/index.php/jair/article/view/10302)
