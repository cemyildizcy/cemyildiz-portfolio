---
title: "Doğal Dil İşleme'de Metin Ön İşleme: Temiz Veriden Güçlü Modellere"
date: "2026-07-16"
tags: ["NLP", "Metin İşleme", "Tokenization", "Python", "Doğal Dil İşleme"]
readTime: "13 dk"
coverEmoji: "📝"
description: "Tokenization'dan TF-IDF'e, stemming'den subword tokenization'a: NLP projelerinde metin ön işleme adımları ve Türkçe'ye özel zorluklar."
---

# Doğal Dil İşleme'de Metin Ön İşleme: Temiz Veriden Güçlü Modellere

Doğal Dil İşleme (NLP) projelerinde model performansını belirleyen en kritik faktörlerden biri, verinin kalitesidir. En gelişmiş transformer mimarisini bile kullansanız, gürültülü ve işlenmemiş metin verisiyle çalıştığınızda beklediğiniz sonuçları elde edemezsiniz. "Garbage in, garbage out" prensibi NLP dünyasında fazlasıyla geçerlidir.

Bu yazıda, metin ön işleme sürecinin temel adımlarını, her adımın neden önemli olduğunu ve Türkçe gibi sondan eklemeli (aglütinatif) dillerde karşılaşılan özel zorlukları detaylı bir şekilde inceleyeceğiz.

## Metin Ön İşleme Neden Bu Kadar Önemli?

Ham metin verileri; büyük-küçük harf tutarsızlıkları, noktalama işaretleri, HTML etiketleri, özel karakterler, gereksiz boşluklar ve anlam taşımayan kelimelerle doludur. Bu gürültü, modelin öğrenmesi gereken gerçek örüntüleri maskeleyerek performansı ciddi ölçüde düşürür.

İyi bir metin ön işleme pipeline'ı şu faydaları sağlar:

- **Boyut azaltma:** Kelime dağarcığı (vocabulary) küçülür, model daha hızlı eğitilir.
- **Gürültü temizleme:** Anlamsız tokenlar elenir, sinyal-gürültü oranı artar.
- **Standartlaştırma:** Aynı anlamdaki farklı yazımlar tek bir forma indirgenir.
- **Genelleme:** Model, eğitim verisinde görmediği varyasyonlara daha iyi uyum sağlar.

---

## 1. Metin Normalizasyonu (Text Normalization)

Metin normalizasyonu, ham metni standart bir forma dönüştürmenin ilk adımıdır. Küçük harfe çevirme, Unicode normalizasyonu ve aksanların kaldırılması bu aşamada gerçekleştirilir.

```python
import unicodedata
import re

def normalize_text(text: str) -> str:
    """Metni standart forma dönüştürür."""
    # Küçük harfe çevir
    text = text.lower()

    # Unicode normalizasyonu (NFC formu)
    text = unicodedata.normalize("NFC", text)

    # Fazladan boşlukları temizle
    text = re.sub(r'\s+', ' ', text).strip()

    return text

ornek = "  Doğal   Dil   İŞLEME   çok   ÖNEMLİ  "
print(normalize_text(ornek))
# Çıktı: "doğal dil işleme çok önemli"
```

> **Türkçe İpucu:** Python'un `lower()` metodu Türkçe karakterlerde sorun yaşayabilir. Örneğin, `"İ".lower()` bazı locale ayarlarında `"i̇"` döndürebilir. Türkçe metinler için locale-aware dönüşüm yapmanız veya özel bir haritalama kullanmanız önerilir.

---

## 2. Regex ile Metin Temizleme

Düzenli ifadeler (Regular Expressions), metin temizleme sürecinin en güçlü aracıdır. HTML etiketlerinden URL'lere, e-posta adreslerinden özel karakterlere kadar pek çok gürültüyü hedefli biçimde temizleyebilirsiniz.

