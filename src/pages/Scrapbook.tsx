import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, ArrowLeft, PenTool, Trash2, 
  ImagePlus, Type, Paintbrush, Eraser, Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Ensure this exists

// --- CONFIGURATION ---
const PAGE_TEMPLATE_URL = "/public/images/ag-square.png";
const COVER_TEMPLATE_URL = "/public/images/top-cover.png";
const BUCKET_NAME = 'scrapbook-media';

// --- TYPES ---
interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

interface ScrapbookImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  storagePath?: string; // New: to help with deleting from storage later
}

interface PageContent {
  textBoxes: TextBox[];
  images: ScrapbookImage[];
  drawing: string | null;
}

interface Page {
  id: string;
  journal_id: string;
  page_number: number;
  content: PageContent; 
}

interface Journal {
  id: string;
  title: string;
  cover_color: string;
  created_at: string;
}

const COVER_COLORS = [
  'bg-[#4a2c2a]', 
  'bg-[#2d3a3a]', 
  'bg-[#2b2b3b]', 
  'bg-[#3e3228]', 
  'bg-[#1a1a1a]', 
];

// --- MAIN COMPONENT ---
export default function Scrapbook() {
  // --- STATE ---
  const [journals, setJournals] = useState<Journal[]>([]);
  const [pages, setPages] = useState<Record<string, Page[]>>({});
  const [activeJournalId, setActiveJournalId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- INITIAL FETCH ---
  useEffect(() => {
    fetchJournals();
  }, []);

  // --- DATA FETCHING ---
  const fetchJournals = async () => {
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) console.error('Error fetching journals:', error);
    else setJournals(data || []);
    setIsLoading(false);
  };

  const fetchPages = async (journalId: string) => {
    // Check cache first to avoid flicker
    if (pages[journalId]) return;

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('journal_id', journalId)
      .order('page_number', { ascending: true });

    if (error) {
      console.error('Error fetching pages:', error);
    } else {
      // Parse the JSON content column back into our structure
      const formattedPages = data.map(p => ({
        ...p,
        content: p.content || { textBoxes: [], images: [], drawing: null }
      }));
      setPages(prev => ({ ...prev, [journalId]: formattedPages }));
    }
  };

  // Fetch pages when opening a journal
  useEffect(() => {
    if (activeJournalId) {
      fetchPages(activeJournalId);
    }
  }, [activeJournalId]);

  // --- ACTIONS ---
  const createJournal = async (title: string) => {
    // 1. Insert Journal
    const newJournal = {
      title: title || 'Untitled Journal',
      cover_color: COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)],
    };

    const { data: journalData, error: journalError } = await supabase
      .from('journals')
      .insert(newJournal)
      .select()
      .single();

    if (journalError || !journalData) {
      console.error('Error creating journal:', journalError);
      return;
    }

    // 2. Create Initial Spread (Page 1 & 2)
    const initialPages = [
      { journal_id: journalData.id, page_number: 1, content: {} },
      { journal_id: journalData.id, page_number: 2, content: {} }
    ];

    const { data: pagesData, error: pagesError } = await supabase
      .from('pages')
      .insert(initialPages)
      .select();

    if (!pagesError && pagesData) {
       // Update local state immediately
       setJournals([journalData, ...journals]);
       setPages(prev => ({ 
         ...prev, 
         [journalData.id]: pagesData.map(p => ({ ...p, content: { textBoxes: [], images: [], drawing: null } })) 
       }));
       setIsCreateOpen(false);
    }
  };

  const deleteJournal = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Optimistic UI update
    setJournals(journals.filter(j => j.id !== id));
    
    // DB Delete (Cascades to pages automatically)
    const { error } = await supabase.from('journals').delete().eq('id', id);
    if (error) {
      console.error("Error deleting journal", error);
      fetchJournals(); // Revert on error
    }
  };

  const updatePage = async (journalId: string, pageIndex: number, newContent: Partial<PageContent>) => {
    const currentPages = pages[journalId] || [];
    const pageToUpdate = currentPages[pageIndex];
    if (!pageToUpdate) return;

    // 1. Merge content
    const updatedContent = { ...pageToUpdate.content, ...newContent };
    
    // 2. Optimistic Update
    const updatedPages = [...currentPages];
    updatedPages[pageIndex] = { ...pageToUpdate, content: updatedContent };
    setPages({ ...pages, [journalId]: updatedPages });

    // 3. Send to DB (Debounce could be added here for performance)
    await supabase
      .from('pages')
      .update({ content: updatedContent })
      .eq('id', pageToUpdate.id);
  };

  const addNewSpread = async (journalId: string) => {
    const currentPages = pages[journalId] || [];
    const lastNum = currentPages.length;

    const newPagesPayload = [
      { journal_id: journalId, page_number: lastNum + 1, content: {} },
      { journal_id: journalId, page_number: lastNum + 2, content: {} }
    ];

    const { data, error } = await supabase
      .from('pages')
      .insert(newPagesPayload)
      .select();

    if (!error && data) {
      const formatted = data.map(p => ({ ...p, content: { textBoxes: [], images: [], drawing: null } }));
      setPages(prev => ({ ...prev, [journalId]: [...currentPages, ...formatted] }));
    }
  };

  return (
    <div className="h-screen text-[#E8C89C] relative overflow-hidden font-serif">
      <div className="relative z-10 h-full flex flex-col">
        <AnimatePresence mode="wait">
          {!activeJournalId ? (
            /* VIEW 1: SHELF */
            <motion.div 
              key="shelf"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pl-0 pr-6 pt-12 pb-8 overflow-y-auto"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 border-b border-[#D7B47A]/10 pb-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-left">
                  <h1 className="text-4xl md:text-6xl mb-3" style={{ fontFamily: "'DM Serif Display', serif", 
                    color: '#F3E7D9', 
                    textShadow: '0 0 15px rgba(215,180,122,0.6), 0 0 30px rgba(215,180,122,0.4), 0 0 50px rgba(215,180,122,0.2)' 
                  }}>
                    Swassbook
                  </h1>
                  <p className="text-xl md:text-2xl italic mb-8"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: '#E8C89C', textShadow: '0 2px 20px rgba(215,180,122,0.3)' }}
                  >
                     "A collection of memories, sketches, and moments preserved."
                  </p>
                </motion.div>

                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-[#D7B47A] text-[#151a25] font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-[#c5a365] transition-all rounded-sm shadow-[0_0_20px_rgba(215,180,122,0.3)] hover:scale-105"
                >
                  <PenTool size={18} /> Create Journal
                </button>
              </div>

              <div className="flex-1">
                {isLoading ? (
                   <div className="flex justify-center items-center h-40">
                      <Loader2 className="animate-spin text-[#D7B47A]" size={40} />
                   </div>
                ) : journals.length === 0 ? (
                  <div className="h-full flex flex-col items-start justify-center opacity-40 border-2 border-dashed border-[#D7B47A]/20 rounded-lg p-12 ml-1">
                     
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-1">
                    {journals.map((journal) => (
                    <motion.div
                      key={journal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      onClick={() => setActiveJournalId(journal.id)}
                      className="group relative cursor-pointer"
                    >
                      {/* --- LEATHER COVER DESIGN --- */}
                      <div 
                        className="aspect-[11/11] "
                        style={{
                          backgroundImage: `url(${COVER_TEMPLATE_URL})`,
                          backgroundSize: '100% 100%', 
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {/* TITLE PLACEMENT */}
                        <div className="absolute bottom-[19%] left-[15%] right-[13%] h-[12%] flex items-center justify-center text-center p-1">
                          <h3 
                            className="font-serif text-[#3e2723] text-sm md:text-base font-bold leading-tight line-clamp-2 uppercase tracking-widest"
                            style={{ textShadow: '0px 1px 0px rgba(255,255,255,0.4), 0px -1px 0px rgba(0,0,0,0.2)' }}
                          >
                            {journal.title}
                          </h3>
                        </div>

                        {/* Date */}
                        <div className="absolute bottom-2 left-0 right-0 text-center text-[#2c1810]/40 text-[8px] font-mono">
                          {new Date(journal.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <button 
                            onClick={(e) => deleteJournal(e, journal.id)}
                            className="absolute top-4 right-4 bg-red-900/90 text-white w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-700 hover:scale-110 z-30"
                          >
                            <Trash2 size={16} />
                          </button>
                    </motion.div>
                  ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* VIEW 2: OPEN BOOK */
            <BookReader 
              key="reader"
              journal={journals.find(j => j.id === activeJournalId)!} 
              pages={pages[activeJournalId!] || []} 
              onClose={() => setActiveJournalId(null)}
              onUpdatePage={(idx, data) => updatePage(activeJournalId!, idx, data)}
              onNewSpread={() => addNewSpread(activeJournalId!)}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isCreateOpen && (
          <CreateModal onClose={() => setIsCreateOpen(false)} onCreate={createJournal} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function PageContent({ 
  page, 
  pageIndex, 
  onUpdate,
  side,
  isActive,
  onTransferElement
}: { 
  page: Page | undefined, 
  pageIndex: number, 
  onUpdate?: (i: number, val: Partial<PageContent>) => void,
  side: 'left' | 'right',
  isActive: boolean,
  onTransferElement?: (idx: number, type: 'image', data: ScrapbookImage) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tool, setTool] = useState<'none' | 'pen' | 'eraser' | 'text'>('none');
  
  const [textBoxes, setTextBoxes] = useState<TextBox[]>(page?.content.textBoxes || []);
  const [images, setImages] = useState<ScrapbookImage[]>(page?.content.images || []);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);

  const PAPER_STYLE = {
    backgroundImage: `url(${PAGE_TEMPLATE_URL})`,
    backgroundSize: 'cover',
    backgroundColor: '#fdfbf7'
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !page) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    if (page.content.drawing) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = page.content.drawing;
    }
  }, [page]);

  // Sync state with page data
  useEffect(() => {
    if (page) {
      setTextBoxes(page.content.textBoxes || []);
      setImages(page.content.images || []);
    }
  }, [page]);

  // --- DRAWING HANDLERS ---
  const startDrawing = (e: React.MouseEvent) => {
    if (tool !== 'pen' && tool !== 'eraser') return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || (tool !== 'pen' && tool !== 'eraser')) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = tool === 'eraser' ? 20 : 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#fdfbf7' : '#2C1810';
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (onUpdate && canvasRef.current) {
      const drawingData = canvasRef.current.toDataURL();
      onUpdate(pageIndex, { 
        drawing: drawingData,
        textBoxes,
        images
      });
    }
  };

  // --- TEXT BOX HANDLERS ---
  const addTextBox = (e: React.MouseEvent) => {
    if (tool !== 'text' || !containerRef.current) return;
    if (e.target !== containerRef.current && e.target !== canvasRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newBox: TextBox = {
      id: Date.now().toString(),
      x: Math.max(10, Math.min(90, x)),
      y: Math.max(10, Math.min(90, y)),
      text: '',
      fontSize: 18
    };
    
    const updated = [...textBoxes, newBox];
    setTextBoxes(updated);
    if (onUpdate) {
      onUpdate(pageIndex, { textBoxes: updated, images, drawing: page?.content.drawing || null });
    }
    
    setTimeout(() => {
      const textarea = document.querySelector(`[data-textbox-id="${newBox.id}"]`) as HTMLTextAreaElement;
      if (textarea) textarea.focus();
    }, 50);
  };

  const updateTextBox = (id: string, updates: Partial<TextBox>) => {
    const updated = textBoxes.map(tb => 
      tb.id === id ? { ...tb, ...updates } : tb
    );
    setTextBoxes(updated);
    if (onUpdate) {
      onUpdate(pageIndex, { textBoxes: updated, images, drawing: page?.content.drawing || null });
    }
  };

  const deleteTextBox = (id: string) => {
    const updated = textBoxes.filter(tb => tb.id !== id);
    setTextBoxes(updated);
    if (onUpdate) {
      onUpdate(pageIndex, { textBoxes: updated, images, drawing: page?.content.drawing || null });
    }
  };

  // Text Dragging
  const textDragStartPos = useRef<{mouseX: number, mouseY: number, tbX: number, tbY: number} | null>(null);

  const startTextDrag = (e: React.MouseEvent, textBoxId: string) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') return; 
    e.stopPropagation();
    e.preventDefault();
    setSelectedTextBox(textBoxId);
    setIsDraggingText(true);
    
    const tb = textBoxes.find(t => t.id === textBoxId);
    if (tb) {
      textDragStartPos.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        tbX: tb.x,
        tbY: tb.y
      };
    }
  };

  const handleTextDrag = (e: React.MouseEvent) => {
    if (!isDraggingText || !selectedTextBox || !containerRef.current || !textDragStartPos.current) return;
    
    requestAnimationFrame(() => {
      if (!containerRef.current || !textDragStartPos.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - textDragStartPos.current.mouseX) / rect.width) * 100;
      const deltaY = ((e.clientY - textDragStartPos.current.mouseY) / rect.height) * 100;
      
      const newX = Math.max(10, Math.min(90, textDragStartPos.current.tbX + deltaX));
      const newY = Math.max(10, Math.min(90, textDragStartPos.current.tbY + deltaY));
      
      const updated = textBoxes.map(tb => 
        tb.id === selectedTextBox ? { ...tb, x: newX, y: newY } : tb
      );
      setTextBoxes(updated);
    });
  };

  const stopTextDrag = () => {
    if (isDraggingText && onUpdate) {
      onUpdate(pageIndex, { textBoxes, images, drawing: page?.content.drawing || null });
    }
    setIsDraggingText(false);
    setSelectedTextBox(null);
    textDragStartPos.current = null;
  };

  // --- IMAGE HANDLERS (UPDATED FOR SUPABASE) ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !page) return;

    setIsUploading(true);
    const newImages: ScrapbookImage[] = [];

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${page.journal_id}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        newImages.push({
          id: Date.now().toString() + '-' + Math.random(),
          src: publicUrl,
          x: 40 + (Math.random() * 20),
          y: 40 + (Math.random() * 20),
          width: 25,
          rotation: (Math.random() - 0.5) * 15,
          storagePath: fileName
        });
      } catch (err) {
        console.error('Upload failed', err);
        alert('Failed to upload image');
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      if (onUpdate) {
        onUpdate(pageIndex, { 
          textBoxes, 
          images: updatedImages, 
          drawing: page.content.drawing 
        });
      }
    }
    setIsUploading(false);
  };

  const dragStartPos = useRef<{mouseX: number, mouseY: number, imgX: number, imgY: number} | null>(null);

  const startDrag = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedImage(imageId);
    setIsDragging(true);
    
    const img = images.find(i => i.id === imageId);
    if (img) {
      dragStartPos.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        imgX: img.x,
        imgY: img.y
      };
    }
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !selectedImage || !containerRef.current || !dragStartPos.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartPos.current.mouseX) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartPos.current.mouseY) / rect.height) * 100;
    
    const currentId = selectedImage;
    const startX = dragStartPos.current.imgX;
    const startY = dragStartPos.current.imgY;

    requestAnimationFrame(() => {
      if (!containerRef.current || !dragStartPos.current) return;
      
      setImages(prevImages => {
        const img = prevImages.find(i => i.id === currentId);
        if (!img) return prevImages;

        const newX = Math.max(5, Math.min(95, startX + deltaX));
        const newY = Math.max(5, Math.min(95, startY + deltaY));
        
        return prevImages.map(img => 
          img.id === currentId ? { ...img, x: newX, y: newY } : img
        );
      });
    });
  };

  const stopDrag = (e: React.MouseEvent) => {
    if (!isDragging || !selectedImage) {
      setIsDragging(false);
      return;
    }

    if (containerRef.current && onUpdate) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const edgeThreshold = 50;
      
      const currentId = selectedImage;
      const img = images.find(i => i.id === currentId);

      // --- LOGIC FOR MOVING RIGHT ---
      if (side === 'left' && x > rect.width - edgeThreshold && pageIndex % 2 === 0) {
        if (img && onTransferElement) {
          setIsDragging(false);
          setSelectedImage(null);
          dragStartPos.current = null;

          const updatedImages = images.filter(i => i.id !== currentId);
          setImages(updatedImages);
          onUpdate(pageIndex, { textBoxes, images: updatedImages, drawing: page?.content.drawing || null });
          
          onTransferElement(pageIndex + 1, 'image', { ...img, x: 20 });
          return;
        }
      }
      
      // --- LOGIC FOR MOVING LEFT ---
      if (side === 'right' && x < edgeThreshold && pageIndex % 2 === 1) {
        if (img && onTransferElement) {
          setIsDragging(false);
          setSelectedImage(null);
          dragStartPos.current = null;

          const updatedImages = images.filter(i => i.id !== currentId);
          setImages(updatedImages);
          onUpdate(pageIndex, { textBoxes, images: updatedImages, drawing: page?.content.drawing || null });
          
          onTransferElement(pageIndex - 1, 'image', { ...img, x: 80 });
          return;
        }
      }

      onUpdate(pageIndex, { textBoxes, images, drawing: page?.content.drawing || null });
    }
    
    setIsDragging(false);
    setSelectedImage(null);
    dragStartPos.current = null;
  };

  const deleteImage = (id: string) => {
    // Note: We are just removing it from the page layout for now.
    // Ideally you would also delete from Storage if no other page uses it,
    // but that logic is complex for a simple app.
    const updated = images.filter(img => img.id !== id);
    setImages(updated);
    if (onUpdate) {
      onUpdate(pageIndex, { textBoxes, images: updated, drawing: page?.content.drawing || null });
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (tool === 'text' && (e.target === containerRef.current || e.target === canvasRef.current)) {
      addTextBox(e);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden flex flex-col ${side === 'left' ? 'rounded-l-md' : 'rounded-r-md'}`}
      style={{ 
        ...PAPER_STYLE, 
        boxShadow: side === 'left' 
          ? 'inset -20px 0px 40px rgba(0,0,0,0.05)' 
          : 'inset 20px 0px 40px rgba(0,0,0,0.05)',
        cursor: tool === 'text' ? 'text' : tool === 'pen' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'default'
      }}
      onClick={handleContainerClick}
      onMouseMove={(e) => {
        handleDrag(e);
        handleTextDrag(e);
      }}
      onMouseUp={(e) => {
        stopDrag(e);
        stopTextDrag();
      }}
      onMouseLeave={(e) => {
        stopDrag(e);
        stopTextDrag();
      }}
    >
      {/* Binding Shadow */}
      <div className={`absolute top-0 bottom-0 w-[4px] bg-gradient-to-${side === 'left' ? 'r' : 'l'} from-gray-200 to-white border-${side === 'left' ? 'l' : 'r'} border-gray-300 ${side === 'left' ? 'left-0' : 'right-0'} z-10`} />
      
      {/* Page Number */}
      <div className="absolute top-4 left-0 right-0 flex justify-between px-8 text-[#2C1810]/40 font-serif italic text-xs z-20 pointer-events-none">
        {side === 'left' && <span>{page ? `Page ${page.page_number}` : ''}</span>}
        {side === 'right' && <span></span>}
        {side === 'right' && <span>{page ? `Page ${page.page_number}` : ''}</span>}
      </div>

      {/* Drawing Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: (tool === 'pen' || tool === 'eraser') ? 'auto' : 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {/* Text Boxes */}
      {textBoxes.map((tb) => (
        <div
          key={tb.id}
          className="absolute group cursor-move select-none"
          style={{
            left: `${tb.x}%`,
            top: `${tb.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: selectedTextBox === tb.id ? 45 : 30,
            pointerEvents: 'auto'
          }}
          onMouseDown={(e) => startTextDrag(e, tb.id)}
        >
          <div className="relative bg-transparent hover:bg-yellow-100/10 rounded px-2 py-1 border-2 border-dashed border-transparent group-hover:border-yellow-300/30 transition-all">
            <textarea
              data-textbox-id={tb.id}
              value={tb.text}
              onChange={(e) => updateTextBox(tb.id, { text: e.target.value })}
              disabled={!onUpdate}
              className="bg-transparent border-none outline-none text-[#2C1810] font-handwriting resize-none min-w-[120px] max-w-[300px] focus:bg-yellow-100/20 transition-all duration-200 cursor-text"
              style={{ 
                fontSize: `${tb.fontSize}px`,
                lineHeight: '1.4'
              }}
              placeholder="Write here..."
              rows={2}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
          {onUpdate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTextBox(tb.id);
              }}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs shadow-lg transition-all hover:bg-red-600 hover:scale-110 z-50"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {/* Images */}
      {images.map((img) => (
        <div
          key={img.id}
          className="absolute group cursor-move select-none transition-transform duration-200 hover:scale-105"
          style={{
            left: `${img.x}%`,
            top: `${img.y}%`,
            width: `${img.width}%`,
            transform: `translate(-50%, -50%) rotate(${img.rotation}deg)`,
            zIndex: selectedImage === img.id ? 50 : 40,
            pointerEvents: 'auto'
          }}
          onMouseDown={(e) => startDrag(e, img.id)}
        >
          {/* Vintage Polaroid Frame */}
          <div 
            className="bg-[#fefef8] p-3 pb-6 relative rounded"
            style={{
              boxShadow: `
                0 12px 30px rgba(0,0,0,0.4),
                0 4px 10px rgba(0,0,0,0.25),
                inset 0 1px 0 rgba(255,255,255,0.8),
                inset 0 0 30px rgba(139,69,19,0.03)
              `,
              border: '1px solid rgba(139,69,19,0.15)',
              filter: selectedImage === img.id ? 'brightness(1.05)' : 'none'
            }}
          >
            {/* Photo */}
            <div className="relative overflow-hidden">
              <img 
                src={img.src} 
                alt="" 
                className="w-full h-auto block"
                style={{ 
                  pointerEvents: 'none',
                  filter: 'sepia(0.15) contrast(1.1) saturate(0.9)',
                }}
              />
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 50%, rgba(101,67,33,0.08) 100%)',
                  mixBlendMode: 'multiply'
                }}
              />
            </div>
            
            {/* Tape on top */}
            <div 
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-16 h-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,250,205,0.85) 0%, rgba(255,248,220,0.75) 100%)',
                border: '1px solid rgba(218,165,32,0.2)',
                transform: 'translateX(-50%) rotate(-1deg)',
                boxShadow: `inset 0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.15)`,
                borderRadius: '2px'
              }}
            />
          </div>
          
          {onUpdate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteImage(img.id);
              }}
              className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-xl z-50 transition-all hover:bg-red-600 hover:scale-110"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}

      {/* Toolbar */}
      {onUpdate && isActive && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2
                    bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl border border-[#2C1810]/10 z-[60]
                    transition-all duration-300 hover:scale-105"
          onClick={(e) => e.stopPropagation()}
        >
          <ToolButton active={tool === 'pen'} onClick={() => setTool(tool === 'pen' ? 'none' : 'pen')} icon={<Paintbrush size={16} />} label="Ink" />
          <ToolButton active={tool === 'eraser'} onClick={() => setTool(tool === 'eraser' ? 'none' : 'eraser')} icon={<Eraser size={16} />} label="Erase" />
          <div className="w-[1px] h-6 bg-[#2C1810]/10 mx-1" />
          <ToolButton active={tool === 'text'} onClick={() => setTool(tool === 'text' ? 'none' : 'text')} icon={<Type size={16} />} label="Type" />
          <ToolButton active={false} onClick={() => fileInputRef.current?.click()} icon={isUploading ? <Loader2 className="animate-spin" size={16}/> : <ImagePlus size={16} />} label={isUploading ? "..." : "Photo"} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      )}

      {/* Edge Shadow */}
      <div className={`absolute inset-y-0 ${side === 'left' ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} w-12 from-black/5 to-transparent pointer-events-none z-10`}/>
    </div>
  );
}

