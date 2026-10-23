/* afi kod - Python bölümleri (turtle, oyun, yapay zekâ) için çözüm yazım aracı
 * Bir blok: { t: tür, f: alanlar, i: girişler }. Girişte sayı -> gölge sayı bloğu, düğüm -> blok, dizi -> komut zinciri.
 */
const P = {};
const STMT = ['DO', 'DO0', 'DO1', 'ELSE'];
P.node = (t, f, i) => ({ t: t, f: f || {}, i: i || {} });
P.T = (tr, en) => ({ tr: tr, en: en });

function toBlock(n) {
  const b = { type: n.t };
  if (Object.keys(n.f).length) { b.fields = {}; Object.keys(n.f).forEach(k => { b.fields[k] = k === 'VAR' ? { name: n.f[k] } : n.f[k]; }); }
  if (n.t === 'text_join') b.extraState = { itemCount: 2 };
  if (n.t === 'controls_if' && (n.i.IF1 || n.i.ELSE)) b.extraState = n.i.IF1 ? { elseIfCount: 1, hasElse: !!n.i.ELSE } : { hasElse: true };
  const inputs = {};
  Object.keys(n.i).forEach(k => {
    const v = n.i[k];
    if (STMT.indexOf(k) >= 0) { if (v.length) inputs[k] = { block: chain(v) }; return; }
    if (typeof v === 'number') inputs[k] = { shadow: { type: 'math_number', fields: { NUM: v } } };
    else if (typeof v === 'string') inputs[k] = { shadow: { type: 'text', fields: { TEXT: v } } };
    else if (v) inputs[k] = { block: toBlock(v) };
  });
  if (Object.keys(inputs).length) b.inputs = inputs;
  return b;
}
function chain(list) {
  let head = null, cur = null;
  list.forEach(n => { const b = toBlock(n); if (!head) head = b; else cur.next = { block: b }; cur = b; });
  return head;
}
P.solution = function (tops) {
  let y = 20;
  return { blocks: { languageVersion: 0, blocks: tops.map(n => { const b = toBlock(n); b.x = 20; b.y = y; y += 50 + 40 * size(n); return b; }) } };
};
function size(n) { let c = 1; Object.keys(n.i).forEach(k => { const v = n.i[k]; if (Array.isArray(v)) v.forEach(x => { c += size(x); }); }); return c; }
/* Tek parça program: bütün komutlar tek zincir halinde (turtle) */
P.solutionChain = function (list) {
  const b = chain(list); b.x = 20; b.y = 20;
  return { blocks: { languageVersion: 0, blocks: [b] } };
};
/* Blok sayısı: gölge olmayan bloklar (sayı ve yazı kutuları sayılmaz) */
P.count = function (tops) {
  let c = 0;
  (function walk(list) { list.forEach(n => { c++; Object.keys(n.i).forEach(k => { const v = n.i[k]; if (Array.isArray(v)) walk(v); else if (v && typeof v === 'object') walk([v]); }); }); })(tops);
  return c;
};
/* Mutasyonlar: her komut bloğu tek tek silinir */
P.mutations = function (tops) {
  const out = [];
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function paths(list, pre) {
    list.forEach((n, idx) => {
      out.push(pre.concat([idx]));
      Object.keys(n.i).forEach(k => { if (Array.isArray(n.i[k])) paths(n.i[k], pre.concat([idx, k])); });
    });
  }
  paths(tops, []);
  return out.map(p => {
    const tree = clone(tops); let list = tree, i = 0;
    while (i < p.length - 1) { list = list[p[i]].i[p[i + 1]]; i += 2; }
    const removed = list.splice(p[p.length - 1], 1)[0];
    return { tree: tree, label: removed.t + JSON.stringify(removed.f) };
  }).filter(m => m.tree.length);
};
P.rep = (n, ...b) => P.node('controls_repeat_ext', {}, { TIMES: n, DO: b });
P.iff = (c, ...b) => P.node('controls_if', {}, { IF0: c, DO0: b });
P.ife = (c, a, b) => P.node('controls_if', {}, { IF0: c, DO0: a, ELSE: b });
const OPS = { '=': 'EQ', '!=': 'NEQ', '<': 'LT', '<=': 'LTE', '>': 'GT', '>=': 'GTE' };
P.cmp = (a, op, b) => P.node('logic_compare', { OP: OPS[op] }, { A: a, B: b });
P.and = (a, b) => P.node('logic_operation', { OP: 'AND' }, { A: a, B: b });
P.or = (a, b) => P.node('logic_operation', { OP: 'OR' }, { A: a, B: b });
P.not = a => P.node('logic_negate', {}, { BOOL: a });
const AOPS = { '+': 'ADD', '-': 'MINUS', '*': 'MULTIPLY', '/': 'DIVIDE' };
P.ar = (a, op, b) => P.node('math_arithmetic', { OP: AOPS[op] }, { A: a, B: b });
P.num = n => P.node('math_number', { NUM: n });
P.txt = s => P.node('text', { TEXT: s });
P.join = (a, b) => P.node('text_join', {}, { ADD0: a, ADD1: b });
P.set = (v, val) => P.node('variables_set', { VAR: v }, { VALUE: val });
P.get = v => P.node('variables_get', { VAR: v });
P.chg = (v, n) => P.node('math_change', { VAR: v }, { DELTA: n == null ? 1 : n });
module.exports = P;
