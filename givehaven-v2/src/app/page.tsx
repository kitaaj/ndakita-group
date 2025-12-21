"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FloatingGrid from "@/components/FloatingGrid";
import GlassHero from "@/components/GlassHero";
import TeaserPage from "@/components/TeaserPage";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  const [showGiveHaven, setShowGiveHaven] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);

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
