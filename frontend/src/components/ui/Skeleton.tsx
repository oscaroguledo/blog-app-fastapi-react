import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circle' | 'text' | 'rect';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = '', 
  variant = 'default',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted/50 rounded';
  
  const variantClasses = {
    default: 'rounded',
    circle: 'rounded-full',
    text: 'rounded h-4',
    rect: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}
