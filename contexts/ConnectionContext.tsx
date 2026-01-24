"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ConnectionContextType {
    isConnected: boolean;
    isInitialized: boolean;
    checkConnection: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType>({
    isConnected: false,
    isInitialized: false,
    checkConnection: async () => { },
});

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const checkConnection = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

        try {
            // Cache busting with timestamp
            const res = await fetch(`/api/health?t=${Date.now()}`, {
                cache: 'no-store',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                if (!isConnected) {
                    // Only log state change
                    // console.log('Connection restored');
                }
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch (e) {
            clearTimeout(timeoutId);
            setIsConnected(false);
        } finally {
            if (!isInitialized) {
                setIsInitialized(true);
            }
        }
    };

    useEffect(() => {
        // Initial check
        checkConnection();

        // Aggressive Polling: 1 second
        const interval = setInterval(checkConnection, 1000);
        return () => clearInterval(interval);
    }, [isConnected, isInitialized]);
    // Dependency Logic:
    // We want the interval to run continuously. 
    // Relying on isConnected in dep array might reset interval unnecessarily but ensures fresh closure state if needed.
    // Actually, checkConnection doesn't depend on state closure (sets state directly). 
    // But keeping it safe.

    return (
        <ConnectionContext.Provider value={{ isConnected, isInitialized, checkConnection }}>
            {children}
        </ConnectionContext.Provider>
    );
};
