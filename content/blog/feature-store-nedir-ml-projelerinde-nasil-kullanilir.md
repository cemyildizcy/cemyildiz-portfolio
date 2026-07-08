---
title: "Feature Store Nedir, ML Projelerinde Ne Zaman Kullanılır?"
date: "2026-07-08"
tags: ["MLOps", "Feature Engineering", "Makine Öğrenimi", "Veri Bilimi"]
readTime: "16 dk"
coverEmoji: "🧱"
description: "Feature store kavramını eğitim-serving tutarlılığı, point-in-time doğruluk, yeniden kullanılabilir feature'lar ve pratik MLOps kararları üzerinden anlatan rehber."
---

# Feature Store Nedir, ML Projelerinde Ne Zaman Kullanılır?

Makine öğrenimi projelerinde model genelde sahnenin en görünen tarafıdır. Algoritma seçilir, metrikler konuşulur, hiperparametre ayarlanır. Ama birçok projede asıl zor iş modelden önce başlar: Veriyi modele uygun hale getirmek.

Bir churn modeli için son 30 gündeki giriş sayısı, son 7 gündeki satın alma tutarı, destek talebi sayısı, üyelik yaşı gibi değişkenler üretirsin. Fraud detection tarafında kartın son 10 dakikadaki işlem sayısı, kullanıcının alışılmadık lokasyon davranışı veya cihaz değişimi önemli olabilir. Tavsiye sisteminde kullanıcının son izlediği kategoriler, ürünün popülerliği ve kullanıcı-ürün etkileşimleri gerekir.

Bunların hepsi feature'dır. Feature store ise bu feature'ları üretmek, saklamak, paylaşmak ve hem eğitimde hem canlı tahminde tutarlı kullanmak için kurulan altyapıdır.

Bu yazıda feature store kavramını sadece "feature deposu" diye çevirmekle yetinmeden, hangi problemi çözdüğünü, ne zaman gereksiz olduğunu ve pratikte nelere dikkat edilmesi gerektiğini anlatıyorum.

## Problem: feature engineering notebook'ta kalınca ne olur?

Küçük bir ML projesinde feature engineering genelde notebook içinde başlar. CSV okunur, birkaç kolon dönüştürülür, tarih farkı alınır, kategorik değişken encode edilir ve model eğitilir. Bu aşamada sorun yoktur.

Sorun proje büyüyünce ortaya çıkar.

Aynı feature birden fazla modelde kullanılmaya başlar. Churn modeli, kampanya hedefleme modeli ve müşteri segmentasyonu aynı kullanıcı davranışı özetlerine ihtiyaç duyar. Her ekip aynı hesaplamayı kendi pipeline'ında yeniden yazar. Bir ekip son 30 günü takvim günü olarak alır, başka ekip son 720 saat olarak hesaplar. Bir yerde null değer 0 yapılır, başka yerde ortalama ile doldurulur.

Model eğitimde bir feature'ı farklı, canlı tahminde farklı görürse performans düşer. Daha kötüsü, bu fark bazen hemen fark edilmez. Offline metrikler iyi görünür ama production'da model beklenenden kötü çalışır.

Feature store bu dağınıklığı azaltmak için vardır. Ama her projeye feature store kurmak doğru değildir. Önce çözdüğü problemleri net görmek gerekir.

## Feature store neyi çözer?

Feature store'u tek cümleyle anlatmak gerekirse: Model feature'larının tanımlandığı, hesaplandığı, versiyonlandığı ve farklı ortamlarda tutarlı şekilde servis edildiği katmandır.

Bu katman birkaç temel problemi hedefler.

## 1. Eğitim-serving tutarlılığı

ML sistemlerinde klasik hatalardan biri training-serving skew'dur. Model eğitim sırasında bir feature'ı belirli bir yöntemle görür, canlı tahmin sırasında aynı feature farklı yöntemle hesaplanır.

Örneğin eğitim pipeline'ında `son_30_gun_satin_alma_tutari` batch veri üzerinden hesaplanıyor olsun. Production API'de ise aynı feature canlı veritabanından anlık sorguyla geliyor. İki tarafta zaman penceresi, filtreler veya null davranışı farklıysa model aynı değişkeni iki farklı anlamda kullanır.

