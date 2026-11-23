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
  ScrollDetail,
} from '@ionic/react';
import {
  addOutline,
  alertCircleOutline,
  arrowDownOutline,
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

  // Referencias para listado, scroll 100dvh, parallax y temporizador
  const contentRef = useRef<HTMLIonContentElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const scrollElementRef = useRef<HTMLElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const listRef = useRef<HTMLIonListElement | null>(null);
  const syncTimerRef = useRef<number | null>(null);

  // Controles magnéticos reforzados restringidos a ratón (Sección 5.1)
  const createBtnMagnetic = useMagneticControl<HTMLButtonElement>({
    strength: 0.38,
    maxOffset: 14,
  });
  const syncBtnMagnetic = useMagneticControl<HTMLButtonElement>({
    strength: 0.38,
    maxOffset: 14,
  });
  const exploreBtnMagnetic = useMagneticControl<HTMLButtonElement>({
    strength: 0.38,
    maxOffset: 14,
  });
  const fabMagnetic = useMagneticControl<HTMLDivElement>({
    strength: 0.34,
    maxOffset: 12,
  });

  useEffect(() => {
    return () => {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
      }
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
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

  // Resumen por aulas para la tira interactiva Horizontal Scroll Snap (Sección 4.4)
  const locationSummaries = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of incidents) {
      counts.set(item.location, (counts.get(item.location) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([loc, count]) => ({
      location: loc,
      count,
    }));
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

  // Scroll Parallax + Progress Bar sin re-renderizados React (Secciones 4.1 y 4.3)
  const handleContentScroll = (event: CustomEvent<ScrollDetail>) => {
    const scrollTop = event.detail.scrollTop;

    if (scrollRafRef.current !== null) {
      window.cancelAnimationFrame(scrollRafRef.current);
    }

    scrollRafRef.current = window.requestAnimationFrame(async () => {
      const shell = shellRef.current;
      if (!shell) {
        return;
      }

      if (!scrollElementRef.current && contentRef.current) {
        scrollElementRef.current = await contentRef.current.getScrollElement();
      }

      const scrollEl = scrollElementRef.current;
      const maxScroll = scrollEl
        ? Math.max(1, scrollEl.scrollHeight - scrollEl.clientHeight)
        : 1;
      const progress = Math.max(0, Math.min(1, scrollTop / maxScroll));

      shell.style.setProperty('--scroll-y', scrollTop.toFixed(1));
      shell.style.setProperty('--scroll-progress', progress.toFixed(4));
    });
  };

  // Desplazamiento suave desde el Hero 100dvh hacia la Etapa 2
  const handleScrollToDashboard = () => {
    const targetY = dashboardRef.current?.offsetTop ?? 720;
    void contentRef.current?.scrollToPoint(0, Math.max(0, targetY - 6), 550);
  };

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

  const handleToggleLocationFilter = (loc: string) => {
    setSearchQuery((prev) =>
      prev.trim().toLowerCase() === loc.toLowerCase() ? '' : loc
    );
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
      {/* Cabecera móvil/desktop Verde Neo-Brutalista */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="smartlab-header-toolbar">
          <IonTitle className="font-mono text-sm font-bold uppercase tracking-wider sm:text-base">
            SmartLab Monitor // 0488
          </IonTitle>
          <IonButtons slot="end">
            <div className="mr-3 flex items-center gap-2">
              <span className="hidden font-mono text-xs font-bold uppercase text-green-300 sm:inline">
                Pendientes:
              </span>
              <IonBadge className="border-2 border-[#052e16] bg-green-400 px-2.5 py-1 font-mono text-xs font-extrabold text-green-950">
                {metrics.pending}
              </IonBadge>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent
        ref={contentRef}
        fullscreen
        scrollEvents={true}
        onIonScroll={handleContentScroll}
      >
        {/* Control táctil Pull-to-Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Desliza para actualizar"
            refreshingSpinner="crescent"
            refreshingText="Sincronizando..."
          />
        </IonRefresher>

        {/* Shell de altura dinámica 100dvh + textura procedural SVG grain */}
        <div ref={shellRef} className="smartlab-viewport-shell">
          <div className="smartlab-grain-layer" aria-hidden="true" />

          {/* Barra de progreso vinculada al scroll (Sección 4.3) */}
          <div className="smartlab-scroll-progress" aria-hidden="true">
            <div className="smartlab-scroll-progress-fill" />
          </div>

          {/* ETAPA 1: Hero a pantalla completa 100vh / 100dvh */}
          <section
            aria-label="Cabecera operativa a pantalla completa"
            className="smartlab-hero-stage relative z-10 border-b-2 border-[#052e16] bg-[#f7fcf9]"
          >
            <div className="smartlab-hero-mesh" aria-hidden="true" />

            {/* Franja superior del viewport 100dvh */}
            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pt-5 sm:px-6 sm:pt-7">
              <p className="inline-flex items-center gap-2 border-2 border-[#052e16] bg-green-300 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#052e16] shadow-[2px_2px_0px_#052e16]">
                <span className="smartlab-pulse-indicator" aria-hidden="true">
                  <span className="smartlab-pulse-ring" />
                  <span className="smartlab-pulse-dot" />
                </span>
                SISTEMA ACTIVO // 100DVH VIEWPORT
              </p>

              <span className="hidden font-mono text-[11px] font-bold uppercase tracking-wider text-[#052e16] md:inline">
                INTERACCIONES: CURSOR · MAGNETIC · 3D TILT · PARALLAX
              </span>
            </div>

            {/* Bloque central del Hero con capas Parallax diferenciales */}
            <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-7">
                <h1 className="smartlab-display-title">
                  <span className="smartlab-reveal-mask">
                    <span className="smartlab-reveal-line">SMARTLAB</span>
                  </span>
                  <span className="smartlab-reveal-mask">
                    <span className="smartlab-reveal-line smartlab-reveal-line--delay text-green-700">
                      MONITOR
                    </span>
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm font-medium text-slate-900 sm:text-base">
                  Control operativo de incidencias en aulas y laboratorios con
                  escena inicial 100dvh, paralaje en GPU, cursor contextual,
                  tarjetas adaptativas y persistencia local.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    ref={createBtnMagnetic.ref}
                    onPointerMove={createBtnMagnetic.onPointerMove}
                    onPointerLeave={createBtnMagnetic.onPointerLeave}
                    data-cursor="CREAR +"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex min-h-[44px] items-center gap-2 border-2 border-[#052e16] bg-green-400 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-green-950 shadow-[4px_4px_0px_#052e16] transition-colors hover:bg-green-300 active:translate-x-0.5 active:translate-y-0.5"
                  >
                    <IonIcon icon={addOutline} aria-hidden="true" />
                    Nueva incidencia
                  </button>

                  <button
                    type="button"
                    ref={syncBtnMagnetic.ref}
                    onPointerMove={syncBtnMagnetic.onPointerMove}
                    onPointerLeave={syncBtnMagnetic.onPointerLeave}
                    data-cursor="SINCRONIZAR"
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="inline-flex min-h-[44px] items-center gap-2 border-2 border-[#052e16] bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#052e16] shadow-[4px_4px_0px_#052e16] transition-colors hover:bg-green-50 disabled:opacity-60"
                  >
                    <IonIcon
                      icon={refreshOutline}
                      aria-hidden="true"
                      className={isSyncing ? 'smartlab-spin' : ''}
                    />
                    Sincronizar
                  </button>

                  <button
                    type="button"
                    ref={exploreBtnMagnetic.ref}
                    onPointerMove={exploreBtnMagnetic.onPointerMove}
                    onPointerLeave={exploreBtnMagnetic.onPointerLeave}
                    data-cursor="BAJAR ↓"
                    onClick={handleScrollToDashboard}
                    className="inline-flex min-h-[44px] items-center gap-2 border-2 border-[#052e16] bg-[#052e16] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-green-300 shadow-[4px_4px_0px_#4ade80] transition-colors hover:bg-green-950"
                  >
                    Explorar panel
                    <IonIcon icon={arrowDownOutline} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 lg:col-span-5 lg:items-end">
                <span
                  aria-hidden="true"
                  className="smartlab-outlined-text smartlab-clip-reveal smartlab-parallax-slow hidden text-5xl font-extrabold leading-none xl:text-6xl lg:block"
                >
                  0488 // DAM
                </span>

                <div className="smartlab-parallax-reverse w-full max-w-md border-2 border-[#052e16] bg-white/95 p-4 shadow-[6px_6px_0px_#052e16]">
                  <div className="mb-3 flex items-center justify-between border-b-2 border-[#052e16] pb-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#052e16]">
                      Telemetría en vivo
                    </span>
                    <span className="font-mono text-xs font-bold text-green-800">
                      {metrics.resolutionRate}% OK
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="border-2 border-[#052e16] bg-emerald-50 p-2">
                      <span className="block font-mono text-[10px] font-bold uppercase text-slate-700">
                        Tot
                      </span>
                      <span className="font-mono text-lg font-extrabold text-[#052e16]">
                        {metrics.total}
                      </span>
                    </div>
                    <div className="border-2 border-[#052e16] bg-white p-2">
                      <span className="block font-mono text-[10px] font-bold uppercase text-slate-700">
                        Pend
                      </span>
                      <span className="font-mono text-lg font-extrabold text-amber-800">
                        {metrics.pending}
                      </span>
                    </div>
                    <div className="border-2 border-[#052e16] bg-red-50 p-2">
                      <span className="block font-mono text-[10px] font-bold uppercase text-slate-700">
                        Crít
                      </span>
                      <span className="font-mono text-lg font-extrabold text-red-800">
                        {metrics.critical}
                      </span>
                    </div>
                    <div className="border-2 border-[#052e16] bg-green-100 p-2">
                      <span className="block font-mono text-[10px] font-bold uppercase text-slate-700">
                        Res
                      </span>
                      <span className="font-mono text-lg font-extrabold text-green-800">
                        {metrics.resolved}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Base anclada al borde inferior de 100dvh */}
            <div className="relative z-10 w-full">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-2 sm:px-6">
                <button
                  type="button"
                  data-cursor="BAJAR ↓"
                  onClick={handleScrollToDashboard}
                  className="inline-flex min-h-[44px] items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#052e16] hover:text-green-800"
                >
                  <IonIcon
                    icon={arrowDownOutline}
                    aria-hidden="true"
                    className="smartlab-bounce-y text-base"
                  />
                  DESLIZA HACIA ABAJO (100DVH)
                </button>
                <span className="hidden font-mono text-[11px] font-bold uppercase text-green-900 sm:inline">
                  ETAPA 01 / 02
                </span>
              </div>

              {/* Marquesina cinética continua (Sección 2.4) */}
              <TelemetryMarquee
                total={metrics.total}
                pending={metrics.pending}
                critical={metrics.critical}
                resolved={metrics.resolved}
              />
            </div>
          </section>

          {/* ETAPA 2: Panel Operativo completo 100vh / 100dvh */}
          <div
            id="dashboard-panel"
            ref={dashboardRef}
            className="smartlab-dashboard-stage relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-6 sm:px-6 sm:pb-12"
          >
            {/* Bloque 1: Bento Grid + CSS Subgrid (Secciones 1.2 y 1.4) */}
            <section aria-label="Resumen de métricas" className="mb-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#052e16]">
                  Estado Operativo del Centro
                </h2>
                <span className="font-mono text-[11px] font-semibold uppercase text-green-900">
                  Bento Subgrid // 3D Tilt 10°
                </span>
              </div>

              <div className="smartlab-bento-grid pb-1 pr-1">
                <KpiCard
                  label="Total"
                  value={metrics.total}
                  icon={layersOutline}
                  iconColorClass="text-green-800"
                  valueColorClass="text-[#052e16]"
                  accentClass="bg-emerald-50"
                  spanClass="lg:col-span-4"
                  progressPercent={metrics.resolutionRate}
                  subtitle={`${metrics.resolutionRate}% resuelto`}
                  staggerIndex={0}
                />
                <KpiCard
                  label="Pendientes"
                  value={metrics.pending}
                  icon={timeOutline}
                  iconColorClass="text-amber-700"
                  valueColorClass="text-amber-800"
                  spanClass="lg:col-span-3"
                  subtitle="Cola activa"
                  staggerIndex={1}
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
                  staggerIndex={2}
                  pulseAlert={metrics.critical > 0}
                />
                <KpiCard
                  label="Resueltas"
                  value={metrics.resolved}
                  icon={checkmarkCircleOutline}
                  iconColorClass="text-green-800"
                  valueColorClass="text-green-800"
                  accentClass="bg-green-100"
                  spanClass="lg:col-span-2"
                  subtitle="Cerradas"
                  staggerIndex={3}
                />
              </div>
            </section>

            {/* Bloque 1.5: Tira Interactiva Horizontal Scroll Snap por Aulas (Sección 4.4) */}
            <section aria-label="Filtro rápido por aulas" className="mb-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#052e16]">
                  Aulas Monitorizadas (Scroll Snap)
                </h2>
                <span className="font-mono text-[11px] font-semibold uppercase text-green-900">
                  Pulsa para filtrar
                </span>
              </div>

              <div className="smartlab-hscroll-strip">
                <button
                  type="button"
                  data-cursor="FILTRAR AULA"
                  onClick={() => setSearchQuery('')}
                  className={`smartlab-hscroll-card min-h-[44px] border-2 border-[#052e16] px-3.5 py-2 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_#052e16] transition-colors ${
                    searchQuery.trim() === ''
                      ? 'bg-green-400 text-green-950'
                      : 'bg-white text-[#052e16] hover:bg-green-50'
                  }`}
                >
                  Todas las aulas ({metrics.total})
                </button>

                {locationSummaries.map(({ location: loc, count }) => {
                  const isActive =
                    searchQuery.trim().toLowerCase() === loc.toLowerCase();
                  return (
                    <button
                      key={loc}
                      type="button"
                      data-cursor="FILTRAR AULA"
                      onClick={() => handleToggleLocationFilter(loc)}
                      className={`smartlab-hscroll-card min-h-[44px] border-2 border-[#052e16] px-3.5 py-2 font-mono text-xs font-bold shadow-[3px_3px_0px_#052e16] transition-colors ${
                        isActive
                          ? 'bg-green-400 text-green-950'
                          : 'bg-white text-[#052e16] hover:bg-green-50'
                      }`}
                    >
                      {loc} ({count})
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Bloque 2: Barra de búsqueda y filtro segmentado Sticky */}
            <section
              aria-label="Filtros de búsqueda"
              className="smartlab-sticky-controls mb-5 grid grid-cols-1 gap-3 pr-1 lg:grid-cols-12 lg:items-center"
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
            <section aria-label="Listado de incidencias" className="flex-1">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-1">
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#052e16]">
                  Incidencias Registradas ({filteredIncidents.length})
                </h2>
                <span className="font-mono text-xs text-green-900 sm:hidden">
                  Desliza para acciones
                </span>
                <span className="hidden font-mono text-xs text-green-900 sm:inline">
                  Pulsa para ver detalle o desliza para acciones
                </span>
              </div>

              {isSyncing ? (
                <IncidentSkeleton count={3} />
              ) : filteredIncidents.length === 0 ? (
                <div className="border-2 border-dashed border-[#052e16] bg-white p-8 text-center shadow-[4px_4px_0px_#052e16]">
                  <p className="text-sm font-bold text-[#052e16]">
                    No existen incidencias que coincidan con el filtro aplicado.
                  </p>
                </div>
              ) : (
                <IonList
                  ref={listRef}
                  lines="none"
                  className="space-y-3 bg-transparent pb-1.5 pr-1.5 pt-0"
                >
                  {filteredIncidents.map((incident, index) => (
                    <IncidentItem
                      key={incident.id}
                      incident={incident}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDeleteIncident}
                      onSelect={handleSelectIncident}
                      staggerIndex={index}
                    />
                  ))}
                </IonList>
              )}
            </section>
          </div>

          {/* Pie anclado al final de 100dvh */}
          <footer className="relative z-10 mt-auto border-t-2 border-[#052e16] bg-[#052e16] px-4 pb-24 pt-3 font-mono text-xs font-semibold text-green-300 sm:px-6 sm:pb-4">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 sm:pr-20">
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
            data-cursor="CREAR +"
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
                className="border-2 border-[#052e16] bg-white shadow-[4px_4px_0px_#052e16]"
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
                className="border-2 border-[#052e16] bg-white shadow-[4px_4px_0px_#052e16]"
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
                className="border-2 border-[#052e16] bg-white shadow-[4px_4px_0px_#052e16]"
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
                className="border-2 border-[#052e16] bg-white shadow-[4px_4px_0px_#052e16]"
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
                  className="min-h-[44px] border-2 border-[#052e16] font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0px_#052e16]"
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
