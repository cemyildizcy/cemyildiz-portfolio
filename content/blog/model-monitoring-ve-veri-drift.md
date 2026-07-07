---
title: "Model Monitoring ve Veri Drift: Model Canlıya Çıktıktan Sonra Ne İzlenir?"
date: "2026-07-07"
tags: ["MLOps", "Model Monitoring", "Veri Bilimi", "Makine Öğrenimi"]
readTime: "15 dk"
coverEmoji: "📡"
description: "Makine öğrenimi modelleri üretime alındıktan sonra veri drift, performans düşüşü, etiket gecikmesi ve alarm tasarımı üzerinden nasıl izlenir? Pratik MLOps rehberi."
---

# Model Monitoring ve Veri Drift: Model Canlıya Çıktıktan Sonra Ne İzlenir?

Bir makine öğrenimi modelini eğitip iyi bir skor almak işin sadece ilk kısmıdır. Model gerçek kullanıcıya, gerçek veriye ve değişen koşullara çıktığında başka bir problem başlar: Model hâlâ doğru çalışıyor mu?

Bu soru çoğu projede geç sorulur. Notebook'ta validation skoru iyidir, model API'ye bağlanır, tahmin üretmeye başlar. Birkaç hafta sonra veri dağılımı değişir, kullanıcı davranışı farklılaşır veya ürün ekibi form alanlarını günceller. Model teknik olarak ayaktadır ama karar kalitesi düşmüştür. İşte model monitoring bu yüzden gerekir.

Bu yazıda üretimde çalışan ML modellerini nasıl izleyebileceğimizi, veri drift kavramını, hangi metriklerin takip edileceğini ve alarmların nasıl tasarlanacağını pratik taraftan anlatıyorum.

## Üretimde model neden bozulur?

Modelin canlıda kötüleşmesi her zaman kod hatası değildir. Çoğu zaman model aynı kodla çalışır ama dünya değişir.

Örnekler:

- E-ticaret modelinde kampanya dönemi başlar, kullanıcı davranışı değişir.
- Kredi risk modelinde ekonomik koşullar değişir.
- Churn modelinde ürün fiyatlandırması güncellenir.
- Spam filtresinde saldırganlar yeni kelime kalıpları kullanır.
- Görsel sınıflandırma modelinde kamera veya ışık koşulları değişir.

Model geçmiş veriden öğrenir. Eğer canlı veri, eğitim verisinden anlamlı biçimde uzaklaşırsa modelin varsayımları zayıflar. Bu uzaklaşma her zaman performans düşüşü demek değildir ama kontrol edilmesi gereken bir sinyaldir.

## Monitoring sadece accuracy izlemek değildir

İlk refleks genelde şudur: "Modelin accuracy'sini izleyelim." Kulağa mantıklı gelir ama üretimde çoğu zaman etiketi hemen bilmezsin.

Mesela bir kredi başvurusunda model bugün karar verir. Gerçek geri ödeme davranışı aylar sonra ortaya çıkar. Churn tahmininde kullanıcının gerçekten ayrılıp ayrılmadığını görmek zaman alır. Fraud detection tarafında bazı işlemler manuel incelemeden sonra etiketlenir.

Bu yüzden production monitoring birkaç katmandan oluşur:

1. Sistem sağlığı: API ayakta mı, gecikme süresi ne, hata oranı arttı mı?
2. Veri kalitesi: Beklenen kolonlar geliyor mu, null oranı değişti mi?
3. Veri dağılımı: Canlı veri eğitim verisine benziyor mu?
4. Tahmin dağılımı: Model bir anda hep aynı sınıfı mı üretmeye başladı?
5. Gerçek performans: Etiket geldikçe precision, recall, F1, RMSE gibi metrikler nasıl değişiyor?

Bunların hepsini tek grafiğe sıkıştırmaya çalışmak yerine ayrı ayrı izlemek daha sağlıklıdır.

## Veri drift nedir?

Veri drift, modelin gördüğü input dağılımının zamanla değişmesidir. Eğitim sırasında model belirli bir veri dağılımına alışır. Canlı veri bu dağılımdan uzaklaşırsa modelin karar sınırları eskisi kadar iyi çalışmayabilir.

Basit bir örnek düşünelim. Bir ev fiyatı modeli eğittin. Eğitim verisinde evlerin çoğu 70-180 metrekare aralığında. Canlı sistemde bir anda çok fazla 400 metrekare lüks konut gelmeye başladıysa input dağılımı değişmiştir. Model hâlâ tahmin üretir ama bu bölgede yeterince örnek görmediyse hata artabilir.

Drift birkaç farklı şekilde görülebilir:

- Feature drift: Girdi değişkenlerinin dağılımı değişir.
- Prediction drift: Model çıktılarının dağılımı değişir.
- Concept drift: Girdi ile hedef arasındaki ilişki değişir.

Feature drift en kolay izlenen türdür. Çünkü etikete ihtiyaç duymaz. Concept drift daha zordur; gerçek etiketler gelmeden net anlaşılmaz.

## Feature drift nasıl ölçülür?

