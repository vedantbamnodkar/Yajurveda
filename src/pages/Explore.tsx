import { useState, useMemo, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  sampleWhiteYajurveda, 
  sampleBlackYajurveda, 
  sampleSatapathaVerse,
  WhiteYajurvedaVerse,
  BlackYajurvedaVerse,
  SatapathaVerse
} from '@/data/sampleData';
import { Search, Filter, ChevronLeft, ChevronRight, BookOpen, Scroll, BookMarked, Eye, EyeOff, LayoutGrid, LayoutList, Bookmark, X } from 'lucide-react';
import { useBookmarks, ScriptureType } from '@/hooks/useBookmarks';
import AudioPlayer from '@/components/AudioPlayer';

const ITEMS_PER_PAGE_LIST = 10;
const ITEMS_PER_PAGE_GRID = 9;

type ViewMode = 'list' | 'grid';

export default function Explore() {
  const [activeTab, setActiveTab] = useState('white');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTranslation, setShowTranslation] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();
  const [expandedVerse, setExpandedVerse] = useState<WhiteYajurvedaVerse | BlackYajurvedaVerse | SatapathaVerse | null>(null);

  const itemsPerPage = viewMode === 'list' ? ITEMS_PER_PAGE_LIST : ITEMS_PER_PAGE_GRID;

  // Get unique adhyayas from white Yajurveda
  const whiteAdhyayas = useMemo(() => {
    const unique = [...new Set(sampleWhiteYajurveda.map(v => v.adhyaya))];
    return unique.sort((a, b) => a - b);
  }, []);

  // Get unique kandas from black Yajurveda
  const blackKandas = useMemo(() => {
    const unique = [...new Set(sampleBlackYajurveda.map(v => v.kanda))];
    return unique.sort((a, b) => a - b);
  }, []);

  // Get unique mandalas from Satapatha
  const satapathaMandalas = useMemo(() => {
    const unique = [...new Set(sampleSatapathaVerse.map(v => v.mandala))];
    return unique.sort((a, b) => a - b);
  }, []);

  // Filter data based on search and chapter/kanda
  const filteredData = useMemo(() => {
    if (activeTab === 'white') {
      return sampleWhiteYajurveda.filter(verse => {
        const matchesSearch = searchQuery === '' || 
          verse.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          verse.meaning.includes(searchQuery) ||
          verse.reference.includes(searchQuery);
        
        const matchesChapter = selectedChapter === 'all' || 
          verse.adhyaya.toString() === selectedChapter;
        
        return matchesSearch && matchesChapter;
      });
    } else if (activeTab === 'black') {
      return sampleBlackYajurveda.filter(verse => {
        const matchesSearch = searchQuery === '' || 
          verse.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          verse.meaning.includes(searchQuery) ||
          verse.reference.includes(searchQuery);
        
        const matchesChapter = selectedChapter === 'all' || 
          verse.kanda.toString() === selectedChapter;
        
        return matchesSearch && matchesChapter;
      });
    } else {
      return sampleSatapathaVerse.filter(verse => {
        const matchesSearch = searchQuery === '' || 
          verse.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          verse.meaning.includes(searchQuery) ||
          verse.sanskrit_iast.toLowerCase().includes(searchQuery.toLowerCase()) ||
          verse.reference.includes(searchQuery);
        
        const matchesChapter = selectedChapter === 'all' || 
          verse.mandala.toString() === selectedChapter;
        
        return matchesSearch && matchesChapter;
      });
    }
  }, [activeTab, searchQuery, selectedChapter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleChapterChange = (value: string) => {
    setSelectedChapter(value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    setSelectedChapter('all');
    setSearchQuery('');
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const getChapterOptions = () => {
    if (activeTab === 'white') {
      return whiteAdhyayas.map(num => ({ value: num.toString(), label: `Adhyaya ${num}` }));
    } else if (activeTab === 'black') {
      return blackKandas.map(num => ({ value: num.toString(), label: `Kanda ${num}` }));
    } else {
      return satapathaMandalas.map(num => ({ value: num.toString(), label: `Mandala ${num}` }));
    }
  };

  // Keyboard navigation (arrow keys only)
  const handleKeyNavigation = useCallback((e: KeyboardEvent) => {
    // Don't trigger if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
        if (currentPage < totalPages) {
          setCurrentPage(p => p + 1);
        }
        break;
      case 'ArrowLeft':
        if (currentPage > 1) {
          setCurrentPage(p => p - 1);
        }
        break;
      case 'Escape':
        setExpandedVerse(null);
        break;
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-hero py-12 px-4 mandala-pattern">
        <div className="container mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explore the Sacred Texts
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dive deep into the verses of Yajurveda and the wisdom of Satapatha Brahmana
          </p>
        </div>
      </section>
      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            {/* Tab List */}
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 h-auto p-1 bg-secondary">
              <TabsTrigger 
                value="white" 
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Scroll className="w-4 h-4" />
                <span className="hidden sm:inline">Shukla (White)</span>
                <span className="sm:hidden">White</span>
              </TabsTrigger>
              <TabsTrigger 
                value="black"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                <Scroll className="w-4 h-4" />
                <span className="hidden sm:inline">Krishna (Black)</span>
                <span className="sm:hidden">Black</span>
              </TabsTrigger>
              <TabsTrigger 
                value="satapatha"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BookMarked className="w-4 h-4" />
                <span className="hidden sm:inline">Satapatha</span>
                <span className="sm:hidden">Satapatha</span>
              </TabsTrigger>
            </TabsList>

            {/* Search, Filter and Toggle */}
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by text, Sanskrit, or reference..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                
                <div className="flex items-center gap-2 sm:w-64">
                  <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <Select value={selectedChapter} onValueChange={handleChapterChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={activeTab === 'white' ? 'All Adhyayas' : activeTab === 'black' ? 'All Kandas' : 'All Mandalas'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {activeTab === 'white' ? 'All Adhyayas' : activeTab === 'black' ? 'All Kandas' : 'All Mandalas'}
                      </SelectItem>
                      {getChapterOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="gap-2"
                  >
                    {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showTranslation ? 'Hide Translation/Commentary' : 'Show Translation/Commentary'}
                  </Button>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeChange('list')}
                      className="rounded-r-none"
                    >
                      <LayoutList className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeChange('grid')}
                      className="rounded-l-none"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <span className="text-sm text-muted-foreground">
                  Showing {paginatedData.length} of {filteredData.length} verses
                </span>
              </div>

              {/* Audio Player - Only for Shukla and Krishna */}
              {(activeTab === 'white' || activeTab === 'black') && selectedChapter !== 'all' && (
                <AudioPlayer 
                  scripture={activeTab as 'white' | 'black'} 
                  chapter={parseInt(selectedChapter)} 
                />
              )}
            </div>

            {/* Content */}
            <TabsContent value="white" className="space-y-4">
              {viewMode === 'list' ? (
                <WhiteVerseList 
                  verses={paginatedData as WhiteYajurvedaVerse[]} 
                  showTranslation={showTranslation}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={(ref) => toggleBookmark(ref, 'SY')}
                />
              ) : (
                <WhiteVerseGrid 
                  verses={paginatedData as WhiteYajurvedaVerse[]}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={(ref) => toggleBookmark(ref, 'SY')}
                  onExpand={setExpandedVerse}
                />
              )}
            </TabsContent>

            <TabsContent value="black" className="space-y-4">
              {viewMode === 'list' ? (
                <BlackVerseList 
                  verses={paginatedData as BlackYajurvedaVerse[]} 
                  showTranslation={showTranslation}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={(ref) => toggleBookmark(ref, 'KY')}
                />
              ) : (
                <BlackVerseGrid 
                  verses={paginatedData as BlackYajurvedaVerse[]}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={(ref) => toggleBookmark(ref, 'KY')}
                  onExpand={setExpandedVerse}
                />
              )}
            </TabsContent>

            <TabsContent value="satapatha" className="space-y-4">
              {viewMode === 'list' ? (
                <SatapathaList 
                  verses={paginatedData as SatapathaVerse[]} 
                  showTranslation={showTranslation}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={(ref) => toggleBookmark(ref, 'SB')}
                />
              ) : (
                <SatapathaGrid 
                  verses={paginatedData as SatapathaVerse[]}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={(ref) => toggleBookmark(ref, 'SB')}
                  onExpand={setExpandedVerse}
                />
              )}
            </TabsContent>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Tabs>
        </div>
      </section>

      {/* Expanded Verse Panel (Slide Up) */}
      {expandedVerse && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm" onClick={() => setExpandedVerse(null)}>
          <div 
            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-t border-x rounded-t-xl shadow-xl animate-slide-up-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Verse {expandedVerse.reference}</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const type: ScriptureType = activeTab === 'white' ? 'SY' : activeTab === 'black' ? 'KY' : 'SB';
                    toggleBookmark(expandedVerse.reference, type);
                  }}
                >
                  <Bookmark 
                    className={`w-5 h-5 ${isBookmarked(expandedVerse.reference) ? 'fill-primary text-primary' : ''}`} 
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpandedVerse(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {'meaning' in expandedVerse && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Sanskrit</p>
                  <p className="sanskrit-text text-foreground leading-relaxed">{expandedVerse.meaning}</p>
                </div>
              )}
              {'sanskrit_iast' in expandedVerse && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Sanskrit (IAST)</p>
                  <p className="text-foreground leading-relaxed italic">{expandedVerse.sanskrit_iast}</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Translation</p>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{expandedVerse.text}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Bookmark Button Component
function BookmarkButton({ 
  reference, 
  isBookmarked, 
  onToggle 
}: { 
  reference: string; 
  isBookmarked: boolean; 
  onToggle: (ref: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(reference);
      }}
    >
      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
    </Button>
  );
}

// White Yajurveda List Component
function WhiteVerseList({ 
  verses, 
  showTranslation,
  isBookmarked,
  onToggleBookmark
}: { 
  verses: WhiteYajurvedaVerse[]; 
  showTranslation: boolean;
  isBookmarked: (ref: string) => boolean;
  onToggleBookmark: (ref: string) => void;
}) {
  if (verses.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No verses found matching your search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {verses.map((verse, index) => (
        <Card 
          key={verse.reference} 
          className="verse-card animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="verse-number">
                  {verse.verse_actual}
                </span>
                <div>
                  <CardTitle className="text-base font-display">
                    Adhyaya {verse.adhyaya}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Reference: {verse.reference}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookmarkButton 
                  reference={verse.reference} 
                  isBookmarked={isBookmarked(verse.reference)}
                  onToggle={onToggleBookmark}
                />
                <Badge variant="default">Shukla</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Sanskrit</p>
              <p className="sanskrit-text text-foreground leading-relaxed">{verse.meaning}</p>
            </div>
            {showTranslation && (
              <div>
                <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Translation</p>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{verse.text}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// White Yajurveda Grid Component
function WhiteVerseGrid({ 
  verses,
  isBookmarked,
  onToggleBookmark,
  onExpand
}: { 
  verses: WhiteYajurvedaVerse[];
  isBookmarked: (ref: string) => boolean;
  onToggleBookmark: (ref: string) => void;
  onExpand: (verse: WhiteYajurvedaVerse) => void;
}) {
  if (verses.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No verses found matching your search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
      {verses.map((verse, index) => (
        <Card 
          key={verse.reference} 
          className="verse-card animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => onExpand(verse)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="verse-number text-sm w-6 h-6 flex items-center justify-center">
                  {verse.verse_actual}
                </span>
                <Badge variant="default" className="text-xs">Shukla</Badge>
              </div>
              <BookmarkButton 
                reference={verse.reference} 
                isBookmarked={isBookmarked(verse.reference)}
                onToggle={onToggleBookmark}
              />
            </div>
            <p className="text-xs text-muted-foreground">Adhyaya {verse.adhyaya} • {verse.reference}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-4">{verse.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Black Yajurveda List Component
function BlackVerseList({ 
  verses, 
  showTranslation,
  isBookmarked,
  onToggleBookmark
}: { 
  verses: BlackYajurvedaVerse[]; 
  showTranslation: boolean;
  isBookmarked: (ref: string) => boolean;
  onToggleBookmark: (ref: string) => void;
}) {
  if (verses.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <Scroll className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No verses found matching your search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {verses.map((verse, index) => (
        <Card 
          key={verse.reference} 
          className="verse-card animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="verse-number">
                  {verse.verse}
                </span>
                <div>
                  <CardTitle className="text-base font-display">
                    Kanda {verse.kanda}, Prapathaka {verse.prapathaka}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Reference: {verse.reference}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookmarkButton 
                  reference={verse.reference} 
                  isBookmarked={isBookmarked(verse.reference)}
                  onToggle={onToggleBookmark}
                />
                <Badge variant="outline" className="text-xs">Mantra #{verse.mantra_count}</Badge>
                <Badge variant="secondary">Krishna</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Sanskrit</p>
              <p className="sanskrit-text text-foreground leading-relaxed">{verse.meaning}</p>
            </div>
            {showTranslation && (
              <div>
                <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Translation</p>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{verse.text}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Black Yajurveda Grid Component
function BlackVerseGrid({ 
  verses,
  isBookmarked,
  onToggleBookmark,
  onExpand
}: { 
  verses: BlackYajurvedaVerse[];
  isBookmarked: (ref: string) => boolean;
  onToggleBookmark: (ref: string) => void;
  onExpand: (verse: BlackYajurvedaVerse) => void;
}) {
  if (verses.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <Scroll className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No verses found matching your search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
      {verses.map((verse, index) => (
        <Card 
          key={verse.reference} 
          className="verse-card animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => onExpand(verse)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="verse-number text-sm w-6 h-6 flex items-center justify-center">
                  {verse.verse}
                </span>
                <Badge variant="secondary" className="text-xs">Krishna</Badge>
              </div>
              <BookmarkButton 
                reference={verse.reference} 
                isBookmarked={isBookmarked(verse.reference)}
                onToggle={onToggleBookmark}
              />
            </div>
            <p className="text-xs text-muted-foreground">Kanda {verse.kanda} • {verse.reference}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-4">{verse.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Satapatha Brahmana List Component
function SatapathaList({ 
  verses, 
  showTranslation,
  isBookmarked,
  onToggleBookmark
}: { 
  verses: SatapathaVerse[]; 
  showTranslation: boolean;
  isBookmarked: (ref: string) => boolean;
  onToggleBookmark: (ref: string) => void;
}) {
  if (verses.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No sections found matching your search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {verses.map((verse, index) => (
        <Card 
          key={verse.reference} 
          className="verse-card animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="verse-number">
                  {verse.verse}
                </span>
                <div>
                  <CardTitle className="text-base font-display">
                    Mandala {verse.mandala}, Hymn {verse.hymn}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Reference: {verse.reference}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookmarkButton 
                  reference={verse.reference} 
                  isBookmarked={isBookmarked(verse.reference)}
                  onToggle={onToggleBookmark}
                />
                <Badge variant="outline">Satapatha</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Sanskrit</p>
              <p className="sanskrit-text text-foreground leading-relaxed">{verse.meaning}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Sanskrit (IAST)</p>
              <p className="text-foreground leading-relaxed italic">{verse.sanskrit_iast}</p>
            </div>
            {showTranslation && (
              <div>
                <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Commentary</p>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{verse.text}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Satapatha Brahmana Grid Component
function SatapathaGrid({ 
  verses,
  isBookmarked,
  onToggleBookmark,
  onExpand
}: { 
  verses: SatapathaVerse[];
  isBookmarked: (ref: string) => boolean;
  onToggleBookmark: (ref: string) => void;
  onExpand: (verse: SatapathaVerse) => void;
}) {
  if (verses.length === 0) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-12 text-center">
          <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No sections found matching your search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
      {verses.map((verse, index) => (
        <Card 
          key={verse.reference} 
          className="verse-card animate-fade-in cursor-pointer hover:shadow-lg transition-shadow"
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => onExpand(verse)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="verse-number text-sm w-6 h-6 flex items-center justify-center">
                  {verse.verse}
                </span>
                <Badge variant="outline" className="text-xs">Satapatha</Badge>
              </div>
              <BookmarkButton 
                reference={verse.reference} 
                isBookmarked={isBookmarked(verse.reference)}
                onToggle={onToggleBookmark}
              />
            </div>
            <p className="text-xs text-muted-foreground">Mandala {verse.mandala} • {verse.reference}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-4">{verse.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
