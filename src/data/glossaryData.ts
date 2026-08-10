// Sanskrit Glossary Data with definitions and context
export interface GlossaryTerm {
  id: string;
  sanskrit: string;
  devanagari: string;
  english: string;
  definition: string;
  context: string;
  category: 'deity' | 'ritual' | 'philosophical' | 'cosmological' | 'object' | 'action';
  relatedTerms?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'agni',
    sanskrit: 'Agni',
    devanagari: 'अग्नि',
    english: 'Fire',
    definition: 'The god of fire and the divine messenger between humans and gods. Agni is one of the most important Vedic deities, receiving offerings and conveying them to the gods.',
    context: 'Central to all Vedic rituals as the sacrificial fire that carries offerings to the heavens.',
    category: 'deity',
    relatedTerms: ['yajna', 'homa', 'ahuti']
  },
  {
    id: 'indra',
    sanskrit: 'Indra',
    devanagari: 'इन्द्र',
    english: 'King of Gods',
    definition: 'The king of the gods and lord of heaven (Svarga). Indra is the god of thunder, lightning, storms, and war, known for slaying the demon Vritra.',
    context: 'Frequently invoked for strength, victory, and protection in Vedic hymns.',
    category: 'deity',
    relatedTerms: ['soma', 'vritra', 'vajra']
  },
  {
    id: 'soma',
    sanskrit: 'Soma',
    devanagari: 'सोम',
    english: 'Divine Nectar',
    definition: 'A ritual drink prepared from a plant, personified as a deity. Soma is considered the drink of immortality and is offered to gods during sacrifices.',
    context: 'An entire mandala of the Rigveda is dedicated to Soma. It was pressed during rituals and offered to Indra.',
    category: 'ritual',
    relatedTerms: ['indra', 'yajna', 'amrita']
  },
  {
    id: 'yajna',
    sanskrit: 'Yajña',
    devanagari: 'यज्ञ',
    english: 'Sacrifice',
    definition: 'A ritual of offerings accompanied by chanting of Vedic mantras. Yajna is the central religious practice of Vedic tradition.',
    context: 'The Yajurveda is primarily focused on the formulas and procedures for conducting yajnas.',
    category: 'ritual',
    relatedTerms: ['agni', 'ahuti', 'hotr']
  },
  {
    id: 'brahman',
    sanskrit: 'Brahman',
    devanagari: 'ब्रह्मन्',
    english: 'Ultimate Reality',
    definition: 'The supreme, unchanging reality, the ground of all existence. In Vedantic philosophy, Brahman is the ultimate truth underlying all phenomena.',
    context: 'The Satapatha Brahmana explores the mystical significance of rituals in relation to Brahman.',
    category: 'philosophical',
    relatedTerms: ['atman', 'om', 'sat']
  },
  {
    id: 'atman',
    sanskrit: 'Ātman',
    devanagari: 'आत्मन्',
    english: 'Self/Soul',
    definition: 'The individual self or soul, considered identical with Brahman in Upanishadic philosophy. The eternal essence of a living being.',
    context: 'Understanding the relationship between Atman and Brahman is central to Vedic philosophy.',
    category: 'philosophical',
    relatedTerms: ['brahman', 'jiva', 'moksha']
  },
  {
    id: 'deva',
    sanskrit: 'Deva',
    devanagari: 'देव',
    english: 'God/Divine Being',
    definition: 'A divine being or deity. The Vedas describe numerous devas representing natural forces and cosmic principles.',
    context: 'Devas are invoked during rituals and are believed to maintain cosmic order (Rta).',
    category: 'deity',
    relatedTerms: ['indra', 'agni', 'varuna']
  },
  {
    id: 'rta',
    sanskrit: 'Ṛta',
    devanagari: 'ऋत',
    english: 'Cosmic Order',
    definition: 'The principle of natural order and cosmic law that governs the universe. It represents truth, order, and the regulated course of nature.',
    context: 'Varuna is the chief guardian of Rta. Rituals were performed to maintain cosmic harmony.',
    category: 'cosmological',
    relatedTerms: ['varuna', 'dharma', 'satya']
  },
  {
    id: 'mantra',
    sanskrit: 'Mantra',
    devanagari: 'मन्त्र',
    english: 'Sacred Utterance',
    definition: 'A sacred syllable, word, or verse with spiritual power. Mantras are recited during rituals and meditation.',
    context: 'The Yajurveda contains the mantras to be recited by the adhvaryu priest during sacrifices.',
    category: 'ritual',
    relatedTerms: ['om', 'gayatri', 'veda']
  },
  {
    id: 'prana',
    sanskrit: 'Prāṇa',
    devanagari: 'प्राण',
    english: 'Life Force',
    definition: 'The vital life force or breath that sustains all living beings. Prana is the cosmic energy that pervades the universe.',
    context: 'Control of prana through breathing is fundamental to yogic practices.',
    category: 'philosophical',
    relatedTerms: ['atman', 'vayu', 'jiva']
  },
  {
    id: 'ahuti',
    sanskrit: 'Āhuti',
    devanagari: 'आहुति',
    english: 'Offering',
    definition: 'An oblation or offering made into the sacred fire during a yajna. Common offerings include ghee, grains, and soma.',
    context: 'Each ahuti is accompanied by specific mantras and is believed to reach the gods through Agni.',
    category: 'ritual',
    relatedTerms: ['agni', 'yajna', 'homa']
  },
  {
    id: 'homa',
    sanskrit: 'Homa',
    devanagari: 'होम',
    english: 'Fire Ritual',
    definition: 'A fire ritual in which offerings are made into a consecrated fire. Also known as havana.',
    context: 'Homas are performed for various purposes including purification, blessings, and honoring deities.',
    category: 'ritual',
    relatedTerms: ['agni', 'ahuti', 'yajna']
  },
  {
    id: 'varuna',
    sanskrit: 'Varuṇa',
    devanagari: 'वरुण',
    english: 'Lord of Waters',
    definition: 'The god of the sky, waters, and the celestial ocean. Varuna is the guardian of moral law (Rta) and cosmic order.',
    context: 'Varuna judges the righteous and punishes sinners. He is invoked for forgiveness of sins.',
    category: 'deity',
    relatedTerms: ['rta', 'mitra', 'aditya']
  },
  {
    id: 'surya',
    sanskrit: 'Sūrya',
    devanagari: 'सूर्य',
    english: 'Sun God',
    definition: 'The solar deity, representing the visible form of the divine. Surya is the eye of the gods and the source of light and life.',
    context: 'The Gayatri mantra is addressed to Savitri, a form of Surya.',
    category: 'deity',
    relatedTerms: ['aditya', 'savitri', 'gayatri']
  },
  {
    id: 'veda',
    sanskrit: 'Veda',
    devanagari: 'वेद',
    english: 'Knowledge',
    definition: 'Sacred knowledge or scripture. The Vedas are the oldest scriptures of Hinduism, considered eternal and authorless (apaurusheya).',
    context: 'The four Vedas are Rigveda, Yajurveda, Samaveda, and Atharvaveda.',
    category: 'philosophical',
    relatedTerms: ['shruti', 'mantra', 'brahmana']
  },
  {
    id: 'svarga',
    sanskrit: 'Svarga',
    devanagari: 'स्वर्ग',
    english: 'Heaven',
    definition: 'The heavenly realm where virtuous souls go after death. Svarga is ruled by Indra and is a place of great pleasure.',
    context: 'Many Vedic rituals are performed with the aim of attaining Svarga.',
    category: 'cosmological',
    relatedTerms: ['indra', 'loka', 'amrita']
  },
  {
    id: 'prithvi',
    sanskrit: 'Pṛthvī',
    devanagari: 'पृथ्वी',
    english: 'Earth',
    definition: 'The Earth goddess, personification of the earth. She is often paired with Dyaus (Sky) as the primordial parents.',
    context: 'Prithvi is invoked for fertility, abundance, and stability.',
    category: 'deity',
    relatedTerms: ['dyaus', 'bhumi', 'loka']
  },
  {
    id: 'om',
    sanskrit: 'Oṃ',
    devanagari: 'ॐ',
    english: 'Sacred Syllable',
    definition: 'The most sacred syllable in Hinduism, representing the essence of the universe and Brahman. Also called Pranava.',
    context: 'Om is chanted at the beginning and end of prayers and mantras.',
    category: 'philosophical',
    relatedTerms: ['brahman', 'mantra', 'pranava']
  },
  {
    id: 'rudra',
    sanskrit: 'Rudra',
    devanagari: 'रुद्र',
    english: 'The Howler',
    definition: 'A fierce deity associated with storms, hunting, and medicine. Rudra is considered a precursor to Shiva.',
    context: 'The famous Shri Rudram hymn in the Yajurveda is dedicated to Rudra.',
    category: 'deity',
    relatedTerms: ['shiva', 'marut', 'tryambaka']
  },
  {
    id: 'vayu',
    sanskrit: 'Vāyu',
    devanagari: 'वायु',
    english: 'Wind God',
    definition: 'The god of wind and air. Vayu is the breath of Purusha (cosmic being) and is associated with prana.',
    context: 'Vayu is invoked for vitality and is sometimes identified with prana.',
    category: 'deity',
    relatedTerms: ['prana', 'marut', 'indra']
  },
  {
    id: 'hotr',
    sanskrit: 'Hotṛ',
    devanagari: 'होतृ',
    english: 'Invoker Priest',
    definition: 'The chief priest who recites verses from the Rigveda during sacrifices. One of the four main priests in a yajna.',
    context: 'The Hotr invokes the gods and invites them to receive the offerings.',
    category: 'ritual',
    relatedTerms: ['adhvaryu', 'udgatar', 'brahman-priest']
  },
  {
    id: 'adhvaryu',
    sanskrit: 'Adhvaryu',
    devanagari: 'अध्वर्यु',
    english: 'Performing Priest',
    definition: 'The priest who performs the physical actions of the sacrifice and recites formulas from the Yajurveda.',
    context: 'The Yajurveda is specifically the Veda of the Adhvaryu priest.',
    category: 'ritual',
    relatedTerms: ['hotr', 'yajna', 'yajurveda']
  },
  {
    id: 'purusha',
    sanskrit: 'Puruṣa',
    devanagari: 'पुरुष',
    english: 'Cosmic Being',
    definition: 'The primordial cosmic being from whose body the universe was created. Also refers to the self or consciousness.',
    context: 'The Purusha Sukta describes the creation of the world from the sacrifice of Purusha.',
    category: 'cosmological',
    relatedTerms: ['prakriti', 'brahman', 'atman']
  },
  {
    id: 'dharma',
    sanskrit: 'Dharma',
    devanagari: 'धर्म',
    english: 'Duty/Righteousness',
    definition: 'The moral law, duty, and righteousness that upholds cosmic and social order. One\'s dharma depends on one\'s station in life.',
    context: 'Following dharma leads to spiritual progress and maintains harmony.',
    category: 'philosophical',
    relatedTerms: ['rta', 'karma', 'moksha']
  },
  {
    id: 'karma',
    sanskrit: 'Karma',
    devanagari: 'कर्म',
    english: 'Action',
    definition: 'Action and its consequences. In Vedic context, karma primarily refers to ritual action; later it came to mean the law of cause and effect.',
    context: 'Proper performance of Vedic rituals (karma) leads to desired results.',
    category: 'philosophical',
    relatedTerms: ['yajna', 'dharma', 'phala']
  }
];

// Get terms by category
export const getTermsByCategory = (category: GlossaryTerm['category']): GlossaryTerm[] => {
  return glossaryTerms.filter(term => term.category === category);
};

// Search terms
export const searchTerms = (query: string): GlossaryTerm[] => {
  const lowerQuery = query.toLowerCase();
  return glossaryTerms.filter(term => 
    term.sanskrit.toLowerCase().includes(lowerQuery) ||
    term.english.toLowerCase().includes(lowerQuery) ||
    term.devanagari.includes(query) ||
    term.definition.toLowerCase().includes(lowerQuery)
  );
};

// Get term by ID
export const getTermById = (id: string): GlossaryTerm | undefined => {
  return glossaryTerms.find(term => term.id === id);
};

// Get all categories
export const glossaryCategories: { value: GlossaryTerm['category']; label: string }[] = [
  { value: 'deity', label: 'Deities' },
  { value: 'ritual', label: 'Rituals' },
  { value: 'philosophical', label: 'Philosophical' },
  { value: 'cosmological', label: 'Cosmological' },
  { value: 'object', label: 'Objects' },
  { value: 'action', label: 'Actions' }
];
