/* afi kod - blok tanımları ve kod üreteçleri (Blockly üzerine) */
(function (root) {
  'use strict';
  var B = root.Blockly, JS = root.javascript.javascriptGenerator, PY = root.python.pythonGenerator;
  PY.INDENT = '    '; /* Python'da standart girinti 4 boşluktur */

  var COL = { move: '#3B82F6', turn: '#7C5CE0', light: '#E89B12', door: '#B9773B', loop: '#22A06B', cond: '#E0566B' };
  var CONDS = [['%{BKY_ROBOT_C_ON}', 'ON'], ['%{BKY_ROBOT_C_SOL}', 'SOL'], ['%{BKY_ROBOT_C_SAG}', 'SAG'],
               ['%{BKY_ROBOT_C_ISIK}', 'ISIK'], ['%{BKY_ROBOT_C_KAPI}', 'KAPI']];
  var stmt = { previousStatement: null, nextStatement: null };
  function def(o) { return Object.assign({}, stmt, o); }

  B.defineBlocksWithJsonArray([
    def({ type: 'robot_ileri', message0: '%{BKY_ROBOT_FWD}', colour: COL.move, tooltip: '%{BKY_ROBOT_FWD_TIP}' }),
    def({ type: 'robot_sola', message0: '%{BKY_ROBOT_LEFT}', colour: COL.turn, tooltip: '%{BKY_ROBOT_LEFT_TIP}' }),
    def({ type: 'robot_saga', message0: '%{BKY_ROBOT_RIGHT}', colour: COL.turn, tooltip: '%{BKY_ROBOT_RIGHT_TIP}' }),
    def({ type: 'robot_isik', message0: '%{BKY_ROBOT_LIGHT}', colour: COL.light, tooltip: '%{BKY_ROBOT_LIGHT_TIP}' }),
    def({ type: 'robot_kapi', message0: '%{BKY_ROBOT_DOOR}', colour: COL.door, tooltip: '%{BKY_ROBOT_DOOR_TIP}' }),
    def({ type: 'robot_until', message0: '%{BKY_ROBOT_UNTIL}', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
          colour: COL.loop, tooltip: '%{BKY_ROBOT_UNTIL_TIP}' }),
    def({ type: 'robot_until_all', message0: '%{BKY_ROBOT_UNTIL_ALL}', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
          colour: COL.loop, tooltip: '%{BKY_ROBOT_UNTIL_ALL_TIP}' }),
    def({ type: 'robot_if', message0: '%{BKY_ROBOT_IF}', args0: [{ type: 'field_dropdown', name: 'COND', options: CONDS }],
          message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], colour: COL.cond, tooltip: '%{BKY_ROBOT_IF_TIP}' }),
    def({ type: 'robot_ifelse', message0: '%{BKY_ROBOT_IF}', args0: [{ type: 'field_dropdown', name: 'COND', options: CONDS }],
          message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
          message2: '%{BKY_ROBOT_ELSE}', args2: [{ type: 'input_statement', name: 'ELSE' }], colour: COL.cond, tooltip: '%{BKY_ROBOT_IFELSE_TIP}' })
  ]);

  var api = { lang: 'tr' };
  function N() { return root.Engine.NAMES[api.lang]; }
  function body(g, b, n) { return g.statementToCode(b, n); }
  function pyBody(g, b, n) { return body(g, b, n) || g.INDENT + 'pass\n'; }

  JS.forBlock.robot_ileri = function () { return N().js.fwd + '();\n'; };
  JS.forBlock.robot_sola = function () { return N().js.left + '();\n'; };
  JS.forBlock.robot_saga = function () { return N().js.right + '();\n'; };
  JS.forBlock.robot_isik = function () { return N().js.light + '();\n'; };
  JS.forBlock.robot_kapi = function () { return N().js.door + '();\n'; };
  JS.forBlock.robot_until = function (b, g) { return 'while (!' + N().js.ISIK + '()) {\n' + body(g, b, 'DO') + '}\n'; };
  JS.forBlock.robot_until_all = function (b, g) { return 'while (!' + N().js.ALL + '()) {\n' + body(g, b, 'DO') + '}\n'; };
  JS.forBlock.robot_if = function (b, g) { return 'if (' + N().js[b.getFieldValue('COND')] + '()) {\n' + body(g, b, 'DO') + '}\n'; };
  JS.forBlock.robot_ifelse = function (b, g) { return 'if (' + N().js[b.getFieldValue('COND')] + '()) {\n' + body(g, b, 'DO') + '} else {\n' + body(g, b, 'ELSE') + '}\n'; };

  PY.forBlock.robot_ileri = function () { return N().py.fwd + '()\n'; };
  PY.forBlock.robot_sola = function () { return N().py.left + '()\n'; };
  PY.forBlock.robot_saga = function () { return N().py.right + '()\n'; };
  PY.forBlock.robot_isik = function () { return N().py.light + '()\n'; };
  PY.forBlock.robot_kapi = function () { return N().py.door + '()\n'; };
  PY.forBlock.robot_until = function (b, g) { return 'while not ' + N().py.ISIK + '():\n' + pyBody(g, b, 'DO'); };
  PY.forBlock.robot_until_all = function (b, g) { return 'while not ' + N().py.ALL + '():\n' + pyBody(g, b, 'DO'); };
  PY.forBlock.robot_if = function (b, g) { return 'if ' + N().py[b.getFieldValue('COND')] + '():\n' + pyBody(g, b, 'DO'); };
  PY.forBlock.robot_ifelse = function (b, g) { return 'if ' + N().py[b.getFieldValue('COND')] + '():\n' + pyBody(g, b, 'DO') + 'else:\n' + pyBody(g, b, 'ELSE'); };

  /* Dil değiştir: Blockly'nin kendi mesajları + bizim blok yazılarımız */
  api.setLang = function (lang) {
    api.lang = lang;
    var base = (root.BLOCKLY_MSG && root.BLOCKLY_MSG[lang]) || {};
    Object.assign(B.Msg, base, root.I18N[lang].blocks);
    if (root.HomeBlocks) root.HomeBlocks.lang = lang;
    root.KINDS_LANG = lang;
  };
  /* Çalıştırma kodu: her komuttan önce hangi bloğun çalıştığını bildirir */
  api.runCode = function (ws) {
    JS.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    try { return JS.workspaceToCode(ws); } finally { JS.STATEMENT_PREFIX = null; }
  };
  api.toPython = function (ws) { return PY.workspaceToCode(ws); };
  api.toJS = function (ws) { return JS.workspaceToCode(ws); };
  api.COL = COL;
  root.RobotBlocks = api;
})(typeof window !== 'undefined' ? window : this);
