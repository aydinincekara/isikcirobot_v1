/* afi kod - Python bölümleri (Turtle, oyun, yapay zekâ) üretici ve doğrulayıcı
 * Kullanım (proje klasöründe):  node tools/gen_py.js          -> js/levels-py.js dosyasını yazar
 *                                node tools/gen_py.js --py     -> ayrıca her adımın .py dosyasını gerçek Python ile çalıştırır
 * Her adımda: çözüm geçiyor mu, boş program başarısız mı, çözümden bir blok silinince başarısız oluyor mu,
 * indirilen .py dosyası aynı sonucu veriyor mu (turtle için tools/pymock/turtle.py ile).
 */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { load, ROOT } = require('./env.js');
const FILES = ['engine.js', 'i18n.js', 'i18n-home.js', 'i18n-py.js', 'blocks.js', 'home.js', 'home-blocks.js'];
['kind-turtle.js', 'kind-game.js', 'kind-ai.js'].forEach(f => { if (fs.existsSync(path.join(ROOT, 'js', f))) FILES.push(f); });
const C = load(FILES);
const { Blockly: B, RobotBlocks: RB, KINDS } = C;
const P = require('./content/pykit.js');
const RUN_PY = process.argv.includes('--py');
const PYDIR = path.join(ROOT, 'tools', '.pytest'); if (RUN_PY) fs.mkdirSync(PYDIR, { recursive: true });
const CHAPS = [['py_turtle', 320], ['py_game', 330], ['py_ai', 340]];
let problems = 0;
function warn(id, msg) { problems++; console.log('  !! ' + id + ': ' + msg); }
function wsOf(sol, lang) { RB.setLang(lang); const ws = new B.Workspace(); B.serialization.workspaces.load(sol, ws); return ws; }
function walk(blocks, f) { (function w(b) { if (!b) return; f(b); Object.values(b.inputs || {}).forEach(i => { w(i.block); }); if (b.next) w(b.next.block); })(blocks); }

/* Her tür için: hazırlık (beklenen sonuç) ve sınama */
const KIND = {
  turtle: {
    prepare(st) { const ws = wsOf(st.sol, 'tr'); const r = KINDS.turtle.simulate(KINDS.turtle.runCode(ws)); ws.dispose();
      st.target = r.segs.map(s => ({ x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2, c: s.c, w: s.w })); if (!st.target.length) warn(st.id, 'hedef çizim boş'); },
    passes(st, code) { const r = KINDS.turtle.simulate(code); return KINDS.turtle.check(st, r).ok; },
    pyCheck(st, out) {
      const m = out.match(/__SEGS__(.*)/); if (!m) return 'çıktı yok';
      const segs = JSON.parse(m[1]).map(a => ({ x1: a[0], y1: a[1], x2: a[2], y2: a[3], c: a[4], w: a[5] }));
      return KINDS.turtle.check(st, { outcome: 'done', segs: segs }).ok ? null : 'python çizimi hedefle aynı değil';
    }
  }
};
if (KINDS.game) KIND.game = KINDS.game.genHooks;
if (KINDS.ai) KIND.ai = KINDS.ai.genHooks;

