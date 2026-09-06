---
title: "Makine Öğrenmesinde Veri Sızıntısı: Sessizce Yanlış Sonuç Üreten Hatalar"
date: "2026-07-20"
tags: ["Makine Öğrenmesi", "Veri Sızıntısı", "Scikit-learn", "Cross Validation", "Zaman Serileri"]
readTime: "16 dk"
coverEmoji: "🚰"
description: "Train/test ayrımından zaman serilerine kadar veri sızıntısının kaynaklarını, teşhis yöntemlerini ve scikit-learn Pipeline ile güvenli model değerlendirmeyi anlatan uygulamalı rehber."
---

Bir kredi riski modeli validation setinde %94 doğruluk veriyor. Canlıya alındığında performansı hızla düşüyor. Model değişmedi, veri şeması değişmedi, dağılımda belirgin bir kayma da yok. Sorun, eğitim tablosundaki `borc_tahsil_edildi` sütununun kredi kararı verildikten sonra oluşması: model, tahmin anında bulunmayan sonucu dolaylı biçimde görmüş.

Veri sızıntısı çoğu zaman hata mesajı üretmez. Kod çalışır, metrikler yükselir, çapraz doğrulama tamamlanır. Tam da bu nedenle tehlikelidir. Modelin başarısı sanılan şey, değerlendirme sınırının yanlış kurulmasından kaynaklanabilir.

Bu yazı veri sızıntısını yalnızca "test verisini eğitimde kullanmak" şeklinde ele almıyor. Ön işleme, feature engineering, cross-validation, tekrarlanan kayıtlar ve zaman serileri üzerinden sızıntının nasıl oluştuğunu; ardından güvenli bir scikit-learn akışının nasıl kurulacağını gösteriyor.

## Problem: model hangi bilgiyi ne zaman bilebilir?

Veri sızıntısı, modelin eğitim veya değerlendirme sırasında gerçek tahmin anında erişemeyeceği bilgiden yararlanmasıdır. Bilgi doğrudan hedef sütunundan gelebilir. Test setinin istatistikleri, gelecekte oluşmuş bir kayıt veya aynı kişiye ait kopya bir satır da aynı etkiyi yaratabilir.

Bir özelliğin geçerli olup olmadığını anlamak için üç soru yeterli bir başlangıçtır:

1. Bu değer tahminin üretildiği anda mevcut mu?
2. Değer, hedef değişken veya hedef sonrası bir süreç kullanılarak mı hesaplandı?
3. Eğitim verisinin dışındaki örneklerden istatistik taşıyor mu?

Örneğin hastaneye kabul anında tekrar yatış riski tahmin ediliyorsa taburcu özeti kullanılamaz. Özet doğru ve güçlü bir sinyal olabilir; fakat tahmin anında henüz oluşmamıştır. Modelin görevi geleceği tahmin etmekken ona gelecekten bir parça vermek, problemi istemeden kolaylaştırır.

### Sızıntı ile overfitting aynı şey değildir

Overfitting durumunda model eğitim örneklerinin ayrıntılarını fazla öğrenir, yeni ama aynı süreçten gelen veriye genellemekte zorlanır. Veri sızıntısında ise değerlendirme protokolü veya özellikler modele sahip olmaması gereken bilgi verir.

İkisi benzer belirti üretebilir: eğitim ya da validation skoru yüksek, canlı performans düşük. Çözüm farklıdır. Overfitting için regularization veya daha fazla veri düşünülebilir. Sızıntıda önce veri üretim zamanı, bölme stratejisi ve dönüşüm sınırları düzeltilmelidir. Daha karmaşık bir model bu hatayı çözmez; genellikle sızan bilgiyi daha iyi kullanır.

## Temel sezgi: değerlendirme seti bağımsız kalmalı

Bir model geliştirme sürecinde test seti, gelecekte karşılaşılacak bilinmeyen verinin temsilcisidir. Eğitim setiyle öğrenilen her şey yalnızca test setine uygulanmalıdır. "Öğrenilen şey" sadece model katsayıları değildir:

- Eksik değerleri doldurmak için hesaplanan medyan,
- Standardizasyon ortalaması ve standart sapması,
- Seçilen özellikler,
- Kategori sözlüğü,
- Karar eşiği,
- Hiperparametreler.

Bu kararların test verisine bakılarak alınması, test setini geliştirme döngüsünün bir parçasına dönüştürür. Nihai skor artık görülmemiş veri performansını değil, test setine uyarlanmış sürecin performansını ölçer.

