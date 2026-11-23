import React from 'react';

export interface IncidentSkeletonProps {
  count?: number;
}

/**
 * Skeleton Screen Verde Neo-Brutalista para mantener estabilidad visual (CLS = 0) durante la sincronización.
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
          className="border-2 border-[#052e16] bg-white p-4 shadow-[4px_4px_0px_#052e16]"
        >
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-emerald-100" />
                <div className="h-5 w-14 border border-[#052e16]/30 bg-green-200/70" />
              </div>
              <div className="h-4 w-12 bg-emerald-100" />
            </div>
            <div className="h-5 w-3/4 bg-green-200/70" />
            <div className="h-4 w-full bg-emerald-100" />
            <div className="flex items-center justify-between border-t-2 border-green-200 pt-3">
              <div className="h-4 w-36 bg-emerald-100" />
              <div className="h-7 w-24 border border-[#052e16]/30 bg-green-200/70" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncidentSkeleton;
