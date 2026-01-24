'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-[#0a0a0a] text-white">
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Critical Error</h2>
                    <p className="text-gray-400 mb-6">A critical error occurred.</p>
                    <button
                        onClick={() => reset()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
