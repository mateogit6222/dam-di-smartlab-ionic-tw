import React from 'react';
import { IonIcon } from '@ionic/react';
import { usePerspectiveTilt } from '../hooks/usePerspectiveTilt';

export interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  iconColorClass: string;
  valueColorClass: string;
  subtitle?: string;
  accentClass?: string;
  spanClass?: string;
  progressPercent?: number;
  staggerIndex?: number;
  pulseAlert?: boolean;
}

/**
 * Tarjeta KPI Verde Neo-Brutalista en Bento Grid / Subgrid con entrada escalonada y tilt 3D.
 */
const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  iconColorClass,
  valueColorClass,
  subtitle,
  accentClass = 'bg-white',
  spanClass = '',
  progressPercent,
  staggerIndex = 0,
  pulseAlert = false,
}) => {
  const tilt = usePerspectiveTilt<HTMLElement>({ maxTilt: 6 });

  const normalizedProgress =
    typeof progressPercent === 'number'
      ? Math.max(0, Math.min(100, progressPercent))
      : 0;

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      style={{ '--stagger-index': staggerIndex } as React.CSSProperties}
      className={`smartlab-kpi-card smartlab-tilt-card smartlab-card-enter border-2 border-[#052e16] p-3.5 shadow-[4px_4px_0px_#052e16] sm:p-4 ${accentClass} ${spanClass}`}
    >
      <div className="flex items-center justify-between gap-2 text-[#052e16]">
        <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider">
          {pulseAlert && (
            <span className="smartlab-pulse-indicator" aria-hidden="true">
              <span className="smartlab-pulse-ring smartlab-pulse-ring--alert" />
              <span className="smartlab-pulse-dot smartlab-pulse-dot--alert" />
            </span>
          )}
          <span className="truncate">{label}</span>
        </span>
        <IonIcon
          icon={icon}
          aria-hidden="true"
          className={`shrink-0 text-lg ${iconColorClass}`}
        />
      </div>

      <p
        key={value}
        className={`smartlab-value-pop self-end font-mono text-3xl font-extrabold leading-none tabular-nums sm:text-4xl ${valueColorClass}`}
      >
        {value}
      </p>

      <div className="self-end pt-1">
        {typeof progressPercent === 'number' ? (
          <div className="space-y-1">
            <div
              className="h-2.5 w-full overflow-hidden border-2 border-[#052e16] bg-white"
              role="progressbar"
              aria-valuenow={normalizedProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Tasa de resolución ${normalizedProgress}%`}
            >
              <div
                className="smartlab-progress-fill bg-green-500"
                style={
                  {
                    '--progress-scale': normalizedProgress / 100,
                  } as React.CSSProperties
                }
              >
                <span className="smartlab-progress-shimmer" aria-hidden="true" />
              </div>
            </div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#052e16]">
              {subtitle ?? `${normalizedProgress}% resuelto`}
            </p>
          </div>
        ) : (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-800">
            {subtitle ?? 'Tiempo real'}
          </p>
        )}
      </div>
    </article>
  );
};

export default KpiCard;
