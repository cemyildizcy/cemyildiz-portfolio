---
title: "Cross-validation stratejisi nasıl seçilir?"
date: "2026-09-06"
tags: ["Makine Öğrenmesi", "Cross-validation", "Scikit-learn", "Model Değerlendirme"]
readTime: "7 dk"
coverEmoji: "🧩"
description: "KFold, StratifiedKFold, GroupKFold ve TimeSeriesSplit arasında veri üretim sürecine göre seçim yapmak için pratik bir rehber."
---

Bir notebook içinde `cross_val_score(model, X, y, cv=5)` yazmak kolay. Zor olan, bu beş parçanın ölçmek istediğimiz geleceği temsil edip etmediğini anlamak.

Cross-validation modelin farklı veri parçalarında denenmesini sağlar. Bölmenin doğru olduğunu garanti etmez. Aynı hastanın kayıtları hem eğitim hem doğrulama tarafına düştüyse veya gelecek ayı tahmin ederken sonraki aylardan örnekler eğitimde kaldıysa ortalama skor temiz görünebilir. Deney yine de yanlıştır.

Ben bölme stratejisini modelden önce seçmeyi daha güvenli buluyorum. Bu karar algoritmayla değil, modelin nerede ve kimin üzerinde çalışacağıyla ilgilidir.

## Önce değerlendirme sorusunu yaz

Bir split yöntemi seçmeden önce şu cümleyi tamamla:

> Modeli bugün eğitip yarın kullandığımda, karşısına nasıl bir örnek çıkacak?

Yeni örnek mevcut veriyle aynı dağılımdan rastgele bir satır olacaksa klasik K-fold makul olabilir. Yeni bir hasta, mağaza veya kullanıcı olacaksa grupları ayırmak gerekir. Gelecekteki bir tarih tahmin edilecekse zaman sırası korunmalıdır.

Bir uyku kalitesi veri setinde her katılımcının tek kaydı varsa satır bazlı ayrım düşünülebilir. Her katılımcıdan 30 gecelik kayıt varsa rastgele split, kişiye özgü uyku düzenini iki tarafa dağıtır. Model yeni kişilere genellemek yerine eğitimde gördüğü kişileri tanıyabilir.

## KFold: bağımsız satırlar için başlangıç

`KFold`, veriyi yaklaşık eşit büyüklükte parçalara böler. Her turda bir parça doğrulama, kalanlar eğitim için kullanılır.

```python
from sklearn.model_selection import KFold, cross_validate
cv = KFold(n_splits=5, shuffle=True, random_state=42)
results = cross_validate(
    model,
    X,
    y,
    cv=cv,
    scoring=["accuracy", "f1_macro"],
    return_train_score=True,
)
```

Bu yöntem için kritik varsayım, satırların yaklaşık bağımsız ve aynı veri üretim sürecinden gelmesidir. Tablo sınıfa göre sıralanmışsa `shuffle=False` bazı doğrulama bölümlerinde tek sınıf bırakabilir. `shuffle=True` sıralama etkisini azaltır; zaman veya grup bağımlılığını çözmez.

Regresyon problemlerinde bağımsız satırlar varsa KFold çoğu zaman iyi bir başlangıçtır. Hedef dağılımı çok çarpıksa her bölümün hedef özetlerini ayrıca kontrol etmek gerekir.

## StratifiedKFold: sınıf oranını korumak için

Sınıflandırmada pozitif sınıf az olduğunda rastgele bir bölüme çok az pozitif örnek düşebilir. `StratifiedKFold`, sınıf oranlarını mümkün olduğunca korur.

```python
from sklearn.model_selection import StratifiedKFold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
```

Diyelim 1.000 örneğin 50 tanesi pozitif.

Beş bölüm kullanıldığında her doğrulama bölümünde yaklaşık 10 pozitif görmek, bazı bölümlerde 2 bazılarında 18 pozitif görmekten daha kararlı bir karşılaştırma sağlar.

Stratification veri sorununu ortadan kaldırmaz. Pozitif sınıfta yalnızca dört örnek varsa beş bölüm mantıklı değildir. Aynı kişiye ait satırları ayırmaz ve zaman sırasını korumaz. Sadece etiket dağılımına bakar.

