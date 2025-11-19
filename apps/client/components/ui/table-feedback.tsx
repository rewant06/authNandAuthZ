"use client";

export const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Table Header Skeleton */}
      <div className="rounded-t-lg bg-gray-200 dark:bg-gray-700">
        <div className="h-12 w-full"></div>
      </div>

      {/* Table Body Skeleton */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white dark:bg-gray-800">
            <div className="flex h-full items-center space-x-4 px-6">
              <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-6 w-1/6 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex h-16 items-center justify-between rounded-b-lg bg-white p-4 dark:bg-gray-900">
        <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex space-x-2">
          <div className="h-9 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-9 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
};

// A clear, user-friendly error message
export const TableError = ({ message }: { message: string }) => {
  return (
    <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 text-center dark:border-red-700 dark:bg-red-900/20">
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
        Failed to load data
      </h3>
      <p className="mt-2 text-red-600 dark:text-red-300">{message}</p>
    </div>
  );
};
