/* afi kod - Word kılavuzunu uygulamanın kendi veri dosyalarından üretir.
 * Kullanım: node tools/make_guide.js [çıktı.docx]     (gerekli: npm i docx@9, ayrıca tools/env.js'teki Blockly)
 */
const fs = require('fs'), path = require('path');
const { load, ROOT, NM } = require('./env.js');
const D = require(NM + 'docx');
const C = load(['version.js', 'engine.js', 'i18n.js', 'i18n-home.js', 'i18n-py.js', 'blocks.js', 'home.js', 'home-blocks.js', 'kind-turtle.js', 'kind-game.js', 'kind-ai.js', 'levels.js', 'levels-extra.js', 'levels-home.js', 'levels-py.js', 'sensors.js']);
const VER = C.AFI_VERSION;
const { COURSE, SENSORS, HOME, HomeBlocks: HB, RobotBlocks: RB, Blockly: B, Engine } = C;
const OUT = process.argv[2] || path.join(ROOT, 'afi-kod-kilavuz.docx');

const SITE = 'https://aydinincekara.github.io/isikcirobot_v1/', REPO = 'https://github.com/aydinincekara/isikcirobot_v1';
const FONT = 'Calibri', MONO = 'Consolas', BLUE = '1F4E79', ACC = '2563C9';
const STEPS = []; COURSE.chapters.forEach(ch => ch.lessons.forEach((ls, li) => ls.steps.forEach((st, si) => STEPS.push({ ch, ls, li, si, st }))));
const HOMESTEPS = STEPS.filter(s => s.st.kind === 'home');

