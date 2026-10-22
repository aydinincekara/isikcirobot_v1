/* afi kod - sensör kütüphanesi ekranı (veriler: sensors.js) */
(function (root) {
  'use strict';
  function W(tr, en) { return { tr: tr, en: en }; }

  /* "Dene ve gör" ayarları: dig = açık/kapalı, ana = kaydırıcı (a: başlangıç, b: bitiş oranı), dist, dht, tilt, rfid */
  var SIM = {
    pir: { k: 'dig', on: W('Önünde biri hareket ediyor', 'Someone is moving in front of it'), high: true },
    ir: { k: 'dig', on: W('Önüne elimi koydum', 'My hand is in front of it'), high: false },
    button: { k: 'dig', on: W('Butona basıyorum', 'I am pressing the button'), high: false },
    touch: { k: 'dig', on: W('Parmağımla dokunuyorum', 'I am touching it'), high: true },
    reed: { k: 'dig', on: W('Kapı açık (mıknatıs uzakta)', 'Door open (magnet away)'), high: true },
    hcsr04: { k: 'dist' },
    ldr: { k: 'ana', lab: W('Ortamdaki ışık', 'Light in the room'), a: 0.08, b: 0.92,
           note: W('Bu örnekte ışık arttıkça sayı artıyor. Bazı modüllerde tersidir.', 'In this example the number rises with light. Some modules work the other way round.') },
    sound: { k: 'ana', lab: W('Sesin yüksekliği', 'How loud it is'), a: 0.05, b: 0.9 },
    soil: { k: 'ana', lab: W('Topraktaki su', 'Water in the soil'), a: 0.58, b: 0.28,
            note: W('Toprak ıslandıkça sayı küçülür.', 'The wetter the soil, the smaller the number.') },
    rain: { k: 'ana', lab: W('Plakadaki su', 'Water on the plate'), a: 0.98, b: 0.3,
            note: W('Su arttıkça sayı küçülür.', 'More water gives a smaller number.') },
    mq2: { k: 'ana', lab: W('Havadaki gaz', 'Gas in the air'), a: 0.1, b: 0.85 },
    pot: { k: 'ana', lab: W('Düğmenin açısı', 'Knob angle'), a: 0, b: 1 },
    dht11: { k: 'dht' }, mpu6050: { k: 'tilt' }, rfid: { k: 'rfid' }
  };
  var CARDS = [
    { uid: 'A3 4F 19 0B', ok: true, name: W('Mavi anahtarlık', 'Blue key tag') },
    { uid: '5C E2 07 91', ok: true, name: W('Beyaz kart', 'White card') },
    { uid: '12 9B 6D 3A', ok: false, name: W('Kayıtsız kart', 'Unregistered card') }
  ];
  var PIN_EN = { '1. bacak': 'Leg 1', '2. bacak': 'Leg 2', '3. bacak': 'Leg 3', 'Orta bacak': 'Middle leg', '1. kablo': 'Wire 1', '2. kablo': 'Wire 2' };
  var SIGCOL = ['#F5A524', '#3B82F6', '#22A06B', '#8E4EC6', '#F97316', '#0EA5E9'];

  root.createSensorUI = function (api) {
    var SL = root.SENSORS, t = api.t, L = api.L, esc = api.esc, IC = root.ic, CATIC = { move: 'radar', env: 'thermo', input: 'hand' };
    var $ = function (id) { return document.getElementById(id); };
    var st = { view: 'grid', id: null, board: 'uno', sim: {} };

    function byId(id) { for (var i = 0; i < SL.list.length; i++) if (SL.list[i].id === id) return SL.list[i]; return null; }
    function pinName(p) { return api.lang() === 'en' && PIN_EN[p] ? PIN_EN[p] : p; }
    function num(v, d) { var s = v.toFixed(d); return api.lang() === 'tr' ? s.replace('.', ',') : s; }
    function chapterName(n) {
      var all = api.chapters();
      for (var i = 0; i < all.length; i++) if (all[i].num === n) return t('chapter') + ' ' + n + ' · ' + L(all[i].name);
      return '';
    }

    /* ---- Liste ---- */
    function gridHTML() {
      var h = '<div class="sl-intro"><p>' + esc(t('sensorHelp')) + '</p>' +
        '<button class="basicbtn" type="button" data-basics><b>' + IC('bulb') + ' ' + esc(L(SL.basics.title)) + '</b><span>' +
        esc(SL.basics.items.slice(0, 4).map(function (i) { return L(i.h); }).join(' · ')) + ' …</span></button></div>';
      SL.cats.forEach(function (c) {
        var items = SL.list.filter(function (s) { return s.cat === c.id; });
        h += '<h3 class="sl-cat">' + IC(CATIC[c.id] || 'chip') + ' ' + esc(L(c.name)) + '</h3><div class="sl-grid">' + items.map(function (s) {
          return '<button class="stile" type="button" data-sensor="' + s.id + '"><span class="model">' + esc(s.model) + '</span>' +
            '<b>' + esc(L(s.name)) + '</b><span class="sh">' + esc(L(s.short)) + '</span>' +
            '<span class="outchip out-' + s.out + '">' + esc(t('out_' + s.out)) + '</span></button>';
        }).join('') + '</div>';
      });
      return h;
    }
    function basicsHTML() {
      return '<button class="linkbtn" type="button" data-back>' + esc(t('s_back')) + '</button><h3 class="sd-title">' + esc(L(SL.basics.title)) + '</h3>' +
        '<div class="basics">' + SL.basics.items.map(function (i) {
          return '<section class="sd-sec"><h4>' + esc(L(i.h)) + '</h4><p>' + esc(L(i.t)) + '</p></section>'; }).join('') + '</div>';
    }

    /* ---- Bağlantı şeması (SVG) ---- */
    function wiring(s, board) {
      var n = s.pins.length, rowH = 42, top = 64, Wd = 600, H = top + n * rowH + 16;
      var bx = Wd - 196, sigI = 0, rows = '';
      var boardName = board === 'uno' ? 'Arduino Uno' : 'ESP32';
      s.pins.forEach(function (p, i) {
        var y = top + i * rowH + rowH / 2, to = board === 'uno' ? p.uno : p.esp, col;
        if (p.r === 'vcc') col = 'var(--w-red)'; else if (p.r === 'gnd') col = 'var(--w-gnd)'; else if (p.r === 'sig') col = SIGCOL[sigI++ % SIGCOL.length];
        rows += '<text class="wl" x="176" y="' + (y + 5) + '" text-anchor="end">' + esc(pinName(p.p)) + '</text>';
        rows += '<text class="wl" x="' + (bx + 14) + '" y="' + (y + 5) + '">' + esc(p.r === 'nc' ? t('s_nc') : to) + '</text>';
        if (p.r === 'nc') { rows += '<circle cx="186" cy="' + y + '" r="5" class="wdot-nc"/>'; return; }
        rows += '<line x1="186" y1="' + y + '" x2="' + bx + '" y2="' + y + '" stroke="' + col + '" stroke-width="6" stroke-linecap="round"/>';
        rows += '<circle cx="186" cy="' + y + '" r="6" fill="' + col + '"/><circle cx="' + bx + '" cy="' + y + '" r="6" fill="' + col + '"/>';
        if (p.div && board !== 'uno') {
          var mx = (186 + bx) / 2;
          rows += '<rect x="' + (mx - 34) + '" y="' + (y - 11) + '" width="68" height="22" rx="5" class="wdiv"/>' +
            '<text class="wdivt" x="' + mx + '" y="' + (y + 5) + '" text-anchor="middle">' + esc(t('s_div')) + '</text>';
        }
      });
      return '<svg class="wiring" viewBox="0 0 ' + Wd + ' ' + H + '" role="img" aria-label="' + esc(L(s.name) + ' → ' + boardName) + '">' +
        '<rect x="8" y="10" width="186" height="' + (H - 20) + '" rx="14" class="wbox"/>' +
        '<text class="wh" x="20" y="36">' + esc(s.model) + '</text>' +
        '<rect x="' + bx + '" y="10" width="186" height="' + (H - 20) + '" rx="14" class="wbox wboard"/>' +
        '<text class="wh" x="' + (bx + 14) + '" y="36">' + esc(boardName) + '</text>' + rows + '</svg>';
    }

    /* ---- Dene ve gör ---- */
    function simHTML(s) {
      var c = SIM[s.id]; if (!c) return '';
      var v = st.sim, inner = '';
      if (c.k === 'dig') {
        inner = '<button class="simtog" type="button" data-simtog aria-pressed="' + !!v.on + '">' + esc(L(c.on)) + '</button>';
      } else if (c.k === 'ana') {
        inner = '<label class="simrow"><span>' + esc(L(c.lab)) + '</span><input type="range" min="0" max="100" value="' + (v.p != null ? v.p : 40) + '" data-sim="p"></label>';
      } else if (c.k === 'dist') {
        inner = '<label class="simrow"><span>' + esc(t('sim_dist')) + '</span><input type="range" min="2" max="400" value="' + (v.cm || 20) + '" data-sim="cm"></label>';
      } else if (c.k === 'dht') {
        inner = '<label class="simrow"><span>' + esc(t('sim_temp')) + '</span><input type="range" min="0" max="50" value="' + (v.tc != null ? v.tc : 24) + '" data-sim="tc"></label>' +
          '<label class="simrow"><span>' + esc(t('sim_hum')) + '</span><input type="range" min="20" max="90" value="' + (v.h || 45) + '" data-sim="h"></label>';
      } else if (c.k === 'tilt') {
        inner = '<label class="simrow"><span>' + esc(t('sim_tilt')) + '</span><input type="range" min="-90" max="90" value="' + (v.a || 0) + '" data-sim="a"></label>';
      } else if (c.k === 'rfid') {
        inner = '<div class="row">' + CARDS.map(function (cd, i) {
          return '<button class="minibtn" type="button" data-card="' + i + '" aria-pressed="' + (v.card === i) + '">' + esc(L(cd.name)) + '</button>'; }).join('') +
          '<button class="minibtn" type="button" data-card="-1" aria-pressed="' + (v.card == null || v.card < 0) + '">' + esc(t('sim_none')) + '</button></div>';
      }
      return '<div class="simbox"><div class="eyebrow">' + IC('hand') + esc(t('s_try')) + '</div>' + inner + '<div class="simout" id="simOut" aria-live="polite"></div></div>';
    }
    function simOut(s) {
      var c = SIM[s.id], v = st.sim, el = $('simOut'); if (!c || !el) return;
      var h = '';
      if (c.k === 'dig') {
        var high = v.on ? c.high : !c.high;
        h = '<span class="code">digitalRead()</span> → <b class="' + (high ? 'hi' : 'lo') + '">' + (high ? 'HIGH (1)' : 'LOW (0)') + '</b>';
      } else if (c.k === 'ana') {
        var p = v.p != null ? v.p : 40, f = c.a + (c.b - c.a) * p / 100;
        h = '<span class="code">analogRead()</span> → Uno: <b>' + Math.round(f * 1023) + '</b> / 1023 · ESP32: <b>' + Math.round(f * 4095) + '</b> / 4095' +
          '<div class="bar"><i style="width:' + Math.round(f * 100) + '%"></i></div><small>' + esc(t('sim_volt', { v: num(f * 5, 1) })) + ' ' +
          esc(c.note ? L(c.note) : '') + ' ' + esc(t('sim_approx')) + '</small>';
      } else if (c.k === 'dist') {
        var cm = v.cm || 20, us = Math.round(cm * 58);
        h = esc(t('sim_echo', { us: us, cm: cm }));
      } else if (c.k === 'dht') {
        h = '<span class="code">readTemperature()</span> → <b>' + (v.tc != null ? v.tc : 24) + ' °C</b> · <span class="code">readHumidity()</span> → <b>%' + (v.h || 45) + '</b>';
      } else if (c.k === 'tilt') {
        var a = (v.a || 0) * Math.PI / 180;
        h = esc(t('sim_mpu', { x: num(9.81 * Math.sin(a), 1), z: num(9.81 * Math.cos(a), 1) }));
      } else if (c.k === 'rfid') {
        if (v.card == null || v.card < 0) h = esc(t('sim_wait'));
        else { var cd = CARDS[v.card]; h = esc(t('sim_uid', { uid: cd.uid })) + '<br><b class="' + (cd.ok ? 'hi' : 'lo') + '">' + esc(cd.ok ? t('sim_known') : t('sim_unknown')) + '</b>'; }
      }
      el.innerHTML = h;
    }

    /* ---- Ayrıntı ---- */
    function detailHTML(s) {
      var b = st.board;
      var boardBtns = ['uno', 'esp32'].map(function (k) {
        return '<button type="button" class="seg" data-board="' + k + '" aria-pressed="' + (b === k) + '">' + esc(L(SL.boards[k])) + '</button>'; }).join('');
      var table = '<div class="tscroll"><table class="ptable"><thead><tr><th>' + esc(t('s_pin')) + '</th><th>' + esc(b === 'uno' ? 'Arduino Uno' : 'ESP32') + '</th><th>' + esc(t('s_why')) + '</th></tr></thead><tbody>' +
        s.pins.map(function (p) {
          var to = p.r === 'nc' ? t('s_nc') : (b === 'uno' ? p.uno : p.esp) + (p.div && b !== 'uno' ? ' (' + t('s_div') + ')' : '');
          return '<tr><td><span class="pdot r-' + p.r + '"></span><b>' + esc(pinName(p.p)) + '</b></td><td class="mono">' + esc(to) + '</td><td>' + esc(L(p.why)) + '</td></tr>'; }).join('') +
        '</tbody></table></div>';
      var compat = ['uno', 'esp32', 'microbit', 'rpi'].map(function (k) {
        var x = s.boards[k]; if (!x) return '';
        return '<div class="crow"><span class="cst st-' + x.st + '">' + esc(t('s_' + x.st)) + '</span><b>' + esc(L(SL.boards[k])) + '</b><span>' + esc(L(x.note)) + '</span></div>'; }).join('');
      var story = s.chapter ? '<span class="schapter">' + esc(t('s_inStory') + chapterName(s.chapter)) + '</span>' : '';
      return '<button class="linkbtn" type="button" data-back>' + esc(t('s_back')) + '</button>' +
        '<div class="sd-head"><span class="model big">' + esc(s.model) + '</span><h3 class="sd-title">' + esc(L(s.name)) + '</h3>' +
        '<p class="sd-short">' + esc(L(s.short)) + '</p><div class="row"><span class="outchip out-' + s.out + '">' + esc(t('out_' + s.out)) + '</span>' + story + '</div></div>' +
        '<div class="facts"><div><span class="eyebrow">' + IC('bolt') + esc(t('s_volt')) + '</span><p>' + esc(L(s.volt)) + '</p></div>' +
        '<div><span class="eyebrow">' + IC('signal') + esc(t('s_output')) + '</span><p>' + esc(L(s.output)) + '</p></div></div>' +
        '<section class="sd-sec"><h4>' + IC('gear') + ' ' + esc(t('s_how')) + '</h4><p>' + esc(L(s.how)) + '</p></section>' +
        '<section class="sd-sec"><div class="row" style="justify-content:space-between"><h4>' + IC('plug') + ' ' + esc(t('s_wiring')) + '</h4><div class="segs" role="group">' + boardBtns + '</div></div>' +
        wiring(s, b) + '<div class="wlegend"><span><i style="background:var(--w-red)"></i>VCC</span><span><i style="background:var(--w-gnd)"></i>GND</span><span><i style="background:' + SIGCOL[0] + '"></i>' + esc(t('s_signal')) + '</span></div>' +
        table + '<p class="note">' + esc(t('s_pinNote')) + '</p></section>' +
        '<section class="sd-sec"><h4>' + IC('wave') + ' ' + esc(t('s_react')) + '</h4><p>' + esc(L(s.react)) + '</p>' + simHTML(s) + '</section>' +
        '<section class="sd-sec"><h4>' + IC('chip') + ' ' + esc(t('s_boards')) + '</h4><div class="compat">' + compat + '</div></section>' +
        '<div class="two"><section class="sd-sec"><h4>' + IC('layers') + ' ' + esc(t('s_types')) + '</h4><ul>' + s.types.map(function (x) { return '<li>' + esc(L(x)) + '</li>'; }).join('') + '</ul></section>' +
        '<section class="sd-sec"><h4>' + IC('home') + ' ' + esc(t('s_uses')) + '</h4><ul>' + s.uses.map(function (x) { return '<li>' + esc(L(x)) + '</li>'; }).join('') + '</ul></section></div>' +
        '<div class="caution">' + IC('alert') + ' <b>' + esc(t('s_caution')) + ': </b>' + esc(L(s.caution)) + '</div>' +
        '<section class="sd-sec"><div class="row" style="justify-content:space-between"><h4>' + IC('code') + ' ' + esc(t('s_code')) + '</h4><button class="minibtn" type="button" data-copycode>' + esc(t('copy')) + '</button></div>' +
        (s.lib ? '<p class="note"><b>' + esc(t('s_lib')) + '</b>' + esc(L(s.lib)) + '</p>' : '') +
        '<div class="tscroll"><pre class="acode" id="sensorCode">' + esc(L(s.code)) + '</pre></div><p class="note">' + esc(t('s_codeNote')) + '</p></section>';
    }

    function render() {
      var body = $('sensorBody'), s = st.id && byId(st.id);
      if (st.view === 'detail' && s) { body.innerHTML = detailHTML(s); simOut(s); }
      else if (st.view === 'basics') body.innerHTML = basicsHTML();
      else { st.view = 'grid'; body.innerHTML = gridHTML(); }
      $('sensorTitle').innerHTML = IC('chip') + esc(t('sensorLib'));
    }
    function open(id) {
      if (id && byId(id)) { st.view = 'detail'; st.id = id; st.sim = {}; } else { st.view = 'grid'; st.id = null; }
      render(); api.showModal('sensorModal'); $('sensorBody').scrollTop = 0; $('sensorModal').querySelector('.card').scrollTop = 0;
    }
    function chips(ids) {
      return (ids || []).filter(byId).map(function (id) {
        var s = byId(id); return '<button class="schip" type="button" data-sensor="' + id + '">' + esc(L(s.name)) + '</button>'; }).join('');
    }

    $('sensorBody').addEventListener('click', function (e) {
      var x;
      if ((x = e.target.closest('[data-sensor]'))) { st.view = 'detail'; st.id = x.getAttribute('data-sensor'); st.sim = {}; render(); $('sensorModal').querySelector('.card').scrollTop = 0; return; }
      if (e.target.closest('[data-back]')) { st.view = 'grid'; render(); return; }
      if (e.target.closest('[data-basics]')) { st.view = 'basics'; render(); $('sensorModal').querySelector('.card').scrollTop = 0; return; }
      if ((x = e.target.closest('[data-board]'))) { st.board = x.getAttribute('data-board'); render(); return; }
      if (e.target.closest('[data-simtog]')) { st.sim.on = !st.sim.on; e.target.closest('[data-simtog]').setAttribute('aria-pressed', st.sim.on); simOut(byId(st.id)); return; }
      if ((x = e.target.closest('[data-card]'))) {
        st.sim.card = +x.getAttribute('data-card');
        document.querySelectorAll('#sensorBody [data-card]').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-card') === st.sim.card || (st.sim.card < 0 && b.getAttribute('data-card') === '-1')); });
        simOut(byId(st.id)); return;
      }
      if ((x = e.target.closest('[data-copycode]'))) {
        var txt = $('sensorCode').textContent, btn = x;
        var sel = function () { var r = document.createRange(); r.selectNodeContents($('sensorCode')); var w = window.getSelection(); w.removeAllRanges(); w.addRange(r); };
        try { navigator.clipboard.writeText(txt).then(function () { btn.textContent = t('copied'); }, sel); } catch (er) { sel(); }
      }
    });
    $('sensorBody').addEventListener('input', function (e) {
      var k = e.target.getAttribute && e.target.getAttribute('data-sim'); if (!k) return;
      st.sim[k] = +e.target.value; simOut(byId(st.id));
    });

    return { open: open, render: render, chips: chips, byId: byId };
  };
})(window);
