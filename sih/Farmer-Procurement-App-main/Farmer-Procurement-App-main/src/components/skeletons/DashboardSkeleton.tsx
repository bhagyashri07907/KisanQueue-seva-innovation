import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Upcoming Booking Skeleton */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Market Prices Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
