/**
 * DataStore.tsx
 * * CENTRAL DATA MANAGEMENT for House of Swass
 * * Places, Scrapbook, and Tales are In-Memory.
 * * Goals are now connected to SUPABASE.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase'; // <--- Import Supabase client

// --- Types ---

export interface Place {
  id: string;
  name: string;
  type: 'cafe' | 'restaurant' | 'park' | 'other';
  rating: number;
  visitDate: string;
  notes: string;
  tags: string[];
  photos: string[];
  createdAt: number;
}

export interface ScrapbookEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  photos: string[];
  createdAt: number;
}

export interface Tale {
  id: string;
  friendName: string;
  friendPhoto: string | null;
  title: string;
  description: string;
  mood: 'joyful' | 'romantic' | 'adventurous' | 'peaceful' | 'nostalgic';
  photos: string[];
  isPlaceholder?: boolean;
  createdAt: number;
}

// Updated Goal Interface to match Supabase and Goals.tsx
export interface Goal {
  id: string;
  year: number;
  title: string;
  description?: string;
  progress: number;
  target: number;
  category: string;
  month?: string;
  location?: string;
  subGoals?: any[];
  createdAt: number;
}

// --- Initial Data ---

const initialPlaces: Place[] = [
  {
    id: '1',
    name: 'The Vintage Cafe',
    type: 'cafe',
    rating: 5,
    visitDate: '2025-01-10',
    notes: 'Perfect evening spot with the most beautiful chandeliers',
    tags: ['cozy', 'vintage', 'evening'],
    photos: [],
    createdAt: Date.now() - 86400000 * 5
  }
];

// --- Context Setup ---

const DataContext = createContext<any>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [scrapbookEntries, setScrapbookEntries] = useState<ScrapbookEntry[]>([]);
  const [friendMemories, setFriendMemories] = useState<Tale[]>([]);
  
  // Goals State (Starts empty, populated via Supabase)
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);

  const [treatResults, setTreatResults] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState({ name: 'Swass', photo: null });

  /**
   * PLACES (PASSPORT) MUTATIONS - (Unchanged)
   */
  const addPlace = useCallback((place: Omit<Place, 'id' | 'createdAt'>) => {
    const newPlace = { ...place, id: Date.now().toString(), createdAt: Date.now() };
    setPlaces(prev => [newPlace as Place, ...prev]);
    return newPlace;
  }, []);

  const updatePlace = useCallback((id: string, updates: Partial<Place>) => {
    setPlaces(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePlace = useCallback((id: string) => {
    setPlaces(prev => prev.filter(p => p.id !== id));
  }, []);

  /**
   * SCRAPBOOK MUTATIONS - (Unchanged)
   */
  const addScrapbookEntry = useCallback((entry: Omit<ScrapbookEntry, 'id' | 'createdAt'>) => {
    const newEntry = { ...entry, id: Date.now().toString(), createdAt: Date.now() };
    setScrapbookEntries(prev => [newEntry as ScrapbookEntry, ...prev]);
    return newEntry;
  }, []);

  const deleteScrapbookEntry = useCallback((id: string) => {
    setScrapbookEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  /**
   * FRIEND MEMORIES (VAULT OF TALES) MUTATIONS - (Unchanged)
   */
  const addFriendMemory = useCallback((memory: Omit<Tale, 'id' | 'createdAt'>) => {
    const newMemory = { ...memory, id: Date.now().toString(), createdAt: Date.now() };
    setFriendMemories(prev => [newMemory as Tale, ...prev]);
    return newMemory;
  }, []);

  const updateFriendMemory = useCallback((id: string, updates: Partial<Tale>) => {
    setFriendMemories(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deleteFriendMemory = useCallback((id: string) => {
    setFriendMemories(prev => prev.filter(m => m.id !== id));
  }, []);

  /**
   * ==========================================
   * GOALS MUTATIONS (UPDATED FOR SUPABASE)
   * ==========================================
   */

  // 1. Fetch Goals
  const fetchGoals = useCallback(async (year: number) => {
    setIsLoadingGoals(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('year', year)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else if (data) {
      // Map DB snake_case to App camelCase
      const formattedGoals = data.map((g: any) => ({
        ...g,
        subGoals: g.sub_goals || [],
        createdAt: new Date(g.created_at).getTime(), // Convert string timestamp to number
      }));
      setGoals(formattedGoals);
    }
    setIsLoadingGoals(false);
  }, []);

  // 2. Add Goal
  const addGoal = useCallback(async (goal: any) => {
    // 1. Prepare object for Supabase (snake_case)
    const dbGoal = {
      title: goal.title,
      description: goal.description,
      category: goal.category,
      month: goal.month,
      year: goal.year,
      location: goal.location,
      sub_goals: goal.subGoals || [], // map to snake_case
      progress: 0,
      target: goal.target,
    };

    // 2. Insert into DB
    const { data, error } = await supabase
      .from('goals')
      .insert([dbGoal])
      .select()
      .single();

    if (error) {
      console.error('Error adding goal:', error);
      return;
    }

    // 3. Update Local State with the returned data
    const newGoal: Goal = {
      ...data,
      subGoals: data.sub_goals || [],
      createdAt: new Date(data.created_at).getTime()
    };
    
    setGoals(prev => [newGoal, ...prev]);
  }, []);

  // 3. Increment Progress
  const incrementGoalProgress = useCallback(async (id: string) => {
    // Optimistic Update
    setGoals(prev => prev.map(g => {
      if (g.id === id && g.progress < g.target) {
        return { ...g, progress: g.progress + 1 };
      }
      return g;
    }));

    // DB Update
    const currentGoal = goals.find(g => g.id === id);
    if (currentGoal && currentGoal.progress < currentGoal.target) {
      const { error } = await supabase
        .from('goals')
        .update({ progress: currentGoal.progress + 1 })
        .eq('id', id);
        
      if (error) console.error("Error updating progress in DB", error);
    }
  }, [goals]);

  // 4. Decrement Progress
  const decrementGoalProgress = useCallback(async (id: string) => {
    // Optimistic Update
    setGoals(prev => prev.map(g => {
      if (g.id === id && g.progress > 0) {
        return { ...g, progress: g.progress - 1 };
      }
      return g;
    }));

    // DB Update
    const currentGoal = goals.find(g => g.id === id);
    if (currentGoal && currentGoal.progress > 0) {
      const { error } = await supabase
        .from('goals')
        .update({ progress: currentGoal.progress - 1 })
        .eq('id', id);

      if (error) console.error("Error updating progress in DB", error);
    }
  }, [goals]);

  // 5. Update Generic
  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    // Optimistic
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));

    // Map updates to DB format if necessary (e.g. subGoals -> sub_goals)
    const dbUpdates: any = { ...updates };
    if (updates.subGoals) {
      dbUpdates.sub_goals = updates.subGoals;
      delete dbUpdates.subGoals;
    }

    const { error } = await supabase.from('goals').update(dbUpdates).eq('id', id);
    if (error) console.error("Error updating goal", error);
  }, []);

  // 6. Delete
  const deleteGoal = useCallback(async (id: string) => {
    // Optimistic
    setGoals(prev => prev.filter(g => g.id !== id));

    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) console.error("Error deleting goal", error);
  }, []);

  /**
   * USER PROFILE MUTATIONS - (Unchanged)
   */
  const updateUserProfile = useCallback((updates: any) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const value = {
    places, scrapbookEntries, friendMemories, 
    goals, isLoadingGoals, fetchGoals, // Exporting new Supabase stuff
    treatResults, userProfile,
    addPlace, updatePlace, deletePlace,
    addScrapbookEntry, deleteScrapbookEntry,
    addFriendMemory, updateFriendMemory, deleteFriendMemory,
    addGoal, incrementGoalProgress, decrementGoalProgress, updateGoal, deleteGoal,
    updateUserProfile
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
}