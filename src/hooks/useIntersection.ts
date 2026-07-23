import { RefObject, useEffect, useRef } from 'react';

const ROOT_MARGIN = '300px';

export const useIntersection = <T extends HTMLElement>(
  onIntersect: () => void,
  enabled: boolean,
  rootRef?: RefObject<Element | null>,
): RefObject<T | null> => {
  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    const target = targetRef.current;

    if (!enabled || target === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onIntersect();
        }
      },
      { root: rootRef?.current ?? null, rootMargin: ROOT_MARGIN },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [enabled, onIntersect, rootRef]);

  return targetRef;
};
