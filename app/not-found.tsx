import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
            <p className="text-gray-400 mb-8">Could not find requested resource</p>
            <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}
