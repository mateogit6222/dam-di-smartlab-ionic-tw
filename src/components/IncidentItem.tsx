import React from 'react';
import {
  IonChip,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  chevronForwardOutline,
  trashOutline,
} from 'ionicons/icons';
import { PRIORITY_BADGE_STYLES } from '../data/initialIncidents';
import { Incident } from '../types/incident';

export interface IncidentItemProps {
  incident: Incident;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

/**
 * Fila de incidencia Neo-Brutalista adaptativa mediante CSS Container Queries.
 */
const IncidentItem: React.FC<IncidentItemProps> = ({
  incident,
  onToggleStatus,
  onDelete,
  onSelect,
}) => {
  const isResolved = incident.status === 'resuelta';

  return (
    <IonItemSliding className="border-2 border-slate-950 bg-white shadow-[4px_4px_0px_#0f172a] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5">
      <IonItem
        className="incident-item"
        button
        detail={false}
        onClick={() => onSelect(incident.id)}
      >
        <div className="incident-card-container py-3.5">
          <div className="incident-card-body">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-800">
                    {incident.id}
                  </span>
                  <span
                    className={`border-2 px-2 py-0.5 font-mono text-xs font-bold uppercase ${
                      PRIORITY_BADGE_STYLES[incident.priority]
                    }`}
                  >
                    {incident.priority}
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {incident.createdAt}
                </span>
              </div>

              <h3
                className={`mt-2 break-words text-base font-bold leading-snug ${
                  isResolved
                    ? 'text-slate-600 line-through'
                    : 'text-slate-950'
                }`}
              >
                {incident.title}
              </h3>

              <p className="mt-1 break-words text-sm text-slate-800">
                {incident.description}
              </p>

              <p className="mt-2.5 font-mono text-xs font-semibold text-slate-700">
                UBICACIÓN:{' '}
                <strong className="text-slate-950">{incident.location}</strong>
              </p>
            </div>

            <div className="incident-card-actions">
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(incident.id);
                }}
                aria-label={
                  isResolved
                    ? `Marcar incidencia ${incident.id} como pendiente`
                    : `Marcar incidencia ${incident.id} como resuelta`
                }
              >
                <IonChip
                  color={isResolved ? 'success' : 'warning'}
                  className={`m-0 h-8 font-mono text-xs font-bold uppercase ${
                    isResolved
                      ? 'smartlab-chip-resolved'
                      : 'smartlab-chip-pending'
                  }`}
                >
                  {isResolved ? 'Resuelta' : 'Pendiente'}
                </IonChip>
              </button>

              <button
                type="button"
                className="hidden min-h-[44px] min-w-[44px] items-center justify-center border-2 border-slate-950 bg-white text-slate-950 transition-colors hover:bg-red-200 hover:text-red-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 sm:inline-flex"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(incident.id);
                }}
                aria-label={`Eliminar incidencia ${incident.id}`}
              >
                <IonIcon
                  icon={trashOutline}
                  aria-hidden="true"
                  className="text-lg"
                />
              </button>

              <IonIcon
                icon={chevronForwardOutline}
                aria-hidden="true"
                className="ml-0.5 text-base text-slate-950"
              />
            </div>
          </div>
        </div>
      </IonItem>

      {/* Opciones ocultas tras deslizamiento horizontal en pantalla táctil */}
      <IonItemOptions side="end">
        <IonItemOption
          color="success"
          className="min-w-[56px]"
          onClick={() => onToggleStatus(incident.id)}
          aria-label={
            isResolved
              ? `Reabrir incidencia ${incident.id}`
              : `Resolver incidencia ${incident.id}`
          }
        >
          <IonIcon
            slot="icon-only"
            icon={checkmarkCircleOutline}
            aria-hidden="true"
          />
        </IonItemOption>
        <IonItemOption
          color="danger"
          className="min-w-[56px]"
          onClick={() => onDelete(incident.id)}
          aria-label={`Eliminar incidencia ${incident.id}`}
        >
          <IonIcon slot="icon-only" icon={trashOutline} aria-hidden="true" />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default IncidentItem;
