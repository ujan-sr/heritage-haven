/**
 * Button.tsx — HOUSE OF SWASS BUTTON VARIANTS
 * 
 * Custom button component with heritage styling.
 * All buttons inherit from the design system colors.
 * 
 * VARIANTS:
 * - default: Velvet maroon background, cream text
 * - secondary: Heritage teal, subtle
 * - ghost: Transparent with gold hover
 * - outline: Gold border, transparent fill
 * - hero: Large, dramatic entry button with glow
 * - nav: Navigation panel button
 * 
 * TO MODIFY:
 * - Button colors → change the variant class strings below
 * - Hover effects → adjust hover: and transition classes
 * - Sizes → modify the size variants
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  /* Base styles for ALL buttons */
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium font-body transition-all duration-400 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* ═══════════════════════════════════════════════════════════════
           DEFAULT — Velvet Maroon
           Primary CTA button, rich and warm
        ═══════════════════════════════════════════════════════════════ */
        default: "bg-primary text-primary-foreground shadow-warm hover:bg-maroon-light hover:shadow-card-hover active:bg-maroon-dark",
        
        /* ═══════════════════════════════════════════════════════════════
           SECONDARY — Heritage Teal
           Secondary actions, subtle but present
        ═══════════════════════════════════════════════════════════════ */
        secondary: "bg-secondary text-secondary-foreground hover:bg-teal-light shadow-sm",
        
        /* ═══════════════════════════════════════════════════════════════
           GHOST — Transparent
           Minimal button for tertiary actions
        ═══════════════════════════════════════════════════════════════ */
        ghost: "text-foreground hover:bg-muted hover:text-gold",
        
        /* ═══════════════════════════════════════════════════════════════
           OUTLINE — Gold Border
           Elegant outline button with gold accent
        ═══════════════════════════════════════════════════════════════ */
        outline: "border-2 border-gold/40 bg-transparent text-gold hover:bg-gold/10 hover:border-gold",
        
        /* ═══════════════════════════════════════════════════════════════
           HERO — Dramatic Entry Button
           Large, glowing, commanding attention
           Used for login "Enter the House" button
        ═══════════════════════════════════════════════════════════════ */
        hero: "bg-gradient-to-br from-primary to-maroon-dark text-cream-light border border-gold/30 shadow-glow hover:shadow-[0_0_80px_hsla(38,60%,50%,0.25)] hover:-translate-y-1 active:translate-y-0",
        
        /* ═══════════════════════════════════════════════════════════════
           NAV — Navigation Button
           For sidebar navigation items
        ═══════════════════════════════════════════════════════════════ */
        nav: "text-sidebar-foreground justify-start hover:bg-sidebar-accent hover:text-gold transition-all duration-300",
        
        /* ═══════════════════════════════════════════════════════════════
           NAV ACTIVE — Active Navigation State
           Gold glow, highlighted
        ═══════════════════════════════════════════════════════════════ */
        "nav-active": "text-gold bg-sidebar-accent justify-start shadow-nav-active",
        
        /* ═══════════════════════════════════════════════════════════════
           DESTRUCTIVE — Warning/Delete Actions
        ═══════════════════════════════════════════════════════════════ */
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        /* ═══════════════════════════════════════════════════════════════
           LINK — Text-only, underlined
        ═══════════════════════════════════════════════════════════════ */
        link: "text-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        nav: "h-11 px-4 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
