---
title: "Açıklanabilir Yapay Zeka (XAI): Model Kararlarını Anlamak"
date: "2026-07-14"
tags: ["XAI", "SHAP", "LIME", "Yapay Zeka", "Açıklanabilirlik"]
readTime: "13 dk"
coverEmoji: "🔍"
description: "SHAP, LIME ve attention mekanizmalarıyla model kararlarını yorumlama: global ve lokal açıklamalar, regülasyon gereksinimleri ve pratik Python örnekleri."
---

# Açıklanabilir Yapay Zeka (XAI): Model Kararlarını Anlamak

Yapay zeka modelleri hayatımızın her alanına nüfuz ederken, bu modellerin kararlarını **nasıl** ve **neden** aldığını anlamak kritik bir gereklilik haline geldi. Bir kredi başvurusunun reddedilmesi, bir tıbbi teşhisin konulması ya da bir otonom aracın ani fren yapması — tüm bu senaryolarda "model neden bu kararı verdi?" sorusuna yanıt verebilmek yalnızca teknik bir merak değil, etik ve hukuki bir zorunluluktur.

Bu yazıda açıklanabilir yapay zeka (Explainable AI — XAI) kavramını derinlemesine inceleyeceğiz. SHAP, LIME gibi temel yöntemlerden attention görselleştirmelerine, kısmi bağımlılık grafiklerinden regülasyon gereksinimlerine kadar geniş bir yelpazede XAI'nin teori ve pratiğini ele alacağız.

## Neden Açıklanabilirlik Önemlidir?

Makine öğrenmesi modellerinin karmaşıklığı arttıkça, bu modeller genellikle **kara kutu** (black box) olarak nitelendirilir. Derin sinir ağları, gradient boosting modelleri ve ensemble yöntemler son derece yüksek doğruluk oranlarına ulaşabilir; ancak kararlarının ardındaki mantığı insan tarafından anlaşılır bir biçimde sunmakta yetersiz kalır.

Açıklanabilirliğin önemli olduğu başlıca alanlar şunlardır:

- **Güven ve Şeffaflık:** Kullanıcılar ve paydaşlar, bir modelin kararlarına güvenebilmek için bu kararların gerekçelerini anlamak ister. Özellikle sağlık, finans ve hukuk gibi yüksek riskli alanlarda şeffaflık vazgeçilmezdir.
- **Hata Ayıklama (Debugging):** Model beklenmedik sonuçlar ürettiğinde, açıklanabilirlik araçları sorunun kaynağını tespit etmeye yardımcı olur. Veriden mi, öznitelik mühendisliğinden mi yoksa model mimarisinden mi kaynaklanan bir sorun olduğu ancak bu araçlarla anlaşılabilir.
- **Önyargı Tespiti (Bias Detection):** Modelin belirli demografik gruplar üzerinde sistematik bir önyargı taşıyıp taşımadığı, öznitelik katkılarının analiz edilmesiyle ortaya konabilir.
- **Regülasyon Uyumu:** Avrupa Birliği AI Act gibi düzenlemeler, belirli yapay zeka uygulamalarında açıklanabilirliği zorunlu kılmaktadır.
- **Bilgi Keşfi:** Açıklanabilirlik teknikleri, modelin veriden öğrendiği örüntüleri insan uzmanların anlayabileceği biçimde ortaya koyarak yeni bilimsel içgörüler sağlayabilir.

## Global ve Lokal Açıklamalar

XAI yöntemleri genellikle iki temel kategoride incelenir:

### Global Açıklamalar

Global açıklamalar, modelin **genel davranışını** anlamaya yöneliktir. Tüm veri seti üzerindeki örüntüleri ve öznitelik etkileşimlerini ortaya koyar. Örneğin, "bu model genel olarak hangi özniteliklere daha çok önem veriyor?" sorusuna yanıt verir.

Global açıklama yöntemlerine örnekler:
- Öznitelik önem sıralaması (Feature Importance)
- Kısmi bağımlılık grafikleri (Partial Dependence Plots)
- SHAP özet grafikleri (SHAP Summary Plots)

### Lokal Açıklamalar

Lokal açıklamalar ise **tek bir tahmin** için modelin kararını açıklar. "Bu spesifik kredi başvurusu neden reddedildi?" gibi sorulara yanıt verir.

