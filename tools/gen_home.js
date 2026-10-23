/* afi kod - Bölüm 4-12 üretici ve doğrulayıcı
 * Kullanım:  node tools/gen_home.js            ->  js/levels-home.js dosyasını yazar
 *            node tools/gen_home.js --py       ->  ayrıca her adımın .py dosyasını gerçek Python ile çalıştırır
 * İçerik tools/content/ch4.js ... ch10.js dosyalarındadır. Her adım için:
 *   1) Çözümdeki bloklar araç kutusunda var mı?
 *   2) Çözüm her senaryoda, Türkçe ve İngilizce kodla aynı sonucu veriyor mu? (beklenen durumlar buradan çıkar)
 *   3) Boş program başarısız mı?
 *   4) Çözümden herhangi bir komut ya da olay bloğu silinince program başarısız oluyor mu? (her blok gerekli mi)
 */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { load, ROOT } = require('./env.js');
const C = load();
const { Blockly: B, HOME: H, HomeBlocks: HB, RobotBlocks: RB } = C;
global.__HOME = H;
const K = require('./content/kit.js');

const CH = (process.argv.find(a => a.startsWith('--ch=')) || '').slice(5);
const FILES = CH ? CH.split(',') : ['ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10', 'ch11', 'ch12'];
const RUN_PY = process.argv.includes('--py');
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
const PYDIR = path.join(ROOT, 'tools', '.pytest');
if (RUN_PY) fs.mkdirSync(PYDIR, { recursive: true });

let N = 90, problems = 0, stats = [];
function warn(id, msg) { problems++; console.log('  !! ' + id + ': ' + msg); }

/* Araç kutusu girişinin blok türü */
function toolType(spec) { const e = HB.toolEntry(spec); return e.type; }
function wsFrom(json, st, lang) {
  RB.setLang(lang); HB.ctx = st;
  const ws = new B.Workspace();
  B.serialization.workspaces.load(HB.solution({ sol: json }), ws);
  return ws;
}
function codeOf(json, st, lang) { const ws = wsFrom(json, st, lang); const c = HB.runCode(ws); ws.dispose(); return c; }
function passAll(st, code) { return H.runAll(st, code).every(r => r.check.ok); }

