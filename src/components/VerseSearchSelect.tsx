import { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface VerseSearchSelectProps {
  options: { reference: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function VerseSearchSelect({ 
  options, 
  value, 
  onValueChange, 
  placeholder = "Search verse..." 
}: VerseSearchSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on search - limit to 50 results for performance
  const filteredOptions = useMemo(() => {
    if (!search.trim()) {
      return options.slice(0, 50);
    }
    return options
      .filter(opt => opt.reference.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 50);
  }, [options, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (reference: string) => {
    onValueChange(reference);
    setSearch('');
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleFocus = () => {
    setIsEditing(true);
    setIsOpen(true);
    setSearch('');
  };

  // Show search text when editing, otherwise show selected value
  const displayValue = isEditing ? search : value;

  return (
    <div ref={containerRef} className="relative w-48">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pl-8 h-9 text-sm"
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
          ) : (
            <>
              {filteredOptions.map(opt => (
                <button
                  key={opt.reference}
                  onClick={() => handleSelect(opt.reference)}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {opt.reference}
                </button>
              ))}
              {options.length > 50 && !search && (
                <div className="px-3 py-1.5 text-xs text-muted-foreground border-t">
                  Type to search {options.length} verses...
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
