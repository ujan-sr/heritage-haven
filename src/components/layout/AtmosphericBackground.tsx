/**
 * AtmosphericBackground.tsx
 * 
 * THE VISUAL FOUNDATION — Heritage interior backdrop
 * 
 * This component renders the immersive background with:
 * - Fixed heritage interior image
 * - Dark indigo overlay (multiply blend)
 * - Vignette edges for cinematic depth
 * - Grain texture for film-like quality
 * - Warm lamp glow effects
 * 
 * WHAT IT CONTROLS:
 * - Overall app atmosphere and mood
 * - Background image positioning
 * - Overlay darkness level
 * - Lighting effects intensity
 * 
 * TO MODIFY:
 * - Darken overall mood → increase overlay opacity (line ~35)
 * - Shift lamp glow position → adjust radial gradient center
 * - Reduce grain → lower grain layer opacity
 * - Change image → replace the import path
 */

import { motion } from 'framer-motion';
import heritageInterior from '@/assets/heritage-interior.png';

/* ═══════════════════════════════════════════════════════════════
   LAYER OPACITIES — Control the atmospheric intensity
   
   Adjust these to make the scene lighter or darker:
   - overlayOpacity: Main darkness (0.85 = 85% dark)
   - grainOpacity: Film texture intensity
   - glowOpacity: Warm lamp effect strength
═══════════════════════════════════════════════════════════════ */
const overlayOpacity = 0.88;
const grainOpacity = 0.03;
const glowOpacity = 0.12;

export function AtmosphericBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════
          LAYER 1: Heritage Interior Image
          
          Fixed position, covers entire viewport.
          object-cover ensures no stretching.
          To zoom in: increase scale value
          To reposition: adjust object-position
      ═══════════════════════════════════════════════════════════════ */}
      <motion.img
        src={heritageInterior}
        alt=""
        aria-hidden="true"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{
          /* Slight desaturation to let overlay colors dominate */
          filter: 'saturate(0.85) brightness(0.9)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 2: Midnight Indigo Overlay
          
          Creates the deep, moody atmosphere.
          mix-blend-multiply darkens while preserving image detail.
          
          To darken: increase opacity
          To shift color: change HSL values
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            hsla(220, 45%, 8%, ${overlayOpacity}) 0%,
            hsla(220, 40%, 6%, ${overlayOpacity + 0.05}) 50%,
            hsla(220, 50%, 4%, ${overlayOpacity + 0.08}) 100%
          )`,
          mixBlendMode: 'multiply',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 3: Additional Color Tint
          
          Adds warmth to shadows, prevents pure black.
          Normal blend mode for additive color.
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            180deg,
            hsla(220, 40%, 9%, 0.7) 0%,
            hsla(220, 45%, 7%, 0.85) 100%
          )`,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 4: Warm Lamp Glow (Top Center)
          
          Simulates chandelier/lamp light from above.
          Animated for subtle "breathing" effect.
          
          To move light source: change ellipse center position
          To intensify: increase opacity and spread
      ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 0.5 }}
        style={{
          background: `radial-gradient(
            ellipse 70% 50% at 50% 15%,
            hsla(38, 60%, 55%, ${glowOpacity}) 0%,
            hsla(38, 50%, 45%, ${glowOpacity * 0.5}) 30%,
            transparent 70%
          )`,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 5: Secondary Glow (Lower)
          
          Adds warm reflection from below chandeliers.
          Creates depth and ambient fill.
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none animate-light-drift"
        style={{
          background: `radial-gradient(
            ellipse 60% 40% at 50% 60%,
            hsla(38, 55%, 50%, 0.04) 0%,
            transparent 60%
          )`,
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 6: Vignette
          
          Darkens the edges for cinematic focus.
          Draws attention to center content.
          
          To intensify: increase inset shadow spread
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 200px 80px hsla(220, 45%, 4%, 0.7)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 7: Film Grain Texture
          
          Adds subtle noise for analog/film feel.
          Very subtle — should not be distracting.
          
          To increase: raise opacity value
          To remove: delete this entire div
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: grainOpacity,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
