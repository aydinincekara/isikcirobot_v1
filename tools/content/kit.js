/* afi kod - içerik yazım araçları (Bölüm 4-10)
 * Çözümler kısa bir ağaç biçiminde yazılır, Blockly JSON'una buradan çevrilir.
 *   ev('motion', on('lamp'), wait(5), off('lamp'))      olay bloğu
 *   start(...), every(...), fn('night', ...), call('night')
 *   iff(koşul, ...), ife(koşul, [evetse], [değilse]), rep(3, ...)
 *   set('count', değer), chg('count', 1), get('count')
 *   sens('distance'), dig('motion'), cmp(a, '<', b), and(a, b), or(a, b), not(a), ar(a, '+', b)
 *   txt('°C'), join(a, b), round(x), num(5)
 */
function node(t, f, i) { return { t: t, f: f || {}, i: i || {} }; }
const K = {};
K.ev = (id, ...b) => node('h_event', { EVT: id }, { DO: b });
K.start = (...b) => node('h_start', {}, { DO: b });
K.every = (...b) => node('h_every', {}, { DO: b });
K.fn = (id, ...b) => node('h_fn_def', { FN: id }, { DO: b });
K.call = id => node('h_fn_call', { FN: id });
K.on = d => node('h_switch', { DEV: d, STATE: '1' });
K.off = d => node('h_switch', { DEV: d, STATE: '0' });
K.open = d => node('h_move', { DEV: d, STATE: '1' });
K.close = d => node('h_move', { DEV: d, STATE: '0' });
K.wait = n => node('h_wait', {}, { SEC: n });
K.show = v => node('h_show', {}, { VAL: v });
K.iff = (c, ...b) => node('controls_if', {}, { IF0: c, DO0: b });
K.ife = (c, a, b) => node('controls_ifelse', {}, { IF0: c, DO0: a, ELSE: b });
K.rep = (n, ...b) => node('controls_repeat_ext', {}, { TIMES: n, DO: b });
K.set = (v, val) => node('variables_set', { VAR: '@' + v }, { VALUE: val });
K.chg = (v, n) => node('math_change', { VAR: '@' + v }, { DELTA: n == null ? 1 : n });
K.get = v => node('variables_get', { VAR: '@' + v });
K.sens = id => node('h_sensor', { SENS: id });
K.dig = id => node('h_digital', { SENS: id });
const OPS = { '=': 'EQ', '!=': 'NEQ', '<': 'LT', '<=': 'LTE', '>': 'GT', '>=': 'GTE' };
K.cmp = (a, op, b) => node('logic_compare', { OP: OPS[op] }, { A: a, B: b });
K.and = (a, b) => node('logic_operation', { OP: 'AND' }, { A: a, B: b });
K.or = (a, b) => node('logic_operation', { OP: 'OR' }, { A: a, B: b });
K.not = a => node('logic_negate', {}, { BOOL: a });
const AOPS = { '+': 'ADD', '-': 'MINUS', '*': 'MULTIPLY', '/': 'DIVIDE' };
K.ar = (a, op, b) => node('math_arithmetic', { OP: AOPS[op] }, { A: a, B: b });
K.txt = s => node('text', { TEXT: s });
K.join = (a, b) => node('text_join', {}, { ADD0: a, ADD1: b });
K.round = x => node('math_round', { OP: 'ROUND' }, { NUM: x });
K.num = n => node('math_number', { NUM: n });

/* Araç kutusunda gölge (sayısı değiştirilebilen hazır) sayı olan girişler */
const SHADOW = { h_wait: ['SEC'], h_show: ['VAL'], logic_compare: ['B'], math_arithmetic: ['A', 'B'], variables_set: ['VALUE'], math_change: ['DELTA'], controls_repeat_ext: ['TIMES'], math_round: ['NUM'] };
const STMT_INPUTS = ['DO', 'DO0', 'ELSE'];
function isShadowSlot(t, k) { return (SHADOW[t] || []).indexOf(k) >= 0; }

