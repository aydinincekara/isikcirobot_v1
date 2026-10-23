/* afi kod - akıllı ev blokları ve kod üreteçleri (Bölüm 4-10)
 * Python ve JavaScript görünümü, simülatörün çalıştırdığı kod, Arduino (.ino) ve indirilebilir Python (.py) dosyası.
 */
(function (root) {
  'use strict';
  var B = root.Blockly, H = root.HOME;
  var JS = root.javascript.javascriptGenerator, PY = root.python.pythonGenerator;
  var JO = root.javascript.Order, PO = root.python.Order;
  var S = H.SENSORS, D = H.DEVICES, EV = H.EVENTS, camel = H.camel;

  var HB = { lang: 'tr', ctx: null, mode: 'show' };
  var COL = { hat: '#D1603D', fn: '#9B4FD1', power: '#E89B12', open: '#B9773B', wait: '#7C5CE0', screen: '#4F6D8A', sensor: '#2E9BC6', digital: '#2E9BC6' };

  /* ---------- Açılır menüler: o adımda hangi cihaz/sensör varsa ---------- */
  function L(o) { return o ? (o[HB.lang] || o.tr) : ''; }
  function ctxList(key, all, filter) {
    var st = HB.ctx, list = (st && st[key]) ? st[key].filter(filter) : [];
    if (!list.length) list = Object.keys(all).filter(filter);
    return list;
  }
  function devLabel(id) { var d = D[id]; return HB.lang === 'tr' ? d.acc : d.name.en.toLowerCase(); }
  function devOpts(kind) {
    return function () { return ctxList('devices', D, function (id) { return D[id] && D[id].kind === kind; }).map(function (id) { return [devLabel(id), id]; }); };
  }
  function evOpts() { return ctxList('events', EV, function (id) { return !!EV[id]; }).map(function (id) { return [L(EV[id].label), id]; }); }
  function numOpts() { return ctxList('sensors', S, function (id) { return S[id] && S[id].type === 'num'; }).map(function (id) { return [L(S[id].r), id]; }); }
  function digOpts() { return ctxList('sensors', S, function (id) { return S[id] && S[id].type !== 'num'; }).map(function (id) { return [L(S[id].q), id]; }); }
  function fnOpts() { return ctxList('fns', H.FUNCS, function (id) { return !!H.FUNCS[id]; }).map(function (id) { return [L(H.FUNCS[id]), id]; }); }

  var stmt = { previousStatement: null, nextStatement: null };
  function def(type, o) { B.Blocks[type] = { init: function () { this.jsonInit(Object.assign({ type: type }, o)); } }; }
  function hat(type, msg, arg, col) {
    var o = { message0: msg, message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], colour: col || COL.hat, tooltip: '%{BKY_' + type.toUpperCase() + '_TIP}' };
    if (arg) o.args0 = [arg];
    def(type, o);
  }
  hat('h_start', '%{BKY_H_START}');
  hat('h_every', '%{BKY_H_EVERY}');
  hat('h_forever', '%{BKY_H_FOREVER}');
  hat('h_event', '%{BKY_H_EVENT}', { type: 'field_dropdown', name: 'EVT', options: evOpts });
  hat('h_fn_def', '%{BKY_H_FN_DEF}', { type: 'field_dropdown', name: 'FN', options: fnOpts }, COL.fn);
  def('h_switch', Object.assign({ message0: '%{BKY_H_SWITCH}', args0: [{ type: 'field_dropdown', name: 'DEV', options: devOpts('power') },
    { type: 'field_dropdown', name: 'STATE', options: [['%{BKY_H_ON}', '1'], ['%{BKY_H_OFF}', '0']] }], colour: COL.power, tooltip: '%{BKY_H_SWITCH_TIP}' }, stmt));
  def('h_move', Object.assign({ message0: '%{BKY_H_MOVE}', args0: [{ type: 'field_dropdown', name: 'DEV', options: devOpts('open') },
    { type: 'field_dropdown', name: 'STATE', options: [['%{BKY_H_OPEN}', '1'], ['%{BKY_H_CLOSE}', '0']] }], colour: COL.open, tooltip: '%{BKY_H_MOVE_TIP}' }, stmt));
  def('h_wait', Object.assign({ message0: '%{BKY_H_WAIT}', args0: [{ type: 'input_value', name: 'SEC', check: 'Number' }], inputsInline: true, colour: COL.wait, tooltip: '%{BKY_H_WAIT_TIP}' }, stmt));
  def('h_show', Object.assign({ message0: '%{BKY_H_SHOW}', args0: [{ type: 'input_value', name: 'VAL' }], inputsInline: true, colour: COL.screen, tooltip: '%{BKY_H_SHOW_TIP}' }, stmt));
  def('h_fn_call', Object.assign({ message0: '%{BKY_H_FN_CALL}', args0: [{ type: 'field_dropdown', name: 'FN', options: fnOpts }], colour: COL.fn, tooltip: '%{BKY_H_FN_CALL_TIP}' }, stmt));
  def('h_sensor', { message0: '%1', args0: [{ type: 'field_dropdown', name: 'SENS', options: numOpts }], output: 'Number', colour: COL.sensor, tooltip: '%{BKY_H_SENSOR_TIP}' });
  def('h_digital', { message0: '%1', args0: [{ type: 'field_dropdown', name: 'SENS', options: digOpts }], output: 'Boolean', colour: COL.digital, tooltip: '%{BKY_H_DIGITAL_TIP}' });

  var HOME_TYPES = ['h_start', 'h_every', 'h_forever', 'h_event', 'h_fn_def', 'h_switch', 'h_move', 'h_wait', 'h_show', 'h_fn_call', 'h_sensor', 'h_digital'];
  var HAT_TYPES = ['h_start', 'h_every', 'h_forever', 'h_event', 'h_fn_def'];

  /* ---------- Adlar ---------- */
  function lg() { return HB.lang === 'en' ? 'en' : 'tr'; }
  function pyName(cat, id) { return cat[id].py[lg()]; }
  function devObj(id, js) { var n = D[id].py[lg()]; return js ? camel(n) : n; }
  function method(id, on) { var d = D[id]; if (d.kind === 'screen') return H.METHODS.screen[lg()]; return H.METHODS[d.kind][lg()][on ? 1 : 0]; }
  function fnName(id, js) { var n = H.FUNCS[id] ? H.FUNCS[id][lg()] : id; return js ? camel(n) : n; }
  function hatName(b, js) {
    var n;
    if (b.type === 'h_start') n = H.HATS.start[lg()];
    else if (b.type === 'h_every') n = H.HATS.every[lg()];
    else if (b.type === 'h_forever') n = H.HATS.forever[lg()];
    else n = (EV[b.getFieldValue('EVT')] || EV.motion).py[lg()];
    return js ? camel(n) : n;
  }
  function waitName() { return lg() === 'en' ? 'wait' : 'bekle'; }
  function taskName(n) { return (lg() === 'en' ? 'task_' : 'gorev_') + n; }
  /* Python: fonksiyon içinde değiştirilen değişkenler için "global" satırı */
  function globalsOf(b, gen) {
    var seen = {}, out = [];
    b.getDescendants(false).forEach(function (d) {
      if (d.type === 'variables_set' || d.type === 'math_change') {
        var nm = gen.getVariableName(d.getFieldValue('VAR'));
        if (!seen[nm]) { seen[nm] = 1; out.push(nm); }
      }
    });
    return out.length ? gen.INDENT + 'global ' + out.join(', ') + '\n' : '';
  }

  /* ---------- Python ---------- */
  function pyBody(b) { return PY.statementToCode(b, 'DO') || PY.INDENT + 'pass\n'; }
  ['h_start', 'h_every', 'h_forever', 'h_event'].forEach(function (tp) {
    PY.forBlock[tp] = function (b) {
      PY.__hatN = (PY.__hatN || 0) + 1;
      return '@' + hatName(b) + '\ndef ' + taskName(PY.__hatN) + '():\n' + globalsOf(b, PY) + pyBody(b) + '\n';
    };
  });
  PY.forBlock.h_fn_def = function (b) { return 'def ' + fnName(b.getFieldValue('FN')) + '():\n' + globalsOf(b, PY) + pyBody(b) + '\n'; };
  PY.forBlock.h_fn_call = function (b) { return fnName(b.getFieldValue('FN')) + '()\n'; };
  PY.forBlock.h_switch = PY.forBlock.h_move = function (b) {
    var id = b.getFieldValue('DEV'); return devObj(id) + '.' + method(id, b.getFieldValue('STATE') === '1') + '()\n';
  };
  PY.forBlock.h_wait = function (b) { return waitName() + '(' + (PY.valueToCode(b, 'SEC', PO.NONE) || '1') + ')\n'; };
  PY.forBlock.h_show = function (b) { return devObj('screen') + '.' + method('screen') + '(' + (PY.valueToCode(b, 'VAL', PO.NONE) || '0') + ')\n'; };
  PY.forBlock.h_sensor = PY.forBlock.h_digital = function (b) { return [pyName(S, b.getFieldValue('SENS')) + '()', PO.FUNCTION_CALL]; };
  PY.forBlock.math_change = function (b) {
    var v = PY.getVariableName(b.getFieldValue('VAR')), d = PY.valueToCode(b, 'DELTA', PO.ADDITIVE) || '0';
    return v + ' += ' + d + '\n';
  };

  /* ---------- JavaScript (görünüm ve simülasyon) ---------- */
  function jsBody(b) { return JS.statementToCode(b, 'DO'); }
  ['h_start', 'h_every', 'h_forever', 'h_event'].forEach(function (tp) {
    JS.forBlock[tp] = function (b) { return hatName(b, true) + '(function () {\n' + jsBody(b) + '});\n'; };
  });
  JS.forBlock.h_fn_def = function (b) { return 'function ' + fnName(b.getFieldValue('FN'), true) + '() {\n' + jsBody(b) + '}\n'; };
  JS.forBlock.h_fn_call = function (b) { return fnName(b.getFieldValue('FN'), true) + '();\n'; };
  JS.forBlock.h_switch = JS.forBlock.h_move = function (b) {
    var id = b.getFieldValue('DEV'); return devObj(id, true) + '.' + method(id, b.getFieldValue('STATE') === '1') + '();\n';
  };
  JS.forBlock.h_wait = function (b) { return waitName() + '(' + (JS.valueToCode(b, 'SEC', JO.NONE) || '1') + ');\n'; };
  JS.forBlock.h_show = function (b) { return devObj('screen', true) + '.' + method('screen') + '(' + (JS.valueToCode(b, 'VAL', JO.NONE) || '0') + ');\n'; };
  JS.forBlock.h_sensor = JS.forBlock.h_digital = function (b) { return [camel(pyName(S, b.getFieldValue('SENS'))) + '()', JO.FUNCTION_CALL]; };
  var jsVarSet = JS.forBlock.variables_set;
  JS.forBlock.variables_set = function (b, g) {
    var code = jsVarSet.call(this, b, g);
    if (HB.mode === 'run') { var v = g.getVariableName(b.getFieldValue('VAR')); code += "__v('" + v + "', " + v + ');\n'; }
    return code;
  };
  JS.forBlock.math_change = function (b, g) {
    var v = g.getVariableName(b.getFieldValue('VAR')), d = g.valueToCode(b, 'DELTA', JO.ADDITION) || '0';
    var code = v + ' += ' + d + ';\n';
    if (HB.mode === 'run') code += "__v('" + v + "', " + v + ');\n';
    return code;
  };

  /* ---------- Kodun bütünü ---------- */
  function rank(b) { return b.type === 'h_fn_def' ? 0 : b.type === 'h_start' ? 1 : b.type === 'h_event' ? 2 : b.type === 'h_every' || b.type === 'h_forever' ? 3 : 4; }
  function topsSorted(ws) {
    return ws.getTopBlocks(true).filter(function (b) { return !b.isShadow(); }).map(function (b, i) { return [b, i]; })
      .sort(function (a, c) { return rank(a[0]) - rank(c[0]) || a[1] - c[1]; }).map(function (x) { return x[0]; });
  }
  function assemble(gen, ws) {
    gen.init(ws); gen.__hatN = 0;
    var parts = [];
    topsSorted(ws).forEach(function (b) {
      var c = gen.blockToCode(b);
      if (Array.isArray(c)) c = gen.scrubNakedValue(c[0]);
      if (c) parts.push(c);
    });
    return gen.finish(parts.join('\n'));
  }
  function zeroInit(code, py) {
    if (py) return code.replace(/^([A-Za-z_][A-Za-z0-9_]*) = None$/mg, '$1 = 0');
    return code.replace(/^var ([^;\n]+);$/m, function (m, list) { return 'var ' + list.split(/,\s*/).map(function (n) { return n + ' = 0'; }).join(', ') + ';'; });
  }
  HB.toPython = function (ws) {
    var body = zeroInit(assemble(PY, ws), true).replace(/\n{3,}/g, '\n\n').trim();
    var head = lg() === 'en' ? 'from afi_home import *' : 'from afi_ev import *';
    return head + '\n\n' + (body ? body + '\n\n' : '') + (lg() === 'en' ? 'run()' : 'calistir()');
  };
  HB.toJS = function (ws) { return zeroInit(assemble(JS, ws), false).replace(/\n{3,}/g, '\n\n').trim(); };
  HB.runCode = function (ws) {
    HB.mode = 'run'; JS.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    try { return zeroInit(assemble(JS, ws), false); } finally { JS.STATEMENT_PREFIX = null; HB.mode = 'show'; }
  };
  /* Tek bir bloğun kodu (açıklama paneli için) */
  HB.snippet = function (b, kind) {
    var gen = kind === 'py' ? PY : kind === 'ino' ? INO : JS;
    gen.init(b.workspace); gen.__hatN = 0;
    var c = gen.blockToCode(b, true);
    if (Array.isArray(c)) c = c[0];
    c = String(c || '').replace(/\n+$/, '');
    var lines = c.split('\n');
    if (lines.length > 9) c = lines.slice(0, 8).join('\n') + '\n' + (kind === 'py' ? '    ...' : '  ...');
    return c;
  };
  /* Bağlı olmayan bloklar: olay/başlangıç/her saniye/fonksiyon dışında kalan komutlar */
  HB.looseBlocks = function (ws) {
    return ws.getTopBlocks(false).filter(function (b) { return !b.isShadow() && HAT_TYPES.indexOf(b.type) < 0; });
  };
  HB.isHomeType = function (tp) { return HOME_TYPES.indexOf(tp) >= 0; };

  /* ---------- Araç kutusu ---------- */
  function num(n) { return { shadow: { type: 'math_number', fields: { NUM: n } } }; }
  function varName(id) { return H.VARS[id] ? H.VARS[id][lg()] : id; }
  HB.toolEntry = function (spec) {
    var p = spec.split(':'), k = p[0];
    switch (k) {
      case 'start': return { kind: 'block', type: 'h_start' };
      case 'every': return { kind: 'block', type: 'h_every' };
      case 'forever': return { kind: 'block', type: 'h_forever' };
      case 'event': return p[1] ? { kind: 'block', type: 'h_event', fields: { EVT: p[1] } } : { kind: 'block', type: 'h_event' };
      case 'switch': case 'move': {
        var o = { kind: 'block', type: k === 'switch' ? 'h_switch' : 'h_move', fields: {} };
        if (p[1]) o.fields.DEV = p[1]; if (p[2]) o.fields.STATE = p[2]; return o;
      }
      case 'wait': return { kind: 'block', type: 'h_wait', inputs: { SEC: num(+(p[1] || 1)) } };
      case 'show': return { kind: 'block', type: 'h_show', inputs: { VAL: num(0) } };
      case 'sensor': return p[1] ? { kind: 'block', type: 'h_sensor', fields: { SENS: p[1] } } : { kind: 'block', type: 'h_sensor' };
      case 'digital': return p[1] ? { kind: 'block', type: 'h_digital', fields: { SENS: p[1] } } : { kind: 'block', type: 'h_digital' };
      case 'if': return { kind: 'block', type: 'controls_if' };
      case 'ifelse': return { kind: 'block', type: 'controls_ifelse' };
      case 'compare': return { kind: 'block', type: 'logic_compare', fields: { OP: p[1] || 'LT' }, inputs: { B: num(+(p[2] || 50)) } };
      case 'and': return { kind: 'block', type: 'logic_operation', fields: { OP: 'AND' } };
      case 'or': return { kind: 'block', type: 'logic_operation', fields: { OP: 'OR' } };
      case 'not': return { kind: 'block', type: 'logic_negate' };
      case 'num': return { kind: 'block', type: 'math_number', fields: { NUM: +(p[1] || 0) } };
      case 'arith': return { kind: 'block', type: 'math_arithmetic', fields: { OP: p[1] || 'ADD' }, inputs: { A: num(1), B: num(+(p[2] || 1)) } };
      case 'round': return { kind: 'block', type: 'math_round', fields: { OP: 'ROUND' }, inputs: { NUM: num(3.1) } };
      case 'set': return { kind: 'block', type: 'variables_set', fields: { VAR: { name: varName(p[1]) } }, inputs: { VALUE: num(+(p[2] || 0)) } };
      case 'get': return { kind: 'block', type: 'variables_get', fields: { VAR: { name: varName(p[1]) } } };
      case 'change': return { kind: 'block', type: 'math_change', fields: { VAR: { name: varName(p[1]) } }, inputs: { DELTA: num(+(p[2] || 1)) } };
      case 'repeat': return { kind: 'block', type: 'controls_repeat_ext', inputs: { TIMES: num(+(p[1] || 3)) } };
      case 'fn': return { kind: 'block', type: 'h_fn_def', fields: { FN: p[1] } };
      case 'call': return { kind: 'block', type: 'h_fn_call', fields: { FN: p[1] } };
      case 'text': return { kind: 'block', type: 'text', fields: { TEXT: p.slice(1).join(':') } };
      case 'join': return { kind: 'block', type: 'text_join', extraState: { itemCount: 2 } };
    }
    return { kind: 'block', type: spec };
  };
  HB.toolbox = function (st) { return { kind: 'flyoutToolbox', contents: st.tools.map(HB.toolEntry) }; };

  /* Çözüm: değişken adları "@sayaç" gibi yer tutucularla saklanır, dile göre yerleştirilir */
  HB.solution = function (st) {
    var s = JSON.stringify(st.sol).replace(/"@([a-z_]+)"/g, function (m, id) { return JSON.stringify(varName(id)); });
    return JSON.parse(s);
  };

  /* =====================================================================
   *  Arduino (.ino)
   * ===================================================================== */
  var INO = new root.javascript.JavascriptGenerator('Arduino');
  Object.keys(JS.forBlock).forEach(function (k) { INO.forBlock[k] = JS.forBlock[k]; });
  INO.INDENT = '  ';
  INO.forBlock.variables_set = function (b, g) { return g.getVariableName(b.getFieldValue('VAR')) + ' = ' + (g.valueToCode(b, 'VALUE', JO.ASSIGNMENT) || '0') + ';\n'; };
  INO.forBlock.math_change = function (b, g) { return g.getVariableName(b.getFieldValue('VAR')) + ' += ' + (g.valueToCode(b, 'DELTA', JO.ADDITION) || '0') + ';\n'; };
  INO.forBlock.controls_repeat_ext = function (b, g) {
    var n = g.valueToCode(b, 'TIMES', JO.ASSIGNMENT) || '0', body = g.statementToCode(b, 'DO');
    var i = g.nameDB_.getDistinctName('i', B.Names.NameType.VARIABLE);
    return 'for (int ' + i + ' = 0; ' + i + ' < ' + n + '; ' + i + '++) {\n' + body + '}\n';
  };
  INO.forBlock.math_arithmetic = function (b, g) {
    var OPS = { ADD: [' + ', JO.ADDITION], MINUS: [' - ', JO.SUBTRACTION], MULTIPLY: [' * ', JO.MULTIPLICATION], DIVIDE: [' / ', JO.DIVISION] };
    var op = b.getFieldValue('OP');
    if (op === 'POWER') return ['pow(' + (g.valueToCode(b, 'A', JO.NONE) || '0') + ', ' + (g.valueToCode(b, 'B', JO.NONE) || '0') + ')', JO.FUNCTION_CALL];
    var t = OPS[op]; return [(g.valueToCode(b, 'A', t[1]) || '0') + t[0] + (g.valueToCode(b, 'B', t[1]) || '0'), t[1]];
  };
  INO.forBlock.math_round = function (b, g) {
    var f = { ROUND: 'round', ROUNDUP: 'ceil', ROUNDDOWN: 'floor' }[b.getFieldValue('OP')] || 'round';
    return [f + '(' + (g.valueToCode(b, 'NUM', JO.NONE) || '0') + ')', JO.FUNCTION_CALL];
  };
  INO.forBlock.text = function (b) { return [JSON.stringify(b.getFieldValue('TEXT')), JO.ATOMIC]; };
  INO.forBlock.text_join = function (b, g) {
    var parts = []; for (var i = 0; i < b.itemCount_; i++) parts.push('String(' + (g.valueToCode(b, 'ADD' + i, JO.NONE) || '""') + ')');
    return [parts.length ? parts.join(' + ') : '""', JO.ADDITION];
  };
  INO.forBlock.h_fn_def = function (b, g) { return 'void ' + fnName(b.getFieldValue('FN'), true) + '() {\n' + g.statementToCode(b, 'DO') + '}\n'; };
  ['h_start', 'h_every', 'h_forever', 'h_event'].forEach(function (tp) {
    INO.forBlock[tp] = function (b, g) {
      g.__hatN = (g.__hatN || 0) + 1; var name = NM('task') + g.__hatN;
      g.__tasks.push({ name: name, type: tp, ev: tp === 'h_event' ? b.getFieldValue('EVT') : null });
      return '// ' + (tp === 'h_event' ? L(EV[b.getFieldValue('EVT')].label) : tp === 'h_start' ? T('startNote') : tp === 'h_forever' ? T('foreverNote') : T('everyNote')) + '\nvoid ' + name + '() {\n' + g.statementToCode(b, 'DO') + '}\n';
    };
  });
  INO.forBlock.h_fn_call = function (b) { return fnName(b.getFieldValue('FN'), true) + '();\n'; };
  INO.forBlock.h_wait = function (b, g) {
    var v = g.valueToCode(b, 'SEC', JO.MULTIPLICATION) || '1';
    return 'delay(' + (/^\d+(\.\d+)?$/.test(v) ? String(Math.round(parseFloat(v) * 1000)) : v + ' * 1000') + ');\n';
  };
  INO.forBlock.h_show = function (b, g) { return 'Serial.println(' + (g.valueToCode(b, 'VAL', JO.NONE) || '0') + ');\n'; };
  INO.forBlock.h_sensor = INO.forBlock.h_digital = function (b) { return [camel(pyName(S, b.getFieldValue('SENS'))) + '()', JO.FUNCTION_CALL]; };
  INO.forBlock.h_switch = function (b) {
    var id = b.getFieldValue('DEV'); return 'digitalWrite(' + pinConst(id) + ', ' + (b.getFieldValue('STATE') === '1' ? 'HIGH' : 'LOW') + ');\n';
  };
  INO.forBlock.h_move = function (b) {
    var id = b.getFieldValue('DEV'); return devObj(id, true) + '.write(' + (b.getFieldValue('STATE') === '1' ? '90' : '0') + ');\n';
  };
  function pinConst(id) { return D[id] ? D[id].py[lg()].toUpperCase() + '_PIN' : String(id).toUpperCase() + '_PIN'; }
  function spin(id, part) { return S[id].k[lg()].toUpperCase() + (part ? '_' + part : '') + '_PIN'; }
  function T(k) { var t = root.I18N && root.I18N[lg()] && root.I18N[lg()][k]; return t != null ? t : (root.I18N && root.I18N.tr[k]) || k; }
  function NM(k) {
    var n = { reader: ['kartOkuyucu', 'cardReader'], known: ['kartKayitli', 'cardKnown'], read: ['kartOkundu', 'cardWasRead'], uid: ['KAYITLI_KART', 'KNOWN_CARD'],
      last: ['sonSaniye', 'lastSecond'], prev: ['onceki', 'prev'], now: ['simdi', 'now'], ss: ['KART_SS_PIN', 'CARD_SS_PIN'], rst: ['KART_RST_PIN', 'CARD_RST_PIN'],
      dur: ['sure', 'duration'], lo: ['enAz', 'lowest'], hi: ['enCok', 'highest'], st: ['baslangic', 'started'], flat: ['yatay', 'flat'], dry: ['KURU', 'DRY'], wet: ['ISLAK', 'WET'], task: ['gorev', 'task'] }[k];
    return n[lg() === 'en' ? 1 : 0];
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* Pin planı: önce sensörler, sonra cihazlar; kart ve I2C pinleri ayrılır */
  var BOARD = {
    uno: { name: 'Arduino Uno', dig: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'A0', 'A1', 'A2', 'A3'], ana: ['A0', 'A1', 'A2', 'A3'],
      spi: { SS: 10, RST: 9, SCK: 13, MOSI: 11, MISO: 12 }, i2c: { SDA: 'A4', SCL: 'A5' }, adc: 1023, servo: '<Servo.h>', baud: 9600 },
    esp32: { name: 'ESP32', dig: [25, 26, 27, 14, 13, 16, 17, 4, 32, 33, 21, 22, 18, 19, 23, 5], ana: [34, 35, 36, 39, 32, 33],
      spi: { SS: 5, RST: 27, SCK: 18, MOSI: 23, MISO: 19 }, i2c: { SDA: 21, SCL: 22 }, adc: 4095, servo: '<ESP32Servo.h>', baud: 115200 }
  };
  function pinLabel(board, p) { if (board === 'uno') return typeof p === 'number' ? 'D' + p : p; return 'GPIO' + p; }
  function used(ws) {
    var u = { sensors: {}, devices: {}, events: {}, hats: {}, divide: false };
    ws.getAllBlocks(false).forEach(function (b) {
      if (b.type === 'h_sensor' || b.type === 'h_digital') u.sensors[b.getFieldValue('SENS')] = 1;
      if (b.type === 'h_switch' || b.type === 'h_move') u.devices[b.getFieldValue('DEV')] = 1;
      if (b.type === 'h_show') u.devices.screen = 1;
      if (b.type === 'h_event') { var e = b.getFieldValue('EVT'); u.events[e] = 1; u.sensors[EV[e].s] = 1; }
      if (HAT_TYPES.indexOf(b.type) >= 0) u.hats[b.type] = 1;
      if ((b.type === 'math_arithmetic' && b.getFieldValue('OP') === 'DIVIDE') || b.type === 'math_round') u.divide = true;
    });
    return u;
  }
  function W2(tr, en) { return { tr: tr, en: en }; }
  function allocate(u, board) {
    var bd = BOARD[board], taken = {}, pins = {}, wiring = [], libs = [];
    function take(list) { for (var i = 0; i < list.length; i++) { var p = list[i]; if (!taken[p]) { taken[p] = 1; return p; } } return null; }
    if (u.sensors.card) Object.keys(bd.spi).forEach(function (k) { taken[bd.spi[k]] = 1; });
    if (u.sensors.tilt) { taken[bd.i2c.SDA] = 1; taken[bd.i2c.SCL] = 1; }
    var pl = function (p) { return pinLabel(board, p); };
    /* önce analog sensörler (analog pin sayısı az), sonra dijitaller */
    var sens = Object.keys(u.sensors).sort(function (a, b) { return (S[a].type === 'num' ? 0 : 1) - (S[b].type === 'num' ? 0 : 1); });
    sens.forEach(function (id) {
      var sd = S[id];
      if (id === 'card') { pins.card = bd.spi; wiring.push([sd.name, 'SDA(SS) ' + pl(bd.spi.SS) + ', SCK ' + pl(bd.spi.SCK) + ', MOSI ' + pl(bd.spi.MOSI) + ', MISO ' + pl(bd.spi.MISO) + ', RST ' + pl(bd.spi.RST) + ', 3.3V, GND']); libs.push('MFRC522'); return; }
      if (id === 'tilt') { pins.tilt = bd.i2c; wiring.push([sd.name, 'SDA ' + pl(bd.i2c.SDA) + ', SCL ' + pl(bd.i2c.SCL) + ', VCC, GND']); libs.push('Adafruit MPU6050'); return; }
      if (id === 'distance') { var tr = take(bd.dig), ec = take(bd.dig); pins.distance = { trig: tr, echo: ec };
        wiring.push([sd.name, 'Trig ' + pl(tr) + ', Echo ' + pl(ec) + (board === 'esp32' ? L(W2(' (gerilim bölücüyle: 1 kΩ + 2 kΩ)', ' (through a voltage divider: 1 kΩ + 2 kΩ)')) : '') + ', VCC 5V, GND']); return; }
      if (id === 'temp' || id === 'hum') { if (!pins.dht) { pins.dht = take(bd.dig); wiring.push([W2('DHT11 (sıcaklık ve nem)', 'DHT11 (temperature and humidity)'), 'DATA ' + pl(pins.dht) + ', VCC, GND']); libs.push('DHT sensor library'); } return; }
      if (sd.type === 'num') { var a = take(bd.ana); pins[id] = a; wiring.push([sd.name, (id === 'knob' ? L(W2('orta bacak ', 'middle leg ')) : 'AO ') + pl(a) + ', VCC, GND']); return; }
      var d = take(bd.dig); pins[id] = d;
      var pull = id === 'button' || id === 'door';
      wiring.push([sd.name, (pull ? '' : 'OUT ') + pl(d) + ', ' + (pull ? L(W2('diğer bacak GND (INPUT_PULLUP)', 'other leg to GND (INPUT_PULLUP)')) : 'VCC, GND')]);
    });
    Object.keys(u.devices).forEach(function (id) {
      if (id === 'screen') return;
      var dd = D[id], p = take(bd.dig); pins[id] = p;
      var how = dd.kind === 'open' ? W2('servo motor sinyal kablosu (turuncu)', 'servo signal wire (orange)')
        : dd.look === 'lamp' || dd.look === 'led' ? W2('LED + 220 Ω direnç', 'LED + 220 Ω resistor')
        : dd.look === 'alarm' || dd.look === 'buzzer' || dd.look === 'music' ? W2('aktif buzzer (+ bacağı)', 'active buzzer (+ leg)')
        : W2('röle modülü IN (motor, pompa ya da ısıtıcı röleden beslenir)', 'relay module IN (the motor, pump or heater is powered through the relay)');
      wiring.push([dd.name, pl(p) + ' → ' + L(how)]);
      var lib = board === 'uno' ? 'Servo' : 'ESP32Servo';
      if (dd.kind === 'open' && libs.indexOf(lib) < 0) libs.push(lib);
    });
    return { pins: pins, wiring: wiring, libs: libs };
  }
  function pinVal(p) { return typeof p === 'number' ? String(p) : p; }

  function sensorFn(id, board) {
    var n = camel(S[id].py[lg()]), bd = BOARD[board], ADC = String(bd.adc), en = lg() === 'en', P = spin(id);
    function cm(tr, e) { return '  // ' + (en ? e : tr) + '\n'; }
    switch (id) {
      case 'motion': case 'touch': return 'bool ' + n + '() {\n  return digitalRead(' + P + ') == HIGH;\n}\n';
      case 'button': return 'bool ' + n + '() {\n' + cm('INPUT_PULLUP: basılınca LOW okunur', 'INPUT_PULLUP: reads LOW when pressed') + '  return digitalRead(' + P + ') == LOW;\n}\n';
      case 'door': return 'bool ' + n + '() {\n' + cm('Mıknatıs uzaklaşınca (kapı açık) anahtar açılır, pin HIGH okunur', 'When the magnet moves away (door open) the switch opens and the pin reads HIGH') + '  return digitalRead(' + P + ') == HIGH;\n}\n';
      case 'obstacle': return 'bool ' + n + '() {\n' + cm('Bu sensör "aktif düşük": engel varken LOW verir', 'This sensor is "active low": it gives LOW when blocked') + '  return digitalRead(' + P + ') == LOW;\n}\n';
      case 'rain': return 'bool ' + n + '() {\n' + cm('DO çıkışı ıslakken LOW verir', 'The DO output gives LOW when wet') + '  return digitalRead(' + P + ') == LOW;\n}\n';
      case 'card': return 'bool ' + n + '() {\n  return ' + NM('known') + ';\n}\n';
      case 'distance': return 'int ' + n + '() {\n  digitalWrite(' + spin(id, 'TRIG') + ', LOW);\n  delayMicroseconds(2);\n  digitalWrite(' + spin(id, 'TRIG') + ', HIGH);\n  delayMicroseconds(10);\n  digitalWrite(' + spin(id, 'TRIG') + ', LOW);\n  long ' + NM('dur') + ' = pulseIn(' + spin(id, 'ECHO') + ', HIGH, 30000);\n' + cm("Ses 1 cm'yi gidip gelmek için yaklaşık 58 mikrosaniye harcar", 'Sound needs about 58 microseconds to travel 1 cm and back') + '  if (' + NM('dur') + ' == 0) return 400;\n  return ' + NM('dur') + ' / 58;\n}\n';
      case 'light': return 'int ' + n + '() {\n' + cm("Çoğu LDR modülünde karanlıkta değer büyür; bu yüzden 100'den çıkarıyoruz. Seninki tersse sadece map(...) kısmını bırak.", 'On most LDR modules the value grows in the dark, so we subtract from 100. If yours works the other way, keep only map(...).') + '  return 100 - map(analogRead(' + P + '), 0, ' + ADC + ', 0, 100);\n}\n';
      case 'soil': return 'int ' + n + '() {\n' + cm("Kalibrasyon: sensör havadayken ve sudayken Seri Monitör'de okunan değerleri yaz", 'Calibration: write the values read in air and in water') + '  const int ' + NM('dry') + ' = ' + (board === 'uno' ? 600 : 2600) + ', ' + NM('wet') + ' = ' + (board === 'uno' ? 280 : 1100) + ';\n  return constrain(map(analogRead(' + P + '), ' + NM('dry') + ', ' + NM('wet') + ', 0, 100), 0, 100);\n}\n';
      case 'sound': return 'int ' + n + '() {\n' + cm('50 ms boyunca en yüksek ve en düşük değeri bulup farkı ses seviyesi olarak kullanırız', 'Over 50 ms we find the highest and lowest value and use the difference as the sound level') +
        '  int ' + NM('lo') + ' = ' + ADC + ', ' + NM('hi') + ' = 0;\n  unsigned long ' + NM('st') + ' = millis();\n  while (millis() - ' + NM('st') + ' < 50) {\n    int v = analogRead(' + P + ');\n    if (v < ' + NM('lo') + ') ' + NM('lo') + ' = v;\n    if (v > ' + NM('hi') + ') ' + NM('hi') + ' = v;\n  }\n  return constrain(map(' + NM('hi') + ' - ' + NM('lo') + ', 0, ' + (board === 'uno' ? 400 : 1600) + ', 0, 100), 0, 100);\n}\n';
      case 'knob': return 'int ' + n + '() {\n  return map(analogRead(' + P + '), 0, ' + ADC + ', 0, 100);\n}\n';
      case 'gas': return 'int ' + n + '() {\n' + cm('MQ-2 ilk açılışta 1-2 dakika ısınmalı; değerler sonra oturur', 'The MQ-2 needs 1-2 minutes to warm up; the values settle after that') + '  return map(analogRead(' + P + '), 0, ' + ADC + ', 0, 100);\n}\n';
      case 'temp': return 'int ' + n + '() {\n  float t = dht.readTemperature();\n  if (isnan(t)) return 0;\n  return (int) t;\n}\n';
      case 'hum': return 'int ' + n + '() {\n  float h = dht.readHumidity();\n  if (isnan(h)) return 0;\n  return (int) h;\n}\n';
      case 'tilt': return 'int ' + n + '() {\n  sensors_event_t a, g, temp;\n  mpu.getEvent(&a, &g, &temp);\n' + cm('Yerçekiminin z ekseniyle yaptığı açı = eğim', 'The angle between gravity and the z axis = tilt') +
        '  float ' + NM('flat') + ' = sqrt(a.acceleration.x * a.acceleration.x + a.acceleration.y * a.acceleration.y);\n  return (int) (atan2(' + NM('flat') + ', a.acceleration.z) * 180.0 / PI);\n}\n';
    }
    return '';
  }

  HB.toIno = function (ws, st, board) {
    board = board === 'esp32' ? 'esp32' : 'uno';
    var bd = BOARD[board], u = used(ws), al = allocate(u, board), en = lg() === 'en';
    INO.init(ws); INO.__hatN = 0; INO.__tasks = [];
    var parts = [];
    topsSorted(ws).forEach(function (b) {
      if (HAT_TYPES.indexOf(b.type) < 0) return;
      var c = INO.blockToCode(b); if (Array.isArray(c)) return; if (c) parts.push(c);
    });
    var userCode = parts.join('\n');
    var out = [], P = al.pins;
    function line(s) { out.push(s); }
    line('// afi kod - Arduino (' + bd.name + ')');
    line('// ' + (en ? 'Step' : 'Adım') + ': ' + st.id);
    line('//');
    line('// ' + T('ino_wiring'));
    al.wiring.forEach(function (w) { line('//   ' + L(w[0]) + ': ' + w[1]); });
    if (u.devices.screen) line('//   ' + T('ino_serial') + ' - ' + bd.baud + ' baud');
    if (al.libs.length) { line('//'); line('// ' + T('ino_libs') + ' ' + al.libs.join(', ')); }
    line('// ' + T('ino_upload'));
    line('');
    if (u.sensors.card) { line('#include <SPI.h>'); line('#include <MFRC522.h>'); }
    if (u.sensors.tilt) { line('#include <Wire.h>'); line('#include <Adafruit_MPU6050.h>'); line('#include <Adafruit_Sensor.h>'); }
    if (P.dht) line('#include <DHT.h>');
    var opens = Object.keys(u.devices).filter(function (id) { return D[id] && D[id].kind === 'open'; });
    if (opens.length) line('#include ' + bd.servo);
    if (out[out.length - 1] !== '') line('');
    Object.keys(P).forEach(function (id) {
      var p = P[id];
      if (id === 'card') { line('const int ' + NM('ss') + ' = ' + pinVal(p.SS) + ';'); line('const int ' + NM('rst') + ' = ' + pinVal(p.RST) + ';'); return; }
      if (id === 'tilt') return;
      if (id === 'distance') { line('const int ' + spin(id, 'TRIG') + ' = ' + pinVal(p.trig) + ';'); line('const int ' + spin(id, 'ECHO') + ' = ' + pinVal(p.echo) + ';'); return; }
      if (id === 'dht') { line('const int DHT_PIN = ' + pinVal(p) + ';'); return; }
      line('const int ' + (S[id] ? spin(id) : pinConst(id)) + ' = ' + pinVal(p) + ';');
    });
    line('');
    if (u.sensors.card) {
      line('MFRC522 ' + NM('reader') + '(' + NM('ss') + ', ' + NM('rst') + ');');
      line('// ' + T('ino_cardUid'));
      line('byte ' + NM('uid') + '[4] = {0xDE, 0xAD, 0xBE, 0xEF};');
      line('bool ' + NM('known') + ' = false;');
    }
    if (u.sensors.tilt) line('Adafruit_MPU6050 mpu;');
    if (P.dht) line('DHT dht(DHT_PIN, DHT11);');
    opens.forEach(function (id) { line('Servo ' + devObj(id, true) + ';'); });
    var vars = ws.getAllVariables ? ws.getAllVariables() : ws.getVariableMap().getAllVariables();
    if (vars.length) { line(''); vars.forEach(function (v) { line((u.divide ? 'float ' : 'long ') + INO.getVariableName(v.getId()) + ' = 0;'); }); }
    var evs = Object.keys(u.events), prevNames = {}, nowNames = {};
    evs.forEach(function (e) {
      if (e === 'card') return;
      var s = EV[e].s; if (prevNames[s]) return;
      prevNames[s] = NM('prev') + cap(S[s].k[lg()]); nowNames[s] = NM('now') + cap(S[s].k[lg()]);
      line((S[s].type === 'num' ? 'int ' : 'bool ') + prevNames[s] + ' = ' + (S[s].type === 'num' ? '0' : 'false') + ';');
    });
    if (u.hats.h_every) line('unsigned long ' + NM('last') + ' = 0;');
    line('');
    Object.keys(u.sensors).forEach(function (id) { var f = sensorFn(id, board); if (f) line(f); });
    if (u.sensors.card) {
      var R = NM('reader');
      line('bool ' + NM('read') + '() {');
      line('  if (!' + R + '.PICC_IsNewCardPresent() || !' + R + '.PICC_ReadCardSerial()) return false;');
      line('  ' + NM('known') + ' = true;');
      line('  Serial.print("UID:");');
      line('  for (byte i = 0; i < 4; i++) {');
      line('    Serial.print(" 0x");');
      line('    Serial.print(' + R + '.uid.uidByte[i], HEX);');
      line('    if (' + R + '.uid.uidByte[i] != ' + NM('uid') + '[i]) ' + NM('known') + ' = false;');
      line('  }');
      line('  Serial.println();');
      line('  ' + R + '.PICC_HaltA();');
      line('  return true;');
      line('}');
      line('');
    }
    var protos = [];
    ws.getTopBlocks(false).forEach(function (b) { if (b.type === 'h_fn_def') protos.push('void ' + fnName(b.getFieldValue('FN'), true) + '();'); });
    INO.__tasks.forEach(function (tk) { protos.push('void ' + tk.name + '();'); });
    if (protos.length) { protos.forEach(line); line(''); }
    if (userCode) { line(userCode.replace(/\n+$/, '')); line(''); }
    line('void setup() {');
    line('  Serial.begin(' + bd.baud + ');');
    Object.keys(P).forEach(function (id) {
      if (id === 'card' || id === 'tilt' || id === 'dht') return;
      if (id === 'distance') { line('  pinMode(' + spin(id, 'TRIG') + ', OUTPUT);'); line('  pinMode(' + spin(id, 'ECHO') + ', INPUT);'); return; }
      if (S[id]) { if (S[id].type !== 'num') line('  pinMode(' + spin(id) + ', ' + (id === 'button' || id === 'door' ? 'INPUT_PULLUP' : 'INPUT') + ');'); return; }
      if (D[id].kind === 'open') { line('  ' + devObj(id, true) + '.attach(' + pinConst(id) + ');'); line('  ' + devObj(id, true) + '.write(' + (id === 'valve' ? 90 : 0) + ');' + (id === 'valve' ? '  // ' + L(W2('vana açık başlar', 'the valve starts open')) : '')); return; }
      line('  pinMode(' + pinConst(id) + ', OUTPUT);');
      line('  digitalWrite(' + pinConst(id) + ', LOW);');
    });
    if (P.dht) line('  dht.begin();');
    if (u.sensors.tilt) line('  if (!mpu.begin()) Serial.println("MPU6050?");');
    if (u.sensors.card) { line('  SPI.begin();'); line('  ' + NM('reader') + '.PCD_Init();'); }
    Object.keys(prevNames).forEach(function (s) { line('  ' + prevNames[s] + ' = ' + camel(S[s].py[lg()]) + '();'); });
    INO.__tasks.filter(function (tk) { return tk.type === 'h_start'; }).forEach(function (tk) { line('  ' + tk.name + '();'); });
    line('}');
    line('');
    line('void loop() {');
    var bySensor = {};
    INO.__tasks.filter(function (tk) { return tk.type === 'h_event'; }).forEach(function (tk) { var s = EV[tk.ev].s; (bySensor[s] = bySensor[s] || []).push(tk); });
    Object.keys(bySensor).forEach(function (s) {
      if (s === 'card') {
        line('  if (' + NM('read') + '()) {');
        bySensor[s].forEach(function (tk) { line('    ' + tk.name + '();'); });
        line('  }');
        return;
      }
      var v = nowNames[s], pv = prevNames[s];
      line('  ' + (S[s].type === 'num' ? 'int ' : 'bool ') + v + ' = ' + camel(S[s].py[lg()]) + '();');
      bySensor[s].forEach(function (tk) {
        var e = EV[tk.ev], cond = e.edge === 'rise' ? v + ' && !' + pv : e.edge === 'fall' ? '!' + v + ' && ' + pv : v + ' >= ' + e.th + ' && ' + pv + ' < ' + e.th;
        line('  if (' + cond + ') ' + tk.name + '();');
      });
      line('  ' + pv + ' = ' + v + ';');
    });
    var every = INO.__tasks.filter(function (tk) { return tk.type === 'h_every'; });
    if (every.length) {
      line('  if (millis() - ' + NM('last') + ' >= 1000) {');
      line('    ' + NM('last') + ' = millis();');
      every.forEach(function (tk) { line('    ' + tk.name + '();'); });
      line('  }');
    }
    var forever = INO.__tasks.filter(function (tk) { return tk.type === 'h_forever'; });
    forever.forEach(function (tk) { line('  ' + tk.name + '();'); });
    if (!forever.length) line('  delay(20);');
    line('}');
    return out.join('\n') + '\n';
  };
  HB.boardInfo = BOARD;

  /* =====================================================================
   *  İndirilebilir Python dosyası: küçük bir benzetim kütüphanesi + öğrencinin programı
   * ===================================================================== */
  function pyLit(v) {
    if (Array.isArray(v)) return '[' + v.map(pyLit).join(', ') + ']';
    if (v && typeof v === 'object') return '{' + Object.keys(v).map(function (k) { return JSON.stringify(k) + ': ' + pyLit(v[k]); }).join(', ') + '}';
    if (typeof v === 'boolean') return v ? 'True' : 'False';
    if (v == null) return 'None';
    return JSON.stringify(v);
  }
  HB.toPyFile = function (ws, st) {
    var en = lg() === 'en', prog = HB.toPython(ws).replace(/^from afi_(ev|home) import \*\n+/, '');
    var scen = st.scen.map(function (sc) { var n = H.normalize(sc); return { dur: n.dur, sig: n.sig, init: n.init }; });
    var dev = {}, sen = {}, evs = {};
    Object.keys(D).forEach(function (k) { dev[k] = { kind: D[k].kind, name: L(D[k].name), py: [D[k].py.tr, D[k].py.en] }; });
    Object.keys(S).forEach(function (k) { sen[k] = { type: S[k].type, name: L(S[k].name), unit: S[k].unit || '', val: S[k].val ? L(S[k].val) : null, py: [S[k].py.tr, S[k].py.en] }; });
    Object.keys(EV).forEach(function (k) { evs[k] = { s: EV[k].s, edge: EV[k].edge, th: EV[k].th || 0, label: L(EV[k].label), py: [EV[k].py.tr, EV[k].py.en] }; });
    var M = { on: L(W2('AÇIK', 'ON')), off: L(W2('KAPALI', 'OFF')), open: L(W2('AÇIK', 'OPEN')), closed: L(W2('KAPALI', 'CLOSED')) };
    var HEAD = en ? [
      '# afi code  -  ' + st.id,
      '#',
      '# Run this file on your computer with Python 3:',
      '#   1) Open Command Prompt (CMD) or PowerShell. No admin rights needed.',
      '#   2) Type:  python --version   (it should say 3.8 or newer; on some computers the command is "py")',
      '#   3) Go to the folder with this file, e.g.:  cd Downloads',
      '#   4) Run it:  python ' + st.id + '.py',
      '# No extra libraries are needed.',
      '#',
      "# The top part is a tiny library that imitates afi's house (sensors, devices, clock).",
      '# Your program is at the bottom. Try changing it and running the file again!'
    ] : [
      '# afi kod  -  ' + st.id,
      '#',
      '# Bu dosyayı bilgisayarında Python 3 ile çalıştır:',
      '#   1) Komut İstemi\'ni (CMD) ya da PowerShell\'i aç. Yönetici izni gerekmez.',
      '#   2) Yaz:  python --version   (3.8 ya da üstü olmalı; bazı bilgisayarlarda komut "py" dir)',
      '#   3) Dosyanın olduğu klasöre geç, örneğin:  cd Downloads',
      '#   4) Çalıştır:  python ' + st.id + '.py',
      '# Ek kütüphane gerekmez.',
      '#',
      "# Üst kısım afi'nin evini taklit eden küçük bir kütüphanedir (sensörler, cihazlar, saat).",
      '# Senin programın en alttadır. Değiştirip dosyayı yeniden çalıştırmayı dene!'
    ];
    var SPEED = en ? 'SPEED = 0.4     # real seconds per simulated second (0 = no waiting)\nSCENARIO = 1    # which scenario to show'
                   : 'HIZ = 0.4       # bir benzetim saniyesi kaç gerçek saniye sürsün (0 = beklemeden)\nSENARYO = 1     # ekranda gösterilecek senaryo';
    var R = PY_RUNTIME
      .replace('@@HEAD@@', HEAD.join('\n'))
      .replace('@@SPEED@@', SPEED)
      .replace('@@SCEN@@', pyLit(scen))
      .replace('@@EXP@@', pyLit(st.exp))
      .replace('@@DEVS@@', pyLit(st.devices))
      .replace('@@DEV@@', pyLit(dev)).replace('@@SEN@@', pyLit(sen)).replace('@@EVS@@', pyLit(evs))
      .replace('@@WORDS@@', pyLit(M))
      .replace('@@MSG@@', pyLit(en ? PY_MSG.en : PY_MSG.tr))
      .replace('@@SENSORS@@', pyLit(st.sensors));
    return R + '\n# ' + '='.repeat(60) + '\n# ' + (en ? 'YOUR PROGRAM (made with blocks in afi code)' : 'SENİN PROGRAMIN (afi kod\'da bloklarla yaptın)') + '\n# ' + '='.repeat(60) + '\n\n' + prog + '\n';
  };
  var PY_MSG = {
    tr: { title: 'afi kod - akıllı ev benzetimi', scen: 'Senaryo', sec: 'sn', event: 'olay', test: 'Test', ok: 'Tebrikler! Programın her saniye doğru çalıştı.',
      fail: '{t}. saniyede {dev} {want} olmalıydı ama {got}.', loop: 'Program bitmiyor gibi görünüyor (sonsuz döngü?).', err: 'Programda bir hata var:',
      sum: '{n} saniyenin {k} tanesi doğru.', all: 'Tüm senaryolar', how: 'Hızı değiştirmek için dosyanın başındaki HIZ sayısını değiştir (0 = beklemeden).' },
    en: { title: 'afi code - smart home simulation', scen: 'Scenario', sec: 's', event: 'event', test: 'Test', ok: 'Well done! Your program was right every second.',
      fail: 'At second {t}, {dev} should have been {want} but it was {got}.', loop: 'The program never seems to finish (endless loop?).', err: 'There is an error in the program:',
      sum: '{k} of {n} seconds are right.', all: 'All scenarios', how: 'Change the SPEED number at the top of the file to change the speed (0 = no waiting).' }
  };
  var PY_RUNTIME = [
    '# -*- coding: utf-8 -*-',
    '@@HEAD@@',
    '',
    'import time',
    '',
    '@@SPEED@@',
    '',
    '_SCEN = @@SCEN@@',
    '_EXP = @@EXP@@',
    '_CHECK = @@DEVS@@',
    '_SENSORS = @@SENSORS@@',
    '_DEV = @@DEV@@',
    '_SEN = @@SEN@@',
    '_EVS = @@EVS@@',
    '_W = @@WORDS@@',
    '_M = @@MSG@@',
    '',
    'import math as _math',
    '',
    'def round(x, n=None):',
    '    # Bu dosyada round() 0,5\'i her zaman yukarı yuvarlar (JavaScript\'teki Math.round gibi).',
    '    # Here round() always rounds 0.5 up (like Math.round in JavaScript).',
    '    if n is None:',
    '        return int(_math.floor(x + 0.5))',
    '    k = 10 ** n',
    '    return _math.floor(x * k + 0.5) / k',
    '',
    'class _Ev:',
    '    saat = 0.0',
    '    sira = 0',
    '    adim = 0',
    '    senaryo = None',
    '    kayit = []',
    '    gorevler = {"start": [], "every": [], "forever": [], "ev": []}',
    '',
    'class _Dongu(Exception):',
    '    pass',
    '',
    'def _say():',
    '    _Ev.adim += 1',
    '    if _Ev.adim > 4000:',
    '        raise _Dongu()',
    '',
    'def _deger(s):',
    '    a = _Ev.senaryo["sig"].get(s)',
    '    if not a:',
    '        return 0',
    '    i = max(0, min(len(a) - 1, int(_Ev.saat + 1e-9)))',
    '    return a[i]',
    '',
    'def bekle(sn):',
    '    _say()',
    '    try:',
    '        sn = float(sn)',
    '    except (TypeError, ValueError):',
    '        sn = 0',
    '    if sn > 0:',
    '        _Ev.saat += sn',
    'wait = bekle',
    '',
    'class _Cihaz:',
    '    def __init__(self, kimlik):',
    '        self.kimlik = kimlik',
    '    def _yaz(self, v):',
    '        _say()',
    '        _Ev.kayit.append((_Ev.saat, _Ev.sira, self.kimlik, v))',
    '        _Ev.sira += 1',
    '    def ac(self):',
    '        self._yaz(1)',
    '    def kapat(self):',
    '        self._yaz(0)',
    '    on = open = ac',
    '    off = close = kapat',
    '    def yaz(self, x):',
    '        self._yaz(x)',
    '    show = yaz',
    '',
    'for _k, _d in _DEV.items():',
    '    for _ad in _d["py"]:',
    '        globals()[_ad] = _Cihaz(_k)',
    '',
    'def _okuyucu(kimlik, tur):',
    '    def oku():',
    '        _say()',
    '        v = _deger(kimlik)',
    '        if tur == "card":',
    '            return v == 1',
    '        if tur == "dig":',
    '            return bool(v)',
    '        return v',
    '    return oku',
    '',
    'for _k, _s in _SEN.items():',
    '    for _ad in _s["py"]:',
    '        globals()[_ad] = _okuyucu(_k, _s["type"])',
    '',
    'def _kaydedici(tur, olay=None):',
    '    def deco(f):',
    '        _Ev.gorevler[tur].append((olay, f))',
    '        return f',
    '    return deco',
    '',
    'baslangicta = when_started = _kaydedici("start")',
    'her_saniye = every_second = _kaydedici("every")',
    'surekli_tekrarla = forever = _kaydedici("forever")',
    'for _k, _e in _EVS.items():',
    '    for _ad in _e["py"]:',
    '        globals()[_ad] = _kaydedici("ev", _k)',
    '',
    'def _oldu_mu(sc, olay, t):',
    '    e = _EVS[olay]',
    '    a = sc["sig"].get(e["s"])',
    '    if not a or t < 1 or t >= len(a):',
    '        return False',
    '    p, c = a[t - 1], a[t]',
    '    if e["edge"] == "rise":',
    '        return (not p) and bool(c)',
    '    if e["edge"] == "fall":',
    '        return bool(p) and not c',
    '    return p < e["th"] <= c',
    '',
    'def _calistir_gorev(f, t):',
    '    _Ev.saat = float(t)',
    '    _Ev.adim = 0',
    '    f()',
    '',
    'def _benzet(sc):',
    '    _Ev.senaryo = sc',
    '    _Ev.kayit = []',
    '    _Ev.sira = 0',
    '    for _, f in _Ev.gorevler["start"]:',
    '        _calistir_gorev(f, 0)',
    '    sonraki = [0.0 for _ in _Ev.gorevler["every"]]',
    '    surekli = [0.0 for _ in _Ev.gorevler["forever"]]',
    '    for t in range(sc["dur"]):',
    '        for olay, f in _Ev.gorevler["ev"]:',
    '            if _oldu_mu(sc, olay, t):',
    '                _calistir_gorev(f, t)',
    '        for i, (_, f) in enumerate(_Ev.gorevler["every"]):',
    '            while sonraki[i] <= t + 1e-9 and sonraki[i] < sc["dur"]:',
    '                _calistir_gorev(f, sonraki[i])',
    '                sonraki[i] = _Ev.saat + 1',
    '        for i, (_, f) in enumerate(_Ev.gorevler["forever"]):',
    '            while surekli[i] <= t + 1e-9 and surekli[i] < sc["dur"]:',
    '                bas = surekli[i]',
    '                _calistir_gorev(f, bas)',
    '                surekli[i] = _Ev.saat if _Ev.saat > bas + 1e-9 else bas + 1',
    '    _Ev.kayit.sort(key=lambda x: (x[0], x[1]))',
    '    return list(_Ev.kayit)',
    '',
    'def _durum(kayit, sc, cihaz, an):',
    '    v = sc["init"].get(cihaz, "" if cihaz == "screen" else 0)',
    '    for (t, _, c, d) in kayit:',
    '        if t > an + 1e-9:',
    '            break',
    '        if c == cihaz:',
    '            v = d',
    '    if isinstance(v, bool):',
    '        v = 1 if v else 0',
    '    return v',
    '',
    'def _ayni(a, b):',
    '    try:',
    '        return abs(float(a) - float(b)) < 1e-3',
    '    except (TypeError, ValueError):',
    '        return str(a) == str(b)',
    '',
    'def _kelime(cihaz, v):',
    '    d = _DEV[cihaz]',
    '    if d["kind"] == "screen":',
    '        return str(v)',
    '    if d["kind"] == "open":',
    '        return _W["open"] if v else _W["closed"]',
    '    return _W["on"] if v else _W["off"]',
    '',
    'def _beklenen(e, k):',
    '    return int(e[k]) if isinstance(e, str) else e[k]',
    '',
    'def _test(si, kayit):',
    '    sc = _SCEN[si]',
    '    hata = None',
    '    dogru = 0',
    '    for k in range(sc["dur"]):',
    '        tamam = True',
    '        for c in _CHECK:',
    '            want = _beklenen(_EXP[si][c], k)',
    '            got = _durum(kayit, sc, c, k + 0.5)',
    '            if not _ayni(want, got):',
    '                tamam = False',
    '                if hata is None:',
    '                    hata = _M["fail"].format(t=k, dev=_DEV[c]["name"], want=_kelime(c, want), got=_kelime(c, got))',
    '        if tamam:',
    '            dogru += 1',
    '    return dogru, sc["dur"], hata',
    '',
    'def _goster(si, kayit):',
    '    sc = _SCEN[si]',
    '    print("=" * 60)',
    '    print(_M["title"] + "  |  " + _M["scen"] + " " + str(si + 1) + "/" + str(len(_SCEN)))',
    '    print("=" * 60)',
    '    onceki = {}',
    '    for k in range(sc["dur"]):',
    '        satir = []',
    '        for s in _SENSORS:',
    '            a = sc["sig"].get(s)',
    '            if not a:',
    '                continue',
    '            v = a[k]',
    '            if onceki.get(s) != v:',
    '                bilgi = _SEN[s]',
    '                metin = bilgi["val"][int(v)] if bilgi["val"] else str(v) + " " + bilgi["unit"]',
    '                satir.append(bilgi["name"] + ": " + metin.strip())',
    '                onceki[s] = v',
    '        for olay in _EVS:',
    '            if any(o == olay for o, _ in _Ev.gorevler["ev"]) and _oldu_mu(sc, olay, k):',
    '                satir.append("-> " + _M["event"] + ": " + _EVS[olay]["label"])',
    '        for c in _CHECK:',
    '            v = _durum(kayit, sc, c, k + 0.5)',
    '            if onceki.get("d:" + c) != v:',
    '                satir.append(_DEV[c]["name"] + ": " + _kelime(c, v))',
    '                onceki["d:" + c] = v',
    '        bas = "[" + str(k).rjust(3) + " " + _M["sec"] + "] "',
    '        print(bas + ("\\n" + " " * len(bas)).join(satir) if satir else bas + ".")',
    '        h = globals().get("HIZ", globals().get("SPEED", 0))',
    '        if h:',
    '            time.sleep(h)',
    '',
    'def calistir():',
    '    sonuc = []',
    '    # programın değişkenlerinin ilk değerleri: her senaryo bunlarla başlar',
    '    ilk = {k: v for k, v in globals().items() if k not in _ONCE and not k.startswith("_") and isinstance(v, (int, float, str, bool))}',
    '    for si, sc in enumerate(_SCEN):',
    '        globals().update(ilk)',
    '        try:',
    '            kayit = _benzet(sc)',
    '        except _Dongu:',
    '            print(_M["loop"])',
    '            return',
    '        except Exception as e:',
    '            print(_M["err"], e)',
    '            raise',
    '        if si == globals().get("SENARYO", globals().get("SCENARIO", 1)) - 1:',
    '            _goster(si, kayit)',
    '        sonuc.append(_test(si, kayit))',
    '    print("-" * 60)',
    '    for si, (dogru, n, hata) in enumerate(sonuc):',
    '        print(_M["test"] + " " + str(si + 1) + ": " + _M["sum"].format(n=n, k=dogru) + ("  " + hata if hata else "  OK"))',
    '    if all(h is None for _, _, h in sonuc):',
    '        print(_M["ok"])',
    '    print(_M["how"])',
    '',
    'run = calistir',
    '_ONCE = set(globals().keys())',
    ''
  ].join('\n');

  root.HomeBlocks = HB;
})(typeof window !== 'undefined' ? window : this);
