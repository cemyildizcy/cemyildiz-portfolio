---
title: "Graph Neural Networks (GNN): Graf Verisiyle Derin Öğrenme"
date: "2026-07-25"
tags: ["Derin Öğrenme", "GNN", "Graf Verileri", "PyTorch Geometric"]
readTime: "12 dk"
coverEmoji: "🕸️"
description: "Graf yapılı verilerde derin öğrenme: GNN mimarileri, message passing mekanizması, PyTorch Geometric ile uygulama ve sık yapılan hatalar."
---

Bir sosyal ağdaki kullanıcı ilişkilerini, bir protein molekülündeki atom bağlantılarını ya da bir şehrin trafik ağını düşünün. Bu verilerin ortak yanı, tablolara veya sabit boyutlu matrislerle ifade edildiğinde yapısal bilginin kaybolması. Bir kullanıcı 3 kişiyi takip ederken diğeri 500 kişiyi takip ediyor; bir molekülde 12 atom varken başka birinde 80 atom var. Satır ve sütun sayısı sabit olan bir tablo bu değişkenliği doğal biçimde taşıyamaz.

Graf (graph) veri yapısı bu sorunu düğüm (node) ve kenar (edge) çiftiyle çözer. Her düğüm bir varlığı, her kenar iki varlık arasındaki ilişkiyi temsil eder. Sosyal ağda düğümler kullanıcılar, kenarlar arkadaşlık bağları; molekülde düğümler atomlar, kenarlar kimyasal bağlar olur.

Sorun, klasik derin öğrenme katmanlarının bu yapıyı işleyememesi. CNN sabit boyutlu ızgara (grid) bekler, RNN sıralı (sequential) girdi ister. Grafta ne sabit bir sıra ne de sabit bir boyut vardır. Bir düğümün komşu sayısı düğümden düğüme değişir; grafın kendisi küçük de olabilir, milyonlarca düğümlü de olabilir. Standart mimarilere graf verisi verilmek istendiğinde ya yapı düzleştirilir ya da sabit boyutlu bir temsile zorlanır. Her iki durumda da komşuluk bilgisi bozulur veya kaybolur.

Graph Neural Network (GNN) bu boşluğu doldurmak için tasarlandı. Amacı, düğümlerin kendi özelliklerini komşularının özellikleriyle birleştirerek anlamlı temsiller (representation) öğrenmesi. Bunu da sabit boyut gerektirmeden, grafın topolojisini koruyarak yapması.

## Temel sezgi: message passing

GNN'lerin çoğu "message passing" çerçevesine dayanır. Fikir basit: her düğüm, komşularından bilgi toplar ve bu bilgiyle kendi temsilini günceller. Bir katmandan geçişte üç adım gerçekleşir:

1. **Message (mesaj):** Her kenar üzerinden komşu düğümün özellik vektörü iletilir. Bazı mimarilerde bu mesaj bir lineer dönüşümden geçer, bazılarında doğrudan kullanılır.
2. **Aggregate (birleştirme):** Düğüme gelen mesajlar tek bir vektörde toplanır. Toplama (sum), ortalama (mean) veya maksimum (max) yaygın seçeneklerdir. Sıra bağımsız (permutation invariant) bir fonksiyon olması gerekir; çünkü komşularda doğal bir sıralama yoktur.
3. **Update (güncelleme):** Toplanan mesaj, düğümün mevcut özellik vektörüyle birleştirilir ve yeni temsil üretilir. Genellikle bir lineer katman ve aktivasyon fonksiyonu bu adımda devreye girer.

Bu döngü birden fazla katman üst üste yığıldığında her düğüm giderek daha geniş bir komşuluğun bilgisini taşır. Tek katmanlı bir GNN yalnızca doğrudan komşuları görür; iki katmanlı bir GNN, komşuların komşularını da hesaba katar.

Matematiksel olarak bir message passing katmanı genellikle şöyle ifade edilir:

```
h_v^(k) = UPDATE(h_v^(k-1), AGGREGATE({h_u^(k-1) : u in N(v)}))
```

Burada `h_v^(k)` v düğümünün k. katmandaki temsili, `N(v)` v'nin komşu kümesi. Her mimari UPDATE ve AGGREGATE fonksiyonlarını farklı tanımlar; GNN varyantları arasındaki temel ayrım da buradan doğar.

## Mimariler: GCN, GraphSAGE, GAT

