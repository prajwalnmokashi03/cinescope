"use client";

import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ConnectionProvider>
            <AuthProvider>
                <AuthGuard>
                    {children}
                </AuthGuard>
            </AuthProvider>
        </ConnectionProvider>
    );
}