Lokal açıklama yöntemlerine örnekler:
- LIME açıklamaları
- SHAP değerleri (tek bir örnek için)
- Attention haritaları

Bu iki yaklaşım birbirini tamamlar. Global açıklamalar modelin genel güvenilirliğini değerlendirirken, lokal açıklamalar bireysel kararların gerekçesini sunar.

## LIME (Local Interpretable Model-Agnostic Explanations)

LIME, 2016 yılında Ribeiro ve arkadaşları tarafından önerilen ve herhangi bir makine öğrenmesi modeline uygulanabilen bir lokal açıklama yöntemidir. Temel fikir oldukça zariftir:

1. Açıklanmak istenen veri noktasının **yakın çevresinde** rastgele pertürbasyonlar (küçük değişiklikler) oluşturulur.
2. Bu pertürbe edilmiş örnekler orijinal modelle tahmin edilir.
3. Elde edilen tahminlere **basit ve yorumlanabilir** bir model (genellikle doğrusal regresyon) uydurulur.
4. Bu basit modelin katsayıları, her özniteliğin ilgili tahmine katkısını gösterir.

```python
import lime
import lime.lime_tabular
from sklearn.ensemble import RandomForestClassifier

# Model eğitimi
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# LIME açıklayıcı oluşturma
explainer = lime.lime_tabular.LimeTabularExplainer(
    training_data=X_train.values,
    feature_names=X_train.columns.tolist(),
    class_names=["Reddedildi", "Onaylandı"],
    mode="classification"
)

# Tek bir örnek için açıklama üretme
explanation = explainer.explain_instance(
    data_row=X_test.iloc[0].values,
    predict_fn=model.predict_proba,
    num_features=10
)

# Görselleştirme
explanation.show_in_notebook()
```

LIME'ın güçlü yanı model-bağımsız (model-agnostic) olmasıdır: herhangi bir sınıflandırıcı veya regresör ile çalışabilir. Ancak pertürbasyon tabanlı olması nedeniyle, açıklamalar bazen **kararsız** olabilir — aynı örnek için farklı çalışmalarda farklı sonuçlar verebilir.

## SHAP (SHapley Additive exPlanations)

SHAP, oyun teorisindeki Shapley değerlerinden esinlenen ve Lundberg & Lee (2017) tarafından geliştirilen güçlü bir açıklanabilirlik çerçevesidir. SHAP, her bir özniteliğin bir tahmindeki katkısını **adil ve matematiksel olarak tutarlı** bir şekilde ölçer.

### Shapley Değerlerinin Mantığı

Kooperatif oyun teorisinde Shapley değeri, bir oyuncunun (burada özniteliğin) tüm olası koalisyonlardaki marjinal katkılarının ağırlıklı ortalamasıdır. Bu yaklaşım üç önemli aksiyomu sağlar:

- **Yerel Doğruluk (Local Accuracy):** Tüm SHAP değerlerinin toplamı, modelin çıktısı ile baz değer arasındaki farka eşittir.
- **Tutarlılık (Consistency):** Bir özniteliğin katkısı artarsa, SHAP değeri asla azalmaz.
- **Eksiklik (Missingness):** Modele katkısı olmayan bir özniteliğin SHAP değeri sıfırdır.

### Pratik SHAP Uygulaması

Aşağıda, bir XGBoost modeli üzerinde SHAP analizi gerçekleştiren kapsamlı bir Python örneği bulunmaktadır:

