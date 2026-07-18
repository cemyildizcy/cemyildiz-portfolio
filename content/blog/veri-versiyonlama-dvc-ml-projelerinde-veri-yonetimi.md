---
title: "Veri Versiyonlama ve DVC: ML Projelerinde Veriyi Yönetmenin Doğru Yolu"
date: "2026-07-15"
tags: ["DVC", "Veri Yönetimi", "MLOps", "Versiyonlama", "Reproducibility"]
readTime: "12 dk"
coverEmoji: "📦"
description: "Data Version Control (DVC) ile ML projelerinde veri ve model versiyonlama: pipeline tekrarlanabilirliği, uzak depolama entegrasyonu ve pratik DVC komutları."
---

# Veri Versiyonlama ve DVC: ML Projelerinde Veriyi Yönetmenin Doğru Yolu

Makine öğrenmesi projelerinde kod versiyonlama artık standart bir pratik haline geldi. Git ile her değişikliği takip edebiliyor, dallar arasında geçiş yapabiliyor ve ekip arkadaşlarımızla sorunsuz bir şekilde iş birliği kurabiliyoruz. Ancak bir ML projesinin en kritik bileşeni olan **veri** söz konusu olduğunda, aynı disiplini sağlamak çoğu zaman göz ardı ediliyor.

Bu yazıda, ML projelerinde veri versiyonlamanın neden hayati önem taşıdığını, **DVC (Data Version Control)** aracının temel konseptlerini ve pratik kullanımını detaylı bir şekilde ele alacağız.

## Neden Veri Versiyonlama?

Bir ML projesinde modelin performansını belirleyen üç temel faktör vardır: **algoritma**, **hiperparametreler** ve **veri**. Kod tarafını Git ile mükemmel bir şekilde yönetebilirken, veri tarafında şu sorunlarla sıklıkla karşılaşırız:

- **Tekrarlanabilirlik sorunu:** Üç ay önce eğittiğiniz modelin aynı sonuçları vermesini istiyorsunuz, ancak eğitim verisinin o anki halini bulamıyorsunuz.
- **Veri sürüm takibi eksikliği:** Veri setinde yapılan temizleme, zenginleştirme veya filtreleme işlemlerinin geçmişi kayboluyor.
- **Ekip içi tutarsızlık:** Farklı ekip üyeleri farklı veri sürümleriyle çalışıyor ve sonuçlar birbiriyle karşılaştırılamaz hale geliyor.
- **Depolama ve paylaşım güçlüğü:** Büyük veri dosyaları Git deposuna sığmıyor, paylaşım USB disk veya e-posta ile yapılıyor.

Bu sorunların her biri, bir ML projesinin güvenilirliğini ve sürdürülebilirliğini doğrudan tehdit eder. İşte tam bu noktada **DVC** devreye girer.

## DVC Nedir?

**DVC (Data Version Control)**, açık kaynaklı bir veri ve model versiyonlama aracıdır. Git'in üzerine inşa edilmiş olan DVC, büyük dosyaları, veri setlerini ve ML pipeline'larını versiyonlamak için tasarlanmıştır. Temel felsefesi şudur: **Git kodu versiyonlar, DVC veriyi versiyonlar.**

DVC'nin öne çıkan özellikleri şunlardır:

- **Git uyumlu çalışma:** DVC, `.dvc` uzantılı küçük meta dosyaları Git deposunda saklar. Gerçek veri dosyaları ise uzak depolama alanlarında (remote storage) tutulur.
- **Depolama bağımsızlığı:** Amazon S3, Google Cloud Storage, Azure Blob Storage, SSH sunucuları ve hatta yerel dosya sistemi gibi çeşitli depolama backend'leriyle çalışabilir.
- **Pipeline yönetimi:** Veri işleme adımlarını tanımlayıp, tekrarlanabilir pipeline'lar oluşturmanıza olanak tanır.
- **Hafif yapı:** DVC, veri dosyalarının kendisini değil, yalnızca hash değerlerini ve meta bilgilerini Git'te saklar.

### DVC Kurulumu

DVC'yi kurmak oldukça basittir. Python paket yöneticisi pip ile kurulum yapabilirsiniz:

```bash
# Temel kurulum
pip install dvc

# Uzak depolama desteği ile kurulum
pip install dvc[s3]      # Amazon S3 desteği
pip install dvc[gs]      # Google Cloud Storage desteği
pip install dvc[azure]   # Azure Blob Storage desteği
pip install dvc[all]     # Tüm depolama backend'leri
```