Feature store bu hesaplama mantığını merkezi hale getirir. Feature tanımı tek yerde durur. Eğitim veri seti oluşturulurken de canlı tahmin yapılırken de aynı tanıma bakılır.

Bu her zaman otomatik mucize değildir. Yine test gerekir. Ama feature hesaplamalarının kopyalanmasını azaltır.

## 2. Yeniden kullanım

İyi feature üretmek zaman alır. Bir kullanıcının son 7, 30 ve 90 günlük davranış özetleri birçok modelde işe yarayabilir. Eğer her ekip bunları sıfırdan yazıyorsa hem zaman kaybı olur hem de kalite dağılır.

Feature store, feature'ları katalog gibi sunar. Ekipler hangi feature'ın var olduğunu, nasıl hesaplandığını, hangi veri kaynağından geldiğini, ne kadar güncel olduğunu ve hangi modellerde kullanıldığını görebilir.

Bu özellikle orta ve büyük ekiplerde önemlidir. Tek kişilik portfolyo projesinde aynı fayda daha basit dosya yapısı ve temiz pipeline koduyla sağlanabilir.

## 3. Point-in-time doğru eğitim seti

Zaman içeren ML problemlerinde en tehlikeli hatalardan biri geleceği yanlışlıkla modele göstermektir. Buna data leakage denir.

Diyelim bir kredi riski modeli eğitiyorsun. Modelin başvuru anında bilmesi gereken bilgiler vardır. Ama veri setini bugünden geriye doğru hazırlarken, başvurudan sonra oluşmuş ödeme davranışını feature olarak eklersen model geleceği görmüş olur. Offline skorlar çok iyi çıkar. Canlıda aynı bilgi mevcut olmadığı için model çöker.

Feature store'larda point-in-time join bu yüzden önemlidir. Eğitim seti hazırlanırken her satır için yalnızca o tahmin anına kadar bilinen feature değerleri alınır.

Basit örnek:

| Kullanıcı | Tahmin zamanı | Kullanılabilecek feature |
|---|---:|---|
| A | 2026-01-10 12:00 | Bu zamandan önceki davranışlar |
| B | 2026-02-03 09:30 | Bu zamandan önceki davranışlar |

Eğer sistem B kullanıcısı için 2026-02-05'te oluşan bir bilgiyi eğitim satırına katarsa veri sızıntısı oluşur. Feature store bu join mantığını standartlaştırarak riski azaltır.

## 4. Online ve offline feature erişimi

Bazı modeller batch çalışır. Örneğin her gece tüm kullanıcılar için churn skoru üretirsin. Bu durumda feature'lar veri ambarından okunabilir.

Bazı modeller ise anlık cevap vermek zorundadır. Fraud detection, reklam sıralama veya öneri sistemlerinde model milisaniyeler içinde feature'a erişmek ister. Bu noktada online store gerekir. Genelde Redis, DynamoDB, Cassandra veya benzeri düşük gecikmeli sistemler kullanılır.

Feature store mimarilerinde çoğu zaman iki katman vardır:

| Katman | Amaç | Örnek kullanım |
|---|---|---|
| Offline store | Geçmiş veri ve eğitim seti üretimi | BigQuery, Snowflake, Parquet, Delta Lake |
| Online store | Canlı tahmin için düşük gecikmeli erişim | Redis, DynamoDB, Cassandra |

Buradaki kritik nokta şudur: Online ve offline tarafta aynı feature'ın anlamı değişmemelidir.

## Basit bir feature store akışı

Tipik bir akış şöyle düşünülebilir:

1. Ham veri kaynakları belirlenir.
2. Feature tanımları kodla yazılır.
3. Batch job veya streaming job bu feature'ları hesaplar.
4. Feature değerleri offline store'a kaydedilir.
5. Canlı tahmin gereken feature'lar online store'a aktarılır.
6. Model eğitimi sırasında offline store'dan point-in-time doğru veri seti üretilir.
7. Production model API'si online store'dan feature okuyarak tahmin yapar.
8. Feature kalite metrikleri izlenir.

