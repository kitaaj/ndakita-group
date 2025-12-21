"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import FloatingGrid from "@/components/FloatingGrid";
import GlassHero from "@/components/GlassHero";
import TeaserPage from "@/components/TeaserPage";
import WaitlistForm from "@/components/WaitlistForm";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [showGiveHaven, setShowGiveHaven] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for OAuth tokens in URL hash
  useEffect(() => {
    async function handleAuthRedirect() {
      // Check if there's an access_token in the hash (OAuth callback fallback)
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        if (!supabase) {
          setIsCheckingAuth(false);
          return;
        }

        // Let Supabase handle the hash and set up the session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session && !error) {
          // Clear the URL hash for security (don't leave tokens visible)
          window.history.replaceState(null, '', window.location.pathname);

          // Check if profile exists, create if not
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .single();

          if (!existingProfile) {
            // Create profile for new user
            await supabase.from('profiles').insert({
              user_id: session.user.id,
              display_name: session.user.user_metadata?.full_name || session.user.email,
              avatar_url: session.user.user_metadata?.avatar_url,
              role: 'donor',
              is_super_admin: false,
            });
          }

          // Successfully authenticated, redirect to admin
          router.push('/admin');
          return;
        } else {
          // Clear hash even on error
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
      setIsCheckingAuth(false);
    }

    handleAuthRedirect();
  }, [router]);

  // Show loading while checking auth
  if (isCheckingAuth && typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#0D9488", borderTopColor: "transparent" }}
          />
          <p style={{ color: "#64748B" }}>Signing you in...</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <AnimatePresence mode="wait">
        {!showGiveHaven ? (
          <TeaserPage key="teaser" onEnter={() => setShowGiveHaven(true)} />
        ) : (
          <motion.main
            key="givehaven"
            className="min-h-screen relative overflow-hidden"
            style={{ backgroundColor: "#F5D6D0" }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Back Home Button */}
            <motion.button
              onClick={() => setShowGiveHaven(false)}
              className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-brand-pink-deep/70 border border-brand-pink-deep backdrop-blur-md text-white hover:bg-brand-pink-deep transition-all duration-300 text-sm font-semibold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
              </svg>
              Back Home
            </motion.button>

            <FloatingGrid />
            <div className="relative z-10">
              <GlassHero onJoinClick={() => setShowWaitlistForm(true)} />
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <WaitlistForm
        isOpen={showWaitlistForm}
        onClose={() => setShowWaitlistForm(false)}
      />
    </>
  );
}
