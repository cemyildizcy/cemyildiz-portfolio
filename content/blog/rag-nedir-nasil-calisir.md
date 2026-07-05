---
title: "RAG Nedir ve Nasıl Çalışır?"
date: "2026-07-03"
tags: ["LLM", "RAG", "Yapay Zeka", "Vector Search", "MLOps"]
readTime: "13 dk"
coverEmoji: "📚"
description: "Retrieval-Augmented Generation yaklaşımını veri hazırlama, embedding, vektör arama, context oluşturma ve değerlendirme adımlarıyla pratik şekilde anlatan rehber."
---

# RAG Nedir ve Nasıl Çalışır?

Büyük dil modelleri güçlüdür ama iki temel sorunları vardır. Birincisi, eğitim verilerinin dışında kalan güncel veya özel bilgileri bilmeyebilirler. İkincisi, bilmediği bir konuda emin bir dille yanlış cevap üretebilirler. RAG, yani Retrieval-Augmented Generation, bu iki sorunu azaltmak için kullanılan pratik bir yaklaşımdır.

RAG'in fikri basittir: Model cevap vermeden önce ilgili kaynaklardan bilgi getirilir, sonra model bu bilgiye dayanarak cevap üretir. Yani model tek başına hafızasına güvenmez; önce dokümanlara bakar.

## RAG neden ortaya çıktı?

Bir şirketin iç dokümanları, ders notları, proje README'leri veya güncel makaleler LLM'in eğitim verisinde olmayabilir. Modelden bu bilgilere göre cevap beklemek risklidir. Fine-tuning yapılabilir ama her bilgi güncellemesinde modeli yeniden eğitmek pahalı ve yavaş olur.

RAG burada daha esnek bir çözüm sunar. Bilgiyi modelin ağırlıklarına gömmek yerine dış bir bilgi tabanında tutarsın. Doküman değişirse modeli eğitmezsin, sadece indeksini güncellersin.

## Temel akış

Bir RAG sistemi genelde şu adımlardan oluşur:

1. Dokümanları toplama
2. Metni parçalara ayırma
3. Her parçayı embedding'e dönüştürme
4. Embedding'leri vektör veritabanına kaydetme
5. Kullanıcı sorusunu embedding'e dönüştürme
6. En alakalı parçaları arama
7. Bulunan parçaları prompt'a context olarak ekleme
8. Modelden cevap üretme
9. Cevabı kaynaklarla birlikte gösterme

Bu akış basit görünür ama kaliteyi belirleyen detaylar her adımda saklıdır.

## Dokümanları parçalamak neden önemli?

Bir PDF veya uzun markdown dosyasını tek parça olarak embedding'e çevirmek genelde iyi sonuç vermez. Çünkü metin çok uzunsa tek embedding tüm anlamı temsil etmekte zorlanır. Bu yüzden dokümanlar daha küçük parçalara ayrılır. Buna chunking denir.

Chunk boyutu çok küçük olursa bağlam kaybolur. Çok büyük olursa arama hassasiyeti düşer. Bu yüzden iyi bir denge gerekir.

Örneğin:

- 200 kelimelik chunk: Daha hassas arama ama bağlam az.
- 800 kelimelik chunk: Daha fazla bağlam ama arama daha kaba.
- Overlap kullanımı: Bir parçanın son kısmı sonraki parçaya da eklenir, böylece cümle veya konu kopmaları azalır.

RAG sisteminin kalitesi çoğu zaman modelden önce chunking stratejisine bağlıdır.

## Embedding nedir?

Embedding, metni sayısal bir vektöre dönüştürür. Amaç, anlamca benzer metinlerin vektör uzayında birbirine yakın olmasıdır.

Örneğin şu iki cümle kelime olarak farklıdır ama anlamca yakındır:

- "Model eğitim verisini ezberliyor."
- "Algoritma train setine fazla uyum sağladı."

İyi bir embedding modeli bu iki cümleyi yakın konumlara yerleştirir. Böylece kullanıcı "overfitting nasıl anlaşılır?" diye sorduğunda sistem ilgili parçaları bulabilir.

## Vektör arama nasıl çalışır?

Kullanıcı soru sorduğunda soru da embedding'e çevrilir. Sonra vektör veritabanında bu embedding'e en yakın doküman parçaları aranır. Genelde cosine similarity veya benzer metrikler kullanılır.

Basit mantık şu:

```text
soru embedding'i → vektör DB → en yakın 5 doküman parçası → LLM prompt'u
```

Burada "en yakın" her zaman "en doğru" anlamına gelmez. Bu yüzden retrieval kalitesi çok önemlidir.

## Context penceresi sınırsız değil

LLM'e çok fazla doküman parçası verirsen context şişer. Bu hem maliyeti artırır hem de modelin dikkatini dağıtabilir. Çok az parça verirsen model gerekli bilgiyi kaçırabilir.

Bu yüzden pratikte genelde `top_k` seçimi yapılır. Mesela en alakalı 4 veya 6 parça alınır. Bazı sistemler önce geniş arama yapar, sonra reranker ile en iyi parçaları tekrar sıralar.

