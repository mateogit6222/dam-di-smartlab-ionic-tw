import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  locationOutline,
  saveOutline,
  timeOutline,
} from 'ionicons/icons';
import { useIncidents } from '../context/IncidentsContext';
import { PRIORITY_BADGE_STYLES } from '../data/initialIncidents';
import { useMagneticControl } from '../hooks/useMagneticControl';
import { usePerspectiveTilt } from '../hooks/usePerspectiveTilt';

interface IncidentRouteParams {
  id: string;
}

/**
 * Vista de detalle y edición técnica de una incidencia (/incident/:id).
 */
const IncidentDetail: React.FC = () => {
  const { id } = useParams<IncidentRouteParams>();
  const { getIncidentById, updateIncidentDescription, toggleIncidentStatus } =
    useIncidents();

  const incident = getIncidentById(id);

  const [description, setDescription] = useState<string>(
    incident?.description ?? ''
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cardTilt = usePerspectiveTilt<HTMLElement>({ maxTilt: 3 });
  const saveMagnetic = useMagneticControl<HTMLDivElement>({
    strength: 0.22,
    maxOffset: 6,
  });

  useEffect(() => {
    if (incident) {
      setDescription(incident.description);
    }
  }, [incident]);

  const handleSaveDescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) {
      return;
    }
    updateIncidentDescription(incident.id, description);
    setToastMessage(`Descripción de ${incident.id} guardada`);
  };

  const handleToggleStatus = () => {
    if (!incident) {
      return;
    }
    toggleIncidentStatus(incident.id);
    setToastMessage(`Estado de ${incident.id} actualizado`);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="smartlab-header-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Volver" />
          </IonButtons>
          <IonTitle className="font-mono text-sm font-bold uppercase tracking-wider sm:text-base">
            {incident ? `Ficha // ${incident.id}` : 'Detalle de incidencia'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="smartlab-detail-shell">
          <div className="smartlab-grain-layer" aria-hidden="true" />

          <div className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
            {!incident ? (
              <section className="border-2 border-slate-950 bg-white p-6 text-center shadow-[6px_6px_0px_#0f172a]">
                <h1 className="text-xl font-bold text-slate-950">
                  Incidencia no encontrada
                </h1>
                <p className="mt-2 text-sm text-slate-700">
                  No existe ningún registro activo con el código{' '}
                  <span className="font-mono font-bold text-slate-950">
                    {id}
                  </span>
                  .
                </p>
                <div className="mt-5">
                  <IonButton
                    routerLink="/home"
                    routerDirection="back"
                    className="min-h-[44px] border-2 border-slate-950 font-mono text-xs font-bold uppercase shadow-[4px_4px_0px_#0f172a]"
                  >
                    Volver al listado
                  </IonButton>
                </div>
              </section>
            ) : (
              <>
                <article
                  ref={cardTilt.ref}
                  onPointerMove={cardTilt.onPointerMove}
                  onPointerLeave={cardTilt.onPointerLeave}
                  className="smartlab-tilt-card relative overflow-hidden border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0px_#0f172a] sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-blue-800">
                        {incident.id}
                      </span>
                      <span
                        className={`border-2 px-2.5 py-0.5 font-mono text-xs font-bold uppercase ${
                          PRIORITY_BADGE_STYLES[incident.priority]
                        }`}
                      >
                        Prioridad {incident.priority}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700">
                      <IonIcon icon={timeOutline} aria-hidden="true" />
                      Registrada: {incident.createdAt}
                    </span>
                  </div>

                  <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {incident.title}
                  </h1>

                  <p className="mt-2.5 flex items-center gap-1.5 text-sm text-slate-800">
                    <IonIcon
                      icon={locationOutline}
                      aria-hidden="true"
                      className="shrink-0 text-blue-800"
                    />
                    <span>
                      Ubicación:{' '}
                      <strong className="text-slate-950">
                        {incident.location}
                      </strong>
                    </span>
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-slate-950 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700">
                        Estado actual:
                      </span>
                      <IonChip
                        color={
                          incident.status === 'resuelta' ? 'success' : 'warning'
                        }
                        className={`m-0 h-8 font-mono text-xs font-bold uppercase ${
                          incident.status === 'resuelta'
                            ? 'smartlab-chip-resolved'
                            : 'smartlab-chip-pending'
                        }`}
                      >
                        {incident.status === 'resuelta'
                          ? 'Resuelta'
                          : 'Pendiente'}
                      </IonChip>
                    </div>

                    <IonButton
                      type="button"
                      fill="outline"
                      color={
                        incident.status === 'resuelta' ? 'warning' : 'success'
                      }
                      className="min-h-[44px] border-2 border-slate-950 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_#0f172a]"
                      onClick={handleToggleStatus}
                    >
                      <IonIcon
                        slot="start"
                        icon={checkmarkCircleOutline}
                        aria-hidden="true"
                      />
                      {incident.status === 'resuelta'
                        ? 'Reabrir incidencia'
                        : 'Marcar como resuelta'}
                    </IonButton>
                  </div>
                </article>

                <form
                  onSubmit={handleSaveDescription}
                  className="mt-6 border-2 border-slate-950 bg-white p-5 shadow-[6px_6px_0px_#0f172a] sm:p-6"
                >
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800">
                    Descripción técnica y seguimiento
                  </h2>
                  <p className="mt-1 text-sm text-slate-700">
                    Actualiza los síntomas, diagnóstico o pasos de resolución;
                    los cambios quedan guardados localmente.
                  </p>

                  <IonItem
                    lines="none"
                    className="mt-4 border-2 border-slate-950 bg-white"
                  >
                    <IonTextarea
                      label="Detalle técnico"
                      labelPlacement="stacked"
                      rows={5}
                      placeholder="Describe el diagnóstico o intervención realizada..."
                      value={description}
                      onIonInput={(e) => setDescription(e.detail.value ?? '')}
                    />
                  </IonItem>

                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <div
                      ref={saveMagnetic.ref}
                      onPointerMove={saveMagnetic.onPointerMove}
                      onPointerLeave={saveMagnetic.onPointerLeave}
                      className="w-full sm:w-auto"
                    >
                      <IonButton
                        type="submit"
                        expand="block"
                        className="min-h-[44px] w-full border-2 border-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_#0f172a] sm:w-auto"
                      >
                        <IonIcon
                          slot="start"
                          icon={saveOutline}
                          aria-hidden="true"
                        />
                        Guardar descripción
                      </IonButton>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          <footer className="relative z-10 mt-auto border-t-2 border-slate-950 bg-slate-950 px-4 py-3 font-mono text-xs font-semibold text-amber-300 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2">
              <span>SMARTLAB MONITOR // FICHA TÉCNICA</span>
              <span>100DVH // PERSISTENCIA LOCAL</span>
            </div>
          </footer>
        </div>

        <IonToast
          isOpen={toastMessage !== null}
          message={toastMessage ?? ''}
          duration={2200}
          position="bottom"
          onDidDismiss={() => setToastMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default IncidentDetail;
