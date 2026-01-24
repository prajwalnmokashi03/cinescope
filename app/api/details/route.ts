
import { NextResponse } from "next/server";
import { getDetails } from "@/lib/tmdb";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = Number(searchParams.get('id'));
        const type = (searchParams.get('type') as 'movie' | 'tv') || 'movie';

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const data = await getDetails(id, type);

        if (!data) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (e) {
        console.error("API Error (Details):", e);
        return NextResponse.json({ error: "Details failed" }, { status: 500 });
    }
}
