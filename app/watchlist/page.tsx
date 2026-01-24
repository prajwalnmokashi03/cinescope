"use client";

import { useWatchlist } from '@/hooks/useWatchlist';
import { WatchlistStatus } from '@/types/watchlist';
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from 'react';
import StarRating from '@/components/StarRating';

const STATUS_OPTIONS: { value: WatchlistStatus; label: string; color: string }[] = [
    { value: 'plan_to_watch', label: 'Plan to Watch', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { value: 'watching', label: 'Watching', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { value: 'dropped', label: 'Dropped', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export default function WatchlistPage() {
    const { watchlist, isLoaded, removeFromWatchlist, updateStatus, updateRating, updateNotes } = useWatchlist();
    const [editingNote, setEditingNote] = useState<number | null>(null);
    const [tempNote, setTempNote] = useState("");
    const [sortBy, setSortBy] = useState<'rating_desc' | 'rating_asc' | 'recent_rated'>('rating_desc');

    const sortedWatchlist = useMemo(() => {
        if (!watchlist) return [];
        return [...watchlist].sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            const ratedAtA = a.rated_at || 0;
            const ratedAtB = b.rated_at || 0;

            switch (sortBy) {
                case 'rating_desc':
                    if (ratingA === 0 && ratingB > 0) return 1;
                    if (ratingB === 0 && ratingA > 0) return -1;
                    return ratingB - ratingA;
                case 'rating_asc':
                    if (ratingA === 0 && ratingB > 0) return 1;
                    if (ratingB === 0 && ratingA > 0) return -1;
                    if (ratingA > 0 && ratingB > 0) return ratingA - ratingB;
                    return 0;
                case 'recent_rated':
                    if (ratedAtA === 0 && ratedAtB > 0) return 1;
                    if (ratedAtB === 0 && ratedAtA > 0) return -1;
                    return ratedAtB - ratedAtA;
                default:
                    return 0;
            }
        });
    }, [watchlist, sortBy]);

    if (!isLoaded) {
        return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    const openNote = (id: number, currentNote: string = "") => {
        setEditingNote(id);
        setTempNote(currentNote);
    };

    const saveNote = (id: number) => {
        updateNotes(id, tempNote);
        setEditingNote(null);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">My Watchlist</h1>
                        <p className="text-gray-400">{watchlist.length} titles saved</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Showing {sortedWatchlist.length} of {watchlist.length} titles</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-[#161616] border border-gray-800 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                        >
                            <option value="rating_desc">Highest Rated</option>
                            <option value="rating_asc">Lowest Rated</option>
                            <option value="recent_rated">Recently Rated</option>
                        </select>
                    </div>
                </div>

                {watchlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-800 rounded-2xl bg-[#111]">
                        <div className="text-6xl mb-4">🎬</div>
                        <h3 className="text-xl font-bold text-gray-300 mb-2">Your list is empty</h3>
                        <p className="text-gray-500 mb-6">Start adding movies and shows to track them here.</p>
                        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg shadow-blue-900/20">
                            Browse Titles
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedWatchlist.map((item) => {
                            const statusOption = STATUS_OPTIONS.find(so => so.value === item.status) || STATUS_OPTIONS[0];
                            const imageUrl = item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : "https://via.placeholder.com/200x300?text=No+Image";

                            return (
                                <div key={item.tmdb_id} className="bg-[#121212] border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 hover:border-gray-700 transition-all group shadow-sm hover:shadow-md hover:shadow-blue-900/5">
                                    {/* 1. Poster Thumbnail */}
                                    <Link href={`/details/${item.tmdb_id}?type=${item.media_type}`} className="relative w-20 aspect-[2/3] flex-shrink-0 rounded-lg overflow-hidden shadow-lg border border-gray-800 group-hover:scale-105 transition-transform duration-300">
                                        <Image src={imageUrl} alt={item.title} fill className="object-cover" unoptimized />
                                    </Link>

                                    {/* 2. Title & Metadata */}
                                    <div className="flex-1 w-full md:w-auto text-center md:text-left flex flex-col gap-1">
                                        <Link href={`/details/${item.tmdb_id}?type=${item.media_type}`} className="text-xl font-bold text-white hover:text-blue-400 transition-colors line-clamp-1">
                                            {item.title}
                                        </Link>
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <span className="text-sm text-gray-400 font-medium">{item.year || 'N/A'}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.media_type === 'movie' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {item.media_type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3. Status Dropdown */}
                                    <div className="w-full md:w-40">
                                        <div className="relative">
                                            <select
                                                value={item.status}
                                                onChange={(e) => updateStatus(item.tmdb_id, e.target.value as WatchlistStatus)}
                                                className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-full text-xs font-bold uppercase border bg-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors ${statusOption.color}`}
                                            >
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value} className="bg-[#1c1c1c] text-gray-300 capitalize">{opt.label}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-current opacity-70">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Star Rating */}
                                    <div className="flex items-center gap-3 bg-[#0a0a0a] px-4 py-2 rounded-full border border-gray-800">
                                        <StarRating rating={item.rating || 0} onChange={(r) => updateRating(item.tmdb_id, r)} />
                                        <span className="text-sm font-bold text-gray-400 border-l border-gray-700 pl-3">
                                            {item.rating && item.rating > 0 ? <span className="text-yellow-500">{item.rating}/5</span> : '0/5'}
                                        </span>
                                    </div>

                                    {/* 5. Notes Button/Field */}
                                    <div className="w-full md:w-auto flex justify-center md:justify-end">
                                        {editingNote === item.tmdb_id ? (
                                            <div className="flex gap-2 w-full md:w-48 animate-in fade-in zoom-in-95 duration-200">
                                                <input
                                                    type="text"
                                                    value={tempNote}
                                                    onChange={(e) => setTempNote(e.target.value)}
                                                    className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-blue-500 outline-none placeholder-gray-600"
                                                    placeholder="Type note..."
                                                    autoFocus
                                                />
                                                <button onClick={() => saveNote(item.tmdb_id)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded-lg text-xs font-bold transition-colors">Save</button>
                                            </div>
                                        ) : (
                                            item.notes ? (
                                                <button
                                                    onClick={() => openNote(item.tmdb_id, item.notes)}
                                                    className="flex items-center gap-2 group/note px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/30 transition-all text-xs font-bold w-full md:w-auto"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    View Notes
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openNote(item.tmdb_id)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors text-xs font-medium w-full md:w-auto whitespace-nowrap"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    Add Notes
                                                </button>
                                            )
                                        )}
                                    </div>

                                    {/* 6. Remove Button */}
                                    <button
                                        onClick={() => removeFromWatchlist(item.tmdb_id)}
                                        className="p-3 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove from Watchlist"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
