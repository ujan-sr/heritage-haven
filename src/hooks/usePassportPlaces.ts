import { useState, useEffect } from 'react';

// --- TYPES ---
export interface Place {
  id: string;
  name: string;
  type: string;
  rating: number;
  visitDate: string;
  notes: string;
  tags: string[];
  photos: string[]; // Array of base64 strings
  createdAt: number;
}

// --- MOCK DATA ---
const INITIAL_PLACES: Place[] = [
  {
    id: '1',
    name: 'The Alchemist\'s Study',
    type: 'cafe',
    rating: 5,
    visitDate: '2023-10-14',
    notes: 'Incredible atmosphere. The old books lining the walls smell of vanilla and dust.',
    tags: ['vintage', 'quiet'],
    photos: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80'],
    createdAt: 1697230000000
  }
];

export function usePassportPlaces() {
  const [places, setPlaces] = useState<Place[]>(() => {
    // 1. Safe Initialization
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('heritage_passport_places');
        return saved ? JSON.parse(saved) : INITIAL_PLACES;
      } catch (e) {
        console.error("Error loading passport data:", e);
        return INITIAL_PLACES;
      }
    }
    return INITIAL_PLACES;
  });

  // 2. Safe Saving (Prevents White Screen Crash)
  useEffect(() => {
    try {
      localStorage.setItem('heritage_passport_places', JSON.stringify(places));
    } catch (e) {
      console.warn("Storage Quota Exceeded: Photo is too large to persist in LocalStorage. It will disappear on refresh.");
      // We do NOT crash the app here. We just fail to save to disk silently (or log it).
    }
  }, [places]);

  const addPlace = (place: Place) => {
    setPlaces((prev) => [place, ...prev]);
  };

  const deletePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  return { places, addPlace, deletePlace };
}