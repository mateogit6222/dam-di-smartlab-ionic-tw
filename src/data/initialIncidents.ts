import { Incident, IncidentPriority } from '../types/incident';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    title: 'Fallo de enlace en Switch Rack B',
    location: 'Aula 204 - Redes',
    description: 'Pérdida intermitente de paquetes en puertos Gigabit 12 al 16.',
    priority: 'alta',
    status: 'pendiente',
    createdAt: '09:15',
  },
  {
    id: 'INC-102',
    title: 'Actualización de imágenes Docker',
    location: 'Laboratorio DAM 2',
    description: 'Desplegar imagen base Node 22 Alpine en estaciones de trabajo.',
    priority: 'media',
    status: 'pendiente',
    createdAt: '10:30',
  },
  {
    id: 'INC-103',
    title: 'Calibración de proyector láser',
    location: 'Aula Magna',
    description: 'Ajuste trapezoidal y verificación de entrada HDMI.',
    priority: 'baja',
    status: 'resuelta',
    createdAt: 'Ayer',
  },
];

/** Estilos Neo-Brutalistas de contraste WCAG AAA para etiquetas de prioridad. */
export const PRIORITY_BADGE_STYLES: Record<IncidentPriority, string> = {
  alta: 'bg-red-200 text-red-950 border-slate-950',
  media: 'bg-amber-300 text-slate-950 border-slate-950',
  baja: 'bg-emerald-200 text-emerald-950 border-slate-950',
};
