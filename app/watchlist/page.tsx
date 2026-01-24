"use client";

import { useWatchlist } from '@/hooks/useWatchlist';
import { WatchlistStatus, WatchlistItem } from '@/types/watchlist';
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

    // Split items by type
    const movieItems = sortedWatchlist.filter(item => item.media_type === 'movie');
    const seriesItems = sortedWatchlist.filter(item => item.media_type === 'tv' || item.media_type === 'series');

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

    const renderCard = (item: WatchlistItem) => {
        const statusOption = STATUS_OPTIONS.find(so => so.value === item.status) || STATUS_OPTIONS[0];
        const imageUrl = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://via.placeholder.com/500x750?text=No+Image";

        return (
            <div key={item.tmdb_id} className="flex flex-col gap-3 group relative">
                {/* 1. Poster Card */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1c1c1c] border border-gray-800 shadow-lg group-hover:border-blue-500/50 transition-colors">
                    <Image src={imageUrl} alt={item.title} fill className="object-cover" unoptimized />

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 z-10">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${item.media_type === 'movie' ? 'bg-blue-600/90 text-white' : 'bg-green-600/90 text-white'}`}>
                            {item.media_type}
                        </span>
                    </div>

                    {/* Remove Button */}
                    <button
                        onClick={(e) => { e.preventDefault(); removeFromWatchlist(item.tmdb_id); }}
                        className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-red-600 rounded-full text-white transition-colors backdrop-blur-sm"
                        title="Remove"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    {/* Hover Overlay Link */}
                    <Link href={`/details/${item.tmdb_id}?type=${item.media_type}`} className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>

                {/* 2. Metadata & Controls */}
                <div className="flex flex-col gap-2">
                    <div>
                        <Link href={`/details/${item.tmdb_id}?type=${item.media_type}`} className="font-bold text-white leading-tight hover:text-blue-400 transition-colors line-clamp-1">
                            {item.title}
                        </Link>
                        <div className="text-xs text-gray-500 mt-0.5">{item.year || 'N/A'}</div>
                    </div>

                    {/* Status */}
                    <div className="relative">
                        <select
                            value={item.status}
                            onChange={(e) => updateStatus(item.tmdb_id, e.target.value as WatchlistStatus)}
                            className={`w-full appearance-none px-3 py-1.5 rounded-lg text-xs font-bold uppercase border bg-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors ${statusOption.color}`}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-[#1c1c1c] text-gray-300 capitalize">{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <StarRating rating={item.rating || 0} onChange={(r) => updateRating(item.tmdb_id, r)} />
                        <span className="text-xs text-gray-500 font-medium">{item.rating ? `${item.rating}/5` : ''}</span>
                    </div>

                    {/* Notes */}
                    <div className="mt-1">
                        {editingNote === item.tmdb_id ? (
                            <div className="flex gap-1 animate-in fade-in duration-200">
                                <input
                                    type="text"
                                    value={tempNote}
                                    onChange={(e) => setTempNote(e.target.value)}
                                    className="flex-1 bg-[#161616] border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none w-full"
                                    placeholder="Note..."
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === 'Enter') saveNote(item.tmdb_id); }}
                                />
                                <button onClick={() => saveNote(item.tmdb_id)} className="bg-blue-600 text-white px-2 rounded text-xs">OK</button>
                            </div>
                        ) : (
                            item.notes ? (
                                <button onClick={() => openNote(item.tmdb_id, item.notes)} className="w-full text-left text-xs text-gray-400 bg-[#161616] hover:bg-[#202020] border border-gray-800 rounded px-2 py-1.5 truncate transition-colors">
                                    📝 {item.notes}
                                </button>
                            ) : (
                                <button onClick={() => openNote(item.tmdb_id)} className="text-xs text-gray-600 hover:text-blue-400 transition-colors flex items-center gap-1">
                                    + Add Note
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
            <main className="max-w-7xl mx-auto px-6 py-12">
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
                    <div className="space-y-12">
                        {/* Movies Section */}
                        {movieItems.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"> Movies <span className="text-sm text-gray-500 font-normal">({movieItems.length})</span></h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {movieItems.map(renderCard)}
                                </div>
                            </section>
                        )}

                        {/* Series Section */}
                        {seriesItems.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"> Series <span className="text-sm text-gray-500 font-normal">({seriesItems.length})</span></h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {seriesItems.map(renderCard)}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
