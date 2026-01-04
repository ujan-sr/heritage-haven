/**
 * Navigation.tsx
 * * LEFT PANEL — Hotel Directory Style Navigation
 * * This is the main navigation sidebar with:
 * - Deep indigo gradient background
 * - Gold dividers and accents
 * - Active route highlighting with glow
 * - Smooth hover effects
 * * WHAT IT CONTROLS:
 * - App navigation structure
 * - Active page indication
 * - User quick actions
 * * TO MODIFY:
 * - Add new routes → add to NAV_ITEMS array
 * - Change active styling → modify the isActive conditional classes
 * - Adjust width → change the w- classes on the nav element
 */

import { motion } from 'framer-motion';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  BookOpen, 
  Users, 
  Target, 
  Gift,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION ITEMS — The rooms of the house
   
   Each item represents a main section of the app.
   Add new items here to extend navigation.
   
   Structure:
   - path: Route URL
   - label: Display name
   - icon: Lucide icon component
   - description: Hover tooltip (optional)
═══════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { 
    path: '/', 
    label: 'The Foyer', 
    icon: Home,
    description: 'Your personal dashboard'
  },
  { 
    path: '/passport', 
    label: 'Swassport', 
    icon: MapPin,
    description: 'Places you\'ve visited'
  },
  { 
    path: '/scrapbook', 
    label: 'Swassbook', 
    icon: BookOpen,
    description: 'Your visual diary'
  },
  { 
    path: '/vault-of-tales', 
    label: 'Swasshold', 
    icon: Users,
    description: 'Stories with friends'
  },
  { 
    path: '/goals', 
    label: 'Swassire', 
    icon: Target,
    description: 'Your aspirations'
  },
  { 
    path: '/treat-wheel', 
    label: 'Fortuna', 
    icon: Gift,
    description: 'Spin for a surprise'
  },
];

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS — Staggered reveal for nav items
═══════════════════════════════════════════════════════════════ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The App.tsx subscription will detect the change and redirect,
    // but we can explicitly navigate to be safe/instant.
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        /* Base layout */
        "fixed left-0 top-0 h-screen w-64",
        /* Background — deep gradient */
        "bg-gradient-to-b from-sidebar via-sidebar to-midnight-dark",
        /* Border — subtle gold accent */
        "border-r border-gold/10",
        /* Layering */
        "z-40 flex flex-col",
        /* Glass effect */
        "backdrop-blur-sm"
      )}
    >
      {/* ═══════════════════════════════════════════════════════════════
          HEADER — House name and user greeting
      ═══════════════════════════════════════════════════════════════ */}
      <div className="p-6 border-b border-gold/10">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-display text-2xl text-gold tracking-wide"
        >
          House of Swass
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-script text-lg text-muted-foreground mt-1"
        >
          Welcome, Swass
        </motion.p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          NAVIGATION LINKS — Room directory
      ═══════════════════════════════════════════════════════════════ */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 py-6 px-3 overflow-y-auto"
      >
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.div key={item.path} variants={itemVariants}>
                <Link
                  to={item.path}
                  className={cn(
                    /* Base styling */
                    "flex items-center gap-3 px-4 py-3 rounded-lg",
                    "font-body text-sm",
                    "transition-all duration-300",
                    /* Inactive state */
                    !isActive && [
                      "text-sidebar-foreground/70",
                      "hover:text-gold hover:bg-sidebar-accent/50",
                    ],
                    /* Active state — gold glow */
                    isActive && [
                      "text-gold",
                      "bg-sidebar-accent",
                      "shadow-nav-active",
                    ]
                  )}
                >
                  <Icon 
                    size={18} 
                    className={cn(
                      "transition-all duration-300",
                      isActive && "animate-slow-pulse"
                    )} 
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER — Exit action
      ═══════════════════════════════════════════════════════════════ */}
      <div className="p-4 border-t border-gold/10">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg w-full",
            "text-muted-foreground/60 font-body text-sm",
            "hover:text-destructive hover:bg-destructive/10",
            "transition-all duration-300"
          )}
        >
          <LogOut size={18} />
          <span>Leave the House</span>
        </button>
      </div>
    </motion.nav>
  );
}