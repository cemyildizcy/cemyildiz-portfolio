---
title: "Vektör Veritabanları ve Embedding Tabanlı Arama: Nasıl Çalışır, Ne Zaman Kullanılır?"
date: "2026-07-11"
tags: ["vektör veritabanı", "embedding", "similarity search", "AI", "veri bilimi"]
readTime: "12 dk"
coverEmoji: "🔍"
description: "Embedding nedir, vektör veritabanları nasıl çalışır, hangi senaryolarda kullanılır? Temel kavramlar, pratik örnekler ve yaygın hatalar."
---

# Vektör Veritabanları ve Embedding Tabanlı Arama

Metin arama dediğimizde aklımıza genellikle kelime eşleştirme gelir. Kullanıcı bir şey yazar, sistem de o kelimeleri içeren kayıtları döndürür. Bu yöntem onlarca yıldır işe yarıyor, ama bazı durumlarda yetersiz kalır. Kullanıcı "dizüstü bilgisayar" yazıyorsa, "laptop" içeren kayıtları bulamaz. "Yağmurda araç sürme" ile "ıslak zeminde direksiyon hakimiyeti" anlamca aynı kapıya çıkar ama kelime düzeyinde örtüşmeleri yoktur.

Bu tür anlamsal (semantic) aramayı mümkün kılan teknoloji, embedding tabanlı vektör aramadır. Metinleri, görselleri, ses parçalarını veya başka veri tiplerini sayısal vektörlere dönüştürürsün. Sonra bu vektörler arasındaki mesafeye bakarak benzerlik ölçersin. Kelime eşleşmesi yerine anlam yakınlığı devreye girer.

Vektör veritabanları ise bu vektörleri depolayan, indeksleyen ve hızlı bir şekilde sorgulanmasını sağlayan sistemlerdir. Son birkaç yılda LLM'lerin yaygınlaşmasıyla birlikte bu veritabanları da çok daha fazla kullanılır oldu. RAG sistemleri, öneri motorları, anomali tespiti, görsel arama gibi pek çok uygulamanın arkasında bu yapı var.

## Problem: Geleneksel arama neden yetmiyor?

Klasik tam metin araması (full-text search) kelime bazlı çalışır. Elasticsearch ya da PostgreSQL'in `tsvector` özelliği gibi araçlar bu iş için tasarlanmıştır. TF-IDF veya BM25 gibi algoritmalar kelimelerin ne kadar sık geçtiğine ve ne kadar ayırt edici olduğuna bakarak sıralama yapar.

Ama bu yaklaşımda bazı problemler var:

- Eş anlamlı kelimeleri yakalayamaz. "Otomobil" ve "araba" aynı anlama gelir ama kelime aramasında farklı sonuçlar döner.
- Dilden bağımsız arama yapamaz. İngilizce bir soru ile Türkçe bir doküman eşleşmez.
- Bağlam farkını anlayamaz. "Python yılanı" ile "Python programlama dili" aynı kelimeyi kullanır ama tamamen farklı konulardır.
- Çok modlu (multimodal) veri arayamaz. Bir görsel ile metin arasında benzerlik ölçmek kelime eşleştirmesiyle mümkün değildir.

Bu sınırlamalar, anlam tabanlı aramayı gerekli kılar.

## Embedding: Anlamı sayıya çevirmek

Embedding, bir veri parçasını (metin, görsel, ses) sabit boyutlu bir sayı dizisine, yani vektöre dönüştüren bir işlemdir. Bu dönüşümü yapan modele embedding modeli denir.

Bir embedding modeli şöyle çalışır: Girdi olarak bir metin alır, çıktı olarak mesela 768 veya 1536 boyutlu bir vektör üretir. Bu vektörün her bir elemanı metnin anlamına dair bir özelliği kodlar. Tam olarak hangi boyutun neyi temsil ettiğini insanlar doğrudan okuyamaz, ama modelin eğitim sürecinde anlamca benzer metinlerin vektörleri birbirine yakın, farklı anlamlı metinlerin vektörleri birbirinden uzak olacak şekilde optimize edilir.

Örneğin:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

