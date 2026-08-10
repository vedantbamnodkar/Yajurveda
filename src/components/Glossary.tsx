import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, BookOpen, X, ExternalLink } from 'lucide-react';
import { glossaryTerms, glossaryCategories, GlossaryTerm } from '@/data/glossaryData';

interface GlossaryProps {
  onTermClick?: (term: GlossaryTerm) => void;
}

export default function Glossary({ onTermClick }: GlossaryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      const matchesSearch = searchQuery === '' || 
        term.sanskrit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.devanagari.includes(searchQuery) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryColor = (category: GlossaryTerm['category']) => {
    switch (category) {
      case 'deity': return 'bg-amber-500/20 text-amber-700 dark:text-amber-300';
      case 'ritual': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'philosophical': return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      case 'cosmological': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'object': return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
      case 'action': return 'bg-red-500/20 text-red-700 dark:text-red-300';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleTermClick = (term: GlossaryTerm) => {
    setSelectedTerm(term);
    onTermClick?.(term);
  };

  return (
    <div className="space-y-6">
      {/* Sanskrit Diacritics Info Card */}
      <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            Vedic Svara Marks (Sanskrit Diacritics)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Vedic chantings use 4 tones for proper pronunciation and recitation:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
              <span className="text-3xl font-bold text-primary">अ</span>
              <div>
                <p className="font-medium">Udātta (उदात्त)</p>
                <p className="text-sm text-muted-foreground">Middle tone — No mark</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
              <span className="text-3xl font-bold text-primary">अ॒</span>
              <div>
                <p className="font-medium">Anudātta (अनुदात्त)</p>
                <p className="text-sm text-muted-foreground">Lower tone — Underline mark</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
              <span className="text-3xl font-bold text-primary">अ॑</span>
              <div>
                <p className="font-medium">Svarita (स्वरित)</p>
                <p className="text-sm text-muted-foreground">Higher tone — Small vertical line above</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/60">
              <span className="text-3xl font-bold text-primary">आ᳚</span>
              <div>
                <p className="font-medium">Dīrgha Svarita (दीर्घस्वरित)</p>
                <p className="text-sm text-muted-foreground">High tone extended — Two vertical lines</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search Sanskrit, English, or Devanagari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 h-12">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {glossaryCategories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground text-center">
        Showing {filteredTerms.length} of {glossaryTerms.length} terms
      </p>

      {/* Terms Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {filteredTerms.map(term => (
          <Card 
            key={term.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
            onClick={() => handleTermClick(term)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <span className="text-2xl">{term.devanagari}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{term.sanskrit} — {term.english}</p>
                </div>
                <Badge className={getCategoryColor(term.category)}>
                  {term.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {term.definition}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No terms found matching your search.</p>
          </CardContent>
        </Card>
      )}

      {/* Term Detail Modal */}
      {selectedTerm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedTerm(null)}
        >
          <Card 
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-4xl mb-2">{selectedTerm.devanagari}</p>
                  <CardTitle className="text-xl font-display">
                    {selectedTerm.sanskrit}
                  </CardTitle>
                  <p className="text-muted-foreground">{selectedTerm.english}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(selectedTerm.category)}>
                    {selectedTerm.category}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTerm(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Definition</p>
                <p className="text-foreground leading-relaxed">{selectedTerm.definition}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Context</p>
                <p className="text-muted-foreground leading-relaxed">{selectedTerm.context}</p>
              </div>
              {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary font-medium mb-2">Related Terms</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.relatedTerms.map(relatedId => {
                      const relatedTerm = glossaryTerms.find(t => t.id === relatedId);
                      return relatedTerm ? (
                        <Button
                          key={relatedId}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => setSelectedTerm(relatedTerm)}
                        >
                          {relatedTerm.devanagari} {relatedTerm.sanskrit}
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
