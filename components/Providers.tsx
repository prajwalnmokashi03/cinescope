"use client";

import { ConnectionProvider } from "@/contexts/ConnectionContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ConnectionProvider>
            {children}
        </ConnectionProvider>
    );
}
