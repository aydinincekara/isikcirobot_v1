/* afi kod - Python bölümleri (Turtle, oyun, yapay zekâ) metinleri */
(function (root) {
  'use strict';
  var I = root.I18N;
  function add(lang, o) {
    Object.keys(o).forEach(function (k) {
      if (k === 'blocks' || k === 'info') Object.assign(I[lang][k] = I[lang][k] || {}, o[k]);
      else I[lang][k] = o[k];
    });
  }
  root.addI18N = add;

  /* ---------- Turtle ---------- */
  add('tr', {
    tt_ready: 'Blokları dizip Çalıştır\'a bas, afi çizsin. Soluk renkli çizgiler hedef çizimdir.',
    tt_running: 'afi çiziyor...', tt_win: 'Çizim tamam!', tt_success: 'Harika! Çizimin hedefle tıpatıp aynı.',
    tt_missing: 'Çizim eksik: kırmızı kesik çizgiler daha çizilmedi.', tt_extra: 'Fazladan çizgi var: kırmızı çizgiler hedefte yok.',
    tt_both: 'Çizim hedefle aynı değil: kırmızı kesik yerler eksik, kırmızı çizgiler fazla.', tt_color: 'Şekil doğru ama renk farklı. Kalem rengini kontrol et.',
    blocks: {
      T_FWD: '↑ %1 adım ileri git', T_BACK: '↓ %1 adım geri git', T_LEFT: '↺ %1° sola dön', T_RIGHT: '↻ %1° sağa dön',
      T_PENUP: '✎ kalemi kaldır', T_PENDOWN: '✎ kalemi indir', T_COLOR: '🎨 kalem rengi %1', T_WIDTH: '✎ kalem kalınlığı %1', T_CIRCLE: '◯ yarıçapı %1 olan daire çiz',
      T_C_BLACK: 'siyah', T_C_RED: 'kırmızı', T_C_BLUE: 'mavi', T_C_GREEN: 'yeşil', T_C_ORANGE: 'turuncu', T_C_PURPLE: 'mor', T_C_GOLD: 'altın sarısı', T_C_DEEPPINK: 'pembe',
      T_FWD_TIP: 'Baktığı yöne doğru ilerler, kalem inikse çizgi çizer.', T_BACK_TIP: 'Geri geri gider.', T_LEFT_TIP: 'Verilen açı kadar sola döner.', T_RIGHT_TIP: 'Verilen açı kadar sağa döner.',
      T_PENUP_TIP: 'Kalemi kaldırır: yürür ama çizmez.', T_PENDOWN_TIP: 'Kalemi indirir: yürürken çizer.', T_COLOR_TIP: 'Bundan sonraki çizgilerin rengi.', T_WIDTH_TIP: 'Çizginin kalınlığı.', T_CIRCLE_TIP: 'Solunda merkezi olan bir daire çizer.'
    },
    info: {
      t_fwd: { name: 'ileri git', text: 'Python\'da <b>afi.forward(100)</b>. afi baktığı yöne 100 adım (piksel) gider; kalem inikse arkasında çizgi kalır.', life: 'CNC makineleri ve lazer kesiciler de "şu kadar ileri git" komutlarıyla çalışır.' },
      t_back: { name: 'geri git', text: 'Python\'da <b>afi.backward(50)</b>. Yönünü değiştirmeden geri geri gider.', life: 'Park eden bir araba yönünü değiştirmeden geri gider.' },
      t_left: { name: 'sola dön', text: 'Python\'da <b>afi.left(90)</b>. Yerinde, verilen derece kadar sola döner. Tam tur 360 derecedir; bir karenin köşesi 90, eşkenar üçgeninki 120 derece döndürür.', life: 'Robot süpürgeler engel görünce belli bir açıyla döner.' },
      t_right: { name: 'sağa dön', text: 'Python\'da <b>afi.right(90)</b>. Yerinde, verilen derece kadar sağa döner.', life: 'Uçakların otomatik pilotu rotayı derece derece düzeltir.' },
      t_penup: { name: 'kalemi kaldır', text: 'Python\'da <b>afi.penup()</b>. Bundan sonra afi yürür ama çizmez. Şekiller arasında boşluk bırakmak için kullanılır.', life: 'Çizim plotter\'ları kalemi kaldırıp başka bir yere taşır, sonra yeniden indirir.' },
      t_pendown: { name: 'kalemi indir', text: 'Python\'da <b>afi.pendown()</b>. Kalem yeniden kâğıda değer, yürürken çizgi çizer.', life: 'El yazısında da kalemi kaldırıp indiririz.' },
      t_color: { name: 'kalem rengi', text: 'Python\'da <b>afi.color("red")</b>. Renk adları İngilizce yazılır: red, blue, green...', life: 'Bilgisayarda her renk bir ad ya da sayıyla (#FF0000) gösterilir.' },
      t_width: { name: 'kalem kalınlığı', text: 'Python\'da <b>afi.pensize(4)</b>. Sayı büyüdükçe çizgi kalınlaşır.', life: 'Çizim programlarındaki fırça boyutu ayarı.' },
      t_circle: { name: 'daire çiz', text: 'Python\'da <b>afi.circle(50)</b>. Yarıçapı 50 olan bir daire çizer; dairenin merkezi afi\'nin solundadır.', life: 'Pergel de bir merkezin etrafında aynı uzaklıkta döner.' }
    }
  });
  add('en', {
    tt_ready: 'Arrange the blocks and press Run so afi draws. The faint lines are the target drawing.',
    tt_running: 'afi is drawing...', tt_win: 'Drawing complete!', tt_success: 'Great! Your drawing matches the target exactly.',
    tt_missing: 'The drawing is missing parts: the red dashed lines are not drawn yet.', tt_extra: 'There are extra lines: the red lines are not in the target.',
    tt_both: 'The drawing does not match: red dashes are missing, red lines are extra.', tt_color: 'The shape is right but the colour is different. Check the pen colour.',
    blocks: {
      T_FWD: '↑ forward %1', T_BACK: '↓ back %1', T_LEFT: '↺ turn left %1°', T_RIGHT: '↻ turn right %1°',
      T_PENUP: '✎ pen up', T_PENDOWN: '✎ pen down', T_COLOR: '🎨 pen colour %1', T_WIDTH: '✎ pen size %1', T_CIRCLE: '◯ circle with radius %1',
      T_C_BLACK: 'black', T_C_RED: 'red', T_C_BLUE: 'blue', T_C_GREEN: 'green', T_C_ORANGE: 'orange', T_C_PURPLE: 'purple', T_C_GOLD: 'gold', T_C_DEEPPINK: 'pink',
      T_FWD_TIP: 'Moves the way it is facing; draws a line if the pen is down.', T_BACK_TIP: 'Moves backwards.', T_LEFT_TIP: 'Turns left by the given angle.', T_RIGHT_TIP: 'Turns right by the given angle.',
      T_PENUP_TIP: 'Lifts the pen: moves without drawing.', T_PENDOWN_TIP: 'Puts the pen down: draws while moving.', T_COLOR_TIP: 'Colour of the next lines.', T_WIDTH_TIP: 'Thickness of the line.', T_CIRCLE_TIP: 'Draws a circle whose centre is on the left.'
    },
    info: {
      t_fwd: { name: 'forward', text: 'In Python: <b>afi.forward(100)</b>. afi moves 100 steps (pixels) the way it is facing; with the pen down it leaves a line.', life: 'CNC machines and laser cutters also work with "move this far" commands.' },
      t_back: { name: 'back', text: 'In Python: <b>afi.backward(50)</b>. Moves backwards without turning.', life: 'A car parks by reversing without changing direction.' },
      t_left: { name: 'turn left', text: 'In Python: <b>afi.left(90)</b>. Turns left on the spot by the given degrees. A full turn is 360 degrees; a square corner is 90, an equilateral triangle corner turns 120.', life: 'Robot vacuums turn by a set angle when they meet an obstacle.' },
      t_right: { name: 'turn right', text: 'In Python: <b>afi.right(90)</b>. Turns right on the spot by the given degrees.', life: 'An aircraft autopilot corrects the course degree by degree.' },
      t_penup: { name: 'pen up', text: 'In Python: <b>afi.penup()</b>. From now on afi moves without drawing. Used to leave gaps between shapes.', life: 'Drawing plotters lift the pen, move somewhere else and put it down again.' },
      t_pendown: { name: 'pen down', text: 'In Python: <b>afi.pendown()</b>. The pen touches the paper again and draws while moving.', life: 'We lift and lower the pen when we write by hand too.' },
      t_color: { name: 'pen colour', text: 'In Python: <b>afi.color("red")</b>. Colour names are written in English: red, blue, green...', life: 'On a computer every colour has a name or a number (#FF0000).' },
      t_width: { name: 'pen size', text: 'In Python: <b>afi.pensize(4)</b>. The bigger the number, the thicker the line.', life: 'The brush size setting in drawing apps.' },
      t_circle: { name: 'circle', text: 'In Python: <b>afi.circle(50)</b>. Draws a circle with radius 50; its centre is on afi\'s left.', life: 'A pair of compasses also turns around a centre at the same distance.' }
    }
  });
})(typeof window !== 'undefined' ? window : this);