Kurulumdan sonra, mevcut bir Git deposunda DVC'yi başlatabilirsiniz:

```bash
cd ml-projem
git init
dvc init
```

Bu komut, `.dvc/` dizinini ve gerekli yapılandırma dosyalarını oluşturur.

## DVC ile Temel İş Akışı

DVC'nin günlük kullanımı Git ile benzer bir deneyim sunar. Temel iş akışını adım adım inceleyelim:

### 1. Veri Dosyasını Takibe Alma

```bash
# Büyük veri dosyasını DVC ile takibe al
dvc add data/train.csv

# Bu komut iki şey yapar:
# 1. data/train.csv.dvc meta dosyasını oluşturur
# 2. data/train.csv dosyasını .gitignore'a ekler
```

Oluşturulan `.dvc` dosyası şuna benzer:

```yaml
outs:
  - md5: a1b2c3d4e5f6...
    size: 524288000
    path: train.csv
```

### 2. Değişiklikleri Git ile Kaydetme

```bash
# Meta dosyaları Git'e ekle
git add data/train.csv.dvc data/.gitignore
git commit -m "feat: eğitim verisinin ilk sürümü eklendi"
```

### 3. Uzak Depolama Yapılandırması

```bash
# S3 bucket'ını uzak depolama olarak ayarla
dvc remote add -d myremote s3://my-bucket/dvc-storage

# Yapılandırmayı Git'e kaydet
git add .dvc/config
git commit -m "chore: DVC uzak depolama yapılandırması"
```

### 4. Veriyi Uzak Depoya Gönderme ve Çekme

```bash
# Veriyi uzak depoya gönder
dvc push

# Başka bir makinede veriyi çek
dvc pull
```

Bu iş akışı sayesinde, ekipteki herkes aynı veri sürümüne kolayca erişebilir.

## DVC vs Git LFS: Hangisini Tercih Etmeli?

Büyük dosyaları versiyonlamak için sıklıkla karşılaştırılan iki araç **DVC** ve **Git LFS** (Large File Storage) arasındaki farkları anlamak, doğru aracı seçmek için önemlidir.