```python
import re

def clean_text(text: str) -> str:
    """Regex kullanarak metni gürültüden arındırır."""
    # HTML etiketlerini kaldır
    text = re.sub(r'<[^>]+>', '', text)

    # URL'leri kaldır
    text = re.sub(r'https?://\S+|www\.\S+', '', text)

    # E-posta adreslerini kaldır
    text = re.sub(r'\S+@\S+\.\S+', '', text)

    # Sayıları kaldır (isteğe bağlı)
    text = re.sub(r'\d+', '', text)

    # Özel karakterleri kaldır (Türkçe harfleri koru!)
    text = re.sub(r'[^\wçğıöşüÇĞİÖŞÜ\s]', '', text)

    # Çoklu boşlukları tekil boşluğa indir
    text = re.sub(r'\s+', ' ', text).strip()

    return text

ham_metin = "<p>Daha fazla bilgi için https://example.com adresini ziyaret edin! İletişim: info@test.com</p>"
print(clean_text(ham_metin))
# Çıktı: "Daha fazla bilgi için adresini ziyaret edin İletişim"
```

Regex kalıplarını projenizin ihtiyaçlarına göre özelleştirmeniz gerekir. Örneğin, duygu analizi yapıyorsanız emoji ve noktalama işaretlerini korumak isteyebilirsiniz.

---

## 3. Tokenization (Belirteçlere Ayırma)

Tokenization, metni daha küçük birimlere — kelimelere, alt kelimelere veya karakterlere — ayırma işlemidir. NLP pipeline'ının temel taşıdır.

### Kelime Düzeyinde Tokenization

```python
import nltk
from nltk.tokenize import word_tokenize

nltk.download('punkt_tab', quiet=True)

metin = "Makine öğrenmesi, yapay zekânın bir alt dalıdır."
tokenlar = word_tokenize(metin, language='turkish')
print(tokenlar)
# Çıktı: ['Makine', 'öğrenmesi', ',', 'yapay', 'zekânın', 'bir', 'alt', 'dalıdır', '.']
```

### spaCy ile Tokenization

```python
import spacy

# Türkçe model yüklü değilse: python -m spacy download xx_ent_wiki_sm
nlp = spacy.blank("tr")

doc = nlp("Doğal dil işleme günümüzde birçok alanda kullanılmaktadır.")
tokenlar = [token.text for token in doc]
print(tokenlar)
# Çıktı: ['Doğal', 'dil', 'işleme', 'günümüzde', 'birçok', 'alanda', 'kullanılmaktadır', '.']
```

Basit `split()` yerine gelişmiş tokenizer'lar kullanmanın nedeni, noktalama işaretleri, kısaltmalar ve özel durumlarla daha doğru başa çıkmalarıdır.

---

## 4. Stopword (Etkisiz Kelime) Temizleme

Stopword'ler — "bir", "ve", "için", "bu", "da" gibi — metnin anlamına çok az katkı sağlayan, ancak çok sık geçen kelimelerdir. Özellikle Bag of Words ve TF-IDF tabanlı modellerde bu kelimelerin kaldırılması performansı artırır.

```python
from nltk.corpus import stopwords
import nltk

nltk.download('stopwords', quiet=True)

turkce_stopwords = set(stopwords.words('turkish'))

metin = "Bu yazıda metin ön işleme adımlarını bir bir inceleyeceğiz"
kelimeler = metin.split()
temiz_kelimeler = [k for k in kelimeler if k.lower() not in turkce_stopwords]

print(f"Orijinal ({len(kelimeler)} kelime): {kelimeler}")
print(f"Temizlenmiş ({len(temiz_kelimeler)} kelime): {temiz_kelimeler}")
# Orijinal (9 kelime): ['Bu', 'yazıda', 'metin', 'ön', 'işleme', 'adımlarını', 'bir', 'bir', 'inceleyeceğiz']
# Temizlenmiş (5 kelime): ['yazıda', 'metin', 'ön', 'işleme', 'adımlarını', 'inceleyeceğiz']
```

> **Dikkat:** Transformer tabanlı modellerde (BERT, GPT vb.) stopword kaldırma genellikle önerilmez. Bu modeller bağlamı kullanarak kelimelerin önemini kendileri öğrenir. Stopword temizleme daha çok klasik makine öğrenmesi yaklaşımlarında değerlidir.

---

## 5. Stemming ve Lemmatization

Bu iki teknik de kelimeleri kök veya temel formlarına indirger, ancak yöntemleri birbirinden farklıdır.

### Stemming

Stemming, kelimenin sonundaki ekleri kurallara dayalı olarak keser. Dilbilimsel doğruluk garantisi vermez — ortaya çıkan kök, sözlükte bulunmayan bir form olabilir.

