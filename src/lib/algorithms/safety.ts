import { Node, CrimeHotspot } from '../data/nycData';

export interface SafetyScore {
  overall: number;
  daytime: number;
  nighttime: number;
  factors: string[];
}

export function calculateRouteSafety(
  pathNodes: Node[],
  hotspots: CrimeHotspot[],
  timeOfDay: number,
  sensitivityLevel: number = 50
): SafetyScore {
  let totalCrime = 0;
  let totalTraffic = 0;

  const sensitivityFactor = sensitivityLevel / 50;

  for (const node of pathNodes) {
    totalCrime += node.crimeRate;
    totalTraffic += node.trafficLevel;
  }

  const avgCrime = totalCrime / pathNodes.length;
  const avgTraffic = totalTraffic / pathNodes.length;

  const isNight = timeOfDay < 6 || timeOfDay > 22;
  const nightModifier = isNight ? 1.5 : 1.0;

  const nearbyHotspots = countNearbyHotspots(pathNodes, hotspots);
  const hotspotPenalty = nearbyHotspots * 0.15;

  const baseScore = 100 - (avgCrime * 40 * nightModifier * sensitivityFactor) - (avgTraffic * 20) - (hotspotPenalty * 100 * sensitivityFactor);

  let finalScore = Math.max(0, Math.min(100, baseScore));
  const adjustedForNight = isNight ? finalScore * 0.7 : finalScore;

  const factors: string[] = [];
  if (avgCrime > 0.5) factors.push('High crime area');
  if (avgTraffic > 0.7) factors.push('Heavy traffic');
  if (nearbyHotspots > 2) factors.push('Near crime hotspots');
  if (isNight) factors.push('Night travel - reduced visibility');

  return {
    overall: Math.round(finalScore),
    daytime: Math.round(finalScore),
    nighttime: Math.round(adjustedForNight),
    factors,
  };
}

function countNearbyHotspots(pathNodes: Node[], hotspots: CrimeHotspot[]): number {
  let count = 0;
  const threshold = 2;

  for (const node of pathNodes) {
    for (const hotspot of hotspots) {
      const dist = Math.abs(node.x - hotspot.x) + Math.abs(node.y - hotspot.y);
      if (dist < threshold) {
        count += hotspot.severity;
      }
    }
  }

  return count / pathNodes.length;
}

export function getSafetyLevel(score: number): string {
  if (score >= 80) return 'Very Safe';
  if (score >= 60) return 'Safe';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Caution';
  return 'High Risk';
}

export function getSafetyColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#ef4444';
}