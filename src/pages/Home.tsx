import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
  RefresherEventDetail,
} from '@ionic/react';
import {
  addOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  closeOutline,
  layersOutline,
  refreshOutline,
  timeOutline,
} from 'ionicons/icons';
import IncidentItem from '../components/IncidentItem';
import IncidentSkeleton from '../components/IncidentSkeleton';
import KpiCard from '../components/KpiCard';
import TelemetryMarquee from '../components/TelemetryMarquee';
import { useIncidents } from '../context/IncidentsContext';
import { useMagneticControl } from '../hooks/useMagneticControl';
import { FilterOption, IncidentPriority } from '../types/incident';

const Home: React.FC = () => {
  const history = useHistory();
  const { incidents, addIncident, toggleIncidentStatus, deleteIncident } =
    useIncidents();

  // Estado UI de búsqueda, filtros, sincronización skeleton, modal y feedback
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('todas');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado controlado del formulario modal
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<IncidentPriority>('media');

  // Referencia a IonList y temporizador de sincronización
  const listRef = useRef<HTMLIonListElement | null>(null);
  const syncTimerRef = useRef<number | null>(null);

  // Controles magnéticos restringidos a ratón (Sección 5.1)
  const createBtnMagnetic = useMagneticControl<HTMLButtonElement>({
    strength: 0.25,
    maxOffset: 8,
  });
  const syncBtnMagnetic = useMagneticControl<HTMLButtonElement>({
    strength: 0.25,
    maxOffset: 8,
  });
  const fabMagnetic = useMagneticControl<HTMLDivElement>({
    strength: 0.28,
    maxOffset: 10,
  });

  useEffect(() => {
    return () => {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  // Cálculo memoizado de indicadores KPI (CE 3.e)
  const metrics = useMemo(() => {
    const total = incidents.length;
    const pending = incidents.filter(
      (item) => item.status === 'pendiente'
    ).length;
    const resolved = incidents.filter(
      (item) => item.status === 'resuelta'
    ).length;
    const critical = incidents.filter(
      (item) => item.status === 'pendiente' && item.priority === 'alta'
    ).length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, pending, resolved, critical, resolutionRate };
  }, [incidents]);

  // Filtrado combinado por estado y búsqueda textual
  const filteredIncidents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return incidents.filter((item) => {
      const matchesStatus =
        activeFilter === 'todas' || item.status === activeFilter;
      const matchesQuery =
        normalizedQuery === '' ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.location.toLowerCase().includes(normalizedQuery) ||
        item.id.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [incidents, activeFilter, searchQuery]);

  // Sincronización con Skeleton Screen (Sección 5.4)
  const runSyncCycle = (onFinish?: () => void) => {
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
    }
    setIsSyncing(true);
    syncTimerRef.current = window.setTimeout(() => {
      setIsSyncing(false);
      setToastMessage('Estado sincronizado con almacenamiento local');
      onFinish?.();
    }, 650);
  };

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    runSyncCycle(() => {
      event.detail.complete();
    });
  };

  const handleTriggerSync = () => {
    if (isSyncing) {
      return;
    }
    runSyncCycle();
  };

  // Alternar estado pendiente / resuelta
  const handleToggleStatus = async (id: string) => {
    toggleIncidentStatus(id);
    await listRef.current?.closeSlidingItems();
    setToastMessage('Estado de incidencia actualizado');
  };

  // Eliminación de elemento
  const handleDeleteIncident = async (id: string) => {
    deleteIncident(id);
    await listRef.current?.closeSlidingItems();
    setToastMessage(`Incidencia ${id} eliminada`);
  };

  // Navegación a ficha técnica de detalle
  const handleSelectIncident = (id: string) => {
    history.push(`/incident/${id}`);
  };

  // Creación de nueva incidencia desde IonModal
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setToastMessage('El título y la ubicación son obligatorios');
      return;
    }

    const newIncident = addIncident({
      title,
      location,
      description,
      priority,
    });

    setTitle('');
    setLocation('');
    setDescription('');
    setPriority('media');
    setIsModalOpen(false);
    setToastMessage(`Incidencia ${newIncident.id} registrada`);
  };

  return (
    <IonPage>
      {/* Cabecera móvil/desktop Neo-Brutalista */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="smartlab-header-toolbar">
          <IonTitle className="font-mono text-sm font-bold uppercase tracking-wider sm:text-base">
            SmartLab Monitor // 0488
          </IonTitle>
          <IonButtons slot="end">
            <div className="mr-3 flex items-center gap-2">
              <span className="hidden font-mono text-xs font-bold uppercase text-amber-300 sm:inline">
                Pendientes:
              </span>
              <IonBadge className="border-2 border-slate-950 bg-amber-300 px-2.5 py-1 font-mono text-xs font-extrabold text-slate-950">
                {metrics.pending}
              </IonBadge>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* Control táctil Pull-to-Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Desliza para actualizar"
            refreshingSpinner="crescent"
            refreshingText="Sincronizando..."
          />
        </IonRefresher>

        {/* Shell de altura dinámica 100dvh + textura procedural SVG grain */}
        <div className="smartlab-viewport-shell">
          <div className="smartlab-grain-layer" aria-hidden="true" />

          {/* Hero Neo-Brutalista con tipografía fluida y Split-Text Reveal */}
          <section
            aria-label="Cabecera operativa"
            className="smartlab-hero-stage relative z-10 border-b-2 border-slate-950 bg-[#fffdf7] px-4 py-5 sm:px-6 lg:py-6"
          >
            <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div className="min-w-0">
                <p className="inline-block border-2 border-slate-950 bg-amber-300 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-950 shadow-[2px_2px_0px_#0f172a]">
                  MÓDULO 0488 // 2.º DAM NEBRIJA
                </p>

                <h1 className="smartlab-display-title mt-3">
                  <span className="smartlab-reveal-mask">
                    <span className="smartlab-reveal-line">SMARTLAB</span>
                  </span>
                  <span className="smartlab-reveal-mask">
                    <span className="smartlab-reveal-line smartlab-reveal-line--delay">
                      MONITOR
                    </span>
                  </span>
                </h1>

                <p className="mt-2.5 max-w-xl text-sm font-medium text-slate-800">
                  Control operativo de incidencias en aulas y laboratorios con
                  persistencia local, tarjetas adaptativas y telemetría en vivo.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 lg:items-end">
                <span
                  aria-hidden="true"
                  className="smartlab-outlined-text hidden text-4xl font-extrabold leading-none xl:text-5xl lg:block"
                >
                  0488 // DAM
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    ref={createBtnMagnetic.ref}
                    onPointerMove={createBtnMagnetic.onPointerMove}
                    onPointerLeave={createBtnMagnetic.onPointerLeave}
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex min-h-[44px] items-center gap-2 border-2 border-slate-950 bg-amber-300 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[4px_4px_0px_#0f172a] transition-colors hover:bg-amber-400 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <IonIcon icon={addOutline} aria-hidden="true" />
                    Nueva incidencia
                  </button>

                  <button
                    type="button"
                    ref={syncBtnMagnetic.ref}
                    onPointerMove={syncBtnMagnetic.onPointerMove}
                    onPointerLeave={syncBtnMagnetic.onPointerLeave}
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="inline-flex min-h-[44px] items-center gap-2 border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[4px_4px_0px_#0f172a] transition-colors hover:bg-slate-100 disabled:opacity-60"
                  >
                    <IonIcon icon={refreshOutline} aria-hidden="true" />
                    Sincronizar
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Marquesina cinética continua (Sección 2.4) */}
          <TelemetryMarquee
            total={metrics.total}
            pending={metrics.pending}
            critical={metrics.critical}
            resolved={metrics.resolved}
          />

          {/* Contenedor principal centrado */}
          <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 sm:px-6">
            {/* Bloque 1: Bento Grid + CSS Subgrid (Secciones 1.2 y 1.4) */}
            <section aria-label="Resumen de métricas" className="mb-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800">
                  Estado Operativo del Centro
                </h2>
                <span className="font-mono text-[11px] font-semibold uppercase text-slate-700">
                  Bento Subgrid // 3D Tilt
                </span>
              </div>

              <div className="smartlab-bento-grid pb-1 pr-1">
                <KpiCard
                  label="Total"
                  value={metrics.total}
                  icon={layersOutline}
                  iconColorClass="text-blue-800"
                  valueColorClass="text-slate-950"
                  accentClass="bg-amber-50"
                  spanClass="lg:col-span-4"
                  progressPercent={metrics.resolutionRate}
                  subtitle={`${metrics.resolutionRate}% resuelto`}
                />
                <KpiCard
                  label="Pendientes"
                  value={metrics.pending}
                  icon={timeOutline}
                  iconColorClass="text-amber-700"
                  valueColorClass="text-amber-800"
                  spanClass="lg:col-span-3"
                  subtitle="Cola activa"
                />
                <KpiCard
                  label="Críticas"
                  value={metrics.critical}
                  icon={alertCircleOutline}
                  iconColorClass="text-red-800"
                  valueColorClass="text-red-800"
                  accentClass="bg-red-50"
                  spanClass="lg:col-span-3"
                  subtitle="Prioridad alta"
                />
                <KpiCard
                  label="Resueltas"
                  value={metrics.resolved}
                  icon={checkmarkCircleOutline}
                  iconColorClass="text-emerald-800"
                  valueColorClass="text-emerald-800"
                  accentClass="bg-emerald-50"
                  spanClass="lg:col-span-2"
                  subtitle="Cerradas"
                />
              </div>
            </section>

            {/* Bloque 2: Barra de búsqueda y filtro segmentado */}
            <section
              aria-label="Filtros de búsqueda"
              className="mb-5 grid grid-cols-1 gap-3 pb-1 pr-1 lg:grid-cols-12 lg:items-center"
            >
              <IonSearchbar
                value={searchQuery}
                onIonInput={(e) => setSearchQuery(e.detail.value ?? '')}
                placeholder="Buscar por código, título o aula..."
                debounce={200}
                className="smartlab-searchbar lg:col-span-6"
                aria-label="Buscar incidencias"
              />

              <IonSegment
                value={activeFilter}
                className="smartlab-segment lg:col-span-6"
                onIonChange={(e) =>
                  setActiveFilter((e.detail.value as FilterOption) ?? 'todas')
                }
              >
                <IonSegmentButton value="todas">
                  <IonLabel>Todas ({metrics.total})</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="pendiente">
                  <IonLabel>Pendientes ({metrics.pending})</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="resuelta">
                  <IonLabel>Resueltas ({metrics.resolved})</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </section>

            {/* Bloque 3: Listado adaptativo con @container y Skeleton Screen */}
            <section aria-label="Listado de incidencias">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-1">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800">
                  Incidencias Registradas ({filteredIncidents.length})
                </h2>
                <span className="font-mono text-xs text-slate-700 sm:hidden">
                  Desliza para acciones
                </span>
                <span className="hidden font-mono text-xs text-slate-700 sm:inline">
                  Pulsa para ver detalle o desliza para acciones
                </span>
              </div>

              {isSyncing ? (
                <IncidentSkeleton count={3} />
              ) : filteredIncidents.length === 0 ? (
                <div className="border-2 border-dashed border-slate-950 bg-white p-8 text-center shadow-[4px_4px_0px_#0f172a]">
                  <p className="text-sm font-bold text-slate-800">
                    No existen incidencias que coincidan con el filtro aplicado.
                  </p>
                </div>
              ) : (
                <IonList
                  ref={listRef}
                  lines="none"
                  className="space-y-3 bg-transparent pb-1.5 pr-1.5 pt-0"
                >
                  {filteredIncidents.map((incident) => (
                    <IncidentItem
                      key={incident.id}
                      incident={incident}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteIncident}
                      onSelect={handleSelectIncident}
                    />
                  ))}
                </IonList>
              )}
            </section>
          </div>

          {/* Pie anclado al final de 100dvh */}
          <footer className="relative z-10 mt-auto border-t-2 border-slate-950 bg-slate-950 px-4 py-3 font-mono text-xs font-semibold text-amber-300 sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
              <span>SMARTLAB MONITOR // IONIC REACT + TAILWIND CSS</span>
              <span>WCAG 2.2 AA // 100DVH // LOCALSTORAGE</span>
            </div>
          </footer>
        </div>

        {/* Botón de acción flotante (FAB) magnético y accesible */}
        <IonFab
          slot="fixed"
          vertical="bottom"
          horizontal="end"
          className="mb-3 mr-3"
        >
          <div
            ref={fabMagnetic.ref}
            onPointerMove={fabMagnetic.onPointerMove}
            onPointerLeave={fabMagnetic.onPointerLeave}
          >
            <IonFabButton
              className="smartlab-fab-btn"
              onClick={() => setIsModalOpen(true)}
              aria-label="Registrar nueva incidencia"
            >
              <IonIcon icon={addOutline} aria-hidden="true" />
            </IonFabButton>
          </div>
        </IonFab>

        {/* Modal de alta de nueva incidencia */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar className="smartlab-header-toolbar">
              <IonTitle className="font-mono text-sm font-bold uppercase tracking-wider">
                Nueva Incidencia
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Cerrar formulario"
                  className="min-h-[44px] min-w-[44px] text-white"
                >
                  <IonIcon icon={closeOutline} aria-hidden="true" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <form
              onSubmit={handleCreateIncident}
              className="mx-auto max-w-lg space-y-4 pt-2"
            >
              <IonItem
                lines="none"
                className="border-2 border-slate-950 bg-white shadow-[4px_4px_0px_#0f172a]"
              >
                <IonInput
                  label="Título de la incidencia *"
                  labelPlacement="stacked"
                  placeholder="Ej. Error de compilación en SDK"
                  value={title}
                  onIonInput={(e) => setTitle(e.detail.value ?? '')}
                  required
                />
              </IonItem>

              <IonItem
                lines="none"
                className="border-2 border-slate-950 bg-white shadow-[4px_4px_0px_#0f172a]"
              >
                <IonInput
                  label="Aula o Ubicación *"
                  labelPlacement="stacked"
                  placeholder="Ej. Laboratorio 102"
                  value={location}
                  onIonInput={(e) => setLocation(e.detail.value ?? '')}
                  required
                />
              </IonItem>

              <IonItem
                lines="none"
                className="border-2 border-slate-950 bg-white shadow-[4px_4px_0px_#0f172a]"
              >
                <IonSelect
                  label="Nivel de Prioridad"
                  labelPlacement="stacked"
                  value={priority}
                  onIonChange={(e) =>
                    setPriority(e.detail.value as IncidentPriority)
                  }
                >
                  <IonSelectOption value="alta">Alta (Crítica)</IonSelectOption>
                  <IonSelectOption value="media">Media (Operativa)</IonSelectOption>
                  <IonSelectOption value="baja">Baja (Mantenimiento)</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem
                lines="none"
                className="border-2 border-slate-950 bg-white shadow-[4px_4px_0px_#0f172a]"
              >
                <IonTextarea
                  label="Descripción técnica"
                  labelPlacement="stacked"
                  rows={4}
                  placeholder="Detalla los síntomas observados..."
                  value={description}
                  onIonInput={(e) => setDescription(e.detail.value ?? '')}
                />
              </IonItem>

              <div className="pt-2">
                <IonButton
                  expand="block"
                  type="submit"
                  className="min-h-[44px] border-2 border-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_#0f172a]"
                >
                  Guardar Incidencia
                </IonButton>
              </div>
            </form>
          </IonContent>
        </IonModal>

        {/* Notificación Toast de confirmación */}
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

export default Home;
