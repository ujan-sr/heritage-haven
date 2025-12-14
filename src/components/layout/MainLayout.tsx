/**
 * MainLayout.tsx
 * 
 * THE HOUSE SHELL — Main app layout wrapper
 * 
 * This component provides the core layout structure:
 * - Left navigation panel
 * - Right content area with padding
 * - Atmospheric background
 * - Page transition animations
 * 
 * WHAT IT CONTROLS:
 * - Overall page structure
 * - Content area width and positioning
 * - Page enter/exit animations
 * 
 * TO MODIFY:
 * - Navigation width → adjust pl- padding on main content
 * - Content max-width → change max-w- class
 * - Page transitions → modify motion variants
 */

import { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AtmosphericBackground } from './AtmosphericBackground';
import { Navigation } from './Navigation';
import { useTimeStore } from '@/stores/useTimeStore';

/* ═══════════════════════════════════════════════════════════════
   PAGE TRANSITION VARIANTS
   
   Controls how content fades in when navigating.
   
   To slow down: increase duration
   To add more motion: add y or x transforms
═══════════════════════════════════════════════════════════════ */
const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 10,
  },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const startAutoUpdate = useTimeStore((state) => state.startAutoUpdate);

  /* ═══════════════════════════════════════════════════════════════
     TIME AUTO-UPDATE
     
     Starts the global time refresh interval when the layout mounts.
     This keeps the app "alive" with real-time awareness.
  ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const cleanup = startAutoUpdate();
    return cleanup;
  }, [startAutoUpdate]);

  return (
    <div className="min-h-screen w-full">
      {/* Background atmosphere — behind everything */}
      <AtmosphericBackground />
      
      {/* Left navigation panel */}
      <Navigation />
      
      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
          
          Positioned to the right of navigation.
          pl-64 accounts for 256px nav width.
          
          To adjust content width: change max-w- class
          To adjust side padding: modify px- classes
      ═══════════════════════════════════════════════════════════════ */}
      <main className="pl-64 min-h-screen">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="min-h-screen p-8"
        >
          {/* Content wrapper with max width */}
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
