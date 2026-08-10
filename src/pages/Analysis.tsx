import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import VerseSearchSelect from '@/components/VerseSearchSelect';
import { textStatistics, sampleWhiteYajurveda, sampleBlackYajurveda, sampleSatapathaVerse } from '@/data/sampleData';
import { 
  BarChart3,
  PieChart, 
  Type, 
  GitCompare, 
  BookMarked, 
  Bookmark,
  StickyNote,
  Search,
  Sparkles,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  X,
  Download,
  FileDown,
  Radar,
  BookOpen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar
} from 'recharts';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useStudyNotes } from '@/hooks/useStudyNotes';
import { toast } from 'sonner';
import { exportStudyNotesToPdf, exportComparisonToPdf } from '@/utils/exportToPdf';
import Glossary from '@/components/Glossary';

// Generate verse count per Adhyaya for Shukla Yajurveda
const generateShuklaDistributionData = () => {
  const adhyayas = [...new Set(sampleWhiteYajurveda.map(v => v.adhyaya))].sort((a, b) => a - b);
  return adhyayas.map(adhyaya => ({
    name: `Adh ${adhyaya}`,
    verses: sampleWhiteYajurveda.filter(v => v.adhyaya === adhyaya).length
  }));
};

// Generate verse count per Kanda for Krishna Yajurveda
const generateKrishnaDistributionData = () => {
  const kandas = [...new Set(sampleBlackYajurveda.map(v => v.kanda))].sort((a, b) => a - b);
  return kandas.map(kanda => ({
    name: `Kanda ${kanda}`,
    verses: sampleBlackYajurveda.filter(v => v.kanda === kanda).length
  }));
};

// Generate verse count per Mandala for Satapatha
const generateSatapathaDistributionData = () => {
  const mandalas = [...new Set(sampleSatapathaVerse.map(v => v.mandala))].sort((a, b) => a - b);
  return mandalas.map(mandala => ({
    name: `M ${mandala}`,
    verses: sampleSatapathaVerse.filter(v => v.mandala === mandala).length
  }));
};

