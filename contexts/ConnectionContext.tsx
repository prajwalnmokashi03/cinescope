"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ConnectionContextType {
    isConnected: boolean;
    checkConnection: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType>({
    isConnected: true, // Optimistically true
    checkConnection: async () => { },
});

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(true);

    const checkConnection = async () => {
        try {
            const res = await fetch('/api/health');
            if (res.ok) {
                if (!isConnected) {
                    console.log('Connection restored');
                    setIsConnected(true);
                }
            } else {
                throw new Error('Health check failed');
            }
        } catch (e) {
            if (isConnected) {
                console.log('Connection lost');
                setIsConnected(false);
            }
        }
    };

    useEffect(() => {
        // Initial check
        checkConnection();

        // Poll every 2 seconds
        const interval = setInterval(checkConnection, 2000);
        return () => clearInterval(interval);
    }, [isConnected]);

    return (
        <ConnectionContext.Provider value={{ isConnected, checkConnection }}>
            {children}
        </ConnectionContext.Provider>
    );
};
