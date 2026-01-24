
import { NextResponse } from "next/server";
import { getRecent, getRecentMovies, getRecentTV } from "@/lib/tmdb";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';

        let results = [];
        if (type === 'movie') {
            results = await getRecentMovies();
        } else if (type === 'tv') {
            results = await getRecentTV();
        } else {
            results = await getRecent();
        }

        return NextResponse.json({ results });
    } catch (e) {
        console.error("API Error (Recent):", e);
        return NextResponse.json({ error: "Recent failed" }, { status: 500 });
    }
}