// Simple internal Button component
function ToolButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
        ${active 
          ? 'bg-[#2C1810] text-white shadow-sm' 
          : 'bg-white text-[#2C1810] border border-[#2C1810]/10 hover:bg-gray-100 hover:text-[#2C1810]'
        }
      `}
    >
      {icon} {label}
    </button>
  );
}

function BookReader({ journal, pages, onClose, onUpdatePage, onNewSpread }: {
  journal: Journal, 
  pages: Page[], 
  onClose: () => void, 
  onUpdatePage: (i:number, c: Partial<PageContent>) => void, 
  onNewSpread: () => void
}) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null);
  
  const handleTransferElement = (targetPageIndex: number, elementType: 'image', elementData: ScrapbookImage) => {
    const targetPage = pages[targetPageIndex];
    if (!targetPage) return;

    if (elementType === 'image') {
      const updatedImages = [...(targetPage.content.images || []), elementData];
      onUpdatePage(targetPageIndex, { 
        images: updatedImages,
        textBoxes: targetPage.content.textBoxes,
        drawing: targetPage.content.drawing
      });
    }
  };

  const handleNext = () => {
    if (spreadIndex + 2 >= pages.length) {
      onNewSpread();
    }
    setIsFlipping('next');
  };

  const handlePrev = () => {
    if (spreadIndex >= 2) {
      setIsFlipping('prev');
    }
  };

  const onFlipComplete = () => {
    if (isFlipping === 'next') setSpreadIndex(i => i + 2);
    if (isFlipping === 'prev') setSpreadIndex(i => i - 2);
    setIsFlipping(null);
  };

  // --- LAYERING & ANIMATION LOGIC ---
  let leftBasePage, rightBasePage, flipperFront, flipperBack, flipperRotateFrom, flipperRotateTo;

  if (isFlipping === 'next') {
    leftBasePage = pages[spreadIndex];        
    rightBasePage = pages[spreadIndex + 3];   
    
    flipperFront = pages[spreadIndex + 1];    
    flipperBack = pages[spreadIndex + 2];     
    
    flipperRotateFrom = 0;
    flipperRotateTo = -180;
  } 
  else if (isFlipping === 'prev') {
    leftBasePage = pages[spreadIndex - 2];    
    rightBasePage = pages[spreadIndex + 1];   

    flipperFront = pages[spreadIndex - 1];    
    flipperBack = pages[spreadIndex];         
    
    flipperRotateFrom = -180;
    flipperRotateTo = 0;
  } 
  else {
    // STATIC STATE
    leftBasePage = pages[spreadIndex];
    rightBasePage = pages[spreadIndex + 1];
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6"
    >
      
      {/* HEADER */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-4 text-[#D7B47A] z-50">
         <button 
          onClick={onClose} 
          className="flex items-center gap-2 text-[#D7B47A] hover:text-white transition-colors bg-black/40 backdrop-blur-md px-4 py-2 rounded-full shadow-lg hover:bg-black/60"
        >
          <ArrowLeft size={18} /> <span className="uppercase text-xs tracking-widest font-bold">Close</span>
        </button>
        <span className="font-serif italic text-2xl text-[#E8C89C] drop-shadow-md">{journal.title}</span>
        <div className="w-24" />
      </div>

      {/* READER AREA */}
      <div className="flex items-center justify-center w-full gap-4 md:gap-8 h-full max-h-[85vh]">
        
        {/* PREV BUTTON */}
        <button 
          onClick={handlePrev} 
          disabled={spreadIndex === 0 || isFlipping !== null} 
          className="p-4 rounded-full text-[#D7B47A] hover:bg-black/20 hover:text-white disabled:opacity-0 transition-all flex-shrink-0 z-50"
        >
           <ChevronLeft size={42} />
        </button>

        {/* BOOK CONTAINER */}
        <div className="relative w-full max-w-4xl aspect-[1.6/1] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           <div className={`absolute -inset-2 rounded-lg ${journal.cover_color} shadow-2xl`} />

           {/* 3D PERSPECTIVE WRAPPER */}
           <div className="relative w-full h-full" style={{ perspective: '1500px' }}>
             
             {/* 1. STATIC BASE LAYER */}
             <div className="absolute inset-0 flex">
                <div className="w-1/2 h-full relative">
                  <PageContent 
                    page={leftBasePage} 
                    pageIndex={isFlipping === 'prev' ? spreadIndex - 2 : spreadIndex} 
                    side="left" 
                    isActive={!isFlipping}
                    onUpdate={!isFlipping ? onUpdatePage : undefined}
                    onTransferElement={handleTransferElement}
                  />
                </div>
                <div className="w-1/2 h-full relative">
                  <PageContent 
                    page={rightBasePage} 
                    pageIndex={isFlipping === 'next' ? spreadIndex + 3 : spreadIndex + 1} 
                    side="right" 
                    isActive={!isFlipping}
                    onUpdate={!isFlipping ? onUpdatePage : undefined} 
                    onTransferElement={handleTransferElement}
                  />
                </div>
                {/* Center Spine Shadow */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/10 z-20" />
             </div>

             {/* 2. ANIMATING FLIPPER LAYER */}
             {isFlipping && (
               <motion.div
                 initial={{ rotateY: flipperRotateFrom }}
                 animate={{ rotateY: flipperRotateTo }}
                 transition={{ duration: 0.6, ease: "easeInOut" }}
                 onAnimationComplete={onFlipComplete}
                 style={{ 
                   transformStyle: 'preserve-3d', 
                   transformOrigin: 'left center', // ALWAYS SPINE
                   position: 'absolute',
                   top: 0,
                   bottom: 0,
                   left: '50%', // Starts at spine, extends to right
                   width: '50%',
                   zIndex: 50
                 }}
               >
                  {/* FRONT FACE (Visible at 0deg / Right) */}
                  <div 
                    className="absolute inset-0 backface-hidden" 
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <PageContent page={flipperFront} pageIndex={-1} side="right" isActive={false} />
                  </div>

                  {/* BACK FACE (Visible at -180deg / Left) */}
                  <div 
                    className="absolute inset-0"
                    style={{ 
                      backfaceVisibility: 'hidden', 
                      transform: 'rotateY(180deg)' 
                    }}
                  >
                    <PageContent page={flipperBack} pageIndex={-1} side="left" isActive={false} />
                  </div>
               </motion.div>
             )}

           </div>
        </div>

        {/* NEXT BUTTON */}
        <button 
          onClick={handleNext} 
          disabled={isFlipping !== null}
          className="p-4 rounded-full text-[#D7B47A] hover:bg-black/20 hover:text-white transition-all flex-shrink-0 z-50"
        >
           <ChevronRight size={42} />
        </button>

      </div>
      
    </motion.div>
  );
}

function CreateModal({ onClose, onCreate }: { onClose: () => void, onCreate: (t: string) => void }) {
  const [val, setVal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault(); 
      if(val.trim()) {
        setIsSubmitting(true);
        onCreate(val);
      }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-[#151a25] border border-[#D7B47A]/30 p-8 w-full max-w-md shadow-2xl rounded-sm">
         <div className="flex justify-between items-center mb-6 border-b border-[#D7B47A]/20 pb-4">
           <h2 className="text-2xl font-serif text-[#F3E7D9]">New Journal</h2>
           <button onClick={onClose} className="text-[#D7B47A]/50 hover:text-[#D7B47A]"><X size={24}/></button>
         </div>
         <form onSubmit={handleSubmit}>
            <label className="block text-xs uppercase tracking-wider text-[#D7B47A]/50 mb-2">Journal Title</label>
            <input autoFocus className="w-full bg-[#0B1220] border-b border-[#D7B47A]/30 px-3 py-2 text-[#F3E7D9] focus:outline-none focus:border-[#D7B47A] font-serif mb-8" placeholder="e.g. Summer Travels" value={val} onChange={e => setVal(e.target.value)} />
            <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-[#D7B47A] text-[#151a25] font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#c5a365] disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
         </form>
      </motion.div>
    </div>
  );
}