// src/hooks/useProfileManager.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { compressImage } from '@/utils/imageOptimizer';

export function useProfileManager() {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('Traveler');
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  // Default mock photos
  const [reelPhotos, setReelPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80",
  ]);
  const [isUploading, setIsUploading] = useState(false);

  // Load User Data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      setUser(currentUser);
      
      const meta = currentUser.user_metadata || {};
      setUserName(meta.full_name || currentUser.email?.split('@')[0] || 'Traveler');
      if (meta.avatar_url) setProfilePreview(meta.avatar_url);
      if (meta.reel_photos && Array.isArray(meta.reel_photos)) setReelPhotos(meta.reel_photos);
    };
    fetchUser();
  }, []);

  // Generic Upload Handler
  const uploadAsset = useCallback(async (
    file: File, 
    path: string, 
    bucket: string = 'user-images'
  ) => {
    const compressedFile = await compressImage(file);
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, compressedFile, { upsert: true, contentType: compressedFile.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }, []);

  // 1. Handle Profile Upload
  const updateProfilePicture = async (file: File) => {
    if (!user) return;
    
    // Create temporary blob for instant UI feedback
    const previousUrl = profilePreview;
    const objectUrl = URL.createObjectURL(file);
    setProfilePreview(objectUrl); 
    setIsUploading(true);

    try {
      const path = `profile/${user.id}-${Date.now()}.jpg`;
      const publicUrl = await uploadAsset(file, path);

      // Persist URL
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      
      // Free memory of the temp blob
      URL.revokeObjectURL(objectUrl);
      setProfilePreview(publicUrl); // Switch to real remote URL

    } catch (error) {
      console.error("Profile upload failed:", error);
      setProfilePreview(previousUrl); // Revert to previous image
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Handle Reel Upload
  const updateReelPhoto = async (file: File, index: number) => {
    if (!user) return;

    const previousReel = [...reelPhotos];
    const objectUrl = URL.createObjectURL(file);
    
    // Optimistic Update
    const newReel = [...reelPhotos];
    newReel[index] = objectUrl;
    setReelPhotos(newReel);

    try {
      const path = `reel/${user.id}-${index}-${Date.now()}.jpg`;
      const publicUrl = await uploadAsset(file, path);

      const finalReel = [...reelPhotos]; // Get fresh state
      finalReel[index] = publicUrl;
      setReelPhotos(finalReel);

      await supabase.auth.updateUser({ data: { reel_photos: finalReel } });
      URL.revokeObjectURL(objectUrl);

    } catch (error) {
      console.error("Reel upload failed:", error);
      setReelPhotos(previousReel); // Revert
      alert("Failed to update memory reel.");
    }
  };

  return {
    user,
    userName,
    profilePreview,
    reelPhotos,
    isUploading,
    updateProfilePicture,
    updateReelPhoto
  };
}