---
title: "Hyperparameter Tuning Rehberi: Grid Search'ten Bayesian Optimization'a"
date: "2026-07-09"
tags: ["Makine Öğrenimi", "Hyperparameter Tuning", "Optuna", "MLOps"]
readTime: "18 dk"
coverEmoji: "🎛️"
description: "Grid Search, Random Search ve Bayesian Optimization yöntemlerini karşılaştırarak hiperparametre optimizasyonunu Optuna ile uygulamalı anlatan kapsamlı rehber."
---

# Hyperparameter Tuning Rehberi: Grid Search'ten Bayesian Optimization'a

Bir makine öğrenimi modelini eğitmek, çoğu zaman algoritma seçiminden daha fazla dikkat gerektiren bir süreç. Modelin kendisi doğru olabilir ama yanlış hiperparametre seçimleriyle sonuçlar hayal kırıklığı yaratabilir. Öğrenme hızı çok yüksekse model kararsız hale gelir, çok düşükse saatlerce eğitim süresi harcanır ve sonuçta yerel bir minimuma takılma riski artar. Ağaç derinliği fazla büyürse ezberleme başlar, küçük tutulursa model verinin yapısını yakalayamaz.

Hiperparametreler modelin "öğrenilmeyen ayarları"dır. Eğitim sırasında veriye göre güncellenmeyen, tasarım aşamasında belirlenmesi gereken bu değerler modelin hem başarısını hem de eğitim maliyetini doğrudan etkiler. Bu yazıda hiperparametre optimizasyonunun temel yöntemlerini, her birinin güçlü ve zayıf yönlerini ele alacağım. Ardından Optuna kütüphanesi ile gerçek bir iş akışını adım adım uygulayacağız.

## Hiperparametre Nedir, Model Parametresinden Farkı Ne?

Ayrımı net koymakta fayda var. Model parametreleri eğitim sürecinde veriden otomatik olarak öğrenilen değerlerdir: doğrusal regresyondaki ağırlıklar, sinir ağındaki katman parametreleri gibi. Hiperparametreler ise eğitim başlamadan önce belirlenmeleri gereken yapısal kararlardır.

Birkaç somut örnek:

- **Öğrenme hızı (learning rate):** Gradient descent adımlarının büyüklüğünü kontrol eder. 0.1 ile 0.0001 arasında bile büyük farklar yaratabilir.
- **Ağaç sayısı ve derinliği:** Random Forest veya Gradient Boosting modellerinde kaç ağaç kullanılacağı ve her bir ağacın ne kadar derine ineceği.
- **Regularization katsayıları:** L1 veya L2 düzenlileştirme gücü; modelin karmaşıklığını kontrol altına alır.
- **Batch size:** Eğitim sırasında kaç örneğin bir arada işleneceği.
- **Katman sayısı ve nöron sayıları:** Sinir ağlarının mimari seçimleri.

Bu değerlerin her biri modelin performansını doğrudan etkiler. Yanlış bir öğrenme hızı, mükemmel bir mimariyi bile kullanışsız hale getirebilir. Dolayısıyla hiperparametre seçimi sistematik bir yaklaşım gerektirir.

## Manuel Ayarlama Neden Yetersiz Kalır

Pratikte birçok kişi hiperparametre seçimine "deneme-yanılma" yaklaşımıyla başlar. Bir öğrenme hızı denenir, sonuç bakılır, başka bir değer denenir. Bu yöntem küçük projelerde işe yarayabilir ama ölçek büyüdükçe ciddi sorunlar ortaya çıkar.

İlk sorun arama uzayının büyüklüğüdür. Bir Gradient Boosting modeli düşünelim: öğrenme hızı, ağaç sayısı, maksimum derinlik, minimum yaprak örneği, sütun örnekleme oranı, L2 düzenlileştirme... Altı hiperparametre için her birinde sadece beş farklı değer denesek bile toplam 15.625 kombinasyon ortaya çıkar. Manuel olarak bunların hepsini denemek gerçekçi değil.

İkinci sorun tekrarlanabilirlik. Manuel denemelerde hangi değerlerin denendiği, hangi sırayla denendiği, hangi veri bölmesi üzerinde test edildiği genellikle düzgün kayıt altına alınmaz. Birkaç hafta sonra aynı sonuçları üretmek zorlaştığında geriye dönüp bakmak neredeyse imkansız hale gelir.

Üçüncü sorun ise önyargıdır. İnsan doğası gereği daha önce işe yarayan değerlere yönelir. Bu da arama uzayının büyük bir bölümünün hiç keşfedilmemesi demektir. Belki de en iyi sonuç, hiç akla gelmeyen bir kombinasyonda gizlidir.