const out = [];
FILES.forEach(f => {
  const chap = require('./content/' + f + '.js');
  console.log('== ' + chap.id + ' (' + chap.name.tr + ')');
  const lessons = [];
  chap.lessons.forEach(ls => {
    const steps = [];
    ls.steps.forEach(spec => {
      const st = K.finish(spec, chap);
      st.n = N++;
      if (ONLY && st.id !== ONLY) { steps.push(st); return; }
      /* 1) araçlar */
      const tools = st.tools.map(toolType);
      K.walk(st.sol.blocks.blocks, b => { if (tools.indexOf(b.type) < 0 && !(b.type === 'math_number')) warn(st.id, 'çözümdeki blok araç kutusunda yok: ' + b.type); });
      /* olay, cihaz, sensör listeleri */
      K.walk(st.sol.blocks.blocks, b => {
        if (b.type === 'h_event' && st.events.indexOf(b.fields.EVT) < 0) warn(st.id, 'olay listede yok: ' + b.fields.EVT);
        if ((b.type === 'h_switch' || b.type === 'h_move') && st.devices.indexOf(b.fields.DEV) < 0) warn(st.id, 'cihaz listede yok: ' + b.fields.DEV);
        if ((b.type === 'h_sensor' || b.type === 'h_digital') && st.sensors.indexOf(b.fields.SENS) < 0) warn(st.id, 'sensör listede yok: ' + b.fields.SENS);
        if ((b.type === 'h_fn_def' || b.type === 'h_fn_call') && (st.fns || []).indexOf(b.fields.FN) < 0) warn(st.id, 'fonksiyon listede yok: ' + b.fields.FN);
        if (b.type === 'h_show' && st.devices.indexOf('screen') < 0) warn(st.id, 'ekran cihaz listesinde yok');
      });
      /* 2) beklenen durumlar */
      const codeTr = codeOf(st.sol, st, 'tr'), codeEn = codeOf(st.sol, st, 'en');
      st.exp = st.scen.map((_, i) => { const r = H.simulate(st, codeTr, i); if (r.outcome !== 'done') warn(st.id, 'çözüm hata verdi: ' + r.outcome + ' ' + (r.err || '')); return H.expected(st, r); });
      if (!passAll(st, codeTr)) warn(st.id, 'çözüm (tr) geçmedi');
      if (!passAll(st, codeEn)) warn(st.id, 'çözüm (en) geçmedi');
      /* her senaryo farklı mı? */
      const sigs = st.exp.map(e => JSON.stringify(e));
      if (st.scen.length > 1 && new Set(sigs).size < st.scen.length) warn(st.id, 'iki senaryonun beklenen sonucu aynı');
      /* her cihaz en az bir kez değişiyor mu ya da ilk değerinden farklı mı? */
      st.devices.forEach(d => { if (!st.exp.some((e, i) => { const v = e[d], ini = (st.scen[i].init || {})[d]; const arr = typeof v === 'string' ? v.split('').map(Number) : v; return arr.some(x => !H.same(x, ini != null ? ini : (d === 'screen' ? '' : 0))); })) warn(st.id, 'cihaz hiç değişmiyor: ' + d); });
      /* 3) boş program */
      if (passAll(st, '')) warn(st.id, 'boş program da geçiyor');
      /* 4) mutasyon: her blok gerekli mi? */
      if (!spec.skipMutation) K.mutations(spec.sol).forEach(m => {
        let code; try { code = codeOf(K.solution(m.tree), st, 'tr'); } catch (e) { return; }
        if (passAll(st, code)) warn(st.id, 'şu blok silinince de geçiyor: ' + m.label);
      });
      /* blok sayısı */
      const cnt = K.count(st.sol.blocks.blocks);
      if (st.max == null) st.max = cnt;
      if (cnt > st.max) warn(st.id, 'çözüm ' + cnt + ' blok, sınır ' + st.max);
      if (spec.dupe) { /* fonksiyonsuz/döngüsüz kopya çözüm sınıra sığmamalı */
        const dj = K.solution(spec.dupe), dc = K.count(dj.blocks.blocks);
        if (dc <= st.max) warn(st.id, 'kısayolsuz çözüm de sınıra sığıyor (' + dc + ' ≤ ' + st.max + ')');
        const dcode = codeOf(dj, st, 'tr'); if (!passAll(st, dcode)) warn(st.id, 'kısayolsuz çözüm doğru çalışmıyor');
      }
      (spec.wrong || []).forEach((w, wi) => { const wj = K.solution(w); if (passAll(st, codeOf(wj, st, 'tr'))) warn(st.id, 'yanlış çözüm ' + (wi + 1) + ' geçiyor'); });
      st.goal = K.goalWithMax(st.goal, st.max);
      /* 5) Python dosyası */
      if (RUN_PY) {
        ['tr', 'en'].forEach(lg => {
          const ws = wsFrom(st.sol, st, lg); let py = HB.toPyFile(ws, st); ws.dispose();
          py = py.replace(/^HIZ = 0\.4/m, 'HIZ = 0').replace(/^SPEED = 0\.4/m, 'SPEED = 0');
          const fp = path.join(PYDIR, st.id + '_' + lg + '.py'); fs.writeFileSync(fp, py);
          const r = cp.spawnSync('python3', [fp], { encoding: 'utf8' });
          const ok = r.status === 0 && /(Tebrikler|Well done)/.test(r.stdout);
          if (!ok) warn(st.id, 'python (' + lg + ') başarısız: ' + (r.stderr || r.stdout).slice(-300));
        });
      }
      stats.push([st.id, ls.tier, st.max, st.scen.length]);
      steps.push(st);
    });
    lessons.push({ tier: ls.tier, title: ls.title, steps: steps });
  });
  out.push({ id: chap.id, room: chap.id, num: chap.num, sensors: chap.chips, name: chap.name, concept: chap.concept, story: chap.story, life: chap.life,
    view: chap.view || null, lessons: lessons });
});

const js = `/* afi kod - Bölüm 4-10: akıllı ev (bu dosya tools/gen_home.js ile üretildi; elle düzenlemek yerine tools/content/ dosyalarını değiştirip üreticiyi çalıştırın)
 * Her adım: sensors / devices / events  -> o adımda hangi sensör, cihaz ve olaylar var
 *           scen  -> senaryolar (her saniyenin sensör değerleri), exp -> beklenen cihaz durumları (çözümden hesaplandı)
 *           sol   -> çözüm (Blockly JSON), max -> blok sınırı, n -> ilerleme kodundaki sabit numara
 */
(function (root) {
  'use strict';
  var C = root.COURSE, HOMECH = ${JSON.stringify(out)};
  HOMECH.forEach(function (ch) { ch.lessons.forEach(function (ls) { ls.steps.forEach(function (st) { st.kind = 'home'; }); }); C.chapters.push(ch); });
  C.soon = [];
})(typeof window !== 'undefined' ? window : this);
`;
fs.writeFileSync(path.join(ROOT, 'js', 'levels-home.js'), js);
const byCh = {}; stats.forEach(s => { const c = s[0].split('-')[0]; byCh[c] = (byCh[c] || 0) + 1; });
console.log('adım:', stats.length, JSON.stringify(byCh), '| son n:', N - 1, '| sorun:', problems, '| boyut:', Math.round(js.length / 1024) + ' KB');
if (problems) process.exitCode = 1;
