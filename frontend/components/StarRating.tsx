'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number;
    onChange?: (val: number) => void;
    size?: number;
    readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 24, readonly = false }: StarRatingProps) {
    const [hover, setHover] = React.useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    className={`transition-all duration-150 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125 active:scale-95'}`}
                >
                    <Star
                        size={size}
                        className={`${star <= (hover || value)
                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                                : 'text-gray-200 dark:text-gray-700'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
}
