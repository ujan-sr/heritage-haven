import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Target, Trash2, Calendar, Search, X, 
  ChevronDown, CheckCircle2, Clock, MapPin, Check 
} from 'lucide-react';

// --- IMPORTS FROM YOUR STORES ---
import { useData } from '@/stores/DataStore'; 
import { useTimeStore } from '@/stores/useTimeStore'; 

// --- CONFIGURATION ---
const CATEGORIES: Record<string, { label: string; image: string; code: string }> = {
  career:      { label: 'Career',      image: '/images/career.png',      code: 'WRK' },
  finance:     { label: 'Finance',     image: '/images/finance.png',     code: 'FIN' },
  travel:      { label: 'Exploration', image: '/images/travel.png',      code: 'TRV' },
  health:      { label: 'Wellness',    image: '/images/health.png',      code: 'HLT' },
  skill:       { label: 'Skill',       image: '/images/skill.png',       code: 'SKL' },
  personal:    { label: 'Personal',    image: '/images/personal.png',    code: 'PER' },
  exploration: { label: 'Exploration', image: '/images/exploration.png', code: 'EXP' },
  creativity:  { label: 'Creativity',  image: '/images/creativity.png',  code: 'CRT' },
  wellness:    { label: 'Wellness',    image: '/images/wellness.png',    code: 'WEL' },
  learning:    { label: 'Academic',    image: '/images/learning.png',    code: 'LRN' },
};

