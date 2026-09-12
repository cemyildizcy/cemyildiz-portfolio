# Mavi Masa / Canlı Kesit

Tek dosyalık, üretim kodundan bağımsız ana sayfa eskizi.

## Açma

`index.html` dosyasını doğrudan tarayıcıda açın. Görseller `../../public/` altındaki gerçek portfolyo varlıklarına bağlanır.

## Etkileşim

- Proje dosyaları: GündemAI, WC2026 ve SleepInfo.
- Dosya katmanları: Çıktı, Karar, AI desteği ve Sınırlar.
- Sekmeler fare, dokunma, `Tab`, ok tuşları, `Home` ve `End` ile çalışır.
- Klavye odağında görünen “İçeriğe geç” bağlantısı doğrudan `main` alanına gider; varsayılan durumda ekranın dışındadır.
- Açılışta yalnız proje dosyası bir kez görünür; `prefers-reduced-motion` açıkken animasyon kaldırılır.

## Görsel doğrulama

`python verify.py` komutu ekran görüntülerini yeniler ve ölçümleri `verification.json` dosyasına yazar.

- `desktop.png`: 1440 × 1000 CSS px, tam sayfa.
- `mobile-390.png`: 390 × 844 CSS px, tam sayfa; ekran görüntüsü alınmadan önce odak `body` üzerindedir.
- Ek senaryolar: 320 × 844 ve 390 × 844 üzerinde %200 CSS zoom.
- Yatay taşma: dört senaryoda da yok (`scrollWidth === innerWidth`: 1440, 390, 320 ve 390 px).
- En küçük görünür etkileşim hedefi: normal senaryolarda 44 px; %200 zoom senaryosunda 88 px.
- 390 × 844 ilk görünümünde WC2026 grafiğinin okunabilir yakın görünümü `y=578.9–848.9 px` aralığında görünür; grafik kendi sabit penceresinde yatay/dikey incelenir ve sayfada taşma üretmez.
- Mobil grafik üzerinde “Yana kaydırarak incele” ipucu bulunur.
- Varsayılan skip link bütünüyle ekran dışında (`y=-46–-6 px`); odaklandığında görünür (`y=16–56 px`).
- İki yerel görsel yüklendi: profil 400 px doğal genişlik, WC2026 grafiği 1971 px doğal genişlik.
- Konsol ve sayfa hatası: dört senaryoda 0.
- Proje sekmesi ok tuşuyla değiştirildi; dört dosya katmanı açılarak içerikleri doğrulandı.
