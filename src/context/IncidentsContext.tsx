import React, { createContext, useContext } from 'react';
import {
  useIncidentsStorage,
  UseIncidentsStorageResult,
} from '../hooks/useIncidentsStorage';

const IncidentsContext = createContext<UseIncidentsStorageResult | undefined>(
  undefined
);

interface IncidentsProviderProps {
  children: React.ReactNode;
}

/**
 * Proveedor global de incidencias para sincronizar vistas montadas en IonRouterOutlet.
 */
export const IncidentsProvider: React.FC<IncidentsProviderProps> = ({
  children,
}) => {
  const storage = useIncidentsStorage();

  return (
    <IncidentsContext.Provider value={storage}>
      {children}
    </IncidentsContext.Provider>
  );
};

export function useIncidents(): UseIncidentsStorageResult {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error(
      'useIncidents debe utilizarse dentro de un componente envuelto por IncidentsProvider'
    );
  }
  return context;
}
