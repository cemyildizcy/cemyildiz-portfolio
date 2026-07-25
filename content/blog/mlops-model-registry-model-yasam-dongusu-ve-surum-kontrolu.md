---
title: "MLOps'ta Model Registry: Modellerin Yaşam Döngüsünü ve Sürüm Kontrolünü Yönetmek"
date: "2026-07-26"
tags: ["mlops", "machine-learning", "model-registry", "mlflow"]
readTime: "8 dk"
coverEmoji: "📦"
description: "Makine öğrenimi modellerinin üretim ortamındaki yaşam döngüsünü, sürüm kontrolünü ve geçiş aşamalarını MLflow Model Registry ile yönetme rehberi."
---

# MLOps'ta Model Registry: Modellerin Yaşam Döngüsünü ve Sürüm Kontrolünü Yönetmek

Geleneksel yazılım geliştirme süreçlerinde kod sürümleme için Git ne ise, makine öğrenimi (ML) dünyasında modellerin sürüm kontrolü ve yaşam döngüsü yönetimi için de Model Registry odur. Birçok veri bilimi projesi, eğitilen model dosyalarını (örneğin `.pkl`, `.h5` veya `.onnx`) yerel disklerde, S3 veri depolarında veya paylaşımlı klasörlerde saklayarak başlar. Ancak bu yaklaşım projeler büyüdükçe sürdürülemez bir karmaşaya yol açar.

Bu yazıda, üretim ortamına taşınan ML modellerinin yaşam döngüsünü yönetmek için neden bir Model Registry sistemine ihtiyaç duyduğumuzu, bu sistemlerin nasıl çalıştığını ve popüler açık kaynaklı araçlardan MLflow ile bu sürecin nasıl pratikleştiğini ele alıyoruz.

## Neden Model Registry Kullanmalıyız?

Modelleri dosya sistemlerinde veya bulut depolama alanlarında rastgele isimlendirerek (örneğin `model_v2_final_tahmin.pkl`) saklamak şu sorunları beraberinde getirir:

1. **İzlenebilirlik (Lineage) Eksikliği:** Canlıda çalışan bir modelin hangi veri kümesiyle eğitildiğini, hangi hiperparametrelerin kullanıldığını ve hangi kod commit'iyle oluşturulduğunu geriye dönük tespit etmek zorlaşır.
2. **Yaşam Döngüsü Yönetimi Zorluğu:** Bir modelin "Staging" (test) aşamasından "Production" (üretim) aşamasına geçişi genelde manuel dosya kopyalama veya sunucu yapılandırması değiştirme gibi hata riski yüksek işlemlerle yapılır.
3. **Rol Ayrımı Eksikliği:** Modeli eğiten veri bilimci ile modeli sunucuya yerleştiren (deploy eden) yazılım geliştirici veya MLOps mühendisi arasındaki iş birliği zayıflar. Geliştirici, hangi model sürümünün güncel olduğunu her seferinde sormak zorunda kalır.

Model Registry, tüm bu problemleri çözmek üzere modelleri ve onlara ait metadataları merkezi bir havuzda toplar.

## Model Registry Nasıl Çalışır?

Merkezi bir Model Registry yapısının temel bileşenleri şunlardır:

* **Kayıtlı Model (Registered Model):** Benzersiz bir isme sahip olan ve aynı işi yapan model sürümlerinin genel kümesidir. Örneğin, "talep_tahmin_modeli" adında tek bir kayıtlı model tanımlanır.
* **Model Sürümü (Model Version):** Her yeni eğitim döngüsünden sonra kayıtlı modele eklenen yeni sürümlerdir (Sürüm 1, Sürüm 2, Sürüm 3 vb.). Her sürüm, kendi eğitim metriklerine ve artefaktlarına (model dosyalarına) bağlıdır.
* **Model Aşaması (Model Stage):** Model sürümlerine atanan etiketlerdir. Yaygın kullanılan aşamalar: `None` (Aday sürüm), `Staging` (Test ortamı), `Production` (Canlı ortam) ve `Archived` (Arşivlenmiş/Eski sürüm).
* **Metadata ve Yönetim:** Modeli kimin eğittiği, ne zaman eğitildiği, hangi doğruluk metriklerine sahip olduğu gibi bilgilerin saklanmasıdır.

---

## MLflow ile Pratik Model Yönetimi

MLflow, model yönetimi ve takibi için en yaygın kullanılan açık kaynaklı araçlardan biridir. Aşağıdaki Python kod örneği, bir modelin eğitilip MLflow Model Registry'ye nasıl kaydedileceğini, sürüm geçişlerinin nasıl yapılacağını ve kayıtlı modelin tahmin için nasıl çağrılacağını göstermektedir.

### 1. Modeli Eğitmek ve Kaydetmek

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestRegressor
from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split

# Deney takibini başlat
mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("Ev Fiyat Tahmini")