## Grid Search: Kapsamlı Ama Pahalı

Grid Search en basit sistematik yöntemdir. Fikir çok yalın: her hiperparametre için bir aday listesi tanımlanır ve tüm olası kombinasyonlar sırayla denenir.

```python
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import GradientBoostingClassifier

param_grid = {
    'n_estimators': [100, 200, 500],
    'max_depth': [3, 5, 7],
    'learning_rate': [0.01, 0.05, 0.1],
    'subsample': [0.8, 1.0]
}

model = GradientBoostingClassifier(random_state=42)
grid_search = GridSearchCV(
    model,
    param_grid,
    cv=5,
    scoring='f1_weighted',
    n_jobs=-1,
    verbose=1
)
grid_search.fit(X_train, y_train)

print(f"En iyi parametreler: {grid_search.best_params_}")
print(f"En iyi F1 skoru: {grid_search.best_score_:.4f}")
```

Bu örnekte 3 × 3 × 3 × 2 = 54 kombinasyon var. Her biri 5-fold cross-validation ile değerlendirildiğinde toplam 270 model eğitimi yapılıyor. Veri seti büyükse veya model eğitimi dakikalar alıyorsa bu süre hızla saatlere uzar.

**Grid Search'ün güçlü yönleri:**
- Tanımlanan arama uzayı tam olarak taranır; hiçbir kombinasyon atlanmaz.
- Sonuçlar tamamen deterministik ve tekrarlanabilir.
- Anlaşılması ve uygulanması çok kolay.

**Zayıf yönleri:**
- Hiperparametre sayısı ve her birindeki aday sayısı arttıkça maliyet üstel olarak büyür.
- Süreksiz bir ızgarada arama yapıldığı için ızgara noktaları arasındaki değerler hiç denenmez. Optimum 0.03 iken aday listesinde 0.01 ve 0.05 varsa bu değer asla bulunamaz.
- Çoğu ML probleminde hiperparametrelerin hepsi eşit derecede önemli değildir. Grid Search bunu bilmeden her parametreye eşit kaynak ayırır.

## Random Search: Şaşırtıcı Derecede Etkili

Random Search, Grid Search'ün katı ızgara yapısını bırakıp belirlenen aralıklardan rastgele örnekleme yapar. İlk bakışta daha az sistematik görünse de Bergstra ve Bengio'nun 2012 tarihli çalışması Random Search'ün pratikte çoğu zaman Grid Search'ten daha verimli olduğunu gösterdi.

Bunun arkasındaki sezgi şudur: Bir modelin performansını genellikle tüm hiperparametreler eşit derecede etkilemez. Diyelim ki öğrenme hızı çok kritik ama subsample oranı fazla fark yaratmıyor. Grid Search 54 kombinasyonun hepsinde sadece 3 farklı öğrenme hızını dener. Random Search ise aynı bütçeyle 54 farklı rastgele öğrenme hızını deneyebilir. Yani kritik parametrede çok daha geniş bir aralığı keşfeder.

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import uniform, randint

param_distributions = {
    'n_estimators': randint(50, 800),
    'max_depth': randint(2, 12),
    'learning_rate': uniform(0.005, 0.3),
    'subsample': uniform(0.6, 0.4),
    'min_samples_leaf': randint(1, 20)
}

model = GradientBoostingClassifier(random_state=42)
random_search = RandomizedSearchCV(
    model,
    param_distributions,
    n_iter=60,
    cv=5,
    scoring='f1_weighted',
    n_jobs=-1,
    random_state=42,
    verbose=1
)
random_search.fit(X_train, y_train)

