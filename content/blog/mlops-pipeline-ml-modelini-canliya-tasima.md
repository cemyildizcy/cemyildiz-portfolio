---
title: "MLOps Pipeline'ları: ML Modelini Canlıya Taşımanın Pratik Yol Haritası"
date: "2026-07-12"
tags: ["MLOps", "CI/CD", "Docker", "MLflow", "Deployment"]
readTime: "14 dk"
coverEmoji: "🚀"
description: "Bir ML modelinin notebook'tan production ortamına taşınması: CI/CD, experiment tracking, model registry, containerization ve deployment pattern'leri."
---

Bir ML modeli geliştirmek ile onu gerçek kullanıcılara sunmak arasında derin bir uçurum var. Jupyter notebook'ta %94 accuracy gören bir veri bilimci, modeli canlıya almak istediğinde bambaşka bir dünyayla karşılaşır: versiyon kontrolü, otomatik test, konteynerizasyon, izleme ve geri alma stratejileri. İşte MLOps tam olarak bu boşluğu dolduran disiplin.

Bu yazıda, bir ML modelinin notebook aşamasından production ortamına kadar geçtiği tüm aşamaları adım adım inceleyeceğiz. Teorik kavramların yanı sıra, her aşamada kullanabileceğiniz araçları ve kod örneklerini de paylaşacağım.

## MLOps Nedir ve Neden Önemlidir?

MLOps (Machine Learning Operations), yazılım mühendisliğindeki DevOps prensiplerini makine öğrenmesi yaşam döngüsüne uygulayan bir yaklaşımdır. Temel amacı, ML modellerinin geliştirilmesi, eğitilmesi, dağıtılması ve izlenmesi süreçlerini otomatikleştirmek ve standartlaştırmaktır.

Geleneksel yazılım geliştirmede CI/CD pipeline'ları yıllardır kullanılıyor. Ancak ML projeleri, klasik yazılımdan birkaç önemli noktada ayrılır:

1. **Veri bağımlılığı**: Kod değişmese bile veri değiştiğinde model davranışı tamamen farklılaşabilir.
2. **Deneysel doğa**: Onlarca hiperparametre kombinasyonu denenir, her birinin sonuçları takip edilmelidir.
3. **Model bozulması (drift)**: Canlıdaki bir model, zamanla veri dağılımı değiştikçe performans kaybedebilir.
4. **Tekrarlanabilirlik**: Aynı veri ve aynı kodla aynı sonucu elde edebilmek kritiktir.

Bu zorluklar, MLOps pipeline'larının neden vazgeçilmez olduğunu açıkça ortaya koyuyor.

## Adım 1: Experiment Tracking — Deneyleri Kayıt Altına Almak

Bir ML projesinde onlarca, hatta yüzlerce deney yapılır. Hangi hiperparametre seti hangi sonucu verdi? Hangi veri ön işleme adımı accuracy'yi artırdı? Bu soruların cevabını bulmak için sistematik bir experiment tracking altyapısına ihtiyaç duyulur.

### MLflow ile Experiment Tracking

MLflow, açık kaynaklı ve en yaygın kullanılan experiment tracking araçlarından biridir. Temel kullanımı oldukça basittir:

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score

# Deney grubunu belirle
mlflow.set_experiment("musteri-kayip-tahmini")

with mlflow.start_run(run_name="rf-baseline-v2"):
    # Hiperparametreleri logla
    n_estimators = 200
    max_depth = 15
    mlflow.log_param("n_estimators", n_estimators)
    mlflow.log_param("max_depth", max_depth)
    mlflow.log_param("veri_versiyonu", "v2.3")

    # Modeli eğit
    model = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Metrikleri logla
    y_pred = model.predict(X_test)
    mlflow.log_metric("accuracy", accuracy_score(y_test, y_pred))
    mlflow.log_metric("f1_score", f1_score(y_test, y_pred))

    # Modeli kaydet
    mlflow.sklearn.log_model(model, "model")
```

Bu kodla her deney otomatik olarak kaydedilir. MLflow UI üzerinden deneyleri karşılaştırabilir, en iyi performans gösteren modeli kolayca bulabilirsiniz.

### Weights & Biases (W&B) Alternatifi

W&B, özellikle derin öğrenme projelerinde tercih edilen güçlü bir alternatiftir. Gerçek zamanlı görselleştirme, takım işbirliği ve otomatik hiperparametre optimizasyonu (Sweeps) gibi özellikler sunar:

```python
import wandb