const MONTHS = [
  "Anytime", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// --- MAIN COMPONENT ---
export default function Goals() {
  const { 
    goals, 
    addGoal, 
    deleteGoal, 
    incrementGoalProgress, 
    decrementGoalProgress,
    fetchGoals,     // <--- NEW: Import fetch function
    isLoadingGoals  // <--- NEW: Import loading state
  } = useData();
  
  const { currentYear } = useTimeStore();
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Dropdown State
  const [isYearOpen, setIsYearOpen] = useState(false);

  // State for Modal
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- 1. EFFECT: Fetch Goals on Year Change ---
  useEffect(() => {
    fetchGoals(selectedYear);
  }, [selectedYear, fetchGoals]);

  // Derived State
  const activeGoal = useMemo(() => {
    return goals.find((g: any) => g.id === selectedGoalId) || null;
  }, [goals, selectedGoalId]);

  const yearRange = useMemo(() => {
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) years.push(i); 
    return years;
  }, [currentYear]);

  const filteredGoals = useMemo(() => {
    return goals.filter((g: any) => {
      // Note: We filter by Search here, but Year is already filtered by the DB fetch
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [goals, searchQuery]);

  return (
    <div className="min-h-screen text-[#E8C89C] pb-24 overflow-x-hidden" onClick={() => setIsYearOpen(false)}>
      
      {/* --- HEADER --- */}
      <div className="w-full pl-0 pr-6 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-left">
          <h1 className="text-4xl md:text-6xl mb-3" style={{ fontFamily: "'DM Serif Display', serif", 
                color: '#F3E7D9', 
                textShadow: '0 0 15px rgba(215,180,122,0.6), 0 0 30px rgba(215,180,122,0.4), 0 0 50px rgba(215,180,122,0.2)' 
              }}>
            Swassire
          </h1>
          <p className="text-xl md:text-2xl italic mb-8"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#E8C89C', textShadow: '0 2px 20px rgba(215,180,122,0.3)' }}
            >
            "Directives and ambitions for the year {selectedYear}."
          </p>
        </motion.div>

        {/* --- CONTROLS --- */}
        <div className="relative flex flex-col md:flex-row items-end mb-16 w-full border-b border-[#D7B47A]/10 pb-6 z-20">
          <div className="flex items-end gap-6 w-full md:w-auto md:pr-40">
            {/* Search */}
            <div className="relative flex-1 md:w-96 group">
              <div className="absolute -bottom-1 left-6 right-6 h-[2px] bg-[#927d36] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-center z-10" />
              <div className="relative flex items-center bg-[#f5f5f0a9] border-2 border-[#D6D3D1] rounded-2xl px-5 py-3 transition-all duration-300 group-focus-within:border-[#927d36] group-focus-within:bg-white shadow-md group-focus-within:shadow-xl">
                <Search className="w-5 h-5 text-[#958334] group-focus-within:text-[#927d36] transition-colors duration-300 stroke-[2.5px]" />
                <input 
                  type="text"
                  placeholder="Search directives..."
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
            
            {/* --- CUSTOM YEAR DROPDOWN --- */}
            <div className="relative min-w-[140px]" onClick={(e) => e.stopPropagation()}>
               <button 
                 onClick={() => setIsYearOpen(!isYearOpen)}
                 className={`
                   w-full flex items-center justify-between gap-4 
                   bg-[#151a25] border px-4 py-3 rounded-sm transition-all duration-300 shadow-lg
                   ${isYearOpen ? 'border-[#D7B47A] shadow-[#D7B47A]/20' : 'border-[#D7B47A]/30 hover:border-[#D7B47A]/60'}
                 `}
               >
                  <span className="text-2xl font-serif text-[#D7B47A] font-bold tracking-wide">{selectedYear}</span>
                  <ChevronDown className={`w-5 h-5 text-[#D7B47A]/70 transition-transform duration-300 ${isYearOpen ? 'rotate-180 text-[#D7B47A]' : ''}`} />
               </button>

               {/* Dropdown List */}
               <AnimatePresence>
                 {isYearOpen && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
                     className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-[#0F141E]/95 backdrop-blur-xl border border-[#D7B47A]/30 rounded-sm shadow-2xl z-50 custom-scrollbar"
                   >
                     {yearRange.map(y => (
                       <div 
                         key={y} 
                         onClick={() => { setSelectedYear(y); setIsYearOpen(false); }}
                         className={`
                           px-4 py-3 cursor-pointer font-serif text-lg transition-colors flex items-center justify-between
                           ${selectedYear === y ? 'bg-[#D7B47A]/20 text-[#D7B47A]' : 'text-[#D7B47A]/60 hover:bg-[#D7B47A]/5 hover:text-[#D7B47A]'}
                         `}
                       >
                         {y}
                         {selectedYear === y && <div className="w-1.5 h-1.5 bg-[#D7B47A] rounded-full shadow-[0_0_8px_#D7B47A]" />}
                       </div>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* ADD BUTTON */}
          <button onClick={() => setIsAddOpen(true)} className="group mt-8 md:mt-0 md:absolute md:right-0 md:bottom-[-10px] w-28 h-28 flex items-center justify-center hover:scale-105 hover:rotate-3 transition-transform duration-300 focus:outline-none z-10">
              <div className="relative w-full h-full flex items-center justify-center">
                 <div className="absolute inset-0 bg-[#7B3230] rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                 <div className="relative w-24 h-24 border-4 border-double border-[#D7B47A] rounded-full flex items-center justify-center bg-[#151a25] shadow-lg group-hover:bg-[#1e2532] transition-colors">
                    <Plus className="text-[#D7B47A] w-10 h-10" />
                 </div>
              </div>
          </button>
        </div>

        {/* --- GRID OR LOADER --- */}
        {isLoadingGoals ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
               transition={{ repeat: Infinity, duration: 2 }}
               className="w-12 h-12 border-2 border-[#D7B47A] rounded-full mb-4"
             />
             <p className="font-serif text-[#D7B47A] tracking-widest text-sm">RETRIEVING DIRECTIVES...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-left py-12 text-[#D7B47A]/40 italic font-serif">
             
          </div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-start">
            {filteredGoals.map((goal: any) => (
              <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoalId(goal.id)} />
            ))}
          </motion.div>
        )}
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {isAddOpen && (
          <Modal onClose={() => setIsAddOpen(false)} title="Issue New Directive">
            <AddGoalForm onSubmit={(g) => { addGoal(g); setIsAddOpen(false); }} onCancel={() => setIsAddOpen(false)} year={selectedYear} />
          </Modal>
        )}
        
        {/* DETAIL MODAL */}
        {activeGoal && (
          <ChecklistDetailModal 
            goal={activeGoal} 
            onClose={() => setSelectedGoalId(null)} 
            onDelete={() => { deleteGoal(activeGoal.id); setSelectedGoalId(null); }} 
            onIncrement={() => incrementGoalProgress(activeGoal.id)}
            onDecrement={() => decrementGoalProgress(activeGoal.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- GOAL CARD (Unchanged logic, uses data passed from parent) ---
function GoalCard({ goal, onClick }: { goal: any; onClick: () => void }) {
  const isCompleted = goal.progress >= goal.target;
  const config = CATEGORIES[goal.category] || CATEGORIES.personal;
  
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} 
      whileHover={{ y: -5, transition: { duration: 0.2 } }} 
      onClick={onClick}
      className={`
        group relative bg-[#151a25] rounded-sm overflow-hidden cursor-pointer border shadow-lg hover:shadow-2xl transition-all duration-300 max-w-sm flex flex-col
        ${isCompleted ? 'border-[#7B3230]/40 opacity-70 hover:opacity-100' : 'border-[#D7B47A]/10 hover:border-[#D7B47A]/30'}
      `}
    >
      {/* --- IMAGE HEADER --- */}
      <div className="h-40 relative bg-[#0F141E] overflow-hidden">
        <img 
           src={config.image} 
           alt={config.label} 
           className={`
             absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110
             ${isCompleted ? 'grayscale' : 'opacity-80'}
           `}
           onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
         />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#151a25] via-[#151a25]/60 to-transparent"></div>
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-[#D7B47A]/30 text-[#D7B47A] text-[10px] uppercase tracking-widest rounded-sm z-10 shadow-lg">
          {config.label}
        </div>
        {isCompleted && (
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] z-20">
             <div className="border-2 border-[#7B3230] text-[#7B3230] bg-[#1a0f0a] px-4 py-1 text-sm font-bold uppercase tracking-widest rotate-[-10deg] shadow-2xl">
               Executed
             </div>
           </div>
        )}
      </div>

      {/* --- CONTENT --- */}
      <div className="p-5 flex-1 flex flex-col relative">
        <h3 className={`text-xl font-serif text-[#F3E7D9] mb-3 leading-tight group-hover:text-[#D7B47A] transition-colors line-clamp-2 ${isCompleted ? 'line-through decoration-[#7B3230]/50' : ''}`}>
          {goal.title}
        </h3>
        <div className="mt-auto pt-2">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#D7B47A]/50 mb-1">
               <span>Progress</span>
               <span>{goal.progress >= goal.target ? '100%' : `${Math.round((goal.progress / goal.target) * 100)}%`}</span>
            </div>
            <div className="h-1 w-full bg-[#1a202c] rounded-full overflow-hidden">
               <div className="h-full bg-[#D7B47A] transition-all duration-500 ease-out" style={{ width: `${(goal.progress / goal.target) * 100}%` }}></div>
            </div>
        </div>
        <div className="flex items-center justify-between text-xs text-[#D7B47A]/60 font-serif border-t border-[#D7B47A]/10 pt-3 mt-4">
            <span className="flex items-center gap-1"><Clock size={12}/> {goal.month}</span>
            {goal.location && <span className="flex items-center gap-1 truncate max-w-[120px]"><MapPin size={12}/> {goal.location}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// --- DETAIL MODAL (Unchanged) ---
function ChecklistDetailModal({ goal, onClose, onDelete, onIncrement, onDecrement }: any) {
  const config = CATEGORIES[goal.category] || CATEGORIES.personal;
  const isCompleted = goal.progress >= goal.target;
  const hasSubGoals = goal.subGoals && goal.subGoals.length > 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-[#0F141E]/90 backdrop-blur-md" onClick={onClose} 
      />
      <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#fdfbf7] border border-[#bf953f]/40 rounded-sm shadow-2xl z-10 flex flex-col overflow-hidden max-h-[85vh]"
      >
        <div className="h-1.5 w-full bg-[#bf953f]"></div>
        <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-[#bf953f]/30 bg-[#f8f5f0] overflow-hidden flex items-center justify-center">
                             <img 
                               src={config.image} 
                               alt={config.label} 
                               className="w-full h-full object-cover" 
                               onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/50x50/f8f5f0/bf953f?text=' + config.code; }}
                             />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-[#2C1810]/60 font-bold">{config.label} Protocol</span>
                            <span className="text-[10px] uppercase tracking-widest text-[#2C1810]/40">{goal.month} {goal.year}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-[#2C1810]/30 hover:text-[#7B3230] transition-colors"><X size={24} strokeWidth={1} /></button>
                </div>
                
                <div className="flex items-start justify-between gap-6 mb-4">
                    <h2 className={`text-3xl md:text-4xl font-serif text-[#2C1810] leading-tight font-bold ${isCompleted ? 'line-through decoration-[#7B3230]/50 opacity-60' : ''}`}>
                        {goal.title}
                    </h2>
                    {!hasSubGoals && (
                        <button 
                            onClick={() => isCompleted ? onDecrement() : onIncrement()}
                            className={`shrink-0 w-10 h-10 rounded-md border-2 flex items-center justify-center transition-all duration-300 shadow-sm ${isCompleted ? 'bg-[#2C1810] border-[#2C1810] text-[#fdfbf7]' : 'bg-white border-[#bf953f] text-transparent hover:border-[#9c7b38]'}`}
                        >
                            <Check size={24} strokeWidth={3} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
                        </button>
                    )}
                </div>
                {goal.location && (
                    <div className="flex items-center gap-2 mb-6 text-xs uppercase tracking-widest text-[#2C1810]/60 font-bold border-l-2 border-[#bf953f] pl-3">
                    <MapPin size={14} /> {goal.location}
                    </div>
                )}
                {goal.description ? (
                    <div className="mb-8 p-6 bg-[#2C1810]/5 rounded-sm border-l-2 border-[#bf953f]/30">
                        <p className="text-[#2C1810]/80 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                            {goal.description}
                        </p>
                    </div>
                ) : (
                    <div className="mb-8 italic text-[#2C1810]/30 font-serif text-sm">No operational details provided.</div>
                )}
                <div className="h-px w-full bg-[#2C1810]/10 mb-8"></div>
                {hasSubGoals && (
                    <div className="space-y-3 pb-8">
                        <h4 className="text-[10px] uppercase tracking-widest text-[#2C1810]/40 mb-3 font-bold">Execution Steps</h4>
                        {goal.subGoals.map((sub: any, idx: number) => {
                            const isChecked = idx < goal.progress;
                            const isNext = idx === goal.progress; 
                            return (
                                <div key={idx} 
                                    onClick={() => { if (isNext) onIncrement(); if (isChecked && idx === goal.progress - 1) onDecrement(); }}
                                    className={`group flex items-center gap-4 p-4 rounded-md border cursor-pointer transition-all duration-200 ${isChecked ? 'bg-[#f4f1ea] border-transparent opacity-60' : 'bg-white border-[#e5e0d6] hover:border-[#bf953f] hover:shadow-sm'}`}>
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-[#2C1810] border-[#2C1810] text-[#fdfbf7]' : 'border-[#bf953f]/40 group-hover:border-[#bf953f]'}`}>
                                        {isChecked && <Check size={14} strokeWidth={3} />}
                                    </div>
                                    <span className={`text-base font-serif ${isChecked ? 'line-through text-[#2C1810]/40' : 'text-[#2C1810]'}`}>{sub.title}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
        <div className="p-5 border-t border-[#2C1810]/5 bg-[#f8f5f0] flex justify-between items-center shrink-0">
          <button onClick={onDelete} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7B3230] hover:text-red-600 opacity-60 hover:opacity-100 transition-all">
            <Trash2 size={14} /> Delete Goal
          </button>
           {isCompleted && (
             <span className="text-[#bf953f] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <CheckCircle2 size={14} /> Recorded
             </span>
           )}
        </div>
      </motion.div>
    </div>
  );
}

// --- ADD FORM ---
function AddGoalForm({ onSubmit, onCancel, year }: { onSubmit: (g: any) => void, onCancel: () => void, year: number }) {
  const [formData, setFormData] = useState({ 
    title: '', description: '', category: 'career', month: 'Anytime', 
    location: '', subGoals: [] as { title: string }[], tempSubGoal: '' 
  });
  
  const addSubGoal = () => { if (formData.tempSubGoal) setFormData(prev => ({ ...prev, subGoals: [...prev.subGoals, { title: prev.tempSubGoal }], tempSubGoal: '' })); };
  const removeSubGoal = (index: number) => { setFormData(prev => ({ ...prev, subGoals: prev.subGoals.filter((_, i) => i !== index) })); };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!formData.title) return;
    const target = formData.subGoals.length > 0 ? formData.subGoals.length : 1;
    
    // REMOVED manual ID generation. Supabase handles this.
    onSubmit({ 
        ...formData, 
        target, 
        year, 
        progress: 0 
    });
  };

  const inputClass = "w-full bg-[#0B1220] border border-[#D7B47A]/20 rounded-sm px-3 py-2 text-[#F3E7D9] focus:outline-none focus:border-[#D7B47A] transition-colors placeholder-[#D7B47A]/20";
  const labelClass = "block text-xs uppercase tracking-wider text-[#D7B47A]/70 mb-1 font-bold";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className={labelClass}>Directive Title</label><input required className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Launch Project Alpha" /></div>
      <div><label className={labelClass}>Description / Protocol</label><textarea className={`${inputClass} h-20 resize-none font-serif`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Elaborate on the directive details..." /></div>
      <div className="grid grid-cols-2 gap-4">
         <div><label className={labelClass}>Category</label><select className={inputClass} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{Object.entries(CATEGORIES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}</select></div>
         <div><label className={labelClass}>Month</label><select className={inputClass} value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
      </div>
      <div><label className={labelClass}>Location (Optional)</label><input className={inputClass} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="City, Country" /></div>
      <div className="bg-[#0B1220]/50 border border-[#D7B47A]/10 p-3 rounded-sm mt-4">
            <label className={labelClass}>Sub-Tasks (Optional)</label>
            <div className="flex gap-2 mb-2"><input className={inputClass} value={formData.tempSubGoal} onChange={e => setFormData({...formData, tempSubGoal: e.target.value})} placeholder="Add item..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubGoal())} /><button type="button" onClick={addSubGoal} className="px-3 bg-[#D7B47A] text-[#0B1220] font-bold rounded-sm hover:bg-[#c5a365]"><Plus size={16}/></button></div>
            {formData.subGoals.length > 0 && (<ul className="max-h-24 overflow-y-auto space-y-1 mt-2">{formData.subGoals.map((sg, i) => (<li key={i} className="text-xs text-[#D7B47A] flex items-center justify-between bg-[#151a25] px-2 py-1 rounded-sm"><div className="flex items-center gap-2"><div className="w-1 h-1 bg-[#D7B47A] rounded-full"/> {sg.title}</div><button type="button" onClick={() => removeSubGoal(i)} className="text-[#D7B47A]/50 hover:text-red-400"><X size={12}/></button></li>))}</ul>)}
      </div>
      <div className="pt-4 flex gap-3"><button type="button" onClick={onCancel} className="flex-1 py-3 border border-[#D7B47A]/30 text-[#D7B47A] hover:bg-[#D7B47A]/10 rounded-sm transition-colors uppercase text-xs font-bold tracking-widest">Cancel</button><button type="submit" className="flex-1 py-3 bg-[#D7B47A] text-[#0B1220] font-bold rounded-sm hover:bg-[#c5a365] transition-colors uppercase text-xs tracking-widest">Confirm</button></div>
    </form>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative w-full max-w-md bg-[#151a25] border border-[#D7B47A]/30 p-6 rounded-sm shadow-2xl z-10">
        <div className="flex justify-between items-center mb-6 border-b border-[#D7B47A]/20 pb-2"><h2 className="text-2xl font-serif text-[#F3E7D9]">{title}</h2><button onClick={onClose} className="text-[#D7B47A]/60 hover:text-[#D7B47A]"><X size={20}/></button></div>{children}
      </motion.div>
    </div>
  );
}