cumle_1 = "Makine öğrenmesi ile müşteri kaybı tahmin ediliyor."
cumle_2 = "ML modeli churn prediction için kullanılıyor."
cumle_3 = "Bugün hava güneşli ve sıcak."

vektorler = model.encode([cumle_1, cumle_2, cumle_3])

# cumle_1 ve cumle_2 vektörleri birbirine yakın olacak
# cumle_3'ün vektörü diğer ikisinden uzak olacak
```

Bu örnekte ilk iki cümle farklı kelimelere sahip olsa da aynı kavramı anlatıyor: bir makine öğrenmesi modelinin müşteri kaybını tahmin etmesi. Üçüncü cümle ise tamamen farklı bir konuda, dolayısıyla vektör uzayında diğerlerinden uzakta konumlanır.

Yaygın embedding modelleri arasında OpenAI'ın `text-embedding-3-small` ve `text-embedding-3-large` modelleri, açık kaynak tarafında ise `all-MiniLM-L6-v2`, `bge-large-en`, `e5-large-v2` ve `nomic-embed-text` sayılabilir. Model seçimi, dilin, veri boyutunun ve performans gereksinimlerinin dengesine bağlıdır.

## Vektörler arasında benzerlik ölçmek

Embedding'ler üretildikten sonra aralarındaki benzerliği ölçmek gerekir. Bunun için en yaygın kullanılan metrikler şunlardır:

**Cosine similarity:** İki vektörün yönleri arasındaki açıyı ölçer. Değer 1'e ne kadar yakınsa vektörler o kadar benzerdir. Metin aramasında en yaygın kullanılan metriktir çünkü vektör büyüklüğünden bağımsız, salt yön karşılaştırması yapar.

**Euclidean distance (L2):** İki nokta arasındaki düz çizgi mesafesini ölçer. Mesafe ne kadar küçükse vektörler o kadar yakındır. Normalize edilmemiş vektörlerde cosine'dan farklı sonuçlar verebilir.

**Dot product (iç çarpım):** Hem yön hem büyüklük bilgisini içerir. Normalize edilmiş vektörlerde cosine similarity ile aynı sonucu verir.

Pratikte çoğu vektör veritabanı bu üç metriki destekler ve koleksiyon oluştururken hangisini kullanacağını belirtirsin.

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

benzerlik = cosine_similarity(vektorler[0], vektorler[1])
print(f"Cümle 1-2 benzerliği: {benzerlik:.4f}")
# Yüksek bir değer çıkacak, örneğin 0.82

benzerlik_uzak = cosine_similarity(vektorler[0], vektorler[2])
print(f"Cümle 1-3 benzerliği: {benzerlik_uzak:.4f}")
# Düşük bir değer çıkacak, örneğin 0.15
```

## Vektör veritabanı ne yapar?

Birkaç yüz vektör varsa brute-force karşılaştırma yapılabilir. Ama milyonlarca belge söz konusu olduğunda her sorguyu tüm vektörlerle karşılaştırmak pratik değildir. Vektör veritabanları bu problemi çözmek için özel indeksleme algoritmaları kullanır.

Bir vektör veritabanının temel işlevleri:

- Vektörleri ve ilişkili metadata'yı depolamak
- Yaklaşık en yakın komşu (ANN - Approximate Nearest Neighbor) araması yapmak
- Filtreleme ile aramayı daraltmak (örneğin: sadece 2024 yılına ait dokümanlar)
- Vektörleri güncelleme ve silme işlemleri

"Yaklaşık" kelimesi burada kritiktir. Tam bir karşılaştırma (brute-force) her zaman en doğru sonucu verir ama yavaştır. ANN algoritmaları küçük bir doğruluk kaybı karşılığında çok daha hızlı arama yapar. Büyük ölçekli sistemlerde bu tradeoff kabul edilir çünkü pratikte fark genellikle ihmal edilebilir düzeydedir.

### Yaygın indeksleme algoritmaları

