import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, RotateCcw } from 'lucide-react';
import { useTimeStore } from '@/stores/useTimeStore'; 
import { useWheelStore, type WheelSpin } from '@/stores/useWheelStore'; // Added type import

// --- TYPES ---
interface TreatOption {
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

// --- CONFIGURATION (VINTAGE ENAMEL PALETTE) ---
const TREATS: TreatOption[] = [
  { label: 'CAFE', emoji: '☕', bgColor: '#F5E6D3', textColor: '#3E2723', borderColor: '#D7B47A' },
  { label: 'DINING', emoji: '🍽️', bgColor: '#4A0404', textColor: '#F3E7D9', borderColor: '#7f1d1d' },
  { label: 'PHOTO', emoji: '📸', bgColor: '#2F4F4F', textColor: '#F3E7D9', borderColor: '#486e6e' },
  { label: 'CINEMA', emoji: '🎟️', bgColor: '#1B2631', textColor: '#D7B47A', borderColor: '#34495e' },
  { label: 'ART', emoji: '🖼️', bgColor: '#D4AC0D', textColor: '#1a1a1a', borderColor: '#F1C40F' },
  { label: 'JAZZ', emoji: '🎷', bgColor: '#000000', textColor: '#D7B47A', borderColor: '#333' },
  { label: 'BOOKS', emoji: '📚', bgColor: '#A04000', textColor: '#F3E7D9', borderColor: '#d35400' },
  { label: 'DRIVE', emoji: '🚗', bgColor: '#145A32', textColor: '#F3E7D9', borderColor: '#1e8449' } 
];

export default function TreatWheel() {
  const { formattedTime } = useTimeStore(); 
  
  // --- STORE CONNECTION ---
  const { history, fetchHistory, addSpin } = useWheelStore();

  // Load history from Supabase when component mounts
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [result, setResult] = useState<TreatOption | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const getWinningSegment = (finalRotation: number): TreatOption => {
    const normalizedRotation = finalRotation % 360;
    const segmentSize = 360 / TREATS.length;
    const adjustedRotation = (360 - normalizedRotation + segmentSize / 2) % 360;
    const index = Math.floor(adjustedRotation / segmentSize);
    return TREATS[index] || TREATS[0];
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    const fullRotations = 5 + Math.floor(Math.random() * 3);
    const randomOffset = Math.random() * 360;
    const newRotation = rotation + (fullRotations * 360 + randomOffset);

    setRotation(newRotation);

    const spinDuration = 5 + (fullRotations - 5) * 0.5; 

    setTimeout(() => {
      const winning = getWinningSegment(newRotation);
      setResult(winning);
      setShowResult(true);
      setIsSpinning(false);

      // --- SAVE TO DB ---
      // The store handles the optimistic update + Supabase insert
      addSpin(winning.label, winning.emoji);
      
    }, spinDuration * 1000);
  };

  return (
    <div className="min-h-screen text-[#E8C89C] pb-24 overflow-x-hidden">
      <div className="w-full pl-0 pr-6 pt-12 pb-8">

        {/* --- HEADER --- */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-left">
                  <h1 className="text-4xl md:text-6xl mb-3" style={{ fontFamily: "'DM Serif Display', serif", 
                        color: '#F3E7D9', 
                        textShadow: '0 0 15px rgba(215,180,122,0.6), 0 0 30px rgba(215,180,122,0.4), 0 0 50px rgba(215,180,122,0.2)' 
                      }}>
                    Fortuna
                  </h1>
                  <p className="text-xl md:text-2xl italic mb-8"
                      style={{ fontFamily: "'Cormorant Garamond', serif", color: '#E8C89C', textShadow: '0 2px 20px rgba(215,180,122,0.3)' }}
                    >
                    "Spin for a moment of indulgence, let fate decide the journey."
                  </p>
                </motion.div>

        {/* --- TOP BAR --- */}
        <div className="relative flex flex-col md:flex-row items-end mb-12 w-full border-b border-[#D7B47A]/10 pb-6">
          <div className="flex items-center gap-6 w-full">
            <div className="relative flex-1 md:max-w-md group">
              <div className="absolute -bottom-1 left-6 right-6 h-[2px] bg-[#927d36] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center z-10" />
              <div className="relative flex items-center bg-[#f5f5f0a9] border-2 border-[#D6D3D1] rounded-2xl px-5 py-3 transition-all duration-300 group-hover:border-[#927d36] group-hover:bg-white shadow-md">
                <Clock className="w-5 h-5 text-[#958334] group-hover:text-[#927d36] transition-colors duration-300" />
                <span className="ml-3 text-sm md:text-base text-[#1C1917] font-sans font-semibold tracking-tight">
                  Current Time: {formattedTime}
                </span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-[#D7B47A]/60 font-serif italic">
                <Sparkles size={16} />
                <span>{isSpinning ? "The mechanism turns..." : "Fate awaits"}</span>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* LEFT: WHEEL AREA */}
          <div className="lg:col-span-2 relative">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative w-full flex flex-col items-center justify-between rounded-xl p-8 md:p-12 min-h-[600px] border border-[#D7B47A]/40 bg-transparent shadow-[0_0_30px_-5px_rgba(215,180,122,0.15)]"
             >
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#D7B47A] rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#D7B47A] rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#D7B47A] rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#D7B47A] rounded-br-xl" />

                {/* THE POINTER */}
                <div className="relative z-30 mb-2 filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                  <div className="w-10 h-14 bg-[#D7B47A] mx-auto" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                  <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-6 h-10 bg-[#4A0404]" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                </div>

                {/* THE CLASSIC WHEEL */}
                <div className="relative w-[280px] h-[280px] md:w-[450px] md:h-[450px] z-10 mb-12">
                  <div className="absolute -inset-3 rounded-full bg-[#1a1a1a] border-[8px] border-[#D7B47A] shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-0 pointer-events-none" />

                  <motion.div
                    className="w-full h-full rounded-full relative overflow-hidden"
                    style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}
                    animate={{ rotate: rotation }}
                    transition={{
                      duration: isSpinning ? 5 : 0,
                      ease: [0.2, 0.05, 0.2, 1] 
                    }}
                  >
                    {TREATS.map((treat, index) => {
                      const segmentAngle = 360 / TREATS.length;
                      const rotateVal = index * segmentAngle;
                      return (
                        <div
                          key={index}
                          className="absolute w-full h-full"
                          style={{ transform: `rotate(${rotateVal}deg)`, transformOrigin: 'center' }}
                        >
                          <div
                            className="absolute top-0 left-1/2 h-1/2 origin-bottom flex flex-col items-center justify-start pt-5"
                            style={{
                              width: '100%',
                              marginLeft: '-50%',
                              clipPath: `polygon(50% 100%, ${50 - Math.tan(Math.PI / TREATS.length) * 50}% 0%, ${50 + Math.tan(Math.PI / TREATS.length) * 50}% 0%)`,
                              backgroundColor: treat.bgColor,
                              backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
                              borderTop: `4px solid ${treat.borderColor}`
                            }}
                          >
                            <div className="flex flex-col items-center gap-1 mt-3">
                                <span className="text-3xl filter drop-shadow-md">{treat.emoji}</span>
                                <span 
                                    className="text-[12px] md:text-[14px] font-serif font-black tracking-[0.15em] uppercase"
                                    style={{ 
                                        color: treat.textColor,
                                        writingMode: 'vertical-rl',
                                        textOrientation: 'mixed',
                                        height: '120px',
                                        textShadow: treat.textColor === '#1a1a1a' ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'
                                    }}
                                >
                                {treat.label}
                                </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center bg-[#D7B47A]">
                        <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center border-2 border-[#D7B47A]">
                            <Sparkles className="text-[#D7B47A]" size={24} />
                        </div>
                    </div>
                  </motion.div>
                </div>

                {/* Result Overlay */}
                <AnimatePresence>
                  {showResult && result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-[#1a1a1a] border border-[#D7B47A] p-8 rounded-lg text-center shadow-[0_20px_60px_rgba(0,0,0,0.95)] min-w-[240px]"
                    >
                      <div className="text-6xl mb-4 drop-shadow-xl">{result.emoji}</div>
                      <h3 className="text-2xl font-serif text-[#F3E7D9] tracking-widest font-bold uppercase mb-2">{result.label}</h3>
                      <div className="text-[#D7B47A] text-sm italic">"Enjoy your moment"</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ELEGANT BAR BUTTON */}
                <button
                    onClick={spinWheel}
                    disabled={isSpinning}
                    className={`
                        w-full max-w-sm py-4 px-8 
                        bg-[#0F141E] border border-[#D7B47A]
                        text-[#D7B47A]
                        uppercase tracking-[0.3em] font-serif font-bold text-sm
                        transition-all duration-500
                        relative overflow-hidden group
                        shadow-[0_4px_10px_rgba(0,0,0,0.3)]
                        ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a1f2e] hover:shadow-[0_0_20px_rgba(215,180,122,0.2)]'}
                    `}
                >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        {isSpinning ? (
                            <>
                                <RotateCcw className="animate-spin w-4 h-4" /> 
                                <span className="text-xs">Fate is turning...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" /> 
                                <span>Spin The Wheel</span>
                            </>
                        )}
                    </span>
                    
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#D7B47A]" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#D7B47A]" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#D7B47A]" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#D7B47A]" />
                </button>

             </motion.div>
          </div>

          {/* RIGHT: HISTORY */}
          <div className="lg:col-span-1 h-full">
             <div className="bg-[#151a25]/50 border border-[#D7B47A]/20 rounded-xl p-6 shadow-lg h-full max-h-[700px] flex flex-col backdrop-blur-sm">
                <h2 className="text-xl font-serif text-[#F3E7D9] mb-6 border-b border-[#D7B47A]/10 pb-4 flex justify-between items-center">
                   <span>Ledger</span>
                   <span className="text-[10px] font-sans text-[#D7B47A]/40 uppercase tracking-widest">History</span>
                </h2>

                <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 pr-2">
                   {history.length === 0 ? (
                      <div className="text-center py-12 text-[#D7B47A]/30 italic">
                          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-20" />
                          The ledger is empty.
                      </div>
                   ) : (
                      // AnimatePresence for the list would go here if you wanted removal animations
                      history.map((item: WheelSpin, index: number) => (
                        <motion.div
                          key={item.id} // Updated: Uses strictly item.id now (always defined)
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-3 rounded-sm bg-[#0F141E]/80 border border-[#D7B47A]/10 hover:border-[#D7B47A]/30 transition-all group"
                        >
                           <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-[#D7B47A]/10 text-xl shrink-0 font-serif">
                              {item.emoji}
                           </div>
                           <div className="flex-1 min-w-0">
                                 <h4 className="text-[#F3E7D9] font-serif text-sm tracking-wide truncate">
                                    {item.treat}
                                 </h4>
                                 <p className="text-[9px] text-[#D7B47A]/50 font-mono mt-0.5">
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </p>
                           </div>
                        </motion.div>
                      ))
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}