```python
from nltk.stem import SnowballStemmer

stemmer = SnowballStemmer("english")  # Türkçe desteği sınırlıdır

# İngilizce örnek
words = ["running", "runner", "ran", "runs"]
stems = [stemmer.stem(w) for w in words]
print(dict(zip(words, stems)))
# {'running': 'run', 'runner': 'runner', 'ran': 'ran', 'runs': 'run'}
```

### Lemmatization

Lemmatization, kelimenin sözlükteki temel formunu (lemma) bulur. Dilbilimsel kurallara dayandığı için daha doğru sonuç verir, ancak daha yavaştır.

```python
import spacy

nlp = spacy.load("en_core_web_sm")

doc = nlp("The runners were running quickly towards better results")
for token in doc:
    if token.lemma_ != token.text.lower():
        print(f"  {token.text:15s} → {token.lemma_}")

# runners         → runner
# were            → be
# running         → run
# better          → well
```

### Karşılaştırma Tablosu

| Özellik | Stemming | Lemmatization |
|---------|----------|---------------|
| Hız | Hızlı | Yavaş |
| Doğruluk | Düşük | Yüksek |
| Sözlük gerektirir mi? | Hayır | Evet |
| Sonuç | Geçersiz kök olabilir | Gerçek sözlük formu |
| Kullanım alanı | Bilgi erişimi, arama | Metin analizi, anlam çıkarımı |

---

## 6. Türkçe NLP'nin Özel Zorlukları: Aglütinatif Morfoloji

Türkçe, sondan eklemeli (aglütinatif) bir dildir. Bir kelime kökünün üzerine birden fazla ek getirilerek çok karmaşık yapılar oluşturulabilir. Bu durum, NLP sistemleri için ciddi zorluklar yaratır.

### Problemi Somutlaştıralım

İngilizce'de "in the house" üç kelimeyle ifade edilen kavram, Türkçe'de tek bir kelimeyle — **"evde"** — karşılanabilir. Daha karmaşık örnekler:

| Türkçe Kelime | Morfolojik Ayrıştırma | İngilizce Karşılığı |
|---------------|----------------------|---------------------|
| evlerimizden | ev + ler + imiz + den | from our houses |
| gelebilecekmiş | gel + ebil + ecek + miş | apparently will be able to come |
| okutulamayacaklarından | oku + t + ul + a + ma + yacak + ları + ndan | from the fact that they won't be able to be made to read |

Bu karmaşıklık, kelime dağarcığını (vocabulary) patlama noktasına getirir. İngilizce bir korpusda benzersiz kelime sayısı yüz binlerle ifade edilirken, aynı boyuttaki bir Türkçe korpusda bu sayı milyonlara ulaşabilir.

### Türkçe İçin Morfolojik Analiz Araçları

Türkçe metinlerle çalışırken özel araçlara ihtiyaç duyulur:

```python
# Zeyrek kütüphanesi ile Türkçe morfolojik analiz
# pip install zeyrek
from zeyrek import MorphAnalyzer

analyzer = MorphAnalyzer()

kelime = "okutulamayacaklarından"
sonuclar = analyzer.analyze(kelime)

for sonuc in sonuclar:
    print(sonuc)
# Kök: oku
# Ekler: -t (ettirgen), -ul (edilgen), -ama (olumsuzluk), -yacak (gelecek zaman), -ları (çoğul iyelik), -ndan (ayrılma hali)
```

Türkçe NLP projelerinde **Zeyrek**, **TurkishMorphology** ve **ITU NLP Tools** gibi araçlar, standart NLTK/spaCy pipeline'larına ek olarak kullanılmalıdır.

---

## 7. Bag of Words (BoW) ve TF-IDF

Metin ön işleme adımlarını tamamladıktan sonra, metni sayısal vektörlere dönüştürmemiz gerekir. İki klasik yöntem olan BoW ve TF-IDF bu dönüşümün temelini oluşturur.

### Bag of Words

BoW, her belgedeki kelimelerin frekansını sayarak bir vektör oluşturur. Kelime sırası bilgisi kaybolur.

```python
from sklearn.feature_extraction.text import CountVectorizer

corpus = [
    "makine öğrenmesi derin öğrenme",
    "doğal dil işleme metin analizi",
    "derin öğrenme sinir ağları makine öğrenmesi"
]

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(corpus)

print("Kelime Dağarcığı:", vectorizer.get_feature_names_out())
print("BoW Matrisi:")
print(X.toarray())
```

