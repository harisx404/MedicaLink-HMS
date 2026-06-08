import React from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface RatingStarsProps {
  rating: number;
  max?: number;
  count?: number;
  className?: string;
  size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  count,
  className,
  size = 16,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={twMerge(clsx('flex items-center gap-1', className))}>
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={size}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star size={size} className="text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-[50%]">
              <Star size={size} className="fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={size}
            className="text-gray-300"
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-gray-500 ml-1">({count})</span>
      )}
    </div>
  );
};
