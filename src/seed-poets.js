/**
 * Comprehensive Indian Poets Seeder
 * Seeds ~60 poets with enriched data from research document
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Comprehensive poets data from research
const enrichedPoets = [
    // ============================================
    // CLASSICAL SANSKRIT ERA (4th-12th Century CE)
    // ============================================
    {
        entityId: "poet-kalidasa",
        name: "Kalidasa",
        "@type": "Person",
        knowsLanguage: "Sanskrit",
        era: "Classical",
        century: "4th-5th Century CE",
        titles: ["Kavikula Guru", "The Shakespeare of India"],
        keywords: ["Mahakavya", "Nataka", "Khandakavya", "Golden Age", "Gupta Empire"],
        abstract: "Universally acknowledged as the greatest Sanskrit poet. His works are characterized by Vaidarbhi Riti (lucid, sweet style), profound empathy with nature, and mastery of Upama (simile).",
        majorWorks: ["Raghuvamsha", "Kumarasambhava", "Meghaduta", "Abhijnanashakuntala", "Ritusamhara"],
        sameAs: ["https://en.wikipedia.org/wiki/Kalidasa"]
    },
    {
        entityId: "poet-bharavi",
        name: "Bharavi",
        "@type": "Person",
        knowsLanguage: "Sanskrit",
        era: "Classical",
        century: "6th Century CE",
        titles: ["Brihattrayi Poet"],
        keywords: ["Mahakavya", "Artha-gauravam", "Mahabharata"],
        abstract: "One of the Brihattrayi (Great Trio) of Sanskrit poets, famous for Artha-gauravam (depth of meaning). His Kiratarjuniya includes verses that read the same backwards and forwards.",
        majorWorks: ["Kiratarjuniya"],
        sameAs: ["https://en.wikipedia.org/wiki/Bharavi"]
    },
    {
        entityId: "poet-magha",
        name: "Magha",
        "@type": "Person",
        knowsLanguage: "Sanskrit",
        era: "Classical",
        century: "7th Century CE",
        titles: ["Brihattrayi Poet"],
        keywords: ["Mahakavya", "Krishna", "Shishupala"],
        abstract: "Said to combine the qualities of Kalidasa (simile), Bharavi (depth), and Dandin (wordplay). His epic is encyclopedic, containing descriptions of politics, war, and romance.",
        majorWorks: ["Shishupala Vadha"],
        sameAs: ["https://en.wikipedia.org/wiki/Magha_(poet)"]
    },
    {
        entityId: "poet-jayadeva",
        name: "Jayadeva",
        "@type": "Person",
        knowsLanguage: "Sanskrit",
        era: "Classical",
        century: "12th Century",
        literaryMovement: "Bhakti Transition",
        keywords: ["Gita Govinda", "Radha-Krishna", "Odissi", "Devotional Poetry"],
        abstract: "His Gita Govinda bridges the classical and Bhakti eras. A lyrical sequence celebrating the erotic-spiritual love of Radha and Krishna, it profoundly influenced the Odissi and Manipuri dance forms.",
        majorWorks: ["Gita Govinda"],
        sameAs: ["https://en.wikipedia.org/wiki/Jayadeva"]
    },
    {
        entityId: "poet-bhasa",
        name: "Bhasa",
        "@type": "Person",
        knowsLanguage: "Sanskrit",
        era: "Classical",
        century: "2nd-3rd Century CE",
        keywords: ["Nataka", "Drama", "Tragedy"],
        abstract: "A predecessor to Kalidasa, known for Urubhangam (The Breaking of Thighs), a rare Sanskrit tragedy where the hero Duryodhana dies on stage, defying dramatic conventions.",
        majorWorks: ["Svapnavasavadattam", "Urubhangam"],
        sameAs: ["https://en.wikipedia.org/wiki/Bhasa"]
    },

    // ============================================
    // TAMIL SANGAM & POST-SANGAM (300 BCE - 12th Century)
    // ============================================
    {
        entityId: "poet-thiruvalluvar",
        name: "Thiruvalluvar",
        "@type": "Person",
        knowsLanguage: "Tamil",
        era: "Sangam",
        century: "1st Century BCE",
        titles: ["Poet of the Kural"],
        keywords: ["Tirukkural", "Ethics", "Didactic Poetry", "Secular Philosophy"],
        abstract: "Author of Tirukkural, 1330 couplets on Aram (Virtue), Porul (Wealth), and Inbam (Love). Celebrated for its secular, universal ethics applicable across religions and cultures.",
        majorWorks: ["Tirukkural"],
        sameAs: ["https://en.wikipedia.org/wiki/Thiruvalluvar"]
    },
    {
        entityId: "poet-ilango-adigal",
        name: "Ilango Adigal",
        "@type": "Person",
        knowsLanguage: "Tamil",
        era: "Sangam",
        century: "2nd Century CE",
        keywords: ["Silappadikaram", "Epic", "Jain Monk", "Kannagi"],
        abstract: "Jain monk-prince who wrote Silappadikaram (Tale of the Anklet), a masterpiece blending the three Tamil kingdoms and three religions. The climax, where Kannagi burns Madurai, defines Tamil culture.",
        majorWorks: ["Silappadikaram"],
        sameAs: ["https://en.wikipedia.org/wiki/Silappatikaram"]
    },
    {
        entityId: "poet-kamban",
        name: "Kamban",
        "@type": "Person",
        knowsLanguage: "Tamil",
        era: "Medieval",
        century: "12th Century",
        titles: ["Kavichakravarthi", "Emperor of Poets"],
        keywords: ["Kamba Ramayanam", "Epic", "Ravana"],
        abstract: "The 'Emperor of Poets.' His Iramavataram (Kamba Ramayanam) is considered the greatest Tamil literary work, where Ravana is a tragic, magnificent anti-hero. Noted for rhythm and musicality.",
        majorWorks: ["Kamba Ramayanam"],
        sameAs: ["https://en.wikipedia.org/wiki/Kambar_(poet)"]
    },
    {
        entityId: "poet-andal",
        name: "Andal",
        "@type": "Person",
        knowsLanguage: "Tamil",
        era: "Bhakti",
        century: "8th Century",
        literaryMovement: "Alvar Saints",
        titles: ["Nachiyar", "The Only Female Alvar"],
        keywords: ["Thiruppavai", "Bridal Mysticism", "Vishnu Devotion"],
        abstract: "The only female Alvar. Her Thiruppavai and Nachiyar Tirumoli express intense, bridal longing for Vishnu. Her poetry is used in Tamil weddings and festivals to this day.",
        majorWorks: ["Thiruppavai", "Nachiyar Tirumoli"],
        sameAs: ["https://en.wikipedia.org/wiki/Andal"]
    },

    // ============================================
    // BHAKTI MOVEMENT - NORTH INDIA (14th-17th Century)
    // ============================================
    {
        entityId: "poet-kabir",
        name: "Kabir",
        "@type": "Person",
        knowsLanguage: "Hindi",
        era: "Bhakti",
        century: "15th Century",
        literaryMovement: "Nirguna Bhakti",
        philosophicalSchool: "Sant Mat",
        titles: ["Weaver Saint"],
        keywords: ["Doha", "Sakhi", "Islamic-Hindu Synthesis", "Iconoclasm"],
        abstract: "A weaver at the intersection of Hinduism and Islam. His Bijak and Sakhi Granth consist of iconoclastic couplets ridiculing blind ritualism. 'Moko kahan dhundhe re bande' encapsulates his philosophy.",
        majorWorks: ["Bijak", "Sakhi Granth"],
        sameAs: ["https://en.wikipedia.org/wiki/Kabir"]
    },
    {
        entityId: "poet-tulsidas",
        name: "Tulsidas",
        "@type": "Person",
        knowsLanguage: "Awadhi",
        era: "Bhakti",
        century: "16th Century",
        literaryMovement: "Saguna Bhakti",
        titles: ["Goswami"],
        keywords: ["Ramcharitmanas", "Rama", "Devotion", "Epic"],
        abstract: "His Ramcharitmanas, written in Awadhi, made the story of Rama accessible to the common man, replacing Valmiki's Sanskrit text in popular consciousness. A work of immense Bhakti.",
        majorWorks: ["Ramcharitmanas", "Vinaya Patrika", "Kavitavali"],
        sameAs: ["https://en.wikipedia.org/wiki/Tulsidas"]
    },
    {
        entityId: "poet-surdas",
        name: "Surdas",
        "@type": "Person",
        knowsLanguage: "Braj Bhasha",
        era: "Bhakti",
        century: "16th Century",
        literaryMovement: "Saguna Bhakti",
        titles: ["The Blind Poet"],
        keywords: ["Sur Sagar", "Krishna", "Vatsalya Rasa", "Childhood"],
        abstract: "The blind poet of the Pushtimarg sect. His Sur Sagar contains thousands of songs focusing on Krishna's childhood. His depiction of Vatsalya Rasa (parental love) is unparalleled.",
        majorWorks: ["Sur Sagar"],
        sameAs: ["https://en.wikipedia.org/wiki/Surdas"]
    },
    {
        entityId: "poet-meera-bai",
        name: "Meera Bai",
        "@type": "Person",
        knowsLanguage: "Rajasthani",
        era: "Bhakti",
        century: "16th Century",
        literaryMovement: "Madhurya Bhakti",
        titles: ["Saint of Rajasthan"],
        keywords: ["Padavali", "Krishna", "Feminist Resistance", "Bridal Mysticism"],
        abstract: "A Rajput princess who defied royal conventions to worship Krishna. Her Padavalis express Madhurya Bhakti (bridal mysticism), rejecting her earthly husband for the divine Giridhara Gopala.",
        majorWorks: ["Meera Padavali"],
        sameAs: ["https://en.wikipedia.org/wiki/Meera"]
    },

    // ============================================
    // BHAKTI - SOUTH & WEST INDIA
    // ============================================
    {
        entityId: "poet-basavanna",
        name: "Basavanna",
        "@type": "Person",
        knowsLanguage: "Kannada",
        era: "Bhakti",
        century: "12th Century",
        literaryMovement: "Virashaiva",
        philosophicalSchool: "Vachanakara",
        titles: ["Statesman-Saint"],
        keywords: ["Vachana", "Anti-Caste", "Temple Rejection", "Social Reform"],
        abstract: "A statesman who led the Virashaiva movement. His Vachanas rejected temple worship and caste, famously stating 'The rich make temples for Shiva; what shall I, a poor man, do? My legs are pillars.'",
        majorWorks: ["Vachana Sahitya"],
        sameAs: ["https://en.wikipedia.org/wiki/Basava"]
    },
    {
        entityId: "poet-akka-mahadevi",
        name: "Akka Mahadevi",
        "@type": "Person",
        knowsLanguage: "Kannada",
        era: "Bhakti",
        century: "12th Century",
        literaryMovement: "Virashaiva",
        titles: ["Akka"],
        keywords: ["Vachana", "Feminine Mysticism", "Radical Rejection"],
        abstract: "A radical female mystic who wandered naked, covered only by her hair. Her Vachanas address Shiva as Chennamallikarjuna, expressing fierce rejection of patriarchal society.",
        majorWorks: ["Vachana Sahitya"],
        sameAs: ["https://en.wikipedia.org/wiki/Akka_Mahadevi"]
    },
    {
        entityId: "poet-dnyaneshwar",
        name: "Dnyaneshwar",
        "@type": "Person",
        knowsLanguage: "Marathi",
        era: "Bhakti",
        century: "13th Century",
        literaryMovement: "Varkari",
        titles: ["Sant Dnyaneshwar"],
        keywords: ["Dnyaneshwari", "Bhagavad Gita", "Philosophy", "Vernacular"],
        abstract: "Wrote the Dnyaneshwari (a Marathi commentary on the Gita) and Amrutanubhav. Laid the foundation of Marathi language by translating complex Sanskrit philosophy into vernacular.",
        majorWorks: ["Dnyaneshwari", "Amrutanubhav"],
        sameAs: ["https://en.wikipedia.org/wiki/Dnyaneshwar"]
    },
    {
        entityId: "poet-tukaram",
        name: "Tukaram",
        "@type": "Person",
        knowsLanguage: "Marathi",
        era: "Bhakti",
        century: "17th Century",
        literaryMovement: "Varkari",
        titles: ["Sant Tukaram"],
        keywords: ["Abhanga", "Vitthala", "Autobiography", "Shudra Saint"],
        abstract: "A Shudra grocer whose Abhangas are the crowning glory of Varkari poetry. His poems are autobiographical, documenting struggle from worldly failure to spiritual realization.",
        majorWorks: ["Tukaram Gatha"],
        sameAs: ["https://en.wikipedia.org/wiki/Tukaram"]
    },
    {
        entityId: "poet-narsinh-mehta",
        name: "Narsinh Mehta",
        "@type": "Person",
        knowsLanguage: "Gujarati",
        era: "Bhakti",
        century: "15th Century",
        titles: ["Adi Kavi of Gujarati"],
        keywords: ["Prabhatiyas", "Vaishnav Jan To", "Gandhi"],
        abstract: "The Adi Kavi of Gujarati. His Prabhatiyas and 'Vaishnav Jan To' defined the ideal devotee for Mahatma Gandhi. Central to Gujarati culture.",
        majorWorks: ["Prabhatiyas", "Vaishnav Jan To", "Mameru"],
        sameAs: ["https://en.wikipedia.org/wiki/Narsinh_Mehta"]
    },

    // ============================================
    // MEDIEVAL SUFI/URDU (16th-19th Century)
    // ============================================
    {
        entityId: "poet-mir-taqi-mir",
        name: "Mir Taqi Mir",
        "@type": "Person",
        knowsLanguage: "Urdu",
        era: "Medieval",
        century: "18th Century",
        titles: ["Khuda-e-Sukhan", "God of Poetry"],
        keywords: ["Ghazal", "Pathos", "Delhi", "Tragedy"],
        abstract: "Known as Khuda-e-Sukhan (God of Poetry). His ghazals are marked by pathos (soz) and simplicity. Witnessing Delhi's devastation, his poetry reflects both personal and civilizational tragedy.",
        majorWorks: ["Kulliyat-e-Mir", "Zikr-e-Mir"],
        sameAs: ["https://en.wikipedia.org/wiki/Mir_Taqi_Mir"]
    },
    {
        entityId: "poet-mirza-ghalib",
        name: "Mirza Ghalib",
        "@type": "Person",
        knowsLanguage: "Urdu",
        era: "Medieval",
        century: "19th Century",
        titles: ["Mirza", "Asadullah Khan Ghalib"],
        keywords: ["Ghazal", "Philosophy", "Love", "Skepticism"],
        abstract: "The towering figure of Urdu literature. Ghalib's poetry is philosophical, skeptical, and intellectually demanding. His Diwan-e-Ghalib is a concise masterpiece.",
        majorWorks: ["Diwan-e-Ghalib", "Ghalib ke Khutoot"],
        sameAs: ["https://en.wikipedia.org/wiki/Mirza_Ghalib"]
    },
    {
        entityId: "poet-waris-shah",
        name: "Waris Shah",
        "@type": "Person",
        knowsLanguage: "Punjabi",
        era: "Medieval",
        century: "18th Century",
        literaryMovement: "Sufi Qissa",
        keywords: ["Heer Ranjha", "Qissa", "Tragic Romance", "Punjab"],
        abstract: "Author of Heer Ranjha, the defining text of Punjabi identity. It narrates doomed love while critiquing the clergy and social order. Often called 'the Quran of Punjab.'",
        majorWorks: ["Heer Ranjha"],
        sameAs: ["https://en.wikipedia.org/wiki/Waris_Shah"]
    },
    {
        entityId: "poet-bulleh-shah",
        name: "Bulleh Shah",
        "@type": "Person",
        knowsLanguage: "Punjabi",
        era: "Medieval",
        century: "18th Century",
        literaryMovement: "Sufi",
        philosophicalSchool: "Sufi Mysticism",
        keywords: ["Kafi", "Humanism", "Anti-Orthodoxy"],
        abstract: "A Sufi mystic whose Kafis are sung across South Asia. A radical humanist who challenged religious orthodoxy, famously asking 'Bulleya Ki Jaana Main Kaun' (O Bulleh, who knows who I am?).",
        majorWorks: ["Bulleh Shah Kafiyaan"],
        sameAs: ["https://en.wikipedia.org/wiki/Bulleh_Shah"]
    },
    {
        entityId: "poet-shah-latif-bhittai",
        name: "Shah Abdul Latif Bhittai",
        "@type": "Person",
        knowsLanguage: "Sindhi",
        era: "Medieval",
        century: "18th Century",
        literaryMovement: "Sufi",
        keywords: ["Shah Jo Risalo", "Folk Tales", "Musical Modes"],
        abstract: "His Shah Jo Risalo is the magnum opus of Sindhi literature. It organizes Sufi poetry based on musical modes (Sur) of local folk tales. Heroines serve as allegories for the seeking soul.",
        majorWorks: ["Shah Jo Risalo"],
        sameAs: ["https://en.wikipedia.org/wiki/Shah_Abdul_Latif_Bhittai"]
    },
    {
        entityId: "poet-lal-ded",
        name: "Lal Ded",
        "@type": "Person",
        knowsLanguage: "Kashmiri",
        era: "Medieval",
        century: "14th Century",
        literaryMovement: "Kashmir Shaivism-Sufi",
        titles: ["Lalla", "Lalleshwari"],
        keywords: ["Vakh", "Shaivism", "Mysticism"],
        abstract: "Her Vakhs (four-line sayings) synthesize Kashmir Shaivism and Sufism. She wandered naked, rejecting societal norms, preaching the oneness of Self and Shiva.",
        majorWorks: ["Lal Vakhs"],
        sameAs: ["https://en.wikipedia.org/wiki/Lal_Ded"]
    },
    {
        entityId: "poet-habba-khatoon",
        name: "Habba Khatoon",
        "@type": "Person",
        knowsLanguage: "Kashmiri",
        era: "Medieval",
        century: "16th Century",
        titles: ["Nightingale of Kashmir"],
        keywords: ["Lol", "Lyric", "Separation", "Royal"],
        abstract: "The 'Nightingale of Kashmir.' A peasant girl who became Queen, she introduced the Lol (lyric) form. Her songs express sorrow of separation from her husband, exiled by Akbar.",
        majorWorks: ["Habba Khatoon Lyrics"],
        sameAs: ["https://en.wikipedia.org/wiki/Habba_Khatun"]
    },

    // ============================================
    // MODERN RENAISSANCE (19th-20th Century)
    // ============================================
    {
        entityId: "poet-rabindranath-tagore",
        name: "Rabindranath Tagore",
        "@type": "Person",
        knowsLanguage: "Bengali",
        era: "Modern",
        century: "19th-20th Century",
        titles: ["Gurudev", "Nobel Laureate (1913)"],
        award: ["Nobel Prize in Literature (1913)", "Knighthood (returned)"],
        keywords: ["Gitanjali", "Nobel Prize", "National Anthems", "Renaissance"],
        abstract: "A colossal figure who reshaped Bengali consciousness. Won the Nobel Prize in 1913 for Gitanjali. Penned national anthems of India and Bangladesh.",
        majorWorks: ["Gitanjali", "Sonar Tari", "Balaka", "Jana Gana Mana"],
        sameAs: ["https://en.wikipedia.org/wiki/Rabindranath_Tagore"]
    },
    {
        entityId: "poet-kazi-nazrul",
        name: "Kazi Nazrul Islam",
        "@type": "Person",
        knowsLanguage: "Bengali",
        era: "Modern",
        century: "20th Century",
        titles: ["Bidrohi Kabi", "Rebel Poet", "National Poet of Bangladesh"],
        keywords: ["Bidrohi", "Rebellion", "Anti-Colonial", "Islamic Poetry"],
        abstract: "The 'Rebel Poet' whose poem Bidrohi challenged both the British Raj and religious dogmatism with thunderous imagery. Reinvigorated Bengali poetry with Arabic and Persian vocabulary.",
        majorWorks: ["Bidrohi", "Agni-Veena"],
        sameAs: ["https://en.wikipedia.org/wiki/Kazi_Nazrul_Islam"]
    },
    {
        entityId: "poet-jibanananda-das",
        name: "Jibanananda Das",
        "@type": "Person",
        knowsLanguage: "Bengali",
        era: "Modern",
        century: "20th Century",
        literaryMovement: "Modernism",
        keywords: ["Ruposhi Bangla", "Banalata Sen", "Surrealism", "Rural Bengal"],
        abstract: "The poet of Ruposhi Bangla (Beautiful Bengal). Introduced modernism, surrealism, and deep engagement with rural landscape. Banalata Sen is one of the most famous Bengali poems.",
        majorWorks: ["Ruposhi Bangla", "Banalata Sen"],
        sameAs: ["https://en.wikipedia.org/wiki/Jibanananda_Das"]
    },
    {
        entityId: "poet-subramania-bharati",
        name: "Subramania Bharati",
        "@type": "Person",
        knowsLanguage: "Tamil",
        era: "Modern",
        century: "19th-20th Century",
        titles: ["Mahakavi"],
        keywords: ["Freedom Fighter", "Women's Rights", "Nationalism", "Krishna"],
        abstract: "The Mahakavi who initiated Tamil's modern era. Used Draupadi's humiliation as allegory for India under British rule. Advocated for women's freedom (Pudhumai Penn).",
        majorWorks: ["Panchali Sapatham", "Kuyil Pattu", "Kannan Pattu"],
        sameAs: ["https://en.wikipedia.org/wiki/Subramania_Bharati"]
    },
    {
        entityId: "poet-allama-iqbal",
        name: "Allama Iqbal",
        "@type": "Person",
        knowsLanguage: "Urdu",
        era: "Modern",
        century: "19th-20th Century",
        titles: ["Poet of the East", "Shair-e-Mashriq"],
        keywords: ["Khudi", "Selfhood", "Pan-Islamic", "Sare Jahan Se Achha"],
        abstract: "The philosopher-poet who moved from Indian nationalism (Sare Jahan Se Achha) to pan-Islamic thought. Explored the concept of Khudi (Selfhood) and the destiny of the East.",
        majorWorks: ["Bang-e-Dra", "Bal-e-Jibril", "Zarb-e-Kalim"],
        sameAs: ["https://en.wikipedia.org/wiki/Muhammad_Iqbal"]
    },
    {
        entityId: "poet-faiz-ahmed-faiz",
        name: "Faiz Ahmed Faiz",
        "@type": "Person",
        knowsLanguage: "Urdu",
        era: "Modern",
        century: "20th Century",
        literaryMovement: "Progressive Writers",
        keywords: ["Marxist-Romantic", "Revolution", "Hum Dekhenge", "Prison Poetry"],
        abstract: "A Marxist-Romantic. His Naqsh-e-Faryadi and Zindan-Nama blend lyrical beauty of the ghazal with revolutionary politics. 'Hum Dekhenge' became an anthem of protest across South Asia.",
        majorWorks: ["Naqsh-e-Faryadi", "Zindan-Nama", "Dast-e-Saba"],
        sameAs: ["https://en.wikipedia.org/wiki/Faiz_Ahmed_Faiz"]
    },
    {
        entityId: "poet-jaishankar-prasad",
        name: "Jaishankar Prasad",
        "@type": "Person",
        knowsLanguage: "Hindi",
        era: "Modern",
        century: "20th Century",
        literaryMovement: "Chhayavaad",
        keywords: ["Kamayani", "Romanticism", "Psychological Allegory"],
        abstract: "A key figure of Chhayavaad. His epic Kamayani (1936) is a psychological allegory based on the Vedic flood myth of Manu, exploring Id, Ego, and Super-Ego.",
        majorWorks: ["Kamayani"],
        sameAs: ["https://en.wikipedia.org/wiki/Jaishankar_Prasad"]
    },
    {
        entityId: "poet-nirala",
        name: "Suryakant Tripathi 'Nirala'",
        "@type": "Person",
        knowsLanguage: "Hindi",
        era: "Modern",
        century: "20th Century",
        literaryMovement: "Chhayavaad",
        titles: ["Nirala"],
        keywords: ["Free Verse", "Saroj Smriti", "Revolution"],
        abstract: "A revolutionary who broke rigid rules of meter. Saroj Smriti is a heartbreaking elegy for his daughter. Ram Ki Shakti Puja reimagines Rama as a human struggling with despair.",
        majorWorks: ["Saroj Smriti", "Ram Ki Shakti Puja", "Parimal"],
        sameAs: ["https://en.wikipedia.org/wiki/Suryakant_Tripathi_%27Nirala%27"]
    },
    {
        entityId: "poet-mahadevi-varma",
        name: "Mahadevi Varma",
        "@type": "Person",
        knowsLanguage: "Hindi",
        era: "Modern",
        century: "20th Century",
        literaryMovement: "Chhayavaad",
        titles: ["Modern Meera"],
        award: ["Jnanpith Award (1982)"],
        keywords: ["Yama", "Mystical Longing", "Feminine Poetry"],
        abstract: "The 'Modern Meera.' Her collection Yama and Deepshikha explore the pain of existence and mystical longing. A Jnanpith laureate.",
        majorWorks: ["Yama", "Deepshikha"],
        sameAs: ["https://en.wikipedia.org/wiki/Mahadevi_Varma"]
    },
    {
        entityId: "poet-dinkar",
        name: "Ramdhari Singh 'Dinkar'",
        "@type": "Person",
        knowsLanguage: "Hindi",
        era: "Modern",
        century: "20th Century",
        titles: ["Rashtrakavi", "National Poet"],
        award: ["Jnanpith Award (1972)"],
        keywords: ["Rashmirathi", "Urvashi", "Karna", "Nationalism"],
        abstract: "The Rashtrakavi (National Poet). His Rashmirathi centers on Karna from the Mahabharata, questioning caste and celebrating merit. Urvashi is a philosophical exploration of love.",
        majorWorks: ["Rashmirathi", "Urvashi", "Kurukshetra"],
        sameAs: ["https://en.wikipedia.org/wiki/Ramdhari_Singh_Dinkar"]
    },
    {
        entityId: "poet-kuvempu",
        name: "Kuvempu",
        "@type": "Person",
        knowsLanguage: "Kannada",
        era: "Modern",
        century: "20th Century",
        titles: ["Rashtrakavi of Karnataka"],
        award: ["Jnanpith Award (1967)"],
        keywords: ["Sri Ramayana Darshanam", "Vishwa Manava", "Universalism"],
        abstract: "The first Kannada Jnanpith laureate. His Sri Ramayana Darshanam reinterprets the Ramayana with a universalist vision (Vishwa Manava), where even Ravana attains salvation.",
        majorWorks: ["Sri Ramayana Darshanam"],
        sameAs: ["https://en.wikipedia.org/wiki/Kuvempu"]
    },
    {
        entityId: "poet-dr-bendre",
        name: "D.R. Bendre",
        "@type": "Person",
        knowsLanguage: "Kannada",
        era: "Modern",
        century: "20th Century",
        literaryMovement: "Navodaya",
        titles: ["Varakavi"],
        award: ["Jnanpith Award (1973)"],
        keywords: ["Nakutanti", "Four Strings", "Lyricism"],
        abstract: "A lyrical genius of the Navodaya period. His collection Nakutanti (Four Strings) explores the four levels of speech and won the Jnanpith Award.",
        majorWorks: ["Nakutanti"],
        sameAs: ["https://en.wikipedia.org/wiki/D._R._Bendre"]
    },
    {
        entityId: "poet-viswanatha-satyanarayana",
        name: "Viswanatha Satyanarayana",
        "@type": "Person",
        knowsLanguage: "Telugu",
        era: "Modern",
        century: "20th Century",
        titles: ["Kavi Samrat"],
        award: ["Jnanpith Award (1970)"],
        keywords: ["Ramayana Kalpavrukshamu", "Tradition", "Neo-Classical"],
        abstract: "A stalwart of tradition (Kavi Samrat). His Ramayana Kalpavrukshamu is a complex, neo-classical retelling. Veyipadagalu defends indigenous culture against Westernization.",
        majorWorks: ["Ramayana Kalpavrukshamu", "Veyipadagalu"],
        sameAs: ["https://en.wikipedia.org/wiki/Viswanatha_Satyanarayana"]
    },
    {
        entityId: "poet-sri-sri",
        name: "Sri Sri",
        "@type": "Person",
        knowsLanguage: "Telugu",
        era: "Modern",
        century: "20th Century",
        literaryMovement: "Progressive",
        titles: ["Mahakavi"],
        keywords: ["Maha Prasthanam", "Marxist", "Free Verse"],
        abstract: "The Mahakavi of the progressive movement. His Maha Prasthanam introduced free verse and Marxist thought to Telugu poetry, declaring 'Another world is calling.'",
        majorWorks: ["Maha Prasthanam"],
        sameAs: ["https://en.wikipedia.org/wiki/Sri_Sri_(writer)"]
    },
    {
        entityId: "poet-namdeo-dhasal",
        name: "Namdeo Dhasal",
        "@type": "Person",
        knowsLanguage: "Marathi",
        era: "Modern",
        century: "20th Century",
        literaryMovement: "Dalit Panthers",
        keywords: ["Golpitha", "Dalit Literature", "Social Protest", "Raw Language"],
        abstract: "Founder of the Dalit Panther movement. His Golpitha (1972) shattered literary norms with raw, brutal language describing the Bombay red-light district. Poetry as weapon of social protest.",
        majorWorks: ["Golpitha"],
        sameAs: ["https://en.wikipedia.org/wiki/Namdeo_Dhasal"]
    },
    {
        entityId: "poet-umashankar-joshi",
        name: "Umashankar Joshi",
        "@type": "Person",
        knowsLanguage: "Gujarati",
        era: "Modern",
        century: "20th Century",
        award: ["Jnanpith Award (1967)"],
        keywords: ["Nishith", "Gandhian", "Universal Peace"],
        abstract: "A giant of Gujarati literature and Jnanpith winner for Nishith. His works like Gangotri and Vishwa Shanti reflect Gandhian ideals and yearning for universal peace.",
        majorWorks: ["Nishith", "Gangotri", "Vishwa Shanti"],
        sameAs: ["https://en.wikipedia.org/wiki/Umashankar_Joshi"]
    },

    // ============================================
    // INDIAN ENGLISH POETRY
    // ============================================
    {
        entityId: "poet-nissim-ezekiel",
        name: "Nissim Ezekiel",
        "@type": "Person",
        knowsLanguage: "English",
        era: "Modern",
        century: "20th Century",
        titles: ["Father of Modern Indian English Poetry"],
        award: ["Sahitya Akademi Award"],
        keywords: ["Night of the Scorpion", "Irony", "Urban Poetry", "Bombay"],
        abstract: "The father of modern Indian English poetry. His works are characterized by irony, urban settings (Bombay), and focus on the 'ordinariness' of Indian life.",
        majorWorks: ["Night of the Scorpion", "Latter-Day Psalms"],
        sameAs: ["https://en.wikipedia.org/wiki/Nissim_Ezekiel"]
    },
    {
        entityId: "poet-kamala-das",
        name: "Kamala Das",
        "@type": "Person",
        knowsLanguage: "English",
        era: "Modern",
        century: "20th Century",
        titles: ["Madhavikutty"],
        keywords: ["Confessional Poetry", "Sexuality", "Female Voice", "Love"],
        abstract: "Famous for confessional poetry. Summer in Calcutta and The Descendants explore female sexuality and domestic life with startling honesty. 'I speak three languages, write in two, dream in one.'",
        majorWorks: ["Summer in Calcutta", "The Descendants"],
        sameAs: ["https://en.wikipedia.org/wiki/Kamala_Das"]
    },
    {
        entityId: "poet-ak-ramanujan",
        name: "A.K. Ramanujan",
        "@type": "Person",
        knowsLanguage: "English",
        era: "Modern",
        century: "20th Century",
        keywords: ["The Striders", "Relations", "Diaspora", "Translation"],
        abstract: "A bilingual poet (English/Kannada) and translator. His collections seamlessly connect the diaspora experience with deep Indian cultural memory and family history.",
        majorWorks: ["The Striders", "Relations"],
        sameAs: ["https://en.wikipedia.org/wiki/A._K._Ramanujan"]
    },
    {
        entityId: "poet-jayanta-mahapatra",
        name: "Jayanta Mahapatra",
        "@type": "Person",
        knowsLanguage: "English",
        era: "Modern",
        century: "20th Century",
        award: ["Sahitya Akademi Award"],
        keywords: ["Odisha", "Landscape", "History", "Famine"],
        abstract: "The first Indian English poet to win the Sahitya Akademi Award. His poetry is deeply rooted in the landscape of Odisha (Cuttack, Puri) and its history of war and famine.",
        majorWorks: ["Relationship"],
        sameAs: ["https://en.wikipedia.org/wiki/Jayanta_Mahapatra"]
    }
];

async function seedEnrichedPoets() {
    const catalogPath = path.join(__dirname, 'data', 'catalogs', 'poets-index.json');
    const content = await fs.readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(content);

    let added = 0;
    let updated = 0;

    for (const poet of enrichedPoets) {
        const existingIndex = catalog.entities.findIndex(e =>
            e.name.toLowerCase() === poet.name.toLowerCase() ||
            e.entityId === poet.entityId
        );

        if (existingIndex >= 0) {
            // Update existing with enriched data
            catalog.entities[existingIndex] = {
                ...catalog.entities[existingIndex],
                ...poet,
                entityId: catalog.entities[existingIndex].entityId // Keep original ID
            };
            console.log(`  Updated: ${poet.name}`);
            updated++;
        } else {
            catalog.entities.push(poet);
            console.log(`  Added: ${poet.name}`);
            added++;
        }
    }

    // Update metadata
    catalog.metadata.totalEntities = catalog.entities.length;
    catalog.updatedAt = new Date().toISOString();

    // Save
    await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

    // Sync to web
    const webCatalogPath = path.join(__dirname, 'web', 'data', 'catalogs', 'poets-index.json');
    await fs.writeFile(webCatalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

    console.log(`\n✅ Done! Added ${added} new poets, updated ${updated} existing.`);
    console.log(`Total poets in catalog: ${catalog.entities.length}`);
}

seedEnrichedPoets().catch(console.error);