Reranking şu işe yarar: İlk vektör arama hızlıca adayları bulur, reranker ise bu adaylar arasında gerçekten soruya en iyi cevap verenleri seçer.

## RAG hallucination'ı tamamen bitirir mi?

Hayır. RAG yanlış cevap ihtimalini azaltır ama tamamen sıfırlamaz. Çünkü model hâlâ gelen context'i yanlış yorumlayabilir, kaynakta olmayan bir çıkarım yapabilir veya eksik bilgiyle fazla kesin konuşabilir.

Bunu azaltmak için prompt'ta açık kurallar kullanılır:

```text
Sadece verilen kaynaklara dayanarak cevap ver.
Kaynaklarda bilgi yoksa bilmediğini söyle.
Cevabın sonunda kullandığın kaynakları belirt.
```

Ayrıca sistem cevabın hangi kaynak parçalarına dayandığını gösterebilirse kullanıcı daha rahat kontrol eder.

## RAG sisteminde kalite nasıl ölçülür?

RAG değerlendirmesi sadece "cevap güzel mi?" diye bakılarak yapılmaz. İki ayrı kalite vardır:

1. Retrieval kalitesi: Doğru doküman parçaları getirildi mi?
2. Generation kalitesi: Model getirilen bilgilere dayanarak doğru cevap verdi mi?

Retrieval kötü ise modelin iyi olması yetmez. Yanlış context verilirse model yanlış cevap üretir. Generation kötü ise doğru context verilse bile cevap zayıf olur.

Ölçmek için şu metrikler kullanılabilir:

- Recall@k: Doğru doküman ilk k sonuç içinde mi?
- Precision@k: Getirilen parçaların kaçı gerçekten alakalı?
- Faithfulness: Cevap kaynaklara sadık mı?
- Answer relevance: Cevap soruyu gerçekten karşılıyor mu?

## Küçük bir RAG projesi nasıl kurulur?

Basit bir kişisel doküman RAG sistemi için şöyle ilerlenebilir:

1. Markdown/PDF dosyalarını topla.
2. Metni temizle.
3. 400-800 kelimelik chunk'lara böl.
4. Embedding modeli seç.
5. Vektör veritabanına kaydet.
6. Kullanıcı sorusunu embed et.
7. En alakalı parçaları getir.
8. Prompt'a context olarak ekle.
9. Cevabı kaynak linkleriyle göster.

Bu yapı ders notları, proje dokümantasyonu, kişisel bilgi tabanı veya şirket içi dokümanlar için kullanılabilir.

## Sık yapılan hatalar

RAG projelerinde sık gördüğüm hatalar şunlar:

- Tüm PDF'i tek parça embedding'e çevirmek.
- Chunk overlap kullanmamak.
- Kaynakları temizlemeden indekslemek.
- Çok fazla alakasız context'i prompt'a doldurmak.
- Cevapta kaynak göstermemek.
- Retrieval ve generation hatalarını ayrı ölçmemek.
- Güncellenen dokümanları yeniden indekslememek.

Bu hatalar model değiştirilerek her zaman çözülmez. Bazen sorun GPT/Claude/Gemini seçimi değil, veri hazırlama ve retrieval tasarımıdır.

## RAG ne zaman iyi fikirdir?

RAG şu durumlarda mantıklıdır:

- Bilgi sık güncelleniyorsa.
- Kaynaklar özel veya kuruma aitse.
- Cevaplarda kaynak göstermek gerekiyorsa.
- Fine-tuning pahalı veya gereksizse.
- Modelin genel bilgisi yetmiyorsa.

Ama her problem RAG istemez. Sadece sabit bir formatta çıktı almak istiyorsan prompt engineering yeterli olabilir. Modelin belirli bir yazım tarzını öğrenmesini istiyorsan fine-tuning daha uygun olabilir. RAG özellikle bilgi getirme problemi varsa anlamlıdır.

## Sonuç

RAG, LLM'i daha güvenilir hale getirmenin pratik yollarından biridir. Modeli yeniden eğitmeden güncel veya özel bilgiyi kullanmanı sağlar. Fakat iyi bir RAG sistemi sadece model çağırmak değildir. Doküman hazırlama, chunking, embedding, arama, reranking, prompt tasarımı ve değerlendirme birlikte düşünülmelidir.

Bir RAG projesinde önce veriyi ve retrieval kalitesini düzeltmek gerekir. Model seçimi önemlidir ama çoğu zaman en büyük farkı temiz veri ve doğru arama stratejisi yaratır.

## Kaynaklar

- Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks": https://arxiv.org/abs/2005.11401
- LangChain RAG Concepts: https://python.langchain.com/docs/concepts/rag/
- LlamaIndex documentation: https://docs.llamaindex.ai/
- Pinecone, "What is Retrieval-Augmented Generation?": https://www.pinecone.io/learn/retrieval-augmented-generation/
- Hugging Face, "RAG models": https://huggingface.co/docs/transformers/model_doc/rag