wandb.init(
    project="musteri-kayip-tahmini",
    config={
        "n_estimators": 200,
        "max_depth": 15,
        "learning_rate": 0.01
    }
)

# Eğitim döngüsünde
for epoch in range(num_epochs):
    train_loss, val_loss = train_one_epoch(model, train_loader, val_loader)
    wandb.log({
        "train_loss": train_loss,
        "val_loss": val_loss,
        "epoch": epoch
    })

wandb.finish()
```

Her iki araç da işini iyi yapar. MLflow self-hosted çalışabilmesi ve açık kaynak olmasıyla öne çıkarken, W&B bulut tabanlı dashboard'ları ve takım işbirliği özellikleriyle fark yaratır. Projenizin büyüklüğüne ve ekip yapınıza göre seçim yapmanız yerinde olacaktır.

## Adım 2: Model Registry — Modelleri Versiyonlamak

Experiment tracking ile en iyi modeli buldunuz. Peki bu modeli nasıl versiyonlayacak, staging ve production ortamları arasında nasıl taşıyacaksınız? İşte Model Registry burada devreye girer.

MLflow Model Registry, modellerin yaşam döngüsünü yönetmek için üç temel aşama sunar:

- **Staging**: Model test edilmeye hazır.
- **Production**: Model canlı trafiğe hizmet veriyor.
- **Archived**: Eski model, referans amaçlı saklanıyor.

```python
import mlflow

# En iyi modeli registry'ye kaydet
model_uri = "runs:/<run_id>/model"
model_details = mlflow.register_model(
    model_uri=model_uri,
    name="musteri-kayip-modeli"
)

# Modeli production'a taşı
client = mlflow.tracking.MlflowClient()
client.transition_model_version_stage(
    name="musteri-kayip-modeli",
    version=model_details.version,
    stage="Production"
)
```

Model registry kullanmanın en büyük avantajı, hangi modelin ne zaman canlıya alındığını net olarak takip edebilmenizdir. Bir sorun çıktığında önceki versiyona dönmek (rollback) saniyeler içinde yapılabilir.

## Adım 3: CI/CD for ML — Sürekli Entegrasyon ve Dağıtım

Geleneksel CI/CD pipeline'ları kod değişikliklerini test edip dağıtır. ML için CI/CD ise bunun üzerine veri doğrulama, model eğitimi ve model doğrulama adımlarını ekler.

Tipik bir ML CI/CD pipeline'ı şu adımlardan oluşur:

1. **Kod kalite kontrolleri**: Linting, unit testler.
2. **Veri doğrulama**: Şema kontrolü, veri kalitesi metrikleri.
3. **Model eğitimi**: Belirlenen konfigürasyonla eğitim.
4. **Model doğrulama**: Performans eşik değerlerinin kontrolü.
5. **Model kayıt**: Registry'ye yeni versiyon olarak ekleme.
6. **Dağıtım**: Staging → Production geçişi.

GitHub Actions ile basit bir ML CI/CD pipeline örneği:

```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on:
  push:
    branches: [main]
    paths:
      - 'src/model/**'
      - 'data/processed/**'

jobs:
  train-and-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Python ortamını kur
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Bağımlılıkları yükle
        run: pip install -r requirements.txt

      - name: Veri doğrulama
        run: python scripts/validate_data.py

      - name: Model eğitimi
        run: python scripts/train.py --config configs/production.yaml

      - name: Model performans kontrolü
        run: |
          python scripts/evaluate.py --threshold-accuracy 0.90 --threshold-f1 0.85

      - name: Model registry'ye kaydet
        if: success()
        run: python scripts/register_model.py
        env:
          MLFLOW_TRACKING_URI: ${{ secrets.MLFLOW_URI }}
