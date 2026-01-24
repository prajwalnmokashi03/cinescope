"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useWatchlist } from "@/hooks/useWatchlist";
import StarRating from "@/components/StarRating";

export default function DetailsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = Number(params.id);
    const type = (searchParams.get('type') as 'movie' | 'tv') || 'movie';

    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { watchlist, addToWatchlist, updateRating } = useWatchlist();

    useEffect(() => {
        if (!id) return;
        const loadDetails = async () => {
            try {
                const res = await fetch(`/api/details?id=${id}&type=${type}`);
                if (res.ok) {
                    const data = await res.json();
                    setItem(data);
                } else {
                    console.error("Details fetch failed");
                }
            } catch (error) {
                console.error("Details fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDetails();
    }, [id, type]);

    if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
    if (!item) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Item not found</div>;

    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').split('-')[0];
    const imageUrl = item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : null;
    const genres = item.genres?.map((g: any) => g.name).join(', ');
    const runtime = item.runtime ? `${item.runtime} min` : item.episode_run_time?.[0] ? `${item.episode_run_time[0]} min` : null;

    const watchlistItem = watchlist.find(i => i.tmdb_id === id);
    const isInWatchlist = !!watchlistItem;

    const handleAdd = () => {
        addToWatchlist({
            tmdb_id: id,
            title,
            media_type: type,
            poster_path: item.poster_path,
            year
        });
    };

    const handleRate = (rating: number) => {
        if (isInWatchlist) {
            updateRating(id, rating);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="relative h-[50vh] w-full">
                {item.backdrop_path && (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                        alt="Backdrop"
                        fill
                        className="object-cover opacity-30"
                        unoptimized
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-8 max-w-7xl mx-auto w-full flex gap-8 items-end">
                    {imageUrl && (
                        <div className="relative w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-gray-800 hidden md:block">
                            <Image src={imageUrl} alt={title} fill className="object-cover" unoptimized />
                        </div>
                    )}
                    <div className="mb-4">
                        <h1 className="text-4xl md:text-6xl font-bold mb-2">{title} <span className="text-gray-500 font-normal text-3xl">({year})</span></h1>
                        <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
                            <span className="uppercase border border-gray-600 px-2 py-0.5 rounded">{type}</span>
                            {runtime && <span>{runtime}</span>}
                            {genres && <span>{genres}</span>}
                            {item.vote_average > 0 && <span className="text-yellow-400">★ {item.vote_average.toFixed(1)}</span>}
                        </div>

                        <div className="flex items-center gap-6">
                            {!isInWatchlist ? (
                                <button
                                    onClick={handleAdd}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    + Add to Watchlist
                                </button>
                            ) : (
                                <button disabled className="bg-green-600/20 text-green-400 border border-green-600/50 px-8 py-3 rounded-full font-bold cursor-default">
                                    ✓ In Watchlist
                                </button>
                            )}

                            {/* Rating UI */}
                            <div className={`flex flex-col gap-1 ${!isInWatchlist ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Rating</h3>
                                <StarRating
                                    rating={watchlistItem?.rating || 0}
                                    onChange={handleRate}
                                    readOnly={!isInWatchlist}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-8 py-12">
                {/* Mobile Poster */}
                {imageUrl && (
                    <div className="relative w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-gray-800 md:hidden mb-8">
                        <Image src={imageUrl} alt={title} fill className="object-cover" unoptimized />
                    </div>
                )}

                <h2 className="text-2xl font-bold mb-4">Overview</h2>
                <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">{item.overview}</p>

                <div className="mt-12">
                    <Link href="/" className="text-gray-500 hover:text-white transition-colors">← Back to Home</Link>
                </div>
            </main>
        </div>
    );
}
