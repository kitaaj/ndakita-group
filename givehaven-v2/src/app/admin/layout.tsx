"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { getCurrentSession, signOut, isUserSuperAdmin } from "@/lib/supabase";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const session = await getCurrentSession();

                if (!session) {
                    router.push("/login");
                    return;
                }

                // Check if user is super admin
                const isSuperAdmin = await isUserSuperAdmin(session.user.id);

                if (!isSuperAdmin) {
                    router.push("/");
                    return;
                }

                setIsAuthorized(true);
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/app");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "#0D9488", borderTopColor: "transparent" }} />
                    <p className="text-sm font-medium" style={{ color: "#64748B" }}>Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC" }}>
            <Sidebar onSignOut={handleSignOut} />
            <main className="flex-1 overflow-auto">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
