import React from 'react';

export interface TelemetryMarqueeProps {
  total: number;
  pending: number;
  critical: number;
  resolved: number;
}

/**
 * Marquesina cinética continua con transformación GPU translate3d.
 */
const TelemetryMarquee: React.FC<TelemetryMarqueeProps> = ({
  total,
  pending,
  critical,
  resolved,
}) => {
  const segmentText = `SMARTLAB MONITOR // DAM 0488 // TOTAL: ${total} // PENDIENTES: ${pending} // CRÍTICAS: ${critical} // RESUELTAS: ${resolved} // LAYOUT 100DVH`;

  return (
    <div
      className="w-full select-none overflow-hidden border-y-2 border-slate-950 bg-slate-950 py-2 text-amber-300"
      aria-label="Cinta de telemetría operativa"
    >
      <div className="smartlab-marquee-track font-mono text-xs font-bold uppercase tracking-widest">
        <div className="flex shrink-0 items-center gap-6 pr-6">
          <span>{segmentText}</span>
          <span aria-hidden="true">//</span>
          <span aria-hidden="true">{segmentText}</span>
          <span aria-hidden="true">//</span>
        </div>
        <div className="flex shrink-0 items-center gap-6 pr-6" aria-hidden="true">
          <span>{segmentText}</span>
          <span>//</span>
          <span>{segmentText}</span>
          <span>//</span>
        </div>
      </div>
    </div>
  );
};

export default TelemetryMarquee;
