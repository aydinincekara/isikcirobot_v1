/* Bölüm 15 - Python yapay zekâ */
const P = require('./pykit.js');
const { node, ife, cmp, and, or, ar } = P;
const predict = (...b) => node('ai_predict', {}, { DO: b }), ans = l => node('ai_answer', { L: l });
const feat = f => node('ai_feat', { F: f }), mean = (l, f) => node('ai_mean', { L: l, F: f });
const has = w => node('ai_has', {}, { W: w }), count = k => node('ai_count', { K: k });
const T = (tr, en) => [tr, en];
const F = (id, tr, en, py, unit) => ({ id: id, name: P.T(tr, en), py: py, unit: unit || '' });
const Lb = (id, tr, en, color) => ({ id: id, name: P.T(tr, en), color: color });
const rows = (lab, ...v) => v.map(x => [].concat(x, [lab]));
const msg = (lab, tr, en) => [{ tr: tr, en: en }, lab];

const CAP = F('cap', 'çap', 'width', { tr: 'cap', en: 'width' }, 'cm');
const FRUIT = [Lb('elma', 'elma', 'apple', '#2FB36B'), Lb('cilek', 'çilek', 'strawberry', '#E5484D')];
const KILO = F('kilo', 'ağırlık', 'weight', { tr: 'kilo', en: 'weight' }, 'kg');
const PETS = [Lb('kedi', 'kedi', 'cat', '#F28C28'), Lb('kopek', 'köpek', 'dog', '#2563C9')];
const fruitRule = (t) => [predict(ife(cmp(feat('cap'), '>', t), [ans('elma')], [ans('cilek')]))];