### GCN (Graph Convolutional Network)

Kipf ve Welling'in 2017 tarihli çalışması GNN'leri yaygınlaştıran ilk mimarilerden biri. GCN, spektral graf teorisinden türetilmiş bir yaklaşımı basitleştirerek uzamsal (spatial) bir işleme dönüştürür. Her katmanda güncelleme kuralı:

```
H^(k) = sigma(D^(-1/2) A_hat D^(-1/2) H^(k-1) W^(k))
```

`A_hat` self-loop eklenmiş komşuluk matrisi, `D` derece matrisi, `W^(k)` öğrenilebilir ağırlık matrisi. Uygulamada bu, her düğümün komşu özelliklerini derece normalizasyonuyla ağırlıklandırılmış ortalamayla toplaması anlamına gelir.

GCN basit ve hızlıdır. Ancak tüm komşulara eşit ağırlık verir; yani bir düğüm için hangi komşunun daha bilgilendirici olduğu ayrıştırılamaz.

### GraphSAGE (Sample and Aggregate)

Hamilton ve arkadaşlarının 2017 tarihli çalışması ölçeklenebilirlik sorununu hedefler. GCN her katmanda tüm komşuları kullanır; büyük graflarda bu maliyetli olur. GraphSAGE her düğüm için sabit sayıda komşu örnekler (sample) ve ardından bu örnekleri birleştirir (aggregate).

Birleştirme fonksiyonu olarak mean, LSTM veya max pooling kullanılabilir. Mean aggregator GCN'e yakın çalışır; max pooling farklı komşuluk yapılarını daha iyi yakalar.

GraphSAGE'in temel avantajı inductive learning yapabilmesi. GCN transductive bir yaklaşımdır: eğitim sırasında grafın tamamını görmeyi bekler. GraphSAGE ise eğitimde görmediği yeni düğümler için de temsil üretebilir. Bu, sürekli büyüyen sosyal ağlar veya öneri sistemleri gibi uygulamalarda pratik bir farktır.

### GAT (Graph Attention Network)

Velickovic ve arkadaşlarının 2018 tarihli çalışması attention mekanizmasını graf dünyasına taşır. Her kenar için bir attention skoru hesaplanır; bu skor, komşu mesajlarının ne kadar ağırlıkla toplanacağını belirler.

```
alpha_ij = softmax(LeakyReLU(a^T [W h_i || W h_j]))
```

Burada `||` birleştirme (concatenation), `a` öğrenilebilir bir attention vektörü. Sonuçta her düğüm komşularını farklı ağırlıklarla dinler; bilgilendirici komşular daha yüksek ağırlık alır.

GAT, multi-head attention da destekler: birden fazla bağımsız attention başlığı paralel çalışır ve çıktıları birleştirilir. Bu, Transformer mimarisindeki multi-head attention ile benzer bir motivasyona sahiptir.

### Kısa karşılaştırma

| Mimari | Komşu ağırlıklandırma | Ölçeklenebilirlik | Inductive |
|---------|----------------------|-------------------|-----------|
| GCN | Derece normalizasyonu (eşit) | Orta | Hayır (transductive) |
| GraphSAGE | Fonksiyon seçimine bağlı | Yüksek (sampling) | Evet |
| GAT | Attention skoru (öğrenilir) | Orta-yüksek | Evet |

## Pratik: PyTorch Geometric ile node classification

Aşağıdaki örnekte PyTorch Geometric (PyG) kütüphanesi kullanılarak Cora veri seti üzerinde node classification yapılıyor. Cora, akademik makalelerden oluşan bir atıf ağıdır: her düğüm bir makale, kenarlar atıf ilişkileri, hedef ise makalenin ait olduğu kategori (7 sınıf).

```python
import torch
import torch.nn.functional as F
from torch_geometric.datasets import Planetoid
from torch_geometric.nn import GCNConv

# Veri setini yukle
dataset = Planetoid(root='/tmp/Cora', name='Cora')
data = dataset[0]

class GCN(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.conv2(x, edge_index)
        return x

model = GCN(dataset.num_features, 16, dataset.num_classes)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

# Egitim dongusu
model.train()
for epoch in range(200):
    optimizer.zero_grad()
    out = model(data.x, data.edge_index)
    loss = F.cross_entropy(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()

# Degerlendirme
model.eval()
pred = model(data.x, data.edge_index).argmax(dim=1)
correct = (pred[data.test_mask] == data.y[data.test_mask]).sum()
acc = int(correct) / int(data.test_mask.sum())
print(f"Test dogrulugu: {acc:.4f}")
```