```

Burada dikkat edilmesi gereken önemli bir nokta var: `paths` filtresi sayesinde pipeline yalnızca model kodu veya veri değiştiğinde tetiklenir. Bu, gereksiz eğitim maliyetlerinden kaçınmanızı sağlar.

## Adım 4: Containerization — Docker ile Paketleme

Modeliniz geliştirme ortamınızda çalışıyor olabilir ama başka bir makinede aynı sonucu vereceğinin garantisi yoktur. Farklı Python sürümleri, eksik kütüphaneler, işletim sistemi farklılıkları — bunların hepsi "bende çalışıyor" problemine yol açar.

Docker, bu sorunu kökünden çözer. Modelinizi, bağımlılıklarıyla birlikte taşınabilir bir konteynere paketlersiniz:

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Bağımlılıkları önce kopyala (cache optimizasyonu)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY src/ ./src/
COPY models/ ./models/

# Inference sunucusunu başlat
EXPOSE 8000
CMD ["uvicorn", "src.serving:app", "--host", "0.0.0.0", "--port", "8000"]
```

FastAPI ile basit bir inference servisi:

```python
# src/serving.py
from fastapi import FastAPI
import joblib
import numpy as np
from pydantic import BaseModel

app = FastAPI(title="Müşteri Kayıp Tahmin Servisi")

# Model yükleme (uygulama başlangıcında bir kez)
model = joblib.load("models/kayip_model_v3.joblib")

class PredictionRequest(BaseModel):
    features: list[float]

class PredictionResponse(BaseModel):
    prediction: int
    probability: float

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    X = np.array(request.features).reshape(1, -1)
    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0].max()
    return PredictionResponse(
        prediction=int(prediction),
        probability=float(probability)
    )

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_version": "v3"}
```

Docker imajını oluşturup çalıştırmak:

```bash
# İmaj oluştur
docker build -t kayip-tahmin-servisi:v3 .

# Çalıştır
docker run -d -p 8000:8000 --name kayip-servisi kayip-tahmin-servisi:v3

# Test et
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [0.5, 1.2, 3.4, 0.8, 2.1]}'
```

## Adım 5: Deployment Patterns — Batch vs Real-Time Inference

Modelinizi nasıl sunacağınız, kullanım senaryosuna göre değişir. İki temel yaklaşım vardır ve her birinin kendine özgü avantajları ile kısıtlamaları bulunur.

### Real-Time (Online) Inference

Kullanıcıdan gelen her istek anında işlenir ve sonuç döndürülür. E-ticaret sitesinde ürün önerisi, chatbot yanıtları veya dolandırıcılık tespiti gibi anlık karar gerektiren senaryolarda kullanılır.

**Avantajları:**
- Düşük gecikme süresi (milisaniye düzeyinde)
- Anlık karar verme imkanı

**Dezavantajları:**
- Yüksek altyapı maliyeti (sunucu sürekli ayakta)
- Ölçeklendirme karmaşıklığı

**Tipik mimari**: FastAPI/Flask + Docker + Kubernetes (veya AWS ECS, Google Cloud Run)

### Batch Inference

Büyük veri kümeleri üzerinde periyodik olarak tahmin yapılır. Günlük müşteri segmentasyonu, haftalık churn tahmini veya aylık risk skorlaması gibi acil yanıt gerektirmeyen senaryolarda tercih edilir.

**Avantajları:**
- Maliyet etkin (kaynaklar yalnızca iş çalışırken kullanılır)
- Büyük veri hacimlerinde verimli

**Dezavantajları:**
- Sonuçlar anlık değil, belirli aralıklarla güncellenir
- Gerçek zamanlı kararlar için uygun değil

**Tipik mimari**: Apache Airflow / Prefect + Spark veya pandas + sonuçların bir veritabanına yazılması

```python
# Basit batch inference örneği (Airflow DAG)
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

def run_batch_predictions():
    import joblib
    import pandas as pd

    model = joblib.load("/models/kayip_model_v3.joblib")
    customers = pd.read_sql("SELECT * FROM customers_features", engine)

    predictions = model.predict_proba(customers[feature_cols])[:, 1]
    customers["churn_risk"] = predictions

    customers[["customer_id", "churn_risk"]].to_sql(
        "churn_predictions",
        engine,
        if_exists="replace",
        index=False
    )

default_args = {
    "owner": "ml-team",
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

dag = DAG(
    "batch_churn_prediction",
    default_args=default_args,
    schedule_interval="0 6 * * *",  # Her gün sabah 6'da
    start_date=datetime(2026, 1, 1),
    catchup=False,
)

predict_task = PythonOperator(
    task_id="run_predictions",
    python_callable=run_batch_predictions,
    dag=dag,
)
```

### Hangi Yaklaşımı Seçmeli?

