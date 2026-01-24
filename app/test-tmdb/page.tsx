"use client";

import { useState } from 'react';
import { searchMulti } from '@/lib/tmdb';

export default function TestTmdbPage() {
    const [query, setQuery] = useState('Inception');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            // In a real app we'd call an API route that uses lib/tmdb.ts
            // But for this test/demo, we cannot call lib/tmdb.ts (Server side code) directly from Client Component
            // So we need to create a server action or API route.
            // Re-reading the plan: I missed this detail. lib/tmdb.ts runs on server.
            // I will implement a server action here directly for simplicity or move logic to a Server Component.
            // Let's use a simple Server Action in this file if possible, or create a separate action file.
            // Actually, to keep it simple and strictly follow "create lib/tmdb.ts", I should probably make this a Server Component that fetches data based on query params 
            // OR creating a route handler. 
            // Start simple: Client component calling a Server Action.

            const res = await fetch('/api/test-tmdb?query=' + encodeURIComponent(query));
            const data = await res.json();
            setResults(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">TMDb API Test</h1>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border p-2 rounded text-black"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px] text-xs text-black">
                {JSON.stringify(results, null, 2)}
            </pre>
        </div>
    );
}
