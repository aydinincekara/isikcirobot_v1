/* afi kod - küçük çizgi ikonlar (24x24, renk yazının rengini alır) */
(function (root) {
  'use strict';
  var P = {
    sofa: '<path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 18v-5a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v5z"/><path d="M5 18v2M19 18v2"/>',
    door: '<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M3 21h18"/><circle cx="14.5" cy="12" r="1" fill="currentColor"/>',
    pot: '<path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M2 10h20"/><path d="M9 6.5c0-1.2 1-1.3 1-2.5M14 6.5c0-1.2 1-1.3 1-2.5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l2 2M15 8l2 2"/>',
    car: '<path d="M3 16v-3l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v3z"/><path d="M3 13h18"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>',
    leaf: '<path d="M5 19C5 10 11 5 20 5c0 9-5 15-14 15"/><path d="M5 19l8-8"/>',
    star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    homeSignal: '<path d="M3 12l9-7 9 7"/><path d="M5 11v9h14v-9"/><path d="M9.5 15.5a3.5 3.5 0 0 1 5 0M11.2 17.3a1.2 1.2 0 0 1 1.6 0"/>',
    chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.01"/>',
    play: '<path d="M7 4.5l12 7.5-12 7.5z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.01"/>',
    book: '<path d="M4 5c3-1.5 5.5-1.5 8 0v14c-2.5-1.5-5-1.5-8 0zM20 5c-3-1.5-5.5-1.5-8 0v14c2.5-1.5 5-1.5 8 0z"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v3M9 20h6M10 16h4v4h-4z"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6M21 20a5 5 0 0 0-4-5"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    plug: '<path d="M9 2v5M15 2v5"/><path d="M6 7h12v4a6 6 0 0 1-12 0z"/><path d="M12 17v5"/>',
    wave: '<path d="M2 12h3l3-7 4 14 3-7h7"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    bolt: '<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>',
    signal: '<path d="M3 12h3l2-4 3 8 2-4h3"/><path d="M19 7v10"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    thermo: '<path d="M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0z"/><path d="M12 10v6"/>',
    radar: '<circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M5 12a7 7 0 0 1 7-7M8.5 12A3.5 3.5 0 0 1 12 8.5M19 12a7 7 0 0 1-7 7M15.5 12a3.5 3.5 0 0 1-3.5 3.5"/>',
    hand: '<path d="M9 12V5.5a1.5 1.5 0 0 1 3 0V11M12 10.5V4.5a1.5 1.5 0 0 1 3 0v7M15 10a1.5 1.5 0 0 1 3 0v4a7 7 0 0 1-7 7h-.5A5.5 5.5 0 0 1 5 15.5V13a1.5 1.5 0 0 1 3 0v1"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    chevR: '<path d="M9 5l7 7-7 7"/>',
    map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
  };
  root.ICONS = P;
  root.ic = function (name, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.info) + '</svg>';
  };
  /* Düzey ikonu: dolu çubuk sayısı düzeyi gösterir */
  root.icTier = function (tier) {
    var n = tier === 'hard' ? 3 : tier === 'mid' ? 2 : 1, h = [5, 9, 13];
    var bars = h.map(function (hh, i) { return '<rect x="' + (4 + i * 6) + '" y="' + (19 - hh) + '" width="4" height="' + hh + '" rx="1" fill="currentColor" opacity="' + (i < n ? 1 : 0.25) + '" stroke="none"/>'; }).join('');
    return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + bars + '</svg>';
  };
  root.ROOM_ICON = { salon: 'sofa', koridor: 'door', mutfak: 'pot', 4: 'key', 5: 'car', 6: 'leaf', 7: 'star', 8: 'homeSignal', 9: 'chip', 10: 'terminal' };
})(typeof window !== 'undefined' ? window : this);
