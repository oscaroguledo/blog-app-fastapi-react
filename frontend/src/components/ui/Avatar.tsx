import React from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  if (!src) {
    return (
      <div
        className={cn(
          sizes[size],
          'rounded-full border border-border bg-muted flex items-center justify-center',
          className
        )}
      >
        <User size={iconSizes[size]} className="text-muted-text" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        sizes[size],
        'rounded-full border border-border object-cover',
        className
      )}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling?.classList.remove('hidden');
      }}
    />
  );
}