/* ---------- Oyun ---------- */
(function (root) {
  'use strict';
  var add = root.addI18N;
  add('tr', {
    gm_ready: 'Blokları dizip Çalıştır\'a bas: program alttaki tuş basışlarıyla denenir. 🎮 Oyna ile kendin de oynayabilirsin.',
    gm_running: 'Oyun oynanıyor...', gm_win: 'Oyun çalışıyor!', gm_success: 'Harika! Oyunun her adımda doğru çalıştı. Şimdi 🎮 Oyna ile dene!',
    gm_loose: 'Bazı bloklar bir başlangıç bloğuna bağlı değil. Onları "oyun başlayınca", "tuşa basılınca" ya da "her adımda" bloğunun içine koy.',
    gm_failP: '{n}. adımda oyuncu {w} noktasında olmalıydı, senin programında {g}.', gm_failA: '{n}. adımda elma {w} noktasında olmalıydı, senin programında {g}.',
    gm_failS: '{n}. adımda puan {w} olmalıydı, senin programında {g}.', gm_failOver1: '{n}. adımda oyun bitmeliydi.', gm_failOver0: '{n}. adımda oyun bitmemeliydi.',
    gm_failM1: '{n}. adımda ekranda bir mesaj görünmeliydi.', gm_failM0: '{n}. adımda ekranda henüz mesaj olmamalıydı.',
    gm_score: 'Puan', gm_over: 'Oyun bitti', gm_play: '🎮 Oyna', gm_stopPlay: '■ Oyunu durdur', gm_liveOn: 'Ok tuşları ve boşluk tuşuyla oyna. Durdurmak için "Oyunu durdur".',
    gm_liveHint: 'Ok tuşları ←↑→↓ ve boşluk ile oyna', gm_variantNote: 'Program {m} farklı oyunla denenir.',
    blocks: {
      G_START: '▶ oyun başlayınca', G_KEY: '⌨ %1 tuşuna basılınca', G_TICK: '⏱ her adımda',
      G_K_R: '→ sağ ok', G_K_L: '← sol ok', G_K_U: '↑ yukarı ok', G_K_D: '↓ aşağı ok', G_K_S: '␣ boşluk',
      G_PLAYER: 'oyuncu', G_APPLE: 'elma', G_CHANGE: '%1 %2 konumunu %3 değiştir', G_GOTO: '%1 git x: %2 y: %3',
      G_RANDOM: 'elmayı %1 rastgele bir yere taşı', G_ANY: 'herhangi', G_TOP: 'en üstte',
      G_SCORE: '★ puanı %1 artır', G_SAY: '💬 ekrana yaz %1', G_STOP: '⏹ oyunu bitir', G_TOUCH: 'oyuncu elmaya değdi mi?', G_POS: '%1 %2 konumu', G_SCOREV: 'puan',
      G_START_TIP: 'Oyun açılınca bir kez çalışır.', G_KEY_TIP: 'Seçilen tuşa her basılınca çalışır.', G_TICK_TIP: 'Oyun boyunca her adımda bir kez çalışır.',
      G_CHANGE_TIP: 'x sağa-sola, y yukarı-aşağı konumdur.', G_GOTO_TIP: 'Verilen noktaya gider.', G_RANDOM_TIP: 'Elmayı rastgele bir noktaya taşır.',
      G_SCORE_TIP: 'Puanı artırır ve ekrana yazar.', G_SAY_TIP: 'Ekranın ortasına yazı yazar.', G_STOP_TIP: 'Oyunu bitirir; tuşlar ve adımlar artık çalışmaz.',
      G_TOUCH_TIP: 'Oyuncu ile elma aynı yerdeyse doğru.', G_POS_TIP: 'x ya da y konumunu sayı olarak verir.', G_SCOREV_TIP: 'Şu anki puan.'
    },
    info: {
      g_start: { name: 'oyun başlayınca', text: 'Oyun açılır açılmaz bir kez çalışır. Python dosyasında <b>def baslangic():</b> fonksiyonu olur. Oyuncuyu başlangıç noktasına koymak için kullanılır.', life: 'Her oyunun başında karakterler yerlerine konur, puan sıfırlanır.' },
      g_key: { name: 'tuşa basılınca', text: 'Bir <span class="term">olay</span>: tuşa basılınca içi çalışır. Python turtle\'da <b>ekran.onkey(sag_ok, "Right")</b> satırı tuşu fonksiyona bağlar.', life: 'Oyun konsollarında her düğme bir olaydır.' },
      g_tick: { name: 'her adımda', text: 'Oyunun kalbi: oyun döngüsü (game loop). Saniyede birkaç kez çalışır; düşen nesneler, çarpışma kontrolü ve puan burada yapılır. Python\'da <b>ekran.ontimer(dongu, 160)</b> ile kurulur.', life: 'Bilgisayar oyunları saniyede 30-60 kez döngüden geçer; buna "kare hızı" (FPS) denir.' },
      g_change: { name: 'konumu değiştir', text: 'Oyun ekranı bir koordinat düzlemidir: <b>x</b> sağa doğru, <b>y</b> yukarı doğru artar. Python\'da <b>oyuncu.setx(oyuncu.xcor() + 20)</b>.', life: 'Haritalardaki enlem-boylam da bir koordinat sistemidir.' },
      g_goto: { name: 'noktaya git', text: 'Python\'da <b>oyuncu.goto(-160, 0)</b>. (0, 0) ekranın tam ortasıdır.', life: 'GPS bir aracı belirli koordinatlara yönlendirir.' },
      g_random: { name: 'rastgele taşı', text: 'Python\'da <b>random.randint(-9, 9) * 20</b> ile rastgele bir sayı seçilir. Testte hep aynı sırayla gelir, oynarken her seferinde farklıdır.', life: 'Zar atmak, kart karıştırmak ve oyunlardaki sürprizler rastgelelikle yapılır.' },
      g_score: { name: 'puanı artır', text: 'Puan bir <span class="term">değişken</span>dir: <b>puan = puan + 1</b>. Fonksiyonun içinden değiştirildiği için Python\'da <b>global puan</b> satırı gerekir.', life: 'Oyunlardaki skor tabloları, adım sayar uygulamaları.' },
      g_say: { name: 'ekrana yaz', text: 'Ekranın ortasına bir mesaj yazar. Python\'da turtle\'ın <b>write()</b> komutuyla yapılır.', life: '"Seviye tamamlandı!" gibi oyun mesajları.' },
      g_stop: { name: 'oyunu bitir', text: '<b>oyun_bitti = True</b> yapar. Tuş ve adım fonksiyonları en başta buna bakar ve artık çalışmaz.', life: 'Süre bitince ya da can kalmayınca oyunlar biter.' },
      g_touch: { name: 'değdi mi?', text: 'Çarpışma kontrolü: <b>oyuncu.distance(elma) &lt; 20</b>. İki nesne arasındaki uzaklık 20\'den azsa değmiş sayılır.', life: 'Bütün oyunlar karakterin bir şeye çarpıp çarpmadığını sürekli kontrol eder.' },
      g_pos: { name: 'konum', text: 'Python\'da <b>elma.ycor()</b> gibi; nesnenin x ya da y konumunu verir.', life: 'Bir uçağın yüksekliği de y konumu gibidir.' },
      g_scorev: { name: 'puan', text: 'Puan değişkeninin şu anki değeri.', life: 'Rekor tablosu en yüksek puanı saklar.' }
    }
  });
  add('en', {
    gm_ready: 'Arrange the blocks and press Run: the program is tested with the key presses below. Use 🎮 Play to play it yourself.',
    gm_running: 'Playing...', gm_win: 'The game works!', gm_success: 'Great! Your game worked at every step. Now try it with 🎮 Play!',
    gm_loose: 'Some blocks are not inside a start block. Put them inside "when the game starts", "when key pressed" or "every step".',
    gm_failP: 'At step {n} the player should be at {w}, but in your program it is at {g}.', gm_failA: 'At step {n} the apple should be at {w}, but in your program it is at {g}.',
    gm_failS: 'At step {n} the score should be {w}, but in your program it is {g}.', gm_failOver1: 'At step {n} the game should be over.', gm_failOver0: 'At step {n} the game should not be over yet.',
    gm_failM1: 'At step {n} a message should be on the screen.', gm_failM0: 'At step {n} there should be no message on the screen yet.',
    gm_score: 'Score', gm_over: 'Game over', gm_play: '🎮 Play', gm_stopPlay: '■ Stop game', gm_liveOn: 'Play with the arrow keys and space. Press "Stop game" to finish.',
    gm_liveHint: 'Play with the arrow keys ←↑→↓ and space', gm_variantNote: 'The program is tested with {m} different games.',
    blocks: {
      G_START: '▶ when the game starts', G_KEY: '⌨ when %1 key pressed', G_TICK: '⏱ every step',
      G_K_R: '→ right arrow', G_K_L: '← left arrow', G_K_U: '↑ up arrow', G_K_D: '↓ down arrow', G_K_S: '␣ space',
      G_PLAYER: 'player', G_APPLE: 'apple', G_CHANGE: 'change %1 %2 by %3', G_GOTO: 'move %1 to x: %2 y: %3',
      G_RANDOM: 'move the apple to a random place %1', G_ANY: 'anywhere', G_TOP: 'at the top',
      G_SCORE: '★ add %1 to score', G_SAY: '💬 show %1', G_STOP: '⏹ end the game', G_TOUCH: 'player touching apple?', G_POS: '%1 %2 position', G_SCOREV: 'score',
      G_START_TIP: 'Runs once when the game opens.', G_KEY_TIP: 'Runs every time the key is pressed.', G_TICK_TIP: 'Runs once on every step of the game.',
      G_CHANGE_TIP: 'x is left-right, y is up-down.', G_GOTO_TIP: 'Moves to the given point.', G_RANDOM_TIP: 'Moves the apple to a random point.',
      G_SCORE_TIP: 'Adds to the score and shows it.', G_SAY_TIP: 'Writes text in the middle of the screen.', G_STOP_TIP: 'Ends the game; keys and steps stop working.',
      G_TOUCH_TIP: 'True if the player and the apple are in the same place.', G_POS_TIP: 'Gives the x or y position as a number.', G_SCOREV_TIP: 'The current score.'
    },
    info: {
      g_start: { name: 'when the game starts', text: 'Runs once as soon as the game opens. In the Python file it becomes the <b>def on_start():</b> function. Used to put the player at the start.', life: 'At the start of every game the characters take their places and the score is reset.' },
      g_key: { name: 'when key pressed', text: 'An <span class="term">event</span>: it runs when the key is pressed. In Python turtle, <b>screen.onkey(right_key, "Right")</b> links the key to the function.', life: 'On a game console every button is an event.' },
      g_tick: { name: 'every step', text: 'The heart of a game: the game loop. It runs several times a second; falling objects, collision checks and scoring happen here. In Python it is set up with <b>screen.ontimer(game_loop, 160)</b>.', life: 'Video games go through their loop 30-60 times a second; this is the frame rate (FPS).' },
      g_change: { name: 'change position', text: 'The game screen is a coordinate plane: <b>x</b> grows to the right, <b>y</b> grows upwards. In Python: <b>player.setx(player.xcor() + 20)</b>.', life: 'Latitude and longitude on maps are also a coordinate system.' },
      g_goto: { name: 'move to a point', text: 'In Python: <b>player.goto(-160, 0)</b>. (0, 0) is the exact centre of the screen.', life: 'GPS guides a car to given coordinates.' },
      g_random: { name: 'random place', text: 'In Python, <b>random.randint(-9, 9) * 20</b> picks a random number. In the test the numbers always come in the same order; when you play they are different every time.', life: 'Rolling dice, shuffling cards and surprises in games all use randomness.' },
      g_score: { name: 'add to score', text: 'The score is a <span class="term">variable</span>: <b>score = score + 1</b>. Because it is changed inside a function, Python needs the line <b>global score</b>.', life: 'Game leaderboards and step-counter apps.' },
      g_say: { name: 'show message', text: 'Writes a message in the middle of the screen. In Python it uses turtle\'s <b>write()</b>.', life: 'Game messages like "Level complete!".' },
      g_stop: { name: 'end the game', text: 'Sets <b>game_over = True</b>. The key and step functions check it first and stop working.', life: 'Games end when time runs out or there are no lives left.' },
      g_touch: { name: 'touching?', text: 'Collision check: <b>player.distance(apple) &lt; 20</b>. If the two objects are closer than 20 they are touching.', life: 'Every game keeps checking whether the character hits something.' },
      g_pos: { name: 'position', text: 'Like <b>apple.ycor()</b> in Python; gives the x or y position of an object.', life: 'An aircraft\'s altitude is like a y position.' },
      g_scorev: { name: 'score', text: 'The current value of the score variable.', life: 'A high score table keeps the best score.' }
    }
  });
})(typeof window !== 'undefined' ? window : this);