## Train/test ayrımında görülen sızıntılar

### Bölmeden önce dönüşüm uygulamak

En yaygın hata, tüm veri üzerinde `StandardScaler`, imputasyon veya özellik seçimi çalıştırıp ardından train/test ayrımı yapmaktır:

```python
# Hatalı: scaler test setinin ortalamasını ve varyansını görüyor.
X_scaled = StandardScaler().fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)
```

Burada test etiketleri doğrudan kullanılmasa bile test özelliklerinin dağılımı eğitim dönüşümüne karışır. Etki bazı veri kümelerinde küçük görünebilir. Bu, yöntemi geçerli yapmaz.

Doğru sıra önce bölmek, sonra dönüşümü yalnızca eğitim verisinde öğrenmektir:

```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

Bu yaklaşım tek bir holdout ayrımı için doğrudur. Cross-validation içinde manuel yönetildiğinde ise kolayca bozulur. Pipeline kullanmak daha güvenlidir.

### Aynı varlığın iki tarafa düşmesi

Bir müşterinin birden fazla işlemi, bir hastanın birden fazla ziyareti veya aynı görüntünün farklı kırpılmış kopyaları varsa rastgele satır bölme bağımsızlık varsayımını bozar. Model testte yeni bir varlık yerine eğitimde gördüğü varlığın yakın bir kopyasıyla karşılaşır.

Bu durumda bölme birimi satır değil, gruptur. `GroupShuffleSplit` veya `GroupKFold`, aynı gruba ait kayıtları tek tarafta tutar:

```python
from sklearn.model_selection import GroupShuffleSplit

splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_idx, test_idx = next(splitter.split(X, y, groups=customer_id))

X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
```

Grup kimliğinin özelliklerden çıkarılması da gerekir. Aksi hâlde yüksek kardinaliteli kimlik sütunu ezberlemeyi kolaylaştırabilir.

### Kopyalar ve yakın kopyalar

Tam kopyalar hash ile bulunabilir. Metin, görüntü ve ses verisinde yakın kopyalar daha zordur. Aynı belgenin küçük biçim farkları veya aynı fotoğrafın yeniden boyutlandırılmış sürümleri farklı satırlar gibi görünür. Bölme işleminden önce içerik benzerliğiyle kümelendirme, ardından grup bazlı ayırma gerekir.

## Target leakage: hedef sonucu özelliklerde saklamak

Target leakage, hedefin kendisinin veya hedef sonrası oluşan bir bilginin özelliklere taşınmasıdır. Birkaç örnek:

| Tahmin görevi | Sızdıran özellik | Neden |
|---|---|---|
| Kredi temerrüdü | Tahsilat dosyası açıldı mı? | Temerrüt sonrası oluşur |
| Müşteri kaybı | Hesap kapatma nedeni | Kayıp gerçekleştikten sonra girilir |
| Hastalık tanısı | Uygulanan tedavi kodu | Tanı kararından etkilenir |
| Teslimat gecikmesi | Gecikme tazminatı | Teslimat sonrası hesaplanır |
| Sahtekârlık tespiti | İnceleme sonucu | Hedefi üreten süreçtir |

Korelasyon tablosunda hedefle olağanüstü güçlü ilişki gösteren bir sütun şüphe uyandırmalıdır, fakat düşük korelasyon sızıntı olmadığı anlamına gelmez. Kategorik bir kod, tarih farkı veya birkaç özelliğin birleşimi hedefi taşıyabilir.

En sağlam kontrol veri sözlüğüdür. Her sütun için şu bilgiler kaydedilmelidir:

- Kaynak sistem,
- Oluşma zamanı,
- Güncellenme zamanı,
- Tahmin servisinde bulunup bulunmadığı,
- Hedef üretim süreciyle ilişkisi.

Feature engineering sırasında hedef ortalamalı kodlama kullanılıyorsa daha dikkatli olunmalıdır. Her satırın kategorisini, aynı satırın hedefini de içeren global ortalamayla kodlamak hedef bilgisini özelliğe taşır. Kodlama fold içinde öğrenilmeli veya out-of-fold değerler üretilmelidir.

## Preprocessing ve cross-validation hataları

Cross-validation, veriyi birkaç kez train ve validation fold'larına ayırır. Her turda preprocessing adımlarının yalnızca o turun train fold'unda öğrenilmesi gerekir.

Aşağıdaki akış hatalıdır:

```python
# Hatalı: feature selection tüm etiketleri görüyor.
selector = SelectKBest(k=10)
X_selected = selector.fit_transform(X, y)
scores = cross_val_score(model, X_selected, y, cv=5)
```

`SelectKBest`, hangi özelliklerin hedefle ilişkili olduğunu tüm veri üzerinde öğrenmiştir. Her validation fold'unun etiketleri özellik seçimine katılır. Doğru çözüm seçici ile modeli aynı Pipeline içine almaktır:

```python
from sklearn.feature_selection import SelectKBest
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ("selector", SelectKBest(k=10)),
    ("model", LogisticRegression(max_iter=1000)),
])

