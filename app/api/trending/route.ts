
import { NextResponse } from "next/server";
import { getTrending } from "@/lib/tmdb";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';

        // Validate type
        if (type !== 'all' && type !== 'movie' && type !== 'tv') {
            return NextResponse.json({ results: [] });
        }

        const results = await getTrending(type, "week");
        return NextResponse.json({ results });
    } catch (e) {
        console.error("API Error (Trending):", e);
        return NextResponse.json({ error: "Trending failed" }, { status: 500 });
    }
}