module.exports = {
  id: 'yz', num: 15, kind: 'ai', view: 'py',
  name: P.T('Python yapay zekâ', 'Python artificial intelligence'),
  concept: P.T('Veriden öğrenme', 'Learning from data'),
  story: P.T(
    "afi artık sadece komutları uygulamak değil, öğrenmek istiyor! Deniz'in annesi bir manav açtı ve meyveleri ayıracak bir yardımcıya ihtiyacı var; Ela evcil hayvan barınağında gönüllü; Deniz'in telefonuna da garip mesajlar geliyor. Bu bölümde afi'ye örneklerden öğrenmeyi öğreteceksin. Önemli kural: afi'nin başarısı, hiç görmediği örneklerle (test verisi) ölçülür.",
    "afi does not just want to follow commands any more, it wants to learn! Deniz's mum has opened a fruit shop and needs a helper to sort the fruit; Ela volunteers at an animal shelter; and Deniz's phone is getting strange messages. In this chapter you will teach afi to learn from examples. The big rule: afi's success is measured with examples it has never seen (the test data)."),
  life: P.T(
    'Yüz tanıyan telefonlar, istenmeyen e-posta filtreleri, ürün önerileri ve sohbet robotları hep aynı fikirle çalışır: örneklerden bir model öğrenmek ve onu yeni örneklerde kullanmak.',
    'Face-unlock phones, spam filters, product recommendations and chatbots all work on the same idea: learn a model from examples and use it on new ones.'),
  lessons: [
    { tier: 'easy', title: P.T('Kurallarla karar ver', 'Decide with rules'), steps: [
      { id: 'yz-1', mode: 'num', features: [CAP], labels: FRUIT,
        sets: [{ train: rows('elma', 6, 7, 8, 7.5, 6.5).concat(rows('cilek', 2, 3, 2.5, 3.5, 2.8)), test: rows('elma', 6.2, 8.5, 5.8).concat(rows('cilek', 3.2, 2.2, 4)) }],
        tools: ['predict', 'ife', 'compare:GT:5', 'feat:cap', 'answer:elma', 'answer:cilek'],
        sol: fruitRule(5),
        text: T('Manavda elma ve çilekler karışmış. Üstteki çizgide bilinen meyveler (eğitim verisi), alttakinde afi\'nin hiç görmediği meyveler (test verisi) var. Elmalar büyük, çilekler küçük: çapı 5 cm\'den büyükse elma, değilse çilek desin.',
                 'Apples and strawberries got mixed up in the shop. The top line shows fruit we know (training data), the bottom line shows fruit afi has never seen (test data). Apples are big and strawberries are small: if the width is more than 5 cm say apple, otherwise strawberry.'),
        goal: T('Görev: Örneğin çapı 5\'ten büyükse cevap elma, değilse çilek olsun.', 'Task: If the sample\'s width is more than 5, answer apple; otherwise strawberry.') },
      { id: 'yz-2', mode: 'num', features: [KILO], labels: PETS,
        sets: [{ train: rows('kedi', 3, 4, 5, 4.5, 6).concat(rows('kopek', 9, 12, 20, 25, 15)), test: rows('kedi', 6.5, 3.5, 5.5).concat(rows('kopek', 8.5, 30, 10)) }],
        tools: ['predict', 'ife', 'compare:GT:20', 'feat:kilo', 'answer:kopek', 'answer:kedi'],
        sol: [predict(ife(cmp(feat('kilo'), '>', 7.5), [ans('kopek')], [ans('kedi')]))],
        wrong: [[predict(ife(cmp(feat('kilo'), '>', 20), [ans('kopek')], [ans('kedi')]))]],
        text: T('Barınağa gelen hayvanlar kedi mi köpek mi? Bu kez eşiği sen bulacaksın: grafikte kedilerin en ağırı ile köpeklerin en hafifi arasına bir sayı seç. 20 çok büyük, birçok köpek yanlış çıkar.',
                 'Are the animals arriving at the shelter cats or dogs? This time you find the threshold: pick a number between the heaviest cat and the lightest dog on the chart. 20 is too big; many dogs would come out wrong.'),
        goal: T('Görev: Ağırlık seçtiğin eşikten büyükse köpek, değilse kedi desin. Test verisinin hepsi doğru olmalı.', 'Task: If the weight is more than your threshold say dog, otherwise cat. All the test data must be right.') },
      { id: 'yz-3', mode: 'num', features: [F('sarilik', 'sarılık', 'yellowness', { tr: 'sarilik', en: 'yellow' }, '%'), F('sertlik', 'sertlik', 'firmness', { tr: 'sertlik', en: 'firm' }, '%')],
        labels: [Lb('olgun', 'olgun', 'ripe', '#E0B000'), Lb('ham', 'ham', 'unripe', '#22A06B')],
        sets: [{ train: rows('olgun', [80, 30], [70, 40], [90, 20], [75, 35]).concat(rows('ham', [30, 80], [40, 70], [85, 75], [65, 60], [50, 40])),
                 test: rows('olgun', [72, 28], [88, 45]).concat(rows('ham', [90, 80], [45, 30], [20, 90], [66, 55])) }],
        tools: ['predict', 'ife', 'and', 'compare:GT:60', 'compare:LT:50', 'feat:sarilik', 'feat:sertlik', 'answer:olgun', 'answer:ham'],
        sol: [predict(ife(and(cmp(feat('sarilik'), '>', 60), cmp(feat('sertlik'), '<', 50)), [ans('olgun')], [ans('ham')]))],
        wrong: [[predict(ife(cmp(feat('sarilik'), '>', 60), [ans('olgun')], [ans('ham')]))]],
        text: T('Muz olgun mu? Sadece rengine bakmak yetmez: sarı ama sert muzlar da var. İki özelliği "ve" ile birleştir: sarılık 60\'tan büyük VE sertlik 50\'den küçükse olgun.',
                 'Is the banana ripe? Looking at the colour is not enough: some are yellow but still firm. Combine two features with "and": yellowness over 60 AND firmness under 50 means ripe.'),
        goal: T('Görev: Sarılık 60\'tan büyük ve sertlik 50\'den küçükse olgun, değilse ham desin.', 'Task: If yellowness is over 60 and firmness is under 50 say ripe, otherwise unripe.') },
      { id: 'yz-4', mode: 'num', features: [F('boy', 'boy', 'height', { tr: 'boy', en: 'height' }, 'cm')],
        labels: [Lb('kucuk', 'küçük', 'small', '#22A06B'), Lb('orta', 'orta', 'medium', '#2563C9'), Lb('buyuk', 'büyük', 'large', '#8B6FD6')],
        sets: [{ train: rows('kucuk', 110, 120, 125).concat(rows('orta', 135, 145, 155), rows('buyuk', 165, 175, 180)), test: rows('kucuk', 128, 115).concat(rows('orta', 132, 158), rows('buyuk', 163)) }],
        tools: ['predict', 'ife', 'compare:LT:130', 'compare:LT:160', 'feat:boy', 'answer:kucuk', 'answer:orta', 'answer:buyuk'],
        sol: [predict(ife(cmp(feat('boy'), '<', 130), [ans('kucuk')], [ife(cmp(feat('boy'), '<', 160), [ans('orta')], [ans('buyuk')])]))],
        text: T('Okul tişörtleri dağıtılacak: boya göre küçük, orta ya da büyük. Üç sonuç için "değilse" kısmına ikinci bir "eğer" koy.',
                 'School T-shirts are being handed out: small, medium or large depending on height. For three results, put a second "if" inside the "else" part.'),
        goal: T('Görev: Boy 130\'dan küçükse küçük; değilse 160\'tan küçükse orta; değilse büyük desin.', 'Task: Height under 130 is small; otherwise under 160 is medium; otherwise large.') },
      { id: 'yz-5', mode: 'num', features: [F('nem', 'toprak nemi', 'soil moisture', { tr: 'nem', en: 'moisture' }, '%')],
        labels: [Lb('sula', 'sula', 'water', '#2563C9'), Lb('bekle', 'bekle', 'wait', '#9AA8BA')],
        sets: [{ train: rows('sula', 10, 15, 20, 25, 28).concat(rows('bekle', 50, 55, 60, 70, 80)), test: rows('sula', 32, 34, 12).concat(rows('bekle', 45, 47, 66)) }],
        tools: ['predict', 'ife', 'compare:LT:29', 'feat:nem', 'answer:sula', 'answer:bekle'],
        sol: [predict(ife(cmp(feat('nem'), '<', 40), [ans('sula')], [ans('bekle')]))],
        wrong: [[predict(ife(cmp(feat('nem'), '<', 29), [ans('sula')], [ans('bekle')]))]],
        text: T('Akıllı sulama: nem 29\'dan azsa "sula" demek eğitim verisinin hepsini doğru bilir, ama test verisinde hata yapar! Eşiği iki grubun tam ortasına koyarsan afi hiç görmediği örnekleri de doğru bilir. Buna genelleme denir.',
                 'Smart watering: saying "water" when moisture is under 29 gets all the training data right, but makes mistakes on the test data! If you put the threshold right in the middle of the two groups, afi also gets new examples right. This is called generalisation.'),
        goal: T('Görev: Nem eşiğini iki grubun ortasına koy: nem eşikten azsa sula, değilse bekle. Test verisi de %100 doğru olmalı.',
                'Task: Put the moisture threshold in the middle of the two groups: below it water, otherwise wait. The test data must be 100% right too.') }
    ] },
    { tier: 'easy', title: P.T('Veriden öğren', 'Learn from data'), steps: [
      { id: 'yz-6', mode: 'num', features: [CAP], labels: FRUIT,
        sets: [{ train: rows('elma', 5, 6, 6.5, 7).concat(rows('cilek', 2, 2.5, 3, 3.2)), test: rows('elma', 5.2, 6.8).concat(rows('cilek', 3.4, 2.2)) },
               { train: rows('elma', 11, 12, 13, 14).concat(rows('cilek', 6, 7, 7.5, 8)), test: rows('elma', 10.5, 13.5).concat(rows('cilek', 8.4, 6.5)) }],
        tools: ['predict', 'ife', 'compare2:GT', 'feat:cap', 'arith:DIVIDE:2', 'arith:ADD', 'mean:elma:cap', 'mean:cilek:cap', 'answer:elma', 'answer:cilek'],
        sol: [predict(ife(cmp(feat('cap'), '>', ar(ar(mean('elma', 'cap'), '+', mean('cilek', 'cap')), '/', 2)), [ans('elma')], [ans('cilek')]))],
        wrong: [fruitRule(4.5), fruitRule(9)],
        text: T('İki farklı bahçe var ve ikinci bahçenin meyveleri dev gibi! Sabit bir sayı ikisinde birden çalışmaz. Eşiği veriden hesapla: elmaların ortalama çapı ile çileklerin ortalama çapının ortası. İşte makine öğrenmesi budur: kural veriden çıkar.',
                 'There are two gardens and the fruit in the second one is giant! A fixed number cannot work for both. Calculate the threshold from the data: halfway between the average apple width and the average strawberry width. That is machine learning: the rule comes from the data.'),
        goal: T('Görev: Çap, (elma ortalaması + çilek ortalaması) / 2\'den büyükse elma, değilse çilek desin. Program iki veri setinde de çalışmalı.',
                'Task: If the width is more than (apple average + strawberry average) / 2 say apple, otherwise strawberry. The program must work on both data sets.') },
      { id: 'yz-7', mode: 'num', features: [KILO], labels: PETS,
        sets: [{ train: rows('kedi', 2.5, 3, 3.5, 4).concat(rows('kopek', 6, 7, 8, 9)), test: rows('kedi', 4.2, 2.8).concat(rows('kopek', 5.6, 8.5)) },
               { train: rows('kedi', 5, 6, 6.5, 7).concat(rows('kopek', 20, 25, 30, 35)), test: rows('kedi', 7.5, 5.5).concat(rows('kopek', 18, 28)) }],
        tools: ['predict', 'ife', 'compare2:GT', 'feat:kilo', 'arith:DIVIDE:2', 'arith:ADD', 'mean:kedi:kilo', 'mean:kopek:kilo', 'answer:kopek', 'answer:kedi'],
        sol: [predict(ife(cmp(feat('kilo'), '>', ar(ar(mean('kedi', 'kilo'), '+', mean('kopek', 'kilo')), '/', 2)), [ans('kopek')], [ans('kedi')]))],
        wrong: [[predict(ife(cmp(feat('kilo'), '>', 5), [ans('kopek')], [ans('kedi')]))]],
        text: T('İki barınak: birinde küçük ırk köpekler, ötekinde dev kediler (Maine Coon) ve iri köpekler var. Aynı program iki barınakta da doğru çalışsın.',
                 'Two shelters: one has small dog breeds, the other has giant cats (Maine Coons) and big dogs. The same program must work correctly in both shelters.'),
        goal: T('Görev: Ağırlık, (kedi ortalaması + köpek ortalaması) / 2\'den büyükse köpek, değilse kedi desin.', 'Task: If the weight is more than (cat average + dog average) / 2 say dog, otherwise cat.') },
      { id: 'yz-8', mode: 'text', features: [], labels: [Lb('spam', 'spam', 'spam', '#E5484D'), Lb('normal', 'normal', 'normal', '#22A06B')],
        sets: [{ train: [msg('spam', 'tebrikler büyük ödülü kazandınız hemen tıklayın', 'congratulations you are a winner click now'), msg('spam', 'bedava telefon için bu linke tıkla', 'click this link for a free phone'),
                         msg('spam', 'kazandınız hediye çekiniz hazır', 'winner your gift card is ready'), msg('spam', 'bedava tatil fırsatı sadece bugün', 'free holiday offer today only'),
                         msg('normal', 'yarın okulda görüşürüz', 'see you at school tomorrow'), msg('normal', 'annem akşam yemeğe gel dedi', 'mum says come for dinner'),
                         msg('normal', 'ödevi bitirdin mi', 'did you finish the homework'), msg('normal', 'maç saat beşte başlıyor', 'the match starts at five')],
                 test: [msg('spam', 'bu hafta bedava kitap kazan', 'win a free book this week'), msg('spam', 'kazandınız ödülünüzü almak için yazın', 'you are a winner reply to get your prize'),
                        msg('normal', 'teneffüste bahçede oynayalım', 'let us play in the garden at break'), msg('normal', 'kitabı yarın getirir misin', 'can you bring the book tomorrow'),
                        msg('spam', 'bedava internet paketi hediye', 'free internet package gift')] }],
        tools: ['predict', 'ife', 'or', 'has:kazan|winner', 'has:bedava|free', 'answer:spam', 'answer:normal'],
        sol: [predict(ife(or(has('kazan'), has('bedava')), [ans('spam')], [ans('normal')]))],
        solEn: [predict(ife(or(has('winner'), has('free')), [ans('spam')], [ans('normal')]))],
        wrong: [[predict(ife(has('kazan'), [ans('spam')], [ans('normal')]))]],
        text: T('İstenmeyen mesajlar (spam) çoğu zaman "kazandınız" ve "bedava" gibi kelimeler içerir. Mesajda bu kelimelerden biri geçiyorsa spam desin.',
                 'Unwanted messages (spam) often contain words like "winner" and "free". If one of these words is in the message, say spam.'),
        goal: T('Görev: Mesajda "kazan" ya da "bedava" geçiyorsa spam, değilse normal desin.', 'Task: If the message contains "winner" or "free" say spam, otherwise normal.') },
      { id: 'yz-9', mode: 'text', features: [], labels: [Lb('mutlu', '😊 mutlu', '😊 happy', '#E0B000'), Lb('uzgun', '😢 üzgün', '😢 sad', '#5B6BD6')],
        lists: { pos: { name: P.T('olumlu kelime', 'positive word'), py: { tr: 'OLUMLU', en: 'POSITIVE' }, words: { tr: ['güzel', 'harika', 'sevdim', 'mutlu', 'süper', 'eğlenceli'], en: ['nice', 'great', 'loved', 'happy', 'super', 'fun'] } },
                 neg: { name: P.T('olumsuz kelime', 'negative word'), py: { tr: 'OLUMSUZ', en: 'NEGATIVE' }, words: { tr: ['kötü', 'sıkıcı', 'üzgün', 'berbat', 'sevmedim', 'yorgun'], en: ['bad', 'boring', 'sad', 'awful', 'hated', 'tired'] } } },
        sets: [{ train: [msg('mutlu', 'bugün çok güzel ve eğlenceli bir gündü', 'today was a nice and fun day'), msg('mutlu', 'film harika ben çok sevdim', 'the film was great i loved it'),
                         msg('uzgun', 'ders sıkıcı ve kötü geçti', 'the lesson was boring and bad'), msg('uzgun', 'yağmur yağdı ve ben üzgün ve yorgun', 'it rained and i am sad and tired'),
                         msg('mutlu', 'oyun süper ve harika ama biraz uykum var', 'the game was super and great but i am a bit sleepy'), msg('uzgun', 'yemek berbat ve soğuktu', 'the food was awful and cold')],
                 test: [msg('mutlu', 'piknik harika geçti çok mutlu oldum', 'the picnic was great i was so happy'), msg('uzgun', 'maçı kaybettik çok kötü', 'we lost the match it was bad'),
                        msg('uzgun', 'yeni kitabım güzel ama biraz sıkıcı ve kötü', 'my new book is nice but a bit boring and bad'), msg('mutlu', 'doğum günüm süper ve eğlenceli', 'my birthday was super and fun'),
                        msg('uzgun', 'bugün yorgun ve üzgün hissediyorum', 'today i feel tired and sad')] }],
        tools: ['predict', 'ife', 'compare2:GT', 'count:pos', 'count:neg', 'answer:mutlu', 'answer:uzgun'],
        sol: [predict(ife(cmp(count('pos'), '>', count('neg')), [ans('mutlu')], [ans('uzgun')]))],
        text: T('Duygu analizi: afi mesajdaki olumlu ve olumsuz kelimeleri saysın. Olumlu kelime daha çoksa mesaj mutlu, değilse üzgün.',
                 'Sentiment analysis: afi counts the positive and negative words in the message. If there are more positive words the message is happy, otherwise sad.'),
        goal: T('Görev: Olumlu kelime sayısı olumsuz kelime sayısından büyükse mutlu, değilse üzgün desin.', 'Task: If the number of positive words is greater than the number of negative words say happy, otherwise sad.') },
      { id: 'yz-10', mode: 'text', features: [],
        labels: [Lb('hi', 'Merhaba! Ben afi.', 'Hello! I am afi.', '#2563C9'), Lb('fine', 'İyiyim, teşekkürler!', 'I am fine, thank you!', '#22A06B'),
                 Lb('name', 'Benim adım afi.', 'My name is afi.', '#8B6FD6'), Lb('unk', 'Bunu anlamadım.', 'I did not understand.', '#9AA8BA')],
        sets: [{ train: [msg('hi', 'merhaba afi', 'hello afi'), msg('hi', 'selam dostum', 'hey buddy'), msg('fine', 'nasılsın bugün', 'how are you today'),
                         msg('name', 'senin adın ne', 'what is your name'), msg('unk', 'hava nasıl olacak', 'what will the weather be like'), msg('unk', 'bana bir şaka anlat', 'tell me a joke')],
                 test: [msg('hi', 'selam afi', 'hey afi'), msg('hi', 'iyi akşamlar merhaba', 'good evening hello'), msg('fine', 'afi nasılsın', 'afi how are you'),
                        msg('name', 'adın ne senin', 'your name please'), msg('unk', 'saat kaç', 'what time is it')] }],
        tools: ['predict', 'ife', 'or', 'has:merhaba|hello', 'has:selam|hey', 'has:nasılsın|how are', 'has:adın|your name', 'answer:hi', 'answer:fine', 'answer:name', 'answer:unk'],
        sol: [predict(ife(or(has('merhaba'), has('selam')), [ans('hi')], [ife(has('nasılsın'), [ans('fine')], [ife(has('adın'), [ans('name')], [ans('unk')])])]))],
        solEn: [predict(ife(or(has('hello'), has('hey')), [ans('hi')], [ife(has('how are'), [ans('fine')], [ife(has('your name'), [ans('name')], [ans('unk')])])]))],
        text: T('Bölüm projesi: afi bir sohbet robotu oluyor! Mesajdaki kelimelere bakıp uygun cevabı seçsin. Hiçbir kurala uymayan mesajlara "Bunu anlamadım." desin. İlk sohbet robotları (1966\'daki ELIZA gibi) tam böyle çalışıyordu.',
                 'Chapter project: afi becomes a chatbot! It looks at the words in the message and picks a fitting answer. For messages that match no rule it says "I did not understand." The first chatbots (like ELIZA in 1966) worked exactly like this.'),
        goal: T('Görev: "merhaba" ya da "selam" varsa selamla; değilse "nasılsın" varsa iyiyim de; değilse "adın" varsa adını söyle; değilse anlamadım de.',
                'Task: If it has "hello" or "hey", greet; otherwise if it has "how are", say you are fine; otherwise if it has "your name", say your name; otherwise say you did not understand.') }
    ] }
  ]
};