**HNSW (Hierarchical Navigable Small World):** Vektörleri katmanlı bir graf yapısında organize eder. Arama sırasında üst katmanlardan başlayarak hızla doğru bölgeye yaklaşır, sonra alt katmanlarda ince arama yapar. Hem hızlı hem doğru sonuçlar verir. Bellek tüketimi yüksektir çünkü graf yapısı RAM'de tutulur. Pinecone, Qdrant, Weaviate ve pgvector gibi araçlar HNSW destekler.

**IVF (Inverted File Index):** Vektörleri önceden kümelere ayırır. Arama sırasında sorguya en yakın kümeler bulunur ve yalnızca bu kümelerdeki vektörler karşılaştırılır. HNSW'ye göre daha az bellek kullanır ama daha az doğrudur. FAISS kütüphanesinde sıkça kullanılır.

**Flat Index:** Tüm vektörlerle karşılaştırma yapar. Küçük veri setlerinde en doğru sonucu verir. Milyon düzeyinde veride kullanılamaz.

## Vektör veritabanı seçenekleri

Piyasada farklı ihtiyaçlara yönelik pek çok vektör veritabanı var. Hangisini seçeceğin projenin ölçeğine, altyapı tercihine ve bütçeye bağlıdır.

**Pinecone:** Yönetilen (managed) bir bulut servisi. Altyapıyla uğraşmadan hızla başlamak isteyenler için uygun. Ücretsiz katmanı var. API üzerinden çalışır, kendi sunucunu yönetmezsin.

**Qdrant:** Hem bulut hem self-hosted seçeneği sunar. Rust ile yazılmış, performansa odaklı. Filtreleme yetenekleri güçlüdür. Açık kaynak.

**Weaviate:** GraphQL tabanlı API sunar. Modüler yapısıyla farklı embedding modellerini ve vektörizasyon yöntemlerini destekler. Açık kaynak.

**ChromaDB:** Python ekosistemiyle iyi entegre olur. Prototipleme ve küçük projeler için hızlı başlangıç sağlar. SQLite tabanlı yerel depolama seçeneği var.

**pgvector:** PostgreSQL uzantısı. Mevcut PostgreSQL altyapısına vektör arama eklemek isteyenler için cazip. Ayrı bir veritabanı yönetmek gerekmez ama çok büyük ölçekte performans sınırları olabilir.

**FAISS (Facebook AI Similarity Search):** Bir veritabanı değil, bir kütüphane. Milyarlarca vektör üzerinde arama yapabilir. GPU desteği var. Kalıcı depolama ve metadata yönetimi sunmaz, bu yüzden genellikle başka sistemlerle birlikte kullanılır.

## Pratik örnek: Basit bir semantik arama sistemi

Aşağıdaki örnekte bir grup belgeyi embed edip ChromaDB'ye kaydediyoruz, sonra bir sorgu ile en alakalı belgeleri getiriyoruz:

```python
import chromadb
from sentence_transformers import SentenceTransformer

# Embedding modeli
model = SentenceTransformer("all-MiniLM-L6-v2")

# ChromaDB client
client = chromadb.Client()
collection = client.create_collection(
    name="belgeler",
    metadata={"hnsw:space": "cosine"}
)

# Belgeler
belgeler = [
    "Gradient boosting yöntemi karar ağaçlarını sıralı olarak eğitir.",
    "Random forest birden fazla karar ağacını paralel olarak oluşturur.",
    "Lojistik regresyon ikili sınıflandırma için kullanılan doğrusal bir modeldir.",
    "Transformer mimarisi dikkat mekanizması üzerine kuruludur.",
    "Konvolüsyonel sinir ağları görsel veri işlemede yaygındır.",
    "K-means algoritması veriyi k adet kümeye ayırır.",
]

# Embedding üret ve kaydet
embeddings = model.encode(belgeler).tolist()
collection.add(
    documents=belgeler,
    embeddings=embeddings,
    ids=[f"doc_{i}" for i in range(len(belgeler))]
)

# Sorgu
sorgu = "Ağaç tabanlı modeller nasıl çalışır?"
sorgu_embedding = model.encode([sorgu]).tolist()

sonuclar = collection.query(
    query_embeddings=sorgu_embedding,
    n_results=3
)

for doc, dist in zip(sonuclar["documents"][0], sonuclar["distances"][0]):
    print(f"[{dist:.4f}] {doc}")
```

