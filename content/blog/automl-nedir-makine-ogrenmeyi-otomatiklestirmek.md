---
title: "AutoML Nedir? Makine Öğrenmesini Otomatikleştirmek Mümkün mü?"
date: "2026-07-13"
tags: ["AutoML", "Makine Öğrenmesi", "HPO", "NAS", "Otomasyon"]
readTime: "12 dk"
coverEmoji: "🤖"
description: "AutoML araçları, Neural Architecture Search, otomatik hiperparametre optimizasyonu ve feature engineering: ne zaman kullanılır, sınırları nelerdir?"
---

# AutoML Nedir? Makine Öğrenmesini Otomatikleştirmek Mümkün mü?

Makine öğrenmesi projelerinde en çok zaman harcanan aşamalar genellikle model seçimi, hiperparametre ayarlaması ve özellik mühendisliğidir. Bir veri bilimci, doğru algoritmayı bulmak için onlarca deneme yapar, parametreleri tek tek değiştirir ve sonuçları karşılaştırır. Peki bu sürecin büyük bir kısmını otomatikleştirmek mümkün mü? İşte **AutoML** (Automated Machine Learning) tam olarak bu soruya yanıt arıyor.

Bu yazıda AutoML kavramını derinlemesine inceleyeceğiz: ne olduğunu, neden önemli olduğunu, hangi araçların öne çıktığını, Neural Architecture Search ve otomatik hiperparametre optimizasyonu gibi alt bileşenlerini ele alacağız. Son olarak da AutoML'in sınırlarını ve ne zaman kullanılmaması gerektiğini tartışacağız.

---

## AutoML Nedir?

AutoML, makine öğrenmesi pipeline'ının — veri ön işlemeden model eğitimine, hiperparametre optimizasyonundan model değerlendirmesine kadar — tamamını veya büyük bir bölümünü otomatikleştiren yöntem ve araçların genel adıdır.

Geleneksel bir ML projesinde şu adımlar manuel olarak yürütülür:

1. **Veri temizleme ve ön işleme** — eksik değerler, aykırı değerler, normalizasyon
2. **Özellik mühendisliği (Feature Engineering)** — yeni değişkenler türetme, dönüştürme
3. **Model seçimi** — Random Forest mı, XGBoost mu, SVM mi?
4. **Hiperparametre optimizasyonu (HPO)** — öğrenme oranı, ağaç derinliği, regularizasyon katsayıları
5. **Model değerlendirme ve karşılaştırma** — cross-validation, metrik analizi
6. **Dağıtım (deployment)** — modelin üretime alınması

AutoML, bu adımlardan özellikle 2–5 arasındakileri sistematik biçimde otomatikleştirir. Amaç, alan uzmanı olmayan kullanıcıların bile güçlü modeller üretebilmesini sağlamak ve deneyimli veri bilimcilerin zamanını daha stratejik işlere ayırmasına olanak tanımaktır.

---

## AutoML Neden Önemli?

### 1. Veri Bilimci Açığı

Dünya genelinde yetişmiş veri bilimci sayısı, talebe oranla oldukça düşüktür. AutoML, bu açığı kapatmanın en etkili yollarından biridir. Bir alan uzmanı — örneğin bir doktor veya finans analisti — temel düzeyde Python bilgisiyle bile anlamlı modeller üretebilir.

### 2. Deneme Süresinin Kısalması

Manuel hiperparametre araması günler, hatta haftalar sürebilir. AutoML araçları, Bayesian optimizasyon veya bandit tabanlı yöntemlerle bu süreci saatler seviyesine indirir.

### 3. İnsan Önyargısının Azaltılması

Veri bilimciler çoğu zaman aşina oldukları algoritmalara yönelir. AutoML, tüm aday modelleri ve yapılandırmaları sistematik biçimde değerlendirerek bu önyargıyı ortadan kaldırır.

### 4. Tekrarlanabilirlik

AutoML pipeline'ları, her çalıştırmada aynı arama uzayını tarar ve sonuçları loglar. Bu, deneysel tekrarlanabilirlik açısından büyük avantaj sağlar.

---

## AutoML'in Temel Bileşenleri