| Özellik | DVC | Git LFS |
|---|---|---|
| **Tasarım amacı** | ML projeleri için veri ve pipeline yönetimi | Genel amaçlı büyük dosya depolama |
| **Depolama esnekliği** | S3, GCS, Azure, SSH, yerel ve daha fazlası | Git sunucusuna bağımlı (GitHub, GitLab) |
| **Pipeline desteği** | Var (`dvc.yaml` ile DAG tanımlama) | Yok |
| **Maliyet** | Kendi depolamanızı kullanırsınız | Git sunucusu kotalarına tabi |
| **Deneyler ve metrikler** | `dvc experiments` ile entegre | Yok |
| **Öğrenme eğrisi** | Orta (ML kavramlarına aşinalık gerektirir) | Düşük (Git'e benzer) |

**Özet:** Eğer yalnızca büyük dosyaları Git'te saklamak istiyorsanız Git LFS yeterli olabilir. Ancak ML projelerinde veri pipeline'ları, deney takibi ve tekrarlanabilirlik gibi ihtiyaçlarınız varsa, DVC çok daha kapsamlı bir çözüm sunar.

## Uzak Depolama Backend'leri

DVC'nin en güçlü yönlerinden biri, çeşitli depolama çözümleriyle entegre çalışabilmesidir. Projenizin altyapısına göre en uygun backend'i seçebilirsiniz.

### Amazon S3

```bash
dvc remote add -d s3remote s3://ml-data-bucket/dvc-cache
dvc remote modify s3remote region eu-west-1

# Kimlik doğrulama (AWS CLI yapılandırması ile)
aws configure
```

S3, AWS ekosisteminde çalışan ekipler için en doğal seçimdir. IAM politikaları ile granüler erişim kontrolü sağlayabilirsiniz.

### Google Cloud Storage (GCS)

```bash
dvc remote add -d gcsremote gs://ml-data-bucket/dvc-cache

# Kimlik doğrulama
gcloud auth application-default login
```

GCS, özellikle Vertex AI veya Google Colab ile çalışan ekipler için ideal bir seçenektir.

### Azure Blob Storage

```bash
dvc remote add -d azureremote azure://ml-container/dvc-cache
dvc remote modify azureremote account_name mystorageaccount
```

Azure ekosistemindeki projeler için Azure Blob Storage, hem maliyet hem de performans açısından uygun bir tercih olabilir.

### Yerel veya SSH Depolama

Bulut hizmetleri kullanmak istemiyorsanız, yerel bir sunucu veya SSH erişimine sahip bir makine de uzak depolama olarak yapılandırılabilir:

```bash
# Yerel depolama
dvc remote add -d localremote /mnt/shared/dvc-storage

# SSH depolama
dvc remote add -d sshremote ssh://user@server.com/path/to/storage
```

## DVC Pipeline'ları ve Tekrarlanabilirlik

DVC'nin salt bir depolama aracı olmadığını gösteren en önemli özellik, **pipeline yönetimi**dir. `dvc.yaml` dosyasında veri işleme adımlarınızı tanımlayarak, uçtan uca tekrarlanabilir iş akışları oluşturabilirsiniz.

### Pipeline Tanımlama

```yaml
# dvc.yaml
stages:
  prepare:
    cmd: python src/prepare.py
    deps:
      - src/prepare.py
      - data/raw/
    outs:
      - data/prepared/

  featurize:
    cmd: python src/featurize.py
    deps:
      - src/featurize.py
      - data/prepared/
    outs:
      - data/features/

  train:
    cmd: python src/train.py
    deps:
      - src/train.py
      - data/features/
    outs:
      - models/model.pkl
    metrics:
      - metrics/scores.json:
          cache: false
    params:
      - params.yaml:
          - train.learning_rate
          - train.n_estimators
```

Bu yapıda her `stage` bir adımı temsil eder. `deps` bağımlılıkları, `outs` çıktıları, `metrics` ise takip edilecek metrikleri belirtir.

### Pipeline Çalıştırma

```bash
# Tüm pipeline'ı çalıştır
dvc repro

# Belirli bir aşamayı çalıştır
dvc repro train

# Pipeline grafiğini görüntüle
dvc dag
```

`dvc repro` komutu, yalnızca değişen aşamaları yeniden çalıştırır. Eğer veri veya kod değişmediyse, DVC bu aşamayı atlayarak zaman kazandırır. Bu yaklaşım, büyük projelerde önemli bir verimlilik sağlar.

### Deney Karşılaştırma

DVC, farklı hiperparametre kombinasyonlarını denemenize ve sonuçları karşılaştırmanıza olanak tanır:

```bash
# Metrikleri görüntüle
dvc metrics show

# İki dal arasında metrikleri karşılaştır
dvc metrics diff main feature-branch

# Deney başlat
dvc experiments run --set-param train.learning_rate=0.01

# Deneyleri listele ve karşılaştır
dvc experiments show
dvc experiments diff
```

## MLflow ve CML ile Entegrasyon

DVC, tek başına güçlü bir araç olmakla birlikte, MLOps ekosistemindeki diğer araçlarla birlikte kullanıldığında çok daha etkili hale gelir.

### MLflow Entegrasyonu

MLflow, deney takibi ve model kaydı için yaygın olarak kullanılan bir platformdur. DVC pipeline'larınızın çıktılarını MLflow'a kaydetmek, merkezi bir deney takip sistemi oluşturmanıza yardımcı olur:

```python
# src/train.py içinde
import mlflow
import json

mlflow.set_tracking_uri("http://mlflow-server:5000")
mlflow.set_experiment("sentiment-analysis")

with mlflow.start_run():
    # Model eğitimi
    model = train_model(X_train, y_train, params)

    # Metrikleri MLflow'a kaydet
    mlflow.log_param("learning_rate", params["learning_rate"])
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("f1_score", f1)

    # Modeli MLflow'a kaydet
    mlflow.sklearn.log_model(model, "model")

    # Aynı metrikleri DVC için de kaydet
    with open("metrics/scores.json", "w") as f:
        json.dump({"accuracy": accuracy, "f1_score": f1}, f)
```

Bu yaklaşımda DVC pipeline tekrarlanabilirliği sağlarken, MLflow deney takibi ve model kayıt defteri görevi üstlenir.

### CML (Continuous Machine Learning) Entegrasyonu

**CML**, Iterative.ai tarafından geliştirilen (DVC ile aynı ekip) ve CI/CD pipeline'larında ML deneylerini otomatikleştiren bir araçtır. GitHub Actions veya GitLab CI ile birlikte kullanıldığında, her pull request'te model performansını otomatik olarak raporlar:

```yaml
# .github/workflows/cml.yaml
name: CML ile Model Değerlendirme
on: pull_request

jobs:
  train-and-report:
    runs-on: ubuntu-latest
    container: ghcr.io/iterative/cml:0-dvc3-base1
    steps:
      - uses: actions/checkout@v4
      - name: Veriyi çek ve pipeline'ı çalıştır
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          pip install -r requirements.txt
          dvc pull
          dvc repro

      - name: CML Raporu Oluştur
        env:
          REPO_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "## Model Performans Raporu" >> report.md
          echo "" >> report.md
          dvc metrics diff --md main >> report.md
          echo "" >> report.md
          echo "### Metrik Karşılaştırması" >> report.md
          dvc plots diff --target metrics/scores.json >> report.md
          cml comment create report.md
```

Bu yapılandırma sayesinde, her pull request'e otomatik olarak model performans raporu eklenir. Code review sürecinde, yalnızca kod değil, model performansı üzerindeki etkiler de değerlendirilebilir.

## Pratik İpuçları ve En İyi Uygulamalar

DVC'yi verimli bir şekilde kullanmak için aşağıdaki pratiklere dikkat etmenizi öneririm:

1. **Anlamlı commit mesajları yazın:** Veri değişikliklerini commit ederken, hangi verinin neden değiştiğini açıkça belirtin. Örneğin: `"data: eğitim setine 5000 yeni etiketli örnek eklendi"`.

2. **Parametre dosyalarını kullanın:** Hiperparametreleri `params.yaml` dosyasında tutarak, her değişikliği izlenebilir hale getirin.

3. **Cache mekanizmasını anlayın:** DVC, hash tabanlı bir cache sistemi kullanır. Aynı dosya tekrar işlendiğinde cache'den döner, bu da disk alanı ve süre tasarrufu sağlar.

4. **`.dvcignore` dosyasını kullanın:** Takip edilmesini istemediğiniz dosya ve dizinleri `.dvcignore` dosyasına ekleyerek gereksiz işlem yükünden kaçının.

5. **Etiketleme (tagging) stratejisi belirleyin:** Önemli veri sürümlerini Git etiketleri ile işaretleyin: `git tag -a v1.0-data -m "İlk temizlenmiş veri seti"`.

6. **CI/CD entegrasyonunu erken kurun:** CML veya benzeri araçlarla otomatik test ve raporlama mekanizmalarını projenin başında yapılandırın.

## Sonuç

Veri versiyonlama, modern ML projelerinin olmazsa olmaz bir bileşenidir. **DVC**, bu ihtiyacı Git ekosistemiyle uyumlu, esnek ve ölçeklenebilir bir şekilde karşılayan güçlü bir araçtır. Pipeline tekrarlanabilirliği, uzak depolama desteği ve deney yönetimi gibi özellikleriyle, bireysel araştırmacılardan kurumsal ekiplere kadar geniş bir kullanıcı kitlesine hitap eder.

Eğer ML projelerinizde "bu model hangi veriyle eğitilmişti?" sorusunu sormaktan yorulduysanız, DVC'yi iş akışınıza entegre etmenin tam zamanıdır.

---

## Kaynaklar

1. **DVC Resmi Dokümantasyonu** — [https://dvc.org/doc](https://dvc.org/doc) — DVC'nin kurulumu, kullanımı ve ileri düzey özellikleri hakkında kapsamlı kaynak.

2. **Iterative.ai Blog — "Versioning Data and Models"** — [https://iterative.ai/blog/data-versioning](https://iterative.ai/blog/data-versioning) — Veri versiyonlamanın ML projelerindeki önemine dair detaylı blog yazısı.

3. **Google Cloud Architecture Center — "MLOps: Continuous Delivery and Automation Pipelines in Machine Learning"** — [https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning) — MLOps pratiklerinde veri yönetimi ve pipeline otomasyonu üzerine Google'ın referans mimarisi.

4. **CML (Continuous Machine Learning) Dokümantasyonu** — [https://cml.dev/doc](https://cml.dev/doc) — CI/CD pipeline'larında ML deneylerini otomatikleştirmek için CML kullanım rehberi.
