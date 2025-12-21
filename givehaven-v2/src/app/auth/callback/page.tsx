"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        async function handleCallback() {
            if (!supabase) {
                router.push("/login");
                return;
            }

            // Get the session from the URL hash
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                console.error("Auth callback error:", error);
                router.push("/login");
                return;
            }

            // Successfully authenticated, redirect to admin
            router.push("/admin");
        }

        handleCallback();
    }, [router]);

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
