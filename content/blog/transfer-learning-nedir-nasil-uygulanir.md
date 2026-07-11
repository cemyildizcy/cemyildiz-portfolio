---
title: "Transfer Learning Nedir ve Nasıl Uygulanır?"
date: "2026-07-10"
tags: ["Derin Öğrenme", "Transfer Learning", "PyTorch", "Bilgisayarlı Görü"]
readTime: "19 dk"
coverEmoji: "🔄"
description: "Transfer learning kavramını temelinden açıklayarak fine-tuning, feature extraction ve domain adaptation stratejilerini PyTorch örnekleriyle uygulamalı anlatan kapsamlı rehber."
---

# Transfer Learning Nedir ve Nasıl Uygulanır?

Derin öğrenme modellerini sıfırdan eğitmek, büyük veri setleri ve ciddi hesaplama kaynakları gerektirir. Küçük bir ekip ya da bireysel bir araştırmacı olarak milyonlarca görüntüyle eğitilmiş bir modelin performansına ulaşmak, klasik yaklaşımla hem zaman hem de maliyet açısından gerçekçi olmayabilir. İşte tam bu noktada transfer learning devreye girer: önceden eğitilmiş bir modelin öğrendiği temsilleri alıp yeni bir göreve uyarlamak, hem verimliliği artırır hem de daha az veriyle güçlü sonuçlar elde etmeyi sağlar.

Bu yazıda transfer learning'in ne olduğunu, neden bu kadar etkili çalıştığını ve farklı stratejilerini ele alacağım. Ardından PyTorch ile gerçek bir uygulamayı adım adım inşa edeceğiz.

## Transfer Learning'in Arkasındaki Mantık

Bir insan yeni bir dil öğrenirken daha önce bildiği dillerin gramer yapılarından, ses kalıplarından ve kelime köklerinden faydalanır. Derin öğrenme modelleri de benzer bir prensiple çalışır. ImageNet üzerinde milyonlarca görüntüyle eğitilmiş bir sinir ağı, ilk katmanlarında kenarlar, dokular ve basit şekiller gibi düşük seviyeli öznitelikleri öğrenir. Orta katmanlar bu öznitelikleri birleştirerek daha karmaşık kalıplar — köşeler, tekrarlayan desenler, nesne parçaları — oluşturur. Son katmanlar ise bu kalıpları belirli sınıflara eşler.

Düşük ve orta seviyeli öznitelikler büyük ölçüde görevden bağımsızdır. Bir kenar dedektörü ister kedi-köpek sınıflandırması ister tıbbi görüntü analizi yapılsın işe yarar. Transfer learning bu evrensel temsilleri yeniden kullanarak yeni görevde öğrenme sürecini hızlandırır ve genellikle daha iyi genelleme performansı sağlar.

### Neden Sıfırdan Eğitmek Yetersiz Kalabiliyor?

Sıfırdan eğitimde karşılaşılan temel sorunları şöyle özetleyebiliriz:

- **Veri yetersizliği**: Medikal görüntüleme, uydu analizi veya endüstriyel kalite kontrol gibi alanlarda etiketli veri toplamak hem pahalı hem de zaman alıcıdır. Birkaç yüz ya da birkaç bin örnekle derin bir ağı sıfırdan eğitmek, çoğu durumda aşırı öğrenmeye (overfitting) yol açar.

- **Hesaplama maliyeti**: ResNet-50 gibi görece basit bir mimarinin ImageNet üzerinde eğitimi, birden fazla GPU ile günler sürer. Daha büyük mimariler (EfficientNet-B7, ViT-Large) için bu süre haftalara uzanabilir.

- **Yakınsama güçlüğü**: Rastgele başlatılan ağırlıklarla derin bir modelin kararlı bir şekilde öğrenmesi için dikkatli öğrenme hızı planlaması, batch normalization ayarları ve çeşitli regularization teknikleri gerekir. Önceden eğitilmiş ağırlıklar bu süreci önemli ölçüde kolaylaştırır.

## Transfer Learning Stratejileri

Transfer learning uygulamalarında üç temel yaklaşım öne çıkar. Hangisinin seçileceği veri setinin büyüklüğüne, kaynak ve hedef görevler arasındaki benzerliğe ve mevcut hesaplama kaynaklarına bağlıdır.

### 1. Feature Extraction (Öznitelik Çıkarımı)

En basit ve en az hesaplama gerektiren yaklaşımdır. Önceden eğitilmiş modelin tüm katmanları dondurulur, yalnızca son sınıflandırma katmanı (genellikle fully connected layer) yeni göreve göre değiştirilir ve eğitilir.

