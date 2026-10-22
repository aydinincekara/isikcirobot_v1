/* Işıkçı Robot - ders içeriği
 * ÖNEMLİ: Adımların sırası ilerleme kodunu belirler. Yeni adımları SADECE sona ekleyin,
 * mevcut adımların yerini değiştirmeyin; yoksa eski ilerleme kodları yanlış okunur.
 * sol: çözüm (bkz. engine.js çözüm dili), öğretmen modunda "Çözümü yükle" ile açılır.
 */
(function (root) {
  'use strict';
  var F = 'robot_ileri', L = 'robot_sola', R = 'robot_saga', Y = 'robot_isik', O = 'robot_kapi',
      REP = 'controls_repeat_ext', U = 'robot_until', A = 'robot_until_all', IF = 'robot_if', IFE = 'robot_ifelse';
  var T1 = [F, Y], T2 = [F, L, R, Y], T3 = [F, L, R, Y, REP];

  root.COURSE = {
    chapters: [
      {
        id: 'salon', room: 'salon', num: 1,
        name: { tr: 'Salon', en: 'Living room' },
        concept: { tr: 'Sıralama', en: 'Sequence' },
        story: {
          tr: "Işıkçı adında küçük bir ev robotu bugün Deniz'in ailesinin evine geldi. Akşam oldu ve salon karanlık. Deniz: \"Işıkçı, lambaları yakabilir misin?\" Işıkçı hazır ama ne yapacağını bilmiyor. Ona komutları sen vereceksin.",
          en: "A little home robot named Lumi arrived at Deniz's family home today. It's evening and the living room is dark. Deniz: \"Lumi, can you turn on the lamps?\" Lumi is ready but doesn't know what to do. You will give it the commands."
        },
        life: {
          tr: 'Robot süpürgeler, fabrikadaki robot kollar ve çamaşır makineleri de kendilerine verilen komutları sırayla uygular.',
          en: 'Robot vacuums, factory robot arms and washing machines also follow their commands one by one, in order.'
        },
        lessons: [
          { title: { tr: 'Işıkçı ile tanış', en: 'Meet Lumi' }, steps: [
            { id: 'salon-1', map: ['SoL'], dir: 1, max: 3, tools: T1, starter: true, sol: 'F F Y',
              text: { tr: "Deniz: \"Hoş geldin Işıkçı! Salon çok karanlık.\" Işıkçı bir kare ileri gidebilir ve durduğu yerdeki lambayı yakabilir.",
                      en: "Deniz: \"Welcome, Lumi! The living room is so dark.\" Lumi can move one square forward and turn on the lamp where it stands." },
              goal: { tr: "Görev: Işıkçı'yı lambaya götür ve ışığı yak.", en: 'Task: Take Lumi to the lamp and turn on the light.' } },
            { id: 'salon-2', map: ['SoooL'], dir: 1, max: 5, tools: T1, sol: 'F F F F Y',
              text: { tr: 'Bilgisayar komutları yukarıdan aşağıya, sırayla çalıştırır. Buna sıralama denir.',
                      en: 'A computer runs commands one after another, from top to bottom. This is called a sequence.' },
              goal: { tr: 'Görev: Bu lamba biraz daha uzakta. Kaç kare ileri gitmen gerektiğini say.', en: 'Task: This lamp is a bit farther. Count how many squares you need to move.' } },
            { id: 'salon-3', map: ['Soo', '  o', '  L'], dir: 1, max: 6, tools: T2, sol: 'F F R F F Y',
              text: { tr: 'Işıkçı sadece baktığı yöne gider. Dönüş komutları yönünü değiştirir; yerinden kıpırdamaz.',
                      en: 'Lumi only moves in the direction it faces. Turning changes its direction without moving it.' },
              goal: { tr: 'Görev: Köşede sağa dön ve lambayı yak.', en: 'Task: Turn right at the corner and turn on the lamp.' } },
            { id: 'salon-4', map: ['  L', '  o', 'Soo'], dir: 1, max: 6, tools: T2, sol: 'F F L F F Y',
              text: { tr: 'Deniz: "Kitap okuma lambam şurada, sol tarafta."', en: 'Deniz: "My reading lamp is over there, on the left."' },
              goal: { tr: 'Görev: Bu sefer köşede sola dön.', en: 'Task: This time turn left at the corner.' } }
          ] },
          { title: { tr: 'Salonu dolaş', en: 'Around the living room' }, steps: [
            { id: 'salon-5', map: ['SoLoL'], dir: 1, max: 6, tools: T2, sol: 'F F Y F F Y',
              text: { tr: 'Bir program birden fazla iş yapabilir. Işıkçı bir lambayı yakınca yoluna devam eder.',
                      en: 'A program can do more than one job. After lighting one lamp, Lumi keeps going.' },
              goal: { tr: 'Görev: İki lambayı da yak.', en: 'Task: Turn on both lamps.' } },
            { id: 'salon-6', map: ['Soo', 'KKo', ' Lo'], dir: 1, max: 8, tools: T2, sol: 'F F R F F R F Y',
              text: { tr: 'Koltuk yolun üstünde. Işıkçı eşyaların içinden geçemez, etrafından dolaşmalı.',
                      en: "The sofa is in the way. Lumi can't go through furniture; it has to go around." },
              goal: { tr: 'Görev: Koltuğun etrafından dolaşıp lambaya ulaş.', en: 'Task: Go around the sofa and reach the lamp.' } },
            { id: 'salon-7', map: ['SoL', 'BBo', '  L'], dir: 1, max: 7, tools: T2, sol: 'F F Y R F F Y',
              text: { tr: 'Deniz: "Bitkilerin yanındaki lambaları da yakar mısın?"', en: 'Deniz: "Can you also turn on the lamps next to the plants?"' },
              goal: { tr: 'Görev: İki lambayı da yak. Dönüşü doğru yerde yap.', en: 'Task: Turn on both lamps. Turn at the right spot.' } },
            { id: 'salon-8', map: ['SooL', 'MMMo', 'Looo'], dir: 1, max: 12, tools: T2, sol: 'F F F Y R F F R F F F Y',
              text: { tr: 'Mini görev: Yemek masasının iki ucundaki lambaları yak. Program biraz uzun olacak; bir sonraki bölümde nasıl kısaltacağını öğreneceksin.',
                      en: "Mini project: Turn on the lamps at both ends of the dining table. The program will be a bit long; in the next chapter you'll learn how to shorten it." },
              goal: { tr: 'Görev: İki lambayı da yak.', en: 'Task: Turn on both lamps.' } }
          ] }
        ]
      },
      {
        id: 'koridor', room: 'koridor', num: 2,
        name: { tr: 'Koridor', en: 'Hallway' },
        concept: { tr: 'Döngüler', en: 'Loops' },
        story: {
          tr: 'Evin uzun bir koridoru var ve her yerde lamba var. Deniz: "Her lamba için aynı komutları baştan yazmak çok uzun sürer!" Işıkçı\'ya "bunu 5 kez yap" demenin bir yolu var: döngü.',
          en: 'The house has a long hallway with lamps everywhere. Deniz: "Writing the same commands again for every lamp takes forever!" There\'s a way to tell Lumi "do this 5 times": a loop.'
        },
        life: {
          tr: 'Fabrikadaki bir robot kol aynı vidayı binlerce kez sıkar. Programında binlerce satır yoktur; tek bir döngü vardır.',
          en: "A factory robot arm tightens the same screw thousands of times. Its program doesn't have thousands of lines, just one loop."
        },
        lessons: [
          { title: { tr: 'Tekrarla bloğu', en: 'The repeat block' }, steps: [
            { id: 'koridor-1', map: ['SooooooL'], dir: 1, max: 3, tools: [F, Y, REP], sol: '7(F) Y',
              text: { tr: "Koridor çok uzun. \"İleri git\" bloğunu 7 kez koymak yerine \"tekrarla\" bloğunun içine bir kez koyabilirsin. Buna döngü denir.",
                      en: "The hallway is very long. Instead of using \"move forward\" 7 times, put it once inside a \"repeat\" block. This is called a loop." },
              goal: { tr: 'Görev: Lambaya ulaş. En fazla 3 blok kullan.', en: 'Task: Reach the lamp. Use at most 3 blocks.' } },
            { id: 'koridor-2', map: ['SLLLLL'], dir: 1, max: 3, tools: [F, Y, REP], sol: '5(F Y)',
              text: { tr: 'Döngünün içine birden fazla blok koyabilirsin. İçindeki her şey sırayla tekrarlanır.',
                      en: 'You can put more than one block inside a loop. Everything inside repeats in order.' },
              goal: { tr: 'Görev: 5 lambanın hepsini yak. En fazla 3 blok.', en: 'Task: Turn on all 5 lamps. At most 3 blocks.' } },
            { id: 'koridor-3', map: ['SoLoLoL'], dir: 1, max: 4, tools: [F, Y, REP], sol: '3(F F Y)',
              text: { tr: 'Lambalar birer kare atlayarak dizilmiş. Önce tek bir lamba için gereken blokları bul, sonra onları tekrarla.',
                      en: 'The lamps are on every other square. First find the blocks for one lamp, then repeat them.' },
              goal: { tr: 'Görev: 3 lambayı yak. En fazla 4 blok.', en: 'Task: Turn on 3 lamps. At most 4 blocks.' } }
          ] },
          { title: { tr: 'Deseni bul', en: 'Find the pattern' }, steps: [
            { id: 'koridor-4', map: ['S   ', 'oL  ', ' oL ', '  oL'], dir: 2, max: 6, tools: T3, sol: '3(F L F Y R)',
              text: { tr: 'Lambalar merdiven gibi dizilmiş. Hangi hareketler tekrar ediyor? Tekrar eden parçaya desen denir.',
                      en: 'The lamps are arranged like a staircase. Which moves repeat? The repeating part is called a pattern.' },
              goal: { tr: 'Görev: 3 lambayı yak. En fazla 6 blok.', en: 'Task: Turn on 3 lamps. At most 6 blocks.' } },
            { id: 'koridor-5', map: ['SooL', 'oMMo', 'oMMo', 'LooL'], dir: 1, max: 6, tools: T3, sol: '3(F F F Y R)',
              text: { tr: 'Koridorun ortasında büyük bir masa var, köşelerinde lambalar duruyor. Her köşede aynı şeyi yapıyorsun: ilerle, yak, dön.',
                      en: 'There is a big table in the middle of the hallway with lamps at its corners. At each corner you do the same thing: move, light, turn.' },
              goal: { tr: 'Görev: 3 köşedeki lambaları yak. En fazla 6 blok.', en: 'Task: Turn on the 3 corner lamps. At most 6 blocks.' } },
            { id: 'koridor-6', map: ['SooLooLooLooL'], dir: 1, max: 5, tools: T3, sol: '4(F F F Y)',
              text: { tr: 'Bu koridorda her üç karede bir lamba var.', en: "In this hallway there's a lamp every three squares." },
              goal: { tr: 'Görev: 4 lambayı yak. En fazla 5 blok.', en: 'Task: Turn on 4 lamps. At most 5 blocks.' } }
          ] },
          { title: { tr: 'İç içe döngü', en: 'Nested loops' }, steps: [
            { id: 'koridor-7', map: ['SoooLoooLoooL'], dir: 1, max: 4, tools: T3, sol: '3(4(F) Y)',
              text: { tr: 'Bir döngünün içine başka bir döngü koyabilirsin. Buna iç içe döngü denir. İçteki döngü yürümeyi, dıştaki döngü lambaları tekrarlar.',
                      en: 'You can put a loop inside another loop. This is called a nested loop. The inner loop repeats the walking, the outer loop repeats the lamps.' },
              goal: { tr: 'Görev: 3 lambayı yak. En fazla 4 blok. İpucu: tekrarla bloğunun içine bir tekrarla daha koy.',
                      en: 'Task: Turn on 3 lamps. At most 4 blocks. Hint: put a repeat block inside another repeat block.' } },
            { id: 'koridor-8', map: ['SoLoL', 'oMMMo', 'LMBML', 'oMMMo', 'LoLoL'], dir: 1, max: 6, tools: T3, sol: '4(2(F F Y) R)',
              text: { tr: 'Mini görev: Koridor bir masanın etrafını dolaşıyor ve her iki karede bir lamba var. Önce bir kenarı çöz, sonra 4 kenar için tekrarla.',
                      en: 'Mini project: The hallway goes around a table with a lamp every two squares. Solve one side first, then repeat it for all 4 sides.' },
              goal: { tr: 'Görev: 7 lambanın hepsini yak. En fazla 6 blok.', en: 'Task: Turn on all 7 lamps. At most 6 blocks.' } }
          ] }
        ]
      },
      {
        id: 'mutfak', room: 'mutfak', num: 3,
        name: { tr: 'Mutfak', en: 'Kitchen' },
        concept: { tr: 'Koşullar', en: 'Conditions' },
        story: {
          tr: "Mutfakta işler her gün değişiyor: bazen bir dolap kapağı kapalı kalıyor, lambalar başka yerlere konuyor, yolun şekli değişiyor. Işıkçı'nın bakıp karar vermesi gerekiyor. Bunun için koşulları öğreneceksin.",
          en: "Things in the kitchen change every day: sometimes a cupboard door is left closed, the lamps are moved, the path changes shape. Lumi needs to look and decide. For that, you'll learn conditions."
        },
        life: {
          tr: "Otomatik kapılar önlerinde biri olup olmadığını sürekli kontrol eder: biri varsa açılır, yoksa kapalı kalır. Bu bir \"eğer ... değilse ...\" kararıdır.",
          en: "Automatic doors keep checking whether someone is in front of them: if so they open, otherwise they stay closed. That's an \"if ... else ...\" decision."
        },
        lessons: [
          { title: { tr: 'Eğer bloğu', en: 'The if block' }, steps: [
            { id: 'mutfak-1', maps: [['SoLoLL'], ['SLLooL'], ['SooLoL']], dir: 1, max: 4, strict: true, tools: [F, Y, REP, IF], sol: '5(F ?ISIK(Y))',
              text: { tr: "Tezgâhtaki lambaların yeri her gün değişiyor. Işıkçı her karede bakıp karar vermeli: \"Eğer lamba karesindeysem ışığı yak.\" Lamba olmayan yerde ışık yakmaya çalışmak hata sayılır.",
                      en: "The lamps on the counter move around every day. Lumi has to check each square and decide: \"If I'm on a lamp, turn on the light.\" Trying to light a square without a lamp counts as a mistake." },
              goal: { tr: 'Görev: Program her düzende çalışmalı. Düğmeyle diğer düzenlere bakabilirsin. En fazla 4 blok.',
                      en: 'Task: The program must work in every layout. Use the button to see the other layouts. At most 4 blocks.' } },
            { id: 'mutfak-2', maps: [['SoDoL'], ['SoooL'], ['SooDL']], dir: 1, max: 5, strict: true, tools: [F, Y, O, REP, IF], sol: '4(?KAPI(O) F) Y',
              text: { tr: "Dolap kapakları bazen açık, bazen kapalı kalıyor. Kapalı bir kapıya çarpan robot durur. Önce bak: \"Eğer önümde kapalı kapı varsa kapıyı aç.\"",
                      en: "Cupboard doors are sometimes open, sometimes closed. A robot that bumps into a closed door stops. Check first: \"If there's a closed door ahead, open the door.\"" },
              goal: { tr: 'Görev: Lambaya ulaş. Programın kapılı ve kapısız düzenlerde çalışmalı. En fazla 5 blok.',
                      en: 'Task: Reach the lamp. Your program must work with and without doors. At most 5 blocks.' } },
            { id: 'mutfak-3', maps: [['SoDLoL'], ['SLoDLo'], ['SoLoDL']], dir: 1, max: 6, strict: true, tools: [F, Y, O, REP, IF], sol: '5(?KAPI(O) F ?ISIK(Y))',
              text: { tr: "Şimdi ikisi birden: kapı varsa aç, lamba varsa yak. İki ayrı \"eğer\" bloğu kullanabilirsin.",
                      en: "Now both at once: open the door if there is one, light the lamp if there is one. You can use two separate \"if\" blocks." },
              goal: { tr: 'Görev: Her düzende tüm lambaları yak. En fazla 6 blok.', en: 'Task: Turn on all lamps in every layout. At most 6 blocks.' } }
          ] },
          { title: { tr: 'Eğer - değilse', en: 'If - else' }, steps: [
            { id: 'mutfak-4', maps: [['Soo', 'TTo', '  L'], ['  L', 'TTo', 'Soo']], dir: 1, max: 8, strict: true, tools: [F, L, R, Y, IFE], sol: 'F F ?SOL(L|R) F F Y',
              text: { tr: "Mutfağın arka kapısına giden yol bazen sola, bazen sağa dönüyor. \"Eğer ... değilse ...\" bloğu iki yoldan birini seçer.",
                      en: "The path to the kitchen's back door sometimes turns left, sometimes right. The \"if ... else ...\" block picks one of two paths." },
              goal: { tr: 'Görev: Köşede yol solda mı kontrol et; soldaysa sola, değilse sağa dön. En fazla 8 blok.',
                      en: 'Task: At the corner, check whether the path is on the left; if so turn left, otherwise turn right. At most 8 blocks.' } },
            { id: 'mutfak-5', maps: [['Soo  ', '  o  ', '  ooo', '    o', ' Looo'], ['Sooo', 'TTTo', 'Looo'], ['  L', 'TTo', 'Soo']], dir: 1, max: 7, strict: true,
              tools: [U, IFE, F, L, R, Y], sol: 'U(?ON(F|?SOL(L|R))) Y',
              text: { tr: "Işıkçı kıvrımlı bir yolu takip ediyor ama yolun şekli her gün farklı. \"Işığa varana kadar tekrarla\" bloğu kaç adım gerektiğini bilmeden çalışır.",
                      en: "Lumi follows a winding path, but its shape changes every day. The \"repeat until on a lamp\" block works without knowing how many steps it takes." },
              goal: { tr: 'Görev: Her düzende lambaya ulaş ve yak. İpucu: önün açıksa ilerle, değilse sola ya da sağa dön. En fazla 7 blok.',
                      en: 'Task: Reach and light the lamp in every layout. Hint: if the path ahead is clear move, otherwise turn left or right. At most 7 blocks.' } }
          ] },
          { title: { tr: 'Akıllı mutfak', en: 'Smart kitchen' }, steps: [
            { id: 'mutfak-6', maps: [['SoLo', 'TTTo', 'LooL'], ['SLoo', 'TTTL', 'oLoo'], ['SooL', 'TTTo', 'LoLo']], dir: 1, max: 8, strict: true,
              tools: [A, IF, IFE, F, L, R, Y], sol: 'A(?ISIK(Y) ?ON(F|?SOL(L|R)))',
              text: { tr: "Akşam yemeği hazırlanıyor. Tezgâhın etrafındaki lambaların yeri her gün değişiyor. \"Tüm ışıklar yanana kadar tekrarla\" bloğu, işin bitip bitmediğini kendisi kontrol eder.",
                      en: "Dinner is being made. The lamps around the counter move around every day. The \"repeat until all lights are on\" block checks by itself whether the job is done." },
              goal: { tr: 'Görev: Her düzende tüm lambaları yak. En fazla 8 blok.', en: 'Task: Turn on all lamps in every layout. At most 8 blocks.' } },
            { id: 'mutfak-7', maps: [['SoDoo', 'TTTTo', '  Loo'], ['Soooo', 'TTTTD', '  Loo'], ['Soooo', 'TTTTo', '  Loo']], dir: 1, max: 9, strict: true,
              tools: [U, IF, IFE, F, L, R, Y, O], sol: 'U(?KAPI(O) ?ON(F|?SOL(L|R))) Y',
              text: { tr: 'Mini görev: Işıkçı mutfaktan yemek odasına geçmeli. Yolda kapı olabilir de olmayabilir de; yol da kıvrımlı.',
                      en: 'Mini project: Lumi has to get from the kitchen to the dining room. There may or may not be a door on the way, and the path winds.' },
              goal: { tr: 'Görev: Her düzende lambaya ulaş ve yak. En fazla 9 blok.', en: 'Task: Reach and light the lamp in every layout. At most 9 blocks.' } }
          ] }
        ]
      }
    ],
    soon: [
      { num: 4, name: { tr: 'Giriş kapısı', en: 'Front door' }, concept: { tr: 'Olaylar', en: 'Events' }, sensor: { tr: 'Hareket sensörü (PIR)', en: 'Motion sensor (PIR)' } },
      { num: 5, name: { tr: 'Garaj', en: 'Garage' }, concept: { tr: 'Değişken ve karşılaştırma', en: 'Variables and comparison' }, sensor: { tr: 'Mesafe sensörü (HC-SR04)', en: 'Distance sensor (HC-SR04)' } },
      { num: 6, name: { tr: 'Bahçe', en: 'Garden' }, concept: { tr: 'Eşik değerler', en: 'Thresholds' }, sensor: { tr: 'Işık (LDR) ve toprak nem sensörü', en: 'Light (LDR) and soil moisture sensor' } },
      { num: 7, name: { tr: 'Çocuk odası', en: "Kid's room" }, concept: { tr: 'Fonksiyonlar', en: 'Functions' }, sensor: { tr: 'Kendi komutunu yaz', en: 'Write your own command' } },
      { num: 8, name: { tr: 'Kontrol merkezi', en: 'Control center' }, concept: { tr: 'Proje', en: 'Project' }, sensor: { tr: 'Akıllı ev', en: 'Smart home' } },
      { num: 9, name: { tr: 'Arduino atölyesi', en: 'Arduino workshop' }, concept: { tr: 'Gerçek donanım', en: 'Real hardware' }, sensor: { tr: 'Arduino Uno + ESP32, .ino dosyası', en: 'Arduino Uno + ESP32, .ino file' } },
      { num: 10, name: { tr: 'Python atölyesi', en: 'Python workshop' }, concept: { tr: 'Gerçek uygulama', en: 'Real app' }, sensor: { tr: '.py dosyası', en: '.py file' } }
    ]
  };
})(typeof window !== 'undefined' ? window : this);
