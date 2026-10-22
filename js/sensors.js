/* afi kod - sensör kütüphanesi
 * Pin satırları: p = sensör üzerindeki yazı, r = rol (vcc / gnd / sig), uno / esp = karttaki yeri, why = neden
 * Kart durumu: ok = doğrudan bağlanır, warn = dikkat gerekir, no = uygun değil
 * Not: Modüllerin üzerindeki yazılar üreticiye göre biraz değişebilir (VCC / + / V, OUT / S / DO gibi).
 */
(function (root) {
  'use strict';
  function W(tr, en) { return { tr: tr, en: en }; }
  function S(st, tr, en) { return { st: st, note: W(tr, en) }; }

  var GND = W("Elektriğin geri döndüğü yol. Kartın GND'si ile sensörün GND'si birleşmezse devre tamamlanmaz ve sinyal okunamaz.",
              "The return path for electricity. If the board's GND and the sensor's GND are not connected, the circuit is not complete and the signal can't be read.");
  var VCC_ANY = W("Sensöre elektrik verir. Uno'da 5V'a, ESP32'de 3V3'e bağlanır; böylece sensörün sinyali ESP32'nin kaldırabileceği 3,3 voltu geçmez.",
                  "Powers the sensor. On the Uno it goes to 5V, on the ESP32 to 3V3, so the sensor's signal never goes above the 3.3 volts the ESP32 can handle.");
  var VCC_5 = W("Sensöre elektrik verir. Bu sensör en az 5 volt ister; ESP32 kartlarında USB'den gelen 5 volt VIN (bazı kartlarda 5V) pinindedir.",
                "Powers the sensor. This sensor needs at least 5 volts; on ESP32 boards the 5 volts from USB is on the VIN pin (5V on some boards).");

  var BOARDS = {
    uno: W('Arduino Uno', 'Arduino Uno'), esp32: W('ESP32', 'ESP32'), microbit: W('micro:bit', 'micro:bit'), rpi: W('Raspberry Pi', 'Raspberry Pi')
  };

  var BASICS = {
    title: W('Temel bilgiler', 'The basics'),
    items: [
      { h: W('Üç tür kablo: VCC, GND ve sinyal', 'Three kinds of wire: VCC, GND and signal'),
        t: W("Çoğu sensörde en az üç pin vardır. VCC (ya da +) sensöre elektrik verir. GND (ya da -) elektriğin geri döndüğü yoldur. Sinyal pini (OUT, S, DO, AO gibi) sensörün ölçtüğünü karta söyler. Genelde VCC için kırmızı, GND için siyah kablo kullanılır; böylece yanlış bağlantı kolay fark edilir.",
             "Most sensors have at least three pins. VCC (or +) powers the sensor. GND (or -) is the return path. The signal pin (OUT, S, DO, AO and so on) tells the board what the sensor measured. Red wires are usually used for VCC and black for GND, so wrong connections are easy to spot.") },
      { h: W('Dijital ve analog', 'Digital and analog'),
        t: W("Dijital sinyalin sadece iki değeri vardır: HIGH (1, açık) ve LOW (0, kapalı). Hareket var mı yok mu gibi evet/hayır sorularında kullanılır ve kodda digitalRead() ile okunur. Analog sinyal bir aralıkta değişir; ışık ne kadar parlak, toprak ne kadar ıslak gibi. analogRead() ile okunur: Arduino Uno 0 ile 1023 arasında, ESP32 0 ile 4095 arasında bir sayı verir.",
             "A digital signal has only two values: HIGH (1, on) and LOW (0, off). It answers yes/no questions such as 'is there motion?' and is read with digitalRead(). An analog signal changes over a range, such as how bright the light is or how wet the soil is. It is read with analogRead(): the Arduino Uno gives a number from 0 to 1023, the ESP32 from 0 to 4095.") },
      { h: W('5 volt mu, 3,3 volt mu?', '5 volts or 3.3 volts?'),
        t: W("Arduino Uno 5 voltla, ESP32, micro:bit ve Raspberry Pi 3,3 voltla çalışır. 3,3 voltluk bir karta 5 voltluk sinyal vermek pini bozabilir. Bu yüzden ESP32'de sensörü mümkünse 3,3 volttan besleriz; 5 volt isteyen sensörlerde de sinyali gerilim bölücüyle düşürürüz.",
             "The Arduino Uno works at 5 volts; the ESP32, micro:bit and Raspberry Pi work at 3.3 volts. Feeding a 5-volt signal into a 3.3-volt board can damage the pin. So on the ESP32 we power sensors from 3.3 volts when we can, and for sensors that need 5 volts we lower the signal with a voltage divider.") },
      { h: W('Gerilim bölücü', 'Voltage divider'),
        t: W("İki direncin arka arkaya bağlanmasıyla yapılan basit bir devredir ve voltajı düşürür. Örneğin 5 voltluk sinyal önce 1 kΩ, sonra 2 kΩ dirençten geçip GND'ye gider; iki direncin birleştiği noktadan yaklaşık 3,3 volt alınır ve ESP32'ye bu nokta bağlanır.",
             "A simple circuit made of two resistors in a row that lowers a voltage. For example, a 5-volt signal goes through a 1 kΩ resistor, then a 2 kΩ resistor to GND; the point between the two resistors is about 3.3 volts, and that point goes to the ESP32.") },
      { h: W('Pull-up direnci', 'Pull-up resistor'),
        t: W("Buton gibi bir şeye bağlı olmayan pin boşta kalınca rastgele 0 ve 1 okur. Pull-up direnci pini hafifçe HIGH'a çeker; butona basınca pin GND'ye bağlanır ve LOW okunur. Arduino ve ESP32'de bu direnç kartın içinde vardır, kodda pinMode(pin, INPUT_PULLUP) yazmak yeterlidir.",
             "A pin that is not connected to anything floats and reads random 0s and 1s. A pull-up resistor gently pulls the pin to HIGH; pressing a button connects the pin to GND and it reads LOW. Arduino and ESP32 have this resistor built in; writing pinMode(pin, INPUT_PULLUP) is enough.") },
      { h: W('I2C ve SPI', 'I2C and SPI'),
        t: W("Bazı sensörler tek bir sayı yerine çok bilgi gönderir. Bunlar karta konuşma kurallarıyla bağlanır. I2C sadece iki sinyal kablosu kullanır (SDA veri, SCL saat) ve aynı iki kabloya birden fazla sensör bağlanabilir. SPI daha hızlıdır ama dört kablo ister (MOSI, MISO, SCK, SS).",
             "Some sensors send a lot of information instead of a single number. They connect using a set of talking rules. I2C uses only two signal wires (SDA for data, SCL for the clock), and several sensors can share the same two wires. SPI is faster but needs four wires (MOSI, MISO, SCK, SS).") },
      { h: W('Seri Monitör', 'Serial Monitor'),
        t: W("Kartın bilgisayara yazdığı mesajları gösteren Arduino IDE penceresidir. Kodda Serial.begin(9600) ile başlatılır, Serial.println(değer) ile yazdırılır. Açmak için Arduino IDE'de sağ üstteki büyüteç simgesine tıklanır ve hızın kodla aynı (9600) olduğu kontrol edilir. Sensörün ne ölçtüğünü görmenin en kolay yoludur.",
             "The Arduino IDE window that shows the messages the board writes to the computer. It starts with Serial.begin(9600) in code and values are printed with Serial.println(value). To open it, click the magnifying glass at the top right of the Arduino IDE and check the speed matches the code (9600). It's the easiest way to see what a sensor measures.") },
      { h: W('Güvenlik kuralları', 'Safety rules'),
        t: W("Kablo takıp çıkarmadan önce kartın USB kablosunu çıkar. VCC ile GND'yi asla doğrudan birleştirme; buna kısa devre denir ve kartı ısıtıp bozabilir. Bir sensör ısınıyorsa ya da yanık kokusu geliyorsa hemen USB'yi çıkar ve bağlantıları kontrol et.",
             "Unplug the board's USB cable before adding or removing wires. Never connect VCC directly to GND; that's a short circuit and it can heat up and damage the board. If a sensor gets hot or smells burnt, unplug the USB right away and check the wiring.") }
    ]
  };

  var CATS = [
    { id: 'move', name: W('Hareket ve mesafe', 'Motion and distance') },
    { id: 'env', name: W('Işık, ses ve ortam', 'Light, sound and environment') },
    { id: 'input', name: W('Dokunma ve giriş', 'Touch and input') }
  ];

  var LIST = [
    /* ---------------- HAREKET VE MESAFE ---------------- */
    { id: 'pir', cat: 'move', chapter: 4, model: 'HC-SR501', out: 'digital',
      name: W('Hareket sensörü (PIR)', 'Motion sensor (PIR)'),
      short: W('Önünden geçen insan ya da hayvanı algılar.', 'Detects a person or animal moving in front of it.'),
      how: W("Canlılar vücut ısısı yüzünden kızılötesi ışık yayar. PIR sensörü, önündeki bu kızılötesi ışığın değişmesini algılar. Biri hareket edince değer değişir ve sensör 'hareket var' der. Kıpırdamadan duran birini algılamaz. Beyaz kubbe bir mercektir; görüş alanını genişletir.",
           "Living things give off infrared light because of their body heat. A PIR sensor notices when that infrared light in front of it changes. When someone moves, the value changes and the sensor says 'motion'. It can't detect someone standing completely still. The white dome is a lens that widens its view."),
      pins: [
        { p: 'VCC', r: 'vcc', uno: '5V', esp: 'VIN (5V)', why: W("Sensöre elektrik verir. HC-SR501 en az 4,5 volt ister; 3,3 volt yetmez.", 'Powers the sensor. The HC-SR501 needs at least 4.5 volts; 3.3 volts is not enough.') },
        { p: 'OUT', r: 'sig', uno: 'D2', esp: 'GPIO27', why: W("Hareket olduğunda 3,3 volt (HIGH), olmadığında 0 volt (LOW) verir. Çıkış 3,3 volt olduğu için ESP32'ye doğrudan bağlanabilir.", 'Gives 3.3 volts (HIGH) when there is motion and 0 volts (LOW) when there is not. Because the output is 3.3 volts, it can go straight to an ESP32.') },
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND }
      ],
      volt: W('Besleme 4,5–20 V (genelde 5 V). Sinyal çıkışı 3,3 V.', 'Supply 4.5–20 V (usually 5 V). Signal output 3.3 V.'),
      output: W('Dijital: hareket varsa HIGH, yoksa LOW.', 'Digital: HIGH when there is motion, LOW when there is not.'),
      react: W("Hareket görünce çıkış ayarlanan süre boyunca HIGH kalır, sonra LOW'a döner. Üzerindeki iki küçük vida (potansiyometre) algılama uzaklığını (yaklaşık 3–7 m) ve HIGH kalma süresini (birkaç saniyeden birkaç dakikaya) ayarlar. Elektrik verildikten sonra yaklaşık 1 dakika ısınması gerekir; bu sırada yanlış sinyaller verebilir.",
               "When it sees motion, the output stays HIGH for the set time, then goes back to LOW. Two small screws (potentiometers) set the range (about 3–7 m) and how long it stays HIGH (from a few seconds to a few minutes). After power is applied it needs about 1 minute to warm up and may give false signals meanwhile."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'),
                esp32: S('ok', "VCC'yi VIN'e (5V) bağla; çıkış 3,3 volt olduğu için güvenlidir.", 'Connect VCC to VIN (5V); the output is 3.3 volts, so it is safe.'),
                microbit: S('warn', 'micro:bit 5 volt veremez; sensörü ayrı bir 5 voltluk kaynaktan besle, GND\'leri birleştir.', 'The micro:bit cannot supply 5 volts; power the sensor from a separate 5-volt source and connect the GNDs together.'),
                rpi: S('ok', '5V pininden beslenir, çıkışı bir GPIO pinine doğrudan bağlanır.', 'Powered from the 5V pin; the output goes straight to a GPIO pin.') },
      types: [W('HC-SR501: ayarlanabilir, en yaygın model.', 'HC-SR501: adjustable, the most common model.'),
              W('AM312 mini PIR: küçük, 2,7–12 V ile çalışır, ayarı yoktur.', 'AM312 mini PIR: small, runs on 2.7–12 V, not adjustable.'),
              W('HC-SR505: küçük ve kısa menzilli.', 'HC-SR505: small with a short range.')],
      uses: [W('Merdiven ve koridorda otomatik yanan lambalar', 'Stair and hallway lights that turn on automatically'),
             W('Alarm sistemleri', 'Alarm systems'), W('Otomatik açılan kapılar', 'Automatic doors'), W('Kimse yokken klimayı kapatma', 'Turning off the air conditioner when nobody is there')],
      caution: W('Isı kaynağına (kalorifer, güneş gören pencere) bakan PIR yanlış alarm verebilir.', 'A PIR facing a heat source (a radiator or a sunny window) can give false alarms.'),
      code: {
        tr: "const int PIR_PIN = 2;   // ESP32'de 27\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(PIR_PIN) == HIGH) {\n    Serial.println(\"Hareket var!\");\n  } else {\n    Serial.println(\"Hareket yok\");\n  }\n  delay(500);\n}",
        en: "const int PIR_PIN = 2;   // 27 on ESP32\n\nvoid setup() {\n  pinMode(PIR_PIN, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(PIR_PIN) == HIGH) {\n    Serial.println(\"Motion!\");\n  } else {\n    Serial.println(\"No motion\");\n  }\n  delay(500);\n}" } },

    { id: 'hcsr04', cat: 'move', chapter: 5, model: 'HC-SR04', out: 'pulse',
      name: W('Ultrasonik mesafe sensörü', 'Ultrasonic distance sensor'),
      short: W('Önündeki bir cismin kaç santimetre uzakta olduğunu ölçer.', 'Measures how many centimeters away an object in front of it is.'),
      how: W("Yarasalar gibi çalışır. Bir 'göz' insan kulağının duyamayacağı kadar ince bir ses (ultrason) gönderir, ses cisme çarpıp geri döner, diğer 'göz' onu duyar. Sesin gidip gelme süresinden uzaklık hesaplanır: süre (mikrosaniye) / 58 = uzaklık (cm).",
           "It works like a bat. One 'eye' sends a sound too high for people to hear (ultrasound), the sound bounces off the object, and the other 'eye' hears it. The distance comes from the time the sound takes to go and return: time (microseconds) / 58 = distance (cm)."),
      pins: [
        { p: 'VCC', r: 'vcc', uno: '5V', esp: 'VIN (5V)', why: VCC_5 },
        { p: 'Trig', r: 'sig', uno: 'D9', esp: 'GPIO5', why: W('Kart bu pine kısa bir sinyal (10 mikrosaniye) gönderir; sensör de ses dalgasını yollar. "Ölçmeye başla" komutudur.', 'The board sends a short pulse (10 microseconds) to this pin and the sensor sends out its sound wave. It is the "start measuring" command.') },
        { p: 'Echo', r: 'sig', uno: 'D10', esp: 'GPIO18', div: true, why: W("Ses geri dönene kadar HIGH kalır. HIGH kalma süresi uzaklığı verir. Bu pin 5 volt çıkardığı için ESP32'ye gerilim bölücüyle (1 kΩ + 2 kΩ) bağlanmalıdır.", 'Stays HIGH until the sound comes back; how long it stays HIGH gives the distance. This pin outputs 5 volts, so on the ESP32 it must go through a voltage divider (1 kΩ + 2 kΩ).') },
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND }
      ],
      volt: W('5 V. Echo çıkışı 5 V seviyesindedir.', '5 V. The Echo output is at 5 V level.'),
      output: W('Darbe süresi: Echo pininin HIGH kaldığı süre. Kodda pulseIn() ile ölçülür ve santimetreye çevrilir.', 'Pulse length: how long the Echo pin stays HIGH. It is measured in code with pulseIn() and converted to centimeters.'),
      react: W("Yaklaşık 2 cm ile 4 m arasını ölçer. Dar bir koni (yaklaşık 15 derece) içinde görür. Yumuşak (kumaş, yastık) ya da eğik yüzeyler sesi başka yöne yansıttığı için yanlış ya da 0 değer verebilir. Saniyede birkaç ölçüm için ölçümler arasında en az 60 ms beklemek iyi olur.",
               "It measures from about 2 cm to 4 m and sees in a narrow cone (about 15 degrees). Soft (fabric, pillows) or slanted surfaces bounce the sound elsewhere, so it may give wrong or 0 values. Wait at least 60 ms between measurements."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'),
                esp32: S('warn', "Echo pini 5 volt verir: gerilim bölücü kullan ya da 3,3 volt ile çalışan HC-SR04P / RCWL-1601 modelini seç.", 'The Echo pin outputs 5 volts: use a voltage divider or pick the 3.3-volt HC-SR04P / RCWL-1601 model.'),
                microbit: S('warn', "3,3 volt modeli (HC-SR04P) kullan ya da Echo'yu gerilim bölücüyle bağla.", 'Use the 3.3-volt model (HC-SR04P) or connect Echo through a voltage divider.'),
                rpi: S('warn', "Echo'yu mutlaka gerilim bölücüyle bağla; 5 volt Raspberry Pi pinini bozabilir.", 'Always connect Echo through a voltage divider; 5 volts can damage a Raspberry Pi pin.') },
      types: [W('HC-SR04: en yaygın, 5 V.', 'HC-SR04: the most common, 5 V.'), W('HC-SR04P ve RCWL-1601: 3–5 V ile çalışır, ESP32 için daha kolay.', 'HC-SR04P and RCWL-1601: run on 3–5 V, easier for ESP32.'),
              W('JSN-SR04T: su geçirmez, araba park sensörlerine benzer.', 'JSN-SR04T: waterproof, similar to car parking sensors.')],
      uses: [W('Araba park sensörü (yaklaştıkça hızlanan bip sesi)', 'Car parking sensor (beeping faster as you get closer)'), W('Engelden kaçan robotlar', 'Robots that avoid obstacles'),
             W('Su deposunun doluluk seviyesi', 'Water tank level'), W('Dokunmadan açılan çöp kutusu', 'Touch-free trash can')],
      caution: W("ESP32 ve Raspberry Pi'de Echo pinini bölücüsüz bağlamak pini kalıcı olarak bozabilir.", 'On ESP32 and Raspberry Pi, connecting Echo without a divider can permanently damage the pin.'),
      code: {
        tr: "const int TRIG = 9;    // ESP32'de 5\nconst int ECHO = 10;   // ESP32'de 18 (bölücüyle)\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n\n  long sure = pulseIn(ECHO, HIGH, 30000);\n  float mesafe = sure / 58.0;\n  Serial.print(mesafe);\n  Serial.println(\" cm\");\n  delay(100);\n}",
        en: "const int TRIG = 9;    // 5 on ESP32\nconst int ECHO = 10;   // 18 on ESP32 (with divider)\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n\n  long duration = pulseIn(ECHO, HIGH, 30000);\n  float distance = duration / 58.0;\n  Serial.print(distance);\n  Serial.println(\" cm\");\n  delay(100);\n}" } },

    { id: 'ir', cat: 'move', chapter: 5, model: 'FC-51', out: 'digital',
      name: W('Kızılötesi engel sensörü', 'Infrared obstacle sensor'),
      short: W('Çok yakındaki (birkaç santimetre) bir engeli algılar.', 'Detects an obstacle very close by (a few centimeters).'),
      how: W("Bir ucu gözle görülmeyen kızılötesi ışık yakar, diğer ucu yansıyan ışığı ölçer. Önde bir cisim varsa ışık geri yansır ve sensör 'engel var' der. Televizyon kumandası da kızılötesi ışık kullanır.",
           "One side shines invisible infrared light and the other side measures the reflected light. If there's an object in front, the light bounces back and the sensor says 'obstacle'. TV remotes also use infrared light."),
      pins: [
        { p: 'VCC', r: 'vcc', uno: '5V', esp: '3V3', why: VCC_ANY },
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND },
        { p: 'OUT', r: 'sig', uno: 'D7', esp: 'GPIO26', why: W('Engel varsa LOW, yoksa HIGH verir. Yani tersine çalışır; buna "aktif düşük" denir.', 'Gives LOW when there is an obstacle and HIGH when there is not. It works backwards, which is called "active low".') }
      ],
      volt: W('3,3–5 V.', '3.3–5 V.'),
      output: W('Dijital: engel varsa LOW, yoksa HIGH.', 'Digital: LOW when there is an obstacle, HIGH when there is not.'),
      react: W("Üzerindeki vida ile algılama uzaklığı yaklaşık 2–30 cm arasında ayarlanır. Engel görünce modülün üstündeki küçük LED yanar; bağlantıyı kontrol etmek için çok kullanışlıdır. Siyah yüzeyler ışığı az yansıttığı için geç algılanır; güneş ışığı ölçümü bozabilir.",
               "A screw on the module sets the range between about 2 and 30 cm. When it sees an obstacle, a small LED on the module turns on, which is handy for checking the wiring. Black surfaces reflect little light, so they are detected late; sunlight can disturb it."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', "3V3'ten beslenince doğrudan bağlanır.", 'Connects directly when powered from 3V3.'),
                microbit: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), rpi: S('ok', "3,3 V'tan beslenince doğrudan bağlanır.", 'Connects directly when powered from 3.3 V.') },
      types: [W('FC-51: engel algılama.', 'FC-51: obstacle detection.'), W('TCRT5000: siyah çizgi izleyen robotlar için.', 'TCRT5000: for line-following robots.'),
              W('Kızılötesi alıcı (VS1838B): kumanda sinyallerini okur.', 'Infrared receiver (VS1838B): reads remote control signals.')],
      uses: [W('Robotun duvara çarpmasını önlemek', 'Keeping a robot from hitting walls'), W('Otomatik musluk ve el kurutma makinesi', 'Automatic taps and hand dryers'),
             W('Çizgi izleyen robot', 'Line-following robot'), W('Ürün sayan bantlar', 'Conveyor belts that count items')],
      caution: W('Kızılötesi ışığı görmezsin ama telefon kamerasıyla bakınca mor bir parıltı olarak görebilirsin.', "You can't see infrared light, but through a phone camera it shows up as a purple glow."),
      code: {
        tr: "const int ENGEL = 7;   // ESP32'de 26\n\nvoid setup() {\n  pinMode(ENGEL, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(ENGEL) == LOW) {\n    Serial.println(\"Engel var!\");\n  } else {\n    Serial.println(\"Yol açık\");\n  }\n  delay(200);\n}",
        en: "const int OBSTACLE = 7;   // 26 on ESP32\n\nvoid setup() {\n  pinMode(OBSTACLE, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(OBSTACLE) == LOW) {\n    Serial.println(\"Obstacle!\");\n  } else {\n    Serial.println(\"Path clear\");\n  }\n  delay(200);\n}" } },

    { id: 'mpu6050', cat: 'move', chapter: 8, model: 'MPU-6050 (GY-521)', out: 'i2c', level: 'adv',
      name: W('İvme ve dönme sensörü', 'Accelerometer and gyroscope'),
      short: W('Eğildiğini, sarsıldığını, düştüğünü ve döndüğünü algılar.', 'Detects tilting, shaking, falling and turning.'),
      how: W("İçinde çok küçük mekanik parçalar vardır. İvmeölçer (accelerometer) yerçekimini ve sarsıntıyı üç yönde (x, y, z) ölçer; böylece hangi yöne eğildiğini anlar. Jiroskop dönme hızını ölçer. Telefonun ekranı yan çevirince dönmesi bu sensör sayesindedir.",
           "It contains tiny mechanical parts. The accelerometer measures gravity and shaking in three directions (x, y, z), so it knows which way it's tilted. The gyroscope measures how fast it turns. Your phone screen rotates when you turn it sideways thanks to this kind of sensor."),
      pins: [
        { p: 'VCC', r: 'vcc', uno: '5V', esp: '3V3', why: W('Sensöre elektrik verir. GY-521 modülünün üzerinde voltaj düzenleyici olduğu için 3,3 ya da 5 voltla çalışır.', 'Powers the sensor. The GY-521 module has a voltage regulator on board, so it works on 3.3 or 5 volts.') },
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND },
        { p: 'SCL', r: 'sig', uno: 'A5', esp: 'GPIO22', why: W("I2C saat hattı. Kart ve sensör bu hattaki 'tik tak' ile aynı anda konuşur.", "The I2C clock line. The board and sensor talk in step with the 'tick' on this line.") },
        { p: 'SDA', r: 'sig', uno: 'A4', esp: 'GPIO21', why: W('I2C veri hattı. Ölçülen sayılar bu kablodan gelir.', 'The I2C data line. The measured numbers come over this wire.') }
      ],
      volt: W('Modül 3,3–5 V (çipin kendisi 3,3 V).', 'Module 3.3–5 V (the chip itself is 3.3 V).'),
      output: W('I2C: x, y, z ivme ve dönme değerleri. Adresi 0x68.', 'I2C: x, y, z acceleration and rotation values. Address 0x68.'),
      react: W("Masada düz dururken z yönünde yaklaşık 9,8 m/s² (yerçekimi) gösterir. Eğildikçe bu değer x ve y yönlerine kayar. Sarsınca değerler hızla değişir. Saniyede yüzlerce ölçüm yapabilir.",
               "Lying flat on a table it shows about 9.8 m/s² (gravity) in the z direction. As it tilts, that value moves into x and y. When shaken, values change quickly. It can measure hundreds of times per second."),
      boards: { uno: S('ok', 'Doğrudan bağlanır (SDA=A4, SCL=A5).', 'Connects directly (SDA=A4, SCL=A5).'), esp32: S('ok', 'Doğrudan bağlanır (SDA=21, SCL=22).', 'Connects directly (SDA=21, SCL=22).'),
                microbit: S('ok', "I2C pinlerine (P20 SDA, P19 SCL) bağlanır. micro:bit'in kendi ivmeölçeri de vardır.", 'Connects to the I2C pins (P20 SDA, P19 SCL). The micro:bit also has its own accelerometer.'),
                rpi: S('ok', 'I2C pinlerine (GPIO2 SDA, GPIO3 SCL) bağlanır.', 'Connects to the I2C pins (GPIO2 SDA, GPIO3 SCL).') },
      types: [W('MPU-6050: ivme + dönme, en yaygın.', 'MPU-6050: acceleration + rotation, the most common.'), W('ADXL345: sadece ivme.', 'ADXL345: acceleration only.'),
              W('MPU-9250 / BNO055: pusula da içerir.', 'MPU-9250 / BNO055: also include a compass.')],
      uses: [W('Telefon ekranının dönmesi', 'Rotating phone screens'), W('Düşme algılayan akıllı saatler', 'Smart watches that detect falls'),
             W('Dengede duran robotlar ve dronlar', 'Self-balancing robots and drones'), W('Hareketle oynanan oyun kumandaları', 'Motion game controllers')],
      lib: W('Arduino IDE > Kütüphane Yöneticisi: "Adafruit MPU6050" (Adafruit Unified Sensor ile birlikte yüklenir).', 'Arduino IDE > Library Manager: "Adafruit MPU6050" (installs together with Adafruit Unified Sensor).'),
      caution: W('İleri seviye bir sensördür; önce Seri Monitör\'de sayıların nasıl değiştiğini gözlemle.', 'This is an advanced sensor; first watch how the numbers change in the Serial Monitor.'),
      code: {
        tr: "#include <Adafruit_MPU6050.h>\n#include <Adafruit_Sensor.h>\n#include <Wire.h>\n\nAdafruit_MPU6050 mpu;\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!mpu.begin()) {\n    Serial.println(\"MPU6050 bulunamadi\");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  sensors_event_t ivme, donme, sicaklik;\n  mpu.getEvent(&ivme, &donme, &sicaklik);\n  Serial.print(\"x: \"); Serial.print(ivme.acceleration.x);\n  Serial.print(\"  y: \"); Serial.print(ivme.acceleration.y);\n  Serial.print(\"  z: \"); Serial.println(ivme.acceleration.z);\n  delay(200);\n}",
        en: "#include <Adafruit_MPU6050.h>\n#include <Adafruit_Sensor.h>\n#include <Wire.h>\n\nAdafruit_MPU6050 mpu;\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!mpu.begin()) {\n    Serial.println(\"MPU6050 not found\");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  sensors_event_t accel, gyro, temp;\n  mpu.getEvent(&accel, &gyro, &temp);\n  Serial.print(\"x: \"); Serial.print(accel.acceleration.x);\n  Serial.print(\"  y: \"); Serial.print(accel.acceleration.y);\n  Serial.print(\"  z: \"); Serial.println(accel.acceleration.z);\n  delay(200);\n}" } },

    /* ---------------- IŞIK, SES VE ORTAM ---------------- */
    { id: 'ldr', cat: 'env', chapter: 6, model: 'LDR + LM393', out: 'analog',
      name: W('Işık sensörü (LDR)', 'Light sensor (LDR)'),
      short: W('Ortamın ne kadar aydınlık ya da karanlık olduğunu ölçer.', 'Measures how bright or dark it is.'),
      how: W("LDR, ışık arttıkça direnci azalan küçük bir parçadır (fotodirenç). Karanlıkta elektriği zor geçirir, aydınlıkta kolay geçirir. Modül bu değişimi bir voltaja çevirir; kart da bu voltajı bir sayı olarak okur.",
           "An LDR is a small part whose resistance drops as light increases (a photoresistor). In the dark it lets little electricity through; in the light, a lot. The module turns this change into a voltage, and the board reads that voltage as a number."),
      pins: [
        { p: 'VCC', r: 'vcc', uno: '5V', esp: '3V3', why: VCC_ANY },
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND },
        { p: 'DO', r: 'sig', uno: 'D3', esp: 'GPIO25', why: W('Dijital çıkış: ışık, vidayla ayarlanan eşiği geçince değişir. "Karanlık mı?" sorusuna evet/hayır cevabı verir.', 'Digital output: it changes when the light crosses the threshold set with the screw. It answers "is it dark?" with yes/no.') },
        { p: 'AO', r: 'sig', uno: 'A0', esp: 'GPIO34', why: W("Analog çıkış: ışığın miktarını bir sayı olarak verir. ESP32'de Wi-Fi açıkken çalışan ADC1 pinlerinden (32–39) biri seçilir.", 'Analog output: gives the amount of light as a number. On the ESP32 we pick an ADC1 pin (32–39), which still works while Wi-Fi is on.') }
      ],
      volt: W('3,3–5 V.', '3.3–5 V.'),
      output: W('Analog: Uno 0–1023, ESP32 0–4095. Dijital: eşiğe göre HIGH / LOW.', 'Analog: Uno 0–1023, ESP32 0–4095. Digital: HIGH / LOW depending on the threshold.'),
      react: W("Değer ışıkla hemen değişir. Bazı modüllerde ışık arttıkça değer düşer, bazılarında artar; önce Seri Monitör'de sensörü elinle kapatıp açarak hangisi olduğunu dene. DO kullanıyorsan modülün üstündeki LED eşiği geçince yanar.",
               "The value changes with light right away. On some modules the value drops as light increases, on others it rises; first cover and uncover the sensor with your hand while watching the Serial Monitor to see which. If you use DO, the LED on the module lights up when the threshold is crossed."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', "3V3'ten besle, AO'yu ADC1 pinine bağla.", 'Power from 3V3 and connect AO to an ADC1 pin.'),
                microbit: S('ok', 'AO, P0, P1 ya da P2 pinine bağlanır.', 'AO goes to pin P0, P1 or P2.'),
                rpi: S('warn', 'Raspberry Pi analog okuyamaz: sadece DO kullan ya da ADS1115 / MCP3008 gibi bir çevirici ekle.', "A Raspberry Pi can't read analog: use only DO or add a converter such as an ADS1115 / MCP3008.") },
      types: [W('Tek başına LDR: 10 kΩ dirençle gerilim bölücü yapılarak A0\'a bağlanır.', 'Bare LDR: connected to A0 by making a voltage divider with a 10 kΩ resistor.'),
              W('LM393 modülü (4 pin): hem analog hem dijital çıkış verir.', 'LM393 module (4 pins): gives both analog and digital output.'),
              W('BH1750: ışığı gerçek birimle (lüks) ölçen I2C sensör.', 'BH1750: an I2C sensor that measures light in real units (lux).')],
      uses: [W('Akşam olunca kendiliğinden yanan sokak ve bahçe lambaları', 'Street and garden lights that turn on by themselves in the evening'),
             W('Telefon ekranının parlaklık ayarı', 'Automatic phone screen brightness'), W('Güneşi takip eden güneş panelleri', 'Solar panels that follow the sun')],
      caution: W('Sensörü lambanın hemen yanına koyarsan lamba yanınca sensör "aydınlık" sanıp lambayı kapatabilir.', 'If you put the sensor right next to the lamp, the lamp turning on can make it think it is bright and turn the lamp off again.'),
      code: {
        tr: "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int isik = analogRead(A0);   // ESP32'de analogRead(34)\n  Serial.print(\"Isik degeri: \");\n  Serial.println(isik);\n  delay(300);\n}",
        en: "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int light = analogRead(A0);   // analogRead(34) on ESP32\n  Serial.print(\"Light value: \");\n  Serial.println(light);\n  delay(300);\n}" } },

    { id: 'sound', cat: 'env', chapter: 7, model: 'KY-038', out: 'analog',
      name: W('Ses sensörü', 'Sound sensor'),
      short: W('Ortamdaki sesin yüksekliğini algılar; alkışı ya da gürültüyü fark eder.', 'Senses how loud it is; notices a clap or noise.'),
      how: W("Üzerinde küçük bir mikrofon vardır. Ses havada titreşimdir; mikrofon bu titreşimi çok küçük bir elektrik sinyaline çevirir. Modül sinyali büyütür ve eşiği geçince dijital çıkışı değiştirir.",
           "It has a small microphone. Sound is vibration in the air; the microphone turns that vibration into a tiny electrical signal. The module amplifies it and changes its digital output when the threshold is crossed."),
      pins: [
        { p: 'AO', r: 'sig', uno: 'A1', esp: 'GPIO36 (VP)', why: W('Analog çıkış: sesin anlık değeri. Ses yükseldikçe değerler daha çok dalgalanır.', 'Analog output: the moment-to-moment sound value. The louder it gets, the more the values swing.') },
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND },
        { p: 'VCC', r: 'vcc', uno: '5V', esp: '3V3', why: VCC_ANY },
        { p: 'DO', r: 'sig', uno: 'D8', esp: 'GPIO14', why: W('Dijital çıkış: ses, mavi kutudaki vidayla ayarlanan eşiği geçince değişir. Alkış algılamak için en kolay yol budur.', 'Digital output: changes when the sound crosses the threshold set with the screw on the blue box. The easiest way to detect a clap.') }
      ],
      volt: W('3,3–5 V.', '3.3–5 V.'),
      output: W('Analog: anlık ses değeri. Dijital: eşiğe göre HIGH / LOW.', 'Analog: momentary sound value. Digital: HIGH / LOW depending on the threshold.'),
      react: W("Konuşmayı kaydetmek için değil, 'ses var mı, ne kadar yüksek?' sorusu içindir. Vidayı çevirerek eşiği ayarla: sessizken modülün LED'i sönük, alkışlayınca yanacak şekilde. Modüle göre DO sesle HIGH ya da LOW olabilir; Seri Monitör'de dene.",
               "It's for 'is there sound, how loud?' rather than recording speech. Turn the screw to set the threshold so the module's LED is off in silence and lights up when you clap. Depending on the module, DO may go HIGH or LOW with sound; test it in the Serial Monitor."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', "3V3'ten besle; AO'yu ADC1 pinine bağla.", 'Power from 3V3; connect AO to an ADC1 pin.'),
                microbit: S('ok', "Bağlanabilir; micro:bit V2'nin kendi mikrofonu da vardır.", 'Can be connected; the micro:bit V2 also has its own microphone.'),
                rpi: S('warn', 'Sadece DO kullanılabilir; analog için çevirici gerekir.', 'Only DO can be used; analog needs a converter.') },
      types: [W('KY-038: büyük mikrofonlu, genel amaçlı.', 'KY-038: big microphone, general purpose.'), W('KY-037: daha hassas.', 'KY-037: more sensitive.'),
              W('MAX9814 / INMP441: gerçek ses kaydı için mikrofon modülleri.', 'MAX9814 / INMP441: microphone modules for real audio recording.')],
      uses: [W('Alkışla yanan lamba', 'A lamp that turns on with a clap'), W('Sınıf gürültü ölçer', 'Classroom noise meter'), W('Bebek ağlamasını haber veren cihaz', 'A device that alerts you when a baby cries')],
      caution: W('Değerler çok hızlı değişir; alkışı yakalamak için delay() süresini kısa tut.', 'Values change very fast; keep the delay() short to catch a clap.'),
      code: {
        tr: "const int SES_DO = 8;   // ESP32'de 14\n\nvoid setup() {\n  pinMode(SES_DO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int dijital = digitalRead(SES_DO);\n  int analog = analogRead(A1);   // ESP32'de analogRead(36)\n  Serial.print(dijital);\n  Serial.print(\"  \");\n  Serial.println(analog);\n  delay(20);\n}",
        en: "const int SOUND_DO = 8;   // 14 on ESP32\n\nvoid setup() {\n  pinMode(SOUND_DO, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int digital = digitalRead(SOUND_DO);\n  int analog = analogRead(A1);   // analogRead(36) on ESP32\n  Serial.print(digital);\n  Serial.print(\"  \");\n  Serial.println(analog);\n  delay(20);\n}" } },

    { id: 'dht11', cat: 'env', chapter: 6, model: 'DHT11', out: 'onewire',
      name: W('Sıcaklık ve nem sensörü', 'Temperature and humidity sensor'),
      short: W('Havanın sıcaklığını (°C) ve nemini (%) ölçer.', 'Measures air temperature (°C) and humidity (%).'),
      how: W("İçinde iki ölçer vardır: nemle direnci değişen bir parça ve sıcaklıkla direnci değişen bir parça (termistör). İçindeki küçük çip bu değerleri ölçüp karta tek bir kablo üzerinden sırayla 0 ve 1'lerle gönderir.",
           "It has two measuring parts inside: one whose resistance changes with humidity and one whose resistance changes with temperature (a thermistor). A tiny chip inside measures them and sends them to the board as a row of 0s and 1s over a single wire."),
      pins: [
        { p: 'VCC (+)', r: 'vcc', uno: '5V', esp: '3V3', why: VCC_ANY },
        { p: 'DATA (S)', r: 'sig', uno: 'D4', esp: 'GPIO4', why: W("Ölçümler bu tek kablodan gelir. Bu hattın 10 kΩ'luk bir pull-up direnciyle VCC'ye bağlı olması gerekir; 3 pinli modüllerin üzerinde bu direnç zaten vardır.", 'The readings come over this single wire. The line needs a 10 kΩ pull-up resistor to VCC; 3-pin modules already have it on board.') },
        { p: 'GND (-)', r: 'gnd', uno: 'GND', esp: 'GND', why: GND }
      ],
      volt: W('3,3–5,5 V.', '3.3–5.5 V.'),
      output: W('Tek hat dijital veri: sıcaklık (°C) ve bağıl nem (%). Kütüphane bu veriyi sayıya çevirir.', 'Single-wire digital data: temperature (°C) and relative humidity (%). A library turns the data into numbers.'),
      react: W("DHT11 0–50 °C arasını ±2 °C, nemi %20–90 arasında ±%5 doğrulukla ölçer. Saniyede en fazla bir kez okunabilir; daha sık okursan hata verir. Kablo sorunu olduğunda sayı yerine 'nan' (sayı değil) döner.",
               "The DHT11 measures 0–50 °C to within ±2 °C and humidity from 20–90% to within ±5%. It can be read at most once per second; reading faster gives errors. If there's a wiring problem it returns 'nan' (not a number) instead of a value."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', "3V3'ten beslenince doğrudan bağlanır.", 'Connects directly when powered from 3V3.'),
                microbit: S('warn', 'MakeCode eklentisiyle kullanılır; zamanlamaya duyarlı olduğu için bazen okuma kaçırır.', 'Used through a MakeCode extension; it is timing-sensitive and sometimes misses readings.'),
                rpi: S('ok', 'Python kütüphanesiyle (adafruit-circuitpython-dht) okunur.', 'Read with a Python library (adafruit-circuitpython-dht).') },
      types: [W('DHT11 (mavi): ucuz, sınıf için yeterli.', 'DHT11 (blue): cheap, fine for class.'), W('DHT22 / AM2302 (beyaz): -40–80 °C, daha doğru, 2 saniyede bir okunur.', 'DHT22 / AM2302 (white): -40–80 °C, more accurate, read every 2 seconds.'),
              W('DS18B20: sadece sıcaklık, su geçirmez çubuk modeli vardır.', 'DS18B20: temperature only; comes in a waterproof probe version.')],
      uses: [W('Akıllı termostat ve klima', 'Smart thermostats and air conditioners'), W('Sera ve kümes takibi', 'Greenhouse and coop monitoring'), W('Hava durumu istasyonu', 'Weather station')],
      lib: W('Arduino IDE > Kütüphane Yöneticisi: "DHT sensor library" (Adafruit). Yanında "Adafruit Unified Sensor" da istenirse onu da yükle.', 'Arduino IDE > Library Manager: "DHT sensor library" (Adafruit). If it asks for "Adafruit Unified Sensor", install that too.'),
      caution: W('Sensörü elinle tutarsan vücut ısın ölçümü değiştirir.', 'Holding the sensor in your hand changes the reading because of your body heat.'),
      code: {
        tr: "#include <DHT.h>\n\nDHT dht(4, DHT11);   // pin 4, model DHT11\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n}\n\nvoid loop() {\n  float sicaklik = dht.readTemperature();\n  float nem = dht.readHumidity();\n  Serial.print(\"Sicaklik: \");\n  Serial.print(sicaklik);\n  Serial.print(\" C   Nem: %\");\n  Serial.println(nem);\n  delay(2000);\n}",
        en: "#include <DHT.h>\n\nDHT dht(4, DHT11);   // pin 4, model DHT11\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n}\n\nvoid loop() {\n  float temperature = dht.readTemperature();\n  float humidity = dht.readHumidity();\n  Serial.print(\"Temperature: \");\n  Serial.print(temperature);\n  Serial.print(\" C   Humidity: %\");\n  Serial.println(humidity);\n  delay(2000);\n}" } },

    { id: 'soil', cat: 'env', chapter: 6, model: 'Kapasitif v1.2', out: 'analog',
      name: W('Toprak nem sensörü', 'Soil moisture sensor'),
      short: W('Saksıdaki toprağın ne kadar ıslak ya da kuru olduğunu ölçer.', 'Measures how wet or dry the soil in a pot is.'),
      how: W("Kapasitif model toprağa batırılan bir çubuktur. Su, çubuğun elektrik alanını değiştirir; sensör bu değişimi ölçüp voltaja çevirir. Metal kısmı toprağa değmediği için paslanmaz.",
           "The capacitive model is a stick pushed into the soil. Water changes the stick's electric field; the sensor measures that change and turns it into a voltage. Its metal is covered, so it doesn't rust."),
      pins: [
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND },
        { p: 'VCC', r: 'vcc', uno: '5V', esp: '3V3', why: VCC_ANY },
        { p: 'AOUT', r: 'sig', uno: 'A0', esp: 'GPIO35', why: W('Analog çıkış: toprak ıslandıkça değer düşer, kurudukça artar.', 'Analog output: the value drops as the soil gets wetter and rises as it dries.') }
      ],
      volt: W('3,3–5,5 V.', '3.3–5.5 V.'),
      output: W('Analog: kuruda yüksek, ıslakta düşük sayı.', 'Analog: a high number when dry, low when wet.'),
      react: W("Her sensörün sayıları biraz farklıdır, bu yüzden önce kalibrasyon (ayarlama) yapılır: sensör havadayken (kuru) ve bir bardak suyun içindeyken (ıslak) değerleri not al. Sonra kodda 'bu iki değerin ortasından yüksekse sula' gibi bir eşik kullan.",
               "Every sensor's numbers are a bit different, so you calibrate first: note the value in the air (dry) and in a glass of water (wet). Then use a threshold in code such as 'if it's above the middle of those two values, water the plant'."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', "3V3'ten besle; AOUT'u ADC1 pinine bağla.", 'Power from 3V3; connect AOUT to an ADC1 pin.'),
                microbit: S('ok', 'P0, P1 ya da P2 pinine bağlanır.', 'Goes to pin P0, P1 or P2.'), rpi: S('warn', 'Analog çıkış için ADS1115 / MCP3008 gibi çevirici gerekir.', 'The analog output needs a converter such as an ADS1115 / MCP3008.') },
      types: [W('Kapasitif (siyah çubuk): paslanmaz, uzun ömürlü. Önerilen.', 'Capacitive (black stick): doesn\'t rust, lasts long. Recommended.'),
              W('Dirençli (FC-28 / YL-69, iki metal çatal): ucuz ama birkaç haftada paslanır.', 'Resistive (FC-28 / YL-69, two metal prongs): cheap but corrodes within weeks.')],
      uses: [W('Otomatik bitki sulama', 'Automatic plant watering'), W('Akıllı tarım ve sera', 'Smart farming and greenhouses'), W('"Beni sula" diyen saksı', 'A pot that says "water me"')],
      caution: W('Çubuğun üstündeki elektronik kısmı ıslatma; sadece çizgiye kadar toprağa batır.', 'Do not get the electronics at the top wet; only push it into the soil up to the line.'),
      code: {
        tr: "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int nem = analogRead(A0);   // ESP32'de analogRead(35)\n  Serial.print(\"Toprak: \");\n  Serial.println(nem);\n  delay(1000);\n}",
        en: "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int moisture = analogRead(A0);   // analogRead(35) on ESP32\n  Serial.print(\"Soil: \");\n  Serial.println(moisture);\n  delay(1000);\n}" } },

    { id: 'rain', cat: 'env', chapter: 6, model: 'FC-37 / YL-83', out: 'analog',
      name: W('Yağmur sensörü', 'Rain sensor'),
      short: W('Yağmur yağıp yağmadığını, ne kadar ıslandığını algılar.', 'Detects whether it is raining and how wet it is.'),
      how: W("Üzerinde iç içe geçmiş iletken çizgiler olan bir plakadır. Kuruyken çizgiler arasından elektrik geçmez; su damlası çizgileri birleştirince elektrik geçer. Ayrı bir kontrol kartı (LM393) bunu dijital ve analog sinyale çevirir.",
           "It's a plate with interlocking conductive lines. When dry, no electricity flows between the lines; a drop of water bridges them and electricity flows. A separate control board (LM393) turns this into digital and analog signals."),
      pins: [
        { p: 'VCC', r: 'vcc', uno: '5V', esp: '3V3', why: VCC_ANY },
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND },
        { p: 'DO', r: 'sig', uno: 'D12', esp: 'GPIO16', why: W('Dijital çıkış: ıslaklık eşiği geçince değişir (çoğu modülde LOW olur).', 'Digital output: changes when wetness crosses the threshold (on most modules it goes LOW).') },
        { p: 'AO', r: 'sig', uno: 'A3', esp: 'GPIO39 (VN)', why: W('Analog çıkış: ne kadar ıslak olduğunu sayıyla verir; ıslandıkça genelde düşer.', 'Analog output: how wet it is as a number; it usually drops as it gets wetter.') }
      ],
      volt: W('3,3–5 V.', '3.3–5 V.'),
      output: W('Analog: ıslaklık miktarı. Dijital: eşiğe göre HIGH / LOW.', 'Analog: amount of wetness. Digital: HIGH / LOW depending on the threshold.'),
      react: W("Tek bir damla bile değeri hemen değiştirir. Plaka kuruyana kadar değer eski haline dönmez. Kontrol kartı plakadan ayrıdır; iki kablo plakaya, dört pin karta gider.",
               "Even a single drop changes the value right away. The value doesn't return to normal until the plate dries. The control board is separate from the plate: two wires go to the plate, four pins go to the board."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', "3V3'ten besle; AO'yu ADC1 pinine bağla.", 'Power from 3V3; connect AO to an ADC1 pin.'),
                microbit: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), rpi: S('warn', 'Sadece DO kullanılabilir; analog için çevirici gerekir.', 'Only DO can be used; analog needs a converter.') },
      types: [W('FC-37 / YL-83: plaka + kontrol kartı.', 'FC-37 / YL-83: plate + control board.'), W('Su seviye sensörü: bardak ya da depodaki su yüksekliğini ölçer.', 'Water level sensor: measures the water height in a cup or tank.')],
      uses: [W('Yağmur başlayınca kapanan pencere ya da tente', 'A window or awning that closes when rain starts'), W('Yağmurda sulamayı durduran bahçe sistemi', 'A garden system that stops watering when it rains'),
             W('Arabalardaki otomatik silecek', 'Automatic windshield wipers in cars')],
      caution: W("Sürekli elektrik verirsen plaka zamanla paslanır. Ölçmeden hemen önce VCC'yi bir dijital pinden açıp ölçünce kapatmak ömrünü uzatır.", 'If it is powered all the time, the plate slowly corrodes. Powering VCC from a digital pin only while measuring makes it last longer.'),
      code: {
        tr: "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int yagmur = analogRead(A3);   // ESP32'de analogRead(39)\n  Serial.print(\"Islaklik: \");\n  Serial.println(yagmur);\n  delay(500);\n}",
        en: "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int rain = analogRead(A3);   // analogRead(39) on ESP32\n  Serial.print(\"Wetness: \");\n  Serial.println(rain);\n  delay(500);\n}" } },

    { id: 'mq2', cat: 'env', chapter: 3, model: 'MQ-2', out: 'analog', level: 'adv',
      name: W('Gaz ve duman sensörü', 'Gas and smoke sensor'),
      short: W('Havadaki duman ve yanıcı gazları (LPG, metan, propan) algılar.', 'Detects smoke and flammable gases (LPG, methane, propane) in the air.'),
      how: W("İçinde ısıtılan küçük bir parça (kalay dioksit) vardır. Temiz havada elektriği az geçirir; yanıcı gaz ya da duman gelince daha çok geçirir. Bu yüzden sensörün çalışması için ısınması gerekir ve kullanırken eline sıcak gelir.",
           "It has a small heated part inside (tin dioxide). In clean air it conducts little electricity; with flammable gas or smoke it conducts more. That's why it has to heat up to work, and it feels warm when in use."),
      pins: [
        { p: 'VCC', r: 'vcc', uno: '5V', esp: 'VIN (5V)', why: W('Sensöre ve içindeki ısıtıcıya elektrik verir. Isıtıcı 5 volt ve yaklaşık 150 mA ister; 3,3 volt yetmez.', 'Powers the sensor and its heater. The heater needs 5 volts and about 150 mA; 3.3 volts is not enough.') },
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND },
        { p: 'DO', r: 'sig', uno: 'D6', esp: 'GPIO33', div: true, why: W("Dijital çıkış: gaz eşiği geçince değişir. Modül 5 volttan beslendiği için bu çıkış 5 volt olabilir; ESP32'ye gerilim bölücüyle bağla.", 'Digital output: changes when gas crosses the threshold. Because the module is powered from 5 volts, this output can be 5 volts; connect it to the ESP32 through a voltage divider.') },
        { p: 'AO', r: 'sig', uno: 'A2', esp: 'GPIO32', div: true, why: W("Analog çıkış: gaz arttıkça değer yükselir. 5 volta kadar çıkabildiği için ESP32'ye gerilim bölücüyle bağlanır.", 'Analog output: the value rises as gas increases. It can reach 5 volts, so on the ESP32 it goes through a voltage divider.') }
      ],
      volt: W('5 V (ısıtıcı için şart). Yaklaşık 150 mA çeker.', '5 V (required for the heater). Draws about 150 mA.'),
      output: W('Analog: gaz arttıkça yükselen sayı. Dijital: eşiğe göre HIGH / LOW.', 'Analog: a number that rises with gas. Digital: HIGH / LOW depending on the threshold.'),
      react: W("Her açılışta birkaç dakika ısınması gerekir; bu sırada değerler yüksek ve kararsızdır. İlk kez kullanılırken üreticiler 24 saat boyunca açık bırakmayı önerir. Bir çakmağın gazını (yakmadan) yaklaştırınca değer hızla yükselir.",
               "It needs a few minutes to warm up every time it is switched on; values are high and unstable meanwhile. Makers recommend leaving it on for 24 hours the first time. Bringing a lighter's gas close (without lighting it) makes the value rise quickly."),
      boards: { uno: S('ok', "Doğrudan bağlanır; USB'den gelen akım yeterlidir.", 'Connects directly; USB current is enough.'),
                esp32: S('warn', "VIN'den (5V) besle; AO ve DO'yu gerilim bölücüyle bağla.", 'Power from VIN (5V); connect AO and DO through voltage dividers.'),
                microbit: S('no', 'micro:bit ısıtıcıya gereken 5 voltu ve akımı veremez.', "The micro:bit can't provide the 5 volts and current the heater needs."),
                rpi: S('warn', '5V pininden beslenir; DO bölücüyle, AO çeviriciyle okunur.', 'Powered from the 5V pin; DO through a divider, AO through a converter.') },
      types: [W('MQ-2: duman, LPG, propan, metan.', 'MQ-2: smoke, LPG, propane, methane.'), W('MQ-7: karbonmonoksit.', 'MQ-7: carbon monoxide.'),
              W('MQ-135: hava kalitesi (CO₂, amonyak).', 'MQ-135: air quality (CO₂, ammonia).'), W('MQ-3: alkol.', 'MQ-3: alcohol.')],
      uses: [W('Mutfakta gaz kaçağı uyarısı', 'Kitchen gas leak warning'), W('Duman dedektörü projesi', 'Smoke detector project'), W('Hava kalitesi ölçen sınıf istasyonu', 'Classroom air quality station')],
      caution: W('Isınır, dokunurken dikkat et. Eğitim projesi içindir; evdeki gerçek gaz ve duman dedektörünün yerini tutmaz. Yakılmış çakmak ya da ateşle deneme yapma.', 'It gets hot, be careful touching it. It is for learning projects and does not replace a real home gas or smoke detector. Never test it with a lit lighter or flame.'),
      code: {
        tr: "void setup() {\n  Serial.begin(9600);\n  Serial.println(\"Sensor isiniyor...\");\n  delay(20000);   // 20 saniye bekle\n}\n\nvoid loop() {\n  int gaz = analogRead(A2);   // ESP32'de analogRead(32), bolucuyle\n  Serial.print(\"Gaz degeri: \");\n  Serial.println(gaz);\n  delay(500);\n}",
        en: "void setup() {\n  Serial.begin(9600);\n  Serial.println(\"Sensor warming up...\");\n  delay(20000);   // wait 20 seconds\n}\n\nvoid loop() {\n  int gas = analogRead(A2);   // analogRead(32) on ESP32, with divider\n  Serial.print(\"Gas value: \");\n  Serial.println(gas);\n  delay(500);\n}" } },

    /* ---------------- DOKUNMA VE GİRİŞ ---------------- */
    { id: 'button', cat: 'input', chapter: 1, model: 'Push button', out: 'digital',
      name: W('Buton', 'Push button'),
      short: W('Basılıp basılmadığını algılar. En basit giriş elemanıdır.', 'Detects whether it is pressed. The simplest input part.'),
      how: W("İçinde iki metal parça vardır. Basınca parçalar birbirine değer ve elektrik geçer; bırakınca ayrılır. Bilgisayar klavyesindeki her tuş da küçük bir butondur.",
           "It has two metal parts inside. Pressing it makes them touch and electricity flows; letting go separates them. Every key on a computer keyboard is a small button too."),
      pins: [
        { p: '1. bacak', p_en: 'Leg 1', r: 'sig', uno: 'D2', esp: 'GPIO23', why: W("Karta giden sinyal. Kodda INPUT_PULLUP kullanıldığı için pin basılmadan HIGH okur.", 'The signal to the board. Because the code uses INPUT_PULLUP, the pin reads HIGH when not pressed.') },
        { p: '2. bacak', p_en: 'Leg 2', r: 'gnd', uno: 'GND', esp: 'GND', why: W('Butona basınca pin GND\'ye bağlanır ve LOW okunur. Böylece ek direnç gerekmez.', 'Pressing the button connects the pin to GND and it reads LOW, so no extra resistor is needed.') }
      ],
      volt: W('Voltaj istemez; kartın kendi voltajıyla (5 V ya da 3,3 V) çalışır.', 'It needs no voltage of its own; it works at the board\'s voltage (5 V or 3.3 V).'),
      output: W('Dijital: INPUT_PULLUP ile basılıyken LOW, değilken HIGH.', 'Digital: with INPUT_PULLUP, LOW when pressed and HIGH when not.'),
      react: W("Butona bir kez basınca metal parçalar milisaniyeler içinde birkaç kez değip ayrılır; buna sıçrama (bounce) denir. Kod bir basışı birkaç basış sanabilir. Basit çözüm: basış algılanınca kısa bir delay(50) beklemek.",
               "When pressed once, the metal parts touch and separate several times within milliseconds; this is called bounce. The code may think one press is several. Simple fix: wait a short delay(50) after detecting a press."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'),
                microbit: S('ok', "micro:bit'in A ve B butonları da hazır butonlardır.", "The micro:bit's A and B buttons are ready-made buttons too."), rpi: S('ok', 'Doğrudan bağlanır.', 'Connects directly.') },
      types: [W('4 bacaklı tak-çıkar buton: karşılıklı bacaklar zaten birbirine bağlıdır, çapraz bacakları kullan.', '4-leg breadboard button: legs across from each other are already connected, use diagonal legs.'),
              W('Anahtar (switch): basınca açık ya da kapalı kalır.', 'Switch: stays on or off after you press it.'), W('Büyük arcade butonu: oyun kutuları için.', 'Big arcade button: for game boxes.')],
      uses: [W('Kapı zili', 'Doorbell'), W('Asansör ve yaya geçidi butonları', 'Elevator and crosswalk buttons'), W('Oyun kumandası', 'Game controller')],
      caution: W('Butonu doğrudan 5V ile GND arasına bağlama; basınca kısa devre olur.', 'Never wire a button directly between 5V and GND; pressing it would cause a short circuit.'),
      code: {
        tr: "const int BUTON = 2;   // ESP32'de 23\n\nvoid setup() {\n  pinMode(BUTON, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(BUTON) == LOW) {\n    Serial.println(\"Butona basildi\");\n    delay(50);   // sicramayi onle\n  }\n}",
        en: "const int BUTTON = 2;   // 23 on ESP32\n\nvoid setup() {\n  pinMode(BUTTON, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(BUTTON) == LOW) {\n    Serial.println(\"Button pressed\");\n    delay(50);   // avoid bounce\n  }\n}" } },

    { id: 'touch', cat: 'input', chapter: 7, model: 'TTP223', out: 'digital',
      name: W('Dokunmatik sensör', 'Touch sensor'),
      short: W('Parmağınla dokunduğunu algılar; basmana gerek yoktur.', 'Detects your finger touching it; no need to press.'),
      how: W("Vücudumuz elektriği biraz iletir. Parmak sensöre yaklaşınca sensörün elektrik alanı (kapasitansı) değişir ve çip bunu dokunuş olarak algılar. Telefonların dokunmatik ekranı da benzer şekilde çalışır.",
           "Our bodies conduct a little electricity. When a finger comes close, the sensor's electric field (capacitance) changes and the chip treats it as a touch. Phone touchscreens work in a similar way."),
      pins: [
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND },
        { p: 'VCC', r: 'vcc', uno: '5V', esp: '3V3', why: VCC_ANY },
        { p: 'I/O (SIG)', r: 'sig', uno: 'D5', esp: 'GPIO13', why: W('Dokununca HIGH, dokunmayınca LOW verir.', 'Gives HIGH when touched and LOW when not.') }
      ],
      volt: W('2–5,5 V.', '2–5.5 V.'),
      output: W('Dijital: dokunulunca HIGH, değilken LOW.', 'Digital: HIGH when touched, LOW when not.'),
      react: W("Çok hızlı tepki verir ve sıçrama yapmaz. İnce plastik, kâğıt ya da tahta arkasından da dokunuşu algılar; böylece sensörü bir kutunun içine saklayabilirsin. Açılışta dokunmadan bekle; sensör ilk saniyede kendini ayarlar.",
               "It reacts very fast and doesn't bounce. It also senses touch through thin plastic, paper or wood, so you can hide it inside a box. Don't touch it at power-up; it calibrates itself during the first second."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', "Doğrudan bağlanır. ESP32'nin bazı pinlerinde (T0–T9) kendi dokunma algılaması da vardır.", 'Connects directly. Some ESP32 pins (T0–T9) also have built-in touch sensing.'),
                microbit: S('ok', "Doğrudan bağlanır; micro:bit V2'nin logosu da dokunmatiktir.", 'Connects directly; the micro:bit V2 logo is touch-sensitive too.'), rpi: S('ok', 'Doğrudan bağlanır.', 'Connects directly.') },
      types: [W('TTP223: tek tuş.', 'TTP223: single key.'), W('TTP229: 16 tuşlu dokunmatik klavye.', 'TTP229: 16-key touch keypad.'), W('MPR121: 12 dokunma noktası, I2C.', 'MPR121: 12 touch points, I2C.')],
      uses: [W('Dokunmatik gece lambası', 'Touch night light'), W('Asansör ve ocak dokunmatik tuşları', 'Elevator and cooktop touch keys'), W('Meyveden piyano', 'A piano made of fruit')],
      caution: W("Modülün üzerindeki A ve B lehim noktaları çalışma şeklini değiştirir (örneğin dokununca aç, tekrar dokununca kapat). Başlangıçta onlara dokunma.", 'The A and B solder pads on the module change how it works (for example, touch on, touch again off). Leave them alone at first.'),
      code: {
        tr: "const int DOKUN = 5;   // ESP32'de 13\n\nvoid setup() {\n  pinMode(DOKUN, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(DOKUN) == HIGH) {\n    Serial.println(\"Dokunuldu!\");\n  }\n  delay(100);\n}",
        en: "const int TOUCH = 5;   // 13 on ESP32\n\nvoid setup() {\n  pinMode(TOUCH, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(TOUCH) == HIGH) {\n    Serial.println(\"Touched!\");\n  }\n  delay(100);\n}" } },

    { id: 'pot', cat: 'input', chapter: 7, model: '10 kΩ', out: 'analog',
      name: W('Potansiyometre (ayar düğmesi)', 'Potentiometer (knob)'),
      short: W('Döndürdükçe değeri değişen bir düğmedir.', 'A knob whose value changes as you turn it.'),
      how: W("İçinde direnç maddesi kaplı bir yol ve onun üzerinde kayan bir uç vardır. Düğmeyi çevirince uç yol boyunca kayar ve orta bacaktaki voltaj 0 ile VCC arasında değişir. Aslında hazır bir gerilim bölücüdür.",
           "Inside is a track coated with resistive material and a contact that slides along it. Turning the knob slides the contact, and the voltage on the middle leg changes between 0 and VCC. It's really a ready-made voltage divider."),
      pins: [
        { p: '1. bacak', p_en: 'Leg 1', r: 'vcc', uno: '5V', esp: '3V3', why: W("Yolun bir ucuna elektrik verir. ESP32'de 3V3 kullanılır ki orta bacak 3,3 voltu geçmesin.", "Powers one end of the track. On the ESP32 use 3V3 so the middle leg never goes above 3.3 volts.") },
        { p: 'Orta bacak', p_en: 'Middle leg', r: 'sig', uno: 'A0', esp: 'GPIO34', why: W('Kayan uç buradadır; düğmenin konumuna göre değişen voltajı karta verir.', 'The sliding contact; gives the board a voltage that depends on where the knob is.') },
        { p: '3. bacak', p_en: 'Leg 3', r: 'gnd', uno: 'GND', esp: 'GND', why: W('Yolun diğer ucu. 1. ve 3. bacağı yer değiştirirsen düğme ters yönde çalışır.', 'The other end of the track. Swapping legs 1 and 3 makes the knob work the other way.') }
      ],
      volt: W('Kartın voltajıyla çalışır (5 V ya da 3,3 V).', 'Works at the board\'s voltage (5 V or 3.3 V).'),
      output: W('Analog: Uno 0–1023, ESP32 0–4095.', 'Analog: Uno 0–1023, ESP32 0–4095.'),
      react: W("Değer düğmeyle birlikte yavaşça ve düzgün değişir. Kodda map() fonksiyonu bu sayıyı başka bir aralığa çevirir; örneğin map(deger, 0, 1023, 0, 180) bir servo motorun açısına çevirir.",
               "The value changes smoothly with the knob. In code the map() function converts it to another range; for example map(value, 0, 1023, 0, 180) turns it into a servo angle."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', "3V3 ile besle; orta bacağı ADC1 pinine bağla.", 'Power with 3V3; connect the middle leg to an ADC1 pin.'),
                microbit: S('ok', 'Orta bacak P0, P1 ya da P2\'ye bağlanır.', 'The middle leg goes to P0, P1 or P2.'), rpi: S('warn', 'Analog okumak için çevirici gerekir.', 'Reading analog needs a converter.') },
      types: [W('Döner potansiyometre: en yaygın.', 'Rotary potentiometer: the most common.'), W('Sürgülü potansiyometre: ses mikserlerindeki gibi.', 'Slide potentiometer: like on sound mixers.'),
              W('Trimpot: küçük, tornavidayla ayarlanır (sensör modüllerindeki mavi kutular).', 'Trimpot: small, adjusted with a screwdriver (the blue boxes on sensor modules).')],
      uses: [W('Işığı kısan düğme (dimmer)', 'Dimmer switch'), W('Hoparlör ses düğmesi', 'Speaker volume knob'), W('Oyun kolu (joystick) içinde iki tane vardır', 'Two inside every joystick')],
      caution: W('Orta bacağı yanlışlıkla VCC ya da GND\'ye bağlarsan değer hiç değişmez; önce bacakları kontrol et.', 'If you accidentally connect the middle leg to VCC or GND, the value never changes; check the legs first.'),
      code: {
        tr: "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int deger = analogRead(A0);   // ESP32'de analogRead(34)\n  int yuzde = map(deger, 0, 1023, 0, 100);   // ESP32'de 4095\n  Serial.print(\"Dugme: %\");\n  Serial.println(yuzde);\n  delay(100);\n}",
        en: "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int value = analogRead(A0);   // analogRead(34) on ESP32\n  int percent = map(value, 0, 1023, 0, 100);   // 4095 on ESP32\n  Serial.print(\"Knob: %\");\n  Serial.println(percent);\n  delay(100);\n}" } },

    { id: 'reed', cat: 'input', chapter: 4, model: 'MC-38', out: 'digital',
      name: W('Manyetik kapı sensörü', 'Magnetic door sensor'),
      short: W('Kapının ya da pencerenin açık mı kapalı mı olduğunu algılar.', 'Detects whether a door or window is open or closed.'),
      how: W("İki parçadır: biri mıknatıs, diğeri içinde ince iki metal şerit olan cam tüp (reed anahtar). Mıknatıs yaklaşınca şeritler birbirine yapışır ve elektrik geçer; uzaklaşınca ayrılır. Mıknatıs kapıya, sensör kasaya yapıştırılır.",
           "It comes in two parts: a magnet and a glass tube with two thin metal strips inside (a reed switch). When the magnet comes close the strips touch and electricity flows; when it moves away they separate. The magnet goes on the door and the sensor on the frame."),
      pins: [
        { p: '1. kablo', p_en: 'Wire 1', r: 'sig', uno: 'D3', esp: 'GPIO19', why: W('Karta giden sinyal. INPUT_PULLUP ile kapı açıkken HIGH okunur.', 'The signal to the board. With INPUT_PULLUP it reads HIGH when the door is open.') },
        { p: '2. kablo', p_en: 'Wire 2', r: 'gnd', uno: 'GND', esp: 'GND', why: W('Kapı kapalıyken (mıknatıs yakın) pin GND\'ye bağlanır ve LOW okunur.', 'When the door is closed (magnet close) the pin is connected to GND and reads LOW.') }
      ],
      volt: W('Voltaj istemez; bir butona benzer, kartın voltajıyla çalışır.', 'It needs no voltage of its own; like a button, it works at the board\'s voltage.'),
      output: W('Dijital: kapı kapalı LOW, açık HIGH (INPUT_PULLUP ile).', 'Digital: door closed LOW, open HIGH (with INPUT_PULLUP).'),
      react: W("Mıknatıs yaklaşık 1–2 cm'den uzaklaşınca anahtar açılır. Kabloların sırası önemli değildir. Tepkisi anlıktır.",
               "When the magnet moves more than about 1–2 cm away, the switch opens. The order of the wires doesn't matter. It reacts instantly."),
      boards: { uno: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'), esp32: S('ok', 'Doğrudan bağlanır.', 'Connects directly.'),
                microbit: S('ok', 'Doğrudan bağlanır (dahili pull-up açılarak).', 'Connects directly (with the internal pull-up enabled).'), rpi: S('ok', 'Doğrudan bağlanır.', 'Connects directly.') },
      types: [W('MC-38: kablolu kapı/pencere sensörü.', 'MC-38: wired door/window sensor.'), W('Cam reed anahtar: tek başına, devre tahtası için.', 'Glass reed switch: on its own, for breadboards.'),
              W('Hall etkisi sensörü (A3144): mıknatısı elektronik olarak algılar.', 'Hall effect sensor (A3144): senses a magnet electronically.')],
      uses: [W('Ev alarmında kapı ve pencere takibi', 'Door and window monitoring in home alarms'), W('Buzdolabı açık kalınca uyarı', 'Warning when the fridge is left open'),
             W('Açılınca yanan dolap lambası', 'A cupboard light that turns on when opened')],
      caution: W('Cam reed anahtar kırılgandır; bacaklarını cama çok yakından bükme.', 'Glass reed switches are fragile; do not bend the legs too close to the glass.'),
      code: {
        tr: "const int KAPI = 3;   // ESP32'de 19\n\nvoid setup() {\n  pinMode(KAPI, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(KAPI) == HIGH) {\n    Serial.println(\"Kapi acik!\");\n  } else {\n    Serial.println(\"Kapi kapali\");\n  }\n  delay(300);\n}",
        en: "const int DOOR = 3;   // 19 on ESP32\n\nvoid setup() {\n  pinMode(DOOR, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(DOOR) == HIGH) {\n    Serial.println(\"Door open!\");\n  } else {\n    Serial.println(\"Door closed\");\n  }\n  delay(300);\n}" } },

    { id: 'rfid', cat: 'input', chapter: 4, model: 'RC522', out: 'spi', level: 'adv',
      name: W('RFID kart okuyucu', 'RFID card reader'),
      short: W('Yaklaştırılan kartın ya da anahtarlığın kimlik numarasını okur.', 'Reads the ID number of a card or key tag held close to it.'),
      how: W("Okuyucu bir radyo dalgası yayar. Kartın içinde pil yoktur; bu dalgadan aldığı enerjiyle çalışıp kendi numarasını (UID) geri gönderir. Toplu taşıma kartları ve otel kapı kartları da böyle çalışır.",
           "The reader sends out a radio wave. The card has no battery; it runs on energy from that wave and sends back its own number (UID). Transit cards and hotel key cards work the same way."),
      pins: [
        { p: 'SDA (SS)', r: 'sig', uno: 'D10', esp: 'GPIO5', why: W('SPI "seçme" hattı: kart bu okuyucuyla konuşacağını bu pinle bildirir.', 'SPI "select" line: tells this reader that the board is talking to it.') },
        { p: 'SCK', r: 'sig', uno: 'D13', esp: 'GPIO18', why: W('SPI saat hattı.', 'SPI clock line.') },
        { p: 'MOSI', r: 'sig', uno: 'D11', esp: 'GPIO23', why: W('Karttan okuyucuya giden veri.', 'Data from the board to the reader.') },
        { p: 'MISO', r: 'sig', uno: 'D12', esp: 'GPIO19', why: W('Okuyucudan karta gelen veri (kartın numarası buradan gelir).', 'Data from the reader to the board (the card number comes over this).') },
        { p: 'IRQ', r: 'nc', uno: '—', esp: '—', why: W('Bağlanmaz.', 'Not connected.') },
        { p: 'GND', r: 'gnd', uno: 'GND', esp: 'GND', why: GND },
        { p: 'RST', r: 'sig', uno: 'D9', esp: 'GPIO22', why: W('Okuyucuyu sıfırlayıp başlatmak için kullanılır.', 'Used to reset and start the reader.') },
        { p: '3.3V', r: 'vcc', uno: '3.3V', esp: '3V3', why: W("Sensöre elektrik verir. SADECE 3,3 volt! 5 volta bağlamak okuyucuyu bozabilir.", 'Powers the reader. ONLY 3.3 volts! Connecting it to 5 volts can damage it.') }
      ],
      volt: W('Sadece 3,3 V.', '3.3 V only.'),
      output: W('SPI: kartın kimlik numarası (UID), örneğin "A3 4F 19 0B".', 'SPI: the card ID number (UID), for example "A3 4F 19 0B".'),
      react: W("Kartı yaklaşık 3 cm'ye kadar yaklaştırınca numarayı okur. Her kartın numarası farklıdır; kodda 'bu numara kayıtlıysa kapıyı aç' diye karşılaştırılır. 13,56 MHz MIFARE kartlarla ve anahtarlıklarla çalışır.",
               "It reads the number when a card comes within about 3 cm. Every card has a different number; the code compares it, for example 'if this number is registered, open the door'. It works with 13.56 MHz MIFARE cards and key tags."),
      boards: { uno: S('warn', "3.3V pininden besle (5V'a asla). Sinyal pinleri Uno'ya doğrudan bağlanır ve genelde çalışır.", 'Power it from the 3.3V pin (never 5V). Signal pins connect directly to the Uno and usually work.'),
                esp32: S('ok', 'ESP32 de 3,3 voltla çalıştığı için en uyumlu karttır.', 'The ESP32 also runs at 3.3 volts, so it is the best match.'),
                microbit: S('warn', 'Bağlanabilir ama kütüphane desteği sınırlıdır.', 'It can be connected, but library support is limited.'),
                rpi: S('ok', 'SPI pinlerine bağlanır; Python kütüphanesi (mfrc522) vardır.', 'Connects to the SPI pins; there is a Python library (mfrc522).') },
      types: [W('RC522: 13,56 MHz, kart ve anahtarlıkla gelir.', 'RC522: 13.56 MHz, comes with a card and a key tag.'), W('PN532: telefonun NFC özelliğiyle de konuşur.', 'PN532: can also talk to a phone\'s NFC.'),
              W('RDM6300: 125 kHz kartlar için (eski tip giriş kartları).', 'RDM6300: for 125 kHz cards (older access cards).')],
      uses: [W('Kartla açılan kapı', 'A door that opens with a card'), W('Toplu taşıma ve kütüphane kartları', 'Transit and library cards'), W('Sınıf yoklama sistemi', 'Classroom attendance system')],
      lib: W('Arduino IDE > Kütüphane Yöneticisi: "MFRC522".', 'Arduino IDE > Library Manager: "MFRC522".'),
      caution: W('En sık hata 3.3V yerine 5V\'a bağlamaktır. Kablo bağlantıları çok olduğu için tabloyu satır satır takip et.', 'The most common mistake is connecting it to 5V instead of 3.3V. There are many wires, so follow the table row by row.'),
      code: {
        tr: "#include <SPI.h>\n#include <MFRC522.h>\n\nMFRC522 okuyucu(10, 9);   // SS, RST  (ESP32'de 5, 22)\n\nvoid setup() {\n  Serial.begin(9600);\n  SPI.begin();\n  okuyucu.PCD_Init();\n  Serial.println(\"Karti yaklastir...\");\n}\n\nvoid loop() {\n  if (!okuyucu.PICC_IsNewCardPresent()) return;\n  if (!okuyucu.PICC_ReadCardSerial()) return;\n  Serial.print(\"Kart numarasi:\");\n  for (byte i = 0; i < okuyucu.uid.size; i++) {\n    Serial.print(\" \");\n    Serial.print(okuyucu.uid.uidByte[i], HEX);\n  }\n  Serial.println();\n  okuyucu.PICC_HaltA();\n}",
        en: "#include <SPI.h>\n#include <MFRC522.h>\n\nMFRC522 reader(10, 9);   // SS, RST  (5, 22 on ESP32)\n\nvoid setup() {\n  Serial.begin(9600);\n  SPI.begin();\n  reader.PCD_Init();\n  Serial.println(\"Hold a card close...\");\n}\n\nvoid loop() {\n  if (!reader.PICC_IsNewCardPresent()) return;\n  if (!reader.PICC_ReadCardSerial()) return;\n  Serial.print(\"Card number:\");\n  for (byte i = 0; i < reader.uid.size; i++) {\n    Serial.print(\" \");\n    Serial.print(reader.uid.uidByte[i], HEX);\n  }\n  Serial.println();\n  reader.PICC_HaltA();\n}" } }
  ];

  root.SENSORS = { basics: BASICS, cats: CATS, list: LIST, boards: BOARDS };
})(typeof window !== 'undefined' ? window : this);