Bu sorgu sonucunda gradient boosting ve random forest ile ilgili belgeler üst sıralarda çıkar çünkü ikisi de ağaç tabanlı yöntemlerdir. Lojistik regresyon veya CNN ile ilgili belgeler daha düşük sıralarda kalır.

## Mimari: Embedding aramasını bir uygulamaya entegre etmek

Bir üretim sisteminde vektör arama genellikle şu akışla çalışır:

```
[Veri Kaynağı] → [Metin Çıkarma] → [Chunking] → [Embedding Modeli]
                                                        ↓
                                                  [Vektör DB'ye Kayıt]

[Kullanıcı Sorgusu] → [Embedding Modeli] → [Vektör DB Sorgusu]
                                                    ↓
                                            [En Yakın K Sonuç]
                                                    ↓
                                          [Uygulama Katmanı]
```

Veri hazırlama aşamasında dikkat edilmesi gerekenler:

- Metin temizliği: HTML etiketleri, gereksiz boşluklar, header/footer tekrarları temizlenir.
- Chunking stratejisi: Belgeleri anlamlı parçalara bölmek gerekir. Sabit uzunlukta bölme basittir ama paragraf veya başlık bazlı bölme daha iyi sonuç verebilir.
- Overlap: Chunk'lar arasında örtüşme kullanmak, kesilmiş cümle veya bağlam kayıplarını azaltır.
- Metadata ekleme: Her chunk'a kaynak belge adı, sayfa numarası, tarih gibi metadata eklemek filtreleme ve kaynak gösteriminde faydalıdır.

## Vektör veritabanı ne zaman kullanılır?

Her arama problemi vektör veritabanı gerektirmez. Şu durumlarda vektör araması anlamlıdır:

