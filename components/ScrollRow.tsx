"use client";

import { useRef, useState, useEffect } from "react";

export default function ScrollRow({ children }: { children: React.ReactNode }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const checkScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeft(scrollLeft > 0);
        setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [children]);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const { clientWidth } = scrollRef.current;
        const scrollAmount = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    return (
        <div className="relative group/row">
            {/* Left Arrow */}
            {showLeft && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-0 bottom-6 z-20 w-12 bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Content */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x relative"
            >
                {children}
            </div>

            {/* Right Arrow */}
            {showRight && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-0 bottom-6 z-20 w-12 bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {/* Gradient Fade Hints (Visual polish not requested but good for "Persistent" look, optional but keeping simple based on strict requests usually implies stick to knowns. I'll remove gradients from here to avoid conflict with page gradients if any, OR keep them if I remove them from pages. The prompt said "Add Left/Right Arrow... Rules: Only ADD arrow buttons". I will stick to adding arrows. The existing pages had gradients, I should check if I need to remove them or if ScrollRow replaces the div.)
      The existing pages have: 
      <div className="relative">
         <div className="flex gap-6 overflow-x-auto..." ...>
         ...
         <div className="absolute right-0 ... bg-gradient..."></div>
      </div>
      
      I will replace that structure with <ScrollRow>...</ScrollRow> in the pages.
      */}
        </div>
    );
}