/* ---------- Yapay zekâ ---------- */
(function (root) {
  'use strict';
  var add = root.addI18N;
  add('tr', {
    ai_ready: 'Modelini yaz ve Çalıştır\'a bas: afi önce eğitim verisini, sonra hiç görmediği test verisini tahmin edecek.',
    ai_running: 'afi tahmin ediyor...', ai_win: 'afi öğrendi!', ai_success: 'Harika! afi hiç görmediği örnekleri de doğru bildi.',
    ai_noModel: '"afi\'nin tahmini" bloğu yok ya da boş.', ai_noAnswer: '{n} örnekte afi hiç cevap vermedi. Her yolun sonunda bir "cevap" bloğu olmalı.',
    ai_failTrain: 'Eğitim verisinde {c} / {n} doğru. Önce bildiğin örnekleri doğru ayırmalısın.',
    ai_failTest: 'Test verisinde {c} / {n} doğru (%{p}). En az %{need} olmalı. Kuralını ya da eşiğini değiştir.',
    ai_loose: 'Bazı bloklar "afi\'nin tahmini" bloğunun dışında. Hepsini onun içine koy.', ai_two: 'Sadece bir tane "afi\'nin tahmini" bloğu olmalı.',
    ai_trainData: 'Eğitim verisi', ai_testData: 'Test verisi (afi hiç görmedi)', ai_train: 'Eğitim', ai_test: 'Test', ai_legend2: '● eğitim   ■ test',
    ai_variantNote: 'Program {m} farklı veri setiyle denenir.',
    blocks: {
      AI_PREDICT: '🧠 afi\'nin tahmini', AI_ANSWER: '✔ cevap: %1', AI_FEAT: 'örneğin %1', AI_MEAN: 'eğitim verisinde %1 ortalama %2',
      AI_HAS: 'mesajda %1 geçiyor mu?', AI_COUNT: 'mesajdaki %1 sayısı',
      AI_PREDICT_TIP: 'afi her örnek için bu blokları çalıştırır ve bir cevap verir.', AI_ANSWER_TIP: 'Tahmini verir ve bu örnek için durur.',
      AI_FEAT_TIP: 'İncelenen örneğin bir özelliği (sayı).', AI_MEAN_TIP: 'Eğitim verisindeki bir grubun ortalaması.', AI_HAS_TIP: 'Mesajın içinde bu kelime var mı?', AI_COUNT_TIP: 'Mesajda listedeki kelimelerden kaç tane var?'
    },
    info: {
      ai_predict: { name: 'afi\'nin tahmini', text: 'Bir yapay zekâ <span class="term">modeli</span>: her örneğe bakıp bir cevap veren fonksiyon. Python\'da <b>def tahmin(ornek):</b>. Model önce <b>eğitim verisi</b>yle hazırlanır, sonra hiç görmediği <b>test verisi</b>yle sınanır.', life: 'Fotoğraftaki yüzü tanıyan telefonlar, istenmeyen e-postayı ayıran filtreler ve sesli asistanlar böyle modellerle çalışır.' },
      ai_answer: { name: 'cevap', text: 'Python\'da <b>return "elma"</b>. Fonksiyon burada durur ve tahmini geri verir.', life: 'Bir sınıflandırıcının çıktısı: "kedi", "spam", "mutlu" gibi bir etiket.' },
      ai_feat: { name: 'özellik', text: 'Python\'da <b>ornek["boy"]</b>. Makine öğrenmesinde örneği anlatan sayılara <span class="term">özellik</span> (feature) denir.', life: 'Bir evin fiyatını tahmin eden model metrekare, oda sayısı ve konum gibi özelliklere bakar.' },
      ai_mean: { name: 'ortalama', text: 'Eğitim verisinden öğrenilen bir değer. Program sabit bir sayı yerine veriden hesapladığı eşiği kullanırsa, başka bir veri setinde de çalışır. Makine öğrenmesinin özü budur.', life: 'Bir hava tahmini modeli geçmiş yılların ortalamalarından öğrenir.' },
      ai_has: { name: 'kelime var mı?', text: 'Python\'da <b>"bedava" in mesaj</b>. Metinlerle çalışan yapay zekânın en basit adımı: belirli kelimeleri aramak.', life: 'E-posta programları "kazandınız", "bedava" gibi kelimelere bakarak spamı ayırır.' },
      ai_count: { name: 'kelime sayısı', text: 'Mesajdaki kelimelerin kaçı listede var, onu sayar. İki listenin sayısını karşılaştırmak <span class="term">duygu analizi</span>nin temelidir.', life: 'Şirketler ürün yorumlarının olumlu mu olumsuz mu olduğunu böyle ölçer.' }
    }
  });
  add('en', {
    ai_ready: 'Write your model and press Run: afi will first predict the training data, then the test data it has never seen.',
    ai_running: 'afi is predicting...', ai_win: 'afi learned!', ai_success: 'Great! afi also got the examples it had never seen right.',
    ai_noModel: 'The "afi\'s prediction" block is missing or empty.', ai_noAnswer: 'For {n} examples afi gave no answer. Every path needs an "answer" block at the end.',
    ai_failTrain: '{c} / {n} correct on the training data. First you need to sort the examples you know.',
    ai_failTest: '{c} / {n} correct on the test data ({p}%). It should be at least {need}%. Change your rule or threshold.',
    ai_loose: 'Some blocks are outside the "afi\'s prediction" block. Put them all inside it.', ai_two: 'There should be only one "afi\'s prediction" block.',
    ai_trainData: 'Training data', ai_testData: 'Test data (afi has never seen it)', ai_train: 'Training', ai_test: 'Test', ai_legend2: '● training   ■ test',
    ai_variantNote: 'The program is tested with {m} different data sets.',
    blocks: {
      AI_PREDICT: '🧠 afi\'s prediction', AI_ANSWER: '✔ answer: %1', AI_FEAT: 'sample %1', AI_MEAN: 'in the training data, %1 average %2',
      AI_HAS: 'message contains %1?', AI_COUNT: 'number of %1 in the message',
      AI_PREDICT_TIP: 'afi runs these blocks for every example and gives an answer.', AI_ANSWER_TIP: 'Gives the prediction and stops for this example.',
      AI_FEAT_TIP: 'A feature (number) of the example.', AI_MEAN_TIP: 'The average of a group in the training data.', AI_HAS_TIP: 'Does the message contain this word?', AI_COUNT_TIP: 'How many words from the list are in the message?'
    },
    info: {
      ai_predict: { name: 'afi\'s prediction', text: 'An artificial intelligence <span class="term">model</span>: a function that looks at each example and gives an answer. In Python: <b>def predict(sample):</b>. The model is built with the <b>training data</b> and then tested with <b>test data</b> it has never seen.', life: 'Phones that recognise faces, spam filters and voice assistants all work with models like this.' },
      ai_answer: { name: 'answer', text: 'In Python: <b>return "apple"</b>. The function stops here and gives back the prediction.', life: 'The output of a classifier: a label such as "cat", "spam" or "happy".' },
      ai_feat: { name: 'feature', text: 'In Python: <b>sample["height"]</b>. In machine learning, the numbers that describe an example are called <span class="term">features</span>.', life: 'A model that predicts house prices looks at features such as size, number of rooms and location.' },
      ai_mean: { name: 'average', text: 'A value learned from the training data. If the program uses a threshold calculated from the data instead of a fixed number, it also works on another data set. That is the heart of machine learning.', life: 'A weather model learns from the averages of past years.' },
      ai_has: { name: 'contains word?', text: 'In Python: <b>"free" in message</b>. The simplest step of AI that works with text: looking for certain words.', life: 'Email apps look for words such as "winner" and "free" to catch spam.' },
      ai_count: { name: 'word count', text: 'Counts how many words of the message are in the list. Comparing the counts of two lists is the basis of <span class="term">sentiment analysis</span>.', life: 'Companies measure whether product reviews are positive or negative like this.' }
    }
  });
})(typeof window !== 'undefined' ? window : this);