/* ---------- yardımcılar ---------- */
function runs(text, o) {
  o = o || {};
  const out = [], re = /(\*\*[^*]+\*\*|`[^`]+`)/g; let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new D.TextRun({ text: text.slice(last, m.index), font: FONT, size: o.size || 21, color: o.color }));
    const t = m[0];
    if (t[0] === '*') out.push(new D.TextRun({ text: t.slice(2, -2), bold: true, font: FONT, size: o.size || 21, color: o.color }));
    else out.push(new D.TextRun({ text: t.slice(1, -1), font: MONO, size: (o.size || 21) - 2, color: o.color || '7A1F5C' }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new D.TextRun({ text: text.slice(last), font: FONT, size: o.size || 21, color: o.color }));
  return out;
}
const P = (t, o) => new D.Paragraph({ children: runs(t, o), spacing: { after: 120, line: 276 } });
const H1 = t => new D.Paragraph({ children: [new D.TextRun({ text: t, bold: true, font: FONT, size: 34, color: BLUE })], heading: D.HeadingLevel.HEADING_1, spacing: { before: 240, after: 160 }, pageBreakBefore: true });
const H2 = t => new D.Paragraph({ children: [new D.TextRun({ text: t, bold: true, font: FONT, size: 27, color: BLUE })], heading: D.HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 }, keepNext: true });
const H3 = t => new D.Paragraph({ children: [new D.TextRun({ text: t, bold: true, font: FONT, size: 23, color: '2E5C8A' })], heading: D.HeadingLevel.HEADING_3, spacing: { before: 180, after: 80 }, keepNext: true });
const B1 = t => new D.Paragraph({ children: runs(t), bullet: { level: 0 }, spacing: { after: 60 } });
let numInst = 0;
function NUM(items) { numInst++; return items.map(t => new D.Paragraph({ children: runs(t), numbering: { reference: 'num', level: 0, instance: numInst }, spacing: { after: 60 } })); }
function NOTE(t, fill, border) {
  return new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, rows: [new D.TableRow({ children: [new D.TableCell({
    children: [new D.Paragraph({ children: runs(t, { size: 20 }) })], shading: { type: D.ShadingType.CLEAR, fill: fill || 'EAF1FB', color: 'auto' },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    borders: { left: { style: D.BorderStyle.SINGLE, size: 18, color: border || ACC }, top: { style: D.BorderStyle.NONE }, bottom: { style: D.BorderStyle.NONE }, right: { style: D.BorderStyle.NONE } } })] })] });
}
function CODE(lines) {
  return new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, rows: [new D.TableRow({ children: [new D.TableCell({
    children: lines.map(l => new D.Paragraph({ children: [new D.TextRun({ text: l || ' ', font: MONO, size: 17 })], spacing: { after: 0 } })),
    shading: { type: D.ShadingType.CLEAR, fill: 'F4F6F9', color: 'auto' }, margins: { top: 80, bottom: 80, left: 120, right: 120 } })] })] });
}
function TABLE(head, rows, widths, small) {
  const sz = small ? 17 : 19;
  const cell = (t, i, hd) => new D.TableCell({
    width: { size: widths[i], type: D.WidthType.PERCENTAGE },
    shading: hd ? { type: D.ShadingType.CLEAR, fill: 'DCE6F2', color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: String(t).split('\n').map(line => new D.Paragraph({ children: hd ? [new D.TextRun({ text: line, bold: true, font: FONT, size: sz })] : runs(line, { size: sz }), spacing: { after: 0 } })) });
  return new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE },
    rows: [new D.TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, i, true)) })].concat(rows.map(r => new D.TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, i, false)) }))) });
}
const SP = () => new D.Paragraph({ children: [], spacing: { after: 80 } });
const L = o => (o ? o.tr : '');

const C_ = [];
const add = (...x) => x.forEach(e => Array.isArray(e) ? e.forEach(y => C_.push(y)) : C_.push(e));

/* ---------- kapak ---------- */
add(new D.Paragraph({ children: [new D.TextRun({ text: 'AFİ', bold: true, font: FONT, size: 96, color: ACC }), new D.TextRun({ text: ' KOD', bold: true, font: FONT, size: 96, color: 'E89B12' })], spacing: { before: 1800, after: 120 } }));
add(P("afi'nin blok kodlama serüveni", { size: 32, color: '4A5568' }));
add(new D.Paragraph({ children: [new D.TextRun({ text: 'Proje Bilgilendirme, Kurulum ve Kullanım Kılavuzu', bold: true, font: FONT, size: 30, color: BLUE })], spacing: { before: 400, after: 300 } }));
add(P('Sürüm: **' + VER + '** (' + COURSE.chapters.length + ' bölüm, ' + STEPS.length + ' adım) · 23 Ekim 2026'));
add(P('Proje sahibi: **Aydın İncekara**'));
add(P('Canlı adres: ' + SITE));
add(P('Kaynak kod deposu: ' + REPO));
add(SP(), NOTE('Bu belge, projede bugüne kadar yapılanları, sıfırdan kurulum adımlarını, öğrenci ve öğretmen için kullanımı, Arduino ve Python atölyelerinin nasıl yürütüleceğini ve projenin teknik yapısını tek yerde toplar. Ders ve sensör tabloları uygulamanın kendi veri dosyalarından otomatik üretilmiştir.'));
add(new D.Paragraph({ children: [new D.TextRun({ text: 'İçindekiler', bold: true, font: FONT, size: 27, color: BLUE })], spacing: { before: 500, after: 120 } }));
['1. Proje hakkında', '2. Neler yapıldı: proje günlüğü ve kararlar', '3. Hızlı başlangıç', '4. Kullanım kılavuzu: öğrenci', '5. Kullanım kılavuzu: öğretmen',
 '6. Arduino ve Python atölyeleri', '7. Kurulum: sıfırdan yayınlama ve güncelleme', '8. Teknik yapı', '9. Ders içeriği', '10. Sensör kütüphanesi',
 '11. Yol haritası ve bilinen sınırlar', '12. Sorun giderme', '13. Lisanslar ve kaynaklar', 'Ek A. Tüm adımlar'].forEach(t => add(P(t)));

/* ---------- 1 ---------- */
add(H1('1. Proje hakkında'), H2('1.1 Amaç'));
add(P('afi kod, çocuklara blok kodlamayla programlamayı öğreten ücretsiz bir eğitim uygulamasıdır. Scratch, mBlock ve Lightbot gibi basit bir blok arayüzü kullanır; Blockly Games gibi de blokların gerçek koddaki karşılığını (Python, JavaScript ve Arduino C++) aynı ekranda gösterir.'));
add(P("Uygulama soyut bulmacalar yerine gündelik hayattan bir hikâye anlatır: afi adlı küçük ev robotu, Deniz'in ailesinin evini adım adım akıllı hale getirir. İlk üç bölümde afi evin içinde dolaşarak lambaları yakar (sıralama, döngü, koşul). Dördüncü bölümden itibaren afi evin akıllı sistemine bağlanır: gerçek sensörlerden gelen bilgilere göre lambaları, kapıları, alarmı, pompayı ve vantilatörü yönetir. Son iki bölümde öğrenciler aynı programları Arduino Uno, ESP32 ve Python ile gerçek donanımda ve kendi bilgisayarlarında çalıştırır."));
add(H2('1.2 Hedef kitle ve kullanım yeri'));
add(B1('Bilgi Evleri ve Çocuk Üniversitesi bilişim dersleri; ana hedef 8–14 yaş, Arduino ve Python atölyeleri 12 yaş ve üzeri.'));
add(B1('Eski sınıf bilgisayarları (4 GB RAM, HDD) ve yavaş internet düşünülerek hazırlandı: kurulum gerektirmez, tarayıcıda çalışır, internetsiz de açılır.'));
add(B1('Akıllı tahtada sunum için büyük yazılı bir yerleşim vardır.'));
add(H2('1.3 Temel fikirler'));
add(B1('**Blok + gerçek kod:** Öğrenci blokları dizdikçe programın Python, JavaScript ve (akıllı ev bölümlerinde) Arduino hali canlı olarak görünür. Bir bloğa tıklayınca o bloğun gerçek kodda nasıl yazıldığı ve gerçek hayatta nerede kullanıldığı açıklanır.'));
add(B1('**Hikâye ve gündelik hayat:** Salon, koridor, mutfak, giriş kapısı, garaj, bahçe, çocuk odası ve kontrol merkezi; her oda bir kavram ve birkaç gerçek sensör.'));
add(B1('**Üç düzey:** Her bölümde Başlangıç, Orta ve Zor düzeyleri vardır; her düzeyde 10 adım. Hiçbir adım kilitli değildir; sıradaki önerilen adım hep işaretlidir.'));
add(B1('**Saniye saniye test:** Akıllı ev adımlarında program, sensörlerin değiştiği birkaç senaryoda çalıştırılır ve her saniye cihazların doğru durumda olup olmadığı kontrol edilir. Öğrenci zaman çizelgesinde beklenen ile kendi programının yaptığını yan yana görür.'));
add(B1('**Gerçek dünyaya köprü:** Her akıllı ev adımı tek tıkla gerçek bir Arduino (.ino) ya da Python (.py) dosyasına dönüşür. Python dosyası ek kütüphane istemeden çalışır ve kendi testini yapar.'));
add(H2('1.4 Neyin üzerine kuruldu?'));
add(P("Uygulama sıfırdan değil, Blockly kütüphanesinin üzerine kuruldu. Blockly, Scratch'in ve Code.org'un da temel aldığı açık kaynaklı blok sistemidir; 10 Kasım 2025'te Google'dan Raspberry Pi Vakfı'na geçmiştir ve Apache 2.0 lisansıyla ücretsiz kullanılır. Blockly'den gelen kısımlar: blok alanı (sürükleme, bağlama, yakınlaştırma), eğer/değilse, karşılaştırma, ve/veya, sayı, işlem, değişken ve metin blokları, kod üreteci altyapısı ve Türkçe/İngilizce blok yazıları. Bu projede yazılanlar: robot ve akıllı ev blokları, kod üreteçleri (Arduino dahil), iki ayrı oyun motoru, ev çizimleri, kontrol paneli ve zaman çizelgesi, bölümler ve hikâye, açıklama paneli, profiller, ilerleme kodu, yerleşimler, sensör kütüphanesi, indirilebilir Python benzetim kütüphanesi ve içerik üretici/doğrulayıcı araçlar."));

/* ---------- 2 ---------- */
add(H1('2. Neler yapıldı: proje günlüğü ve kararlar'), H2('2.1 Proje günlüğü'));
add(TABLE(['Tarih', 'Yapılan', 'Sonuç'], [
  ['21 Ekim 2026', 'Derslerde sırayla gösterilecek ücretsiz bilişim platformları araştırıldı; tüm adresler tek tek kontrol edildi.', '80 platformluk Excel tablosu'],
  ['21 Ekim 2026', 'Kendi blok kodlama uygulaması için altyapı karşılaştırıldı (Blockly, Blockly Games, Scratch arayüzü, MakeCode).', 'Blockly seçildi'],
  ['21 Ekim 2026', 'İlk prototip: 6 seviyeli "lambaları yak" oyunu, Türkçe bloklar, canlı Python/JavaScript paneli.', 'İnternetsiz çalışan tek HTML dosyası'],
  ['22 Ekim 2026', 'İhtiyaç analizi ve Aşama 1: TR/EN, sürüklenebilir paneller, yerleşimler, harita, profiller, ilerleme kodu, öğretmen modu, ev hikâyesiyle 3 bölüm (23 adım).', 'Çevrimdışı klasör ve önizleme'],
  ['22 Ekim 2026', 'GitHub Pages yayını: isikcirobot_v1 deposu.', SITE],
  ['23 Ekim 2026', 'Sensör kütüphanesi (15 sensör, Uno/ESP32 şemaları, "Dene ve gör"). Ürün adı "afi kod", robotun adı "afi" oldu. İlk kılavuz.', 'Sürüm 1.1'],
  ['23 Ekim 2026', 'Her bölüme Başlangıç/Orta/Zor düzeyleri (toplam 90 adım), arayüzde ikonlar, daraltılabilir paneller, yükseklik ayarlı blok alanı.', 'Sürüm 1.2'],
  ['23 Ekim 2026', 'Bölüm 4–10 tamamlandı: akıllı ev motoru, kontrol paneli ve zaman çizelgesi, olay/değişken/karşılaştırma/fonksiyon blokları, Arduino (.ino) ve Python (.py) dışa aktarma, 210 yeni adım. Her adım otomatik doğrulandı. Kılavuz yeniden yazıldı.', 'Sürüm 2.0 (300 adım)'],
  ['23 Ekim 2026', 'Robot seçimi (6 robot), sesli tepkiler, blok alanında çöp kutusu, sayılabilir zemin karoları, yeni eşya çizimleri, AFİ KOD logosu, çark dişli ayar ikonu; ilerleme kodu yazılırken tireler kendiliğinden ekleniyor ve yeni sürüm her bilgisayarda kesin yükleniyor.', 'Sürüm 2.1'],
  ['23 Ekim 2026', 'Sürüm numarası slogan yanında; sol sütun katlanabilir ve sabit; fare tekerleğiyle yakınlaştırma kapatıldı; Duraklat düğmesi; "Kim kodluyor?" penceresine Kapat. Yeni "sürekli tekrarla" bloğu (mBlock\'taki gibi, Arduino loop()). Yeni bölümler (10\'ar adım): Arduino II, ESP32 akıllı ev, Python Turtle, Python oyun tasarımı, Python yapay zekâ. Turtle, oyun ve yapay zekâ için üç yeni motor; oyunlar tarayıcıda klavyeyle oynanabilir.', 'Sürüm 2.2 (' + STEPS.length + ' adım)'],
  ['23 Ekim 2026', 'Sınıf sürümü: öğretmen bilgisayarında afi sınıf sunucusu (admin/öğretmen girişi, ağ aralığına göre canlı öğrenci takibi, şu anki blokları görme, mesaj, Excel çıktısı, GitHub\'dan tek tuşla güncelleme ve geri alma) ve öğrenci bilgisayarları için afi istemci (ağ yokken de çalışır, sunucuyu kendisi bulur, güncellemeyi sunucudan alır). Uygulamaya sınıf modu eklendi. Ayrı depo: isikcirobot_offline.', 'Sürüm 2.3 · platform 1.0.0']
], [15, 60, 25]));
add(H2('2.2 Alınan kararlar'));
add(TABLE(['Konu', 'Karar', 'Neden'], [
  ['Altyapı', 'Blockly (Apache 2.0)', 'Ücretsiz, hafif, eski bilgisayarlarda çalışır; blokları gerçek koda çevirir.'],
  ['Arayüz dilleri', 'Türkçe ve İngilizce', 'Proje sahibinin seçimi.'],
  ['Koddaki adlar', 'Arayüz diline göre: `ileri_git()` / `move_forward()`, `giris_lambasi.ac()` / `entrance_light.on()`', 'Türkçede anlaşılır, İngilizcede gerçek koda yakın.'],
  ['Öğrenci ilerlemesi', 'Bilgisayarda profil + taşınabilir ilerleme kodu', 'Sınıf bilgisayarlarını farklı öğrenciler paylaşıyor; sunucu ve hesap gerekmez.'],
  ['Donanım', 'Önce Arduino Uno, ileri seviyede ESP32', 'Setlerin çoğu Uno ile geliyor; ESP32 Wi-Fi\'li akıllı ev projeleri için. Arduino bölümünün Zor düzeyi ESP32 ile yapılır.'],
  ['Bölüm 4–10 sahnesi', 'Izgara yerine akıllı ev kontrol paneli + zaman çizelgesi', 'Sensör ve cihazlarla çalışan programlar ancak zaman içinde görülebilir; beklenen ve gerçekleşen durum yan yana gösterilir.'],
  ['Program modeli', '"başlangıçta" (Arduino setup), "her saniye" (Arduino loop) ve olay blokları', 'Arduino ve Python koduna birebir çevrilebilir; olaylar Arduino\'da "önceki durum" değişkeniyle yazılır.'],
  ['Akıllı ev testi', 'Program 2–3 senaryoda çalışır, her saniyenin ortasında cihaz durumları beklenenle karşılaştırılır', 'Tek bir senaryoya göre ezberlenmiş çözüm geçemez; hata mesajı hangi saniyede neyin yanlış olduğunu söyler.'],
  ['Fonksiyonlar', 'Hazır adlı fonksiyon blokları (gece_modu, sabah_modu ...)', 'Blockly\'nin kendi fonksiyon blokları küçük çocuklar için karmaşık; ad seçmek yeterli.'],
  ['Değişkenler', 'Hazır adlı değişkenler, ilk değer 0', 'Türkçe karakter ve boşluk sorunlarını önler; "değişken adında Türkçe harf kullanılmaz" kuralını öğretir.'],
  ['Python çıktısı', 'İndirilen .py dosyası küçük bir benzetim kütüphanesi içerir', 'Öğrenci evde ek kurulum yapmadan programını çalıştırır ve testi görür.'],
  ['İçerik üretimi', 'Adımlar tools/content dosyalarında yazılır, üretici araç doğrular', 'Her adımda: çözüm iki dilde çalışıyor mu, her blok gerekli mi, boş program başarısız mı, .py dosyası gerçek Python\'da geçiyor mu.'],
  ['Yayın', 'GitHub Pages + çevrimdışı zip', 'İnternet olan sınıflar için bağlantı, internetsiz sınıflar için USB.'],
  ['"her saniye" ve "sürekli tekrarla"', 'İkisi de var', '"her saniye" araya kendiliğinden 1 saniye koyar (Arduino\'da millis() ile); "sürekli tekrarla" mBlock\'taki blok ve Arduino\'daki loop()\'un kendisidir, ritmi bekle blokları belirler.'],
  ['Python bölümleri', 'Turtle, oyun ve yapay zekâ için ayrı motorlar', 'Her biri gerçek Python koduna çevrilir; indirilen dosyalar ek kurulum istemez (turtle Python ile gelir).'],
  ['Oyun testi', 'Senaryodaki tuş basışları adım adım uygulanır', 'Rastgelelik testte sabit sırayla, oynarken gerçekten rastgele; beklenen değerler örnek çözümden.'],
  ['Yapay zekâ testi', 'Gizli test verisinde doğruluk', 'Öğrenci "ezberlemenin" yetmediğini, görmediği örneklerde doğru bilmenin (genelleme) önemli olduğunu görür. Bazı adımlarda iki veri seti vardır: eşik veriden hesaplanmalıdır.'],
  ['Sınıf sürümü', 'Ayrı paket: aynı uygulama + öğretmen bilgisayarında yerel sunucu', 'Aynı ağdaki öğrencileri izlemek ancak yerel sunucuyla mümkün; internet gerekmez, veriler kurumda kalır. Öğrenci bilgisayarına kurulum gerekmez.'],
  ['Sürüm numarası', 'js/version.js tek yerde; python tools/set_version.py 2.3', 'Ekranda slogan yanında görünür; dosya etiketleri (?v=) eski sürümün önbellekten açılmasını önler.']
], [17, 40, 43]));

/* ---------- 3 ---------- */
add(H1('3. Hızlı başlangıç'));
add(TABLE(['Ne için?', 'Adres / yol'], [['Öğrenciler', SITE], ['Öğretmen (çözüm düğmesiyle)', SITE + '#ogretmen'], ['Kaynak kod', REPO], ['İnternetsiz kullanım', 'Depoyu indir (Code > Download ZIP), ayıkla, index.html\'e çift tıkla (bkz. 7.3).']], [30, 70]));
add(SP(), ...NUM(['Adresi Chrome, Edge veya Firefox\'ta aç.', '"Kim kodluyor?" penceresinde öğrencinin adını yaz ve Ekle\'ye bas (ya da listeden adını seç).', 'Bölümün hikâyesini oku ve Başla\'ya bas.',
  'Soldaki görevi oku, ortadaki blok alanına blokları sürükleyip bağla.', 'Çalıştır\'a bas. Görev tamamlanırsa yıldızlar kazanılır ve sonraki adıma geçilir.']));
add(NOTE('Kurulum, internet bağlantısı (çevrimdışı sürümde) ya da yönetici izni gerekmez. Tek gereken güncel bir tarayıcıdır. Sadece Python atölyesinde indirilen dosyaları çalıştırmak için bilgisayarda Python 3 olmalıdır (bkz. 6.3).'));

/* ---------- 4 ---------- */
add(H1('4. Kullanım kılavuzu: öğrenci'), H2('4.1 Ekranın bölümleri'));
add(TABLE(['Bölüm', 'Ne var?'], [
  ['Üst şerit', 'afi kod logosu; bulunduğun bölüm, ders, düzey ve adım; adım baloncukları (dolu = yapıldı, kesik çizgili = sıradaki); Harita, Sensörler, Yerleşim, Ayarlar düğmeleri ve öğrenci adı.'],
  ['Sol sütun', 'Görev kartı (hikâye, görev, Hikâye ve Sesli oku düğmeleri), sahne (Bölüm 1–3\'te afi\'nin evi, Bölüm 4–10\'da kontrol paneli), Çalıştır / Sıfırla, hız ayarı, durum mesajı ve blok sayacı.'],
  ['Orta sütun', 'Blok alanı. Solda o adımda kullanılabilen bloklar, sağda öğrencinin dizdiği program. **Blok alanını büyüt** düğmesi iki yan paneli birden daraltır; alttaki çizgi sürüklenerek yükseklik değiştirilir.'],
  ['Sağ sütun', 'Blokların gerçek kodu (Python, JavaScript, ikisi yan yana ya da Arduino) ve açıklama paneli. Bölüm 4–10\'da altında kart seçimi ve **.py indir** / **.ino indir** düğmeleri vardır.']
], [18, 82]));
add(H2('4.2 Program yazma ve çalıştırma'));
add(...NUM(['Soldaki menüden bir bloğu blok alanına sürükle.', 'Sonraki bloğu öncekinin altına yaklaştır; yerine oturunca birbirine bağlanır.',
  'Döngü, koşul, olay ve fonksiyon bloklarının içine başka bloklar konur. Sayıların ve menülerin üstüne tıklayarak değiştirebilirsin.',
  'Bir bloğu silmek için onu soldaki blok menüsüne geri sürükle. Sürüklerken menünün üstünde büyük bir **çöp kutusu** belirir; blok oraya gelince kırmızıya döner, bırakınca silinir. Sağ alttaki çöp kutusuna bırakmak da siler.',
  'Çalıştır\'a bas. Çalışan blok vurgulanır. **❚❚** düğmesi duraklatır, **▶** devam ettirir; durdurmak için Çalıştır düğmesine (Durdur) bas.', 'Bir hata olursa durum kutusunda nedeni yazar ve ilgili blok vurgulu kalır. Bloğu düzeltince vurgu kalkar.']));
add(NOTE('Blok alanında fare tekerleği sayfayı kaydırır, blokları büyütüp küçültmez; büyütmek ve küçültmek için sağ alttaki **+**, **−** ve ortalama düğmeleri kullanılır. Sol sütundaki görev ve sahne kutuları **Gizle / Göster** düğmeleriyle katlanır; sol sütun sayfa kaydırılsa da ekranda kalır.'));
add(H2('4.3 Yıldızlar'));
add(P('Her adımda "en fazla … blok" hedefi vardır. Hedefin içinde çözersen 3 yıldız, 2 blok fazlasına kadar 2 yıldız, daha uzun çözümlerde 1 yıldız kazanırsın. Hazır sayılar (blokların içindeki yuvarlak sayı kutuları) sayılmaz. Aynı adımı daha kısa çözerek yıldızını artırabilirsin.'));
add(H2('4.4 Düzeyler, ev düzenleri ve senaryolar'));
add(P('Her bölüm üç düzeyden oluşur: **Başlangıç** (bir çubuk), **Orta** (iki çubuk) ve **Zor** (üç çubuk). Düzey, görev başlığının yanındaki renkli etikette ve haritada görünür.'));
add(P('Mutfak bölümünde ev her seferinde biraz farklı olabilir (lambaların yeri, kapılar, yolun şekli). Bölüm 4–10\'da ise her adımda 2–3 **senaryo** vardır: sensörler her senaryoda başka zamanda değişir. Görev kartındaki **Başka düzen göster** düğmesiyle diğerlerine bakılabilir. Program hepsinde çalışmadıkça adım geçilmez; işe yaramadığı düzen ya da senaryo ekranda gösterilir.'));
add(H2('4.5 Akıllı ev sahnesi (Bölüm 4–10)'));
add(B1('**Sensör kartları (sol):** her sensörün o anki değeri. Sayı veren sensörlerde bir çubuk, eşik değerler kırmızı çizgiyle gösterilir.'));
add(B1('**afi (orta):** sensörden gelen bilgi ve cihaza giden komut çizgilerde parlar. Programda değişken varsa değerleri altta mor etiketlerde görünür.'));
add(B1('**Cihaz kartları (sağ):** lamba, LED, alarm, vantilatör, ısıtıcı, pompa, kapı, pencere, perde, vana ve ekran. Çalışırken canlanır (fan döner, alarm titreşir).'));
add(B1('**Zaman çizelgesi (alt):** en üstte her saniye için bir test noktası (yeşil ✓ doğru, kırmızı ✗ yanlış). Sensör satırları ne zaman ne olacağını, turuncu üçgenler olayları gösterir. Cihaz satırlarında açık mavi şerit **beklenen**, yeşil şerit **programın yaptığı**; uyuşmayan saniyeler kırmızıya boyanır.'));
add(B1('Hata olursa program o saniyede durur, ilgili cihaz kırmızı çerçeveyle "olmalı: AÇIK" gibi bir etiket gösterir ve durum kutusunda "5. saniyede Giriş lambası AÇIK olmalıydı, ama programında KAPALI." gibi bir mesaj yazar.'));
add(H2('4.5b Python bölümleri (Bölüm 13–15)'));
add(B1('**Turtle:** Sahne bir çizim kâğıdıdır. Soluk renkli çizgiler hedef çizimdir; afi blokları uygularken çizer. Eksik yerler kırmızı kesik, fazla çizgiler kırmızı gösterilir.'));
add(B1('**Oyun:** Sahnede oyuncu (seçilen robot), elma ve puan görünür. Alttaki şeritte testte hangi adımda hangi tuşa basılacağı ve her adımın test sonucu vardır. Program geçince **🎮 Oyna** düğmesiyle ok tuşları ve boşlukla gerçekten oynanır.'));
add(B1('**Yapay zekâ:** Üstte eğitim verisi (bilinen örnekler), altta afi\'nin hiç görmediği test verisi (? işaretli) vardır. Çalıştırınca afi test örneklerini tek tek tahmin eder; ✓ ve ✗ işaretleri ile Eğitim/Test doğruluk çubukları görünür. Dikey çizgi istenen doğruluktur.'));
add(H2('4.6 Harita ve sensör kütüphanesi'));
add(P('Harita düğmesi ' + COURSE.chapters.length + ' bölümün tamamını, düzeylere ayrılmış dersleri ve ' + STEPS.length + ' adımı gösterir; istenen adıma tıklanarak geçilir. Her bölüm kartında o bölümde kullanılan sensörler listelenir; tıklanınca sensör kütüphanesi açılır. Sensörler düğmesi 15 gerçek sensörün ne işe yaradığını, nasıl çalıştığını, Arduino Uno ve ESP32\'ye nasıl bağlandığını, kaç volt istediğini ve ilk Arduino kodunu anlatır (bkz. Bölüm 10).'));
add(H2('4.7 Başka bilgisayarda devam etmek'));
add(...NUM(['Eski bilgisayarda Ayarlar\'ı aç ve İlerleme kodum kutusundaki kodu not al.', 'Yeni bilgisayarda "Kim kodluyor?" penceresinde İlerleme kodum var\'a tıkla.', 'Adını ve kodu yaz, Kodla devam et\'e bas. Yıldızlar taşınır ve sıradaki adımdan devam edilir.']));
add(P('Kodu yazarken tireler kendiliğinden eklenir; küçük harf ya da tiresiz yazmak da olur. Kodlarda I, O, 0 ve 1 harfleri hiç yoktur.'));
add(NOTE('İlerleme kodu sadece yıldızları taşır; öğrencinin dizdiği bloklar eski bilgisayarda kalır. Sırayla ilerleyen bir öğrencinin kodu kısadır (örneğin ilk 150 adımı 3 yıldızla bitiren öğrencinin kodu 14 harftir). Eski sürümlerin kodları da geçerlidir.'));
add(H2('4.8 Robotunu seç'));
add(P('Yeni öğrenci eklerken "Robotunu seç" satırından altı robottan biri seçilir: **afi** (mavi), **Bıcır** (yeşil, yuvarlak), **Pati** (kedi), **Rover** (araba), **Zıpzıp** (tavşan) ve **Böcük** (uğur böceği). Seçilen robot evde dolaşır, kontrol panelinde ve hikâye penceresinde görünür. Robot sonradan Ayarlar > Robotum bölümünden istenildiği zaman değiştirilir; ilerleme etkilenmez.'));
add(H2('4.9 Sesli tepkiler'));
add(P('Görev başarılınca yıldız sayısına göre farklı bir müzik çalar (3 yıldızda konfeti de yağar), program işe yaramazsa kısa bir "olmadı" sesi duyulur, bir bölümün bütün adımları bitince bölüm müziği, bütün bölümler bitince büyük final çalar. Bilgisayarda Türkçe ses varsa afi kısa bir cümleyle de tepki verir ("Harika! Üç yıldız!", "Olmadı, bir daha deneyelim!"). Ayarlar > Sesli tepkiler: **Ses ve konuşma**, **Sadece ses efektleri** ya da **Kapalı**. Sesler internet gerektirmez.'));
add(H2('4.10 Dil, sesli okuma ve hikâye'));
add(B1('Ayarlar > Dil: Türkçe ya da English. Bloklar, metinler ve koddaki adlar birlikte değişir. Değişken adları öğrencinin dizdiği bloklarda olduğu gibi kalır.'));
add(B1('Sesli oku: Görev metnini tarayıcının sesiyle okur. Türkçe ses en iyi Microsoft Edge\'de çalışır.'));
add(B1('Hikâye: Bölümün hikâyesini ve gerçek hayat bağlantısını yeniden gösterir.'));

/* blok tabloları */
add(H2('4.11 Bloklar ve gerçek kod karşılıkları'));
add(H3('Robot blokları (Bölüm 1–3)'));
add(TABLE(['Blok', 'Ne yapar?', 'Python (Türkçe)', 'Python (English)'], [
  ['↑ ileri git', "afi'yi baktığı yöne bir kare ilerletir.", '`ileri_git()`', '`move_forward()`'],
  ['↺ sola dön / ↻ sağa dön', 'Yerinde döner.', '`sola_don()` / `saga_don()`', '`turn_left()` / `turn_right()`'],
  ['✦ ışığı yak', 'Durduğu karedeki lambayı yakar.', '`isigi_yak()`', '`light_on()`'],
  ['⊏ kapıyı aç', 'Önündeki kapalı kapıyı açar.', '`kapiyi_ac()`', '`open_door()`'],
  ['… kez tekrarla', 'İçindekileri verilen sayı kadar tekrarlar.', '`for count in range(3):`', '`for count in range(3):`'],
  ['ışığa varana kadar tekrarla', 'Lamba karesine gelene kadar tekrarlar.', '`while not isik_karesinde_miyim():`', '`while not is_on_lamp():`'],
  ['tüm ışıklar yanana kadar tekrarla', 'Bütün lambalar yanana kadar tekrarlar.', '`while not tum_isiklar_yandi_mi():`', '`while not all_lights_on():`'],
  ['eğer … ise / değilse', 'Koşula göre karar verir.', '`if onum_acik_mi():`', '`if is_path_ahead():`']
], [24, 30, 24, 22], true));
add(H3('Akıllı ev blokları (Bölüm 4–10)'));
add(TABLE(['Blok', 'Ne yapar?', 'Python', 'Arduino'], [
  ['▶ başlangıçta', 'Program başlarken bir kez çalışır.', '`@baslangicta`', '`setup()` içinde'],
  ['⟳ her saniye', 'İçindekileri saniyede bir çalıştırır.', '`@her_saniye`', '`loop()` + `millis()`'],
  ['⚡ olay (hareket algılanınca ...)', 'Sensör değişince çalışır.', '`@hareket_algilaninca`', '"önceki durum" değişkeniyle `loop()` içinde'],
  ['cihazı aç / kapat', 'Lamba, LED, alarm, fan, pompa ...', '`giris_lambasi.ac()`', '`digitalWrite(pin, HIGH)`'],
  ['kapı/pencereyi aç / kapat', 'Servo motorla açar, kapatır.', '`pencere.ac()`', '`pencere.write(90)`'],
  ['⏱ … saniye bekle', 'Bu görevi bekletir.', '`bekle(5)`', '`delay(5000)`'],
  ['▤ ekrana yaz', 'Sayı ya da yazı gösterir.', '`ekran.yaz(x)`', '`Serial.println(x)`'],
  ['sensör değeri (mesafe, ışık ...)', 'Sensörün ölçümünü sayı olarak verir.', '`mesafe_olc()`', '`analogRead()`, `pulseIn()` ...'],
  ['sensör sorusu (hareket var mı? ...)', 'True / False cevap verir.', '`hareket_var_mi()`', '`digitalRead()`'],
  ['ƒ fonksiyon / ƒ … çalıştır', 'Adlı komut paketi tanımlar ve çağırır.', '`def gece_modu():` / `gece_modu()`', '`void geceModu()`'],
  ['değişken, artır', 'Değer saklar, değiştirir.', '`sayac = 0`, `sayac += 1`', '`long sayac = 0;`'],
  ['karşılaştır, ve/veya, değil', 'Koşul kurar.', '`<  >  ==  and  or  not`', '`<  >  ==  &&  ||  !`'],
  ['işlem, yuvarla, metin, birleştir', 'Hesap ve yazı.', '`+ - * /`, `round()`, `str(a) + "°C"`', '`round()`, `String(a) + "°C"`'],
  ['⟳ sürekli tekrarla', 'Bitince hemen baştan başlar (mBlock\'taki gibi).', '`@surekli_tekrarla`', '`loop()` içinde']
], [26, 28, 24, 22], true));
add(H3('Python Turtle blokları (Bölüm 13)'));
add(TABLE(['Blok', 'Ne yapar?', 'Python'], [
  ['↑ ileri git / ↓ geri git', 'Baktığı yöne gider, kalem inikse çizer.', '`afi.forward(100)` / `afi.backward(50)`'],
  ['↺ sola dön / ↻ sağa dön', 'Derece kadar döner.', '`afi.left(90)` / `afi.right(144)`'],
  ['✎ kalemi kaldır / indir', 'Çizmeden yürür / yeniden çizer.', '`afi.penup()` / `afi.pendown()`'],
  ['🎨 kalem rengi, kalınlık', 'Çizginin rengi ve kalınlığı.', '`afi.color("red")`, `afi.pensize(4)`'],
  ['◯ daire çiz', 'Yarıçapı verilen daire.', '`afi.circle(80)`']
], [30, 35, 35], true));
add(H3('Python oyun blokları (Bölüm 14)'));
add(TABLE(['Blok', 'Ne yapar?', 'Python'], [
  ['▶ oyun başlayınca', 'Başta bir kez çalışır.', '`def baslangic():`'],
  ['⌨ tuşa basılınca', 'Tuş olayı.', '`ekran.onkey(sag_ok, "Right")`'],
  ['⏱ her adımda', 'Oyun döngüsü.', '`ekran.ontimer(dongu, 160)`'],
  ['konumunu değiştir / git', 'x sağa, y yukarı.', '`oyuncu.setx(oyuncu.xcor() + 20)`, `oyuncu.goto(0, -160)`'],
  ['elmayı rastgele taşı', 'Rastgele yeni konum.', '`elma.goto(random.randint(-9, 9) * 20, 180)`'],
  ['★ puanı artır, 💬 ekrana yaz, ⏹ oyunu bitir', 'Puan, mesaj, bitiş.', '`puan = puan + 1`, `oyun_bitti = True`'],
  ['oyuncu elmaya değdi mi?', 'Çarpışma kontrolü.', '`oyuncu.distance(elma) < 20`']
], [30, 30, 40], true));
add(H3('Python yapay zekâ blokları (Bölüm 15)'));
add(TABLE(['Blok', 'Ne yapar?', 'Python'], [
  ['🧠 afi\'nin tahmini', 'Model: her örnek için cevap veren fonksiyon.', '`def tahmin(ornek):`'],
  ['✔ cevap', 'Tahmini verir.', '`return "elma"`'],
  ['örneğin özelliği', 'Örneğin bir sayısı.', '`ornek["cap"]`'],
  ['eğitim verisinde ortalama', 'Veriden öğrenilen değer.', '`ortalama("elma", "cap")`'],
  ['mesajda … geçiyor mu?', 'Kelime arama.', '`"bedava" in mesaj`'],
  ['mesajdaki … sayısı', 'Listeden kaç kelime var.', '`kelime_say(mesaj, OLUMLU)`']
], [30, 35, 35], true));

/* ---------- 5 ---------- */
add(H1('5. Kullanım kılavuzu: öğretmen'), H2('5.1 Öğretmen modu'));
add(P('Adresin sonuna `#ogretmen` eklenip Enter\'a basılınca üst şeritte "Öğretmen modu" etiketi ve her adımda **Çözümü yükle** düğmesi görünür. Düğme o adımın örnek çözümünü blok alanına yükler ve düzenli şekilde dizer. Site herkese açık olduğu için bu bir şifre değildir; öğrencilerin çözüm düğmesini rastgele görmesini engeller.'));
add(H2('5.2 Yerleşimler ve kod görünümü'));
add(TABLE(['Yerleşim', 'Ne zaman?', 'Özellik'], [['Varsayılan', 'Normal ders', 'Üç sütun, Python kodu görünür.'], ['Geniş blok alanı', 'Uzun programlar', 'Sağ panel daralır, blok alanı büyür.'],
  ['Kod karşılaştırma', 'Dilleri karşılaştırmak', 'Sağ sütun genişler.'], ['Sunum (akıllı tahta)', 'Tahtada anlatım', 'Yazılar ve bloklar büyür.'], ['Kendi düzenim', 'Kayıtlı tercih', 'Kaydet düğmesiyle o anki düzen saklanır.']], [24, 30, 46]));
add(B1('Kod menüsü: Sadece bloklar / Bloklar + Python / Bloklar + JavaScript / Python ve JavaScript yan yana / **Bloklar + Arduino (C++)**. Arduino atölyesine girilince görünüm kendiliğinden Arduino\'ya, Python atölyesine girilince Python\'a geçer.'));
add(B1('Paneller arasındaki noktalı tutamaklar sürüklenir; 150 pikselden dar çekilen panel ince bir şeride daralır. Tutamakların üstündeki ok düğmeleri paneli tek tıkla açar/kapatır. Blok alanının altındaki çizgi yüksekliği değiştirir; çift tık eski haline döndürür.'));
add(B1('Ekran 1100 pikselden darsa sütunlar alt alta dizilir.'));
add(H2('5.3 Sınıf yönetimi'));
add(B1('Her öğrenci ilk derste kendi adıyla profil açar. Aynı bilgisayarı kullanan öğrenciler listeden adını seçer.'));
add(B1('Profil silmek için "Kim kodluyor?" penceresinde Düzenle\'ye, sonra Sil\'e basılır; onay istenir.'));
add(B1('Dönem sonunda öğrencilerin ilerleme kodları toplanarak kimin hangi adımda olduğu kaydedilebilir.'));
add(B1('Tarayıcı verilerini silmek profilleri de siler. Sınıf bilgisayarlarında gizli pencere kullanılmamalıdır.'));
add(B1('Sınıfta ağ varsa **sınıf sürümü** kullanılabilir (5.5): ilerleme sunucuda tutulur, öğrenci hangi bilgisayara oturursa otursun adını ve robotunu seçince kaldığı yerden devam eder; ilerleme kodu gerekmez.'));
add(H2('5.4 Önerilen ders akışı'));
add(...NUM(['Bölümün hikâyesini tahtada birlikte okuyun (Sunum yerleşimi).', 'İlk adımı birlikte çözün; kod panelinde blokların Python karşılığını gösterin.',
  'Akıllı ev bölümlerinde Çalıştır\'a basmadan önce zaman çizelgesine birlikte bakın: "Hareket ne zaman oluyor? Lamba ne zaman yanmalı?"',
  'Öğrenciler kalan adımları kendi hızlarında çözsün; hızlı öğrencileri Orta ve Zor düzeye yönlendirin.',
  'Ders sonunda bir bloğa tıklayıp açıklama panelindeki "Gerçek hayatta" örneğini konuşun ve ilgili sensörü sensör kütüphanesinden gösterin.']));
add(H2('5.5 Sınıf sürümü: öğretmen paneli'));
add(P('Sınıf sürümünde öğretmen bilgisayarında **afi-sunucu.exe** çalışır. Öğrenciler AFİ KOD\'u ya bu sunucudan (tarayıcıda `http://ÖĞRETMEN-PC:8000`) ya da kendi bilgisayarlarına kurulan **afi-istemci.exe** ile açar. Uygulama sınıfa bağlı olduğunu kendisi anlar; üst şeritte **Sınıfa bağlı** etiketi görünür. Kurulum adımları 7.5\'tedir.'));
add(TABLE(['Panel bölümü', 'Ne yapar?'], [
  ['Sınıf', 'Öğrenciler kart olarak görünür: robotu, adı, bilgisayarı, şu an hangi adımda olduğu, durumu (çalışıyor / başarılı / hata), yıldızı ve bitirdiği adım sayısı. Yeşil nokta şu an bağlı demektir. Karta tıklayınca bölüm bölüm ilerleme, öğrencinin **şu anki blokları** (salt okunur), Python kodu ve son olaylar açılır.'],
  ['Mesaj', '"Herkese mesaj" gördüğünüz bütün öğrencilerin ekranına birkaç saniye içinde düşer; öğrenci kartından tek öğrenciye mesaj gönderilir.'],
  ['Excel (CSV)', 'Sınıf listesini ilerlemeyle birlikte indirir; Excel\'de açılır.'],
  ['Öğretmenler (admin)', 'Öğretmen hesabı açılır. Her öğretmene **ağ aralığı** verilir (ör. `192.168.1.0/24` ya da `192.168.137.2-192.168.137.40`); öğretmen yalnızca o aralıktan bağlanan öğrencileri görür. Boş bırakılırsa herkesi görür.'],
  ['Güncelleme (admin)', '"Güncellemeleri denetle" GitHub\'daki isikcirobot_offline sitesine bakar; yeni sürüm indirilir, doğrulama özeti (SHA-256) kontrol edilir ve kurulur. Öğrencilere "Yeni sürüm hazır" bildirimi gider; istemciler yeni paketi sunucudan kendileri alır. Sorun olursa eski sürüme tek tuşla dönülür. İnternet yoksa paket USB ile getirilip yüklenir.'],
  ['Ayarlar', 'Öğrencilerin açacağı adresler, parola değiştirme, sunucunun adı, veritabanı yedeği, dönem sonunda öğrenci verilerini silme.']
], [24, 76]));
add(B1('"Çözümü yükle" düğmesi sınıf sürümünde yalnızca panele giriş yapmış öğretmenin tarayıcısında görünür; `#ogretmen` öğrencilere çözüm açmaz.'));
add(B1('Öğrenci kimliği **ad + robot**tur (büyük/küçük harf ve I/İ/ı farkı gözetilmez). Öğrenci başka bilgisayarda aynı adı ve robotu seçince yıldızları ve dizdiği bloklar gelir. Robotunu değiştirirse kaydı yeni kimliğe taşınır.'));
add(H2('5.6 Bölümlerin kavram sırası'));
const SEEN = new Set();
add(TABLE(['Bölüm', 'Kavram', 'Yeni bloklar', 'Sensörler'], COURSE.chapters.map(ch => {
  const tools = new Set(); ch.lessons.forEach(ls => ls.steps.forEach(st => (st.tools || []).forEach(t => tools.add(typeof t === 'string' ? t.split(':')[0] : t))));
  const KN = { turtle: { fwd: 'ileri git', left: 'sola dön', right: 'sağa dön', penup: 'kalemi kaldır', pendown: 'kalemi indir', color: 'kalem rengi', circle: 'daire', repeat: 'tekrarla' },
    game: { start: 'oyun başlayınca', key: 'tuşa basılınca', tick: 'her adımda', change: 'konum değiştir', goto: 'git', random: 'rastgele taşı', score: 'puan', say: 'ekrana yaz', stop: 'oyunu bitir', touch: 'değdi mi', pos: 'konum', if: 'eğer', compare: 'karşılaştır' },
    ai: { predict: 'tahmin (model)', answer: 'cevap', feat: 'özellik', mean: 'ortalama', has: 'kelime var mı', count: 'kelime sayısı', ife: 'eğer/değilse', compare: 'karşılaştır', compare2: 'karşılaştır', and: 've', or: 'veya', arith: 'işlem' } };
  const ckind = (ch.lessons[0].steps[0] || {}).kind;
  const names = KN[ckind] || { forever: 'sürekli tekrarla', start: 'başlangıçta', every: 'her saniye', event: 'olay', switch: 'aç/kapat', move: 'kapı/pencere', wait: 'bekle', show: 'ekrana yaz', sensor: 'sensör değeri', digital: 'sensör sorusu', if: 'eğer', ifelse: 'eğer/değilse', compare: 'karşılaştır', and: 've', or: 'veya', not: 'değil', set: 'değişken', change: 'artır', repeat: 'tekrarla', fn: 'fonksiyon', arith: 'işlem', round: 'yuvarla', text: 'metin', join: 'birleştir' };
  const list = [...tools].map(t => names[t] || ({ robot_ileri: 'ileri git', robot_sola: 'dön', robot_isik: 'ışık', robot_kapi: 'kapı', controls_repeat_ext: 'tekrarla', robot_until: 'ışığa kadar', robot_until_all: 'tüm ışıklar', robot_if: 'eğer', robot_ifelse: 'eğer/değilse' })[t]).filter(Boolean);
  const fresh = [...new Set(list)].filter(x => KN[ckind] || !SEEN.has(x)); fresh.forEach(x => SEEN.add(x));
  return [ch.num + '. ' + L(ch.name), L(ch.concept), fresh.join(', ') || '—', (ch.sensors || []).map(id => { const s = SENSORS.list.find(x => x.id === id); return s ? L(s.name) : id; }).join(', ')];
}), [18, 18, 34, 30], true));

/* ---------- 6 atölyeler ---------- */
add(H1('6. Arduino ve Python atölyeleri'), H2('6.1 Arduino dosyasını indirmek ve karta yüklemek'));
add(P('Bölüm 4–10\'daki her adımda kod panelinin altında **Kart** seçimi (Arduino Uno / ESP32) ve **.ino indir** düğmesi vardır. Dosyanın en üstünde, öğrencinin kullandığı sensör ve cihazlara göre otomatik hazırlanmış bağlantı listesi (hangi kablo hangi pine) ve gereken kütüphaneler yazar.'));
add(...NUM(['Arduino IDE\'yi kur (arduino.cc > Software; okul bilgisayarında kurulum için yönetici izni gerekebilir, bir kez yapılır).',
  'İndirilen .ino dosyasına çift tıkla. Arduino IDE "dosya bir klasörde olmalı" derse Tamam\'a bas; klasörü kendisi oluşturur.',
  'Dosyanın başındaki "Gereken kütüphaneler" satırı varsa: Araçlar > Kütüphaneleri Yönet\'te adlarını aratıp Yükle\'ye bas (DHT sensor library, MFRC522, Adafruit MPU6050, ESP32Servo).',
  'Kartı USB ile bağla. Araçlar > Kart\'tan kartı (Arduino Uno ya da ESP32 Dev Module), Araçlar > Port\'tan COM numarasını seç.',
  'Sağ ok (Yükle) düğmesine bas. "Yükleme tamamlandı" yazınca program kartta çalışır. Ekrana yazılanları görmek için Seri Monitör\'ü aç; hız Uno için 9600, ESP32 için 115200 olmalı.']));
add(NOTE('ESP32 için bir kez: Dosya > Tercihler > "Ek kart yöneticisi URL\'leri" kutusuna Espressif\'in adresini ekle, sonra Araçlar > Kart > Kart Yöneticisi\'nde "esp32" paketini yükle. Kablo takıp çıkarmadan önce USB\'yi çıkar; HC-SR04\'ün Echo pini ve 5 V çıkışlı modüller ESP32\'ye gerilim bölücüyle bağlanmalıdır.', 'FFF4DC', 'E89B12'));
add(H2('6.2 Arduino kodunda blokların karşılığı'));
add(B1('"başlangıçta" bloğu `setup()` içinde bir kez çağrılan bir fonksiyon olur. Pinlerin giriş/çıkış ayarı da `setup()`\'ta yapılır.'));
add(B1('"her saniye" bloğu `loop()` içinde `millis()` ile saniyede bir çağrılır; böylece olaylar arada kaçırılmaz.'));
add(B1('Olay blokları `loop()` içinde "önceki durum" değişkeniyle yazılır: sensör şimdi açık ama az önce kapalıysa olay olmuştur.'));
add(B1('"bekle" `delay()` olur. Gerçek kartta delay sırasında başka olaylar dinlenmez; bu fark kodun içindeki açıklamalarda da yazar.'));
add(B1('Sensör okuma fonksiyonları (mesafe için `pulseIn`, ses için 50 ms tepe-tepe ölçümü, toprak nemi için kalibrasyon sayıları) dosyaya otomatik eklenir.'));
add(B1('Pinler her programa göre yeniden planlanır; iki sensör aynı pine düşmez. Uno\'da A0–A3 analog, RFID için SPI pinleri (10–13), MPU-6050 için A4/A5 ayrılır. ESP32\'de analog sensörler Wi-Fi açıkken de çalışan ADC1 pinlerine (32–39) bağlanır.'));
add(H2('6.3 Python dosyasını indirip çalıştırmak'));
add(P('Her akıllı ev adımında **.py indir** düğmesi, öğrencinin programını ve onu çalıştıracak küçük bir "akıllı ev benzetim kütüphanesini" tek dosyada verir. Ek kütüphane gerekmez.'));
add(...NUM(['Python 3\'ü kur (python.org > Downloads). Kurulumun ilk ekranında **Add python.exe to PATH** kutusunu işaretle. Kendi kullanıcın için kurulumda yönetici izni gerekmez.',
  'Başlat menüsüne `cmd` yazıp **Komut İstemi**\'ni aç (PowerShell de olur). Komutlar teker teker yazılıp her birinden sonra Enter\'a basılır.',
  '`python --version` yaz. "Python 3.8" ya da daha yeni bir sürüm görünmeli. "tanınmıyor" derse `py --version` dene; çalışırsa aşağıdaki komutlarda `python` yerine `py` yaz.',
  'Dosyanın indiği klasöre geç: `cd Downloads` (ya da `cd %USERPROFILE%\\Downloads`).',
  'Çalıştır: `python giris-6.py` (dosya adı adımın adıdır). Ekranda saniye saniye sensör değişimleri, olaylar ve cihaz durumları yazar; sonunda her senaryonun testi görünür.']));
add(CODE(['C:\\Users\\ogrenci> python --version', 'Python 3.12.4', 'C:\\Users\\ogrenci> cd Downloads', 'C:\\Users\\ogrenci\\Downloads> python giris-6.py',
  '[  3 sn] Hareket sensörü: VAR', '         -> olay: hareket algılanınca', '         Giriş lambası: AÇIK', '...', 'Test 1: 12 saniyenin 12 tanesi doğru.  OK', 'Tebrikler! Programın her saniye doğru çalıştı.']));
add(B1('Dosyanın başındaki `HIZ = 0.4` sayısı benzetimin hızını belirler (0 = beklemeden). `SENARYO = 1` hangi senaryonun ekranda gösterileceğini seçer.'));
add(B1('Öğrenciler dosyanın en altındaki kendi programlarını bir metin düzenleyiciyle (Not Defteri, IDLE, VS Code, Thonny) değiştirip yeniden çalıştırabilir; test sonucunun nasıl değiştiğini görmek iyi bir alıştırmadır.'));
add(B1('Bu dosyada `round()` 0,5\'i her zaman yukarı yuvarlar (uygulamadaki JavaScript ile aynı sonucu vermesi için); dosyanın başında açıklaması yazar.'));
add(H2('6.4 Turtle, oyun ve yapay zekâ dosyaları'));
add(P('Bölüm 13–15\'te **.py indir** düğmesi gerçek bir Python programı verir; yukarıdaki gibi Komut İstemi\'nde `python dosya.py` ile çalıştırılır. Ek kurulum gerekmez: turtle modülü Windows\'taki Python kurulumuyla birlikte gelir (kurulumda "tcl/tk and IDLE" seçeneği varsayılan olarak işaretlidir).'));
add(B1('**Turtle** dosyası bir çizim penceresi açar ve afi\'nin çizimini adım adım gösterir; pencere kapatılınca program biter.'));
add(B1('**Oyun** dosyası oynanabilir bir oyun penceresi açar: pencereye bir kez tıklayıp ok tuşları ve boşlukla oynanır. Elma oyunlarda gerçekten rastgele yerlere düşer.'));
add(B1('**Yapay zekâ** dosyası verileri ve öğrencinin modelini birlikte içerir; çalışınca her veri setinde eğitim ve test doğruluğunu ve her test örneğinin tahminini yazar.'));
add(NOTE('Python dersi önerisi: önce dosyayı olduğu gibi çalıştırın, sonra öğrenciler kendi modelindeki sayıyı (eşiği) ya da çizimdeki açıyı Not Defteri veya IDLE ile değiştirip yeniden çalıştırsın. Blok → kod → değişiklik → sonuç döngüsü metin tabanlı programlamaya geçişi kolaylaştırır.'));

/* ---------- 7 kurulum ---------- */
add(H1('7. Kurulum: sıfırdan yayınlama ve güncelleme'), H2('7.1 Gereksinimler'));
add(B1('Güncel bir tarayıcı: Chrome, Edge veya Firefox. Windows 7 üzerindeki son Chrome sürümü (109) de yeterlidir.'));
add(B1('Yayınlamak için ücretsiz bir GitHub hesabı. Ücretsiz hesapta GitHub Pages sadece herkese açık (Public) depolarda çalışır.'));
add(B1('Uygulamayı yayınlamak ve kullanmak için komut satırı, Python, Node.js ya da yönetici izni gerekmez; her şey GitHub\'ın web sitesinden yapılır.'));
add(H2('7.2 GitHub Pages ile sıfırdan yayınlama'));
add(...NUM(['github.com\'a giriş yap. Sağ üstteki + işaretinden New repository\'yi seç.', 'Depoya bir ad ver (örnek: afi-kod), Public seç ve Create repository\'ye bas.',
  'Depo sayfasında Add file > Upload files\'a tıkla.', 'Uygulama klasörünün içindekileri seç ve sürükle: index.html, js ve lib klasörleri, BENIOKU.txt, README.md ve bu kılavuz. (tools klasörü sadece geliştirme içindir; yüklemek zorunlu değildir.) Klasörün kendisini sürüklersen her şey bir alt klasöre girer ve adres değişir.',
  'Sayfanın altındaki Commit changes\'e bas.', 'Settings > Pages bölümüne gir. Branch kısmında main ve / (root) seçip Save\'e bas.', '1–2 dakika bekle. Site https://KULLANICIADI.github.io/DEPOADI/ adresinde açılır.']));
add(NOTE('Yükleme bitince depoda index.html en üst düzeyde görünmeli; js ve lib klasörleri onun yanında olmalı. GitHub Pages büyük/küçük harfe duyarlıdır; dosya adları değiştirilmemeli.'));
add(H2('7.3 İnternetsiz (USB) kurulum'));
add(...NUM(['Depo sayfasında yeşil Code düğmesine, sonra Download ZIP\'e bas.', 'İnen zip dosyasına sağ tıklayıp Tümünü ayıkla de. Zip\'in içinden doğrudan açılırsa uygulama çalışmaz.',
  'Ayıklanan klasörü USB belleğe kopyala ve sınıf bilgisayarlarına yapıştır.', 'Klasördeki index.html\'e çift tıkla. Başka bir programla açılırsa: sağ tık > Birlikte aç > Chrome veya Edge.']));
add(P('İnternetsiz sürümde yazı tipleri bilgisayarın kendi yazı tipleriyle gösterilir; Blockly\'nin simgeleri lib/media klasöründen yüklenir, uygulama aynı şekilde çalışır.'));
add(H2('7.4 Güncelleme yükleme'));
add(...NUM(['Depoda Add file > Upload files\'a tıkla.', 'Değişen dosyaları aynı klasör yapısıyla sürükle; aynı adlı dosyaların üzerine yazılır.', 'Commit changes\'e bas, 1–2 dakika bekle.', 'Sitede eski sürüm görünüyorsa tarayıcıda Ctrl + F5 ile sayfayı önbelleksiz yenile.']));
add(H2('7.5 Sınıf sürümü kurulumu'));
add(P('İndirme sayfası: ' + 'https://aydinincekara.github.io/isikcirobot_offline/' + ' (Python gerekmez; Windows 8.1, 10 ve 11).'));
add(H3('Öğretmen bilgisayarı'));
add(...NUM(['**afi-sunucu.exe** dosyasını indirip kalıcı bir klasöre koyun (ör. `C:\\afi-sinif`). Veriler yanındaki `afi-sunucu-veri` klasöründe tutulur.',
  'Çift tıklayın. Windows "bilgisayarınızı korudu" derse **Ek bilgi → Yine de çalıştır**. Güvenlik duvarı sorarsa **Özel ağlar** kutusu işaretliyken **Erişime izin ver** deyin (bu bir kez yönetici izni ister).',
  'Siyah pencerede öğrencilerin açacağı adresler yazar; panel tarayıcıda kendiliğinden açılır. İlk açılışta **admin** hesabı oluşturun (yalnızca bu bilgisayardan yapılabilir).',
  'Öğretmenler sekmesinden öğretmen hesaplarını ve ağ aralıklarını girin.',
  'Ders boyunca siyah pencere açık kalmalıdır; kapatılınca sunucu durur.']));
add(H3('Öğrenci bilgisayarları (iki yol)'));
add(B1('**Kurulumsuz:** öğrenci tarayıcıda `http://ÖĞRETMEN-PC:8000` adresini açar (ÖĞRETMEN-PC yerine öğretmen bilgisayarının adı ya da siyah pencerede yazan IP adresi). Ağ koparsa sayfa çalışmaya devam eder ama yeni sayfa açılamaz.'));
add(B1('**Kurulumlu (önerilen):** **afi-istemci.exe** USB\'den bir kez çift tıklanır; yönetici izni istemez. Kendini öğrencinin klasörüne kurar, masaüstüne **AFİ KOD** kısayolu koyar ve Windows açılışında arka planda başlar. AFİ KOD bu bilgisayardan açılır (`http://127.0.0.1:8100`); öğretmen sunucusu kapalıyken ya da ağ yokken de çalışır, kayıtlar bekletilir ve bağlantı gelince gönderilir. Sunucuyu kendisi bulur: son bilinen adres → bilgisayar adı → yerel ağ taraması; öğretmen bilgisayarının IP\'si değişse de bağlanır. Üst şeritteki **Sınıfa bağlı / Sınıf bağlantısı yok** etiketine tıklanınca bağlantı ayarları açılır; sunucu adresi elle de yazılabilir.'));
add(B1('İstemcinin yeni sürümü için yeni afi-istemci.exe aynı şekilde çift tıklanır; eskisini kapatıp üzerine kurar. AFİ KOD içeriğinin güncellemeleri ise sunucudan kendiliğinden gelir.'));
add(NOTE('Windows\'un "Mobil etkin nokta" özelliği (192.168.137.x) en fazla 8 cihaz bağlar; kalabalık sınıflarda okulun ağı ya da ayrı bir Wi-Fi modem kullanılmalıdır.', 'FFF4DC', 'E89B12'));
add(H3('Python ile çalıştırmak (isteğe bağlı)'));
add(P('Python 3.8 veya yenisi kuruluysa exe yerine kaynak koddan da çalışır. isikcirobot_offline klasöründe Komut İstemi açılıp teker teker yazılır: `python --version` (sürümü gösterir), sonra öğretmen bilgisayarında `python afi-sunucu.py`, öğrenci bilgisayarında `python afi-istemci.py`. Yönetici izni gerekmez.'));
add(H2('7.6 Bu projenin yayını'));
add(TABLE(['Bilgi', 'Değer'], [['Depo', REPO], ['Dal (branch)', 'main, kök klasör (/)'], ['Canlı adres', SITE], ['Güncelleme', 'Değişiklikler depoya yüklendiğinde GitHub Pages siteyi 1–2 dakika içinde günceller.'],
  ['Depo adını değiştirmek', 'Settings > General > Repository name. Adres de değişir (örnek: …github.io/afi-kod/); eski bağlantılar çalışmaz, öğrencilere yeni adres verilmelidir. Öğrenci kayıtları adrese bağlı olduğu için yeni adreste ilerleme kodu ile devam edilir.']], [25, 75]));

/* ---------- 8 teknik ---------- */
add(H1('8. Teknik yapı'), H2('8.1 Dosya yapısı'));
add(TABLE(['Dosya', 'Görevi'], [
  ['index.html', 'Sayfa iskeleti, tüm görünüm kuralları (CSS) ve pencereler. Dosyaları doğru sırayla yükler.'],
  ['js/engine.js', 'Bölüm 1–3 oyun motoru: harita, programın çalışması, TR/EN fonksiyon adları, çözüm dili, ilerleme kodu (A ve B sürümleri).'],
  ['js/blocks.js', 'Robot blokları ve Python/JavaScript kod üreteçleri.'],
  ['js/home.js', 'Bölüm 4–10 akıllı ev motoru: sensör, olay, cihaz, fonksiyon ve değişken adları (TR/EN), senaryolar, zaman çizelgesi simülasyonu, saniye saniye test.'],
  ['js/home-blocks.js', 'Akıllı ev blokları; Python, JavaScript ve Arduino kod üreteçleri; pin planı; indirilebilir .py dosyasının benzetim kütüphanesi.'],
  ['js/home-scene.js', 'Kontrol paneli ve zaman çizelgesi çizimi (sensör/cihaz kartları, test noktaları, beklenen/gerçekleşen şeritler).'],
  ['js/levels.js', 'Bölüm 1–3\'ün ilk dersleri, hikâyeler, haritalar, çözümler.'],
  ['js/levels-extra.js', 'Bölüm 1–3\'ün Orta ve Zor dersleri ve Başlangıç eklemeleri; adımların sabit numaraları ve düzey adları.'],
  ['js/levels-home.js', 'Bölüm 4–10 (210 adım). **Elle düzenlenmez**; tools/gen_home.js ile üretilir.'],
  ['js/i18n.js, js/i18n-home.js', 'Türkçe ve İngilizce arayüz metinleri, blok yazıları ve blok açıklamaları.'],
  ['js/sensors.js, js/sensor-ui.js', 'Sensör kütüphanesi bilgileri ve ekranı.'],
  ['js/icons.js', 'Arayüzdeki küçük çizgi ikonlar.'],
  ['js/version.js', 'Sürüm numarası (ekranda gösterilir). Değiştirmek için: `python tools/set_version.py 2.3`.'],
  ['js/kind-turtle.js, js/kind-game.js, js/kind-ai.js', 'Python bölümlerinin motorları: bloklar, kod üreteçleri, benzetim, çizim, indirilebilir .py.'],
  ['js/levels-py.js, js/i18n-py.js', 'Bölüm 13–15 adımları (tools/gen_py.js ile üretilir) ve metinleri.'],
  ['js/robots.js', 'Altı robotun çizimi (ev, kontrol paneli, profil resimleri).'],
  ['js/sounds.js', 'Sesli tepkiler: tarayıcının ses motoruyla üretilen müzikler ve kısa konuşmalar.'],
  ['js/app.js', 'Arayüz: profiller, gezinme, yerleşimler, çizim, animasyon, indirme, pencereler.'],
  ['lib/', 'Blockly 11.2.2 dosyaları, lib/media simgeleri ve lisans notu.'],
  ['tools/gen_home.js, tools/content/', 'Bölüm 4–10 içeriği (ch4.js … ch10.js) ve üretici/doğrulayıcı.'],
  ['tools/gen_py.js, tools/content/py_*.js', 'Bölüm 13–15 içeriği ve üretici/doğrulayıcı; tools/pymock/turtle.py ekran açmadan turtle testi yapar.'],
  ['tools/set_version.py, tools/build_preview.py', 'Sürüm numarasını günceller; tek dosyalık önizleme sayfası üretir.'],
  ['tools/make_guide.js', 'Bu kılavuzu üretir.'],
  ['tools/arduino_mock/', 'Arduino kodlarını bilgisayarda derleme denemesi için küçük taklit dosyalar.']
], [30, 70], true));
add(H2('8.2 Program nasıl çalışır?'));
add(H3('Bölüm 1–3 (ızgara)'));
add(...NUM(['Öğrenci blokları dizer; kod üreteçleri her değişiklikte Python ve JavaScript kodunu yazar.', 'Çalıştır\'a basılınca JavaScript kodu, her komuttan önce "hangi blok çalışıyor" bilgisi eklenerek üretilir.',
  'Oyun motoru kodu her ev düzeni için ayrı çalıştırır; her hareket bir listeye kaydedilir (sonsuz döngüye karşı 4000 adım sınırı).', 'Başarılıysa ekrandaki düzen, değilse işe yaramadığı ilk düzen animasyonla oynatılır.']));
add(H3('Bölüm 4–10 (akıllı ev)'));
add(...NUM(['Üretilen JavaScript kodu, olay/başlangıç/her saniye görevlerini kaydeder (örneğin `hareketAlgilaninca(function () {...})`).',
  'Motor senaryoyu saniye saniye yürütür: 0. saniyede "başlangıçta" görevleri, her saniye önce o saniyede olan olaylar (sensör yükselişi, düşüşü ya da eşik geçişi), sonra "her saniye" görevi çalışır.',
  '"bekle" o görevin saatini ileri alır; diğer görevler beklemez. "her saniye" bloğu bittikten 1 saniye sonra yeniden çalışır.',
  'Her cihaz komutu zamanıyla kaydedilir. Test, her saniyenin ortasında (0,5 – 1,5 – …) cihazların durumunu beklenen durumla karşılaştırır.',
  'Beklenen durumlar, adımın örnek çözümü üretici araçta çalıştırılarak hesaplanır ve levels-home.js\'e yazılır.']));
add(H2('8.3 Verilerin saklanması'));
add(P('Uygulamanın sunucusu ve veritabanı yoktur. Tüm kayıtlar tarayıcının yerel depolamasında tutulur: `isikci2:settings` (dil, tema, yerleşim, kart seçimi), `isikci2:profiles` (profil listesi), `isikci2:p:<kimlik>` (bir öğrencinin yıldızları, her adımdaki blokları, görülen hikâyeler, son adım). "isikci2" ön eki bilerek değiştirilmemiştir; değişirse kayıtlar okunamaz.'));
add(H2('8.4 İlerleme kodu'));
add(P('Her adımın sabit bir numarası (n) vardır; kod bu numaralara göre yazılır, bu yüzden araya yeni adım eklense de eski kodlar doğru okunur. İki biçim vardır: **A** her adım için 2 bit yazar; **B** aynı yıldızlı ardışık adımları tek harfte toplar. Uygulama hangisi kısaysa onu verir; ikisi de okunur. 32 harflik alfabede karışmasın diye I, O, 0 ve 1 yoktur; sondaki kontrol harfi yanlış yazımı yakalar.'));
add(NOTE('Yeni adıma her zaman kullanılmamış en büyük numaradan bir fazlası verilir (şu an son numara ' + Math.max(...STEPS.map(s => s.st.n)) + '). Mevcut bir adımın numarası asla değiştirilmez. Bölüm 4–10\'da numaralar üretici araçta sırayla verilir; yeni adımlar ilgili bölüm dosyasının **sonuna** eklenmelidir.', 'FFF4DC', 'E89B12'));
add(H2('8.5 Bölüm 1–3: harita karakterleri ve çözüm dili'));
add(TABLE(['Yazım', 'Anlamı'], [['S, o, L, D', 'Başlangıç, zemin, lamba, kapalı kapı'], ['K, M, B, T', 'Koltuk, masa, bitki, tezgâh (geçilemez)'], ['F L R Y O', 'ileri, sola, sağa, ışık, kapı aç'], ['3( … )', '3 kez tekrarla'],
  ['U( … ), A( … )', 'ışığa varana kadar, tüm ışıklar yanana kadar'], ['?ON( … | … )', 'eğer … ise / değilse; koşullar ON, SOL, SAG, ISIK, KAPI']], [25, 75]));
add(H2('8.6 Bölüm 4–10: adım yazmak'));
add(P('İçerik `tools/content/ch4.js … ch10.js` dosyalarındadır. Bir adım şöyle yazılır:'));
add(CODE(["{ id: 'giris-6', sensors: ['motion'], devices: ['lamp'], tools: ['event:motion', 'switch', 'wait:5'],",
  "  scen: [S(12, { motion: d('001100000000') }), S(12, { motion: d('000001000000') })],",
  "  sol: [ev('motion', on('lamp'), wait(5), off('lamp'))],",
  "  text: ['Türkçe hikâye cümlesi', 'English sentence'],",
  "  goal: ['Görev: ...', 'Task: ...'] }"]));
add(B1('`sensors`, `devices`: o adımdaki sensör ve cihaz kimlikleri (js/home.js\'teki listeler). `tools`: menüde görünecek bloklar (`event:motion`, `switch:lamp:1`, `compare:LT:30`, `set:count`, `fn:night` gibi).'));
add(B1('`scen`: senaryolar. `d(\'0011\')` her saniyenin dijital değeri; `ramp(12, [0,120], [8,10])` doğrusal değişen sayı; `K.vals(…)` saniye saniye sayılar. Kart okuyucuda 1 kayıtlı, 2 yabancı karttır.'));
add(B1('`sol`: örnek çözüm (ev, start, every, fn, call, on, off, open, close, wait, show, iff, ife, rep, set, chg, get, sens, dig, cmp, and, or, not, ar, txt, join, round). Blok sınırı çözümün blok sayısıdır.'));
add(B1('İsteğe bağlı: `thresholds` (zaman çizelgesindeki kırmızı eşik çizgileri), `dupe` (kısayolsuz çözüm sınıra sığmamalı), `wrong` (geçmemesi gereken yanlış çözümler), `starter` (adım başında hazır bloklar), `board` (uno/esp32).'));
add(P('Komut İstemi\'nde, proje klasöründe (Node.js 18+ ve bir kez `npm i blockly@11.2.2 docx@9` gerekir): `node tools/gen_home.js` Bölüm 4–12\'yi, `node tools/gen_py.js` Bölüm 13–15\'i üretir ve doğrular; `--py` eklenirse her adımın Python dosyası gerçek Python ile çalıştırılır. Komutlar teker teker çalıştırılır, yönetici izni gerekmez.'));
add(P('Python bölümlerinde adım yazımı benzerdir (tools/content/py_turtle.js, py_game.js, py_ai.js): turtle adımında yalnızca `sol` (çözüm) yazılır, hedef çizim çözümden çıkar; oyun adımında `scen: [{ dur, keys: \'.RR.L\', rand: [...] }]`, yapay zekâ adımında `features`, `labels`, `sets: [{ train, test }]` ve gerekirse `need` (istenen doğruluk) verilir.'));
add(H2('8.7 Otomatik testler'));
add(TABLE(['Test', 'Sonuç (bu sürüm)'], [
  ['Bölüm 1–3: her adımın çözümü, iki dilde, her ev düzeninde', '90 adım × 2 dil, hatasız'],
  ['Bölüm 4–12: çözüm Türkçe ve İngilizce kodla bütün senaryolarda doğru mu?', '230 adım, hatasız'],
  ['Bölüm 13–15: çözüm geçiyor mu, boş program ve her blok silinmiş hali başarısız mı, yanlış örnek çözümler başarısız mı?', '30 adım, hatasız'],
  ['Bölüm 13–15: indirilen .py gerçek Python\'da aynı sonucu veriyor mu? (turtle çizimi, oyun adımları, model tahminleri)', '30 adım × 2 dil, hepsi geçti'],
  ['Çözümden herhangi bir komut ya da olay bloğu silinince program başarısız oluyor mu? (her blok gerekli mi)', 'Tüm adımlarda evet'],
  ['Boş program başarısız mı, senaryoların beklenen sonuçları farklı mı, her cihaz en az bir kez değişiyor mu?', 'Tüm adımlarda evet'],
  ['İndirilen .py dosyası gerçek Python 3\'te çalışıp kendi testini geçiyor mu?', '230 adım × 2 dil, hepsi geçti'],
  ['Arduino kodları derleniyor mu? (taklit Arduino başlıklarıyla g++)', '920 dosya (Uno + ESP32, TR + EN), hatasız'],
  ['Tarayıcıda: örnek çözümleri yükleyip Çalıştır, yanlış program mesajı, indirme, dil değiştirme, görünüm değiştirme', 'Hatasız']
], [65, 35]));

/* ---------- 9 ders içeriği (özet) ---------- */
add(H1('9. Ders içeriği'));
add(P('Uygulamada ' + COURSE.chapters.length + ' bölüm, ' + COURSE.chapters.reduce((a, c) => a + c.lessons.length, 0) + ' ders ve ' + STEPS.length + ' adım vardır. Bölüm 1–10\'da Başlangıç, Orta ve Zor düzeylerinde 10\'ar adım, Bölüm 11–15\'te Başlangıç düzeyinde 10\'ar adım bulunur. Tüm adımların tam listesi Ek A\'dadır.'));
COURSE.chapters.forEach(ch => {
  add(H2('Bölüm ' + ch.num + ' · ' + L(ch.name) + ' (' + L(ch.concept) + ')'));
  add(P(L(ch.story)));
  add(NOTE('Gerçek hayatta: ' + L(ch.life), 'FFF4DC', 'E89B12'));
  add(TABLE(['Düzey', 'Ders', 'Adım'], ch.lessons.map((ls, li) => [(COURSE.tiers[ls.tier || 'easy'] || {}).tr, ch.num + '.' + (li + 1) + ' ' + L(ls.title), ls.steps.length + ' adım']), [20, 55, 25]));
});

/* ---------- 10 sensörler ---------- */
add(H1('10. Sensör kütüphanesi'));
add(P('Kütüphanede 15 sensör vardır. Bağlantılar Arduino Uno ve ESP32 için ayrı ayrı verilir; ESP32\'de 5 voltluk sinyal veren pinler için gerilim bölücü işaretlenir. Akıllı ev bölümlerinin Arduino dosyalarındaki pin planı programa göre değişebilir; o dosyaların başındaki bağlantı listesi esas alınır.'));
const ST = { ok: 'Doğrudan', warn: 'Dikkat', no: 'Uygun değil' };
add(TABLE(['Sensör', 'Model', 'Bilgi türü', 'Uno', 'ESP32', 'Bölüm'], SENSORS.list.map(s => [L(s.name), s.model, ({ digital: 'Dijital', analog: 'Analog', pulse: 'Darbe süresi', i2c: 'I2C', spi: 'SPI', onewire: 'Tek hat' })[s.out] || s.out,
  ST[s.boards.uno.st], ST[s.boards.esp32.st], String(s.chapter)]), [27, 20, 15, 12, 12, 14], true));
add(H2('Temel bilgiler'));
SENSORS.basics.items.forEach(it => { add(H3(L(it.h))); add(P(L(it.t))); });
add(H2('Bağlantı tabloları'));
SENSORS.list.forEach(s => {
  add(H3(L(s.name) + ' (' + s.model + ')'));
  add(TABLE(['Sensör pini', 'Arduino Uno', 'ESP32', 'Neden?'], s.pins.map(p => [p.p, p.uno, p.esp + (p.div ? ' (gerilim bölücüyle)' : ''), L(p.why)]), [15, 15, 20, 50], true));
  if (s.caution) add(P('Dikkat: ' + L(s.caution), { size: 19 }));
});

/* ---------- 11-13 ---------- */
add(H1('11. Yol haritası ve bilinen sınırlar'), H2('11.1 Tamamlananlar'));
add(B1('15 bölüm: sıralama, döngüler, koşullar, olaylar, değişken ve karşılaştırma, eşik değerler, fonksiyonlar, proje, Arduino atölyesi, Python atölyesi, Arduino II, ESP32 akıllı ev, Python Turtle, Python oyun tasarımı, Python yapay zekâ.'));
add(B1('Bölüm 1–10\'da Başlangıç / Orta / Zor, Bölüm 11–15\'te şimdilik Başlangıç; toplam ' + STEPS.length + ' adım.'));
add(B1('Arduino (.ino, Uno ve ESP32) ve Python (.py) dışa aktarma; sensör kütüphanesi; TR/EN; öğretmen modu; çevrimdışı kullanım; sınıf sürümü (öğretmen sunucusu, öğrenci istemcisi, canlı takip, uzaktan güncelleme).'));
add(H2('11.2 Bilinen sınırlar'));
add(B1('İlerleme kodu sadece yıldızları taşır; dizilen bloklar bilgisayarda kalır.'));
add(B1('Python ve Arduino kodları tarayıcıda çalıştırılmaz; tarayıcıdaki benzetim JavaScript ile yapılır ve indirilen dosyalar aynı mantıkla çalışır.'));
add(B1('Arduino kodundaki "bekle" `delay()` olduğu için gerçek kartta bekleme sırasında başka olaylar dinlenmez; benzetimde olaylar beklemeden çalışır.'));
add(B1('Olay blokları yalnızca o adımda tanımlı sensörlerin olaylarını gösterir; sensör değerleri senaryodan gelir (gerçek karta bağlı canlı veri yoktur).'));
add(H2('11.3 Gelecek fikirleri'));
add(B1('**Sınıf sürümü:** öğretmen bilgisayarı için afi-sunucu.exe ve öğrenci bilgisayarları için afi-istemci.exe hazır (5.5, 7.5). Sıradaki adımlar: istemci programının kendini de güncellemesi, öğretmenin öğrenci ekranını kilitlemesi ya da herkesi aynı adıma yönlendirmesi, başka dersler için yeni içerik paketleri.'));
add(B1('Bölüm 11–15 için Orta ve Zor düzeyleri.'));
add(B1('ESP32 ile Wi-Fi bölümü: telefondan bildirim, web sayfasından lamba açma.'));
add(B1('Öğrencinin bloklarını da taşıyan dışa/içe aktarma (dosya olarak).'));
add(H1('12. Sorun giderme'));
add(TABLE(['Sorun', 'Neden', 'Çözüm'], [
  ['Sayfa boş ya da bloklar gelmiyor', 'Zip\'in içinden açıldı ya da dosyalar eksik.', 'Zip\'i ayıkla; index.html\'in yanında js ve lib klasörleri olduğundan emin ol.'],
  ['Eski sürüm görünüyor', 'Tarayıcı önbelleği.', 'Ctrl + F5 ile yenile.'],
  ['İlerleme kayboldu', 'Tarayıcı verileri silindi ya da gizli pencere kullanıldı.', 'İlerleme kodu ile devam et; gizli pencere kullanma.'],
  ['"Bu kod okunamadı"', 'Harf yanlış yazıldı ya da bilgisayar sayfanın eski sürümünü açtı.', 'Harfleri kontrol et (I, O, 0, 1 yoktur). Ctrl + F5 ile sayfayı yenileyip tekrar dene.'],
  ['Ses gelmiyor', 'Ayarlarda kapalı ya da bilgisayarın sesi kısık.', 'Ayarlar > Sesli tepkiler; konuşma için bilgisayarda Türkçe ses olmalı (Edge\'de vardır).'],
  ['Blok alanı dar', 'Ekran küçük.', '"Blok alanını büyüt" düğmesi, panel tutamakları ya da alttaki yükseklik tutamağı.'],
  ['Bir panel kayboldu', 'Panel ince şeride daraltıldı.', 'Şeritteki ok düğmesine bas.'],
  ['"Bazı komutlar hiçbir bloğa bağlı değil"', 'Akıllı ev adımlarında komutlar bir olay, başlangıçta, her saniye ya da fonksiyon bloğunun içinde olmalı.', 'Vurgulanan bloğu uygun bloğun içine sürükle.'],
  ['"Program bir başlangıç bloğuyla başlamalı"', 'Blok alanında olay, "başlangıçta" ya da "her saniye" bloğu yok.', 'Görevde istenen başlangıç bloğunu sürükle, komutları onun içine koy.'],
  ['"python tanınmıyor"', 'Python kurulu değil ya da PATH\'e eklenmedi.', 'python.org\'dan kur ve "Add python.exe to PATH" kutusunu işaretle; ya da `py` komutunu kullan.'],
  ['.py dosyası açılınca hemen kapanıyor', 'Dosyaya çift tıklandı.', 'Komut İstemi\'nden `python dosya.py` ile çalıştır.'],
  ['Arduino: "No such file DHT.h"', 'Kütüphane yüklü değil.', 'Araçlar > Kütüphaneleri Yönet\'ten dosyanın başında yazan kütüphaneyi yükle.'],
  ['Arduino: Port görünmüyor', 'USB kablosu sadece şarj kablosu ya da sürücü eksik.', 'Veri kablosu kullan; CH340 sürücüsünü yükle (klon kartlarda).'],
  ['Öğrenciler sunucu adresini açamıyor', 'Güvenlik duvarı izin vermedi, öğrenci başka ağda ya da adres yanlış.', 'Öğretmen bilgisayarında Windows Güvenlik Duvarı > Uygulamaya izin ver > afi-sunucu için Özel kutusunu işaretle. Siyah pencerede yazan adresi kullan; okul ağı "Ortak" görünüyorsa ağ ayarından "Özel" yap.'],
  ['"Sınıf bağlantısı yok"', 'Öğretmen sunucusu kapalı, ağ kopuk ya da istemci sunucuyu bulamadı.', 'Öğrenci çalışmaya devam edebilir; kayıtlar bekletilir. Etikete tıklayıp sunucu adresini elle yaz (ör. 192.168.1.20:8000) ya da "Şimdi ara".'],
  ['Panel: "Port kullanımda"', 'Sunucu zaten açık ya da başka bir program 8000 portunu kullanıyor.', 'Açık olan pencereyi bul; ya da `afi-sunucu.exe --port 8001` ile başlat (istemciler bilgisayar adından yine bulur).'],
  ['Windows "bilgisayarınızı korudu" diyor', 'Program imzalı değil.', 'Ek bilgi > Yine de çalıştır. Programlar yalnızca GitHub\'daki isikcirobot_offline sayfasından indirilmeli.'],
  ['Seri Monitör\'de anlamsız harfler', 'Hız uyuşmuyor.', 'Uno için 9600, ESP32 için 115200 seç.'],
  ['Sensör değeri hep 0 ya da hep 100', 'Kablo yanlış pine ya da kalibrasyon.', 'Dosyanın başındaki bağlantı listesine göre kontrol et; toprak nemi için KURU/ISLAK sayılarını ölçüp değiştir.']
], [26, 32, 42], true));
add(H1('13. Lisanslar ve kaynaklar'));
add(B1('Blockly 11.2.2 — Apache License 2.0 (Raspberry Pi Foundation, önceden Google). Lisans metni lib/BLOCKLY_LISANS.txt dosyasındadır.'));
add(B1('afi kod\'un kendi kodu, içeriği, çizimleri ve bu kılavuz Aydın İncekara için hazırlanmıştır.'));
add(B1('Arduino kodlarında adı geçen kütüphaneler (DHT sensor library, MFRC522, Adafruit MPU6050, ESP32Servo) kendi lisanslarıyla Arduino IDE üzerinden ücretsiz yüklenir.'));
add(B1('Yazı tipleri (Fredoka, Nunito, JetBrains Mono) Google Fonts üzerinden SIL Open Font License ile kullanılır; internetsiz sürümde bilgisayarın yazı tipleri kullanılır.'));

/* ---------- Ek A ---------- */
add(H1('Ek A. Tüm adımlar'));
add(P('Sınır: 3 yıldız için en fazla blok sayısı. Senaryo/düzen: programın test edildiği farklı durum sayısı. Bölüm 1–3\'te çözüm kısa çözüm dilinde (8.5), Bölüm 4–15\'te çözümde kullanılan bloklar yazılmıştır; tam çözüm öğretmen modunda "Çözümü yükle" ile görülür.'));
const BLK = { h_forever: 'sürekli tekrarla', t_fwd: 'ileri', t_back: 'geri', t_left: 'sola dön', t_right: 'sağa dön', t_penup: 'kalem kaldır', t_pendown: 'kalem indir', t_color: 'renk', t_width: 'kalınlık', t_circle: 'daire',
  g_start: 'başlayınca', g_key: 'tuş', g_tick: 'her adımda', g_change: 'konum değiştir', g_goto: 'git', g_random: 'rastgele', g_score: 'puan', g_say: 'yaz', g_stop: 'bitir', g_touch: 'değdi mi', g_pos: 'konum', g_scorev: 'puan',
  ai_predict: 'tahmin', ai_answer: 'cevap', ai_feat: 'özellik', ai_mean: 'ortalama', ai_has: 'kelime var mı', ai_count: 'kelime sayısı', h_start: 'başlangıçta', h_every: 'her saniye', h_event: 'olay', h_fn_def: 'fonksiyon', h_fn_call: 'çağır', h_switch: 'aç/kapat', h_move: 'kapı/pencere', h_wait: 'bekle', h_show: 'ekrana yaz', h_sensor: 'sensör', h_digital: 'sensör sorusu',
  controls_if: 'eğer', controls_ifelse: 'eğer/değilse', logic_compare: 'karşılaştır', logic_operation: 've/veya', logic_negate: 'değil', math_arithmetic: 'işlem', variables_set: 'değişken', variables_get: 'değişken', math_change: 'artır', controls_repeat_ext: 'tekrarla', text: 'metin', text_join: 'birleştir', math_round: 'yuvarla', math_number: 'sayı' };
COURSE.chapters.forEach(ch => {
  add(H2('Bölüm ' + ch.num + ' · ' + L(ch.name)));
  ['easy', 'mid', 'hard'].forEach(tr => {
    const rows = STEPS.filter(s => s.ch === ch && (s.ls.tier || 'easy') === tr).map(s => {
      const g = L(s.st.goal).replace(/^Görev: /, '').replace(/ En fazla \d+ blok\.$/, '');
      if (s.st.kind === 'home') {
        const used = new Set(); (function walk(bs) { bs.forEach(b => { if (!b) return; used.add(BLK[b.type] || b.type); Object.keys(b.inputs || {}).forEach(k => b.inputs[k].block && walk([b.inputs[k].block])); if (b.next) walk([b.next.block]); }); })(s.st.sol.blocks.blocks);
        return [s.st.id, (s.li + 1) + '. ' + L(s.ls.title), g, String(s.st.max), String(s.st.scen.length), [...used].join(', ')];
      }
      if (s.st.kind && s.st.kind !== 'home') {
        const used = new Set(); (function walk(bs) { bs.forEach(b => { if (!b) return; used.add(BLK[b.type] || b.type); Object.keys(b.inputs || {}).forEach(k => b.inputs[k].block && walk([b.inputs[k].block])); if (b.next) walk([b.next.block]); }); })(s.st.sol.blocks.blocks);
        const nv = s.st.kind === 'game' ? s.st.scen.length : s.st.kind === 'ai' ? s.st.sets.length : 1;
        return [s.st.id, (s.li + 1) + '. ' + L(s.ls.title), g, String(s.st.max), String(nv), [...used].join(', ')];
      }
      return [s.st.id, (s.li + 1) + '. ' + L(s.ls.title), g, String(s.st.max), String(Engine.variantsOf(s.st).length), '`' + s.st.sol + '`'];
    });
    if (!rows.length) return;
    add(H3((COURSE.tiers[tr] || {}).tr + ' (' + rows.length + ' adım)'));
    add(TABLE(['Adım', 'Ders', 'Görev', 'Sınır', 'Sen.', 'Çözüm / bloklar'], rows, [11, 15, 40, 6, 6, 22], true));
  });
});

/* ---------- belge ---------- */
const doc = new D.Document({
  creator: 'afi kod', title: 'afi kod - Kılavuz', description: 'afi kod proje ve kullanım kılavuzu',
  numbering: { config: [{ reference: 'num', levels: [{ level: 0, format: D.LevelFormat.DECIMAL, text: '%1.', alignment: D.AlignmentType.START, style: { paragraph: { indent: { left: 420, hanging: 300 } } } }] }] },
  styles: { default: { document: { run: { font: FONT, size: 21 } } } },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new D.Footer({ children: [new D.Paragraph({ alignment: D.AlignmentType.RIGHT, children: [new D.TextRun({ text: 'afi kod · Kılavuz · ', font: FONT, size: 16, color: '7A8698' }), new D.TextRun({ children: [D.PageNumber.CURRENT], font: FONT, size: 16, color: '7A8698' })] })] }) },
    children: C_
  }]
});
D.Packer.toBuffer(doc).then(buf => { fs.writeFileSync(OUT, buf); console.log('yazıldı', OUT, Math.round(buf.length / 1024) + ' KB'); });
