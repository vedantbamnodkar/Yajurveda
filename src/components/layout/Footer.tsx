import { BookOpen, Github, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          {/* Top Row - Logo & Attribution */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-display text-foreground">Yajurveda Explorer</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                Sanskrit from
                <a 
                  href="https://github.com/bhavykhatri/DharmicData" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Github className="w-3 h-3" />
                  DharmicData
                </a>
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Translations by Ralph T.H. Griffith</span>
            </div>
          </div>

          {/* Bottom Row - Credits */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Built with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>in Bhārat by</span>
              <span className="text-foreground font-medium">Vedant Bamnodkar</span>
            </div>
            
            <div className="flex flex-col items-end gap-0.5 text-xs">
              <span className="font-display text-primary font-medium">॥ सत्यं वद । धर्मं चर ॥</span>
              <span className="text-muted-foreground text-[10px]">Speak the Truth. Follow Dharma. — Taittirīya Upaniṣad</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
