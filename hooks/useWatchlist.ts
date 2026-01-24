"use client";

import { useState, useEffect } from "react";
import { WatchlistItem, WatchlistStatus } from "@/types/watchlist";

const STORAGE_KEY = "my_watchlist_v1";

export function useWatchlist() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setWatchlist(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load watchlist:", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage whenever watchlist changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
        }
    }, [watchlist, isLoaded]);

    const addToWatchlist = (item: Omit<WatchlistItem, "status" | "added_at" | "rating" | "notes">, status: WatchlistStatus = 'plan_to_watch') => {
        setWatchlist((prev) => {
            if (prev.some((i) => i.tmdb_id === item.tmdb_id)) return prev;
            return [
                {
                    ...item,
                    status,
                    added_at: Date.now(),
                    rating: 0,
                    notes: ""
                },
                ...prev
            ];
        });
    };

    const removeFromWatchlist = (tmdb_id: number) => {
        setWatchlist((prev) => prev.filter((item) => item.tmdb_id !== tmdb_id));
    };

    const updateStatus = (tmdb_id: number, status: WatchlistStatus) => {
        setWatchlist((prev) =>
            prev.map((item) => (item.tmdb_id === tmdb_id ? { ...item, status } : item))
        );
    };

    const updateRating = (tmdb_id: number, rating: number) => {
        setWatchlist((prev) =>
            prev.map((item) => (item.tmdb_id === tmdb_id ? { ...item, rating, rated_at: Date.now() } : item))
        );
    };

    const updateNotes = (tmdb_id: number, notes: string) => {
        setWatchlist((prev) =>
            prev.map((item) => (item.tmdb_id === tmdb_id ? { ...item, notes } : item))
        );
    };

    return {
        watchlist,
        isLoaded,
        addToWatchlist,
        removeFromWatchlist,
        updateStatus,
        updateRating,
        updateNotes
    };
}
