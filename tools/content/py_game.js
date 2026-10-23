/* Bölüm 14 - Python oyun tasarımı */
const P = require('./pykit.js');
const { node, iff, cmp } = P;
const start = (...b) => node('g_start', {}, { DO: b }), key = (k, ...b) => node('g_key', { K: k }, { DO: b }), tick = (...b) => node('g_tick', {}, { DO: b });
const chg = (o, a, n) => node('g_change', { O: o, A: a }, { N: n }), go = (o, x, y) => node('g_goto', { O: o }, { X: x, Y: y });
const rnd = w => node('g_random', { W: w }), score = n => node('g_score', {}, { N: n }), say = s => node('g_say', {}, { T: s }), stop = () => node('g_stop');
const touch = () => node('g_touch'), pos = (o, a) => node('g_pos', { O: o, A: a });
const S = (dur, keys, rand) => ({ dur: dur, keys: keys, rand: rand || [] });
const T = (tr, en) => [tr, en];
const LR = [key('R', chg('player', 'x', 20)), key('L', chg('player', 'x', -20))];

module.exports = {
  id: 'oyun', num: 14, kind: 'game', view: 'py',
  name: P.T('Python oyun tasarımı', 'Python game design'),
  concept: P.T('Oyun döngüsü', 'The game loop'),
  story: P.T(
    "Deniz ve Ela bilgisayarda oynayacak bir oyun istiyor, ama hazır bir oyun değil: kendi yaptıkları bir oyun! Bu bölümde afi'yi ok tuşlarıyla yürütecek, gökten düşen elmaları yakalatacak, puan tutacak ve oyunu bitirmeyi öğreneceksin. Her adımı bitirince \"🎮 Oyna\" ile oyununu kendin oynayabilir, .py dosyasını indirip bilgisayarında gerçek bir pencerede oynayabilirsin.",
    "Deniz and Ela want a computer game, but not a ready-made one: a game they make themselves! In this chapter you will move afi with the arrow keys, catch apples falling from the sky, keep score and learn how to end the game. After each step you can play your game with \"🎮 Play\", or download the .py file and play it in a real window on your computer."),
  life: P.T(
    'Bütün bilgisayar oyunları aynı üç parçadan oluşur: oyuncunun tuşlarını dinleyen olaylar, saniyede onlarca kez dönen oyun döngüsü ve puan gibi değişkenler.',
    'Every video game is made of the same three parts: events that listen to the player\'s keys, a game loop that runs dozens of times a second, and variables such as the score.'),
  lessons: [
    { tier: 'easy', title: P.T('Oyuncuyu yürüt', 'Move the player'), steps: [
      { id: 'oyun-1', tools: ['key:R', 'change:player:x:20'],
        scen: [S(8, '.RR.R...'), S(8, 'R...RRR.')],
        sol: [key('R', chg('player', 'x', 20))],
        text: T('Oyun ekranı bir koordinat düzlemi: x sağa doğru büyür. Sağ ok tuşuna basılınca oyuncunun x konumu 20 artsın. Alttaki şerit testte hangi adımda hangi tuşa basılacağını gösterir.',
                'The game screen is a coordinate plane: x grows to the right. When the right arrow key is pressed, the player\'s x position goes up by 20. The strip at the bottom shows which key is pressed at which step in the test.'),
        goal: T('Görev: Sağ ok tuşuna basılınca oyuncunun x konumunu 20 değiştir.', 'Task: When the right arrow is pressed, change the player\'s x by 20.') },
      { id: 'oyun-2', tools: ['key:R', 'key:L', 'change:player:x:20'],
        scen: [S(8, 'RRL.LLR.'), S(8, 'L.LRRR..')],
        sol: LR,
        text: T('Sola gitmek için x azalmalı: -20 eksi sayıdır. Her tuş için ayrı bir olay bloğu gerekir.', 'To go left, x must get smaller: -20 is a negative number. Each key needs its own event block.'),
        goal: T('Görev: Sağ okta x\'i 20, sol okta x\'i -20 değiştir.', 'Task: Right arrow changes x by 20, left arrow changes x by -20.') },
      { id: 'oyun-3', tools: ['key:R', 'key:L', 'key:U', 'key:D', 'change:player:x:20'],
        scen: [S(10, 'RUULDD.R..'), S(10, '.DDRRUL...')],
        sol: LR.concat([key('U', chg('player', 'y', 20)), key('D', chg('player', 'y', -20))]),
        text: T('Yukarı ve aşağı için y konumu kullanılır: yukarı çıkınca y büyür, aşağı inince küçülür.', 'Up and down use the y position: going up makes y bigger, going down makes it smaller.'),
        goal: T('Görev: Dört ok tuşuyla oyuncuyu dört yöne 20\'şer adım yürüt.', 'Task: Move the player 20 steps in four directions with the four arrow keys.') },
      { id: 'oyun-4', tools: ['start', 'goto:player:0:0', 'key:R', 'change:player:x:20'],
        scen: [S(8, '.RRR....'), S(8, 'RR..R...')],
        sol: [start(go('player', -160, 0)), key('R', chg('player', 'x', 20))],
        text: T('Oyun başlarken oyuncu ekranın soluna, (-160, 0) noktasına gitsin. (0, 0) ekranın tam ortasıdır; ekran -200 ile 200 arasındadır.',
                'When the game starts, the player goes to the left side, the point (-160, 0). (0, 0) is the exact centre; the screen goes from -200 to 200.'),
        goal: T('Görev: Oyun başlayınca oyuncuyu x: -160, y: 0 noktasına götür. Sağ okta x\'i 20 değiştir.', 'Task: When the game starts, move the player to x: -160, y: 0. Right arrow changes x by 20.') },
      { id: 'oyun-5', tools: ['key:R', 'if', 'compare:LT:160', 'pos:player:x', 'change:player:x:20'], p0: [100, 0],
        scen: [S(9, 'RRRRRR...'), S(9, 'RR.RRRRR.')],
        sol: [key('R', iff(cmp(pos('player', 'x'), '<', 160), chg('player', 'x', 20)))],
        wrong: [[key('R', chg('player', 'x', 20))]],
        text: T('Oyuncu ekrandan çıkmasın! Sağa gitmeden önce x konumunun 160\'tan küçük olup olmadığına bak. Oyunlarda buna "sınır kontrolü" denir.',
                'The player must not leave the screen! Before moving right, check that x is less than 160. In games this is called a "boundary check".'),
        goal: T('Görev: Sağ okta, oyuncunun x konumu 160\'tan küçükse x\'i 20 değiştir.', 'Task: On the right arrow, if the player\'s x is less than 160, change x by 20.') }
    ] },
    { tier: 'easy', title: P.T('Elma yakala', 'Catch the apple'), steps: [
      { id: 'oyun-6', tools: ['key:R', 'key:U', 'change:player:x:20', 'tick', 'if', 'touch', 'score:1', 'random:any'], a0: [60, 0],
        starter: [key('R', chg('player', 'x', 20)), key('U', chg('player', 'y', 20))],
        scen: [S(9, 'RRR.UU...', [-2, 2]), S(9, '.RR.R..UU', [3, 1])],
        sol: [key('R', chg('player', 'x', 20)), key('U', chg('player', 'y', 20)), tick(iff(touch(), score(1), rnd('any')))],
        text: T('"Her adımda" bloğu oyun döngüsüdür: oyun boyunca durmadan çalışır. Her adımda oyuncu elmaya değdi mi diye bak; değdiyse puan kazan ve elmayı başka yere taşı. Tuş blokları hazır.',
                'The "every step" block is the game loop: it keeps running during the whole game. On every step, check if the player touches the apple; if so, score a point and move the apple somewhere else. The key blocks are ready.'),
        goal: T('Görev: Her adımda: oyuncu elmaya değdiyse puanı 1 artır ve elmayı herhangi rastgele bir yere taşı.', 'Task: Every step: if the player touches the apple, add 1 to the score and move the apple to a random place anywhere.') },
      { id: 'oyun-7', tools: ['tick', 'change:apple:y:-20', 'if', 'compare:LT:-180', 'pos:apple:y', 'random:top'], a0: [0, 180],
        scen: [S(22, '', [2]), Object.assign(S(18, '', [-4]), { a0: [-60, 100] })],
        sol: [tick(chg('apple', 'y', -20), iff(cmp(pos('apple', 'y'), '<', -180), rnd('top')))],
        text: T('Elmalar gökten düşsün: her adımda elmanın y konumu 20 azalsın. Ekranın altından çıkınca (y, -180\'den küçük) en üstte rastgele bir yere taşınsın.',
                'Apples fall from the sky: on every step the apple\'s y goes down by 20. When it leaves the bottom of the screen (y less than -180), it moves to a random place at the top.'),
        goal: T('Görev: Her adımda elmanın y konumunu -20 değiştir; elmanın y konumu -180\'den küçükse elmayı en üstte rastgele bir yere taşı.',
                'Task: Every step, change the apple\'s y by -20; if the apple\'s y is less than -180, move the apple to a random place at the top.') },
      { id: 'oyun-8', tools: ['key:R', 'key:L', 'change:player:x:20', 'tick', 'change:apple:y:-20', 'if', 'touch', 'score:1', 'random:top'], p0: [0, -160], a0: [40, 180],
        starter: LR,
        scen: [S(20, 'RR..................', [-3]), S(20, 'L.LL................', [2])],
        sol: LR.concat([tick(chg('apple', 'y', -20), iff(touch(), score(1), rnd('top')))]),
        text: T('Yakalama oyunu! Oyuncu aşağıda bekliyor, elma düşüyor. Elmaya değince puan kazan ve yeni elma en üstten düşsün. Sağ-sol tuşları hazır.',
                'A catching game! The player waits at the bottom while the apple falls. When the player touches it, score a point and a new apple falls from the top. The left and right keys are ready.'),
        goal: T('Görev: Her adımda elmanın y konumunu -20 değiştir; oyuncu elmaya değdiyse puanı 1 artır ve elmayı en üstte rastgele bir yere taşı.',
                'Task: Every step, change the apple\'s y by -20; if the player touches the apple, add 1 to the score and move the apple to a random place at the top.') },
      { id: 'oyun-9', tools: ['tick', 'change:apple:y:-20', 'if', 'compare:LT:-180', 'pos:apple:y', 'say:Oyun bitti!', 'stop'], a0: [0, 180],
        scen: [S(21, ''), Object.assign(S(16, ''), { a0: [60, 100] })],
        sol: [tick(chg('apple', 'y', -20), iff(cmp(pos('apple', 'y'), '<', -180), say('Oyun bitti!'), stop()))],
        text: T('Elma yere düşerse oyun bitsin! "oyunu bitir" bloğundan sonra tuşlar ve oyun döngüsü artık çalışmaz. Ekrana istediğin mesajı yazabilirsin.',
                'If the apple hits the ground, the game is over! After the "end the game" block, the keys and the game loop stop working. You can write any message you like on the screen.'),
        goal: T('Görev: Her adımda elmanın y konumunu -20 değiştir; elmanın y konumu -180\'den küçükse ekrana bir mesaj yaz ve oyunu bitir.',
                'Task: Every step, change the apple\'s y by -20; if the apple\'s y is less than -180, show a message and end the game.') },
      { id: 'oyun-10', tools: ['start', 'goto:player:0:-160', 'key:R', 'key:L', 'change:player:x:20', 'tick', 'change:apple:y:-20', 'if', 'touch', 'score:1', 'random:top', 'compare:LT:-180', 'pos:apple:y', 'say:Oyun bitti!', 'stop'], a0: [40, 180],
        scen: [S(40, 'RR......................................', [-3]), S(40, '..LLL...............RRRRR...............', [0, 5])],
        sol: [start(go('player', 0, -160))].concat(LR, [tick(chg('apple', 'y', -20), iff(touch(), score(1), rnd('top')), iff(cmp(pos('apple', 'y'), '<', -180), say('Oyun bitti!'), stop()))]),
        text: T('Bölüm projesi: bütün parçaları birleştir! Oyuncu aşağıdan başlar, elmaları yakaladıkça puan kazanır, bir elmayı kaçırırsa oyun biter. Bitirince "🎮 Oyna" ile rekor dene!',
                'Chapter project: put all the parts together! The player starts at the bottom, scores by catching apples, and if an apple is missed the game is over. When you finish, try for a high score with "🎮 Play"!'),
        goal: T('Görev: Oyun başlayınca oyuncu (0, -160) noktasına gitsin; sağ-sol oklarla yürüsün; her adımda elma 20 düşsün, yakalanınca puan artsın ve elma en üste taşınsın, kaçırılınca mesaj yazıp oyun bitsin.',
                'Task: When the game starts the player goes to (0, -160); the arrows move it left and right; every step the apple falls 20, a catch adds a point and moves the apple to the top, a miss shows a message and ends the game.') }
    ] }
  ]
};