AutoML, tek bir teknik değil, birden fazla otomasyon katmanının bir araya gelmesidir. Temel bileşenleri şöyle sıralayabiliriz:

### Otomatik Özellik Mühendisliği (Automated Feature Engineering)

Ham veriden anlamlı özellikler türetmek, model başarısını doğrudan etkiler. Otomatik özellik mühendisliği araçları — örneğin **Featuretools** — ilişkisel veri yapılarından otomatik olarak yeni değişkenler oluşturur.

Tipik işlemler şunlardır:
- Tarih sütunlarından gün, ay, yıl, haftanın günü çıkarma
- Kategorik değişkenler arası etkileşim terimleri oluşturma
- Toplama (aggregation) fonksiyonları ile özet istatistikler türetme
- Polinom özellikleri ve logaritmik dönüşümler uygulama

```python
import featuretools as ft

# Varlık setini tanımla
es = ft.EntitySet(id="musteri_verileri")
es = es.add_dataframe(dataframe=df_musteriler, dataframe_name="musteriler",
                      index="musteri_id")
es = es.add_dataframe(dataframe=df_islemler, dataframe_name="islemler",
                      index="islem_id", time_index="tarih")

# İlişkiyi tanımla
es = es.add_relationship("musteriler", "musteri_id",
                         "islemler", "musteri_id")

# Otomatik özellik üretimi
feature_matrix, feature_defs = ft.dfs(entityset=es,
                                       target_dataframe_name="musteriler",
                                       max_depth=2)
```

Bu yaklaşım, özellikle tablo verilerinde elle yapılması saatler sürecek özellik mühendisliği işlemlerini dakikalar içinde gerçekleştirir.

### Hiperparametre Optimizasyonu (HPO)

Hiperparametre optimizasyonu, AutoML'in en olgun bileşenidir. Temel yöntemler şunlardır:

| Yöntem | Açıklama | Avantaj | Dezavantaj |
|--------|----------|---------|------------|
| **Grid Search** | Tüm kombinasyonları dener | Kapsamlı | Çok yavaş |
| **Random Search** | Rastgele örnekleme yapar | Grid'den verimli | Garanti yok |
| **Bayesian Optimization** | Önceki sonuçlardan öğrenir | Akıllı arama | Karmaşık uygulama |
| **Bandit tabanlı (ASHA, Hyperband)** | Kötü adayları erken eler | Kaynak tasarrufu | Bazı senaryolarda erken kesme riski |
| **Evrimsel algoritmalar** | Genetik optimizasyon | Geniş arama uzayı | Yavaş yakınsama |

Modern AutoML araçlarının çoğu Bayesian optimizasyon ile bandit tabanlı yöntemleri birleştirir. Örneğin **BOHB** (Bayesian Optimization and HyperBand), her iki yaklaşımın güçlü yönlerini bir araya getirir.

### Neural Architecture Search (NAS)

NAS, derin öğrenme modellerinin mimari tasarımını otomatikleştiren bir alt alandır. Geleneksel olarak bir sinir ağının katman sayısı, katman türleri, bağlantı yapısı ve aktivasyon fonksiyonları insan uzmanlar tarafından belirlenir. NAS bu süreci otomatik hâle getirir.

NAS'ın temel yaklaşımları:

- **Güçlendirmeli öğrenme tabanlı NAS**: Bir kontrolör ağı, mimari kararları verir ve elde edilen doğruluk skoru ödül sinyali olarak kullanılır. Google'ın orijinal NAS çalışması bu yaklaşımı kullanmıştır.
- **Evrimsel NAS**: Mimari adaylar genetik algoritmalarla evrimleştirilir. AmoebaNet bu yöntemle ortaya çıkmıştır.
- **Diferansiyellenebilir NAS (DARTS)**: Ayrık mimari seçimlerini sürekli bir uzaya gevşeterek gradient descent ile optimize eder. Çok daha hızlıdır.
- **One-shot NAS**: Tüm aday mimarileri tek bir süper ağ içinde eğitir ve alt ağları değerlendirir.

