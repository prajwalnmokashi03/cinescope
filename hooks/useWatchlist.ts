"use client";

import { useState, useEffect } from "react";
import { WatchlistItem, WatchlistStatus } from "@/types/watchlist";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const STORAGE_KEY = "my_watchlist_v1";

export function useWatchlist() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Helper to get local data safely
    const getLocalData = (): WatchlistItem[] => {
        if (typeof window === "undefined") return [];
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Local storage error:", e);
            return [];
        }
    };

    // Helper to update Firestore
    const updateFirestore = async (uid: string, newItems: WatchlistItem[]) => {
        try {
            const docRef = doc(db, "watchlists", uid);
            await setDoc(docRef, {
                items: newItems,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating watchlist:", error);
        }
    };

    // 1. Auth Listener & Sync
    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // LOGGED IN
                const docRef = doc(db, "watchlists", currentUser.uid);

                // A. Migration Check (Idempotent)
                try {
                    const snap = await getDoc(docRef);
                    if (!snap.exists()) {
                        const local = getLocalData();
                        if (local.length > 0) {
                            await setDoc(docRef, {
                                items: local,
                                updatedAt: serverTimestamp()
                            });
                            // Clear local after successful migration
                            localStorage.removeItem(STORAGE_KEY);
                        }
                    }
                } catch (migrateErr) {
                    console.error("Migration check failed:", migrateErr);
                }

                // B. Real-time Listener
                const unsubSnapshot = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setWatchlist(docSnap.data().items || []);
                    } else {
                        setWatchlist([]);
                    }
                    setIsLoaded(true);
                }, (err) => {
                    console.error("Watchlist sync error:", err);
                    setIsLoaded(true); // Stop loading even on error
                });

                return () => unsubSnapshot();
            } else {
                // GUEST / LOGGED OUT
                setWatchlist(getLocalData());
                setIsLoaded(true);
            }
        });

        return () => unsubAuth();
    }, []);

    // 2. Local Storage Sync (Only for Guests)
    useEffect(() => {
        if (isLoaded && !user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
        }
    }, [watchlist, isLoaded, user]);


    // ACTIONS
    const addToWatchlist = (item: Omit<WatchlistItem, "status" | "added_at" | "rating" | "notes">, status: WatchlistStatus = 'plan_to_watch') => {
        const newItem: WatchlistItem = {
            ...item,
            status,
            added_at: Date.now(),
            rating: 0,
            notes: ""
        };

        if (user) {
            // Firestore Update
            // Avoid duplicates
            if (watchlist.some(i => i.tmdb_id === item.tmdb_id)) return;
            const newItems = [newItem, ...watchlist];
            // Optimistic update
            setWatchlist(newItems);
            updateFirestore(user.uid, newItems);
        } else {
            // Local Update
            setWatchlist((prev) => {
                if (prev.some((i) => i.tmdb_id === item.tmdb_id)) return prev;
                return [newItem, ...prev];
            });
        }
    };

    const removeFromWatchlist = (tmdb_id: number) => {
        if (user) {
            const newItems = watchlist.filter((item) => item.tmdb_id !== tmdb_id);
            setWatchlist(newItems);
            updateFirestore(user.uid, newItems);
        } else {
            setWatchlist((prev) => prev.filter((item) => item.tmdb_id !== tmdb_id));
        }
    };

    const updateStatus = (tmdb_id: number, status: WatchlistStatus) => {
        if (user) {
            const newItems = watchlist.map((item) => (item.tmdb_id === tmdb_id ? { ...item, status } : item));
            setWatchlist(newItems);
            updateFirestore(user.uid, newItems);
        } else {
            setWatchlist((prev) =>
                prev.map((item) => (item.tmdb_id === tmdb_id ? { ...item, status } : item))
            );
        }
    };

    const updateRating = (tmdb_id: number, rating: number) => {
        if (user) {
            const newItems = watchlist.map((item) => (item.tmdb_id === tmdb_id ? { ...item, rating, rated_at: Date.now() } : item));
            setWatchlist(newItems);
            updateFirestore(user.uid, newItems);
        } else {
            setWatchlist((prev) =>
                prev.map((item) => (item.tmdb_id === tmdb_id ? { ...item, rating, rated_at: Date.now() } : item))
            );
        }
    };

    const updateNotes = (tmdb_id: number, notes: string) => {
        if (user) {
            const newItems = watchlist.map((item) => (item.tmdb_id === tmdb_id ? { ...item, notes } : item));
            setWatchlist(newItems);
            updateFirestore(user.uid, newItems);
        } else {
            setWatchlist((prev) =>
                prev.map((item) => (item.tmdb_id === tmdb_id ? { ...item, notes } : item))
            );
        }
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