Bu akış kulağa büyük şirket altyapısı gibi gelebilir. Zaten çoğu zaman öyledir. Ama altında yatan fikir küçük projelerde de işe yarar: Feature tanımlarını dağınık notebook hücrelerinde bırakma.

## Feature store ne zaman gerçekten gerekir?

Feature store kurmak maliyetlidir. Ek servis, bakım, veri kalitesi kontrolü, pipeline orkestrasyonu ve ekip alışkanlığı ister. Bu yüzden "ML projesi var, o zaman feature store kuralım" doğru yaklaşım değildir.

Feature store şu durumlarda anlamlı hale gelir:

- Birden fazla model aynı feature'ları kullanıyorsa.
- Eğitim ve canlı tahmin arasında tutarlılık problemi yaşanıyorsa.
- Zaman bazlı feature'larda data leakage riski yüksekse.
- Online inference düşük gecikmeyle feature okumak zorundaysa.
- Feature sahipliği, kataloglama ve kalite takibi ekip içinde sorun olmaya başladıysa.
- Regülasyon veya denetlenebilirlik nedeniyle feature geçmişi izlenmeliyse.

Buna karşılık şu durumlarda feature store fazla gelebilir:

- Tek model, tek veri seti, batch tahmin.
- Feature'lar basit ve nadiren değişiyor.
- Ekip küçük, pipeline zaten okunabilir ve testli.
- Production sistemi yok, proje analiz veya prototip seviyesinde.

Küçük projede önce temiz veri pipeline'ı kurmak daha doğru olabilir. Feature fonksiyonlarını ayrı dosyada tutmak, test yazmak, veri seti üretimini tek komutla çalıştırmak ve tarih filtrelerini netleştirmek çoğu zaman yeterlidir.

## Popüler araçlar: Feast, Tecton, Vertex AI Feature Store

Feature store tarafında farklı yaklaşımlar var.

Feast açık kaynak bir feature store projesidir. Python ile feature view tanımları yazılır, offline ve online store bağlantıları yapılandırılır. Açık kaynak olduğu için öğrenme ve portfolyo projelerinde incelenmesi faydalıdır.

Tecton daha yönetilen ve enterprise odaklı bir platformdur. Feature pipeline'larını, streaming/batch dönüşümleri ve production servis tarafını daha bütünlüklü ele alır.

Google Cloud Vertex AI Feature Store ise GCP ekosisteminde feature yönetimi için kullanılan servislerden biridir. Bulut sağlayıcıya yakın çalışan ekiplerde operasyon yükünü azaltabilir.

Araç seçerken önce şu sorulara bakmak gerekir:

- Veri nerede duruyor?
- Model batch mi online mı çalışıyor?
- Feature hesaplamaları batch, streaming veya ikisinin karışımı mı?
- Ekip açık kaynak servis yönetebilir mi?
- Gecikme beklentisi nedir?
- Maliyet sınırı nedir?

Araç, mimari kararı çözmez. Sadece doğru mimariyi uygulamayı kolaylaştırır.

## Sık hata: feature store'u veri ambarı sanmak

Feature store bir veri ambarı değildir. Veri ambarı genel analitik sorgular için tasarlanır. Feature store ise model feature'larının üretimi ve servis edilmesi için daha dar bir soruna odaklanır.

Bir veri ambarında satış tabloları, kullanıcı tabloları, event logları ve raporlama metrikleri durabilir. Feature store ise bu kaynaklardan türetilmiş, modelin kullandığı değişkenleri yönetir.

Örneğin `orders` tablosu veri ambarındadır. `user_last_30d_order_count` feature store'da olabilir.

Bu ayrım pratikte önemlidir. Feature store kurmak, ham veri yönetimini çözmez. Veri kalitesi kötü, event şemaları belirsiz veya kaynak tablolar güvenilmezse feature store sadece problemi daha görünür hale getirir.

## Sık hata: offline başarıyı production garantisi sanmak

Feature store training-serving farkını azaltabilir ama modelin production'da iyi çalışacağını garanti etmez. Canlı veri dağılımı değişebilir, online store gecikebilir, feature güncelleme job'ı bozulabilir veya kullanıcı davranışı farklılaşabilir.

Bu yüzden feature store ile birlikte monitoring gerekir:

