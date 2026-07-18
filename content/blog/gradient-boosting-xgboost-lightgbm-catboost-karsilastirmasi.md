---
title: "Gradient Boosting Derinlemesine: XGBoost, LightGBM ve CatBoost Karşılaştırması"
date: "2026-07-17"
tags: ["Gradient Boosting", "XGBoost", "LightGBM", "CatBoost", "Makine Öğrenmesi"]
readTime: "14 dk"
coverEmoji: "🎯"
description: "Gradient boosting algoritmasının temelleri, XGBoost/LightGBM/CatBoost farkları, benchmark sonuçları ve hangi durumda hangisini seçmelisiniz."
---

Kaggle yarışmalarının vazgeçilmezi, tabular veri problemlerinin tartışmasız şampiyonu: **gradient boosting**. Peki bu algoritma ailesinin arkasında ne yatıyor? XGBoost, LightGBM ve CatBoost arasında nasıl bir seçim yapmalıyız? Bu yazıda gradient boosting'in matematiksel temellerinden başlayarak üç büyük kütüphanenin iç mekanizmalarını, benchmark sonuçlarını ve pratik kullanım senaryolarını derinlemesine inceleyeceğiz.

## Gradient Boosting Nedir?

Gradient boosting, **ensemble learning** (topluluk öğrenmesi) yöntemlerinden biridir. Temel fikir oldukça zariftir: zayıf öğrenicileri (genellikle sığ karar ağaçları) sıralı olarak eğitip, her yeni modelin bir öncekinin hatalarını düzeltmesini sağlamak.

### Matematiksel Temel

Gradient boosting'in çalışma prensibini adım adım inceleyelim:

1. **Başlangıç tahmini**: İlk model olarak basit bir tahmin yapılır (örneğin, regresyonda hedef değişkenin ortalaması).
2. **Residual hesaplama**: Gerçek değerler ile tahminler arasındaki fark (residual) hesaplanır.
3. **Yeni ağaç eğitimi**: Bu residual'lara fit edilen yeni bir karar ağacı eklenir.
4. **Tahmin güncelleme**: Önceki tahmine yeni ağacın çıktısı (learning rate ile çarpılarak) eklenir.
5. **Tekrar**: İşlem belirli bir iterasyon sayısına ulaşana veya erken durdurma tetiklenene kadar devam eder.

Formül olarak ifade edersek:

```
F_m(x) = F_{m-1}(x) + η * h_m(x)
```

Burada `F_m(x)` m'inci adımdaki toplam tahmin, `η` learning rate ve `h_m(x)` yeni eklenen zayıf öğrenicidir.

### Kayıp Fonksiyonu ve Gradient Descent

"Gradient" kelimesi, kayıp fonksiyonunun gradyanının (türevinin) kullanılmasından gelir. Her adımda, kayıp fonksiyonunun negatif gradyanı yönünde bir adım atılır — tıpkı klasik gradient descent'te olduğu gibi, ancak burada fonksiyon uzayında optimizasyon yapılmaktadır.

Regresyon için MSE kayıp fonksiyonu kullandığımızda negatif gradyan tam olarak residual'lara eşittir. Sınıflandırma için ise log-loss kullanıldığında, her adımda log-odds üzerinden güncelleme yapılır.

## XGBoost: Extreme Gradient Boosting

Tianqi Chen tarafından 2014 yılında geliştirilen XGBoost, gradient boosting'i hem algoritmik hem de sistem düzeyinde optimize eden bir kütüphanedir.

### XGBoost'un Temel Yenilikleri

**Regularization (Düzenlileştirme):** XGBoost, geleneksel gradient boosting'den farklı olarak amaç fonksiyonuna L1 (Lasso) ve L2 (Ridge) regularization terimleri ekler:

```
Obj = Σ L(y_i, ŷ_i) + Σ Ω(f_k)
```

Burada `Ω(f) = γT + ½λ||w||²` ifadesinde `T` yaprak sayısı ve `w` yaprak ağırlıklarıdır. Bu mekanizma overfitting'i önemli ölçüde azaltır.

**Weighted Quantile Sketch:** Sürekli değişkenler için en iyi split noktalarını bulmak O(n log n) maliyetlidir. XGBoost, approximate split finding algoritması ile ağırlıklı quantile sketch kullanarak bu işlemi hızlandırır.

**Sparsity-Aware Split Finding:** Eksik değerler (missing values) için varsayılan yönleri otomatik olarak öğrenir. Her split noktasında, eksik değerlerin sola mı sağa mı gideceğini deneyerek optimal yönü bulur.