Bu strateji özellikle şu durumlarda tercih edilir:
- Hedef veri seti küçüktür (birkaç yüz ile birkaç bin örnek arası).
- Kaynak ve hedef görevler arasında yüksek benzerlik vardır (örneğin ImageNet → evcil hayvan sınıflandırma).
- Hesaplama kaynakları kısıtlıdır.

```python
import torch
import torch.nn as nn
from torchvision import models

# Önceden eğitilmiş ResNet-50 modelini yükle
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)

# Tüm parametreleri dondur
for param in model.parameters():
    param.requires_grad = False

# Son katmanı hedef sınıf sayısına göre değiştir
num_classes = 5
model.fc = nn.Linear(model.fc.in_features, num_classes)
# Yalnızca yeni fc katmanının parametreleri eğitilecek
```

Bu yaklaşımda eğitim süresi dakikalarla ölçülür çünkü güncellenen parametre sayısı toplam ağırlıkların çok küçük bir kesridir.

### 2. Fine-Tuning (İnce Ayar)

Modelin tamamı ya da belirli katmanları serbest bırakılarak hedef veri seti üzerinde düşük bir öğrenme hızıyla eğitilir. Buradaki kritik nokta, önceden öğrenilmiş temsilleri tamamen bozmadan yeni göreve uyarlamaktır.

Fine-tuning genellikle iki aşamalı uygulanır:

```python
import torch.optim as optim

# Aşama 1: Yalnızca son katmanı eğit (feature extraction)
optimizer = optim.Adam(model.fc.parameters(), lr=1e-3)
# ... birkaç epoch eğitim ...

# Aşama 2: Son birkaç bloğu da serbest bırak
for param in model.layer4.parameters():
    param.requires_grad = True

# Farklı katman gruplarına farklı öğrenme hızı ata
optimizer = optim.Adam([
    {"params": model.layer4.parameters(), "lr": 1e-5},
    {"params": model.fc.parameters(), "lr": 1e-4},
])
# ... daha fazla epoch eğitim ...
```

**Discriminative learning rate** (ayrımcı öğrenme hızı) tekniği burada önemli bir rol oynar. Alt katmanlar zaten genel öznitelikleri iyi temsil ettiğinden düşük öğrenme hızıyla ince ayar yapılır; üst katmanlar göreve daha özgü olduğundan biraz daha yüksek hızla güncellenebilir.

Fine-tuning şu durumlarda tercih edilir:
- Hedef veri seti orta büyüklüktedir (birkaç bin ile on binlerce örnek).
- Kaynak ve hedef görevler arasında orta düzeyde benzerlik vardır.
- Daha yüksek performans hedeflenmektedir.

### 3. Domain Adaptation

Kaynak ve hedef veri dağılımları arasında belirgin fark olduğunda (domain shift) standart transfer learning yaklaşımları yetersiz kalabilir. Domain adaptation teknikleri bu farkı minimize etmeyi amaçlar. Örneğin, doğal görüntüler üzerinde eğitilmiş bir modeli tıbbi görüntülere uyarlamak veya gündüz çekimlerine göre eğitilmiş bir nesne dedektörünü gece koşullarına adapte etmek bu kategoriye girer.

Domain adaptation'ın yaygın yöntemleri arasında adversarial training (rakip eğitim), domain-invariant feature learning ve self-training sayılabilir. Bu yöntemler genellikle araştırma düzeyinde uygulanır ve standart transfer learning'den daha karmaşık pipeline'lar gerektirir.

## PyTorch ile Uygulamalı Transfer Learning

Teoriden pratiğe geçelim. Aşağıda çiçek türü sınıflandırma görevi üzerinde PyTorch kullanarak tam bir transfer learning pipeline'ı oluşturacağız. Bu örnek, gerçek projelerde doğrudan uyarlanabilecek bir şablon niteliğindedir.

### Veri Hazırlığı

```python
from torchvision import transforms, datasets
from torch.utils.data import DataLoader

# Eğitim seti için veri artırma (data augmentation)
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# Doğrulama seti için standart dönüşümler
val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

train_dataset = datasets.ImageFolder("data/train", transform=train_transform)
val_dataset = datasets.ImageFolder("data/val", transform=val_transform)

train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=4)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=4)
```

Normalization değerleri ImageNet'in istatistiklerinden gelir. Önceden eğitilmiş model bu değerlerle eğitildiğinden, giriş verilerini aynı şekilde normalize etmek tutarlılık açısından önemlidir.

