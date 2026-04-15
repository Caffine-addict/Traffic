import { useState, useCallback, useEffect } from 'react';

export interface TrafficState {
  level: number;
  preset: string;
  isRushHour: boolean;
  isSimulationRunning: boolean;
  stressLevel: number;
  barricades: { id: number; x: number; z: number; active: boolean }[];
}

export type TrafficPreset = 'empty' | 'light' | 'normal' | 'heavy' | 'rush' | 'gridlock';

export const TRAFFIC_PRESETS: Record<TrafficPreset, { level: number; label: string; color: string }> = {
  empty: { level: 10, label: 'Empty Streets', color: '#22c55e' },
  light: { level: 30, label: 'Light Traffic', color: '#84cc16' },
  normal: { level: 50, label: 'Normal', color: '#eab308' },
  heavy: { level: 70, label: 'Heavy Traffic', color: '#f97316' },
  rush: { level: 90, label: 'Rush Hour', color: '#ef4444' },
  gridlock: { level: 100, label: 'Gridlock', color: '#dc2626' },
};

export const STRESS_SCENARIOS = [
  { id: 1, name: 'Morning Rush', hour: 8, level: 90 },
  { id: 2, name: 'Evening Rush', hour: 17, level: 95 },
  { id: 3, name: 'Weekend', hour: 14, level: 40 },
  { id: 4, name: 'Late Night', hour: 23, level: 20 },
  { id: 5, name: 'Rain Storm', hour: 15, level: 85 },
  { id: 6, name: 'Holiday', hour: 12, level: 60 },
];

export interface StressTestResult {
  scenario: string;
  avgCongestion: number;
  blockedRoutes: number;
  avgDelay: number;
  safeRoutes: number;
}

export function useTrafficSimulation() {
  const [state, setState] = useState<TrafficState>({
    level: 50,
    preset: 'normal',
    isRushHour: false,
    isSimulationRunning: false,
    stressLevel: 0,
    barricades: [
      { id: 1, x: 3, z: 4, active: false },
      { id: 2, x: 7, z: 6, active: false },
      { id: 3, x: 11, z: 8, active: false },
      { id: 4, x: 5, z: 10, active: false },
      { id: 5, x: 9, z: 4, active: false },
    ],
  });

  const setTrafficLevel = useCallback((level: number) => {
    setState(prev => ({ 
      ...prev, 
      level: Math.max(0, Math.min(100, level)),
      preset: Object.entries(TRAFFIC_PRESETS).find(([_, p]) => p.level === level)?.[0] || 'normal'
    }));
  }, []);

  const setPreset = useCallback((preset: TrafficPreset) => {
    const presetData = TRAFFIC_PRESETS[preset];
    setState(prev => ({
      ...prev,
      level: presetData.level,
      preset,
      isRushHour: preset === 'rush' || preset === 'gridlock',
    }));
  }, []);

  const toggleBarricade = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      barricades: prev.barricades.map(b => 
        b.id === id ? { ...b, active: !b.active } : b
      ),
    }));
  }, []);

  const toggleSimulation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSimulationRunning: !prev.isSimulationRunning,
    }));
  }, []);

  const runStressTest = useCallback((scenarioId: number): StressTestResult => {
    const scenario = STRESS_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      return {
        scenario: 'Unknown',
        avgCongestion: 50,
        blockedRoutes: 0,
        avgDelay: 0,
        safeRoutes: 5,
      };
    }

    const congestion = scenario.level;
    const blockedRoutes = Math.floor(congestion / 20);
    const avgDelay = Math.floor((congestion / 100) * 15);
    const safeRoutes = Math.max(1, 10 - blockedRoutes);

    return {
      scenario: scenario.name,
      avgCongestion: congestion,
      blockedRoutes,
      avgDelay,
      safeRoutes,
    };
  }, []);

  const startRushHour = useCallback(() => {
    setState(prev => ({
      ...prev,
      level: 95,
      preset: 'rush',
      isRushHour: true,
    }));
  }, []);

  const endRushHour = useCallback(() => {
    setState(prev => ({
      ...prev,
      level: 50,
      preset: 'normal',
      isRushHour: false,
    }));
  }, []);

  return {
    state,
    setTrafficLevel,
    setPreset,
    toggleBarricade,
    toggleSimulation,
    runStressTest,
    startRushHour,
    endRushHour,
    presets: TRAFFIC_PRESETS,
    scenarios: STRESS_SCENARIOS,
  };
}

export function getTrafficColor(level: number): string {
  if (level <= 20) return '#22c55e';
  if (level <= 40) return '#84cc16';
  if (level <= 60) return '#eab308';
  if (level <= 80) return '#f97316';
  return '#ef4444';
}

export function getTrafficLabel(level: number): string {
  if (level <= 20) return 'Clear';
  if (level <= 40) return 'Light';
  if (level <= 60) return 'Moderate';
  if (level <= 80) return 'Heavy';
  return 'Gridlock';
}