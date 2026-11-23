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
 * Fila de incidencia con gestos táctiles (IonItemSliding) y acciones accesibles.
 */
const IncidentItem: React.FC<IncidentItemProps> = ({
  incident,
  onToggleStatus,
  onDelete,
  onSelect,
}) => {
  const isResolved = incident.status === 'resuelta';

  return (
    <IonItemSliding className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-150 hover:border-slate-300 hover:shadow-md">
      <IonItem
        className="incident-item"
        button
        detail={false}
        onClick={() => onSelect(incident.id)}
      >
        <div className="w-full min-w-0 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-700">
                {incident.id}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  PRIORITY_BADGE_STYLES[incident.priority]
                }`}
              >
                {incident.priority}
              </span>
            </div>
            <span className="text-xs font-medium text-slate-600">
              {incident.createdAt}
            </span>
          </div>

          <h3
            className={`mt-1.5 break-words text-base font-semibold ${
              isResolved ? 'text-slate-600 line-through' : 'text-slate-900'
            }`}
          >
            {incident.title}
          </h3>

          <p className="mt-1 break-words text-sm text-slate-700">
            {incident.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <span className="min-w-0 break-words text-xs font-medium text-slate-600">
              Ubicación:{' '}
              <strong className="text-slate-800">{incident.location}</strong>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
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
                  className={`m-0 h-7 text-xs font-semibold ${
                    isResolved ? 'smartlab-chip-resolved' : 'smartlab-chip-pending'
                  }`}
                >
                  {isResolved ? 'Resuelta' : 'Pendiente'}
                </IonChip>
              </button>

              <button
                type="button"
                className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:inline-flex"
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
                className="ml-0.5 text-base text-slate-500"
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
