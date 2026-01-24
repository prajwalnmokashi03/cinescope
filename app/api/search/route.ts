
import { NextResponse } from 'next/server';
import { searchMulti, discoverMedia } from '@/lib/tmdb';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const genre = searchParams.get('genre');
    const lang = searchParams.get('lang');
    const country = searchParams.get('country');

    // If query exists, search normally
    if (query) {
        console.log(`[API] Searching for query: "${query}"`);
        try {
            const results = await searchMulti(query);
            return NextResponse.json({ results });
        } catch (error) {
            return NextResponse.json({ results: [] });
        }
    }

    // If no query but filters exist, discover
    if (genre || lang || country) {
        console.log(`[API] Discovering with filters: G:${genre} L:${lang} C:${country}`);
        try {
            const results = await discoverMedia({
                genre: genre || undefined,
                lang: lang || undefined,
                country: country || undefined
            });
            return NextResponse.json({ results });
        } catch (error) {
            return NextResponse.json({ results: [] });
        }
    }

    return NextResponse.json({ error: 'Query or filters required' }, { status: 400 });
}
