/* Bölüm 11 - Arduino II: sürekli tekrarla (Arduino Uno) */
const K = require('./kit.js');
const { forever, on, off, wait, show, iff, ife, sens, dig, cmp, d, ramp } = K;
const S = (dur, sig, init) => ({ dur: dur, sig: sig, init: init });
const TH = (s, ...v) => v.map(x => ({ s: s, v: x }));
const T = (tr, en) => [tr, en];
const WIRE = T(' Bağlantı listesi Arduino kodunun en üstünde; ".ino indir" ile dosyayı Arduino IDE\'ye al.',
  ' The wiring list is at the top of the Arduino code; use "Download .ino" to open it in the Arduino IDE.');
const tx = (tr, en) => [tr + WIRE[0], en + WIRE[1]];

module.exports = {
  id: 'arduino2', num: 11, view: 'ino', board: 'uno', chips: ['button', 'ldr', 'hcsr04', 'dht11', 'soil'],
  name: K.T('Arduino II', 'Arduino II'),
  concept: K.T('Sürekli tekrarla', 'Forever loop'),
  story: K.T(
    "Arduino atölyesi çok sevildi; şimdi bir adım ileri gidiyoruz! mBlock'ta ve Scratch'te gördüğün \"sürekli tekrarla\" bloğu, Arduino'daki loop() fonksiyonunun ta kendisi: içindekiler bitince hemen baştan başlar. Bu bölümde LED'leri kendi ritminle yakıp söndürecek, sonra sensörleri durmadan okuyan devreler kuracaksın.",
    "The Arduino workshop was a hit, so let's go one step further! The \"forever\" block you know from mBlock and Scratch is the loop() function of an Arduino itself: as soon as it finishes, it starts again. In this chapter you will blink LEDs to your own rhythm, then build circuits that read sensors non-stop."),
  life: K.T(
    'Trafik ışıkları, reklam panolarının yanıp sönen ışıkları, park sensörleri ve sera sulama sistemleri gün boyu aynı döngüyü tekrarlar.',
    'Traffic lights, blinking signs, parking sensors and greenhouse watering systems repeat the same loop all day long.'),
  lessons: [
    { tier: 'easy', title: K.T('Sürekli tekrarla', 'Forever'), steps: [
      { id: 'ard2-1', sensors: [], devices: ['led_r'], tools: ['forever', 'switch', 'wait:1'],
        scen: [S(10, {})],
        sol: [forever(on('led_r'), wait(1), off('led_r'), wait(1))],
        text: tx('"Sürekli tekrarla" bloğu Arduino\'daki loop() fonksiyonudur: içindekiler bitince hemen baştan başlar. "Her saniye" bloğundan farkı, araya kendiliğinden 1 saniye koymamasıdır; ritmi bekle blokları belirler. Malzeme: kırmızı LED ve 220 Ω direnç.',
                 'The "forever" block is the loop() function of an Arduino: it starts again as soon as it ends. Unlike "every second", it adds no pause by itself; the wait blocks set the rhythm. Parts: red LED and a 220 Ω resistor.'),
        goal: T('Görev: Sürekli tekrarla: kırmızı LED\'i yak, 1 saniye bekle, söndür, 1 saniye bekle.',
                'Task: Forever: red LED on, wait 1 second, off, wait 1 second.') },
      { id: 'ard2-2', sensors: [], devices: ['led_r', 'led_y'], tools: ['forever', 'switch', 'wait:1'],
        scen: [S(10, {})],
        sol: [forever(on('led_r'), wait(1), off('led_r'), on('led_y'), wait(1), off('led_y'))],
        text: tx('İki LED sırayla yanıp sönsün: biri yanarken öteki sönük. Malzeme: kırmızı ve sarı LED, iki 220 Ω direnç.',
                 'Two LEDs take turns: while one is on, the other is off. Parts: red and yellow LED, two 220 Ω resistors.'),
        goal: T('Görev: Sürekli tekrarla: kırmızıyı yak, 1 saniye bekle, kırmızıyı söndür; sarıyı yak, 1 saniye bekle, sarıyı söndür.',
                'Task: Forever: red on, wait 1 second, red off; yellow on, wait 1 second, yellow off.') },
      { id: 'ard2-3', sensors: [], devices: ['led_r', 'led_y', 'led_g'], tools: ['forever', 'switch', 'wait:3', 'wait:1', 'wait:2'],
        scen: [S(18, {})],
        sol: [forever(on('led_g'), wait(3), off('led_g'), on('led_y'), wait(1), off('led_y'), on('led_r'), wait(2), off('led_r'))],
        text: tx('Gerçek trafik lambası: yeşil 3, sarı 1, kırmızı 2 saniye. Döngünün sonunda kırmızıyı söndürmeyi unutma, yoksa yeşille birlikte yanar.',
                 'A real traffic light: green 3, yellow 1, red 2 seconds. Remember to switch red off at the end of the loop, or it stays on with green.'),
        goal: T('Görev: Sürekli tekrarla: yeşil 3 saniye, sarı 1 saniye, kırmızı 2 saniye yansın; her ışık süresi bitince sönsün.',
                'Task: Forever: green for 3 seconds, yellow for 1, red for 2; each light goes off when its time is up.') },
      { id: 'ard2-4', sensors: ['button'], devices: ['led_g'], tools: ['forever', 'ifelse', 'digital:button', 'switch'],
        scen: [S(12, { button: d('001110001100') }), S(12, { button: d('011000011110') })],
        sol: [forever(ife(dig('button'), [on('led_g')], [off('led_g')]))],
        text: tx('Sürekli tekrarla içinde bekle bloğu yoksa Arduino butonu saniyede binlerce kez okur. Simülasyonda sensörler saniyede bir değiştiği için her saniye bir kez kontrol edilir.',
                 'With no wait block inside forever, the Arduino reads the button thousands of times a second. In the simulation the sensors change once a second, so it is checked once each second.'),
        goal: T('Görev: Sürekli tekrarla: düğmeye basılıysa yeşil LED yansın, değilse sönsün.',
                'Task: Forever: if the button is pressed, green LED on; otherwise off.') },
      { id: 'ard2-5', sensors: ['button'], devices: ['led_r'], tools: ['forever', 'if', 'digital:button', 'switch', 'wait:1'],
        scen: [S(14, { button: d('00111100000000') }), S(14, { button: d('00000001111110') })],
        sol: [forever(iff(dig('button'), on('led_r'), wait(1), off('led_r'), wait(1)))],
        text: tx('Düğme basılı tutuldukça LED yanıp sönsün; bırakınca sönük kalsın. Bisiklet sinyal lambaları böyle çalışır.',
                 'While the button is held, the LED blinks; when released it stays off. Bicycle indicator lights work like this.'),
        goal: T('Görev: Sürekli tekrarla: düğmeye basılıysa kırmızı LED\'i yak, 1 saniye bekle, söndür, 1 saniye bekle.',
                'Task: Forever: if the button is pressed, red LED on, wait 1 second, off, wait 1 second.') }
    ] },
    { tier: 'easy', title: K.T('Sensörleri durmadan oku', 'Read sensors non-stop'), steps: [
      { id: 'ard2-6', sensors: ['light'], devices: ['night_light'], tools: ['forever', 'ifelse', 'compare:LT:30', 'sensor:light', 'switch'], thresholds: TH('light', 30),
        scen: [S(12, { light: ramp(12, [0, 80], [9, 10], [11, 10]) }), S(12, { light: ramp(12, [0, 15], [6, 60], [11, 60]) })],
        sol: [forever(ife(cmp(sens('light'), '<', 30), [on('night_light')], [off('night_light')]))],
        text: tx('Işık sensörü (LDR) ve 10 kΩ direnç bir gerilim bölücü kurar; analog pin ışık azaldıkça küçük değer okur. Gece lambası karanlıkta yanar, aydınlıkta söner.',
                 'A light sensor (LDR) and a 10 kΩ resistor make a voltage divider; the analog pin reads lower values as the light fades. The night light goes on in the dark and off in the light.'),
        goal: T('Görev: Sürekli tekrarla: ışık 30\'dan azsa gece lambası yansın, değilse sönsün.',
                'Task: Forever: if the light is under 30, night light on; otherwise off.') },
      { id: 'ard2-7', sensors: ['distance'], devices: ['beeper'], tools: ['forever', 'ifelse', 'compare:LT:20', 'sensor:distance', 'switch'], thresholds: TH('distance', 20),
        scen: [S(12, { distance: ramp(12, [0, 100], [8, 8], [11, 8]) }), S(12, { distance: ramp(12, [0, 10], [5, 60], [11, 60]) })],
        sol: [forever(ife(cmp(sens('distance'), '<', 20), [on('beeper')], [off('beeper')]))],
        text: tx('HC-SR04 ultrasonik sensör ses dalgası gönderir ve yankının dönme süresinden mesafeyi santimetre olarak hesaplar. Bir şey 20 cm\'den yakına gelince buzzer ötsün.',
                 'The HC-SR04 ultrasonic sensor sends a sound wave and works out the distance in centimetres from how long the echo takes. When something comes closer than 20 cm, the buzzer sounds.'),
        goal: T('Görev: Sürekli tekrarla: mesafe 20\'den azsa uyarı sesi açılsın, değilse kapansın.',
                'Task: Forever: if the distance is under 20, beeper on; otherwise off.') },
      { id: 'ard2-8', sensors: ['distance'], devices: ['led_r', 'led_g'], tools: ['forever', 'ifelse', 'compare:LT:15', 'sensor:distance', 'switch'], thresholds: TH('distance', 15),
        scen: [S(12, { distance: ramp(12, [0, 80], [9, 5], [11, 5]) }), S(12, { distance: ramp(12, [0, 6], [6, 40], [11, 40]) })],
        sol: [forever(ife(cmp(sens('distance'), '<', 15), [on('led_r'), off('led_g')], [off('led_r'), on('led_g')]))],
        text: tx('Garaj park sensörü: araba uzaktayken yeşil, 15 cm\'den yakınken kırmızı yanar. Her dalda iki LED\'in de durumunu yazmak gerekir.',
                 'Garage parking sensor: green while the car is far, red when it is closer than 15 cm. Each branch has to set both LEDs.'),
        goal: T('Görev: Sürekli tekrarla: mesafe 15\'ten azsa kırmızı yansın, yeşil sönsün; değilse kırmızı sönsün, yeşil yansın.',
                'Task: Forever: if the distance is under 15, red on and green off; otherwise red off and green on.') },
      { id: 'ard2-9', sensors: ['temp'], devices: ['screen'], tools: ['forever', 'show', 'sensor:temp', 'wait:2'],
        scen: [S(12, { temp: K.vals(21, 22, 22, 23, 24, 24, 25, 26, 26, 27, 27, 28) }), S(12, { temp: K.vals(30, 29, 29, 28, 27, 27, 26, 25, 25, 24, 23, 23) })],
        sol: [forever(show(sens('temp')), wait(2))],
        text: tx('DHT11 sensörü sıcaklığı ölçer. Seri Monitör\'e her saniye yazmak ekranı doldurur; 2 saniyede bir yazmak yeterli. Ekran = Seri Monitör.',
                 'The DHT11 sensor measures temperature. Printing to the Serial Monitor every second floods the screen; every 2 seconds is enough. Screen = Serial Monitor.'),
        goal: T('Görev: Sürekli tekrarla: sıcaklığı ekrana yaz, 2 saniye bekle.',
                'Task: Forever: show the temperature on the screen, wait 2 seconds.') },
      { id: 'ard2-10', sensors: ['soil', 'temp'], devices: ['pump', 'fan'], tools: ['forever', 'ifelse', 'compare:LT:35', 'compare:GT:28', 'sensor:soil', 'sensor:temp', 'switch'], thresholds: TH('soil', 35).concat(TH('temp', 28)),
        scen: [S(12, { soil: ramp(12, [0, 60], [6, 20], [8, 20], [11, 60]), temp: K.vals(24, 25, 26, 27, 28, 29, 30, 30, 29, 27, 26, 25) }),
               S(12, { soil: ramp(12, [0, 25], [4, 25], [7, 70], [11, 70]), temp: K.vals(31, 30, 29, 28, 27, 26, 26, 27, 29, 30, 31, 31) })],
        sol: [forever(ife(cmp(sens('soil'), '<', 35), [on('pump')], [off('pump')]), ife(cmp(sens('temp'), '>', 28), [on('fan')], [off('fan')]))],
        text: tx('Mini sera projesi: toprak nemi düşünce pompa, sıcaklık artınca fan çalışsın. Tek döngüde iki ayrı karar verilir.',
                 'Mini greenhouse project: the pump runs when the soil is dry, the fan when it gets hot. One loop makes two separate decisions.'),
        goal: T('Görev: Sürekli tekrarla: nem 35\'ten azsa pompa açık, değilse kapalı; sıcaklık 28\'den fazlaysa vantilatör açık, değilse kapalı.',
                'Task: Forever: if moisture is under 35, pump on, otherwise off; if the temperature is over 28, fan on, otherwise off.') }
    ] }
  ]
};
