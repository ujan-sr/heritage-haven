/**
 * Login.tsx
 * 
 * THE ENTRANCE — Login/Entry page
 * 
 * This is the first page users see. It sets the atmospheric tone
 * with the heritage interior background, elegant typography,
 * and a dramatic "Enter the House" button.
 * 
 * WHAT IT CONTROLS:
 * - First impression and brand introduction
 * - User name input for personalization
 * - Entry animation sequence
 * 
 * TO MODIFY:
 * - Tagline text → change the paragraph in the card
 * - Button text → update the button label
 * - Card styling → adjust glass/paper classes
 * - Animation timing → modify motion transition values
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/useUserStore';
import { useTimeStore } from '@/stores/useTimeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AtmosphericBackground } from '@/components/layout/AtmosphericBackground';

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS — Cinematic reveal sequence
   
   The login page elements appear in a choreographed sequence.
   Adjust delay and duration for different pacing.
═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.15,
      delayChildren: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: "easeOut" as const,
      delay: 0.3,
    },
  },
};

export default function Login() {
  const [name, setName] = useState('');
  const [isEntering, setIsEntering] = useState(false);
  const navigate = useNavigate();
  const enterHouse = useUserStore((state) => state.enterHouse);
  const { formattedDate, formattedTime, greeting } = useTimeStore();

  /* ═══════════════════════════════════════════════════════════════
     ENTER HANDLER — Submits the entry form
     
     Sets a brief entering state for exit animation,
     then navigates to the dashboard.
     
     TODO: Replace with backend authentication
  ═══════════════════════════════════════════════════════════════ */
  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsEntering(true);
    
    // Brief delay for exit animation
    setTimeout(() => {
      enterHouse(name.trim());
      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Atmospheric background */}
      <AtmosphericBackground />

      {/* ═══════════════════════════════════════════════════════════════
          LOGIN CARD — The gateway
          
          Tall, elegant card with glass-like appearance.
          Contains title, tagline, form, and CTA.
      ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={isEntering ? { opacity: 0, scale: 1.05, y: -20 } : "visible"}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-dark rounded-2xl p-10 border border-gold/20 shadow-deep">
          {/* ═══════════════════════════════════════════════════════════════
              HEADER — Title and tagline
          ═══════════════════════════════════════════════════════════════ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-10"
          >
            {/* Decorative element */}
            <motion.div 
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            </motion.div>

            {/* Main title */}
            <motion.h1 
              variants={itemVariants}
              className="font-display text-4xl md:text-5xl text-gold tracking-wide mb-4"
            >
              House of Swass
            </motion.h1>

            {/* Tagline */}
            <motion.p 
              variants={itemVariants}
              className="font-serif text-lg text-foreground/70 italic leading-relaxed"
            >
              A private residence for stories,<br />moods, and time.
            </motion.p>

            {/* Decorative element */}
            <motion.div 
              variants={itemVariants}
              className="flex justify-center mt-6"
            >
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </motion.div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════
              FORM — Name input and enter button
          ═══════════════════════════════════════════════════════════════ */}
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleEnter}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <label 
                htmlFor="name" 
                className="block font-serif text-sm text-muted-foreground mb-2"
              >
                Your name, please
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                autoFocus
                className="text-center font-body"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full font-serif text-lg tracking-wide"
                disabled={!name.trim() || isEntering}
              >
                {isEntering ? 'Entering...' : 'Enter the House'}
              </Button>
            </motion.div>
          </motion.form>

          {/* ═══════════════════════════════════════════════════════════════
              FOOTER — Current date and time
              
              Shows real system time to establish time-awareness.
          ═══════════════════════════════════════════════════════════════ */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-10 pt-6 border-t border-gold/10 text-center"
          >
            <motion.p 
              variants={itemVariants}
              className="font-script text-xl text-gold/60"
            >
              {greeting}
            </motion.p>
            <motion.p 
              variants={itemVariants}
              className="font-body text-sm text-muted-foreground/60 mt-1"
            >
              {formattedDate} · {formattedTime}
            </motion.p>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            AMBIENT GLOW — Behind the card
            
            Adds warmth and draws focus to the card.
        ═══════════════════════════════════════════════════════════════ */}
        <div 
          className="absolute inset-0 -z-10 rounded-2xl opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, hsla(38, 50%, 40%, 0.3) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  );
}
