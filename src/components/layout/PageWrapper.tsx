import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

// --- Types ---
interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

// The heritage interior image
const BACKGROUND_IMAGE_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69344d171f291e584b0d629d/e8edc1fd8_Gemini_Generated_Image_jdr4kpjdr4kpjdr41.png';

/**
 * Page transition variants
 * Controls how pages enter and exit with a blur and slide effect
 */
const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    filter: 'blur(10px)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: { 
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    filter: 'blur(5px)',
    transition: { 
      duration: 0.4,
      ease: "easeIn"
    }
  }
};

export default function PageWrapper({ children, title, subtitle }: PageWrapperProps) {
  return (
    <div className="min-h-screen relative">
      {/* BACKGROUND LAYER
        Fixed position heritage interior image
      */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
          filter: 'brightness(0.6) saturate(0.85)'
        }}
      />

      {/* Primary dark overlay - Creates the midnight indigo atmosphere */}
      <div 
        className="fixed inset-0"
        style={{ 
          background: 'linear-gradient(135deg, rgba(11,18,32,0.65) 0%, rgba(11,18,32,0.55) 50%, rgba(11,18,32,0.70) 100%)'
        }}
      />

      {/* Warm ambient light from chandeliers */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(215,180,122,0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 30%, rgba(215,180,122,0.12) 0%, transparent 35%),
            radial-gradient(ellipse at 50% 80%, rgba(215,180,122,0.10) 0%, transparent 30%)
          `,
          mixBlendMode: 'soft-light'
        }}
      />

      {/* Vignette effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(11,18,32,0.3) 100%)'
        }}
      />

      {/* Subtle Grain texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* MAIN CONTENT AREA
        ml-64 assumes a sidebar is present; remove if you are using a top-nav
      */}
      <motion.main 
        className="relative z-10 ml-64 min-h-screen p-8 lg:p-12"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Page Header */}
        {(title || subtitle) && (
          <motion.header 
            className="mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {title && (
              <h1 
                className="text-3xl md:text-4xl tracking-wide"
                style={{ 
                  fontFamily: "'DM Serif Display', serif",
                  color: '#F3E7D9',
                  textShadow: '0 2px 20px rgba(0,0,0,0.3)'
                }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p 
                className="mt-2 text-lg"
                style={{ 
                  fontFamily: "'Cormorant Garamond', serif",
                  color: 'rgba(243,231,217,0.6)',
                  fontStyle: 'italic'
                }}
              >
                {subtitle}
              </p>
            )}

            {/* Decorative burnished gold underline */}
            <div className="flex items-center gap-3 mt-4">
              <div className="h-px w-20 bg-gradient-to-r from-[#D7B47A]/50 to-transparent" />
              <div className="w-1.5 h-1.5 rotate-45 bg-[#D7B47A]/40" />
            </div>
          </motion.header>
        )}

        {/* Dynamic Page Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {children}
        </motion.div>
      </motion.main>

      {/* Ambient floating dust particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden ml-64">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              backgroundColor: 'rgba(215,180,122,0.15)'
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </div>
    </div>
  );
}