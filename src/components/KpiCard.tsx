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
}

/**
 * Tarjeta KPI Neo-Brutalista en Bento Grid / Subgrid con inclinación 3D reactiva.
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
}) => {
  const tilt = usePerspectiveTilt<HTMLElement>({ maxTilt: 6 });

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className={`smartlab-kpi-card smartlab-tilt-card border-2 border-slate-950 p-3.5 shadow-[4px_4px_0px_#0f172a] sm:p-4 ${accentClass} ${spanClass}`}
    >
      <div className="flex items-center justify-between gap-2 text-slate-900">
        <span className="truncate font-mono text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
        <IonIcon
          icon={icon}
          aria-hidden="true"
          className={`shrink-0 text-lg ${iconColorClass}`}
        />
      </div>

      <p
        className={`self-end font-mono text-3xl font-extrabold leading-none tabular-nums sm:text-4xl ${valueColorClass}`}
      >
        {value}
      </p>

      <div className="self-end pt-1">
        {typeof progressPercent === 'number' ? (
          <div className="space-y-1">
            <div
              className="h-2.5 w-full overflow-hidden border-2 border-slate-950 bg-white"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Tasa de resolución ${progressPercent}%`}
            >
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-slate-800">
              {subtitle ?? `${progressPercent}% resuelto`}
            </p>
          </div>
        ) : (
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-700">
            {subtitle ?? 'Tiempo real'}
          </p>
        )}
      </div>
    </article>
  );
};

export default KpiCard;
