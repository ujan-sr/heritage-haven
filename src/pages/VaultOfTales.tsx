import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, ImagePlus, MapPin, Search, Globe, Trash2, Camera, ChevronRight, BookOpen, Flame } from 'lucide-react';
import { useVaultTales, VaultEntry, VaultMemory } from '@/hooks/useTales'; 

// --- CONSTANTS ---
const PLACE_TYPES = [
  { value: 'Close', label: 'Close' },
  { value: 'Hommie', label: 'Hommie' },
  { value: 'Babe', label: 'Babe' },
  { value: 'Just friend', label: 'Just Friend' },
  { value: 'museum', label: 'Museum' },
  { value: 'park', label: 'Park' },
  { value: 'other', label: 'Other' }
];

type SortOrder = 'recent' | 'oldest' | 'rating';

export default function Vault() {
  const { 
    vaultEntries, 
    loading,
    addVaultEntry, 
    deleteVaultEntry, 
    addChronicleToEntry, 
    removeChronicleFromEntry 
  } = useVaultTales();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<VaultEntry | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaces = vaultEntries
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      if (sortOrder === 'recent') return b.createdAt - a.createdAt;
      if (sortOrder === 'oldest') return a.createdAt - b.createdAt;
      if (sortOrder === 'rating') return b.rating - a.rating;
      return 0;
    });

  // Updated to accept files separately
  const handleAdd = async (placeData: Omit<VaultEntry, 'id' | 'createdAt' | 'memories'>, files: File[]) => {
    await addVaultEntry(placeData, files);
    setIsAddOpen(false);
  };

  return (
    <div className="min-h-screen text-[#E8C89C] pb-24 overflow-x-hidden">
      <div className="w-full pl-0 pr-6 pt-12 pb-8">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-left">
          <h1 className="text-4xl md:text-6xl mb-3" style={{ fontFamily: "'DM Serif Display', serif", 
                color: '#F3E7D9', 
                textShadow: '0 0 15px rgba(215,180,122,0.6), 0 0 30px rgba(215,180,122,0.4), 0 0 50px rgba(215,180,122,0.2)' 
              }}>
            Swasshold
          </h1>
          <p className="text-xl md:text-2xl italic mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#E8C89C', textShadow: '0 2px 20px rgba(215,180,122,0.3)' }}
            >
            "A vault of moments shaped by the people who walked the journey with you"
          </p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row items-end mb-16 w-full border-b border-[#D7B47A]/10 pb-6">
          <div className="flex items-end gap-8 w-full md:w-auto md:pr-40">
           <div className="relative flex-1 md:w-96 group">
             <div className="absolute -bottom-1 left-6 right-6 h-[2px] bg-[#927d36] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center z-10" />
             <div className="absolute inset-0 bg-red-600/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
             <div className="relative flex items-center bg-[#f5f5f0a2] border-2 border-[#D6D3D1] rounded-2xl px-5 py-3 transition-all duration-300 group-focus-within:border-[#927d36] group-focus-within:bg-white shadow-md group-focus-within:shadow-xl">
               <Search className="w-5 h-5 text-[#958334] group-focus-within:text-[#927d36] transition-colors duration-300 stroke-[2.5px]" />
               <input 
                 type="text"
                 placeholder="Search the archives..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-transparent ml-3 text-sm md:text-base text-[#1C1917] placeholder-[#927d36] focus:outline-none font-sans font-semibold tracking-tight"
               />
               {searchQuery && (
                 <button 
                   onClick={() => setSearchQuery('')}
                   className="ml-2 p-1 rounded-full hover:bg-red-100 text-[#1C1917] transition-all"
                 >
                   <X size={18} strokeWidth={2.5} />
                 </button>
               )}
             </div>
           </div>
            
            <div className="relative group min-w-[140px]">
               <select 
                 value={sortOrder}
                 onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                 className="w-full appearance-none bg-transparent border-b border-[#D7B47A]/30 py-2 pl-2 pr-6 text-base text-[#D7B47A]/80 focus:outline-none focus:border-[#D7B47A] cursor-pointer font-serif hover:text-[#D7B47A] transition-colors duration-300"
               >
                 <option value="recent" className="bg-[#151a25] text-[#D7B47A]">Most Recent</option>
                 <option value="oldest" className="bg-[#151a25] text-[#D7B47A]">Oldest First</option>
                 <option value="rating" className="bg-[#151a25] text-[#D7B47A]">Highest Rated</option>
               </select>
               <div className="absolute right-0 bottom-3 pointer-events-none text-[#D7B47A]/40 group-hover:text-[#D7B47A] transition-colors">
                 <ChevronRight className="w-4 h-4 rotate-90" />
               </div>
            </div>
          </div>

          <button onClick={() => setIsAddOpen(true)} className="group mt-8 md:mt-0 md:absolute md:right-0 md:bottom-[-10px] w-28 h-28 flex items-center justify-center hover:scale-105 hover:rotate-3 transition-transform duration-300 focus:outline-none z-10">
            <img src="/images/add-friend.png" className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]" />
          </button>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="text-left py-12">
            {loading && <p className="text-[#D7B47A]/50 animate-pulse">Consulting the archives...</p>}
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-start">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} onClick={() => setSelectedPlace(place)} />
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {isAddOpen && (
          <Modal onClose={() => setIsAddOpen(false)} title="Stamp New Place">
            <AddPlaceForm onSubmit={handleAdd} onCancel={() => setIsAddOpen(false)} />
          </Modal>
        )}
        {selectedPlace && (
          <PlaceDetailModal 
            place={vaultEntries.find(p => p.id === selectedPlace.id) || selectedPlace} 
            onClose={() => setSelectedPlace(null)} 
            onDelete={() => { deleteVaultEntry(selectedPlace.id); setSelectedPlace(null); }}
            onAddMemory={addChronicleToEntry} 
            onRemoveMemory={removeChronicleFromEntry}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PlaceCard({ place, onClick }: { place: VaultEntry; onClick: () => void }) {
  const hasPhotos = place.photos && place.photos.length > 0;
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -5, transition: { duration: 0.2 } }} onClick={onClick}
      className="group relative bg-[#151a25] rounded-sm overflow-hidden cursor-pointer border border-[#D7B47A]/10 shadow-lg hover:shadow-2xl transition-all duration-300 max-w-sm">
      <div className="h-56 overflow-hidden relative border-b border-[#D7B47A]/10">
        {hasPhotos ? (
          <img src={place.photos[0]} alt={place.name} className="w-full h-full object-cover grayscale-[30%] sepia-[10%] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#0F141E] pattern-dots"><MapPin className="w-12 h-12 text-[#D7B47A]/20" /></div>
        )}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm border border-[#D7B47A]/20 text-[#D7B47A] text-[10px] uppercase tracking-widest rounded-sm">{place.type}</div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-serif text-[#F3E7D9] mb-2 leading-tight group-hover:text-[#D7B47A] transition-colors truncate">{place.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < place.rating ? '#D7B47A' : 'none'} stroke={i < place.rating ? '#D7B47A' : '#4a5568'} />))}
        </div>
        <div className="flex items-center justify-between text-xs text-[#D7B47A]/60 font-serif border-t border-[#D7B47A]/10 pt-3 mt-2">
          <span>{place.visitDate}</span>
          {place.tags.length > 0 && <span>#{place.tags[0]}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function PlaceDetailModal({ place, onClose, onDelete, onAddMemory, onRemoveMemory }: { 
  place: VaultEntry, 
  onClose: () => void, 
  onDelete: () => void,
  onAddMemory: (entryId: string, memory: Omit<VaultMemory, 'id' | 'photos'>, files: File[]) => void,
  onRemoveMemory: (entryId: string, memoryId: string) => void
}) {
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  
  // Separate previews from actual files to upload
  const [newMemoryPhotos, setNewMemoryPhotos] = useState<string[]>([]);
  const [newMemoryFiles, setNewMemoryFiles] = useState<File[]>([]);
  
  const [isStamping, setIsStamping] = useState(false);
  
  const [activeReelPhotos, setActiveReelPhotos] = useState<string[] | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Store actual files for upload
    setNewMemoryFiles(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setNewMemoryPhotos(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleSeal = () => {
    if (!newMemoryText.trim()) return;
    setIsStamping(true); // START STAMP ANIMATION
    
    // Call Supabase Hook
    onAddMemory(
        place.id, 
        { 
            text: newMemoryText, 
            date: new Date().toLocaleDateString() 
        }, 
        newMemoryFiles
    );

    setTimeout(() => {
      setIsAddingMemory(false);
      setNewMemoryText('');
      setNewMemoryPhotos([]);
      setNewMemoryFiles([]);
      setIsStamping(false); // END STAMP ANIMATION
    }, 800);
  };

  const labelSubClass = "text-[10px] uppercase text-[#D7B47A]/50 tracking-widest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0B1220]/90 backdrop-blur-md" onClick={onClose} />
      
      {/* --- REEL OVERLAY (SNAP SCROLL) --- */}
      <AnimatePresence>
        {activeReelPhotos && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center"
          >
            <button 
              onClick={() => setActiveReelPhotos(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-20"
            >
              <X size={32} />
            </button>

            <div className="w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory px-4 md:px-12 pb-8 scrollbar-hide">
              <div className="flex gap-4 min-w-full items-center">
                {activeReelPhotos.map((photo, index) => (
                  <div key={index} className="snap-center shrink-0 flex items-center justify-center h-[80vh] w-auto max-w-[90vw]">
                      <img 
                        src={photo} 
                        alt={`reel-${index}`} 
                        className="max-h-full max-w-full object-contain shadow-2xl" 
                      />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={isStamping ? { 
          scale: [1, 0.95, 1.05, 1], 
          rotate: [0, -2, 2, 0],
          filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
        } : {}}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative w-full max-w-5xl h-[85vh] overflow-hidden rounded-xl shadow-2xl z-10 flex flex-col md:flex-row"
        style={{ background: 'linear-gradient(145deg, #fdf8f0 0%, #f3e7d9 100%)', border: '1px solid rgba(215, 180, 122, 0.4)' }}
      >
        <div className="w-full md:w-[35%] bg-[#1a1f2c] flex flex-col relative">
          <div className="h-64 md:h-1/2 overflow-hidden border-b border-[#D7B47A]/30">
            <img src={place.photos[0]} className="w-full h-full object-cover grayscale-[20%]" alt={place.name} />
          </div>
          <div className="p-8 text-[#F3E7D9] overflow-y-auto custom-scrollbar">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D7B47A] font-bold">The Kindred</span>
            <h1 className="text-3xl font-serif mt-2 mb-4 leading-tight">{place.name}</h1>
            <div className="space-y-4">
                <div><p className={labelSubClass}>Type</p><p className="font-mono text-sm">{place.type}</p></div>
                <div>
                  <p className={labelSubClass}>About</p>
                  <p className="text-sm leading-relaxed text-[#F3E7D9]/80 mt-1">{place.notes}</p>
                </div>
                <div className="flex flex-wrap gap-2">{place.tags.map(tag => (<span key={tag} className="px-2 py-0.5 border border-[#D7B47A]/30 text-[#D7B47A] text-[9px] uppercase tracking-wider rounded">{tag}</span>))}</div>
            </div>
            <button onClick={onDelete} className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase text-red-400 hover:text-red-300 tracking-widest transition-colors opacity-60 hover:opacity-100"><Trash2 size={12} /> Revoke Tale</button>
          </div>
        </div>

        <div className="w-full md:w-[65%] flex flex-col h-full bg-[#fdf8f0]/50 backdrop-blur-sm">
          <div className="px-8 pt-8 pb-4 flex justify-between items-end border-b border-[#D7B47A]/10">
            <h2 className="font-serif text-2xl text-[#0B1220]">Collected Chronicles</h2>
            {!isAddingMemory && (
                <button onClick={() => setIsAddingMemory(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D7B47A] text-[#0B1220] text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#c9a365] transition-colors"><Plus size={14} /> Add New Story</button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar">
            <AnimatePresence>
              {isAddingMemory && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                  className="bg-white/60 p-6 rounded-lg border-2 border-[#D7B47A] shadow-inner mb-8 relative overflow-hidden"
                >
                  {/* --- STAMP SEAL OVERLAY --- */}
                  <AnimatePresence>
                    {isStamping && (
                      <motion.div 
                        initial={{ scale: 4, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: -15 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                      >
                        <img 
                          src="/images/approved.png" 
                          alt="Approved" 
                          className="w-48 h-48 object-contain drop-shadow-2xl opacity-80"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-lg text-[#2C1810] placeholder:text-slate-300 resize-none" 
                    style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
                    placeholder="Pen your latest story here..." 
                    rows={4} 
                    value={newMemoryText} 
                    onChange={(e) => setNewMemoryText(e.target.value)} 
                  />
                  <div className="flex flex-wrap gap-3 mt-4">
                    {newMemoryPhotos.map((p, i) => (<div key={i} className="w-20 h-20 border border-[#D7B47A]/20 p-1 bg-white shadow-sm rotate-1"><img src={p} className="w-full h-full object-cover" /></div>))}
                    <label className="w-20 h-20 border-2 border-dashed border-[#D7B47A]/30 flex flex-col items-center justify-center cursor-pointer hover:bg-[#D7B47A]/5 transition-colors text-[#D7B47A]"><Camera size={20} /><input type="file" multiple className="hidden" onChange={handlePhotoUpload} /></label>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setIsAddingMemory(false)} className="text-[10px] font-bold uppercase text-slate-400">Cancel</button>
                    <button onClick={handleSeal} className="px-6 py-2 bg-[#0B1220] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">Seal Story</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {place.memories.map((mem, idx) => (
              <div key={mem.id || idx} className="flex flex-col md:flex-row gap-8 items-start p-8 border-4 border-[#0B1220]/20 rounded-xl bg-white/40 shadow-sm transition-all hover:shadow-md group relative">
                <div 
                  className="w-full md:w-48 h-48 flex-shrink-0 cursor-pointer" 
                  onClick={() => { if (mem.photos?.length > 0) setActiveReelPhotos(mem.photos); }}
                >
                  <div className="w-full h-full bg-white p-2 shadow-lg border border-slate-100 rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500 overflow-hidden relative">
                    <img src={mem.photos?.[0] || place.photos[0]} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all" alt="Chronicle" />
                  </div>
                </div>

                <div className="flex-grow flex flex-col h-full min-h-[192px]">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D7B47A]" />
                      <span className="text-[9px] font-mono uppercase text-slate-400 tracking-[0.2em]">{mem.date}</span>
                    </div>
                    <p className="text-[#2C1810] text-xl leading-relaxed mt-4" style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}>
                      "{mem.text}"
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#D7B47A]/10">
                    <span className="text-[10px] font-serif italic text-[#8C7A70]">Verified Ledger Entry</span>
                    <button onClick={() => onRemoveMemory(place.id, mem.id)} className="w-10 h-10 bg-[#D7B47A]/20 flex items-center justify-center rounded text-red-900/60 hover:bg-red-600 hover:text-white transition-all shadow-inner">
                      <Flame size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-white/40 border-t border-[#D7B47A]/10 flex justify-end">
            <button onClick={onClose} className="px-12 py-3 bg-[#0B1220] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all rounded-sm">Close Tale</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- ADD FORM & MODAL ---
function AddPlaceForm({ onSubmit, onCancel }: { onSubmit: (p: Omit<VaultEntry, 'id' | 'createdAt' | 'memories'>, files: File[]) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({ name: '', type: 'close', rating: 5, visitDate: new Date().toISOString().split('T')[0], notes: '', tags: '' });
  
  // Separate previews from actual files
  const [previewPhotos, setPreviewPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Store files for upload
    setPhotoFiles(prev => [...prev, ...files]);

    // Create previews for UI
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setPreviewPhotos(prev => [...prev, event.target.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass formData separate from files. ID and CreatedAt are now handled by DB/Hook
    onSubmit({ 
        ...formData, 
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean), 
        photos: [] // This will be filled by the hook after upload
    }, photoFiles);
  };
  
  const inputClass = "w-full bg-[#0B1220] border border-[#D7B47A]/20 rounded-sm px-3 py-2 text-[#F3E7D9] focus:outline-none focus:border-[#D7B47A]";
  const labelClass = "block text-xs uppercase tracking-wider text-[#D7B47A]/70 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className={labelClass}>Name</label>
    <input 
      required 
      className={inputClass} 
      value={formData.name} 
      onChange={e => setFormData({...formData, name: e.target.value})} 
    />
  </div>

  <div>
    <label className={labelClass}>Type</label>
    <select 
      className={inputClass} 
      value={formData.type} 
      onChange={e => setFormData({...formData, type: e.target.value})}
    >
      {PLACE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
    </select>
  </div>

  <div>
    <label className={labelClass}>About</label>
    <textarea 
      className={inputClass} 
      rows={3}
      value={formData.notes} 
      onChange={e => setFormData({...formData, notes: e.target.value})} 
    />
  </div>

  <div>
    <label className={labelClass}>Tags</label>
    <input 
      className={inputClass} 
      value={formData.tags} 
      onChange={e => setFormData({...formData, tags: e.target.value})} 
    />
  </div>

  <div>
    <label className={labelClass}>Photograph</label>
    <div className="flex flex-wrap gap-2 mt-2">
      {previewPhotos.map((p, i) => (
        <div key={i} className="w-16 h-16 border border-[#D7B47A]/40 rounded overflow-hidden">
          <img src={p} className="w-full h-full object-cover" />
        </div>
      ))}
      <label className="w-16 h-16 border-2 border-dashed border-[#D7B47A]/20 flex items-center justify-center cursor-pointer hover:bg-[#D7B47A]/5 text-[#D7B47A]">
        <Camera size={20} />
        <input type="file" multiple className="hidden" onChange={handlePhotoUpload} />
      </label>
    </div>
  </div>

  <div className="pt-4 flex gap-3">
    <button type="button" onClick={onCancel} className="flex-1 py-2 border border-[#D7B47A]/30 text-[#D7B47A] rounded-sm">Cancel</button>
    <button type="submit" className="flex-1 py-2 bg-[#D7B47A] text-[#0B1220] font-bold rounded-sm">Stamp Vault</button>
  </div>
</form>
  )
};

function Modal({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative w-full max-w-md bg-[#151a25] border border-[#D7B47A]/30 p-6 rounded-sm shadow-2xl z-10">
        <div className="flex justify-between items-center mb-6 border-b border-[#D7B47A]/20 pb-2"><h2 className="text-2xl font-serif text-[#F3E7D9]">{title}</h2><button onClick={onClose} className="text-[#D7B47A]/60 hover:text-[#D7B47A]"><X size={20}/></button></div>
        {children}
      </motion.div>
    </div>
  );
}