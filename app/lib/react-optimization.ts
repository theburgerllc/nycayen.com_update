import { useMemo, useCallback, useRef, useEffect, useState } from 'react';

// Debounce hook for optimizing user input
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for optimizing frequent events
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

// Memoized callback with dependencies
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

// Memoized value with deep comparison
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }

  return ref.current.value;
}

// Deep equality check
function areEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!areEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !areEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}

// Optimized state updater
export function useOptimizedState<T>(
  initialState: T
): [T, (newState: T | ((prevState: T) => T)) => void] {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const optimizedSetState = useCallback((newState: T | ((prevState: T) => T)) => {
    setState((prevState) => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prevState: T) => T)(prevState)
        : newState;
      
      // Only update if state actually changed
      if (areEqual(prevState, nextState)) {
        return prevState;
      }
      
      return nextState;
    });
  }, []);

  return [state, optimizedSetState];
}

// Batch state updates
export function useBatchedUpdates() {
  const [, forceUpdate] = useState({});
  const pendingUpdates = useRef<(() => void)[]>([]);
  const isBatching = useRef(false);

  const batchUpdates = useCallback((updates: (() => void)[]) => {
    if (isBatching.current) {
      pendingUpdates.current.push(...updates);
      return;
    }

    isBatching.current = true;
    
    // Use React's unstable_batchedUpdates if available
    if (typeof (React as any).unstable_batchedUpdates === 'function') {
      (React as any).unstable_batchedUpdates(() => {
        updates.forEach(update => update());
        pendingUpdates.current.forEach(update => update());
        pendingUpdates.current = [];
      });
    } else {
      // Fallback to setTimeout for batching
      setTimeout(() => {
        updates.forEach(update => update());
        pendingUpdates.current.forEach(update => update());
        pendingUpdates.current = [];
        isBatching.current = false;
      }, 0);
    }
    
    isBatching.current = false;
  }, []);

  return batchUpdates;
}

// Optimized event handlers
export function useOptimizedEventHandlers<T extends Record<string, any>>(
  handlers: T
): T {
  return useMemo(() => {
    const optimizedHandlers = {} as T;
    
    Object.keys(handlers).forEach((key) => {
      const handler = handlers[key];
      if (typeof handler === 'function') {
        optimizedHandlers[key] = useCallback(handler, [handler]);
      } else {
        optimizedHandlers[key] = handler;
      }
    });

    return optimizedHandlers;
  }, [handlers]);
}

// Memoized component props
export function useMemoizedProps<T extends Record<string, any>>(props: T): T {
  return useMemo(() => props, Object.values(props));
}

// Optimized render function
export function useOptimizedRender<T>(
  renderFn: () => T,
  deps: React.DependencyList
): T {
  return useMemo(renderFn, deps);
}

// Performance monitoring for components
export function useComponentPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef<number>(0);
  const totalRenderTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    
    if (lastRenderTime.current > 0) {
      const renderTime = now - lastRenderTime.current;
      totalRenderTime.current += renderTime;
      
      if (renderTime > 16) { // Slower than 60fps
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    }
    
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderCount.current > 0 
      ? totalRenderTime.current / renderCount.current 
      : 0,
  };
}

// Optimized list rendering
export function useOptimizedList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string | number,
  renderItem: (item: T, index: number) => React.ReactNode
) {
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => ({
      key: keyExtractor(item, index),
      element: renderItem(item, index),
    }));
  }, [items, keyExtractor, renderItem]);

  return memoizedItems;
}

// React import
import React from 'react';