```python
import shap
import xgboost as xgb
import pandas as pd
import matplotlib.pyplot as plt

# Veri setini yükleme
from sklearn.datasets import fetch_california_housing
data = fetch_california_housing(as_frame=True)
X, y = data.data, data.target

# Model eğitimi
model = xgb.XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    random_state=42
)
model.fit(X, y)

# SHAP açıklayıcı oluşturma (TreeExplainer ağaç modelleri için optimize edilmiştir)
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X)

# 1. SHAP Özet Grafiği (Global Açıklama)
shap.summary_plot(shap_values, X, plot_type="bar")
plt.title("Öznitelik Önem Sıralaması (SHAP)")
plt.tight_layout()
plt.savefig("shap_global_importance.png", dpi=150)
plt.show()

# 2. SHAP Beeswarm Grafiği (Global + Dağılım Bilgisi)
shap.summary_plot(shap_values, X)
plt.tight_layout()
plt.savefig("shap_beeswarm.png", dpi=150)
plt.show()

# 3. Tek Bir Tahmin İçin Waterfall Grafiği (Lokal Açıklama)
shap.plots.waterfall(shap.Explanation(
    values=shap_values[0],
    base_values=explainer.expected_value,
    data=X.iloc[0],
    feature_names=X.columns.tolist()
))
plt.tight_layout()
plt.savefig("shap_waterfall.png", dpi=150)
plt.show()

# 4. Force Plot — tek bir tahmin için interaktif görselleştirme
shap.force_plot(
    explainer.expected_value,
    shap_values[0],
    X.iloc[0],
    matplotlib=True
)
plt.savefig("shap_force_plot.png", dpi=150, bbox_inches="tight")
plt.show()
```

SHAP'ın en büyük avantajı, hem **global** hem de **lokal** açıklamalar sunabilmesidir. Özet grafikleri modelin genel davranışını ortaya koyarken, waterfall ve force plotlar bireysel tahminleri detaylı biçimde açıklar.

## Öznitelik Önemi (Feature Importance)

Öznitelik önemi, modelin tahminlerinde hangi değişkenlerin daha belirleyici olduğunu ölçen temel bir XAI aracıdır. Farklı hesaplama yöntemleri mevcuttur:

### Permütasyon Öznitelik Önemi

Bu yöntem, her özniteliğin değerlerini rastgele karıştırarak (permüte ederek) model performansındaki düşüşü ölçer. Performans ne kadar çok düşerse, o öznitelik o kadar önemlidir.

```python
from sklearn.inspection import permutation_importance

result = permutation_importance(
    model, X_test, y_test,
    n_repeats=30,
    random_state=42,
    scoring="neg_mean_squared_error"
)

# Sonuçları sıralama
importance_df = pd.DataFrame({
    "Öznitelik": X_test.columns,
    "Ortalama Önem": result.importances_mean,
    "Standart Sapma": result.importances_std
}).sort_values("Ortalama Önem", ascending=False)

print(importance_df.to_string(index=False))
```

### Ağaç Tabanlı Öznitelik Önemi

Random Forest ve Gradient Boosting gibi ağaç tabanlı modeller, her özniteliğin dallanma kararlarındaki safsızlık (impurity) azalmasına dayalı olarak yerleşik bir önem ölçüsü sunar. Ancak bu yöntem **yüksek kardinaliteli** özniteliklere karşı önyargılı olabilir; bu nedenle permütasyon önemi tercih edilmelidir.

## Kısmi Bağımlılık Grafikleri (Partial Dependence Plots)

Kısmi bağımlılık grafikleri (PDP), bir veya iki özniteliğin modelin tahmini üzerindeki **marjinal etkisini** görselleştirir. Diğer tüm özniteliklerin etkisi marjinalleştirilerek (ortalaması alınarak) yalnızca ilgilenilen özniteliğin etkisi izole edilir.

```python
from sklearn.inspection import PartialDependenceDisplay

fig, axes = plt.subplots(1, 3, figsize=(18, 5))

# Tek öznitelik PDP'leri
PartialDependenceDisplay.from_estimator(
    model, X, features=["MedInc", "AveRooms", "HouseAge"],
    ax=axes, grid_resolution=50
)

fig.suptitle("Kısmi Bağımlılık Grafikleri", fontsize=14)
plt.tight_layout()
plt.savefig("partial_dependence.png", dpi=150)
plt.show()
```

PDP'ler özellikle **doğrusal olmayan ilişkileri** ve **eşik etkilerini** ortaya koymakta son derece faydalıdır. Örneğin, gelir düzeyinin belirli bir eşiğe kadar kredi onay olasılığını artırdığını, sonrasında etkisinin sabitlendiğini bir PDP ile kolayca görebilirsiniz.

## Attention Görselleştirmeleri

Transformer tabanlı modellerde (BERT, GPT, Vision Transformer gibi), **attention mekanizmaları** modelin hangi girdi parçalarına odaklandığını doğrudan ortaya koyar. Bu mekanizmalar, XAI açısından doğal bir yorumlanabilirlik katmanı sağlar.

