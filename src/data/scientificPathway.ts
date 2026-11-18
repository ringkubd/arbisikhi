import type {
  AgeMode,
  AgeScientificMethodProfile,
  ScientificStage,
} from '../types';

export const AGE_SCIENTIFIC_PROFILES: Record<AgeMode, AgeScientificMethodProfile> = {
  kids: {
    ageMode: 'kids',
    badgeTitle: {
      bn: 'বয়স ৩–১২ · মাল্টিসেন্সরি প্লে ও ভিজ্যুয়াল মেমোরি পদ্ধতি',
      en: 'Ages 3–12 · Multisensory Dual-Coding & Story Anchor Method',
    },
    cognitivePrinciple: {
      bn: 'ডুয়াল-কোডিং থিওরি (Paivio) ও ধ্বনি-আকৃতি খেলা—ব্যাকরণের কঠিন সংজ্ঞা ছাড়াই ছবি, ছন্দ ও স্পর্শে শেখা।',
      en: 'Paivio Dual-Coding + Phonological Play — zero grammar jargon, pairing vivid shape stories with sound and touch.',
    },
    chunkingRule: {
      bn: 'প্রতি ধাপে মাত্র ৩টি ছোট অংশ (মাইক্রো-চাঙ্কিং)',
      en: '3 visual items per step (Working-Memory Safe)',
    },
    sessionTarget: {
      bn: '৪–৫ মিনিটের আনন্দময় পর্ব · ০.৮৫x স্পষ্ট উচ্চারণ',
      en: '4–5 min joyful bursts · 0.85x clear audio',
    },
    memoryStrategy: {
      bn: 'নৌকা ও ফোঁটার গল্পে হরফ চেনা + শুনে মিলানো পাজল',
      en: 'Shape-story mnemonics + audio-matching tile puzzles',
    },
    recommendedSpeed: 0.85,
  },
  standard: {
    ageMode: 'standard',
    badgeTitle: {
      bn: 'বয়স ১৩–৫০ · প্যারেটো ৮০/২০, মিনিমাল-পেয়ার ও রুট প্যাটার্ন বিজ্ঞান',
      en: 'Ages 13–50 · Pareto 80/20, Minimal-Pair Phonetics & Root Schema',
    },
    cognitivePrinciple: {
      bn: 'মিনিমাল-পেয়ার ধ্বনি তুলনা (ت বনাম ط), ৩-অক্ষরের মূলশব্দ মেট্রিক্স ও অ্যাক্টিভ রিকল স্পেসড রিপিটিশন (SM-2)।',
      en: 'Acoustic Minimal-Pair Contrast, 3-Letter Morphological Schemas & Active-Recall Testing Effect.',
    },
    chunkingRule: {
      bn: '৫–৭টি যুক্তিসঙ্গত প্যাটার্ন ও সরাসরি প্রয়োগ',
      en: '5–7 pattern-linked chunks + active synthesis',
    },
    sessionTarget: {
      bn: '১০–১৫ মিনিটের ফোকাসড সেশন · ১.০x স্বাভাবিক গতি',
      en: '10–15 min focused sprint · 1.0x natural cadence',
    },
    memoryStrategy: {
      bn: '১টি মূলশব্দ থেকে ৮টি শব্দ গঠন + হরকত ফ্যাডিং অনুশীলন',
      en: '1-to-8 root multiplication + progressive Harakat fading',
    },
    recommendedSpeed: 1.0,
  },
  senior: {
    ageMode: 'senior',
    badgeTitle: {
      bn: 'বয়স ৫১–৯০ · স্বল্প কগনিটিভ লোড, ধীর শ্রবণ ও প্রশান্ত অনুশীলন',
      en: 'Ages 51–90 · Low Cognitive Load, Calm 0.7x Audio & Errorless Pacing',
    },
    cognitivePrinciple: {
      bn: 'সোয়েলারের কগনিটিভ লোড হ্রাস নীতি—বড় হাই-কনট্রাস্ট হরফ, কোনো টাইমার চাপ নেই এবং শ্রবণ-প্রথম পুনরাবৃত্তি।',
      en: 'Sweller Cognitive Load Reduction — extra-large script, zero countdown stress, and calm auditory priming.',
    },
    chunkingRule: {
      bn: 'একবারে ১টি স্পষ্ট নিয়ম ও বড় অক্ষরে উদাহরণ',
      en: '1 clear concept at a time with large-print examples',
    },
    sessionTarget: {
      bn: 'নিজের সুবিধামতো ধীর গতি · ০.৭x মানব কণ্ঠের অডিও',
      en: 'Self-paced calm review · 0.7x crystal-clear audio',
    },
    memoryStrategy: {
      bn: 'পরিচিত বাংলা ধ্বনির সাথে তুলনা ও বারবার শুনে নিশ্চিতকরণ',
      en: 'Familiar phonetic analogies + listen-first gentle confirmation',
    },
    recommendedSpeed: 0.7,
  },
};

