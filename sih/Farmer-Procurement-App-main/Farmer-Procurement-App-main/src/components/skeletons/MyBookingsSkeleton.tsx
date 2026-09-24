import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const MyBookingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-3.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>

          {/* Center info */}
          <Skeleton className="h-4 w-3/4" />

          {/* Date & Time pill */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>

          {/* Bottom Row */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-2">
            <Skeleton className="h-4 w-24 mt-2" />
            <Skeleton className="h-4 w-16 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
};
