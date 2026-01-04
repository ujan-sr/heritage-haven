import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Make sure this path matches your project structure

// --- TYPES ---
export interface VaultMemory {
  id: string;
  text: string;
  date: string;
  photos: string[];
}

export interface VaultEntry {
  id: string;
  name: string;
  type: string;
  rating: number;
  visitDate: string;
  notes: string;
  tags: string[];
  photos: string[];
  memories: VaultMemory[];
  createdAt: number;
}

// --- HELPER: Upload Images ---
// Uploads an array of Files to the 'vault-images' bucket and returns the public URLs
const uploadFiles = async (files: File[], folderPath: string): Promise<string[]> => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    // Create a unique file name: folder/timestamp_random_filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folderPath}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('vault-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error(`Error uploading ${file.name}:`, uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('vault-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  });

  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null);
};

export function useVaultTales() {
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  const fetchEntries = async () => {
    setLoading(true);
    
    // Select entries and join with memories
    const { data, error } = await supabase
      .from('vault_entries')
      .select(`
        *,
        memories:vault_memories(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vault:', error);
    } else {
      // MAP DB (snake_case) -> APP (camelCase)
      const formattedData: VaultEntry[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        rating: item.rating,
        visitDate: item.visit_date, // Mapping visit_date -> visitDate
        notes: item.notes,
        tags: item.tags || [],
        photos: item.photos || [],
        createdAt: new Date(item.created_at).getTime(), // Mapping timestamp -> number
        memories: (item.memories || []).map((mem: any) => ({
          id: mem.id,
          text: mem.text,
          date: mem.date,
          photos: mem.photos || []
        }))
      }));
      setVaultEntries(formattedData);
    }
    setLoading(false);
  };

  // Initial Fetch on Mount
  useEffect(() => {
    fetchEntries();
  }, []);

  // --- ADD ENTRY ---
  // Now accepts the raw entry data and an array of Files for the main photo
  const addVaultEntry = async (entry: Omit<VaultEntry, 'id' | 'createdAt' | 'memories'>, imageFiles: File[]) => {
    
    // 1. Upload Images
    const photoUrls = await uploadFiles(imageFiles, 'places');

    // 2. Insert into Supabase
    const { error } = await supabase
      .from('vault_entries')
      .insert({
        name: entry.name,
        type: entry.type,
        rating: entry.rating,
        visit_date: entry.visitDate,
        notes: entry.notes,
        tags: entry.tags,
        photos: photoUrls
      });

    if (error) {
      console.error('Error adding entry:', error);
    } else {
      // 3. Refresh Data
      fetchEntries();
    }
  };

  // --- DELETE ENTRY ---
  const deleteVaultEntry = async (id: string) => {
    // Optimistic Update (makes UI feel faster)
    setVaultEntries((prev) => prev.filter((e) => e.id !== id));

    const { error } = await supabase
      .from('vault_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      fetchEntries(); // Revert on error
    }
  };

  // --- ADD MEMORY (CHRONICLE) ---
  const addChronicleToEntry = async (entryId: string, memory: Omit<VaultMemory, 'id' | 'photos'>, imageFiles: File[]) => {
    // 1. Upload Images
    const photoUrls = await uploadFiles(imageFiles, 'memories');

    // 2. Insert into Supabase
    const { error } = await supabase
      .from('vault_memories')
      .insert({
        entry_id: entryId,
        text: memory.text,
        date: memory.date,
        photos: photoUrls
      });

    if (error) {
      console.error('Error adding memory:', error);
    } else {
      fetchEntries();
    }
  };

  // --- REMOVE MEMORY ---
  const removeChronicleFromEntry = async (entryId: string, memoryId: string) => {
    // Optimistic Update
    setVaultEntries((prev) => 
      prev.map((entry) => 
        entry.id === entryId 
          ? { ...entry, memories: entry.memories.filter((m) => m.id !== memoryId) } 
          : entry
      )
    );

    const { error } = await supabase
      .from('vault_memories')
      .delete()
      .eq('id', memoryId);

    if (error) {
      console.error('Error deleting memory:', error);
      fetchEntries();
    }
  };

  return { 
    vaultEntries, 
    loading, // Expose loading state to UI
    addVaultEntry, 
    deleteVaultEntry, 
    addChronicleToEntry, 
    removeChronicleFromEntry 
  };
}