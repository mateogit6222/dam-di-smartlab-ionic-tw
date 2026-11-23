import { useCallback, useEffect, useRef } from 'react';

export interface UseMagneticControlOptions {
  strength?: number;
  maxOffset?: number;
}

export interface MagneticControlBindings<T extends HTMLElement> {
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
 * Control magnético con PointerEvent restringido a ratón y aceleración GPU.
 */
export function useMagneticControl<T extends HTMLElement>(
  options?: UseMagneticControlOptions
): MagneticControlBindings<T> {
  const strength = options?.strength ?? 0.28;
  const maxOffset = options?.maxOffset ?? 10;

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
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const rawX = (event.clientX - centerX) * strength;
      const rawY = (event.clientY - centerY) * strength;

      const dx = Math.max(-maxOffset, Math.min(maxOffset, rawX));
      const dy = Math.max(-maxOffset, Math.min(maxOffset, rawY));

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        element.style.willChange = 'transform';
        element.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      });
    },
    [maxOffset, strength]
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
      element.style.transform = 'translate3d(0px, 0px, 0)';
      element.style.willChange = 'auto';
    });
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
