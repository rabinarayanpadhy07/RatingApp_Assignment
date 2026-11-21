import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  size = 18,
  interactive = false,
  onChange,
  disabled = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div
      className={`inline-flex items-center gap-1 ${interactive ? 'cursor-pointer' : ''}`}
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(displayRating);

        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive || disabled}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && !disabled && setHoverRating(starValue)}
            className={`p-0.5 rounded transition-colors ${
              interactive && !disabled
                ? 'hover:scale-105 focus:outline-none focus:ring-1 focus:ring-gray-400'
                : 'cursor-default'
            }`}
            title={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : `${rating} out of 5 stars`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-100 text-gray-300'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