scores = cross_val_score(pipeline, X, y, cv=5, scoring="roc_auc")
```

scikit-learn her fold için Pipeline'ı yeniden fit eder. Böylece seçici yalnızca ilgili train fold'unu görür.

Aynı kural şu işlemler için de geçerlidir:

- `StandardScaler`, `MinMaxScaler` ve imputasyon,
- PCA ve diğer boyut indirgeme yöntemleri,
- Özellik seçimi,
- Oversampling ve undersampling,
- Öğrenilen kategorik kodlayıcılar.

Hiperparametre aramasında Pipeline parametreleri `adım__parametre` biçiminde verilir. `GridSearchCV`, dönüşümleri her aday ve fold için doğru sınırda öğrenir.

## Zaman serilerinde gelecek bilgisi

Zaman bağımlı problemlerde rastgele K-fold kullanmak çoğu zaman yanlıştır. Eğitim fold'u validation tarihinden sonraki kayıtları içerebilir. Model geçmişi tahmin ederken geleceği görmüş olur.

Örneğin günlük satış tahmini için 2025 kayıtlarını rastgele bölerseniz, kasım ayını tahmin eden model aralık ayındaki fiyat veya kampanya düzenini öğrenebilir. Gerçek kullanımda bu bilgi mevcut değildir.

`TimeSeriesSplit`, eğitim penceresini zaman içinde genişleterek validation bölümünü sonrasına koyar:

```python
from sklearn.model_selection import TimeSeriesSplit

cv = TimeSeriesSplit(n_splits=5, gap=7)
```

`gap=7`, train sonu ile validation başlangıcı arasında yedi örneklik boşluk bırakır. Bu seçenek, gecikmeli hedefler veya yakın zaman bağımlılığı olduğunda sınır çevresindeki bulaşmayı azaltabilir. Uygun gap değeri veri üretim sürecine göre belirlenmelidir.

### Rolling feature üretirken dikkat

Pandas'ta hareketli ortalama oluştururken mevcut satırın veya geleceğin değeri pencereye yanlışlıkla girebilir:

```python
# Hatalı olabilir: bugünün satışını bugünü tahmin eden özelliğe katıyor.
df["sales_mean_7"] = df["sales"].rolling(7).mean()

# Önce bir dönem geciktir: yalnızca geçmiş satışlar kullanılır.
df["sales_mean_7"] = df["sales"].shift(1).rolling(7).mean()
```

Veri birden fazla mağaza içeriyorsa shift ve rolling işlemleri mağaza içinde yapılmalıdır:

```python
df = df.sort_values(["store_id", "date"])
df["sales_mean_7"] = (
    df.groupby("store_id")["sales"]
      .transform(lambda s: s.shift(1).rolling(7).mean())
)
```

Bir başka risk, sonradan düzeltilmiş veriyi geçmiş tahminleri değerlendirirken kullanmaktır. Bugün sorgulanan bir müşteri kaydı, geçen yıl bilinmeyen düzeltmeleri içerebilir. Sağlam backtest için yalnızca o tarihte bilinen veri sürümünü yeniden kurmak gerekir. Bu yaklaşım point-in-time correct veri olarak anılır.

## Uygulanabilir örnek: scikit-learn Pipeline

Aşağıdaki örnek sayısal ve kategorik sütunları ayrı işler. İmputasyon, ölçekleme ve one-hot encoding yalnızca eğitim fold'larında öğrenilir. Ardından lojistik regresyon değerlendirilir.

```python
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Örnek: df içindeki hedef sütun "default" olsun.
X = df.drop(columns=["default"])
y = df["default"]

numeric_features = ["age", "income", "debt_ratio"]
categorical_features = ["job_type", "city"]

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

categorical_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore")),
])

preprocessor = ColumnTransformer([
    ("numeric", numeric_pipeline, numeric_features),
    ("categorical", categorical_pipeline, categorical_features),
])