NAS, özellikle bilgisayarlı görü ve doğal dil işleme alanlarında insan tasarımı mimarilere rakip — hatta bazen üstün — sonuçlar üretmiştir. Ancak hesaplama maliyeti çok yüksektir: Google'ın orijinal NAS çalışması yüzlerce GPU-gün gerektirmiştir.

---

## Popüler AutoML Araçları

### Auto-sklearn

Scikit-learn ekosistemi üzerine inşa edilmiş, açık kaynaklı bir AutoML kütüphanesidir. Freiburg Üniversitesi tarafından geliştirilmiştir.

**Güçlü yönleri:**
- Scikit-learn uyumluluğu sayesinde kolay entegrasyon
- Meta-öğrenme ile başlangıç yapılandırmasını hızlandırma
- Ensemble yöntemleriyle birden fazla modeli birleştirme

```python
import autosklearn.classification

automl = autosklearn.classification.AutoSklearnClassifier(
    time_left_for_this_task=3600,   # toplam süre (saniye)
    per_run_time_limit=300,          # her deneme için maksimum süre
    ensemble_size=50,
    metric=autosklearn.metrics.f1
)
automl.fit(X_train, y_train)
predictions = automl.predict(X_test)
```

### H2O AutoML

H2O.ai tarafından geliştirilen, hem açık kaynak hem de kurumsal sürümü bulunan kapsamlı bir platformdur. Java tabanlıdır ve büyük veri setleriyle iyi ölçeklenir.

**Güçlü yönleri:**
- Dağıtık hesaplama desteği (Spark entegrasyonu)
- Stacked ensemble ile otomatik model birleştirme
- Web tabanlı arayüz (H2O Flow) ile kodsuz kullanım imkânı
- Explainability (açıklanabilirlik) özellikleri yerleşik

```python
import h2o
from h2o.automl import H2OAutoML

h2o.init()
train = h2o.import_file("train.csv")

aml = H2OAutoML(max_runtime_secs=3600,
                seed=42,
                sort_metric="AUC")
aml.train(x=features, y=target, training_frame=train)

# En iyi modeli al
best_model = aml.leader
print(aml.leaderboard)
```

### Google Cloud AutoML

Google'ın bulut tabanlı AutoML hizmeti, özellikle görüntü sınıflandırma, metin analizi ve tablo verileri için yönetilen (managed) çözümler sunar. Transfer öğrenme ve NAS teknolojilerini arka planda kullanır.

**Güçlü yönleri:**
- Sıfır altyapı yönetimi
- Google'ın NAS araştırmalarından beslenen mimari arama
- Vertex AI ile entegre uçtan uca ML pipeline'ı
- Otomatik model dağıtımı ve API oluşturma

**Dikkat edilmesi gerekenler:**
- Maliyet, özellikle büyük veri setlerinde hızla artabilir
- Verinin Google Cloud'a yüklenmesi gerekir (veri egemenliği endişesi)
- Model üzerindeki kontrol sınırlıdır — "kara kutu" yaklaşımı

### FLAML (Fast and Lightweight AutoML)

Microsoft Research tarafından geliştirilen FLAML, düşük hesaplama bütçesiyle yüksek performans elde etmeyi hedefler. Diğer AutoML araçlarına kıyasla çok daha hafif ve hızlıdır.

**Güçlü yönleri:**
- Düşük kaynak tüketimi — laptop üzerinde bile verimli çalışır
- Cost-Frugal Optimization (CFO) ile akıllı bütçe yönetimi
- LightGBM, XGBoost, CatBoost gibi güçlü modelleri destekler
- Scikit-learn API uyumlu

```python
from flaml import AutoML

automl = AutoML()
automl.fit(
    X_train, y_train,
    task="classification",
    time_budget=600,        # 10 dakika
    metric="f1",
    estimator_list=["lgbm", "xgboost", "catboost", "rf"]
)

print(f"En iyi model: {automl.best_estimator}")
print(f"En iyi skor: {automl.best_loss:.4f}")
print(f"Yapılandırma: {automl.best_config}")
```

FLAML, özellikle kaynak kısıtlı ortamlarda ve hızlı prototipleme senaryolarında öne çıkar.

### Diğer Önemli Araçlar

