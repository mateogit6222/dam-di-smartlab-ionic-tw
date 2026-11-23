import React from 'react';

export interface IncidentSkeletonProps {
  count?: number;
}

/**
 * Skeleton Screen Neo-Brutalista para mantener estabilidad visual (CLS = 0) durante la sincronización.
 */
const IncidentSkeleton: React.FC<IncidentSkeletonProps> = ({ count = 3 }) => {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Sincronizando incidencias"
      className="space-y-3"
    >
      <span className="sr-only">Sincronizando incidencias...</span>
      {items.map((item) => (
        <div
          key={item}
          aria-hidden="true"
          className="border-2 border-slate-950 bg-white p-4 shadow-[4px_4px_0px_#0f172a]"
        >
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-slate-200" />
                <div className="h-5 w-14 border border-slate-300 bg-amber-100" />
              </div>
              <div className="h-4 w-12 bg-slate-200" />
            </div>
            <div className="h-5 w-3/4 bg-slate-300" />
            <div className="h-4 w-full bg-slate-200" />
            <div className="flex items-center justify-between border-t-2 border-slate-200 pt-3">
              <div className="h-4 w-36 bg-slate-200" />
              <div className="h-7 w-24 border border-slate-300 bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncidentSkeleton;
