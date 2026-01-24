"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function ProfileDropdown() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    const initial = user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "U");

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all border border-blue-400/30"
            >
                {initial}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-[#1c1c1c] border border-gray-800 rounded-xl shadow-2xl p-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-3 border-b border-gray-800/50 mb-1">
                        <p className="text-sm font-semibold text-white truncate">{user.displayName || "User"}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#2a1a1a] hover:text-red-300 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
