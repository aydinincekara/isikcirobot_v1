/* afi kod - Python oyun tasarımı bölümü
 * Oyun dünyası: 400x400, (0,0) ortada, adımlar 20'lik. Oyuncu (seçilen robot) ve bir elma var.
 * Program: "oyun başlayınca", "tuşa basılınca" ve "her adımda" blokları. Test: senaryodaki tuş basışları adım adım
 * uygulanır, her adımın sonunda oyuncu/elma konumu, puan, mesaj ve "oyun bitti" durumu beklenenle karşılaştırılır.
 * İndirilen .py dosyası Python'un turtle modülüyle gerçekten oynanan bir oyundur (ek kurulum yok).
 */
(function (root) {
  'use strict';
  var B = root.Blockly, PY = root.python.pythonGenerator, JS = root.javascript.javascriptGenerator;
  var PO = root.python.Order, JO = root.javascript.Order;
  var KINDS = root.KINDS = root.KINDS || {};
  var COL = { hat: '#D9822B', move: '#2BA88A', score: '#C2417A', look: '#5B6BD6', sense: '#3A9BD9' };
  function lg() { return root.KINDS_LANG === 'en' ? 'en' : 'tr'; }
  var KEYS = { R: 'Right', L: 'Left', U: 'Up', D: 'Down', S: 'space' };
  var KEYCODE = { ArrowRight: 'R', ArrowLeft: 'L', ArrowUp: 'U', ArrowDown: 'D', ' ': 'S' };
  var NM = {
    tr: { player: 'oyuncu', apple: 'elma', score: 'puan', over: 'oyun_bitti', msg: 'mesaj', showScore: 'puani_yaz', say: 'ekrana_yaz', start: 'baslangic', tick: 'her_adim',
      R: 'sag_ok', L: 'sol_ok', U: 'yukari_ok', D: 'asagi_ok', S: 'bosluk', runStart: 'basla', runTick: 'adim', loop: 'dongu' },
    en: { player: 'player', apple: 'apple', score: 'score', over: 'game_over', msg: 'message', showScore: 'show_score', say: 'show_message', start: 'on_start', tick: 'every_step',
      R: 'right_key', L: 'left_key', U: 'up_key', D: 'down_key', S: 'space_key', runStart: 'start', runTick: 'step', loop: 'game_loop' }
  };
  function N(k) { return NM[lg()][k]; }

  /* ---------- Bloklar ---------- */
  var stmt = { previousStatement: null, nextStatement: null };
  function def(type, o) { B.Blocks[type] = { init: function () { this.jsonInit(Object.assign({ type: type, tooltip: '%{BKY_' + type.toUpperCase() + '_TIP}' }, o)); } }; }
  function hat(type, msg, args) { var o = { message0: msg, message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], colour: COL.hat }; if (args) o.args0 = args; def(type, o); }
  var OBJ = [['%{BKY_G_PLAYER}', 'player'], ['%{BKY_G_APPLE}', 'apple']];
  hat('g_start', '%{BKY_G_START}');
  hat('g_key', '%{BKY_G_KEY}', [{ type: 'field_dropdown', name: 'K', options: [['%{BKY_G_K_R}', 'R'], ['%{BKY_G_K_L}', 'L'], ['%{BKY_G_K_U}', 'U'], ['%{BKY_G_K_D}', 'D'], ['%{BKY_G_K_S}', 'S']] }]);
  hat('g_tick', '%{BKY_G_TICK}');
  def('g_change', Object.assign({ message0: '%{BKY_G_CHANGE}', args0: [{ type: 'field_dropdown', name: 'O', options: OBJ }, { type: 'field_dropdown', name: 'A', options: [['x', 'x'], ['y', 'y']] }, { type: 'input_value', name: 'N', check: 'Number' }], inputsInline: true, colour: COL.move }, stmt));
  def('g_goto', Object.assign({ message0: '%{BKY_G_GOTO}', args0: [{ type: 'field_dropdown', name: 'O', options: OBJ }, { type: 'input_value', name: 'X', check: 'Number' }, { type: 'input_value', name: 'Y', check: 'Number' }], inputsInline: true, colour: COL.move }, stmt));
  def('g_random', Object.assign({ message0: '%{BKY_G_RANDOM}', args0: [{ type: 'field_dropdown', name: 'W', options: [['%{BKY_G_ANY}', 'any'], ['%{BKY_G_TOP}', 'top']] }], colour: COL.move }, stmt));
  def('g_score', Object.assign({ message0: '%{BKY_G_SCORE}', args0: [{ type: 'input_value', name: 'N', check: 'Number' }], inputsInline: true, colour: COL.score }, stmt));
  def('g_say', Object.assign({ message0: '%{BKY_G_SAY}', args0: [{ type: 'input_value', name: 'T' }], inputsInline: true, colour: COL.look }, stmt));
  def('g_stop', Object.assign({ message0: '%{BKY_G_STOP}', colour: COL.look }, { previousStatement: null }));
  def('g_touch', { message0: '%{BKY_G_TOUCH}', output: 'Boolean', colour: COL.sense });
  def('g_pos', { message0: '%{BKY_G_POS}', args0: [{ type: 'field_dropdown', name: 'O', options: OBJ }, { type: 'field_dropdown', name: 'A', options: [['x', 'x'], ['y', 'y']] }], output: 'Number', colour: COL.sense });
  def('g_scorev', { message0: '%{BKY_G_SCOREV}', output: 'Number', colour: COL.score });
  var HATS = ['g_start', 'g_key', 'g_tick'];
  var TYPES = HATS.concat(['g_change', 'g_goto', 'g_random', 'g_score', 'g_say', 'g_stop', 'g_touch', 'g_pos', 'g_scorev']);

  /* ---------- Python ---------- */
  function obj(b) { return N(b.getFieldValue('O')); }
  function pv(b, n, d) { return PY.valueToCode(b, n, PO.NONE) || d; }
  function jv(b, n, d) { return JS.valueToCode(b, n, JO.NONE) || d; }
  function hatPyName(b) { return b.type === 'g_start' ? N('start') : b.type === 'g_tick' ? N('tick') : N(b.getFieldValue('K')); }
  PY.forBlock.g_start = PY.forBlock.g_key = PY.forBlock.g_tick = function (b) {
    var nm = PY.__gname(hatPyName(b)), body = PY.statementToCode(b, 'DO') || '';
    var guard = b.type === 'g_start' ? '' : PY.INDENT + 'if ' + N('over') + ':\n' + PY.INDENT + PY.INDENT + 'return\n';
    PY.__ghats.push({ type: b.type, name: nm, key: b.type === 'g_key' ? b.getFieldValue('K') : null });
    return 'def ' + nm + '():\n' + PY.INDENT + 'global ' + N('score') + ', ' + N('over') + '\n' + guard + (body || PY.INDENT + 'pass\n') + '\n';
  };
  PY.forBlock.g_change = function (b) { var o = obj(b), a = b.getFieldValue('A'); return o + '.set' + a + '(' + o + '.' + a + 'cor() + ' + pv(b, 'N', '0') + ')\n'; };
  PY.forBlock.g_goto = function (b) { return obj(b) + '.goto(' + pv(b, 'X', '0') + ', ' + pv(b, 'Y', '0') + ')\n'; };
  PY.forBlock.g_random = function (b) { return N('apple') + '.goto(random.randint(-9, 9) * 20, ' + (b.getFieldValue('W') === 'top' ? '180' : 'random.randint(-9, 9) * 20') + ')\n'; };
  PY.forBlock.g_score = function (b) { return N('score') + ' = ' + N('score') + ' + ' + pv(b, 'N', '1') + '\n' + N('showScore') + '()\n'; };
  PY.forBlock.g_say = function (b) { return N('say') + '(' + pv(b, 'T', '""') + ')\n'; };
  PY.forBlock.g_stop = function () { return N('over') + ' = True\n'; };
  PY.forBlock.g_touch = function () { return [N('player') + '.distance(' + N('apple') + ') < 20', PO.RELATIONAL]; };
  PY.forBlock.g_pos = function (b) { return [obj(b) + '.' + b.getFieldValue('A') + 'cor()', PO.FUNCTION_CALL]; };
  PY.forBlock.g_scorev = function () { return [N('score'), PO.ATOMIC]; };

  /* ---------- JavaScript (görünüm ve benzetim) ---------- */
  JS.forBlock.g_start = function (b) { return 'oyun.onStart(function () {\n' + JS.statementToCode(b, 'DO') + '});\n'; };
  JS.forBlock.g_tick = function (b) { return 'oyun.onTick(function () {\n' + JS.statementToCode(b, 'DO') + '});\n'; };
  JS.forBlock.g_key = function (b) { return 'oyun.onKey("' + KEYS[b.getFieldValue('K')] + '", function () {\n' + JS.statementToCode(b, 'DO') + '});\n'; };
  JS.forBlock.g_change = function (b) { return 'oyun.change("' + b.getFieldValue('O') + '", "' + b.getFieldValue('A') + '", ' + jv(b, 'N', '0') + ');\n'; };
  JS.forBlock.g_goto = function (b) { return 'oyun.goto("' + b.getFieldValue('O') + '", ' + jv(b, 'X', '0') + ', ' + jv(b, 'Y', '0') + ');\n'; };
  JS.forBlock.g_random = function (b) { return 'oyun.randomApple("' + b.getFieldValue('W') + '");\n'; };
  JS.forBlock.g_score = function (b) { return 'oyun.addScore(' + jv(b, 'N', '1') + ');\n'; };
  JS.forBlock.g_say = function (b) { return 'oyun.say(' + jv(b, 'T', '""') + ');\n'; };
  JS.forBlock.g_stop = function () { return 'oyun.stop();\n'; };
  JS.forBlock.g_touch = function () { return ['oyun.touching()', JO.FUNCTION_CALL]; };
  JS.forBlock.g_pos = function (b) { return ['oyun.pos("' + b.getFieldValue('O') + '", "' + b.getFieldValue('A') + '")', JO.FUNCTION_CALL]; };
  JS.forBlock.g_scorev = function () { return ['oyun.score()', JO.FUNCTION_CALL]; };

  /* ---------- Araç kutusu ---------- */
  function num(n) { return { shadow: { type: 'math_number', fields: { NUM: n } } }; }
  function toolEntry(spec) {
    var p = spec.split(':'), k = p[0];
    switch (k) {
      case 'start': return { kind: 'block', type: 'g_start' };
      case 'key': return { kind: 'block', type: 'g_key', fields: { K: p[1] || 'R' } };
      case 'tick': return { kind: 'block', type: 'g_tick' };
      case 'change': return { kind: 'block', type: 'g_change', fields: { O: p[1] || 'player', A: p[2] || 'x' }, inputs: { N: num(+(p[3] || 20)) } };
      case 'goto': return { kind: 'block', type: 'g_goto', fields: { O: p[1] || 'player' }, inputs: { X: num(+(p[2] || 0)), Y: num(+(p[3] || 0)) } };
      case 'random': return { kind: 'block', type: 'g_random', fields: { W: p[1] || 'any' } };
      case 'score': return { kind: 'block', type: 'g_score', inputs: { N: num(+(p[1] || 1)) } };
      case 'say': return { kind: 'block', type: 'g_say', inputs: { T: { shadow: { type: 'text', fields: { TEXT: p.slice(1).join(':') || '!' } } } } };
      case 'stop': return { kind: 'block', type: 'g_stop' };
      case 'touch': return { kind: 'block', type: 'g_touch' };
      case 'pos': return { kind: 'block', type: 'g_pos', fields: { O: p[1] || 'player', A: p[2] || 'x' } };
      case 'scorev': return { kind: 'block', type: 'g_scorev' };
      case 'if': return { kind: 'block', type: 'controls_if' };
      case 'compare': return { kind: 'block', type: 'logic_compare', fields: { OP: p[1] || 'LT' }, inputs: { B: num(+(p[2] || 0)) } };
    }
    return { kind: 'block', type: spec };
  }

  /* ---------- Kod parçaları ---------- */
  function rank(b) { return b.type === 'g_start' ? 0 : b.type === 'g_key' ? 1 : b.type === 'g_tick' ? 2 : 3; }
  function tops(ws) { return ws.getTopBlocks(true).filter(function (b) { return !b.isShadow(); }).map(function (b, i) { return [b, i]; }).sort(function (a, c) { return rank(a[0]) - rank(c[0]) || a[1] - c[1]; }).map(function (x) { return x[0]; }); }
  function genAll(gen, ws) {
    gen.init(ws); var used = {};
    gen.__ghats = []; gen.__gname = function (n) { used[n] = (used[n] || 0) + 1; return used[n] > 1 ? n + '_' + used[n] : n; };
    var parts = []; tops(ws).forEach(function (b) { var c = gen.blockToCode(b); if (Array.isArray(c)) c = ''; if (c) parts.push(c); });
    return gen.finish(parts.join('\n')).replace(/\n{3,}/g, '\n\n').trim();
  }
  function regLines(hats) {
    var sc = lg() === 'en' ? 'screen' : 'ekran';
    return hats.filter(function (h) { return h.type === 'g_key'; }).map(function (h) { return sc + '.onkey(' + h.name + ', "' + KEYS[h.key] + '")'; });
  }
  function toPython(ws) {
    var body = genAll(PY, ws), hats = PY.__ghats, en = lg() === 'en';
    var reg = regLines(hats);
    return 'import turtle, random\n# ' + (en ? 'player, apple, score ... are prepared in the downloadable file' : 'oyuncu, elma, puan ... indirilen dosyada hazırlanır') + '\n\n' +
      (body || (en ? '# no blocks yet' : '# henüz blok yok')) + (reg.length ? '\n\n' + reg.join('\n') : '');
  }
  function toJS(ws) { return genAll(JS, ws); }
  function runCode(ws) { JS.STATEMENT_PREFIX = 'highlightBlock(%1);\n'; try { return genAll(JS, ws); } finally { JS.STATEMENT_PREFIX = null; } }

  /* ---------- Oyun motoru ---------- */
  function startOf(st, sc, k) { return (sc && sc[k]) || st[k] || (k === 'p0' ? [0, 0] : [100, 100]); }
  function Game(st, sc, code, live) {
    var g = this; g.st = st; g.sc = sc || { keys: '', rand: [] }; g.live = live;
    var p0 = startOf(st, sc, 'p0'), a0 = startOf(st, sc, 'a0');
    g.p = { x: p0[0], y: p0[1] }; g.a = { x: a0[0], y: a0[1] };
    g.score = 0; g.over = false; g.msg = ''; g.h = { start: [], tick: [], key: {} }; g.cur = null; g.err = null; g.outcome = 'done'; g.ri = 0; g.events = [];
    var budget = 3000;
    function tick() { if (--budget < 0) throw { gm: 'loop' }; }
    function o(n) { return n === 'apple' ? g.a : g.p; }
    function rnd() { tick(); if (g.live) return Math.floor(Math.random() * 19) - 9; var r = g.sc.rand || []; var v = r.length ? r[g.ri % r.length] : 0; g.ri++; return v; }
    function ev(e) { e.b = g.cur; g.events.push(e); }
    var api = {
      onStart: function (f) { g.h.start.push(f); }, onTick: function (f) { g.h.tick.push(f); },
      onKey: function (k, f) { (g.h.key[k] = g.h.key[k] || []).push(f); },
      change: function (n, a, d) { tick(); o(n)[a] += Number(d) || 0; ev({ k: 'move' }); },
      goto: function (n, x, y) { tick(); o(n).x = Number(x) || 0; o(n).y = Number(y) || 0; ev({ k: 'move' }); },
      randomApple: function (w) { var x = rnd() * 20, y = w === 'top' ? 180 : rnd() * 20; g.a.x = x; g.a.y = y; ev({ k: 'move' }); },
      addScore: function (n) { tick(); g.score += Number(n) || 0; ev({ k: 'score' }); },
      say: function (t) { tick(); g.msg = String(t); ev({ k: 'say' }); },
      stop: function () { tick(); g.over = true; ev({ k: 'stop' }); },
      touching: function () { tick(); return Math.hypot(g.p.x - g.a.x, g.p.y - g.a.y) < 20; },
      pos: function (n, a) { tick(); return o(n)[a]; }, score: function () { return g.score; }
    };
    g.call = function (f, guard) { if (guard && g.over) return; budget = 3000; g.cur = null; try { f(); } catch (e) { g.outcome = e && e.gm ? e.gm : 'error'; g.err = e && !e.gm ? String(e.message || e) : null; throw e; } };
    try { new Function('oyun', 'highlightBlock', '"use strict";\n' + code)(api, function (id) { g.cur = id; tick(); }); }
    catch (e) { g.outcome = 'error'; g.err = String(e && e.message || e); }
  }
  Game.prototype.snap = function () { return [this.p.x, this.p.y, this.a.x, this.a.y, this.score, this.over ? 1 : 0, this.msg]; };
  Game.prototype.begin = function () { var g = this; g.h.start.forEach(function (f) { g.call(f, false); }); };
  Game.prototype.key = function (k) { var g = this; (g.h.key[KEYS[k]] || []).forEach(function (f) { g.call(f, true); }); };
  Game.prototype.step = function () { var g = this; g.h.tick.forEach(function (f) { g.call(f, true); }); };

  function simulate(st, code, vi) {
    var sc = st.scen[vi || 0], g = new Game(st, sc, code), frames = [], keys = sc.keys;
    var f0 = { snap: null, ev: [] };
    try {
      if (g.outcome === 'done') {
        g.begin(); f0.snap = g.snap(); f0.ev = g.events.splice(0);
        for (var t = 0; t < sc.dur; t++) {
          var k = keys[t] && keys[t] !== '.' ? keys[t] : null;
          if (k) g.key(k);
          g.step();
          frames.push({ t: t, key: k, snap: g.snap(), ev: g.events.splice(0) });
        }
      }
    } catch (e) { /* çıktı g.outcome içinde */ }
    if (!f0.snap) f0.snap = g.snap();
    return { start: f0, frames: frames, outcome: g.outcome, err: g.err, dur: sc.dur };
  }
  var FIELD = ['px', 'py', 'ax', 'ay', 'score', 'over', 'msg'];
  function check(st, res, vi) {
    if (res.outcome !== 'done') return { ok: false, why: res.outcome, perTick: [] };
    var exp = st.exp[vi || 0], per = [], fail = null;
    for (var t = 0; t < exp.length; t++) {
      var got = res.frames[t] ? res.frames[t].snap : null, ok = !!got;
      for (var i = 0; ok && i < 7; i++) if (i === 6 ? !!got[i] !== !!exp[t][i] : String(got[i]) !== String(exp[t][i])) { ok = false; if (!fail) fail = { t: t, f: i, want: exp[t], got: got }; }
      if (!got && !fail) fail = { t: t, f: 0, want: exp[t], got: null };
      per.push(ok);
    }
    var fb = null;
    if (fail && res.frames[fail.t]) { var e = res.frames[fail.t].ev; fb = e.length ? e[e.length - 1].b : null; }
    return { ok: !fail, fail: fail, perTick: per, failBlock: fb };
  }
  function run(ws, st) {
    var code = runCode(ws), results = st.scen.map(function (_, i) { var r = simulate(st, code, i); r.check = check(st, r, i); return r; });
    var fail = -1; for (var i = 0; i < results.length; i++) if (!results[i].check.ok) { fail = i; break; }
    return { results: results, fail: fail };
  }
  function failText(res, t, lang) {
    var c = res.check;
    if (res.outcome === 'loop') return t('st_loop');
    if (res.outcome === 'error') return t('st_error');
    var f = c.fail, w = f.want, g = f.got || w, step = f.t + 1;
    if (f.f <= 1) return t('gm_failP', { n: step, w: '(' + w[0] + ', ' + w[1] + ')', g: '(' + g[0] + ', ' + g[1] + ')' });
    if (f.f <= 3) return t('gm_failA', { n: step, w: '(' + w[2] + ', ' + w[3] + ')', g: '(' + g[2] + ', ' + g[3] + ')' });
    if (f.f === 4) return t('gm_failS', { n: step, w: w[4], g: g[4] });
    if (f.f === 5) return t(w[5] ? 'gm_failOver1' : 'gm_failOver0', { n: step });
    return t(w[6] ? 'gm_failM1' : 'gm_failM0', { n: step });
  }

  /* ---------- Çizim ---------- */
  function view(st, vi) { var sc = st.scen[vi || 0]; return { kind: 'game', st: st, vi: vi || 0, sc: sc, res: null, k: -1, frac: 0, live: null }; }
  var ASPECT = 1.2;
  function snapAt(v) {
    if (v.live) return v.live.snap();
    var st = v.st, p0 = startOf(st, v.sc, 'p0'), a0 = startOf(st, v.sc, 'a0'), base = [p0[0], p0[1], a0[0], a0[1], 0, 0, ''];
    if (!v.res) return base;
    var prev = v.res.start.snap; if (v.k < 0) return prev;
    var fr = v.res.frames, k = Math.min(v.k, fr.length - 1); if (k < 0) return prev;
    var a = k > 0 ? fr[k - 1].snap : prev, b = fr[k].snap, f = v.k >= fr.length ? 1 : v.frac;
    var out = b.slice(); [0, 1, 2, 3].forEach(function (i) { var jump = Math.abs(b[i] - a[i]) > 60; out[i] = jump ? (f < 0.5 ? a[i] : b[i]) : a[i] + (b[i] - a[i]) * Math.min(1, f * 1.6); });
    return out;
  }
  function draw(c, W, H, v, K, m) {
    var t = m.t, s = snapAt(v), top = 0, sz = W, sc = sz / 420, cx = W / 2, cy = top + sz / 2;
    function X(x) { return cx + x * sc; } function Y(y) { return cy - y * sc; }
    c.clearRect(0, 0, W, H);
    var gr = c.createLinearGradient(0, 0, 0, sz); gr.addColorStop(0, K.sky || '#DDEBFA'); gr.addColorStop(1, K.paper); c.fillStyle = gr; c.fillRect(0, 0, W, sz);
    c.strokeStyle = K.grid; c.lineWidth = 1; c.globalAlpha = 0.5;
    for (var g = -200; g <= 200; g += 20) { c.beginPath(); c.moveTo(X(g), Y(-200)); c.lineTo(X(g), Y(200)); c.stroke(); c.beginPath(); c.moveTo(X(-200), Y(g)); c.lineTo(X(200), Y(g)); c.stroke(); }
    c.globalAlpha = 1; c.strokeStyle = K.axis; c.lineWidth = 1.5; c.strokeRect(X(-200), Y(200), 400 * sc, 400 * sc);
    /* elma */
    var ax = X(s[2]), ay = Y(s[3]), r = 10 * sc;
    c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.ellipse(ax, ay + r * 0.9, r * 0.9, r * 0.3, 0, 0, 7); c.fill();
    c.fillStyle = '#E5484D'; c.beginPath(); c.arc(ax - r * 0.35, ay, r * 0.75, 0, 7); c.arc(ax + r * 0.35, ay, r * 0.75, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.arc(ax - r * 0.5, ay - r * 0.3, r * 0.22, 0, 7); c.fill();
    c.strokeStyle = '#6B4226'; c.lineWidth = r * 0.18; c.beginPath(); c.moveTo(ax, ay - r * 0.6); c.lineTo(ax + r * 0.15, ay - r * 1.05); c.stroke();
    c.fillStyle = '#22A06B'; c.beginPath(); c.ellipse(ax + r * 0.45, ay - r * 0.95, r * 0.35, r * 0.18, -0.5, 0, 7); c.fill();
    root.ROBOTS.draw(c, m.robot, X(s[0]), Y(s[1]), 30 * sc, {});
    /* puan ve mesaj */
    c.font = '800 ' + Math.round(15 * sc) + 'px Nunito, sans-serif'; c.textBaseline = 'top'; c.textAlign = 'left';
    var lbl = t('gm_score') + ': ' + s[4], tw = c.measureText(lbl).width;
    c.fillStyle = K.panel; c.globalAlpha = 0.85; c.fillRect(X(-196), Y(196), tw + 16 * sc, 24 * sc); c.globalAlpha = 1;
    c.fillStyle = K.ink; c.fillText(lbl, X(-196) + 8 * sc, Y(196) + 5 * sc);
    if (s[6] || s[5]) {
      var msg = s[6] || t('gm_over'); c.font = '800 ' + Math.round(22 * sc) + 'px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      var mw = c.measureText(msg).width + 30 * sc; c.fillStyle = K.panel; c.globalAlpha = 0.92; c.fillRect(cx - mw / 2, Y(30), mw, 60 * sc); c.globalAlpha = 1;
      c.fillStyle = s[5] ? K.bad : K.ink; c.fillText(msg, cx, Y(0));
    }
    /* alt şerit: tuşlar ve test noktaları */
    var y0 = sz + 4, hh = H - y0 - 4;
    if (v.live) {
      c.fillStyle = K.ink2; c.font = '700 ' + Math.round(hh * 0.3) + 'px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(t('gm_liveHint'), W / 2, y0 + hh / 2); return;
    }
    var sc2 = v.sc, dur = sc2.dur, cw = (W - 20) / dur, chk = v.res && v.res.check;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (var i = 0; i < dur; i++) {
      var x = 10 + cw * (i + 0.5), kch = sc2.keys[i];
      var played = v.res && i < v.k + (v.k >= v.res.frames.length ? 1 : 0);
      if (kch && kch !== '.') {
        c.fillStyle = i === v.k ? K.accent : K.panel2; c.strokeStyle = K.line; c.lineWidth = 1;
        var bw = Math.min(cw * 0.86, hh * 0.5); c.fillRect(x - bw / 2, y0 + 2, bw, hh * 0.46); c.strokeRect(x - bw / 2, y0 + 2, bw, hh * 0.46);
        c.fillStyle = i === v.k ? '#fff' : K.ink; c.font = '800 ' + Math.round(hh * 0.28) + 'px Nunito, sans-serif';
        c.fillText({ R: '→', L: '←', U: '↑', D: '↓', S: '␣' }[kch], x, y0 + 2 + hh * 0.23);
      }
      var dy = y0 + hh * 0.78, ok = chk && chk.perTick[i];
      c.fillStyle = played && chk ? (ok ? K.ok : K.bad) : K.line; c.beginPath(); c.arc(x, dy, Math.min(cw * 0.22, hh * 0.13), 0, 7); c.fill();
    }
  }
  function play(v, res, h) {
    return new Promise(function (resolve) {
      v.res = res; v.k = -1; v.frac = 0;
      var fr = res.frames, end = res.check && !res.check.ok && res.check.fail ? res.check.fail.t + 1 : fr.length;
      if (h.reduce || !fr.length) { v.k = end; h.draw(); return resolve(true); }
      var ms = [0, 700, 520, 380, 250, 130][h.speed()] || 380, prev = null, el = 0, lastB = null;
      function frame(now) {
        if (h.cancelled()) return resolve(false);
        if (prev == null) prev = now; if (!h.paused()) el += now - prev; prev = now;
        var pos = el / ms; v.k = Math.min(end, Math.floor(pos)); v.frac = pos - Math.floor(pos);
        var f = fr[Math.min(v.k, fr.length - 1)], b = f && f.ev.length ? f.ev[f.ev.length - 1].b : null; if (b !== lastB) { h.highlight(b); lastB = b; }
        h.draw();
        if (v.k >= end) { v.k = end; h.draw(); return resolve(true); }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------- Canlı oyun: klavyeyle oyna ---------- */
  function live(ws, st, v, h) {
    var g = new Game(st, null, runCode(ws), true); v.live = g; v.res = null;
    if (g.outcome !== 'done') { v.live = null; return null; }
    try { g.begin(); } catch (e) { v.live = null; return null; }
    var timer = null, stopped = false;
    function onKey(e) {
      var k = KEYCODE[e.key]; if (!k || /input|select|textarea/i.test((e.target && e.target.tagName) || '')) return;
      e.preventDefault(); try { g.key(k); } catch (er) {} h.draw();
    }
    window.addEventListener('keydown', onKey);
    timer = setInterval(function () { if (h.paused()) return; try { g.step(); } catch (er) { stop(); } h.draw(); if (g.over) stop(); }, 160);
    function stop() { if (stopped) return; stopped = true; clearInterval(timer); window.removeEventListener('keydown', onKey); h.onEnd && h.onEnd(); }
    h.draw();
    return { stop: function () { stop(); v.live = null; h.draw(); } };
  }

  /* ---------- İndirilebilir oyun dosyası ---------- */
  function pyFile(ws, st) {
    var en = lg() === 'en', body = genAll(PY, ws), hats = PY.__ghats, n = NM[lg()], sc = en ? 'screen' : 'ekran';
    var starts = hats.filter(function (x) { return x.type === 'g_start'; }).map(function (x) { return x.name; });
    var ticks = hats.filter(function (x) { return x.type === 'g_tick'; }).map(function (x) { return x.name; });
    var p0 = st.p0 || [0, 0], a0 = st.a0 || [100, 100];
    var L = [];
    L.push(en ? '# AFI CODE - Python game (' + st.id + ')' : '# AFİ KOD - Python oyunu (' + st.id + ')');
    L.push(en ? '# How to play: open Command Prompt (type cmd in the Start menu), then type these one at a time and press Enter:' : '# Oynamak için: Başlat menüsüne cmd yazıp Komut İstemi\'ni aç, şunları teker teker yazıp Enter\'a bas:');
    L.push('#   python --version    (3.8+; ' + (en ? 'if "not recognized" try: py --version' : '"tanınmıyor" derse: py --version') + ')');
    L.push('#   cd Downloads');
    L.push('#   python ' + st.id + '.py');
    L.push(en ? '# Click the game window once, then use the arrow keys / space. No admin rights or extra installs needed.' : '# Oyun penceresine bir kez tıkla, sonra ok tuşları / boşluk ile oyna. Yönetici izni ve ek kurulum gerekmez.');
    L.push('');
    L.push('import turtle');
    L.push('import random');
    L.push('');
    L.push(sc + ' = turtle.Screen()');
    L.push(sc + '.title("' + (en ? 'AFI CODE' : 'AFİ KOD') + ' - ' + st.id + '")');
    L.push(sc + '.setup(440, 440)');
    L.push(sc + '.bgcolor("#EAF4FF")');
    L.push(sc + '.tracer(0)');
    L.push('');
    L.push(n.player + ' = turtle.Turtle()');
    L.push(n.player + '.shape("turtle")');
    L.push(n.player + '.color("#2F6FE4")');
    L.push(n.player + '.penup()');
    L.push(n.player + '.goto(' + p0[0] + ', ' + p0[1] + ')');
    L.push(n.apple + ' = turtle.Turtle()');
    L.push(n.apple + '.shape("circle")');
    L.push(n.apple + '.color("#E5484D")');
    L.push(n.apple + '.penup()');
    L.push(n.apple + '.goto(' + a0[0] + ', ' + a0[1] + ')');
    L.push('_' + (en ? 'writer' : 'yazici') + ' = turtle.Turtle()');
    L.push('_' + (en ? 'writer' : 'yazici') + '.hideturtle()');
    L.push('_' + (en ? 'writer' : 'yazici') + '.penup()');
    L.push('');
    L.push(n.score + ' = 0');
    L.push(n.over + ' = False');
    L.push(n.msg + ' = ""');
    L.push('');
    var W = '_' + (en ? 'writer' : 'yazici');
    L.push('def ' + n.showScore + '():');
    L.push('    ' + W + '.clear()');
    L.push('    ' + W + '.goto(-190, 180)');
    L.push('    ' + W + '.write("' + (en ? 'Score' : 'Puan') + ': " + str(' + n.score + '), font=("Arial", 14, "bold"))');
    L.push('    if ' + n.msg + ':');
    L.push('        ' + W + '.goto(0, 0)');
    L.push('        ' + W + '.write(' + n.msg + ', align="center", font=("Arial", 20, "bold"))');
    L.push('');
    L.push('def ' + n.say + '(' + (en ? 'text' : 'yazi') + '):');
    L.push('    global ' + n.msg);
    L.push('    ' + n.msg + ' = str(' + (en ? 'text' : 'yazi') + ')');
    L.push('    ' + n.showScore + '()');
    L.push('');
    L.push(en ? '# ---- your program ----' : '# ---- senin programın ----');
    L.push(body || 'pass');
    L.push('');
    L.push('def ' + n.runStart + '():');
    L.push(starts.length ? starts.map(function (x) { return '    ' + x + '()'; }).join('\n') : '    pass');
    L.push('');
    L.push('def ' + n.runTick + '():');
    L.push(ticks.length ? ticks.map(function (x) { return '    ' + x + '()'; }).join('\n') : '    pass');
    L.push('');
    L.push('def ' + n.loop + '():');
    L.push('    ' + n.runTick + '()');
    L.push('    ' + sc + '.update()');
    L.push('    ' + sc + '.ontimer(' + n.loop + ', 160)');
    L.push('');
    regLines(hats).forEach(function (l) { L.push(l); });
    L.push('');
    L.push('# ---- ' + (en ? 'the game starts' : 'oyun başlıyor') + ' ----');
    L.push(sc + '.listen()');
    L.push(n.runStart + '()');
    L.push(n.showScore + '()');
    L.push(n.loop + '()');
    L.push('turtle.done()');
    return L.join('\n') + '\n';
  }

  /* ---------- Üretici aracı için kancalar (tools/gen_py.js) ---------- */
  var genHooks = {
    prepare: function (st) {
      var ws = new B.Workspace(); B.serialization.workspaces.load(st.sol, ws); var code = runCode(ws); ws.dispose();
      st.exp = st.scen.map(function (_, i) { var r = simulate(Object.assign({}, st, { exp: null }), code, i); return r.frames.map(function (f) { return f.snap; }); });
    },
    passes: function (st, code) { return st.scen.every(function (_, i) { return check(st, simulate(st, code, i), i).ok; }); },
    pyPrep: function (py, st) {
      var en = /game_over/.test(py), n = NM[en ? 'en' : 'tr'];
      var cut = py.indexOf('# ---- ' + (en ? 'the game starts' : 'oyun başlıyor'));
      var H = [
        'import json as _json',
        '_SC = ' + JSON.stringify(st.scen.map(function (s) { return { dur: s.dur, keys: s.keys, rand: s.rand || [], p0: startOf(st, s, 'p0'), a0: startOf(st, s, 'a0') }; })),
        '_KEY = {"R": "Right", "L": "Left", "U": "Up", "D": "Down", "S": "space"}',
        '_out = []',
        'for _sc in _SC:',
        '    _seq = list(_sc["rand"]) or [0]',
        '    _i = [0]',
        '    def _rand(a, b):',
        '        v = _seq[_i[0] % len(_seq)]',
        '        _i[0] += 1',
        '        return v',
        '    random.randint = _rand',
        '    ' + n.player + '.goto(_sc["p0"][0], _sc["p0"][1])',
        '    ' + n.apple + '.goto(_sc["a0"][0], _sc["a0"][1])',
        '    ' + n.score + ' = 0',
        '    ' + n.over + ' = False',
        '    ' + n.msg + ' = ""',
        '    ' + n.runStart + '()',
        '    _st = []',
        '    for _t in range(_sc["dur"]):',
        '        _k = _sc["keys"][_t] if _t < len(_sc["keys"]) else "."',
        '        if _k != "." and _KEY[_k] in turtle._events["keys"]:',
        '            turtle._events["keys"][_KEY[_k]]()',
        '        ' + n.runTick + '()',
        '        _st.append([' + n.player + '.xcor(), ' + n.player + '.ycor(), ' + n.apple + '.xcor(), ' + n.apple + '.ycor(), ' + n.score + ', 1 if ' + n.over + ' else 0, ' + n.msg + '])',
        '    _out.append(_st)',
        'print("__STATES__" + _json.dumps(_out))'
      ];
      return py.slice(0, cut) + H.join('\n') + '\n';
    },
    pyCheck: function (st, out) {
      var m = out.match(/__STATES__(.*)/); if (!m) return 'çıktı yok';
      var got = JSON.parse(m[1]);
      for (var i = 0; i < st.exp.length; i++) for (var t = 0; t < st.exp[i].length; t++) {
        var a = st.exp[i][t], b = got[i][t];
        for (var j = 0; j < 7; j++) if (j < 4 ? Math.abs(a[j] - b[j]) > 1e-6 : j === 6 ? !!a[j] !== !!b[j] : String(a[j]) !== String(b[j])) return 'senaryo ' + (i + 1) + ' adım ' + (t + 1) + ' alan ' + j + ': ' + a[j] + ' / ' + b[j];
      }
      return null;
    }
  };

  KINDS.game = {
    types: TYPES, toolEntry: toolEntry, genHooks: genHooks,
    toolbox: function (st) { return { kind: 'flyoutToolbox', contents: st.tools.map(toolEntry) }; },
    solution: function (st) { return st.sol; },
    toPython: toPython, toJS: toJS, runCode: runCode, simulate: simulate, check: check,
    snippet: function (b, kind) { var g = kind === 'py' ? PY : JS; g.init(b.workspace); g.__ghats = []; g.__gname = function (x) { return x; }; var c = g.blockToCode(b, true); if (Array.isArray(c)) c = c[0]; c = String(c || '').replace(/\n+$/, ''); var L = c.split('\n'); return L.length > 9 ? L.slice(0, 8).join('\n') + '\n...' : c; },
    precheck: function (ws) {
      var tp = ws.getTopBlocks(false).filter(function (b) { return !b.isShadow(); });
      if (!tp.length) return { key: 'st_needBlock' };
      var loose = tp.filter(function (b) { return HATS.indexOf(b.type) < 0; });
      if (loose.length) return { key: 'gm_loose', block: loose[0].id };
      return null;
    },
    run: run, failText: failText, view: view, draw: draw, play: play, live: live, aspect: function () { return ASPECT; }, pyFile: pyFile,
    nVariants: function (st) { return st.scen.length; }, variantKey: 'gm_variantNote',
    readyKey: 'gm_ready', runningKey: 'gm_running', winKey: 'gm_win', successKey: 'gm_success'
  };
})(typeof window !== 'undefined' ? window : this);
