import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// --- TYPES ---
export interface WheelSpin {
  id: number; // CHANGED: SQL 'bigint' maps to number in JS
  treat: string;
  emoji: string;
  timestamp: number; 
}

interface WheelState {
  history: WheelSpin[];
  isLoading: boolean;
  
  fetchHistory: () => Promise<void>;
  addSpin: (treat: string, emoji: string) => Promise<void>;
}

export const useWheelStore = create<WheelState>((set, get) => ({
  history: [],
  isLoading: false,

  // --- 1. FETCH HISTORY ---
  fetchHistory: async () => {
    set({ isLoading: true });
    
    // UPDATED: Table name is now 'spin_history'
    const { data, error } = await supabase
      .from('spin_history') 
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching wheel history:', error);
      set({ isLoading: false });
      return;
    }

    const mappedHistory = data.map((item) => ({
      id: item.id,
      treat: item.treat,
      emoji: item.emoji,
      // Map SQL 'created_at' string to JS timestamp number
      timestamp: new Date(item.created_at).getTime(),
    }));

    set({ history: mappedHistory, isLoading: false });
  },

  // --- 2. ADD NEW SPIN ---
  addSpin: async (treat, emoji) => {
    // UPDATED: Use a number for tempId to match the 'bigint' type of the real ID
    const tempId = Date.now(); 
    
    const newSpin: WheelSpin = {
      id: tempId,
      treat,
      emoji,
      timestamp: Date.now(),
    };

    // Optimistic Update
    set((state) => ({ history: [newSpin, ...state.history] }));

    try {
      // UPDATED: Table name 'spin_history'
      const { data, error } = await supabase
        .from('spin_history')
        .insert([{ treat, emoji }]) 
        .select()
        .single();

      if (error) throw error;

      // Update the temp ID with real DB ID
      set((state) => ({
        history: state.history.map((h) => 
          h.id === tempId ? { ...h, id: data.id, timestamp: new Date(data.created_at).getTime() } : h
        ),
      }));

    } catch (err) {
      console.error('Failed to save spin:', err);
      // Optional: Remove the optimistic item if it failed
      set((state) => ({ history: state.history.filter(h => h.id !== tempId) }));
    }
  },
}));