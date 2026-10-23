/* Bölüm 13 - Python Turtle: kaplumbağa grafikleri */
const P = require('./pykit.js');
const { node, rep } = P;
const fwd = n => node('t_fwd', {}, { N: n }), back = n => node('t_back', {}, { N: n });
const left = n => node('t_left', {}, { N: n }), right = n => node('t_right', {}, { N: n });
const penup = () => node('t_penup'), pendown = () => node('t_pendown');
const color = c => node('t_color', { C: c }), width = n => node('t_width', {}, { N: n }), circle = r => node('t_circle', {}, { N: r });
const T = (tr, en) => [tr, en];

module.exports = {
  id: 'turtle', num: 13, kind: 'turtle', view: 'py', chain: true,
  name: P.T('Python Turtle', 'Python Turtle'),
  concept: P.T('Kaplumbağa grafikleri', 'Turtle graphics'),
  story: P.T(
    "Deniz'in kardeşi Ela resim yapmayı çok seviyor. afi bu kez elinde bir kalemle ekrana çizim yapacak! Python'un içinde gelen turtle (kaplumbağa) modülüyle çizgiler, kareler, yıldızlar ve çiçekler çizeceksin. Her adımda .py dosyasını indirip kendi bilgisayarında çizimin gerçekten oluştuğunu görebilirsin.",
    "Deniz's little sister Ela loves drawing. This time afi will draw on the screen with a pen! With the turtle module that comes with Python you will draw lines, squares, stars and flowers. In every step you can download the .py file and watch the drawing appear on your own computer."),
  life: P.T(
    'Turtle grafikleri 1960\'larda çocuklara programlama öğretmek için Logo dilinde icat edildi. Bugün de çizim robotları, nakış makineleri ve CNC tezgâhları benzer komutlarla çalışır.',
    'Turtle graphics were invented in the 1960s in the Logo language to teach children programming. Drawing robots, embroidery machines and CNC machines still use similar commands today.'),
  lessons: [
    { tier: 'easy', title: P.T('Kaplumbağa ile çizim', 'Drawing with the turtle'), steps: [
      { id: 'turtle-1', tools: ['fwd:100'],
        sol: [fwd(150)],
        text: T('afi kâğıdın ortasında, sağa bakıyor. "ileri git" bloğu Python\'da afi.forward(150) olur: afi baktığı yöne 150 adım gider ve arkasında çizgi bırakır. Sayıyı değiştirmek için üstüne tıkla.',
                'afi is in the middle of the paper, facing right. The "forward" block is afi.forward(150) in Python: afi moves 150 steps the way it is facing and leaves a line behind. Click the number to change it.'),
        goal: T('Görev: 150 adım uzunluğunda bir çizgi çiz.', 'Task: Draw a line 150 steps long.') },
      { id: 'turtle-2', tools: ['fwd:100', 'left:90'],
        sol: [fwd(100), left(90), fwd(100)],
        text: T('Dönmek için açı kullanılır. Dik bir köşe 90 derecedir: afi.left(90).', 'Turning uses angles. A right-angle corner is 90 degrees: afi.left(90).'),
        goal: T('Görev: 100 adım git, 90 derece sola dön, 100 adım daha git.', 'Task: Go 100 steps, turn left 90 degrees, go 100 more steps.') },
      { id: 'turtle-3', tools: ['fwd:100', 'left:90'],
        sol: [fwd(100), left(90), fwd(100), left(90), fwd(100), left(90), fwd(100)],
        text: T('Bir kare: dört eşit kenar, dört köşe. Bu sefer tekrar bloğu yok; bütün adımları tek tek diz.', 'A square: four equal sides and four corners. There is no repeat block this time; place every step one by one.'),
        goal: T('Görev: Kenarı 100 adım olan bir kare çiz.', 'Task: Draw a square with sides of 100 steps.') },
      { id: 'turtle-4', tools: ['repeat:4', 'fwd:100', 'left:90'],
        sol: [rep(4, fwd(100), left(90))],
        text: T('Aynı iki blok dört kez tekrar ediyor. Python\'da tekrar "for" döngüsüyle yazılır: for count in range(4): ve altındaki satırlar içeride (girintili) durur.',
                'The same two blocks repeat four times. In Python, repeating is written with a "for" loop: for count in range(4): with the lines below indented inside it.'),
        goal: T('Görev: Tekrarla bloğuyla aynı kareyi çiz.', 'Task: Draw the same square with the repeat block.') },
      { id: 'turtle-5', tools: ['repeat:3', 'fwd:120', 'left:120'],
        sol: [rep(3, fwd(120), left(120))],
        text: T('Eşkenar üçgenin iç açısı 60 derecedir ama afi\'nin dönmesi gereken dış açı 120 derecedir. Kural: 360 ÷ kenar sayısı.',
                'The inside angle of an equilateral triangle is 60 degrees, but afi has to turn the outside angle: 120 degrees. Rule: 360 ÷ number of sides.'),
        goal: T('Görev: Kenarı 120 adım olan bir eşkenar üçgen çiz.', 'Task: Draw an equilateral triangle with sides of 120 steps.') }
    ] },
    { tier: 'easy', title: P.T('Renkler ve desenler', 'Colours and patterns'), steps: [
      { id: 'turtle-6', tools: ['color:blue', 'circle:50'], colors: true,
        sol: [color('blue'), circle(80)],
        text: T('afi.color("blue") kalemin rengini değiştirir, afi.circle(80) yarıçapı 80 olan bir daire çizer. Renk adları Python\'da İngilizce yazılır.',
                'afi.color("blue") changes the pen colour and afi.circle(80) draws a circle with radius 80. Colour names are written in English in Python.'),
        goal: T('Görev: Kalem rengini mavi yap ve yarıçapı 80 olan bir daire çiz.', 'Task: Set the pen colour to blue and draw a circle with radius 80.') },
      { id: 'turtle-7', tools: ['color:red', 'repeat:6', 'fwd:80', 'left:60'], colors: true,
        sol: [color('green'), rep(6, fwd(80), left(60))],
        text: T('Altıgen: arı peteğinin her gözü bir altıgendir. 360 ÷ 6 = 60 derece.', 'Hexagon: every cell of a honeycomb is a hexagon. 360 ÷ 6 = 60 degrees.'),
        goal: T('Görev: Yeşil renkte, kenarı 80 adım olan bir altıgen çiz.', 'Task: Draw a green hexagon with sides of 80 steps.') },
      { id: 'turtle-8', tools: ['color:gold', 'repeat:5', 'fwd:150', 'right:144'], colors: true,
        sol: [color('gold'), rep(5, fwd(150), right(144))],
        text: T('Beş köşeli yıldız: afi her köşede 144 derece sağa döner. 5 × 144 = 720, yani afi iki tam tur atar.', 'Five-pointed star: afi turns right 144 degrees at every point. 5 × 144 = 720, so afi turns around twice.'),
        goal: T('Görev: Altın sarısı renkte, kenarı 150 adım olan beş köşeli bir yıldız çiz.', 'Task: Draw a gold five-pointed star with sides of 150 steps.') },
      { id: 'turtle-9', tools: ['repeat:5', 'fwd:20', 'penup', 'pendown'],
        sol: [rep(5, pendown(), fwd(20), penup(), fwd(20))],
        text: T('Kesik çizgi: afi.penup() ile kalem kalkar, afi yürür ama çizmez; afi.pendown() ile yeniden çizer. Yollardaki şerit çizgileri gibi.',
                'Dashed line: afi.penup() lifts the pen so afi moves without drawing; afi.pendown() draws again. Like the lane lines on a road.'),
        goal: T('Görev: 5 kez: kalemi indir, 20 adım git, kalemi kaldır, 20 adım git.', 'Task: 5 times: pen down, go 20 steps, pen up, go 20 steps.') },
      { id: 'turtle-10', tools: ['color:purple', 'repeat:8', 'repeat:4', 'fwd:80', 'left:90', 'left:45'], colors: true,
        sol: [color('purple'), rep(8, rep(4, fwd(80), left(90)), left(45))],
        text: T('Tekrarın içinde tekrar: içteki döngü bir kare çizer, dıştaki döngü her kareden sonra 45 derece dönüp 8 kare çizer. Ortaya bir çiçek çıkar!',
                'A repeat inside a repeat: the inner loop draws a square, the outer loop turns 45 degrees after each square and draws 8 squares. A flower appears!'),
        goal: T('Görev: Mor renkte 8 kare çiz; her kare 80 adım kenarlı olsun ve her kareden sonra 45 derece sola dön.',
                'Task: Draw 8 purple squares with sides of 80 steps, turning left 45 degrees after each square.') }
    ] }
  ]
};
