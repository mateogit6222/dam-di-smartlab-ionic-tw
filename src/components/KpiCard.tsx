import React from 'react';
import { IonIcon } from '@ionic/react';

export interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
  iconColorClass: string;
  valueColorClass: string;
}

/**
 * Tarjeta KPI reutilizable y accesible para el panel resumen de métricas.
 */
const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  iconColorClass,
  valueColorClass,
}) => (
  <article className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-150 hover:border-blue-300 hover:shadow-md sm:p-4">
    <div className="flex items-center justify-between gap-2 text-slate-600">
      <span className="truncate text-xs font-semibold">{label}</span>
      <IonIcon
        icon={icon}
        aria-hidden="true"
        className={`shrink-0 text-lg ${iconColorClass}`}
      />
    </div>
    <p
      className={`mt-2 text-2xl font-bold tabular-nums sm:text-3xl ${valueColorClass}`}
    >
      {value}
    </p>
  </article>
);

export default KpiCard;
