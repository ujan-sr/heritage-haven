/**
 * HOUSE OF SWASS — TAILWIND CONFIGURATION
 * 
 * This file extends Tailwind with our heritage design system.
 * All custom colors, fonts, shadows, and animations are registered here.
 * 
 * TO MODIFY:
 * - Add new colors → extend the 'colors' object
 * - Change font families → update 'fontFamily' object
 * - Adjust animation speeds → modify 'animation' durations
 * - Add new keyframes → extend 'keyframes' object
 */

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /* ═══════════════════════════════════════════════════════════════
         COLOR PALETTE — The visual identity of House of Swass
         
         All colors use CSS variables from index.css
         This allows runtime theming if needed later
      ═══════════════════════════════════════════════════════════════ */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        /* Primary — Velvet Maroon for CTAs */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        
        /* Secondary — Heritage Teal */
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        
        /* Antique Gold — Luxurious accents */
        gold: {
          DEFAULT: "hsl(var(--gold))",
          muted: "hsl(var(--gold-muted))",
        },
        
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        /* Vintage Cream — Paper surfaces */
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        /* Sidebar Navigation */
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        
        /* Direct color references for special cases */
        midnight: {
          DEFAULT: "#0B1220",
          light: "#141D2E",
          dark: "#060A10",
        },
        maroon: {
          DEFAULT: "#7B3230",
          light: "#9A4845",
          dark: "#5C2523",
        },
        cream: {
          DEFAULT: "#F3E7D9",
          light: "#FAF5EF",
          dark: "#E8D9C8",
        },
        teal: {
          DEFAULT: "#2F4F4F",
          light: "#3D6666",
          dark: "#1F3535",
        },
      },

      /* ═══════════════════════════════════════════════════════════════
         TYPOGRAPHY — Heritage font families
         
         display: DM Serif Display → Titles, hero text
         serif: Cormorant Garamond → Elegant subheadings
         body: Space Grotesk → UI and body text
         script: Parisienne → Dates, decorative captions
      ═══════════════════════════════════════════════════════════════ */
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
        script: ['"Parisienne"', 'cursive'],
        allura: ['"Allura"', 'cursive'],
      },

      /* ═══════════════════════════════════════════════════════════════
         BORDER RADIUS — Soft, elegant curves
      ═══════════════════════════════════════════════════════════════ */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        heritage: "1rem",
      },

      /* ═══════════════════════════════════════════════════════════════
         BOX SHADOWS — Lamp-lit depth effects
         
         warm: Gold-tinted ambient shadow
         deep: Strong drop shadow for layering
         glow: Subtle gold bloom effect
         card: Layered shadow for content cards
      ═══════════════════════════════════════════════════════════════ */
      boxShadow: {
        warm: "0 10px 40px -10px hsla(38, 52%, 40%, 0.3)",
        deep: "0 25px 50px -12px hsla(220, 40%, 5%, 0.6)",
        glow: "0 0 60px hsla(38, 60%, 50%, 0.15)",
        card: "0 4px 20px -4px hsla(220, 40%, 10%, 0.2), 0 1px 3px hsla(220, 40%, 10%, 0.1)",
        "card-hover": "0 20px 40px -10px hsla(220, 40%, 10%, 0.3), 0 0 40px hsla(38, 60%, 50%, 0.1)",
        "nav-active": "0 0 20px hsla(38, 60%, 60%, 0.3), inset 0 0 20px hsla(38, 60%, 60%, 0.1)",
      },

      /* ═══════════════════════════════════════════════════════════════
         ANIMATIONS — Slow, atmospheric, cinematic
         
         All animations should feel:
         - Deliberate (not snappy)
         - Warm (not mechanical)
         - Subtle (not attention-grabbing)
         
         To slow down: increase duration values
         To intensify: modify keyframe percentages
      ═══════════════════════════════════════════════════════════════ */
      keyframes: {
        /* Accordion expand/collapse */
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        
        /* Slow fade in with subtle rise */
        "fade-in-up": {
          "0%": { 
            opacity: "0", 
            transform: "translateY(20px)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        
        /* Gentle fade in */
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        
        /* Slow scale reveal */
        "scale-in": {
          "0%": { 
            opacity: "0", 
            transform: "scale(0.95)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "scale(1)" 
          },
        },
        
        /* Ambient light drift — simulates flickering lamp */
        "light-drift": {
          "0%, 100%": { 
            opacity: "0.08",
            transform: "translateY(0)" 
          },
          "50%": { 
            opacity: "0.12",
            transform: "translateY(-2px)" 
          },
        },
        
        /* Slow pulse for active states */
        "slow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        
        /* Chandelier flicker — very subtle */
        "chandelier": {
          "0%, 90%, 94%, 97%, 100%": { opacity: "1" },
          "92%": { opacity: "0.85" },
          "95%": { opacity: "0.92" },
        },
        
        /* Gentle float */
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },

        /* Shimmer effect for gold elements */
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.23, 1, 0.32, 1)",
        "fade-in": "fade-in 0.6s ease-out",
        "scale-in": "scale-in 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        "light-drift": "light-drift 8s ease-in-out infinite",
        "slow-pulse": "slow-pulse 3s ease-in-out infinite",
        "chandelier": "chandelier 10s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
      },

      /* ═══════════════════════════════════════════════════════════════
         TRANSITIONS — Smooth, deliberate timing
      ═══════════════════════════════════════════════════════════════ */
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.23, 1, 0.32, 1)",
        "gentle": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      /* ═══════════════════════════════════════════════════════════════
         BACKDROP BLUR — For glass effects
      ═══════════════════════════════════════════════════════════════ */
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
