---
title: "Derin Öğrenmede Normalizasyon Savaşları: Batch Normalization ve Layer Normalization"
date: "2026-07-22"
tags: ["Deep Learning", "Yapay Zeka", "Model Mimarisi"]
readTime: "6 dk"
coverEmoji: "⚖️"
description: "Batch ve Layer Normalization tekniklerinin çalışma prensipleri, matematiksel farkları ve hangi mimaride hangisini seçmeniz gerektiği."
---

Derin yapay sinir ağlarını eğitirken karşılaşılan en büyük zorluklardan biri, eğitim ilerledikçe her katmanın girdi dağılımının sürekli değişmesidir. Literatürde **Internal Covariant Shift** olarak adlandırılan bu problem, optimizasyon sürecini yavaşlatır ve modeli aşırı duyarlı hale getirir. 

Bu sorunu çözmek ve eğitimi stabilize etmek için normalizasyon teknikleri kullanılır. En yaygın iki normalizasyon tekniği ise **Batch Normalization (BatchNorm)** ve **Layer Normalization (LayerNorm)**'dur.

---

## Normalizasyon Neden Önemlidir?

Bir katmanın girdilerini normalize etmek, o katmandaki aktivasyonların ortalamasını 0'a, varyansını ise 1'e yaklaştırır. Bu işlem:
1. Gradyanların kaybolmasını veya patlamasını (vanishing/exploding gradients) önler.
2. Daha yüksek öğrenme oranları (learning rate) kullanılmasına izin verir.
3. Düzenlileştirici (regularization) etki göstererek aşırı öğrenmeyi (overfitting) azaltır.

---

## 1. Batch Normalization (BatchNorm)

Sergey Ioffe ve Christian Szegedy tarafından 2015 yılında tanıtılan BatchNorm, özellikle Evrişimli Sinir Ağlarında (CNN) standart haline gelmiştir.

### Çalışma Prensibi
BatchNorm, normalizasyon işlemini **minibatch (yığın)** boyutu üzerinden gerçekleştirir. Her bir özellik kanalı için, o yığındaki tüm örneklerin değerlerinin ortalaması ve varyansı hesaplanır.

Matematiksel olarak bir $x$ girdisi için:

$$\mu_B = \frac{1}{m} \sum_{i=1}^m x_i$$
$$\sigma_B^2 = \frac{1}{m} \sum_{i=1}^m (x_i - \mu_B)^2$$
$$\hat{x}_i = \frac{x_i - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}$$

Burada $\epsilon$ sıfıra bölünmeyi önlemek için eklenen küçük bir sabittir. Son aşamada modelin temsil gücünü kaybetmemesi için öğrenilebilir $\gamma$ (ölçek) ve $\beta$ (kaydırma) parametreleri uygulanır:

$$y_i = \gamma \hat{x}_i + \beta$$

### Sınırları ve Dezavantajları
* **Yığın Boyutuna Bağımlılık:** Yığın boyutu (batch size) küçük olduğunda ortalama ve varyans tahminleri gürültülü olur, bu da modelin performansını düşürür.
* **Ardışık Veri Zorluğu:** RNN ve Transformer gibi sıralı veri işleyen mimarilerde, zaman adımları boyunca farklı dinamikler olduğu için BatchNorm uygulamak zordur.

---

## 2. Layer Normalization (LayerNorm)

Jimmy Lei Ba ve arkadaşları tarafından 2016 yılında önerilen LayerNorm, özellikle Transformer ve NLP mimarilerinde BatchNorm'un yerini almıştır.

### Çalışma Prensibi
LayerNorm, normalizasyonu yığın boyutundan bağımsız olarak **tek bir veri örneği** içindeki tüm özellikler (özellik boyutları) üzerinden gerçekleştirir. 

Yani, tek bir girdinin tüm gizli birimleri (hidden units) toplanarak ortalama ve varyans hesaplanır. Bu sayede yığın boyutu 1 olsa bile normalizasyon kararlı bir şekilde çalışır.

