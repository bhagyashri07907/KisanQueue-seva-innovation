import React from 'react';
import { Database } from 'lucide-react';

interface Props {
  className?: string;
  subtext?: boolean;
}

export const SyntheticDataBadge: React.FC<Props> = ({ className = '', subtext = false }) => {
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase tracking-wide border border-amber-200 shadow-2xs">
        <Database className="w-3 h-3 text-amber-700" />
        Prototype Synthetic Government Dataset
      </span>
      {subtext && (
        <span className="text-[10px] text-amber-700 mt-0.5 ml-0.5">
          Non-actual figures generated for demonstration &amp; prototype evaluation.
        </span>
      )}
    </div>
  );
};

