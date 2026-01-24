
import { NextResponse } from 'next/server';
import { searchMulti } from '@/lib/tmdb';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const results = await searchMulti(query);
    return NextResponse.json(results);
}
