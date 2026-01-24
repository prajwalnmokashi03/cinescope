"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWatchlist } from "@/hooks/useWatchlist";
import MediaCard from "@/components/MediaCard";

interface SearchResult {
    id: number;
    title?: string;
    name?: string;
    media_type: 'movie' | 'tv' | 'person';
    poster_path: string | null;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
}

type FilterType = 'all' | 'movie' | 'tv';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const pathname = usePathname();

    const { watchlist, addToWatchlist } = useWatchlist();

    // 1. Clear search on route change
    useEffect(() => {
        setQuery("");
        setDebouncedQuery("");
        setResults([]);
    }, [pathname]);

    // 2. Debounce Query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    // 3. Effect: Fetch on debounced query change
    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedQuery.length < 3) {
                setResults([]);
                return;
            }

            setLoading(true);
            setResults([]);
            setActiveFilter('all'); // Reset filter on new search

            try {
                const res = await fetch(`/api/search?query=${encodeURIComponent(debouncedQuery)}`);
                if (!res.ok) throw new Error("Search failed");
                const data = await res.json();
                const rawResults: SearchResult[] = data.results || [];
                // Filter only movie/tv
                const mediaItems = rawResults.filter((item) =>
                    item.media_type === 'movie' || item.media_type === 'tv'
                );
                setResults(mediaItems);
            } catch (err: any) {
                console.error(err);
                // consistent empty state if error
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    // Reset helper
    const resetSearch = () => {
        setQuery("");
        setDebouncedQuery("");
        setResults([]);
    };

    const isInWatchlist = (id: number) => watchlist.some((item) => item.tmdb_id === id);

    const handleAdd = (e: any, item: SearchResult) => {
        e.preventDefault();
        e.stopPropagation();
        addToWatchlist({
            tmdb_id: item.id,
            title: item.title || item.name || "Unknown Title",
            media_type: item.media_type as 'movie' | 'tv',
            poster_path: item.poster_path,
            year: (item.release_date || item.first_air_date || '').split('-')[0]
        }, 'plan_to_watch');
    };

    // Filter results for display
    const filteredResults = results.filter(item => {
        if (activeFilter === 'all') return true;
        return item.media_type === activeFilter;
    });

    const movieCount = results.filter(r => r.media_type === 'movie').length;
    const tvCount = results.filter(r => r.media_type === 'tv').length;
    const allCount = results.length;

    // Condition to show search overlay:
    // 1. Loading
    // 2. Have results
    // 3. Debounced query > 3 chars (even if 0 results, to show "No matches")
    const showSearch = loading || results.length > 0 || (debouncedQuery.length >= 3 && results.length === 0);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30 font-sans pb-20">
            <header className="px-6 h-16 flex items-center border-b border-gray-800 mb-8 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur z-50 justify-between gap-8">
                <div className="flex items-center gap-8 flex-shrink-0">
                    <Link href="/" onClick={resetSearch} className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
                            {/* Projector Icon */}
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight">CineScope</span>
                    </Link>
                    <div className="hidden md:flex gap-6 text-sm font-medium">
                        <Link
                            href="/"
                            onClick={resetSearch}
                            className={`transition-colors ${pathname === '/' ? 'text-white font-bold' : 'text-gray-400 hover:text-white hover:text-blue-500'}`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/movies"
                            onClick={resetSearch}
                            className={`transition-colors ${pathname === '/movies' ? 'text-white font-bold' : 'text-gray-400 hover:text-white hover:text-blue-500'}`}
                        >
                            Movies
                        </Link>
                        <Link
                            href="/series"
                            onClick={resetSearch}
                            className={`transition-colors ${pathname === '/series' ? 'text-white font-bold' : 'text-gray-400 hover:text-white hover:text-blue-500'}`}
                        >
                            Series
                        </Link>
                    </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="flex-1 max-w-xl relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search movies & TV..."
                        className="w-full bg-[#161616] border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </form>

                <Link href="/watchlist" onClick={resetSearch} className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-white transition-colors flex-shrink-0" aria-label="My List">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </Link>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {showSearch ? (
                    <>
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
                            <div className="flex gap-2">
                                <button onClick={() => setActiveFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-[#1c1c1c] text-gray-400'}`}>All <span className="text-xs opacity-70 ml-1">{allCount}</span></button>
                                <button onClick={() => setActiveFilter('movie')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === 'movie' ? 'bg-blue-600 text-white' : 'bg-[#1c1c1c] text-gray-400'}`}>Movies <span className="text-xs opacity-70 ml-1">{movieCount}</span></button>
                                <button onClick={() => setActiveFilter('tv')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === 'tv' ? 'bg-blue-600 text-white' : 'bg-[#1c1c1c] text-gray-400'}`}>TV <span className="text-xs opacity-70 ml-1">{tvCount}</span></button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
                        ) : filteredResults.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredResults.map((item) => (
                                    <MediaCard key={item.id} item={item} onAdd={handleAdd} isInWatchlist={isInWatchlist(item.id)} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-12">No matches found for "{debouncedQuery}"</div>
                        )}
                    </>
                ) : (
                    children
                )}
            </main>
        </div>
    );
}