scikit-learn dokümantasyonu stratification yöntemini istatistiksel bir çözümden çok mühendislik kolaylığı olarak tarif ediyor. Skorlar arasındaki oynaklığı azaltabilir, ancak gerçek hayattaki sınıf oranı değişimini gizleyebilir. Ortalama ile birlikte standart sapmayı ve sınıf sayılarını raporlamak bu yüzden önemlidir.

## GroupKFold: aynı varlık iki tarafa geçmemeli

Bir hastanın birden fazla muayenesi, bir müşterinin çok sayıda işlemi veya aynı maçtan üretilen birkaç satır varsa örnekler bağımsız değildir. Amaç yeni varlıklara genellemekse aynı grubu eğitim ve doğrulama tarafında tutmamalıyız.

```python
from sklearn.model_selection import GroupKFold, cross_validate
cv = GroupKFold(n_splits=5)
results = cross_validate(
    model,
    X,
    y,
    groups=patient_id,
    cv=cv,
    scoring="roc_auc",
)
```

`GroupKFold`, her grubu doğrulama setinde tam bir kez kullanır.

Beş bölüm için en az beş farklı grup gerekir. Satır sayıları gruplar arasında çok farklıysa bölüm büyüklükleri eşit olmayabilir; grupların bölünmemesi daha önceliklidir.

Sınıf oranını da olabildiğince korumak gerekiyorsa `StratifiedGroupKFold` düşünülebilir.

Bu yöntem grupları çakıştırmaz ve sınıf oranlarını birbirine yakın tutmaya çalışır. Büyük gruplar tek bir sınıfta yoğunlaşıyorsa kusursuz denge mümkün olmayabilir.

## TimeSeriesSplit: gelecek geçmişe sızmamalı

Zaman bağımlı veride rastgele split çoğu zaman fazla iyimser sonuç üretir. Eğitim seti doğrulama döneminden sonraki kayıtları içerdiğinde deney, gerçek kullanım sırasını tersine çevirir.

```python
from sklearn.model_selection import TimeSeriesSplit
cv = TimeSeriesSplit(n_splits=5, test_size=30, gap=7)
```

Bu örnekte her doğrulama bölümü 30 örnektir. Eğitim sonu ile doğrulama başlangıcı arasında 7 örneklik boşluk vardır. `gap`, gecikmeli hedeflerde veya sınır çevresindeki örneklerin birbirine çok benzediği durumlarda işe yarayabilir.

Verinin önce zamana göre sıralanması gerekir.

scikit-learn, bölüm metriklerinin karşılaştırılabilmesi için örneklerin eşit zaman aralıklarında olmasını da bekler. Günlük veri içinde uzun boşluklar varsa 30 satır her bölümde 30 gün anlamına gelmeyebilir.

Tüm geçmişin geçerli olduğu bir problemde genişleyen pencere kullanılabilir. Eski davranış artık işe yaramıyorsa `max_train_size` ile kayan pencere kurmak daha gerçekçi olabilir.

## Kısa seçim tablosu

| Veri yapısı | Uygun başlangıç | Temel kontrol |
| --- | --- | --- |
| Bağımsız regresyon satırları | `KFold` | Hedef dağılımı ve sıralama |
| Bağımsız sınıflandırma satırları | `StratifiedKFold` | Her bölümdeki sınıf sayısı |
| Aynı kişiye veya nesneye ait tekrarlar | `GroupKFold` | Train ve validation grup kesişimi |
| Grup yapısı ve dengesiz sınıflar | `StratifiedGroupKFold` | Grup çakışması ve sınıf oranı |
| Zamanla sıralı tahmin | `TimeSeriesSplit` | Eğitim tarihinin doğrulamadan önce kalması |

Bazı problemlerde grup ve zaman kısıtı birlikte bulunur. Farklı mağazaların haftalık satışlarını tahmin ederken hem geleceği eğitimde kullanmamak hem de yeni mağaza senaryosunu ayrı değerlendirmek gerekebilir. Hazır bir splitter iş kuralını karşılamıyorsa tarih ve grup indekslerini üreten özel bir doğrulama döngüsü daha dürüsttür.

## Bölme indekslerini modelden önce test et

Split nesnesi kodda hata vermeden çalışabilir ve yine de iş kuralını bozabilir. İlk test model skoru değil, indekslerin kendisi olmalı.