### Metin Modellerinde Attention

Bir duygu analizi modelinde, attention ağırlıkları hangi kelimelerin sınıflandırma kararında etkili olduğunu gösterebilir:

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

model_name = "dbmdz/bert-base-turkish-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name, output_attentions=True
)

text = "Bu ürün gerçekten harika, çok memnun kaldım."
inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)

with torch.no_grad():
    outputs = model(**inputs)

# Son katmanın attention ağırlıkları
attentions = outputs.attentions[-1]  # (batch, heads, seq_len, seq_len)

# Tüm head'lerin ortalaması
avg_attention = attentions.mean(dim=1).squeeze()

tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"].squeeze())
cls_attention = avg_attention[0]  # [CLS] token'ının diğer token'lara olan attention'ı

for token, score in zip(tokens, cls_attention):
    print(f"{token:15s} → {score:.4f}")
```

### Görsel Modellerde Attention

Vision Transformer (ViT) modellerinde, attention haritaları modelin görüntünün hangi bölgelerine odaklandığını ısı haritası olarak gösterebilir. Bu özellikle tıbbi görüntüleme alanında, modelin tümör bölgesine gerçekten odaklanıp odaklanmadığını doğrulamak için büyük öneme sahiptir.

## Regülasyon Gereksinimleri: AB Yapay Zeka Yasası (EU AI Act)

Avrupa Birliği'nin 2024'te yürürlüğe giren **AI Act** düzenlemesi, yapay zeka sistemlerini risk seviyelerine göre sınıflandırır ve yüksek riskli sistemler için kapsamlı şeffaflık gereksinimleri getirir.

### Risk Sınıflandırması

| Risk Seviyesi | Örnekler | Açıklanabilirlik Gereksinimleri |
|:---|:---|:---|
| **Kabul Edilemez** | Sosyal puanlama, subliminal manipülasyon | Yasaklanmıştır |
| **Yüksek Risk** | Kredi puanlama, tıbbi teşhis, adalet sistemi | Tam şeffaflık ve açıklanabilirlik zorunlu |
| **Sınırlı Risk** | Chatbot'lar, duygu tanıma | Kullanıcıya bilgilendirme zorunlu |
| **Minimal Risk** | Spam filtreleri, oyun yapay zekası | Ek gereksinim yok |

### Yüksek Riskli Sistemler İçin Gereksinimler

AI Act kapsamında yüksek riskli yapay zeka sistemlerinin aşağıdaki gereksinimleri karşılaması beklenir:

1. **Şeffaflık Yükümlülüğü:** Kullanıcılar, yapay zeka sisteminin karar sürecini yeterli düzeyde anlayabilmelidir.
2. **İnsan Denetimi:** Kararlar üzerinde insan müdahalesi mekanizması bulunmalıdır.
3. **Teknik Dokümantasyon:** Modelin çalışma prensibi, eğitim verisi ve performans metrikleri kapsamlı biçimde belgelenmelidir.
4. **Risk Değerlendirmesi:** Sistemin olası risklerinin belirlenmesi ve azaltılması için süreçler oluşturulmalıdır.

Bu düzenlemeler, XAI araçlarının yalnızca araştırma düzeyinde değil, üretim (production) ortamlarında da zorunlu hale gelmesine neden olmaktadır. SHAP raporları, LIME açıklamaları ve öznitelik önem sıralamaları artık bir "olsa iyi olur" değil, hukuki bir gerekliliktir.

## XAI Araçlarını Üretim Ortamında Kullanma

Açıklanabilirlik araçlarını bir ML pipeline'ına entegre etmek, model eğitiminden sonraki aşamada sistematik bir yaklaşım gerektirir:

```python
import shap
import joblib
import json
from datetime import datetime

