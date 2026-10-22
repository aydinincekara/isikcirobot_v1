/* afi kod - arayüz */
(function () {
  'use strict';
  var B = window.Blockly, E = window.Engine, RB = window.RobotBlocks, C = window.COURSE, T = window.I18N;
  var $ = function (id) { return document.getElementById(id); };
  var PREFIX = 'isikci2:';
  /* Tarayıcı depolaması yoksa (bazı gizli pencereler) bu oturum için bellekte tutar */
  var mem = {};
  var hasLS = (function () { try { localStorage.setItem(PREFIX + 't', '1'); localStorage.removeItem(PREFIX + 't'); return true; } catch (e) { return false; } })();
  var store = {
    get: function (k, d) {
      try { var v = (hasLS ? localStorage.getItem(PREFIX + k) : null) || mem[k]; return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) {
      var s = JSON.stringify(v);
      if (hasLS) { try { localStorage.setItem(PREFIX + k, s); return; } catch (e) {} }
      mem[k] = s; },
    del: function (k) { if (hasLS) { try { localStorage.removeItem(PREFIX + k); } catch (e) {} } delete mem[k]; }
  };

  /* ---------- Ders yapısı: tüm adımlar tek sırada ---------- */
  var STEPS = [];
  C.chapters.forEach(function (ch, ci) {
    ch.lessons.forEach(function (ls, li) {
      ls.steps.forEach(function (st, si) { STEPS.push({ ch: ch, ci: ci, ls: ls, li: li, si: si, st: st, gi: STEPS.length }); });
    });
  });

  var PRESETS = {
    default: { left: 340, right: 390, code: 'py', scale: 0.9, ui: 15 },
    wide: { left: 290, right: 290, code: 'blocks', scale: 1, ui: 15 },
    compare: { left: 300, right: 600, code: 'both', scale: 0.85, ui: 15 },
    present: { left: 420, right: 420, code: 'py', scale: 1.15, ui: 18 }
  };
  var GUEST = { tr: 'Misafir', en: 'Guest' };

  var settings = Object.assign({ lang: 'tr', theme: 'system', layoutName: 'default', layout: null, custom: null, lastProfile: null }, store.get('settings', {}));
  if (!settings.layout || !settings.layout.code) settings.layout = Object.assign({}, PRESETS.default);
  if (!T[settings.lang]) settings.lang = 'tr';
  function saveSettings() { store.set('settings', settings); }

  var S = { lang: settings.lang, profile: null, pdata: null, gi: 0, vi: 0, running: false, cancel: false, teacher: false, failBlock: null };
  var ws = null, grid = null, view = null, SUI = null;

  /* ---------- Metin yardımcıları ---------- */
  function t(k, p) {
    var s = T[S.lang] && T[S.lang][k];
    if (s == null) s = T.tr[k];
    if (s == null) return k;
    if (p) s = s.replace(/\{(\w+)\}/g, function (m, n) { return p[n] != null ? p[n] : m; });
    return s;
  }
  function L(o) { return o ? (o[S.lang] || o.tr) : ''; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function initial(name) { var c = String(name || '?').trim().charAt(0); return c ? c.toLocaleUpperCase(S.lang === 'tr' ? 'tr' : 'en') : '?'; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function applyStatic() {
    document.documentElement.lang = S.lang;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    document.querySelectorAll('[data-t-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-t-ph')); });
    document.querySelectorAll('[data-t-title]').forEach(function (el) { var v = t(el.getAttribute('data-t-title')); el.title = v; el.setAttribute('aria-label', v); });
    $('appName').innerHTML = '<span class="w-afi">afi</span><span class="w-prod">' + esc(t('prodWord')) + '</span>';
    $('appName').setAttribute('aria-label', t('appName'));
    document.title = t('appName');
    $('langSel').value = S.lang;
    fillLayoutSel(); fillCodeMode(); fillTheme(); setRunBtn();
    $('resetBtn').textContent = '↺ ' + t('reset');
    if (!('speechSynthesis' in window)) $('readBtn').hidden = true;
  }

  /* ---------- Tema ---------- */
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function isDark() {
    var a = document.documentElement.getAttribute('data-theme');
    if (a === 'dark') return true; if (a === 'light') return false;
    return !!(mq && mq.matches);
  }
  function applyTheme() {
    if (settings.theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', settings.theme);
    if (ws) ws.setTheme(isDark() ? darkTheme : lightTheme);
    draw();
  }
  function fillTheme() {
    $('themeSel').innerHTML = ['system', 'light', 'dark'].map(function (k) {
      return '<option value="' + k + '">' + esc(t('theme' + k.charAt(0).toUpperCase() + k.slice(1))) + '</option>'; }).join('');
    $('themeSel').value = settings.theme;
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (settings.theme === 'system') applyTheme(); });

  var font = { family: 'Nunito, "Segoe UI", sans-serif', weight: '800', size: 12 };
  var lightTheme = B.Theme.defineTheme('isikciLight2', { base: B.Themes.Classic, name: 'isikciLight2', fontStyle: font, componentStyles: {
    workspaceBackgroundColour: '#F7F9FC', toolboxBackgroundColour: '#EEF2F6', flyoutBackgroundColour: '#EEF2F6', flyoutOpacity: 1,
    scrollbarColour: '#C9D3DE', insertionMarkerColour: '#1A2230', insertionMarkerOpacity: 0.25 } });
  var darkTheme = B.Theme.defineTheme('isikciDark2', { base: B.Themes.Classic, name: 'isikciDark2', fontStyle: font, componentStyles: {
    workspaceBackgroundColour: '#121A24', toolboxBackgroundColour: '#171F2B', flyoutBackgroundColour: '#171F2B', flyoutOpacity: 1,
    scrollbarColour: '#34425A', insertionMarkerColour: '#FFFFFF', insertionMarkerOpacity: 0.3 } });

  /* ---------- Yerleşim ---------- */
  function fillLayoutSel() {
    var names = ['default', 'wide', 'compare', 'present'];
    if (settings.custom) names.push('custom');
    $('layoutSel').innerHTML = names.map(function (n) { return '<option value="' + n + '">' + esc(t('lay_' + n)) + '</option>'; }).join('');
    $('layoutSel').value = names.indexOf(settings.layoutName) >= 0 ? settings.layoutName : 'default';
  }
  function fillCodeMode() {
    $('codeMode').innerHTML = ['blocks', 'py', 'js', 'both'].map(function (m) { return '<option value="' + m + '">' + esc(t('mode_' + m)) + '</option>'; }).join('');
    $('codeMode').value = settings.layout.code;
    $('codeMode').setAttribute('aria-label', t('view'));
  }
  function effectiveWidths() {
    var l = settings.layout, W = $('main').clientWidth || window.innerWidth;
    var left = l.left, right = l.right, need = left + right + 20 + 340;
    if (W > 0 && need > W) { var k = Math.max(0.55, (W - 360) / (left + right)); left = Math.round(left * k); right = Math.round(right * k); }
    return { left: left, right: right };
  }
  function applyWidths() {
    var w = effectiveWidths(), m = $('main');
    m.style.setProperty('--left', w.left + 'px'); m.style.setProperty('--right', w.right + 'px');
  }
  function applyLayout() {
    var l = settings.layout;
    applyWidths();
    document.body.setAttribute('data-code', l.code);
    $('boxPy').hidden = !(l.code === 'py' || l.code === 'both');
    $('boxJs').hidden = !(l.code === 'js' || l.code === 'both');
    document.documentElement.style.fontSize = (l.ui || 15) + 'px';
    $('codeMode').value = l.code;
    if (ws) { ws.setScale(l.scale || 0.9); B.svgResize(ws); }
    requestAnimationFrame(function () { if (ws) B.svgResize(ws); draw(); });
  }
  function chooseLayout(name) {
    var src = name === 'custom' ? settings.custom : PRESETS[name];
    if (!src) return;
    settings.layoutName = name; settings.layout = Object.assign({}, src);
    saveSettings(); applyLayout();
  }
  function initSplit(el, side) {
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add('drag');
      var rect = $('main').getBoundingClientRect();
      function mv(ev) {
        var l = settings.layout, avail = rect.width - 20 - 340;
        if (side === 'L') l.left = clamp(Math.round(ev.clientX - rect.left - 5), 240, Math.max(240, avail - l.right));
        else l.right = clamp(Math.round(rect.right - ev.clientX - 5), 240, Math.max(240, avail - l.left));
        applyWidths();
      }
      function up() { el.classList.remove('drag'); el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); saveSettings(); }
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
    el.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowLeft' ? -20 : e.key === 'ArrowRight' ? 20 : 0; if (!d) return;
      e.preventDefault(); var l = settings.layout, avail = $('main').clientWidth - 20 - 340;
      if (side === 'L') l.left = clamp(l.left + d, 240, Math.max(240, avail - l.right)); else l.right = clamp(l.right - d, 240, Math.max(240, avail - l.left));
      applyWidths(); saveSettings();
    });
    el.addEventListener('dblclick', function () {
      var base = (settings.layoutName === 'custom' ? settings.custom : PRESETS[settings.layoutName]) || PRESETS.default;
      if (side === 'L') settings.layout.left = base.left; else settings.layout.right = base.right;
      applyWidths(); saveSettings();
    });
  }

  /* ---------- Blockly ---------- */
  function toolboxFor(st) {
    return { kind: 'flyoutToolbox', contents: st.tools.map(function (tp) {
      if (tp === 'controls_repeat_ext') return { kind: 'block', type: tp, inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 3 } } } } };
      return { kind: 'block', type: tp };
    }) };
  }
  function refreshToolbox(st) { ws.updateToolbox({ kind: 'flyoutToolbox', contents: [] }); ws.updateToolbox(toolboxFor(st)); }
  function injectWs() {
    RB.setLang(S.lang);
    ws = B.inject('blocklyDiv', {
      toolbox: toolboxFor(STEPS[0].st), renderer: 'zelos', theme: isDark() ? darkTheme : lightTheme,
      trashcan: false, sounds: false, zoom: { controls: true, wheel: true, startScale: settings.layout.scale || 0.9, minScale: 0.5, maxScale: 1.8 },
      move: { scrollbars: true, drag: true, wheel: false }, grid: { spacing: 28, length: 2, colour: 'rgba(128,140,160,.35)', snap: true }
    });
    ws.addChangeListener(onWsChange);
    if (window.ResizeObserver) new ResizeObserver(function () { B.svgResize(ws); }).observe($('blocklyDiv'));
  }
  function countBlocks() { return ws.getAllBlocks(false).filter(function (b) { return !b.isShadow(); }).length; }
  var saveTimer = null;
  function saveWs() {
    clearTimeout(saveTimer);
    if (!S.pdata || !ws) return;
    S.pdata.ws[STEPS[S.gi].st.id] = B.serialization.workspaces.save(ws);
    savePdata();
  }
  function saveWsSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(saveWs, 400); }
  function onWsChange(e) {
    if (e.isUiEvent) {
      if (e.type === B.Events.SELECTED) {
        var b = e.newElementId && ws.getBlockById(e.newElementId);
        if (b) showBlock(b.isShadow() && b.getParent() ? b.getParent() : b);
      }
      return;
    }
    if (S.failBlock) { ws.highlightBlock(null); S.failBlock = null; }
    updateCode();
    if (!S.running) saveWsSoon();
    var sel = B.getSelected && B.getSelected();
    if (sel && sel.type && e.type === B.Events.BLOCK_CHANGE) showBlock(sel.isShadow() && sel.getParent() ? sel.getParent() : sel);
  }

  /* ---------- Dil ---------- */
  function setLang(lang) {
    if (S.running || !T[lang]) return;
    saveWs();
    S.lang = lang; settings.lang = lang; saveSettings();
    RB.setLang(lang);
    var json = B.serialization.workspaces.save(ws);
    B.Events.disable();
    try { ws.clear(); refreshToolbox(STEPS[S.gi].st); B.serialization.workspaces.load(json, ws); } finally { B.Events.enable(); }
    applyStatic(); renderAll(); setStatus(t('st_ready'));
    if (!$('sensorModal').hidden) SUI.render();
    if (!$('mapModal').hidden) renderMap();
    if (S.profile && S.profile.id === 'guest') { S.profile.name = GUEST[lang]; $('chipName').textContent = S.profile.name; }
  }

  /* ---------- Profiller ---------- */
  function profiles() { return store.get('profiles', []); }
  function blankData() { return { stars: {}, ws: {}, seen: {}, last: null }; }
  function savePdata() { if (S.profile) store.set('p:' + S.profile.id, S.pdata); }
  function openProfile(p) {
    S.profile = p;
    S.pdata = Object.assign(blankData(), store.get('p:' + p.id, {}));
    settings.lastProfile = p.id; saveSettings();
    $('chipName').textContent = p.name; $('chipAv').textContent = initial(p.name);
    closeModal('profileModal');
    var gi = S.pdata.last != null ? idxOf(S.pdata.last) : suggestedIdx();
    goStep(gi >= 0 ? gi : 0, {});
  }
  var manage = false, pendingDel = null;
  function renderProfiles() {
    var list = profiles();
    $('plist').innerHTML = list.map(function (p) {
      var d = store.get('p:' + p.id, { stars: {} }), total = 0;
      Object.keys(d.stars || {}).forEach(function (k) { total += d.stars[k]; });
      var last = settings.lastProfile === p.id ? ' style="border-color:var(--accent)"' : '';
      return '<div class="pwrap"><button class="pbtn" type="button" data-id="' + esc(p.id) + '"' + last + '><span class="av">' + esc(initial(p.name)) + '</span>' +
        '<span class="nm">' + esc(p.name) + '</span><small>★ ' + total + '</small></button>' +
        (manage ? '<button class="pdel" type="button" data-del="' + esc(p.id) + '">' + esc(t('del')) + '</button>' : '') + '</div>';
    }).join('');
    $('manageBtn').hidden = !list.length;
    $('manageBtn').textContent = manage ? t('done') : t('manage');
    $('delConfirm').hidden = !pendingDel;
  }
  function openProfiles() {
    manage = false; pendingDel = null;
    $('addErr').hidden = true; $('codeErr').hidden = true; $('codeForm').hidden = true; $('newName').value = '';
    renderProfiles(); showModal('profileModal');
    setTimeout(function () { var f = document.querySelector('#plist .pbtn') || $('newName'); f.focus(); }, 30);
  }
  function newId() { return 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }

  /* ---------- Gezinme ---------- */
  function idxOf(id) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].st.id === id) return i; return -1; }
  function starsOf(gi) { return (S.pdata && S.pdata.stars[STEPS[gi].st.id]) || 0; }
  function suggestedIdx() { for (var i = 0; i < STEPS.length; i++) if (!starsOf(i)) return i; return -1; }

  function goStep(gi, opt) {
    opt = opt || {};
    if (S.running) S.cancel = true;
    if (!opt.noSave) saveWs();
    gi = clamp(gi, 0, STEPS.length - 1);
    S.gi = gi; S.vi = 0; S.failBlock = null;
    var cur = STEPS[gi], saved = S.pdata.ws[cur.st.id];
    S.pdata.last = cur.st.id; savePdata();
    B.Events.disable();
    try {
      ws.clear(); refreshToolbox(cur.st);
      if (saved) { try { B.serialization.workspaces.load(saved, ws); } catch (e) { ws.clear(); } }
      else if (cur.st.starter) B.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'robot_ileri', x: 40, y: 40 }] } }, ws);
    } finally { B.Events.enable(); }
    ws.scrollCenter();
    renderAll();
    setStatus(cur.st.starter && !saved ? t('st_first') : t('st_ready'));
    if (!opt.noStory && !S.pdata.seen[cur.ch.id]) { S.pdata.seen[cur.ch.id] = true; savePdata(); openStory(cur.ch); }
  }

  function renderAll() { renderTop(); renderTask(); resetView(); updateCode(); showConcept(); }

  function bubbleHTML(s, sug) {
    var stars = starsOf(s.gi), cls = 'bub' + (stars ? ' done' : '') + (s.gi === sug ? ' sug' : '');
    var label = t('step') + ' ' + (s.si + 1) + ': ' + (stars ? t('stars' + stars) : t('notDone')) + (s.gi === sug ? ', ' + t('suggested') : '');
    return '<button class="' + cls + '" type="button" data-gi="' + s.gi + '" aria-current="' + (s.gi === S.gi) + '" aria-label="' + esc(label) + '" title="' + esc(label) + '">' + (s.si + 1) + '</button>';
  }
  function renderTop() {
    var cur = STEPS[S.gi], sug = suggestedIdx();
    $('whereTitle').textContent = t('chapter') + ' ' + cur.ch.num + ' · ' + L(cur.ch.name) + ' — ' + L(cur.ls.title);
    $('whereSub').textContent = t('lesson') + ' ' + cur.ch.num + '.' + (cur.li + 1) + ' · ' + t('step') + ' ' + (cur.si + 1) + ' / ' + cur.ls.steps.length;
    $('bubbles').innerHTML = STEPS.filter(function (s) { return s.ci === cur.ci && s.li === cur.li; }).map(function (s) { return bubbleHTML(s, sug); }).join('');
    $('prevBtn').disabled = S.gi === 0;
    $('nextBtn').disabled = S.gi === STEPS.length - 1;
  }
  function renderTask() {
    var cur = STEPS[S.gi], st = cur.st;
    $('concept').textContent = t('chapter') + ' ' + cur.ch.num + ' · ' + L(cur.ch.concept);
    $('taskTitle').textContent = L(cur.ls.title) + ' · ' + t('step') + ' ' + (cur.si + 1);
    $('taskText').textContent = L(st.text);
    $('taskGoal').textContent = L(st.goal);
    $('maxB').textContent = st.max;
    renderVariant();
    $('solutionBtn').hidden = !S.teacher;
    $('teacherBadge').hidden = !S.teacher;
  }
  function renderVariant() {
    var nv = E.variantsOf(STEPS[S.gi].st).length;
    $('variantBox').hidden = nv < 2;
    $('variantLabel').innerHTML = esc(t('variantNote')) + ' <b>' + esc(t('variantLabel', { n: S.vi + 1, m: nv })) + '</b>';
  }

  /* ---------- Kod paneli ---------- */
  var KW = { py: ['for', 'in', 'range', 'while', 'not', 'if', 'else', 'from', 'import', 'pass', 'True', 'False'], js: ['for', 'var', 'while', 'if', 'else', 'let', 'const', 'true', 'false'] };
  function colorize(src, lang) {
    var kw = KW[lang], kwRe = new RegExp('\\b(' + kw.join('|') + ')\\b', 'g');
    return src.split('\n').map(function (line) {
      var m = line.match(lang === 'py' ? /^(\s*)(#.*)$/ : /^(\s*)(\/\/.*)$/);
      if (m) return m[1] + '<span class="cm">' + esc(m[2]) + '</span>';
      var out = esc(line);
      out = out.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
      out = out.replace(/\b([A-Za-z_][A-Za-z0-9_]*)(?=\()/g, function (w, n) { return kw.indexOf(n) >= 0 ? w : '<span class="fn">' + n + '</span>'; });
      out = out.replace(kwRe, '<span class="kw">$1</span>');
      return out;
    }).join('\n');
  }
  function updateCode() {
    var py = RB.toPython(ws).trim(), js = RB.toJS(ws).trim();
    $('codePy').innerHTML = colorize(t('pyHeader') + '\n' + (py || t('noBlocksPy')), 'py');
    $('codeJs').innerHTML = colorize(t('jsHeader') + '\n' + (js || t('noBlocksJs')), 'js');
    var n = countBlocks(); $('used').textContent = n;
    $('used').className = n > STEPS[S.gi].st.max ? 'over' : '';
  }

  /* ---------- Açıklama paneli ---------- */
  function showConcept() {
    var cur = STEPS[S.gi];
    $('explain').innerHTML = '<div class="eyebrow">' + esc(t('thisTopic')) + '</div><h3>' + esc(L(cur.ch.concept)) + ' · ' + esc(L(cur.ls.title)) + '</h3>' +
      '<p>' + esc(t('explainHint')) + '</p><div class="lifebox"><b>' + esc(t('inLife')) + '</b>' + esc(L(cur.ch.life)) + '</div>' +
      (SUI && cur.ch.sensors && cur.ch.sensors.length ? '<div class="eyebrow">' + esc(t('s_chapterSensors')) + '</div><div class="schips">' + SUI.chips(cur.ch.sensors) + '</div>' : '');
  }
  var ACTKEY = { robot_ileri: 'fwd', robot_sola: 'left', robot_saga: 'right', robot_isik: 'light', robot_kapi: 'door' };
  function snippets(b) {
    var n = E.NAMES[S.lang], tp = b.type, py = '', js = '';
    if (ACTKEY[tp]) { py = n.py[ACTKEY[tp]] + '()'; js = n.js[ACTKEY[tp]] + '();'; }
    else if (tp === 'controls_repeat_ext') {
      var tb = b.getInputTargetBlock('TIMES'), k = tb && tb.getFieldValue('NUM'); if (k == null) k = 3;
      py = 'for count in range(' + k + '):\n    ...'; js = 'for (var count = 0; count < ' + k + '; count++) {\n  ...\n}';
    } else if (tp === 'robot_until' || tp === 'robot_until_all') {
      var q = tp === 'robot_until' ? 'ISIK' : 'ALL';
      py = 'while not ' + n.py[q] + '():\n    ...'; js = 'while (!' + n.js[q] + '()) {\n  ...\n}';
    } else if (tp === 'robot_if' || tp === 'robot_ifelse') {
      var c = b.getFieldValue('COND');
      py = 'if ' + n.py[c] + '():\n    ...'; js = 'if (' + n.js[c] + '()) {\n  ...\n}';
      if (tp === 'robot_ifelse') { py += '\nelse:\n    ...'; js = js.replace(/\}$/, '} else {\n  ...\n}'); }
    } else if (tp === 'math_number') { py = js = String(b.getFieldValue('NUM')); }
    return { py: py, js: js };
  }
  function showBlock(b) {
    var info = T[S.lang].info[b.type] || T.tr.info[b.type];
    if (!info) { showConcept(); return; }
    var sn = snippets(b), cond = '';
    if (b.type === 'robot_if' || b.type === 'robot_ifelse') cond = '<p>' + t('condNote', { q: esc(B.Msg['ROBOT_C_' + b.getFieldValue('COND')] || '') }) + '</p>';
    $('explain').innerHTML = '<div class="eyebrow">' + esc(t('selected')) + '</div><h3>' + esc(info.name) + '</h3>' +
      '<div class="pair"><span>Python</span><div class="snippet">' + colorize(sn.py, 'py') + '</div>' +
      '<span>JS</span><div class="snippet">' + colorize(sn.js, 'js') + '</div></div>' +
      '<p>' + info.text + '</p>' + cond + '<div class="lifebox"><b>' + esc(t('inLife')) + '</b>' + esc(info.life) + '</div>';
  }

  /* ---------- Sahne çizimi ---------- */
  var cv = $('stage'), ctx = cv.getContext('2d');
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function resetView() {
    var st = STEPS[S.gi].st;
    grid = E.parseMap(E.variantsOf(st)[S.vi]);
    view = { x: grid.start.x, y: grid.start.y, a: st.dir * 90, lit: {}, opened: {}, shake: 0, flash: 0, miss: 0 };
    draw();
  }
  function fitCanvas() {
    var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1, s = Math.max(200, Math.round(r.width * d));
    if (cv.width !== s) { cv.width = s; cv.height = s; }
  }
  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function drawFloor(room, x, y, px, py, ts, K) {
    var a = K[room + 'a'], b = K[room + 'b'];
    if (room === 'mutfak') { ctx.fillStyle = (x + y) % 2 ? b : a; ctx.fillRect(px, py, ts + 0.5, ts + 0.5); return; }
    ctx.fillStyle = a; ctx.fillRect(px, py, ts + 0.5, ts + 0.5);
    ctx.strokeStyle = b; ctx.lineWidth = Math.max(1, ts * 0.025);
    if (room === 'salon') {
      line(px, py + ts / 3, px + ts, py + ts / 3); line(px, py + 2 * ts / 3, px + ts, py + 2 * ts / 3);
      var o = (y % 2) ? ts * 0.35 : ts * 0.7; line(px + o, py, px + o, py + ts / 3); line(px + ts - o, py + ts / 3, px + ts - o, py + 2 * ts / 3);
    } else { rr(px + ts * 0.12, py + ts * 0.12, ts * 0.76, ts * 0.76, ts * 0.12); ctx.stroke(); }
  }
  function drawFurniture(f, px, py, ts, K) {
    var g = ts * 0.1;
    if (f === 'K') {
      ctx.fillStyle = K.sofa; rr(px + g, py + g * 1.5, ts - 2 * g, ts - 3 * g, ts * 0.14); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(px + g, py + g * 1.5, ts - 2 * g, ts * 0.26, ts * 0.12); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(px + g * 2, py + ts * 0.5, ts - 4 * g, ts * 0.22, ts * 0.08); ctx.fill();
    } else if (f === 'M') {
      ctx.fillStyle = K.table; rr(px + g * 0.6, py + g * 0.6, ts - 1.2 * g, ts - 1.2 * g, ts * 0.06); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.16)'; rr(px + g * 1.6, py + g * 1.6, ts - 3.2 * g, ts - 3.2 * g, ts * 0.05); ctx.fill();
    } else if (f === 'B') {
      ctx.fillStyle = K.pot; rr(px + ts * 0.32, py + ts * 0.56, ts * 0.36, ts * 0.3, ts * 0.06); ctx.fill();
      ctx.fillStyle = K.plant;
      [[0.5, 0.36, 0.2], [0.33, 0.46, 0.15], [0.67, 0.46, 0.15]].forEach(function (c) { ctx.beginPath(); ctx.arc(px + ts * c[0], py + ts * c[1], ts * c[2], 0, 7); ctx.fill(); });
    } else if (f === 'T') {
      ctx.fillStyle = K.counter; ctx.fillRect(px + 0.5, py + g, ts, ts - 2 * g);
      ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(px + 0.5, py + g, ts, ts * 0.14);
    }
  }
  function drawDoor(px, py, ts, open, K, horiz) {
    ctx.fillStyle = K.door;
    if (!open) {
      if (horiz) rr(px + ts * 0.38, py + ts * 0.06, ts * 0.24, ts * 0.88, ts * 0.05); else rr(px + ts * 0.06, py + ts * 0.38, ts * 0.88, ts * 0.24, ts * 0.05);
      ctx.fill();
      ctx.fillStyle = K.lamp; ctx.beginPath();
      if (horiz) ctx.arc(px + ts * 0.5, py + ts * 0.62, ts * 0.05, 0, 7); else ctx.arc(px + ts * 0.62, py + ts * 0.5, ts * 0.05, 0, 7);
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.85;
      if (horiz) rr(px + ts * 0.06, py + ts * 0.04, ts * 0.12, ts * 0.5, ts * 0.04); else rr(px + ts * 0.04, py + ts * 0.06, ts * 0.5, ts * 0.12, ts * 0.04);
      ctx.fill(); ctx.globalAlpha = 1;
    }
  }
  function draw() {
    if (!grid || !view) return;
    fitCanvas();
    var W = cv.width, n = Math.max(grid.w, grid.h), pad = W * 0.05;
    var ts = (W - pad * 2) / n, ox = pad + (n - grid.w) * ts / 2, oy = pad + (n - grid.h) * ts / 2;
    var room = STEPS[S.gi].ch.room;
    var K = { wall: tok('--wall'), salona: tok('--salon-a'), salonb: tok('--salon-b'), koridora: tok('--koridor-a'), koridorb: tok('--koridor-b'),
      mutfaka: tok('--mutfak-a'), mutfakb: tok('--mutfak-b'), lamp: tok('--lamp'), glow: tok('--lamp-glow'), robot: tok('--robot'), eye: tok('--robot-eye'),
      sofa: tok('--sofa'), table: tok('--table'), plant: tok('--plant'), pot: tok('--pot'), counter: tok('--counter'), door: tok('--door'), bad: tok('--bad'), line: tok('--line') };
    ctx.clearRect(0, 0, W, W); ctx.fillStyle = K.wall; ctx.fillRect(0, 0, W, W);
    var x, y, px, py;
    for (y = 0; y < grid.h; y++) for (x = 0; x < grid.w; x++) {
      if (!grid.cells[y][x] && !grid.furn[y][x]) continue;
      drawFloor(room, x, y, ox + x * ts, oy + y * ts, ts, K);
    }
    for (y = 0; y < grid.h; y++) for (x = 0; x < grid.w; x++) {
      px = ox + x * ts; py = oy + y * ts;
      var c = grid.cells[y][x], f = grid.furn[y][x];
      if (f) drawFurniture(f, px, py, ts, K);
      if (c === 3) {
        var horiz = (x > 0 && grid.cells[y][x - 1] > 0) || (x < grid.w - 1 && grid.cells[y][x + 1] > 0);
        drawDoor(px, py, ts, !!view.opened[x + ',' + y], K, horiz);
      }
      if (c === 2) {
        var lit = view.lit[x + ',' + y], cx = px + ts / 2, cy = py + ts / 2, rad = ts * 0.2;
        if (lit) {
          var grd = ctx.createRadialGradient(cx, cy, rad * 0.2, cx, cy, ts * 0.6);
          grd.addColorStop(0, K.glow); grd.addColorStop(1, 'rgba(255,200,80,0)');
          ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, ts * 0.6, 0, 7); ctx.fill();
          ctx.fillStyle = K.lamp; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.fill();
          ctx.strokeStyle = K.lamp; ctx.lineWidth = Math.max(2, ts * 0.05);
          ctx.setLineDash([ts * 0.06, ts * 0.05]); ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        }
      }
    }
    var rx = ox + view.x * ts + ts / 2 + Math.sin(view.shake * 40) * view.shake * ts * 0.25, ry = oy + view.y * ts + ts / 2;
    if (view.miss > 0) { ctx.strokeStyle = K.bad; ctx.lineWidth = ts * 0.06; ctx.globalAlpha = view.miss; ctx.beginPath(); ctx.arc(rx, ry, ts * 0.42, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.save(); ctx.translate(rx, ry); ctx.rotate(view.a * Math.PI / 180);
    var bs = ts * 0.56;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; rr(-bs / 2, -bs / 2 + ts * 0.05, bs, bs, bs * 0.3); ctx.fill();
    ctx.fillStyle = K.robot; rr(-bs / 2, -bs / 2, bs, bs, bs * 0.3); ctx.fill();
    ctx.fillStyle = K.eye; ctx.beginPath(); ctx.arc(0, -bs * 0.18, bs * 0.17, 0, 7); ctx.fill();
    ctx.fillStyle = K.robot; ctx.beginPath(); ctx.arc(0, -bs * 0.22, bs * 0.07, 0, 7); ctx.fill();
    ctx.fillStyle = view.flash > 0 ? K.glow : K.lamp;
    ctx.beginPath(); ctx.arc(0, bs * 0.2, bs * (0.1 + view.flash * 0.08), 0, 7); ctx.fill();
    ctx.restore();
  }
  if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(cv);

  /* ---------- Çalıştırma ---------- */
  function setStatus(txt, kind) { var s = $('status'); s.textContent = txt; if (kind) s.setAttribute('data-kind', kind); else s.removeAttribute('data-kind'); }
  function setRunBtn() { var b = $('runBtn'); b.textContent = S.running ? '■ ' + t('stop') : '▶ ' + t('run'); b.setAttribute('data-mode', S.running ? 'stop' : 'run'); }
  function speedMs() { return [0, 620, 440, 300, 190, 100][+$('speed').value] || 300; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tween(dur, fn) {
    return new Promise(function (res) {
      if (reduce) { fn(1); draw(); return res(); }
      var t0 = performance.now();
      function f(now) { if (S.cancel) return res(); var k = Math.min(1, (now - t0) / dur); fn(k); draw(); if (k < 1) requestAnimationFrame(f); else res(); }
      requestAnimationFrame(f);
    });
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  async function play(result) {
    var dur = speedMs(), list = result.steps;
    if (result.outcome === 'loop') list = list.slice(0, 24); else if (list.length > 400) list = list.slice(0, 400);
    for (var i = 0; i < list.length; i++) {
      if (S.cancel) return false;
      var st = list[i]; if (st.block) ws.highlightBlock(st.block);
      var fx = view.x, fy = view.y, fa = view.a;
      if (st.type === 'move') await tween(dur, function (k) { var e = ease(k); view.x = fx + (st.state.x - fx) * e; view.y = fy + (st.state.y - fy) * e; });
      else if (st.type === 'turn') { var ta = fa + st.turn * 90; await tween(dur * 0.8, function (k) { view.a = fa + (ta - fa) * ease(k); }); }
      else if (st.type === 'light') { view.lit = st.state.lit; await tween(dur * 0.8, function (k) { view.flash = Math.sin(k * Math.PI); }); view.flash = 0; }
      else if (st.type === 'door') { view.opened = st.state.opened; await tween(dur * 0.8, function () {}); }
      else if (st.type === 'miss' || st.type === 'nodoor') { await tween(dur * 1.1, function (k) { view.miss = Math.sin(k * Math.PI); view.shake = st.type === 'nodoor' ? Math.sin(k * Math.PI) * 0.3 : 0; }); view.miss = 0; view.shake = 0; draw(); }
      else if (st.type === 'bump') { await tween(dur * 1.2, function (k) { view.shake = Math.sin(k * Math.PI) * 0.6; }); view.shake = 0; draw(); }
      if (S.cancel) return false;
      await wait(dur * 0.15);
    }
    return !S.cancel;
  }
  function outcomeText(r) {
    if (r.outcome === 'done') return t('st_partial', { lit: r.litCount, total: r.lampCount });
    return t('st_' + r.outcome) || t('st_error');
  }
  async function run() {
    if (S.running) { S.cancel = true; return; }
    var tops = ws.getTopBlocks(false).filter(function (b) { return !b.isShadow(); });
    if (!tops.length) { setStatus(t('st_needBlock'), 'bad'); return; }
    if (tops.length > 1) { setStatus(t('st_separate'), 'bad'); return; }
    ws.highlightBlock(null); S.failBlock = null;
    var gi = S.gi, st = STEPS[gi].st, results = E.runAll(st, RB.runCode(ws));
    var fail = -1; for (var i = 0; i < results.length; i++) if (!results[i].success) { fail = i; break; }
    var show = fail >= 0 ? fail : S.vi;
    S.vi = show; renderVariant(); resetView();
    S.running = true; S.cancel = false; setRunBtn(); setStatus(t('st_running'));
    var res = results[show], finished = await play(res);
    S.running = false; S.cancel = false; setRunBtn();
    if (gi !== S.gi) return;
    if (!finished) { ws.highlightBlock(null); setStatus(t('st_stopped')); return; }
    if (fail >= 0) {
      var last = res.steps[res.steps.length - 1];
      if (last && last.block && res.outcome !== 'done') { ws.highlightBlock(last.block); S.failBlock = last.block; } else ws.highlightBlock(null);
      setStatus((results.length > 1 ? t('st_variantFail', { n: show + 1 }) : '') + outcomeText(res), 'bad');
      return;
    }
    ws.highlightBlock(null);
    var n = countBlocks(), stars = n <= st.max ? 3 : (n <= st.max + 2 ? 2 : 1);
    S.pdata.stars[st.id] = Math.max(S.pdata.stars[st.id] || 0, stars); savePdata(); renderTop();
    setStatus(results.length > 1 ? t('st_successAll', { m: results.length }) : t('st_success'), 'ok');
    openWin(n, stars, st.max);
  }
  function openWin(n, stars, max) {
    $('winStars').innerHTML = [1, 2, 3].map(function (k) { return k <= stars ? '★' : '<span class="off">★</span>'; }).join('');
    var txt = n <= max ? t('winGood', { n: n, max: max }) : t('winLong', { n: n, max: max }), nx = S.gi + 1;
    if (nx >= STEPS.length) { $('winNext').hidden = true; txt += ' ' + t('courseDone'); }
    else { $('winNext').hidden = false; $('winNext').textContent = STEPS[nx].ci !== STEPS[S.gi].ci ? t('nextChapter') : t('next'); }
    $('winText').textContent = txt;
    showModal('win');
    setTimeout(function () { ($('winNext').hidden ? $('winStay') : $('winNext')).focus(); }, 30);
  }

  /* ---------- Pencereler ---------- */
  var stack = [];
  function canClose(id) { return id !== 'profileModal' || !!S.profile; }
  function showModal(id) { $(id).hidden = false; stack = stack.filter(function (x) { return x !== id; }); stack.push(id); }
  function closeModal(id) { $(id).hidden = true; stack = stack.filter(function (x) { return x !== id; }); }
  ['profileModal', 'mapModal', 'settingsModal', 'storyModal', 'win', 'sensorModal'].forEach(function (id) {
    $(id).addEventListener('click', function (e) { if (e.target === $(id) && canClose(id)) closeModal(id); });
    $(id).querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeModal(id); }); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !stack.length) return;
    var top = stack[stack.length - 1]; if (canClose(top)) closeModal(top);
  });

  function openStory(ch) {
    $('storyEyebrow').textContent = t('chapter') + ' ' + ch.num + ' · ' + L(ch.concept);
    $('storyTitle').textContent = L(ch.name);
    $('storyText').textContent = L(ch.story);
    $('storyLife').textContent = L(ch.life);
    showModal('storyModal');
    setTimeout(function () { $('storyStart').focus(); }, 30);
  }

  function renderMap() {
    var sug = suggestedIdx(), cur = STEPS[S.gi];
    $('legend').innerHTML = '<span><span class="bub done">1</span> ' + esc(t('legendDone')) + '</span>' +
      '<span><span class="bub" aria-current="true">1</span> ' + esc(t('legendCur')) + '</span>' +
      '<span><span class="bub sug">1</span> ' + esc(t('suggested')) + '</span>';
    var html = C.chapters.map(function (ch, ci) {
      var steps = STEPS.filter(function (s) { return s.ci === ci; }), done = steps.filter(function (s) { return starsOf(s.gi); }).length;
      var lessons = ch.lessons.map(function (ls, li) {
        var bubs = steps.filter(function (s) { return s.li === li; }).map(function (s) { return bubbleHTML(s, sug); }).join('');
        return '<div class="lrow"><div class="lt">' + ch.num + '.' + (li + 1) + ' ' + esc(L(ls.title)) + '</div><div class="bubbles" style="margin-left:0">' + bubs + '</div></div>';
      }).join('');
      return '<div class="chap' + (cur.ci === ci ? ' cur' : '') + '"><div class="hd"><div class="num">' + ch.num + '</div><div><b>' + esc(L(ch.name)) + '</b><span>' + esc(L(ch.concept)) + '</span></div>' +
        '<div class="prog">' + esc(t('stepsDone', { d: done, t: steps.length })) + '</div></div>' + lessons +
        (ch.sensors && ch.sensors.length ? '<div class="schips">' + SUI.chips(ch.sensors) + '</div>' : '') + '</div>';
    }).join('') + C.soon.map(function (s) {
      return '<div class="chap soon"><div class="hd"><div class="num">' + s.num + '</div><div><b>' + esc(L(s.name)) + '</b><span>' + esc(L(s.concept)) + '</span></div></div>' +
        '<p style="margin:0;font-size:.86rem;color:var(--ink-2)">' + esc(L(s.sensor)) + '</p>' +
        (s.sensors && s.sensors.length ? '<div class="schips">' + SUI.chips(s.sensors) + '</div>' : '') + '<span class="soonchip">' + esc(t('soon')) + '</span></div>';
    }).join('');
    $('mapgrid').innerHTML = html;
  }

  function openSettings() {
    $('myCode').textContent = E.encodeProgress(STEPS.map(function (s) { return starsOf(s.gi); }));
    $('mergeIn').value = ''; $('mergeMsg').hidden = true; $('copyCode').textContent = t('copy');
    showModal('settingsModal');
  }

  /* ---------- Olaylar ---------- */
  function bind() {
    $('runBtn').onclick = run;
    $('resetBtn').onclick = function () { if (S.running) S.cancel = true; ws.highlightBlock(null); S.failBlock = null; resetView(); setStatus(t('st_reset')); };
    $('clearBtn').onclick = function () { if (S.running) return; ws.clear(); resetView(); updateCode(); setStatus(t('st_cleared')); };
    $('prevBtn').onclick = function () { goStep(S.gi - 1); };
    $('nextBtn').onclick = function () { goStep(S.gi + 1); };
    $('bubbles').addEventListener('click', function (e) { var b = e.target.closest('[data-gi]'); if (b) goStep(+b.getAttribute('data-gi')); });
    $('mapgrid').addEventListener('click', function (e) {
      var sn = e.target.closest('[data-sensor]'); if (sn) { closeModal('mapModal'); SUI.open(sn.getAttribute('data-sensor')); return; }
      var b = e.target.closest('[data-gi]'); if (b) { closeModal('mapModal'); goStep(+b.getAttribute('data-gi')); } });
    $('explain').addEventListener('click', function (e) { var sn = e.target.closest('[data-sensor]'); if (sn) SUI.open(sn.getAttribute('data-sensor')); });
    $('sensorBtn').onclick = function () { SUI.open(); };
    $('mapBtn').onclick = function () { renderMap(); showModal('mapModal'); };
    $('variantBtn').onclick = function () { if (S.running) return; var nv = E.variantsOf(STEPS[S.gi].st).length; S.vi = (S.vi + 1) % nv; renderVariant(); resetView(); };
    $('storyBtn').onclick = function () { openStory(STEPS[S.gi].ch); };
    $('storyStart').onclick = function () { closeModal('storyModal'); };
    $('readBtn').onclick = function () {
      if (!('speechSynthesis' in window)) return;
      try { speechSynthesis.cancel(); var st = STEPS[S.gi].st, u = new SpeechSynthesisUtterance(L(st.text) + ' ' + L(st.goal));
        u.lang = S.lang === 'tr' ? 'tr-TR' : 'en-US'; u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {}
    };
    $('solutionBtn').onclick = function () {
      if (S.running) return; ws.clear();
      B.serialization.workspaces.load(E.solutionWorkspace(STEPS[S.gi].st.sol), ws); ws.scrollCenter(); setStatus(t('st_solution'));
    };
    $('winStay').onclick = function () { closeModal('win'); };
    $('winNext').onclick = function () { closeModal('win'); goStep(S.gi + 1); };
    $('speed').oninput = function () {};

    $('layoutSel').onchange = function () { chooseLayout(this.value); };
    $('saveLayoutBtn').onclick = function () {
      settings.custom = Object.assign({}, settings.layout); settings.layoutName = 'custom'; saveSettings(); fillLayoutSel(); setStatus(t('layoutSaved'), 'ok');
    };
    $('codeMode').onchange = function () { settings.layout.code = this.value; saveSettings(); applyLayout(); };
    initSplit($('splitL'), 'L'); initSplit($('splitR'), 'R');
    window.addEventListener('resize', function () { applyWidths(); B.svgResize(ws); draw(); });

    $('settingsBtn').onclick = openSettings;
    $('langSel').onchange = function () { setLang(this.value); if (!$('settingsModal').hidden) openSettings(); };
    $('themeSel').onchange = function () { settings.theme = this.value; saveSettings(); applyTheme(); };
    $('copyCode').onclick = function () {
      var txt = $('myCode').textContent, btn = this;
      function sel() { var r = document.createRange(); r.selectNodeContents($('myCode')); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      try { navigator.clipboard.writeText(txt).then(function () { btn.textContent = t('copied'); }, sel); } catch (e) { sel(); }
    };
    $('mergeForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var arr = E.decodeProgress($('mergeIn').value, STEPS.length), msg = $('mergeMsg');
      msg.hidden = false;
      if (!arr) { msg.className = 'err'; msg.textContent = t('badCode'); return; }
      arr.forEach(function (v, i) { var id = STEPS[i].st.id; if (v > (S.pdata.stars[id] || 0)) S.pdata.stars[id] = v; });
      savePdata(); renderTop();
      msg.className = 'status'; msg.setAttribute('data-kind', 'ok'); msg.textContent = t('loaded');
      $('myCode').textContent = E.encodeProgress(STEPS.map(function (s) { return starsOf(s.gi); }));
    });
    $('switchBtn').onclick = function () { closeModal('settingsModal'); saveWs(); openProfiles(); };
    $('profileChip').onclick = function () { saveWs(); openProfiles(); };

    $('plist').addEventListener('click', function (e) {
      var d = e.target.closest('[data-del]');
      if (d) { pendingDel = d.getAttribute('data-del'); var p = profiles().filter(function (x) { return x.id === pendingDel; })[0];
        $('delText').textContent = t('delConfirm', { name: p ? p.name : '' }); renderProfiles(); return; }
      var b = e.target.closest('[data-id]');
      if (b && !manage) { var pr = profiles().filter(function (x) { return x.id === b.getAttribute('data-id'); })[0]; if (pr) openProfile(pr); }
    });
    $('manageBtn').onclick = function () { manage = !manage; pendingDel = null; renderProfiles(); };
    $('delNo').onclick = function () { pendingDel = null; renderProfiles(); };
    $('delYes').onclick = function () {
      var id = pendingDel; pendingDel = null;
      store.set('profiles', profiles().filter(function (x) { return x.id !== id; })); store.del('p:' + id);
      if (S.profile && S.profile.id === id) { S.profile = null; }
      renderProfiles();
    };
    $('addForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('newName').value.trim();
      if (!name) { $('addErr').textContent = t('needName'); $('addErr').hidden = false; return; }
      var p = { id: newId(), name: name.slice(0, 24) }, list = profiles(); list.push(p); store.set('profiles', list);
      openProfile(p);
    });
    $('guestBtn').onclick = function () { openProfile({ id: 'guest', name: GUEST[S.lang] }); };
    $('haveCodeBtn').onclick = function () { $('codeForm').hidden = !$('codeForm').hidden; if (!$('codeForm').hidden) $('codeNameIn').focus(); };
    $('codeForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('codeNameIn').value.trim(), arr = E.decodeProgress($('codeIn').value, STEPS.length), err = $('codeErr');
      if (!name) { err.textContent = t('needName'); err.hidden = false; return; }
      if (!arr) { err.textContent = t('badCode'); err.hidden = false; return; }
      var p = { id: newId(), name: name.slice(0, 24) }, list = profiles(), data = blankData();
      arr.forEach(function (v, i) { if (v) data.stars[STEPS[i].st.id] = v; });
      var sug = -1; for (var i = 0; i < STEPS.length; i++) if (!arr[i]) { sug = i; break; }
      data.last = STEPS[sug >= 0 ? sug : STEPS.length - 1].st.id;
      C.chapters.forEach(function (ch, ci) { if (STEPS.some(function (s) { return s.ci === ci && arr[s.gi]; })) data.seen[ch.id] = true; });
      list.push(p); store.set('profiles', list); store.set('p:' + p.id, data);
      openProfile(p);
    });

    function checkTeacher() { S.teacher = /^#(ogretmen|teacher)$/i.test(location.hash); $('solutionBtn').hidden = !S.teacher; $('teacherBadge').hidden = !S.teacher; }
    window.addEventListener('hashchange', checkTeacher); checkTeacher();
  }

  /* ---------- Başlangıç ---------- */
  SUI = window.createSensorUI({ t: t, L: L, esc: esc, showModal: showModal, lang: function () { return S.lang; },
    chapters: function () { return C.chapters.concat(C.soon); } });
  applyTheme();
  injectWs();
  applyStatic();
  applyLayout();
  bind();
  S.pdata = blankData();
  goStep(0, { noStory: true, noSave: true });
  openProfiles();
  setTimeout(function () { B.svgResize(ws); draw(); }, 60);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { B.svgResize(ws); draw(); });
  window.__isikci = { S: S, STEPS: STEPS, goStep: goStep, setLang: setLang, chooseLayout: chooseLayout, settings: settings, run: run, ws: function () { return ws; } };
})();