Sayısal değişkenlerde temel istatistikleri takip etmek iyi bir başlangıçtır:

- Ortalama
- Medyan
- Standart sapma
- Minimum ve maksimum
- Percentile değerleri
- Null oranı
- Sıfır oranı

Kategorik değişkenlerde ise kategori frekanslarına bakılır. Örneğin `country`, `device_type` veya `traffic_source` gibi kolonlarda beklenmeyen bir kategori artışı modeli etkileyebilir.

Daha sistematik ölçüm için şu metrikler kullanılabilir:

- Population Stability Index (PSI)
- Jensen-Shannon divergence
- Kolmogorov-Smirnov testi
- Wasserstein distance

Bunları ezbere kullanmak doğru değildir. Önce feature'ın iş anlamını bilmek gerekir. Yaş dağılımında küçük bir değişim önemli olabilirken, serbest metin uzunluğunda aynı büyüklükte değişim normal olabilir.

## Prediction drift neden ayrı izlenir?

Bazen input verisi küçük değişir ama model çıktısı ciddi şekilde kayar. Bu yüzden tahmin dağılımını da izlemek gerekir.

Binary classification modelinde şu sinyaller önemlidir:

- Pozitif tahmin oranı arttı mı?
- Ortalama skor değişti mi?
- Skorlar 0.5 çevresinde mi yığılıyor?
- Model çok emin görünmeye başladı mı?
- Model neredeyse herkese aynı sınıfı mı veriyor?

Örneğin fraud detection modelinde pozitif tahmin oranı normalde %2 iken bir günde %18'e çıktıysa iki ihtimal vardır. Gerçekten dolandırıcılık patlamıştır veya veri/model hattında sorun vardır. İkisi de incelenmelidir.

Regression modelinde tahmin ortalaması, dağılım genişliği ve uç değerler takip edilir. Talep tahmini modelinde tahminlerin bir anda hep düşük kalması stok problemlerine yol açabilir.

## Etiket gecikmesi varsa ne yapılır?

Üretimde en zor konulardan biri label delay'dir. Gerçek sonuç hemen gelmediği için performans metriği gecikmeli hesaplanır.

Bu durumda üç katmanlı bir yaklaşım kullanılabilir:

1. Anlık izleme: input kalitesi, drift ve prediction dağılımı.
2. Gecikmeli performans: etiket geldikçe gerçek metrikler.
3. İş metriği: model kararının etkilediği dönüşüm, kayıp, maliyet veya kullanıcı davranışı.

Örneğin churn modelinde kullanıcıya retention teklifi yapılıyorsa sadece model skoruna bakmak yetmez. Teklif alan kullanıcıların kalma oranı, teklif maliyeti ve yanlış hedefleme oranı da izlenmelidir.

Model metriği ile iş metriği aynı şey değildir. Model recall artırabilir ama operasyon maliyetini fazla yükseltiyorsa karar sistemi kötüleşmiş olabilir.

## Veri kalitesi kontrolleri drift'ten önce gelir

Drift analizi yapmadan önce veri hattının sağlam olduğundan emin olmak gerekir. Çünkü birçok "drift" vakası aslında veri kalitesi hatasıdır.

Kontrol edilmesi gereken basit şeyler:

- Beklenen kolonlar var mı?
- Veri tipi değişti mi?
- Null oranı arttı mı?
- Kategorik değişkende yeni kategori geldi mi?
- Sayısal değişkende fiziksel olarak imkânsız değer var mı?
- Timestamp alanı doğru zaman diliminde mi?
- Feature engineering adımı train ve inference tarafında aynı mı?

Bir modelin performansı düşüyorsa ilk bakılacak yer genelde model dosyası değil veri pipeline'ıdır. Özellikle preprocessing kodu eğitim ve canlı ortamda farklı çalışıyorsa modelden beklenen davranışı almak zordur.

## Alarm tasarımı: her değişime alarm kurma

Monitoring sistemi çok alarm üretirse kimse bakmaz. Bu, teknik olarak çalışan ama pratikte işe yaramayan bir sistemdir.

İyi alarm şu özelliklere sahiptir:

- Aksiyon alınabilir olmalı.
- Gürültü üretmemeli.
- Önem seviyesine göre ayrılmalı.
- Tek bir veri noktasına değil, sürekliliğe bakmalı.
- Alarm mesajında hangi feature'ın, hangi eşikten, ne kadar saptığı yazmalı.

Örneğin "drift var" kötü bir alarmdır. "Son 6 saatte `transaction_amount` PSI=0.32 oldu, kritik eşik 0.25; pozitif tahmin oranı %2.1'den %7.8'e çıktı" daha iyidir. Bu mesaj incelemeye nereden başlanacağını gösterir.

Alarmlar seviyelendirilebilir:

- Info: küçük değişim, takip edilecek.
- Warning: belirgin değişim, inceleme gerekir.
- Critical: model kararı durdurulabilir veya fallback devreye alınabilir.

## Retraining her drift'in cevabı değildir

Drift görünce ilk tepki modeli yeniden eğitmek olabilir. Bu bazen doğru, bazen de hatalıdır.

Önce şu sorular sorulmalı:

