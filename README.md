# SmartLab Monitor — Ionic React + TypeScript + Tailwind CSS

Proyecto para el módulo **Desarrollo de Interfaces (Código 0488)** — 2.º CFGS DAM (Instituto Nebrija).

## Arquitectura y Estructura del Proyecto

- `src/pages/Home.tsx`: Vista principal en **dos etapas `100vh`/`100dvh`** (Hero a pantalla completa con parallax en GPU y Panel Operativo), Pull-to-Refresh, Bento Grid + CSS Subgrid, tira **Horizontal Scroll Snap** por aulas, buscador y filtro segmentado **Sticky**, listado con `@container` y gestos (`IonItemSliding`), modal de alta (`IonModal`), botón flotante magnético (`IonFab`) y notificaciones (`IonToast`).
- `src/pages/IncidentDetail.tsx`: Ficha técnica en `/incident/:id` con layout `100dvh`, retorno nativo (`IonBackButton`), cambio de estado y edición de descripción persistida.
- `src/components/ContextualCursor.tsx`: Cursor contextual inercial con interpolación *lerp* en GPU (`translate3d`) y etiquetas dinámicas según `data-cursor`.
- `src/components/KpiCard.tsx`: Tarjeta métrica Neo-Brutalista en Subgrid con inclinación 3D reactiva (`usePerspectiveTilt` hasta `10°` + relieve `translateZ`).
- `src/components/IncidentItem.tsx`: Fila modularizada de incidencia con CSS Container Queries (`@container`), acciones táctiles y botones accesibles para escritorio.
- `src/components/TelemetryMarquee.tsx`: Banda cinética continua con transformación GPU (`translate3d`) y telemetría operativa en vivo.
- `src/components/IncidentSkeleton.tsx`: Skeleton Screen Neo-Brutalista para mantener estabilidad visual (`CLS = 0`) durante la sincronización.
- `src/hooks/useIncidentsStorage.ts`: Custom Hook de persistencia local mediante `localStorage` (`smartlab_incidents_v1`).
- `src/hooks/useMagneticControl.ts`: Hook de atracción magnética (`maxOffset: 14px`) con `PointerEvent` restringido a ratón y aceleración GPU (`requestAnimationFrame` + `translate3d`).
- `src/hooks/usePerspectiveTilt.ts`: Hook de inclinación 3D (`rotateX`/`rotateY`) con reflejo especular y respeto a `prefers-reduced-motion`.
- `src/context/IncidentsContext.tsx`: Proveedor de estado compartido entre rutas de `IonRouterOutlet`.
- `src/data/initialIncidents.ts`: Datos iniciales y mapa de estilos Neo-Brutalistas con contraste WCAG AAA.
- `src/types/incident.ts`: Definición estricta de tipos e interfaces de dominio en TypeScript.
- `src/theme/variables.css`: Directivas `@tailwind`, variables Shadow DOM de Ionic, diseño Neo-Brutalista, unidades `vh`/`dvh`, parallax, sticky, scroll-snap, Bento/Subgrid y Container Queries.
- `ionic.config.json`: Configuración de Ionic CLI con `"type": "react-vite"` para compatibilidad directa con `ionic serve` e `ionic build`.
- `vercel.json`: Configuración de rewrite SPA para evitar errores `404` al recargar rutas en Vercel.
- `Dockerfile` y `nginx.conf`: Empaquetado multietapa listo para despliegue en contenedor.

## Sistema Verde Neo-Brutalista, Animaciones GPU y Layout `100vh`/`100dvh`

1. **Paleta Verde Neo-Brutalista e Ingeniería Tipográfica:**
   - **Tokens cromáticos WCAG 2.2 AA/AAA:** Tinta y bordes `#052e16`, primario Ionic `#15803d`, acento verde `#4ade80` / `#86efac` y lienzo base `#f0f7f2` con *Mesh Gradient* animado (`oklch()`) y textura procedural SVG (`feTurbulence`).
   - Tipografía variable fluida (`Space Grotesk` y `JetBrains Mono`) con `clamp(2.4rem, 8.5vw, 6.5rem)`, *negative tracking* (`-0.045em`), *tight leading* (`0.88`), Split-Text Line Reveal y `clip-path` reveal en la insignia `0488 // DAM` contorneada (`-webkit-text-stroke: 2px #052e16`).
   - Marquesina cinética GPU (`TelemetryMarquee`), bordes `2px solid #052e16` y sombras duras offset (`4px`/`6px`).
2. **Animaciones GPU, Interacciones Reactivas y Accesibilidad:**
   - **Cursor Contextual Inercial (`ContextualCursor`):** Seguidor con *lerp* (`α = 0.18`) en `requestAnimationFrame` que transforma su forma y muestra etiquetas (`CREAR +`, `INCLINAR 3D`, `BAJAR ↓`, `FILTRAR AULA`, `VER FICHA →`), oculto automáticamente en pantallas táctiles y bajo `prefers-reduced-motion`.
   - **Scroll Parallax & Progress Bar:** Barra superior sticky vinculada a `--scroll-progress` y desplazamiento diferencial en GPU (`--scroll-y`) entre capas del Hero sin bloquear el hilo principal.
   - Entrada escalonada (*stagger*) con `animation-fill-mode: backwards`, animación `value-pop`, LED operativo pulsante, icono de sincronización rotatorio y barra de resolución animada (`scaleX` + *shimmer*).
   - Controles magnéticos (`useMagneticControl`) e inclinación 3D reactiva (`usePerspectiveTilt` con `translateZ(16px)` y reflejo verde/blanco) limitados estrictamente a `pointerType === 'mouse'`.
   - Skeleton Screens (`IncidentSkeleton`) durante ciclos de sincronización y desactivación completa de movimientos bajo `@media (prefers-reduced-motion: reduce)`.
3. **Layout Next-Gen (`100vh`/`100dvh`) y RWD Intrínseco:**
   - Arquitectura en dos etapas de altura completa (`min-height: calc(100vh - 58px); min-height: calc(100dvh - 58px)`): **Etapa 1 Hero** con anclaje inferior de telemetría y desplazamiento suave hacia la **Etapa 2 Panel Operativo**.
   - Tira interactiva de aulas con **CSS Scroll Snap** (`scroll-snap-type: x mandatory`) y barra de filtros **Sticky** (`position: sticky`).
   - Panel KPI en **Bento Grid** (`2` cols en Mobile, `4` en Tablet, `12` cols con spans `4+3+3+2` en Desktop) y alineamiento vertical heredado mediante **CSS Subgrid**.
   - Tarjetas de incidencia gobernadas por **CSS Container Queries** (`container-type: inline-size` + `@container incident-card (min-width: 560px)`).

## Diseño Web Responsivo (RWD) y Accesibilidad

- **Mobile (`360x800`):** Rejilla KPI en 2 columnas, `IonSegment` sin desbordamientos, gestos `IonItemSliding` y margen inferior `pb-24` para que el `IonFab` no tape el último elemento.
- **Tablet (`768x1024`):** Transición a rejilla de 4 columnas, tarjetas `@container` horizontales y espaciados adaptativos.
- **Desktop (`1280x800`):** Contenedor centrado (`max-w-6xl mx-auto`), barra de búsqueda y filtro segmentado en fila (`lg:grid-cols-12`) y botón de eliminación accesible alternativo al gesto táctil.
- **Accesibilidad:** Contraste cromático WCAG 2.2 AA/AAA (>= 4.5:1), áreas táctiles mínimas de `44x44px`, foco visible de alto contraste (`:focus-visible`) y atributos `aria-label` descriptivos.

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
# o con Ionic CLI:
ionic serve
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
