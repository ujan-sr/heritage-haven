import React, { useState, ChangeEvent, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTimeStore } from '@/stores/useTimeStore';
import { usePassportStore } from '@/stores/usePassportStore'; 
import { useVaultTales } from '@/hooks/useTales'; // Using your custom hook
import { Camera, Quote, ImageOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------------

interface StatItem {
  label: string;
  value: number;
  icon: string;
  link: string;
  description: string;
  image: string;
}

// ------------------------------------------------------------------
// Constants & Mock Data
// ------------------------------------------------------------------
const MOCK_DATA = {
  scrapbookCount: 1,
  activeGoals: 2,
};

const DAILY_QUOTES = [
  { text: "Life is not measured by the number of breaths we take, but by the moments that take our breath away.", author: "Maya Angelou" },
  { text: "The world is a book and those who do not travel read only one page.", author: "St. Augustine" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "It is good to have an end to journey toward; but it is the journey that matters, in the end.", author: "Ernest Hemingway" },
  { text: "We travel, some of us forever, to seek other states, other lives, other souls.", author: "Anaïs Nin" },
  { text: "To awaken quite alone in a strange town is one of the pleasantest sensations in the world.", author: "Freya Stark" },
  { text: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.", author: "Marcel Proust" },
];

const MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500&q=80",
];

export default function Dashboard() {
  const { formattedDate, formattedTime } = useTimeStore();
  
  // 1. PASSPORT (Zustand Store)
  // We must manually trigger fetchPlaces() because the store doesn't do it automatically.
  const { places, fetchPlaces } = usePassportStore();

  // 2. VAULT (Custom Hook)
  // This hook has an internal useEffect, so it Auto-Fetches simply by being called here.
  const { vaultEntries } = useVaultTales(); 

  // --- TRIGGER DATA FETCH ---
  useEffect(() => {
    // Only Passport needs the manual trigger
    if (fetchPlaces) fetchPlaces();
  }, [fetchPlaces]);

  // Local User State
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('Traveler');
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  
  // Reel Photos State
  const [reelPhotos, setReelPhotos] = useState<string[]>([...MOCK_PHOTOS, ...MOCK_PHOTOS]);

  // Fetch Supabase User & Load Persisted Images on Mount
  useEffect(() => {
    const fetchUserAndImages = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        setUser(currentUser);
        
        // 1. Set Name
        const displayName = currentUser.user_metadata?.full_name 
          || currentUser.email?.split('@')[0] 
          || 'Traveler';
        setUserName(displayName);
        
        // 2. Set Profile Pic from Metadata
        if (currentUser.user_metadata?.avatar_url) {
          setProfilePreview(currentUser.user_metadata.avatar_url);
        }

        // 3. Set Reel Photos from Metadata (if they exist)
        const savedReel = currentUser.user_metadata?.reel_photos;
        if (savedReel && Array.isArray(savedReel) && savedReel.length > 0) {
          setReelPhotos(savedReel);
        }
      }
    };
    fetchUserAndImages();
  }, []);

  const dailyQuote = useMemo(() => {
    const dayOfYear = Math.floor(new Date().getTime() / 8.64e7);
    return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
  }, []);

  // --- LOGIC FOR RECENT CHRONICLES ---
  const dynamicChronicles = useMemo(() => {
    
    // Helper to safely extract an image string from various possible data structures
    const getImage = (item: any) => {
      // 1. Check for 'image' property (string)
      if (typeof item.image === 'string' && item.image.length > 0) return item.image;
      
      // 2. Check for 'images' property (array of strings)
      if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
      
      // 3. Check if 'image' was returned as an array
      if (Array.isArray(item.image) && item.image.length > 0) return item.image[0];

      // 4. Fallback keys commonly used
      if (item.cover && typeof item.cover === 'string') return item.cover;
      
      // 5. Check 'photos' array (common in Place interface)
      if (Array.isArray(item.photos) && item.photos.length > 0) return item.photos[0];

      return null;
    };

    const recentPlaces = (places || [])
      .slice() // Copy to avoid mutation
      .reverse()
      .slice(0, 3)
      .map(p => ({
        id: p.id,
        title: p.name,
        date: p.visitDate || "Recent",
        image: getImage(p), 
        link: '/passport'
      }));

    const recentTales = (vaultEntries || [])
      .slice() // Copy to avoid mutation
      .reverse()
      .slice(0, 2)
      .map(t => ({
        id: t.id,
        title: t.name, // VaultEntry uses 'name', not 'title'
        date: t.visitDate || "Recent",
        image: getImage(t), 
        link: '/vault-of-tales'
      }));

    return [...recentPlaces, ...recentTales];
  }, [places, vaultEntries]);

  const shouldScrollReel = dynamicChronicles.length >= 3;

  // --- UPLOAD HANDLER 1: PROFILE PICTURE ---
  const handleProfilePictureUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const timestamp = Date.now();
    const path = `profile/${user.id}-${timestamp}.png`;
    
    const { error: uploadError } = await supabase.storage
      .from('user-images')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading profile image:', uploadError);
      return;
    }

    const { data } = supabase.storage.from('user-images').getPublicUrl(path);

    setProfilePreview(data.publicUrl);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: data.publicUrl }
    });

    if (updateError) console.error('Error updating user metadata:', updateError);
  };

  // --- UPLOAD HANDLER 2: REEL IMAGES ---
  const handleReelImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    indexToUpdate: number
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const timestamp = Date.now();
    const path = `reel/${user.id}-${indexToUpdate}-${timestamp}.png`;

    const { error: uploadError } = await supabase.storage
      .from('user-images')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading reel image:', uploadError);
      return;
    }

    const { data } = supabase.storage.from('user-images').getPublicUrl(path);

    const newReelPhotos = [...reelPhotos];
    newReelPhotos[indexToUpdate] = data.publicUrl;
    setReelPhotos(newReelPhotos);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { reel_photos: newReelPhotos }
    });

    if (updateError) console.error('Error saving reel configuration:', updateError);
  };

  const stats: StatItem[] = [
    { label: 'Establishments Frequented', value: places.length, icon: '◆', link: '/passport', description: 'Places of distinction', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80' },
    { label: 'Journal Inscriptions', value: MOCK_DATA.scrapbookCount, icon: '◇', link: '/scrapbook', description: 'Personal reflections', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80' },
    { label: 'Chronicles Recorded', value: vaultEntries.length, icon: '◈', link: '/vault-of-tales', description: 'Tales with companions', image: 'https://images.unsplash.com/photo-1524650359799-842906ca1c06?w=500&q=80' },
    { label: 'Pursuits in Progress', value: MOCK_DATA.activeGoals, icon: '❖', link: '/goals', description: 'Current aspirations', image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&q=80' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full pb-24 overflow-x-hidden">
      <style>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll 60s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }
        
        .animate-scroll-fast { animation: scroll 12s linear infinite; }
        .animate-scroll-fast:hover { animation-play-state: paused; }
        
        .perspective-1000 { perspective: 1000px; }
      `}</style>

      {/* SECTION 1: PROFILE & GREETING */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row items-center md:items-start gap-12">
          <div className="relative shrink-0 p-6">
            <motion.div className="relative group" style={{ transform: 'rotate(-3deg)' }} whileHover={{ scale: 1.05, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-[#D7B47A] z-20 pointer-events-none drop-shadow-md" style={{ borderTopLeftRadius: '12px', borderBottomRightRadius: '30px' }}><div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#D7B47A] rounded-full opacity-80" /></div>
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-[#D7B47A] z-20 pointer-events-none drop-shadow-md" style={{ borderBottomRightRadius: '12px', borderTopLeftRadius: '30px' }}><div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#D7B47A] rounded-full opacity-80" /></div>
              <div className="relative w-48 h-64 overflow-hidden shadow-2xl bg-[#0F141E] cursor-pointer" style={{ borderRadius: '6px', boxShadow: '0 15px 40px -10px rgba(0,0,0,0.7)' }}>
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" className="w-full h-full object-cover grayscale-[20%] sepia-[10%] group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A202C] to-[#0F141E]">
                    <span className="text-6xl font-serif text-[#D7B47A] drop-shadow-md" style={{ fontFamily: "'DM Serif Display', serif" }}>{userName.charAt(0).toUpperCase() || 'S'}</span>
                  </div>
                )}
                <motion.div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: isHoveringAvatar ? 1 : 0 }} transition={{ duration: 0.2 }}><Camera className="w-10 h-10 text-white" /></motion.div>
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" onChange={handleProfilePictureUpload} onMouseEnter={() => setIsHoveringAvatar(true)} onMouseLeave={() => setIsHoveringAvatar(false)} />
              </div>
            </motion.div>
          </div>
          <div className="flex-1 text-center md:text-left pt-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: '#F3E7D9', textShadow: '0 0 15px rgba(215,180,122,0.6), 0 0 30px rgba(215,180,122,0.4), 0 0 50px rgba(215,180,122,0.2)' }}>
              Welcome Back, Swass
            </h1>
            <p className="text-xl md:text-2xl italic mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#E8C89C', textShadow: '0 2px 20px rgba(215,180,122,0.3)' }}>{formattedDate}</p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="relative max-w-xl pl-6 py-2 border-l-2 border-[#D7B47A]/30 md:mx-0 mx-auto">
               <Quote className="absolute -top-3 -left-3 w-6 h-6 text-[#D7B47A] bg-[#0b1220] p-1" />
               <p className="text-xl md:text-2xl text-[#D7B47A]/90 font-serif leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>"{dailyQuote.text}"</p>
               <div className="flex items-center gap-3 mt-3"><div className="h-px w-8 bg-[#D7B47A]/40" /><span className="text-sm uppercase tracking-widest text-[#D7B47A]/60 font-semibold">{dailyQuote.author}</span></div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* SECTION 2: THE COLLECTED MEMORIES (TOP REEL) */}
      <motion.div variants={itemVariants} className="mb-16">
        <div className="relative w-full overflow-hidden py-4 group/rail">
          <h3 className="text-[#D7B47A]/60 text-sm tracking-[0.3em] uppercase mb-4 text-center font-serif">— Collected Memories —</h3>
          <div className="flex gap-6 w-max animate-scroll pl-4">
            {reelPhotos.map((photoUrl, index) => (
              <div key={`${index}-${photoUrl}`} className="relative shrink-0 w-48 h-72 md:w-56 md:h-80 rounded-sm overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 group/item cursor-pointer" style={{ border: '4px solid #1a1a1a', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                <div className="absolute inset-0 border border-[#D7B47A]/30 z-10 pointer-events-none" />
                <img src={photoUrl} alt={`Memory ${index}`} className="w-full h-full object-cover grayscale-[50%] sepia-[30%] group-hover/item:grayscale-0 group-hover/item:sepia-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"><Camera className="w-8 h-8 text-white drop-shadow-md" /></div>
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" onChange={(e) => handleReelImageUpload(e, index)} title="Click to replace this specific memory" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6">
        {/* SECTION 3: STATS CARDS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat) => (
            <Link to={stat.link} key={stat.label} className="block h-80">
              <motion.div className="relative h-full flex flex-col justify-end p-6 rounded-xl overflow-hidden cursor-pointer group" style={{ border: '1px solid rgba(215,180,122,0.3)', boxShadow: `0 8px 32px rgba(0,0,0,0.4)` }} whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
                <div className="absolute inset-0 z-0">
                  <img src={stat.image} alt={stat.label} className="w-full h-full object-cover transition-all duration-700 ease-out grayscale sepia-[0.3] group-hover:grayscale-0 group-hover:sepia-0 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/80 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2"><span className="text-3xl text-[#D7B47A]/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{stat.icon}</span></div>
                  <span className="text-5xl md:text-6xl font-light block mb-2 text-[#F3E7D9]" style={{ fontFamily: "'DM Serif Display', serif" }}>{stat.value}</span>
                  <span className="text-xs tracking-wider uppercase block mb-1 text-[#F3E7D9]/90 font-semibold" style={{ letterSpacing: '0.15em' }}>{stat.label}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D7B47A] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left z-20" />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* SECTION 4: SPLIT LAYOUT (MEMORY STREAM & BULLETIN) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">
          
          {/* LEFT: RECENT CHRONICLES */}
          <div className="relative overflow-hidden group">
             <div className="flex items-center gap-3 mb-6 border-b border-[#D7B47A]/20 pb-2">
               <h3 className="text-[#D7B47A] text-lg tracking-widest uppercase font-serif">Recent Chronicles</h3>
               <div className="h-px flex-1 bg-gradient-to-r from-[#D7B47A]/20 to-transparent" />
             </div>

             {dynamicChronicles.length > 0 ? (
               <div className={`flex gap-5 w-max py-2 ${shouldScrollReel ? 'animate-scroll-fast hover:[animation-play-state:paused]' : 'justify-start'}`}>
                  {(shouldScrollReel ? [...dynamicChronicles, ...dynamicChronicles] : dynamicChronicles).map((item, idx) => (
                    <Link to={item.link} key={`${item.id}-${idx}`} className="block">
                      <div className="relative w-60 h-72 rounded-sm overflow-hidden border border-[#333] group-item transition-all duration-300 hover:scale-105 hover:border-[#D7B47A]/50 bg-[#151a25]" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                          <div className="h-44 overflow-hidden relative">
                             {item.image ? (
                               <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale-[30%] sepia-[20%] group-hover:grayscale-0 transition-all duration-500" />
                             ) : (
                               <div className="w-full h-full bg-[#0b0e14] flex flex-col items-center justify-center border-b border-white/5">
                                 <ImageOff className="text-white/10 w-8 h-8 mb-2" />
                                 <span className="text-[10px] uppercase tracking-tighter text-white/20 font-serif">No Visual Record</span>
                               </div>
                             )}
                             <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] uppercase text-[#D7B47A] border border-white/10">{item.date}</div>
                          </div>
                          <div className="p-4 flex flex-col h-28 justify-center bg-gradient-to-b from-[#1A202C] to-[#12161f]">
                             <h4 className="text-[#E8C89C] font-serif text-lg leading-tight line-clamp-2">{item.title}</h4>
                             <div className="w-full h-px bg-[#333] mt-3 group-hover:bg-[#D7B47A]/30 transition-colors" />
                          </div>
                      </div>
                    </Link>
                  ))}
               </div>
             ) : (
               <div className="h-72 flex items-center justify-center border border-dashed border-[#D7B47A]/20 rounded-sm">
                 <p className="text-[#D7B47A]/40 font-serif italic">
                   {/* Conditional Loading Text */}
                   {places.length === 0 && vaultEntries.length === 0 ? "Loading Chronicles..." : "No chronicles yet recorded..."}
                 </p>
               </div>
             )}
          </div>

          {/* RIGHT: BULLETIN BOARD */}
          <div className="relative flex flex-col gap-4 md:gap-5 md:items-end perspective-1000 mt-12 md:mt-0">
            <div className="relative p-5 rounded-sm rotate-[-2deg] origin-top hover:rotate-0 hover:scale-[1.02] transition-all duration-300 ease-out w-full md:w-[90%] z-10" style={{ background: `linear-gradient(135deg, #f8f0c6 0%, #f3e5ab 50%, #e8d899 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`, backgroundBlendMode: 'overlay', boxShadow: '2px 4px 15px rgba(0,0,0,0.2), inset 0 0 40px rgba(44, 36, 27, 0.05)', color: '#2c241b', transformStyle: 'preserve-3d' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-md"><div className="w-3.5 h-3.5 rounded-full bg-red-800 border border-black/30 shadow-[inset_0 2px 4px rgba(255,255,255,0.3)]" /><div className="w-0.5 h-2.5 bg-gray-400 mx-auto" /></div>
              <div className="absolute -top-2 -left-2 w-12 h-5 bg-white/30 rotate-[-40deg] backdrop-blur-[1px] shadow-sm pointer-events-none" />
              <h2 className="text-xl mb-3 text-center font-bold tracking-widest uppercase border-b-2 border-[#2c241b]/20 pb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>Society Bulletin</h2>
              <div className="space-y-3 relative z-10">
                <BulletinStickyItem title="Kolkata’s Food Scene Poised for a Culinary Reset in 2026" description="As the city enters 2026, Kolkata’s food culture is at an “interesting crossroads,” with plenty of new restaurants, pop-ups and global menus emerging — but diners are now craving authenticity, original concepts and quieter, meaningful dining experiences." />
                <BulletinStickyItem title="Bakeries and Dessert Spots Bustling With NY Demand" description="Iconic and century-old bakeries like Imperial Bakers and Nahoum & Sons, along with local home bakers in Bow Barracks and Taltala, are seeing rising demand for New Year desserts and seasonal treats" />
              </div>
              <div className="mt-4 text-right text-[10px] italic opacity-70 font-serif">{formattedDate}</div>
            </div>

            <div className="relative p-4 rounded-sm rotate-[3deg] origin-top hover:rotate-0 hover:scale-[1.02] transition-all duration-300 ease-out w-full md:w-[80%] -mt-4 md:-mr-4 z-20" style={{ background: `linear-gradient(135deg, #e6f3eb 0%, #dbece5 50%, #cadad3 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`, backgroundBlendMode: 'overlay', boxShadow: '4px 6px 20px rgba(0,0,0,0.25), inset 0 0 30px rgba(0,0,0,0.05)', color: '#1a2e26', transformStyle: 'preserve-3d' }}>
              <div className="absolute -top-3 right-1/2 translate-x-1/2 z-20 drop-shadow-md"><div className="w-3.5 h-3.5 rounded-full bg-[#2a4a5e] border border-black/30 shadow-[inset_0 2px 4px rgba(255,255,255,0.3)]" /><div className="w-0.5 h-2.5 bg-gray-400 mx-auto" /></div>
              <h2 className="text-lg mb-2 text-center font-bold tracking-widest uppercase border-b border-[#1a2e26]/20 pb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>Member Notices</h2>
              <div className="space-y-2 relative z-10">
                <div className="pl-2"><h4 className="font-bold text-base font-serif leading-none mb-0.5">Evening Poetry</h4><p className="text-xs leading-tight font-serif opacity-90">Open mic at library. 7 PM.</p></div>
                 <div className="pl-2"><h4 className="font-bold text-base font-serif leading-none mb-0.5">Found Item</h4><p className="text-xs leading-tight font-serif opacity-90">Silk scarf near fountain.</p></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SECTION 5: AMBIENT TIME DISPLAY */}
      <motion.div className="fixed bottom-8 right-8 z-50 hidden md:block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}>
        <div className="px-5 py-3 rounded-full" style={{ background: 'rgba(11,18,32,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(215,180,122,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <span className="text-[#E8C89C] text-base tracking-wider font-serif">{formattedTime}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function BulletinStickyItem({ title, description }: { title: string, description: string }) {
  return (
    <div className="border-l-2 border-[#2c241b]/20 pl-2">
      <h4 className="font-bold text-[#2c241b] text-base font-serif leading-none mb-0.5">{title}</h4>
      <p className="text-[#4a3b2a] text-xs leading-tight font-serif">{description}</p>
    </div>
  );
}