/* afi kod - akıllı ev motoru (Bölüm 4-10)
 * Blockly'den bağımsızdır. Programın JavaScript kodunu bir senaryo üzerinde çalıştırır:
 *   - senaryo: her saniye sensörlerin değeri (ör. 3. saniyede hareket var)
 *   - olaylar: sensör değişince (hareket başlayınca, kapı açılınca...) ilgili blok çalışır
 *   - "her saniye" bloğu saniyede bir çalışır, "başlangıçta" bloğu en başta bir kez
 *   - "bekle" komutu o görevin saatini ileri alır; diğer görevler beklemeden devam eder
 * Sonuç: her cihazın zaman içindeki durumu. Test, her saniyenin ortasında (0,5 - 1,5 - 2,5 ...)
 * cihazların durumunu beklenen durumla karşılaştırır.
 */
(function (root) {
  'use strict';
  function W(tr, en) { return { tr: tr, en: en }; }
  function camel(s) { return s.replace(/_([a-z0-9])/g, function (m, c) { return c.toUpperCase(); }); }

  /* ---------- Sensörler ---------- */
  var SENSORS = {
    motion:   { k: W('hareket', 'motion'), lib: 'pir', type: 'dig', name: W('Hareket sensörü', 'Motion sensor'), val: W(['YOK', 'VAR'], ['NONE', 'DETECTED']),
                q: W('hareket var mı?', 'motion detected?'), py: W('hareket_var_mi', 'motion_detected') },
    door:     { k: W('kapi', 'door'), lib: 'reed', type: 'dig', name: W('Kapı sensörü', 'Door sensor'), val: W(['KAPALI', 'AÇIK'], ['CLOSED', 'OPEN']),
                q: W('kapı açık mı?', 'door open?'), py: W('kapi_acik_mi', 'door_is_open') },
    card:     { k: W('kart', 'card'), lib: 'rfid', type: 'card', name: W('Kart okuyucu', 'Card reader'), val: W(['KART YOK', 'KAYITLI KART', 'YABANCI KART'], ['NO CARD', 'KNOWN CARD', 'UNKNOWN CARD']),
                q: W('kart kayıtlı mı?', 'card known?'), py: W('kart_kayitli_mi', 'card_is_known') },
    button:   { k: W('dugme', 'button'), lib: 'button', type: 'dig', name: W('Düğme', 'Button'), val: W(['BASILMADI', 'BASILDI'], ['UP', 'PRESSED']),
                q: W('düğmeye basılı mı?', 'button pressed?'), py: W('dugmeye_basili_mi', 'button_is_pressed') },
    touch:    { k: W('dokunma', 'touch'), lib: 'touch', type: 'dig', name: W('Dokunmatik sensör', 'Touch sensor'), val: W(['YOK', 'DOKUNULDU'], ['NO', 'TOUCHED']),
                q: W('dokunuluyor mu?', 'touched?'), py: W('dokunuluyor_mu', 'is_touched') },
    obstacle: { k: W('engel', 'obstacle'), lib: 'ir', type: 'dig', name: W('Engel sensörü (IR)', 'Obstacle sensor (IR)'), val: W(['YOK', 'ENGEL VAR'], ['CLEAR', 'BLOCKED']),
                q: W('engel var mı?', 'obstacle detected?'), py: W('engel_var_mi', 'obstacle_detected') },
    rain:     { k: W('yagmur', 'rain'), lib: 'rain', type: 'dig', name: W('Yağmur sensörü', 'Rain sensor'), val: W(['KURU', 'YAĞIYOR'], ['DRY', 'RAINING']),
                q: W('yağmur yağıyor mu?', 'is it raining?'), py: W('yagmur_yagiyor_mu', 'is_raining') },
    distance: { k: W('mesafe', 'distance'), lib: 'hcsr04', type: 'num', unit: 'cm', range: [0, 200], name: W('Mesafe sensörü', 'Distance sensor'),
                r: W('mesafe (cm)', 'distance (cm)'), py: W('mesafe_olc', 'read_distance') },
    light:    { k: W('isik', 'light'), lib: 'ldr', type: 'num', unit: '%', range: [0, 100], name: W('Işık sensörü', 'Light sensor'),
                r: W('ışık seviyesi (%)', 'light level (%)'), py: W('isik_olc', 'read_light') },
    soil:     { k: W('toprak', 'soil'), lib: 'soil', type: 'num', unit: '%', range: [0, 100], name: W('Toprak nem sensörü', 'Soil moisture sensor'),
                r: W('toprak nemi (%)', 'soil moisture (%)'), py: W('toprak_nemi_olc', 'read_soil') },
    temp:     { k: W('sicaklik', 'temp'), lib: 'dht11', type: 'num', unit: '°C', range: [0, 50], name: W('Sıcaklık sensörü', 'Temperature sensor'),
                r: W('sıcaklık (°C)', 'temperature (°C)'), py: W('sicaklik_olc', 'read_temperature') },
    hum:      { k: W('nem', 'hum'), lib: 'dht11', type: 'num', unit: '%', range: [0, 100], name: W('Nem sensörü', 'Humidity sensor'),
                r: W('hava nemi (%)', 'humidity (%)'), py: W('nem_olc', 'read_humidity') },
    sound:    { k: W('ses', 'sound'), lib: 'sound', type: 'num', unit: '%', range: [0, 100], name: W('Ses sensörü', 'Sound sensor'),
                r: W('ses seviyesi (%)', 'sound level (%)'), py: W('ses_olc', 'read_sound') },
    knob:     { k: W('ayar', 'knob'), lib: 'pot', type: 'num', unit: '', range: [0, 100], name: W('Ayar düğmesi', 'Knob'),
                r: W('ayar düğmesi (0-100)', 'knob (0-100)'), py: W('ayar_oku', 'read_knob') },
    gas:      { k: W('gaz', 'gas'), lib: 'mq2', type: 'num', unit: '%', range: [0, 100], name: W('Gaz sensörü', 'Gas sensor'),
                r: W('gaz seviyesi (%)', 'gas level (%)'), py: W('gaz_olc', 'read_gas') },
    tilt:     { k: W('egim', 'tilt'), lib: 'mpu6050', type: 'num', unit: '°', range: [0, 90], name: W('Eğim sensörü', 'Tilt sensor'),
                r: W('eğim (°)', 'tilt (°)'), py: W('egim_olc', 'read_tilt') }
  };

  /* ---------- Olaylar ---------- */
  var EVENTS = {
    motion:     { s: 'motion', edge: 'rise', label: W('hareket algılanınca', 'motion is detected'), py: W('hareket_algilaninca', 'on_motion') },
    door_open:  { s: 'door', edge: 'rise', label: W('kapı açılınca', 'the door opens'), py: W('kapi_acilinca', 'on_door_open') },
    door_close: { s: 'door', edge: 'fall', label: W('kapı kapanınca', 'the door closes'), py: W('kapi_kapaninca', 'on_door_close') },
    card:       { s: 'card', edge: 'rise', label: W('kart okutulunca', 'a card is read'), py: W('kart_okutulunca', 'on_card') },
    button:     { s: 'button', edge: 'rise', label: W('düğmeye basılınca', 'the button is pressed'), py: W('dugmeye_basilinca', 'on_button') },
    touch:      { s: 'touch', edge: 'rise', label: W('dokunulunca', 'it is touched'), py: W('dokunulunca', 'on_touch') },
    clap:       { s: 'sound', edge: 'above', th: 70, label: W('alkış duyulunca', 'a clap is heard'), py: W('alkis_duyulunca', 'on_clap') },
    obstacle:   { s: 'obstacle', edge: 'rise', label: W('engel algılanınca', 'an obstacle is detected'), py: W('engel_algilaninca', 'on_obstacle') },
    rain:       { s: 'rain', edge: 'rise', label: W('yağmur başlayınca', 'it starts raining'), py: W('yagmur_baslayinca', 'on_rain') },
    quake:      { s: 'tilt', edge: 'above', th: 30, label: W('sarsıntı olunca', 'shaking is detected'), py: W('sarsinti_olunca', 'on_quake') }
  };
  var HATS = { start: W('baslangicta', 'when_started'), every: W('her_saniye', 'every_second') };

  /* ---------- Cihazlar ----------
   * kind: power (aç/kapat), open (aç/kapat: kapı, pencere...), screen (ekrana yaz)
   * acc: Türkçe blokta "giriş lambasını aç" gibi okunması için belirtme hâli
   */
  var DEVICES = {
    lamp:         { kind: 'power', look: 'lamp', name: W('Giriş lambası', 'Entrance light'), acc: 'giriş lambasını', py: W('giris_lambasi', 'entrance_light') },
    living_light: { kind: 'power', look: 'lamp', name: W('Salon lambası', 'Living room light'), acc: 'salon lambasını', py: W('salon_lambasi', 'living_room_light') },
    garage_light: { kind: 'power', look: 'lamp', name: W('Garaj lambası', 'Garage light'), acc: 'garaj lambasını', py: W('garaj_lambasi', 'garage_light') },
    garden_light: { kind: 'power', look: 'lamp', name: W('Bahçe lambası', 'Garden light'), acc: 'bahçe lambasını', py: W('bahce_lambasi', 'garden_light') },
    night_light:  { kind: 'power', look: 'lamp', name: W('Gece lambası', 'Night light'), acc: 'gece lambasını', py: W('gece_lambasi', 'night_light'), color: '#9B7BEA' },
    room_light:   { kind: 'power', look: 'lamp', name: W('Oda lambası', 'Room light'), acc: 'oda lambasını', py: W('oda_lambasi', 'room_light') },
    alarm:        { kind: 'power', look: 'alarm', name: W('Alarm', 'Alarm'), acc: 'alarmı', py: W('alarm', 'alarm') },
    beeper:       { kind: 'power', look: 'buzzer', name: W('Uyarı sesi', 'Beeper'), acc: 'uyarı sesini', py: W('uyari_sesi', 'beeper') },
    chime:        { kind: 'power', look: 'music', name: W('Kapı zili', 'Doorbell'), acc: 'kapı zilini', py: W('kapi_zili', 'doorbell') },
    music:        { kind: 'power', look: 'music', name: W('Müzik kutusu', 'Music box'), acc: 'müzik kutusunu', py: W('muzik_kutusu', 'music_box') },
    led_r:        { kind: 'power', look: 'led', color: '#E5484D', name: W('Kırmızı ışık', 'Red light'), acc: 'kırmızı ışığı', py: W('kirmizi_isik', 'red_light') },
    led_y:        { kind: 'power', look: 'led', color: '#F5A524', name: W('Sarı ışık', 'Yellow light'), acc: 'sarı ışığı', py: W('sari_isik', 'yellow_light') },
    led_g:        { kind: 'power', look: 'led', color: '#2FB36B', name: W('Yeşil ışık', 'Green light'), acc: 'yeşil ışığı', py: W('yesil_isik', 'green_light') },
    fan:          { kind: 'power', look: 'fan', name: W('Vantilatör', 'Fan'), acc: 'vantilatörü', py: W('vantilator', 'fan') },
    heater:       { kind: 'power', look: 'heater', name: W('Isıtıcı', 'Heater'), acc: 'ısıtıcıyı', py: W('isitici', 'heater') },
    pump:         { kind: 'power', look: 'pump', name: W('Sulama pompası', 'Water pump'), acc: 'sulama pompasını', py: W('sulama_pompasi', 'water_pump') },
    e_door:       { kind: 'open', look: 'door', name: W('Elektrikli kapı', 'Electric door'), acc: 'elektrikli kapıyı', py: W('elektrikli_kapi', 'electric_door') },
    window:       { kind: 'open', look: 'window', name: W('Pencere', 'Window'), acc: 'pencereyi', py: W('pencere', 'window') },
    garage:       { kind: 'open', look: 'garage', name: W('Garaj kapısı', 'Garage door'), acc: 'garaj kapısını', py: W('garaj_kapisi', 'garage_door') },
    curtain:      { kind: 'open', look: 'curtain', name: W('Perde', 'Curtain'), acc: 'perdeyi', py: W('perde', 'curtain') },
    valve:        { kind: 'open', look: 'valve', name: W('Gaz vanası', 'Gas valve'), acc: 'gaz vanasını', py: W('gaz_vanasi', 'gas_valve') },
    screen:       { kind: 'screen', look: 'screen', name: W('Ekran', 'Screen'), acc: 'ekrana', py: W('ekran', 'screen') }
  };
  var METHODS = { power: { tr: ['kapat', 'ac'], en: ['off', 'on'] }, open: { tr: ['kapat', 'ac'], en: ['close', 'open'] }, screen: { tr: 'yaz', en: 'show' } };
  var STATE_WORD = { power: W(['KAPALI', 'AÇIK'], ['OFF', 'ON']), open: W(['KAPALI', 'AÇIK'], ['CLOSED', 'OPEN']) };

  /* ---------- Hazır fonksiyon ve değişken adları (dile göre) ---------- */
  var FUNCS = {
    night: W('gece_modu', 'night_mode'), morning: W('sabah_modu', 'morning_mode'), party: W('parti_modu', 'party_mode'),
    sleep: W('uyku_modu', 'sleep_mode'), welcome: W('hosgeldin', 'welcome'), lullaby: W('ninni', 'lullaby'),
    all_off: W('hepsini_kapat', 'all_off'), blink: W('yanip_son', 'blink'), alarm: W('alarm_ver', 'raise_alarm'),
    safe: W('guvenli_mod', 'safe_mode'), water: W('sula', 'water_plants'), cool: W('serinlet', 'cool_down'),
    warm: W('isit', 'warm_up'), study: W('ders_modu', 'study_mode'), play: W('oyun_modu', 'play_mode'),
    away: W('evde_kimse_yok', 'away_mode'), home: W('eve_gelince', 'home_mode'), check: W('kontrol_et', 'check_all'),
    show_all: W('ekrana_yaz', 'show_values'), beep: W('bip', 'beep'), rain_mode: W('yagmur_modu', 'rain_mode'),
    quake: W('deprem_modu', 'quake_mode'), gas: W('gaz_alarmi', 'gas_alarm'), climate: W('iklim', 'climate'),
    lights_on: W('isiklari_ac', 'lights_on'), lights_off: W('isiklari_kapat', 'lights_off'), signal: W('trafik_isigi', 'traffic_light')
  };
  var VARS = {
    count: W('sayac', 'count'), dist: W('mesafe', 'distance'), nearest: W('en_yakin', 'nearest'), cars: W('arac_sayisi', 'cars'),
    claps: W('alkis_sayisi', 'claps'), time: W('gecen_sure', 'elapsed'), mode: W('mod', 'mode'), total: W('toplam', 'total'),
    avg: W('ortalama', 'average'), far: W('fahrenheit', 'fahrenheit'), high: W('en_yuksek', 'highest'), low: W('en_dusuk', 'lowest'),
    level: W('seviye', 'level'), prev: W('onceki', 'previous'), visitors: W('ziyaretci', 'visitors'), tries: W('deneme', 'tries'),
    temp: W('sicaklik', 'temperature'), light: W('isik', 'light'), soil: W('nem', 'moisture'), seconds: W('saniye', 'seconds'),
    wet: W('sulama_suresi', 'water_time'), dry: W('kuru_sure', 'dry_time'), diff: W('fark', 'difference'), on: W('acik_mi', 'is_on'),
    readings: W('olcum_sayisi', 'readings'), kmh: W('hiz', 'speed'), score: W('puan', 'score'), left: W('kalan', 'left'),
    sun: W('gunes_suresi', 'sun_time'), rain_time: W('yagis_suresi', 'rain_time'), days: W('gun', 'days'), state: W('durum', 'state'),
    sum3: W('son_uc', 'last_three'), a: W('a', 'a'), b: W('b', 'b'), c: W('c', 'c'), kwh: W('enerji', 'energy'), steps: W('adim', 'steps'),
    target: W('hedef', 'target'), round_: W('tur', 'round'), best: W('rekor', 'best'), hits: W('isabet', 'hits'), up: W('yukselis', 'rising')
  };
  function nameOf(cat, id, lang) { var o = cat[id]; return o ? (o[lang] || o.tr) : id; }

  /* İki dilin tüm adlarını tek tabloda toplar: simülatör her iki dildeki kodu çalıştırabilsin */
  function apiNames() {
    var out = { sensor: {}, event: {}, device: {}, hat: {} };
    ['tr', 'en'].forEach(function (lg) {
      Object.keys(SENSORS).forEach(function (k) { out.sensor[camel(SENSORS[k].py[lg])] = k; });
      Object.keys(EVENTS).forEach(function (k) { out.event[camel(EVENTS[k].py[lg])] = k; });
      Object.keys(DEVICES).forEach(function (k) { out.device[camel(DEVICES[k].py[lg])] = k; });
      out.hat[camel(HATS.start[lg])] = 'start'; out.hat[camel(HATS.every[lg])] = 'every';
    });
    return out;
  }
  var API = apiNames();

  /* ---------- Senaryo ----------
   * sig: { sensör: [her saniyenin değeri] }  ya da  { sensör: [[saniye, değer], ...] } (değişim noktaları)
   */
  function normalize(sc) {
    var dur = sc.dur, sig = {};
    Object.keys(sc.sig || {}).forEach(function (k) {
      var a = sc.sig[k], out = [];
      if (a.length && Array.isArray(a[0])) {
        var v = 0, j = 0;
        for (var t = 0; t < dur; t++) { while (j < a.length && a[j][0] <= t) { v = a[j][1]; j++; } out.push(v); }
      } else { for (var u = 0; u < dur; u++) out.push(a[Math.min(u, a.length - 1)]); }
      sig[k] = out;
    });
    return { dur: dur, sig: sig, init: sc.init || {} };
  }
  function valueAt(nsc, s, tm) {
    var a = nsc.sig[s]; if (!a) return 0;
    var i = Math.max(0, Math.min(a.length - 1, Math.floor(tm + 1e-9)));
    return a[i];
  }
  function fired(nsc, evId, t) {
    var e = EVENTS[evId], a = nsc.sig[e.s]; if (!a || t < 1 || t >= a.length) return false;
    var p = a[t - 1], c = a[t];
    if (e.edge === 'rise') return !p && !!c;
    if (e.edge === 'fall') return !!p && !c;
    return p < e.th && c >= e.th;
  }
  /* Senaryodaki olay listesi (sahnede zaman çizelgesine işaret koymak için) */
  function eventMarks(nsc, evIds) {
    var out = [];
    for (var t = 1; t < nsc.dur; t++) evIds.forEach(function (id) { if (fired(nsc, id, t)) out.push({ t: t, ev: id }); });
    return out;
  }

  /* ---------- Simülasyon ---------- */
  function simulate(step, code, vi) {
    var nsc = normalize(step.scen[vi || 0]), dur = nsc.dur;
    var reg = { start: [], every: [], ev: [] }, actions = [], vars = [], seq = 0;
    var clock = 0, cur = null, budget = 0, phase = 'reg', total = 0;
    function tick() { total++; if (--budget < 0 || total > 60000) throw { home: 'loop' }; }
    function act(dev, v) {
      tick();
      actions.push({ t: clock, dev: dev, v: v, block: cur, seq: seq++ });
    }
    var args = { highlightBlock: function (id) { cur = id; tick(); } };
    /* bekle / wait */
    args.bekle = args.wait = function (s) { tick(); s = Number(s); if (!(s > 0)) s = 0; clock += s; };
    args.__v = function (name, v) { vars.push({ t: clock, name: name, v: v, seq: seq++ }); };
    Object.keys(API.hat).forEach(function (fn) {
      var kind = API.hat[fn];
      args[fn] = function (f) { if (typeof f === 'function') reg[kind].push({ fn: f, block: cur }); };
    });
    Object.keys(API.event).forEach(function (fn) {
      var id = API.event[fn];
      args[fn] = function (f) { if (typeof f === 'function') reg.ev.push({ ev: id, fn: f, block: cur }); };
    });
    Object.keys(API.sensor).forEach(function (fn) {
      var id = API.sensor[fn], sd = SENSORS[id];
      args[fn] = function () {
        tick(); var v = valueAt(nsc, id, clock);
        if (sd.type === 'card') return v === 1;
        if (sd.type === 'dig') return !!v;
        return v;
      };
    });
    Object.keys(API.device).forEach(function (obj) {
      var id = API.device[obj], d = DEVICES[id], o = {};
      if (d.kind === 'screen') o.yaz = o.show = function (x) { act(id, x); };
      else ['tr', 'en'].forEach(function (lg) { var m = METHODS[d.kind][lg]; o[m[1]] = function () { act(id, 1); }; o[m[0]] = function () { act(id, 0); }; });
      args[obj] = o;
    });
    var names = Object.keys(args), outcome = 'done', err = null;
    function runHandler(f, t) {
      clock = t; cur = null; budget = 4000;
      f();
    }
    try {
      budget = 4000;
      var fn = new Function(names.join(','), '"use strict";\n' + code);
      fn.apply(null, names.map(function (k) { return args[k]; }));
      phase = 'run';
      /* Zaman sırası: başlangıç (t=0) -> her saniye olaylar -> "her saniye" görevleri */
      reg.start.forEach(function (h) { runHandler(h.fn, 0); });
      var next = reg.every.map(function () { return 0; });
      for (var t = 0; t < dur; t++) {
        reg.ev.forEach(function (h) { if (fired(nsc, h.ev, t)) runHandler(h.fn, t); });
        for (var i = 0; i < reg.every.length; i++) {
          while (next[i] <= t + 1e-9 && next[i] < dur) {
            var st = next[i]; runHandler(reg.every[i].fn, st);
            next[i] = clock + 1;     /* gövde bitti, 1 saniye sonra tekrar */
          }
        }
      }
    } catch (e) {
      if (e && e.home) outcome = e.home; else { outcome = 'error'; err = String(e && e.message || e); }
    }
    actions.sort(function (a, b) { return a.t - b.t || a.seq - b.seq; });
    vars.sort(function (a, b) { return a.t - b.t || a.seq - b.seq; });
    return { nsc: nsc, dur: dur, actions: actions, vars: vars, outcome: outcome, err: err, handlers: reg.start.length + reg.every.length + reg.ev.length };
  }

  /* Cihazın tm anındaki durumu */
  function stateAt(res, step, dev, tm) {
    var init = res.nsc.init[dev], v = init != null ? init : (dev === 'screen' ? '' : 0);
    for (var i = 0; i < res.actions.length; i++) { var a = res.actions[i]; if (a.t > tm + 1e-9) break; if (a.dev === dev) v = a.v; }
    return v;
  }
  function varsAt(res, tm) {
    var o = {}; res.vars.forEach(function (x) { if (x.t <= tm + 1e-9) o[x.name] = x.v; }); return o;
  }
  /* Her saniyenin ortasındaki durumlar: { cihaz: [..] } */
  function trace(res, step) {
    var out = {};
    step.devices.forEach(function (dev) {
      var arr = [];
      for (var k = 0; k < res.dur; k++) arr.push(norm(stateAt(res, step, dev, k + 0.5)));
      out[dev] = arr;
    });
    return out;
  }
  function norm(v) {
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'number') return Math.round(v * 1000) / 1000;
    if (v == null) return '';
    return v;
  }
  function same(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-6;
    return String(a) === String(b);
  }
  /* Öğrencinin sonucu beklenen durumlarla karşılaştırılır. exp: { cihaz: '0011..' ya da [..] } */
  function check(step, res, vi) {
    var exp = step.exp[vi], tr = trace(res, step), fail = null, perSec = [];
    for (var k = 0; k < res.dur; k++) {
      var ok = true;
      for (var i = 0; i < step.devices.length; i++) {
        var d = step.devices[i], want = expAt(exp[d], k), got = tr[d][k];
        if (!same(want, got)) { ok = false; if (!fail) fail = { t: k, dev: d, want: want, got: got }; }
      }
      perSec.push(ok);
    }
    return { ok: !fail && res.outcome === 'done', fail: fail, perSec: perSec, trace: tr };
  }
  function expAt(e, k) {
    if (typeof e === 'string') return +e[k];
    return e[k];
  }
  /* Üretici araç için: bir çözüm sonucundan beklenen durumları çıkarır */
  function expected(step, res) {
    var tr = trace(res, step), out = {};
    step.devices.forEach(function (d) {
      out[d] = DEVICES[d].kind === 'screen' ? tr[d] : tr[d].map(function (v) { return v ? 1 : 0; }).join('');
    });
    return out;
  }
  function runAll(step, code) {
    return step.scen.map(function (_, i) { var r = simulate(step, code, i); r.check = check(step, r, i); r.vi = i; return r; });
  }
  function fmtVal(v) {
    if (typeof v === 'number') { var r = Math.round(v * 10) / 10; return String(r).replace('.', ','); }
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    return v == null ? '' : String(v);
  }

  root.HOME = {
    SENSORS: SENSORS, EVENTS: EVENTS, DEVICES: DEVICES, HATS: HATS, FUNCS: FUNCS, VARS: VARS, METHODS: METHODS, STATE_WORD: STATE_WORD,
    camel: camel, nameOf: nameOf, normalize: normalize, valueAt: valueAt, fired: fired, eventMarks: eventMarks,
    simulate: simulate, stateAt: stateAt, varsAt: varsAt, trace: trace, check: check, expected: expected, runAll: runAll, expAt: expAt, fmtVal: fmtVal, same: same
  };
})(typeof window !== 'undefined' ? window : this);
