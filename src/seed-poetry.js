/**
 * Production Poetry Content Seeder
 * Adds curated poetry content for Indian poets
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Curated poetry content for production use
const productionPoetryData = {
    // Mirza Ghalib (Urdu)
    'poet-004': [
        {
            name: 'Hazaaron Khwahishen Aisi',
            genre: 'Ghazal',
            content: {
                original: `ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے
بہت نکلے مرے ارمان لیکن پھر بھی کم نکلے

نکلنا خُلد سے آدم کا سنتے آئے ہیں لیکن
بہت بے آبرو ہو کر ترے کوچے سے ہم نکلے

مگر لکھوائے کوئی اس کو خط تو ہم سے لکھوائے
ہوئی صبح اور گھر سے کان پر رکھ کر قلم نکلے

بہت تنگ آ کے ہم نے بزمِ شاہی بھی دیکھی تھی
جہاں سے ہم چلے نکلے وہاں سے ہم قلم نکلے`,
                transliteration: `Hazaaron khwahishen aisi ke har khwahish pe dam nikle
Bahut nikle mere armaan lekin phir bhi kam nikle

Nikalna khuld se Adam ka sunte aaye hain lekin
Bahut be-aabru ho kar tere kooche se hum nikle

Magar likhwaaye koi us ko khat to hum se likhwaaye
Hui subah aur ghar se kaan par rakh kar qalam nikle

Bahut tang aa ke humne bazm-e-shaahi bhi dekhi thi
Jahan se hum chale nikle wahan se hum qalam nikle`,
                translation: `A thousand desires such that each desire steals my breath
Many of my yearnings came out, but still too few

We have heard of Adam being expelled from paradise
But we left your street even more dishonored

But if someone wants a letter written, let them get it from me
Morning came and from home with pen tucked behind ear, I left

Weary of everything, I have seen the royal court as well
From where I departed, there too I withdrew my pen`
            }
        },
        {
            name: 'Ye Na Thi Hamari Qismat',
            genre: 'Ghazal',
            content: {
                original: `یہ نہ تھی ہماری قسمت کہ وصالِ یار ہوتا
اگر اور جیتے رہتے یہی انتظار ہوتا

تیرے وعدے پر جئے ہم تو یہ جان جھوٹ جانا
کہ خوشی سے مر نہ جاتے اگر اعتبار ہوتا`,
                transliteration: `Ye na thi hamari qismat ke wisal-e-yaar hota
Agar aur jeete rehte yahi intezaar hota

Tere waade par jiye hum to ye jaan jhoot jaana
Ke khushi se mar na jaate agar aitbaar hota`,
                translation: `It was not in my destiny to unite with my beloved
Had I lived longer, this waiting would have continued

I lived on your promise, but know this as a lie
That I would have died of joy, had I believed you`
            }
        },
        {
            name: 'Dil-e-Nadaan Tujhe Hua Kya Hai',
            genre: 'Ghazal',
            content: {
                original: `دلِ ناداں تجھے ہوا کیا ہے
آخر اس درد کی دوا کیا ہے

ہم ہیں مشتاق اور وہ بےزار
یا الٰہی یہ ماجرا کیا ہے`,
                transliteration: `Dil-e-nadaan tujhe hua kya hai
Aakhir is dard ki dawa kya hai

Hum hain mushtaq aur woh bezaar
Ya ilaahi ye majra kya hai`,
                translation: `O naive heart, what has happened to you?
What is the cure for this pain?

I am longing and she is indifferent
O God, what is this situation?`
            }
        }
    ],

    // Kabir (Hindi/Bhojpuri)
    'poet-002': [
        {
            name: 'Moko Kahan Dhundhe Re Bande',
            genre: 'Bhajan',
            content: {
                original: `मोको कहाँ ढूँढे रे बंदे, मैं तो तेरे पास में
न तीरथ में न मूरत में, न एकांत निवास में
न मंदिर में न मस्जिद में, न काबे कैलाश में
न मैं जप में न मैं तप में, न मैं बरत उपास में
न मैं किरिया करम में रहता, नहिं जोग संन्यास में
खोजी होए तो तुरतै मिलिहौं, पल भर की तलास में
कहैं कबीर सुनो भाई साधो, सब स्वाँसों की स्वाँस में`,
                transliteration: `Moko kahan dhundhe re bande, main to tere paas mein
Na tirath mein na murat mein, na ekant niwas mein
Na mandir mein na masjid mein, na kabe kailash mein
Na main jap mein na main tap mein, na main barat upas mein
Na main kiriya karam mein rehta, nahin jog sanyas mein
Khoji hoe to turtai milihaun, pal bhar ki talas mein
Kahe Kabir suno bhai sadho, sab swaanson ki swaans mein`,
                translation: `Where do you search for me, O seeker? I am right beside you
Not in pilgrimages, not in idols, not in solitary dwelling
Not in temples, not in mosques, not in Kaaba or Kailash
Not in rituals, not in austerities, not in fasting
Not in actions or ceremonies, not in yoga or renunciation
If you truly seek, you will find me in an instant
Says Kabir, listen O seeker, I am in every breath you take`
            }
        },
        {
            name: 'Jhini Jhini Beeni Chadariya',
            genre: 'Bhajan',
            content: {
                original: `झीनी झीनी बीनी चदरिया
काहे का ताना काहे की भरनी
कौन तार से बीनी चदरिया
इंगला पिंगला ताना भरनी
सुषमन तार से बीनी चदरिया
आठ कंवल दल चरखा डोलै
पांच तत्व गुण तीनी चदरिया`,
                transliteration: `Jheeni jheeni beeni chadariya
Kahe ka taana kahe ki bharni
Kaun taar se beeni chadariya
Ingala pingala taana bharni
Susuman taar se beeni chadariya
Aath kanwal dal charkha dolai
Paanch tatva gun teeni chadariya`,
                translation: `Delicately, delicately woven is this sheet (of life)
What is the warp, what is the weft?
With what thread is this sheet woven?
Ida and Pingala are the warp and weft
With the Sushumna thread is this sheet woven
Eight lotus petals form the spinning wheel
Five elements and three qualities make this sheet`
            }
        },
        {
            name: 'Chalti Chakki Dekh Ke',
            genre: 'Doha',
            content: {
                original: `चलती चक्की देखके, दिया कबीरा रोये
दुइ पाटन के बीच में, साबित बचा न कोये

माटी कहे कुम्हार से, तू क्या रौंदे मोय
एक दिन ऐसा आएगा, मैं रौंदूंगी तोय`,
                transliteration: `Chalti chakki dekh ke, diya Kabira roye
Dui patan ke beech mein, sabit bacha na koye

Maati kahe kumhaar se, tu kya raunde moy
Ek din aisa aayega, main raundungi toy`,
                translation: `Watching the grinding stones turn, Kabir weeps
Between the two millstones, none remains whole

The clay says to the potter, why do you trample me?
A day will come when I shall trample you`
            }
        }
    ],

    // Rabindranath Tagore (Bengali)
    'poet-003': [
        {
            name: 'Where The Mind Is Without Fear',
            genre: 'Prayer Poem',
            content: {
                original: `চিত্ত যেথা ভয়শূন্য, উচ্চ যেথা শির,
জ্ঞান যেথা মুক্ত, যেথা গৃহের প্রাচীর
আপন প্রাঙ্গণতলে দিবসশর্বরী
বসুধারে রাখে নাই খণ্ড ক্ষুদ্র করি`,
                transliteration: `Chitta jetha bhoyshunyo, uchcho jetha shir
Gyan jetha mukto, jetha griher prachir
Apon pranganatale dibassharbari
Basudharke rakhe nai khando khudro kori`,
                translation: `Where the mind is without fear and the head is held high
Where knowledge is free
Where the world has not been broken up into fragments
By narrow domestic walls

Where words come out from the depth of truth
Where tireless striving stretches its arms towards perfection
Where the clear stream of reason has not lost its way
Into the dreary desert sand of dead habit

Into that heaven of freedom, my Father, let my country awake`
            }
        },
        {
            name: 'Ekla Chalo Re',
            genre: 'Patriotic Song',
            content: {
                original: `যদি তোর ডাক শুনে কেউ না আসে তবে একলা চলো রে।
একলা চলো, একলা চলো, একলা চলো, একলা চলো রে॥
যদি কেউ কথা না কয়, ওরে ওরে ও অভাগা,
যদি সবাই থাকে মুখ ফিরায়ে সবাই করে ভয়—
তবে পরান খুলে
ও তুই মুখ ফুটে তোর মনের কথা একলা বলো রে।`,
                transliteration: `Jodi tor daak shune keu na ashe tobe ekla cholo re
Ekla cholo, ekla cholo, ekla cholo, ekla cholo re
Jodi keu kotha na koy, ore ore o obhaga
Jodi sobai thake mukh phiraye sobai kore bhoy
Tobe poran khule
O tui mukh phute tor moner kotha ekla bolo re`,
                translation: `If they answer not to thy call, walk alone
Walk alone, walk alone, walk alone, walk alone
If they are afraid and cower mutely facing the wall
O thou unlucky one
Open thy mind and speak out alone`
            }
        }
    ],

    // Mir Taqi Mir (Urdu)
    'poet-mir-taqi-mir-mk00jxnz': [
        {
            name: 'Dil Hi To Hai Na Sang-o-Khisht',
            genre: 'Ghazal',
            content: {
                original: `دلِ ہی تو ہے نہ سنگ و خشت درد سے بھر نہ آئے کیوں
روئیں گے ہم ہزار بار کوئی ہمیں ستائے کیوں

دائم پڑا ہوا ترے در پر نہیں ہوں میں
خاک ایسی زندگی پہ کہ پتھر سے بھی نہ ہوں`,
                transliteration: `Dil hi to hai na sang-o-khisht dard se bhar na aaye kyun
Royenge hum hazaar baar koi humein sataye kyun

Daayam para hua tere dar par nahin hoon main
Khaak aisi zindagi pe ke pathar se bhi na hoon`,
                translation: `It is but a heart, not stone or brick, why should it not fill with pain?
I shall weep a thousand times, why should anyone torment me?

I do not lie fallen at your door forever
Curse such a life that I am not even like stone`
            }
        },
        {
            name: 'Ulti Ho Gayi Sab Tadbeerein',
            genre: 'Ghazal',
            content: {
                original: `الٹی ہو گئیں سب تدبیریں کچھ نہ دوا نے کام کیا
دیکھا اس بیماری دل نے آخر کام تمام کیا`,
                transliteration: `Ulti ho gayin sab tadbeerein kuch na dawa ne kaam kiya
Dekha is beemaari-e-dil ne aakhir kaam tamaam kiya`,
                translation: `All remedies went in vain, no medicine worked
See how this ailment of the heart finally finished me`
            }
        }
    ],

    // Kalidasa (Sanskrit)
    'poet-001': [
        {
            name: 'Meghaduta Opening Verse',
            genre: 'Khandakavya',
            content: {
                original: `कश्चित्कान्ताविरहगुरुणा स्वाधिकारात्प्रमत्तः
शापेनास्तङ्गमितमहिमा वर्षभोग्येण भर्तुः।
यक्षश्चक्रे जनकतनयास्नानपुण्योदकेषु
स्निग्धच्छायातरुषु वसतिं रामगिर्याश्रमेषु॥`,
                transliteration: `Kashchit kantavirahguruna svaadhikarat pramattah
Shapenastangamitamahima varsabhogyen bhartuh
Yakshashchakre janakatanayasnanapunyodakeshu
Snigdhachchhayatarush vasatim ramagiryashramesh`,
                translation: `A certain Yaksha, who had neglected his duty
Was cursed by his master to be separated from his beloved for a year
He made his dwelling on Ramagiri among hermitages
Near trees of thick shade, by waters sanctified by Sita's bath`
            }
        }
    ],

    // Thiruvalluvar (Tamil)
    'poet-005': [
        {
            name: 'Tirukkural on Virtue',
            genre: 'Didactic Poetry',
            content: {
                original: `அகர முதல எழுத்தெல்லாம் ஆதி
பகவன் முதற்றே உலகு

கற்றதனால் ஆய பயனென்கொல் வாலறிவன்
நற்றாள் தொழாஅர் எனின்`,
                transliteration: `Akara mudala ezhuththellaam aadhi
Bhagavan mudhatre ulagu

Katrathanaal aaya payanenkol vaalarivaan
Natraal thozhaaar enin`,
                translation: `As the letter A is the first of all letters
So the eternal God is first in the world

What is the use of learning, if one does not worship
The pure feet of the One who has perfect knowledge?`
            }
        }
    ]
};

async function seedProductionPoetry() {
    const catalogPath = path.join(__dirname, 'data', 'catalogs', 'poets-index.json');
    const content = await fs.readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(content);

    let worksAdded = 0;

    for (const [poetId, poems] of Object.entries(productionPoetryData)) {
        const poet = catalog.entities.find(e => e.entityId === poetId);
        if (!poet) {
            console.log(`Poet not found: ${poetId}`);
            continue;
        }

        console.log(`Adding works for ${poet.name}...`);

        for (const poem of poems) {
            const workEntry = {
                "@type": "CreativeWork",
                workId: `work-${poetId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                name: poem.name,
                author: {
                    "@type": "Person",
                    "@id": poetId
                },
                inLanguage: poet.knowsLanguage,
                genre: poem.genre,
                abstract: poem.content.translation.slice(0, 200) + '...',
                content: poem.content,
                keywords: [poem.genre, poet.knowsLanguage],
                addedAt: new Date().toISOString()
            };

            // Check for existing work with same name
            const existingIndex = catalog.works.findIndex(w =>
                w.name === poem.name &&
                (w.author?.['@id'] === poetId || w.author?.['@id']?.includes(poetId.replace('poet-', '')))
            );

            if (existingIndex >= 0) {
                // Update existing
                catalog.works[existingIndex] = { ...catalog.works[existingIndex], ...workEntry };
                console.log(`  Updated: ${poem.name}`);
            } else {
                catalog.works.push(workEntry);
                console.log(`  Added: ${poem.name}`);
                worksAdded++;
            }
        }
    }

    // Save catalog
    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

    // Also update web copy
    const webCatalogPath = path.join(__dirname, 'web', 'data', 'catalogs', 'poets-index.json');
    await fs.writeFile(webCatalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

    console.log(`\n✅ Done! Added ${worksAdded} new works to catalog.`);
    console.log(`Total works in catalog: ${catalog.works.length}`);
}

seedProductionPoetry().catch(console.error);
