import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { yajurvedaFacts } from '@/data/sampleData';
import { BookOpen, Flame, Clock, User, Scroll, Sparkles, ArrowRight, Bot, BarChart3 } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  book: BookOpen,
  clock: Clock,
  user: User,
  scroll: Scroll,
  sparkles: Sparkles,
};

export default function Index() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-hero mandala-pattern">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10 px-4 py-20 text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-foreground text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Ancient Wisdom, Modern Exploration</span>
            </div>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Explore the Sacred
            <br />
            <span className="text-gradient-sacred">Yajurveda</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Journey through the ancient Vedic texts of ritual and sacrifice. 
            Discover the profound wisdom of both the Black and White Yajurveda traditions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="xl" variant="sacred">
              <Link to="/explore">
                <BookOpen className="w-5 h-5" />
                Start Exploring
              </Link>
            </Button>
            <Button asChild size="xl" variant="hero">
              <Link to="/ai-scholar">
                <Bot className="w-5 h-5" />
                Ask AI Scholar
              </Link>
            </Button>
          </div>
          
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">
              The Veda of Sacred Formulas
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The Yajurveda, one of the four canonical texts of Hinduism, is a treasure trove of 
              ritual mantras and philosophical insights. It serves as the practical handbook for 
              Adhvaryu priests, containing the verses and prose formulas (yajus) necessary for 
              performing Vedic sacrifices.
            </p>
          </div>
          
          {/* Two Traditions Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="group relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-sacred hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-sacred flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-primary-foreground font-display font-bold text-2xl">शु</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                  Shukla Yajurveda
                </h3>
                <p className="text-muted-foreground mb-4">
                  The "White" Yajurveda presents mantras in a pure form without embedded commentary. 
                  This explorer uses the <span className="text-primary font-medium">Vājasaneyi Saṃhitā (Mādhyandina Śākhā)</span>.
                </p>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span>40 Adhyāyas</span>
                  <span className="text-muted-foreground">•</span>
                  <span>~2000 Mantras</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group relative overflow-hidden border-2 border-accent/20 hover:border-accent/40 transition-all duration-500 hover:shadow-soft hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                  <span className="text-accent-foreground font-display font-bold text-2xl">कृ</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                  Krishna Yajurveda
                </h3>
                <p className="text-muted-foreground mb-4">
                  The "Black" Yajurveda interweaves mantras with explanatory prose (Brāhmaṇa). 
                  This explorer uses the <span className="text-accent font-medium">Taittirīya Saṃhitā</span>.
                </p>
                <div className="flex items-center gap-2 text-accent font-medium">
                  <span>7 Kāṇḍas</span>
                  <span className="text-muted-foreground">•</span>
                  <span>~2200 Mantras</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Facts Section */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Key Insights
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover fascinating aspects of the Yajurveda tradition
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {yajurvedaFacts.map((fact, index) => {
              const IconComponent = iconMap[fact.icon] || Sparkles;
              return (
                <Card 
                  key={fact.id} 
                  className="group hover:shadow-soft transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {fact.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {fact.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-secondary/50">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <CardContent className="relative p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
                      Ready to Dive Deeper?
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Explore the complete texts, ask questions to our AI Scholar, 
                      or analyze patterns across the sacred verses.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild variant="sacred">
                        <Link to="/explore">
                          Explore Texts
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to="/analysis">
                          <BarChart3 className="w-4 h-4" />
                          View Analysis
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center">
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full bg-primary/10 animate-pulse-glow" />
                      <div className="absolute inset-4 rounded-full bg-gradient-sacred flex items-center justify-center">
                        <span className="text-primary-foreground font-display text-5xl">ॐ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
