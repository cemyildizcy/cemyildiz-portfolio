---
title: "Büyük Dil Modellerinde RAG ve Fine-Tuning: Hangisini Ne Zaman Seçmeli?"
date: "2026-07-23"
tags: ["LLM", "RAG", "Fine-Tuning", "Yapay Zeka"]
readTime: "8 dk"
coverEmoji: "⚖️"
description: "LLM projelerinde güncel bilgi ve özelleştirme ikilemi: RAG ve Fine-Tuning yöntemlerinin çalışma prensipleri, mimarileri ve karar matrisi."
---

Büyük Dil Modelleri (LLM) kutudan çıktıkları halleriyle muazzam yeteneklere sahip olsalar da, işletmeye özel verilerle veya güncel bilgilerle çalışırken yetersiz kalırlar. Modellerin eğitim verileri statiktir ve eğitim tarihinden sonraki olayları bilemezler. Ayrıca şirket içi gizli dokümanlara veya dinamik API verilerine erişimleri yoktur.

Bu sınırlılığı aşmak ve LLM'i kendi verilerimizle zenginleştirmek için önümüzde iki temel yol bulunur: **Retrieval-Augmented Generation (RAG)** ve **Fine-Tuning (İnce Ayar)**.

Bu yazıda, iki yöntemin mimarisini, avantajlarını, dezavantajlarını inceleyecek ve projeniz için en doğru yöntemi seçmenizi sağlayacak karar matrisini ele alacağız.

---

## 1. RAG (Retrieval-Augmented Generation) Nedir?

RAG, modeli yeniden eğitmeden, prompt (girdi) aşamasında harici bir veri kaynağından ilgili bilgileri çekip modele bağlam (context) olarak sunma yöntemidir.

### Çalışma Prensibi:
1. **Veri Hazırlama:** Şirket dokümanları (PDF, Word, Markdown vb.) küçük parçalara (chunk) bölünür.
2. **Vektörleştirme (Embedding):** Her parça bir embedding modeliyle sayısal vektörlere dönüştürülür ve bir Vektör Veritabanında (Vector DB) saklanır.
3. **Arama ve Getirme (Retrieval):** Kullanıcı bir soru sorduğunda, sorunun vektörü ile veritabanındaki parçaların vektörleri karşılaştırılır (Cosine Similarity vb.) ve en alakalı doküman parçaları çekilir.
4. **Üretim (Generation):** Orijinal soru ve çekilen doküman parçaları birleştirilerek LLM'e gönderilir. LLM, bu bilgileri kullanarak cevap üretir.

---

## 2. Fine-Tuning Nedir?

Fine-Tuning, önceden eğitilmiş (pre-trained) bir LLM'in ağırlıklarını (weights), belirli bir veri setiyle ek eğitim yaparak kalıcı olarak değiştirme işlemidir. Modelin davranışını, tonunu, çıktı formatını veya belirli bir etki alanına (domain) ait terminolojiyi öğrenmesini sağlar.

### Çalışma Prensibi:
1. **Veri Seti Hazırlama:** Soru-cevap çiftleri veya modelin uymasını istediğiniz formatta binlerce örnekten oluşan etiketli bir veri seti hazırlanır.
2. **Ağırlık Güncelleme:** Gradyan inişi (gradient descent) kullanılarak model parametreleri bu yeni veri setine göre güncellenir. Günümüzde parametre verimli yöntemler (LoRA, QLoRA) kullanılarak sadece küçük bir parametre alt kümesi eğitilir.
3. **Kalıcı Değişiklik:** Eğitim sonrasında model artık yeni dili, tarzı veya kuralları doğrudan kendi parametrelerinde (belleğinde) taşır.

---

## 3. Kod Üzerinde RAG Mimarisi

RAG mimarisinin temel mantığını gösteren örnek bir Python implementasyonu:

