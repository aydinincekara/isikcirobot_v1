/* afi kod - Python yapay zekâ bölümü
 * Öğrenci "afi'nin tahmini" bloğuyla bir tahmin fonksiyonu (model) yazar. Model eğitim verisinde ve afi'nin hiç
 * görmediği test verisinde denenir; test doğruluğu istenen düzeye ulaşınca adım geçilir.
 * Sayısal adımlar: örneğin özellikleri (boy, ağırlık...). Metin adımları: mesajlar (spam, duygu, sohbet).
 * Bazı adımlarda birden fazla veri seti vardır: aynı program hepsinde çalışmalıdır, yani eşik veriden öğrenilmelidir.
 * İndirilen .py dosyası verilerle birlikte gelir; ek kütüphane gerekmez.
 */
(function (root) {
  'use strict';
  var B = root.Blockly, PY = root.python.pythonGenerator, JS = root.javascript.javascriptGenerator;
  var PO = root.python.Order, JO = root.javascript.Order;
  var KINDS = root.KINDS = root.KINDS || {};
  var COL = { hat: '#8B5CF6', ans: '#C2417A', data: '#2B8FC2', text: '#3A9B6E' };
  function lg() { return root.KINDS_LANG === 'en' ? 'en' : 'tr'; }
  function L(o) { return o ? (o[lg()] || o.tr) : ''; }
  var AI = { ctx: null };
  function ctxSt() { return AI.ctx || { features: [], labels: [], lists: {} }; }
  function featOpts() { var f = ctxSt().features; return f.length ? f.map(function (x) { return [L(x.name), x.id]; }) : [['?', 'x']]; }
  function labelOpts() { var f = ctxSt().labels; return f.length ? f.map(function (x) { return [L(x.name), x.id]; }) : [['?', 'x']]; }
  function listOpts() { var l = ctxSt().lists || {}, k = Object.keys(l); return k.length ? k.map(function (x) { return [L(l[x].name), x]; }) : [['?', 'x']]; }
  var PN = { tr: { fn: 'tahmin', s: 'ornek', m: 'mesaj', mean: 'ortalama', cnt: 'kelime_say', train: 'EGITIM', test: 'TEST' },
             en: { fn: 'predict', s: 'sample', m: 'message', mean: 'average', cnt: 'count_words', train: 'TRAIN', test: 'TEST' } };
  function N(k) { return PN[lg()][k]; }
  function isText() { return ctxSt().mode === 'text'; }
  function argName() { return isText() ? N('m') : N('s'); }
  function featPy(id) { var f = ctxSt().features.filter(function (x) { return x.id === id; })[0]; return f ? f.py[lg()] : id; }
  function labelPy(id) { var f = ctxSt().labels.filter(function (x) { return x.id === id; })[0]; return f ? (f.py ? f.py[lg()] : L(f.name)) : id; }
  function listPy(id) { var l = (ctxSt().lists || {})[id]; return l ? l.py[lg()] : id; }

  /* ---------- Bloklar ---------- */
  function def(type, o) { B.Blocks[type] = { init: function () { this.jsonInit(Object.assign({ type: type, tooltip: '%{BKY_' + type.toUpperCase() + '_TIP}' }, o)); } }; }
  def('ai_predict', { message0: '%{BKY_AI_PREDICT}', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], colour: COL.hat });
  def('ai_answer', { message0: '%{BKY_AI_ANSWER}', args0: [{ type: 'field_dropdown', name: 'L', options: labelOpts }], previousStatement: null, colour: COL.ans });
  def('ai_feat', { message0: '%{BKY_AI_FEAT}', args0: [{ type: 'field_dropdown', name: 'F', options: featOpts }], output: 'Number', colour: COL.data });
  def('ai_mean', { message0: '%{BKY_AI_MEAN}', args0: [{ type: 'field_dropdown', name: 'L', options: labelOpts }, { type: 'field_dropdown', name: 'F', options: featOpts }], output: 'Number', colour: COL.data });
  def('ai_has', { message0: '%{BKY_AI_HAS}', args0: [{ type: 'input_value', name: 'W', check: 'String' }], inputsInline: true, output: 'Boolean', colour: COL.text });
  def('ai_count', { message0: '%{BKY_AI_COUNT}', args0: [{ type: 'field_dropdown', name: 'K', options: listOpts }], output: 'Number', colour: COL.text });
  var TYPES = ['ai_predict', 'ai_answer', 'ai_feat', 'ai_mean', 'ai_has', 'ai_count'];

  PY.forBlock.ai_predict = function (b) { return 'def ' + N('fn') + '(' + argName() + '):\n' + (PY.statementToCode(b, 'DO') || PY.INDENT + 'pass\n') + '\n'; };
  PY.forBlock.ai_answer = function (b) { return 'return ' + JSON.stringify(labelPy(b.getFieldValue('L'))) + '\n'; };
  PY.forBlock.ai_feat = function (b) { return [argName() + '["' + featPy(b.getFieldValue('F')) + '"]', PO.MEMBER]; };
  PY.forBlock.ai_mean = function (b) { return [N('mean') + '(' + JSON.stringify(labelPy(b.getFieldValue('L'))) + ', "' + featPy(b.getFieldValue('F')) + '")', PO.FUNCTION_CALL]; };
  PY.forBlock.ai_has = function (b) { return [(PY.valueToCode(b, 'W', PO.NONE) || '""') + ' in ' + N('m'), PO.RELATIONAL]; };
  PY.forBlock.ai_count = function (b) { return [N('cnt') + '(' + N('m') + ', ' + listPy(b.getFieldValue('K')) + ')', PO.FUNCTION_CALL]; };
  JS.forBlock.ai_predict = function (b) { return 'ai.model(function (' + argName() + ') {\n' + JS.statementToCode(b, 'DO') + '});\n'; };
  JS.forBlock.ai_answer = function (b) { return 'return "' + b.getFieldValue('L') + '";\n'; };
  JS.forBlock.ai_feat = function (b) { return [argName() + '.' + b.getFieldValue('F'), JO.MEMBER]; };
  JS.forBlock.ai_mean = function (b) { return ['ai.mean("' + b.getFieldValue('L') + '", "' + b.getFieldValue('F') + '")', JO.FUNCTION_CALL]; };
  JS.forBlock.ai_has = function (b) { return ['ai.has(' + argName() + ', ' + (JS.valueToCode(b, 'W', JO.NONE) || '""') + ')', JO.FUNCTION_CALL]; };
  JS.forBlock.ai_count = function (b) { return ['ai.count(' + argName() + ', "' + b.getFieldValue('K') + '")', JO.FUNCTION_CALL]; };

  /* ---------- Araç kutusu ---------- */
  function num(n) { return { shadow: { type: 'math_number', fields: { NUM: n } } }; }
  function toolEntry(spec) {
    var p = spec.split(':'), k = p[0];
    switch (k) {
      case 'predict': return { kind: 'block', type: 'ai_predict' };
      case 'answer': return { kind: 'block', type: 'ai_answer', fields: { L: p[1] } };
      case 'feat': return { kind: 'block', type: 'ai_feat', fields: { F: p[1] } };
      case 'mean': return { kind: 'block', type: 'ai_mean', fields: { L: p[1], F: p[2] } };
      case 'has': { var w = (p[1] || '').split('|'); return { kind: 'block', type: 'ai_has', inputs: { W: { shadow: { type: 'text', fields: { TEXT: lg() === 'en' && w[1] != null ? w[1] : w[0] } } } } }; }
      case 'count': return { kind: 'block', type: 'ai_count', fields: { K: p[1] } };
      case 'if': return { kind: 'block', type: 'controls_if' };
      case 'ife': return { kind: 'block', type: 'controls_if', extraState: { hasElse: true } };
      case 'compare': return { kind: 'block', type: 'logic_compare', fields: { OP: p[1] || 'GT' }, inputs: { B: num(+(p[2] || 0)) } };
      case 'compare2': return { kind: 'block', type: 'logic_compare', fields: { OP: p[1] || 'GT' } };
      case 'and': return { kind: 'block', type: 'logic_operation', fields: { OP: 'AND' } };
      case 'or': return { kind: 'block', type: 'logic_operation', fields: { OP: 'OR' } };
      case 'arith': return { kind: 'block', type: 'math_arithmetic', fields: { OP: p[1] || 'ADD' }, inputs: p[2] ? { B: num(+p[2]) } : {} };
    }
    return { kind: 'block', type: spec };
  }

  /* ---------- Kod ---------- */
  function genAll(gen, ws) {
    gen.init(ws); var parts = [];
    ws.getTopBlocks(true).forEach(function (b) { if (b.isShadow()) return; var c = gen.blockToCode(b); if (Array.isArray(c)) c = ''; if (c) parts.push(c); });
    return gen.finish(parts.join('\n')).replace(/\n{3,}/g, '\n\n').trim();
  }
  function toPython(ws, st) { AI.ctx = st; var body = genAll(PY, ws); return (body || (lg() === 'en' ? '# no blocks yet' : '# henüz blok yok')) + '\n\n' + (lg() === 'en' ? '# the data and the test are in the downloadable file' : '# veriler ve test indirilen dosyada'); }
  function toJS(ws, st) { AI.ctx = st; return genAll(JS, ws); }
  function runCode(ws, st) { AI.ctx = st; JS.STATEMENT_PREFIX = 'highlightBlock(%1);\n'; try { return genAll(JS, ws); } finally { JS.STATEMENT_PREFIX = null; } }

  /* ---------- Veri ---------- */
  function words(s) { return String(s).toLocaleLowerCase('tr').match(/[\p{L}\p{N}]+/gu) || []; }
  function samples(st, list, lang) {
    return list.map(function (r) {
      if (st.mode === 'text') return { x: r[0][lang] || r[0].tr, y: r[1] };
      var o = {}; st.features.forEach(function (f, i) { o[f.id] = r[i]; }); return { x: o, y: r[st.features.length] };
    });
  }
  function evaluate(st, code, si, lang) {
    var set = st.sets[si], train = samples(st, set.train, lang), test = samples(st, set.test, lang), model = null, cur = null, budget = 0, outcome = 'done', err = null;
    var api = {
      model: function (f) { if (typeof f === 'function') model = f; },
      mean: function (label, feat) { var v = train.filter(function (s) { return s.y === label; }).map(function (s) { return s.x[feat]; }); return v.length ? v.reduce(function (a, b) { return a + b; }, 0) / v.length : 0; },
      has: function (m, w) { return String(m).indexOf(String(w)) >= 0; },
      count: function (m, k) { var l = st.lists[k], ws = (l.words[lang] || l.words.tr); return words(m).filter(function (w) { return ws.indexOf(w) >= 0; }).length; }
    };
    try { new Function('ai', 'highlightBlock', '"use strict";\n' + code)(api, function (id) { cur = id; if (--budget < -5000) throw { ai: 'loop' }; }); }
    catch (e) { outcome = 'error'; err = String(e && e.message || e); }
    function pred(s) { if (!model) return null; budget = 2000; try { var r = model(s.x); return r == null ? null : String(r); } catch (e) { if (e && e.ai) outcome = 'loop'; else { outcome = 'error'; err = String(e && e.message || e); } return null; } }
    var ptrain = train.map(pred), ptest = test.map(pred);
    var ctr = ptrain.filter(function (p, i) { return p === train[i].y; }).length, cte = ptest.filter(function (p, i) { return p === test[i].y; }).length;
    return { set: si, train: train, test: test, ptrain: ptrain, ptest: ptest, accTrain: train.length ? ctr / train.length : 1, accTest: test.length ? cte / test.length : 1,
      cTrain: ctr, cTest: cte, hasModel: !!model, outcome: outcome, err: err };
  }
  function need(st) { return st.need != null ? st.need : 1; }
  function check(st, r) {
    var ok = r.outcome === 'done' && r.hasModel && r.accTest >= need(st) - 1e-9 && r.accTrain >= Math.min(need(st), 0.99) - 1e-9;
    return { ok: ok, failBlock: null };
  }
  function run(ws, st) {
    var code = runCode(ws, st), results = st.sets.map(function (_, i) { var r = evaluate(st, code, i, lg()); r.check = check(st, r); return r; });
    var fail = -1; for (var i = 0; i < results.length; i++) if (!results[i].check.ok) { fail = i; break; }
    return { results: results, fail: fail };
  }
  function pct(a) { return Math.round(a * 100); }
  function failText(r, t, lang, st) {
    if (r.outcome === 'loop') return t('st_loop');
    if (r.outcome === 'error') return t('st_error');
    if (!r.hasModel) return t('ai_noModel');
    var none = r.ptest.filter(function (p) { return p == null; }).length;
    if (none) return t('ai_noAnswer', { n: none });
    if (r.accTrain < Math.min(need(st), 0.99)) return t('ai_failTrain', { c: r.cTrain, n: r.train.length });
    return t('ai_failTest', { c: r.cTest, n: r.test.length, p: pct(r.accTest), need: pct(need(st)) });
  }

  /* ---------- Çizim ---------- */
  function view(st, vi) { return { kind: 'ai', st: st, vi: vi || 0, res: null, k: -1 }; }
  function aspect(st) {
    if (st.mode !== 'text') return 0.95;
    var s = st.sets[0]; return Math.min(1.9, 0.3 + 0.074 * (s.train.length + s.test.length + 2));
  }
  function labelColor(st, id) { var l = st.labels.filter(function (x) { return x.id === id; })[0]; return l ? l.color : '#999'; }
  function labelName(st, id) { var l = st.labels.filter(function (x) { return x.id === id; })[0]; return l ? L(l.name) : '?'; }
  function draw(c, W, H, v, K, m) {
    var st = v.st, t = m.t, lang = m.lang, set = st.sets[v.vi], train = samples(st, set.train, lang), test = samples(st, set.test, lang), u = W / 330;
    c.clearRect(0, 0, W, H); c.fillStyle = K.paper; c.fillRect(0, 0, W, H);
    c.textBaseline = 'middle'; c.lineCap = 'round';
    var r = v.res, shown = r ? Math.max(0, v.k) : 0;
    function font(w, s) { c.font = w + ' ' + Math.round(s * u) + 'px Nunito, sans-serif'; }
    function mark(x, y, ok, s) {
      c.strokeStyle = ok ? K.ok : K.bad; c.lineWidth = 2.4 * u; c.beginPath();
      if (ok) { c.moveTo(x - s * 0.5, y); c.lineTo(x - s * 0.1, y + s * 0.4); c.lineTo(x + s * 0.6, y - s * 0.45); }
      else { c.moveTo(x - s * 0.45, y - s * 0.45); c.lineTo(x + s * 0.45, y + s * 0.45); c.moveTo(x + s * 0.45, y - s * 0.45); c.lineTo(x - s * 0.45, y + s * 0.45); }
      c.stroke();
    }
    /* lejant */
    font('800', 10); c.textAlign = 'left'; var lx = 10 * u;
    st.labels.forEach(function (l) { c.fillStyle = l.color; c.beginPath(); c.arc(lx + 5 * u, 12 * u, 5 * u, 0, 7); c.fill(); c.fillStyle = K.ink; c.fillText(L(l.name), lx + 13 * u, 12 * u); lx += c.measureText(L(l.name)).width + 28 * u; });
    var y0 = 26 * u, bottom = H - 34 * u;
    if (st.mode === 'text') {
      var rows = [{ h: t('ai_trainData') }].concat(train.map(function (s) { return { s: s }; }), [{ h: t('ai_testData') }], test.map(function (s, i) { return { s: s, ti: i }; }));
      var rh = (bottom - y0) / rows.length;
      rows.forEach(function (row, i) {
        var y = y0 + rh * (i + 0.5);
        if (row.h) { font('800', 10); c.fillStyle = K.ink3; c.textAlign = 'left'; c.fillText(row.h.toLocaleUpperCase(lang), 10 * u, y); return; }
        var isTest = row.ti != null, revealed = isTest && r && row.ti < shown;
        c.fillStyle = K.panel2; c.fillRect(8 * u, y - rh * 0.42, W - 16 * u, rh * 0.84);
        font('700', 10.5); c.fillStyle = K.ink; c.textAlign = 'left';
        var txt = '“' + row.s.x + '”', maxw = W - 120 * u; while (c.measureText(txt).width > maxw && txt.length > 4) txt = txt.slice(0, -2) + '…';
        c.fillText(txt, 14 * u, y);
        var lab = isTest ? (revealed ? r.ptest[row.ti] : null) : row.s.y, chipX = W - 100 * u;
        if (lab != null || !isTest) {
          c.fillStyle = labelColor(st, lab); var nm = labelName(st, lab); font('800', 9.5); var cw2 = Math.min(78 * u, c.measureText(nm).width + 14 * u);
          c.fillRect(chipX, y - 8 * u, cw2, 16 * u); c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(nm, chipX + 7 * u, y);
          if (revealed) mark(W - 14 * u, y, r.ptest[row.ti] === row.s.y, 7 * u);
        } else { font('800', 12); c.fillStyle = K.ink3; c.textAlign = 'left'; c.fillText('?', chipX + 8 * u, y); }
      });
    } else if (st.features.length === 1) {
      var f = st.features[0], vals = train.concat(test).map(function (s) { return s.x[f.id]; }), mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), pad = (mx - mn) * 0.08 || 1;
      mn -= pad; mx += pad;
      var X = function (x) { return 18 * u + (W - 36 * u) * (x - mn) / (mx - mn); };
      var ya = y0 + (bottom - y0) * 0.3, yb = y0 + (bottom - y0) * 0.78;
      [[ya, t('ai_trainData')], [yb, t('ai_testData')]].forEach(function (q) {
        c.strokeStyle = K.line; c.lineWidth = 2 * u; c.beginPath(); c.moveTo(14 * u, q[0]); c.lineTo(W - 14 * u, q[0]); c.stroke();
        font('800', 9.5); c.fillStyle = K.ink3; c.textAlign = 'left'; c.fillText(q[1].toLocaleUpperCase(lang), 14 * u, q[0] - 30 * u);
      });
      font('700', 9); c.fillStyle = K.ink3; c.textAlign = 'center';
      var stepv = niceStep(mx - mn); for (var g = Math.ceil(mn / stepv) * stepv; g <= mx; g += stepv) { c.fillText(fmt(g) + (f.unit ? ' ' + f.unit : ''), X(g), ya + 14 * u); c.fillText(fmt(g), X(g), yb + 14 * u); }
      c.textAlign = 'right'; c.fillText(L(f.name), W - 14 * u, yb + 28 * u);
      var stack = {};
      function dot(x, y, col, ring, s) { var k2 = Math.round(X(x)) + ':' + y, n = stack[k2] = (stack[k2] || 0) + 1; var yy = y - (n - 1) * 12 * u - 9 * u; c.fillStyle = col; c.beginPath(); c.arc(X(x), yy, s, 0, 7); c.fill(); if (ring) { c.strokeStyle = ring; c.lineWidth = 2.5 * u; c.stroke(); } return yy; }
      train.forEach(function (s) { dot(s.x[f.id], ya, labelColor(st, s.y), null, 5.5 * u); });
      test.forEach(function (s, i) {
        if (r && i < shown) { var yy = dot(s.x[f.id], yb, labelColor(st, r.ptest[i]), null, 5.5 * u); mark(X(s.x[f.id]), yy - 13 * u, r.ptest[i] === s.y, 4.5 * u); }
        else { var y2 = dot(s.x[f.id], yb, K.panel2, K.ink3, 5 * u); font('800', 8); c.fillStyle = K.ink3; c.textAlign = 'center'; c.fillText('?', X(s.x[f.id]), y2 + 0.5); }
      });
    } else {
      var fx = st.features[0], fy = st.features[1], all = train.concat(test);
      var ex = ext(all.map(function (s) { return s.x[fx.id]; })), ey = ext(all.map(function (s) { return s.x[fy.id]; }));
      var left = 34 * u, right = W - 12 * u, top = y0 + 6 * u, bot = bottom - 26 * u;
      var PX = function (x) { return left + (right - left) * (x - ex[0]) / (ex[1] - ex[0]); }, PYy = function (y) { return bot - (bot - top) * (y - ey[0]) / (ey[1] - ey[0]); };
      c.strokeStyle = K.line; c.lineWidth = 1; c.strokeRect(left, top, right - left, bot - top);
      font('700', 9); c.fillStyle = K.ink3; c.textAlign = 'center';
      var sx = niceStep(ex[1] - ex[0]); for (var gx = Math.ceil(ex[0] / sx) * sx; gx <= ex[1]; gx += sx) c.fillText(fmt(gx), PX(gx), bot + 10 * u);
      c.fillText(L(fx.name) + (fx.unit ? ' (' + fx.unit + ')' : ''), (left + right) / 2, bot + 22 * u);
      c.textAlign = 'right'; var sy = niceStep(ey[1] - ey[0]); for (var gy = Math.ceil(ey[0] / sy) * sy; gy <= ey[1]; gy += sy) c.fillText(fmt(gy), left - 4 * u, PYy(gy));
      c.save(); c.translate(10 * u, (top + bot) / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText(L(fy.name) + (fy.unit ? ' (' + fy.unit + ')' : ''), 0, 0); c.restore();
      train.forEach(function (s) { c.fillStyle = labelColor(st, s.y); c.beginPath(); c.arc(PX(s.x[fx.id]), PYy(s.x[fy.id]), 5.5 * u, 0, 7); c.fill(); });
      test.forEach(function (s, i) {
        var x = PX(s.x[fx.id]), y = PYy(s.x[fy.id]), hs = 6 * u;
        if (r && i < shown) { c.fillStyle = labelColor(st, r.ptest[i]); c.fillRect(x - hs, y - hs, hs * 2, hs * 2); mark(x + 10 * u, y - 10 * u, r.ptest[i] === s.y, 4 * u); }
        else { c.fillStyle = K.panel2; c.strokeStyle = K.ink3; c.lineWidth = 1.5 * u; c.fillRect(x - hs, y - hs, hs * 2, hs * 2); c.strokeRect(x - hs, y - hs, hs * 2, hs * 2); font('800', 8); c.fillStyle = K.ink3; c.textAlign = 'center'; c.fillText('?', x, y + 0.5); }
      });
      font('700', 8.5); c.fillStyle = K.ink3; c.textAlign = 'right'; c.fillText(t('ai_legend2'), right, top - 6 * u);
    }
    /* doğruluk */
    var by = H - 22 * u, bw = (W - 30 * u) / 2;
    [[t('ai_train'), r ? r.cTrain : null, train.length, 10 * u], [t('ai_test'), r && shown >= test.length ? r.cTest : null, test.length, 20 * u + bw]].forEach(function (q) {
      c.fillStyle = K.panel2; c.fillRect(q[3], by - 8 * u, bw, 16 * u);
      if (q[1] != null) { var a = q[1] / q[2]; c.fillStyle = a >= need(st) - 1e-9 ? K.ok : K.bad; c.fillRect(q[3], by - 8 * u, bw * a, 16 * u); }
      c.strokeStyle = K.ink; c.lineWidth = 1.5 * u; var nx = q[3] + bw * need(st); c.beginPath(); c.moveTo(nx, by - 10 * u); c.lineTo(nx, by + 10 * u); c.stroke();
      font('800', 9.5); c.fillStyle = q[1] != null && q[1] / q[2] > 0.5 ? '#fff' : K.ink; c.textAlign = 'left';
      c.fillText(q[0] + ': ' + (q[1] != null ? q[1] + ' / ' + q[2] + ' (' + (lang === 'tr' ? '%' + pct(q[1] / q[2]) : pct(q[1] / q[2]) + '%') + ')' : '? / ' + q[2]), q[3] + 6 * u, by);
    });
  }
  function ext(a) { var mn = Math.min.apply(null, a), mx = Math.max.apply(null, a), p = (mx - mn) * 0.1 || 1; return [mn - p, mx + p]; }
  function niceStep(r) { var s = Math.pow(10, Math.floor(Math.log10(r / 5))), n = r / s; return n > 25 ? s * 10 : n > 10 ? s * 5 : n > 5 ? s * 2 : s; }
  function fmt(v) { return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1); }
  function play(v, res, h) {
    return new Promise(function (resolve) {
      v.res = res; v.k = 0; var n = res.test.length;
      if (h.reduce || !n) { v.k = n; h.draw(); return resolve(true); }
      var ms = [0, 650, 480, 340, 220, 110][h.speed()] || 340, el = 0, prev = null;
      function frame(now) {
        if (h.cancelled()) return resolve(false);
        if (prev == null) prev = now; if (!h.paused()) el += now - prev; prev = now;
        v.k = Math.min(n, Math.floor(el / ms)); h.draw();
        if (v.k >= n && el > (n + 1) * ms) return resolve(true);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------- İndirilebilir dosya ---------- */
  function pyLit(v) { return typeof v === 'string' ? JSON.stringify(v) : String(v); }
  function pyFile(ws, st) {
    AI.ctx = st; var en = lg() === 'en', body = genAll(PY, ws) || ('def ' + N('fn') + '(' + argName() + '):\n    pass'), n = PN[lg()], text = st.mode === 'text';
    var Lb = []; function w(s) { Lb.push(s); }
    w(en ? '# AFI CODE - Python artificial intelligence (' + st.id + ')' : '# AFİ KOD - Python yapay zekâ (' + st.id + ')');
    w(en ? '# How to run: open Command Prompt (type cmd in the Start menu), then type these one at a time and press Enter:' : '# Çalıştırmak için: Başlat menüsüne cmd yazıp Komut İstemi\'ni aç, şunları teker teker yazıp Enter\'a bas:');
    w('#   python --version    (3.8+; ' + (en ? 'if "not recognized" try: py --version' : '"tanınmıyor" derse: py --version') + ')');
    w('#   cd Downloads'); w('#   python ' + st.id + '.py');
    w(en ? '# No admin rights or extra libraries needed.' : '# Yönetici izni ve ek kütüphane gerekmez.');
    w('');
    if (text) w('import re'), w('');
    var lists = st.lists || {};
    Object.keys(lists).forEach(function (k) { w(lists[k].py[lg()] + ' = ' + JSON.stringify(lists[k].words[lg()] || lists[k].words.tr)); });
    if (Object.keys(lists).length) w('');
    function rowPy(r) {
      if (text) return '    (' + JSON.stringify(r[0][lg()] || r[0].tr) + ', ' + JSON.stringify(labelPy(r[1])) + '),';
      return '    {' + st.features.map(function (f, i) { return '"' + f.py[lg()] + '": ' + pyLit(r[i]); }).join(', ') + ', "' + (en ? 'label' : 'etiket') + '": ' + JSON.stringify(labelPy(r[st.features.length])) + '},';
    }
    w((en ? 'DATA_SETS' : 'VERI_SETLERI') + ' = [');
    st.sets.forEach(function (s) {
      w('  {"' + (en ? 'train' : 'egitim') + '": [');
      s.train.forEach(function (r) { w('  ' + rowPy(r)); });
      w('  ], "test": [');
      s.test.forEach(function (r) { w('  ' + rowPy(r)); });
      w('  ]},');
    });
    w(']'); w('');
    w(n.train + ' = []'); w('');
    if (!text) {
      w('def ' + n.mean + '(' + (en ? 'label, feature' : 'etiket, ozellik') + '):');
      w('    ' + (en ? 'values = [s[feature] for s in TRAIN if s["label"] == label]' : 'degerler = [o[ozellik] for o in EGITIM if o["etiket"] == etiket]'));
      w('    ' + (en ? 'return sum(values) / len(values) if values else 0' : 'return sum(degerler) / len(degerler) if degerler else 0'));
      w('');
    } else {
      w('def ' + n.cnt + '(' + (en ? 'text, words' : 'metin, kelimeler') + '):');
      w('    ' + (en ? 'return sum(1 for w in re.findall(r"\\w+", text.lower()) if w in words)' : 'return sum(1 for k in re.findall(r"\\w+", metin.lower()) if k in kelimeler)'));
      w('');
    }
    w(en ? '# ---- your model ----' : '# ---- senin modelin ----');
    w(body); w('');
    var lab = text ? 'o[1]' : 'o["' + (en ? 'label' : 'etiket') + '"]', inp = text ? 'o[0]' : 'o';
    w('def ' + (en ? 'score' : 'puanla') + '(' + (en ? 'data' : 'veri') + '):');
    w('    return sum(1 for o in ' + (en ? 'data' : 'veri') + ' if ' + n.fn + '(' + inp + ') == ' + lab + ')');
    w('');
    w((en ? 'all_ok' : 'hepsi_tamam') + ' = True');
    w('for i, vs in enumerate(' + (en ? 'DATA_SETS' : 'VERI_SETLERI') + '):');
    w('    ' + n.train + ' = vs["' + (en ? 'train' : 'egitim') + '"]');
    w('    e, t = ' + (en ? 'score' : 'puanla') + '(' + n.train + '), ' + (en ? 'score' : 'puanla') + '(vs["test"])');
    w('    print(("' + (en ? 'Data set' : 'Veri seti') + ' %d - ' + (en ? 'training' : 'eğitim') + ': %d/%d, test: %d/%d") % (i + 1, e, len(' + n.train + '), t, len(vs["test"])))');
    w('    for o in vs["test"]:');
    w('        print("   ", ' + inp + ', "->", ' + n.fn + '(' + inp + '), "(' + (en ? 'correct' : 'doğrusu') + ': " + ' + lab + ' + ")")');
    w('    if t < ' + need(st) + ' * len(vs["test"]) - 1e-9:');
    w('        ' + (en ? 'all_ok' : 'hepsi_tamam') + ' = False');
    w('print("' + (en ? 'Well done! afi learned well.' : 'Tebrikler! afi iyi öğrendi.') + '" if ' + (en ? 'all_ok' : 'hepsi_tamam') + ' else "' + (en ? 'Not there yet: check your model.' : 'Henüz olmadı: modelini kontrol et.') + '")');
    return Lb.join('\n') + '\n';
  }

  /* ---------- Üretici kancaları ---------- */
  var genHooks = {
    prepare: function (st) {
      AI.ctx = st;
      st.sets.forEach(function (s, i) { ['train', 'test'].forEach(function (k) { if (!s[k].length) throw new Error(st.id + ' boş veri'); }); });
    },
    passes: function (st, code, lang) { return st.sets.every(function (_, i) { var r = evaluate(st, code, i, lang || 'tr'); return check(st, r).ok; }); },
    pyPrep: function (py, st) {
      var en = /def predict\(/.test(py), fn = en ? 'predict' : 'tahmin', sets = en ? 'DATA_SETS' : 'VERI_SETLERI', tr = en ? 'TRAIN' : 'EGITIM', k = en ? 'train' : 'egitim', text = st.mode === 'text';
      return py + '\nimport json as _json\n_p = []\nfor _vs in ' + sets + ':\n    ' + tr + ' = _vs["' + k + '"]\n    _p.append([' + fn + '(' + (text ? 'o[0]' : 'o') + ') for o in _vs["test"]])\nprint("__PRED__" + _json.dumps(_p, ensure_ascii=False))\n';
    },
    pyCheck: function (st, out, lang) {
      if (!/(Tebrikler|Well done)/.test(out)) return 'python testi geçmedi';
      return null;
    }
  };

  KINDS.ai = {
    types: TYPES, toolEntry: function (s) { return toolEntry(s); }, genHooks: genHooks, ctx: AI,
    toolbox: function (st) { AI.ctx = st; return { kind: 'flyoutToolbox', contents: st.tools.map(toolEntry) }; },
    solution: function (st) { AI.ctx = st; return lg() === 'en' && st.solEn ? st.solEn : st.sol; },
    toPython: toPython, toJS: toJS, runCode: runCode, evaluate: evaluate, check: check,
    snippet: function (b, kind) { var g = kind === 'py' ? PY : JS; g.init(b.workspace); var c = g.blockToCode(b, true); if (Array.isArray(c)) c = c[0]; c = String(c || '').replace(/\n+$/, ''); var Ls = c.split('\n'); return Ls.length > 9 ? Ls.slice(0, 8).join('\n') + '\n...' : c; },
    precheck: function (ws) {
      var tp = ws.getTopBlocks(false).filter(function (b) { return !b.isShadow(); });
      if (!tp.length) return { key: 'st_needBlock' };
      var loose = tp.filter(function (b) { return b.type !== 'ai_predict'; });
      if (loose.length) return { key: 'ai_loose', block: loose[0].id };
      if (tp.length > 1) return { key: 'ai_two' };
      return null;
    },
    run: run, failText: failText, view: view, draw: draw, play: play, aspect: aspect, pyFile: pyFile,
    nVariants: function (st) { return st.sets.length; }, variantKey: 'ai_variantNote',
    readyKey: 'ai_ready', runningKey: 'ai_running', winKey: 'ai_win', successKey: 'ai_success'
  };
})(typeof window !== 'undefined' ? window : this);
