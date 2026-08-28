// src/lib/simulation.ts
// Background simulation tick engine driving real-time crowd dynamics

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function useSimulationEngine() {
  const isSimulationActive = useAppStore((state) => state.isSimulationActive);
  const runSimulationTick = useAppStore((state) => state.runSimulationTick);

  useEffect(() => {
    if (!isSimulationActive) return;

    // Scan & flow update every 2.5 seconds
    const interval = setInterval(() => {
      runSimulationTick();
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulationActive, runSimulationTick]);
}
