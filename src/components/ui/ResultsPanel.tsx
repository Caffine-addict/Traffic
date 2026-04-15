'use client';

import { useAppStore } from '../../stores/appStore';
import { getSafetyLevel, getSafetyColor } from '../../lib/algorithms/safety';
import { getCongestionColor, getCongestionLabel } from '../../lib/algorithms/traffic';

export function ResultsPanel() {
  const routeResult = useAppStore((state) => state.routeResult);
  const isCalculating = useAppStore((state) => state.isCalculating);

  if (isCalculating) {
    return (
      <div 
        className="absolute bottom-4 left-4 w-80 p-5"
        style={{ 
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(8,10,18,0.98) 100%)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: '16px',
          boxShadow: '0 0 40px rgba(6,182,212,0.2)'
        }}
      >
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-12 h-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
        <p className="text-center text-cyan-300 text-sm mt-4">Calculating route...</p>
      </div>
    );
  }

  if (!routeResult) {
    return (
      <div 
        className="absolute bottom-4 left-4 w-80 p-5"
        style={{ 
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(8,10,18,0.98) 100%)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: '16px',
          boxShadow: '0 0 40px rgba(6,182,212,0.2)'
        }}
      >
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🌆</div>
          <p className="text-slate-400 text-sm">
            Select origin & destination<br/>to find your optimal route
          </p>
        </div>
      </div>
    );
  }

  const { distance, estimatedTime, safetyScore, congestion } = routeResult;
  const minutes = Math.round(estimatedTime);
  const safetyColor = getSafetyColor(safetyScore.overall);
  const congestionColor = getCongestionColor(congestion.current);

  return (
    <div 
      className="absolute bottom-4 left-4 w-80"
      style={{ 
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(8,10,18,0.98) 100%)',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: '16px',
        boxShadow: '0 0 40px rgba(6,182,212,0.2)'
      }}
    >
      <div className="p-5 space-y-4">
        {/* Route Stats */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>📊</span> Route Analytics
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="p-3 rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 100%)',
                border: '1px solid rgba(6,182,212,0.2)'
              }}
            >
              <p className="text-xs text-cyan-400">Distance</p>
              <p className="text-2xl font-bold text-white">{distance.toFixed(1)}</p>
              <p className="text-xs text-slate-500">kilometers</p>
            </div>
            
            <div 
              className="p-3 rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 100%)',
                border: '1px solid rgba(168,85,247,0.2)'
              }}
            >
              <p className="text-xs text-purple-400">Est. Time</p>
              <p className="text-2xl font-bold text-white">{minutes}</p>
              <p className="text-xs text-slate-500">minutes</p>
            </div>
            
            <div 
              className="p-3 rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
                border: '1px solid rgba(34,197,94,0.2)'
              }}
            >
              <p className="text-xs text-emerald-400">Safety</p>
              <p className="text-2xl font-bold" style={{ color: safetyColor }}>
                {safetyScore.overall}
              </p>
              <p className="text-xs" style={{ color: safetyColor }}>
                {getSafetyLevel(safetyScore.overall)}
              </p>
            </div>
            
            <div 
              className="p-3 rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.05) 100%)',
                border: '1px solid rgba(251,191,36,0.2)'
              }}
            >
              <p className="text-xs text-yellow-400">Traffic</p>
              <p className="text-2xl font-bold" style={{ color: congestionColor }}>
                {congestion.current}%
              </p>
              <p className="text-xs" style={{ color: congestionColor }}>
                {getCongestionLabel(congestion.current)}
              </p>
            </div>
          </div>
        </div>

        {/* Traffic Forecast */}
        <div className="pt-3 border-t border-cyan-500/20">
          <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
            <span>🚦</span> Traffic Forecast
          </h4>
          <div className="flex gap-2">
            {[
              { label: '+15m', value: congestion.plus15min },
              { label: '+30m', value: congestion.plus30min },
              { label: '+60m', value: congestion.plus60min },
            ].map((item) => (
              <div key={item.label} className="flex-1 text-center p-2 rounded-lg bg-slate-900/50">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="font-bold" style={{ color: getCongestionColor(item.value) }}>
                  {item.value}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Notes */}
        {safetyScore.factors.length > 0 && (
          <div className="pt-3 border-t border-cyan-500/20">
            <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
              <span>⚠️</span> Safety Notes
            </h4>
            <div className="space-y-1">
              {safetyScore.factors.map((factor, i) => (
                <p key={i} className="text-xs text-amber-400 flex items-center gap-1">
                  <span>•</span> {factor}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}