function toBlock(n) {
  const b = { type: n.t };
  if (Object.keys(n.f).length) {
    b.fields = {};
    Object.keys(n.f).forEach(k => { b.fields[k] = k === 'VAR' ? { name: n.f[k] } : n.f[k]; });
  }
  if (n.t === 'text_join') b.extraState = { itemCount: 2 };
  const inputs = {};
  Object.keys(n.i).forEach(k => {
    const v = n.i[k];
    if (STMT_INPUTS.indexOf(k) >= 0) { if (v.length) inputs[k] = { block: chain(v) }; return; }
    if (typeof v === 'number') {
      const nb = { type: 'math_number', fields: { NUM: v } };
      inputs[k] = isShadowSlot(n.t, k) ? { shadow: nb } : { block: nb };
    } else if (v) {
      inputs[k] = { block: toBlock(v) };
      if (isShadowSlot(n.t, k)) inputs[k].shadow = { type: 'math_number', fields: { NUM: 0 } };
    }
  });
  if (Object.keys(inputs).length) b.inputs = inputs;
  return b;
}
function chain(list) {
  let head = null, cur = null;
  list.forEach(n => { const b = toBlock(n); if (!head) head = b; else cur.next = { block: b }; cur = b; });
  return head;
}
K.solution = function (tops) {
  let y = 20;
  const blocks = tops.map(n => { const b = toBlock(n); b.x = 20; b.y = y; y += 60 + 44 * size(n); return b; });
  return { blocks: { languageVersion: 0, blocks: blocks } };
};
function size(n) { let c = 1; Object.keys(n.i).forEach(k => { const v = n.i[k]; if (Array.isArray(v)) v.forEach(x => { c += size(x); }); }); return c; }
/* Sayılan blok: gölge olmayan her blok */
K.countNodes = function (list) {
  let c = 0;
  function cnt(n) {
    c++;
    Object.keys(n.i).forEach(k => {
      const v = n.i[k];
      if (Array.isArray(v)) v.forEach(cnt);
      else if (typeof v === 'number') { if (!isShadowSlot(n.t, k)) c++; }
      else if (v) cnt(v);
    });
  }
  list.forEach(cnt); return c;
};
K.count = function (jsonBlocks) {
  let c = 0;
  K.walk(jsonBlocks, () => { c++; });
  return c;
};
K.walk = function (jsonBlocks, fn) {
  function w(b) { if (!b) return; fn(b); Object.keys(b.inputs || {}).forEach(k => { if (b.inputs[k].block) w(b.inputs[k].block); }); if (b.next) w(b.next.block); }
  jsonBlocks.forEach(w);
};
/* Her komutu/olay bloğunu tek tek silen kopyalar */
K.mutations = function (tops) {
  const out = [];
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function visitList(list, pathFn) {
    list.forEach((n, i) => {
      out.push({ label: n.t + (n.f.DEV ? ':' + n.f.DEV : n.f.EVT ? ':' + n.f.EVT : ''), tree: pathFn(arr => arr.splice(i, 1)) });
      STMT_INPUTS.forEach(k => {
        if (Array.isArray(n.i[k])) visitList(n.i[k], fn => pathFn(arr => fn(arr[i].i[k])));
      });
    });
  }
  visitList(tops, fn => { const c = clone(tops); fn(c); return c; });
  return out;
};

/* Senaryo yardımcıları */
K.d = s => s.replace(/\s/g, '').split('').map(Number);                   // '0011100' -> [0,0,1,1,1,0,0]
K.ramp = function (dur, ...pts) {                                           // ramp(12, [0,120], [6,30], [11,30])
  const out = [];
  for (let t = 0; t < dur; t++) {
    let j = 0; while (j < pts.length - 1 && pts[j + 1][0] <= t) j++;
    const a = pts[j], b = pts[Math.min(j + 1, pts.length - 1)];
    const v = b[0] === a[0] || t >= b[0] ? (t >= b[0] ? b[1] : a[1]) : a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]);
    out.push(Math.round(v));
  }
  return out;
};
K.vals = (...v) => v;
K.T = (tr, en) => ({ tr: tr, en: en });

/* Adımı tamamla: varsayılanlar ve çözüm */
K.finish = function (spec, chap) {
  const st = Object.assign({}, spec);
  st.text = K.T(spec.text[0], spec.text[1]);
  st.goal = K.T(spec.goal[0], spec.goal[1]);
  st.sensors = spec.sensors || [];
  st.devices = spec.devices || [];
  const H = global.__HOME;
  st.events = spec.events || Object.keys(H.EVENTS).filter(e => st.sensors.indexOf(H.EVENTS[e].s) >= 0);
  const fns = {}; st.tools.forEach(s => { const p = s.split(':'); if (p[0] === 'fn' || p[0] === 'call') fns[p[1]] = 1; });
  st.fns = Object.keys(fns);
  st.sol = K.solution(spec.sol);
  st.max = spec.max != null ? spec.max : K.countNodes(spec.sol);
  if (spec.starter) st.starter = K.solution(spec.starter);
  st.scen = spec.scen.map(s => ({ dur: s.dur, sig: s.sig, init: s.init }));
  if (chap.board && !spec.board) st.board = chap.board;
  ['wrong', 'skipMutation', 'dupe'].forEach(k => delete st[k]);
  return st;
};
K.goalWithMax = function (g, max) {
  return { tr: g.tr + ' En fazla ' + max + ' blok.', en: g.en + ' At most ' + max + ' blocks.' };
};
module.exports = K;