- **TPOT**: Genetik programlama ile pipeline optimizasyonu yapar. Sonucu dışa aktarılabilir Python kodu olarak üretir.
- **AutoKeras**: Keras üzerine inşa edilmiş, derin öğrenme odaklı AutoML aracıdır. NAS kullanır.
- **MLJar**: Otomatik EDA (keşifsel veri analizi) raporları ile birlikte model seçimi yapar.
- **PyCaret**: Düşük kodlu ML kütüphanesi; AutoML'den ziyade hızlı deney ortamı sunar.

---

## Pratik Bir AutoML Pipeline'ı

Aşağıda, FLAML kullanarak uçtan uca bir sınıflandırma pipeline'ı örneği yer almaktadır:

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from flaml import AutoML

# 1. Veriyi yükle
df = pd.read_csv("musteri_kayip.csv")

# 2. Basit ön işleme
df = df.dropna(subset=["hedef"])
X = df.drop(columns=["hedef", "musteri_id"])
y = df["hedef"]

# 3. Eğitim/test ayırma
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4. AutoML ile model eğitimi
automl = AutoML()
automl.fit(
    X_train, y_train,
    task="classification",
    time_budget=1200,
    metric="f1",
    eval_method="cv",
    n_splits=5,
    log_file_name="automl_deneme.log"
)

# 5. Sonuçları değerlendir
y_pred = automl.predict(X_test)
print(classification_report(y_test, y_pred))

