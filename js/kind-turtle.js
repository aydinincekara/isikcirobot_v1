/* afi kod - Python Turtle bölümü
 * Bloklar gerçek Python turtle koduna çevrilir (afi.forward(100) ...). İndirilen .py dosyası Python ile gelen
 * turtle modülüyle çalışır, ek kurulum gerekmez.
 * Tarayıcıdaki benzetim: çizgiler kaydedilir, hedef çizimle (st.target) nokta nokta karşılaştırılır.
 * Koordinatlar Python turtle ile aynıdır: (0,0) ortada, y yukarı, yön 0 = doğu, sola dönüş saat yönünün tersi.
 */
(function (root) {
  'use strict';
  var B = root.Blockly, PY = root.python.pythonGenerator, JS = root.javascript.javascriptGenerator;
  var PO = root.python.Order, JO = root.javascript.Order;
  var KINDS = root.KINDS = root.KINDS || {};
  var COL = { move: '#2BA88A', turn: '#7C5CE0', pen: '#E07A3A' };
  var COLORS = ['black', 'red', 'blue', 'green', 'orange', 'purple', 'gold', 'deeppink'];
  var HEX = { black: '#1A2230', red: '#E5484D', blue: '#2563C9', green: '#22A06B', orange: '#F28C28', purple: '#8B6FD6', gold: '#E0B000', deeppink: '#E0478A' };
  function lg() { return root.KINDS_LANG === 'en' ? 'en' : 'tr'; }
  var stmt = { previousStatement: null, nextStatement: null };
  function def(type, o) { B.Blocks[type] = { init: function () { this.jsonInit(Object.assign({ type: type, tooltip: '%{BKY_' + type.toUpperCase() + '_TIP}' }, stmt, o)); } }; }
  function numIn(name) { return { type: 'input_value', name: name, check: 'Number' }; }
  def('t_fwd', { message0: '%{BKY_T_FWD}', args0: [numIn('N')], inputsInline: true, colour: COL.move });
  def('t_back', { message0: '%{BKY_T_BACK}', args0: [numIn('N')], inputsInline: true, colour: COL.move });
  def('t_left', { message0: '%{BKY_T_LEFT}', args0: [numIn('N')], inputsInline: true, colour: COL.turn });
  def('t_right', { message0: '%{BKY_T_RIGHT}', args0: [numIn('N')], inputsInline: true, colour: COL.turn });
  def('t_penup', { message0: '%{BKY_T_PENUP}', colour: COL.pen });
  def('t_pendown', { message0: '%{BKY_T_PENDOWN}', colour: COL.pen });
  def('t_color', { message0: '%{BKY_T_COLOR}', args0: [{ type: 'field_dropdown', name: 'C', options: COLORS.map(function (c) { return ['%{BKY_T_C_' + c.toUpperCase() + '}', c]; }) }], colour: COL.pen });
  def('t_width', { message0: '%{BKY_T_WIDTH}', args0: [numIn('N')], inputsInline: true, colour: COL.pen });
  def('t_circle', { message0: '%{BKY_T_CIRCLE}', args0: [numIn('N')], inputsInline: true, colour: COL.move });
  var TYPES = ['t_fwd', 't_back', 't_left', 't_right', 't_penup', 't_pendown', 't_color', 't_width', 't_circle'];
  var CALL = { t_fwd: 'forward', t_back: 'backward', t_left: 'left', t_right: 'right', t_width: 'pensize', t_circle: 'circle' };
  Object.keys(CALL).forEach(function (tp) {
    PY.forBlock[tp] = function (b) { return 'afi.' + CALL[tp] + '(' + (PY.valueToCode(b, 'N', PO.NONE) || '0') + ')\n'; };
    JS.forBlock[tp] = function (b) { return 'afi.' + CALL[tp] + '(' + (JS.valueToCode(b, 'N', JO.NONE) || '0') + ');\n'; };
  });
  PY.forBlock.t_penup = function () { return 'afi.penup()\n'; };
  PY.forBlock.t_pendown = function () { return 'afi.pendown()\n'; };
  JS.forBlock.t_penup = function () { return 'afi.penup();\n'; };
  JS.forBlock.t_pendown = function () { return 'afi.pendown();\n'; };
  PY.forBlock.t_color = function (b) { return 'afi.color("' + b.getFieldValue('C') + '")\n'; };
  JS.forBlock.t_color = function (b) { return 'afi.color("' + b.getFieldValue('C') + '");\n'; };

  /* ---------- Araç kutusu ---------- */
  function num(n) { return { shadow: { type: 'math_number', fields: { NUM: n } } }; }
  var SPEC = { fwd: 't_fwd', back: 't_back', left: 't_left', right: 't_right', width: 't_width', circle: 't_circle' };
  function toolEntry(spec) {
    var p = spec.split(':'), k = p[0];
    if (SPEC[k]) return { kind: 'block', type: SPEC[k], inputs: { N: num(+(p[1] || 100)) } };
    if (k === 'penup') return { kind: 'block', type: 't_penup' };
    if (k === 'pendown') return { kind: 'block', type: 't_pendown' };
    if (k === 'color') return { kind: 'block', type: 't_color', fields: { C: p[1] || 'red' } };
    if (k === 'repeat') return { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: num(+(p[1] || 4)) } };
    return { kind: 'block', type: spec };
  }

  /* ---------- Kod ---------- */
  function code(gen, ws) {
    gen.init(ws);
    var parts = [];
    ws.getTopBlocks(true).forEach(function (b) { if (b.isShadow()) return; var c = gen.blockToCode(b); if (Array.isArray(c)) c = ''; if (c) parts.push(c); });
    return gen.finish(parts.join('\n')).replace(/\n{3,}/g, '\n\n').trim();
  }
  function toPython(ws) {
    var body = code(PY, ws), en = lg() === 'en';
    return 'import turtle\n\nafi = turtle.Turtle()\n\n' + (body || (en ? '# no blocks yet' : '# henüz blok yok')) + '\n\nturtle.done()';
  }
  function toJS(ws) { return code(JS, ws); }
  function runCode(ws) { JS.STATEMENT_PREFIX = 'highlightBlock(%1);\n'; try { return code(JS, ws); } finally { JS.STATEMENT_PREFIX = null; } }

  /* ---------- Benzetim ---------- */
  function r2(v) { return Math.round(v * 100) / 100; }
  function simulate(src) {
    var s = { x: 0, y: 0, h: 0, pen: true, color: 'black', width: 2 }, segs = [], ops = [], cur = null, budget = 20000, outcome = 'done', err = null;
    function tick() { if (--budget < 0) throw { tt: 'loop' }; }
    function move(d) {
      tick(); d = Number(d) || 0;
      var a = s.h * Math.PI / 180, nx = s.x + Math.cos(a) * d, ny = s.y + Math.sin(a) * d;
      var seg = s.pen ? { x1: r2(s.x), y1: r2(s.y), x2: r2(nx), y2: r2(ny), c: s.color, w: s.width, b: cur } : null;
      if (seg && (seg.x1 !== seg.x2 || seg.y1 !== seg.y2)) segs.push(seg);
      ops.push({ k: 'm', x1: s.x, y1: s.y, x2: nx, y2: ny, h: s.h, seg: seg, b: cur });
      s.x = nx; s.y = ny;
    }
    function turn(a) { tick(); a = Number(a) || 0; ops.push({ k: 't', h1: s.h, h2: s.h + a, x: s.x, y: s.y, b: cur }); s.h = s.h + a; }
    var afi = {
      forward: move, backward: function (d) { move(-(Number(d) || 0)); },
      left: function (a) { turn(Number(a) || 0); }, right: function (a) { turn(-(Number(a) || 0)); },
      penup: function () { tick(); s.pen = false; ops.push({ k: 'p', b: cur }); }, pendown: function () { tick(); s.pen = true; ops.push({ k: 'p', b: cur }); },
      color: function (c) { tick(); s.color = String(c); ops.push({ k: 'p', b: cur }); },
      pensize: function (w) { tick(); s.width = Math.max(1, Number(w) || 1); ops.push({ k: 'p', b: cur }); },
      circle: function (r) {
        r = Number(r) || 0; var n = 36, step = 2 * Math.PI * Math.abs(r) / n, ang = 360 / n * (r >= 0 ? 1 : -1);
        turn(ang / 2); for (var i = 0; i < n; i++) { move(step); if (i < n - 1) turn(ang); } turn(ang / 2);
      }
    };
    try { new Function('afi', 'highlightBlock', '"use strict";\n' + src)(afi, function (id) { cur = id; tick(); }); }
    catch (e) { if (e && e.tt) outcome = e.tt; else { outcome = 'error'; err = String(e && e.message || e); } }
    return { segs: segs, ops: ops, outcome: outcome, err: err, end: { x: s.x, y: s.y, h: s.h } };
  }
  /* İki çizim aynı mı? Her çizginin üzerinden noktalar alınır, öteki çizimde yakınında çizgi var mı bakılır */
  function distSeg(px, py, s) {
    var dx = s.x2 - s.x1, dy = s.y2 - s.y1, L = dx * dx + dy * dy, k = L ? ((px - s.x1) * dx + (py - s.y1) * dy) / L : 0;
    k = Math.max(0, Math.min(1, k)); var qx = s.x1 + k * dx - px, qy = s.y1 + k * dy - py; return Math.sqrt(qx * qx + qy * qy);
  }
  function uncovered(A, Bs, useColor) {
    var bad = [];
    A.forEach(function (s, i) {
      var len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1), n = Math.max(2, Math.ceil(len / 4)), miss = false, wrongColor = false;
      for (var k = 0; k <= n && !miss; k++) {
        var px = s.x1 + (s.x2 - s.x1) * k / n, py = s.y1 + (s.y2 - s.y1) * k / n, best = null, bd = 1e9;
        Bs.forEach(function (t) { var d = distSeg(px, py, t); if (d < bd) { bd = d; best = t; } });
        if (bd > 1.5) miss = true;
        else if (useColor && Bs.some(function (t) { return distSeg(px, py, t) <= 1.5 && t.c === s.c; }) === false) wrongColor = true;
      }
      if (miss || wrongColor) bad.push({ i: i, color: !miss && wrongColor });
    });
    return bad;
  }
  function check(st, res) {
    if (res.outcome !== 'done') return { ok: false, why: res.outcome };
    var tg = st.target || [], missing = uncovered(tg, res.segs, !!st.colors), extra = uncovered(res.segs, tg, false);
    var ok = !missing.length && !extra.length;
    var why = ok ? null : missing.some(function (m) { return m.color; }) && !missing.some(function (m) { return !m.color; }) && !extra.length ? 'color' : missing.length && !extra.length ? 'missing' : !missing.length ? 'extra' : 'both';
    return { ok: ok, why: why, missing: missing.map(function (m) { return m.i; }), extra: extra.map(function (m) { return m.i; }), failBlock: extra.length ? res.segs[extra[0].i].b : null };
  }
  function run(ws, st) {
    var res = simulate(runCode(ws)); res.check = check(st, res);
    return { results: [res], fail: res.check.ok ? -1 : 0 };
  }
  function failText(res, t) {
    var c = res.check;
    if (res.outcome === 'loop') return t('st_loop');
    if (res.outcome === 'error') return t('st_error');
    return t('tt_' + c.why);
  }

  /* ---------- Çizim ---------- */
  function view(st) { return { kind: 'turtle', st: st, res: null, k: -1, frac: 0, tx: 0, ty: 0, th: 0, done: false }; }
  function world(st) {
    if (st.world) return st.world;
    if (!st._R) { var m = 0; (st.target || []).forEach(function (s) { m = Math.max(m, Math.abs(s.x1), Math.abs(s.y1), Math.abs(s.x2), Math.abs(s.y2)); });
      st._R = Math.max(120, Math.ceil(m * 1.25 / 25) * 25); }
    return st._R;
  }
  function draw(c, W, H, v, K, m) {
    var st = v.st, R = world(st), sc = (W / 2 - W * 0.04) / R, cx = W / 2, cy = H / 2;
    function X(x) { return cx + x * sc; } function Y(y) { return cy - y * sc; }
    c.clearRect(0, 0, W, H); c.fillStyle = K.paper; c.fillRect(0, 0, W, H);
    c.strokeStyle = K.grid; c.lineWidth = 1;
    for (var g = -Math.floor(R / 50) * 50; g <= R; g += 50) { c.beginPath(); c.moveTo(X(g), 0); c.lineTo(X(g), H); c.stroke(); c.beginPath(); c.moveTo(0, Y(g)); c.lineTo(W, Y(g)); c.stroke(); }
    c.strokeStyle = K.axis; c.beginPath(); c.moveTo(X(0), 0); c.lineTo(X(0), H); c.moveTo(0, Y(0)); c.lineTo(W, Y(0)); c.stroke();
    c.lineCap = 'round'; c.lineJoin = 'round';
    var miss = v.res && v.done && v.res.check && !v.res.check.ok ? v.res.check.missing : [];
    (st.target || []).forEach(function (s, i) {
      c.strokeStyle = miss.indexOf(i) >= 0 ? K.bad : (HEX[s.c] || s.c); c.globalAlpha = miss.indexOf(i) >= 0 ? 0.9 : 0.22;
      c.lineWidth = Math.max(6, s.w * sc * 2.4); c.setLineDash(miss.indexOf(i) >= 0 ? [8, 6] : []);
      c.beginPath(); c.moveTo(X(s.x1), Y(s.y1)); c.lineTo(X(s.x2), Y(s.y2)); c.stroke();
    });
    c.globalAlpha = 1; c.setLineDash([]);
    var px = 0, py = 0, ph = 0;
    if (v.res) {
      var ops = v.res.ops, extra = v.done && v.res.check ? v.res.check.extra : [], segIdx = 0;
      for (var i = 0; i < ops.length && i <= v.k; i++) {
        var o = ops[i], f = i === v.k ? v.frac : 1;
        if (o.k === 'm') {
          var ex = o.x1 + (o.x2 - o.x1) * f, ey = o.y1 + (o.y2 - o.y1) * f;
          if (o.seg) {
            var isExtra = extra.indexOf(v.res.segs.indexOf(o.seg)) >= 0;
            c.strokeStyle = isExtra ? K.bad : (HEX[o.seg.c] || o.seg.c); c.lineWidth = Math.max(2, o.seg.w * sc * 1.2);
            c.beginPath(); c.moveTo(X(o.x1), Y(o.y1)); c.lineTo(X(ex), Y(ey)); c.stroke();
          }
          px = ex; py = ey; ph = o.h;
        } else if (o.k === 't') { ph = o.h1 + (o.h2 - o.h1) * f; px = o.x; py = o.y; }
      }
      if (v.k >= ops.length) { px = v.res.end.x; py = v.res.end.y; ph = v.res.end.h; }
    }
    root.ROBOTS.draw(c, m.robot, X(px), Y(py), Math.max(22, W * 0.075), { angle: 90 - ph });
  }
  function play(v, res, h) {
    return new Promise(function (resolve) {
      v.res = res; v.k = 0; v.frac = 0; v.done = false;
      var ops = res.ops;
      if (h.reduce || !ops.length) { v.k = ops.length; v.done = true; h.draw(); return resolve(true); }
      var prev = null, lastB = null;
      function dur(o) { var sp = [0, 2.2, 1.5, 1, 0.6, 0.3][h.speed()] || 1; return o.k === 'm' ? Math.max(60, Math.hypot(o.x2 - o.x1, o.y2 - o.y1) * 4) * sp : o.k === 't' ? Math.max(40, Math.abs(o.h2 - o.h1) * 1.6) * sp : 30 * sp; }
      if (ops.length > 400) { /* uzun çizimler hızlansın */ }
      function frame(now) {
        if (h.cancelled()) return resolve(false);
        if (prev == null) prev = now;
        var dt = h.paused() ? 0 : now - prev; prev = now;
        var fast = ops.length > 120 ? 4 : 1;
        while (dt > 0 && v.k < ops.length) {
          var o = ops[v.k], d = dur(o) / fast, left = (1 - v.frac) * d;
          if (dt >= left) { dt -= left; v.k++; v.frac = 0; } else { v.frac += dt / d; dt = 0; }
        }
        var b = v.k < ops.length ? ops[v.k].b : null; if (b !== lastB) { h.highlight(b); lastB = b; }
        if (v.k >= ops.length) { v.done = true; h.draw(); return resolve(true); }
        h.draw(); requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------- İndirilebilir dosya ---------- */
  function pyFile(ws, st) {
    var en = lg() === 'en', body = code(PY, ws) || 'pass';
    var head = en ? [
      '# AFI CODE - Python Turtle (' + st.id + ')',
      '# How to run: open Command Prompt (type cmd in the Start menu).',
      '#   1) python --version      -> Python 3.8 or newer (if "not recognized", try: py --version)',
      '#   2) cd Downloads',
      '#   3) python ' + st.id + '.py',
      '# Type the commands one at a time and press Enter after each. No admin rights or extra installs needed:',
      '# the turtle module comes with Python. Close the window to finish.'
    ] : [
      '# AFİ KOD - Python Turtle (' + st.id + ')',
      '# Çalıştırmak için: Başlat menüsüne cmd yazıp Komut İstemi\'ni aç.',
      '#   1) python --version      -> Python 3.8 ya da daha yeni olmalı ("tanınmıyor" derse: py --version)',
      '#   2) cd Downloads',
      '#   3) python ' + st.id + '.py',
      '# Komutları teker teker yaz, her birinden sonra Enter\'a bas. Yönetici izni ve ek kurulum gerekmez:',
      '# turtle modülü Python ile birlikte gelir. Bitirmek için çizim penceresini kapat.'
    ];
    return head.join('\n') + '\n\nimport turtle\n\nekran = turtle.Screen()\nekran.title("' + (en ? 'AFI CODE' : 'AFİ KOD') + ' - ' + st.id + '")\n' +
      'afi = turtle.Turtle()\nafi.shape("turtle")\nafi.speed(3)\nafi.pensize(2)\n\n' + body + '\n\nturtle.done()\n';
  }

  KINDS.turtle = {
    types: TYPES, toolEntry: toolEntry,
    toolbox: function (st) { return { kind: 'flyoutToolbox', contents: st.tools.map(toolEntry) }; },
    solution: function (st) { return st.sol; },
    toPython: toPython, toJS: toJS, runCode: runCode, simulate: simulate, check: check,
    snippet: function (b, kind) { var g = kind === 'py' ? PY : JS; g.init(b.workspace); var c = g.blockToCode(b, true); if (Array.isArray(c)) c = c[0]; c = String(c || '').replace(/\n+$/, ''); var L = c.split('\n'); return L.length > 9 ? L.slice(0, 8).join('\n') + '\n...' : c; },
    precheck: function (ws) { var tops = ws.getTopBlocks(false).filter(function (b) { return !b.isShadow(); }); if (!tops.length) return { key: 'st_needBlock' }; if (tops.length > 1) return { key: 'st_separate' }; return null; },
    run: run, failText: failText, view: view, draw: draw, play: play, aspect: function () { return 1; }, pyFile: pyFile,
    nVariants: function () { return 1; }, readyKey: 'tt_ready', runningKey: 'tt_running', winKey: 'tt_win', successKey: 'tt_success'
  };
})(typeof window !== 'undefined' ? window : this);