Bu basit iki katmanlı GCN, Cora üzerinde yaklaşık %81 test doğruluğu verir. Birkaç not:

- `edge_index` grafın kenar listesini `[2, num_edges]` boyutunda bir tensör olarak tutar. Komşuluk matrisini açıkça oluşturmaya gerek yoktur.
- `train_mask`, `val_mask`, `test_mask` hangi düğümlerin hangi kümeye ait olduğunu belirtir. Graf bölünmez; tüm düğümler ve kenarlar her zaman mevcuttur. Yalnızca kayıp fonksiyonunun hangi düğümlerden hesaplandığı değişir.
- Dropout, GCN katmanları arasına eklenir. Graf yapısı zaten bir regularizasyon etkisi taşır; ancak küçük eğitim kümelerinde dropout hala faydalıdır.

GAT kullanmak istenseydi `GCNConv` yerine `GATConv` import edilip, head sayısı belirtilmesi yeterli olurdu:

```python
from torch_geometric.nn import GATConv

self.conv1 = GATConv(in_channels, 8, heads=8, dropout=0.6)
# 8 head * 8 kanal = 64 boyutlu cikti
self.conv2 = GATConv(8 * 8, out_channels, heads=1, concat=False, dropout=0.6)
```

## Kullanim alanlari

GNN'ler grafla modellenebilen her probleme uygulanabilir. Birkaç somut alan:

**Sosyal ag analizi.** Kullanici iliskileri, topluluk tespiti (community detection) ve etki yayilimi (influence propagation) graf problemleridir. Pinterest, GraphSAGE tabanli bir model kullanarak kullanici davranislarindan pin onerisi uretir. Her pin bir dugum, kullanici-pin etkilesimleri kenarlardir.

**Molekul kesfi ve ilac tasarimi.** Bir molekul dogrudan bir graftir: atomlar dugum, kimyasal baglar kenar. GNN ile molekulun ozelliklerini (toksiklik, cozunurluk, baglama afinitesi) tahmin etmek, geleneksel parmak izi (fingerprint) yontemlerine gore daha zengin yapisal bilgi kullanir. DeepMind'in AlphaFold'u protein yapisini tahmin ederken graf tabanli dikkat mekanizmalarindan yararlanir.

**Oneri sistemleri.** Kullanici-urun etkilesimleri dogal bir iki parcali (bipartite) graf olusturur. GNN tabanli oneri sistemleri, kullanici ve urun dugumlerinin temsillerini birlikte ogrenerek matris faktorlestirme yontemlerinin otesine gecer. Uber Eats, restoran onerilerinde GNN kullanan sistemlerden biridir.

**Trafik tahmini.** Yol agi bir graftir: kavsak ve segmentler dugum, yol baglantilari kenar. Google Maps trafik tahmini icin spatio-temporal GNN kullanir. Zamansal bilgi (saat, gun, mevsim) dugum ozelliklerine eklenir; uzamsal bagimliliklari GNN katmanlari yakalar.

**Bilgi graflari ve dolandiricilik tespiti.** Bankacilikta hesap-islem iliskileri, e-ticarette kullanici-satis agi gibi yapilar dogal graflardir. Supheli hesaplarin komsuluk oruntuleri, GNN ile bireysel ozelliklere gore daha guclu sinyaller uretebilir.

## Sik yapilan hatalar

### Over-smoothing

GNN katman sayisi arttikca her dugumun temsili birbirine yakinlasir. Bunun sezgisel aciklamasi: her katman komsuluktan bilgi toplar; yeterli katman sonrasinda her dugum grafin tamaminin ortalamasini tasir ve bireysel farklar kaybolur.

CNN'lerde 50-100 katman normal karsilanirken, cogu GNN mimarisinde 2-4 katman optimal calisir. 8-10 katmana cikildiginda performans genellikle duser.

Bu soruna yonelik bazi yaklasimlar: residual (artik) baglantilar eklemek, her katmanda dropout veya DropEdge uygulamak, JKNet (Jumping Knowledge) gibi ara katman temsillerini birlikte kullanmak. Ama ilk adim, gercekten cok katmana ihtiyac olup olmadigini sorgulamaktir. Cogu gorevde 2-3 katman yeterlidir.