### TF-IDF (Term Frequency – Inverse Document Frequency)

TF-IDF, kelimelerin önemini yalnızca frekansa göre değil, aynı zamanda o kelimenin tüm belgelerde ne kadar nadir geçtiğine göre ağırlıklandırır.

```python
from sklearn.feature_extraction.text import TfidfVectorizer

corpus = [
    "makine öğrenmesi yapay zeka uygulamaları",
    "doğal dil işleme metin madenciliği",
    "makine öğrenmesi doğal dil işleme derin öğrenme"
]

tfidf = TfidfVectorizer()
X = tfidf.fit_transform(corpus)

# Her belge için en yüksek TF-IDF skoruna sahip kelimeler
feature_names = tfidf.get_feature_names_out()
for i, doc in enumerate(corpus):
    scores = X[i].toarray().flatten()
    top_idx = scores.argsort()[-3:][::-1]
    top_words = [(feature_names[j], round(scores[j], 3)) for j in top_idx]
    print(f"Belge {i+1}: {top_words}")
```

TF-IDF, özellikle metin sınıflandırma ve bilgi erişimi görevlerinde hâlâ güçlü bir baseline olarak kullanılmaktadır.

---

## 8. Subword Tokenization: BPE ve WordPiece

Modern NLP modellerinde kelime düzeyinde tokenization yerine **subword tokenization** tercih edilir. Bu yaklaşım, nadir kelimeleri daha küçük ve anlamlı alt birimlere bölerek OOV (Out-of-Vocabulary) problemini çözer.

### Byte-Pair Encoding (BPE)

BPE, başlangıçta karakter düzeyinde başlayarak, en sık birlikte görünen karakter çiftlerini iteratif olarak birleştirir. GPT ailesi modelleri BPE kullanır.

```python
# Hugging Face tokenizers kütüphanesi ile BPE örneği
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace

tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
tokenizer.pre_tokenizer = Whitespace()

trainer = BpeTrainer(
    special_tokens=["[UNK]", "[PAD]", "[CLS]", "[SEP]"],
    vocab_size=1000
)

# Eğitim verisi ile modeli eğit
tokenizer.train_from_iterator(
    ["doğal dil işleme çok önemli bir alandır",
     "makine öğrenmesi ve derin öğrenme modelleri",
     "türkçe metinlerin işlenmesi zorlu olabilir"],
    trainer=trainer
)

output = tokenizer.encode("doğal dil işleme modelleri")
print(f"Tokenlar: {output.tokens}")
```

### WordPiece

WordPiece, BERT modelinin kullandığı tokenization yöntemidir. BPE'ye benzer, ancak birleştirme kararını frekans yerine olabilirlik (likelihood) artışına göre verir.

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("dbmdz/bert-base-turkish-cased")

metin = "Evlerimizden ayrılmak istemiyorduk"
tokens = tokenizer.tokenize(metin)
print(f"WordPiece tokenları: {tokens}")
# Olası çıktı: ['Ev', '##ler', '##imiz', '##den', 'ayrılmak', 'istemiyorduk']

token_ids = tokenizer.encode(metin)
print(f"Token ID'leri: {token_ids}")
```

Subword tokenization'ın en büyük avantajı, Türkçe gibi morfolojik olarak zengin dillerde kelime dağarcığını yönetilebilir boyutta tutarken, nadir kelime formlarını da temsil edebilmesidir.

---

## 9. Uçtan Uca Ön İşleme Pipeline'ı

Tüm adımları bir araya getirerek, yeniden kullanılabilir bir pipeline oluşturalım:

```python
import re
import unicodedata
from typing import List

