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
            className="min-h-screen relative overflow-hidden bg-brand-dark"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
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
