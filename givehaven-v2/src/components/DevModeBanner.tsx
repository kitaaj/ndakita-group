"use client";

import { Info } from "lucide-react";

export default function DevModeBanner() {
    return (
        <div
            className="w-full"
            style={{
                background: "linear-gradient(90deg, #0D9488 0%, #14B8A6 50%, #0D9488 100%)",
            }}
        >
            <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="flex items-center justify-center gap-2">
                    <Info size={16} className="text-white/90 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-white/90">
                        <span className="hidden sm:inline">
                            You&apos;re previewing a development version. Data shown is for testing purposes only.
                        </span>
                        <span className="sm:hidden">
                            Preview mode — test data only
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
