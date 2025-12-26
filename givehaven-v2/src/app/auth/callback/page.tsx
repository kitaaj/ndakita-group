"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

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

            // Check for explicit redirect destination from query param
            const redirectTo = searchParams.get("redirect");
            if (redirectTo) {
                router.push(redirectTo);
                return;
            }

            // Check if user has a profile and determine role
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("user_id", session.user.id)
                .single();

            if (profile?.role === "admin") {
                router.push("/admin");
            } else if (profile?.role === "home") {
                // Check if they have an existing home
                const { data: home } = await supabase
                    .from("homes")
                    .select("id")
                    .eq("profile_id", profile?.id)
                    .single();

                if (home) {
                    router.push("/home");
                } else {
                    router.push("/register-home");
                }
            } else if (profile?.role === "donor") {
                // Donor - send to explore page
                router.push("/explore");
            } else {
                // New user without profile - send to explore (they can donate without registering a home)
                router.push("/explore");
            }
        }

        handleCallback();
    }, [router, searchParams]);

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
