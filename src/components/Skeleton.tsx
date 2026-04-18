import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClasses = "animate-pulse bg-gray-200";
  const variantClasses = {
    text: "h-3 w-full rounded",
    rect: "rounded-lg",
    circle: "rounded-full"
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-3xl p-5 space-y-4 border border-gray-100">
    <Skeleton className="aspect-video w-full" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-3/4 h-5" />
      <Skeleton variant="text" className="w-full h-3" />
      <Skeleton variant="text" className="w-1/2 h-3" />
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
        <Skeleton variant="circle" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/2 h-4" />
          <Skeleton variant="text" className="w-1/4 h-3" />
        </div>
        <Skeleton className="w-16 h-6" />
      </div>
    ))}
  </div>
);
