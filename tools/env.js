/* Node ortamında afi kod dosyalarını yükler (üretici araç ve testler için).
 * Gereken: npm i blockly@11.2.2  (NODE_PATH ya da AFI_NM ile node_modules yolu verilebilir) */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT0 = path.join(__dirname, '..');
const NM = process.env.AFI_NM || (fs.existsSync(path.join(ROOT0, 'node_modules')) ? path.join(ROOT0, 'node_modules') + path.sep : '/tmp/claude-0/-home-claude/2ac9c4fe-a486-5b50-8886-88bb7d6f2b79/scratchpad/node_modules/');
const ROOT = path.join(__dirname, '..');
function load(files) {
  const Blockly = require(NM + 'blockly'), javascript = require(NM + 'blockly/javascript'), python = require(NM + 'blockly/python');
  const ctx = { Blockly, javascript, python, console, BLOCKLY_MSG: { en: Object.assign({}, require(NM + 'blockly/msg/en')), tr: Object.assign({}, require(NM + 'blockly/msg/tr')) } };
  ctx.window = ctx; vm.createContext(ctx);
  (files || ['engine.js', 'i18n.js', 'i18n-home.js', 'blocks.js', 'home.js', 'home-blocks.js']).forEach(f =>
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), ctx, { filename: f }));
  return ctx;
}
module.exports = { load, ROOT, NM };