class XAIReportGenerator:
    """Üretim ortamında SHAP tabanlı açıklanabilirlik raporları üreten sınıf."""

    def __init__(self, model, X_background, feature_names):
        self.model = model
        self.feature_names = feature_names
        self.explainer = shap.TreeExplainer(model, data=X_background)

    def generate_local_report(self, instance, instance_id):
        """Tek bir tahmin için detaylı açıklama raporu üretir."""
        shap_values = self.explainer.shap_values(instance)

        report = {
            "instance_id": instance_id,
            "timestamp": datetime.utcnow().isoformat(),
            "prediction": float(self.model.predict(instance.values.reshape(1, -1))[0]),
            "base_value": float(self.explainer.expected_value),
            "top_features": []
        }

        # En etkili 5 özniteliği raporla
        sorted_idx = abs(shap_values).argsort()[::-1][:5]
        for idx in sorted_idx:
            report["top_features"].append({
                "feature": self.feature_names[idx],
                "shap_value": float(shap_values[idx]),
                "feature_value": float(instance.iloc[idx]),
                "direction": "artırıcı" if shap_values[idx] > 0 else "azaltıcı"
            })

        return report

    def save_report(self, report, output_path):
        """Raporu JSON dosyası olarak kaydeder."""
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"Rapor kaydedildi: {output_path}")
```

Bu tür bir yapı, her tahmin için denetlenebilir bir açıklama kaydı tutarak hem teknik ekiplerin hem de regülasyon denetçilerinin ihtiyaçlarını karşılar.

## Yöntemlerin Karşılaştırması

| Yöntem | Kapsam | Model Bağımsız? | Hesaplama Maliyeti | Güçlü Yönü |
|:---|:---|:---|:---|:---|
| **SHAP** | Global + Lokal | Evet* | Orta–Yüksek | Matematiksel tutarlılık |
| **LIME** | Lokal | Evet | Orta | Basitlik ve esneklik |
| **PDP** | Global | Evet | Düşük | Marjinal etki görselleştirme |
| **Permütasyon Önemi** | Global | Evet | Orta | Kolay yorumlanabilirlik |
| **Attention** | Lokal | Hayır (Transformer) | Düşük | Yerleşik mekanizma |

*\*SHAP'ın TreeExplainer gibi optimize edilmiş sürümleri modele özgüdür, ancak KernelExplainer model-bağımsız çalışır.*

## Sonuç

Açıklanabilir yapay zeka, modern makine öğrenmesi uygulamalarının güvenilir, adil ve yasal uyumlu olmasını sağlayan temel bir disiplindir. SHAP ve LIME gibi araçlar, karmaşık modellerin kararlarını anlaşılır kılarak hem teknik ekiplere hem de iş paydaşlarına değer sunar.

AB AI Act gibi düzenlemelerle birlikte, açıklanabilirlik artık isteğe bağlı bir özellik olmaktan çıkarak zorunlu bir gereksinim haline gelmiştir. Bu nedenle, makine öğrenmesi mühendislerinin XAI araçlarını model geliştirme sürecinin ayrılmaz bir parçası olarak benimsemesi büyük önem taşımaktadır.

XAI'nin geleceği, daha hızlı, daha doğru ve daha kullanıcı dostu açıklama yöntemlerinin geliştirilmesiyle şekillenecektir. Kavramsal açıklama (concept-based explanations), karşı-olgusal açıklama (counterfactual explanations) ve doğal dil açıklamaları gibi yeni yaklaşımlar, bu alandaki araştırmaların ön saflarında yer almaktadır.

---

## Kaynaklar

1. **Ribeiro, M. T., Singh, S., & Guestrin, C.** (2016). "Why Should I Trust You?": Explaining the Predictions of Any Classifier. *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 1135–1144. [https://arxiv.org/abs/1602.04938](https://arxiv.org/abs/1602.04938)

2. **Lundberg, S. M., & Lee, S.-I.** (2017). A Unified Approach to Interpreting Model Predictions. *Advances in Neural Information Processing Systems (NeurIPS)*, 30, 4765–4774. [https://arxiv.org/abs/1705.07874](https://arxiv.org/abs/1705.07874)

3. **European Commission.** (2024). Regulation (EU) 2024/1689 — Artificial Intelligence Act. *Official Journal of the European Union*. [https://eur-lex.europa.eu/eli/reg/2024/1689/oj](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)

4. **Molnar, C.** (2022). *Interpretable Machine Learning: A Guide for Making Black Box Models Explainable* (2nd ed.). [https://christophm.github.io/interpretable-ml-book/](https://christophm.github.io/interpretable-ml-book/)