**Column Block ve Cache-Aware Access:** Veri, sıralanmış sütun blokları halinde saklanarak paralel split hesaplamasına olanak tanır. Ayrıca cache-aware erişim düzeni ile CPU cache'lerinden maksimum verim alınır.

### XGBoost Pratik Kullanım

```python
import xgboost as xgb
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=10000, n_features=20, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

params = {
    'objective': 'binary:logistic',
    'max_depth': 6,
    'learning_rate': 0.1,
    'n_estimators': 500,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'reg_alpha': 0.1,      # L1 regularization
    'reg_lambda': 1.0,      # L2 regularization
    'eval_metric': 'logloss',
    'early_stopping_rounds': 50,
    'tree_method': 'hist',   # Histogram-based (daha hızlı)
}

model = xgb.XGBClassifier(**params)
model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=50)
```

## LightGBM: Light Gradient Boosting Machine

Microsoft Research tarafından 2017'de yayımlanan LightGBM, özellikle büyük veri setlerinde hız ve bellek verimliliği konusunda çığır açan iki teknik sunar.

### GOSS: Gradient-based One-Side Sampling

Geleneksel gradient boosting tüm veri noktalarını kullanır. Ancak küçük gradyanlı örnekler zaten iyi tahmin edilmektedir. GOSS bu gözleme dayanır:

1. Tüm örnekleri gradyan büyüklüğüne göre sıralar.
2. En büyük gradyanlı üst %a örnekleri tutar (bilgi açısından en değerli olanlar).
3. Kalan örneklerden rastgele %b oranında seçim yapar.
4. Seçilen küçük gradyanlı örneklerin ağırlığını `(1-a)/b` ile çarparak dağılımı korur.

Bu yaklaşım, bilgi kaybını minimize ederken eğitim hızını dramatik şekilde artırır.

### EFB: Exclusive Feature Bundling

Yüksek boyutlu sparse veri setlerinde birçok özellik birbirini dışlar (aynı anda sıfır olmayan değer taşımaz). EFB bu tür özellikleri bir araya gruplar:

- Özellik çatışma grafiği oluşturulur
- Graph coloring benzeri bir algoritma ile çatışması düşük özellikler aynı bundle'a atanır
- Bundle'daki özellikler offset eklenerek tek bir özelliğe dönüştürülür

Bu sayede özellik sayısı azalır ve split bulma işlemi hızlanır.

### Leaf-wise Büyüme Stratejisi

XGBoost varsayılan olarak **level-wise** (seviye bazlı) ağaç büyütür — her seviyedeki tüm yapraklar genişletilir. LightGBM ise **leaf-wise** (yaprak bazlı) strateji kullanır: en yüksek kayıp azalmasına sahip yaprağı seçer ve onu böler.

Leaf-wise büyüme aynı yaprak sayısına daha az iterasyonla ulaşır, ancak `max_depth` sınırlaması dikkatli ayarlanmazsa overfitting'e yol açabilir.

### LightGBM Pratik Kullanım

```python
import lightgbm as lgb

params = {
    'objective': 'binary',
    'metric': 'binary_logloss',
    'boosting_type': 'gbdt',
    'num_leaves': 63,           # leaf-wise için kritik parametre
    'learning_rate': 0.05,
    'feature_fraction': 0.8,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'verbose': -1,
}

dtrain = lgb.Dataset(X_train, label=y_train)
dvalid = lgb.Dataset(X_test, label=y_test, reference=dtrain)

model = lgb.train(
    params,
    dtrain,
    num_boost_round=1000,
    valid_sets=[dvalid],
    callbacks=[lgb.early_stopping(50), lgb.log_evaluation(100)]
)
```

## CatBoost: Categorical Boosting

Yandex tarafından 2017'de geliştirilen CatBoost, özellikle kategorik değişkenler ve prediction shift problemi üzerine odaklanır.

### Ordered Boosting

Geleneksel gradient boosting'de **target leakage** (hedef sızıntısı) sorunu vardır: residual'ları hesaplarken aynı veri noktası hem eğitim hem de tahmin için kullanılır. CatBoost bunu **ordered boosting** ile çözer:

1. Veri rastgele bir permütasyona göre sıralanır.
2. Her örnek için, yalnızca permütasyonda kendisinden önce gelen örneklerle eğitilmiş model kullanılarak residual hesaplanır.
3. Bu işlem birden fazla permütasyon üzerinde tekrarlanarak varyans azaltılır.

