# SmartLab Monitor — Ionic React + TypeScript + Tailwind CSS

Proyecto para el módulo **Desarrollo de Interfaces (Código 0488)** — 2.º CFGS DAM (Instituto Nebrija).

## Arquitectura y Estructura del Proyecto

- `src/pages/Home.tsx`: Vista principal con cabecera reactiva, Pull-to-Refresh, panel de KPIs en Tailwind Grid, buscador en tiempo real, filtro segmentado (`IonSegment`), listado con gestos (`IonItemSliding`), modal de alta (`IonModal`), botón flotante (`IonFab`) y notificaciones (`IonToast`).
- `src/pages/IncidentDetail.tsx`: Ficha técnica en `/incident/:id` con retorno nativo (`IonBackButton`), cambio de estado y edición de descripción persistida.
- `src/components/KpiCard.tsx`: Tarjeta métrica reutilizable tipada con interfaz estricta `KpiCardProps`.
- `src/components/IncidentItem.tsx`: Fila modularizada de incidencia con acciones táctiles y botones accesibles para escritorio.
- `src/hooks/useIncidentsStorage.ts`: Custom Hook de persistencia local mediante `localStorage` (`smartlab_incidents_v1`).
- `src/context/IncidentsContext.tsx`: Proveedor de estado compartido entre rutas de `IonRouterOutlet`.
- `src/data/initialIncidents.ts`: Datos iniciales y mapa de estilos de prioridad con contraste WCAG 2.2 AA.
- `src/types/incident.ts`: Definición estricta de tipos e interfaces de dominio en TypeScript.
- `src/theme/variables.css`: Directivas `@tailwind` y variables CSS de personalización para Shadow DOM de Ionic.
- `vercel.json`: Configuración de rewrite SPA para evitar errores `404` al recargar rutas en Vercel.
- `Dockerfile` y `nginx.conf`: Empaquetado multietapa listo para despliegue en contenedor.

## Diseño Web Responsivo (RWD) y Accesibilidad

- **Mobile (`360x800`):** Rejilla KPI en 2 columnas (`grid-cols-2`), `IonSegment` sin desbordamientos, gestos `IonItemSliding` y margen inferior `pb-24` para que el `IonFab` no tape el último elemento.
- **Tablet (`768x1024`):** Transición a rejilla de 4 columnas (`md:grid-cols-4`) y espaciados adaptativos.
- **Desktop (`1280x800`):** Contenedor centrado (`max-w-5xl mx-auto`), barra de búsqueda y filtro segmentado en fila (`lg:grid-cols-12`) y botón de eliminación accesible alternativo al gesto táctil.
- **Accesibilidad:** Contraste cromático WCAG 2.2 AA (>= 4.5:1), áreas táctiles mínimas de `44x44px` y atributos `aria-label` descriptivos.

## Flujo Git y Despliegue en Vercel

- **Ramas:** Desarrollo mediante commits atómicos en `develop` e integración final mediante merge `--no-ff` en `main`.
- **Parámetros de build en Vercel:**
  - **Framework Preset:** `Vite`
  - **Production Branch:** `main`
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`

## Puesta en Marcha Local (Node.js >= 20 LTS)

```powershell
npm install
npm run dev
```

## Compilación de Producción

```powershell
npm run build
```

## Despliegue en Contenedor Docker

```powershell
docker build -t smartlab-ionic-tw:1.0 .
docker run -d -p 8080:80 --name smartlab-container smartlab-ionic-tw:1.0
```
