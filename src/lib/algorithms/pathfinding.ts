import { Node, Edge } from '../data/nycData';

interface Graph {
  nodes: Node[];
  edges: Edge[];
  adjacency: Map<string, Edge[]>;
}

export function buildGraph(nodes: Node[], edges: Edge[]): Graph {
  const adjacency = new Map<string, Edge[]>();
  
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }
  
  for (const edge of edges) {
    const neighbors = adjacency.get(edge.from);
    if (neighbors) {
      neighbors.push(edge);
    }
  }
  
  return { nodes, edges, adjacency };
}

interface PathResult {
  path: string[];
  distance: number;
  estimatedTime: number;
  safetyScore: number;
}

export function dijkstra(
  graph: Graph,
  startId: string,
  endId: string,
  prioritizeSafety: boolean = false
): PathResult | null {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const pq: { id: string; dist: number }[] = [];

  for (const node of graph.nodes) {
    distances.set(node.id, Infinity);
  }
  distances.set(startId, 0);
  pq.push({ id: startId, dist: 0 });

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { id: currentId } = pq.shift()!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    if (currentId === endId) break;

    const neighbors = graph.adjacency.get(currentId) || [];
    const currentNode = graph.nodes.find(n => n.id === currentId);
    if (!currentNode) continue;

    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      let edgeWeight = edge.distance * edge.trafficFactor;
      if (prioritizeSafety) {
        const targetNode = graph.nodes.find(n => n.id === edge.to);
        if (targetNode) {
          edgeWeight = edge.distance * (0.3 + edge.trafficFactor * 0.5 + targetNode.crimeRate * 0.2);
        }
      }

      const newDist = (distances.get(currentId) || 0) + edgeWeight;
      const oldDist = distances.get(edge.to) || Infinity;

      if (newDist < oldDist) {
        distances.set(edge.to, newDist);
        previous.set(edge.to, currentId);
        pq.push({ id: edge.to, dist: newDist });
      }
    }
  }

  const path: string[] = [];
  let current: string | null = endId;
  let totalDistance = 0;

  if (distances.get(endId) === Infinity) return null;

  while (current) {
    path.unshift(current);
    const prev: string | null = previous.get(current) ?? null;
    if (prev) {
      const edge = graph.edges.find(
        e => e.from === prev && e.to === current
      );
      if (edge) {
        totalDistance += edge.distance;
      }
    }
    current = prev;
  }

  if (path[0] !== startId) return null;

  let totalCrime = 0;
  for (const nodeId of path) {
    const node = graph.nodes.find(n => n.id === nodeId);
    if (node) totalCrime += node.crimeRate;
  }
  const safetyScore = Math.max(0, 100 - (totalCrime / path.length) * 100);

  return {
    path,
    distance: totalDistance,
    estimatedTime: totalDistance * 3,
    safetyScore: Math.round(safetyScore),
  };
}

export function findNearestNodeId(x: number, y: number, nodes: Node[]): string {
  let nearest = nodes[0].id;
  let minDist = Infinity;

  for (const node of nodes) {
    if (node.type === 'intersection') {
      const dist = Math.abs(node.x - x) + Math.abs(node.y - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = node.id;
      }
    }
  }

  return nearest;
}

export function getNodeById(id: string, nodes: Node[]): Node | undefined {
  return nodes.find(n => n.id === id);
}

export function getPathCoordinates(path: string[], nodes: Node[]): { x: number; y: number }[] {
  return path
    .map(id => {
      const node = nodes.find(n => n.id === id);
      return node ? { x: node.x, y: node.y } : null;
    })
    .filter(Boolean) as { x: number; y: number }[];
}