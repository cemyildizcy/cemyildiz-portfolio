---
title: "LLM Fine-Tuning Rehberi: Büyük Dil Modellerini Kendi Verinle Eğitmek"
date: "2026-07-18"
tags: ["LLM", "Fine-Tuning", "LoRA", "QLoRA", "Transformers"]
readTime: "15 dk"
coverEmoji: "🧠"
description: "Full fine-tuning vs LoRA/QLoRA, veri hazırlama, Hugging Face Transformers ile pratik fine-tuning adımları ve kaynak yönetimi stratejileri."
---

Büyük dil modelleri (LLM'ler) genel amaçlı yetenekleriyle etkileyici olsalar da, spesifik bir alan veya görev için optimize edilmeleri gerektiğinde **fine-tuning** kaçınılmaz hale gelir. Bu rehberde, LLM fine-tuning sürecinin neden gerekli olduğundan başlayarak, modern parametre-verimli yöntemleri, veri hazırlama stratejilerini ve pratik uygulama adımlarını adım adım inceleyeceğiz.

## Neden Fine-Tuning? Prompting ve RAG Yetmez mi?

LLM'leri özelleştirmenin üç temel yaklaşımı vardır. Hangi yaklaşımın ne zaman uygun olduğunu anlamak, gereksiz maliyet ve emekten kaçınmak için kritiktir.

### Prompt Engineering

En düşük maliyetli yaklaşım. Modelin davranışını system prompt, few-shot örnekler ve yapılandırılmış talimatlarla yönlendirirsiniz. **Avantajları:** Eğitim gerektirmez, hızlı iterasyon, model güncellemelerinden etkilenmez. **Sınırlamaları:** Context window sınırı, tutarsız çıktılar, model bilgi tabanını değiştirememe, her çağrıda token maliyeti.

### RAG (Retrieval-Augmented Generation)

Modele harici bilgi kaynağından ilgili dokümanlar sağlanır. **Avantajları:** Güncel bilgi erişimi, kaynak gösterilebilir, hallucination azaltma. **Sınırlamaları:** Retrieval kalitesine bağımlılık, ek altyapı gereksinimi, modelin *nasıl* yanıt verdiğini değiştirememe.

### Fine-Tuning

Modelin ağırlıklarını kendi verinizle güncellersiniz. **Avantajları:** Modelin davranışını köklü değiştirme, tutarlı çıktı formatı, inference'ta ek context gerekmemesi, domain-specific bilgi kazandırma. **Sınırlamaları:** Hesaplama maliyeti, veri hazırlama eforu, catastrophic forgetting riski.

**Ne zaman fine-tuning gerekli?**
- Model belirli bir format veya stil tutturamıyorsa
- Domain-specific terminoloji ve bilgi gerekiyorsa
- Inference maliyetini düşürmek istiyorsanız (uzun prompt yerine eğitilmiş davranış)
- Tutarlı ve tekrarlanabilir çıktılar kritikse
- RAG pipeline'ı yeterli kaliteyi sağlayamıyorsa

## Full Fine-Tuning vs Parameter-Efficient Yöntemler

### Full Fine-Tuning

Tüm model parametreleri güncellenir. 7B parametreli bir model için bile en az 60-80 GB GPU belleği gerekir (Adam optimizer ile parametre başına ~16 byte). **Avantajları:** Maksimum performans potansiyeli, tüm katmanlarda adaptasyon. **Dezavantajları:** Aşırı kaynak gereksinimi, catastrophic forgetting riski yüksek, her görev için ayrı model kopyası gerekir.

Pratikte, çoğu kullanım senaryosunda full fine-tuning artık tercih edilmemektedir. Parameter-efficient yöntemler, çok daha düşük maliyetle karşılaştırılabilir sonuçlar üretir.

### LoRA: Low-Rank Adaptation

LoRA, Edward Hu ve arkadaşları tarafından 2021'de önerilen ve fine-tuning paradigmasını değiştiren bir tekniktir. Temel fikir şudur: büyük bir ağırlık matrisindeki güncellemeyi, iki küçük matrisin çarpımı olarak ayrıştırmak.

Orijinal ağırlık matrisi `W₀ ∈ ℝ^(d×k)` için güncelleme:

```
W = W₀ + ΔW = W₀ + BA
```

Burada `B ∈ ℝ^(d×r)` ve `A ∈ ℝ^(r×k)` olup, `r << min(d,k)` düşük rank değeridir. Bu sayede:

- **7B modelde** full fine-tuning ~7 milyar parametre güncellerken, LoRA (r=16) yalnızca ~17 milyon parametre eğitir (%0.24)
- Orijinal ağırlıklar dondurulur — catastrophic forgetting önemli ölçüde azalır
- Birden fazla görev için ayrı LoRA adaptörleri eğitilip, çalışma zamanında hızlıca değiştirilebilir
- Eğitim bellek gereksinimi 4-8x azalır

LoRA genellikle attention katmanlarındaki Q, K, V ve output projection matrislerine uygulanır. `rank` değeri arttıkça ifade gücü artar ancak parametre sayısı da artar — tipik olarak 8-64 arası iyi sonuç verir.

### QLoRA: Quantized LoRA

Tim Dettmers ve ekibi tarafından 2023'te önerilen QLoRA, LoRA'yı bir adım öteye taşır: base model 4-bit'e quantize edilir ve LoRA adaptörleri bu quantize model üzerine eklenir.

QLoRA'nın üç temel yeniliği:

1. **4-bit NormalFloat (NF4):** Normal dağılıma optimum şekilde uyarlanmış bir 4-bit veri tipi. Bilgi teorik olarak optimal quantization sağlar.
2. **Double Quantization:** Quantization sabitlerinin kendisi de quantize edilir, ek ~0.37 bit/parametre tasarruf sağlar.
3. **Paged Optimizers:** GPU bellek taşmalarında optimizer state'lerini CPU belleğe otomatik olarak sayfalayan unified memory yönetimi.

QLoRA ile 65B parametreli bir model tek bir 48GB GPU'da fine-tune edilebilir. Bu, fine-tuning'i demokratikleştiren bir atılımdır.

### Diğer Parameter-Efficient Yöntemler

**Prefix Tuning:** Her transformer katmanına eğitilebilir "prefix" vektörleri eklenir. Soft prompt yaklaşımının genelleştirilmiş hali.

**Adapters:** Transformer blokları arasına küçük bottleneck katmanları eklenir. İlk PEFT yöntemlerinden biridir.

**IA3:** Aktivasyonları ölçeklendiren öğrenilebilir vektörler ekler. LoRA'dan bile az parametre gerektirir, ancak performans farkı tartışmalıdır.

## Veri Hazırlama: Fine-Tuning'in Temeli

Fine-tuning'in başarısı büyük ölçüde veri kalitesine bağlıdır. "Garbage in, garbage out" prensibi burada fazlasıyla geçerlidir.

### Instruction Format

Modern LLM fine-tuning'de en yaygın format, **instruction-following** formatıdır. Her örnek üç bileşenden oluşur:

```json
{
  "instruction": "Aşağıdaki metni özetle.",
  "input": "Yapay zeka, insan zekasını taklit eden...",
  "output": "Yapay zeka, bilgisayar sistemlerinin insan benzeri..."
}
```

Alternatif olarak **chat format** kullanılabilir:

```json
{
  "messages": [
    {"role": "system", "content": "Sen yardımcı bir asistansın."},
    {"role": "user", "content": "Python'da liste sıralama nasıl yapılır?"},
    {"role": "assistant", "content": "Python'da listeleri sıralamanın..."}
  ]
}
```

Seçtiğiniz format, base modelin eğitim formatıyla uyumlu olmalıdır. Örneğin, Llama modelleri için `[INST]` tokenları, ChatML formatı için `<|im_start|>` tokenları kullanılır.

### Veri Kalitesi Kontrol Listesi

1. **Tutarlılık:** Tüm örnekler aynı format ve stilde mi?
2. **Doğruluk:** Çıktılar factual olarak doğru mu?
3. **Çeşitlilik:** Veri seti yeterince geniş bir dağılımı kapsıyor mu?
4. **Uzunluk dağılımı:** Çok kısa veya çok uzun örnekler modeli bozabilir.
5. **Temizlik:** Tekrarlanan, çelişen veya düşük kaliteli örnekler filtrelendi mi?
6. **Yeterlilik:** Genellikle 1K-10K kaliteli örnek iyi bir başlangıçtır; 50K+ ideale yakındır.

### Veri Temizleme Pratiği

```python
import json
from datasets import Dataset

def clean_and_validate(examples):
    cleaned = []
    for ex in examples:
        # Boş veya çok kısa örnekleri filtrele
        if len(ex['output'].strip()) < 20:
            continue
        # Çok uzun örnekleri kırp (max_length'e göre)
        if len(ex['instruction']) + len(ex['output']) > 4096:
            ex['output'] = ex['output'][:3000]
        # Whitespace temizliği
        ex['instruction'] = ex['instruction'].strip()
        ex['output'] = ex['output'].strip()
        cleaned.append(ex)
    return cleaned

# Veri yükleme ve temizleme
with open('raw_data.json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

cleaned_data = clean_and_validate(raw_data)
dataset = Dataset.from_list(cleaned_data)
dataset = dataset.train_test_split(test_size=0.1)
print(f"Eğitim: {len(dataset['train'])}, Test: {len(dataset['test'])}")
```

## Pratik Fine-Tuning: Hugging Face Transformers + PEFT

Şimdi tüm parçaları birleştirerek, Hugging Face ekosistemi ile adım adım bir fine-tuning pipeline'ı kuralım.

### Gerekli Kütüphaneler

```bash
pip install transformers peft trl datasets bitsandbytes accelerate
```

### Adım 1: Model ve Tokenizer Yükleme

```python
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

# 4-bit quantization konfigürasyonu (QLoRA)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

model_name = "meta-llama/Llama-3.1-8B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto",
    torch_dtype=torch.bfloat16,
)
model = prepare_model_for_kbit_training(model)
```

### Adım 2: LoRA Konfigürasyonu

```python
lora_config = LoraConfig(
    r=16,                          # Rank — ifade gücü vs verimlilik dengesi
    lora_alpha=32,                 # Ölçeklendirme faktörü (genellikle 2*r)
    target_modules=[               # LoRA uygulanacak katmanlar
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Çıktı: trainable params: 13,631,488 || all params: 8,043,235,328 || trainable%: 0.1695
```

### Adım 3: Eğitim Konfigürasyonu

```python
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,   # Efektif batch size = 4 * 4 = 16
    gradient_checkpointing=True,     # Bellek tasarrufu
    optim="paged_adamw_8bit",        # QLoRA paged optimizer
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    weight_decay=0.01,
    fp16=False,
    bf16=True,
    max_grad_norm=0.3,
    logging_steps=10,
    save_strategy="steps",
    save_steps=100,
    eval_strategy="steps",
    eval_steps=100,
    save_total_limit=3,
    report_to="wandb",               # Opsiyonel: W&B takibi
)
```

### Adım 4: Eğitimi Başlatma

```python
trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["test"],
    processing_class=tokenizer,
    max_seq_length=2048,
)

trainer.train()

# Adaptörü kaydet
trainer.model.save_pretrained("./fine-tuned-adapter")
tokenizer.save_pretrained("./fine-tuned-adapter")
```

## Hesaplama Kaynakları ve Optimizasyon

### GPU Bellek Gereksinimleri

Model büyüklüğüne göre yaklaşık bellek ihtiyaçları:

| Model Boyutu | Full FT (FP16) | LoRA (FP16) | QLoRA (4-bit) |
|--------------|----------------|-------------|---------------|
| 7B           | ~60 GB         | ~20 GB      | ~10 GB        |
| 13B          | ~120 GB        | ~40 GB      | ~18 GB        |
| 70B          | ~600 GB        | ~160 GB     | ~48 GB        |

### Gradient Checkpointing

Normalde tüm ara aktivasyonlar bellekte tutulur (forward pass sırasında). Gradient checkpointing, bu aktivasyonları siler ve backward pass sırasında yeniden hesaplar:

- **Bellek tasarrufu:** ~60-70% azalma
- **Hız maliyeti:** ~20-30% yavaşlama
- Tek bir satır ile etkinleştirilebilir: `gradient_checkpointing=True`

Sınırlı GPU belleğiyle çalışıyorsanız, gradient checkpointing olmazsa olmazdır.

### DeepSpeed Entegrasyonu

Microsoft'un DeepSpeed kütüphanesi, çoklu GPU'larda verimli eğitim sağlar:

```json
// ds_config.json - ZeRO Stage 2
{
  "bf16": {"enabled": true},
  "zero_optimization": {
    "stage": 2,
    "offload_optimizer": {
      "device": "cpu",
      "pin_memory": true
    },
    "allgather_partitions": true,
    "allgather_bucket_size": 2e8,
    "reduce_scatter": true,
    "reduce_bucket_size": 2e8
  },
  "gradient_accumulation_steps": 4,
  "gradient_clipping": 1.0,
  "train_batch_size": "auto",
  "train_micro_batch_size_per_gpu": "auto"
}
```

ZeRO aşamaları:
- **Stage 1:** Optimizer state'leri bölünür → ~4x bellek tasarrufu
- **Stage 2:** + Gradyanlar bölünür → ~8x bellek tasarrufu
- **Stage 3:** + Model parametreleri bölünür → doğrusal ölçekleme

### Flash Attention

Flash Attention 2, attention hesaplamasını IO-aware hale getirerek hem hızlandırma hem de bellek tasarrufu sağlar:

```python
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    attn_implementation="flash_attention_2",
    torch_dtype=torch.bfloat16,
)
```

## Fine-Tuning Sonrası Değerlendirme

### Otomatik Metrikler

```python
from transformers import pipeline
import evaluate

# Modeli yükle
pipe = pipeline("text-generation", model="./fine-tuned-adapter", tokenizer=tokenizer)

# Test seti üzerinde tahminler üret
predictions = []
references = []

for example in dataset["test"]:
    prompt = format_prompt(example["instruction"], example["input"])
    output = pipe(prompt, max_new_tokens=512, temperature=0.1)[0]["generated_text"]
    predictions.append(output)
    references.append(example["output"])

# ROUGE skoru (özetleme görevleri için)
rouge = evaluate.load("rouge")
results = rouge.compute(predictions=predictions, references=references)
print(f"ROUGE-L: {results['rougeL']:.4f}")
```

### İnsan Değerlendirmesi

Otomatik metrikler her zaman yeterli değildir. Şu boyutlarda insan değerlendirmesi yapılmalıdır:

- **Doğruluk:** Üretilen bilgi factual olarak doğru mu?
- **İlgililik:** Yanıt soruyla ilgili mi?
- **Akıcılık:** Dil doğal ve akıcı mı?
- **Zararsızlık:** Zararlı, yanlı veya uygunsuz içerik üretiyor mu?
- **Format uyumu:** İstenen formata uyuyor mu?

### Catastrophic Forgetting Testi

Fine-tuning sonrası modelin genel yeteneklerini kaybetmediğini doğrulamak önemlidir:

```python
# Genel yetenekleri test et
general_prompts = [
    "Python'da bir listeyi nasıl sıralarım?",
    "Fotosentez nedir, kısaca açıkla.",
    "İkinci Dünya Savaşı ne zaman başladı?",
]

for prompt in general_prompts:
    response = pipe(prompt, max_new_tokens=200)[0]["generated_text"]
    print(f"Soru: {prompt}")
    print(f"Yanıt: {response}\n")
```

## Yaygın Hatalar ve İpuçları

1. **Yetersiz veri çeşitliliği:** Model, eğitim verisindeki kalıpları ezberler. Çeşitli örnekler ve edge case'ler ekleyin.

2. **Yanlış learning rate:** Çok yüksek → felaket düzeyinde forgetting. Çok düşük → yetersiz öğrenme. QLoRA için 1e-4 ile 3e-4 arası genellikle iyi çalışır.

3. **Aşırı eğitim (overtraining):** Validation loss izleyin; artmaya başladığında erken durdurun. Genellikle 1-3 epoch yeterlidir.

4. **Format uyumsuzluğu:** Eğitim formatı ile inference formatı birebir aynı olmalıdır — özel tokenlar, boşluklar ve satır sonları dahil.

5. **Tokenizer sorunları:** Pad token'ın doğru ayarlandığından, chat template'in base model ile uyumlu olduğundan emin olun.

6. **Veri sızıntısı:** Test setinizin eğitim setinden tamamen bağımsız olduğunu doğrulayın — özellikle augmented veri kullanıyorsanız.

## Sonuç

LLM fine-tuning, doğru senaryolarda son derece güçlü bir araçtır. QLoRA gibi yöntemler sayesinde artık tek bir consumer GPU ile bile milyarlarca parametreli modelleri özelleştirebilirsiniz. Ancak unutmayın: fine-tuning her derde deva değildir. Önce prompt engineering ve RAG seçeneklerini değerlendirin; eğer bunlar yetmiyorsa, kaliteli veri hazırlayarak parametre-verimli fine-tuning ile başlayın.

Bu alandaki gelişmeler inanılmaz hızda ilerliyor. LoRA'nın ardından DoRA, ReLoRA gibi yeni yöntemler, daha verimli quantization teknikleri ve daha iyi eğitim stratejileri sürekli olarak ortaya çıkıyor. Temel prensipleri anladığınızda, bu yeni gelişmeleri takip etmek ve uygulamak çok daha kolay olacaktır.

## Kaynaklar

1. Hu, E. J., Shen, Y., Wallis, P., et al. (2021). "LoRA: Low-Rank Adaptation of Large Language Models." *arXiv preprint arXiv:2106.09685*. [https://arxiv.org/abs/2106.09685](https://arxiv.org/abs/2106.09685)

2. Dettmers, T., Pagnoni, A., Holtzman, A., & Zettlemoyer, L. (2023). "QLoRA: Efficient Finetuning of Quantized Large Language Models." *arXiv preprint arXiv:2305.14314*. [https://arxiv.org/abs/2305.14314](https://arxiv.org/abs/2305.14314)

3. Hugging Face PEFT Documentation. "Parameter-Efficient Fine-Tuning." [https://huggingface.co/docs/peft](https://huggingface.co/docs/peft)

4. Rajbhandari, S., Rasley, J., Ruwase, O., & He, Y. (2020). "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models." *SC '20: Proceedings of the International Conference for High Performance Computing*. [https://arxiv.org/abs/1910.02054](https://arxiv.org/abs/1910.02054)

5. Dao, T. (2023). "FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning." *arXiv preprint arXiv:2307.08691*. [https://arxiv.org/abs/2307.08691](https://arxiv.org/abs/2307.08691)
