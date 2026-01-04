import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Types (Matching your component)
export interface ScrapbookImage {
  id: string;
  src: string; // Will be a Supabase URL
  x: number;
  y: number;
  width: number;
  rotation: number;
}

export interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export interface PageData {
  id: string;
  pageNumber: number;
  textBoxes: TextBox[];
  images: ScrapbookImage[];
  drawing: string | null;
}

interface ScrapbookStore {
  journals: any[];
  pages: Record<string, PageData[]>; // content cache
  fetchJournals: () => Promise<void>;
  createJournal: (title: string, coverColor: string) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
  
  fetchPages: (journalId: string) => Promise<void>;
  savePage: (pageId: string, content: Partial<PageData>) => Promise<void>;
  
  uploadImage: (file: File) => Promise<string | null>;
}

export const useScrapbookStore = create<ScrapbookStore>((set, get) => ({
  journals: [],
  pages: {},

  fetchJournals: async () => {
    const { data } = await supabase.from('journals').select('*').order('created_at', { ascending: false });
    set({ journals: data || [] });
  },

  createJournal: async (title, coverColor) => {
    // 1. Create Journal
    const { data: journal, error } = await supabase.from('journals').insert({ title, cover_color: coverColor }).select().single();
    if (error) return;

    // 2. Create Initial Spread (Page 1 & 2)
    const emptyContent = { textBoxes: [], images: [], drawing: null };
    await supabase.from('pages').insert([
      { journal_id: journal.id, page_number: 1, content: emptyContent },
      { journal_id: journal.id, page_number: 2, content: emptyContent }
    ]);

    get().fetchJournals();
  },

  deleteJournal: async (id) => {
    set((state) => ({ journals: state.journals.filter(j => j.id !== id) }));
    await supabase.from('journals').delete().eq('id', id);
  },

  fetchPages: async (journalId) => {
    const { data } = await supabase.from('pages')
      .select('*')
      .eq('journal_id', journalId)
      .order('page_number', { ascending: true });

    if (data) {
      const formattedPages = data.map(p => ({
        id: p.id,
        pageNumber: p.page_number,
        ...p.content // Spread JSON content (images, textboxes) into the object
      }));
      
      set((state) => ({
        pages: { ...state.pages, [journalId]: formattedPages }
      }));
    }
  },

  // Debounced save could be implemented here, but for now we direct save
  savePage: async (pageId, content) => {
    // We update the local state in the Component, this just hits the DB
    const { error } = await supabase
      .from('pages')
      .update({ content: content }) // Save the JSON blob
      .eq('id', pageId);
      
    if (error) console.error("Save failed", error);
  },

  uploadImage: async (file) => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const { error } = await supabase.storage.from('scrapbook-media').upload(fileName, file);
    
    if (error) {
      console.error("Upload failed", error);
      return null;
    }
    
    const { data } = supabase.storage.from('scrapbook-media').getPublicUrl(fileName);
    return data.publicUrl;
  }
}));