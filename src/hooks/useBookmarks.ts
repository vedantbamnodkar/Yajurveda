import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const BOOKMARKS_KEY = 'yajurveda_bookmarks';

export type ScriptureType = 'SY' | 'KY' | 'SB';

export interface BookmarkEntry {
  reference: string;
  type: ScriptureType;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>(() => {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Handle migration from old format (array of strings) to new format
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'string') {
            // Old format - can't determine type, so clear
            return [];
          }
          return parsed as BookmarkEntry[];
        }
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const isBookmarked = useCallback((reference: string) => {
    return bookmarks.some(b => b.reference === reference);
  }, [bookmarks]);

  const toggleBookmark = useCallback((reference: string, type: ScriptureType) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.reference === reference);
      if (exists) {
        toast.success('Bookmark removed');
        return prev.filter(b => b.reference !== reference);
      } else {
        toast.success('Bookmark added');
        return [...prev, { reference, type }];
      }
    });
  }, []);

  const removeBookmark = useCallback((reference: string) => {
    setBookmarks(prev => prev.filter(b => b.reference !== reference));
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark, removeBookmark };
}