print(f"En iyi parametreler: {random_search.best_params_}")
print(f"En iyi F1 skoru: {random_search.best_score_:.4f}")
```

`n_iter=60` ile 60 rastgele kombinasyon deneniyor. Her biri 5-fold cross-validation ile 300 model eğitimi. Grid Search'teki 270'e yakın bir bütçe ama çok daha geniş bir uzay taranıyor.

**Random Search'ün avantajları:**
- Sabit bir hesaplama bütçesiyle çok daha geniş bir arama uzayını keşfedebilir.
- Bütçeyi artırmak veya azaltmak çok kolay; `n_iter` değerini değiştirmek yeterli.
- Sürekli dağılımlardan örnekleme yapabildiği için ızgara noktaları arasındaki değerleri de yakalayabilir.

**Dikkat edilmesi gereken noktalar:**
- Rastgele örnekleme yaptığı için aynı `random_state` kullanılmazsa sonuçlar değişir.
- Az sayıda denemeyle şanssız bir örnekleme yapılabilir; yeterli bütçe ayrılması gerekir.

## Bayesian Optimization: Akıllı Arama

Grid ve Random Search'ün ortak bir eksikliği var: önceki denemelerin sonuçlarını kullanmazlar. Her deneme birbirinden bağımsızdır. Bayesian Optimization bu durumu kökten değiştirir.

Bayesian Optimization bir vekil model (surrogate model) kullanarak arama uzayını modellemek üzerine kuruludur. Temel döngüsü şu adımları tekrarlar:

1. Mevcut deneme sonuçlarına dayanarak arama uzayındaki performansı tahmin eden bir vekil model oluştur.
2. Bu vekil modeli kullanarak bir sonraki denenecek noktayı seç (acquisition function aracılığıyla).
3. Seçilen noktayı dene ve gerçek sonucu al.
4. Vekil modeli yeni bilgiyle güncelle.

Bu yaklaşım özellikle model eğitiminin pahalı olduğu durumlarda büyük avantaj sağlar. Her deneme maliyetli olduğunda, önceki sonuçlardan öğrenerek en bilgilendirici noktaları seçmek ciddi kaynak tasarrufu sağlar.

Acquisition function genellikle iki hedef arasında denge kurar: exploitation (şu ana kadar iyi sonuç veren bölgeleri daha derinlemesine araştırmak) ve exploration (henüz az keşfedilmiş bölgeleri denemek). En yaygın kullanılan acquisition function'lar Expected Improvement (EI) ve Upper Confidence Bound (UCB) yöntemleridir.

## Optuna ile Pratik Uygulama

Optuna, Bayesian Optimization tabanlı bir hiperparametre optimizasyon kütüphanesidir. TPE (Tree-structured Parzen Estimator) algoritmasını temel alır ve kullanım kolaylığı açısından öne çıkar. Diğer araçlardan farklı olarak arama uzayını Python kodu içinde doğrudan tanımlamaya olanak tanır. Bu "define-by-run" API'si koşullu hiperparametre uzaylarını çok doğal bir biçimde ifade etmeyi mümkün kılar.

### Temel Kullanım

```python
import optuna
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 800),
        'max_depth': trial.suggest_int('max_depth', 2, 12),
        'learning_rate': trial.suggest_float('learning_rate', 0.005, 0.3, log=True),
        'subsample': trial.suggest_float('subsample', 0.6, 1.0),
        'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 20),
    }

    model = GradientBoostingClassifier(**params, random_state=42)
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')
    return scores.mean()

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)

print(f"En iyi parametreler: {study.best_params}")
print(f"En iyi F1 skoru: {study.best_value:.4f}")
```

Bu kodda `objective` fonksiyonu tek bir trial için hiperparametre uzayını tanımlıyor ve modeli değerlendirip skoru döndürüyor. `trial.suggest_*` metotları Optuna'ya hangi parametrelerin hangi aralıkta aranacağını söylüyor. `log=True` parametresi öğrenme hızı gibi logaritmik ölçekli parametreler için geometrik örnekleme yapılmasını sağlıyor. Bu önemli çünkü 0.005 ile 0.3 arasında uniform örnekleme yapıldığında küçük değerler yeterince temsil edilmez.

### Koşullu Hiperparametreler

Optuna'nın en güçlü yönlerinden biri koşullu arama uzaylarını desteklemesidir. Örneğin model tipi seçimine göre farklı hiperparametreler tanımlanabilir:

```python
def objective(trial):
    classifier_name = trial.suggest_categorical('classifier', ['RF', 'GBM', 'SVM'])

    if classifier_name == 'RF':
        params = {
            'n_estimators': trial.suggest_int('rf_n_estimators', 50, 500),
            'max_depth': trial.suggest_int('rf_max_depth', 3, 15),
            'min_samples_split': trial.suggest_int('rf_min_samples_split', 2, 20),
        }
        model = RandomForestClassifier(**params, random_state=42)

    elif classifier_name == 'GBM':
        params = {
            'n_estimators': trial.suggest_int('gbm_n_estimators', 50, 500),
            'learning_rate': trial.suggest_float('gbm_lr', 0.01, 0.3, log=True),
            'max_depth': trial.suggest_int('gbm_max_depth', 2, 10),
        }
        model = GradientBoostingClassifier(**params, random_state=42)

    else:
        params = {
            'C': trial.suggest_float('svm_C', 0.01, 100, log=True),
            'kernel': trial.suggest_categorical('svm_kernel', ['rbf', 'poly']),
        }
        model = SVC(**params, random_state=42)

    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')
    return scores.mean()