- Feature null oranı değişti mi?
- Feature dağılımı eğitim dönemine benziyor mu?
- Online store'da stale değer var mı?
- Feature hesaplama job'ları zamanında çalışıyor mu?
- Model tahmin dağılımı beklenmedik biçimde kaydı mı?

Feature store, MLOps zincirinin bir parçasıdır. Tek başına tüm zincir değildir.

## Pratik mini örnek: churn modeli

Bir abonelik ürününde churn tahmini yaptığını düşünelim. Model her kullanıcı için önümüzdeki 30 gün içinde ayrılma ihtimalini tahmin ediyor.

İşe yarayabilecek feature'lar:

| Feature | Açıklama |
|---|---|
| `account_age_days` | Kullanıcının üyelik yaşı |
| `login_count_7d` | Son 7 günde giriş sayısı |
| `login_count_30d` | Son 30 günde giriş sayısı |
| `support_ticket_count_30d` | Son 30 günde açılan destek talebi |
| `payment_failed_count_90d` | Son 90 günde başarısız ödeme sayısı |
| `plan_type` | Abonelik paketi |

Notebook'ta bu feature'ları SQL ile üretmek kolaydır. Ama production'da her gün skor üretilecekse, ayrıca kampanya modeli de aynı davranış feature'larını kullanacaksa, tanımları merkezi hale getirmek mantıklı olur.

Burada feature store şunları sağlar:

- `login_count_30d` bir kez tanımlanır.
- Eğitim seti geçmiş tarihler için doğru şekilde oluşturulur.
- Günlük batch skorlamada aynı hesaplama kullanılır.
- Başka model aynı feature'ı yeniden yazmadan kullanabilir.
- Feature kalitesi izlenebilir.

Ama bu örnek tek seferlik Kaggle tarzı analizse feature store kurmak gereksizdir. Temiz bir `features.py` dosyası ve iyi belgelenmiş SQL yeterli olur.

## Portfolyo projesinde nasıl gösterilir?

Feature store konusu portfolyoda güzel gösterilebilir çünkü sadece model skoruna değil, ML sistem düşüncesine odaklanır.

Basit bir proje fikri:

- Küçük bir churn veya fraud veri seti seç.
- Feature hesaplama kodunu ayrı modüle taşı.
- Her feature için isim, açıklama, kaynak kolonlar ve zaman penceresi yaz.
- Eğitim veri setini tarih kesitine göre üret.
- Basit testlerle data leakage kontrolü yap.
- İsteğe bağlı olarak Feast ile offline store tanımı kur.
- README'de hangi feature'ın neden kullanıldığını anlat.

Böyle bir proje, "model eğittim" demekten daha güçlü görünür. Çünkü veri hazırlama, tekrar üretilebilirlik ve production düşüncesi gösterir.

## Karar özeti

Feature store, ML projelerinde feature'ları merkezi ve tutarlı yönetmek için kullanılan bir MLOps katmanıdır. En çok birden fazla modelin aynı feature'ları kullandığı, online inference ihtiyacının olduğu ve zaman bazlı veri sızıntısı riskinin yüksek olduğu sistemlerde değer üretir.

Her projeye kurulması gerekmez. Küçük ve tek model içeren projelerde önce okunabilir pipeline, testli feature fonksiyonları ve net veri kesitleri yeterlidir. Proje büyüdükçe feature store ihtiyacı doğal olarak görünür hale gelir.

Benim için pratik kural şu: Eğer aynı feature'ı üçüncü kez yeniden yazıyorsan veya eğitimde kullandığın feature'ın production'da gerçekten aynı hesaplandığından emin değilsen, feature store konusunu ciddi şekilde düşünme zamanı gelmiştir.

## Kaynaklar

- Feast documentation: https://docs.feast.dev/
- Tecton feature store concepts: https://docs.tecton.ai/docs/
- Google Cloud Vertex AI Feature Store: https://cloud.google.com/vertex-ai/docs/featurestore
- Uber Michelangelo platform yazısı: https://www.uber.com/blog/michelangelo-machine-learning-platform/
- Martin Fowler, Feature Store: https://martinfowler.com/articles/feature-store.html