Grup ayrımı için:

```python
for train_idx, valid_idx in cv.split(X, y, groups):
    train_groups = set(groups.iloc[train_idx])
    valid_groups = set(groups.iloc[valid_idx])
    assert train_groups.isdisjoint(valid_groups)
```

Zaman ayrımı için:

```python
for train_idx, valid_idx in cv.split(X):
    train_end = dates.iloc[train_idx].max()
    valid_start = dates.iloc[valid_idx].min()
    assert train_end < valid_start
```

Bu kontroller birkaç satır sürer. Yanlış bir doğrulama düzeniyle yapılan saatlerce hiperparametre aramasından daha ucuzdur.

## Pipeline bölme stratejisinin yerini tutmaz

Ölçekleme, imputasyon, PCA veya özellik seçimi cross-validation dışında fit edilirse validation bilgisi eğitim sürecine karışır. Dönüşümleri ve modeli aynı `Pipeline` içinde tutmak gerekir.

Pipeline her bölümde dönüşümleri yalnızca eğitim verisinde öğrenir. Ancak aynı hastayı iki tarafa dağıtan veya geleceği eğitime alan splitter nesnesini düzeltemez. Pipeline dönüşüm sınırını, splitter örnek sınırını korur. İkisine de ihtiyaç vardır.

## Hiperparametre aramasında ikinci döngü

Aynı cross-validation skoruyla hem hiperparametre seçip hem performans raporlamak iyimser sonuç verebilir. Çok sayıda kombinasyon denendiğinde arama, doğrulama bölümlerinin rastlantılarına uyum sağlar.

Nested cross-validation bu iki işi ayırır. İç döngü hiperparametreleri seçer, dış döngü seçilen tüm süreci daha önce görülmemiş bölümde değerlendirir.

```python
from sklearn.model_selection import GridSearchCV, cross_validate
search = GridSearchCV(
    model,
    {"logisticregression__C": [0.01, 0.1, 1, 10]},
    cv=inner_cv,
    scoring="roc_auc",
)
results = cross_validate(
    search,
    X,
    y,
    cv=outer_cv,
    scoring="roc_auc",
)
```

Nested CV hesaplama maliyetini artırır. Her küçük denemede şart değildir. Model ailesi ve hiperparametreler yoğun biçimde aranıyorsa veya yayınlanacak skorun tarafsız olması gerekiyorsa güçlü bir seçenektir.

## Ortalama skoru tek başına bırakma

Beş bölüm ortalaması `0.84` olabilir. Skorlar `0.83, 0.84, 0.85, 0.84, 0.84` ise başka; `0.68, 0.79, 0.84, 0.92, 0.97` ise başka bir tablo vardır.

Her bölüm için skor, örnek sayısı, sınıf dağılımı, grup sayısı veya tarih aralığı saklanmalıdır. Kullanılan splitter parametreleri ve `random_state` değeri de deney kaydına girmelidir.

`RepeatedStratifiedKFold`, küçük veri setlerinde sonucun tek bir rastgele sıraya ne kadar bağlı olduğunu görmeye yardım edebilir. Daha fazla bölüm bağımsız yeni veri yaratmaz; yalnızca bölme kaynaklı oynaklığı daha görünür kılar.

## Kapanış

Cross-validation için evrensel bir `cv=5` reçetesi yok. Bölme yöntemi, üretimde karşılaşılacak bilinmeyen örneği taklit etmelidir.

Bağımsız satırlarda KFold veya StratifiedKFold yeterli olabilir. Tekrarlanan varlıklarda grupları ayırmak, zaman bağımlı veride geçmişten geleceğe yürümek gerekir. Bölme indekslerini doğrudan test etmek deneyin varsayımlarını görünür kılar. Model skoru ancak bu sınırlar doğruysa anlam taşır.

## Kaynaklar

1. [scikit-learn: Cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html)
2. [scikit-learn: GroupKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html)
3. [scikit-learn: StratifiedGroupKFold](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.StratifiedGroupKFold.html)
4. [scikit-learn: TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)
5. [scikit-learn: Nested versus non-nested cross-validation](https://scikit-learn.org/stable/auto_examples/model_selection/plot_nested_cross_validation_iris.html)
6. [scikit-learn: Common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html)