Bu yaklaşım, özellikle küçük veri setlerinde overfitting'i belirgin şekilde azaltır.

### Kategorik Değişken İşleme

CatBoost'un en güçlü yönlerinden biri, kategorik özellikleri otomatik ve etkili şekilde işlemesidir. **Ordered Target Statistics** yöntemi kullanılır:

```
x_i^k = (Σ_{j: σ(j)<σ(i), x_j^k=x_i^k} y_j + a * prior) / (count + a)
```

Burada `σ` rastgele permütasyon, `a` smoothing parametresi ve `prior` ise hedef değişkenin global ortalamasıdır. Bu formül, her kategorik değer için o değere sahip *önceki* örneklerin hedef ortalamasını hesaplar — böylece target leakage önlenir.

Ayrıca CatBoost, kategorik özellik kombinasyonlarını otomatik olarak keşfeder. Ağaç büyütme sürecinde, mevcut kategorik özelliklerin birleşimleri yeni özellikler olarak değerlendirilir.

### Symmetric Trees

CatBoost, varsayılan olarak **oblivious decision trees** (simetrik karar ağaçları) kullanır. Bu ağaçlarda, aynı derinlikteki tüm düğümler aynı split koşulunu kullanır. Bu yapı:

- Tahmin süresini hızlandırır (branch prediction dostu)
- Overfitting'e karşı doğal regularization sağlar
- GPU'da paralel hesaplamaya olanak tanır

### CatBoost Pratik Kullanım

```python
from catboost import CatBoostClassifier

# Kategorik sütun indeksleri
cat_features = [0, 3, 7]  # kategorik değişken pozisyonları

model = CatBoostClassifier(
    iterations=1000,
    depth=6,
    learning_rate=0.1,
    loss_function='Logloss',
    eval_metric='AUC',
    cat_features=cat_features,
    auto_class_weights='Balanced',
    early_stopping_rounds=50,
    verbose=100,
)

model.fit(X_train, y_train, eval_set=(X_test, y_test))
```

## Üç Kütüphanenin Karşılaştırması

### Hız ve Bellek Karşılaştırması

| Özellik | XGBoost | LightGBM | CatBoost |
|---------|---------|----------|----------|
| Ağaç büyüme stratejisi | Level-wise (varsayılan) | Leaf-wise | Symmetric |
| Eğitim hızı (büyük veri) | Orta | En hızlı | Orta-yavaş |
| Bellek kullanımı | Orta | En düşük | Yüksek |
| GPU desteği | Var | Var | Var (güçlü) |
| Kategorik değişken desteği | Manuel encoding gerekli | Sınırlı native destek | En iyi native destek |
| Eksik değer işleme | Otomatik | Otomatik | Otomatik |
| Varsayılan performans | İyi | İyi | En iyi |

### Benchmark Sonuçları

Çeşitli akademik çalışmalar ve Kaggle deneyimleri, şu genel eğilimleri ortaya koyar:

**Büyük veri setlerinde (>100K satır):** LightGBM genellikle eğitim süresi açısından 2-5x daha hızlıdır. GOSS ve EFB'nin etkisi büyük veri setlerinde belirgin hale gelir.

**Kategorik ağırlıklı veri setlerinde:** CatBoost, one-hot encoding veya label encoding gerektirmeden doğrudan kategorik değişkenleri işleyerek hem kullanım kolaylığı hem de performans avantajı sağlar.

**Küçük veri setlerinde (<10K satır):** CatBoost'un ordered boosting mekanizması overfitting'i azaltır ve genellikle daha iyi genelleme performansı sunar.

**Hyperparameter hassasiyeti:** CatBoost varsayılan parametrelerle en iyi sonucu verme eğilimindedir. XGBoost ve LightGBM genellikle daha fazla hyperparameter tuning gerektirir.

### Hangi Durumda Hangisini Seçmeli?

**XGBoost tercih edin:**
- Geniş topluluk desteği ve dökümantasyon önemli olduğunda
- Scikit-learn pipeline'larıyla entegrasyon gerektiğinde
- Regularization üzerinde ince kontrol istediğinizde

**LightGBM tercih edin:**
- Büyük veri setleriyle çalışırken (milyonlarca satır)
- Eğitim hızı kritik olduğunda
- Bellek kısıtlamalarınız olduğunda
- Yüksek boyutlu sparse verilerle çalışırken