# 6. En iyi modeli kaydet
import joblib
joblib.dump(automl, "en_iyi_model.pkl")
```

Bu pipeline'da dikkat edilmesi gereken noktalar:

- **Zaman bütçesi** (`time_budget`): AutoML'e ne kadar süre tanıyacağınız, sonuçları doğrudan etkiler. Çok kısa tutmak iyi bir model bulmayı zorlaştırır; çok uzun tutmak gereksiz kaynak tüketimine yol açar.
- **Çapraz doğrulama**: `eval_method="cv"` ile overfitting riskini azaltırsınız.
- **Log dosyası**: Hangi modellerin denendiğini, hangi hiperparametrelerin test edildiğini ve her adımın skorunu kayıt altına alır.

---

## AutoML'in Sınırları

AutoML güçlü bir araçtır, ancak her derde deva değildir. Sınırlarını bilmek, doğru beklentiler oluşturmak açısından kritiktir.

### 1. Veri Kalitesini Düzeltemez

AutoML, kirli veriyi temizleyemez. Eksik değerler, yanlış etiketler veya temsili olmayan örneklem gibi sorunlar varsa, en iyi AutoML aracı bile başarısız olur. **"Çöp girerse, çöp çıkar"** prensibi AutoML için de geçerlidir.

### 2. Alan Bilgisi Gerektiren Problemler

Bazı problemlerde özellik mühendisliği, derin alan bilgisi gerektirir. Örneğin tıbbi görüntü analizinde radyoloji uzmanının bilgisi, finansal zaman serilerinde makroekonomik göstergelerin dahil edilmesi — bunlar AutoML'in otomatik olarak keşfedemeyeceği bilgilerdir.

### 3. Hesaplama Maliyeti

Özellikle NAS ve geniş hiperparametre arama uzayları söz konusu olduğunda, AutoML ciddi hesaplama kaynağı gerektirir. Bulut ortamında bu doğrudan maliyet anlamına gelir.

### 4. Açıklanabilirlik Sorunu

AutoML genellikle en yüksek performansı veren modeli seçer, ancak bu model karmaşık bir ensemble olabilir. Düzenleyici gereksinimlerin (KVKK, GDPR) yoğun olduğu sektörlerde, modelin neden belirli bir karar verdiğini açıklamak zorlaşır.

### 5. Özelleştirilmiş Mimariler

Son derece özel bir mimari gerektiren araştırma projeleri — örneğin yeni bir attention mekanizması veya özel bir kayıp fonksiyonu — AutoML'in standart arama uzayına sığmaz. Bu tür çalışmalarda manuel tasarım kaçınılmazdır.

### 6. Küçük Veri Setleri

AutoML araçlarının çoğu, çapraz doğrulama ile çok sayıda model denemesi yapar. Çok küçük veri setlerinde (birkaç yüz örnek) bu değerlendirmeler güvenilir olmayabilir ve overfitting riski artar.

---

## AutoML Ne Zaman Kullanılmamalı?

Aşağıdaki durumlarda AutoML yerine manuel yaklaşım tercih edilmelidir:

- **Veri henüz keşfedilmemiş**: Önce kapsamlı bir EDA (keşifsel veri analizi) yapılmalıdır.
- **Problem iyi tanımlanmamış**: Hedef değişken belirsizse, AutoML'e ne optimize edeceğini söyleyemezsiniz.
- **Gerçek zamanlı çıkarım gereksinimleri sıkı**: AutoML'in seçtiği model, gecikme (latency) bütçesine uymayabilir.
- **Modelin yorumlanabilirliği kritik**: Sağlık, hukuk veya finans gibi alanlarda basit, açıklanabilir modeller tercih edilmelidir.
- **Özel veri yapıları**: Graf verisi, zaman serisi grafları veya çoklu modalite gibi standart dışı yapılar AutoML'in arama uzayına iyi yansımaz.

---

## AutoML'in Geleceği

AutoML alanı hızla gelişmeye devam etmektedir. Bazı önemli trendler:

- **LLM destekli AutoML**: Büyük dil modelleri, pipeline yapılandırmasını doğal dil talimatlarıyla oluşturmak için kullanılmaya başlanmıştır.
- **Çok amaçlı optimizasyon**: Yalnızca doğruluk değil; doğruluk, model boyutu, çıkarım süresi ve enerji tüketimi birlikte optimize ediliyor.
- **Federated AutoML**: Verinin merkeze toplanmadan, dağıtık ortamlarda model araması yapılması.
- **AutoML for MLOps**: Model eğitiminin ötesinde, izleme, yeniden eğitim tetikleyicileri ve dağıtım stratejilerinin de otomatikleştirilmesi.

---

## Sonuç

AutoML, makine öğrenmesini demokratikleştiren güçlü bir araç setidir. Doğru kullanıldığında, prototipleme süresini kısaltır, insan önyargısını azaltır ve geniş bir model uzayını sistematik biçimde tarar. Ancak veri kalitesi, alan bilgisi ve problem tanımı gibi temel konulardaki insan katkısının yerini alamaz.

En verimli yaklaşım, AutoML'i bir **yardımcı araç** olarak konumlandırmaktır: başlangıç noktası olarak güçlü bir temel model bulmak için kullanın, ardından alan bilginizle ince ayar yapın. Ne tamamen elle yürütülen, ne de tamamen otomatik bir süreç — ikisinin dengeli birleşimi en iyi sonuçları verir.

---

## Kaynaklar

1. Hutter, F., Kotthoff, L., & Vanschoren, J. (2019). *Automated Machine Learning: Methods, Systems, Challenges*. Springer. [https://www.automl.org/book/](https://www.automl.org/book/)

2. He, X., Zhao, K., & Chu, X. (2021). "AutoML: A Survey of the State-of-the-Art." *Knowledge-Based Systems*, 212, 106622. [https://doi.org/10.1016/j.knosys.2020.106622](https://doi.org/10.1016/j.knosys.2020.106622)

3. Wang, C., Wu, Q., Weimer, M., & Zhu, E. (2021). "FLAML: A Fast and Lightweight AutoML Library." *MLSys 2021*. [https://github.com/microsoft/FLAML](https://github.com/microsoft/FLAML)

4. Zoph, B., & Le, Q. V. (2017). "Neural Architecture Search with Reinforcement Learning." *ICLR 2017*. [https://arxiv.org/abs/1611.01578](https://arxiv.org/abs/1611.01578)

5. Feurer, M., Klein, A., Eggensperger, K., Springenberg, J., Blum, M., & Hutter, F. (2015). "Efficient and Robust Automated Machine Learning." *NeurIPS 2015*. [https://papers.nips.cc/paper/2015/hash/11d0e6287202fced83f79975ec59a3a6-Abstract.html](https://papers.nips.cc/paper/2015/hash/11d0e6287202fced83f79975ec59a3a6-Abstract.html)
