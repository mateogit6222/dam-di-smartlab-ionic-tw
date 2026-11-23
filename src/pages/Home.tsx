import React, { useMemo, useRef, useState } from 'react';
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
  timeOutline,
} from 'ionicons/icons';
import IncidentItem from '../components/IncidentItem';
import KpiCard from '../components/KpiCard';
import { useIncidents } from '../context/IncidentsContext';
import { FilterOption, IncidentPriority } from '../types/incident';

const Home: React.FC = () => {
  const history = useHistory();
  const { incidents, addIncident, toggleIncidentStatus, deleteIncident } =
    useIncidents();

  // Estado UI de búsqueda, filtros, modal y feedback
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('todas');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado controlado del formulario modal
  const [title, setTitle] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<IncidentPriority>('media');

  // Referencia a IonList para cerrar elementos deslizados programáticamente
  const listRef = useRef<HTMLIonListElement | null>(null);

  // Cálculo memoizado de indicadores KPI (CE 3.e: optimización de renderizado)
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
    return { total, pending, resolved, critical };
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

  // Gesto nativo Pull-to-Refresh
  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      setToastMessage('Estado sincronizado con almacenamiento local');
      event.detail.complete();
    }, 700);
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
      {/* Cabecera móvil con contador dinámico */}
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary">
          <IonTitle className="font-semibold tracking-tight">
            SmartLab Monitor
          </IonTitle>
          <IonButtons slot="end">
            <div className="mr-3 flex items-center gap-2">
              <span className="hidden text-xs font-medium text-white sm:inline">
                Pendientes:
              </span>
              <IonBadge
                color="light"
                className="px-2.5 py-1 font-bold text-blue-700"
              >
                {metrics.pending}
              </IonBadge>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="bg-slate-50">
        {/* Control táctil Pull-to-Refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingText="Desliza para actualizar"
            refreshingSpinner="crescent"
            refreshingText="Sincronizando..."
          />
        </IonRefresher>

        {/* Contenedor principal responsivo centrado en escritorio */}
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-4 sm:px-6">
          {/* Bloque 1: Panel de métricas KPI con Tailwind Grid */}
          <section aria-label="Resumen de métricas" className="mb-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">
              Estado Operativo del Centro
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              <KpiCard
                label="Total"
                value={metrics.total}
                icon={layersOutline}
                iconColorClass="text-blue-700"
                valueColorClass="text-slate-900"
              />
              <KpiCard
                label="Pendientes"
                value={metrics.pending}
                icon={timeOutline}
                iconColorClass="text-amber-600"
                valueColorClass="text-amber-700"
              />
              <KpiCard
                label="Críticas"
                value={metrics.critical}
                icon={alertCircleOutline}
                iconColorClass="text-red-700"
                valueColorClass="text-red-700"
              />
              <KpiCard
                label="Resueltas"
                value={metrics.resolved}
                icon={checkmarkCircleOutline}
                iconColorClass="text-emerald-700"
                valueColorClass="text-emerald-700"
              />
            </div>
          </section>

          {/* Bloque 2: Barra de búsqueda y filtro segmentado */}
          <section
            aria-label="Filtros de búsqueda"
            className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-center"
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

          {/* Bloque 3: Listado interactivo con gestos laterales (IonItemSliding) */}
          <section aria-label="Listado de incidencias">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Incidencias Registradas ({filteredIncidents.length})
              </h2>
              <span className="text-xs text-slate-600 sm:hidden">
                Desliza para acciones
              </span>
              <span className="hidden text-xs text-slate-600 sm:inline">
                Pulsa para ver detalle o desliza para acciones
              </span>
            </div>

            {filteredIncidents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No existen incidencias que coincidan con el filtro aplicado.
                </p>
              </div>
            ) : (
              <IonList
                ref={listRef}
                lines="none"
                className="space-y-3 bg-transparent p-0"
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

        {/* Botón de acción flotante (FAB) accesible (área >= 48x48px) */}
        <IonFab slot="fixed" vertical="bottom" horizontal="end" className="mb-3 mr-3">
          <IonFabButton
            onClick={() => setIsModalOpen(true)}
            aria-label="Registrar nueva incidencia"
          >
            <IonIcon icon={addOutline} aria-hidden="true" />
          </IonFabButton>
        </IonFab>

        {/* Modal de alta de nueva incidencia */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nueva Incidencia</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Cerrar formulario"
                  className="min-h-[44px] min-w-[44px]"
                >
                  <IonIcon icon={closeOutline} aria-hidden="true" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <form
              onSubmit={handleCreateIncident}
              className="mx-auto max-w-lg space-y-4"
            >
              <IonItem lines="none" className="rounded-lg border border-slate-200">
                <IonInput
                  label="Título de la incidencia *"
                  labelPlacement="stacked"
                  placeholder="Ej. Error de compilación en SDK"
                  value={title}
                  onIonInput={(e) => setTitle(e.detail.value ?? '')}
                  required
                />
              </IonItem>

              <IonItem lines="none" className="rounded-lg border border-slate-200">
                <IonInput
                  label="Aula o Ubicación *"
                  labelPlacement="stacked"
                  placeholder="Ej. Laboratorio 102"
                  value={location}
                  onIonInput={(e) => setLocation(e.detail.value ?? '')}
                  required
                />
              </IonItem>

              <IonItem lines="none" className="rounded-lg border border-slate-200">
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

              <IonItem lines="none" className="rounded-lg border border-slate-200">
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
                  className="min-h-[44px] font-semibold"
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
