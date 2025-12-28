"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import TeaserPage from "@/components/TeaserPage";
import FloatingGrid from "@/components/FloatingGrid";
import GlassHero from "@/components/GlassHero";
import WaitlistForm from "@/components/WaitlistForm";

export default function HomePage() {
    const [showTeaser, setShowTeaser] = useState(true);
    const [showWaitlist, setShowWaitlist] = useState(false);

    return (
        <>
            <AnimatePresence mode="wait">
                {showTeaser ? (
                    <TeaserPage key="teaser" onEnter={() => setShowTeaser(false)} />
                ) : (
                    <>
                        <FloatingGrid key="grid" />
                        <GlassHero onJoinClick={() => setShowWaitlist(true)} />
                    </>
                )}
            </AnimatePresence>

            {/* Waitlist Modal */}
            <WaitlistForm isOpen={showWaitlist} onClose={() => setShowWaitlist(false)} />
        </>
    );
}
