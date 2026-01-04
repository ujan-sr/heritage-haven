/**
 * AtmosphericBackground.tsx
 * * UPDATED VISUALS:
 * - Lighter Indigo Overlay (Better visibility)
 * - 3-Point Warm Chandelier Lighting (Soft Light blend)
 * - Softer Radial Vignette
 * - Ambient Floating Dust Particles
 */

import { motion } from 'framer-motion';
// Ensure this path is correct for your project
import heritageInterior from '@/assets/heritage-interior.png'; 

export function AtmosphericBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0B1220]">
      
      {/* ═══════════════════════════════════════════════════════════════
          LAYER 1: Heritage Interior Image
          - Fixed position
          - Adjusted brightness/saturation as requested
      ═══════════════════════════════════════════════════════════════ */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ 
          backgroundImage: `url(${heritageInterior})`,
          // Darkened slightly (0.6) so text pops, desaturated (0.85) for vintage feel
          filter: 'brightness(0.8) saturate(0.85)'
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 2: Primary Overlay (Lighter)
          - Creates the midnight indigo atmosphere but maintains visibility
      ═══════════════════════════════════════════════════════════════ */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(135deg, rgba(11,18,32,0.65) 0%, rgba(11,18,32,0.55) 50%, rgba(11,18,32,0.70) 100%)'
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 3: Warm Ambient Light (Chandeliers)
          - Three distinct light sources using soft-light blend
      ═══════════════════════════════════════════════════════════════ */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(215,180,122,0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 30%, rgba(215,180,122,0.12) 0%, transparent 35%),
            radial-gradient(ellipse at 50% 80%, rgba(215,180,122,0.10) 0%, transparent 30%)
          `,
          mixBlendMode: 'soft-light'
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 4: Vignette (Softer)
          - Radial gradient fading to dark at edges
      ═══════════════════════════════════════════════════════════════ */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(11,18,32,0.3) 100%)'
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 5: Grain Texture
          - Subtle noise for film/paper quality
      ═══════════════════════════════════════════════════════════════ */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 6: Ambient Floating Particles
          - Generates 8 distinct particles that float and breathe
      ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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