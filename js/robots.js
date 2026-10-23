/* afi kod - robot tipleri
 * Her robot 100 birimlik bir kutuda, merkezi (0,0), yüzü yukarı (-y) bakacak şekilde çizilir.
 * Izgarada robot döndükçe yüzü gittiği yönü gösterir.
 * ROBOTS.draw(ctx, tip, x, y, boyut, { angle, flash, glow })   boyut: robotun kapladığı genişlik (piksel)
 * ROBOTS.avatar(tip) -> <img> için resim adresi (önbellekli)
 */
(function (root) {
  'use strict';
  var INK = '#1A2230';
  function rr(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function circ(c, x, y, r, fill) { c.fillStyle = fill; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  function ell(c, x, y, rx, ry, rot, fill) { c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); c.fill(); }
  function eye(c, x, y, r) {
    circ(c, x, y, r, '#FFFFFF');
    circ(c, x, y - r * 0.22, r * 0.58, INK);
    circ(c, x - r * 0.2, y - r * 0.45, r * 0.22, '#FFFFFF');
  }
  function smile(c, x, y, w, col) {
    c.strokeStyle = col || INK; c.lineWidth = 2.6; c.lineCap = 'round';
    c.beginPath(); c.arc(x, y - w * 0.55, w, Math.PI * 0.28, Math.PI * 0.72); c.stroke();
  }
  function lamp(c, x, y, r, o) {
    var f = o.flash || 0;
    if (f > 0) {
      var g = c.createRadialGradient(x, y, r * 0.3, x, y, r * (2.4 + f * 1.6));
      g.addColorStop(0, 'rgba(255,214,110,' + (0.9 * f) + ')'); g.addColorStop(1, 'rgba(255,214,110,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r * (2.4 + f * 1.6), 0, Math.PI * 2); c.fill();
    }
    circ(c, x, y, r + 2.2, 'rgba(0,0,0,.25)');
    circ(c, x, y, r, f > 0 ? '#FFE48A' : '#F5A524');
    circ(c, x - r * 0.3, y - r * 0.3, r * 0.32, 'rgba(255,255,255,.75)');
  }
  function cheeks(c, dx, y, r) { c.globalAlpha = 0.5; circ(c, -dx, y, r, '#FF8FA3'); circ(c, dx, y, r, '#FF8FA3'); c.globalAlpha = 1; }

  var TYPES = {
    afi: { name: { tr: 'afi', en: 'afi' }, color: '#2F6FE4',
      draw: function (c, o) {
        [-1, 1].forEach(function (s) {
          c.fillStyle = '#2B3440'; rr(c, s > 0 ? 36 : -48, -30, 12, 60, 4); c.fill();
          c.fillStyle = '#4A5566'; for (var k = -24; k < 28; k += 10) c.fillRect(s > 0 ? 38 : -46, k, 8, 4);
        });
        c.fillStyle = '#2F6FE4'; rr(c, -40, -42, 80, 84, 22); c.fill();
        c.fillStyle = 'rgba(255,255,255,.16)'; rr(c, -34, -38, 68, 18, 10); c.fill();
        c.fillStyle = '#E8F1FF'; rr(c, -30, -33, 60, 36, 14); c.fill();
        eye(c, -13, -17, 8.5); eye(c, 13, -17, 8.5);
        cheeks(c, 23, -6, 4); smile(c, 0, -6, 6);
        lamp(c, 0, 22, 8.5, o);
      } },
    bicir: { name: { tr: 'Bıcır', en: 'Bubbles' }, color: '#22A06B',
      draw: function (c, o) {
        circ(c, 0, 0, 46, '#1E8A5C');
        circ(c, 0, 2, 41, '#2DBE80');
        c.strokeStyle = '#176B47'; c.lineWidth = 7; c.lineCap = 'round';
        c.beginPath(); c.arc(0, 0, 44, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
        circ(c, 0, -2, 30, '#45D195');
        eye(c, -12, -16, 8); eye(c, 12, -16, 8);
        cheeks(c, 22, -5, 4); smile(c, 0, -5, 6);
        lamp(c, 0, 20, 8, o);
      } },
    pati: { name: { tr: 'Pati', en: 'Paws' }, color: '#F28C28',
      draw: function (c, o) {
        c.strokeStyle = '#C96A14'; c.lineWidth = 9; c.lineCap = 'round';
        c.beginPath(); c.moveTo(0, 36); c.quadraticCurveTo(10, 54, 26, 48); c.stroke();
        [-1, 1].forEach(function (s) {
          c.fillStyle = '#F28C28'; c.beginPath(); c.moveTo(s * 38, -16); c.lineTo(s * 30, -50); c.lineTo(s * 8, -34); c.closePath(); c.fill();
          c.fillStyle = '#FFB3C0'; c.beginPath(); c.moveTo(s * 31, -22); c.lineTo(s * 28, -41); c.lineTo(s * 15, -32); c.closePath(); c.fill();
        });
        c.fillStyle = '#F28C28'; rr(c, -40, -38, 80, 78, 32); c.fill();
        c.fillStyle = '#FFE2C4'; rr(c, -24, -6, 48, 34, 16); c.fill();
        c.strokeStyle = '#D9731A'; c.lineWidth = 3.5; c.lineCap = 'round';
        [-8, 0, 8].forEach(function (dx) { c.beginPath(); c.moveTo(dx, -36); c.lineTo(dx * 0.8, -27); c.stroke(); });
        eye(c, -14, -14, 8); eye(c, 14, -14, 8);
        c.fillStyle = '#FF7A93'; c.beginPath(); c.moveTo(-4, -2); c.lineTo(4, -2); c.lineTo(0, 3); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(26,34,48,.55)'; c.lineWidth = 1.8;
        [-1, 1].forEach(function (s) { [-1, 3].forEach(function (dy) { c.beginPath(); c.moveTo(s * 10, 1 + dy); c.lineTo(s * 30, -2 + dy * 2); c.stroke(); }); });
        c.fillStyle = '#E5484D'; rr(c, -26, 22, 52, 6, 3); c.fill();
        lamp(c, 0, 30, 7, o);
      } },
    rover: { name: { tr: 'Rover', en: 'Rover' }, color: '#E5484D',
      draw: function (c, o) {
        [[-48, -36], [36, -36], [-48, 14], [36, 14]].forEach(function (p) {
          c.fillStyle = '#23262E'; rr(c, p[0], p[1], 12, 24, 4); c.fill();
          c.fillStyle = '#4A505C'; c.fillRect(p[0] + 2, p[1] + 10, 8, 4);
        });
        c.fillStyle = '#E5484D'; rr(c, -37, -48, 74, 96, 20); c.fill();
        c.fillStyle = 'rgba(255,255,255,.18)'; rr(c, -31, -45, 62, 10, 5); c.fill();
        circ(c, -24, -40, 5.5, '#FFE38A'); circ(c, 24, -40, 5.5, '#FFE38A');
        c.fillStyle = '#BFE3FF'; rr(c, -27, -33, 54, 26, 9); c.fill();
        eye(c, -11, -21, 7.5); eye(c, 11, -21, 7.5);
        c.fillStyle = '#C8353A'; rr(c, -27, -2, 54, 40, 10); c.fill();
        c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, -21, 4, 42, 8, 4); c.fill();
        lamp(c, 0, 20, 8, o);
      } },
    zipzip: { name: { tr: 'Zıpzıp', en: 'Hoppy' }, color: '#8B6FD6',
      draw: function (c, o) {
        [-1, 1].forEach(function (s) {
          ell(c, s * 16, -44, 9, 22, s * 0.18, '#8B6FD6');
          ell(c, s * 16, -44, 4.5, 15, s * 0.18, '#FFB3C0');
        });
        circ(c, 0, 44, 10, '#FFFFFF');
        c.fillStyle = '#8B6FD6'; rr(c, -38, -32, 76, 74, 34); c.fill();
        c.fillStyle = '#EDE6FF'; rr(c, -22, 0, 44, 30, 15); c.fill();
        eye(c, -13, -12, 8); eye(c, 13, -12, 8);
        circ(c, 0, 1, 3.6, '#FF7A93');
        c.fillStyle = '#FFFFFF'; rr(c, -4, 4, 8, 7, 1.5); c.fill();
        cheeks(c, 22, -1, 4);
        lamp(c, 0, -27, 6.5, o);
      } },
    bocuk: { name: { tr: 'Böcük', en: 'Ladybug' }, color: '#D93A40',
      draw: function (c, o) {
        c.strokeStyle = '#23262E'; c.lineWidth = 3; c.lineCap = 'round';
        [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(s * 7, -42); c.quadraticCurveTo(s * 12, -54, s * 20, -56); c.stroke(); circ(c, s * 20, -56, 4, '#23262E'); });
        c.fillStyle = '#23262E';
        [-1, 1].forEach(function (s) { [-10, 6, 22].forEach(function (y) { c.save(); c.translate(s * 38, y); c.rotate(s * 0.35); c.fillRect(0, -2, s * 12, 4); c.restore(); }); });
        circ(c, 0, -30, 21, '#23262E');
        circ(c, 0, 8, 40, '#D93A40');
        c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(-14, -10, 12, 7, -0.6, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#23262E'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(0, -24); c.lineTo(0, 48); c.stroke();
        [[-20, -2, 7], [20, -2, 7], [-24, 24, 6.5], [24, 24, 6.5], [-11, 40, 5], [11, 40, 5]].forEach(function (p) { circ(c, p[0], p[1], p[2], '#23262E'); });
        eye(c, -9, -34, 7); eye(c, 9, -34, 7);
        lamp(c, 0, 14, 7, o);
      } }
  };
  var ORDER = ['afi', 'bicir', 'pati', 'rover', 'zipzip', 'bocuk'];

  function draw(c, type, x, y, size, o) {
    o = o || {};
    var T = TYPES[type] || TYPES.afi, k = size / 100;
    c.save(); c.translate(x, y);
    if (o.glow > 0) {
      c.globalAlpha = Math.min(1, o.glow) * 0.55; circ(c, 0, 0, size * 0.66, o.glowColor || '#BFD6FF'); c.globalAlpha = 1;
    }
    c.save(); c.scale(k, k);
    c.fillStyle = 'rgba(0,0,0,.13)'; c.beginPath(); c.ellipse(0, 8, 44, 42, 0, 0, Math.PI * 2); c.fill();
    c.restore();
    c.rotate((o.angle || 0) * Math.PI / 180); c.scale(k, k);
    T.draw(c, o);
    c.restore();
  }
  var cache = {};
  function avatar(type, px) {
    px = px || 96; var key = type + ':' + px;
    if (cache[key]) return cache[key];
    try {
      var cv = document.createElement('canvas'); cv.width = cv.height = px;
      draw(cv.getContext('2d'), type, px / 2, px / 2 + px * 0.04, px * 0.74, {});
      cache[key] = cv.toDataURL('image/png');
    } catch (e) { cache[key] = ''; }
    return cache[key];
  }
  function valid(type) { return TYPES[type] ? type : 'afi'; }
  root.ROBOTS = { TYPES: TYPES, ORDER: ORDER, draw: draw, avatar: avatar, valid: valid };
})(typeof window !== 'undefined' ? window : this);