```python
import numpy as np
from sentence_transformers import SentenceTransformer

# 1. Dokümanlar ve Embedding Modeli Yükleme
model = SentenceTransformer('all-MiniLM-L6-v2')
documents = [
    "Şirketimizin yıllık izin politikasına göre, 1 yıldan 5 yıla kadar kıdemi olan çalışanlar 14 iş günü izin hakkına sahiptir.",
    "Performans değerlendirme dönemleri her yılın Aralık ve Haziran aylarında gerçekleştirilir.",
    "BT destek talepleri için destek@sirket.com adresine e-posta gönderilmelidir."
]

# Doküman vektörlerini hesaplama
doc_embeddings = model.encode(documents)

def retrieve(query: str, top_k: int = 1) -> str:
    # 2. Sorguyu vektöre dönüştürme
    query_embedding = model.encode([query])
    
    # 3. Benzerlik hesaplama (Cosine Similarity)
    similarities = np.dot(doc_embeddings, query_embedding.T).flatten()
    best_idx = np.argmax(similarities)
    
    return documents[best_idx]

def generate_rag_prompt(query: str) -> str:
    # 4. Alakalı dokümanı çekme
    context = retrieve(query)
    
    # 5. Bağlam içeren prompt oluşturma
    prompt = f"""Aşağıdaki bağlam bilgisini kullanarak soruyu yanıtla. Eğer yanıtı bağlamda bulamıyorsan 'Bilmiyorum' de.
    
    Bağlam: {context}
    Soru: {query}
    Cevap:"""
    return prompt

# Örnek Kullanım
sorgu = "Kıdemi 3 yıl olan bir çalışan kaç gün izin kullanabilir?"
hazir_prompt = generate_rag_prompt(sorgu)
print(hazir_prompt)
```

---

## 4. Karşılaştırma ve Karar Matrisi

Hangi yöntemi seçeceğinizi belirlerken aşağıdaki kriterleri göz önünde bulundurmalısınız:

| Kriter | RAG | Fine-Tuning |
| :--- | :--- | :--- |
| **Bilgi Güncelliği** | Çok Kolay (Veritabanını güncellemek yeterli) | Zor (Yeniden eğitim gerekir) |
| **Halüsinasyon Oranı** | Düşük (Kaynağa bağlı yanıt üretir) | Orta/Yüksek (Kendi hafızasından uydurabilir) |
| **Stil/Format Uyumu** | Orta (Prompt yönlendirmesiyle sınırlı) | Çok Yüksek (Yapıyı doğrudan öğrenir) |
| **Donanım/Eğitim Maliyeti**| Düşük (Sadece embedding ve vektör arama maliyeti)| Yüksek (GPU/Eğitim zamanı ve uzmanlık) |
| **Geliştirme Süresi** | Hızlı (Günler içinde kurulabilir) | Yavaş (Haftalar/Aylar süren veri hazırlığı) |

---

## 5. Sık Yapılan Hatalar

- **RAG yerine Fine-Tuning ile bilgi öğretmeye çalışmak:** Fine-Tuning modele yeni bilgiler (örneğin güncel şirket politikaları) öğretmek için uygun değildir; model bu bilgileri ezberlemeye çalışırken halüsinasyona meyilli hale gelir. Bilgi güncellemesi için RAG kullanılmalıdır.
- **RAG sistemlerinde Chunking stratejisini önemsememek:** Dokümanları rastgele boyutlarda bölmek, vektör aramasında anlam kaybına neden olur. Semantik sınırlara göre (paragraf, başlık vb.) chunking yapılmalıdır.
- **Kalitesiz veri setiyle Fine-Tuning yapmak:** "Garbage in, garbage out" (Çöp girerse çöp çıkar) kuralı geçerlidir. Tutarsız ve temizlenmemiş veri setleri modelin performansını düşürür.

---

## Sonuç

- **RAG**, eğer amacınız **bilgiye erişim**, güncel verileri sorgulama ve yanlış bilgi üretmeme ise en iyi seçenektir.
- **Fine-Tuning**, eğer amacınız modelin **tarzını değiştirmek**, belirli bir çıktı formatına (JSON vb.) uymasını sağlamak veya sınırlı bir alandaki terminolojiyi öğretmekse tercih edilmelidir.

Birçok kurumsal projede en verimli yaklaşım, önce RAG ile başlayıp, modelin davranışı ve stilini optimize etmek gerektiğinde hibrit bir mimari kurarak **fine-tune edilmiş bir modeli RAG ile beslemektir**.

---

## Kaynaklar

1. [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)](https://arxiv.org/abs/2005.11401)
2. [Hugging Face - Fine-Tuning Guide](https://huggingface.co/docs/transformers/training)
3. [LangChain - RAG Architecture and Concept Guide](https://python.langchain.com/docs/concepts/rag/)
4. [LlamaIndex - High-Level Concepts in RAG](https://docs.llamaindex.ai/en/stable/getting_started/concepts/)
