export type WatchlistStatus = 'plan_to_watch' | 'watching' | 'completed' | 'dropped';

export interface WatchlistItem {
    tmdb_id: number;
    title: string;
    media_type: 'movie' | 'tv';
    poster_path: string | null;
    status: WatchlistStatus;
    added_at: number; // Timestamp
    rating?: number; // 1-5
    rated_at?: number; // Timestamp of when rating was last updated
    notes?: string;
    year?: string; // Optional year for display persistence
}