| Kriter | Real-Time | Batch |
|--------|-----------|-------|
| Gecikme toleransı | Milisaniye | Dakika-saat |
| Veri hacmi | Tekil istekler | Büyük veri kümeleri |
| Maliyet | Yüksek (sürekli çalışan sunucu) | Düşük (periyodik çalışma) |
| Kullanım alanı | Anlık kararlar | Raporlama, segmentasyon |
| Karmaşıklık | Yüksek (ölçeklendirme) | Orta (zamanlama) |

Birçok üretim sisteminde bu iki yaklaşım bir arada kullanılır. Örneğin bir e-ticaret platformu, ürün önerilerini batch olarak hesaplayıp bir cache'e yazar ve kullanıcı sayfayı açtığında cache'ten okur. Ancak alışveriş sepeti analizini real-time olarak yapar.

## Pipeline'ı Bir Araya Getirmek

Tüm bu adımları birleştirdiğimizde, uçtan uca bir MLOps pipeline'ı şu şekilde görünür:

```
Veri Toplama → Veri Doğrulama → Feature Engineering
       ↓
Experiment Tracking (MLflow/W&B)
       ↓
Model Eğitimi → Model Doğrulama → Model Registry
       ↓
CI/CD Pipeline (GitHub Actions)
       ↓
Containerization (Docker) → Deployment (K8s/Cloud Run)
       ↓
Monitoring & Alerting → Geri Bildirim Döngüsü
```

Her adım bir öncekine bağlıdır ve herhangi bir noktada başarısızlık olduğunda pipeline durmalı, ilgili ekibi uyarmalıdır. Bu zincirin sağlamlığı, production'daki modelinizin güvenilirliğini doğrudan belirler.

## Pratik Tavsiyeler

MLOps yolculuğuna yeni başlıyorsanız, her şeyi birden kurmaya çalışmak yerine aşamalı ilerlemenizi öneririm:

1. **İlk hafta**: Experiment tracking kurun. MLflow'u lokal olarak çalıştırın, mevcut deney sonuçlarınızı kaydetmeye başlayın.
2. **İkinci hafta**: Model registry'yi aktifleştirin. En iyi modellerinizi versiyonlayın.
3. **Üçüncü hafta**: Inference servisinizi Docker'a taşıyın. Basit bir FastAPI uygulaması yeterli.
4. **Dördüncü hafta**: CI/CD pipeline'ını ekleyin. GitHub Actions ile başlamak en kolay yoldur.
5. **Sonraki adımlar**: Monitoring, A/B testing, otomatik yeniden eğitim.

Mükemmel bir pipeline kurmaya çalışmak yerine, çalışan ve kademeli olarak iyileştirilebilen bir pipeline kurmak çok daha değerlidir. Her projenin ihtiyacı farklıdır; önemli olan, bu ihtiyaçlara göre doğru araçları seçip tutarlı bir şekilde kullanmaktır.

## Sonuç

MLOps, bir ML modelinin gerçek dünyada değer üretmesi için zorunlu bir disiplindir. Notebook'taki bir prototipi production-ready bir servise dönüştürmek; experiment tracking, model registry, CI/CD, containerization ve doğru deployment pattern seçimi gibi birbiriyle bağlantılı birçok adımı içerir.

Bu yazıda ele aldığımız araçlar ve yaklaşımlar, endüstride yaygın olarak kullanılan ve kanıtlanmış çözümlerdir. Kendi projelerinize uyguladığınızda, modelin canlıya çıkma süresinin kısaldığını, hataların erken yakalandığını ve geri dönüşlerin kolaylaştığını göreceksiniz.

---

## Kaynaklar

1. **Sculley, D., et al. (2015)**. *Hidden Technical Debt in Machine Learning Systems*. Google, NIPS 2015. [https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html](https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html)

2. **MLflow Documentation**. *MLflow: An Open Source Platform for the Machine Learning Lifecycle*. [https://mlflow.org/docs/latest/index.html](https://mlflow.org/docs/latest/index.html)

3. **Google Cloud Architecture Center**. *MLOps: Continuous Delivery and Automation Pipelines in Machine Learning*. [https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning)

4. **Weights & Biases Documentation**. *Experiment Tracking with W&B*. [https://docs.wandb.ai/guides](https://docs.wandb.ai/guides)
