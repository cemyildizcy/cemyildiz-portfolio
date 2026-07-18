---
title: "MLOps Pipeline'ları: ML Modelini Canlıya Taşımanın Pratik Yol Haritası"
date: "2026-07-18"
tags: ["MLOps", "CI/CD", "ML Pipeline", "Docker", "MLflow"]
readTime: "12 dk"
coverEmoji: "🚀"
description: "Bir ML modelini notebook'tan production'a taşırken kullanılan araçlar, pipeline mimarisi ve pratik ipuçları."
---

# MLOps Pipeline'ları: ML Modelini Canlıya Taşımanın Pratik Yol Haritası

Notebook'ta çalışan bir model ile canlıda tahmin üreten bir model arasında ciddi bir mesafe vardır. Eğitim kodu çalışıyor, metrikler iyi, grafikler güzel. Ama "bunu ürüne koyalım" dediğin anda bambaşka sorular ortaya çıkar: Model nasıl paketlenir? Yeni versiyonu nasıl deneriz? Eğitim pipeline'ı tekrar edilebilir mi? Tahmin servisi kaç isteği kaldırır?

Bu yazıda bir ML modelini notebook ortamından production'a taşırken gereken adımları, araçları ve kararları pratik taraftan anlatıyorum. Monitoring konusunu daha önce ayrı bir yazıda ele almıştım; burada pipeline mimarisi, experiment tracking, model registry, konteynerleştirme ve deployment kalıplarına odaklanıyorum.

## Problem: notebook'tan production'a geçiş neden zordur?

Bir notebook'ta model eğitmek ile production'da çalışan bir tahmin servisi kurmak farklı mühendislik disiplinleridir. Notebook'ta hücre sırası önemlidir, global state var, veri dosyaları lokal dizinde durur. Production'da bunların hiçbiri yoktur.

Tipik sorunlar:

- Eğitim kodu notebook hücreleri arasına dağılmıştır; baştan sona çalıştırınca farklı sonuç verir.
- Veri preprocessing kodu eğitim ve tahmin tarafında ayrı yazılmıştır; aynı feature'ı farklı hesaplar.
- Hangi parametrelerle hangi modelin eğitildiği kayıt altında değildir.
- Model dosyası Slack'ten, e-postayla veya USB ile taşınır.
- Canlıya çıkarmak demek "notebook'u sunucuya kopyalamak" anlamına gelir.

Bu sorunların ortak noktası şudur: tekrar edilebilirlik yoktur. İkinci kez aynı sonucu almak bile garanti değildir.

## MLOps nedir ve ne değildir?

MLOps, makine öğrenimi projelerinin geliştirme, test, deployment ve bakım döngüsünü sistematik hale getiren pratiklerin genel adıdır. DevOps'un ML dünyasındaki karşılığı gibi düşünülebilir ama tam aynı şey değildir.

DevOps'ta kaynak kodu version control'de tutulur, testlerden geçer, otomatik olarak derlenir ve deploy edilir. MLOps'ta buna ek olarak veri, model dosyası, hiperparametreler ve deneysel sonuçlar da versiyonlanır. Çünkü ML sistemlerinde sadece kod değişmez; veri değişir, parametreler değişir, eğitim ortamı bile fark yaratabilir.

MLOps'un bir araç veya ürün olmadığını belirtmek gerekir. Belirli bir framework satın alarak "MLOps yaptık" demek mümkün değildir. Proje boyutuna ve ekip yapısına göre ihtiyaç farklılaşır. Tek kişilik projede basit bir Makefile ve git tag'leri yeterli olabilir. Büyük ekipte otomatik pipeline orchestration, A/B test altyapısı ve model registry gerekebilir.

## Pipeline mimarisi: hangi adımlar gerekir?

Bir ML pipeline'ı genel olarak şu adımlardan oluşur:

1. Veri toplama ve doğrulama
2. Feature engineering ve preprocessing
3. Model eğitimi
4. Değerlendirme ve metrik kayıt
5. Model paketleme
6. Deployment
7. Tahmin servisi

Bu adımların her biri ayrı bir script veya modül olmalıdır. Notebook hücrelerinden oluşan bir pipeline tekrar edilebilir değildir.

