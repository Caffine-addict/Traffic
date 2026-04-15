import { create } from 'zustand';
import { Node, Edge, generateManhattanGrid, generateCrimeHotspots, getLandmarks } from '../lib/data/nycData';
import { buildGraph, dijkstra, getPathCoordinates } from '../lib/algorithms/pathfinding';
import { calculateRouteSafety, SafetyScore } from '../lib/algorithms/safety';
import { predictCongestion, CongestionForecast } from '../lib/algorithms/traffic';
import { TRAFFIC_PRESETS, TrafficPreset, getTrafficColor, getTrafficLabel } from '../lib/algorithms/trafficSimulation';

interface RouteResult {
  path: string[];
  distance: number;
  estimatedTime: number;
  safetyScore: SafetyScore;
  congestion: CongestionForecast;
}

interface AppState {
  nodes: Node[];
  edges: Edge[];
  landmarks: ReturnType<typeof getLandmarks>;
  crimeHotspots: ReturnType<typeof generateCrimeHotspots>;
  graph: ReturnType<typeof buildGraph> | null;
  
  origin: string | null;
  destination: string | null;
  routeResult: RouteResult | null;
  
  isCalculating: boolean;
  prioritizeSafety: boolean;
  showHeatmap: boolean;
  showRoute: boolean;
  
  sensitivityLevel: number;
  
  trafficLevel: number;
  trafficPreset: TrafficPreset;
  isRushHour: boolean;
  isNightMode: boolean;
  weatherCondition: 'clear' | 'rain' | 'snow' | 'fog';
  barricades: { id: number; x: number; z: number; active: boolean }[];
  
  currentTime: Date;
  
  initializeData: () => void;
  setOrigin: (nodeId: string | null) => void;
  setDestination: (nodeId: string | null) => void;
  calculateRoute: () => void;
  toggleSafetyPriority: () => void;
  toggleHeatmap: () => void;
  toggleRoute: () => void;
  setSensitivityLevel: (level: number) => void;
  setTrafficLevel: (level: number) => void;
  setTrafficPreset: (preset: TrafficPreset) => void;
  setNightMode: (isNight: boolean) => void;
  setWeatherCondition: (condition: 'clear' | 'rain' | 'snow' | 'fog') => void;
  toggleBarricade: (id: number) => void;
  updateTime: () => void;
}

const grid = generateManhattanGrid();
const crimeHotspots = generateCrimeHotspots();
const landmarks = getLandmarks();

export const useAppStore = create<AppState>((set, get) => ({
  nodes: grid.nodes,
  edges: grid.edges,
  landmarks,
  crimeHotspots,
  graph: buildGraph(grid.nodes, grid.edges),
  
  origin: null,
  destination: null,
  routeResult: null,
  
  isCalculating: false,
  prioritizeSafety: false,
  showHeatmap: true,
  showRoute: false,
  
  sensitivityLevel: 50,
  
  trafficLevel: 50,
  trafficPreset: 'normal',
  isRushHour: false,
  isNightMode: true,
  weatherCondition: 'clear',
  barricades: [
    { id: 1, x: 3, z: 4, active: false },
    { id: 2, x: 7, z: 6, active: false },
    { id: 3, x: 11, z: 8, active: false },
    { id: 4, x: 5, z: 10, active: false },
    { id: 5, x: 9, z: 4, active: false },
  ],
  
  currentTime: new Date(),
  
  initializeData: () => {
    const gridData = generateManhattanGrid();
    const hotspots = generateCrimeHotspots();
    const lands = getLandmarks();
    set({
      nodes: gridData.nodes,
      edges: gridData.edges,
      crimeHotspots: hotspots,
      landmarks: lands,
      graph: buildGraph(gridData.nodes, gridData.edges),
    });
  },
  
  setOrigin: (nodeId) => {
    set({ origin: nodeId, routeResult: null });
    const { destination, calculateRoute } = get();
    if (destination && nodeId && get().graph) {
      calculateRoute();
    }
  },
  
  setDestination: (nodeId) => {
    set({ destination: nodeId, routeResult: null });
    const { origin, calculateRoute } = get();
    if (origin && nodeId && get().graph) {
      calculateRoute();
    }
  },
  
  calculateRoute: () => {
    const { graph, origin, destination, prioritizeSafety, nodes, crimeHotspots, currentTime, sensitivityLevel } = get();
    if (!graph || !origin || !destination) return;
    
    set({ isCalculating: true });
    
    setTimeout(() => {
      const pathResult = dijkstra(graph, origin, destination, prioritizeSafety);
      
      if (!pathResult) {
        set({ isCalculating: false, routeResult: null });
        return;
      }
      
      const pathNodes = pathResult.path
        .map(id => nodes.find(n => n.id === id))
        .filter(Boolean) as Node[];
      
      const safetyScore = calculateRouteSafety(pathNodes, get().crimeHotspots, get().currentTime.getHours(), sensitivityLevel);
      const congestion = predictCongestion(pathNodes, get().currentTime, pathResult.distance);
      
      set({
        routeResult: {
          path: pathResult.path,
          distance: pathResult.distance,
          estimatedTime: pathResult.estimatedTime,
          safetyScore,
          congestion,
        },
        isCalculating: false,
        showRoute: true,
      });
    }, 100);
  },
  
  toggleSafetyPriority: () => {
    set((state) => ({ prioritizeSafety: !state.prioritizeSafety }));
    const { origin, destination } = get();
    if (origin && destination) {
      get().calculateRoute();
    }
  },
  
  toggleHeatmap: () => {
    set((state) => ({ showHeatmap: !state.showHeatmap }));
  },
  
  toggleRoute: () => {
    set((state) => ({ showRoute: !state.showRoute }));
  },
  
  setSensitivityLevel: (level: number) => {
    set({ sensitivityLevel: level });
    const { origin, destination } = get();
    if (origin && destination) {
      get().calculateRoute();
    }
  },
  
  setTrafficLevel: (level: number) => {
    const preset = (Object.entries(TRAFFIC_PRESETS).find(([_, p]) => 
      Math.abs(p.level - level) < 10
    )?.[0] as TrafficPreset) || 'normal';
    set({ trafficLevel: level, trafficPreset: preset, isRushHour: level > 85 });
  },
  
  setTrafficPreset: (preset: TrafficPreset) => {
    const presetData = TRAFFIC_PRESETS[preset];
    set({ 
      trafficLevel: presetData.level, 
      trafficPreset: preset, 
      isRushHour: preset === 'rush' || preset === 'gridlock' 
    });
  },
  
  toggleBarricade: (id: number) => {
    set((state) => ({
      barricades: state.barricades.map(b => 
        b.id === id ? { ...b, active: !b.active } : b
      ),
    }));
  },
  
  setNightMode: (isNight: boolean) => {
    set({ isNightMode: isNight, isRushHour: isNight });
  },
  
  setWeatherCondition: (condition: 'clear' | 'rain' | 'snow' | 'fog') => {
    set({ weatherCondition: condition });
  },
  
  updateTime: () => {
    set({ currentTime: new Date() });
  },
}));