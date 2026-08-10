import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  scripture: 'white' | 'black';
  chapter: number;
}

export default function AudioPlayer({ scripture, chapter }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Construct audio path based on scripture and chapter
  const audioPath = scripture === 'white' 
    ? `/audio/shukla/adhyaya (${chapter}).mp3`
    : `/audio/krishna/kanda${chapter}.mp3`;

  // Reset player when chapter or scripture changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [scripture, chapter]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setHasError(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = () => {
    setHasError(true);
    setIsPlaying(false);
    setIsLoading(false);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const chapterLabel = scripture === 'white' ? `Adhyaya ${chapter}` : `Kanda ${chapter}`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
      <audio
        ref={audioRef}
        src={audioPath}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        preload="metadata"
      />
      
      {/* Play/Pause Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={togglePlay}
        disabled={hasError || isLoading}
        className="flex-shrink-0 h-10 w-10"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>

      {/* Time & Seek Bar */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <span className="text-xs text-muted-foreground w-10 flex-shrink-0">
          {formatTime(currentTime)}
        </span>
        
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          disabled={hasError || duration === 0}
          className="flex-1"
        />
        
        <span className="text-xs text-muted-foreground w-10 flex-shrink-0 text-right">
          {formatTime(duration)}
        </span>
      </div>

      {/* Mute Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="flex-shrink-0 h-8 w-8"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>

      {/* Chapter Label */}
      <span className="hidden sm:block text-xs text-muted-foreground border-l border-border pl-3">
        {chapterLabel}
      </span>

      {/* Error State */}
      {hasError && (
        <span className="text-xs text-destructive">
          Audio unavailable
        </span>
      )}
    </div>
  );
}
