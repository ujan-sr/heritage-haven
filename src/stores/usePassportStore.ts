import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// --- HELPER: Convert Base64 to Blob for Upload ---
const base64ToBlob = (base64: string) => {
  try {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Blob conversion failed', e);
    return null;
  }
};

export interface Place {
  id: string;
  name: string;
  type: string;
  rating: number;
  visitDate: string;
  notes: string;
  tags: string[];
  photos: string[];
  createdAt: number;
}

interface PassportState {
  places: Place[];
  isLoading: boolean;
  fetchPlaces: () => Promise<void>;
  addPlace: (place: Omit<Place, 'id' | 'createdAt'>) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
}

export const usePassportStore = create<PassportState>((set, get) => ({
  places: [],
  isLoading: false,

  // --- FETCH PLACES (Cloud Only) ---
  fetchPlaces: async () => {
    set({ isLoading: true });
    
    // 1. Check Session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        set({ places: [], isLoading: false });
        return;
    }

    // 2. Fetch from DB
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('visit_date', { ascending: false }); // Sort by visit date, most recent first

    if (error) {
      console.error('Fetch Error:', error);
      set({ isLoading: false });
      return;
    }

    // 3. Map DB (snake_case) to UI (camelCase)
    const mappedPlaces: Place[] = (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      rating: p.rating,
      visitDate: p.visit_date,     // DB column: visit_date
      notes: p.notes,
      tags: p.tags || [],
      photos: p.photos || [],
      createdAt: new Date(p.created_at).getTime(),
    }));

    set({ places: mappedPlaces, isLoading: false });
  },

  // --- ADD PLACE (Upload -> DB Insert) ---
  addPlace: async (newPlace) => {
    set({ isLoading: true });

    try {
      // 1. Get Current User (Required for RLS)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User must be logged in to add a place.");

      const uploadedPhotoUrls: string[] = [];

      // 2. Upload Images to Supabase Storage (if any)
      if (newPlace.photos && newPlace.photos.length > 0) {
        for (const photo of newPlace.photos) {
          // Check if it is a Base64 string (needs upload)
          if (photo.startsWith('data:')) {
            const blob = base64ToBlob(photo);
            if (!blob) continue;

            const fileName = `places/${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            
            // Upload to 'place-photos' bucket
            const { error: uploadError } = await supabase.storage
              .from('place-photos') 
              .upload(fileName, blob, { contentType: blob.type });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: urlData } = supabase.storage
              .from('place-photos')
              .getPublicUrl(fileName);

            uploadedPhotoUrls.push(urlData.publicUrl);
          } else {
            // It's already a URL (e.g. from an update), keep it
            uploadedPhotoUrls.push(photo);
          }
        }
      }

      // 3. Insert into Supabase DB
      const { data, error } = await supabase
        .from('places')
        .insert([{
          user_id: user.id,            // STRICT: Bind to user
          name: newPlace.name,
          type: newPlace.type,
          rating: newPlace.rating,
          visit_date: newPlace.visitDate, // Map to snake_case
          notes: newPlace.notes,
          tags: newPlace.tags,
          photos: uploadedPhotoUrls,   // Save the Array of URLs
        }])
        .select()
        .single();

      if (error) throw error;

      // 4. Update Local State with Real Data
      // (We map the response back to UI format)
      const addedPlace: Place = {
          id: data.id,
          name: data.name,
          type: data.type,
          rating: data.rating,
          visitDate: data.visit_date,
          notes: data.notes,
          tags: data.tags,
          photos: data.photos,
          createdAt: new Date(data.created_at).getTime()
      };

      set((state) => ({ 
        places: [addedPlace, ...state.places],
        isLoading: false 
      }));

    } catch (err: any) {
      console.error('Error adding place:', err.message);
      alert("Failed to save entry. Please try again.");
      set({ isLoading: false });
    }
  },

  // --- DELETE PLACE ---
  deletePlace: async (id) => {
    // 1. Optimistic Update (Remove immediately from UI)
    set((state) => ({ places: state.places.filter((p) => p.id !== id) }));

    // 2. Delete from DB
    const { error } = await supabase.from('places').delete().eq('id', id);
    
    if (error) {
        console.error("Error deleting place:", error);
        // Optional: Re-fetch if delete fails to restore sync
        get().fetchPlaces(); 
    }
  },
}));