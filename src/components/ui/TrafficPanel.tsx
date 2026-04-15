'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { TRAFFIC_PRESETS, TrafficPreset, STRESS_SCENARIOS, getTrafficColor, getTrafficLabel } from '../../lib/algorithms/trafficSimulation';

export function TrafficPanel() {
  const trafficLevel = useAppStore((state) => state.trafficLevel);
  const trafficPreset = useAppStore((state) => state.trafficPreset);
  const barricades = useAppStore((state) => state.barricades);
  const setTrafficLevel = useAppStore((state) => state.setTrafficLevel);
  const setTrafficPreset = useAppStore((state) => state.setTrafficPreset);
  const toggleBarricade = useAppStore((state) => state.toggleBarricade);

  const [activeTab, setActiveTab] = useState<'controls' | 'barricades' | 'stress'>('controls');

  const activeBarricadeCount = useMemo(() => 
    barricades.filter(b => b.active).length, 
  [barricades]
  );

  const trafficColor = getTrafficColor(trafficLevel);
  const trafficLabel = getTrafficLabel(trafficLevel);

  const tabs = [
    { id: 'controls', label: 'Traffic' },
    { id: 'barricades', label: `Barricades (${activeBarricadeCount})` },
    { id: 'stress', label: 'Stress Test' },
  ] as const;

  return (
    <div 
      className="absolute top-4 right-4 w-80"
      style={{ 
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(8,10,18,0.98) 100%)',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: '16px',
        boxShadow: '0 0 40px rgba(6,182,212,0.2)'
      }}
    >
      <div className="p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>🚦</span> Traffic Control
          <span 
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ 
              background: `${trafficColor}20`, 
              color: trafficColor,
              border: `1px solid ${trafficColor}40`
            }}
          >
            {trafficLabel} ({trafficLevel}%)
          </span>
        </h3>

        <div className="flex gap-1 mb-4 bg-slate-900/50 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'controls' && (
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={trafficLevel}
              onChange={(e) => setTrafficLevel(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #eab308 50%, #ef4444 100%)`
              }}
            />
            
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TRAFFIC_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setTrafficPreset(key as TrafficPreset)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    trafficPreset === key
                      ? 'text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
                  }`}
                  style={{
                    background: trafficPreset === key 
                      ? `${preset.color}30` 
                      : undefined,
                    border: trafficPreset === key 
                      ? `1px solid ${preset.color}60` 
                      : undefined,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (trafficLevel > 80) setTrafficLevel(50);
                else setTrafficLevel(95);
              }}
              className="w-full py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 transition-all"
            >
              {trafficLevel > 80 ? '🟢 End Rush Hour' : '🔴 Simulate Rush Hour'}
            </button>
          </div>
        )}

        {activeTab === 'barricades' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 mb-2">
              Click barricades to toggle them. Blocked traffic will stop.
            </p>
            {barricades.map(b => (
              <button
                key={b.id}
                onClick={() => toggleBarricade(b.id)}
                className={`w-full p-3 rounded-lg text-sm font-medium flex items-center justify-between transition-all ${
                  b.active 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700'
                }`}
              >
                <span>🚧 Barricade #{b.id}</span>
                <span className={b.active ? 'text-red-400' : 'text-slate-500'}>
                  {b.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </button>
            ))}
            
            <div className="mt-3 p-2 rounded-lg bg-slate-900/50 text-xs text-slate-400">
              <span className="text-yellow-400">💡 Tip:</span> Place barricades on major roads to create 
              traffic jams and test route alternatives.
            </div>
          </div>
        )}

        {activeTab === 'stress' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 mb-2">
              Run stress scenarios to test system under extreme conditions.
            </p>
            {STRESS_SCENARIOS.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setTrafficLevel(scenario.level)}
                className="w-full p-3 rounded-lg text-sm font-medium flex items-center justify-between bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 transition-all"
              >
                <div className="text-left">
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-xs text-slate-500">
                    Peak hour: {scenario.hour}:00 • Traffic: {scenario.level}%
                  </div>
                </div>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ 
                    background: `${getTrafficColor(scenario.level)}30`,
                    color: getTrafficColor(scenario.level)
                  }}
                >
                  {scenario.level}%
                </div>
              </button>
            ))}
            
            <button
              onClick={() => setTrafficLevel(100)}
              className="w-full py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 transition-all mt-2"
            >
              💀 MAX STRESS: GRIDLOCK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}