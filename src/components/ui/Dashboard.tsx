'use client';

import { useAppStore } from '../../stores/appStore';
import { getSafetyColor } from '../../lib/algorithms/safety';

export function Dashboard() {
  const routeResult = useAppStore((state) => state.routeResult);
  const currentTime = useAppStore((state) => state.currentTime);

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="absolute top-4 right-4 space-y-2">
      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
        <h3 className="text-sm font-semibold text-slate-400 mb-2">Live Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{timeString}</p>
            <p className="text-xs text-slate-500">Current Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">NYC</p>
            <p className="text-xs text-slate-500">Simulated City</p>
          </div>
        </div>
      </div>

      {routeResult && (
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Route Analytics</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Safety</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${routeResult.safetyScore.overall}%`,
                      backgroundColor: getSafetyColor(routeResult.safetyScore.overall),
                    }}
                  />
                </div>
                <span className="text-xs font-bold" style={{ color: getSafetyColor(routeResult.safetyScore.overall) }}>
                  {routeResult.safetyScore.overall}/100
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Traffic</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${routeResult.congestion.current}%`,
                      backgroundColor: routeResult.congestion.current > 70 ? '#ef4444' : routeResult.congestion.current > 40 ? '#eab308' : '#22c55e',
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-white">
                  {routeResult.congestion.current}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>AI Agents Active</span>
        </div>
      </div>
    </div>
  );
}