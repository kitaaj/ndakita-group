"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
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
                .select("id, role")
                .eq("user_id", session.user.id)
                .single();

            if (profile?.role === "admin") {
                router.push("/admin");
            } else if (profile?.role === "home") {
                // Check if they have an existing home
                const { data: home } = await supabase
                    .from("homes")
                    .select("*")
                    .eq("profile_id", profile.id)
                    .single();

                if (home) {
                    router.push("/home");
                } else {
                    router.push("/register-home");
                }
            } else {
                // Default to app page for donors and new users without profile
                router.push("/app");
            }
        }

        handleCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Signing you in...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