İlk adım genelde notebook kodunu fonksiyonlara ve modüllere çıkarmaktır. Eğitim kodu `train.py`, preprocessing kodu `preprocess.py`, tahmin kodu `predict.py` olarak ayrılır. Her modül bağımsız çalıştırılabilir ve test edilebilir hale gelir.

Pipeline orchestration araçları bu adımları sıralı veya paralel çalıştırmayı, hata durumunda geri almayı ve sonuçları kayıt altına almayı otomatikleştirir. Yaygın araçlar arasında Airflow, Prefect, Kubeflow Pipelines ve ZenML bulunur. Ama ilk projede bu araçlardan biri zorunlu değildir; basit bir Makefile veya shell script bile işe yarar.

## Experiment tracking: ne denediğini bilmek

Model geliştirirken onlarca deneme yaparsın. Farklı hiperparametreler, farklı feature setleri, farklı preprocessing stratejileri. Bir noktadan sonra hangi deneyin hangi sonucu verdiğini hatırlamak zorlaşır. "En iyi modeli geçen hafta eğitmiştim ama parametreleri neydi?" sorusu tanıdık geliyordur.

Experiment tracking araçları her denemenin parametrelerini, metriklerini, çıktı dosyalarını ve hatta kodun o anki halini kaydeder. Bu sayede herhangi bir deneyi geri dönüp inceleyebilir veya tekrar edebilirsin.

### MLflow ile basit bir örnek

MLflow en yaygın açık kaynak experiment tracking araçlarından biridir. Kurulumu basittir ve lokal olarak çalışabilir.

```python
import mlflow
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, precision_score, recall_score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

with mlflow.start_run(run_name="rf_baseline"):
    params = {"n_estimators": 200, "max_depth": 10, "min_samples_leaf": 5}
    mlflow.log_params(params)

    model = RandomForestClassifier(**params)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    f1 = f1_score(y_test, predictions)
    precision = precision_score(y_test, predictions)
    recall = recall_score(y_test, predictions)

    mlflow.log_metrics({"f1": f1, "precision": precision, "recall": recall})
    mlflow.sklearn.log_model(model, "model")

    print(f"F1: {f1:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}")
```

Bu kod çalıştığında MLflow bir "run" kaydı oluşturur. Parametreler, metrikler ve model dosyası birlikte saklanır. `mlflow ui` komutuyla tarayıcıda tüm deneyleri tablo halinde görebilir, karşılaştırabilirsin.

### Weights & Biases (W&B) alternatifi

W&B (wandb) bulut tabanlı bir alternatiftir. MLflow'dan farkı, takım düzeyinde paylaşımın ve görselleştirmenin daha kolay olmasıdır. Ücretsiz kişisel plan da mevcuttur.

```python
import wandb

wandb.init(project="churn-prediction", name="rf_baseline")
wandb.config.update({"n_estimators": 200, "max_depth": 10})

# ... eğitim kodu ...

wandb.log({"f1": f1, "precision": precision, "recall": recall})
wandb.finish()
```

Her iki aracın da amacı aynıdır: deneyleri kayıt altına almak, karşılaştırmak ve tekrar edilebilir kılmak. Hangisini kullanacağın projenin ihtiyacına bağlıdır. Tek kişilik projede MLflow'un lokal modu yeterlidir. Ekip çalışmasında W&B'nin bulut dashboard'u işleri kolaylaştırır.

## Model registry: hangi model canlıda?

Experiment tracking deneyleri kaydeder. Model registry ise "bu modeli canlıya çıkarabiliriz" kararını resmileştirir.

Bir modelin hayat döngüsünü düşün:

- Eğitilir ve test edilir.
- Kabul edilir ve staging ortamına çıkar.
- Staging'de performansı doğrulanır.
- Production'a promote edilir.
- Yeni versiyon gelene kadar canlıda kalır.
- Yeni versiyon sorun çıkarırsa eski versiyona geri dönülür (rollback).

Model registry bu geçişleri yönetir. Her model versiyonunun hangi aşamada olduğunu takip eder. Bu sayede "canlıda hangi model var?" sorusunun cevabı her zaman nettir.