```

Bu yapıda RF seçildiğinde SVM'in hiperparametreleri tanımlanmaz bile. Grid Search ile bunu ifade etmek çok daha zahmetli olurdu.

### Pruning ile Erken Durdurma

Optuna bir trial'ın ortasında umut verici görünmeyen denemeleri erken durdurabiliyor. Bu özellik özellikle sinir ağı eğitimi gibi uzun süren denemelerde büyük zaman tasarrufu sağlar:

```python
from optuna.integration import PyTorchLightningPruningCallback

def objective(trial):
    lr = trial.suggest_float('lr', 1e-5, 1e-2, log=True)
    n_layers = trial.suggest_int('n_layers', 1, 4)
    hidden_size = trial.suggest_int('hidden_size', 32, 256)

    model = MyLightningModel(lr=lr, n_layers=n_layers, hidden_size=hidden_size)

    trainer = pl.Trainer(
        max_epochs=50,
        callbacks=[PyTorchLightningPruningCallback(trial, monitor='val_loss')],
    )
    trainer.fit(model, train_loader, val_loader)

    return trainer.callback_metrics['val_loss'].item()

study = optuna.create_study(
    direction='minimize',
    pruner=optuna.pruners.MedianPruner(n_startup_trials=5, n_warmup_steps=10)
)
study.optimize(objective, n_trials=100)
```

`MedianPruner` burada şunu yapar: İlk 5 trial (startup) tamamlanana kadar hiçbir deneme kesilmez. Sonrasında, her trial'ın 10. adımından (warmup) itibaren ara sonuçları tamamlanmış denemelerin medyanıyla karşılaştırılır. Medyanın altında kalan denemeler erken sonlandırılır. Bu yöntemle 100 trial'lık bir aramada toplam eğitim süresi yarıya kadar düşebilir.

### Sonuçları Görselleştirme ve Analiz

Optuna yerleşik görselleştirme araçları sunar. Bu araçlar optimizasyon sürecini anlamak ve hiperparametrelerin etkisini değerlendirmek için çok faydalıdır:

```python
from optuna.visualization import (
    plot_optimization_history,
    plot_param_importances,
    plot_parallel_coordinate,
    plot_contour
)

# Optimizasyon süreci boyunca en iyi skorun gelişimi
fig1 = plot_optimization_history(study)
fig1.show()

# Hangi hiperparametre sonuca ne kadar etkili
fig2 = plot_param_importances(study)
fig2.show()

