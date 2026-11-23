import { useCallback, useEffect, useRef } from 'react';

export interface UsePerspectiveTiltOptions {
  maxTilt?: number;
}

export interface PerspectiveTiltBindings<T extends HTMLElement> {
  ref: React.RefObject<T>;
  onPointerMove: React.PointerEventHandler<T>;
  onPointerLeave: React.PointerEventHandler<T>;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Inclinación 3D reactiva (rotateX/rotateY) y reflejo especular para tarjetas.
 */
export function usePerspectiveTilt<T extends HTMLElement>(
  options?: UsePerspectiveTiltOptions
): PerspectiveTiltBindings<T> {
  const maxTilt = options?.maxTilt ?? 6;

  const ref = useRef<T>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const onPointerMove = useCallback<React.PointerEventHandler<T>>(
    (event) => {
      if (event.pointerType !== 'mouse' || prefersReducedMotion()) {
        return;
      }

      const element = ref.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

      const rotateY = (px - 0.5) * 2 * maxTilt;
      const rotateX = -(py - 0.5) * 2 * maxTilt;
      const glareX = px * 100;
      const glareY = py * 100;

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        element.style.willChange = 'transform';
        element.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0, -3px, 0)`;
        element.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
        element.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);
        element.style.setProperty('--glare-opacity', '1');
      });
    },
    [maxTilt]
  );

  const onPointerLeave = useCallback<React.PointerEventHandler<T>>(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    rafRef.current = requestAnimationFrame(() => {
      element.style.transform =
        'perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
      element.style.setProperty('--glare-opacity', '0');
      element.style.willChange = 'auto';
    });
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