MLflow'un dahili model registry'si bu işlevi sağlar:

```python
import mlflow

# Modeli registry'ye kaydet
model_uri = "runs:/<run_id>/model"
mlflow.register_model(model_uri, "churn_model")

# Modeli staging'e taşı
client = mlflow.tracking.MlflowClient()
client.transition_model_version_stage(
    name="churn_model",
    version=3,
    stage="Staging"
)
```

Daha büyük sistemlerde model registry, CI/CD pipeline'ı ile entegre çalışır. Model staging'e geçtiğinde otomatik testler koşar; testler geçerse production'a promote edilir.

## CI/CD: model için sürekli entegrasyon ve dağıtım

Yazılım geliştirmede CI/CD alışkanlık haline gelmiş bir pratiktir. Kod push edilir, testler otomatik koşar, başarılıysa deployment yapılır. ML projelerinde bu döngüye birkaç ek adım eklenir.

Bir ML CI/CD pipeline'ı genelde şu adımları içerir:

1. Kod değişikliği push edilir (git push).
2. Unit testler koşar: preprocessing fonksiyonları, feature hesaplama, veri doğrulama.
3. Eğitim scripti çalışır (küçük veri alt kümesiyle veya tam veriyle).
4. Metrikler hesaplanır ve baseline ile karşılaştırılır.
5. Model dosyası paketlenir.
6. Staging ortamına deploy edilir.
7. Integration testler koşar: API'ye istek gider, yanıt formatı kontrol edilir.
8. Onay sonrası production'a promote edilir.

GitHub Actions ile basitleştirilmiş bir örnek:

```yaml
name: ML Pipeline
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'data/config/**'

jobs:
  train-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run data validation
        run: python scripts/validate_data.py

      - name: Train model
        run: python scripts/train.py --config configs/production.yaml

      - name: Evaluate model
        run: python scripts/evaluate.py --threshold 0.75

      - name: Build Docker image
        run: docker build -t churn-model:${{ github.sha }} .

      - name: Push to registry
        run: |
          docker tag churn-model:${{ github.sha }} registry.example.com/churn-model:latest
          docker push registry.example.com/churn-model:latest
```

Burada her push'ta veri doğrulama, eğitim, değerlendirme ve Docker image oluşturma otomatik yapılır. `evaluate.py` adımında metrikler bir eşiğin altında kalırsa pipeline başarısız olur ve deploy gerçekleşmez.

ML CI/CD'nin yazılım CI/CD'sinden farklılaştığı noktalar:

- Testlerin bir kısmı deterministik değildir; model metriği her çalıştırmada küçük fark gösterebilir.
- Eğitim süresi uzun olabilir; her commit'te tam eğitim yerine smoke test (küçük veri setinde hızlı çalıştırma) tercih edilebilir.
- Veri değişikliği de pipeline'ı tetikleyebilir; sadece kod değişikliğine bağlı kalınmamalıdır.

## Docker ile model konteynerleştirme

Model dosyası ve tahmin kodunu tek bir yere paketlemek deployment'ı tahmin edilebilir kılar. Docker bu işin standart aracı haline gelmiştir. Konteyner içinde Python versiyonu, kütüphane versiyonları ve model dosyası sabittir; "benim makinemde çalışıyordu" problemi ortadan kalkar.

Basit bir model servisi için Dockerfile:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY model/ ./model/
COPY src/ ./src/

EXPOSE 8000
CMD ["uvicorn", "src.serve:app", "--host", "0.0.0.0", "--port", "8000"]
```

Burada `src/serve.py` dosyası FastAPI veya Flask ile yazılmış bir tahmin servisidir:

```python
from fastapi import FastAPI
import joblib
import numpy as np

app = FastAPI()
model = joblib.load("model/churn_model.pkl")

@app.post("/predict")
def predict(features: dict):
    X = np.array([list(features.values())])
    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0].tolist()
    return {
        "prediction": int(prediction),
        "probability": probability,
    }
