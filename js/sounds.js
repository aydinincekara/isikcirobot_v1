/* afi kod - sesli tepkiler
 * Sesler dosya değil, tarayıcının ses motoruyla (Web Audio) üretilir: internetsiz çalışır, indirme gerektirmez.
 * SOUNDS.play('win3' | 'win2' | 'win1' | 'fail' | 'chapter' | 'course' | 'trash' | 'pop')
 * SOUNDS.say(metin, dil)  -> tarayıcıda o dilde bir ses varsa kısa bir cümle söyler
 * SOUNDS.mode: 'all' (ses + konuşma) | 'fx' (sadece ses) | 'off'
 */
(function (root) {
  'use strict';
  var AC = root.AudioContext || root.webkitAudioContext, ctx = null;
  var api = { mode: 'all' };
  function ac() {
    if (!AC) return null;
    if (!ctx) { try { ctx = new AC(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  /* Tarayıcılar sesi ancak kullanıcı bir yere tıkladıktan sonra açar */
  ['pointerdown', 'keydown'].forEach(function (ev) { if (root.addEventListener) root.addEventListener(ev, function () { if (api.mode !== 'off') ac(); }, { passive: true }); });

  function tone(c, f, t0, dur, type, vol, slideTo) {
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'triangle'; o.frequency.setValueAtTime(f, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  var N = { C4: 261.6, E4: 329.6, G4: 392, A4: 440, Bb4: 466.2, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568 };
  function seq(c, notes, step, type, vol) {
    var t = c.currentTime + 0.03;
    notes.forEach(function (n, i) { if (n) [].concat(n).forEach(function (x) { tone(c, N[x] || x, t + i * step, step * 1.6, type, vol); }); });
    return t + notes.length * step;
  }
  function sparkle(c, t, n) { for (var i = 0; i < n; i++) tone(c, 1800 + Math.random() * 1600, t + i * 0.05, 0.12, 'sine', 0.05); }

  var SFX = {
    win3: function (c) { var t = seq(c, ['C5', 'E5', 'G5', ['C6', 'E5', 'G5']], 0.11, 'triangle', 0.16); sparkle(c, t - 0.1, 8); },
    win2: function (c) { seq(c, ['C5', 'E5', ['G5', 'C5']], 0.12, 'triangle', 0.15); },
    win1: function (c) { seq(c, ['G4', ['C5', 'E4']], 0.14, 'triangle', 0.14); },
    fail: function (c) { var t = c.currentTime + 0.03; tone(c, 392, t, 0.22, 'sine', 0.13, 370); tone(c, 330, t + 0.22, 0.4, 'sine', 0.13, 262); },
    chapter: function (c) { var t = seq(c, ['C5', 'C5', 'G5', 'G5', ['A5', 'F5'], ['A5', 'F5'], ['G5', 'E5', 'C5'], null, ['C6', 'G5', 'E5']], 0.13, 'triangle', 0.15); sparkle(c, t - 0.2, 12); },
    course: function (c) { var t = seq(c, ['C5', 'E5', 'G5', 'C6', null, 'G5', 'C6', ['E6', 'C6', 'G5'], null, ['G6', 'E6', 'C6']], 0.12, 'triangle', 0.15); sparkle(c, t - 0.2, 16); },
    trash: function (c) { var t = c.currentTime + 0.01; tone(c, 520, t, 0.16, 'square', 0.05, 160); },
    pop: function (c) { var t = c.currentTime + 0.01; tone(c, 660, t, 0.07, 'sine', 0.08, 990); }
  };
  api.play = function (name) {
    if (api.mode === 'off' || !SFX[name]) return;
    var c = ac(); if (!c) return;
    try { SFX[name](c); } catch (e) {}
  };
  function voiceFor(lang) {
    try { var vs = root.speechSynthesis.getVoices() || []; var pre = lang === 'tr' ? 'tr' : 'en';
      return vs.filter(function (v) { return String(v.lang || '').toLowerCase().indexOf(pre) === 0; })[0] || null; } catch (e) { return null; }
  }
  if (root.speechSynthesis && root.speechSynthesis.getVoices) { try { root.speechSynthesis.getVoices(); } catch (e) {} }
  api.say = function (text, lang, delay) {
    if (api.mode !== 'all' || !text || !root.speechSynthesis) return;
    var v = voiceFor(lang); if (!v) return;       /* o dilde ses yoksa yanlış aksanla konuşmaz */
    setTimeout(function () {
      try { root.speechSynthesis.cancel(); var u = new root.SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = 1.05; u.pitch = 1.25; root.speechSynthesis.speak(u); } catch (e) {}
    }, delay || 0);
  };
  root.SOUNDS = api;
})(typeof window !== 'undefined' ? window : this);
