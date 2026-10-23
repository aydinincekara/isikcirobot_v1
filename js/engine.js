/* afi kod - oyun motoru (Blockly'den bağımsız, saf JavaScript)
 * Harita karakterleri:
 *   ' ' boşluk (duvar)      o  yürünebilir zemin     S  başlangıç
 *   L   lamba karesi        D  kapalı kapı (açılınca zemin olur)
 *   K koltuk, M masa, B bitki, T tezgah  -> eşya (geçilemez)
 * Yönler: 0 yukarı, 1 sağ, 2 aşağı, 3 sol
 */
(function (root) {
  'use strict';
  var DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  var FURNITURE = 'KMBT';

  /* Fonksiyon adları: arayüz diline göre */
  var NAMES = {
    tr: {
      js: { fwd: 'ileriGit', left: 'solaDon', right: 'sagaDon', light: 'isigiYak', door: 'kapiyiAc',
            ON: 'onumAcikMi', SOL: 'solumAcikMi', SAG: 'sagimAcikMi', ISIK: 'isikKaresindeMiyim', KAPI: 'onumdeKapiVarMi', ALL: 'tumIsiklarYandiMi' },
      py: { fwd: 'ileri_git', left: 'sola_don', right: 'saga_don', light: 'isigi_yak', door: 'kapiyi_ac',
            ON: 'onum_acik_mi', SOL: 'solum_acik_mi', SAG: 'sagim_acik_mi', ISIK: 'isik_karesinde_miyim', KAPI: 'onumde_kapi_var_mi', ALL: 'tum_isiklar_yandi_mi' }
    },
    en: {
      js: { fwd: 'moveForward', left: 'turnLeft', right: 'turnRight', light: 'lightOn', door: 'openDoor',
            ON: 'isPathAhead', SOL: 'isPathLeft', SAG: 'isPathRight', ISIK: 'isOnLamp', KAPI: 'isDoorAhead', ALL: 'allLightsOn' },
      py: { fwd: 'move_forward', left: 'turn_left', right: 'turn_right', light: 'light_on', door: 'open_door',
            ON: 'is_path_ahead', SOL: 'is_path_left', SAG: 'is_path_right', ISIK: 'is_on_lamp', KAPI: 'is_door_ahead', ALL: 'all_lights_on' }
    }
  };

  function parseMap(rows) {
    var h = rows.length, w = 0, start = null, lamps = [], cells = [], furn = [];
    rows.forEach(function (r) { w = Math.max(w, r.length); });
    for (var y = 0; y < h; y++) {
      cells.push([]); furn.push([]);
      for (var x = 0; x < w; x++) {
        var c = rows[y][x] || ' ', t = 0, f = null;
        if (c === 'o' || c === 'S') t = 1;
        else if (c === 'L') { t = 2; lamps.push(x + ',' + y); }
        else if (c === 'D') t = 3;
        else if (FURNITURE.indexOf(c) >= 0) f = c;
        if (c === 'S') start = { x: x, y: y };
        cells[y].push(t); furn[y].push(f);
      }
    }
    return { w: w, h: h, cells: cells, furn: furn, start: start, lamps: lamps };
  }

  function variantsOf(step) { return step.maps || [step.map]; }

  /* Programı çalıştırır, her adımı kaydeder. code: Blockly'nin ürettiği JavaScript. */
  function simulate(step, code, vi) {
    var g = parseMap(variantsOf(step)[vi || 0]);
    var cells = g.cells.map(function (r) { return r.slice(); });
    var s = { x: g.start.x, y: g.start.y, dir: step.dir, lit: {}, opened: {} };
    var steps = [], cur = null, budget = 4000, outcome = null;
    function snap() { return { x: s.x, y: s.y, dir: s.dir, lit: Object.assign({}, s.lit), opened: Object.assign({}, s.opened) }; }
    function tick() { if (--budget < 0) throw { robot: 'loop' }; }
    function at(d) { var nx = s.x + DX[d], ny = s.y + DY[d];
      if (ny < 0 || ny >= g.h || nx < 0 || nx >= g.w) return { t: 0 };
      return { t: cells[ny][nx], x: nx, y: ny }; }
    function walkable(d) { var c = at(d); return c.t === 1 || c.t === 2; }
    function allLit() { return g.lamps.every(function (k) { return s.lit[k]; }); }
    var impl = {
      fwd: function () { tick();
        if (!walkable(s.dir)) { steps.push({ type: 'bump', block: cur, state: snap(), door: at(s.dir).t === 3 }); throw { robot: at(s.dir).t === 3 ? 'doorBump' : 'bump' }; }
        s.x += DX[s.dir]; s.y += DY[s.dir]; steps.push({ type: 'move', block: cur, state: snap() }); },
      left: function () { tick(); s.dir = (s.dir + 3) % 4; steps.push({ type: 'turn', turn: -1, block: cur, state: snap() }); },
      right: function () { tick(); s.dir = (s.dir + 1) % 4; steps.push({ type: 'turn', turn: 1, block: cur, state: snap() }); },
      light: function () { tick(); var k = s.x + ',' + s.y;
        if (cells[s.y][s.x] === 2) { s.lit[k] = true; steps.push({ type: 'light', block: cur, state: snap() }); }
        else { steps.push({ type: 'miss', block: cur, state: snap() }); if (step.strict) throw { robot: 'miss' }; } },
      door: function () { tick(); var c = at(s.dir);
        if (c.t !== 3) { steps.push({ type: 'nodoor', block: cur, state: snap() }); throw { robot: 'nodoor' }; }
        cells[c.y][c.x] = 1; s.opened[c.x + ',' + c.y] = true; steps.push({ type: 'door', block: cur, state: snap() }); },
      ON: function () { tick(); return walkable(s.dir); },
      SOL: function () { tick(); return walkable((s.dir + 3) % 4); },
      SAG: function () { tick(); return walkable((s.dir + 1) % 4); },
      ISIK: function () { tick(); return cells[s.y][s.x] === 2; },
      KAPI: function () { tick(); return at(s.dir).t === 3; },
      ALL: function () { tick(); return allLit(); }
    };
    var argNames = ['highlightBlock'], argVals = [function (id) { cur = id; tick(); }];
    ['tr', 'en'].forEach(function (lang) {
      var n = NAMES[lang].js;
      Object.keys(n).forEach(function (k) {
        if (argNames.indexOf(n[k]) < 0) { argNames.push(n[k]); argVals.push(impl[k]); }
      });
    });
    try {
      var fn = new Function(argNames.join(','), '"use strict";\n' + code);
      fn.apply(null, argVals);
      outcome = 'done';
    } catch (e) { outcome = (e && e.robot) ? e.robot : 'error'; }
    var litCount = g.lamps.filter(function (k) { return s.lit[k]; }).length;
    return { steps: steps, outcome: outcome, success: outcome === 'done' && litCount === g.lamps.length,
             litCount: litCount, lampCount: g.lamps.length, variant: vi || 0 };
  }

  function runAll(step, code) {
    return variantsOf(step).map(function (_, i) { return simulate(step, code, i); });
  }

  /* ---- Çözüm dili (öğretmen modu ve testler için) ----
   * F ileri, L sola, R sağa, Y ışık, O kapı aç
   * 3(...) tekrarla, U(...) ışığa varana kadar, A(...) tüm ışıklar yanana kadar
   * ?ON(...) eğer, ?ON(...|...) eğer-değilse.  Koşullar: ON SOL SAG ISIK KAPI
   */
  var ACT = { F: 'robot_ileri', L: 'robot_sola', R: 'robot_saga', Y: 'robot_isik', O: 'robot_kapi' };
  function parseDSL(src) {
    var toks = src.match(/\d+|\?[A-Z]+|[FLRYOUA]|\(|\)|\|/g) || [], i = 0;
    function seq(stops) {
      var out = [];
      while (i < toks.length && stops.indexOf(toks[i]) < 0) out.push(item());
      return out;
    }
    function expect(t) { if (toks[i] !== t) throw new Error('DSL: "' + t + '" bekleniyordu, "' + toks[i] + '" geldi'); i++; }
    function item() {
      var t = toks[i++];
      if (ACT[t]) return { k: 'act', type: ACT[t] };
      if (/^\d+$/.test(t)) { expect('('); var b = seq([')']); expect(')'); return { k: 'rep', n: +t, body: b }; }
      if (t === 'U' || t === 'A') { expect('('); var b2 = seq([')']); expect(')'); return { k: t === 'U' ? 'until' : 'untilAll', body: b2 }; }
      if (t && t[0] === '?') { expect('('); var a = seq(['|', ')']), e = null;
        if (toks[i] === '|') { i++; e = seq([')']); } expect(')');
        return { k: 'if', cond: t.slice(1), body: a, els: e }; }
      throw new Error('DSL: beklenmeyen "' + t + '"');
    }
    var r = seq([]); return r;
  }
  function nodeToBlock(n) {
    var b;
    if (n.k === 'act') b = { type: n.type };
    else if (n.k === 'rep') b = { type: 'controls_repeat_ext', inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: n.n } } } } };
    else if (n.k === 'until') b = { type: 'robot_until', inputs: {} };
    else if (n.k === 'untilAll') b = { type: 'robot_until_all', inputs: {} };
    else if (n.k === 'if') b = { type: n.els ? 'robot_ifelse' : 'robot_if', fields: { COND: n.cond }, inputs: {} };
    if (n.body && n.body.length) { b.inputs = b.inputs || {}; b.inputs.DO = { block: chainBlocks(n.body) }; }
    if (n.els && n.els.length) { b.inputs.ELSE = { block: chainBlocks(n.els) }; }
    return b;
  }
  function chainBlocks(nodes) {
    var head = null, cur = null;
    nodes.forEach(function (n) { var b = nodeToBlock(n); if (!head) head = b; else cur.next = { block: b }; cur = b; });
    return head;
  }
  function countNodes(nodes) {
    var c = 0; (nodes || []).forEach(function (n) { c += 1 + countNodes(n.body) + countNodes(n.els); }); return c;
  }
  function solutionWorkspace(src) {
    var head = chainBlocks(parseDSL(src));
    head.x = 40; head.y = 40;
    return { blocks: { languageVersion: 0, blocks: [head] } };
  }

  /* ---- İlerleme kodu: her adım için 0-3 yıldız, 2 bit ---- */
  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function encodeProgress(stars) {
    var last = -1; stars.forEach(function (s, i) { if (s > 0) last = i; });
    stars = stars.slice(0, last + 1);   /* sondaki boş adımlar yazılmaz; kısa kod, okurken 0 sayılır */
    var bits = '';
    stars.forEach(function (s) { s = Math.max(0, Math.min(3, s | 0)); bits += (s >> 1) + '' + (s & 1); });
    while (bits.length % 5) bits += '0';
    var body = 'A';
    for (var i = 0; i < bits.length; i += 5) body += ALPHA[parseInt(bits.substr(i, 5), 2)];
    var sum = 0; for (var j = 0; j < body.length; j++) sum = (sum + ALPHA.indexOf(body[j]) * (j + 1)) % 32;
    body += ALPHA[sum];
    return body.match(/.{1,4}/g).join('-');
  }
  /* B sürümü: aynı yıldızlı ardışık adımlar tek harfle yazılır (çok adım olunca kod kısa kalır).
   * Her harf: 2 bit yıldız + 3 bit (tekrar - 1). Tekrar 8 ise sonraki harf fazlasını (0-31) söyler. */
  function encodeRuns(stars) {
    var last = -1; stars.forEach(function (s, i) { if (s > 0) last = i; });
    stars = stars.slice(0, last + 1);
    var body = 'B', i = 0;
    while (i < stars.length) {
      var v = Math.max(0, Math.min(3, stars[i] | 0)), n = 1;
      while (i + n < stars.length && (stars[i + n] | 0) === v && n < 39) n++;
      if (n < 8) body += ALPHA[(v << 3) | (n - 1)];
      else body += ALPHA[(v << 3) | 7] + ALPHA[n - 8];
      i += n;
    }
    var sum = 0; for (var j = 0; j < body.length; j++) sum = (sum + ALPHA.indexOf(body[j]) * (j + 1)) % 32;
    body += ALPHA[sum];
    return body.match(/.{1,4}/g).join('-');
  }
  function encodeBest(stars) { var a = encodeProgress(stars), b = encodeRuns(stars); return b.length < a.length ? b : a; }
  function decodeProgress(code, count) {
    var s = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (s.length >= 2 && s[0] === 'B') {
      for (var q = 0; q < s.length; q++) if (ALPHA.indexOf(s[q]) < 0) return null;
      var bb = s.slice(0, -1), sm = 0;
      for (var w = 0; w < bb.length; w++) sm = (sm + ALPHA.indexOf(bb[w]) * (w + 1)) % 32;
      if (ALPHA[sm] !== s.slice(-1)) return null;
      var res = [], p = 1;
      while (p < bb.length) {
        var c = ALPHA.indexOf(bb[p++]), v = c >> 3, n = (c & 7) + 1;
        if (n === 8) { if (p >= bb.length) return null; n = 8 + ALPHA.indexOf(bb[p++]); }
        for (var r = 0; r < n; r++) res.push(v);
      }
      var outB = []; for (var z = 0; z < count; z++) outB.push(res[z] || 0);
      return outB;
    }
    if (s.length < 2 || s[0] !== 'A') return null;
    for (var k = 0; k < s.length; k++) if (ALPHA.indexOf(s[k]) < 0) return null;
    var body = s.slice(0, -1), chk = s.slice(-1), sum = 0;
    for (var j = 0; j < body.length; j++) sum = (sum + ALPHA.indexOf(body[j]) * (j + 1)) % 32;
    if (ALPHA[sum] !== chk) return null;
    var bits = '';
    for (var i = 1; i < body.length; i++) { var v = ALPHA.indexOf(body[i]).toString(2); bits += ('00000' + v).slice(-5); }
    var out = [];
    for (var n = 0; n < count; n++) { var b = bits.substr(n * 2, 2); out.push(b.length === 2 ? parseInt(b, 2) : 0); }
    return out;
  }

  root.Engine = { NAMES: NAMES, DX: DX, DY: DY, parseMap: parseMap, variantsOf: variantsOf, simulate: simulate, runAll: runAll,
    parseDSL: parseDSL, countNodes: countNodes, solutionWorkspace: solutionWorkspace,
    encodeProgress: encodeBest, encodeA: encodeProgress, encodeB: encodeRuns, decodeProgress: decodeProgress };
})(typeof window !== 'undefined' ? window : this);
