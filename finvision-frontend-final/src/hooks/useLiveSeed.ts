 'use client';

import { useEffect, useState } from 'react';

/**
 * Produces a stable "live" seed that changes every `intervalMs`.
 * Using a time-bucketed seed lets multiple components update together without drifting too much.
 */
export function useLiveSeed(intervalMs = 5000) {
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / intervalMs));

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeed(Math.floor(Date.now() / intervalMs));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return seed;
}

