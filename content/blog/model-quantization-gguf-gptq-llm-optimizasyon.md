---
title: "Büyük Dil Modellerini Küçük Donanımlarda Çalıştırmak: Quantization (GGUF, GPTQ, AWQ)"
date: "2026-07-21"
tags: ["AI", "MLOps", "LLM", "Optimizasyon"]
readTime: "7 dk"
coverEmoji: "🗜️"
description: "Model quantization ile 70B parametreli dev modelleri tüketici donanımında nasıl çalıştırıyoruz?"
---

Llama 3 70B gibi modeller inanılmaz yetenekli. Fakat bu modelleri yerel ortamda, kendi donanımımızda çalıştırmaya kalktığımızda sert bir gerçekle karşılaşıyoruz: VRAM (Video RAM). 

Bir modelin ağırlıkları genellikle 16-bit float (FP16) formatında saklanır. 70 milyar parametreli bir modelin sadece ağırlıklarını hafızada tutmak için yaklaşık 140 GB VRAM'e ihtiyacınız var. Buna inference sırasındaki bağlam (context) hafızasını da eklediğinizde, bu modelleri çalıştırmak ev kullanıcısı veya küçük şirketler için imkansız hale gelir. 

Çözüm? Modelleri sıkıştırmak, yani **Quantization**.

## Quantization Nedir?

Quantization, modelin ağırlıklarını daha düşük hassasiyetli formatlara dönüştürme işlemidir. FP16 (16-bit) yerine 8-bit (INT8) veya 4-bit (INT4) veri tipleri kullanılır.

Temel sezgi şudur: Ağın her bir bağlantısının taşıdığı bilginin hassasiyetinden ödün vererek, toplam boyutu küçültürüz. 16.1234 yerine sadece 16 demek gibi düşünebilirsiniz. Tabii ki bir miktar bilgi kaybı yaşanır, ancak şaşırtıcı bir şekilde, 4-bit'e kadar inildiğinde bile modelin genel performansı ve akıl yürütme becerileri çok az düşer. 

Bunun karşılığında bellek ihtiyacı 4 kat azalır. 140 GB VRAM isteyen bir model, 4-bit quantization ile 35-40 GB VRAM'e sığabilir.

## Modern Quantization Formatları

Ekosistemde birçok farklı quantization yöntemi var, ancak üç tanesi standart haline geldi:

### 1. GGUF (Eski adıyla GGML)
Georgi Gerganov tarafından geliştirilen `llama.cpp` projesi için ortaya çıktı. GGUF'un en büyük avantajı CPU dostu olmasıdır. Apple Silicon (M1/M2/M3) işlemcilerin birleşik belleğini (Unified Memory) mükemmel kullanır. Eğer VRAM'iniz yoksa ve modeli sistem RAM'i üzerinden CPU veya Apple çipleriyle çalıştıracaksanız, GGUF kullanmalısınız.

### 2. GPTQ
Sadece GPU üzerinde çalışmak üzere tasarlanmıştır. Quantization işlemi sırasında küçük bir kalibrasyon veri seti kullanarak bilgi kaybını minimize eder. Modelleri sadece ekran kartınızın VRAM'ine sığdırmak ve olabildiğince hızlı token üretmek istiyorsanız tercih edilir. Text-generation-webui veya vLLM gibi araçlarla iyi çalışır.

### 3. AWQ (Activation-aware Weight Quantization)
GPTQ'ya benzer ancak daha yeni bir yaklaşımdır. Tüm ağırlıkları aynı şekilde sıkıştırmak yerine, modelin çıkışını (activation) en çok etkileyen %1'lik önemli ağırlıkları korur, geri kalan %99'u sıkıştırır. Bu sayede aynı bit seviyesinde GPTQ'dan daha iyi kalite sunar. 

## llama.cpp ile Pratik Uygulama

GGUF formatındaki bir modeli yerel makinenizde çalıştırmak oldukça basittir. Hugging Face üzerinden `Q4_K_M` (4-bit, önerilen denge) uzantılı bir model indirdiğinizi varsayalım.

```bash
# llama.cpp deposunu klonlayıp derleyin
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# İndirdiğiniz modeli çalıştırın
./main -m /path/to/model-q4_K_M.gguf -p "Makine öğrenmesinde quantization nedir?" -n 512
```

Python üzerinden API olarak kullanmak isterseniz `llama-cpp-python` kütüphanesini kullanabilirsiniz:

```python
from llama_cpp import Llama

# Modeli yükle
llm = Llama(model_path="./model-q4_K_M.gguf", n_ctx=2048)

# Çıktı üret
output = llm("Büyük dil modellerinin en büyük zorluğu nedir?", max_tokens=100)
print(output['choices'][0]['text'])
```

## Sık Yapılan Hatalar

- **Yanlış Format Seçimi:** Sadece CPU'nuz varsa GPTQ/AWQ indirmek modelin çalışmamasına neden olur. VRAM'iniz yetmiyorsa GGUF kullanın.
- **Aşırı Sıkıştırma (Q2 / 2-bit):** Modelin boyutunu küçültmek cazip gelse de, 3-bit'in altındaki sıkıştırmalarda modelin mantık kurma becerisi ciddi şekilde kırılır. 4-bit (Q4) genellikle performans ve kalite için tatlı noktadır.
- **Kalibrasyon Verisi Uyumsuzluğu:** Modeli kendiniz GPTQ/AWQ ile quantize ediyorsanız, kullandığınız kalibrasyon verisi modelin kullanım amacıyla uyuşmalıdır. Türkçe bir model yapıyorsanız kalibrasyon veriniz de ağırlıklı olarak Türkçe olmalıdır.

## Sonuç

Quantization, açık kaynaklı yapay zeka devriminin isimsiz kahramanıdır. Bu teknikler olmasaydı, Llama 3 veya Mistral gibi modeller sadece dev teknoloji şirketlerinin erişebildiği API'ler olarak kalırdı. Artık ortalama bir oyuncu bilgisayarı veya bir MacBook Pro, birkaç yıl önce veri merkezlerine sığan modelleri masamızda çalıştırabiliyor.

## Kaynaklar

1. [llama.cpp Github Repository - Georgi Gerganov](https://github.com/ggerganov/llama.cpp)
2. [AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration](https://arxiv.org/abs/2306.00978)
3. [GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323)
4. [Hugging Face Quantization Guide](https://huggingface.co/docs/optimum/concept_guides/quantization)