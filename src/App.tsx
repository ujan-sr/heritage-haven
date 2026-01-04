/**
 * App.tsx — HOUSE OF SWASS ROOT
 * * NOW INCLUDES SUPABASE AUTH & TREAT WHEEL
 */

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { MainLayout } from "@/components/layout/MainLayout";

// 1. DATA STORE (Required for Passport, Vault, Goals, and Wheel)
import { DataProvider } from "@/stores/DataStore";

// 2. PAGES
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Passport from "./pages/Passport";
import Scrapbook from "@/pages/Scrapbook";
import VaultOfTales from "@/pages/VaultOfTales";
import Goals from "@/pages/Goals";
import TreatWheel from "@/pages/TreatWheel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * AppContent — Handles conditional layout rendering based on Supabase Session
 */
function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Listen for auth changes (sign in, sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Prevent "flash of login screen" while checking session
  if (isLoading) {
    return null; // Or return a loading spinner here
  }

  // If not logged in, show Login
  if (!session) {
    return <Login />;
  }

  return (
    // 3. WRAP CONTENT IN DATA PROVIDER so all pages can access the store
    <DataProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/scrapbook" element={<Scrapbook />} />
          <Route path="/vault-of-tales" element={<VaultOfTales />} />
          <Route path="/goals" element={<Goals />} />

          {/* 2. ADD THE ROUTE HERE */}
          <Route path="/treat-wheel" element={<TreatWheel />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </DataProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Explicit Login Route (optional, but good for direct links) */}
          <Route path="/login" element={<Login />} />
          
          {/* Main App Content handles auth protection */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;