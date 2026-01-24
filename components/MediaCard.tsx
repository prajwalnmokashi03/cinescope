"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface MediaCardProps {
    item: any;
    onAdd: (e: any, item: any) => void;
    isInWatchlist: boolean;
}

export default function MediaCard({ item, onAdd, isInWatchlist }: MediaCardProps) {
    const title = item.title || item.name || "Unknown";
    const imageUrl = item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";
    const year = (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'NR';
    const type = item.media_type || 'movie';

    return (
        <div className="group flex flex-col gap-2 min-w-[160px] w-[160px] md:min-w-[180px] md:w-[180px]">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1c1c1c] border border-gray-800 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                />

                {/* Type Badge */}
                <div className="absolute top-2 left-2 flex gap-1 z-10">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shadow-sm ${type === 'movie' ? 'bg-blue-600/90 text-white' : 'bg-green-600/90 text-white'
                        }`}>
                        {type}
                    </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs z-10">
                    <span className="text-yellow-400">★</span>
                    <span className="font-semibold text-white">{rating}</span>
                </div>

                {/* Hover Overlay with Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">

                    {/* Add to Watchlist Button */}
                    {!isInWatchlist ? (
                        <button
                            onClick={(e) => onAdd(e, item)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full font-bold text-xs transition-transform transform translate-y-4 group-hover:translate-y-0 duration-300"
                        >
                            <span>+ Watchlist</span>
                        </button>
                    ) : (
                        <div className="w-full flex items-center justify-center gap-2 bg-green-600/90 text-white py-2 rounded-full font-bold text-xs cursor-default transform translate-y-4 group-hover:translate-y-0 duration-300">
                            <span>✓ Added</span>
                        </div>
                    )}

                    {/* More Details Button */}
                    <Link
                        href={`/details/${item.id}?type=${type}`}
                        className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/20 py-2 rounded-full font-bold text-xs backdrop-blur-md transition-transform transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                    >
                        <span>ℹ Details</span>
                    </Link>

                </div>
            </div>

            <div>
                <h3 className="font-bold text-white text-base leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors" title={title}>{title}</h3>
                <p className="text-gray-500 text-xs mt-1">{year}</p>
            </div>
        </div>
    );
}
