import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Types for Props
interface ContentCardProps {
  children: ReactNode;
  className?: string;
  decorative?: boolean;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  onClick?: () => void;
}

const PADDING_SIZES = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  none: 'p-0'
};

/**
 * Reusable ivory content card component.
 * The primary surface for all content throughout the app.
 */
export default function ContentCard({ 
  children, 
  className = '', 
  decorative = false,
  hover = true,
  padding = 'md',
  onClick
}: ContentCardProps) {
  const paddingClass = PADDING_SIZES[padding] || PADDING_SIZES.md;

  return (
    <motion.div
      className={`relative rounded-xl overflow-hidden ${paddingClass} ${className}`}
      style={{
        // Lighter vintage cream background
        background: 'linear-gradient(145deg, rgba(243,231,217,0.98) 0%, rgba(248,240,230,0.96) 100%)',
        // Softer shadow for elegant depth
        boxShadow: `
          0 4px 20px -4px rgba(0,0,0,0.2),
          0 8px 40px -8px rgba(0,0,0,0.15),
          inset 0 1px 0 rgba(255,255,255,0.7),
          inset 0 -1px 0 rgba(0,0,0,0.03)
        `
      }}
      whileHover={hover ? { 
        y: -4,
        boxShadow: `
          0 8px 30px -4px rgba(0,0,0,0.35),
          0 16px 50px -8px rgba(0,0,0,0.25),
          inset 0 1px 0 rgba(255,255,255,0.5),
          inset 0 -1px 0 rgba(0,0,0,0.05)
        `
      } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onClick}
    >
      {/* Decorative corner accents */}
      {decorative && (
        <>
          <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-[#D7B47A]/30 pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[#D7B47A]/30 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-[#D7B47A]/30 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[#D7B47A]/30 pointer-events-none" />
        </>
      )}

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Subtle paper texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />
    </motion.div>
  );
}

// --- Typography Sub-components ---

interface TextProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className = '' }: TextProps) {
  return (
    <h2 
      className={`text-xl md:text-2xl mb-4 ${className}`}
      style={{ 
        fontFamily: "'DM Serif Display', serif",
        color: '#0B1220'
      }}
    >
      {children}
    </h2>
  );
}

export function CardSubtitle({ children, className = '' }: TextProps) {
  return (
    <h3 
      className={`text-lg mb-2 ${className}`}
      style={{ 
        fontFamily: "'Cormorant Garamond', serif",
        color: '#2F4F4F'
      }}
    >
      {children}
    </h3>
  );
}

export function CardText({ children, className = '' }: TextProps) {
  return (
    <p 
      className={`text-sm leading-relaxed ${className}`}
      style={{ 
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#0B1220'
      }}
    >
      {children}
    </p>
  );
}

export function CardDate({ children, className = '' }: TextProps) {
  return (
    <span 
      className={`text-sm italic ${className}`}
      style={{ 
        fontFamily: "'Cormorant Garamond', serif",
        color: 'rgba(11,18,32,0.5)'
      }}
    >
      {children}
    </span>
  );
}