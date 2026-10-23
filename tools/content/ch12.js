/* Bölüm 12 - ESP32 akıllı ev */
const K = require('./kit.js');
const { ev, forever, fn, call, on, off, open, close, wait, show, ife, chg, get, sens, dig, cmp, txt, join, d, ramp } = K;
const S = (dur, sig, init) => ({ dur: dur, sig: sig, init: init });
const TH = (s, ...v) => v.map(x => ({ s: s, v: x }));
const T = (tr, en) => [tr, en];
const WIRE = T(' ESP32 3,3 volt ile çalışır; bağlantı listesi ve gerilim bölücü notları kodun en üstünde.',
  ' The ESP32 runs on 3.3 volts; the wiring list and voltage divider notes are at the top of the code.');
const tx = (tr, en) => [tr + WIRE[0], en + WIRE[1]];

module.exports = {
  id: 'esp32', num: 12, view: 'ino', board: 'esp32', chips: ['touch', 'reed', 'dht11', 'mq2', 'mpu6050', 'rain', 'ldr', 'rfid'],
  name: K.T('ESP32 akıllı ev', 'ESP32 smart home'),
  concept: K.T('Gerçek akıllı ev', 'A real smart home'),
  story: K.T(
    "Deniz'in ailesi evin her odasını gerçek bir akıllı eve çevirmek istiyor. Bunun için Wi-Fi'li, iki çekirdekli ve dokunmatik pinleri olan ESP32 kartını kullanacağız. Bu bölümde dokunmatik düğmeden deprem sensörüne kadar evin bütün güvenlik ve konfor sistemlerini kuracaksın.",
    "Deniz's family wants to turn every room into a real smart home. For this we will use the ESP32 board: it has Wi-Fi, two processor cores and built-in touch pins. In this chapter you will build all the safety and comfort systems of the house, from a touch button to an earthquake sensor."),
  life: K.T(
    'Akıllı prizler, Wi-Fi\'li ampuller, kapı kameraları ve telefondan yönetilen kombiler çoğunlukla ESP32 gibi kartlarla çalışır.',
    'Smart plugs, Wi-Fi light bulbs, door cameras and boilers controlled from a phone mostly run on boards like the ESP32.'),
  lessons: [
    { tier: 'easy', title: K.T('ESP32 ile tanış', 'Meet the ESP32'), steps: [
      { id: 'esp-1', sensors: ['touch'], devices: ['room_light'], tools: ['event:touch', 'switch', 'wait:3'],
        scen: [S(12, { touch: d('001000000000') }), S(12, { touch: d('000000100000') })],
        sol: [ev('touch', on('room_light'), wait(3), off('room_light'))],
        text: tx('ESP32\'nin bazı pinleri dokunmayı kendisi algılar; ayrı bir sensör gerekmez, pine bağlı bir kablo ya da alüminyum folyo yeter. Oda lambası dokununca 3 saniye yansın.',
                 'Some ESP32 pins sense touch by themselves; no extra sensor is needed, a wire or a piece of foil on the pin is enough. The room light stays on for 3 seconds when touched.'),
        goal: T('Görev: Dokunulunca oda lambasını yak, 3 saniye bekle, söndür.',
                'Task: When touched, room light on, wait 3 seconds, off.') },
      { id: 'esp-2', sensors: ['door'], devices: ['alarm'], tools: ['event:door_open', 'switch', 'wait:3'],
        scen: [S(12, { door: d('000111100000') }), S(12, { door: d('000000011100') })],
        sol: [ev('door_open', on('alarm'), wait(3), off('alarm'))],
        text: tx('Manyetik kapı sensörü (reed) mıknatıs uzaklaşınca kapının açıldığını anlar. Kapı açılınca alarm 3 saniye çalsın.',
                 'The magnetic door sensor (reed) knows the door opened when the magnet moves away. When the door opens, the alarm sounds for 3 seconds.'),
        goal: T('Görev: Kapı açılınca alarmı aç, 3 saniye bekle, kapat.',
                'Task: When the door opens, alarm on, wait 3 seconds, off.') },
      { id: 'esp-3', sensors: ['temp'], devices: ['screen'], tools: ['forever', 'show', 'join', 'sensor:temp', 'text: °C', 'wait:2'],
        scen: [S(12, { temp: K.vals(20, 21, 21, 22, 23, 23, 24, 25, 25, 26, 26, 27) }), S(12, { temp: K.vals(29, 28, 28, 27, 26, 26, 25, 24, 24, 23, 22, 22) })],
        sol: [forever(show(join(sens('temp'), txt(' °C'))), wait(2))],
        text: tx('Oda sıcaklığı ekranında sayının yanında birimi de görünsün. "birleştir" bloğu sayı ile yazıyı yan yana koyar. ESP32\'de Seri Monitör hızı 115200\'dür.',
                 'The room thermometer screen shows the unit next to the number. The "join" block puts a number and some text side by side. On the ESP32 the Serial Monitor speed is 115200.'),
        goal: T('Görev: Sürekli tekrarla: sıcaklığı " °C" ile birleştirip ekrana yaz, 2 saniye bekle.',
                'Task: Forever: join the temperature with " °C", show it on the screen, wait 2 seconds.') },
      { id: 'esp-4', sensors: ['gas'], devices: ['alarm', 'valve'], tools: ['forever', 'ifelse', 'compare:GT:50', 'sensor:gas', 'switch', 'move'], thresholds: TH('gas', 50),
        scen: [S(12, { gas: ramp(12, [0, 10], [5, 10], [8, 80], [11, 20]) }, { valve: 1 }), S(12, { gas: ramp(12, [0, 70], [3, 70], [6, 15], [11, 15]) }, { valve: 1 })],
        sol: [forever(ife(cmp(sens('gas'), '>', 50), [on('alarm'), close('valve')], [off('alarm')]))],
        text: tx('MQ-2 gaz sensörü havadaki yanıcı gazı ölçer. Gaz 50\'yi geçince alarm çalsın ve gaz vanası kapansın. Gaz azalınca alarm susar ama vana güvenlik için kapalı kalır.',
                 'The MQ-2 gas sensor measures flammable gas in the air. When gas goes over 50, the alarm sounds and the gas valve closes. When the gas drops, the alarm stops but the valve stays closed for safety.'),
        goal: T('Görev: Sürekli tekrarla: gaz 50\'den fazlaysa alarmı aç ve gaz vanasını kapat; değilse alarmı kapat.',
                'Task: Forever: if gas is over 50, alarm on and close the gas valve; otherwise alarm off.') },
      { id: 'esp-5', sensors: ['tilt'], devices: ['valve', 'alarm'], tools: ['event:quake', 'move', 'switch', 'wait:4'], thresholds: TH('tilt', 30),
        scen: [S(12, { tilt: K.vals(2, 3, 2, 45, 60, 20, 5, 3, 2, 2, 2, 2) }, { valve: 1 }), S(12, { tilt: K.vals(1, 2, 2, 3, 2, 2, 50, 35, 10, 3, 2, 2) }, { valve: 1 })],
        sol: [ev('quake', close('valve'), on('alarm'), wait(4), off('alarm'))],
        text: tx('MPU-6050 ivme sensörü sarsıntıyı ölçer. Deprem anında önce gaz vanası kapanmalı, sonra alarm 4 saniye çalmalı. Sensör I2C ile iki kabloya (SDA, SCL) bağlanır.',
                 'The MPU-6050 motion sensor measures shaking. During an earthquake the gas valve must close first, then the alarm sounds for 4 seconds. The sensor uses I2C on two wires (SDA, SCL).'),
        goal: T('Görev: Sarsıntı olunca gaz vanasını kapat, alarmı aç, 4 saniye bekle, alarmı kapat.',
                'Task: When shaking is detected, close the gas valve, alarm on, wait 4 seconds, alarm off.') }
    ] },
    { tier: 'easy', title: K.T('Akıllı ev projesi', 'Smart home project'), steps: [
      { id: 'esp-6', sensors: ['rain'], devices: ['window', 'beeper'], tools: ['event:rain', 'move', 'switch', 'wait:1'],
        scen: [S(12, { rain: d('000011111100') }, { window: 1 }), S(12, { rain: d('000000001111') }, { window: 1 })],
        sol: [ev('rain', close('window'), on('beeper'), wait(1), off('beeper'))],
        text: tx('Yağmur sensörü ıslanınca pencere kendiliğinden kapansın ve kısa bir uyarı sesi duyulsun. Pencere bir servo motorla hareket eder.',
                 'When the rain sensor gets wet, the window closes by itself and a short beep is heard. The window moves with a servo motor.'),
        goal: T('Görev: Yağmur başlayınca pencereyi kapat, uyarı sesini aç, 1 saniye bekle, kapat.',
                'Task: When it starts raining, close the window, beeper on, wait 1 second, off.') },
      { id: 'esp-7', sensors: ['light'], devices: ['curtain'], tools: ['forever', 'ifelse', 'compare:GT:70', 'sensor:light', 'move'], thresholds: TH('light', 70),
        scen: [S(12, { light: ramp(12, [0, 30], [8, 95], [11, 95]) }), S(12, { light: ramp(12, [0, 90], [6, 40], [11, 40]) })],
        sol: [forever(ife(cmp(sens('light'), '>', 70), [close('curtain')], [open('curtain')]))],
        text: tx('Güneş çok parlayınca oda ısınır ve ekran parlar. Işık 70\'i geçince perde kapansın, değilse açık kalsın.',
                 'When the sun is very bright, the room heats up and screens glare. When the light goes over 70, the curtain closes; otherwise it stays open.'),
        goal: T('Görev: Sürekli tekrarla: ışık 70\'ten fazlaysa perdeyi kapat, değilse aç.',
                'Task: Forever: if the light is over 70, close the curtain; otherwise open it.') },
      { id: 'esp-8', sensors: ['card'], devices: ['e_door', 'beeper'], tools: ['event:card', 'ifelse', 'digital:card', 'move', 'switch', 'wait:3', 'wait:1'],
        scen: [S(14, { card: K.vals(0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0) }), S(14, { card: K.vals(0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0) })],
        sol: [ev('card', ife(dig('card'), [open('e_door'), wait(3), close('e_door')], [on('beeper'), wait(1), off('beeper')]))],
        text: tx('RFID kart okuyucu (RC522) her kartın numarasını okur. Kayıtlı kart okutulunca kapı 3 saniye açılsın, yabancı kartta uyarı sesi çalsın.',
                 'The RFID card reader (RC522) reads each card\'s number. With a registered card the door opens for 3 seconds; with an unknown card the beeper sounds.'),
        goal: T('Görev: Kart okutulunca: kart kayıtlıysa kapıyı aç, 3 saniye bekle, kapat; değilse uyarı sesini 1 saniye çal.',
                'Task: When a card is read: if it is registered, open the door, wait 3 seconds, close it; otherwise sound the beeper for 1 second.') },
      { id: 'esp-9', sensors: ['door'], devices: ['screen'], tools: ['event:door_open', 'change:visitors', 'get:visitors', 'show'],
        scen: [S(14, { door: d('00110001100110') }), S(14, { door: d('00000111000000') })],
        sol: [ev('door_open', chg('visitors', 1), show(get('visitors')))],
        text: tx('Kapı her açıldığında ziyaretçi sayısı bir artsın ve ekranda görünsün. Mağazalar müşteri sayısını böyle sayar.',
                 'Each time the door opens, the visitor count goes up by one and is shown on the screen. Shops count customers like this.'),
        goal: T('Görev: Kapı açılınca ziyaretçi değişkenini 1 artır ve ekrana yaz.',
                'Task: When the door opens, add 1 to visitors and show it on the screen.') },
      { id: 'esp-10', sensors: ['light'], devices: ['garden_light', 'curtain'], tools: ['fn:night', 'fn:morning', 'call:night', 'call:morning', 'forever', 'ifelse', 'compare:LT:30', 'sensor:light', 'switch', 'move'], thresholds: TH('light', 30),
        starter: [fn('night'), fn('morning')],
        scen: [S(12, { light: ramp(12, [0, 80], [8, 10], [11, 10]) }, { curtain: 1 }), S(12, { light: ramp(12, [0, 10], [6, 70], [11, 70]) }, { curtain: 1 })],
        sol: [fn('night', on('garden_light'), close('curtain')), fn('morning', off('garden_light'), open('curtain')),
              forever(ife(cmp(sens('light'), '<', 30), [call('night')], [call('morning')]))],
        text: tx('Bölüm projesi: hava kararınca gece modu (bahçe lambası yanar, perde kapanır), aydınlanınca sabah modu (lamba söner, perde açılır). Modları fonksiyon olarak yaz, döngüden çağır.',
                 'Chapter project: when it gets dark, night mode (garden light on, curtain closed); when it gets light, morning mode (light off, curtain open). Write the modes as functions and call them from the loop.'),
        goal: T('Görev: gece_modu: bahçe lambasını yak, perdeyi kapat. sabah_modu: bahçe lambasını söndür, perdeyi aç. Sürekli tekrarla: ışık 30\'dan azsa gece_modu, değilse sabah_modu.',
                'Task: night_mode: garden light on, close the curtain. morning_mode: garden light off, open the curtain. Forever: if the light is under 30, night_mode, otherwise morning_mode.') }
    ] }
  ]
};
