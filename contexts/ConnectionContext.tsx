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
        try {
            const res = await fetch('/api/health');
            if (res.ok) {
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch (e) {
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

        // Poll every 1.5 seconds (1500ms)
        const interval = setInterval(checkConnection, 1500);
        return () => clearInterval(interval);
    }, [isInitialized]);

    return (
        <ConnectionContext.Provider value={{ isConnected, isInitialized, checkConnection }}>
            {children}
        </ConnectionContext.Provider>
    );
};
