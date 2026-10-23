# afi kod

**afi'nin blok kodlama serüveni** — çocuklara blok kodlamayla programlamayı öğreten ücretsiz eğitim uygulaması.

- **Uygulama:** https://aydinincekara.github.io/isikcirobot_v1/
- **Öğretmen modu:** https://aydinincekara.github.io/isikcirobot_v1/#ogretmen
- **Sınıf sürümü (öğretmen sunucusu + öğrenci istemcisi):** https://aydinincekara.github.io/isikcirobot_offline/
- **Kılavuz (Word):** [afi-kod-kilavuz.docx](afi-kod-kilavuz.docx) — proje bilgisi, yapılanlar, sıfırdan kurulum, kullanım ve teknik yapı

Ev robotu afi, Deniz'in ailesinin evini adım adım akıllı hale getirir. **15 bölüm, 350 adım**. Bölüm 1–10'da Başlangıç, Orta ve Zor düzeyleri (10'ar adım), Bölüm 11–15'te Başlangıç düzeyi (10'ar adım):

| # | Bölüm | Kavram |
|---|---|---|
| 1 | Salon | Sıralama |
| 2 | Koridor | Döngüler |
| 3 | Mutfak | Koşullar |
| 4 | Giriş kapısı | Olaylar |
| 5 | Garaj | Değişken ve karşılaştırma |
| 6 | Bahçe | Eşik değerler |
| 7 | Çocuk odası | Fonksiyonlar |
| 8 | Kontrol merkezi | Proje |
| 9 | Arduino atölyesi | Gerçek donanım (Uno, ESP32) |
| 10 | Python atölyesi | Gerçek kod |
| 11 | Arduino II | Sürekli tekrarla (loop) |
| 12 | ESP32 akıllı ev | Gerçek akıllı ev |
| 13 | Python Turtle | Kaplumbağa grafikleri |
| 14 | Python oyun tasarımı | Oyun döngüsü |
| 15 | Python yapay zekâ | Veriden öğrenme |

Bölüm 1–3'te afi evin içinde dolaşır. Bölüm 4–10'da afi evin akıllı sistemine bağlanır: sensörlere göre lambaları, kapıları, alarmı ve pompayı yönetir; program birkaç senaryoda saniye saniye test edilir ve zaman çizelgesinde beklenen ile gerçekleşen yan yana görünür. Öğrenciler blokları dizdikçe programın Python, JavaScript ve Arduino (C++) hali yanında görünür. Her akıllı ev adımı **.ino** (Arduino Uno / ESP32) ve kendi testini yapan, ek kütüphane istemeyen **.py** dosyası olarak indirilebilir. Python bölümlerinde turtle ile çizim yapılır, tarayıcıda klavyeyle oynanan oyunlar tasarlanır ve verilerden öğrenen basit yapay zekâ modelleri yazılır; hepsi gerçek Python dosyası olarak indirilir. Öğrenciler 6 robottan birini seçer; başarı ve hatalarda sesli tepki verilir. Sensör kütüphanesi 15 gerçek sensörün Arduino Uno ve ESP32'ye nasıl bağlandığını anlatır.

Blockly (Apache 2.0) üzerine kuruludur. Kurulum gerektirmez; internetsiz kullanım için depoyu ZIP olarak indirip ayıklayın ve `index.html` dosyasına çift tıklayın.

## Sınıf sürümü

Sınıfta ağ varsa öğretmen bilgisayarında **afi-sunucu.exe** çalıştırılır; öğrenciler AFİ KOD'u bu sunucudan açar ya da kendi bilgisayarlarına kurulan **afi-istemci.exe** ile kullanır (ağ yokken de çalışır, sunucuyu kendisi bulur). Öğretmen panelinde öğrenciler canlı izlenir (adım, yıldız, şu anki bloklar), mesaj gönderilir, güncellemeler GitHub'dan tek tuşla alınır. Uygulama sınıfa bağlı olduğunu kendisi anlar (`js/sinif.js`); GitHub sayfasında ya da dosyadan açıldığında sınıf özellikleri kapalıdır. Ayrıntılar: [isikcirobot_offline](https://github.com/aydinincekara/isikcirobot_offline) ve kılavuzun 5.5 ve 7.5 bölümleri.
