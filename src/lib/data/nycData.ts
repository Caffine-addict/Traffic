export interface Coordinates {
  x: number;
  y: number;
  street?: string;
  avenue?: string;
}

export interface Node {
  id: string;
  x: number;
  y: number;
  name: string;
  type: 'intersection' | 'landmark' | 'station';
  crimeRate: number;
  trafficLevel: number;
}

export interface Edge {
  from: string;
  to: string;
  distance: number;
  trafficFactor: number;
  hasCrosswalk: boolean;
}

export interface CrimeHotspot {
  x: number;
  y: number;
  severity: number;
  type: 'theft' | 'assault' | 'burglary';
}

export interface Landmark {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
  height: number;
}

const GRID_SIZE_X = 30;
const GRID_SIZE_Y = 20;
const BLOCK_SIZE = 0.5;

export function generateManhattanGrid(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, Node>();

  for (let x = 0; x < GRID_SIZE_X; x++) {
    for (let y = 0; y < GRID_SIZE_Y; y++) {
      const streetNum = y + 1;
      const avenueNum = x + 1;
      const isBroadway = (x === y) || (x === y + 1) || (x === y - 1);
      
      let crimeRate = Math.random() * 0.3;
      if (x < 5 && y < 8) crimeRate += 0.4;
      if (x > 20 && y > 10) crimeRate += 0.3;
      if (isBroadway) crimeRate += 0.1;
      
      let trafficLevel = 0.5;
      if (x > 10 && x < 20 && y > 5 && y < 15) trafficLevel = 0.9;
      if (x % 5 === 0) trafficLevel += 0.2;
      if (y % 5 === 0) trafficLevel += 0.2;

      const id = `n${x}_${y}`;
      const node: Node = {
        id,
        x: x * BLOCK_SIZE,
        y: y * BLOCK_SIZE,
        name: isBroadway 
          ? `Broadway & ${streetNum}${getOrdinal(streetNum)} St`
          : `${avenueNum}${getOrdinal(avenueNum)} Ave & ${streetNum}${getOrdinal(streetNum)} St`,
        type: 'intersection',
        crimeRate: Math.min(1, crimeRate),
        trafficLevel: Math.min(1, trafficLevel),
      };
      nodes.push(node);
      nodeMap.set(id, node);
    }
  }

  const landmarks: Landmark[] = [
    { id: 'central_park', name: 'Central Park', x: 10 * BLOCK_SIZE, y: 14 * BLOCK_SIZE, type: 'park', height: 0 },
    { id: 'empire_state', name: 'Empire State Building', x: 18 * BLOCK_SIZE, y: 12 * BLOCK_SIZE, type: 'landmark', height: 15 },
    { id: 'times_square', name: 'Times Square', x: 22 * BLOCK_SIZE, y: 8 * BLOCK_SIZE, type: 'landmark', height: 8 },
    { id: 'wall_st', name: 'Wall Street', x: 4 * BLOCK_SIZE, y: 2 * BLOCK_SIZE, type: 'landmark', height: 10 },
    { id: 'grand_central', name: 'Grand Central', x: 20 * BLOCK_SIZE, y: 10 * BLOCK_SIZE, type: 'station', height: 6 },
    { id: 'columbus_circle', name: 'Columbus Circle', x: 8 * BLOCK_SIZE, y: 8 * BLOCK_SIZE, type: 'landmark', height: 5 },
    { id: 'union_square', name: 'Union Square', x: 12 * BLOCK_SIZE, y: 6 * BLOCK_SIZE, type: 'park', height: 0 },
    { id: 'flatiron', name: 'Flatiron Building', x: 14 *BLOCK_SIZE, y: 7 * BLOCK_SIZE, type: 'landmark', height: 12 },
  ];

  const landmarkNodes: Node[] = landmarks.map((l, i) => ({
    id: l.id,
    x: l.x,
    y: l.y,
    name: l.name,
    type: l.type === 'station' ? 'station' : 'landmark' as const,
    crimeRate: l.type === 'park' ? 0.2 : 0.5 + Math.random() * 0.3,
    trafficLevel: l.type === 'landmark' ? 0.8 : 0.6,
  }));
  nodes.push(...landmarkNodes);

  for (let x = 0; x < GRID_SIZE_X; x++) {
    for (let y = 0; y < GRID_SIZE_Y; y++) {
      const currentId = `n${x}_${y}`;
      
      if (x < GRID_SIZE_X - 1) {
        const rightId = `n${x + 1}_${y}`;
        const currentNode = nodeMap.get(currentId)!;
        const rightNode = nodeMap.get(rightId)!;
        const distance = BLOCK_SIZE;
        const trafficFactor = (currentNode.trafficLevel + rightNode.trafficLevel) / 2;
        edges.push({ from: currentId, to: rightId, distance, trafficFactor, hasCrosswalk: y % 2 === 0 });
        edges.push({ from: rightId, to: currentId, distance, trafficFactor, hasCrosswalk: y % 2 === 0 });
      }
      
      if (y < GRID_SIZE_Y - 1) {
        const upId = `n${x}_${y + 1}`;
        const currentNode = nodeMap.get(currentId)!;
        const upNode = nodeMap.get(upId)!;
        const distance = BLOCK_SIZE;
        const trafficFactor = (currentNode.trafficLevel + upNode.trafficLevel) / 2;
        edges.push({ from: currentId, to: upId, distance, trafficFactor, hasCrosswalk: x % 2 === 0 });
        edges.push({ from: upId, to: currentId, distance, trafficFactor, hasCrosswalk: x % 2 === 0 });
      }
    }
  }

  for (const landmark of landmarks) {
    const nearestNode = findNearestNode(landmark.x, landmark.y, nodes);
    edges.push({ from: landmark.id, to: nearestNode.id, distance: 0.3, trafficFactor: 0.5, hasCrosswalk: true });
    edges.push({ from: nearestNode.id, to: landmark.id, distance: 0.3, trafficFactor: 0.5, hasCrosswalk: true });
  }

  return { nodes, edges };
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function findNearestNode(x: number, y: number, nodes: Node[]): Node {
  let nearest = nodes[0];
  let minDist = Infinity;
  for (const node of nodes) {
    if (node.type === 'intersection') {
      const dist = Math.abs(node.x - x) + Math.abs(node.y - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    }
  }
  return nearest;
}

export function generateCrimeHotspots(): CrimeHotspot[] {
  const hotspots: CrimeHotspot[] = [];
  
  hotspots.push({ x: 2 * BLOCK_SIZE, y: 3 * BLOCK_SIZE, severity: 0.9, type: 'theft' });
  hotspots.push({ x: 3 * BLOCK_SIZE, y: 5 * BLOCK_SIZE, severity: 0.8, type: 'assault' });
  hotspots.push({ x: 23 * BLOCK_SIZE, y: 7 * BLOCK_SIZE, severity: 0.85, type: 'theft' });
  hotspots.push({ x: 24 * BLOCK_SIZE, y: 9 * BLOCK_SIZE, severity: 0.7, type: 'burglary' });
  hotspots.push({ x: 1 * BLOCK_SIZE, y: 1 * BLOCK_SIZE, severity: 0.75, type: 'theft' });
  hotspots.push({ x: 15 * BLOCK_SIZE, y: 4 * BLOCK_SIZE, severity: 0.6, type: 'theft' });
  hotspots.push({ x: 10 * BLOCK_SIZE, y: 3 * BLOCK_SIZE, severity: 0.65, type: 'assault' });
  hotspots.push({ x: 5 * BLOCK_SIZE, y: 8 * BLOCK_SIZE, severity: 0.5, type: 'burglary' });
  
  return hotspots;
}

export function getLandmarks(): Landmark[] {
  return [
    { id: 'central_park', name: 'Central Park', x: 10 * BLOCK_SIZE, y: 14 * BLOCK_SIZE, type: 'park', height: 0 },
    { id: 'empire_state', name: 'Empire State Building', x: 18 * BLOCK_SIZE, y: 12 * BLOCK_SIZE, type: 'landmark', height: 15 },
    { id: 'times_square', name: 'Times Square', x: 22 * BLOCK_SIZE, y: 8 * BLOCK_SIZE, type: 'landmark', height: 8 },
    { id: 'wall_st', name: 'Wall Street', x: 4 * BLOCK_SIZE, y: 2 * BLOCK_SIZE, type: 'landmark', height: 10 },
    { id: 'grand_central', name: 'Grand Central', x: 20 * BLOCK_SIZE, y: 10 * BLOCK_SIZE, type: 'station', height: 6 },
    { id: 'columbus_circle', name: 'Columbus Circle', x: 8 * BLOCK_SIZE, y: 8 * BLOCK_SIZE, type: 'landmark', height: 5 },
    { id: 'union_square', name: 'Union Square', x: 12 * BLOCK_SIZE, y: 6 * BLOCK_SIZE, type: 'park', height: 0 },
    { id: 'flatiron', name: 'Flatiron Building', x: 14 * BLOCK_SIZE, y: 7 * BLOCK_SIZE, type: 'landmark', height: 12 },
  ];
}

export const BLOCK = BLOCK_SIZE;