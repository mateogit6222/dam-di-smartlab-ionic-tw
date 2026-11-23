import React, { useEffect, useRef, useState } from 'react';

const LERP_ALPHA = 0.18;

function shouldDisableCustomCursor(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  return reducedMotion || coarsePointer;
}

/**
 * Cursor contextual inercial con interpolación lerp y aceleración GPU (Sección 5.2).
 */
const ContextualCursor: React.FC = () => {
  const [disabled, setDisabled] = useState<boolean>(shouldDisableCustomCursor);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [label, setLabel] = useState<string | null>(null);

  const followerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const currentRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const hasPositionRef = useRef<boolean>(false);
  const activeLabelRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerMq = window.matchMedia('(hover: none) and (pointer: coarse)');

    const syncCapability = () => {
      setDisabled(motionMq.matches || pointerMq.matches);
    };

    syncCapability();
    motionMq.addEventListener('change', syncCapability);
    pointerMq.addEventListener('change', syncCapability);

    return () => {
      motionMq.removeEventListener('change', syncCapability);
      pointerMq.removeEventListener('change', syncCapability);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      setIsVisible(false);
      return;
    }

    const tick = () => {
      const element = followerRef.current;
      if (element) {
        const dx = targetRef.current.x - currentRef.current.x;
        const dy = targetRef.current.y - currentRef.current.y;

        currentRef.current.x += dx * LERP_ALPHA;
        currentRef.current.y += dy * LERP_ALPHA;

        const offsetX = activeLabelRef.current ? 16 : -9;
        const offsetY = activeLabelRef.current ? 18 : -9;

        element.style.transform = `translate3d(${(currentRef.current.x + offsetX).toFixed(1)}px, ${(currentRef.current.y + offsetY).toFixed(1)}px, 0)`;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        setIsVisible(false);
        return;
      }

      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;

      if (!hasPositionRef.current) {
        currentRef.current.x = event.clientX;
        currentRef.current.y = event.clientY;
        hasPositionRef.current = true;
      }

      setIsVisible(true);

      const targetElement =
        event.target instanceof Element
          ? event.target
          : event.target instanceof Node
            ? event.target.parentElement
            : null;

      const cursorHost = targetElement?.closest<HTMLElement>('[data-cursor]');
      const nextLabel = cursorHost?.getAttribute('data-cursor') ?? null;

      if (nextLabel !== activeLabelRef.current) {
        activeLabelRef.current = nextLabel;
        setLabel(nextLabel);
      }
    };

    const handlePointerLeave = () => {
      setIsVisible(false);
      activeLabelRef.current = null;
      setLabel(null);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('blur', handlePointerLeave);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      document.documentElement.removeEventListener(
        'mouseleave',
        handlePointerLeave
      );
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, [disabled]);

  if (disabled) {
    return null;
  }

  return (
    <div
      ref={followerRef}
      aria-hidden="true"
      style={{ opacity: isVisible ? 1 : 0 }}
      className={`smartlab-cursor-follower pointer-events-none fixed left-0 top-0 z-[9999] transition-opacity duration-150 ${
        label
          ? 'border-2 border-green-400 bg-[#052e16] px-2.5 py-1 font-mono text-[11px] font-extrabold uppercase tracking-wider text-green-300 shadow-[3px_3px_0px_#4ade80]'
          : 'h-[18px] w-[18px] border-2 border-[#052e16] bg-green-400/40 shadow-[2px_2px_0px_#052e16]'
      }`}
    >
      {label ?? ''}
    </div>
  );
};

export default ContextualCursor;