class MetinOnIslemePipeline:
    """Türkçe metinler için kapsamlı ön işleme pipeline'ı."""

    def __init__(self, stopwords: set = None, lemmatize: bool = False):
        self.stopwords = stopwords or set()
        self.lemmatize = lemmatize

    def normalize(self, text: str) -> str:
        text = unicodedata.normalize("NFC", text)
        text = text.lower()
        return text

    def clean(self, text: str) -> str:
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        text = re.sub(r'\S+@\S+\.\S+', '', text)
        text = re.sub(r'[^\wçğıöşüÇĞİÖŞÜ\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        return [t for t in tokens if t not in self.stopwords]

    def process(self, text: str) -> List[str]:
        text = self.normalize(text)
        text = self.clean(text)
        tokens = text.split()
        tokens = self.remove_stopwords(tokens)
        return tokens

# Kullanım
from nltk.corpus import stopwords
import nltk
nltk.download('stopwords', quiet=True)

pipeline = MetinOnIslemePipeline(
    stopwords=set(stopwords.words('turkish'))
)

ham_metin = """
<div>Merhaba! Bu yazıda, doğal dil işleme'nin
temel adımlarını inceleyeceğiz. Daha fazla bilgi için
https://example.com adresini ziyaret edebilirsiniz.</div>
"""

sonuc = pipeline.process(ham_metin)
print(f"İşlenmiş tokenlar: {sonuc}")
# Çıktı: ['merhaba', 'yazıda', 'doğal', 'dil', 'işlemenin', 'temel', 'adımlarını', 'inceleyeceğiz', 'adresini', 'ziyaret', 'edebilirsiniz']
```

---

## Hangi Adım Ne Zaman Gerekli?

Her NLP görevi aynı ön işleme adımlarını gerektirmez. İşte yaygın görev türlerine göre bir yol haritası:

| Görev | Normalizasyon | Stopword | Stemming/Lemma | Subword Tok. |
|-------|:---:|:---:|:---:|:---:|
| Metin Sınıflandırma (Klasik ML) | ✅ | ✅ | ✅ | ❌ |
| Duygu Analizi (BERT) | ✅ | ❌ | ❌ | ✅ |
| Bilgi Erişimi / Arama | ✅ | ✅ | ✅ | ❌ |
| Adlandırılmış Varlık Tanıma | ✅ | ❌ | ❌ | ✅ |
| Makine Çevirisi | ✅ | ❌ | ❌ | ✅ |

---

## Sonuç

Metin ön işleme, NLP projelerinin sessiz kahramanıdır. Doğru uygulandığında model performansını dramatik şekilde artırırken, yanlış veya eksik uygulandığında en güçlü modeli bile başarısızlığa sürükleyebilir.

Özellikle Türkçe gibi morfolojik olarak zengin dillerde, standart İngilizce odaklı araçların ötesine geçmek ve dile özgü çözümler kullanmak büyük önem taşır. Zeyrek gibi Türkçe morfolojik analiz araçları ve BERTurk gibi Türkçe'ye özel dil modelleri, bu alanda çalışan herkesin araç kutusunda bulunmalıdır.

Bir sonraki NLP projenizde, model mimarisini seçmeden önce verilerinizi tanıyın, ön işleme pipeline'ınızı dikkatle tasarlayın ve her adımın etkisini ölçün. Temiz veri, güçlü modellerin temelidir.

---

## Kaynaklar

1. **Jurafsky, D. & Martin, J. H.** (2024). *Speech and Language Processing* (3rd Edition). Stanford University. [https://web.stanford.edu/~jurafsky/slp3/](https://web.stanford.edu/~jurafsky/slp3/) — Tokenization, normalizasyon ve metin ön işleme konularında kapsamlı akademik kaynak.

2. **Sennrich, R., Haddow, B., & Birch, A.** (2016). "Neural Machine Translation of Rare Words with Subword Units." *Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics (ACL)*. [https://aclanthology.org/P16-1162/](https://aclanthology.org/P16-1162/) — BPE (Byte-Pair Encoding) yönteminin temel makalesi.

3. **Akın, A. A. & Akın, M. D.** (2007). "Zemberek, an open source NLP framework for Turkic Languages." *Structure*, 10, 1-5. [https://github.com/ahmetaa/zemberek-nlp](https://github.com/ahmetaa/zemberek-nlp) — Türkçe doğal dil işleme için geliştirilen açık kaynak framework ve morfolojik analiz aracı.

4. **Devlin, J., Chang, M., Lee, K., & Toutanova, K.** (2019). "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding." *Proceedings of NAACL-HLT 2019*. [https://aclanthology.org/N19-1423/](https://aclanthology.org/N19-1423/) — WordPiece tokenization'ın modern NLP'deki kullanımının temel referansı.
