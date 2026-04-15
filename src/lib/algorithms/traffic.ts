import { Node } from '../data/nycData';

export interface CongestionForecast {
  current: number;
  plus15min: number;
  plus30min: number;
  plus60min: number;
  bestDeparture: string;
  recommendation: string;
}

export interface TrafficPattern {
  hour: number;
  dayType: 'weekday' | 'weekend';
  congestion: number;
}

const WEEKDAY_PATTERNS: TrafficPattern[] = [
  { hour: 0, dayType: 'weekday', congestion: 0.2 },
  { hour: 6, dayType: 'weekday', congestion: 0.4 },
  { hour: 7, dayType: 'weekday', congestion: 0.7 },
  { hour: 8, dayType: 'weekday', congestion: 0.95 },
  { hour: 9, dayType: 'weekday', congestion: 0.75 },
  { hour: 10, dayType: 'weekday', congestion: 0.5 },
  { hour: 11, dayType: 'weekday', congestion: 0.55 },
  { hour: 12, dayType: 'weekday', congestion: 0.7 },
  { hour: 13, dayType: 'weekday', congestion: 0.6 },
  { hour: 14, dayType: 'weekday', congestion: 0.55 },
  { hour: 15, dayType: 'weekday', congestion: 0.65 },
  { hour: 16, dayType: 'weekday', congestion: 0.85 },
  { hour: 17, dayType: 'weekday', congestion: 1.0 },
  { hour: 18, dayType: 'weekday', congestion: 0.9 },
  { hour: 19, dayType: 'weekday', congestion: 0.65 },
  { hour: 20, dayType: 'weekday', congestion: 0.45 },
  { hour: 21, dayType: 'weekday', congestion: 0.35 },
  { hour: 22, dayType: 'weekday', congestion: 0.25 },
  { hour: 23, dayType: 'weekday', congestion: 0.2 },
];

const WEEKEND_PATTERNS: TrafficPattern[] = [
  { hour: 0, dayType: 'weekend', congestion: 0.15 },
  { hour: 6, dayType: 'weekend', congestion: 0.2 },
  { hour: 8, dayType: 'weekend', congestion: 0.3 },
  { hour: 10, dayType: 'weekend', congestion: 0.4 },
  { hour: 12, dayType: 'weekend', congestion: 0.5 },
  { hour: 14, dayType: 'weekend', congestion: 0.55 },
  { hour: 16, dayType: 'weekend', congestion: 0.5 },
  { hour: 18, dayType: 'weekend', congestion: 0.45 },
  { hour: 20, dayType: 'weekend', congestion: 0.35 },
  { hour: 22, dayType: 'weekend', congestion: 0.25 },
  { hour: 23, dayType: 'weekend', congestion: 0.15 },
];

export function predictCongestion(
  pathNodes: Node[],
  currentTime: Date,
  routeDistance: number
): CongestionForecast {
  const hour = currentTime.getHours();
  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
  const patterns = isWeekend ? WEEKEND_PATTERNS : WEEKDAY_PATTERNS;

  const getCongestionAtHour = (h: number): number => {
    const pattern = patterns.find(p => p.hour === h);
    return pattern ? pattern.congestion : 0.5;
  };

  const nodeTrafficWeight = pathNodes.reduce((sum, node) => sum + node.trafficLevel, 0) / pathNodes.length;
  const baseCongestion = getCongestionAtHour(hour) * nodeTrafficWeight;

  const current = Math.min(100, baseCongestion * 100);
  const plus15 = predictFutureCongestion(currentTime, 15, pathNodes);
  const plus30 = predictFutureCongestion(currentTime, 30, pathNodes);
  const plus60 = predictFutureCongestion(currentTime, 60, pathNodes);

  let bestDeparture = 'Now';
  let recommendation = '';

  if (current > 70) {
    const bestTime = findBestDepartureTime(currentTime, pathNodes, routeDistance);
    bestDeparture = bestTime;
    recommendation = `Current traffic is heavy. Consider departing in ${bestTime} to save time.`;
  } else if (plus15 > 80) {
    recommendation = 'Traffic expected to increase in 15 minutes. Leave now to avoid delays.';
  } else {
    recommendation = 'Traffic conditions are favorable for your trip.';
  }

  return {
    current: Math.round(current),
    plus15min: Math.round(plus15),
    plus30min: Math.round(plus30),
    plus60min: Math.round(plus60),
    bestDeparture,
    recommendation,
  };
}

function predictFutureCongestion(
  currentTime: Date,
  minutesAhead: number,
  pathNodes: Node[]
): number {
  const futureTime = new Date(currentTime.getTime() + minutesAhead * 60000);
  const hour = futureTime.getHours();
  const isWeekend = futureTime.getDay() === 0 || futureTime.getDay() === 6;
  const patterns = isWeekend ? WEEKEND_PATTERNS : WEEKDAY_PATTERNS;

  const getCongestionAtHour = (h: number): number => {
    const pattern = patterns.find(p => p.hour === h);
    return pattern ? pattern.congestion : 0.5;
  };

  const nodeTrafficWeight = pathNodes.reduce((sum, node) => sum + node.trafficLevel, 0) / pathNodes.length;
  const baseCongestion = getCongestionAtHour(hour) * nodeTrafficWeight;
  const rushHourRush = (hour === 8 || hour === 17) ? 1.1 : 1.0;

  return Math.min(100, baseCongestion * 100 * rushHourRush);
}

function findBestDepartureTime(
  currentTime: Date,
  pathNodes: Node[],
  routeDistance: number
): string {
  const currentHour = currentTime.getHours();
  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6;
  const patterns = isWeekend ? WEEKEND_PATTERNS : WEEKDAY_PATTERNS;

  let minCongestion = 100;
  let bestTime = 'Now';

  for (let i = 0; i <= 30; i += 5) {
    const checkTime = new Date(currentTime.getTime() + i * 60000);
    const hour = checkTime.getHours();
    const pattern = patterns.find(p => p.hour === hour);
    
    if (pattern && pattern.congestion < minCongestion) {
      minCongestion = pattern.congestion;
      bestTime = `+${i} min`;
    }
  }

  return bestTime;
}

export function getCongestionColor(level: number): string {
  if (level < 30) return '#22c55e';
  if (level < 50) return '#84cc16';
  if (level < 70) return '#eab308';
  if (level < 85) return '#f97316';
  return '#ef4444';
}

export function getCongestionLabel(level: number): string {
  if (level < 30) return 'Clear';
  if (level < 50) return 'Light';
  if (level < 70) return 'Moderate';
  if (level < 85) return 'Heavy';
  return 'Severe';
}