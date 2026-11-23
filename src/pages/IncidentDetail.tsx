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
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" text="Volver" />
          </IonButtons>
          <IonTitle className="font-semibold tracking-tight">
            {incident ? `Ficha ${incident.id}` : 'Detalle de incidencia'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {!incident ? (
            <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <h1 className="text-lg font-bold text-slate-900">
                Incidencia no encontrada
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                No existe ningún registro activo con el código{' '}
                <span className="font-mono font-semibold text-slate-800">
                  {id}
                </span>
                .
              </p>
              <div className="mt-5">
                <IonButton
                  routerLink="/home"
                  routerDirection="back"
                  className="min-h-[44px] font-semibold"
                >
                  Volver al listado
                </IonButton>
              </div>
            </section>
          ) : (
            <>
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-blue-700">
                      {incident.id}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        PRIORITY_BADGE_STYLES[incident.priority]
                      }`}
                    >
                      Prioridad {incident.priority}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                    <IonIcon icon={timeOutline} aria-hidden="true" />
                    Registrada: {incident.createdAt}
                  </span>
                </div>

                <h1 className="mt-3 break-words text-xl font-bold text-slate-900 sm:text-2xl">
                  {incident.title}
                </h1>

                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-700">
                  <IonIcon
                    icon={locationOutline}
                    aria-hidden="true"
                    className="shrink-0 text-blue-700"
                  />
                  <span>
                    Ubicación:{' '}
                    <strong className="text-slate-900">
                      {incident.location}
                    </strong>
                  </span>
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Estado actual:
                    </span>
                    <IonChip
                      color={
                        incident.status === 'resuelta' ? 'success' : 'warning'
                      }
                      className={`m-0 h-7 text-xs font-semibold ${
                        incident.status === 'resuelta'
                          ? 'smartlab-chip-resolved'
                          : 'smartlab-chip-pending'
                      }`}
                    >
                      {incident.status === 'resuelta' ? 'Resuelta' : 'Pendiente'}
                    </IonChip>
                  </div>

                  <IonButton
                    type="button"
                    fill="outline"
                    color={
                      incident.status === 'resuelta' ? 'warning' : 'success'
                    }
                    className="min-h-[44px] font-semibold"
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
                className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Descripción técnica y seguimiento
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Actualiza los síntomas, diagnóstico o pasos de resolución; los
                  cambios quedan guardados localmente.
                </p>

                <IonItem
                  lines="none"
                  className="mt-4 rounded-lg border border-slate-200"
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
                  <IonButton
                    type="submit"
                    expand="block"
                    className="min-h-[44px] w-full font-semibold sm:w-auto"
                  >
                    <IonIcon
                      slot="start"
                      icon={saveOutline}
                      aria-hidden="true"
                    />
                    Guardar descripción
                  </IonButton>
                </div>
              </form>
            </>
          )}
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
