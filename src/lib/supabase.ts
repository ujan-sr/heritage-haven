import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      // This is the key change: use Session Storage
      storage: sessionStorage, 
      
      // These ensure the user stays logged in if they just hit "Refresh" (F5)
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);