- Drift veri kalitesi hatasından mı kaynaklandı?
- Yeni dağılım kalıcı mı, geçici mi?
- Etiketler geldiğinde performans gerçekten düştü mü?
- Yeni veride bias veya eksik segment var mı?
- Yeniden eğitim modeli daha iyi yapıyor mu, yoksa sadece son haftaya mı uyduruyor?

Retraining bir çözüm olabilir ama otomatik retraining dikkatli tasarlanmalıdır. Kötü etiket, bozuk veri veya saldırı altındaki veriyle modeli yeniden eğitmek problemi büyütebilir.

Daha güvenli yaklaşım:

1. Drift sinyalini yakala.
2. Veri kalitesini kontrol et.
3. Etiket geldikçe performansı ölç.
4. Yeni model adayını eski modelle karşılaştır.
5. Gerekirse shadow veya A/B test ile çıkar.

Model güncellemek deployment problemidir; sadece eğitim scriptini tekrar çalıştırmak değildir.

## Pratik bir monitoring planı

Küçük veya orta ölçekli bir ML projesi için basit ama işe yarayan plan şöyle olabilir:

1. Eğitim verisinin referans istatistiklerini kaydet.
2. Canlı input verilerini günlük veya saatlik pencereye böl.
3. Her pencere için veri kalitesi raporu üret.
4. Kritik feature'lar için drift metriği hesapla.
5. Tahmin skorlarının dağılımını izle.
6. Etiket geldikçe gerçek performans metriğini güncelle.
7. Alarm eşiklerini ilk ay manuel gözlemle ayarla.
8. Model, veri ve kod versiyonunu birlikte logla.

Burada önemli nokta başlangıçta sistemi fazla karmaşık yapmamaktır. İlk hedef, modelin ne zaman şüpheli davranmaya başladığını görebilmektir.

## Basit Python fikri

Aşağıdaki örnek production sistemi değildir ama düşünceyi gösterir. Eğitim verisi ile canlı pencere arasında sayısal feature ortalamalarını karşılaştırıyoruz.

```python
import pandas as pd

reference = pd.read_parquet("train_reference.parquet")
current = pd.read_parquet("production_window.parquet")

features = ["age", "income", "session_count", "avg_order_value"]

rows = []
for feature in features:
    ref_mean = reference[feature].mean()
    cur_mean = current[feature].mean()
    ref_std = reference[feature].std()

    z_shift = abs(cur_mean - ref_mean) / ref_std if ref_std else 0

    rows.append({
        "feature": feature,
        "reference_mean": ref_mean,
        "current_mean": cur_mean,
        "z_shift": z_shift,
        "null_rate": current[feature].isna().mean(),
    })

report = pd.DataFrame(rows).sort_values("z_shift", ascending=False)
print(report)
```

Gerçek sistemde histogram, kategori dağılımı, PSI, veri tipi kontrolü ve prediction dağılımı da eklenir. Ama bu küçük örnek bile bir şeyi gösterir: Monitoring, model eğitiminden ayrı bir mühendislik katmanıdır.

## Sık yapılan hatalar

En sık hata, monitoring'i proje sonuna bırakmaktır. Model canlıya çıktığında log yoksa geriye dönük analiz yapmak zorlaşır. Hangi veriyle hangi tahminin üretildiğini bilmiyorsan problemi bulmak tahmine dönüşür.

İkinci hata, sadece teknik metriklere bakmaktır. API latency düşük olabilir, model servis olarak ayakta olabilir ama iş kararı kötüleşmiş olabilir.

Üçüncü hata, her feature'a aynı önemi vermektir. Bazı değişkenler model için kritik, bazıları neredeyse etkisizdir. Feature importance, SHAP analizi veya domain bilgisi alarm önceliğini belirlemeye yardım eder.

Dördüncü hata, retraining'i otomatik kurtarıcı sanmaktır. Yeni veri temiz değilse yeniden eğitim modeli düzeltmez; hatayı kalıcı hale getirir.

## Sonuç

Canlıdaki model sabit bir varlık değildir. Veri değişir, kullanıcı davranışı değişir, ürün değişir. Bu yüzden iyi bir ML sistemi sadece eğitim kodundan oluşmaz; izleme, alarm, veri kalitesi kontrolü ve yeniden değerlendirme döngüsü de gerekir.

Başlangıç için şunu hedeflemek yeterli: Model hangi veriyi gördü, hangi tahmini üretti, bu dağılım geçmişe göre değişti mi ve etiketler geldiğinde performans ne oldu? Bu dört soruya cevap verebiliyorsan modelin canlıdaki davranışını yönetmeye başlamışsın demektir.

## Kaynaklar

- scikit-learn, "Common pitfalls and recommended practices": https://scikit-learn.org/stable/common_pitfalls.html
- Google, "Rules of Machine Learning: Best Practices for ML Engineering": https://developers.google.com/machine-learning/guides/rules-of-ml
- Evidently AI, "ML system design": https://www.evidentlyai.com/ml-system-design
- Sculley et al., "Hidden Technical Debt in Machine Learning Systems": https://arxiv.org/abs/2007.03252
