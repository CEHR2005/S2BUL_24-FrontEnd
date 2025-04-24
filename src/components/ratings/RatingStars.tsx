import { useState } from 'react';

interface RatingStarsProps {
  initialRating?: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

/**
 * Component for displaying and selecting star ratings
 */
export const RatingStars = ({
  initialRating = 0,
  maxRating = 5,
  size = 'md',
  readonly = false,
  onRatingChange
}: RatingStarsProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Determine star size based on the size prop
  const starSizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }[size];
  
  const handleClick = (selectedRating: number) => {
    if (readonly) return;
    
    setRating(selectedRating);
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  const handleMouseEnter = (hoveredRating: number) => {
    if (readonly) return;
    setHoverRating(hoveredRating);
  };
  
  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };
  
  // Create an array of star indexes (1-based)
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);
  
  // Determine if a star should be filled based on rating and hover state
  const isStarFilled = (starIndex: number) => {
    if (hoverRating > 0) {
      return starIndex <= hoverRating;
    }
    return starIndex <= rating;
  };

  return (
    <div className="flex items-center">
      {stars.map(starIndex => (
        <button
          key={starIndex}
          type="button"
          onClick={() => handleClick(starIndex)}
          onMouseEnter={() => handleMouseEnter(starIndex)}
          onMouseLeave={handleMouseLeave}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
          disabled={readonly}
          aria-label={`Rate ${starIndex} out of ${maxRating}`}
        >
          <svg 
            className={`${starSizeClass} ${
              isStarFilled(starIndex) ? 'text-yellow-500' : 'text-gray-300'
            } transition-colors duration-150`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};