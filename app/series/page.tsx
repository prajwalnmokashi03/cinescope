"use client";

import { useState, useEffect } from "react";
import MediaCard from "@/components/MediaCard";
import ScrollRow from "@/components/ScrollRow";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function SeriesPage() {
    const [trending, setTrending] = useState<any[]>([]);
    const [recent, setRecent] = useState<any[]>([]);
    const { watchlist, addToWatchlist } = useWatchlist();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendingRes, recentRes] = await Promise.all([
                    fetch('/api/trending?type=tv'),
                    fetch('/api/recent?type=tv')
                ]);

                const trendingData = await trendingRes.json();
                const recentData = await recentRes.json();

                setTrending(trendingData.results || []);
                setRecent(recentData.results || []);
            } catch (error) {
                console.error("Failed to load series:", error);
            }
        };
        fetchData();
    }, []);

    const handleAdd = (e: any, item: any) => {
        e.preventDefault();
        addToWatchlist({
            tmdb_id: item.id,
            title: item.name,
            media_type: 'tv',
            poster_path: item.poster_path,
            year: (item.first_air_date || '').split('-')[0]
        });
    };

    const isInWatchlist = (id: number) => watchlist.some(i => i.tmdb_id === id);

    return (
        <div className="space-y-12">
            <section>
                <h1 className="text-3xl font-bold mb-6">Trending Series</h1>
                <ScrollRow>
                    {trending.map(item => (
                        <div key={item.id} className="snap-start">
                            <MediaCard item={item} onAdd={handleAdd} isInWatchlist={isInWatchlist(item.id)} />
                        </div>
                    ))}
                </ScrollRow>
            </section>

            <section>
                <h2 className="text-3xl font-bold mb-6">Recently Aired</h2>
                <ScrollRow>
                    {recent.map(item => (
                        <div key={item.id} className="snap-start">
                            <MediaCard item={item} onAdd={handleAdd} isInWatchlist={isInWatchlist(item.id)} />
                        </div>
                    ))}
                </ScrollRow>
            </section>
        </div>
    );
}
