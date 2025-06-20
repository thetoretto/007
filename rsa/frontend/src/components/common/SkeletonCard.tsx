import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="border shadow-card-light dark:shadow-card-dark rounded-md p-4 w-full mx-auto my-4 bg-white dark:bg-dark border-secondary/20 dark:border-secondary/40">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-primary/20 dark:bg-primary/30 h-10 w-10"></div>
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-primary/20 dark:bg-primary/30 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-primary/20 dark:bg-primary/30 rounded col-span-2"></div>
              <div className="h-2 bg-primary/20 dark:bg-primary/30 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-primary/20 dark:bg-primary/30 rounded"></div>
          </div>
        </div>
      </div>
      <div className="animate-pulse flex space-x-4 mt-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-2 bg-primary-100 dark:bg-primary-800 rounded w-3/4"></div>
          <div className="h-2 bg-primary-100 dark:bg-primary-800 rounded w-1/2"></div>
        </div>
        <div className="h-8 w-20 bg-primary-100 dark:bg-primary-800 rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonCard; 