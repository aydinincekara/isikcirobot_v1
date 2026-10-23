/* afi kod - arayüz */
(function () {
  'use strict';
  var B = window.Blockly, E = window.Engine, RB = window.RobotBlocks, C = window.COURSE, T = window.I18N;
  var HB = window.HomeBlocks, H = window.HOME, HS = window.HomeScene;
  function isHome(st) { return !!(st && st.kind === 'home'); }
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
  /* İlerleme kodu adımların sabit numarasına (n) göre yazılır; görünen sıra değişse de eski kodlar doğru okunur */
  var CODE_N = 0;
  STEPS.forEach(function (s) { if (s.st.n == null) s.st.n = s.gi; CODE_N = Math.max(CODE_N, s.st.n + 1); });
  function codeStars() { var a = []; for (var i = 0; i < CODE_N; i++) a.push(0); STEPS.forEach(function (s) { a[s.st.n] = starsOf(s.gi); }); return a; }
  var IC = window.ic, ICT = window.icTier, RI = window.ROOM_ICON;
  function roomIc(ch) { return IC(RI[ch.id] || RI[ch.num] || 'home'); }
  function tierChip(tr) { tr = tr || 'easy'; var tt = (C.tiers && C.tiers[tr]) || { tr: tr, en: tr }; return '<span class="tier tier-' + tr + '">' + ICT(tr) + esc(L(tt)) + '</span>'; }

  var PRESETS = {
    default: { left: 340, right: 390, code: 'py', scale: 0.9, ui: 15, lc: false, rc: false, bh: null },
    wide: { left: 300, right: 290, code: 'py', scale: 1, ui: 15, lc: false, rc: true, bh: null },
    compare: { left: 300, right: 600, code: 'both', scale: 0.85, ui: 15, lc: false, rc: false, bh: null },
    present: { left: 420, right: 420, code: 'py', scale: 1.15, ui: 18, lc: false, rc: false, bh: null }
  };
  var GUEST = { tr: 'Misafir', en: 'Guest' };

  var settings = Object.assign({ lang: 'tr', theme: 'system', layoutName: 'default', layout: null, custom: null, lastProfile: null, board: 'uno', sound: 'all', guestRobot: 'afi' }, store.get('settings', {}));
  var R = window.ROBOTS, SND = window.SOUNDS;
  SND.mode = settings.sound;
  if (!settings.layout || !settings.layout.code) settings.layout = Object.assign({}, PRESETS.default);
  if (!T[settings.lang]) settings.lang = 'tr';
  function saveSettings() { store.set('settings', settings); }

  var S = { lang: settings.lang, robot: 'afi', profile: null, pdata: null, gi: 0, vi: 0, running: false, cancel: false, teacher: false, failBlock: null };
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
  function sayOne(k) { var a = (T[S.lang] && T[S.lang][k]) || T.tr[k]; return Array.isArray(a) ? a[Math.floor(Math.random() * a.length)] : a; }

  /* ---------- Robot seçimi ---------- */
  var pickNew = 'afi';
  function renderRoboPick(id, cur) {
    $(id).innerHTML = R.ORDER.map(function (k) {
      return '<button type="button" class="rpbtn" role="radio" data-robot="' + k + '" aria-checked="' + (k === cur) + '"><img src="' + R.avatar(k, 96) + '" alt=""><span>' + esc(L(R.TYPES[k].name)) + '</span></button>';
    }).join('');
  }
  function robotOf(p) { return R.valid(p && (p.id === 'guest' ? settings.guestRobot : p.robot)); }
  function setChip() {
    $('chipName').textContent = S.profile ? S.profile.name : '';
    $('chipAv').innerHTML = '<img src="' + R.avatar(S.robot, 64) + '" alt="">';
  }
  function setRobot(k) {
    k = R.valid(k); S.robot = k;
    if (S.profile) {
      if (S.profile.id === 'guest') { settings.guestRobot = k; saveSettings(); }
      else { var list = profiles(); list.forEach(function (p) { if (p.id === S.profile.id) p.robot = k; }); store.set('profiles', list); S.profile.robot = k; }
    }
    setChip(); renderRoboPick('roboPickSet', k); draw();
  }
  /* İlerleme kodu kutusu: yazarken büyük harfe çevirir ve dörtlü gruplara tire koyar */
  function formatCode(v) {
    var s = String(v || '').toLocaleUpperCase('en').replace(/İ/g, 'I').replace(/[^A-Z0-9]/g, '');
    return (s.match(/.{1,4}/g) || []).join('-');
  }
  function codeError(v) {
    var s = String(v || '').toUpperCase().replace(/İ/g, 'I').replace(/[^A-Z0-9]/g, '');
    return /[IO01]/.test(s) ? t('badCodeChars') : t('badCode');
  }

  function applyStatic() {
    document.documentElement.lang = S.lang;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    document.querySelectorAll('[data-t-ph]').forEach(function (el) { el.placeholder = t(el.getAttribute('data-t-ph')); });
    document.querySelectorAll('[data-t-title]').forEach(function (el) { var v = t(el.getAttribute('data-t-title')); el.title = v; el.setAttribute('aria-label', v); });
    $('appName').innerHTML = '<span class="logo"><span class="logo-word">AF<span class="logo-i"><span class="logo-dot"></span></span></span><span class="logo-tag">' +
      esc(t('prodWord').toLocaleUpperCase(S.lang === 'tr' ? 'tr' : 'en')) + '</span></span>';
    $('brandRobot').src = R.avatar('afi', 96);
    if (trashEl) trashEl.querySelector('span').textContent = t('trashHint');
    $('soundSel').innerHTML = ['all', 'fx', 'off'].map(function (k) { return '<option value="' + k + '">' + esc(t('snd_' + k)) + '</option>'; }).join('');
    $('soundSel').value = settings.sound;
    renderRoboPick('roboPick', pickNew); if (S.profile) renderRoboPick('roboPickSet', S.robot);
    $('appName').setAttribute('aria-label', t('appName'));
    document.title = t('appName');
    $('langSel').value = S.lang;
    fillLayoutSel(); fillCodeMode(); fillTheme(); setRunBtn();
    $('resetBtn').textContent = '↺ ' + t('reset');
    if (!('speechSynthesis' in window)) $('readBtn').hidden = true;
    document.querySelectorAll('[data-ic]').forEach(function (el) { el.innerHTML = IC(el.getAttribute('data-ic')); });
    $('openL').innerHTML = IC('chevR'); $('openR').innerHTML = IC('chevL'); $('railRun').innerHTML = IC('play');
    $('dlPy').innerHTML = IC('download') + '<span>' + esc(t('dl_py')) + '</span>'; $('dlIno').innerHTML = IC('download') + '<span>' + esc(t('dl_ino')) + '</span>';
    $('boardSel').value = settings.board === 'esp32' ? 'esp32' : 'uno';
    applyWidths();
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
    $('codeMode').innerHTML = ['blocks', 'py', 'js', 'both', 'ino'].map(function (m) { return '<option value="' + m + '">' + esc(t('mode_' + m)) + '</option>'; }).join('');
    $('codeMode').value = settings.layout.code;
    $('codeMode').setAttribute('aria-label', t('view'));
  }
  var RAIL = 46, MID = 300, GUT = 32;
  function effectiveWidths() {
    var l = settings.layout, W = $('main').clientWidth || window.innerWidth;
    var left = l.lc ? RAIL : l.left, right = l.rc ? RAIL : l.right;
    if (W > 0 && left + right + GUT + MID > W) {
      var fixed = (l.lc ? RAIL : 0) + (l.rc ? RAIL : 0), flex = (l.lc ? 0 : left) + (l.rc ? 0 : right);
      if (flex > 0) { var k = Math.max(0.5, (W - GUT - MID - fixed) / flex); if (!l.lc) left = Math.round(left * k); if (!l.rc) right = Math.round(right * k); }
    }
    return { left: left, right: right };
  }
  function applyWidths() {
    var l = settings.layout, w = effectiveWidths(), m = $('main');
    m.style.setProperty('--left', w.left + 'px'); m.style.setProperty('--right', w.right + 'px');
    if (l.lc) document.body.setAttribute('data-lc', ''); else document.body.removeAttribute('data-lc');
    if (l.rc) document.body.setAttribute('data-rc', ''); else document.body.removeAttribute('data-rc');
    var bd = $('blocklyDiv');
    if (l.bh) { bd.style.height = l.bh + 'px'; bd.style.maxHeight = 'none'; } else { bd.style.height = ''; bd.style.maxHeight = ''; }
    var tl = t(l.lc ? 'expandL' : 'collapseL'), tr = t(l.rc ? 'expandR' : 'collapseR'), both = l.lc && l.rc;
    $('colL').innerHTML = IC(l.lc ? 'chevR' : 'chevL'); $('colL').title = tl; $('colL').setAttribute('aria-label', tl);
    $('colR').innerHTML = IC(l.rc ? 'chevL' : 'chevR'); $('colR').title = tr; $('colR').setAttribute('aria-label', tr);
    $('maxBtn').innerHTML = IC(both ? 'shrink' : 'expand') + '<span>' + esc(t(both ? 'restoreBlocks' : 'maxBlocks')) + '</span>';
    if (ws) B.svgResize(ws);
    requestAnimationFrame(function () { if (ws) B.svgResize(ws); draw(); });
  }
  function setCollapsed(side, v) { if (side === 'L') settings.layout.lc = v; else settings.layout.rc = v; applyWidths(); saveSettings(); }
  function applyLayout() {
    var l = settings.layout;
    if (l.lc == null) { l.lc = false; l.rc = false; }
    applyWidths();
    document.body.setAttribute('data-code', l.code);
    applyCodeBoxes();
    document.documentElement.style.fontSize = (l.ui || 15) + 'px';
    $('codeMode').value = l.code;
    if (ws) { ws.setScale(l.scale || 0.9); B.svgResize(ws); }
    requestAnimationFrame(function () { if (ws) B.svgResize(ws); draw(); });
  }
  function applyCodeBoxes() {
    var l = settings.layout, home = isHome(STEPS[S.gi] && STEPS[S.gi].st), ino = l.code === 'ino' && home;
    $('boxPy').hidden = !(l.code === 'py' || l.code === 'both' || (l.code === 'ino' && !home));
    $('boxJs').hidden = !(l.code === 'js' || l.code === 'both');
    $('boxIno').hidden = !ino;
    $('codeTools').hidden = !home;
  }
  function chooseLayout(name) {
    var src = name === 'custom' ? settings.custom : PRESETS[name];
    if (!src) return;
    settings.layoutName = name; settings.layout = Object.assign({}, src);
    saveSettings(); applyLayout();
  }
  function initSplit(el, side) {
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('.splitbtn')) return;
      e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add('drag');
      var rect = $('main').getBoundingClientRect();
      function mv(ev) {
        var l = settings.layout, other = side === 'L' ? (l.rc ? RAIL : l.right) : (l.lc ? RAIL : l.left);
        var max = Math.max(200, rect.width - GUT - MID - other), v = side === 'L' ? ev.clientX - rect.left - 8 : rect.right - ev.clientX - 8;
        var col = v < 150;
        if (side === 'L') { l.lc = col; if (!col) l.left = clamp(Math.round(v), 200, max); }
        else { l.rc = col; if (!col) l.right = clamp(Math.round(v), 200, max); }
        applyWidths();
      }
      function up() { el.classList.remove('drag'); el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); saveSettings(); }
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
    el.addEventListener('keydown', function (e) {
      if (e.target.closest('.splitbtn')) return;
      var d = e.key === 'ArrowLeft' ? -20 : e.key === 'ArrowRight' ? 20 : 0; if (!d) return;
      e.preventDefault(); var l = settings.layout, grow = side === 'L' ? d : -d, key = side === 'L' ? 'left' : 'right', ck = side === 'L' ? 'lc' : 'rc';
      if (l[ck]) { if (grow > 0) l[ck] = false; }
      else { l[key] = clamp(l[key] + grow, 120, 1400); if (l[key] < 150) { l[ck] = true; l[key] = 200; } }
      applyWidths(); saveSettings();
    });
    el.addEventListener('dblclick', function (e) {
      if (e.target.closest('.splitbtn')) return;
      var base = (settings.layoutName === 'custom' ? settings.custom : PRESETS[settings.layoutName]) || PRESETS.default;
      if (side === 'L') { settings.layout.left = base.left; settings.layout.lc = false; } else { settings.layout.right = base.right; settings.layout.rc = false; }
      applyWidths(); saveSettings();
    });
  }
  function initHGrip() {
    var g = $('hgrip');
    g.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault(); g.setPointerCapture(e.pointerId); g.classList.add('drag');
      var y0 = e.clientY, h0 = $('blocklyDiv').getBoundingClientRect().height;
      function mv(ev) { settings.layout.bh = clamp(Math.round(h0 + ev.clientY - y0), 320, 2400); applyWidths(); }
      function up() { g.classList.remove('drag'); g.removeEventListener('pointermove', mv); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up); saveSettings(); }
      g.addEventListener('pointermove', mv); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
    });
    g.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowUp' ? -40 : e.key === 'ArrowDown' ? 40 : 0; if (!d) return;
      e.preventDefault(); settings.layout.bh = clamp(Math.round($('blocklyDiv').getBoundingClientRect().height + d), 320, 2400); applyWidths(); saveSettings();
    });
    g.addEventListener('dblclick', function () { settings.layout.bh = null; applyWidths(); saveSettings(); });
  }

  /* ---------- Blockly ---------- */
  function toolboxFor(st) {
    if (isHome(st)) { HB.ctx = st; return HB.toolbox(st); }
    return { kind: 'flyoutToolbox', contents: st.tools.map(function (tp) {
      if (tp === 'controls_repeat_ext') return { kind: 'block', type: tp, inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 3 } } } } };
      return { kind: 'block', type: tp };
    }) };
  }
  function refreshToolbox(st) { ws.updateToolbox({ kind: 'flyoutToolbox', contents: [] }); ws.updateToolbox(toolboxFor(st)); }
  function injectWs() {
    RB.setLang(S.lang);
    ws = B.inject('blocklyDiv', {
      toolbox: toolboxFor(STEPS[0].st), renderer: 'zelos', theme: isDark() ? darkTheme : lightTheme, media: 'lib/media/',
      trashcan: true, maxTrashcanContents: 0, sounds: false, zoom: { controls: true, wheel: true, startScale: settings.layout.scale || 0.9, minScale: 0.5, maxScale: 1.8 },
      move: { scrollbars: true, drag: true, wheel: false }, grid: { spacing: 28, length: 2, colour: 'rgba(128,140,160,.35)', snap: true }
    });
    ws.addChangeListener(onWsChange);
    trashEl = document.createElement('div'); trashEl.className = 'trashmark'; trashEl.setAttribute('aria-hidden', 'true');
    trashEl.innerHTML = IC('trash') + '<span>' + esc(t('trashHint')) + '</span>';
    ws.getInjectionDiv().appendChild(trashEl);
    if (window.ResizeObserver) new ResizeObserver(function () { B.svgResize(ws); }).observe($('blocklyDiv'));
  }
  /* Blok sürüklenirken blok menüsünün üstünde çöp kutusu filigranı görünür; blok oraya bırakılırsa silinir */
  var trashEl = null, dragActive = false, dragEnd = 0;
  function trashLoop() {
    if (!dragActive || !trashEl) return;
    trashEl.classList.toggle('hot', !!document.querySelector('.blocklyDraggingDelete'));
    requestAnimationFrame(trashLoop);
  }
  function onDrag(start) {
    if (!trashEl) return;
    if (start) {
      var fl = ws.getFlyout && ws.getFlyout(), w = fl && fl.isVisible() ? fl.getWidth() : 0;
      trashEl.style.width = Math.max(90, w) + 'px';
      dragActive = true; trashEl.classList.add('on'); requestAnimationFrame(trashLoop);
    } else { dragActive = false; dragEnd = Date.now(); trashEl.classList.remove('on', 'hot'); }
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
    if (e.type === B.Events.BLOCK_DRAG) onDrag(!!e.isStart);
    if (e.type === B.Events.BLOCK_DELETE && (dragActive || Date.now() - dragEnd < 400)) SND.play('trash');
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
    S.robot = robotOf(p); setChip();
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
      return '<div class="pwrap"><button class="pbtn" type="button" data-id="' + esc(p.id) + '"' + last + '><span class="av"><img src="' + R.avatar(robotOf(p), 96) + '" alt=""></span>' +
        '<span class="nm">' + esc(p.name) + '</span><small>★ ' + total + '</small></button>' +
        (manage ? '<button class="pdel" type="button" data-del="' + esc(p.id) + '">' + esc(t('del')) + '</button>' : '') + '</div>';
    }).join('');
    $('manageBtn').hidden = !list.length;
    $('manageBtn').textContent = manage ? t('done') : t('manage');
    $('delConfirm').hidden = !pendingDel;
  }
  function openProfiles() {
    manage = false; pendingDel = null; pickNew = 'afi'; $('roboPick').removeAttribute('data-touched'); renderRoboPick('roboPick', pickNew);
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
    var cur = STEPS[gi], saved = S.pdata.ws[cur.st.id], prevCi = S.lastCi;
    S.pdata.last = cur.st.id; savePdata(); S.lastCi = cur.ci;
    if (isHome(cur.st)) HB.ctx = cur.st;
    if (cur.st.board && cur.st.board !== settings.board) { settings.board = cur.st.board; saveSettings(); $('boardSel').value = settings.board; }
    if (cur.ch.view && prevCi !== cur.ci && settings.layout.code !== 'blocks') { settings.layout.code = cur.ch.view; saveSettings(); applyLayout(); }
    B.Events.disable();
    try {
      ws.clear(); refreshToolbox(cur.st);
      if (saved) { try { B.serialization.workspaces.load(saved, ws); } catch (e) { ws.clear(); } }
      else if (cur.st.starter && isHome(cur.st)) { try { B.serialization.workspaces.load(HB.solution({ sol: cur.st.starter }), ws); } catch (e) { ws.clear(); } }
      else if (cur.st.starter) B.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: [{ type: 'robot_ileri', x: 40, y: 40 }] } }, ws);
    } finally { B.Events.enable(); }
    ws.scrollCenter();
    renderAll();
    setStatus(isHome(cur.st) ? t('st_h_ready') : cur.st.starter && !saved ? t('st_first') : t('st_ready'));
    if (!opt.noStory && !S.pdata.seen[cur.ch.id]) { S.pdata.seen[cur.ch.id] = true; savePdata(); openStory(cur.ch); }
  }

  function renderAll() { renderTop(); renderTask(); resetView(); applyCodeBoxes(); updateCode(); showConcept(); }

  function bubbleHTML(s, sug) {
    var stars = starsOf(s.gi), cls = 'bub' + (stars ? ' done' : '') + (s.gi === sug ? ' sug' : '');
    var label = t('step') + ' ' + (s.si + 1) + ': ' + (stars ? t('stars' + stars) : t('notDone')) + (s.gi === sug ? ', ' + t('suggested') : '');
    return '<button class="' + cls + '" type="button" data-gi="' + s.gi + '" aria-current="' + (s.gi === S.gi) + '" aria-label="' + esc(label) + '" title="' + esc(label) + '">' + (s.si + 1) + '</button>';
  }
  function renderTop() {
    var cur = STEPS[S.gi], sug = suggestedIdx();
    $('whereTitle').innerHTML = roomIc(cur.ch) + esc(t('chapter') + ' ' + cur.ch.num + ' · ' + L(cur.ch.name) + ' — ' + L(cur.ls.title));
    $('whereSub').textContent = t('lesson') + ' ' + cur.ch.num + '.' + (cur.li + 1) + ' · ' + L((C.tiers || {})[cur.ls.tier || 'easy'] || { tr: '' }) + ' · ' + t('step') + ' ' + (cur.si + 1) + ' / ' + cur.ls.steps.length;
    $('bubbles').innerHTML = STEPS.filter(function (s) { return s.ci === cur.ci && s.li === cur.li; }).map(function (s) { return bubbleHTML(s, sug); }).join('');
    $('prevBtn').disabled = S.gi === 0;
    $('nextBtn').disabled = S.gi === STEPS.length - 1;
  }
  function renderTask() {
    var cur = STEPS[S.gi], st = cur.st;
    $('concept').innerHTML = roomIc(cur.ch) + esc(t('chapter') + ' ' + cur.ch.num + ' · ' + L(cur.ch.concept));
    $('taskTitle').innerHTML = esc(L(cur.ls.title) + ' · ' + t('step') + ' ' + (cur.si + 1)) + ' ' + tierChip(cur.ls.tier);
    $('taskText').innerHTML = IC('chat') + esc(L(st.text));
    $('taskGoal').innerHTML = IC('target') + esc(L(st.goal));
    $('maxB').textContent = st.max;
    renderVariant();
    $('solutionBtn').hidden = !S.teacher;
    $('teacherBadge').hidden = !S.teacher;
  }
  function nVariants(st) { return isHome(st) ? st.scen.length : E.variantsOf(st).length; }
  function renderVariant() {
    var st = STEPS[S.gi].st, nv = nVariants(st);
    $('variantBox').hidden = nv < 2;
    $('variantLabel').innerHTML = esc(isHome(st) ? t('h_variantNote', { m: nv }) : t('variantNote')) + ' <b>' + esc(t('variantLabel', { n: S.vi + 1, m: nv })) + '</b>';
  }

  /* ---------- Kod paneli ---------- */
  var KW = { py: ['for', 'in', 'range', 'while', 'not', 'if', 'else', 'elif', 'from', 'import', 'pass', 'True', 'False', 'def', 'global', 'and', 'or'],
    js: ['for', 'var', 'while', 'if', 'else', 'let', 'const', 'true', 'false', 'function'],
    ino: ['for', 'while', 'if', 'else', 'const', 'true', 'false', 'void', 'int', 'long', 'float', 'bool', 'byte', 'unsigned', 'return', 'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', '#include'] };
  function colorize(src, lang) {
    var kw = KW[lang], kwRe = new RegExp('(^|[^\\w#])(' + kw.join('|') + ')\\b', 'g');
    return src.split('\n').map(function (line) {
      var m = line.match(lang === 'py' ? /^(\s*)(#.*)$/ : /^(\s*)(\/\/.*)$/);
      if (!m && lang !== 'py') { var mm = line.match(/^(.*?)(\s\/\/.*)$/); if (mm && mm[1].indexOf('"') < 0) return colorize(mm[1], lang) + '<span class="cm">' + esc(mm[2]) + '</span>'; }
      if (m) return m[1] + '<span class="cm">' + esc(m[2]) + '</span>';
      var out = esc(line);
      out = out.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
      out = out.replace(/\b([A-Za-z_][A-Za-z0-9_]*)(?=\()/g, function (w, n) { return kw.indexOf(n) >= 0 ? w : '<span class="fn">' + n + '</span>'; });
      out = out.replace(kwRe, '$1<span class="kw">$2</span>');
      return out;
    }).join('\n');
  }
  function updateCode() {
    var st = STEPS[S.gi].st;
    if (isHome(st)) {
      HB.ctx = st;
      var hjs = HB.toJS(ws);
      $('codePy').innerHTML = colorize(HB.toPython(ws), 'py');
      $('codeJs').innerHTML = colorize(t('jsHeader') + '\n' + (hjs || t('noBlocksJs')), 'js');
      if (!$('boxIno').hidden) $('codeIno').innerHTML = colorize(HB.toIno(ws, st, settings.board), 'ino');
    } else {
      var py = RB.toPython(ws).trim(), js = RB.toJS(ws).trim();
      $('codePy').innerHTML = colorize(t('pyHeader') + '\n' + (py || t('noBlocksPy')), 'py');
      $('codeJs').innerHTML = colorize(t('jsHeader') + '\n' + (js || t('noBlocksJs')), 'js');
    }
    var n = countBlocks(); $('used').textContent = n;
    $('used').className = n > STEPS[S.gi].st.max ? 'over' : '';
  }

  /* ---------- Açıklama paneli ---------- */
  function showConcept() {
    var cur = STEPS[S.gi];
    $('explain').innerHTML = '<div class="eyebrow">' + IC('bulb') + esc(t('thisTopic')) + '</div><h3>' + esc(L(cur.ch.concept)) + ' · ' + esc(L(cur.ls.title)) + '</h3>' +
      '<p>' + esc(t('explainHint')) + '</p><div class="lifebox">' + IC('home') + '<b>' + esc(t('inLife')) + '</b>' + esc(L(cur.ch.life)) + '</div>' +
      (SUI && cur.ch.sensors && cur.ch.sensors.length ? '<div class="eyebrow">' + IC('chip') + esc(t('s_chapterSensors')) + '</div><div class="schips">' + SUI.chips(cur.ch.sensors) + '</div>' : '');
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
    var home = isHome(STEPS[S.gi].st), sn = home ? { py: HB.snippet(b, 'py'), js: HB.snippet(b, 'js') } : snippets(b), cond = '';
    if (!home && (b.type === 'robot_if' || b.type === 'robot_ifelse')) cond = '<p>' + t('condNote', { q: esc(B.Msg['ROBOT_C_' + b.getFieldValue('COND')] || '') }) + '</p>';
    $('explain').innerHTML = '<div class="eyebrow">' + IC('code') + esc(t('selected')) + '</div><h3>' + esc(info.name) + '</h3>' +
      '<div class="pair"><span>Python</span><div class="snippet">' + colorize(sn.py, 'py') + '</div>' +
      '<span>JS</span><div class="snippet">' + colorize(sn.js, 'js') + '</div></div>' +
      '<p>' + info.text + '</p>' + cond + '<div class="lifebox">' + IC('home') + '<b>' + esc(t('inLife')) + '</b>' + esc(info.life) + '</div>';
  }

  /* ---------- Sahne çizimi ---------- */
  var cv = $('stage'), ctx = cv.getContext('2d');
  function tok(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function resetView() {
    var st = STEPS[S.gi].st;
    cv.classList.toggle('home', isHome(st));
    cv.style.aspectRatio = isHome(st) ? '1 / ' + HS.aspect(st).toFixed(3) : '';
    if (isHome(st)) {
      grid = null;
      var nsc = H.normalize(st.scen[S.vi]);
      view = { home: true, tm: 0, res: null, chk: null, nsc: nsc, marks: H.eventMarks(nsc, st.events || []) };
      draw(); return;
    }
    grid = E.parseMap(E.variantsOf(st)[S.vi]);
    view = { x: grid.start.x, y: grid.start.y, a: st.dir * 90, lit: {}, opened: {}, shake: 0, flash: 0, miss: 0 };
    draw();
  }
  function fitCanvas() {
    var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1, s = Math.max(200, Math.round(r.width * d));
    var hh = view && view.home ? Math.round(s * HS.aspect(STEPS[S.gi].st)) : s;
    if (cv.width !== s || cv.height !== hh) { cv.width = s; cv.height = hh; }
  }
  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  /* Zemin: her kare ayrı bir karo; aralarında derz boşluğu var, böylece adımlar kolayca sayılır */
  function drawTile(room, x, y, px, py, ts, K) {
    var g = ts * 0.05, r = ts * 0.14, a = K[room + 'a'], b = K[room + 'b'];
    if (room === 'mutfak' && (x + y) % 2) { var tmp = a; a = b; b = tmp; }
    ctx.fillStyle = b; rr(px + g, py + g, ts - 2 * g, ts - 2 * g, r); ctx.fill();
    ctx.fillStyle = a; rr(px + g, py + g, ts - 2 * g, ts - 2 * g - ts * 0.06, r); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(px + g * 2.2, py + g * 1.8, ts - 4.4 * g, ts * 0.07, ts * 0.035); ctx.fill();
    if (room === 'salon') {
      ctx.strokeStyle = 'rgba(120,80,40,.10)'; ctx.lineWidth = Math.max(1, ts * 0.018);
      [0.38, 0.62].forEach(function (k) { ctx.beginPath(); ctx.moveTo(px + ts * 0.2, py + ts * k); ctx.quadraticCurveTo(px + ts * 0.5, py + ts * (k - 0.05), px + ts * 0.8, py + ts * k); ctx.stroke(); });
    }
  }
  function shade(a) { return a > 0 ? 'rgba(255,255,255,' + a + ')' : 'rgba(0,0,0,' + (-a) + ')'; }
  function drawFurniture(f, x, y, px, py, ts, K) {
    var cx = px + ts / 2, cy = py + ts / 2, g = ts * 0.09;
    ctx.fillStyle = 'rgba(0,0,0,.16)'; rr(px + g, py + g * 1.7, ts - 2 * g, ts - 2.2 * g, ts * 0.16); ctx.fill();
    if (f === 'K') {           /* koltuk: sırtlık, kolçaklar, iki minder, yastık */
      ctx.fillStyle = K.sofa; rr(px + g, py + g, ts - 2 * g, ts - 2.4 * g, ts * 0.16); ctx.fill();
      ctx.fillStyle = shade(-0.18); rr(px + g, py + g, ts - 2 * g, ts * 0.3, ts * 0.14); ctx.fill();
      ctx.fillStyle = shade(-0.12); rr(px + g, py + g, ts * 0.17, ts - 2.4 * g, ts * 0.1); ctx.fill(); rr(px + ts - g - ts * 0.17, py + g, ts * 0.17, ts - 2.4 * g, ts * 0.1); ctx.fill();
      ctx.fillStyle = shade(0.2); rr(px + ts * 0.28, py + ts * 0.4, ts * 0.21, ts * 0.38, ts * 0.07); ctx.fill(); rr(px + ts * 0.51, py + ts * 0.4, ts * 0.21, ts * 0.38, ts * 0.07); ctx.fill();
      ctx.save(); ctx.translate(px + ts * 0.34, py + ts * 0.33); ctx.rotate(-0.35);
      ctx.fillStyle = '#FFC93C'; rr(-ts * 0.08, -ts * 0.08, ts * 0.16, ts * 0.16, ts * 0.04); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(0, 0, ts * 0.025, 0, 7); ctx.fill(); ctx.restore();
    } else if (f === 'M') {    /* yuvarlak masa: tabak, elma, bardak */
      ctx.fillStyle = shade(-0.2); ctx.beginPath(); ctx.arc(cx, cy + ts * 0.04, ts * 0.4, 0, 7); ctx.fill();
      ctx.fillStyle = K.table; ctx.beginPath(); ctx.arc(cx, cy, ts * 0.4, 0, 7); ctx.fill();
      ctx.strokeStyle = shade(0.16); ctx.lineWidth = ts * 0.03; ctx.beginPath(); ctx.arc(cx, cy, ts * 0.31, 0, 7); ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx - ts * 0.08, cy + ts * 0.02, ts * 0.15, 0, 7); ctx.fill();
      ctx.fillStyle = '#E6EBF1'; ctx.beginPath(); ctx.arc(cx - ts * 0.08, cy + ts * 0.02, ts * 0.1, 0, 7); ctx.fill();
      ctx.fillStyle = '#E5484D'; ctx.beginPath(); ctx.arc(cx - ts * 0.08, cy + ts * 0.03, ts * 0.065, 0, 7); ctx.fill();
      ctx.fillStyle = '#3E9B5F'; ctx.beginPath(); ctx.ellipse(cx - ts * 0.05, cy - ts * 0.045, ts * 0.035, ts * 0.018, -0.6, 0, 7); ctx.fill();
      ctx.fillStyle = '#8FD3FF'; ctx.beginPath(); ctx.arc(cx + ts * 0.18, cy - ts * 0.12, ts * 0.06, 0, 7); ctx.fill();
      ctx.strokeStyle = '#8FD3FF'; ctx.lineWidth = ts * 0.022; ctx.beginPath(); ctx.arc(cx + ts * 0.25, cy - ts * 0.12, ts * 0.03, -1.4, 1.4); ctx.stroke();
    } else if (f === 'B') {    /* gülen saksı ve yapraklar */
      ctx.fillStyle = K.plant;
      [[-2.5, 0.27], [-2.0, 0.3], [-1.57, 0.32], [-1.15, 0.3], [-0.65, 0.27]].forEach(function (l) {
        ctx.save(); ctx.translate(cx, cy + ts * 0.05); ctx.rotate(l[0] + Math.PI / 2);
        ctx.beginPath(); ctx.ellipse(0, -ts * l[1] / 2 - ts * 0.04, ts * 0.075, ts * l[1] / 2, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = shade(0.25); ctx.lineWidth = ts * 0.012; ctx.beginPath(); ctx.moveTo(0, -ts * 0.06); ctx.lineTo(0, -ts * l[1]); ctx.stroke();
        ctx.restore();
      });
      ctx.fillStyle = '#FF8FB1'; [0, 1.26, 2.51, 3.77, 5.03].forEach(function (a) { ctx.beginPath(); ctx.arc(cx + ts * 0.2 + Math.cos(a) * ts * 0.04, cy - ts * 0.22 + Math.sin(a) * ts * 0.04, ts * 0.035, 0, 7); ctx.fill(); });
      ctx.fillStyle = '#FFD54A'; ctx.beginPath(); ctx.arc(cx + ts * 0.2, cy - ts * 0.22, ts * 0.025, 0, 7); ctx.fill();
      ctx.fillStyle = K.pot; ctx.beginPath(); ctx.moveTo(cx - ts * 0.19, cy + ts * 0.08); ctx.lineTo(cx + ts * 0.19, cy + ts * 0.08); ctx.lineTo(cx + ts * 0.14, cy + ts * 0.4); ctx.lineTo(cx - ts * 0.14, cy + ts * 0.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(-0.15); rr(cx - ts * 0.21, cy + ts * 0.05, ts * 0.42, ts * 0.08, ts * 0.03); ctx.fill();
      ctx.fillStyle = '#3A2A20'; ctx.beginPath(); ctx.arc(cx - ts * 0.06, cy + ts * 0.21, ts * 0.025, 0, 7); ctx.arc(cx + ts * 0.06, cy + ts * 0.21, ts * 0.025, 0, 7); ctx.fill();
      ctx.strokeStyle = '#3A2A20'; ctx.lineWidth = ts * 0.018; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy + ts * 0.25, ts * 0.045, 0.3, Math.PI - 0.3); ctx.stroke();
    } else if (f === 'T') {    /* tezgâh: sırayla ocak ve evye */
      ctx.fillStyle = K.counter; rr(px + g * 0.5, py + g * 0.5, ts - g, ts - g * 1.3, ts * 0.08); ctx.fill();
      ctx.fillStyle = shade(0.2); rr(px + g * 0.5, py + g * 0.5, ts - g, ts * 0.12, ts * 0.06); ctx.fill();
      if ((x + y) % 2) {
        [[-0.17, -0.1], [0.17, 0.14]].forEach(function (o) {
          ctx.fillStyle = '#2B3440'; ctx.beginPath(); ctx.arc(cx + ts * o[0], cy + ts * o[1], ts * 0.15, 0, 7); ctx.fill();
          ctx.strokeStyle = '#E5484D'; ctx.lineWidth = ts * 0.025; ctx.beginPath(); ctx.arc(cx + ts * o[0], cy + ts * o[1], ts * 0.09, 0, 7); ctx.stroke();
        });
      } else {
        ctx.fillStyle = '#B9C8D6'; rr(cx - ts * 0.28, cy - ts * 0.16, ts * 0.56, ts * 0.42, ts * 0.1); ctx.fill();
        ctx.fillStyle = '#9DB0C2'; rr(cx - ts * 0.22, cy - ts * 0.1, ts * 0.44, ts * 0.3, ts * 0.08); ctx.fill();
        ctx.fillStyle = '#E6EBF1'; ctx.beginPath(); ctx.arc(cx, cy - ts * 0.26, ts * 0.05, 0, 7); ctx.fill(); rr(cx - ts * 0.02, cy - ts * 0.26, ts * 0.04, ts * 0.14, ts * 0.02); ctx.fill();
      }
    }
  }
  function drawDoor(px, py, ts, open, K, horiz) {
    var cx = px + ts / 2, cy = py + ts / 2;
    ctx.save(); ctx.translate(cx, cy); if (!horiz) ctx.rotate(Math.PI / 2);
    /* çizim: geçit yatay, kapı dikey duruyor */
    ctx.fillStyle = shade(-0.25); ctx.fillRect(-ts * 0.08, -ts * 0.5, ts * 0.16, ts * 0.1); ctx.fillRect(-ts * 0.08, ts * 0.4, ts * 0.16, ts * 0.1);
    if (!open) {
      ctx.fillStyle = K.door; rr(-ts * 0.15, -ts * 0.44, ts * 0.3, ts * 0.88, ts * 0.06); ctx.fill();
      ctx.fillStyle = shade(0.16); rr(-ts * 0.1, -ts * 0.37, ts * 0.2, ts * 0.32, ts * 0.04); ctx.fill(); rr(-ts * 0.1, ts * 0.05, ts * 0.2, ts * 0.32, ts * 0.04); ctx.fill();
      ctx.fillStyle = '#FFC93C'; ctx.beginPath(); ctx.arc(ts * 0.08, 0, ts * 0.045, 0, 7); ctx.fill();
    } else {
      ctx.strokeStyle = shade(-0.18); ctx.lineWidth = ts * 0.02; ctx.setLineDash([ts * 0.04, ts * 0.04]);
      ctx.beginPath(); ctx.arc(0, -ts * 0.42, ts * 0.42, Math.PI / 2 - 0.05, Math.PI / 2 + Math.PI / 2 * 0.95); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = K.door; rr(-ts * 0.46, -ts * 0.46, ts * 0.42, ts * 0.12, ts * 0.04); ctx.fill();
    }
    ctx.restore();
  }
  function drawLamp(px, py, ts, lit, K) {
    var cx = px + ts / 2, cy = py + ts / 2;
    if (lit) {
      var grd = ctx.createRadialGradient(cx, cy, ts * 0.05, cx, cy, ts * 0.75);
      grd.addColorStop(0, 'rgba(255,214,110,.95)'); grd.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, ts * 0.75, 0, 7); ctx.fill();
      ctx.strokeStyle = '#FFB938'; ctx.lineWidth = ts * 0.035; ctx.lineCap = 'round';
      for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * ts * 0.27, cy - ts * 0.04 + Math.sin(a) * ts * 0.27); ctx.lineTo(cx + Math.cos(a) * ts * 0.36, cy - ts * 0.04 + Math.sin(a) * ts * 0.36); ctx.stroke(); }
    } else {
      ctx.strokeStyle = K.lamp; ctx.lineWidth = Math.max(2, ts * 0.035);
      ctx.setLineDash([ts * 0.06, ts * 0.05]); ctx.beginPath(); ctx.arc(cx, cy, ts * 0.3, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle = lit ? '#FFD54A' : '#C3CAD4'; ctx.beginPath(); ctx.arc(cx, cy - ts * 0.04, ts * 0.15, 0, 7); ctx.fill();
    ctx.fillStyle = '#8A94A3'; rr(cx - ts * 0.075, cy + ts * 0.09, ts * 0.15, ts * 0.12, ts * 0.03); ctx.fill();
    ctx.strokeStyle = '#6F7B8E'; ctx.lineWidth = ts * 0.015; ctx.beginPath(); ctx.moveTo(cx - ts * 0.075, cy + ts * 0.13); ctx.lineTo(cx + ts * 0.075, cy + ts * 0.13); ctx.moveTo(cx - ts * 0.075, cy + ts * 0.17); ctx.lineTo(cx + ts * 0.075, cy + ts * 0.17); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(cx - ts * 0.05, cy - ts * 0.09, ts * 0.04, 0, 7); ctx.fill();
  }
  function homeTokens() {
    return { bg: tok('--bg'), panel: tok('--panel'), panel2: tok('--panel-2'), line: tok('--line'), ink: tok('--ink'), ink2: tok('--ink-2'), ink3: tok('--ink-3'),
      accent: tok('--accent'), accentSoft: tok('--accent-soft'), ok: tok('--ok'), okInk: tok('--ok'), bad: tok('--bad'), badSoft: tok('--bad-soft'),
      lamp: tok('--lamp'), glow: tok('--lamp-glow'), glowSoft: tok('--glow-soft'), off: tok('--off'), robot: tok('--robot'), eye: tok('--robot-eye'),
      door: tok('--door'), sky: tok('--sky'), glass: tok('--glass'), expect: tok('--expect'), hat: tok('--hat'), varBg: '#A55B80', varInk: '#FFFFFF' };
  }
  function drawHome() {
    fitCanvas();
    var st = STEPS[S.gi].st;
    HS.draw(ctx, cv.width, cv.height, { step: st, nsc: view.nsc, res: view.res, chk: view.chk, tm: view.tm, K: homeTokens(), lang: S.lang, t: t,
      anim: (window.performance ? performance.now() : Date.now()) / 1000, vi: S.vi, nv: st.scen.length, marks: view.marks, robot: S.robot });
  }
  function draw() {
    if (view && view.home) { drawHome(); return; }
    if (!grid || !view) return;
    fitCanvas();
    var W = cv.width, n = Math.max(grid.w, grid.h), pad = W * 0.07;
    var ts = (W - pad * 2) / n, ox = pad + (n - grid.w) * ts / 2, oy = pad + (n - grid.h) * ts / 2;
    var room = STEPS[S.gi].ch.room;
    var K = { wall: tok('--wall'), salona: tok('--salon-a'), salonb: tok('--salon-b'), koridora: tok('--koridor-a'), koridorb: tok('--koridor-b'),
      mutfaka: tok('--mutfak-a'), mutfakb: tok('--mutfak-b'), lamp: tok('--lamp'), glow: tok('--lamp-glow'), robot: tok('--robot'), eye: tok('--robot-eye'),
      sofa: tok('--sofa'), table: tok('--table'), plant: tok('--plant'), pot: tok('--pot'), counter: tok('--counter'), door: tok('--door'), bad: tok('--bad'), line: tok('--line'), edge: tok('--room-edge') };
    ctx.clearRect(0, 0, W, W); ctx.fillStyle = K.wall; ctx.fillRect(0, 0, W, W);
    var x, y, px, py, e = ts * 0.1;
    function occ(x, y) { return grid.cells[y][x] || grid.furn[y][x]; }
    /* oda duvarı ve derz rengi */
    ctx.fillStyle = K.edge;
    for (y = 0; y < grid.h; y++) for (x = 0; x < grid.w; x++) if (occ(x, y)) { rr(ox + x * ts - e, oy + y * ts - e, ts + 2 * e, ts + 2 * e, e * 1.4); ctx.fill(); }
    for (y = 0; y < grid.h; y++) for (x = 0; x < grid.w; x++) if (occ(x, y)) {
      px = ox + x * ts; py = oy + y * ts;
      ctx.fillStyle = K[room + 'b']; ctx.fillRect(px - 0.5, py - 0.5, ts + 1, ts + 1);
      ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(px - 0.5, py - 0.5, ts + 1, ts + 1);
    }
    for (y = 0; y < grid.h; y++) for (x = 0; x < grid.w; x++) if (occ(x, y)) drawTile(room, x, y, ox + x * ts, oy + y * ts, ts, K);
    for (y = 0; y < grid.h; y++) for (x = 0; x < grid.w; x++) {
      px = ox + x * ts; py = oy + y * ts;
      var c = grid.cells[y][x], f = grid.furn[y][x];
      if (f) drawFurniture(f, x, y, px, py, ts, K);
      if (c === 3) {
        var horiz = (x > 0 && grid.cells[y][x - 1] > 0) || (x < grid.w - 1 && grid.cells[y][x + 1] > 0);
        drawDoor(px, py, ts, !!view.opened[x + ',' + y], K, horiz);
      }
      if (c === 2) drawLamp(px, py, ts, !!view.lit[x + ',' + y], K);
    }
    var rx = ox + view.x * ts + ts / 2 + Math.sin(view.shake * 40) * view.shake * ts * 0.25, ry = oy + view.y * ts + ts / 2;
    if (view.miss > 0) { ctx.strokeStyle = K.bad; ctx.lineWidth = ts * 0.06; ctx.globalAlpha = view.miss; ctx.beginPath(); ctx.arc(rx, ry, ts * 0.46, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    window.ROBOTS.draw(ctx, S.robot, rx, ry, ts * 0.8, { angle: view.a, flash: view.flash });
  }
  if (window.ResizeObserver) new ResizeObserver(function () { draw(); }).observe(cv);

  /* ---------- Çalıştırma ---------- */
  function setStatus(txt, kind) {
    var s = $('status'), icn = kind === 'ok' ? 'check' : kind === 'bad' ? 'alert' : S.running ? 'play' : 'info';
    s.innerHTML = IC(icn) + '<span>' + esc(txt) + '</span>';
    if (kind) s.setAttribute('data-kind', kind); else s.removeAttribute('data-kind');
  }
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
  function speedHome() { return [0, 1000, 720, 500, 320, 170][+$('speed').value] || 500; }
  function playHome(res, end) {
    return new Promise(function (resolve) {
      var ms = speedHome(), t0 = null, lastId = null;
      if (reduce) { view.tm = end; draw(); return resolve(true); }
      function frame(now) {
        if (S.cancel) { resolve(false); return; }
        if (t0 == null) t0 = now;
        view.tm = Math.min(end, (now - t0) / ms);
        var a = null; view.res.actions.forEach(function (x) { if (x.t <= view.tm + 1e-9) a = x; });
        var id = a && a.block && view.tm - a.t < 1.2 ? a.block : null;
        if (id !== lastId) { ws.highlightBlock(id); lastId = id; }
        draw();
        if (view.tm >= end) resolve(true); else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }
  async function runHome() {
    var gi = S.gi, st = STEPS[gi].st;
    var tops = ws.getTopBlocks(false).filter(function (b) { return !b.isShadow(); });
    if (!tops.length) { setStatus(t('st_needBlock'), 'bad'); return; }
    var loose = HB.looseBlocks(ws);
    if (loose.length) { ws.highlightBlock(loose[0].id); S.failBlock = loose[0].id; setStatus(t(tops.length === loose.length ? 'st_h_noHat' : 'st_h_loose'), 'bad'); return; }
    ws.highlightBlock(null); S.failBlock = null;
    HB.ctx = st;
    var results = H.runAll(st, HB.runCode(ws));
    var fail = -1; for (var i = 0; i < results.length; i++) if (!results[i].check.ok) { fail = i; break; }
    var show = fail >= 0 ? fail : S.vi;
    S.vi = show; renderVariant(); resetView();
    var res = results[show]; view.res = res; view.chk = res.check;
    var f = res.check.fail, end = res.outcome !== 'done' ? 0 : f ? Math.min(res.dur, f.t + 0.75) : res.dur;
    S.running = true; S.cancel = false; setRunBtn(); setStatus(t('st_h_running'));
    var anim = setInterval(function () { if (!S.running) clearInterval(anim); }, 1000);
    var finished = await playHome(res, end);
    S.running = false; S.cancel = false; setRunBtn();
    if (gi !== S.gi) return;
    if (!finished) { ws.highlightBlock(null); setStatus(t('st_stopped')); return; }
    if (res.outcome === 'loop') { setStatus(t('st_h_loop'), 'bad'); failFx(); return; }
    if (res.outcome === 'error') { setStatus(t('st_h_error', { e: res.err || '' }), 'bad'); failFx(); return; }
    if (fail >= 0 && f) {
      var last = null; res.actions.forEach(function (x) { if (x.dev === f.dev && x.t <= f.t + 0.5) last = x; });
      if (last && last.block) { ws.highlightBlock(last.block); S.failBlock = last.block; } else ws.highlightBlock(null);
      var dn = L(H.DEVICES[f.dev].name);
      setStatus((results.length > 1 ? t('st_variantFail', { n: show + 1 }) : '') + t('st_h_fail', { t: f.t, dev: dn, want: HS.stateText(f.dev, f.want, S.lang), got: HS.stateText(f.dev, f.got, S.lang) }), 'bad');
      failFx(); return;
    }
    ws.highlightBlock(null);
    var n = countBlocks(), stars = n <= st.max ? 3 : (n <= st.max + 2 ? 2 : 1), had = S.pdata.stars[st.id] || 0;
    S.pdata.stars[st.id] = Math.max(had, stars); savePdata(); renderTop();
    setStatus(results.length > 1 ? t('st_h_successAll', { m: results.length }) : t('st_h_success', { n: res.dur }), 'ok');
    openWin(n, stars, st.max, had);
  }
  async function run() {
    if (S.running) { S.cancel = true; return; }
    if (isHome(STEPS[S.gi].st)) return runHome();
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
      failFx(); return;
    }
    ws.highlightBlock(null);
    var n = countBlocks(), stars = n <= st.max ? 3 : (n <= st.max + 2 ? 2 : 1), had = S.pdata.stars[st.id] || 0;
    S.pdata.stars[st.id] = Math.max(had, stars); savePdata(); renderTop();
    setStatus(results.length > 1 ? t('st_successAll', { m: results.length }) : t('st_success'), 'ok');
    openWin(n, stars, st.max, had);
  }
  function failFx() { SND.play('fail'); SND.say(sayOne('sayFail'), S.lang, 450); }
  function confetti() {
    if (reduce) return;
    var box = document.createElement('div'), cols = ['#F5A524', '#2563C9', '#22A06B', '#E5484D', '#8B6FD6', '#FF8FB1'];
    box.className = 'confetti';
    for (var i = 0; i < 60; i++) {
      var c = document.createElement('i');
      c.style.left = (Math.random() * 100) + '%'; c.style.background = cols[i % cols.length];
      c.style.animationDelay = (Math.random() * 0.8) + 's'; c.style.animationDuration = (2 + Math.random() * 1.4) + 's';
      c.style.transform = 'rotate(' + Math.round(Math.random() * 360) + 'deg)';
      box.appendChild(c);
    }
    document.body.appendChild(box); setTimeout(function () { box.remove(); }, 4200);
  }
  function openWin(n, stars, max, had) {
    $('winTitle').textContent = isHome(STEPS[S.gi].st) ? t('winTitleHome') : t('winTitle');
    $('winStars').innerHTML = [1, 2, 3].map(function (k) { return k <= stars ? '★' : '<span class="off">★</span>'; }).join('');
    var txt = n <= max ? t('winGood', { n: n, max: max }) : t('winLong', { n: n, max: max }), nx = S.gi + 1;
    var ci = STEPS[S.gi].ci, chDone = !had && STEPS.every(function (s) { return s.ci !== ci || starsOf(s.gi); }),
      allDone = !had && STEPS.every(function (s) { return starsOf(s.gi); });
    if (nx >= STEPS.length) { $('winNext').hidden = true; txt += ' ' + t('courseDone'); }
    else { $('winNext').hidden = false; $('winNext').textContent = STEPS[nx].ci !== STEPS[S.gi].ci ? t('nextChapter') : t('next'); }
    if (chDone && !allDone) txt = t('chapterDone') + ' ' + txt;
    if (allDone && nx < STEPS.length) txt += ' ' + t('courseDone');
    $('winText').textContent = txt;
    $('winRobot').src = R.avatar(S.robot, 168);
    if (allDone) { SND.play('course'); SND.say(sayOne('sayCourse'), S.lang, 1300); }
    else if (chDone) { SND.play('chapter'); SND.say(sayOne('sayChapter'), S.lang, 1200); }
    else { SND.play('win' + stars); SND.say(sayOne('say' + stars), S.lang, 650); }
    if (stars === 3 || chDone) confetti();
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
    $('storyEyebrow').innerHTML = IC('book') + esc(t('chapter') + ' ' + ch.num + ' · ' + L(ch.concept));
    $('storyTitle').textContent = L(ch.name);
    $('storyText').textContent = L(ch.story);
    $('storyLife').textContent = L(ch.life);
    $('storyRobot').src = R.avatar(S.robot, 144);
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
      var lessons = ['easy', 'mid', 'hard'].map(function (tr) {
        var lis = []; ch.lessons.forEach(function (ls, li) { if ((ls.tier || 'easy') === tr) lis.push([ls, li]); });
        if (!lis.length) return '';
        var ts = steps.filter(function (s) { return (s.ls.tier || 'easy') === tr; }), td = ts.filter(function (s) { return starsOf(s.gi); }).length;
        return '<div class="tierhd">' + tierChip(tr) + '<small>' + td + ' / ' + ts.length + '</small></div>' + lis.map(function (x) {
          var bubs = steps.filter(function (s) { return s.li === x[1]; }).map(function (s) { return bubbleHTML(s, sug); }).join('');
          return '<div class="lrow"><div class="lt">' + ch.num + '.' + (x[1] + 1) + ' ' + esc(L(x[0].title)) + '</div><div class="bubbles" style="margin-left:0">' + bubs + '</div></div>';
        }).join('');
      }).join('');
      return '<div class="chap' + (cur.ci === ci ? ' cur' : '') + '"><div class="hd"><div class="num">' + ch.num + '</div><div><b>' + roomIc(ch) + esc(L(ch.name)) + '</b><span>' + esc(L(ch.concept)) + '</span></div>' +
        '<div class="prog">' + esc(t('stepsDone', { d: done, t: steps.length })) + '</div></div>' + lessons +
        (ch.sensors && ch.sensors.length ? '<div class="schips">' + SUI.chips(ch.sensors) + '</div>' : '') + '</div>';
    }).join('') + C.soon.map(function (s) {
      return '<div class="chap soon"><div class="hd"><div class="num">' + s.num + '</div><div><b>' + roomIc(s) + esc(L(s.name)) + '</b><span>' + esc(L(s.concept)) + '</span></div></div>' +
        '<p style="margin:0;font-size:.86rem;color:var(--ink-2)">' + esc(L(s.sensor)) + '</p>' +
        (s.sensors && s.sensors.length ? '<div class="schips">' + SUI.chips(s.sensors) + '</div>' : '') + '<span class="soonchip">' + esc(t('soon')) + '</span></div>';
    }).join('');
    $('mapgrid').innerHTML = html;
  }

  function openSettings() {
    $('myCode').textContent = E.encodeProgress(codeStars());
    $('mergeIn').value = ''; $('mergeMsg').hidden = true; $('copyCode').textContent = t('copy');
    renderRoboPick('roboPickSet', S.robot);
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
    $('variantBtn').onclick = function () { if (S.running) return; var nv = nVariants(STEPS[S.gi].st); S.vi = (S.vi + 1) % nv; renderVariant(); resetView(); };
    $('storyBtn').onclick = function () { openStory(STEPS[S.gi].ch); };
    $('storyStart').onclick = function () { closeModal('storyModal'); };
    $('readBtn').onclick = function () {
      if (!('speechSynthesis' in window)) return;
      try { speechSynthesis.cancel(); var st = STEPS[S.gi].st, u = new SpeechSynthesisUtterance(L(st.text) + ' ' + L(st.goal));
        u.lang = S.lang === 'tr' ? 'tr-TR' : 'en-US'; u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {}
    };
    $('solutionBtn').onclick = function () {
      if (S.running) return; ws.clear();
      var sst = STEPS[S.gi].st;
      if (isHome(sst)) { HB.ctx = sst; B.serialization.workspaces.load(HB.solution(sst), ws); ws.cleanUp(); }
      else B.serialization.workspaces.load(E.solutionWorkspace(sst.sol), ws);
      ws.scrollCenter(); setStatus(t('st_solution'));
    };
    $('winStay').onclick = function () { closeModal('win'); };
    $('winNext').onclick = function () { closeModal('win'); goStep(S.gi + 1); };
    $('speed').oninput = function () {};

    $('layoutSel').onchange = function () { chooseLayout(this.value); };
    $('saveLayoutBtn').onclick = function () {
      settings.custom = Object.assign({}, settings.layout); settings.layoutName = 'custom'; saveSettings(); fillLayoutSel(); setStatus(t('layoutSaved'), 'ok');
    };
    $('codeMode').onchange = function () { settings.layout.code = this.value; saveSettings(); applyLayout(); updateCode(); };
    $('boardSel').onchange = function () { settings.board = this.value; saveSettings(); updateCode(); };
    function download(name, text) {
      try {
        var blob = new Blob([text], { type: 'text/plain;charset=utf-8' }), a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      } catch (e) {}
    }
    $('dlPy').onclick = function () { var st = STEPS[S.gi].st; if (!isHome(st)) return; HB.ctx = st; download(st.id + '.py', HB.toPyFile(ws, st)); };
    $('dlIno').onclick = function () { var st = STEPS[S.gi].st; if (!isHome(st)) return; HB.ctx = st; download(st.id.replace(/-/g, '_') + '.ino', HB.toIno(ws, st, settings.board)); };
    initSplit($('splitL'), 'L'); initSplit($('splitR'), 'R'); initHGrip();
    $('colL').onclick = function () { setCollapsed('L', !settings.layout.lc); };
    $('colR').onclick = function () { setCollapsed('R', !settings.layout.rc); };
    $('openL').onclick = function () { setCollapsed('L', false); };
    $('openR').onclick = function () { setCollapsed('R', false); };
    $('railRun').onclick = function () { setCollapsed('L', false); run(); };
    $('maxBtn').onclick = function () { var l = settings.layout, both = l.lc && l.rc; l.lc = !both; l.rc = !both; applyWidths(); saveSettings(); };
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
      var arr = E.decodeProgress($('mergeIn').value, CODE_N), msg = $('mergeMsg');
      msg.hidden = false;
      if (!arr) { msg.className = 'err'; msg.textContent = codeError($('mergeIn').value); return; }
      STEPS.forEach(function (s) { var v = arr[s.st.n] || 0, id = s.st.id; if (v > (S.pdata.stars[id] || 0)) S.pdata.stars[id] = v; });
      savePdata(); renderTop();
      msg.className = 'status'; msg.setAttribute('data-kind', 'ok'); msg.textContent = t('loaded');
      $('myCode').textContent = E.encodeProgress(codeStars());
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
      var p = { id: newId(), name: name.slice(0, 24), robot: pickNew }, list = profiles(); list.push(p); store.set('profiles', list);
      openProfile(p);
    });
    $('guestBtn').onclick = function () { if ($('roboPick').getAttribute('data-touched')) { settings.guestRobot = pickNew; saveSettings(); } openProfile({ id: 'guest', name: GUEST[S.lang] }); };
    $('roboPick').addEventListener('click', function (e) { var b = e.target.closest('[data-robot]'); if (!b) return; pickNew = b.getAttribute('data-robot'); this.setAttribute('data-touched', '1'); renderRoboPick('roboPick', pickNew); SND.play('pop'); });
    $('roboPickSet').addEventListener('click', function (e) { var b = e.target.closest('[data-robot]'); if (!b) return; setRobot(b.getAttribute('data-robot')); SND.play('pop'); });
    $('soundSel').onchange = function () { settings.sound = this.value; SND.mode = this.value; saveSettings(); SND.play('pop'); };
    ['codeIn', 'mergeIn'].forEach(function (id) { $(id).addEventListener('input', function () { var f = formatCode(this.value); if (f !== this.value) this.value = f; }); });
    $('haveCodeBtn').onclick = function () { $('codeForm').hidden = !$('codeForm').hidden; if (!$('codeForm').hidden) $('codeNameIn').focus(); };
    $('codeForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('codeNameIn').value.trim(), arr = E.decodeProgress($('codeIn').value, CODE_N), err = $('codeErr');
      if (!name) { err.textContent = t('needName'); err.hidden = false; return; }
      if (!arr) { err.textContent = codeError($('codeIn').value); err.hidden = false; return; }
      var p = { id: newId(), name: name.slice(0, 24), robot: pickNew }, list = profiles(), data = blankData();
      STEPS.forEach(function (s) { var v = arr[s.st.n]; if (v) data.stars[s.st.id] = v; });
      var sug = -1; for (var i = 0; i < STEPS.length; i++) if (!arr[STEPS[i].st.n]) { sug = i; break; }
      data.last = STEPS[sug >= 0 ? sug : STEPS.length - 1].st.id;
      C.chapters.forEach(function (ch, ci) { if (STEPS.some(function (s) { return s.ci === ci && arr[s.st.n]; })) data.seen[ch.id] = true; });
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
