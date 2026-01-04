import React, { useState, useEffect } from 'react'; // <--- Added useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, ImagePlus, MapPin, Search, Globe, Trash2, Camera, ChevronRight } from 'lucide-react';
import { usePassportStore, Place } from '@/stores/usePassportStore'; 

// --- CONSTANTS ---
const PLACE_TYPES = [
  { value: 'cafe', label: 'Café' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'museum', label: 'Museum' },
  { value: 'park', label: 'Park' },
  { value: 'other', label: 'Other' }
];

type SortOrder = 'recent' | 'oldest' | 'rating';

// --- MAIN COMPONENT ---
export default function Passport() {
  // Added fetchPlaces here
  const { places, addPlace, deletePlace, fetchPlaces } = usePassportStore();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // --- ADDED THIS SECTION ONLY: Load data on startup ---
  useEffect(() => {
    fetchPlaces();
  }, []);
  // ----------------------------------------------------

  // Sorting & Filtering
  const filteredPlaces = places
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      if (sortOrder === 'recent') return b.createdAt - a.createdAt;
      if (sortOrder === 'oldest') return a.createdAt - b.createdAt;
      if (sortOrder === 'rating') return b.rating - a.rating;
      return 0;
    });

  const handleAdd = (place: Place) => {
    addPlace(place);
    setIsAddOpen(false);
  };

  return (
    <div className="min-h-screen text-[#E8C89C] pb-24 overflow-x-hidden">
      <div className="w-full pl-0 pr-6 pt-12 pb-8">
        
        {/* TITLE */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-left">
          <h1 className="text-4xl md:text-6xl mb-3" style={{ fontFamily: "'DM Serif Display', serif", 
                color: '#F3E7D9', 
                textShadow: '0 0 15px rgba(215,180,122,0.6), 0 0 30px rgba(215,180,122,0.4), 0 0 50px rgba(215,180,122,0.2)' 
              }}>
            Swassport
          </h1>
          <p className="text-xl md:text-2xl italic mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#E8C89C', textShadow: '0 2px 20px rgba(215,180,122,0.3)' }}
            >
            "A collection of establishments that have left their mark upon the journey."
          </p>
        </motion.div>

        {/* --- ELEGANT CONTROLS (Layout Fixed) --- */}
        <div className="relative flex flex-col md:flex-row items-end mb-16 w-full border-b border-[#D7B47A]/10 pb-6">
          
          <div className="flex items-end gap-8 w-full md:w-auto md:pr-40">
            {/* Modern Sleek Search */}
            <div className="relative flex-1 md:w-96 group">
              <div className="absolute -bottom-1 left-6 right-6 h-[2px] bg-[#927d36] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center z-10" />
              <div className="absolute inset-0 bg-red-600/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-[#f5f5f0a9] border-2 border-[#D6D3D1] rounded-2xl px-5 py-3 transition-all duration-300 group-focus-within:border-[#927d36] group-focus-within:bg-white shadow-md group-focus-within:shadow-xl">
                <Search className="w-5 h-5 text-[#958334] group-focus-within:text-[#927d36] transition-colors duration-300 stroke-[2.5px]" />
                <input 
                  type="text"
                  placeholder="Search the archives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent ml-3 text-sm md:text-base text-[#1C1917] placeholder-[#927d36] focus:outline-none font-sans font-semibold tracking-tight"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="ml-2 p-1 rounded-full hover:bg-red-100 text-[#1C1917] transition-all">
                    <X size={18} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Sort */}
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

          {/* IMAGE STAMP BUTTON */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="group mt-8 md:mt-0 md:absolute md:right-0 md:bottom-[-10px] w-28 h-28 flex items-center justify-center hover:scale-105 hover:rotate-3 transition-transform duration-300 focus:outline-none z-10"
          >
            <img src="/images/stamp.png" className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]" />
          </button>
        </div>

        {/* GRID */}
        {filteredPlaces.length === 0 ? (
          <div className="text-left py-12"></div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-start">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} onClick={() => setSelectedPlace(place)} />
            ))}
          </motion.div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isAddOpen && (
          <Modal onClose={() => setIsAddOpen(false)} title="Stamp New Place">
            <AddPlaceForm onSubmit={handleAdd} onCancel={() => setIsAddOpen(false)} />
          </Modal>
        )}
        {selectedPlace && (
          <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} onDelete={() => { deletePlace(selectedPlace.id); setSelectedPlace(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---
// (Kept exactly as you had them)

function PlaceCard({ place, onClick }: { place: Place; onClick: () => void }) {
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
        {place.photos.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1"><ImagePlus size={12} /> +{place.photos.length - 1}</div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-serif text-[#F3E7D9] mb-2 leading-tight group-hover:text-[#D7B47A] transition-colors truncate">{place.name}</h3>
        <div className="flex items-center gap-1 mb-3">{[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < place.rating ? '#D7B47A' : 'none'} stroke={i < place.rating ? '#D7B47A' : '#4a5568'} />))}</div>
        <div className="flex items-center justify-between text-xs text-[#D7B47A]/60 font-serif border-t border-[#D7B47A]/10 pt-3 mt-2"><span>{place.visitDate}</span>{place.tags.length > 0 && <span>#{place.tags[0]}</span>}</div>
      </div>
    </motion.div>
  );
}

function PlaceDetailModal({ place, onClose, onDelete }: { place: Place, onClose: () => void, onDelete: () => void }) {
  const [showGallery, setShowGallery] = useState(false);
  const hasPhotos = place.photos && place.photos.length > 0;
  
  const nameMRZ = place.name.toUpperCase().replace(/[^A-Z0-9]/g, '<').padEnd(30, '<').substring(0, 30);
  const typeMRZ = place.type.toUpperCase().substring(0,3);
  // MRZ adjustment to handle UUIDs or shorter IDs
  const idMRZ = place.id.substring(0,9).padEnd(9, '<');
  const mrzLine1 = `P<SWASS${nameMRZ}`;
  const mrzLine2 = `${idMRZ}5IND9201018M${typeMRZ}<<<<<<<<<<<<<<02`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-lg" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, rotateX: 5, opacity: 0 }} animate={{ scale: 1, rotateX: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-3xl overflow-hidden rounded-lg shadow-2xl z-10">
        <div className="relative bg-[#fdfbf7] p-1">
          <div className="absolute inset-0 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#b38728] rounded-lg" />
          <div className="relative bg-[#fdfbf7] m-[2px] rounded-md overflow-hidden min-h-[450px] flex flex-col">
            
            <div className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-[#bf953f]/30">
              <div className="flex items-center gap-3"><Globe className="text-[#bf953f] w-8 h-8 opacity-80" /><div><h2 className="text-xs font-bold tracking-[0.3em] text-[#bf953f] uppercase">The Places Vault</h2><h1 className="text-2xl font-serif font-black tracking-wide text-[#2C1810]">OFFICIAL ENTRY PERMIT</h1></div></div>
              <div className="text-right"><div className="text-[10px] uppercase tracking-widest text-slate-400">Permit Number</div><div className="font-mono text-lg font-bold text-[#7B3230]">SWASS-{place.id.substring(0,8).toUpperCase()}</div></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row p-8 gap-8 flex-grow">
              <div className="w-32 md:w-40 flex-shrink-0 flex flex-col">
                <div onClick={() => hasPhotos && setShowGallery(true)}
                  className={`relative w-full aspect-[3/4] bg-slate-200 border-2 border-[#bf953f]/50 shadow-inner overflow-hidden rounded-sm group ${hasPhotos ? 'cursor-pointer' : ''}`}>
                  {hasPhotos ? (
                    <>
                      <img src={place.photos[0]} alt="Visa" className="w-full h-full object-cover grayscale-[20%] contrast-110 group-hover:grayscale-0 transition-all duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="text-white text-[10px] uppercase tracking-widest border border-white/50 px-2 py-1 backdrop-blur-sm flex items-center gap-1"><Camera size={12} /> Open Reel</div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#bf953f]/40"><Globe size={32} /><span className="text-[10px] mt-2 font-mono uppercase">No Img</span></div>
                  )}
                </div>
                <div className="mt-4 rotate-[-6deg] opacity-90"><div className="border-[3px] border-[#1e3a8a]/40 text-[#1e3a8a] p-2 rounded-sm inline-block mix-blend-multiply"><div className="text-[8px] font-black uppercase tracking-widest text-center leading-none">Admitted</div><div className="text-xs font-serif text-center font-bold">{place.visitDate}</div></div></div>
              </div>

              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-[9px] font-bold uppercase tracking-widest text-[#bf953f]">Place Name</label><div className="text-lg font-bold text-[#2C1810] font-serif tracking-wide border-b border-[#2C1810]/10 pb-1 truncate">{place.name}</div></div>
                  <div><label className="block text-[9px] font-bold uppercase tracking-widest text-[#bf953f]">Type / Class</label><div className="text-lg font-mono text-[#2C1810] border-b border-[#2C1810]/10 pb-1 uppercase">{place.type}</div></div>
                </div>
                <div><label className="block text-[9px] font-bold uppercase tracking-widest text-[#bf953f]">Field Notes</label><div className="mt-1 text-sm font-mono text-[#2C1810] leading-relaxed bg-[#bf953f]/5 p-3 rounded-sm border-l-2 border-[#bf953f]">{place.notes}</div></div>
                <div className="flex items-center justify-between pt-2">
                    <div><label className="block text-[9px] font-bold uppercase tracking-widest text-[#bf953f] mb-1">Rating</label><div className="flex gap-1">{[...Array(5)].map((_, i) => (<Star key={i} size={16} fill={i < place.rating ? '#b38728' : '#e2e8f0'} stroke="none" />))}</div></div>
                    <div className="flex gap-2">{place.tags.map(tag => (<span key={tag} className="px-2 py-0.5 border border-[#bf953f]/30 text-[#bf953f] text-[9px] uppercase tracking-wider rounded-full">{tag}</span>))}</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 bg-white px-6 py-4 border-t border-[#bf953f]/30 mt-auto">
                <div className="font-mono text-lg md:text-xl leading-none tracking-[0.15em] text-[#2C1810] opacity-80 select-all break-all md:break-normal text-center md:text-left mb-4">{mrzLine1}<br/>{mrzLine2}</div>
                <div className="flex justify-between items-center border-t border-[#bf953f]/10 pt-3">
                  <button onClick={onDelete} className="group flex items-center gap-2 text-[10px] font-bold uppercase text-[#7B3230] hover:text-red-600 tracking-widest transition-colors opacity-60 hover:opacity-100"><Trash2 size={12} className="mb-0.5" /> Revoke Visa</button>
                  <button onClick={onClose} className="px-8 py-2 bg-[#2C1810] text-[#fdfbf7] text-xs font-bold uppercase tracking-widest hover:bg-[#1a0f0a] transition-colors rounded-sm shadow-md">Close</button>
                </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGallery && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center"
          >
            <button onClick={() => setShowGallery(false)} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-20"><X size={32} /></button>
            <div className="w-full h-full flex items-center overflow-x-auto snap-x snap-mandatory px-4 md:px-12 pb-8 scrollbar-hide">
              <div className="flex gap-4 min-w-full items-center">
                {place.photos.map((photo, index) => (
                  <div key={index} className="snap-center shrink-0 flex items-center justify-center h-[80vh] w-auto max-w-[90vw]">
                      <img src={photo} alt={`reel-${index}`} className="max-h-full max-w-full object-contain shadow-2xl" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddPlaceForm({ onSubmit, onCancel }: { onSubmit: (p: Place) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({ name: '', type: 'cafe', rating: 5, visitDate: new Date().toISOString().split('T')[0], notes: '', tags: '', photos: [] as string[] });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setFormData(prev => ({ ...prev, photos: [...prev.photos, event.target!.result as string] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: Date.now().toString(), ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean), createdAt: Date.now() });
  };
  
  const inputClass = "w-full bg-[#0B1220] border border-[#D7B47A]/20 rounded-sm px-3 py-2 text-[#F3E7D9] focus:outline-none focus:border-[#D7B47A] transition-colors";
  const labelClass = "block text-xs uppercase tracking-wider text-[#D7B47A]/70 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className={labelClass}>Establishment Name</label><input required className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
      <div className="grid grid-cols-2 gap-4"><div><label className={labelClass}>Type</label><select className={inputClass} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>{PLACE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div><div><label className={labelClass}>Date Visited</label><input type="date" className={inputClass} value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})}/></div></div>
      <div><label className={labelClass}>Rating</label><div className="flex gap-2 mt-1">{[1, 2, 3, 4, 5].map(star => (<button key={star} type="button" onClick={() => setFormData({...formData, rating: star})}><Star size={24} fill={star <= formData.rating ? '#D7B47A' : 'none'} stroke={star <= formData.rating ? '#D7B47A' : '#4a5568'} /></button>))}</div></div>
      <div><label className={labelClass}>Field Notes</label><textarea rows={3} className={inputClass} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
      <div><label className={labelClass}>Tags</label><input className={inputClass} value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} /></div>
      <div><label className={labelClass}>Photographs</label><div className="flex flex-wrap gap-2 mt-2">{formData.photos.map((p, i) => (<div key={i} className="relative w-16 h-16 group"><img src={p} className="w-full h-full object-cover rounded-sm border border-[#D7B47A]/30" /><button type="button" className="absolute -top-1 -right-1 bg-red-900 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setFormData(prev => ({...prev, photos: prev.photos.filter((_, idx) => idx !== i)}))}><X size={10} /></button></div>))}<label className="w-16 h-16 border border-dashed border-[#D7B47A]/40 rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#D7B47A]/5 transition-colors"><ImagePlus className="text-[#D7B47A]/60" /><input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} /></label></div></div>
      <div className="pt-4 flex gap-3"><button type="button" onClick={onCancel} className="flex-1 py-2 border border-[#D7B47A]/30 text-[#D7B47A] hover:bg-[#D7B47A]/10 rounded-sm transition-colors">Cancel</button><button type="submit" className="flex-1 py-2 bg-[#D7B47A] text-[#0B1220] font-bold rounded-sm hover:bg-[#c5a365] transition-colors">Stamp Visa</button></div>
    </form>
  );
}

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