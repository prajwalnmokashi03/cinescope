"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            // Public paths
            const publicPaths = ['/login'];
            const isPublicPath = publicPaths.includes(pathname);

            if (!user && !isPublicPath) {
                router.push('/login');
            } else if (user && isPublicPath) {
                router.push('/');
            } else {
                // If we are logged in or on a public page, we can show content
                setIsChecking(false);
            }
        }
    }, [user, loading, pathname, router]);

    if (loading || isChecking) {
        // Render a minimal loader while checking auth state
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
