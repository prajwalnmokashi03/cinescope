'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-400 mb-6 max-w-md">
                We encountered an unexpected error. Please try again.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors"
                >
                    Try again
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    className="border border-gray-700 hover:bg-gray-800 text-gray-300 px-6 py-2 rounded-full font-medium transition-colors"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