### Olceklenebilirlik

Buyuk graflarda (milyonlarca dugum ve kenar) tam batch egitim bellege sigmaz. GCN her katmanda tum komsuluk matrisini kullanir; bu da bellek ve hesaplama maliyetini hizla arttirir.

Mini-batch egitim graflar icin dogrudan uygulanamaz; cunku bir dugumun gradyanini hesaplamak icin komsularinin da islenmesi gerekir. GraphSAGE'in komsuluk orneklemesi bu sorunu hafifletir. Diger yaklasimlar arasinda ClusterGCN (graf alt kumeleri uzerinde egitim) ve GraphSAINT (dugum veya kenar orneklemesi ile alt graf olusturma) sayilabilir.

PyG ve DGL (Deep Graph Library) bu yontemleri destekler. Ancak buyuk graflarla calisirken veri yukleme ve ornekleme pipeline'inin kendisi de bir darbogazdir. `DataLoader` parametreleri (batch boyutu, komsu ornekleme derinligi ve genisligi) dikkatlice ayarlanmazsa egitim suresi kabul edilemez olcude uzar.

### Graf yapisinin yanlis modellenmesi

GNN'ye verilecek grafin tasarimi modelin performansini dogrudan etkiler. Sik gorulen hatalar:

- Yonlu (directed) bir iliskiyi yonsuz (undirected) graf olarak modellemek. Atif aglari yonludur (A, B'ye atif verir; tersi dogru olmayabilir). Twitter takip iliskisi yonludur. Bu ayrimi gormezden gelmek bilgi kaybina yol acar.
- Kenar ozelliklerini (edge features) kullanmamak. Bircok iliskide kenarin kendisi de bilgi tasir: islem tutari, mesafe, suresel agirlik. GCN kenarlara agirlik atayamaz; GAT veya MPNN gibi mimariler kenar ozelliklerini isleyebilir.
- Gereksiz tam baglantili (fully connected) graf kurmak. Ornegin, belge siniflandirmada her kelimeyi her kelimeyle kenara baglamak, grafin yapisini anlamsizlastirir ve hesaplamayi patlatir.

## GNN ne zaman uygun, ne zaman degil?

GNN, verinin iliskisel yapisi tahmin icin bilgilendirici oldugunda ise yarar. Bir tabloda yalnizca birbirinden bagimsiz satirlar varsa ve varlıklar arasi iliski modele katki saglamiyorsa, GNN gereksiz karmasiklik ekler. Ayrica kucuk veri kumelerinde GNN'nin avantaji sinirlidir; cunku komsuluk bilgisi yalnizca yeterli sayida dugum ve kenarla anlamli temsiller uretir.

Karar verirken su soru faydalidir: "Bir dugumun komsulari, o dugum hakkinda tahmin icin kullanilabilecek ek bilgi tasiyor mu?" Cevap evet ise GNN denemeye deger. Cevap hayir ise klasik tablo tabanli modeller (gradient boosting, lojistik regresyon) daha basit ve etkili olacaktir.

## Kaynaklar

1. Kipf, T. N. ve Welling, M. (2017). "Semi-Supervised Classification with Graph Convolutional Networks." ICLR 2017. [https://arxiv.org/abs/1609.02907](https://arxiv.org/abs/1609.02907)
2. Hamilton, W. L., Ying, R. ve Leskovec, J. (2017). "Inductive Representation Learning on Large Graphs." NeurIPS 2017. [https://arxiv.org/abs/1706.02216](https://arxiv.org/abs/1706.02216)
3. Velickovic, P., Cucurull, G., Casanova, A., Romero, A., Lio, P. ve Bengio, Y. (2018). "Graph Attention Networks." ICLR 2018. [https://arxiv.org/abs/1710.10903](https://arxiv.org/abs/1710.10903)
4. PyTorch Geometric dokumantasyonu. [https://pytorch-geometric.readthedocs.io/](https://pytorch-geometric.readthedocs.io/)
5. Wu, Z., Pan, S., Chen, F., Long, G., Zhang, C. ve Yu, P. S. (2021). "A Comprehensive Survey on Graph Neural Networks." IEEE Transactions on Neural Networks and Learning Systems. [https://arxiv.org/abs/1901.00596](https://arxiv.org/abs/1901.00596)
