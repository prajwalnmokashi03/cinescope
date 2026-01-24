"use client";

import { useState, useEffect, useRef } from "react";
import { useWatchlist } from "@/hooks/useWatchlist";
import MediaCard from "@/components/MediaCard";
import ScrollRow from "@/components/ScrollRow";
import { useConnection } from "@/contexts/ConnectionContext";

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

export default function Home() {
  const [trending, setTrending] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<SearchResult[]>([]);
  const [trendingLoaded, setTrendingLoaded] = useState(false);
  const [recentLoaded, setRecentLoaded] = useState(false);

  const { watchlist, addToWatchlist } = useWatchlist();

  const { isConnected } = useConnection();
  const mounted = useRef(false);

  useEffect(() => {
    // Basic mount check
    if (!mounted.current) {
      mounted.current = true;
    }

    const fetchHomeContent = async () => {
      try {
        const res = await fetch('/api/trending');
        if (res.ok) {
          const data = await res.json();
          setTrending(Array.isArray(data.results) ? data.results : []);
          setTrendingLoaded(true);
        }
      } catch (e) {
        console.error("Failed to load trending:", e);
      }

      try {
        const res = await fetch('/api/recent');
        if (res.ok) {
          const data = await res.json();
          setRecent(Array.isArray(data.results) ? data.results : []);
          setRecentLoaded(true);
        }
      } catch (e) {
        console.error("Failed to load recent:", e);
      }
    };

    // Fetch if not loaded yet OR if connection just came back
    if (isConnected) {
      fetchHomeContent();
    }
  }, [isConnected]);

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

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to CineScope</h1>
        <p className="text-gray-400">Discover and track your favorite movies and TV shows.</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-yellow-500">🔥</span> Trending This Week</h2>
        {!trendingLoaded ? (
          <div className="flex gap-6 overflow-x-auto pb-6"><div className="w-[160px] h-[240px] bg-[#1c1c1c] animate-pulse rounded-xl"></div></div>
        ) : trending.length > 0 ? (
          <ScrollRow>
            {trending.map(item => (
              <div key={item.id} className="snap-start">
                <MediaCard item={item} onAdd={handleAdd} isInWatchlist={isInWatchlist(item.id)} />
              </div>
            ))}
          </ScrollRow>
        ) : <div className="text-gray-500 text-sm">Unable to load trending right now</div>}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-blue-500">🆕</span> Recently Released</h2>
        {!recentLoaded ? (
          <div className="flex gap-6 overflow-x-auto pb-6"><div className="w-[160px] h-[240px] bg-[#1c1c1c] animate-pulse rounded-xl"></div></div>
        ) : recent.length > 0 ? (
          <ScrollRow>
            {recent.map(item => (
              <div key={item.id} className="snap-start">
                <MediaCard item={item} onAdd={handleAdd} isInWatchlist={isInWatchlist(item.id)} />
              </div>
            ))}
          </ScrollRow>
        ) : <div className="text-gray-500 text-sm">Unable to load recent releases right now</div>}
      </section>
    </div>
  );
}
