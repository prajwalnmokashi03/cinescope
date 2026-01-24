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
  const { isConnected, isInitialized } = useConnection();

  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }

    const fetchHomeContent = async () => {
      // Don't fetch if not connected
      if (!isConnected) return;

      try {
        const res = await fetch('/api/trending');
        if (res.ok) {
          const data = await res.json();
          setTrending(Array.isArray(data.results) ? data.results : []);
        }
      } catch (e) {
        console.error("Failed to load trending:", e);
      } finally {
        // Always verify loaded state only if SUCCESS or intended behavior?
        // User wants auto-retry. If fail, keep loading state?
        // If we setLoaded(true) on fail, we show "Unable to load".
        // Better to retry next time isConnected toggles.
        // But for now let's set it to true if success, or if we want to show error.
        // Let's set it to true so we don't show skeleton forever if API is broken forever.
        // BUT wait, user wants "retry every...".
        // If we setLoaded(true), the skeleton disappears.
        // So only setLoaded(true) if success?
        // If fail, we leave loaded=false, so skeleton stays?
        // YES. And next retry will populate it.
        // BUT we need to setLoaded(true) eventually if it's a 404 or persistent error.
        // For connection issues, leaving it as skeleton is "Safe startup gate".
        // Let's check response status.
        // If res.ok -> Loaded(true).
      }

      // Separate try/catch to ensure independent loading
      try {
        const res = await fetch('/api/trending');
        if (res.ok) {
          const data = await res.json();
          setTrending(Array.isArray(data.results) ? data.results : []);
          setTrendingLoaded(true);
        }
      } catch (e) { console.error(e); }

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

  // Safe Startup Gate
  // If not initialized, show full screen loader?
  // User: "App should render a loading state until Antigravity responds"
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm font-medium">Checking connection...</p>
      </div>
    );
  }

  // If initialized but NOT connected, showing the main UI with Skeletons is acceptable provided we show a status?
  // Or gate it completely? 
  // User: "Then continue normally".
  // "Do NOT let the app freeze on a blank / main page" -> Skeletons are fine.
  // I will intervene just to add a Top Banner if !isConnected but Initialized?
  // Logic:
  // if (!isConnected) -> We are in retry mode.
  // The fetch logic handles the retry.

  return (
    <div className="space-y-12">
      {!isConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          Connecting to server...
        </div>
      )}

      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to CineScope</h1>
        <p className="text-gray-400">Discover and track your favorite movies and TV shows.</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><span className="text-yellow-500">🔥</span> Trending This Week</h2>
        {!trendingLoaded ? (
          <div className="flex gap-6 overflow-x-auto pb-6"><div className="w-[160px] h-[240px] bg-[#1c1c1c] animate-pulse rounded-xl flex-shrink-0"></div><div className="w-[160px] h-[240px] bg-[#1c1c1c] animate-pulse rounded-xl flex-shrink-0"></div><div className="w-[160px] h-[240px] bg-[#1c1c1c] animate-pulse rounded-xl flex-shrink-0"></div></div>
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
          <div className="flex gap-6 overflow-x-auto pb-6"><div className="w-[160px] h-[240px] bg-[#1c1c1c] animate-pulse rounded-xl flex-shrink-0"></div><div className="w-[160px] h-[240px] bg-[#1c1c1c] animate-pulse rounded-xl flex-shrink-0"></div><div className="w-[160px] h-[240px] bg-[#1c1c1c] animate-pulse rounded-xl flex-shrink-0"></div></div>
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
