const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// Debug log as requested
console.log("TMDB KEY LOADED:", !!process.env.TMDB_API_KEY);

if (!API_KEY) {
  throw new Error("TMDB_API_KEY is missing in .env.local");
}

type MediaType = 'movie' | 'tv';

async function fetchTMDB(endpoint: string) {
  // Construct URL with API Key
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${API_KEY}`;

  // Use no-store as requested
  const res = await fetch(url, { cache: 'no-store' });

  // Error handling
  if (!res.ok) {
    const text = await res.text();
    console.error("TMDB API Error:", res.status, text);
    throw new Error("TMDB API request failed");
  }

  return res.json();
}

export const searchMulti = async (query: string) => {
  if (!query) return [];
  try {
    const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`);
    return data.results || [];
  } catch (error) {
    console.error('Error in searchMulti:', error);
    return [];
  }
};

export const searchMovies = searchMulti;

export const getDetails = async (id: number, mediaType: MediaType) => {
  try {
    const data = await fetchTMDB(`/${mediaType}/${id}?language=en-US`);
    return data;
  } catch (error) {
    console.error(`Error in getDetails (${mediaType}/${id}):`, error);
    return null;
  }
};

export async function getTrending(
  type: 'all' | 'movie' | 'tv' = "all",
  timeWindow: "day" | "week" = "week"
) {
  try {
    const data = await fetchTMDB(`/trending/${type}/${timeWindow}?language=en-US`);
    return (data.results || []).map((item: any) => ({
      ...item,
      media_type: type === 'all' ? item.media_type : type
    }));
  } catch (error) {
    console.error(`Error in getTrending (${type}):`, error);
    return [];
  }
}

export async function getRecentMovies() {
  try {
    const data = await fetchTMDB(`/movie/now_playing?language=en-US&page=1`);
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
  } catch (error) {
    console.error('Error in getRecentMovies:', error);
    return [];
  }
}

export async function getRecentTV() {
  try {
    const data = await fetchTMDB(`/tv/on_the_air?language=en-US&page=1`);
    return (data.results || []).map((item: any) => ({ ...item, media_type: 'tv' }));
  } catch (error) {
    console.error('Error in getRecentTV:', error);
    return [];
  }
}

// Helper for Home Page (Mixed Recent)
export async function getRecent() {
  try {
    const [movies, tv] = await Promise.all([getRecentMovies(), getRecentTV()]);

    // Combine and sort by date (newest first)
    const combined = [...movies, ...tv].sort((a: any, b: any) => {
      const dateA = new Date(a.release_date || a.first_air_date || 0);
      const dateB = new Date(b.release_date || b.first_air_date || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return combined.slice(0, 20);
  } catch (error) {
    console.error('Error in getRecent (mixed):', error);
    return [];
  }
}
