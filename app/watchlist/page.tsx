"use client";

import Link from "next/link";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function WatchlistHub() {
    const { watchlist, isLoaded } = useWatchlist();

    if (!isLoaded) {
        return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    const movieCount = watchlist.filter(i => i.media_type === 'movie').length;
    const seriesCount = watchlist.filter(i => i.media_type === 'tv').length;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a]/90 backdrop-blur z-40 border-b border-gray-800 flex items-center px-6"></header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold mb-2">My List</h1>
                <p className="text-gray-400 mb-12">Select a collection to view.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* My Movies Card */}
                    <Link href="/my-movies" className="group relative h-64 rounded-2xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-900/20">
                        {/* Background Gradient/Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black group-hover:scale-105 transition-transform duration-700"></div>

                        <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center z-10">
                            <span className="text-6xl mb-4 group-hover:-translate-y-2 transition-transform duration-300">🎬</span>
                            <h2 className="text-3xl font-bold mb-2 group-hover:text-blue-400 transition-colors">My Movies</h2>
                            <p className="text-gray-400 font-medium bg-black/50 px-4 py-1 rounded-full border border-white/10">{movieCount} Titles</p>
                        </div>
                    </Link>

                    {/* My Series Card */}
                    <Link href="/my-series" className="group relative h-64 rounded-2xl overflow-hidden border border-gray-800 hover:border-green-500 transition-all shadow-lg hover:shadow-green-900/20">
                        {/* Background Gradient/Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-black group-hover:scale-105 transition-transform duration-700"></div>

                        <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center z-10">
                            <span className="text-6xl mb-4 group-hover:-translate-y-2 transition-transform duration-300">📺</span>
                            <h2 className="text-3xl font-bold mb-2 group-hover:text-green-400 transition-colors">My Series</h2>
                            <p className="text-gray-400 font-medium bg-black/50 px-4 py-1 rounded-full border border-white/10">{seriesCount} Titles</p>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
