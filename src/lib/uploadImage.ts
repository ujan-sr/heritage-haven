import { supabase } from './supabase';

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const { error } = await supabase.storage
    .from('user-images')
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('user-images')
    .getPublicUrl(path);

  return data.publicUrl;
}
