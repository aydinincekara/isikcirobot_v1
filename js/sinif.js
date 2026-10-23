/* afi kod - sınıf modu
 * Uygulama bir afi sınıf sunucusundan (öğretmen bilgisayarı) ya da öğrenci istemcisinden (afi-istemci) açıldıysa
 * bunu kendisi anlar ve:
 *   - öğrencinin ilerlemesini sunucuya gönderir; başka bilgisayarda aynı ad + robotla girince ilerlemeyi geri getirir,
 *   - birkaç saniyede bir canlı durumu (hangi adımda, çalışıyor mu, yıldızlar) gönderir,
 *   - öğretmenin mesajlarını ve "yeni sürüm hazır" bildirimini gösterir,
 *   - "Çözümü yükle" düğmesini yalnızca giriş yapmış öğretmene açar.
 * GitHub sayfasında ya da dosyadan açıldığında hiçbir şey yapmaz.
 */
(function (root) {
  'use strict';
  var UYG = 'afi-kod', NABIZ_MS = 8000;
  var S = { aktif: false, bilgi: null, ogretmen: false, bagli: false, api: null, kuyruk: [], zaman: {}, gosterilen: {} };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function istek(yol, veri, zaman) {
    return new Promise(function (res, rej) {
      var x = new XMLHttpRequest(), bitti = false;
      x.open(veri ? 'POST' : 'GET', '/api/v1/' + yol, true);
      x.timeout = zaman || 5000;
      x.setRequestHeader('Content-Type', 'application/json');
      x.onload = function () { bitti = true; if (x.status >= 200 && x.status < 300) { try { res(JSON.parse(x.responseText || 'null')); } catch (e) { rej(e); } } else rej(new Error(x.status)); };
      x.onerror = x.ontimeout = function () { if (!bitti) rej(new Error('ag')); };
      x.send(veri ? JSON.stringify(veri) : null);
    });
  }
  function T(tr, en) { return S.api && S.api.lang() === 'en' ? en : tr; }

  /* ---------- görünüm: bağlantı rozeti, bildirimler ---------- */
  var css = '.sinifchip{display:inline-flex;align-items:center;gap:6px;height:30px;border-radius:999px;border:1px solid var(--line);background:var(--panel);padding:0 10px;font-size:.78rem;font-weight:800;color:var(--ink-2);white-space:nowrap}' +
    '.sinifchip i{width:9px;height:9px;border-radius:50%;background:var(--ok);display:inline-block}.sinifchip[data-off] i{background:var(--lamp)}' +
    '.sinifbildirim{position:fixed;right:16px;bottom:16px;z-index:45;display:flex;flex-direction:column;gap:10px;max-width:min(420px,calc(100vw - 32px))}' +
    '.sinifkart{background:var(--panel);border:2px solid var(--accent);border-radius:14px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.18);display:flex;flex-direction:column;gap:8px;animation:sinifgir .25s ease-out}' +
    '.sinifkart b{font-family:var(--f-display);font-weight:600}.sinifkart p{margin:0;color:var(--ink);font-size:1rem;white-space:pre-wrap}.sinifkart .row{display:flex;gap:8px;justify-content:flex-end}' +
    '@keyframes sinifgir{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}';
  function rozet(bagli) {
    var c = document.getElementById('sinifChip');
    if (!c) {
      var st = el('style'); st.textContent = css; document.head.appendChild(st);
      c = el('span', 'sinifchip'); c.id = 'sinifChip';
      var tools = document.querySelector('.tools'); if (tools) tools.insertBefore(c, tools.firstChild);
    }
    S.bagli = bagli;
    c.innerHTML = '<i></i>' + esc(bagli ? T('Sınıfa bağlı', 'Connected to class') : T('Sınıf bağlantısı yok', 'Class offline'));
    c.title = bagli ? (S.bilgi && S.bilgi.ad || '') : T('Çalışmaya devam edebilirsin; bağlantı gelince her şey gönderilir.', 'You can keep working; everything is sent when the connection is back.');
    if (bagli) c.removeAttribute('data-off'); else c.setAttribute('data-off', '');
    if (S.bilgi && S.bilgi.rol === 'istemci' && !c.onclick) {      /* öğrenci istemcisi: tıklayınca bağlantı ayarları */
      c.style.cursor = 'pointer'; c.setAttribute('role', 'button'); c.tabIndex = 0;
      c.onclick = function () { window.open('/durum', '_blank'); };
    }
  }
  function panelDugmesi(ad) {
    if (document.getElementById('sinifPanel')) return;
    var c = document.getElementById('sinifChip'), b = el('a', 'sinifchip', '◧ ' + esc(T('Öğretmen paneli', 'Teacher panel')));
    b.id = 'sinifPanel'; b.href = '/panel/'; b.target = '_blank'; b.rel = 'noopener'; b.style.textDecoration = 'none'; b.title = ad || '';
    if (c && c.parentNode) c.parentNode.insertBefore(b, c.nextSibling);
  }
  function kutu() {
    var k = document.getElementById('sinifBildirim');
    if (!k) { k = el('div', 'sinifbildirim'); k.id = 'sinifBildirim'; k.setAttribute('role', 'status'); document.body.appendChild(k); }
    return k;
  }
  function bildir(baslik, metin, dugmeler) {
    var kart = el('div', 'sinifkart', '<b>' + esc(baslik) + '</b>' + (metin ? '<p>' + esc(metin) + '</p>' : '') + '<div class="row"></div>');
    var sira = kart.querySelector('.row');
    (dugmeler || [{ ad: T('Tamam', 'OK') }]).forEach(function (d) {
      var b = el('button', 'btn btn-small ' + (d.ana ? 'btn-primary' : 'btn-ghost'), esc(d.ad)); b.type = 'button';
      b.onclick = function () { kart.remove(); if (d.f) d.f(); };
      sira.appendChild(b);
    });
    kutu().appendChild(kart);
    if (root.SOUNDS) root.SOUNDS.play('pop');
    return kart;
  }

  /* ---------- veri ---------- */
  function kimlik() {
    if (S.ogretmen) return null;          /* öğretmen derste gösterirken öğrenci listesine girmez */
    var p = S.api.profil();
    if (!p || p.id === 'guest') return null;
    return { ad: p.name, robot: S.api.robot() };
  }
  function birlestir(yerel, uzak) {
    if (!uzak) return yerel;
    var out = JSON.parse(JSON.stringify(yerel || {})); out.stars = out.stars || {}; out.ws = out.ws || {}; out.seen = out.seen || {};
    Object.keys(uzak.stars || {}).forEach(function (k) { out.stars[k] = Math.max(out.stars[k] || 0, uzak.stars[k] || 0); });
    Object.keys(uzak.ws || {}).forEach(function (k) { if (!out.ws[k]) out.ws[k] = uzak.ws[k]; });
    Object.keys(uzak.seen || {}).forEach(function (k) { out.seen[k] = true; });
    if (!out.last && uzak.last) out.last = uzak.last;
    return out;
  }
  function ilerlemeGonder(tam) {
    var k = kimlik(); if (!k) return;
    var p = S.api.pdata(), veri = { stars: p.stars, seen: p.seen, last: p.last, ws: {} };
    if (tam) veri.ws = p.ws; else { var cur = S.api.adim().id; if (p.ws[cur]) veri.ws[cur] = p.ws[cur]; }
    istek('ilerleme', { uygulama: UYG, ogrenci: k, veri: veri }).catch(function () { S.bekleyenTam = true; });
  }
  function nabiz() {
    var k = kimlik(); if (!k) return;
    var d = S.api.adim(), olaylar = S.kuyruk.splice(0, 20);
    istek('nabiz', { uygulama: UYG, ogrenci: k, cihaz: { ad: S.bilgi && S.bilgi.cihaz || '', istemci: S.bilgi && S.bilgi.rol === 'istemci', ip: S.bilgi && S.bilgi.ip },
      adim: { id: d.id, ad: d.ad }, durum: d.durum, yildiz: d.yildiz, biten: d.biten, olaylar: olaylar }, 6000).then(function (c) {
      rozet(!c.cevrimdisi);
      if (S.bekleyenTam && !c.cevrimdisi) { S.bekleyenTam = false; ilerlemeGonder(true); }
      (c.mesajlar || []).forEach(mesaj);
      if (c.surum && root.AFI_VERSION && c.surum !== root.AFI_VERSION) surumHazir(c.surum);
    }).catch(function () { S.kuyruk = olaylar.concat(S.kuyruk).slice(0, 60); rozet(false); });
  }
  function mesaj(m) {
    if (S.gosterilen[m.id]) return; S.gosterilen[m.id] = 1;
    if (m.tur === 'surum') { var v = String(m.metin || '').split(' ')[1]; if (v && v !== root.AFI_VERSION) surumHazir(v); return; }
    bildir(T('Öğretmenden mesaj', 'Message from your teacher') + (m.gonderen ? ' · ' + m.gonderen : ''), m.metin);
  }
  function surumHazir(v) {
    if (S.surumBildirildi === v) return; S.surumBildirildi = v;
    bildir(T('Yeni sürüm hazır: ', 'New version ready: ') + v, T('Kaldığın yer kaydedildi. Yenilemek için düğmeye bas.', 'Your work is saved. Press the button to reload.'),
      [{ ad: T('Sonra', 'Later') }, { ad: T('Şimdi yenile', 'Reload now'), ana: true, f: function () { S.api.kaydet(); setTimeout(function () { location.reload(); }, 150); } }]);
  }

  /* ---------- uygulamanın çağırdığı işlevler ---------- */
  var api = {
    aktif: function () { return S.aktif; },
    ogretmen: function () { return S.ogretmen; },
    baglan: function (a) {
      S.api = a;
      if (!/^https?:$/.test(location.protocol) || /github\.io$/i.test(location.hostname)) return;
      istek('bilgi', null, 2500).then(function (b) {
        if (!b || b.sistem !== 'afi-sinif') return;
        S.aktif = true; S.bilgi = b; rozet(b.rol !== 'istemci' || !!b.sunucu_bagli);
        istek('ben').then(function (k) {
          S.ogretmen = !!(k && k.ogretmen); a.ogretmenDegisti(S.ogretmen);
          if (S.ogretmen) panelDugmesi(k.ad);
          else if (/^#(ogretmen|teacher)$/i.test(location.hash) && b.rol !== 'istemci')
            bildir(T('Öğretmen modu', 'Teacher mode'), T('Sınıfta "Çözümü yükle" düğmesi, öğretmen paneline giriş yapınca açılır. Panelde "AFİ KOD\'u aç" düğmesini kullanın.', 'In class, the solution button is available after signing in to the teacher panel. Use "Open AFI CODE" in the panel.'),
              [{ ad: T('Kapat', 'Close') }, { ad: T('Öğretmen paneli', 'Teacher panel'), ana: true, f: function () { location.href = '/panel/'; } }]);
        }).catch(function () {});
        if (a.profil()) api.profilAcildi();
        setInterval(nabiz, NABIZ_MS);
        setTimeout(nabiz, 800);
        a.ogretmenDegisti(false);
      }).catch(function () {});
    },
    /* Profil açılınca: sunucudaki ilerlemeyi getir, birleştir, sonra tamamını gönder */
    profilAcildi: function () {
      if (!S.aktif) return;
      var k = kimlik(); if (!k) return;
      istek('ilerleme?uygulama=' + UYG + '&ad=' + encodeURIComponent(k.ad) + '&robot=' + encodeURIComponent(k.robot)).then(function (c) {
        if (c && c.veri) {
          var once = JSON.stringify(S.api.pdata().stars), yeni = birlestir(S.api.pdata(), c.veri);
          S.api.pdataYaz(yeni);
          if (JSON.stringify(yeni.stars) !== once) bildir(T('İlerlemen geldi', 'Your progress is here'), T('Sınıftaki kaydın bu bilgisayara aktarıldı.', 'Your class record was loaded on this computer.'));
        }
        ilerlemeGonder(true);
      }).catch(function () { S.bekleyenTam = true; });
      nabiz();
    },
    /* Robot ya da ad değişince kayıt yeni kimliğe taşınır */
    kimlikDegisti: function (eski) {
      if (!S.aktif) return;
      var k = kimlik(); if (!k || !eski) return;
      istek('kimlik', { uygulama: UYG, eski: eski, yeni: k }).catch(function () {}).then(function () { ilerlemeGonder(true); });
    },
    kaydedildi: function () {
      if (!S.aktif) return;
      clearTimeout(S.zaman.il); S.zaman.il = setTimeout(function () { ilerlemeGonder(false); }, 2500);
    },
    calismaDegisti: function () {
      if (!S.aktif) return;
      clearTimeout(S.zaman.an); S.zaman.an = setTimeout(function () {
        var k = kimlik(); if (!k) return;
        var d = S.api.adim();
        istek('anlik', { uygulama: UYG, ogrenci: k, adim: d.id, ws: S.api.pdata().ws[d.id] || null, kod: S.api.kod() }).catch(function () {});
      }, 2500);
    },
    olay: function (tur, ayrinti) {
      if (!S.aktif) return;
      S.kuyruk.push({ zaman: Date.now() / 1000, tur: tur, adim: S.api.adim().id, ayrinti: ayrinti || null });
      clearTimeout(S.zaman.nb); S.zaman.nb = setTimeout(nabiz, 600);
    }
  };
  root.SINIF = api;
})(typeof window !== 'undefined' ? window : this);
