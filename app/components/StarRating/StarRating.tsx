"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
    rating: number; // Average rating (0-5)
    totalRatings?: number; // Total number of ratings
    size?: "sm" | "md" | "lg" | "xl";
    showCount?: boolean;
    className?: string;
    readOnly?: boolean;
    onChange?: (rating: number) => void;
}

export default function StarRating({
    rating = 0,
    totalRatings = 0,
    size = "sm",
    showCount = true,
    className = "",
    readOnly = true,
    onChange,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    // Size configurations
    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
        xl: "w-8 h-8",
    };

    const textSizeClasses = {
        sm: "text-[10px]",
        md: "text-xs",
        lg: "text-sm",
        xl: "text-lg",
    };

    const starSize = sizeClasses[size];
    const textSize = textSizeClasses[size];

    // Helper to determine star display state (full/half/empty) at index i
    const getStarState = (index: number) => {
        // If not readOnly and hovering, show hover state
        if (!readOnly && hoverRating > 0) {
            return index < hoverRating ? "full" : "empty";
        }

        // Default display logic
        if (rating >= index + 1) return "full";
        if (rating >= index + 0.5) return "half";
        return "empty";
    };

    const handleMouseEnter = (index: number) => {
        if (!readOnly) setHoverRating(index + 1);
    };

    const handleMouseLeave = () => {
        if (!readOnly) setHoverRating(0);
    };

    const handleClick = (index: number) => {
        if (!readOnly && onChange) {
            onChange(index + 1);
        }
    };

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            {/* Stars */}
            <div
                className="flex items-center gap-0.5"
                onMouseLeave={handleMouseLeave}
            >
                {[0, 1, 2, 3, 4].map((index) => {
                    const state = getStarState(index);
                    const isInteractive = !readOnly;
                    const wrapperClass = isInteractive
                        ? "cursor-pointer transition-transform hover:scale-110 active:scale-95 duration-200"
                        : "";

                    // Render Half Star
                    if (state === "half") {
                        return (
                            <div
                                key={index}
                                className={`relative ${wrapperClass}`}
                                onMouseEnter={() => handleMouseEnter(index)}
                                onClick={() => handleClick(index)}
                            >
                                <Star className={`${starSize} text-gray-300`} />
                                <div className="absolute inset-0 overflow-hidden w-1/2">
                                    <Star className={`${starSize} fill-[#D4AF37] text-[#D4AF37]`} />
                                </div>
                            </div>
                        );
                    }

                    // Render Full or Empty Star
                    return (
                        <Star
                            key={index}
                            className={`${starSize} ${state === "full"
                                    ? "fill-[#D4AF37] text-[#D4AF37]"
                                    : "text-gray-300"
                                } ${wrapperClass}`}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onClick={() => handleClick(index)}
                        />
                    );
                })}
            </div>

            {/* Rating Number */}
            {readOnly && rating > 0 && (
                <span className={`${textSize} font-semibold text-gray-700`}>
                    {rating.toFixed(1)}
                </span>
            )}

            {/* Count */}
            {readOnly && showCount && totalRatings > 0 && (
                <span className={`${textSize} text-gray-400 font-medium`}>
                    ({totalRatings})
                </span>
            )}

            {/* No ratings message */}
            {readOnly && rating === 0 && totalRatings === 0 && (
                <span className={`${textSize} text-gray-400 font-medium`}>
                    No ratings yet
                </span>
            )}
        </div>
    );
}
