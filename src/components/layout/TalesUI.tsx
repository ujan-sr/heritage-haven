import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface TalesProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

/**
 * PageWrapper — The main layout container with the signature background
 */
/**
 * PageWrapper — Updated to remove hardcoded background
 */
export const PageWrapper = ({ children, title, subtitle, className }: TalesProps) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    // Removed bg-[#F3E7D9], added bg-transparent or bg-white
    className={cn("min-h-screen p-6 md:p-12 bg-transparent", className)}
  >
    <div className="max-w-6xl mx-auto">
      {title && (
        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl text-[#3e2723] mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-[#7B3230] italic font-serif opacity-80">
              {subtitle}
            </p>
          )}
          <div className="h-1 w-24 bg-[#D7B47A] mt-6" />
        </header>
      )}
      {children}
    </div>
  </motion.div>
);

/**
 * ContentCard — A framed card for stories and grid items
 */
export const ContentCard = ({ 
  children, 
  className, 
  decorative = false, 
  padding = "normal",
  onClick 
}: TalesProps & { decorative?: boolean; padding?: "none" | "normal"; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white border-2 border-[#D7B47A]/30 shadow-[8px_8px_0px_0px_rgba(215,180,122,0.1)] transition-all",
      padding === "normal" ? "p-6 md:p-8" : "p-0",
      onClick && "hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(215,180,122,0.15)] cursor-pointer",
      className
    )}
  >
    {decorative && (
      <div className="flex justify-center mb-4">
        <div className="h-px w-12 bg-[#D7B47A] self-center" />
        <div className="w-2 h-2 rounded-full border border-[#D7B47A] mx-2" />
        <div className="h-px w-12 bg-[#D7B47A] self-center" />
      </div>
    )}
    {children}
  </div>
);

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-2xl text-[#3e2723] font-serif mb-3", className)}>
    {children}
  </h2>
);

export const CardText = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-[#0B1220] leading-relaxed font-sans", className)}>
    {children}
  </p>
);