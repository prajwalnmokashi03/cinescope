
import { NextResponse } from 'next/server';
import { searchMulti } from '@/lib/tmdb';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    console.log(`[API] Searching for query: "${query}"`);

    try {
        const results = await searchMulti(query);
        console.log(`[API] Found ${results.length} results for "${query}"`);
        return NextResponse.json({ results });
    } catch (error) {
        console.error("[API] Search error:", error);
        return NextResponse.json({ results: [] });
    }
}