with mlflow.start_run() as run:
    # Sahte veri seti üret ve böl
    X, y = make_regression(n_samples=1000, n_features=10, noise=0.1, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Model parametreleri
    n_estimators = 100
    max_depth = 5
    
    # Model oluştur ve eğit
    model = RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
    model.fit(X_train, y_train)
    
    # Metrikleri logla
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    mlflow.log_param("n_estimators", n_estimators)
    mlflow.log_param("max_depth", max_depth)
    mlflow.log_metric("train_r2", train_score)
    mlflow.log_metric("test_r2", test_score)
    
    # Modeli Model Registry'ye kaydet
    # Model "ev_fiyat_tahmin_modeli" ismiyle kaydedilecek. Eğer bu isimde bir model
    # yoksa oluşturulacak, varsa yeni bir sürüm (Version) olarak eklenecektir.
    mlflow.sklearn.log_model(
        sk_model=model,
        artifact_path="model",
        registered_model_name="ev_fiyat_tahmin_modeli"
    )
```

### 2. Model Aşamasını Değiştirmek

Modeli test aşamasına veya canlıya almak için MLflow istemcisi üzerinden sürüm aşaması güncellenir. Bu işlem, CI/CD süreçleri veya doğrulama scriptleri tarafından otomatikleştirilebilir.

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# "ev_fiyat_tahmin_modeli" modelinin 1. sürümünü "Staging" (Test) aşamasına taşıyalım
client.transition_model_version_stage(
    name="ev_fiyat_tahmin_modeli",
    version=1,
    stage="Staging",
    archive_existing_versions=False
)

# Testlerden başarıyla geçen model sürümünü "Production" (Canlı) aşamasına taşıyalım
# 'archive_existing_versions=True' seçeneği, canlıdaki eski sürümü otomatik olarak Arşiv aşamasına alır.
client.transition_model_version_stage(
    name="ev_fiyat_tahmin_modeli",
    version=1,
    stage="Production",
    archive_existing_versions=True
)
```

### 3. Kayıtlı Modeli Kullanarak Tahmin Yapmak

Uygulama sunucuları veya API servisleri, belirli bir sürüm numarası belirtmek yerine doğrudan güncel canlı modeli (`Production` aşamasındakini) çekerek tahmin üretebilir. Böylece kod tarafında hiçbir değişiklik yapmadan sadece registry üzerindeki etiketleri değiştirerek yeni modeli canlıya alabilirsiniz.

```python
import mlflow.pyfunc
import pandas as pd

# Production aşamasındaki en güncel modeli URI yardımıyla yükle
model_uri = "models:/ev_fiyat_tahmin_modeli/Production"
loaded_model = mlflow.pyfunc.load_model(model_uri)

# Test verileri ile tahmin üret
sample_data = pd.DataFrame([[0.1] * 10])
predictions = loaded_model.predict(sample_data)
print(f"Tahmin Sonucu: {predictions}")
```

---

## Model Yönetiminde Sık Yapılan Hatalar (Antipatterns)

Model Registry kullanırken düşülmemesi gereken bazı yaygın hatalar şunlardır:

1. **Model Registry'yi Veri Deposu Olarak Kullanmak:** Registry sadece modeli ve ilgili metadatayı saklamalıdır. Büyük veri kümelerini veya eğitim sırasında oluşan ara veri dosyalarını model kayıt alanında saklamaktan kaçının. Bu işlem için DVC veya S3 gibi veri sürümleme çözümleri kullanılmalıdır.
2. **Manuel Sürüm Geçişleri:** Modelin `Production` aşamasına geçiş kararı tamamen insan kontrolünde ve el ile yapılmamalıdır. Bunun yerine, modelin performans metriklerini, girdi biçimlerini ve güvenlik sınırlarını kontrol eden otomatik test scriptleri yazılmalı, aşama geçişleri bu testlerin başarısına göre tetiklenmelidir.
3. **Kod ve Model İlişkisini Kaybetmek:** Model sürümü ile o modeli eğiten kod tabanının (Git commit ID) bağlantısını koparmak yapılan en büyük hatalardandır. MLflow gibi araçların otomatik olarak Git commit bilgisini kaydetme özelliğinden faydalanılmalıdır.

## Sonuç

Model Registry, makine öğrenimi modellerinin sadece birer dosya olmaktan çıkıp yazılım mimarisinin güvenilir birer bileşeni haline gelmesini sağlar. Modellerin yaşam döngüsünü kontrol altına almak; sürüm karmaşasını önler, hatalı modellerin canlıya çıkma riskini azaltır ve veri bilimi ile mühendislik ekipleri arasındaki bağı güçlendirir.

---

## Kaynaklar

* MLflow Model Registry Dokümantasyonu: [https://mlflow.org/docs/latest/model-registry.html](https://mlflow.org/docs/latest/model-registry.html)
* MLOps Guide - Model Registry Section: [https://mlops-guide.github.io/](https://mlops-guide.github.io/)
* DVC Model Registry Reference: [https://dvc.org/doc/use-cases/model-registry](https://dvc.org/doc/use-cases/model-registry)