### Model Oluşturma ve Eğitim Döngüsü

```python
import torch
import torch.nn as nn
from torchvision import models

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# EfficientNet-B0 modelini yükle
model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)

# Backbone'u dondur
for param in model.features.parameters():
    param.requires_grad = False

# Sınıflandırıcı başlığını değiştir
num_classes = len(train_dataset.classes)
model.classifier = nn.Sequential(
    nn.Dropout(p=0.3),
    nn.Linear(model.classifier[1].in_features, num_classes),
)

model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.classifier.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)


def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc


def evaluate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

    epoch_loss = running_loss / total
    epoch_acc = correct / total
    return epoch_loss, epoch_acc
```

### İki Aşamalı Fine-Tuning

```python
# --- Aşama 1: Feature Extraction (5 epoch) ---
print("Aşama 1: Feature Extraction")
for epoch in range(5):
    train_loss, train_acc = train_one_epoch(
        model, train_loader, criterion, optimizer, device
    )
    val_loss, val_acc = evaluate(model, val_loader, criterion, device)
    scheduler.step()
    print(
        f"Epoch {epoch+1}/5 - "
        f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f} - "
        f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}"
    )

# --- Aşama 2: Fine-Tuning (10 epoch) ---
print("\nAşama 2: Fine-Tuning")

# Son birkaç bloğu serbest bırak
for param in model.features[-3:].parameters():
    param.requires_grad = True

# Yeni optimizer: katman gruplarına farklı öğrenme hızları
optimizer = torch.optim.AdamW([
    {"params": model.features[-3:].parameters(), "lr": 1e-5},
    {"params": model.classifier.parameters(), "lr": 5e-4},
], weight_decay=1e-4)

scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)

best_val_acc = 0.0

for epoch in range(10):
    train_loss, train_acc = train_one_epoch(
        model, train_loader, criterion, optimizer, device
    )
    val_loss, val_acc = evaluate(model, val_loader, criterion, device)
    scheduler.step()

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), "best_model.pth")

    print(
        f"Epoch {epoch+1}/10 - "
        f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f} - "
        f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}"
    )

print(f"\nEn iyi doğrulama doğruluğu: {best_val_acc:.4f}")
```

## Dikkat Edilmesi Gereken Noktalar

Transfer learning uygularken bazı pratik detaylar sonucu doğrudan etkiler. Bu detayları göz ardı etmek, yöntemin potansiyelini tam olarak kullanmanın önüne geçer.

### Öğrenme Hızı Seçimi

Fine-tuning aşamasında çok yüksek öğrenme hızı kullanmak, önceden öğrenilmiş ağırlıkları bozar ve "catastrophic forgetting" (yıkıcı unutma) sorununa yol açar. Genel kural olarak, önceden eğitilmiş katmanlar için öğrenme hızı sıfırdan eğitimde kullanılacak değerin 10-100 katı daha küçük tutulmalıdır. Tipik bir aralık 1e-5 ile 1e-4 arasıdır.

### Batch Normalization Davranışı

Batch normalization katmanları eğitim ve çıkarım modlarında farklı davranır. Feature extraction yaklaşımında modeli `model.eval()` modunda tutmak, batch norm istatistiklerinin önceden eğitilmiş değerlerde kalmasını sağlar. Fine-tuning yaparken ise `model.train()` moduna geçmek bu istatistiklerin hedef veri setine göre güncellenmesine olanak tanır. Küçük veri setlerinde batch norm istatistiklerinin kararsız olması durumunda, bu katmanları dondurmak performansı artırabilir.

### Veri Artırma (Data Augmentation)

Transfer learning küçük veri setlerinde etkili olsa da veri artırma teknikleri ile birleştirildiğinde çok daha iyi sonuçlar üretir. Özellikle görüntü verisi için `RandomResizedCrop`, `RandomHorizontalFlip`, `ColorJitter` ve `RandomRotation` gibi dönüşümler modelin farklı perspektiflerden öğrenmesini sağlar. Mixup ve CutMix gibi gelişmiş teknikler ise regularization etkisi yaratarak genelleme performansını artırır.

### Model Seçimi

Hangi önceden eğitilmiş modelin kullanılacağı, görevin doğasına ve mevcut kaynaklara bağlıdır:

