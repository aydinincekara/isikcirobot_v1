/* afi kod - akıllı ev sahnesi (kontrol paneli + zaman çizelgesi)
 * Üst kısım: solda sensör kartları, ortada afi, sağda cihaz kartları.
 * Alt kısım: zaman çizelgesi. Her saniye için test noktası, sensörlerin değişimi,
 * cihazların beklenen durumu (açık renk) ve programın yaptığı (koyu renk).
 */
(function (root) {
  'use strict';
  var H = root.HOME;
  var P2 = typeof root.Path2D === 'function';
  var ICON = {
    motion: 'M13 3.5a1.6 1.6 0 1 0 0.01 0 M8 21l3-6 3 3v3 M6 11l3-3h4l2 3h3 M10.5 8.5l1 6',
    door: 'M6 21V4h9v17 M3.5 21h14 M12 12.5v.01 M19 8v8 M21 8v8',
    card: 'M3 6h18v12H3z M3 10h18 M6 14.5h5',
    button: 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M12 12m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0',
    touch: 'M9 12V5.5a1.5 1.5 0 0 1 3 0V11 M12 10.5V4.5a1.5 1.5 0 0 1 3 0v7 M15 10a1.5 1.5 0 0 1 3 0v4a7 7 0 0 1-7 7h-.5A5.5 5.5 0 0 1 5 15.5V13a1.5 1.5 0 0 1 3 0v1',
    obstacle: 'M3 12h10 M10 8.5l3.5 3.5-3.5 3.5 M17 4v16 M20.5 4v16',
    rain: 'M7 14a4 4 0 0 1 0-8 5 5 0 0 1 9.6 1.6A3.3 3.3 0 0 1 17 14z M8.5 17l-1.2 3 M12.5 17l-1.2 3 M16.5 17l-1.2 3',
    distance: 'M3 12h3 M8 7a7 7 0 0 1 0 10 M12 4a11 11 0 0 1 0 16 M19 8v8 M21.5 8v8',
    light: 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
    soil: 'M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z M3 21h18',
    temp: 'M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0z M12 10v6',
    hum: 'M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5',
    sound: 'M2 12h3l3-7 4 14 3-7h7',
    knob: 'M12 13m-7.5 0a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0 M12 13l3.5-4.5 M12 2.5v2.5',
    gas: 'M6 18a4 4 0 0 1 1-7.6A5 5 0 0 1 17 9a4.5 4.5 0 0 1 1 9z M9 21.5h6',
    tilt: 'M4 19L17 6 M4 19h16 M9.5 19a5.5 5.5 0 0 0-1.7-3.9'
  };

  function rr(c, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function icon(c, name, x, y, s, col, lw) {
    if (!P2 || !ICON[name]) return;
    c.save(); c.translate(x, y); c.scale(s / 24, s / 24);
    c.strokeStyle = col; c.lineWidth = lw || 2; c.lineCap = 'round'; c.lineJoin = 'round';
    try { c.stroke(new root.Path2D(ICON[name])); } catch (e) {}
    c.restore();
  }
  function font(c, px, w) { c.font = (w || 700) + ' ' + Math.max(8, Math.round(px)) + 'px Nunito, "Segoe UI", sans-serif'; }
  function fit(c, txt, maxw) {
    txt = String(txt);
    if (c.measureText(txt).width <= maxw) return txt;
    while (txt.length > 1 && c.measureText(txt + '…').width > maxw) txt = txt.slice(0, -1);
    return txt + '…';
  }
  function L(o, lang) { return o ? (o[lang] || o.tr) : ''; }
  /* Yazı sığmazsa önce yazıyı biraz küçültür, yine sığmazsa sonunu "…" ile keser */
  function fitText(c, txt, maxw, px, w) {
    var size = px;
    font(c, size, w);
    while (size > px * 0.74 && c.measureText(String(txt)).width > maxw) { size -= px * 0.05; font(c, size, w); }
    return fit(c, txt, maxw);
  }
  function sensorText(id, v, lang) {
    var s = H.SENSORS[id];
    if (s.type !== 'num') return L(s.val, lang)[Math.max(0, Math.min(L(s.val, lang).length - 1, v | 0))];
    return H.fmtVal(v) + (s.unit ? ' ' + s.unit : '');
  }
  function stateText(dev, v, lang) {
    var d = H.DEVICES[dev];
    if (d.kind === 'screen') return v === '' || v == null ? '—' : H.fmtVal(v);
    return L(H.STATE_WORD[d.kind], lang)[v ? 1 : 0];
  }

  /* ---------- Cihaz çizimleri ---------- */
  function drawDevice(c, dev, v, x, y, s, K, anim) {
    var d = H.DEVICES[dev], on = !!v, cx = x + s / 2, cy = y + s / 2;
    c.save();
    switch (d.look) {
      case 'lamp': {
        var col = d.color || K.lamp;
        if (on) { var g = c.createRadialGradient(cx, cy - s * 0.08, s * 0.05, cx, cy - s * 0.08, s * 0.55); g.addColorStop(0, d.color ? col : K.glow); g.addColorStop(1, 'rgba(255,200,80,0)'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy - s * 0.08, s * 0.55, 0, 7); c.fill(); }
        c.fillStyle = on ? col : K.off; c.beginPath(); c.arc(cx, cy - s * 0.1, s * 0.24, 0, 7); c.fill();
        c.fillStyle = K.ink3; rr(c, cx - s * 0.12, cy + s * 0.14, s * 0.24, s * 0.16, s * 0.03); c.fill();
        break;
      }
      case 'led': {
        if (on) { var g2 = c.createRadialGradient(cx, cy, s * 0.05, cx, cy, s * 0.5); g2.addColorStop(0, d.color); g2.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g2; c.beginPath(); c.arc(cx, cy, s * 0.5, 0, 7); c.fill(); }
        c.globalAlpha = on ? 1 : 0.28; c.fillStyle = d.color; c.beginPath(); c.arc(cx, cy, s * 0.25, 0, 7); c.fill(); c.globalAlpha = 1;
        c.strokeStyle = K.ink3; c.lineWidth = s * 0.03; c.beginPath(); c.arc(cx, cy, s * 0.25, 0, 7); c.stroke();
        break;
      }
      case 'alarm': case 'buzzer': {
        var red = d.look === 'alarm' ? K.bad : K.accent;
        c.fillStyle = on ? red : K.off;
        if (d.look === 'alarm') { c.beginPath(); c.moveTo(cx - s * 0.22, cy + s * 0.15); c.quadraticCurveTo(cx - s * 0.22, cy - s * 0.28, cx, cy - s * 0.28); c.quadraticCurveTo(cx + s * 0.22, cy - s * 0.28, cx + s * 0.22, cy + s * 0.15); c.closePath(); c.fill(); c.fillRect(cx - s * 0.28, cy + s * 0.14, s * 0.56, s * 0.07); }
        else { rr(c, cx - s * 0.24, cy - s * 0.1, s * 0.16, s * 0.2, s * 0.02); c.fill(); c.beginPath(); c.moveTo(cx - s * 0.08, cy - s * 0.1); c.lineTo(cx + s * 0.08, cy - s * 0.25); c.lineTo(cx + s * 0.08, cy + s * 0.25); c.lineTo(cx - s * 0.08, cy + s * 0.1); c.closePath(); c.fill(); }
        if (on) { c.strokeStyle = red; c.lineWidth = s * 0.045; var ph = (anim * 3) % 1;
          for (var i = 0; i < 2; i++) { c.globalAlpha = 1 - ((ph + i * 0.5) % 1); c.beginPath(); c.arc(cx + s * (d.look === 'alarm' ? 0 : 0.05), cy, s * (0.3 + 0.15 * ((ph + i * 0.5) % 1)), -0.6, 0.6); c.stroke(); c.beginPath(); c.arc(cx, cy, s * (0.3 + 0.15 * ((ph + i * 0.5) % 1)), Math.PI - 0.6, Math.PI + 0.6); c.stroke(); }
          c.globalAlpha = 1; }
        break;
      }
      case 'music': {
        c.fillStyle = on ? K.accent : K.off; c.strokeStyle = c.fillStyle; c.lineWidth = s * 0.06;
        var bx = cx + (on ? Math.sin(anim * 9) * s * 0.03 : 0);
        c.beginPath(); c.ellipse(bx - s * 0.12, cy + s * 0.18, s * 0.1, s * 0.075, -0.4, 0, 7); c.fill();
        c.beginPath(); c.ellipse(bx + s * 0.16, cy + s * 0.12, s * 0.1, s * 0.075, -0.4, 0, 7); c.fill();
        c.beginPath(); c.moveTo(bx - s * 0.03, cy + s * 0.18); c.lineTo(bx - s * 0.03, cy - s * 0.26); c.lineTo(bx + s * 0.25, cy - s * 0.32); c.lineTo(bx + s * 0.25, cy + s * 0.12); c.stroke();
        break;
      }
      case 'fan': {
        var ang = on ? anim * 14 : 0.3;
        c.strokeStyle = K.ink3; c.lineWidth = s * 0.035; c.beginPath(); c.arc(cx, cy, s * 0.38, 0, 7); c.stroke();
        c.fillStyle = on ? K.accent : K.off;
        for (var k = 0; k < 3; k++) { var a = ang + k * 2.094; c.beginPath(); c.ellipse(cx + Math.cos(a) * s * 0.17, cy + Math.sin(a) * s * 0.17, s * 0.16, s * 0.07, a, 0, 7); c.fill(); }
        c.fillStyle = K.ink3; c.beginPath(); c.arc(cx, cy, s * 0.06, 0, 7); c.fill();
        break;
      }
      case 'heater': {
        c.fillStyle = on ? '#E8590C' : K.off; rr(c, x + s * 0.18, y + s * 0.2, s * 0.64, s * 0.6, s * 0.08); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = s * 0.04;
        for (var j = 0; j < 3; j++) { var hx = x + s * (0.32 + j * 0.18); c.beginPath(); c.moveTo(hx, y + s * 0.3); c.bezierCurveTo(hx + s * 0.06, y + s * 0.42, hx - s * 0.06, y + s * 0.56, hx, y + s * 0.7); c.stroke(); }
        break;
      }
      case 'pump': {
        c.fillStyle = on ? '#2F7FE0' : K.off;
        c.beginPath(); c.moveTo(cx, cy - s * 0.32); c.bezierCurveTo(cx + s * 0.25, cy, cx + s * 0.22, cy + s * 0.25, cx, cy + s * 0.25); c.bezierCurveTo(cx - s * 0.22, cy + s * 0.25, cx - s * 0.25, cy, cx, cy - s * 0.32); c.fill();
        if (on) { c.fillStyle = '#2F7FE0'; for (var q = 0; q < 3; q++) { var ph2 = (anim * 1.6 + q / 3) % 1; c.globalAlpha = 1 - ph2; c.beginPath(); c.arc(cx + (q - 1) * s * 0.22, cy + s * (0.3 + ph2 * 0.18), s * 0.04, 0, 7); c.fill(); } c.globalAlpha = 1; }
        break;
      }
      case 'door': case 'window': case 'garage': case 'curtain': case 'valve': drawOpenable(c, d.look, on, x, y, s, K); break;
      case 'screen': {
        c.fillStyle = '#10261A'; rr(c, x + s * 0.06, y + s * 0.22, s * 0.88, s * 0.56, s * 0.08); c.fill();
        break;
      }
    }
    c.restore();
  }
  function drawOpenable(c, look, open, x, y, s, K) {
    var fr = K.ink3, wood = K.door, cx = x + s / 2;
    c.lineWidth = s * 0.05; c.strokeStyle = fr;
    if (look === 'door') {
      c.strokeRect(x + s * 0.22, y + s * 0.12, s * 0.56, s * 0.78);
      c.fillStyle = wood;
      if (open) { c.beginPath(); c.moveTo(x + s * 0.22, y + s * 0.12); c.lineTo(x + s * 0.42, y + s * 0.2); c.lineTo(x + s * 0.42, y + s * 0.82); c.lineTo(x + s * 0.22, y + s * 0.9); c.closePath(); c.fill(); c.fillStyle = K.glowSoft; c.fillRect(x + s * 0.44, y + s * 0.14, s * 0.32, s * 0.74); }
      else { c.fillRect(x + s * 0.25, y + s * 0.15, s * 0.5, s * 0.72); c.fillStyle = K.lamp; c.beginPath(); c.arc(x + s * 0.66, y + s * 0.52, s * 0.035, 0, 7); c.fill(); }
    } else if (look === 'window') {
      c.strokeRect(x + s * 0.16, y + s * 0.16, s * 0.68, s * 0.68);
      c.fillStyle = K.sky;
      if (open) { c.fillRect(x + s * 0.18, y + s * 0.18, s * 0.64, s * 0.64); c.fillStyle = K.glass; c.beginPath(); c.moveTo(x + s * 0.18, y + s * 0.18); c.lineTo(x + s * 0.32, y + s * 0.26); c.lineTo(x + s * 0.32, y + s * 0.74); c.lineTo(x + s * 0.18, y + s * 0.82); c.fill(); c.beginPath(); c.moveTo(x + s * 0.82, y + s * 0.18); c.lineTo(x + s * 0.68, y + s * 0.26); c.lineTo(x + s * 0.68, y + s * 0.74); c.lineTo(x + s * 0.82, y + s * 0.82); c.fill(); }
      else { c.fillStyle = K.glass; c.fillRect(x + s * 0.18, y + s * 0.18, s * 0.64, s * 0.64); c.beginPath(); c.moveTo(cx, y + s * 0.16); c.lineTo(cx, y + s * 0.84); c.stroke(); }
    } else if (look === 'garage') {
      c.beginPath(); c.moveTo(x + s * 0.1, y + s * 0.4); c.lineTo(cx, y + s * 0.12); c.lineTo(x + s * 0.9, y + s * 0.4); c.stroke();
      c.strokeRect(x + s * 0.18, y + s * 0.4, s * 0.64, s * 0.5);
      var n = open ? 1 : 5; c.fillStyle = wood;
      for (var i = 0; i < n; i++) c.fillRect(x + s * 0.2, y + s * (0.42 + i * 0.095), s * 0.6, s * 0.08);
    } else if (look === 'curtain') {
      c.beginPath(); c.moveTo(x + s * 0.1, y + s * 0.16); c.lineTo(x + s * 0.9, y + s * 0.16); c.stroke();
      c.fillStyle = '#C4568A'; var wdt = open ? s * 0.12 : s * 0.38;
      c.fillRect(x + s * 0.12, y + s * 0.18, wdt, s * 0.68); c.fillRect(x + s * 0.88 - wdt, y + s * 0.18, wdt, s * 0.68);
      if (open) { c.fillStyle = K.sky; c.fillRect(x + s * 0.26, y + s * 0.18, s * 0.48, s * 0.68); }
    } else if (look === 'valve') {
      c.fillStyle = K.ink3; c.fillRect(x + s * 0.08, y + s * 0.56, s * 0.84, s * 0.14);
      c.fillStyle = open ? K.ok : K.bad; c.beginPath(); c.arc(cx, y + s * 0.5, s * 0.14, 0, 7); c.fill();
      c.strokeStyle = open ? K.ok : K.bad; c.lineWidth = s * 0.08; c.lineCap = 'round'; c.beginPath();
      if (open) { c.moveTo(x + s * 0.24, y + s * 0.3); c.lineTo(x + s * 0.76, y + s * 0.3); } else { c.moveTo(cx, y + s * 0.12); c.lineTo(cx, y + s * 0.44); }
      c.stroke();
    }
  }
  function drawAfi(c, x, y, s, K, glow) {
    c.save();
    if (glow > 0) { c.fillStyle = K.accentSoft; c.globalAlpha = glow; c.beginPath(); c.arc(x, y, s * 0.75, 0, 7); c.fill(); c.globalAlpha = 1; }
    c.strokeStyle = K.robot; c.lineWidth = s * 0.08; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - s * 0.36); c.lineTo(x, y - s * 0.55); c.stroke();
    c.fillStyle = K.lamp; c.beginPath(); c.arc(x, y - s * 0.6, s * 0.1, 0, 7); c.fill();
    c.fillStyle = K.robot; rr(c, x - s * 0.45, y - s * 0.38, s * 0.9, s * 0.74, s * 0.24); c.fill();
    c.fillStyle = K.eye; c.beginPath(); c.arc(x - s * 0.17, y - s * 0.03, s * 0.11, 0, 7); c.fill(); c.beginPath(); c.arc(x + s * 0.17, y - s * 0.03, s * 0.11, 0, 7); c.fill();
    c.restore();
  }

  /* Sahnenin en/boy oranı: satır sayısı arttıkça biraz uzar */
  function aspect(st) {
    var rows = st.sensors.length + st.devices.length, cards = Math.max(st.sensors.length, st.devices.length);
    return Math.min(1.75, 1.08 + 0.045 * Math.max(0, rows - 3) + 0.06 * Math.max(0, cards - 3));
  }

  /* ---------- Ana çizim ----------
   * m: { step, nsc, res, chk, tm, K, lang, t, anim, vi, nv, marks }
   */
  function draw(c, W, Hh, m) {
    var K = m.K, st = m.step, lang = m.lang, t = m.t, nsc = m.nsc, dur = nsc.dur, tm = Math.max(0, Math.min(dur, m.tm));
    var u = W / 330, pad = 10 * u;
    c.clearRect(0, 0, W, Hh);
    c.fillStyle = K.bg; c.fillRect(0, 0, W, Hh);
    c.textBaseline = 'middle';
    /* Saat */
    font(c, 13 * u, 800); c.fillStyle = K.ink; c.textAlign = 'left';
    c.fillText('⏱ ' + H.fmtVal(Math.floor(tm * 10) / 10) + ' / ' + dur + ' ' + t('h_sec'), pad, pad + 8 * u);
    if (m.nv > 1) { font(c, 11 * u, 700); c.fillStyle = K.ink2; c.textAlign = 'right'; c.fillText(t('variantLabel', { n: m.vi + 1, m: m.nv }), W - pad, pad + 8 * u); }

    var sens = st.sensors, devs = st.devices, rows = sens.length + devs.length;
    var tlH = 62 * u + rows * Math.min(26 * u, Math.max(15 * u, 150 * u / Math.max(1, rows)));
    var hasVars = !!(m.step.showVars || (m.res && m.res.vars.length));
    var y0 = pad + 24 * u, y1 = Hh - pad - tlH - (hasVars ? 26 * u : 8 * u);
    var sx = pad, sw = W * 0.4, dx = W * 0.585, dw = W - pad - dx, ax = (sx + sw + dx) / 2;
    var gap = 6 * u;
    var sh = Math.min(66 * u, (y1 - y0 - gap * (sens.length - 1)) / Math.max(1, sens.length));
    var dh = Math.min(66 * u, (y1 - y0 - gap * (devs.length - 1)) / Math.max(1, devs.length));
    var sTop = y0 + ((y1 - y0) - (sh * sens.length + gap * (sens.length - 1))) / 2;
    var dTop = y0 + ((y1 - y0) - (dh * devs.length + gap * (devs.length - 1))) / 2;
    var ay = (y0 + y1) / 2, as = 34 * u;
    var recent = (m.marks || []).filter(function (e) { return tm >= e.t && tm - e.t < 0.8; });
    var lastAct = null;
    if (m.res) m.res.actions.forEach(function (a) { if (a.t <= tm + 1e-9) lastAct = a; });
    var actGlow = lastAct && tm - lastAct.t < 0.6 ? 1 - (tm - lastAct.t) / 0.6 : 0;

    /* Bağlantı çizgileri */
    sens.forEach(function (id, i) {
      var cy = sTop + i * (sh + gap) + sh / 2, hot = recent.some(function (e) { return H.EVENTS[e.ev].s === id; });
      c.strokeStyle = hot ? K.accent : K.line; c.lineWidth = (hot ? 2.6 : 1.4) * u;
      c.beginPath(); c.moveTo(sx + sw, cy); c.bezierCurveTo(sx + sw + 14 * u, cy, ax - as * 0.9, ay, ax - as * 0.45, ay); c.stroke();
    });
    devs.forEach(function (id, i) {
      var cy = dTop + i * (dh + gap) + dh / 2, hot = lastAct && lastAct.dev === id && actGlow > 0;
      c.strokeStyle = hot ? K.accent : K.line; c.lineWidth = (hot ? 2.6 : 1.4) * u;
      c.beginPath(); c.moveTo(ax + as * 0.45, ay); c.bezierCurveTo(ax + as * 0.9, ay, dx - 14 * u, cy, dx, cy); c.stroke();
    });
    drawAfi(c, ax, ay, as, K, Math.max(actGlow, recent.length ? 0.8 : 0));
    if (m.res && m.res.vars.length) {
      var vv = H.varsAt(m.res, tm), keys = Object.keys(vv), vy = y1 + 13 * u, vx = pad;
      font(c, 9.5 * u, 800); c.textAlign = 'left';
      keys.forEach(function (k) {
        var txt = k + ' = ' + H.fmtVal(vv[k]), w = c.measureText(txt).width + 12 * u;
        if (vx + w > W - pad) return;
        c.fillStyle = K.varBg; rr(c, vx, vy - 8 * u, w, 16 * u, 8 * u); c.fill();
        c.fillStyle = K.varInk; c.fillText(txt, vx + 6 * u, vy + 0.5 * u);
        vx += w + 5 * u;
      });
    }

    /* Sensör kartları */
    sens.forEach(function (id, i) {
      var y = sTop + i * (sh + gap), v = H.valueAt(nsc, id, tm), sd = H.SENSORS[id];
      var hot = recent.some(function (e) { return H.EVENTS[e.ev].s === id; });
      c.fillStyle = K.panel; rr(c, sx, y, sw, sh, 8 * u); c.fill();
      c.strokeStyle = hot ? K.accent : K.line; c.lineWidth = (hot ? 2.6 : 1) * u; rr(c, sx, y, sw, sh, 8 * u); c.stroke();
      var is = Math.min(sh * 0.56, 24 * u), active = sd.type === 'num' ? false : !!v, icx = sx + 6 * u + is * 0.75;
      c.fillStyle = active ? K.accentSoft : K.panel2; c.beginPath(); c.arc(icx, y + sh / 2, is * 0.75, 0, 7); c.fill();
      icon(c, id, icx - is / 2, y + sh / 2 - is / 2, is, active ? K.accent : K.ink2, 2);
      var tx = icx + is * 0.75 + 6 * u, tw = sx + sw - tx - 6 * u;
      var nf = Math.min(10.5 * u, sh * 0.26), vf = Math.min(14 * u, sh * 0.32);
      c.textAlign = 'left'; c.fillStyle = K.ink2;
      c.fillText(fitText(c, L(sd.name, lang), tw, nf, 700), tx, y + sh * (sd.type === 'num' ? 0.26 : 0.32));
      c.fillStyle = sd.type === 'card' && v === 2 ? K.bad : active ? K.accent : K.ink;
      c.fillText(fitText(c, sensorText(id, v, lang), tw, vf, 800), tx, y + sh * (sd.type === 'num' ? 0.55 : 0.66));
      if (sd.type === 'num') {
        var r = sd.range, k = Math.max(0, Math.min(1, (v - r[0]) / (r[1] - r[0]))), bh = Math.max(3 * u, sh * 0.09), by = y + sh * 0.78;
        c.fillStyle = K.panel2; rr(c, tx, by, tw, bh, bh / 2); c.fill();
        c.fillStyle = K.accent; rr(c, tx, by, Math.max(bh, tw * k), bh, bh / 2); c.fill();
        (st.thresholds || []).filter(function (th) { return th.s === id; }).forEach(function (th) {
          var xx = tx + tw * Math.max(0, Math.min(1, (th.v - r[0]) / (r[1] - r[0])));
          c.fillStyle = K.bad; c.fillRect(xx - 0.75 * u, by - 2 * u, 1.5 * u, bh + 4 * u);
        });
      }
    });

    /* Cihaz kartları */
    var failNow = m.chk && m.chk.fail && tm >= m.chk.fail.t + 0.5 ? m.chk.fail : null;
    devs.forEach(function (id, i) {
      var y = dTop + i * (dh + gap), d = H.DEVICES[id];
      var v = m.res ? H.stateAt(m.res, st, id, tm) : (nsc.init[id] != null ? nsc.init[id] : (d.kind === 'screen' ? '' : 0));
      var bad = failNow && failNow.dev === id;
      c.fillStyle = K.panel; rr(c, dx, y, dw, dh, 8 * u); c.fill();
      c.strokeStyle = bad ? K.bad : K.line; c.lineWidth = (bad ? 2.6 : 1) * u; rr(c, dx, y, dw, dh, 8 * u); c.stroke();
      var is = Math.min(dh * 0.86, 38 * u);
      if (d.kind === 'screen') {
        c.fillStyle = '#10261A'; rr(c, dx + 5 * u, y + 5 * u, dw - 10 * u, dh - 10 * u, 6 * u); c.fill();
        font(c, Math.min(9.5 * u, dh * 0.22), 700); c.fillStyle = '#6EE7A0'; c.textAlign = 'left';
        c.fillText(fit(c, L(d.name, lang), dw - 22 * u), dx + 11 * u, y + 5 * u + Math.min(9 * u, dh * 0.2));
        font(c, Math.min(16 * u, dh * 0.36), 800); c.fillStyle = '#4ADE80'; c.textAlign = 'center';
        c.fillText(fit(c, stateText(id, v, lang), dw - 22 * u), dx + dw / 2, y + dh * 0.6);
      } else {
        drawDevice(c, id, v, dx + 5 * u, y + (dh - is) / 2, is, K, m.anim);
        var tx = dx + 8 * u + is, tw = dx + dw - tx - 6 * u;
        c.textAlign = 'left'; c.fillStyle = K.ink2;
        c.fillText(fitText(c, L(d.name, lang), tw, Math.min(10.5 * u, dh * 0.26), 700), tx, y + dh * 0.32);
        font(c, Math.min(13 * u, dh * 0.3), 800); c.fillStyle = v ? K.ok : K.ink3;
        c.fillText(fit(c, stateText(id, v, lang), tw), tx, y + dh * 0.68);
      }
      if (bad) {
        var tag = t('h_should', { v: stateText(id, failNow.want, lang) });
        font(c, Math.min(9.5 * u, dh * 0.24), 800); var tw2 = c.measureText(tag).width + 10 * u;
        c.fillStyle = K.bad; rr(c, dx + dw - tw2 - 3 * u, y - 7 * u, tw2, 14 * u, 7 * u); c.fill();
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(tag, dx + dw - tw2 / 2 - 3 * u, y);
      }
    });

    /* ---------- Zaman çizelgesi ---------- */
    var ty0 = Hh - pad - tlH, lx = pad + 6 * u, lw = 74 * u, px0 = lx + lw + 6 * u, px1 = W - pad - 8 * u;
    var sec = (px1 - px0) / dur, rh = (tlH - 62 * u) / Math.max(1, rows);
    c.fillStyle = K.panel; rr(c, pad, ty0, W - 2 * pad, tlH, 8 * u); c.fill();
    c.strokeStyle = K.line; c.lineWidth = u; rr(c, pad, ty0, W - 2 * pad, tlH, 8 * u); c.stroke();
    var cyChk = ty0 + 12 * u, rad = Math.min(sec * 0.36, 5.5 * u);
    font(c, 10 * u, 800); c.textAlign = 'left'; c.fillStyle = K.ink2; c.fillText(t('h_tests'), lx, cyChk);
    for (var k = 0; k < dur; k++) {
      var cx = px0 + (k + 0.5) * sec, done = m.chk && tm >= k + 0.5, ok = done ? m.chk.perSec[k] : null;
      c.fillStyle = done ? (ok ? K.ok : K.bad) : K.panel2; c.beginPath(); c.arc(cx, cyChk, rad, 0, 7); c.fill();
      if (!done) { c.strokeStyle = K.line; c.lineWidth = u; c.stroke(); }
      else { c.strokeStyle = '#fff'; c.lineWidth = Math.max(1, rad * 0.32); c.lineCap = 'round'; c.beginPath();
        if (ok) { c.moveTo(cx - rad * 0.45, cyChk); c.lineTo(cx - rad * 0.1, cyChk + rad * 0.4); c.lineTo(cx + rad * 0.5, cyChk - rad * 0.4); }
        else { c.moveTo(cx - rad * 0.4, cyChk - rad * 0.4); c.lineTo(cx + rad * 0.4, cyChk + rad * 0.4); c.moveTo(cx + rad * 0.4, cyChk - rad * 0.4); c.lineTo(cx - rad * 0.4, cyChk + rad * 0.4); }
        c.stroke(); }
    }
    var axY = cyChk + 13 * u;
    c.strokeStyle = K.line; c.lineWidth = u; c.beginPath(); c.moveTo(px0, axY); c.lineTo(px1, axY); c.stroke();
    font(c, 9 * u, 700); c.fillStyle = K.ink3; c.textAlign = 'center';
    var stepLbl = dur > 20 ? 5 : dur > 10 ? 2 : 1;
    for (var s2 = 0; s2 <= dur; s2 += stepLbl) { c.fillText(String(s2), px0 + s2 * sec, axY + 8 * u); c.beginPath(); c.moveTo(px0 + s2 * sec, axY - 2 * u); c.lineTo(px0 + s2 * sec, axY + 2 * u); c.stroke(); }
    var ry = axY + 16 * u;
    function rowLabel(txt, y) { c.textAlign = 'left'; c.fillStyle = K.ink2; c.fillText(fitText(c, txt, lw, Math.min(9.5 * u, rh * 0.62), 700), lx, y + rh / 2); }
    sens.forEach(function (id, i) {
      var y = ry + i * rh, sd = H.SENSORS[id], arr = nsc.sig[id] || [];
      rowLabel(L(sd.name, lang), y);
      c.fillStyle = K.panel2; c.fillRect(px0, y + rh * 0.14, px1 - px0, rh * 0.72);
      if (sd.type === 'num') {
        var r = sd.range;
        var yOf = function (v) { return y + rh * 0.86 - Math.max(0, Math.min(1, (v - r[0]) / (r[1] - r[0]))) * rh * 0.72; };
        (st.thresholds || []).filter(function (th) { return th.s === id; }).forEach(function (th) {
          c.setLineDash([3 * u, 2 * u]); c.strokeStyle = K.bad; c.lineWidth = u; c.beginPath(); c.moveTo(px0, yOf(th.v)); c.lineTo(px1, yOf(th.v)); c.stroke(); c.setLineDash([]);
        });
        c.strokeStyle = K.accent; c.lineWidth = 1.8 * u; c.beginPath();
        arr.forEach(function (v, k2) { var yy = yOf(v); if (!k2) c.moveTo(px0, yy); else c.lineTo(px0 + k2 * sec, yy); c.lineTo(px0 + (k2 + 1) * sec, yy); });
        c.stroke();
      } else {
        arr.forEach(function (v, k2) { if (v) { c.fillStyle = sd.type === 'card' && v === 2 ? K.bad : K.accent; c.fillRect(px0 + k2 * sec, y + rh * 0.14, sec + 0.5, rh * 0.72); } });
      }
      (m.marks || []).forEach(function (e) {
        if (H.EVENTS[e.ev].s !== id) return; var mx = px0 + e.t * sec;
        c.fillStyle = K.hat; c.beginPath(); c.moveTo(mx, y + rh * 0.2); c.lineTo(mx + 3.5 * u, y - 2.5 * u); c.lineTo(mx - 3.5 * u, y - 2.5 * u); c.closePath(); c.fill();
      });
    });
    devs.forEach(function (id, i) {
      var y = ry + (sens.length + i) * rh, d = H.DEVICES[id], exp = st.exp[m.vi][id];
      rowLabel(L(d.name, lang), y);
      c.fillStyle = K.panel2; c.fillRect(px0, y + rh * 0.1, px1 - px0, rh * 0.8);
      var act = m.chk ? m.chk.trace[id] : null;
      if (d.kind !== 'screen') {
        for (var k3 = 0; k3 < dur; k3++) {
          var xx = px0 + k3 * sec, want = H.expAt(exp, k3);
          if (want) { c.fillStyle = K.expect; c.fillRect(xx, y + rh * 0.1, sec + 0.5, rh * 0.4); }
          if (act && tm >= k3 + 0.5) {
            if (!H.same(want, act[k3])) { c.fillStyle = K.badSoft; c.fillRect(xx, y + rh * 0.1, sec + 0.5, rh * 0.8); }
            if (act[k3]) { c.fillStyle = d.color || K.ok; c.fillRect(xx, y + rh * 0.5, sec + 0.5, rh * 0.4); }
          }
        }
      } else {
        font(c, Math.min(8.5 * u, rh * 0.4), 800); c.textAlign = 'left';
        var prevE = null, prevA = null;
        for (var k4 = 0; k4 < dur; k4++) {
          var w2 = H.expAt(exp, k4), a2 = act ? act[k4] : null, xm = px0 + k4 * sec + 1.5 * u;
          if (act && tm >= k4 + 0.5 && !H.same(w2, a2)) { c.fillStyle = K.badSoft; c.fillRect(px0 + k4 * sec, y + rh * 0.1, sec + 0.5, rh * 0.8); }
          if (!H.same(w2, prevE)) { c.fillStyle = K.ink3; c.fillText(fit(c, H.fmtVal(w2), sec * 1.9), xm, y + rh * 0.3); prevE = w2; c.fillStyle = K.line; c.fillRect(px0 + k4 * sec, y + rh * 0.1, u, rh * 0.8); }
          if (act && tm >= k4 + 0.5 && !H.same(a2, prevA)) { c.fillStyle = H.same(w2, a2) ? K.ok : K.bad; c.fillText(fit(c, H.fmtVal(a2), sec * 1.9), xm, y + rh * 0.72); prevA = a2; }
        }
      }
    });
    var ly = ry + rows * rh + 9 * u;
    font(c, 9 * u, 700); c.textAlign = 'left';
    c.fillStyle = K.expect; c.fillRect(px0, ly - 3.5 * u, 10 * u, 7 * u); c.fillStyle = K.ink3; c.fillText(t('h_expected'), px0 + 13 * u, ly);
    var lx2 = px0 + 13 * u + c.measureText(t('h_expected')).width + 12 * u;
    c.fillStyle = K.ok; c.fillRect(lx2, ly - 3.5 * u, 10 * u, 7 * u); c.fillStyle = K.ink3; c.fillText(t('h_actual'), lx2 + 13 * u, ly);
    if (tm > 0) { var phx = px0 + tm * sec; c.strokeStyle = K.ink; c.lineWidth = 1.6 * u; c.beginPath(); c.moveTo(phx, axY - 3 * u); c.lineTo(phx, ry + rows * rh); c.stroke(); }
  }

  root.HomeScene = { draw: draw, aspect: aspect, ICON: ICON, sensorText: sensorText, stateText: stateText };
})(typeof window !== 'undefined' ? window : this);