model = Pipeline([
    ("preprocess", preprocessor),
    ("classifier", LogisticRegression(max_iter=1000)),
])

# Test setini model seçimi başlamadan ayır.
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(
    model,
    X_train,
    y_train,
    cv=cv,
    scoring="roc_auc",
)
print(f"CV ROC-AUC: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

# Model seçimi bittikten sonra tüm train verisinde fit et.
model.fit(X_train, y_train)
probabilities = model.predict_proba(X_test)[:, 1]
predictions = model.predict(X_test)

print(f"Test ROC-AUC: {roc_auc_score(y_test, probabilities):.3f}")
print(classification_report(y_test, predictions))
```

Bu kodun güvenli olmasını sağlayan noktalar şunlardır:

- Test seti model seçimi öncesinde ayrılıyor.
- İmputasyon ve ölçekleme Pipeline içinde bulunuyor.
- Cross-validation her fold için yeni bir preprocessing akışı öğreniyor.
- Bilinmeyen kategoriler `handle_unknown="ignore"` ile canlı tahminde hata üretmiyor.
- Test seti yalnızca nihai değerlendirmede kullanılıyor.

Bu örnek zaman veya grup bağımlılığı olmayan satırlar içindir. Aynı müşteriye ait kayıtlar varsa `StratifiedKFold` yerine grup uyumlu bir splitter; zaman bağımlılığı varsa `TimeSeriesSplit` seçilmelidir. Pipeline doğru dönüşüm sınırını kurar, yanlış bölme stratejisini kendiliğinden düzeltemez.

## Sızıntı nasıl teşhis edilir?

### 1. Basit bir baseline ile karşılaştır

Az veriyle olağanüstü yüksek skor, her zaman başarı değildir. Basit lojistik regresyonun karmaşık örüntü beklenen bir problemde neredeyse kusursuz sonuç vermesi özellikleri incelemek için güçlü bir gerekçedir.

### 2. Özellikleri tek tek dene

Tek bir sütun hedefi neredeyse kusursuz tahmin ediyorsa sütunun oluşma zamanını araştırın. Özellikle durum kodları, süreç sonu tarihleri, manuel inceleme alanları ve toplam tutarlar sık şüphelilerdir.

### 3. Şüpheli özellikleri çıkarıp skoru yeniden ölç

Skorun düşmesi tek başına sızıntıyı kanıtlamaz. Ancak hangi özelliğin sonucu taşıdığını gösterir. Özelliğin iş sürecindeki üretim noktası incelenmelidir.

### 4. Rastgele bölme ile zaman bazlı bölmeyi karşılaştır

Rastgele validation güçlü, ileri tarihli backtest zayıfsa gelecek bilgisi, drift veya varlık örtüşmesi araştırılmalıdır. Farkın kaynağı bulunmadan rastgele skora güvenilmemelidir.

### 5. Train ve validation varlık örtüşmesini ölç

Müşteri, cihaz, belge veya kaynak kimliklerinin iki tarafta kesişim oranını hesaplayın. Problemin amacı yeni varlıklara genellemekse bu kesişim sıfır olmalıdır.

```python
train_customers = set(train_df["customer_id"])
valid_customers = set(valid_df["customer_id"])
overlap = train_customers & valid_customers

print(f"Ortak müşteri sayısı: {len(overlap)}")
```

### 6. Shuffle testi uygula

Hedef etiketlerini rastgele karıştırıp tüm eğitim akışını yeniden çalıştırın. Skor şans seviyesine düşmelidir. Yüksek kalıyorsa hedef başka bir özellikte, dosya sıralamasında veya değerlendirme kodunda taşınıyor olabilir.

### 7. Tahmin anını yazılı hâle getir

"Model hangi anda, hangi kararı vermek için çalışıyor?" sorusuna tek cümlelik yanıt verilemiyorsa özellik uygunluğu da değerlendirilemez. Tahmin zamanı, veri cutoff'u ve hedef penceresi açıkça tanımlanmalıdır.

## Sık hatalar

### Test setini defalarca kullanmak

Her model denemesinde test skoruna bakıp en iyi modeli seçmek, test setine manuel biçimde overfit etmektir. Model ve hiperparametre seçimi train/validation veya nested cross-validation ile yapılmalıdır. Test seti süreç sonunda bir kez açılmalıdır.

### Eksik değerleri tüm veriyle doldurmak

Global medyan zararsız görünebilir. Ancak test dağılımını eğitim dönüşümüne taşır. İmputer Pipeline içinde fit edilmelidir.

### Oversampling'i bölmeden önce yapmak

SMOTE gibi yöntemler sentetik örnek üretirken komşuluk bilgisi kullanır. Tüm veri üzerinde uygulanırsa validation örnekleri sentetik train örneklerini etkileyebilir. Oversampling yalnızca train fold'unda yapılmalıdır. Bunun için scikit-learn Pipeline yerine örnekleme adımlarını destekleyen `imblearn.pipeline.Pipeline` kullanılır.

### Zaman bilgisini yalnızca özelliklerden silmek

Tarih sütununu modelden çıkarmak zaman sızıntısını engellemez. Bölme hâlâ rastgeleyse gelecekteki müşteri davranışı veya fiyat rejimi eğitim setine girebilir. Sorun sütunda değil, değerlendirme tasarımındadır.

### ID sütununu olduğu gibi modele vermek

Kimlikler hedefin üretildiği sistem veya dönem hakkında bilgi taşıyabilir. Sıralı bir başvuru numarası zamanın vekili olabilir. Yüksek kardinaliteli ID'ler genellikle özelliklerden çıkarılmalı; bölme için gerekiyorsa ayrı tutulmalıdır.

### Feature store kullanınca riskin bittiğini sanmak

Feature store tutarlılık sağlar, fakat yanlış timestamp veya join anahtarıyla gelecekteki kayıt yine bağlanabilir. Point-in-time join testleri ayrıca yazılmalıdır.

### Pipeline'ı otomatik güvenlik garantisi saymak

Pipeline preprocessing sızıntısını önlemeye yardım eder. Hedef sonrası sütunu fark etmez, kopyaları ayırmaz, yanlış cross-validation stratejisini seçmez. Veri semantiği için insan denetimi gerekir.

## Teşhis ve yayın öncesi kontrol listesi

### Tahmin tanımı

- [ ] Tahmin anı ve hedef penceresi açıkça tanımlandı.
- [ ] Her özelliğin o anda mevcut olduğu doğrulandı.
- [ ] Hedef sonrası oluşan alanlar çıkarıldı.
- [ ] Veri sözlüğünde kaynak ve timestamp bilgisi kaydedildi.

### Bölme stratejisi

- [ ] Holdout seti model geliştirmeden önce ayrıldı.
- [ ] Aynı varlık veya yakın kopyalar farklı fold'lara düşmüyor.
- [ ] Zaman bağımlı veride ileri tarihli değerlendirme kullanılıyor.
- [ ] Gerekliyse train-validation arasında gap bırakıldı.

### Dönüşümler

- [ ] İmputasyon, ölçekleme ve özellik seçimi Pipeline içinde.
- [ ] Öğrenilen her dönüşüm yalnızca train fold'unda fit ediliyor.
- [ ] Target encoding out-of-fold veya fold içi uygulanıyor.
- [ ] Sampling yalnızca eğitim bölümünde yapılıyor.

### Değerlendirme

- [ ] Hiperparametreler test setine bakılarak seçilmedi.
- [ ] Rastgele ve zaman/grup bazlı split sonuçları karşılaştırıldı.
- [ ] Shuffle testi şans seviyesine indi.
- [ ] Canlı ortamda bulunmayan özellikler inference şemasından çıkarıldı.

## Sonuç

Veri sızıntısını engellemenin merkezinde model değil, zaman ve sınır vardır: bilgi ne zaman oluştu, hangi örnekler birlikte tutulmalı, hangi işlem hangi fold'da öğrenilmeli? Bu sorular yanıtlanmadan yüksek bir validation skoru güvence sağlamaz.

Pratik başlangıç sırası nettir: tahmin anını tanımlayın, holdout setini erkenden ayırın, varlık ve zaman yapısına uygun split kullanın, öğrenilen dönüşümleri Pipeline içine alın. Son olarak hedefi karıştırma testi ve ileri tarihli backtest ile akışın gerçekten bilinmeyen veriyi ölçtüğünü kontrol edin.

## Kaynaklar

1. [scikit-learn: Common pitfalls and recommended practices, Data leakage](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage)
2. [scikit-learn: Pipelines and composite estimators](https://scikit-learn.org/stable/modules/compose.html#pipeline)
3. [scikit-learn: TimeSeriesSplit API documentation](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)
4. [Kaufman, Rosset, Perlich ve Stitelman: Leakage in Data Mining, ACM KDD 2011](https://doi.org/10.1145/2020408.2020496)