```

Bu yapıda model, kodu ve bağımlılıklarıyla birlikte tek bir imaj olarak paketlenir. İmajı herhangi bir sunucuda, Kubernetes cluster'ında veya bulut servisinde çalıştırabilirsin.

Docker imajını küçük tutmak için birkaç ipucu:

- `python:3.11-slim` gibi minimal base image kullanmak.
- Gereksiz dosyaları `.dockerignore` ile hariç tutmak.
- `pip install --no-cache-dir` ile cache dosyalarını temizlemek.
- Multi-stage build ile sadece runtime'da gereken dosyaları final imaja taşımak.

## Deployment kalıpları: batch mı, real-time mı?

Model deploy etmenin tek bir yolu yoktur. Kullanım senaryosu deployment kalıbını belirler.

### Real-time (online) inference

Kullanıcı bir istek gönderir, model anında tahmin üretir ve yanıt döner. E-ticaret ürün tavsiyesi, fraud detection, arama sıralaması gibi uygulamalarda kullanılır.

Özellikler:

- Düşük gecikme süresi gerekir (genellikle 100ms altı).
- Model bellekte yüklü kalır.
- API olarak sunulur (REST veya gRPC).
- Yük dengeleme ve ölçekleme gerekebilir.

### Batch inference

Model belirli aralıklarla büyük veri kümesi üzerinde çalışır ve sonuçları bir yere yazar. Günlük churn skoru hesaplama, haftalık müşteri segmentasyonu, aylık kredi risk puanlama gibi işlerde kullanılır.

Özellikler:

- Gecikme süresi önemli değildir (dakikalar veya saatler kabul edilebilir).
- Zamanlayıcı (cron, Airflow) ile tetiklenir.
- Sonuçlar veritabanına veya dosya sistemine yazılır.
- Hesaplama kaynağı geçici olabilir; iş bitince kapanır.

### Hangisi ne zaman?

Karar genelde şu soruya bağlıdır: Kullanıcı tahmin sonucunu ne zaman görmeli?

- Anlık yanıt gerekiyorsa real-time.
- Sonuç önceden hazırlanabiliyorsa batch.
- İkisi de gerekiyorsa hibrit: batch ile günlük skorları hesapla, real-time ile anlık tetiklenen durumları yakala.

Batch inference genelde daha kolay başlanır. Bir Python scripti zamanlayıcıyla çalıştırılır ve sonuçlar tabloya yazılır. Real-time inference daha fazla altyapı gerektirir: API sunucusu, yük dengeleyici, sağlık kontrolü ve ölçekleme.

## Adım adım: notebook'tan production'a geçiş

Bir modeli production'a taşımak için tekil bir doğru yol yoktur. Ama genel bir yol haritası çizmek mümkündür:

1. Notebook kodunu modüllere ayır: `preprocess.py`, `train.py`, `evaluate.py`, `predict.py`.
2. Experiment tracking kur: MLflow veya W&B ile her deneyi kaydet.
3. Eğitim pipeline'ını tekrar edilebilir yap: parametreleri config dosyasından oku, rastgele seed'leri sabitle, veri kaynağını netleştir.
4. Preprocessing kodunu eğitim ve tahmin arasında paylaş: aynı fonksiyonu her iki yerde çağır, ayrı ayrı yazma.
5. Model dosyasını registry'ye kaydet: versiyonla, staging/production etiketle.
6. Tahmin servisini yaz: FastAPI veya Flask ile basit bir API.
7. Docker ile paketlenme: tüm bağımlılıklar ve model dosyası konteyner içinde.
8. CI/CD pipeline'ı kur: push → test → eğitim → değerlendirme → deploy.
9. Basit sağlık kontrolü ekle: API'nin ayakta olup olmadığını, model dosyasının yüklenip yüklenmediğini kontrol et.
10. İzleme katmanını planla: bu yazının devamı olarak model monitoring yazısına bakabilirsin.

Bu adımların hepsini bir günde yapmak zorunda değilsin. İlk hedef tekrar edilebilir bir eğitim pipeline'ı ve çalışan bir tahmin servisidir.

## Sık yapılan hatalar

**Preprocessing kodunu iki kez yazmak.** Eğitim tarafında Pandas ile feature hesaplanır, tahmin tarafında farklı bir kütüphane veya farklı bir mantıkla yazılır. Küçük farklar modelin canlıda kötü çalışmasına neden olur. Çözüm: preprocessing mantığını tek bir modülde topla, her iki taraftan aynı fonksiyonu çağır.

**Modeli dosya olarak paylaşmak.** Model dosyasını Slack'ten veya paylaşılan klasörden almak sürüm karışıklığına yol açar. Hangi dosyanın hangi deneye ait olduğu belirsizleşir. Model registry bu sorunu çözer.

**Her commit'te tam eğitim yapmak.** Eğitim süresi uzun olabilir. CI pipeline'ında her commit'te tam eğitim yapmak hem zaman kaybı hem de kaynak israfıdır. Bunun yerine kod değişikliklerinde smoke test (küçük veri setiyle hızlı doğrulama), büyük değişikliklerde tam eğitim tetiklenebilir.

**Docker imajına gereksiz dosya eklemek.** Eğitim verisini, notebook dosyalarını veya dev bağımlılıklarını imaja dahil etmek imaj boyutunu gereksiz büyütür. `.dockerignore` dosyası ve multi-stage build bu sorunu azaltır.

**Rollback planı yapmamak.** Yeni model canlıya çıktığında performansı düşebilir. Eski modele geri dönüş mekanizması yoksa problem büyür. Model registry'de önceki versiyonu "Production" olarak işaretlemek basit bir rollback yöntemidir.

**Monitoring'i sonraya bırakmak.** Model canlıya çıkmadan önce en azından hangi verilerin loglanacağını planlamak gerekir. Geriye dönük log olmadan sorun teşhisi çok zorlaşır. Bu konuyu ayrıntılı olarak "Model Monitoring ve Veri Drift" yazısında ele aldım.

## Araç seçimi: her şeyi kullanmak zorunda değilsin

MLOps araç ekosistemi geniştir ve ilk bakışta bunaltıcı olabilir. Experiment tracking, pipeline orchestration, feature store, model registry, serving framework, monitoring platformu... Hepsini aynı anda kurmaya çalışmak projeyi karmaşıklaştırır.

Proje boyutuna göre farklı seviyelerde başlanabilir:

**Kişisel proje veya prototip:** Git + MLflow (lokal mod) + Makefile + Docker. Bu dört araç bile ciddi bir fark yaratır. Eğitim tekrar edilebilir, deneyler kayıtlı, model paketlenmiş olur.

**Küçük ekip:** Git + MLflow (sunucu modunda) + GitHub Actions + Docker + basit bir serving çözümü (FastAPI). Model registry MLflow içinde kullanılabilir.

**Büyük ekip veya ürün:** Bunlara ek olarak pipeline orchestration (Airflow, Kubeflow), feature store, model monitoring platformu ve A/B test altyapısı gerekebilir.

Her seviyede önemli olan nokta, araç sayısını artırmak değil, mevcut araçları düzgün kullanmaktır. MLflow kurulu ama kimse deney kaydetmiyorsa aracın varlığı bir şey değiştirmez.

## Sonuç

Bir ML modelini notebook'tan production'a taşımak sadece bir kez yapılan bir iş değildir. Model güncellenir, veri değişir, iş gereksinimi farklılaşır. Bu yüzden sürdürülebilir bir pipeline kurmak tek seferlik deploy'dan daha önemlidir.

Bu yazıda anlattığım adımların tamamını ilk günde uygulamaya gerek yoktur. İlk adım notebook kodunu modüllere ayırmak ve experiment tracking kurmaktır. Sonraki adımlar projenin ihtiyaçlarına göre eklenir.

Modelini canlıya çıkardıktan sonra ne izlemen gerektiğini merak ediyorsan "Model Monitoring ve Veri Drift" yazısına bakabilirsin. İki yazı birlikte, bir modelin geliştirilmesinden canlıda sürdürülmesine kadar olan süreci tamamlar.

## Kaynaklar

- Google, "MLOps: Continuous delivery and automation pipelines in machine learning": https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning
- MLflow Documentation, "MLflow Tracking": https://mlflow.org/docs/latest/tracking.html
- Sculley et al., "Hidden Technical Debt in Machine Learning Systems": https://papers.nips.cc/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html
- Huyen, Chip, "Designing Machine Learning Systems" (O'Reilly, 2022): https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/
