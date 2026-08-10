import { useState, useEffect, useCallback } from 'react';

const NOTES_KEY = 'yajurveda_study_notes';

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function useStudyNotes() {
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    const stored = sessionStorage.getItem(NOTES_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    sessionStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = useCallback((title: string, content: string) => {
    const newNote: StudyNote = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, title: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, title, content, updatedAt: new Date().toISOString() }
        : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  return { notes, addNote, updateNote, deleteNote };
}
