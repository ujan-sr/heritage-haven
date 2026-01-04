import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
// Removed: import { useUserStore } from '@/stores/useUserStore';
import { useTimeStore } from '@/stores/useTimeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AtmosphericBackground } from '@/components/layout/AtmosphericBackground';

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
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
      ease: 'easeOut' as const,
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
      ease: 'easeOut' as const,
      delay: 0.3,
    },
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEntering, setIsEntering] = useState(false);

  const navigate = useNavigate();
  // Removed: const enterHouse = useUserStore((state) => state.enterHouse);
  const { formattedDate, formattedTime, greeting } = useTimeStore();

  // 🔒 HARD-LOCKED EMAIL (Optional: keep this if you still want the frontend gate)
  const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL;

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) return;

    // 🔒 Block anyone except the allowed email (Frontend check)
    if (ALLOWED_EMAIL && email.trim().toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      alert('Access denied.');
      return;
    }

    setIsEntering(true);

    // 1. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      alert(error.message || 'Invalid email or password.');
      setIsEntering(false);
      return;
    }

    // 2. Final safety check (Backend verification)
    if (ALLOWED_EMAIL && data.user?.email !== ALLOWED_EMAIL) {
      await supabase.auth.signOut();
      alert('Unauthorized user.');
      setIsEntering(false);
      return;
    }

    // 3. Success!
    // Supabase automatically persists the session.
    // We simply navigate to the home page now.
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <AtmosphericBackground />

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate={isEntering ? { opacity: 0, scale: 1.05, y: -20 } : 'visible'}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-dark rounded-2xl p-10 border border-gold/20 shadow-deep">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-10"
          >
            <motion.div variants={itemVariants} className="flex justify-center mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl md:text-5xl text-gold tracking-wide mb-4"
            >
              House of Swass
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="font-serif text-lg text-foreground/70 italic leading-relaxed"
            >
              A private residence for stories,
              <br />
              moods, and time.
            </motion.p>

            <motion.div variants={itemVariants} className="flex justify-center mt-6">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            </motion.div>
          </motion.div>

          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleEnter}
            className="space-y-6"
          >
            {/* EMAIL INPUT */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block font-serif text-sm text-muted-foreground mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className="text-center font-body"
              />
            </motion.div>

            {/* PASSWORD INPUT */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block font-serif text-sm text-muted-foreground mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="text-center font-body"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full font-serif text-lg tracking-wide"
                disabled={!email.trim() || !password.trim() || isEntering}
              >
                {isEntering ? 'Entering...' : 'Enter the House'}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-10 pt-6 border-t border-gold/10 text-center"
          >
            <motion.p variants={itemVariants} className="font-script text-xl text-gold/60">
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

        <div
          className="absolute inset-0 -z-10 rounded-2xl opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(ellipse at center, hsla(38, 50%, 40%, 0.3) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </div>
  );
}