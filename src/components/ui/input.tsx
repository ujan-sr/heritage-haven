/**
 * Input.tsx — HOUSE OF SWASS INPUT STYLING
 * 
 * Text input with heritage aesthetic.
 * Dark background with gold accents on focus.
 * 
 * TO MODIFY:
 * - Background color → change bg- class
 * - Focus ring color → change focus-visible:ring- class
 * - Border style → modify border classes
 */

import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          /* Base input styling — dark with warm accents */
          "flex h-12 w-full rounded-lg",
          "bg-muted/50 border border-gold/20",
          "px-4 py-3",
          "font-body text-base text-foreground",
          "placeholder:text-muted-foreground/60",
          /* Focus state — gold ring */
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold/40",
          /* Transition */
          "transition-all duration-300",
          /* Disabled state */
          "disabled:cursor-not-allowed disabled:opacity-50",
          /* File input styling */
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
