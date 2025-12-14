/**
 * Dashboard.tsx
 * 
 * THE FOYER — Personal dashboard and control panel
 * 
 * This is the main landing page after login. It displays:
 * - Time-aware greeting (changes based on real time)
 * - Current date in elegant script
 * - Quick stats and highlights
 * - Portrait/profile area
 * 
 * WHAT IT CONTROLS:
 * - First impression after entry
 * - Personal greeting experience
 * - Quick access to app sections
 * - "Today" highlights (UI only for now)
 * 
 * TO MODIFY:
 * - Stats shown → edit STAT_ITEMS array
 * - Card layout → adjust grid classes
 * - Greeting style → modify the greeting section styling
 */

import { motion } from 'framer-motion';
import { useTimeStore } from '@/stores/useTimeStore';
import { useUserStore } from '@/stores/useUserStore';
import { 
  MapPin, 
  BookOpen, 
  Users, 
  Target,
  Sparkles,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════
   STAT ITEMS — Quick glance metrics
   
   These are placeholder stats that would connect to real data.
   Each links to its respective section.
   
   TODO: Connect to actual data stores
═══════════════════════════════════════════════════════════════ */
const STAT_ITEMS = [
  { 
    label: 'Places Visited', 
    value: '0', 
    icon: MapPin, 
    path: '/passport',
    color: 'text-gold'
  },
  { 
    label: 'Scrapbook Entries', 
    value: '0', 
    icon: BookOpen, 
    path: '/scrapbook',
    color: 'text-gold'
  },
  { 
    label: 'Tales Shared', 
    value: '0', 
    icon: Users, 
    path: '/tales',
    color: 'text-gold'
  },
  { 
    label: 'Goals Set', 
    value: '0', 
    icon: Target, 
    path: '/goals',
    color: 'text-gold'
  },
];

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export default function Dashboard() {
  const { greeting, formattedDate, formattedTime, currentYear } = useTimeStore();
  const { user } = useUserStore();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ═══════════════════════════════════════════════════════════════
          HEADER — Greeting and time display
          
          Shows personalized greeting based on time of day.
          The script font date adds elegance.
      ═══════════════════════════════════════════════════════════════ */}
      <motion.header variants={itemVariants} className="text-center py-8">
        {/* Main greeting */}
        <motion.h1 
          className="font-display text-4xl md:text-5xl text-foreground mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {greeting}, <span className="text-gold">{user?.name || 'Guest'}</span>
        </motion.h1>

        {/* Date in script font */}
        <motion.p 
          className="font-script text-2xl text-gold/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {formattedDate}
        </motion.p>

        {/* Live clock */}
        <motion.div 
          className="flex items-center justify-center gap-2 mt-4 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Clock size={14} className="animate-slow-pulse" />
          <span className="font-body text-sm">{formattedTime}</span>
        </motion.div>
      </motion.header>

      {/* ═══════════════════════════════════════════════════════════════
          DECORATIVE DIVIDER
      ═══════════════════════════════════════════════════════════════ */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-center gap-4"
      >
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-gold/30" />
        <Sparkles size={16} className="text-gold/40" />
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-gold/30" />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          QUICK STATS — Brass plaque style cards
          
          Each card shows a metric and links to its section.
          Hover effects simulate physical depth.
      ═══════════════════════════════════════════════════════════════ */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {STAT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} variants={itemVariants}>
              <Link 
                to={item.path}
                className={cn(
                  /* Card styling — brass plaque feel */
                  "block p-6 rounded-xl",
                  "bg-card/10 backdrop-blur-sm",
                  "border border-gold/15",
                  /* Hover effects */
                  "hover:bg-card/15 hover:border-gold/25",
                  "hover:shadow-warm hover:-translate-y-1",
                  "transition-all duration-400",
                  /* Focus */
                  "focus:outline-none focus:ring-2 focus:ring-gold/30"
                )}
              >
                <Icon size={24} className={cn("mb-3", item.color)} />
                <p className="font-display text-3xl text-foreground mb-1">
                  {item.value}
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  {item.label}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          WELCOME MESSAGE — Introduction card
          
          A warm welcome message for new users.
          Can be replaced with actual "today" highlights later.
      ═══════════════════════════════════════════════════════════════ */}
      <motion.div 
        variants={itemVariants}
        className={cn(
          "p-8 rounded-2xl",
          "bg-card/10 backdrop-blur-sm",
          "border border-gold/15"
        )}
      >
        <h2 className="font-serif text-xl text-gold mb-4">
          Welcome to Your Private Residence
        </h2>
        <p className="font-body text-muted-foreground leading-relaxed">
          This is your personal space for collecting memories, stories, and dreams. 
          Explore the rooms of this house—add places to your Passport, fill your 
          Scrapbook with moments, share Tales with friends, set Goals for the future, 
          or spin the Treat Wheel for a delightful surprise.
        </p>
        <p className="font-script text-lg text-gold/60 mt-6">
          The house awaits your stories.
        </p>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER — Year indicator
      ═══════════════════════════════════════════════════════════════ */}
      <motion.footer 
        variants={itemVariants}
        className="text-center pt-8 pb-4"
      >
        <p className="font-body text-xs text-muted-foreground/40">
          House of Swass · {currentYear}
        </p>
      </motion.footer>
    </motion.div>
  );
}
