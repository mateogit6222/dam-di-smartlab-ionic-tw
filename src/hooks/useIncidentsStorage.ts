import { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_INCIDENTS } from '../data/initialIncidents';
import { Incident, IncidentPriority } from '../types/incident';

const STORAGE_KEY = 'smartlab_incidents_v1';

export interface NewIncidentInput {
  title: string;
  location: string;
  description: string;
  priority: IncidentPriority;
}

export interface UseIncidentsStorageResult {
  incidents: Incident[];
  addIncident: (input: NewIncidentInput) => Incident;
  toggleIncidentStatus: (id: string) => void;
  deleteIncident: (id: string) => void;
  updateIncidentDescription: (id: string, description: string) => void;
  getIncidentById: (id: string) => Incident | undefined;
}

function isValidIncident(value: unknown): value is Incident {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const validPriority =
    record.priority === 'alta' ||
    record.priority === 'media' ||
    record.priority === 'baja';
  const validStatus =
    record.status === 'pendiente' || record.status === 'resuelta';

  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.location === 'string' &&
    typeof record.description === 'string' &&
    typeof record.createdAt === 'string' &&
    validPriority &&
    validStatus
  );
}

function loadStoredIncidents(): Incident[] {
  if (typeof window === 'undefined') {
    return INITIAL_INCIDENTS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return INITIAL_INCIDENTS;
    }

    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isValidIncident)) {
      return parsed;
    }

    return INITIAL_INCIDENTS;
  } catch {
    return INITIAL_INCIDENTS;
  }
}

function generateUniqueIncidentId(existingIncidents: Incident[]): string {
  const existingIds = new Set(existingIncidents.map((item) => item.id));
  let candidate = '';

  do {
    candidate = `INC-${Math.floor(104 + Math.random() * 895)}`;
  } while (existingIds.has(candidate));

  return candidate;
}

/**
 * Custom Hook para gestionar y sincronizar incidencias con localStorage.
 */
export function useIncidentsStorage(): UseIncidentsStorageResult {
  const [incidents, setIncidents] = useState<Incident[]>(loadStoredIncidents);
  const incidentsRef = useRef<Incident[]>(incidents);
  incidentsRef.current = incidents;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    } catch {
      // Ignora errores de cuota o modo privado sin bloquear la UI
    }
  }, [incidents]);

  const addIncident = useCallback((input: NewIncidentInput): Incident => {
    const newIncident: Incident = {
      id: generateUniqueIncidentId(incidentsRef.current),
      title: input.title.trim(),
      location: input.location.trim(),
      description: input.description.trim() || 'Sin observaciones adicionales.',
      priority: input.priority,
      status: 'pendiente',
      createdAt: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setIncidents((prev) => [newIncident, ...prev]);
    return newIncident;
  }, []);

  const toggleIncidentStatus = useCallback((id: string) => {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'pendiente' ? 'resuelta' : 'pendiente',
            }
          : item
      )
    );
  }, []);

  const deleteIncident = useCallback((id: string) => {
    setIncidents((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateIncidentDescription = useCallback(
    (id: string, description: string) => {
      const normalizedDescription =
        description.trim() || 'Sin observaciones adicionales.';
      setIncidents((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, description: normalizedDescription } : item
        )
      );
    },
    []
  );

  const getIncidentById = useCallback(
    (id: string) => incidents.find((item) => item.id === id),
    [incidents]
  );

  return {
    incidents,
    addIncident,
    toggleIncidentStatus,
    deleteIncident,
    updateIncidentDescription,
    getIncidentById,
  };
}