const generateWordFrequencyData = (view: 'All' | 'SY' | 'KY' | 'SB') => {
  let textData: string[] = [];
  
  if (view === 'All' || view === 'SY') {
    textData = [...textData, ...sampleWhiteYajurveda.map(v => v.text)];
  }
  if (view === 'All' || view === 'KY') {
    textData = [...textData, ...sampleBlackYajurveda.map(v => v.text)];
  }
  if (view === 'All' || view === 'SB') {
    textData = [...textData, ...sampleSatapathaVerse.map(v => v.text)];
  }
  
  const allText = textData.join(' ').toLowerCase();
  
  // Key Vedic terms to search for
  const vedicTerms = [
    { term: 'agni', sanskrit: 'अग्नि (Agni)' },
    { term: 'indra', sanskrit: 'इन्द्र (Indra)' },
    { term: 'soma', sanskrit: 'सोम (Soma)' },
    { term: 'deva', sanskrit: 'देव (Deva)' },
    { term: 'sacrifice', sanskrit: 'यज्ञ (Yajna)' },
    { term: 'gods', sanskrit: 'देवाः (Gods)' },
    { term: 'heaven', sanskrit: 'स्वर्ग (Heaven)' },
    { term: 'earth', sanskrit: 'पृथ्वी (Earth)' },
    { term: 'prayer', sanskrit: 'प्रार्थना (Prayer)' },
    { term: 'ritual', sanskrit: 'विधि (Ritual)' },
    { term: 'brahman', sanskrit: 'ब्रह्मन् (Brahman)' },
    { term: 'waters', sanskrit: 'आपः (Waters)' },
    { term: 'sun', sanskrit: 'सूर्य (Sun)' },
    { term: 'moon', sanskrit: 'चन्द्र (Moon)' },
    { term: 'offering', sanskrit: 'आहुति (Offering)' },
    { term: 'priest', sanskrit: 'पुरोहित (Priest)' },
    { term: 'light', sanskrit: 'ज्योति (Light)' },
    { term: 'mantra', sanskrit: 'मन्त्र (Mantra)' }
  ];
  
  return vedicTerms
    .map(({ term, sanskrit }) => {
      const regex = new RegExp(term, 'gi');
      const matches = allText.match(regex);
      return { word: sanskrit, count: matches ? matches.length : 0 };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
};

// Generate radar chart data for scripture comparison
const generateRadarData = () => {
  const whiteTotal = sampleWhiteYajurveda.length;
  const blackTotal = sampleBlackYajurveda.length;
  const satapathaTotal = sampleSatapathaVerse.length;
  
  const whiteAvgLen = Math.round(sampleWhiteYajurveda.reduce((sum, v) => sum + v.text.length, 0) / whiteTotal);
  const blackAvgLen = Math.round(sampleBlackYajurveda.reduce((sum, v) => sum + v.text.length, 0) / blackTotal);
  const satapathaAvgLen = Math.round(sampleSatapathaVerse.reduce((sum, v) => sum + v.text.length, 0) / satapathaTotal);
  
  const whiteChapters = [...new Set(sampleWhiteYajurveda.map(v => v.adhyaya))].length;
  const blackChapters = [...new Set(sampleBlackYajurveda.map(v => v.kanda))].length;
  const satapathaChapters = [...new Set(sampleSatapathaVerse.map(v => v.mandala))].length;
  
  // Normalize values to 0-100 scale for radar chart
  const maxVerses = Math.max(whiteTotal, blackTotal, satapathaTotal);
  const maxAvgLen = Math.max(whiteAvgLen, blackAvgLen, satapathaAvgLen);
  const maxChapters = Math.max(whiteChapters, blackChapters, satapathaChapters);
  
  return [
    {
      metric: 'Verse Count',
      shukla: Math.round((whiteTotal / maxVerses) * 100),
      krishna: Math.round((blackTotal / maxVerses) * 100),
      satapatha: Math.round((satapathaTotal / maxVerses) * 100),
      fullMark: 100
    },
    {
      metric: 'Avg Text Length',
      shukla: Math.round((whiteAvgLen / maxAvgLen) * 100),
      krishna: Math.round((blackAvgLen / maxAvgLen) * 100),
      satapatha: Math.round((satapathaAvgLen / maxAvgLen) * 100),
      fullMark: 100
    },
    {
      metric: 'Chapters/Sections',
      shukla: Math.round((whiteChapters / maxChapters) * 100),
      krishna: Math.round((blackChapters / maxChapters) * 100),
      satapatha: Math.round((satapathaChapters / maxChapters) * 100),
      fullMark: 100
    },
    {
      metric: 'Density (V/Ch)',
      shukla: Math.round((whiteTotal / whiteChapters) / 100 * 10),
      krishna: Math.round((blackTotal / blackChapters) / 100 * 10),
      satapatha: Math.round((satapathaTotal / satapathaChapters) / 100 * 10),
      fullMark: 100
    },
    {
      metric: 'Ritual Focus',
      shukla: 75,
      krishna: 85,
      satapatha: 95,
      fullMark: 100
    }
  ];
};

const shuklaDistributionData = generateShuklaDistributionData();
const krishnaDistributionData = generateKrishnaDistributionData();
const satapathaDistributionData = generateSatapathaDistributionData();
const radarData = generateRadarData();

// Thematic data - estimated percentages based on content analysis
const thematicData = [
  { name: 'Ritual Mantras', value: 45, color: 'hsl(32, 90%, 50%)' },
  { name: 'Philosophical', value: 20, color: 'hsl(25, 40%, 25%)' },
  { name: 'Cosmological', value: 15, color: 'hsl(40, 25%, 70%)' },
  { name: 'Devotional', value: 12, color: 'hsl(32, 70%, 60%)' },
  { name: 'Others', value: 8, color: 'hsl(25, 20%, 50%)' },
];
// Similarity Score Component
const SimilarityScore = ({ label, value, description }: { label: string; value: number; description: string }) => {
  const percentage = value * 100;
  const getColor = () => {
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-400';
  };
  
  return (
    <div className="p-3 rounded-lg bg-background/50 border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-lg font-bold text-foreground">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 mb-1">
        <div 
          className={`h-2 rounded-full transition-all ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

export default function Analysis() {
  const [activeTab, setActiveTab] = useState('visualizations');
  const [selectedWhiteVerse, setSelectedWhiteVerse] = useState('');
  const [selectedBlackVerse, setSelectedBlackVerse] = useState('');
  const [comparisonText1, setComparisonText1] = useState('');
  const [comparisonText2, setComparisonText2] = useState('');
  const [comparisonResult, setComparisonResult] = useState<{ similarities: string[]; differences: string[] } | null>(null);
  const [analysisText, setAnalysisText] = useState('');
  const [distributionView, setDistributionView] = useState<'SY' | 'KY' | 'SB'>('SY');
  const [wordFrequencyView, setWordFrequencyView] = useState<'All' | 'SY' | 'KY' | 'SB'>('All');
  
  const wordFrequencyData = useMemo(() => generateWordFrequencyData(wordFrequencyView), [wordFrequencyView]);
  
  // Memoize verse reference lists for Select components to prevent re-renders
  const whiteVerseOptions = useMemo(() => 
    sampleWhiteYajurveda.map(v => ({ reference: v.reference })), 
    []
  );
  const blackVerseOptions = useMemo(() => 
    sampleBlackYajurveda.map(v => ({ reference: v.reference })), 
    []
  );
  const { bookmarks, removeBookmark } = useBookmarks();
  const { notes, addNote, updateNote, deleteNote } = useStudyNotes();
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Update comparison text when verse is selected
  useEffect(() => {
    if (selectedWhiteVerse) {
      const verse = sampleWhiteYajurveda.find(v => v.reference === selectedWhiteVerse);
      if (verse) {
        setComparisonText1(verse.text);
      }
    }
  }, [selectedWhiteVerse]);

  useEffect(() => {
    if (selectedBlackVerse) {
      const verse = sampleBlackYajurveda.find(v => v.reference === selectedBlackVerse);
      if (verse) {
        setComparisonText2(verse.text);
      }
    }
  }, [selectedBlackVerse]);

  // Similarity calculation utilities
  const tokenize = (text: string): string[] => {
    return text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  };

  const getNGrams = (words: string[], n: number): string[] => {
    const ngrams: string[] = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }
    return ngrams;
  };

  const calculateJaccardSimilarity = (set1: Set<string>, set2: Set<string>): number => {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  };

  const calculateCosineSimilarity = (words1: string[], words2: string[]): number => {
    const allWords = [...new Set([...words1, ...words2])];
    const freq1 = new Map<string, number>();
    const freq2 = new Map<string, number>();
    
    words1.forEach(w => freq1.set(w, (freq1.get(w) || 0) + 1));
    words2.forEach(w => freq2.set(w, (freq2.get(w) || 0) + 1));
    
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    allWords.forEach(word => {
      const v1 = freq1.get(word) || 0;
      const v2 = freq2.get(word) || 0;
      dotProduct += v1 * v2;
      mag1 += v1 * v1;
      mag2 += v2 * v2;
    });
    
    const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  };

  const calculateDiceSorensen = (set1: Set<string>, set2: Set<string>): number => {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    return (set1.size + set2.size) === 0 ? 0 : (2 * intersection.size) / (set1.size + set2.size);
  };

  const calculateOverlapCoefficient = (set1: Set<string>, set2: Set<string>): number => {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const minSize = Math.min(set1.size, set2.size);
    return minSize === 0 ? 0 : intersection.size / minSize;
  };

  interface ComparisonMetrics {
    jaccardWord: number;
    jaccardBigram: number;
    jaccardTrigram: number;
    cosineSimilarity: number;
    diceSorensen: number;
    overlapCoefficient: number;
    commonWords: string[];
    uniqueText1: string[];
    uniqueText2: string[];
    commonBigrams: string[];
    commonTrigrams: string[];
    lengthRatio: number;
    vocabularyOverlap: number;
  }

  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics | null>(null);

  const handleCompare = () => {
    if (!comparisonText1 || !comparisonText2) {
      toast.error('Please enter text in both fields');
      return;
    }

    const words1 = tokenize(comparisonText1);
    const words2 = tokenize(comparisonText2);
    const wordSet1 = new Set(words1);
    const wordSet2 = new Set(words2);

    // N-grams
    const bigrams1 = new Set(getNGrams(words1, 2));
    const bigrams2 = new Set(getNGrams(words2, 2));
    const trigrams1 = new Set(getNGrams(words1, 3));
    const trigrams2 = new Set(getNGrams(words2, 3));

    // Calculate all metrics
    const jaccardWord = calculateJaccardSimilarity(wordSet1, wordSet2);
    const jaccardBigram = calculateJaccardSimilarity(bigrams1, bigrams2);
    const jaccardTrigram = calculateJaccardSimilarity(trigrams1, trigrams2);
    const cosineSimilarity = calculateCosineSimilarity(words1, words2);
    const diceSorensen = calculateDiceSorensen(wordSet1, wordSet2);
    const overlapCoefficient = calculateOverlapCoefficient(wordSet1, wordSet2);

    // Common and unique elements
    const commonWords = [...wordSet1].filter(w => wordSet2.has(w));
    const uniqueText1 = [...wordSet1].filter(w => !wordSet2.has(w));
    const uniqueText2 = [...wordSet2].filter(w => !wordSet1.has(w));
    const commonBigrams = [...bigrams1].filter(b => bigrams2.has(b));
    const commonTrigrams = [...trigrams1].filter(t => trigrams2.has(t));

    // Additional metrics
    const lengthRatio = Math.min(words1.length, words2.length) / Math.max(words1.length, words2.length);
    const vocabularyOverlap = commonWords.length / new Set([...wordSet1, ...wordSet2]).size;

    setComparisonMetrics({
      jaccardWord,
      jaccardBigram,
      jaccardTrigram,
      cosineSimilarity,
      diceSorensen,
      overlapCoefficient,
      commonWords: commonWords.slice(0, 20),
      uniqueText1: uniqueText1.slice(0, 10),
      uniqueText2: uniqueText2.slice(0, 10),
      commonBigrams: commonBigrams.slice(0, 10),
      commonTrigrams: commonTrigrams.slice(0, 8),
      lengthRatio,
      vocabularyOverlap
    });

    // Clear old result format
    setComparisonResult(null);
    toast.success('Comparison complete');
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast.error('Please enter both title and content');
      return;
    }
    
    if (editingNoteId) {
      updateNote(editingNoteId, noteTitle, noteContent);
      toast.success('Note updated');
      setEditingNoteId(null);
    } else {
      addNote(noteTitle, noteContent);
      toast.success('Note saved');
    }
    setNoteTitle('');
    setNoteContent('');
  };

  const handleEditNote = (id: string, title: string, content: string) => {
    setEditingNoteId(id);
    setNoteTitle(title);
    setNoteContent(content);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    toast.success('Note deleted');
  };

  const bookmarksList = [...bookmarks];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-hero py-12 px-4 mandala-pattern">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-foreground text-sm mb-4">
            <BarChart3 className="w-4 h-4" />
            <span>Analysis Tools</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Text Analysis & Insights
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore patterns, compare texts, and conduct your own analysis
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab List */}
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 h-auto p-1 bg-secondary">
              <TabsTrigger 
                value="visualizations" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <PieChart className="w-4 h-4" />
                <span className="hidden sm:inline">Visualizations</span>
              </TabsTrigger>
              <TabsTrigger 
                value="text-analysis"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">Text Analysis</span>
              </TabsTrigger>
              <TabsTrigger 
                value="comparison"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">Comparison</span>
              </TabsTrigger>
              <TabsTrigger 
                value="study-tools"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BookMarked className="w-4 h-4" />
                <span className="hidden sm:inline">Study Tools</span>
              </TabsTrigger>
              <TabsTrigger 
                value="glossary"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Glossary</span>
              </TabsTrigger>
            </TabsList>

            {/* Glossary Tab */}
            <TabsContent value="glossary" className="space-y-6">
              <Card className="max-w-6xl mx-auto">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Sanskrit Glossary
                  </CardTitle>
                  <CardDescription>
                    Explore Sanskrit terms with definitions, context, and related concepts. Click any term to see full details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Glossary />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Visualizations Tab */}
            <TabsContent value="visualizations" className="space-y-6">
              {/* Statistics Overview */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{textStatistics.white.totalVerses.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Shukla Verses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{textStatistics.black.totalVerses.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Krishna Verses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{textStatistics.satapatha.totalVerses.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Satapatha Verses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{textStatistics.white.totalAdhyayas}</p>
                        <p className="text-sm text-muted-foreground">Adhyayas (Shukla)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{textStatistics.black.totalKandas}</p>
                        <p className="text-sm text-muted-foreground">Kandas (Krishna)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row - Verse Distribution with Toggle + Thematic Distribution */}
              <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {/* Verse Distribution with Toggle */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-display flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          Verse Distribution
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {distributionView === 'SY' && 'Shukla Yajurveda - Verses per Adhyaya'}
                          {distributionView === 'KY' && 'Krishna Yajurveda - Verses per Kanda'}
                          {distributionView === 'SB' && 'Satapatha Brahmana - Verses per Mandala'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant={distributionView === 'SY' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setDistributionView('SY')}
                          className="rounded-r-none text-xs px-3"
                        >
                          SY
                        </Button>
                        <Button
                          variant={distributionView === 'KY' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setDistributionView('KY')}
                          className="rounded-none border-x text-xs px-3"
                        >
                          KY
                        </Button>
                        <Button
                          variant={distributionView === 'SB' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setDistributionView('SB')}
                          className="rounded-l-none text-xs px-3"
                        >
                          SB
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={
                            distributionView === 'SY' ? shuklaDistributionData :
                            distributionView === 'KY' ? krishnaDistributionData :
                            satapathaDistributionData
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={10}
                            angle={distributionView === 'SY' ? -45 : 0}
                            textAnchor={distributionView === 'SY' ? 'end' : 'middle'}
                            height={distributionView === 'SY' ? 60 : 30}
                          />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar 
                            dataKey="verses" 
                            name="Verses" 
                            fill={
                              distributionView === 'SY' ? 'hsl(32, 90%, 50%)' :
                              distributionView === 'KY' ? 'hsl(25, 40%, 25%)' :
                              'hsl(40, 25%, 55%)'
                            } 
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Thematic Distribution */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      Thematic Distribution
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">Content categories in the texts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={thematicData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${value}%`}
                          >
                            {thematicData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scripture Comparison Radar Chart */}
              <Card className="max-w-6xl mx-auto">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Radar className="w-5 h-5 text-primary" />
                    Scripture Comparison
                  </CardTitle>
                  <CardDescription>Multi-dimensional comparison across all three texts (normalized to 0-100 scale)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis 
                          dataKey="metric" 
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        />
                        <RechartsRadar
                          name="Shukla Yajurveda"
                          dataKey="shukla"
                          stroke="hsl(32, 90%, 50%)"
                          fill="hsl(32, 90%, 50%)"
                          fillOpacity={0.3}
                        />
                        <RechartsRadar
                          name="Krishna Yajurveda"
                          dataKey="krishna"
                          stroke="hsl(25, 40%, 35%)"
                          fill="hsl(25, 40%, 35%)"
                          fillOpacity={0.3}
                        />
                        <RechartsRadar
                          name="Satapatha Brahmana"
                          dataKey="satapatha"
                          stroke="hsl(200, 60%, 50%)"
                          fill="hsl(200, 60%, 50%)"
                          fillOpacity={0.3}
                        />
                        <Legend />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="font-medium text-foreground">Shukla Yajurveda</p>
                      <p className="text-muted-foreground">{sampleWhiteYajurveda.length.toLocaleString()} verses in {textStatistics.white.totalAdhyayas} adhyayas</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="font-medium text-foreground">Krishna Yajurveda</p>
                      <p className="text-muted-foreground">{sampleBlackYajurveda.length.toLocaleString()} verses in {textStatistics.black.totalKandas} kandas</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="font-medium text-foreground">Satapatha Brahmana</p>
                      <p className="text-muted-foreground">{sampleSatapathaVerse.length.toLocaleString()} verses in {textStatistics.satapatha.totalMandals} mandalas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Word Frequency */}
              <Card className="max-w-6xl mx-auto">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="font-display flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Most Frequent Terms
                      </CardTitle>
                      <CardDescription>Key words appearing across the texts</CardDescription>
                    </div>
                    <div className="flex border rounded-lg overflow-hidden">
                      <Button 
                        variant={wordFrequencyView === 'All' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setWordFrequencyView('All')}
                        className="rounded-none text-xs px-3"
                      >
                        All
                      </Button>
                      <Button 
                        variant={wordFrequencyView === 'SY' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setWordFrequencyView('SY')}
                        className="rounded-none text-xs px-3"
                      >
                        SY
                      </Button>
                      <Button 
                        variant={wordFrequencyView === 'KY' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setWordFrequencyView('KY')}
                        className="rounded-none text-xs px-3"
                      >
                        KY
                      </Button>
                      <Button 
                        variant={wordFrequencyView === 'SB' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setWordFrequencyView('SB')}
                        className="rounded-none text-xs px-3"
                      >
                        SB
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wordFrequencyData.map((item, index) => (
                      <div 
                        key={item.word}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="font-display text-foreground text-sm">{item.word}</span>
                        </div>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Text Analysis Tab */}
            <TabsContent value="text-analysis" className="space-y-6">
              <TextAnalysisSection 
                analysisText={analysisText}
                setAnalysisText={setAnalysisText}
              />
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <div className="max-w-6xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <GitCompare className="w-5 h-5 text-primary" />
                      Text Comparison Tool
                    </CardTitle>
                    <CardDescription>
                      Compare verses from different traditions or recensions side by side
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-medium text-foreground">Text 1 (Shukla Yajurveda)</label>
                          <VerseSearchSelect
                            options={whiteVerseOptions}
                            value={selectedWhiteVerse}
                            onValueChange={setSelectedWhiteVerse}
                            placeholder="Search verse..."
                          />
                        </div>
                        <Textarea
                          placeholder="Enter or select text..."
                          value={comparisonText1}
                          onChange={(e) => setComparisonText1(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-medium text-foreground">Text 2 (Krishna Yajurveda)</label>
                          <VerseSearchSelect
                            options={blackVerseOptions}
                            value={selectedBlackVerse}
                            onValueChange={setSelectedBlackVerse}
                            placeholder="Search verse..."
                          />
                        </div>
                        <Textarea
                          placeholder="Enter or select text..."
                          value={comparisonText2}
                          onChange={(e) => setComparisonText2(e.target.value)}
                          className="min-h-[200px]"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-3">
                      <Button variant="sacred" size="lg" onClick={handleCompare}>
                        <GitCompare className="w-5 h-5" />
                        Compare Texts
                      </Button>
                      {comparisonMetrics && (
                        <Button 
                          variant="outline" 
                          size="lg" 
                          onClick={() => {
                            exportComparisonToPdf(comparisonText1, comparisonText2, comparisonMetrics);
                            toast.success('Comparison exported to PDF');
                          }}
                        >
                          <FileDown className="w-5 h-5" />
                          Export PDF
                        </Button>
                      )}
                    </div>

                    {comparisonMetrics && (
                      <div className="space-y-6 pt-4">
                        {/* Similarity Scores */}
                        <div className="p-5 rounded-xl bg-secondary/50 border">
                          <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Similarity Scores
                          </h4>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <SimilarityScore 
                              label="Cosine Similarity" 
                              value={comparisonMetrics.cosineSimilarity}
                              description="Term frequency based similarity"
                            />
                            <SimilarityScore 
                              label="Jaccard (Words)" 
                              value={comparisonMetrics.jaccardWord}
                              description="Word overlap ratio"
                            />
                            <SimilarityScore 
                              label="Jaccard (Bi-grams)" 
                              value={comparisonMetrics.jaccardBigram}
                              description="2-word phrase overlap"
                            />
                            <SimilarityScore 
                              label="Jaccard (Tri-grams)" 
                              value={comparisonMetrics.jaccardTrigram}
                              description="3-word phrase overlap"
                            />
                            <SimilarityScore 
                              label="Dice-Sørensen" 
                              value={comparisonMetrics.diceSorensen}
                              description="Harmonic mean of overlap"
                            />
                            <SimilarityScore 
                              label="Overlap Coefficient" 
                              value={comparisonMetrics.overlapCoefficient}
                              description="Containment similarity"
                            />
                          </div>
                        </div>

                        {/* Additional Metrics */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                            <div className="text-sm text-muted-foreground mb-1">Length Ratio</div>
                            <div className="text-2xl font-bold text-foreground">
                              {(comparisonMetrics.lengthRatio * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Shorter/Longer text ratio</div>
                          </div>
                          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                            <div className="text-sm text-muted-foreground mb-1">Vocabulary Overlap</div>
                            <div className="text-2xl font-bold text-foreground">
                              {(comparisonMetrics.vocabularyOverlap * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Shared unique words</div>
                          </div>
                        </div>

                        {/* Common Elements */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-green-500" />
                              Common Words ({comparisonMetrics.commonWords.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {comparisonMetrics.commonWords.map((word, i) => (
                                <Badge key={i} variant="secondary">{word}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-blue-500" />
                              Common Bi-grams ({comparisonMetrics.commonBigrams.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {comparisonMetrics.commonBigrams.length > 0 ? (
                                comparisonMetrics.commonBigrams.map((gram, i) => (
                                  <Badge key={i} variant="outline">{gram}</Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">No common bi-grams found</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Unique Words */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-amber-500" />
                              Unique to Text 1 ({comparisonMetrics.uniqueText1.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {comparisonMetrics.uniqueText1.map((word, i) => (
                                <Badge key={i} variant="outline">{word}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-purple-500" />
                              Unique to Text 2 ({comparisonMetrics.uniqueText2.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {comparisonMetrics.uniqueText2.map((word, i) => (
                                <Badge key={i} variant="outline">{word}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Tri-grams */}
                        {comparisonMetrics.commonTrigrams.length > 0 && (
                          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-cyan-500" />
                              Common Tri-grams ({comparisonMetrics.commonTrigrams.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {comparisonMetrics.commonTrigrams.map((gram, i) => (
                                <Badge key={i} variant="secondary">{gram}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Study Tools Tab */}
            <TabsContent value="study-tools" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {/* Bookmarks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-primary" />
                      Bookmarks ({bookmarksList.length})
                    </CardTitle>
                    <CardDescription>
                      Save important verses for quick access
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {bookmarksList.length === 0 ? (
                      <div className="text-center py-8">
                        <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No bookmarks yet</p>
                        <p className="text-sm text-muted-foreground">
                          Bookmark verses from the Explore tab
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {bookmarksList.map((bookmark, index) => (
                          <div key={index} className="p-3 rounded-lg bg-secondary/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                bookmark.type === 'SY' ? 'bg-primary/20 text-primary' :
                                bookmark.type === 'KY' ? 'bg-accent/20 text-accent-foreground' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {bookmark.type}
                              </span>
                              <span className="text-foreground">{bookmark.reference}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                removeBookmark(bookmark.reference);
                                toast.success('Bookmark removed');
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <StickyNote className="w-5 h-5 text-primary" />
                      Study Notes ({notes.length})
                    </CardTitle>
                    <CardDescription>
                      Write and save your thoughts and observations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Note title..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Write your notes here..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="min-h-[120px]"
                    />
                    <div className="flex gap-2">
                      <Button variant="sacred" className="flex-1" onClick={handleSaveNote}>
                        {editingNoteId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingNoteId ? 'Update Note' : 'Save Note'}
                      </Button>
                      {editingNoteId && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingNoteId(null);
                            setNoteTitle('');
                            setNoteContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      {notes.length > 0 && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            exportStudyNotesToPdf(notes);
                            toast.success('Notes exported to PDF');
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    {notes.length > 0 && (
                      <div className="space-y-2 pt-4 border-t max-h-[200px] overflow-y-auto custom-scrollbar">
                        {notes.map((note) => (
                          <div key={note.id} className="p-3 rounded-lg bg-secondary/50">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-foreground">{note.title}</h4>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleEditNote(note.id, note.title, note.content)}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => handleDeleteNote(note.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Reference */}
              <Card className="max-w-6xl mx-auto">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-primary" />
                    Quick Reference Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-display font-semibold text-foreground mb-2">Shukla (White) Yajurveda</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 40 Adhyayas (Chapters)</li>
                        <li>• ~1975 Mantras</li>
                        <li>• Vajasaneyi Samhita (Madhyandina)</li>
                        <li>• Associated with Satapatha Brahmana</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-display font-semibold text-foreground mb-2">Krishna (Black) Yajurveda</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 7 Kandas, 44 Prapathakas</li>
                        <li>• ~2198 Mantras</li>
                        <li>• Taittiriya Samhita</li>
                        <li>• Interweaves prose & mantras</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-display font-semibold text-foreground mb-2">Key Concepts</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Yajus = Sacrificial formulas</li>
                        <li>• Adhvaryu = Officiating priest</li>
                        <li>• Svaha = Offering exclamation</li>
                        <li>• Brahmana = Ritual commentary</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}

// Topic categories for semantic analysis
const topicCategories = [
  { name: 'Ritual & Sacrifice', keywords: ['sacrifice', 'offering', 'ritual', 'altar', 'fire', 'agni', 'soma', 'oblation', 'priest', 'ceremony', 'yajna', 'homa', 'svaha', 'oblations'] },
  { name: 'Deities & Divine', keywords: ['god', 'gods', 'divine', 'heaven', 'deva', 'indra', 'varuna', 'mitra', 'rudra', 'vishnu', 'prajapati', 'brahman', 'lord', 'celestial'] },
  { name: 'Nature & Cosmos', keywords: ['sun', 'moon', 'earth', 'sky', 'water', 'wind', 'light', 'dawn', 'night', 'stars', 'seasons', 'rain', 'fire', 'waters', 'cosmic'] },
  { name: 'Knowledge & Wisdom', keywords: ['knowledge', 'wisdom', 'truth', 'speech', 'word', 'mantra', 'veda', 'sacred', 'holy', 'prayer', 'meditation', 'enlightenment'] },
  { name: 'Life & Prosperity', keywords: ['life', 'wealth', 'prosperity', 'cattle', 'offspring', 'health', 'strength', 'power', 'victory', 'blessing', 'fortune', 'abundance'] },
  { name: 'Moral & Ethical', keywords: ['righteous', 'sin', 'evil', 'pure', 'purity', 'dharma', 'duty', 'virtue', 'good', 'bad', 'moral', 'ethical'] }
];

// Tone indicators
const toneIndicators = [
  { name: 'Devotional', keywords: ['praise', 'glory', 'worship', 'adore', 'revere', 'bow', 'homage', 'salutation', 'hail'], color: 'hsl(280, 70%, 50%)' },
  { name: 'Invocatory', keywords: ['come', 'arise', 'awake', 'invoke', 'call', 'summon', 'approach', 'hear', 'listen'], color: 'hsl(32, 90%, 50%)' },
  { name: 'Imperative', keywords: ['let', 'may', 'grant', 'give', 'bestow', 'protect', 'save', 'bless', 'make'], color: 'hsl(200, 70%, 50%)' },
  { name: 'Declarative', keywords: ['is', 'are', 'this', 'that', 'indeed', 'verily', 'truly', 'thus'], color: 'hsl(150, 60%, 45%)' },
  { name: 'Mystical', keywords: ['eternal', 'infinite', 'supreme', 'absolute', 'transcendent', 'cosmic', 'universal', 'om'], color: 'hsl(320, 60%, 50%)' }
];

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// AI-powered analysis using Groq
async function analyzeWithGroq(text: string, type: 'summary' | 'sentiment'): Promise<string> {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!groqKey) {
    throw new Error('Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.');
  }

  const prompts = {
    summary: `You are an expert in Vedic literature and Sanskrit texts. Analyze the following text and provide a comprehensive summary in this exact format:

**Summary:** [2-3 sentences capturing the main meaning and essence]

**Key Themes:** [List 3-5 main themes separated by commas]

**Key Concepts:** [List 4-6 important terms or concepts mentioned]

**Spiritual Significance:** [1-2 sentences on the deeper meaning if applicable]

Text to analyze:
"${text}"`,
    sentiment: `You are an expert in Vedic literature analysis. Analyze the tone and sentiment of the following text and provide analysis in this exact format:

**Primary Tone:** [e.g., Devotional, Invocatory, Mystical, Ritualistic, etc.]

**Emotional Quality:** [e.g., Reverential, Peaceful, Urgent, Celebratory, etc.]

**Sentiment Score:** [Rate from 1-10 where 1 is somber/serious and 10 is joyful/celebratory]

**Tone Breakdown:**
- Devotional: [percentage]%
- Philosophical: [percentage]%
- Ritualistic: [percentage]%
- Mystical: [percentage]%

**Analysis:** [2-3 sentences explaining the tonal qualities and emotional character]

Text to analyze:
"${text}"`
  };

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert scholar of Vedic literature with deep knowledge of Sanskrit texts, their meanings, and spiritual significance.' },
        { role: 'user', content: prompts[type] }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Unable to generate analysis.';
}

// Text Analysis Section Component with full functionality
function TextAnalysisSection({ 
  analysisText, 
  setAnalysisText 
}: { 
  analysisText: string; 
  setAnalysisText: (text: string) => void;
}) {
  const [activeAnalysis, setActiveAnalysis] = useState<'summary' | 'semantic' | 'tone' | 'frequency' | 'patterns' | 'crossref' | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSentiment, setAiSentiment] = useState<string | null>(null);
  const [crossRefResults, setCrossRefResults] = useState<{ shukla: typeof sampleWhiteYajurveda; krishna: typeof sampleBlackYajurveda } | null>(null);

  // Calculate word frequency
  const wordFrequency = useMemo(() => {
    if (!analysisText) return [];
    const words = analysisText.toLowerCase().split(/\s+/).filter(Boolean);
    const freq: Record<string, number> = {};
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
      if (cleanWord.length > 2) {
        freq[cleanWord] = (freq[cleanWord] || 0) + 1;
      }
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [analysisText]);

  // Find patterns (repeated phrases)
  const patterns = useMemo(() => {
    if (!analysisText) return [];
    const words = analysisText.toLowerCase().split(/\s+/).filter(Boolean);
    const phrases: Record<string, number> = {};
    
    for (let i = 0; i < words.length - 1; i++) {
      const twoWord = words.slice(i, i + 2).join(' ');
      phrases[twoWord] = (phrases[twoWord] || 0) + 1;
      
      if (i < words.length - 2) {
        const threeWord = words.slice(i, i + 3).join(' ');
        phrases[threeWord] = (phrases[threeWord] || 0) + 1;
      }
    }
    
    return Object.entries(phrases)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [analysisText]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!analysisText) return null;
    const words = analysisText.split(/\s+/).filter(Boolean);
    const sentences = analysisText.split(/[.!?]+/).filter(Boolean);
    const lines = analysisText.split('\n').filter(Boolean);
    const avgWordLength = words.length > 0 
      ? (words.reduce((acc, w) => acc + w.length, 0) / words.length).toFixed(1)
      : 0;
    const avgSentenceLength = sentences.length > 0
      ? (words.length / sentences.length).toFixed(1)
      : 0;
    
    return {
      words: words.length,
      characters: analysisText.length,
      sentences: sentences.length,
      lines: lines.length,
      avgWordLength,
      avgSentenceLength,
      uniqueWords: new Set(words.map(w => w.toLowerCase())).size
    };
  }, [analysisText]);

  // Generate comprehensive summary
  const summary = useMemo(() => {
    if (!analysisText || analysisText.length < 20) return null;
    const words = analysisText.split(/\s+/).filter(Boolean);
    const sentences = analysisText.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const textLower = analysisText.toLowerCase();
    
    // Identify key themes
    const detectedThemes: { name: string; count: number }[] = [];
    topicCategories.forEach(cat => {
      const matches = cat.keywords.filter(kw => textLower.includes(kw));
      if (matches.length > 0) {
        detectedThemes.push({ name: cat.name, count: matches.length });
      }
    });
    detectedThemes.sort((a, b) => b.count - a.count);
    
    // Extract most important words (content words, excluding common stop words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'who', 'which', 'what', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'as', 'if', 'then', 'because', 'while', 'although', 'though', 'after', 'before', 'since', 'until', 'unless', 'unto', 'upon', 'thee', 'thou', 'thy', 'ye', 'him', 'her', 'his', 'its', 'them', 'their', 'our', 'your', 'my']);
    
    const wordFreq: Record<string, number> = {};
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[.,!?;:'"()]/g, '');
      if (clean.length > 2 && !stopWords.has(clean)) {
        wordFreq[clean] = (wordFreq[clean] || 0) + 1;
      }
    });
    
    const keyWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    // Build a meaningful summary
    const mainTheme = detectedThemes[0]?.name || 'general content';
    const secondaryTheme = detectedThemes[1]?.name;
    
    let summaryText = '';
    if (keyWords.length > 0) {
      const keyTerms = keyWords.slice(0, 3).join(', ');
      summaryText = `This passage focuses on ${mainTheme.toLowerCase()}`;
      if (secondaryTheme) {
        summaryText += ` with elements of ${secondaryTheme.toLowerCase()}`;
      }
      summaryText += `. Key concepts include: ${keyTerms}.`;
      
      if (sentences.length > 0) {
        summaryText += ` The text contains ${sentences.length} sentence${sentences.length > 1 ? 's' : ''} expressing ${
          detectedThemes.length > 2 ? 'multiple interconnected themes' : 
          detectedThemes.length > 0 ? 'focused thematic content' : 
          'descriptive narrative'
        }.`;
      }
    } else {
      // Fallback for short texts
      summaryText = sentences[0]?.trim() || analysisText.slice(0, 150);
      if (summaryText.length > 100) summaryText = summaryText.slice(0, 100) + '...';
    }
    
    const themeText = detectedThemes.length > 0 
      ? detectedThemes.slice(0, 3).map(t => t.name).join(', ')
      : 'General';
    
    return {
      brief: summaryText,
      themes: themeText,
      keyWords,
      wordCount: words.length,
      sentenceCount: sentences.length,
      readingTime: Math.max(1, Math.ceil(words.length / 200))
    };
  }, [analysisText]);

  // Semantic analysis with improved detection
  const semanticAnalysis = useMemo(() => {
    if (!analysisText) return [];
    const textLower = analysisText.toLowerCase();
    const words = textLower.split(/\s+/);
    
    return topicCategories.map(cat => {
      const matches = cat.keywords.filter(kw => textLower.includes(kw));
      // Weight by frequency of matches
      let totalOccurrences = 0;
      matches.forEach(kw => {
        const regex = new RegExp(kw, 'gi');
        const found = textLower.match(regex);
        totalOccurrences += found ? found.length : 0;
      });
      const score = Math.min(100, matches.length * 12 + totalOccurrences * 3);
      return {
        name: cat.name,
        score,
        keywords: matches.slice(0, 5),
        occurrences: totalOccurrences
      };
    }).filter(cat => cat.score > 0).sort((a, b) => b.score - a.score);
  }, [analysisText]);

  // Enhanced tone analysis with fallback
  const toneAnalysis = useMemo(() => {
    if (!analysisText) return [];
    const textLower = analysisText.toLowerCase();
    const words = textLower.split(/\s+/);
    
    // Extended tone indicators with more keywords
    const extendedToneIndicators = [
      { name: 'Devotional', keywords: ['praise', 'glory', 'worship', 'adore', 'revere', 'bow', 'homage', 'salutation', 'hail', 'blessed', 'divine', 'sacred', 'holy', 'lord', 'god', 'gods', 'deva', 'prayer', 'hymn'], color: 'hsl(280, 70%, 50%)' },
      { name: 'Invocatory', keywords: ['come', 'arise', 'awake', 'invoke', 'call', 'summon', 'approach', 'hear', 'listen', 'attend', 'hither', 'bring', 'accept', 'receive'], color: 'hsl(32, 90%, 50%)' },
      { name: 'Imperative', keywords: ['let', 'may', 'grant', 'give', 'bestow', 'protect', 'save', 'bless', 'make', 'shall', 'must', 'obtain', 'win', 'gain', 'secure'], color: 'hsl(200, 70%, 50%)' },
      { name: 'Declarative', keywords: ['is', 'are', 'this', 'that', 'indeed', 'verily', 'truly', 'thus', 'so', 'therefore', 'hence', 'becomes', 'exists'], color: 'hsl(150, 60%, 45%)' },
      { name: 'Mystical', keywords: ['eternal', 'infinite', 'supreme', 'absolute', 'transcendent', 'cosmic', 'universal', 'om', 'brahman', 'atman', 'spirit', 'soul', 'immortal', 'beyond'], color: 'hsl(320, 60%, 50%)' },
      { name: 'Ritualistic', keywords: ['sacrifice', 'offering', 'ritual', 'oblation', 'altar', 'fire', 'soma', 'ghee', 'priest', 'ceremony', 'rite', 'perform'], color: 'hsl(45, 80%, 45%)' },
      { name: 'Descriptive', keywords: ['bright', 'golden', 'mighty', 'great', 'strong', 'beautiful', 'splendid', 'radiant', 'shining', 'glorious', 'vast', 'wide'], color: 'hsl(180, 50%, 45%)' }
    ];
    
    const results = extendedToneIndicators.map(tone => {
      const matches = tone.keywords.filter(kw => textLower.includes(kw));
      let totalOccurrences = 0;
      matches.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'gi');
        const found = textLower.match(regex);
        totalOccurrences += found ? found.length : 0;
      });
      const score = Math.min(100, matches.length * 15 + totalOccurrences * 5);
      return {
        name: tone.name,
        score,
        color: tone.color,
        keywords: matches.slice(0, 4)
      };
    }).filter(t => t.score > 0).sort((a, b) => b.score - a.score);
    
    // If no tones detected, provide a default analysis
    if (results.length === 0 && words.length > 5) {
      return [{
        name: 'Neutral',
        score: 50,
        color: 'hsl(220, 15%, 50%)',
        keywords: ['general text']
      }];
    }
    
    return results;
  }, [analysisText]);

  // Improved cross-reference finder with scoring
  const findCrossReferences = () => {
    if (!analysisText || analysisText.length < 10) {
      toast.error('Please enter text to find cross-references');
      return;
    }
    
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'who', 'which', 'unto', 'thee', 'thou', 'thy', 'ye']);
    
    const searchWords = analysisText.toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[.,!?;:'"()]/g, ''))
      .filter(w => w.length > 2 && !stopWords.has(w));
    
    const searchSet = new Set(searchWords);
    
    // Score verses by how many matching words they contain
    const scoreVerse = (verseText: string) => {
      const verseWords = verseText.toLowerCase().split(/\s+/).map(w => w.replace(/[.,!?;:'"()]/g, ''));
      let score = 0;
      verseWords.forEach(w => {
        if (searchSet.has(w)) score++;
      });
      return score;
    };
    
    // Find and score matching verses in Shukla
    const shuklaScored = sampleWhiteYajurveda
      .map(verse => ({ ...verse, score: scoreVerse(verse.text) }))
      .filter(v => v.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    // Find and score matching verses in Krishna
    const krishnaScored = sampleBlackYajurveda
      .map(verse => ({ ...verse, score: scoreVerse(verse.text) }))
      .filter(v => v.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    setCrossRefResults({ shukla: shuklaScored, krishna: krishnaScored });
    setActiveAnalysis('crossref');
    
    const totalFound = shuklaScored.length + krishnaScored.length;
    if (totalFound > 0) {
      toast.success(`Found ${totalFound} related verses`);
    } else {
      toast.info('No closely matching verses found. Try different keywords.');
    }
  };

  // Check if API key is configured
  const hasApiKey = Boolean(import.meta.env.VITE_GROQ_API_KEY);

  // Handle AI-powered analysis
  const handleAiAnalysis = async (type: 'summary' | 'tone') => {
    // Check for API key first
    if (!hasApiKey) {
      setActiveAnalysis(type);
      if (type === 'summary') {
        setAiSummary(null);
      } else {
        setAiSentiment(null);
      }
      return;
    }
    
    if (!analysisText || analysisText.length < 20) {
      toast.error('Please enter more text for AI analysis');
      return;
    }
    
    setIsAiLoading(true);
    setActiveAnalysis(type);
    
    try {
      const result = await analyzeWithGroq(analysisText, type === 'summary' ? 'summary' : 'sentiment');
      if (type === 'summary') {
        setAiSummary(result);
      } else {
        setAiSentiment(result);
      }
      toast.success(`${type === 'summary' ? 'Summary' : 'Sentiment analysis'} generated with AI`);
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'AI analysis failed');
      if (type === 'summary') {
        setAiSummary(null);
      } else {
        setAiSentiment(null);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  // Clear AI results when text changes
  useEffect(() => {
    setAiSummary(null);
    setAiSentiment(null);
  }, [analysisText]);

  const analysisButtons = [
    { id: 'summary', label: 'Summarize', icon: BookOpen, description: 'AI Summary', isAi: true },
    { id: 'semantic', label: 'Topics', icon: PieChart, description: 'Theme detection', isAi: false },
    { id: 'tone', label: 'Tone', icon: Sparkles, description: 'AI Sentiment', isAi: true },
    { id: 'frequency', label: 'Frequency', icon: BarChart3, description: 'Word counts', isAi: false },
    { id: 'patterns', label: 'Patterns', icon: Search, description: 'Repeated phrases', isAi: false },
    { id: 'crossref', label: 'Cross-Ref', icon: GitCompare, description: 'Find similar', isAi: false },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Input Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="font-display flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Text Analysis Tool
          </CardTitle>
          <CardDescription>
            Paste any verse or text to unlock deep insights - summaries, themes, tone, and cross-references
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Enter Sanskrit or English text for analysis... Try pasting a verse from the Explore tab!"
            value={analysisText}
            onChange={(e) => setAnalysisText(e.target.value)}
            className="min-h-[160px] font-body text-base resize-none"
          />
          
          {/* Analysis Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {analysisButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = activeAnalysis === btn.id;
              const isLoading = isAiLoading && activeAnalysis === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => {
                    if (btn.id === 'crossref') {
                      findCrossReferences();
                    } else if (btn.isAi && (btn.id === 'summary' || btn.id === 'tone')) {
                      handleAiAnalysis(btn.id);
                    } else {
                      setActiveAnalysis(isActive ? null : btn.id);
                    }
                  }}
                  disabled={(!analysisText && btn.id !== 'crossref') || isLoading}
                  className={`
                    group relative p-4 rounded-xl border-2 transition-all duration-300
                    ${isActive 
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                      : 'border-border/50 hover:border-primary/50 hover:bg-secondary/50'}
                    ${(!analysisText && btn.id !== 'crossref') || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {btn.isAi && (
                    <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                      AI
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground group-hover:text-primary'}
                    `}>
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {btn.label}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {btn.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics Card - Always visible when text exists */}
      {stats && (
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 text-center">
              {[
                { value: stats.words, label: 'Words' },
                { value: stats.characters, label: 'Chars' },
                { value: stats.sentences, label: 'Sentences' },
                { value: stats.uniqueWords, label: 'Unique' },
                { value: stats.lines, label: 'Lines' },
                { value: stats.avgWordLength, label: 'Avg Len' },
                { value: stats.avgSentenceLength, label: 'W/Sent' },
                { value: `${stats.words > 0 ? ((stats.uniqueWords / stats.words) * 100).toFixed(0) : 0}%`, label: 'Density' },
              ].map((stat, i) => (
                <div key={i} className="p-2 rounded-lg bg-secondary/30">
                  <p className="text-lg font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Section - AI Powered */}
      {activeAnalysis === 'summary' && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-primary" />
              AI-Powered Summary
              <Badge variant="secondary" className="ml-2 text-xs">Powered by Groq</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasApiKey ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">API Key Required</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Please configure your Groq API key to use AI-powered summary.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add <code className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">VITE_GROQ_API_KEY</code> to your .env file
                </p>
              </div>
            ) : isAiLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground">Analyzing with AI...</p>
              </div>
            ) : aiSummary ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 whitespace-pre-wrap">
                  {aiSummary.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h4 key={i} className="font-semibold text-primary mt-3 mb-1">{line.replace(/\*\*/g, '')}</h4>;
                    }
                    if (line.startsWith('**')) {
                      const parts = line.split('**');
                      return (
                        <p key={i} className="text-foreground leading-relaxed my-1">
                          <strong className="text-primary">{parts[1]}:</strong>{parts[2]}
                        </p>
                      );
                    }
                    return line.trim() ? <p key={i} className="text-foreground leading-relaxed my-1">{line}</p> : null;
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Enter text and click Summarize to get an AI-powered analysis.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Semantic Analysis Section */}
      {activeAnalysis === 'semantic' && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5 text-primary" />
              Topic Analysis
            </CardTitle>
            <CardDescription>Detected themes and their prominence in the text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {semanticAnalysis.length > 0 ? (
              <div className="grid gap-4">
                {semanticAnalysis.map((topic, idx) => (
                  <div key={topic.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-foreground">{topic.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{topic.score}%</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${topic.score}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {topic.keywords.map(kw => (
                        <Badge key={kw} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No specific Vedic themes detected.</p>
                <p className="text-sm text-muted-foreground mt-1">Try entering text with ritual, deity, or cosmic terminology.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tone Analysis Section - AI Powered */}
      {activeAnalysis === 'tone' && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Sentiment Analysis
              <Badge variant="secondary" className="ml-2 text-xs">Powered by Groq</Badge>
            </CardTitle>
            <CardDescription>Deep emotional and tonal analysis powered by AI</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasApiKey ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">API Key Required</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Please configure your Groq API key to use AI-powered sentiment analysis.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add <code className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">VITE_GROQ_API_KEY</code> to your .env file
                </p>
              </div>
            ) : isAiLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground">Analyzing sentiment with AI...</p>
              </div>
            ) : aiSentiment ? (
              <div className="grid gap-4">
                {/* Parse and display sentiment results in a visual format */}
                {(() => {
                  const lines = aiSentiment.split('\n').filter(l => l.trim());
                  const primaryTone = lines.find(l => l.includes('Primary Tone'))?.split(':')[1]?.replace(/\*\*/g, '').trim() || '';
                  const emotionalQuality = lines.find(l => l.includes('Emotional Quality'))?.split(':')[1]?.replace(/\*\*/g, '').trim() || '';
                  const sentimentScore = parseInt(lines.find(l => l.includes('Sentiment Score'))?.match(/\d+/)?.[0] || '5');
                  const analysis = lines.find(l => l.includes('Analysis'))?.split(':').slice(1).join(':').replace(/\*\*/g, '').trim() || '';
                  
                  // Extract tone breakdown percentages
                  const toneBreakdown = [
                    { name: 'Devotional', value: parseInt(lines.find(l => l.includes('Devotional:'))?.match(/\d+/)?.[0] || '0') },
                    { name: 'Philosophical', value: parseInt(lines.find(l => l.includes('Philosophical:'))?.match(/\d+/)?.[0] || '0') },
                    { name: 'Ritualistic', value: parseInt(lines.find(l => l.includes('Ritualistic:'))?.match(/\d+/)?.[0] || '0') },
                    { name: 'Mystical', value: parseInt(lines.find(l => l.includes('Mystical:'))?.match(/\d+/)?.[0] || '0') },
                  ].filter(t => t.value > 0).sort((a, b) => b.value - a.value);

                  return (
                    <>
                      {/* Primary Metrics Row */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                              <Sparkles className="w-4 h-4" />
                            </span>
                            <span className="text-sm text-muted-foreground">Primary Tone</span>
                          </div>
                          <p className="text-lg font-semibold text-foreground">{primaryTone || 'Analyzing...'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-8 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center">
                              💫
                            </span>
                            <span className="text-sm text-muted-foreground">Emotional Quality</span>
                          </div>
                          <p className="text-lg font-semibold text-foreground">{emotionalQuality || 'Analyzing...'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
                              ⚡
                            </span>
                            <span className="text-sm text-muted-foreground">Sentiment Score</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold text-foreground">{sentimentScore}/10</p>
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                                style={{ width: `${sentimentScore * 10}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tone Breakdown */}
                      {toneBreakdown.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground">Tone Breakdown</h4>
                          {toneBreakdown.map((tone, idx) => (
                            <div key={tone.name} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <span className="font-medium text-foreground">{tone.name}</span>
                                </div>
                                <span className="text-sm font-bold text-primary">{tone.value}%</span>
                              </div>
                              <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                                <div 
                                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                  style={{ width: `${tone.value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Analysis */}
                      {analysis && (
                        <div className="p-4 rounded-xl bg-secondary/50 border">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Analysis</h4>
                          <p className="text-foreground leading-relaxed">{analysis}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">Enter text and click Tone to get AI sentiment analysis.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Word Frequency Section */}
      {activeAnalysis === 'frequency' && wordFrequency.length > 0 && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              Word Frequency
            </CardTitle>
            <CardDescription>Most frequently used words in the text</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wordFrequency.map(([word, count]) => ({ word, count }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    type="category" 
                    dataKey="word" 
                    stroke="hsl(var(--muted-foreground))" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(32, 90%, 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patterns Section */}
      {activeAnalysis === 'patterns' && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <Search className="w-5 h-5 text-primary" />
              Repeated Patterns
            </CardTitle>
            <CardDescription>Phrases and word combinations that appear multiple times</CardDescription>
          </CardHeader>
          <CardContent>
            {patterns.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {patterns.map(([phrase, count], index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-secondary/50 to-secondary/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">"{phrase}"</span>
                    </div>
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30">{count}×</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No repeated patterns found in the text.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cross-Reference Section */}
      {activeAnalysis === 'crossref' && crossRefResults && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <GitCompare className="w-5 h-5 text-primary" />
              Cross-References Found
            </CardTitle>
            <CardDescription>Similar verses from Shukla and Krishna traditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Shukla Results */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                Shukla Yajurveda ({crossRefResults.shukla.length})
              </h4>
              {crossRefResults.shukla.length > 0 ? (
                <div className="space-y-2">
                  {crossRefResults.shukla.map((verse, i) => (
                    <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{verse.reference}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{verse.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No matching verses found</p>
              )}
            </div>
            
            {/* Krishna Results */}
            <div>
              <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent" />
                Krishna Yajurveda ({crossRefResults.krishna.length})
              </h4>
              {crossRefResults.krishna.length > 0 ? (
                <div className="space-y-2">
                  {crossRefResults.krishna.map((verse, i) => (
                    <div key={i} className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{verse.reference}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{verse.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No matching verses found</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!analysisText && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Type className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Enter Text to Analyze</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Paste a verse or any text above to unlock powerful analysis tools including summaries, 
              topic detection, tone analysis, and cross-references between traditions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
