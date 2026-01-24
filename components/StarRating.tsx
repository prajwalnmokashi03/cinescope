"use client";

interface StarRatingProps {
    rating: number; // 0-5
    onChange?: (rating: number) => void;
    readOnly?: boolean;
}

export default function StarRating({ rating, onChange, readOnly = false }: StarRatingProps) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    disabled={readOnly}
                    onClick={() => onChange && onChange(star)}
                    className={`text-lg focus:outline-none transition-transform ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                        } ${star <= (rating || 0) ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}