- Anlamsal benzerlik gerekiyorsa (kelime eşleşmesi yetmiyorsa)
- RAG sistemi kuruluyorsa (LLM'e dış bilgi sağlamak için)
- Öneri sistemi yapılıyorsa (benzer ürünler, benzer içerikler)
- Görsel arama gerekiyorsa (metin ile görsel eşleştirme, benzer görsel bulma)
- Anomali tespiti yapılıyorsa (normal vektörlerden sapma ölçümü)
- Yinelenen içerik tespiti gerekiyorsa (duplicate detection)

Şu durumlarda geleneksel arama yeterli olabilir:

- Tam kelime eşleşmesi gerekiyorsa (ürün kodu, fatura numarası)
- Veri miktarı küçükse ve basit filtreleme yeterliyse
- Gerçek zamanlı güncelleme ve ACID garantisi gerekiyorsa (vektör veritabanları bu konuda ilişkisel veritabanları kadar olgun değil)

Bazı sistemler ikisini birleştirir: önce vektör aramasıyla aday küme bulunur, sonra kelime tabanlı filtrelerle daraltılır. Bu yaklaşıma hibrit arama denir ve pratikte genellikle en iyi sonuçları verir.

## Yaygın hatalar

Vektör veritabanları ve embedding tabanlı arama ile çalışırken sık karşılaşılan sorunlar:

**Yanlış embedding modeli seçimi.** Genel amaçlı bir İngilizce model, Türkçe metinlerde düşük performans gösterebilir. Çok dilli bir model kullanmak veya dile özgü bir model seçmek gerekir. Modeli değiştirdiğinde tüm vektörleri yeniden üretmen gerekir.

**Chunk boyutunun ayarlanmaması.** Belgeyi tek parça olarak embed etmek, uzun metinlerde anlam kaybına yol açar. Çok küçük chunk'lar ise bağlamdan kopar. Proje için uygun chunk boyutunu denemelerle bulmak gerekir.

**Metadata kullanmamak.** Vektör araması tek başına bazen yetmez. "Son bir ayda eklenen belgeler" gibi filtreleri metadata ile yaparsın. Metadata olmadan bu tür daraltmalar mümkün olmaz.

**Embedding'leri karıştırmak.** Farklı embedding modelleri farklı vektör uzayları üretir. Model A ile üretilen vektörleri model B ile sorgulayamazsın. Bu tutarsızlık sessizce yanlış sonuçlara neden olur.

**Cosine similarity sonuçlarına fazla güvenmek.** Yüksek benzerlik skoru her zaman doğru eşleşme anlamına gelmez. Özellikle kısa metinlerde veya belirsiz sorgularda yanlış pozitifler çıkabilir. Bir reranker modeli veya ikincil filtreleme eklemek sonuçları iyileştirir.

**Ölçeklendirmeyi düşünmemek.** Prototipte 1000 belge ile çalışan bir yapı, 10 milyon belgede farklı davranır. İndeks tipi, bellek kullanımı ve sorgu latency'si değişir. Planlama aşamasında büyüme senaryosunu hesaba katmak gerekir.

## Performans ve maliyet dengesi

Vektör aramasının performansını etkileyen birkaç parametre var:

- **Vektör boyutu:** 384 boyutlu bir vektör, 1536 boyutlu bir vektöre göre daha az bellek harcar ve daha hızlı aranır. Ama daha büyük vektörler genellikle daha fazla anlam bilgisi taşır. Bu bir tradeoff.
- **İndeks tipi:** HNSW yüksek doğruluk verir ama çok bellek kullanır. IVF daha az bellek kullanır ama doğruluk düşebilir.
- **Sorgu parametreleri:** `top_k` değeri arttıkça daha fazla sonuç döner ama sorgu süresi uzar. `ef_search` gibi parametreler HNSW'nin arama derinliğini kontrol eder.

Maliyet tarafında embedding üretimi de hesaba katılmalıdır. API tabanlı modellerde (OpenAI gibi) her token için ücret ödersin. Açık kaynak modeller (sentence-transformers gibi) yerel çalışır ve API maliyeti yoktur ama kendi donanımın gerekir. Büyük veri setlerinde embedding üretimi saatler sürebilir.

## Diğer kullanım alanları

Embedding ve vektör araması sadece metin ile sınırlı değildir:

- **Görsel arama:** CLIP gibi modeller metin ve görseli aynı vektör uzayına yerleştirir. "Kırmızı spor araba" yazarak benzer görselleri bulabilirsin.
- **Ses araması:** Ses parçalarını embedding'e çevirerek benzer melodileri veya konuşmaları bulabilirsin.
- **Kod araması:** Kod parçacıklarını embed ederek doğal dilde "HTTP isteği yapan fonksiyon" gibi sorgularla kod arayabilirsin.
- **Öneri sistemleri:** Kullanıcının izlediği filmler, okuduğu makaleler veya satın aldığı ürünler embed edilir. Yeni öneriler bu vektörlere yakın olan öğelerden seçilir.

## Sonuç

Vektör veritabanları ve embedding tabanlı arama, anlamsal benzerlik gerektiren uygulamalar için güçlü bir araçtır. Geleneksel kelime eşleştirmesinin yetersiz kaldığı yerlerde devreye girer. RAG sistemleri, öneri motorları, görsel arama ve daha pek çok uygulama bu teknoloji üzerine kuruludur.

Ama her problem vektör araması istemez. Kelime bazlı arama yeterli olan yerde gereksiz karmaşıklık eklemek bakım yükünü artırır. Doğru seçim, problemin doğasına ve verinin yapısına bağlıdır.

Pratikte başlamak istiyorsan, küçük bir belge seti ile ChromaDB veya FAISS kullanarak basit bir semantik arama prototipi kurabilirsin. Sonuçları inceleyerek chunking stratejini ve model seçimini kendi verine göre ayarlayabilirsin.

## Kaynaklar

- Johnson, J., Douze, M., & Jégou, H. "Billion-scale similarity search with GPUs" (FAISS): https://arxiv.org/abs/1702.08734
- Malkov, Y. A. & Yashunin, D. A. "Efficient and robust approximate nearest neighbor using Hierarchical Navigable Small World graphs" (HNSW): https://arxiv.org/abs/1603.09320
- Pinecone, "What is a Vector Database?": https://www.pinecone.io/learn/vector-database/
- ChromaDB documentation: https://docs.trychroma.com/
- Sentence-Transformers documentation: https://www.sbert.net/