# Parametreler arası ilişkiyi keşfetme
fig3 = plot_contour(study, params=['learning_rate', 'max_depth'])
fig3.show()
```

`plot_param_importances` özellikle değerli bir çıktı üretir. Hangi hiperparametrenin sonucu ne kadar etkilediğini görerek gelecekteki aramalarda arama uzayını daraltabilir, önemsiz parametreleri sabitleyebilirsiniz. Bu hem zaman kazandırır hem de modelin davranışına dair daha iyi bir anlayış sağlar.

## Yöntemlerin Karşılaştırması

Her yöntemin farklı senaryolarda öne çıktığı durumlar var:

| Kriter | Grid Search | Random Search | Bayesian (Optuna) |
|--------|------------|---------------|-------------------|
| Hesaplama maliyeti | Çok yüksek (üstel) | Kontrol edilebilir | Düşük-orta |
| Arama uzayı kapsamı | Sadece ızgara noktaları | Geniş, rastgele | Akıllı yönlendirmeli |
| Önceki sonuçlardan öğrenme | Yok | Yok | Var |
| Uygulanma kolaylığı | Çok kolay | Kolay | Orta |
| Az sayıda denemeyle başarı | Düşük | Orta | Yüksek |
| Koşullu parametreler | Zor | Mümkün ama karışık | Doğal destek |

**Ne zaman hangisini kullanmalı?**

- **Grid Search:** Hiperparametre sayısı az (2-3) ve her birindeki aday sayısı sınırlıysa, özellikle tüm kombinasyonları mutlaka görmek istenen durumlarda mantıklı olabilir.
- **Random Search:** Hızlı bir başlangıç araştırması yapılacaksa, hesaplama bütçesi sınırlıysa veya hiperparametre sayısı fazlaysa iyi bir başlangıç noktasıdır.
- **Bayesian Optimization (Optuna):** Model eğitimi pahalıysa, bütçe sınırlıysa, koşullu parametre uzayları varsa veya en iyi sonuca en az denemeyle ulaşmak isteniyorsa tercih edilmelidir.

Pratikte genellikle en verimli yaklaşım Random Search ile geniş bir keşif yapmak, ardından umut verici bölgelerde Bayesian Optimization ile derinleşmektir.

## Dikkat Edilmesi Gereken Pratik Noktalar

### Arama uzayını akıllıca tanımlayın

Çok geniş bir arama uzayı tanımlamak arama süresini gereksiz yere uzatır. Literatür bilgisi ve deneyim burada devreye girer. Örneğin GBM modelleri için öğrenme hızının 0.001-0.3 aralığında olması çoğu problemde makul bir başlangıçtır. Bu aralığı 0.0001-1.0 yapmanın faydası çok nadiren maliyetini karşılar.

### Cross-validation stratejisini doğru seçin

Hiperparametre optimizasyonu sırasında her deneme cross-validation ile değerlendirilir. Zaman serisi verilerinde standart k-fold kullanılmamalı; TimeSeriesSplit tercih edilmelidir. Dengesiz sınıflarda StratifiedKFold katmanların sınıf dağılımını korumasını sağlar.

### Overfitting riskine dikkat edin

Çok sayıda deneme yapıldığında optimizasyon sürecinin kendisi validation set'e overfit olabilir. Bu riski azaltmak için ayrı bir test seti ayırmak ve en iyi hiperparametrelerle bu set üzerinde final değerlendirmesi yapmak gerekir. Optuna'da `n_trials` değerini gereksiz yere yüksek tutmak bu riski artırır.

### Sonuçları kayıt altına alın

Optuna'nın SQLite veya PostgreSQL tabanlı depolama desteği tüm denemelerin kalıcı olarak saklanmasını sağlar:

```python
study = optuna.create_study(
    study_name='gbm_optimization',
    storage='sqlite:///optuna_results.db',
    direction='maximize',
    load_if_exists=True
)
```

Bu şekilde optimizasyon kesintiye uğrasa bile kaldığı yerden devam edebilir. Ayrıca farklı zamanlarda yapılan çalışmalar karşılaştırılabilir ve ekip içinde paylaşılabilir.

### Paralel denemeleri değerlendirin

Optuna çoklu işlem desteği sunar. Büyük arama uzaylarında paralel denemeler toplam süreyi önemli ölçüde kısaltabilir:

```python
# Birden fazla worker aynı study üzerinde çalışabilir
study.optimize(objective, n_trials=100, n_jobs=4)
```

Ancak paralel denemelerde TPE algoritmasının etkinliği düşebilir çünkü eşzamanlı çalışan denemeler birbirlerinin sonuçlarından faydalanamamaktadır. Bu nedenle çok yüksek paralellik düzeyleri yerine makul bir denge tercih edilmelidir.

## Sonuç

Hiperparametre optimizasyonu, modelin gerçek potansiyelini ortaya çıkarmak için kaçınılmaz bir adım. Manuel deneme-yanılma küçük projelerde işe yarasa da sistematik bir yaklaşım hem daha iyi sonuçlar üretir hem de süreci tekrarlanabilir kılar.

Grid Search basit ve anlaşılır olmakla birlikte büyük arama uzaylarında maliyeti hızla artar. Random Search şaşırtıcı derecede etkili bir alternatif sunar ve birçok durumda Grid Search'ten daha iyi sonuç verir. Bayesian Optimization ise önceki denemelerden öğrenerek en verimli aramayı gerçekleştirir. Optuna bu yaklaşımı erişilebilir ve esnek bir API ile sunarak hiperparametre optimizasyonunu üretim iş akışlarının doğal bir parçası haline getirir.

Önemli olan hangi yöntemi kullandığınız değil, sistematik bir yaklaşım benimsemenizdir. Hiperparametreleri bilinçli ve ölçülebilir bir şekilde optimize etmek, model geliştirme sürecinin kalitesini doğrudan yükseltir.

## Kaynaklar

1. Bergstra, J., & Bengio, Y. (2012). Random Search for Hyper-Parameter Optimization. *Journal of Machine Learning Research*, 13, 281-305. [https://jmlr.org/papers/v13/bergstra12a.html](https://jmlr.org/papers/v13/bergstra12a.html)
2. Akiba, T., Sano, S., Yanase, T., Ohta, T., & Koyama, M. (2019). Optuna: A Next-generation Hyperparameter Optimization Framework. *Proceedings of KDD 2019*. [https://arxiv.org/abs/1907.10902](https://arxiv.org/abs/1907.10902)
3. Optuna Official Documentation. [https://optuna.readthedocs.io/en/stable/](https://optuna.readthedocs.io/en/stable/)
