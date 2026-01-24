"use client";

import { useEffect } from "react";

export default function KeyboardSmoothScroll() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 1. Ignore if typing in an input/textarea or if modifier keys are pressed
            const target = e.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable ||
                e.ctrlKey ||
                e.altKey ||
                e.metaKey ||
                e.shiftKey ||
                e.defaultPrevented // Respect existing handlers (like ScrollRow)
            ) {
                return;
            }

            // 2. Define scroll amount (standard step size)
            const step = 100;

            // 3. Handle Arrow Keys
            switch (e.key) {
                case "ArrowUp":
                    e.preventDefault();
                    window.scrollBy({ top: -step, behavior: "smooth" });
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    window.scrollBy({ top: step, behavior: "smooth" });
                    break;
                case "ArrowLeft":
                    // Only scroll window horizontally if strictly needed (usually 0)
                    // But we allow it in case of horizontal layouts or overflow
                    e.preventDefault();
                    window.scrollBy({ left: -step, behavior: "smooth" });
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    window.scrollBy({ left: step, behavior: "smooth" });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return null;
}
