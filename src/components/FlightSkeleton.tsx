import React from 'react';

export const FlightSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 p-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-3"></div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-center flex-1">
                <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-1"></div>
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
              </div>
              <div className="flex-1 text-center px-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
              </div>
              <div className="text-center flex-1">
                <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-1"></div>
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
              </div>
            </div>

            <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightSkeleton;