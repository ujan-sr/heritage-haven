/**
 * useUserStore.ts
 * 
 * USER STATE MANAGEMENT — Who is currently in the House
 * 
 * This store manages the current user session.
 * Since there's no backend, this is purely in-memory.
 * 
 * WHAT IT CONTROLS:
 * - Whether the user is "logged in" (has entered the house)
 * - User display name
 * - Entry timestamp
 * 
 * NOTE: All data is lost on page refresh.
 * TODO: Replace with backend authentication when ready.
 */

import { create } from 'zustand';

/* ═══════════════════════════════════════════════════════════════
   USER INTERFACE — What we know about the resident
═══════════════════════════════════════════════════════════════ */
interface User {
  name: string;
  enteredAt: Date;
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  
  // Actions
  enterHouse: (name: string) => void;
  leaveHouse: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   THE STORE — User session state
   
   enterHouse: Called when user submits the login form
   leaveHouse: Called to "log out" (clear session)
   
   TODO: Replace with backend API calls
═══════════════════════════════════════════════════════════════ */
export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,

  /**
   * enterHouse — "Log in" the user
   * 
   * @param name - Display name for the user
   * 
   * Creates a new user session with the current timestamp.
   * After calling this, isLoggedIn becomes true.
   * 
   * TODO: Replace with backend API call
   */
  enterHouse: (name: string) => {
    // TODO: replace with backend API call
    set({
      user: {
        name,
        enteredAt: new Date(),
      },
      isLoggedIn: true,
    });
  },

  /**
   * leaveHouse — "Log out" the user
   * 
   * Clears the user session.
   * After calling this, isLoggedIn becomes false.
   * 
   * TODO: Replace with backend API call
   */
  leaveHouse: () => {
    // TODO: replace with backend API call
    set({
      user: null,
      isLoggedIn: false,
    });
  },
}));

/* ═══════════════════════════════════════════════════════════════
   UTILITY HOOKS — Convenience accessors
═══════════════════════════════════════════════════════════════ */

/**
 * useIsLoggedIn — Quick check for auth state
 */
export const useIsLoggedIn = () => useUserStore((state) => state.isLoggedIn);

/**
 * useUserName — Get just the user's name
 */
export const useUserName = () => useUserStore((state) => state.user?.name ?? 'Guest');