const out = [];
CHAPS.forEach(([file, n0]) => {
  const fp = path.join(__dirname, 'content', file + '.js'); if (!fs.existsSync(fp)) return;
  const chap = require(fp), K = KINDS[chap.kind], H = KIND[chap.kind]; let N = n0;
  if (!K || !H) { console.log('== ' + chap.id + ' atlandı (motor yok)'); return; }
  console.log('== ' + chap.id + ' (' + chap.name.tr + ')');
  const lessons = chap.lessons.map(ls => ({ tier: ls.tier, title: ls.title, steps: ls.steps.map(spec => {
    const st = Object.assign({}, spec, { kind: chap.kind, n: N++, text: P.T(spec.text[0], spec.text[1]), goal: P.T(spec.goal[0], spec.goal[1]) });
    const SOL = chap.chain ? P.solutionChain : P.solution;
    st.sol = SOL(spec.sol);
    if (spec.solEn) st.solEn = SOL(spec.solEn);
    if (spec.starter) st.starter = P.solution(spec.starter);
    st.max = spec.max != null ? spec.max : P.count(spec.sol);
    ['wrong', 'skipMutation'].forEach(k => delete st[k]);
    if (K.ctx) K.ctx.ctx = st;
    /* araç kutusu */
    const types = st.tools.map(s => K.toolEntry(s).type);
    st.sol.blocks.blocks.forEach(b => walk(b, x => { if (types.indexOf(x.type) < 0 && ['math_number', 'text'].indexOf(x.type) < 0) warn(st.id, 'çözümdeki blok araç kutusunda yok: ' + x.type); }));
    H.prepare(st);
    const solOf = lg => lg === 'en' && st.solEn ? st.solEn : st.sol;
    const code = lg => { const ws = wsOf(solOf(lg), lg); const c = K.runCode(ws, st); ws.dispose(); return c; };
    if (!H.passes(st, code('tr'), 'tr')) warn(st.id, 'çözüm (tr) geçmedi');
    if (!H.passes(st, code('en'), 'en')) warn(st.id, 'çözüm (en) geçmedi');
    if (H.passes(st, '', 'tr')) warn(st.id, 'boş program da geçiyor');
    if (!spec.skipMutation) P.mutations(spec.sol).forEach(m => { const ws = wsOf(SOL(m.tree), 'tr'); const c = K.runCode(ws, st); ws.dispose(); if (H.passes(st, c, 'tr')) warn(st.id, 'şu blok silinince de geçiyor: ' + m.label); });
    (spec.wrong || []).forEach((w, i) => { const ws = wsOf(SOL(w), 'tr'); const c = K.runCode(ws, st); ws.dispose(); if (H.passes(st, c, 'tr')) warn(st.id, 'yanlış çözüm ' + (i + 1) + ' geçiyor'); });
    st.goal = { tr: st.goal.tr + ' En fazla ' + st.max + ' blok.', en: st.goal.en + ' At most ' + st.max + ' blocks.' };
    if (RUN_PY) ['tr', 'en'].forEach(lg => {
      const ws = wsOf(solOf(lg), lg); let py = K.pyFile(ws, st); ws.dispose();
      if (H.pyPrep) py = H.pyPrep(py, st);
      const f = path.join(PYDIR, st.id + '_' + lg + '.py'); fs.writeFileSync(f, py);
      const r = cp.spawnSync('python3', [f], { encoding: 'utf8', env: Object.assign({}, process.env, { PYTHONPATH: path.join(ROOT, 'tools', 'pymock') }), timeout: 20000 });
      const msg = r.status !== 0 ? 'çıkış kodu ' + r.status + ' ' + (r.stderr || '').slice(-300) : H.pyCheck(st, r.stdout);
      if (msg) warn(st.id, 'python (' + lg + '): ' + msg);
    });
    return st;
  }) }));
  out.push({ id: chap.id, room: chap.id, num: chap.num, sensors: chap.chips || [], name: chap.name, concept: chap.concept, story: chap.story, life: chap.life, view: chap.view || null, lessons: lessons });
});

const js = `/* afi kod - Python bölümleri: Turtle, oyun, yapay zekâ (bu dosya tools/gen_py.js ile üretildi; tools/content/py_*.js dosyalarını değiştirip üreticiyi çalıştırın) */
(function (root) {
  'use strict';
  var C = root.COURSE, PYCH = ${JSON.stringify(out)};
  PYCH.forEach(function (ch) { C.chapters.push(ch); });
})(typeof window !== 'undefined' ? window : this);
`;
fs.writeFileSync(path.join(ROOT, 'js', 'levels-py.js'), js);
const total = out.reduce((a, c) => a + c.lessons.reduce((b, l) => b + l.steps.length, 0), 0);
console.log('adım: ' + total + ' | sorun: ' + problems + ' | boyut: ' + Math.round(js.length / 1024) + ' KB');
