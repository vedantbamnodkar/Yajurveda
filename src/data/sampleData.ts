// Types matching actual JSON structures
import whiteYajurvedaData from './yajurveda_white.json';
import blackYajurvedaData from './yajurveda_black.json';
import satapathaData from './satapatha_brahmana.json';

// White Yajurveda (Vajasaneyi Samhita - Madhyandina)
export interface WhiteYajurvedaVerse {
  reference: string;
  text: string;
  adhyaya: number;
  verse_actual: number;
  verse: number;
  vedaId: string;
  meaning: string;
}

// Black Yajurveda (Taittiriya Samhita)
export interface BlackYajurvedaVerse {
  reference: string;
  text: string;
  kanda: number;
  prapathaka: number;
  verse: number;
  vedaId: string;
  meaning: string;
  mantra_count: number;
}

// Satapatha Brahmana
export interface SatapathaVerse {
  reference: string;
  text: string;
  mandala: number;
  hymn: number;
  verse: number;
  vedaId: string;
  meaning: string;
  sanskrit_iast: string;
}

// Export real data from JSON files
export const sampleWhiteYajurveda: WhiteYajurvedaVerse[] = whiteYajurvedaData as WhiteYajurvedaVerse[];
export const sampleBlackYajurveda: BlackYajurvedaVerse[] = blackYajurvedaData as BlackYajurvedaVerse[];
export const sampleSatapathaVerse: SatapathaVerse[] = satapathaData as SatapathaVerse[];

// Computed statistics from real data
export const computeStatistics = () => {
  // White Yajurveda stats
  const whiteAdhyayas = [...new Set(sampleWhiteYajurveda.map(v => v.adhyaya))];
  const whiteVersesByAdhyaya = whiteAdhyayas.map(a => ({
    adhyaya: a,
    count: sampleWhiteYajurveda.filter(v => v.adhyaya === a).length
  }));
  const longestWhite = whiteVersesByAdhyaya.reduce((max, curr) => curr.count > max.count ? curr : max, whiteVersesByAdhyaya[0]);
  const shortestWhite = whiteVersesByAdhyaya.reduce((min, curr) => curr.count < min.count ? curr : min, whiteVersesByAdhyaya[0]);

  // Black Yajurveda stats
  const blackKandas = [...new Set(sampleBlackYajurveda.map(v => v.kanda))];
  const blackPrapathakas = [...new Set(sampleBlackYajurveda.map(v => `${v.kanda}.${v.prapathaka}`))];
  const blackVersesByKanda = blackKandas.map(k => ({
    kanda: k,
    count: sampleBlackYajurveda.filter(v => v.kanda === k).length
  }));
  const longestBlack = blackVersesByKanda.reduce((max, curr) => curr.count > max.count ? curr : max, blackVersesByKanda[0]);
  const shortestBlack = blackVersesByKanda.reduce((min, curr) => curr.count < min.count ? curr : min, blackVersesByKanda[0]);

  // Satapatha stats
  const satapathaMandalas = [...new Set(sampleSatapathaVerse.map(v => v.mandala))];

  return {
    white: {
      totalAdhyayas: whiteAdhyayas.length,
      totalVerses: sampleWhiteYajurveda.length,
      avgVersesPerAdhyaya: Math.round(sampleWhiteYajurveda.length / whiteAdhyayas.length),
      longestAdhyaya: { number: longestWhite?.adhyaya || 1, verses: longestWhite?.count || 0 },
      shortestAdhyaya: { number: shortestWhite?.adhyaya || 1, verses: shortestWhite?.count || 0 },
      avgTextLength: Math.round(sampleWhiteYajurveda.reduce((sum, v) => sum + v.text.length, 0) / sampleWhiteYajurveda.length),
    },
    black: {
      totalKandas: blackKandas.length,
      totalPrapathakas: blackPrapathakas.length,
      totalVerses: sampleBlackYajurveda.length,
      avgVersesPerKanda: Math.round(sampleBlackYajurveda.length / blackKandas.length),
      longestKanda: { number: longestBlack?.kanda || 1, verses: longestBlack?.count || 0 },
      shortestKanda: { number: shortestBlack?.kanda || 1, verses: shortestBlack?.count || 0 },
      avgTextLength: Math.round(sampleBlackYajurveda.reduce((sum, v) => sum + v.text.length, 0) / sampleBlackYajurveda.length),
    },
    satapatha: {
      totalMandals: satapathaMandalas.length,
      totalVerses: sampleSatapathaVerse.length,
      avgTextLength: Math.round(sampleSatapathaVerse.reduce((sum, v) => sum + v.text.length, 0) / sampleSatapathaVerse.length),
    }
  };
};

// Facts about Yajurveda for the home page
export const yajurvedaFacts = [
  {
    id: 'fact-1',
    title: 'The Veda of Rituals',
    description: 'Yajurveda is primarily a liturgical collection, containing mantras and prose formulas used by priests during Vedic rituals and sacrifices.',
    icon: 'flame'
  },
  {
    id: 'fact-2',
    title: 'Two Major Recensions',
    description: 'The Yajurveda exists in two major forms: the Shukla (White) Yajurveda and the Krishna (Black) Yajurveda, each with distinct organizational approaches.',
    icon: 'book'
  },
  {
    id: 'fact-3',
    title: 'Ancient Origins',
    description: 'Dating back to approximately 1200-1000 BCE, the Yajurveda represents one of the oldest religious texts in continuous use.',
    icon: 'clock'
  },
  {
    id: 'fact-4',
    title: 'Adhvaryu Priest',
    description: 'The Yajurveda is specifically associated with the Adhvaryu priest, who performs the physical aspects of Vedic rituals.',
    icon: 'user'
  },
  {
    id: 'fact-5',
    title: 'Satapatha Brahmana',
    description: 'The Satapatha Brahmana, one of the largest Brahmana texts, is attached to the White Yajurveda and contains extensive ritual explanations.',
    icon: 'scroll'
  },
  {
    id: 'fact-6',
    title: 'Philosophical Depth',
    description: 'Beyond rituals, the Yajurveda contains profound philosophical concepts including the famous "Isha Upanishad" from its final chapter.',
    icon: 'sparkles'
  },
];

// Legacy export for backwards compatibility
export const textStatistics = computeStatistics();