$$\mu_L = \frac{1}{H} \sum_{i=1}^H x_i$$
$$\sigma_L^2 = \frac{1}{H} \sum_{i=1}^H (x_i - \mu_L)^2$$

Burada $H$ katmandaki gizli birim (hidden unit) sayısıdır.

### Avantajları
* **Yığın Boyutundan Bağımsızlık:** Batch size 1 olsa bile aynı kararlılıkla çalışır.
* **Dinamik Uzunluk Desteği:** Özellikle NLP modellerinde farklı uzunluktaki cümlelerin işlendiği durumlarda çok başarılıdır.

---

## BatchNorm ve LayerNorm Karşılaştırması

Aşağıdaki görselleştirme farkı anlamak için klasiktir: `[N, C, H, W]` formatındaki bir görsel tensoründe;
* **BatchNorm:** `[N, H, W]` boyutları üzerinden ortalama alır. Her kanal `C` için ayrı bir istatistik tutulur.
* **LayerNorm:** `[C, H, W]` boyutları üzerinden ortalama alır. Her örnek `N` için ayrı bir istatistik tutulur.

| Özellik | Batch Normalization (BatchNorm) | Layer Normalization (LayerNorm) |
| :--- | :--- | :--- |
| **Normalizasyon Ekseni** | Mini-batch örnekleri boyunca | Tek bir örneğin özellikleri boyunca |
| **Batch Size Bağımlılığı** | Çok yüksek | Yok |
| **En İyi Çalıştığı Alan** | Bilgisayarlı Görü (CNN, ResNet) | Doğal Dil İşleme (Transformer, GPT) |
| **Eğitim/Çıkarım Farkı** | Çıkarımda (inference) hareketli ortalama kullanır | Çıkarım ve eğitim sırasında aynı çalışır |

---

## PyTorch ile Kod Örneği

PyTorch üzerinde BatchNorm ve LayerNorm katmanlarının çıktı boyutlarını ve davranışlarını inceleyelim:

```python
import torch
import torch.nn as nn

# Örnek girdi: [Batch_Size=2, Channels/Features=3, Height/Width=4]
inputs = torch.randn(2, 3, 4)

# 1. Batch Normalization (Genellikle 1D, 2D veya 3D olarak ayrılır)
# num_features parametresi kanal sayısını (C) bekler
batch_norm = nn.BatchNorm1d(num_features=3)
bn_output = batch_norm(inputs)

# 2. Layer Normalization
# normalized_shape parametresi normalize edilecek boyutları belirtir
layer_norm = nn.LayerNorm(normalized_shape=[3, 4])
ln_output = layer_norm(inputs)

print("Girdi Boyutu:", inputs.shape)
print("BatchNorm Çıktı Boyutu:", bn_output.shape)
print("LayerNorm Çıktı Boyutu:", ln_output.shape)
```

---

## Sık Yapılan Hatalar

1. **Çıkarım (Inference) Modunu Unutmak:** BatchNorm, eğitim sırasında yığın istatistiklerini hesaplarken çıkarım sırasında eğitimde biriktirdiği hareketli ortalamaları (running mean/var) kullanır. Eğer PyTorch'ta `model.eval()` çağırmayı unutursanız, BatchNorm test verisini batch bazlı normalize etmeye çalışır ve tahminler sapıtır.
2. **Transformer Bloklarında BatchNorm Kullanımı:** NLP'de dizi uzunlukları dinamik olduğu için yığın bazlı normalizasyon gradyanları kararsızlaştırır. Transformer mimarilerinde her zaman LayerNorm tercih edilmelidir.

---

## Kaynaklar ve İleri Okuma

* [Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift (ArXiv Paper)](https://arxiv.org/abs/1502.03167)
* [Layer Normalization (ArXiv Paper)](https://arxiv.org/abs/1607.06450)
* [PyTorch Normalization Layers Documentation](https://pytorch.org/docs/stable/nn.html#normalization-layers)