| Model | Parametre Sayısı | ImageNet Top-1 | Kullanım Senaryosu |
|-------|-------------------|-----------------|---------------------|
| MobileNetV3-Small | ~2.5M | %67.7 | Mobil ve edge cihazlar |
| EfficientNet-B0 | ~5.3M | %77.7 | Dengeli performans/hız |
| ResNet-50 | ~25.6M | %80.9 | Genel amaçlı, güvenilir |
| ConvNeXt-Base | ~88.6M | %84.1 | Yüksek doğruluk öncelikli |
| ViT-Base/16 | ~86.6M | %84.5 | Büyük veri seti, transformer tabanlı |

Küçük veri setlerinde genellikle daha kompakt modeller (EfficientNet-B0, ResNet-50) daha iyi genelleme yapar çünkü büyük modellerin aşırı öğrenme riski artar.

## NLP'de Transfer Learning

Transfer learning yalnızca bilgisayarlı görü ile sınırlı değildir. Doğal dil işleme alanında BERT, GPT ve T5 gibi büyük dil modelleri de aynı prensibi kullanır. Bu modeller büyük metin külliyatları üzerinde self-supervised learning ile eğitilir, ardından belirli görevlere (duygu analizi, soru cevaplama, metin sınıflandırma) fine-tune edilir.

Hugging Face Transformers kütüphanesi bu süreci oldukça kolaylaştırır:

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer

model_name = "dbmdz/bert-base-turkish-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=3,
)

# Bu noktadan sonra standart Hugging Face Trainer ile fine-tune edilebilir
```

Türkçe NLP görevleri için `dbmdz/bert-base-turkish-cased` modeli iyi bir başlangıç noktasıdır. Bu model Türkçe Wikipedia ve çeşitli Türkçe metin kaynakları üzerinde eğitilmiştir.

## Transfer Learning Ne Zaman İşe Yaramaz?

Her güçlü teknik gibi transfer learning'in de sınırları vardır:

- **Kaynak ve hedef arasında çok büyük fark**: Doğal görüntülerle eğitilmiş bir modeli tamamen farklı bir modaliteye (örneğin radar sinyalleri veya zaman serisi verisi) aktarmak beklenen faydayı sağlamayabilir.

- **Hedef veri seti çok büyükse**: Yeterince büyük bir veri setine sahipseniz (yüz binlerce veya milyonlarca örnek), sıfırdan eğitim transfer learning ile karşılaştırılabilir sonuçlar verebilir. Bu durumda transfer learning'in asıl avantajı daha hızlı yakınsama olur.

- **Negatif transfer**: Bazı durumlarda kaynak görevden aktarılan bilgi hedef göreve zarar verebilir. Bu durum genellikle kaynak ve hedef görevlerin çelişkili öznitelik kalıpları gerektirdiğinde ortaya çıkar. Dikkatli validasyon ve baseline karşılaştırmaları bu riski yönetmeye yardımcı olur.

## Sonuç

Transfer learning, derin öğrenme projelerinde veri ve hesaplama verimliliğini çarpıcı biçimde artıran temel bir yaklaşımdır. Önceden eğitilmiş modellerin genel öznitelik temsillerini yeniden kullanarak, sınırlı kaynaklarla bile güçlü modeller oluşturmak mümkün hale gelir.

Pratik bir uygulama planı olarak şu akışı izlemek genellikle iyi sonuç verir: önce feature extraction ile hızlı bir baseline oluşturun, ardından fine-tuning ile performansı artırın ve discriminative learning rate tekniğiyle ince ayar yapın. Veri artırma ve uygun regularization teknikleri ile birleştirildiğinde, birkaç yüz örnekle bile %90 üzerinde doğruluk elde etmek birçok görev için mümkündür.

---

## Kaynaklar

1. Yosinski, J., Clune, J., Bengio, Y., & Lipson, H. (2014). "How transferable are features in deep neural networks?" *Advances in Neural Information Processing Systems (NeurIPS)*. [https://arxiv.org/abs/1411.1792](https://arxiv.org/abs/1411.1792)

2. Tan, M., & Le, Q. V. (2019). "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks." *International Conference on Machine Learning (ICML)*. [https://arxiv.org/abs/1905.11946](https://arxiv.org/abs/1905.11946)

3. Devlin, J., Chang, M., Lee, K., & Toutanova, K. (2019). "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding." *North American Chapter of the Association for Computational Linguistics (NAACL)*. [https://arxiv.org/abs/1810.04805](https://arxiv.org/abs/1810.04805)

4. PyTorch Transfer Learning Tutorial. PyTorch Documentation. [https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html](https://pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)