export const ZERO_TO_QURAN_STAGES: ScientificStage[] = [
  {
    id: 'q_step_01_shapes',
    stepNumber: 1,
    track: 'zero_to_quran',
    title: {
      bn: '০১. আকৃতি পরিবার ও মাখরাজ ধ্বনিবিজ্ঞান',
      en: '01. Shape Families & Minimal-Pair Makharij',
    },
    subtitle: {
      bn: '২৮টি হরফ আলাদা মুখস্থ না করে ৭টি আকৃতি পরিবার ও কাছাকাছি ধ্বনির পার্থক্য দিয়ে দ্রুত চেনা',
      en: 'Master 28 letters 4x faster via 7 visual shape families and acoustic minimal pairs',
    },
    estimatedMinutes: 6,
    xpReward: 25,
    sciencePillar: {
      bn: 'ভিজ্যুয়াল চাঙ্কিং ও অ্যাকোস্টিক মিনিমাল পেয়ার (Miller’s Chunking Law)',
      en: 'Visual Pattern Chunking & Acoustic Minimal-Pair Contrast',
    },
    whyItWorks: {
      bn: 'মস্তিষ্ক ২৮টি বিচ্ছিন্ন চিহ্নের বদলে একই নৌকা-আকৃতির (ب ت ث) ফোঁটার অবস্থান এবং পাতলা-মোটা জোড়া (ت বনাম ط, ح বনাম ه) তুলনা করলে দ্বিধা চিরতরে দূর হয়।',
      en: 'Grouping identical base strokes by dot placement (ب ت ث) and contrasting light vs. heavy pairs (ت vs ط) eliminates visual and phonetic confusion.',
    },
    mistakeGuard: {
      bn: 'পাতলা "তা" (ت) এবং মোটা "ত্বা" (ط) কিংবা গলার মাঝের "হা" (ح) ও বুকের "হা" (ه) কখনো একরকম উচ্চারণ করবেন না।',
      en: 'Never merge light dental ت with heavy emphatic ط, or mid-throat ح with soft chest ه.',
    },
    ageGuidance: {
      kids: {
        bn: 'নৌকার নিচে ১টি বল হলে "বা" (ب), উপরে ২টি তারা হলে "তা" (ت), আর ৩টি ফোঁটা হলে "ছা" (ث)! অডিও শুনে মজার ছবি মিলিয়ে নাও।',
        en: 'Picture a little boat: 1 dot below is Ba (ب), 2 stars on top is Ta (ت), and 3 dots on top is Tha (ث)! Tap each sound to hear it.',
      },
      standard: {
        bn: 'প্রথমে বোট-ফ্যামিলি (ب ت ث) ও কার্ভ-ফ্যামিলি (ج ح خ) চিনুন, তারপর মিনিমাল পেয়ার অডিও শুনে পাতলা (Tarqeeq) ও মোটা (Tafkheem) পার্থক্য যাচাই করুন।',
        en: 'Compare dot-Minimal families (ب ت ث / ج ح خ) alongside Tafkheem-Tarqeeq pairs (ت/ط, س/ص) using vocal-tract placement cues.',
      },
      senior: {
        bn: 'তাড়াহুড়ো না করে বড় অক্ষরে শুধু ফোঁটার অবস্থান দেখুন—নিচে ১ ফোঁটা "বা", উপরে ২ ফোঁটা "তা"। ০.৭x ধীর অডিও শুনে মুখে একবার উচ্চারণ করুন।',
        en: 'Focus calmly on dot placement in large print — 1 dot below (ب), 2 above (ت). Play the slow 0.7x audio and repeat gently once.',
      },
    },
    interactiveCards: [
      {
        id: 'boat_family',
        partsAr: ['ب', 'ت', 'ث'],
        joinedAr: 'ب · ت · ث',
        partialHarakatAr: 'ب · ت · ث',
        unvowelledAr: 'ب ت ث',
        translit: {bn: 'বা · তা · ছা', en: 'Bā · Tā · Thā'},
        meaning: {
          bn: 'নৌকা পরিবার: নিচে ১ ফোঁটা, উপরে ২ ফোঁটা, উপরে ৩ ফোঁটা (জিহ্বার আগা ও দাঁত)',
          en: 'Boat Shape Family: 1 dot below, 2 dots above, 3 soft interdental dots',
        },
        scientificNote: {
          bn: 'একই মূল রেখা—শুধু ফোঁটার সংখ্যা ও অবস্থান বদলালেই ৩টি হরফ শেখা হয়ে যায়।',
          en: 'One shared base glyph unlocks 3 core letters immediately.',
        },
      },
      {
        id: 'curve_family',
        partsAr: ['ج', 'ح', 'خ'],
        joinedAr: 'ج · ح · خ',
        partialHarakatAr: 'ج · ح · خ',
        unvowelledAr: 'ج ح خ',
        translit: {bn: 'জীম · হা (গলার মাঝ) · খ্বা', en: 'Jīm · Ḥā · Khā'},
        meaning: {
          bn: 'বাঁকা পেট পরিবার: পেটে ১ ফোঁটা (ج), ফোঁটা ছাড়া নির্মল (ح), মাথায় ১ ফোঁটা (خ)',
          en: 'Curve Family: 1 dot inside (ج), spotless pure throat (ح), 1 dot on top (خ)',
        },
        scientificNote: {
          bn: 'ح ফোঁটা ছাড়া = গলার মাঝখান থেকে পরিষ্কার বাতাস; خ উপরে ফোঁটা = গলার উপরের ঘর্ষণ ধ্বনি।',
          en: 'Spotless ح maps to clean pharyngeal airflow; top-dotted خ maps to velar friction.',
        },
      },
      {
        id: 'contrast_pair',
        partsAr: ['تَ', 'طَ', 'سَ', 'صَ'],
        joinedAr: 'تَ ↔ طَ · سَ ↔ صَ',
        partialHarakatAr: 'تَ ↔ طَ · س ↔ ص',
        unvowelledAr: 'ت ↔ ط · س ↔ ص',
        translit: {bn: 'পাতলা তা ↔ মোটা ত্বা · পাতলা সীন ↔ মোটা স্বাদ', en: 'Light Tā ↔ Heavy Ṭā · Light Sīn ↔ Heavy Ṣād'},
        meaning: {
          bn: 'ধ্বনি পার্থক্য (Minimal Pairs): শব্দের অর্থ ঠিক রাখতে পাতলা ও মোটা হরফের তুলনা',
          en: 'Phonemic Minimal Pairs: Tongue-back elevation changes meaning in Quranic words',
        },
        scientificNote: {
          bn: 'কুরআনে قَلْب (হৃদয়) আর كَلْب (কুকুর)—শুধু মাখরাজের পার্থক্যে পুরো অর্থ বদলে যায়!',
          en: 'In Quranic Arabic, قَلْب (heart) vs كَلْب (dog) depends entirely on heavy vs light articulation.',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'গলার মাঝখান থেকে ফোঁটা ছাড়া পরিষ্কার বাতাসের "হা" হরফ কোনটি?',
        en: 'Which spotless letter is pronounced cleanly from the middle of the throat?',
      },
      audioCueAr: 'حَ',
      options: [
        {id: 'jeem', labelAr: 'ج', label: {bn: 'জীম (পেটে ১ ফোঁটা)', en: 'Jīm (dot inside)'}, isCorrect: false},
        {id: 'haa', labelAr: 'ح', label: {bn: 'হা (ফোঁটা ছাড়া মধ্যকণ্ঠ)', en: 'Ḥā (spotless mid-throat)'}, isCorrect: true},
        {id: 'khaa', labelAr: 'خ', label: {bn: 'খ্বা (উপরে ১ ফোঁটা)', en: 'Khā (dot above)'}, isCorrect: false},
      ],
      explanation: {
        bn: 'সঠিক! ح (হা)-তে কোনো ফোঁটা নেই এবং এটি গলার ঠিক মাঝখান থেকে কোমল ঘর্ষণে উচ্চারিত হয়।',
        en: 'Correct! Spotless ح (Ḥā) comes cleanly from the middle pharynx without nasalization or throat scraping.',
      },
    },
    deepLab: {navTab: 'alphabet', alphabetSubTab: 'letters'},
    deepLabLabel: {bn: '২৮ হরফ ও লাইভ মাখরাজ ল্যাব খুলুন', en: 'Open 28 Letters & Makharij Lab'},
  },
  {
    id: 'q_step_02_joining',
    stepNumber: 2,
    track: 'zero_to_quran',
    title: {
      bn: '০২. যুক্তাক্ষর ও ডান-থেকে-বাম সংযোগ সূত্র',
      en: '02. Right-to-Left Letter Joining & Stitching',
    },
    subtitle: {
      bn: 'শব্দের শুরুতে, মাঝে ও শেষে হরফ কীভাবে হাত মেলায় এবং ৬টি বাম-অসংযুক্ত হরফের ম্যাজিক নিয়ম',
      en: 'Decode any joined Quranic word instantly by spotting head-shapes and the 6 one-way connectors',
    },
    estimatedMinutes: 8,
    xpReward: 30,
    sciencePillar: {
      bn: 'অর্থোগ্রাফিক মরফিম স্টিচিং (Visual Head-Preservation Rule)',
      en: 'Orthographic Glyph Decomposition & Head-Preservation Rule',
    },
    whyItWorks: {
      bn: 'আরবি হরফ যুক্ত হওয়ার সময় তার "লেজ" বাদ দিয়ে শুধু "মাথা ও ফোঁটা" অক্ষুণ্ণ রাখে। আর ৬টি হরফ (ا د ذ ر ز و) কখনো বামের হরফকে ধরে না—এই ২টি নিয়ম জানলে যেকোনো যুক্তশব্দ পড়া যায়!',
      en: 'Every Arabic letter keeps its distinctive head + dots when joining, dropping only its tail — and 6 letters (ا د ذ ر ز و) never join to the left.',
    },
    mistakeGuard: {
      bn: 'ا د ذ ر ز و — এই ৬টি হরফের পর ফাঁকা জায়গা দেখে নতুন শব্দ মনে করবেন না; এরা বাম দিকে হাত বাড়ায় না।',
      en: 'Do not mistake the tiny gap after ا د ذ ر ز و for a word break — those 6 letters simply refuse left-hand connections.',
    },
    ageGuidance: {
      kids: {
        bn: 'হরফগুলো বন্ধুর মতো ডান থেকে বামে হাত ধরে! শুধু (ا د ذ ر ز و) বাম হাতে কাউকে ধরে না। নিচের বোতামে ট্যাপ করে দেখো হরফ কীভাবে জোড়া লাগে!',
        en: 'Letters hold hands from right to left like friends! Tap the letter blocks below to watch their tails tuck in and form a real word.',
      },
      standard: {
        bn: 'যুক্তশব্দে হরফের "মাথা + ফোঁটা" স্ক্যান করুন: بـ + سـ + م = بسم। পাশাপাশি ৬টি Non-Connector (ا د ذ ر ز و) চিহ্নিত করে শব্দাংশ আলাদা করুন।',
        en: 'Scan for glyph heads + dot counts (بـ + سـ + م = بسم) and use the 6 right-only connectors (ا د ذ ر ز و) as natural visual anchors.',
      },
      senior: {
        bn: 'যুক্ত অক্ষরে ঘাবড়াবেন না—হরফের নিচের বা উপরের ফোঁটা কখনো বদলায় না। নিচে বড় অক্ষরে আলাদা ও যুক্ত রূপ পাশাপাশি দেখুন।',
        en: 'Never feel intimidated by connected script — a letter’s dots never change! Inspect the separated pieces right beside the joined word below.',
      },
    },
    interactiveCards: [
      {
        id: 'stitch_kataba',
        partsAr: ['كَ', 'تَ', 'بَ'],
        joinedAr: 'كَتَبَ',
        partialHarakatAr: 'كَتب',
        unvowelledAr: 'كتب',
        translit: {bn: 'কা + তা + বা = কাতাবা', en: 'Ka + Ta + Ba = Kataba'},
        meaning: {bn: 'সে লিখেছে (৩টি হরফই ডানে-বামে যুক্ত হয়েছে)', en: 'He wrote (All 3 letters connect smoothly)'},
        scientificNote: {
          bn: 'লক্ষ্য করুন: ك এর শুরু রূপ (كَـ) + ت এর মাঝের রূপ (ـتَـ) + ب এর শেষ রূপ (ـبَ)।',
          en: 'Initial كَـ + Medial ـتَـ + Final ـبَ — tails drop, dots stay identical.',
        },
      },
      {
        id: 'stitch_bism',
        partsAr: ['بِ', 'سْ', 'مِ'],
        joinedAr: 'بِسْمِ',
        partialHarakatAr: 'بِسم',
        unvowelledAr: 'بسم',
        translit: {bn: 'বি + স্ + মি = বিসমি', en: 'Bi + s + mi = Bismi'},
        meaning: {bn: 'নামে (বিসমিল্লাহর প্রথম শব্দ)', en: 'In the name of (Opening word of Bismillah)'},
        scientificNote: {
          bn: 'প্রথম দাঁতের নিচে ১ ফোঁটা (بِـ), এরপর ৩টি দাঁত (ـسْـ), আর শেষে গোল মীম (ـمِ)।',
          en: '1 dot under first tooth (بِـ) + 3 teeth of Sīn (ـسْـ) + final loop of Mīm (ـمِ).',
        },
      },
      {
        id: 'stitch_rahima',
        partsAr: ['رَ', 'حِ', 'مَ'],
        joinedAr: 'رَحِمَ',
        partialHarakatAr: 'رَحِم',
        unvowelledAr: 'رحم',
        translit: {bn: 'র + হি + মা = রহিমা', en: 'Ra + ḥi + ma = Raḥima'},
        meaning: {bn: 'তিনি দয়া করেছেন (ر বাম দিকে যুক্ত হয়নি)', en: 'He showed mercy (ر does not connect left)'},
        scientificNote: {
          bn: 'ر একমুখী হরফ হওয়ায় ح এর সাথে হাত মেলায়নি, কিন্তু ح ঠিকই م এর সাথে যুক্ত হয়েছে (حِمَ)।',
          en: 'ر is a one-way connector so a micro-gap appears before حِـمَ, yet it is still one word.',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'كَ + تَ + بَ যুক্ত হলে সঠিক শব্দ কোনটি তৈরি হয়?',
        en: 'When كَ + تَ + بَ join from right to left, which word is formed?',
      },
      audioCueAr: 'كَتَبَ',
      options: [
        {id: 'opt1', labelAr: 'كَتَبَ', label: {bn: 'কাতাবা (كَتَبَ)', en: 'Kataba (كَتَبَ)'}, isCorrect: true},
        {id: 'opt2', labelAr: 'بَتَكَ', label: {bn: 'বাতাকা (بَتَكَ — উল্টো ক্রম)', en: 'Bataka (reversed order)'}, isCorrect: false},
        {id: 'opt3', labelAr: 'كَثَبَ', label: {bn: 'কাছাবা (৩ ফোঁটা ث)', en: 'Kathaba (3 dots ث)'}, isCorrect: false},
      ],
      explanation: {
        bn: 'চমৎকার! ডান থেকে বামে كَـ + ـتَـ (২ ফোঁটা) + ـبَ (নিচে ১ ফোঁটা) মিলে তৈরি হয় كَتَبَ।',
        en: 'Spot on! Reading right-to-left: initial كَـ + medial 2-dot ـتَـ + final 1-dot ـبَ forms كَتَبَ.',
      },
    },
    deepLab: {navTab: 'alphabet', alphabetSubTab: 'letters'},
    deepLabLabel: {bn: '৪টি যুক্তরূপ ও রাইটিং বোর্ডে যান', en: 'Practice Contextual Forms & Stroke Lab'},
  },
  {
    id: 'q_step_03_harakat',
    stepNumber: 3,
    track: 'zero_to_quran',
    title: {
      bn: '০৩. হরকত ও ১-মাত্রা ছন্দ বিজ্ঞান (যবর · যের · পেশ)',
      en: '03. Short Vowels & 1-Beat Rhythmic Timing',
    },
    subtitle: {
      bn: 'ফাতহাহ (যবর), কাসরাহ (যের) ও দাম্মাহ (পেশ) দিয়ে হরফে প্রাণ দেওয়া এবং টান ছাড়া নিখুঁত ১ মাত্রায় পড়া',
      en: 'Bring consonants to life with Fathah, Kasrah & Dammah using crisp 1-beat rhythmic precision',
    },
    estimatedMinutes: 6,
    xpReward: 25,
    sciencePillar: {
      bn: 'অডিটরি-মোটর টাইমিং ক্যালিব্রেশন (Isochronous 1-Beat Syllable Decoding)',
      en: 'Auditory-Motor Syllable Timing & Vowel Triangle Mapping',
    },
    whyItWorks: {
      bn: 'আরবিতে মৌলিক স্বরধ্বনি মাত্র ৩টি: মুখ খোলা (যবর = আ/অ), ঠোঁট নিচে (যের = ই), ঠোঁট গোল (পেশ = উ)। শুরু থেকেই ১ তুড়ি সমান (১ হারাকাহ) ছন্দে পড়লে অযথা টান দেওয়ার অভ্যাস তৈরি হয় না।',
      en: 'Arabic uses the purest vowel triangle (/a/ open, /i/ smile, /u/ rounded lips). Locking 1 finger-snap per short vowel prevents accidental vowel stretching.',
    },
    mistakeGuard: {
      bn: 'যবর-যের-পেশ পড়ার সময় ভুলেও লম্বা টান দেবেন না (যেমন بَ কে "বাআ" পড়লে অর্থ বদলে যায়)।',
      en: 'Never elongate a short Harakat — stretching بَ into بَا adds an unwritten Alif and alters Quranic meaning.',
    },
    ageGuidance: {
      kids: {
        bn: 'মাথার উপর ছাতা হলে মুখ খুলে "বা" (بَ), পায়ের নিচে জুতো হলে হেসে "বি" (بِ), আর মাথায় ফুল হলে ঠোঁট গোল করে "বু" (بُ)—মাত্র ১ তালি সমান!',
        en: 'Dash on top opens your mouth (Ba بَ), dash below smiles (Bi بِ), curl on top rounds your lips (Bu بُ) — quick as 1 clap!',
      },
      standard: {
        bn: 'প্রতিটি হরকত ঠিক ১ হারাকাহ (প্রায় ০.৩ সেকেন্ড) ধরে উচ্চারণ করুন; পাতলা হরফে যবর "আ"-ধর্মী (بَ) এবং মোটা হরফে "অ"-ধর্মী (صَ/قَ) হয়।',
        en: 'Keep every Harakat crisp at 1 beat (~0.3s); note how Fathah sounds front-open on light letters (بَ ba) and deeper on heavy letters (قَ qa).',
      },
      senior: {
        bn: 'উপরে দাগ = যবর, নিচে দাগ = যের, উপরে বাঁকা চিহ্ন = পেশ। তাড়াহুড়ো ছাড়া প্রতিটি অক্ষর সমান তালে স্পষ্ট করে পড়ুন।',
        en: 'Stroke above = Fathah, stroke below = Kasrah, curl above = Dammah. Read each syllable calmly with steady, equal length.',
      },
    },
    interactiveCards: [
      {
        id: 'vowel_triangle',
        partsAr: ['بَ', 'بِ', 'بُ'],
        joinedAr: 'بَ · بِ · بُ',
        partialHarakatAr: 'بَ · بِ · بُ',
        unvowelledAr: 'ب ب ب',
        translit: {bn: 'বা · বি · বু (১ মাত্রা)', en: 'Ba · Bi · Bu (1 Beat each)'},
        meaning: {bn: 'যবর (মুখ খোলা) · যের (হালকা হাসি) · পেশ (ঠোঁট গোল)', en: 'Fathah (open) · Kasrah (lowered) · Dammah (rounded lips)'},
        scientificNote: {
          bn: 'এই ৩টি মৌলিক স্বরত্রিভুজ (Vowel Triangle) দিয়ে কুরআনের সব শব্দের ভিত্তি তৈরি।',
          en: 'All classical Arabic vocalization rests on this crisp 3-vowel acoustic triangle.',
        },
      },
      {
        id: 'word_maliki',
        partsAr: ['مَ', 'لِ', 'كِ'],
        joinedAr: 'مَلِكِ',
        partialHarakatAr: 'مَلكِ',
        unvowelledAr: 'ملك',
        translit: {bn: 'মা-লি-কি', en: 'Ma-li-ki'},
        meaning: {bn: 'অধিপতি / মালিক (৩টি হরকতের সমান ১-মাত্রা ছন্দ)', en: 'Sovereign / Master (3 crisp 1-beat syllables)'},
        scientificNote: {
          bn: 'যবর (مَ) + যের (لِ) + যের (كِ)—প্রতিটি সমান ১ মাত্রা, কোনো অক্ষরেই অতিরিক্ত টান নেই।',
          en: 'Fathah + Kasrah + Kasrah — three rapid, balanced 1-beat pulses.',
        },
      },
      {
        id: 'word_kutiba',
        partsAr: ['كُ', 'تِ', 'بَ'],
        joinedAr: 'كُتِبَ',
        partialHarakatAr: 'كُتب',
        unvowelledAr: 'كتب',
        translit: {bn: 'কু-তি-বা', en: 'Ku-ti-ba'},
        meaning: {bn: 'লিখিত / ফরজ করা হয়েছে (সূরা বাকারা ২:১৮৩)', en: 'It has been prescribed (Surah Al-Baqarah 2:183)'},
        scientificNote: {
          bn: 'লক্ষ্য করুন: একই ক-ত-ব হরফে শুধু হরকত বদলে كَتَبَ (সে লিখেছে) থেকে كُتِبَ (ফরজ করা হয়েছে) হয়ে গেল!',
          en: 'Changing only the 3 short vowels shifts active كَتَبَ (he wrote) to passive كُتِبَ (it was prescribed)!',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'كُتِبَ (কু-তি-বা) শব্দে প্রথম হরফ كُ এর উপর কোন হরকত ও কয় মাত্রা রয়েছে?',
        en: 'In كُتِبَ (Ku-ti-ba), which vowel mark sits on كُ and for how many beats?',
      },
      audioCueAr: 'كُتِبَ',
      options: [
        {id: 'dammah1', labelAr: 'كُ', label: {bn: 'পেশ / দাম্মাহ — ১ মাত্রা', en: 'Dammah (u) — 1 crisp beat'}, isCorrect: true},
        {id: 'kasrah1', labelAr: 'كِ', label: {bn: 'যের / কাসরাহ — ১ মাত্রা', en: 'Kasrah (i) — 1 beat'}, isCorrect: false},
        {id: 'madd2', labelAr: 'كُو', label: {bn: 'দীর্ঘ পেশ — ৩ মাত্রা টান', en: 'Long Madd — 3 beats'}, isCorrect: false},
      ],
      explanation: {
        bn: 'সঠিক! ঠোঁট গোল করে كُ (কু) ঠিক ১ মাত্রায় উচ্চারিত হয়—কোনো বাড়তি টান ছাড়া।',
        en: 'Exact! Dammah rounds the lips for a clean 1-beat "Ku" without elongation.',
      },
    },
    deepLab: {navTab: 'alphabet', alphabetSubTab: 'harakat'},
    deepLabLabel: {bn: 'হরকত ও তাল মিটার ল্যাবে যান', en: 'Open Harakat & Beat Meter Lab'},
  },
  {
    id: 'q_step_04_syllables',
    stepNumber: 4,
    track: 'zero_to_quran',
    title: {
      bn: '০৪. সুকূন (জযম), তানবীন ও তাশদীদ সংযোগ',
      en: '04. Sukoon, Tanween & Shaddah Syllable Locking',
    },
    subtitle: {
      bn: 'দুই হরফকে এক শ্বাসে বাঁধা (সুকূন), নাকের ধ্বনি তানবীন এবং দ্বিত্ব উচ্চারণ (তাশদীদ) আয়ত্ত করা',
      en: 'Lock consonant clusters effortlessly with Sukoon, nasal Tanween endings, and Shaddah doubling',
    },
    estimatedMinutes: 8,
    xpReward: 30,
    sciencePillar: {
      bn: 'সিলেবল বাউন্ডারি চাঙ্কিং (Closed CVC Syllable & Gemination)',
      en: 'Closed CVC Syllable Chunking & Consonant Gemination',
    },
    whyItWorks: {
      bn: 'সুকূনওয়ালা হরফ একা উচ্চারিত হতে পারে না—সে সবসময় ডানের হরকতওয়ালা হরফের সাথে চুম্বকের মতো লেগে ১টি সিলেবল (যেমন مِ + نْ = مِنْ) তৈরি করে। আর তাশদীদ মানেই (সুকূন + হরকত) একসাথে!',
      en: 'A Sukoon letter has zero vowel of its own — it snaps magnetically onto the preceding vowel (مِ + نْ = مِنْ). Shaddah simply equals Sukoon + Vowel combined!',
    },
    mistakeGuard: {
      bn: 'সুকূন পড়ার সময় ঝাঁকুনি দিয়ে বাড়তি স্বর যোগ করবেন না (যেমন الْحَمْدُ কে "আল-হামাদু" না পড়ে "আল-হামদু" পড়ুন)।',
      en: 'Avoid inserting a phantom vowel on Sukoon (read الْحَمْدُ cleanly as Al-ḥam-du, never Al-ḥa-ma-du).',
    },
    ageGuidance: {
      kids: {
        bn: 'সুকূন (ـْ) হলো "থামো চুম্বক"—ডানের হরফ এসে তাকে জড়িয়ে ধরে (أَبْ = আব্)! আর তাশদীদ (ـّ) হলো খরগোশের মতো একটু থেমে দ্বিগুণ জোর (رَبِّ = রব্বি)!',
        en: 'Sukoon (ـْ) is a magnet that hugs the letter before it (مِنْ = min), while Shaddah (ـّ) holds the sound firmly twice (رَبِّ = Rabbi)!',
      },
      standard: {
        bn: 'তাশদীদকে মনে মনে ২ ভাগে দেখুন: رَبِّ = رَبْ + بِ (প্রথমে সুকূনে থামুন, তারপর হরকতে ছাড়ুন)। আর দুই যবর/যের/পেশ (তানবীন) মানেই শেষে একটি লুকানো نْ ধ্বনি।',
        en: 'Decode Shaddah mathematically as Consonant + Sukoon + Vowel (رَبِّ = رَبْ + بِ), and Tanween as a short vowel + final alveolar نْ.',
      },
      senior: {
        bn: 'সুকূন দেখলে আগের অক্ষরের সাথে মিলিয়ে একবারে পড়ুন (হাম-দু)। আর তাশদীদ দেখলে অক্ষরটিতে একটু জোর দিয়ে ধরে তারপর ছাড়ুন (রব-বি)।',
        en: 'When you see Sukoon, join it smoothly to the letter before it in one breath (Ḥam-du). On Shaddah, pause gently on the letter for firmness (Rab-bi).',
      },
    },
    interactiveCards: [
      {
        id: 'sukoon_alhamdu',
        partsAr: ['اَلْ', 'حَمْ', 'دُ'],
        joinedAr: 'اَلْحَمْدُ',
        partialHarakatAr: 'الحَمْدُ',
        unvowelledAr: 'الحمد',
        translit: {bn: 'আল্ + হাম্ + দু = আলহামদু', en: 'Al + ḥam + du = Alḥamdu'},
        meaning: {bn: 'সকল প্রশংসা (২টি সুকূন সিলেবল লক)', en: 'All praise (2 closed CVC Sukoon syllables)'},
        scientificNote: {
          bn: 'পুরো শব্দটি মাত্র ৩টি শ্বাস-এককে ভাগ হয়ে যায়: اَلْ (আল্) · حَمْ (হাম্) · دُ (দু)।',
          en: 'Syllable chunking turns a 5-letter word into 3 effortless rhythmic beats.',
        },
      },
      {
        id: 'tanween_ahadun',
        partsAr: ['أَ', 'حَ', 'دٌ'],
        joinedAr: 'أَحَدٌ',
        partialHarakatAr: 'أحدٌ',
        unvowelledAr: 'احد',
        translit: {bn: 'আ-হা-দুন (দাম্মাতাইন)', en: 'A-ḥa-dun (Tanween -un)'},
        meaning: {bn: 'এক ও অদ্বিতীয় (সূরা ইখলাস ১১২:১)', en: 'One and Unique (Surah Al-Ikhlas 112:1)'},
        scientificNote: {
          bn: 'دٌ = دُ + نْ (পেশের সাথে স্পষ্ট "ন" ধ্বনি মিলে "দুন")।',
          en: 'Double Dammah (ـٌ) acoustically equals short /u/ + crisp /n/ ("dun").',
        },
      },
      {
        id: 'shaddah_rabbi',
        partsAr: ['رَبْ', 'بِ'],
        joinedAr: 'رَبِّ',
        partialHarakatAr: 'ربّ',
        unvowelledAr: 'رب',
        translit: {bn: 'রব্ + বি = রব্বি (তাশদীদ)', en: 'Rab + bi = Rabbi (Shaddah)'},
        meaning: {bn: 'প্রতিপালক (সূরা ফাতিহা ১:২)', en: 'Lord / Sustainer (Surah Al-Fatihah 1:2)'},
        scientificNote: {
          bn: 'তাশদীদ (ـّ) বসালে ঠোঁট ب এর মাখরাজে সামান্য ধরে রেখে তারপর যের দিয়ে খুলতে হয়।',
          en: 'Geminated بّ holds bilabial closure briefly before releasing into Kasrah.',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'তাশদীদযুক্ত শব্দ رَبِّ (রব্বি)-এর ভেতরে প্রকৃতপক্ষে কয়টি "বা" (ب) লুকিয়ে আছে?',
        en: 'Inside the Shaddah word رَبِّ (Rabbi), how is the doubled بّ structured?',
      },
      audioCueAr: 'رَبِّ',
      options: [
        {id: 'two_ba', labelAr: 'رَبْ + بِ', label: {bn: '২টি বা — প্রথমটি সুকূন (بْ) ও দ্বিতীয়টি যের (بِ)', en: 'Two بs: first with Sukoon (بْ) + second with Kasrah (بِ)'}, isCorrect: true},
        {id: 'madd_ba', labelAr: 'رَابِي', label: {bn: '১টি বা কিন্তু ৪ আলিফ লম্বা টান', en: 'One ب stretched for 4 beats'}, isCorrect: false},
        {id: 'silent_ba', labelAr: 'رَبْ', label: {bn: 'বা হরফটি উহ্য থাকে', en: 'The ب becomes silent'}, isCorrect: false},
      ],
      explanation: {
        bn: 'একদম সঠিক! তাশদীদ মানেই প্রথম হরফে সুকূন এবং দ্বিতীয় হরফে হরকত (رَبْ + بِ = رَبِّ)।',
        en: 'Spot on! Every Shaddah locks a Sukoon consonant directly into its vowelled twin (رَبْ + بِ = رَبِّ).',
      },
    },
    deepLab: {navTab: 'alphabet', alphabetSubTab: 'harakat'},
    deepLabLabel: {bn: 'সুকূন ও তাশদীদ অডিও অনুশীলন করুন', en: 'Practice Sukoon & Shaddah Examples'},
  },
  {
    id: 'q_step_05_madd_qalqalah',
    stepNumber: 5,
    track: 'zero_to_quran',
    title: {
      bn: '০৫. মাদ্দ (দীর্ঘ স্বর) ও ক্বালক্বালাহ প্রতিধ্বনি',
      en: '05. Madd Elongation & Qalqalah Echo Physics',
    },
    subtitle: {
      bn: 'আলিফ-ওয়াও-ইয়া দিয়ে ২ ও ৪ মাত্রার টান এবং ৫টি ক্বালক্বালাহ হরফের (قطب جد) প্রাণবন্ত প্রতিধ্বনি',
      en: 'Calibrate 2-to-4 beat Madd vowel waves and crisp acoustic bounce on the 5 Qalqalah letters (قطب جد)',
    },
    estimatedMinutes: 7,
    xpReward: 30,
    sciencePillar: {
      bn: 'ভাওয়েল ডিউরেশন রেশিও (1:2:4 Ratio) ও প্লোসিভ রিলিজ অ্যাকোস্টিকস',
      en: 'Proportional Vowel Duration (1:2:4) & Plosive Release Acoustics',
    },
    whyItWorks: {
      bn: 'যবরের পর খালি আলিফ (ـَا), যেরের পর সুকূন ইয়া (ـِيْ) এবং পেশের পর সুকূন ওয়াও (ـُوْ) এলে কণ্ঠনালী থেকে ঠিক ২ মাত্রা টান হয়। আর قطب جد হরফে সুকূন হলে বাতাস আটকে মৃদু প্রতিধ্বনিতে ছাড়ে।',
      en: 'Pairing /a/+/ā/, /i/+/ī/, and /u/+/ū/ creates natural 2-beat resonance, while releasing trapped air on قطب جد produces effortless Qalqalah clarity.',
    },
    mistakeGuard: {
      bn: 'ক্বালক্বালাহ করার সময় পূর্ণ যবর বা যের যোগ করে ফেলবেন না—এটি কেবল মাখরাজ থেকে মৃদু বাউন্স বা প্রতিধ্বনি।',
      en: 'Keep Qalqalah a crisp elastic release — never turn قُلْ أَعُوذُ بِرَبِّ الْفَلَقْ into a full extra Fathah vowel.',
    },
    ageGuidance: {
      kids: {
        bn: 'মাদ্দ হলো ঢেউয়ের মতো ২ তালি সমান লম্বা সুর (بَا = বাআ), আর ক্বালক্বালাহর ৫ বন্ধু (ق ط ب ج د) সুকূন পেলে বলের মতো বাউন্স করে (أَحَدْ)!',
        en: 'Madd surfs smoothly for 2 claps (قَالَ = Qā-la), and the 5 bouncy letters (ق ط ب ج د) pop gently like a rubber ball when resting!',
      },
      standard: {
        bn: 'মাদ্দ ত্ববায়ী (২ মাত্রা: قَالَ, قِيلَ, يَقُولُ) এবং ঢেউ চিহ্নযুক্ত মাদ্দ মুত্তাসিল/মুনফাসিল (৪ মাত্রা) তুলনা করুন; قطب جد সূত্র দিয়ে ৫টি ক্বালক্বালাহ হরফ মনে রাখুন।',
        en: 'Contrast 2-beat Natural Madd (قَالَ / قِيلَ / يَقُولُ) against 4-beat wave-marked Madd, and memorize قطب جد for voiced plosive bounce.',
      },
      senior: {
        bn: 'খালি আলিফ, সাকিন ওয়াও বা সাকিন ইয়া দেখলে স্বস্তিতে ২ সেকেন্ডের মতো টেনে পড়ুন। আর অক্ষরের উপর ঢেউ চিহ্ন (آ) দেখলে আরেকটু লম্বা (৪ মাত্রা) টানুন।',
        en: 'Stretch smoothly for 2 calm beats on Alif, Waw, or Ya of Madd, and hold 4 gentle beats whenever you see the overhead wave sign (~).',
      },
    },
    interactiveCards: [
      {
        id: 'madd_three',
        partsAr: ['نُو', 'حِي', 'هَا'],
        joinedAr: 'نُوحِيهَا',
        partialHarakatAr: 'نُوحِيها',
        unvowelledAr: 'نوحيها',
        translit: {bn: 'নূ (২) + হী (২) + হা (২) = নূহীহা', en: 'Nū (2) + ḥī (2) + hā (2) = Nūḥīhā'},
        meaning: {bn: 'এক শব্দেই মাদ্দের ৩টি নিয়ম! (সূরা হুদ ১১:৪৯)', en: 'All 3 Natural Madd vowels in a single Quranic word! (11:49)'},
        scientificNote: {
          bn: 'পেশ+ওয়াও (نُو), যের+ইয়া (حِي), যবর+আলিফ (هَا)—১টি কুরআনিক শব্দেই মাদ্দের পুরো সূত্র সম্পন্ন!',
          en: 'نُوحِيهَا is the classic pedagogical gem containing ū + ī + ā in one word.',
        },
      },
      {
        id: 'qalqalah_falaq',
        partsAr: ['اَلْ', 'فَ', 'لَقْ'],
        joinedAr: 'الْفَلَقْ',
        partialHarakatAr: 'الفَلَقْ',
        unvowelledAr: 'الفلق',
        translit: {bn: 'আল-ফালাক্ব্ (শেষে قْ প্রতিধ্বনি)', en: 'Al-Falaq (crisp Qalqalah bounce on قْ)'},
        meaning: {bn: 'ভোরের আলো (সূরা ফালাক ১১৩:১)', en: 'The Daybreak (Surah Al-Falaq 113:1)'},
        scientificNote: {
          bn: 'قطب جد এর ق শেষে থামায় সুকূন পেয়ে স্পষ্ট প্রতিধ্বনি তৈরি করে।',
          en: 'Stopping on final ق triggers Qalqalah Kubra so the consonant remains audible.',
        },
      },
      {
        id: 'madd_lazim',
        partsAr: ['الرَّحْ', 'مٰ', 'نِ'],
        joinedAr: 'الرَّحْمَٰنِ',
        partialHarakatAr: 'الرّحمٰن',
        unvowelledAr: 'الرحمن',
        translit: {bn: 'আর-রহমানি (খাড়া যবর ২ মাত্রা)', en: 'Ar-Raḥmāni ( Dagger Alif = 2 beats )'},
        meaning: {bn: 'পরম করুণাময় (মীমের উপর খাড়া যবর)', en: 'The Entirely Merciful (Vertical Fathah = 2-beat Madd)'},
        scientificNote: {
          bn: 'ছোট খাড়া যবর (ـٰ) পূর্ণ আলিফের মতোই ঠিক ২ মাত্রা দীর্ঘ হয়।',
          en: 'Vertical Dagger Alif (ـٰ) carries the exact 2-beat duration of a full Alif.',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'কোন কুরআনিক শব্দটিতে মাদ্দের তিনটি রূপই (পেশ+ওয়াও, যের+ইয়া, যবর+আলিফ) একসাথে রয়েছে?',
        en: 'Which famous Quranic word contains all three Natural Madd combinations (ū, ī, ā) together?',
      },
      audioCueAr: 'نُوحِيهَا',
      options: [
        {id: 'noohiha', labelAr: 'نُوحِيهَا', label: {bn: 'নূহীহা (نُو + حِي + هَا)', en: 'Nūḥīhā (نُو + حِي + هَا)'}, isCorrect: true},
        {id: 'maliki', labelAr: 'مَلِكِ', label: {bn: 'মালিকি (সব হ্রস্ব স্বর)', en: 'Maliki (short vowels only)'}, isCorrect: false},
        {id: 'ahad', labelAr: 'أَحَدٌ', label: {bn: 'আহাদুন (তানবীন যুক্ত)', en: 'Aḥadun (short vowels + Tanween)'}, isCorrect: false},
      ],
      explanation: {
        bn: 'মাশাআল্লাহ! نُوحِيهَا শব্দটি মনে রাখলে মাদ্দ ত্ববায়ী-এর ৩টি নিয়ম আর কখনো ভুল হবে না।',
        en: 'Brilliant! Remembering نُوحِيهَا locks all three 2-beat Madd patterns into permanent memory.',
      },
    },
    deepLab: {navTab: 'alphabet', alphabetSubTab: 'voice_quiz'},
    deepLabLabel: {bn: 'ভয়েস কুইজে উচ্চারণ যাচাই করুন', en: 'Test Articulation in Voice Quiz'},
  },
  {
    id: 'q_step_06_pareto_vocab',
    stepNumber: 6,
    track: 'zero_to_quran',
    title: {
      bn: '০৬. কুরআনের ৫০% শব্দের প্যারেটো চাবিকাঠি',
      en: '06. Pareto High-Frequency Quranic Core Words',
    },
    subtitle: {
      bn: 'কুরআনের ৭৭,৪৩০টি শব্দের মধ্যে সবচেয়ে বেশি বার আসা মূল শব্দগুলো শিখে তিলাওয়াতের সাথে সাথে অর্থ অনুধাবন',
      en: 'Unlock nearly 50% of every Quran page by mastering the highest-frequency particles, nouns & roots',
    },
    estimatedMinutes: 9,
    xpReward: 35,
    sciencePillar: {
      bn: 'জিপ্ফ-প্যারেটো ফ্রিকোয়েন্সি ল ও স্পেসড রিপিটিশন (Zipf’s Law + SM-2)',
      en: 'Zipf’s Corpus Frequency Law & SM-2 Spaced Repetition',
    },
    whyItWorks: {
      bn: 'কুরআনে মোট শব্দ প্রায় ৭৭,৪৩০টি হলেও উচ্চ-ফ্রিকোয়েন্সির মাত্র ৫০–১০০টি শব্দ ও অব্যয় (مِنْ, فِي, اللَّه, رَبّ, قَالَ, عَلِمَ, رَحْمَة) বারবার ঘুরেফিরে প্রায় অর্ধেক কুরআন জুড়ে আসে!',
      en: 'Corpus linguistics proves that a compact core of high-frequency Quranic words recurs thousands of times across every Surah.',
    },
    mistakeGuard: {
      bn: 'শব্দ মুখস্থ করার সময় বিচ্ছিন্ন তালিকা না পড়ে ছোট আয়াতের প্রেক্ষাপটে (Context) ও ৩-অক্ষরের মূলশব্দসহ শিখুন।',
      en: 'Never memorize isolated word lists without context — anchor each high-frequency word inside a real Ayah phrase.',
    },
    ageGuidance: {
      kids: {
        bn: 'জানো কি? اللَّه (আল্লাহ), رَبّ (রব), رَحْمَة (দয়া), عِلْم (জ্ঞান)—এই কয়েকটি প্রিয় শব্দ চিনলেই তুমি কুরআনের পাতায় বারবার চেনা শব্দ খুঁজে পাবে!',
        en: 'Spot treasure words like اللَّه (Allah), رَبّ (Lord), and رَحْمَة (Mercy) — you will recognize them on every single page of the Quran!',
      },
      standard: {
        bn: 'অব্যয় (مِنْ = থেকে, فِي = মধ্যে, عَلَى = উপরে, إِنَّ = নিশ্চয়ই) এবং উচ্চ-ফ্রিকোয়েন্সি মূলশব্দ (ع-ل-م = ৮৫৪ বার, ر-ح-م = ৩৩৯ বার) SRS কার্ডে আয়ত্ত করুন।',
        en: 'Combine function particles (مِنْ, فِي, عَلَى, إِنَّ) with high-yield roots (ع-ل-م 854x, ر-ح-م 339x) using SM-2 spaced review.',
      },
      senior: {
        bn: 'নামাজের পরিচিত সূরাগুলোর শব্দ থেকেই শুরু করুন—যেমন আলহামদু (প্রশংসা), রব্বিল আলামীন (জগতসমূহের প্রতিপালক), ইয়্যাকা না’বুদু (আমরা আপনারই ইবাদত করি)।',
        en: 'Start directly with words you already recite in daily Salah — Alḥamdu (praise), Rabbil-‘Ālamīn (Lord of the worlds), Na‘budu (we worship).',
      },
    },
    interactiveCards: [
      {
        id: 'freq_particles',
        partsAr: ['مِنْ', 'فِي', 'عَلَىٰ', 'إِنَّ'],
        joinedAr: 'مِنْ · فِي · عَلَىٰ · إِنَّ',
        partialHarakatAr: 'مِن · في · على · إنّ',
        unvowelledAr: 'من · في · على · ان',
        translit: {bn: 'মিন (থেকে) · ফী (মধ্যে) · আলা (উপরে) · ইন্না (নিশ্চয়ই)', en: 'Min (from) · Fī (in) · ‘Alā (upon) · Inna (indeed)'},
        meaning: {bn: 'এই ৪টি ছোট শব্দ কুরআনে ৭,০০০+ বার এসেছে!', en: 'These 4 core particles appear over 7,000+ times in the Quran!'},
        scientificNote: {
          bn: 'শুধু এই ৪টি সংযোগকারী অব্যয় চিনলেই প্রতি পৃষ্ঠার প্রায় ১০% শব্দ তাৎক্ষণিক চেনা যায়।',
          en: 'Recognizing core particles gives your brain instant structural landmarks in every Ayah.',
        },
      },
      {
        id: 'freq_allah_rabb',
        partsAr: ['اللَّهِ', 'رَبِّ', 'الْعَالَمِينَ'],
        joinedAr: 'لِلَّهِ رَبِّ الْعَالَمِينَ',
        partialHarakatAr: 'لله ربّ العالمين',
        unvowelledAr: 'لله رب العالمين',
        translit: {bn: 'লিল্লাহি রব্বিল আলামীন', en: 'Lillāhi Rabbil-‘Ālamīn'},
        meaning: {bn: 'আল্লাহর জন্য, যিনি সকল জগতের প্রতিপালক (اللَّه ২,৬৯৯ বার · رَبّ ৯৭৫ বার)', en: 'For Allah (2,699x), Lord (975x) of all worlds'},
        scientificNote: {
          bn: 'اللَّه ও رَبّ মিলে কুরআনে ৩,৬৭০+ বার এসেছে—নামাজের প্রথম সূরাতেই এর প্রয়োগ!',
          en: 'Over 3,670 Quranic occurrences anchored in a single line of Surah Al-Fatihah.',
        },
      },
      {
        id: 'freq_ilm_rahma',
        partsAr: ['رَبِّ', 'زِدْنِي', 'عِلْمًا'],
        joinedAr: 'رَبِّ زِدْنِي عِلْمًا',
        partialHarakatAr: 'ربّ زدني علما',
        unvowelledAr: 'رب زدني علما',
        translit: {bn: 'রব্বি যিদনী ইলমা', en: 'Rabbi zidnī ‘ilmā'},
        meaning: {bn: 'হে আমার রব, আমার জ্ঞান বৃদ্ধি করে দিন (সূরা ত্বা-হা ২০:১১৪ · মূল ع-ل-م ৮৫৪ বার)', en: 'My Lord, increase me in knowledge (20:114 · Root ع-ل-م 854x)'},
        scientificNote: {
          bn: 'ع-ل-م মূলশব্দ চিনলে عَلِيم (সর্বজ্ঞ), يَعْلَمُونَ (তারা জানে), عَالَمِينَ—সব একসাথে পরিষ্কার!',
          en: 'Mastering ع-ل-م unlocks ‘Alīm, Ya‘lamūn, and ‘Ālamīn across 854 verses.',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'رَبِّ زِدْنِي عِلْمًا দোয়াটিতে عِلْمًا (ইলমা) শব্দের অর্থ কী?',
        en: 'In the Quranic supplication رَبِّ زِدْنِي عِلْمًا, what does عِلْمًا mean?',
      },
      audioCueAr: 'رَبِّ زِدْنِي عِلْمًا',
      options: [
        {id: 'knowledge', labelAr: 'عِلْمًا', label: {bn: 'জ্ঞান (মূলশব্দ ع-ل-م)', en: 'Knowledge (Root ع-ل-م)'}, isCorrect: true},
        {id: 'travel', labelAr: 'سَفَرًا', label: {bn: 'ভ্রমণ বা সফর', en: 'Journey / Travel'}, isCorrect: false},
        {id: 'house', labelAr: 'بَيْتًا', label: {bn: 'ঘর বা আবাস', en: 'House / Dwelling'}, isCorrect: false},
      ],
      explanation: {
        bn: 'সঠিক! عِلْم অর্থ জ্ঞান, এবং এর মূলশব্দ ع-ل-م পবিত্র কুরআনে ৮৫৪ বার এসেছে।',
        en: 'Correct! عِلْم means knowledge, from the root ع-ل-م which appears 854 times in the Quran.',
      },
    },
    deepLab: {navTab: 'quran', quranSection: 'srs'},
    deepLabLabel: {bn: 'কুরআনিক SRS ফ্ল্যাশকার্ড রিভিউ করুন', en: 'Practice High-Frequency SRS Deck'},
  },
  {
    id: 'q_step_07_tajweed_fluency',
    stepNumber: 7,
    track: 'zero_to_quran',
    title: {
      bn: '০৭. তাজবীদ, ওয়াকফ ও পূর্ণ সূরা তিলাওয়াত',
      en: '07. Tajweed Rules, Waqf Breath-Stops & Fluent Surah Reading',
    },
    subtitle: {
      bn: 'গুন্নাহ, ইখফা, আয়াতের শেষে থামার নিয়ম (ওয়াকফ) এবং শব্দে-শব্দে অর্থসহ বিশুদ্ধ কুরআন তিলাওয়াত',
      en: 'Integrate Ghunnah, Ikhfa, end-of-verse Waqf breath stops, and word-by-word Surah recitation with AI feedback',
    },
    estimatedMinutes: 10,
    xpReward: 40,
    sciencePillar: {
      bn: 'প্রসোডিক ফ্লুয়েন্সি ইন্টিগ্রেশন ও এআই উচ্চারণ ফিডব্যাক লুপ',
      en: 'Prosodic Recitation Integration & Real-Time Acoustic Feedback Loop',
    },
    whyItWorks: {
      bn: 'হরফ, যুক্তাক্ষর, হরকত, সুকূন ও মাদ্দ শেখার পর গুন্নাহ (إِنَّ/مَنْ) এবং আয়াতের শেষে শেষ হরকত থামিয়ে সুকূন করার (ওয়াকফ) নিয়ম যোগ করলেই আপনি পূর্ণাঙ্গ কুরআন তিলাওয়াতে সক্ষম হন!',
      en: 'Combining prosodic nasalization (Ghunnah) and end-of-ayah Sukoon stopping (Waqf) with word-by-word audio completes the 0-to-Quran bridge.',
    },
    mistakeGuard: {
      bn: 'আয়াতের শেষে থামার সময় শেষ হরফের যবর/যের/পেশ উচ্চারণ না করে সুকূন করে থামুন (যেমন الرَّحِيمِ থামলে হবে الرَّحِيمْ)।',
      en: 'When stopping at the end of an Ayah (Waqf), drop the final short vowel into a calm Sukoon (الرَّحِيمِ becomes الرَّحِيمْ).',
    },
    ageGuidance: {
      kids: {
        bn: 'নূন ও মীমের মাথায় তাশদীদ (إِنَّ, عَمَّ) দেখলে নাক থেকে ২ তালি গুনগুন সুর করবে (গুন্নাহ)! চলো এবার পূর্ণ সূরা ফাতিহা ও ইখলাস শব্দে-শব্দে পড়ি।',
        en: 'Whenever Noon or Meem wears a Shaddah crown (إِنَّ), hum softly through your nose for 2 beats! Now read full Surahs word by word.',
      },
      standard: {
        bn: 'গুন্নাহ (نّ / مّ — ২ আলিফ নাসিক্য), মাদ্দ আরিদ লিস-সুকূন ও ওয়াকফের নিয়ম প্রয়োগ করে সূরা আল-ফাতিহা, ইখলাস ও আসর তিলাওয়াত করে এআই মাইক্রোফোনে যাচাই করুন।',
        en: 'Apply 2-beat Ghunnah (نّ/مّ), Waqf pausal Sukoon, and Tajweed color cues across Surah Al-Fatihah, Al-Ikhlas & Al-Asr with live mic scoring.',
      },
      senior: {
        bn: 'প্রতিটি আয়াতের শেষে স্বস্তিতে শ্বাস নিন এবং শেষ অক্ষরটিকে সাকিন করে থামুন। শব্দে-শব্দে ট্যাপ করে ধীর গতিতে শুনে অর্থসহ তিলাওয়াত উপভোগ করুন।',
        en: 'Pause comfortably at every Ayah marker, resting the final letter in Sukoon. Tap word-by-word at 0.7x speed to savor both sound and meaning.',
      },
    },
    interactiveCards: [
      {
        id: 'ghunnah_inna',
        partsAr: ['إِنَّا', 'أَعْطَيْنَاكَ', 'الْكَوْثَرَ'],
        joinedAr: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
        partialHarakatAr: 'إنّا أعطيناك الكوثر',
        unvowelledAr: 'انا اعطيناك الكوثر',
        translit: {bn: 'ইন্না আ’ত্বাইনাকাল কাওছার (নূন তাশদীদে ২ মাত্রা গুন্নাহ)', en: 'Innā a‘ṭaynākal-Kawthar (2-beat Ghunnah on نّ)'},
        meaning: {bn: 'নিশ্চয়ই আমি আপনাকে কাওসার দান করেছি (সূরা কাওসার ১০৮:১)', en: 'Indeed, We have granted you Al-Kawthar (108:1)'},
        scientificNote: {
          bn: 'إِنَّا তে نّ এ ২ মাত্রা নাসিক্য গুন্নাহ + আলিফে মাদ্দ + শেষে থামলে الْكَوْثَرْ।',
          en: 'Combines 2-beat nasal Ghunnah on نّ + Madd + calm Waqf rest on الْكَوْثَرْ.',
        },
      },
      {
        id: 'waqf_fatihah',
        partsAr: ['الرَّحْمَٰنِ', 'الرَّحِيمِ'],
        joinedAr: 'الرَّحْمَٰنِ الرَّحِيمْ ۝',
        partialHarakatAr: 'الرحمٰن الرحيم ۝',
        unvowelledAr: 'الرحمن الرحيم',
        translit: {bn: 'আর-রহমানির রহীম্ (ওয়াকফে শেষ মীম সাকিন)', en: 'Ar-Raḥmānir-Raḥīm (Waqf rests final م into Sukoon)'},
        meaning: {bn: 'পরম করুণাময়, অসীম দয়ালু (সূরা ফাতিহা ১:৩)', en: 'The Entirely Merciful, the Especially Merciful (1:3)'},
        scientificNote: {
          bn: 'লিখিত রূপে الرَّحِيمِ (যের) থাকলেও আয়াত শেষে থামার কারণে الرَّحِيمْ পড়া হয়।',
          en: 'Pausal Waqf converts written الرَّحِيمِ into resonant elongated الرَّحِيمْ.',
        },
      },
      {
        id: 'ikhlas_full',
        partsAr: ['قُلْ', 'هُوَ', 'اللَّهُ', 'أَحَدٌ'],
        joinedAr: 'قُلْ هُوَ اللَّهُ أَحَدْ ۝',
        partialHarakatAr: 'قل هو الله أحد ۝',
        unvowelledAr: 'قل هو الله احد',
        translit: {bn: 'ক্বুল হুওয়াল্লাহু আহাদ্ (শেষে دْ ক্বালক্বালাহ)', en: 'Qul Huwallāhu Aḥad (Waqf + Qalqalah bounce on دْ)'},
        meaning: {bn: 'বলুন, তিনি আল্লাহ—এক ও অদ্বিতীয় (সূরা ইখলাস ১১২:১)', en: 'Say, He is Allah, the One (112:1)'},
        scientificNote: {
          bn: 'ওয়াকফ করার ফলে أَحَدٌ এর তানবীন থেমে أَحَدْ হয় এবং د এ স্পষ্ট ক্বালক্বালাহ প্রতিধ্বনি বাজে!',
          en: 'Stopping on أَحَدٌ drops Tanween into Sukoon أَحَدْ, activating Qalqalah Kubra on د!',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'قُلْ هُوَ اللَّهُ أَحَدٌ আয়াতের শেষে থামলে (ওয়াকফ করলে) কীভাবে উচ্চারণ করতে হয়?',
        en: 'When stopping (Waqf) at the end of قُلْ هُوَ اللَّهُ أَحَدٌ, how is the final word pronounced?',
      },
      audioCueAr: 'قُلْ هُوَ اللَّهُ أَحَدْ',
      options: [
        {id: 'waqf_qalqalah', labelAr: 'أَحَدْ', label: {bn: 'আহাদ্ — শেষ د সাকিন হয়ে ক্বালক্বালাহ হবে', en: 'Aḥad — final د rests in Sukoon with Qalqalah bounce'}, isCorrect: true},
        {id: 'full_tanween', labelAr: 'أَحَدُنْ', label: {bn: 'আহাদুন — তানবীন বহাল রেখে থামতে হবে', en: 'Aḥadun — keeping full Tanween while stopping'}, isCorrect: false},
        {id: 'long_aa', labelAr: 'أَحَدَا', label: {bn: 'আহাদা — ২ আলিফ টেনে থামতে হবে', en: 'Aḥadā — adding a 2-beat Alif'}, isCorrect: false},
      ],
      explanation: {
        bn: 'অসাধারণ! দুই পেশ (ـٌ) বা দুই যেরে ওয়াকফ করলে তা সুকূন (أَحَدْ) হয়ে যায় এবং د ক্বালক্বালাহ হরফ হওয়ায় মৃদু প্রতিধ্বনি হয়।',
        en: 'Excellent! Stopping on Dammah Tanween converts it to Sukoon (أَحَدْ), triggering crisp Qalqalah on د.',
      },
    },
    deepLab: {navTab: 'quran', quranSection: 'surah'},
    deepLabLabel: {bn: 'শব্দে-শব্দে কুরআন ও তাজবীদ ল্যাব খুলুন', en: 'Open Word-by-Word Surah & Tajweed Lab'},
  },
];

export const ZERO_TO_ARABIC_STAGES: ScientificStage[] = [
  {
    id: 'ar_step_01_comprehensible',
    stepNumber: 1,
    track: 'arabic_language',
    title: {
      bn: '০১. বোধগম্য শ্রবণ ও প্রথম ৫০টি জীবন্ত শব্দ (A1)',
      en: '01. Comprehensible Input & Core Everyday Lexicon (A1)',
    },
    subtitle: {
      bn: 'অনুবাদের বোঝা ছাড়াই সর্বনাম, ইঙ্গিতবাচক শব্দ ও প্রতিদিনের সবচেয়ে প্রয়োজনীয় আরবি শব্দ শুনে ও বলে শুরু',
      en: 'Acquire pronouns, pointers, and high-utility daily Arabic words naturally through direct sound-meaning association',
    },
    estimatedMinutes: 6,
    xpReward: 25,
    sciencePillar: {
      bn: 'ক্র্যাশেনের কমপ্রিহেনসিবল ইনপুট (Krashen i+1 Acquisition)',
      en: 'Krashen Comprehensible Input (i+1) & Direct Lexical Mapping',
    },
    whyItWorks: {
      bn: 'শিশুরা যেভাবে মাতৃভাষা শেখে—প্রথমে أَنَا (আমি), أَنْتَ (তুমি), هٰذَا (এটি) ও দৈনন্দিন বস্তু সরাসরি শব্দের সাথে যুক্ত করলে মস্তিষ্কে বাংলা অনুবাদের দেরি ছাড়াই আরবি ভাবনা তৈরি হয়।',
      en: 'Mapping core pronouns (أَنَا, أَنْتَ) and demonstratives (هٰذَا, هٰذِهِ) directly to concepts builds instant speaking reflexes without mental translation lag.',
    },
    mistakeGuard: {
      bn: 'পুরুষবাচক (أَنْتَ / هٰذَا) এবং স্ত্রীবাচক (أَنْتِ / هٰذِهِ)-এর ছোট হরকত পার্থক্য শুরু থেকেই খেয়াল রাখুন।',
      en: 'Notice the crisp vowel shift between masculine أَنْتَ (anta) and feminine أَنْتِ (anti) right from Day 1.',
    },
    ageGuidance: {
      kids: {
        bn: 'নিজের দিকে হাত রেখে বলো "আনা" (أَنَا = আমি), আর সামনের জিনিস দেখিয়ে বলো "হাযা" (هٰذَا = এটি)! খেলার ছলে প্রথম শব্দগুলো শুনে বলো।',
        en: 'Point to yourself and say Anā (أَنَا = I), point to a book and say Hādhā kitāb (هٰذَا كِتَابٌ)! Learn by pointing and speaking.',
      },
      standard: {
        bn: 'সর্বনাম (أَنَا, نَحْنُ, أَنْتَ, أَنْتِ, هُوَ, هِيَ) এবং পুংলিঙ্গ-স্ত্রীলিঙ্গ সংকেত (ـَة গোল তা) একসাথে আয়ত্ত করলে শত শত বাক্য তাৎক্ষণিক তৈরি করা যায়।',
        en: 'Pair core personal pronouns with masculine/feminine markers (ـَة Tā Marbūṭah) to unlock immediate conversational building blocks.',
      },
      senior: {
        bn: 'প্রতিদিনের সম্ভাষণ ও ছোট ছোট পরিচিত শব্দ—সালাম, শুকরান (ধন্যবাদ), আনা বিখাইর (আমি ভালো আছি) ধীর অডিওতে শুনে মুখে বলুন।',
        en: 'Begin with warm everyday greetings and polite essentials — Shukran, Anā bikhayr — listening calmly at 0.7x speed.',
      },
    },
    interactiveCards: [
      {
        id: 'pronouns_core',
        partsAr: ['أَنَا', 'أَنْتَ', 'أَنْتِ', 'نَحْنُ'],
        joinedAr: 'أَنَا · أَنْتَ · أَنْتِ · نَحْنُ',
        partialHarakatAr: 'أنا · أنتَ · أنتِ · نحن',
        unvowelledAr: 'انا · انت · نحن',
        translit: {bn: 'আনা (আমি) · আনতা (তুমি-পুং) · আনতি (তুমি-স্ত্রী) · নাহনু (আমরা)', en: 'Anā (I) · Anta (you-m) · Anti (you-f) · Naḥnu (we)'},
        meaning: {bn: 'কথোপকথনের ৪টি প্রধান সর্বনাম', en: 'The 4 foundational conversational pronouns'},
        scientificNote: {
          bn: 'লক্ষ্য করুন: أَنْتَ (যবর = পুরুষ) এবং أَنْتِ (যের = নারী)—বানান এক, শুধু শেষের হরকতে পার্থক্য!',
          en: 'Identical consonant skeleton (انت) — a single final vowel distinguishes masculine vs feminine.',
        },
      },
      {
        id: 'pointers_gender',
        partsAr: ['هٰذَا كِتَابٌ', 'هٰذِهِ سَيَّارَةٌ'],
        joinedAr: 'هٰذَا كِتَابٌ · هٰذِهِ سَيَّارَةٌ',
        partialHarakatAr: 'هذا كتاب · هذه سيارة',
        unvowelledAr: 'هذا كتاب · هذه سيارة',
        translit: {bn: 'হাযা কিতাবুন · হাযিহি সাইয়্যারাতুন', en: 'Hādhā kitābun · Hādhihi sayyāratun'},
        meaning: {bn: 'এটি একটি বই (পুং) · এটি একটি গাড়ি (স্ত্রী — শেষে ة)', en: 'This is a book (masc.) · This is a car (fem. ending ة)'},
        scientificNote: {
          bn: 'শব্দের শেষে গোল তা (ـة / ة) থাকলে তা প্রায় সবসময় স্ত্রীবাচক হয় এবং তার সাথে هٰذِهِ বসে।',
          en: 'Words ending in Tā Marbūṭah (ة) are feminine and naturally pair with هٰذِهِ.',
        },
      },
      {
        id: 'polite_essentials',
        partsAr: ['أَنَا', 'بِخَيْرٍ', 'شُكْرًا'],
        joinedAr: 'أَنَا بِخَيْرٍ، شُكْرًا',
        partialHarakatAr: 'أنا بخير، شكرا',
        unvowelledAr: 'انا بخير شكرا',
        translit: {bn: 'আনা বিখাইরিন, শুকরান', en: 'Anā bikhayrin, shukran'},
        meaning: {bn: 'আমি ভালো আছি, ধন্যবাদ', en: 'I am doing well, thank you'},
        scientificNote: {
          bn: 'যেকোনো কুশল বিনিময়ের (كَيْفَ حَالُكَ؟) সবচেয়ে সহজ ও প্রমিত উত্তর।',
          en: 'Your universal, natural response to Kayfa ḥāluka / شلونك across the Arab world.',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'স্ত্রীবাচক শব্দ سَيَّارَةٌ (গাড়ি — শেষে ة আছে)-এর সাথে "এটি" বোঝাতে কোনটি বসবে?',
        en: 'Which word for "This" pairs with the feminine noun سَيَّارَةٌ (ending in ة)?',
      },
      audioCueAr: 'هٰذِهِ سَيَّارَةٌ',
      options: [
        {id: 'hadhihi', labelAr: 'هٰذِهِ', label: {bn: 'হাযিহি (هٰذِهِ — স্ত্রীবাচক)', en: 'Hādhihi (هٰذِهِ — feminine)'}, isCorrect: true},
        {id: 'hadha', labelAr: 'هٰذَا', label: {bn: 'হাযা (هٰذَا — পুরুষবাচক)', en: 'Hādhā (هٰذَا — masculine)'}, isCorrect: false},
        {id: 'nahnu', labelAr: 'نَحْنُ', label: {bn: 'নাহনু (نَحْنُ — আমরা)', en: 'Naḥnu (نَحْنُ — we)'}, isCorrect: false},
      ],
      explanation: {
        bn: 'সঠিক! গোল তা (ة) যুক্ত স্ত্রীবাচক শব্দের আগে সবসময় هٰذِهِ বসে: هٰذِهِ سَيَّارَةٌ।',
        en: 'Exact! Nouns ending in ة take feminine هٰذِهِ: هٰذِهِ سَيَّارَةٌ (This is a car).',
      },
    },
    deepLab: {navTab: 'spoken'},
    deepLabLabel: {bn: 'প্রমিত ও কথ্য অভিবাদন সংলাপ দেখুন', en: 'Practice Greetings in Spoken Lab'},
  },
  {
    id: 'ar_step_02_sentence_lego',
    stepNumber: 2,
    track: 'arabic_language',
    title: {
      bn: '০২. বাক্য গঠনের লেগো ফর্মুলা (নামবাচক ও ক্রিয়াবাচক বাক্য)',
      en: '02. Sentence Lego Formulas (Nominal & Verbal Sentences)',
    },
    subtitle: {
      bn: 'আরবিতে "হয় / am / is / are" ছাড়াই মাত্র ২টি শব্দ পাশাপাশি বসিয়ে পূর্ণাঙ্গ বাক্য তৈরির বৈজ্ঞানিক কৌশল',
      en: 'Build hundreds of complete Arabic sentences immediately using zero-copula Nominal slots and Verb-First action frames',
    },
    estimatedMinutes: 8,
    xpReward: 30,
    sciencePillar: {
      bn: 'জেনারেটিভ স্লট-ফ্রেম ব্যাকরণ (Syntactic Construction Grammar)',
      en: 'Syntactic Slot-Frame Construction Grammar',
    },
    whyItWorks: {
      bn: 'ইংরেজিতে "The house is big" বলতে আলাদা "is" লাগে, কিন্তু আরবিতে নির্দিষ্ট শব্দ (الْبَيْتُ = ঘরটি) + অনির্দিষ্ট খবর (كَبِيرٌ = বড়) বসালেই পূর্ণ বাক্য হয়ে যায়! এই ১টি সূত্রে হাজারো বাক্য তৈরি সম্ভব।',
      en: 'Arabic requires zero present-tense "is/am/are" — placing a Definite Subject (الـ) beside an Indefinite Predicate (-un) automatically creates a complete sentence!',
    },
    mistakeGuard: {
      bn: 'الْبَيْتُ الْكَبِيرُ (বড় ঘরটি — দুটোতেই الـ থাকলে বাক্যাংশ) আর الْبَيْتُ كَبِيرٌ (ঘরটি হয় বড় — পূর্ণ বাক্য) এক করে ফেলবেন না।',
      en: 'Notice the magic of الـ: الْبَيْتُ كَبِيرٌ means "The house is big" (full sentence), whereas الْبَيْتُ الْكَبِيرُ means "the big house" (phrase).',
    },
    ageGuidance: {
      kids: {
        bn: 'দুটি লেগো ব্লক জোড়া দাও: الْقَمَرُ (চাঁদটি) + جَمِيلٌ (সুন্দর) = চাঁদটি সুন্দর! মাঝখানে আর কোনো বাড়তি শব্দই লাগবে না!',
        en: 'Snap 2 Lego blocks together: الْقَمَرُ (The moon) + جَمِيلٌ (beautiful) = "The moon is beautiful!"',
      },
      standard: {
        bn: 'নামবাচক বাক্য (الجملة الاسمية: المبتدأ + الخبر) এবং ক্রিয়াবাচক বাক্য (الجملة الفعلية: الفعل + الفاعل, যেমন يَقْرَأُ زَيْدٌ) পাশাপাশি তুলনা করে নিজে বাক্য তৈরি করুন।',
        en: 'Contrast Definite+Indefinite Nominal sentences (الْعِلْمُ نُورٌ) with Verb-Subject Verbal frames (يَقْرَأُ الطَّالِبُ الْقُرْآنَ).',
      },
      senior: {
        bn: 'বাংলা ভাষার মতোই আরবিও খুব সহজ! বাংলায় যেমন আমরা বলি "পানি ঠান্ডা" (হয় বলি না), আরবিতেও ঠিক তেমনই—الْمَاءُ بَارِدٌ (আল-মাউ বারিদুন = পানি ঠান্ডা)!',
        en: 'Just like Bangla ("পানি ঠান্ডা"), Arabic needs no extra "is" word — الْمَاءُ بَارِدٌ means "The water is cold" directly!',
      },
    },
    interactiveCards: [
      {
        id: 'nominal_formula',
        partsAr: ['الْمَاءُ', 'بَارِدٌ'],
        joinedAr: 'الْمَاءُ بَارِدٌ',
        partialHarakatAr: 'الماءُ باردٌ',
        unvowelledAr: 'الماء بارد',
        translit: {bn: 'আল-মাউ বারিদুন', en: 'Al-mā’u bāridun'},
        meaning: {bn: 'পানিটি ঠান্ডা (বাংলা ও আরবির গঠন হুবহু এক!)', en: 'The water [is] cold (Definite الـ + Indefinite ـٌ)'},
        scientificNote: {
          bn: 'বাংলার সাথে আরবির চমৎকার মিল: "পানি ঠান্ডা" = الْمَاءُ بَارِدٌ—কোনো "is" প্রয়োজন নেই!',
          en: 'Bangla speakers have a natural cognitive advantage here because Bangla is also zero-copula!',
        },
      },
      {
        id: 'nominal_ilm',
        partsAr: ['الْعِلْمُ', 'نُورٌ'],
        joinedAr: 'الْعِلْمُ نُورٌ',
        partialHarakatAr: 'العلمُ نورٌ',
        unvowelledAr: 'العلم نور',
        translit: {bn: 'আল-ইলমু নূরুন', en: 'Al-‘ilmu nūrun'},
        meaning: {bn: 'জ্ঞানই আলো (উদ্দেশ্য + বিধেয়)', en: 'Knowledge [is] light (Mubtada’ + Khabar)'},
        scientificNote: {
          bn: 'প্রথম শব্দে الـ (নির্দিষ্ট) এবং দ্বিতীয় শব্দে তানবীন ـٌ (নূরুন) মিলেই পূর্ণাঙ্গ অর্থ দেয়।',
          en: 'Definite prefix الـ on word 1 + Tanween ـٌ on word 2 signals sentence completion.',
        },
      },
      {
        id: 'verbal_sentence',
        partsAr: ['أُحِبُّ', 'اللُّغَةَ', 'الْعَرَبِيَّةَ'],
        joinedAr: 'أُحِبُّ اللُّغَةَ الْعَرَبِيَّةَ',
        partialHarakatAr: 'أحبّ اللغة العربية',
        unvowelledAr: 'احب اللغة العربية',
        translit: {bn: 'উহিব্বুল লুগাতাল আরাবিয়্যাতা', en: 'Uḥibbul-lughatal-‘Arabiyyata'},
        meaning: {bn: 'আমি আরবি ভাষা ভালোবাসি (ক্রিয়াবাচক বাক্য)', en: 'I love the Arabic language (Present-tense أُ prefix = I)'},
        scientificNote: {
          bn: 'বর্তমান কালের ক্রিয়ার শুরুতে أَ / أُ থাকলে "আমি", نَ থাকলে "আমরা", يَ থাকলে "সে" বোঝায়!',
          en: 'Verb prefix أُ encodes "I" directly inside the verb without needing أَنَا.',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'আরবিতে "ঘরটি বড়" (পূর্ণ বাক্য) কীভাবে বলা হয়?',
        en: 'How do you form the complete Arabic sentence "The house is big"?',
      },
      audioCueAr: 'الْبَيْتُ كَبِيرٌ',
      options: [
        {id: 'full_sent', labelAr: 'الْبَيْتُ كَبِيرٌ', label: {bn: 'আল-বাইতু কাবীরুন (প্রথমটিতে الـ, পরেরটিতে ـٌ)', en: 'Al-baytu kabīrun (Definite الـ + Indefinite ـٌ)'}, isCorrect: true},
        {id: 'phrase_only', labelAr: 'الْبَيْتُ الْكَبِيرُ', label: {bn: 'আল-বাইতুল কাবীরু (এর অর্থ শুধু "বড় ঘরটি")', en: 'Al-baytul-kabīru (means only "the big house")'}, isCorrect: false},
        {id: 'reversed', labelAr: 'كَبِيرٌ بَيْتٌ', label: {bn: 'কাবীরুন বাইতুন (দুটোই অনির্দিষ্ট)', en: 'Kabīrun baytun (both indefinite)'}, isCorrect: false},
      ],
      explanation: {
        bn: 'দারুণ! বাংলায় যেমন "ঘরটি বড়" বললেই পূর্ণ বাক্য হয়, আরবিতেও الْبَيْتُ كَبِيرٌ বললেই পূর্ণ বাক্য তৈরি হয়।',
        en: 'Exactly! Definite الْبَيْتُ followed by indefinite كَبِيرٌ creates the full sentence "The house is big."',
      },
    },
    deepLab: {navTab: 'ustad'},
    deepLabLabel: {bn: 'ভার্চুয়াল ওস্তাদের সাথে বাক্য অনুশীলন করুন', en: 'Practice Sentences with Virtual Ustad'},
  },
  {
    id: 'ar_step_03_root_matrix',
    stepNumber: 3,
    track: 'arabic_language',
    title: {
      bn: '০৩. ৩-অক্ষরের মূলশব্দ মেট্রিক্স (১ মূলশব্দ = ৮+ শব্দ)',
      en: '03. The 3-Letter Root Multiplier Matrix (Sarf)',
    },
    subtitle: {
      bn: 'অভিধান মুখস্থ না করে গাণিতিক ছাঁচে (وَزْن) ১টি মূলশব্দ থেকে কর্তা, কর্ম, স্থান ও যন্ত্রের নাম নিজেই তৈরি করা',
      en: 'Multiply your vocabulary 8x without rote memorization using Arabic’s mathematical 3-letter root templates',
    },
    estimatedMinutes: 9,
    xpReward: 35,
    sciencePillar: {
      bn: 'নন-কনক্যাটেনেটিভ মরফোলজিক্যাল স্কিমা (Morphological Pattern Engine)',
      en: 'Non-Concatenative Morphological Schema Theory',
    },
    whyItWorks: {
      bn: 'আরবি পৃথিবীর সবচেয়ে গাণিতিক ভাষা! যেকোনো ৩-অক্ষরের মূলশব্দকে فاعِل ছাঁচে বসালেই "যিনি কাজটি করেন" (كَاتِب = লেখক, عَالِم = জ্ঞানী) এবং مَفْعَل ছাঁচে বসালে "কাজের স্থান" (مَكْتَب = ডেস্ক/অফিস, مَسْجِد = সিজদার স্থান) পাওয়া যায়!',
      en: 'Arabic words are engineered from 3 root consonants slotted into fixed vowel/prefix molds: فَاعِل always means Doer, مَفْعَل means Place, and مَفْعُول means Object!',
    },
    mistakeGuard: {
      bn: 'অতিরিক্ত উপসর্গ مـ বা দীর্ঘ আলিফ দেখে মূলশব্দ গুলিয়ে ফেলবেন না—মূল ৩টি ব্যঞ্জনবর্ণ খুঁজে বের করলেই অর্থ ধরা দেবে।',
      en: 'Strip away template prefixes like مَـ or infixes like ـا / ـو to expose the 3 core root consonants inside any unfamiliar word.',
    },
    ageGuidance: {
      kids: {
        bn: 'ক-ত-ব (ك-ت-ب) মানে লেখা! দেখো জাদু: كِتَاب (বই), كَاتِب (যিনি লেখেন), مَكْتَبَة (লাইব্রেরি)—সবগুলোতেই ক-ত-ব লুকিয়ে আছে!',
        en: 'Spot the secret 3 letters ك-ت-ب (writing) hiding inside كِتَاب (book), كَاتِب (writer), and مَكْتَبَة (library)!',
      },
      standard: {
        bn: '৪টি মাস্টার ছাঁচ আয়ত্ত করুন: فَاعِل (কর্তা: كَاتِب), مَفْعُول (কর্ম: مَكْتُوب), مَفْعَل (স্থান: مَكْتَب / مَسْجِد), এবং فَعِيل (গুণ: رَحِيم / عَلِيم)।',
        en: 'Master the 4 high-leverage templates: فَاعِل (doer), مَفْعُول (passive object), مَفْعَل (place/time), and فَعِيل (intensive attribute).',
      },
      senior: {
        bn: 'বাংলাতেও আমরা আরবি মূলশব্দ প্রতিদিন ব্যবহার করি! যেমন স-জ-দ থেকে "সিজদা" আর সিজদার স্থান হলো "মাসজিদ" (مَسْجِد); হ-ক-ম থেকে "হুকুম" ও "হাকিম"!',
        en: 'You already know dozens of Arabic roots from Bangla! س-ج-د gives Sajdah and Masjid (place of prostration); ع-ل-م gives ‘Ilm and ‘Ālim!',
      },
    },
    interactiveCards: [
      {
        id: 'root_ktb',
        partsAr: ['كَاتِبٌ', 'مَكْتُوبٌ', 'مَكْتَبٌ'],
        joinedAr: 'ك-ت-ب → كَاتِبٌ · مَكْتُوبٌ · مَكْتَبٌ',
        partialHarakatAr: 'كاتب · مكتوب · مكتب',
        unvowelledAr: 'كاتب · مكتوب · مكتب',
        translit: {bn: 'কাতিবুন (লেখক) · মাকতূবুন (লিখিত) · মাকতাবুন (অফিস/ডেস্ক)', en: 'Kātib (Writer) · Maktūb (Written) · Maktab (Office/Desk)'},
        meaning: {bn: 'মূলশব্দ ك-ت-ب (লেখা) থেকে ৩টি ছাঁচে ৩টি নতুন শব্দ', en: '1 Root (ك-ت-ب) slotted into Doer, Object & Place molds'},
        scientificNote: {
          bn: 'একই ৩টি ছাঁচ د-ر-س (পাঠ)-এ বসালে: دَارِس (পাঠক), مَدْرُوس (পঠিত), مَدْرَسَة (বিদ্যালয়)!',
          en: 'Plug د-ر-س into the exact same molds and you immediately get Dāris, Madrūs, and Madrasah!',
        },
      },
      {
        id: 'root_sjd',
        partsAr: ['سَجَدَ', 'سَاجِدٌ', 'مَسْجِدٌ'],
        joinedAr: 'س-ج-د → سَجَدَ · سَاجِدٌ · مَسْجِدٌ',
        partialHarakatAr: 'سجد · ساجد · مسجد',
        unvowelledAr: 'سجد · ساجد · مسجد',
        translit: {bn: 'সাজাদা (সিজদা করল) · সাজিদুন (সিজদাকারী) · মাসজিদুন (সিজদার স্থান)', en: 'Sajada · Sājid (one prostrating) · Masjid (place of prostration)'},
        meaning: {bn: 'মূলশব্দ س-ج-د থেকে মَسْجِد শব্দের ব্যুৎপত্তি', en: 'How مَفْعِل turns prostration (س-ج-د) into Masjid'},
        scientificNote: {
          bn: 'শুরুতে مَـ যোগ করলেই ক্রিয়ার স্থান বোঝায়: طَبَخَ (রান্না করা) → مَطْبَخ (রান্নাঘর)!',
          en: 'Prefix مَـ marks location across Arabic: طَبَخَ (cook) → مَطْبَخ (kitchen), دَخَلَ (enter) → مَدْخَل (entrance).',
        },
      },
      {
        id: 'root_hkm',
        partsAr: ['حُكْمٌ', 'حَاكِمٌ', 'حِكْمَةٌ'],
        joinedAr: 'ح-ك-م → حُكْمٌ · حَاكِمٌ · حِكْمَةٌ',
        partialHarakatAr: 'حكم · حاكم · حكمة',
        unvowelledAr: 'حكم · حاكم · حكمة',
        translit: {bn: 'হুকমুন (বিধান) · হাকিমুন (বিচারক) · হিকমাতুন (প্রজ্ঞা)', en: 'Ḥukm (ruling) · Ḥākim (judge) · Ḥikmah (wisdom)'},
        meaning: {bn: 'বাংলায় ব্যবহৃত পরিচিত আরবি শব্দের মূল পরিবার', en: 'Cognates already familiar in Bangla & everyday Islamic vocabulary'},
        scientificNote: {
          bn: 'বাংলা ভাষায় প্রচলিত শত শত আরবি শব্দ (এলেম, আলেম, হুকুম, হাকিম, কিতাব, মক্তব) আপনার শব্দভাণ্ডারকে দ্বিগুণ দ্রুত করে!',
          en: 'Leveraging Bangla-Arabic cognates cuts vocabulary acquisition time in half.',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'طَبَخَ (ত্বাবাখা = রান্না করা) মূলশব্দকে স্থানের ছাঁচে (مَفْعَل) বসালে مَطْبَخٌ শব্দের অর্থ কী হবে?',
        en: 'If طَبَخَ means "to cook", what does the place-pattern word مَطْبَخٌ (maṭbakh) mean?',
      },
      audioCueAr: 'مَطْبَخٌ',
      options: [
        {id: 'kitchen', labelAr: 'مَطْبَخٌ', label: {bn: 'রান্নাঘর (রান্না করার স্থান)', en: 'Kitchen (place of cooking)'}, isCorrect: true},
        {id: 'chef', labelAr: 'طَبَّاخٌ', label: {bn: 'বাবুর্চি বা রাঁধুনি', en: 'Chef / Cook (doer)'}, isCorrect: false},
        {id: 'cooked', labelAr: 'مَطْبُوخٌ', label: {bn: 'রান্না করা খাবার', en: 'Cooked food (passive object)'}, isCorrect: false},
      ],
      explanation: {
        bn: 'অপূর্ব! আপনি অভিধান না দেখেই শুধু مَفْعَل ছাঁচ ব্যবহার করে একটি নতুন আরবি শব্দের অর্থ বের করে ফেলেছেন!',
        en: 'Brilliant! Without ever seeing the word before, the مَفْعَل place-template let you deduce مَطْبَخٌ = Kitchen!',
      },
    },
    deepLab: {navTab: 'quran', quranSection: 'roots'},
    deepLabLabel: {bn: '৩-অক্ষরের মূলশব্দ এক্সপ্লোরারে যান', en: 'Explore More in 3-Letter Root Lab'},
  },
  {
    id: 'ar_step_04_msa_gulf_bridge',
    stepNumber: 4,
    track: 'arabic_language',
    title: {
      bn: '০৪. প্রমিত ফুসহা ও সৌদি/গালফ কথ্য সেতু (B1)',
      en: '04. Modern Standard (MSA) & Saudi/Gulf Spoken Bridge (B1)',
    },
    subtitle: {
      bn: 'বই-সংবাদের প্রমিত আরবি এবং মক্কা-মদিনা ও রিয়াদের বাস্তব জীবনের সৌদি কথ্য আরবির ৫টি রূপান্তর সূত্র',
      en: 'Bridge formal Fusha with natural Saudi & Gulf daily speech using 5 predictable dialect shift rules',
    },
    estimatedMinutes: 8,
    xpReward: 35,
    sciencePillar: {
      bn: 'কম্প্যারেটিভ ডাইগ্লোসিয়া ব্রিজিং (Diglossic Code-Switching Rules)',
      en: 'Comparative Diglossia Mapping & Situational Code-Switching',
    },
    whyItWorks: {
      bn: 'প্রমিত আরবি ও সৌদি কথ্য আরবি আলাদা দুটি ভাষা নয়! মাত্র কয়েকটি রূপান্তর সূত্র—যেমন مَاذَا (কী) এর বদলে إِيشْ / وِشْ এবং أُرِيدُ (আমি চাই) এর বদলে أَبْغَى / أَبِي জানলেই আপনি আনুষ্ঠানিক ও দৈনন্দিন দুই জায়গাতেই সাবলীলভাবে কথা বলতে পারবেন।',
      en: 'Gulf Arabic shares ~80% of its core vocabulary with MSA — learning the 5 high-frequency conversational shifts lets you understand locals in Makkah, Madinah, Riyadh, Dubai, and Doha immediately.',
    },
    mistakeGuard: {
      bn: 'অফিসিয়াল নথি বা খুতবায় প্রমিত ফুসহা ব্যবহার করুন, আর বাজার, ট্যাক্সি, হাসপাতাল ও দৈনন্দিন আলাপে সৌদি/গালফ কথ্য রীতি ব্যবহার করুন।',
      en: 'Use MSA for reading, news, and formal speeches, and switch smoothly to warm Gulf expressions in cafés, taxis, clinics, and workplaces.',
    },
    ageGuidance: {
      kids: {
        bn: 'বইয়ের ভাষায় "কাইফা হালুকা?" (কেমন আছো?) আর সৌদি বন্ধুরা আদর করে বলে "শ্লোনাক?" (شْلُونَكْ)! দুটোই শুনে বলার মজা নাও!',
        en: 'In storybooks we say Kayfa ḥāluka, and friends in Saudi Arabia smile and say Shlōnak (شْلُونَكْ)! Try saying both out loud.',
      },
      standard: {
        bn: '৫টি মূল কথ্য সেতু মুখস্থ রাখুন: كَيْفَ حَالُكَ ↔ شْلُونَكْ (কেমন আছেন), مَاذَا ↔ وِشْ/إِيشْ (কী), أُرِيدُ ↔ أَبْغَى (আমি চাই), الآنَ ↔ الْحِينْ (এখন), جَيِّد ↔ زِينْ/تَمَامْ (ভালো)।',
        en: 'Memorize the 5 Gulf keys: كَيْفَ ↔ شْلُونَكْ, مَاذَا ↔ وِشْ/إِيشْ (what), أُرِيدُ ↔ أَبْغَى (I want), الآنَ ↔ الْحِينْ (now), and حَسَنًا ↔ أَبْشِرْ (gladly).',
      },
      senior: {
        bn: 'হজ্জ ও উমরাহ সফরে মক্কা-মদিনায় গাড়ি চালক, দোকানদার ও সেবাকর্মীদের সাথে কথা বলার সবচেয়ে সহজ সৌদি বাক্যগুলো ধীর গতিতে শুনে রাখুন।',
        en: 'Learn the gentlest, most practical Haramain phrases for asking directions, water, or transport during Hajj and Umrah.',
      },
    },
    interactiveCards: [
      {
        id: 'bridge_want',
        partsAr: ['أُرِيدُ مَاءً', 'أَبْغَى مَوْيَة'],
        joinedAr: 'MSA: أُرِيدُ مَاءً ↔ Gulf: أَبْغَى مَوْيَة',
        partialHarakatAr: 'أريد ماء ↔ أبغى موية',
        unvowelledAr: 'اريد ماء ↔ ابغى موية',
        translit: {bn: 'উরীদু মাআন (প্রমিত) ↔ আবগা মইয়া (সৌদি কথ্য)', en: 'Urīdu mā’an (MSA) ↔ Abghā moyah (Saudi/Gulf)'},
        meaning: {bn: 'আমি পানি চাই (হারামাইন ও দৈনন্দিন জীবনের সবচেয়ে দরকারি বাক্য)', en: 'I would like water (Essential daily request)'},
        scientificNote: {
          bn: 'সৌদি আরবে أُرِيدُ এর জায়গায় أَبْغَى (আবগা) এবং مَاء এর জায়গায় مَوْيَة (মইয়া) সবচেয়ে বেশি চলে।',
          en: 'أَبْغَى + noun is the #1 polite request formula across Hejaz and Najd.',
        },
      },
      {
        id: 'bridge_where',
        partsAr: ['أَيْنَ الْمَسْجِدُ؟', 'وَيْنْ الْمَسْجِدْ؟'],
        joinedAr: 'MSA: أَيْنَ الْمَسْجِدُ؟ ↔ Gulf: وَيْنْ الْمَسْجِدْ؟',
        partialHarakatAr: 'أين المسجد؟ ↔ وين المسجد؟',
        unvowelledAr: 'اين المسجد ↔ وين المسجد',
        translit: {bn: 'আইনাল মাসজিদু? ↔ ওয়াইন আল-মাসজিদ্?', en: 'Aynal-masjidu? (MSA) ↔ Wayn al-masjid? (Gulf)'},
        meaning: {bn: 'মসজিদ কোথায়? (রাস্তা ও দিকনির্দেশনা জানতে)', en: 'Where is the mosque? (Instant location question)'},
        scientificNote: {
          bn: 'প্রমিত أَيْنَ কথ্য ভাষায় সংক্ষিপ্ত হয়ে وَيْنْ (ওয়াইন) হয়—যার পর যেকোনো জায়গার নাম বসানো যায়!',
          en: 'Simply place وَيْنْ before الفُنْدُق (hotel), المَطَار (airport), or البَاب (gate).',
        },
      },
      {
        id: 'bridge_abshir',
        partsAr: ['بِكُلِّ سُرُورٍ', 'أَبْشِرْ، عَلَى خَشْمِي'],
        joinedAr: 'MSA: بِكُلِّ سُرُورٍ ↔ Gulf: أَبْشِرْ!',
        partialHarakatAr: 'بكل سرور ↔ أبشر!',
        unvowelledAr: 'بكل سرور ↔ ابشر',
        translit: {bn: 'বিকুল্লি সুরূরিন ↔ আবশির! (আনন্দের সাথে, এক্ষুনি হচ্ছে)', en: 'Bikulli surūrin (MSA) ↔ Abshir! (Gladly, consider it done!)'},
        meaning: {bn: 'সৌদি আতিথেয়তা ও কর্মক্ষেত্রে সবচেয়ে সম্মানজনক সম্মতিসূচক শব্দ', en: 'Warmest Saudi expression of helpfulness & hospitality'},
        scientificNote: {
          bn: 'সৌদি আরবে কেউ কাজ করে দিতে রাজি হলে হাসিমুখে বলে "أَبْشِرْ" (সুসংবাদ নিন / নিশ্চিন্ত থাকুন)।',
          en: 'أَبْشِرْ literally means "rejoice in good news" — a hallmark of Saudi courtesy.',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'মক্কা বা রিয়াদে কেউ সাহায্য চাইলে সৌদি কথ্য রীতিতে "নিশ্চিন্ত থাকুন / আনন্দের সাথে করছি" বোঝাতে কোন শব্দটি সবচেয়ে বেশি ব্যবহৃত হয়?',
        en: 'In Saudi/Gulf spoken Arabic, which warm word means "Gladly / Consider it done"?',
      },
      audioCueAr: 'أَبْشِرْ',
      options: [
        {id: 'abshir', labelAr: 'أَبْشِرْ', label: {bn: 'আবশির! (أَبْشِرْ)', en: 'Abshir! (أَبْشِرْ)'}, isCorrect: true},
        {id: 'wayn', labelAr: 'وَيْنْ', label: {bn: 'ওয়াইন (وَيْنْ — কোথায়)', en: 'Wayn (وَيْنْ — where)'}, isCorrect: false},
        {id: 'ams', labelAr: 'أَمْسِ', label: {bn: 'আমসি (গতকাল)', en: 'Amsi (yesterday)'}, isCorrect: false},
      ],
      explanation: {
        bn: 'সঠিক! أَبْشِرْ (আবশির) সৌদি ও গালফ সংস্কৃতির অন্যতম সুন্দর ও বহুল ব্যবহৃত শব্দ।',
        en: 'Spot on! أَبْشِرْ is one of the most beloved everyday expressions across Saudi Arabia and the Gulf.',
      },
    },
    deepLab: {navTab: 'spoken'},
    deepLabLabel: {bn: 'প্রমিত বনাম সৌদি কথ্য ল্যাব খুলুন', en: 'Open Side-by-Side MSA & Gulf Lab'},
  },
  {
    id: 'ar_step_05_unvowelled_read',
    stepNumber: 5,
    track: 'arabic_language',
    title: {
      bn: '০৫. হরকত ছাড়া সাবলীল আরবি পাঠ (Progressive Tashkeel Fade · B2–C1)',
      en: '05. Unvowelled Arabic Reading Mastery (Harakat Fading · B2–C1)',
    },
    subtitle: {
      bn: 'আধুনিক আরবি বই, সাইনবোর্ড, সংবাদপত্র ও বার্তা যেখানে যবর-যের-পেশ থাকে না, তা অনায়াসে পড়ার বৈজ্ঞানিক কৌশল',
      en: 'Transition smoothly from vowelled learner text to real-world unvowelled Arabic books, signs & messages',
    },
    estimatedMinutes: 10,
    xpReward: 40,
    sciencePillar: {
      bn: 'স্ক্যাফোল্ডেড ভিজ্যুয়াল ফেডিং ও টপ-ডাউন মরফোলজিক্যাল প্রেডিকশন',
      en: 'Scaffolded Orthographic Fading & Top-Down Pattern Prediction',
    },
    whyItWorks: {
      bn: 'আরবরা হরকত ছাড়া কীভাবে পড়ে? তারা অক্ষর বানান করে না—বরং শব্দের ছাঁচ (যেমন مـ...ـة বা استـ...) ও বাক্যের অবস্থান দেখেই স্বয়ংক্রিয়ভাবে হরকত বসিয়ে নেয়। ৩ ধাপে হরকত কমিয়ে আনলে (পূর্ণ → আংশিক → শূন্য) চোখ নিজে থেকেই অভ্যস্ত হয়ে যায়!',
      en: 'Fluent readers never guess vowels randomly — prefixes, long letters (ا و ي), and root templates predict 95% of vowels automatically! Three-stage Harakat fading trains this exact visual reflex.',
    },
    mistakeGuard: {
      bn: 'হঠাৎ প্রথম দিনেই হরকত ছাড়া কঠিন অনুচ্ছেদ পড়তে যাবেন না—নিচের ৩-স্তরের "হরকত ফেড" বাটন ব্যবহার করে ধাপে ধাপে অনুশীলন করুন।',
      en: 'Do not jump cold into dense unvowelled prose — use the 3-stage Harakat Fade switch below (Full → Partial → Zero) to scaffold your eye.',
    },
    ageGuidance: {
      kids: {
        bn: 'রাস্তার সাইনবোর্ড বা গল্পের বইয়ে হরকত লুকিয়ে থাকলেও দীর্ঘ আলিফ, ওয়াও, ইয়া আমাদের গোপন ক্লু দেয়! "হরকত ছাড়া" বোতামে চাপ দিয়ে দেখো তুমি পড়তে পারো কি না!',
        en: 'Even when vowel marks hide like ninjas, long letters (ا و ي) leave big clues! Toggle "Zero Harakat" below and test your detective eyes.',
      },
      standard: {
        bn: 'নিচের ৩-স্তরের Harakat Fade টগল (পূর্ণ হরকত → আংশিক সংকেত → হরকত ছাড়া) ব্যবহার করে সংবাদ ও আধুনিক আরবি বাক্য পড়ার গতি তৈরি করুন।',
        en: 'Use the 3-step Harakat Fade toggle below to train rapid morphological vowel prediction on real modern Arabic sentences.',
      },
      senior: {
        bn: 'মক্কা-মদিনার প্রবেশদ্বার (باب الملك فهد), বিমানবন্দর (المطار) ও হাসপাতালের সাইনবোর্ডে হরকত থাকে না—পরিচিত শব্দগুলো হরকত ছাড়া একবার দেখে রাখলে সফরে দারুণ কাজে দেবে।',
        en: 'Signs in Makkah, Madinah, and airports (المطار, مستشفى, باب السلام) have no Harakat — practicing familiar words unvowelled makes travel effortless.',
      },
    },
    interactiveCards: [
      {
        id: 'fade_signs',
        partsAr: ['مَطَارُ الْمَلِكِ خَالِدٍ', 'بَابُ السَّلَامِ'],
        joinedAr: 'مَطَارُ الْمَلِكِ خَالِدٍ · بَابُ السَّلَامِ',
        partialHarakatAr: 'مَطار الملك خالد · باب السّلام',
        unvowelledAr: 'مطار الملك خالد · باب السلام',
        translit: {bn: 'মাত্বারুল মালিকি খালিদ · বাবুস সালাম', en: 'Maṭārul-Maliki Khālid · Bābus-Salām'},
        meaning: {bn: 'কিং খালিদ বিমানবন্দর · বাবুস সালাম (হারামাইনের সাইনবোর্ড)', en: 'King Khalid Airport · Gate of Peace (Real Saudi signage)'},
        scientificNote: {
          bn: 'হরকত ছাড়া "مطار" ও "باب السلام" দেখলেও আলিফ (ا) দীর্ঘ স্বরের অবস্থান পরিষ্কার বলে দিচ্ছে!',
          en: 'Notice how long Alifs in مطار, خالد, باب, and السلام reveal almost every vowel without marks!',
        },
      },
      {
        id: 'fade_sentence',
        partsAr: ['تَعَلُّمُ', 'الْعَرَبِيَّةِ', 'مُمْتِعٌ', 'وَ', 'سَهْلٌ'],
        joinedAr: 'تَعَلُّمُ الْعَرَبِيَّةِ مُمْتِعٌ وَسَهْلٌ',
        partialHarakatAr: 'تعلّم العربيّة مُمتع وسهل',
        unvowelledAr: 'تعلم العربية ممتع وسهل',
        translit: {bn: 'তাআল্লুমুল আরাবিয়্যাতি মুমতিউন ওয়া সাহলুন', en: 'Ta‘allumul-‘Arabiyyati mumti‘un wa sahlun'},
        meaning: {bn: 'আরবি শেখা আনন্দদায়ক এবং সহজ', en: 'Learning Arabic is enjoyable and easy'},
        scientificNote: {
          bn: 'উপরে "হরকত ছাড়া" মোডে টগল করে দেখুন—আপনার চোখ এখন تعلم العربية ممتع وسهل অনায়াসে পড়তে পারছে!',
          en: 'Switch to Zero Harakat mode — your brain now reconstructs تعلم العربية ممتع وسهل effortlessly!',
        },
      },
      {
        id: 'fade_news',
        partsAr: ['الْمَمْلَكَةُ', 'الْعَرَبِيَّةُ', 'السُّعُودِيَّةُ'],
        joinedAr: 'الْمَمْلَكَةُ الْعَرَبِيَّةُ السُّعُودِيَّةُ',
        partialHarakatAr: 'المملكة العربيّة السّعوديّة',
        unvowelledAr: 'المملكة العربية السعودية',
        translit: {bn: 'আল-মামলাকাতুল আরাবিয়্যাতুস সুঊদিয়্যাহ', en: 'Al-Mamlakatul-‘Arabiyyatus-Su‘ūdiyyah'},
        meaning: {bn: 'সৌদি আরব সাম্রাজ্য (পাসপোর্ট, ভিসা ও সরকারি নথির শিরোনাম)', en: 'Kingdom of Saudi Arabia (Official documents & signage)'},
        scientificNote: {
          bn: 'مَمْلَكَة শব্দটি م-ل-ك (মালিক/রাজত্ব) মূলশব্দ থেকে স্থানের ছাঁচে তৈরি!',
          en: 'مَمْلَكَة comes directly from root م-ل-ك (rule/sovereignty) in the مَفْعَلَة place/realm template!',
        },
      },
    ],
    quiz: {
      prompt: {
        bn: 'বিমানবন্দর বা হারামাইনের সাইনবোর্ডে হরকত ছাড়া "باب السلام" লেখা থাকলে এর উচ্চারণ ও অর্থ কী?',
        en: 'When you see the unvowelled sign "باب السلام" at the Haramain, how do you read and understand it?',
      },
      audioCueAr: 'بَابُ السَّلَامِ',
      options: [
        {id: 'bab_salam', labelAr: 'بَابُ السَّلَامِ', label: {bn: 'বাবুস সালাম — শান্তির দরজা / গেট', en: 'Bābus-Salām — Gate of Peace'}, isCorrect: true},
        {id: 'bayt_ilm', labelAr: 'بَيْتُ الْعِلْمِ', label: {bn: 'বাইতুল ইলম — জ্ঞানের ঘর', en: 'Baytul-‘Ilm — House of Knowledge'}, isCorrect: false},
        {id: 'matar', labelAr: 'مَطَارُ الرِّيَاضِ', label: {bn: 'মাত্বারুর রিয়াদ — রিয়াদ বিমানবন্দর', en: 'Maṭārur-Riyāḍ — Riyadh Airport'}, isCorrect: false},
      ],
      explanation: {
        bn: 'মাশাআল্লাহ! আপনি হরকত ছাড়াই বাস্তব আরবি সাইনবোর্ড "باب السلام" (বাবুস সালাম) সফলভাবে পড়ে ফেলেছেন!',
        en: 'MashaAllah! You decoded real unvowelled Arabic signage (باب السلام = Gate of Peace) cleanly!',
      },
    },
    deepLab: {navTab: 'quran', quranSection: 'roots'},
    deepLabLabel: {bn: 'হরকত On/Off সহ মূলশব্দ ও পাঠ ল্যাবে যান', en: 'Practice Harakat On/Off in Reading Lab'},
  },
];

export const ALL_SCIENTIFIC_STAGES: ScientificStage[] = [
  ...ZERO_TO_QURAN_STAGES,
  ...ZERO_TO_ARABIC_STAGES,
];
