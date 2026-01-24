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

    // Handle smooth horiztonal scrolling with wheel
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY === 0) return;
            // Prevent standard vertical scroll if we are scrolling horizontally
            e.preventDefault();
            el.scrollBy({
                left: e.deltaY,
                behavior: 'smooth'
            });
        };

        // Use passive: false to allow preventDefault
        el.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            el.removeEventListener("wheel", handleWheel);
        };
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const { clientWidth } = scrollRef.current;
        const scrollAmount = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };

    // Keyboard navigation (Arrow keys) when focused or global if strictly requested
    // "Enable smooth horizontal scrolling using... Arrow keys"
    // To be safe and not hijack page navigation, we'll attach to the container ref but ensure it's focusable
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            scroll("left");
        } else if (e.key === "ArrowRight") {
            scroll("right");
        }
    };

    return (
        <div className="relative group/row">
            {/* Left Arrow */}
            {showLeft && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute -left-12 md:-left-16 top-0 bottom-6 z-50 w-12 hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 translate-x-4 group-hover/row:translate-x-0 transition-all duration-300 ease-out"
                    aria-label="Scroll Left"
                >
                    <div className="bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded-full border border-white/10 shadow-xl transition-colors">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                </button>
            )}

            {/* Content */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x relative outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl"
            >
                {children}
            </div>

            {/* Right Arrow */}
            {showRight && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute -right-12 md:-right-16 top-0 bottom-6 z-50 w-12 hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 -translate-x-4 group-hover/row:translate-x-0 transition-all duration-300 ease-out"
                    aria-label="Scroll Right"
                >
                    <div className="bg-black/50 hover:bg-black/80 backdrop-blur-sm p-2 rounded-full border border-white/10 shadow-xl transition-colors">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
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