**CatBoost tercih edin:**
- Veri setiniz çok sayıda kategorik değişken içeriyorsa
- Minimum hyperparameter tuning ile iyi sonuç istiyorsanız
- Küçük veri setlerinde overfitting'den kaçınmak istiyorsanız
- Tahmin süresinin kritik olduğu production sistemlerinde

## Hiperparametre Tuning İpuçları

Her üç kütüphane için ortak kritik parametreler:

```python
# Tüm kütüphaneler için genel tuning stratejisi
from optuna import create_study

def objective(trial):
    params = {
        'learning_rate': trial.suggest_float('lr', 0.01, 0.3, log=True),
        'max_depth': trial.suggest_int('max_depth', 3, 10),
        'n_estimators': trial.suggest_int('n_estimators', 100, 2000),
        'subsample': trial.suggest_float('subsample', 0.5, 1.0),
        'colsample_bytree': trial.suggest_float('colsample', 0.5, 1.0),
        'reg_alpha': trial.suggest_float('reg_alpha', 1e-8, 10.0, log=True),
        'reg_lambda': trial.suggest_float('reg_lambda', 1e-8, 10.0, log=True),
    }
    # Cross-validation ile değerlendirme
    scores = cross_val_score(model_class(**params), X, y, cv=5, scoring='roc_auc')
    return scores.mean()

study = create_study(direction='maximize')
study.optimize(objective, n_trials=100)
```

**Genel ipuçları:**
- Learning rate'i düşük tutun (0.01-0.1) ve iterasyon sayısını artırın
- Early stopping mutlaka kullanın
- `subsample` ve `colsample_bytree` ile stochastic gradient boosting uygulayın
- Önce yapısal parametreleri (depth, leaves), sonra regularization parametrelerini ayarlayın

## Sonuç

Gradient boosting, tabular verilerle çalışan her makine öğrenmesi pratisyeni için temel bir araçtır. XGBoost, LightGBM ve CatBoost'un her biri farklı senaryolarda parlar:

- **XGBoost** olgun ekosistemi ve esnekliğiyle genel amaçlı bir seçenek sunar.
- **LightGBM** hız ve ölçeklenebilirlik konusunda liderdir.
- **CatBoost** kategorik veri ve out-of-the-box performansıyla öne çıkar.

Pratikte, ciddi projelerde üçünü de deneyip ensemble yapmak sıklıkla en iyi sonucu verir. Ancak üretim ortamında tek model seçmeniz gerekiyorsa, veri setinizin özelliklerine göre yukarıdaki karşılaştırmayı rehber edinebilirsiniz.

## Kaynaklar

1. Chen, T., & Guestrin, C. (2016). "XGBoost: A Scalable Tree Boosting System." *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*. [https://arxiv.org/abs/1603.02754](https://arxiv.org/abs/1603.02754)

2. Ke, G., Meng, Q., Finley, T., et al. (2017). "LightGBM: A Highly Efficient Gradient Boosting Decision Tree." *Advances in Neural Information Processing Systems 30 (NIPS 2017)*. [https://papers.nips.cc/paper/6907-lightgbm-a-highly-efficient-gradient-boosting-decision-tree](https://papers.nips.cc/paper/6907-lightgbm-a-highly-efficient-gradient-boosting-decision-tree)

3. Prokhorenkova, L., Gusev, G., Vorobev, A., et al. (2018). "CatBoost: unbiased boosting with categorical features." *Advances in Neural Information Processing Systems 31 (NeurIPS 2018)*. [https://arxiv.org/abs/1706.09516](https://arxiv.org/abs/1706.09516)

4. Friedman, J. H. (2001). "Greedy Function Approximation: A Gradient Boosting Machine." *Annals of Statistics*, 29(5), 1189-1232. [https://projecteuclid.org/journals/annals-of-statistics/volume-29/issue-5/Greedy-function-approximation-A-gradient-boosting-machine/10.1214/aos/1013203451.full](https://projecteuclid.org/journals/annals-of-statistics/volume-29/issue-5/Greedy-function-approximation-A-gradient-boosting-machine/10.1214/aos/1013203451.full)

5. Bentéjac, C., Csörgő, A., & Martínez-Muñoz, G. (2021). "A comparative analysis of gradient boosting algorithms." *Artificial Intelligence Review*, 54, 1937-1967. [https://doi.org/10.1007/s10462-020-09896-5](https://doi.org/10.1007/s10462-020-09896-5)
