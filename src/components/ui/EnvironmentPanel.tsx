'use client';

import { useAppStore } from '../../stores/appStore';

export function EnvironmentPanel() {
  const isNightMode = useAppStore((state) => state.isNightMode);
  const weatherCondition = useAppStore((state) => state.weatherCondition);
  const setNightMode = useAppStore((state) => state.setNightMode);
  const setWeatherCondition = useAppStore((state) => state.setWeatherCondition);

  const weatherOptions = [
    { id: 'clear', label: '☀️ Clear', color: '#22c55e' },
    { id: 'rain', label: '🌧️ Rain', color: '#3b82f6' },
    { id: 'snow', label: '❄️ Snow', color: '#a78bfa' },
    { id: 'fog', label: '🌫️ Fog', color: '#64748b' },
  ] as const;

  return (
    <div 
      className="absolute bottom-4 right-4 w-72"
      style={{ 
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(8,10,18,0.98) 100%)',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: '16px',
        boxShadow: '0 0 40px rgba(6,182,212,0.2)'
      }}
    >
      <div className="p-4 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span>🌤️</span> Environment
        </h3>

        {/* Day/Night Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span>{isNightMode ? '🌙' : '☀️'}</span>
            <span className="text-sm text-slate-300">
              {isNightMode ? 'Night Mode' : 'Day Mode'}
            </span>
          </div>
          <button
            onClick={() => setNightMode(!isNightMode)}
            className={`relative w-12 h-6 rounded-full transition-all ${
              isNightMode 
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
            }`}
          >
            <div 
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${
                isNightMode ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Weather Selection */}
        <div>
          <p className="text-xs text-slate-400 mb-2">Weather Condition</p>
          <div className="grid grid-cols-2 gap-2">
            {weatherOptions.map((weather) => (
              <button
                key={weather.id}
                onClick={() => setWeatherCondition(weather.id)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  weatherCondition === weather.id
                    ? 'text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
                }`}
                style={{
                  background: weatherCondition === weather.id 
                    ? `${weather.color}30` 
                    : undefined,
                  border: weatherCondition === weather.id 
                    ? `1px solid ${weather.color}60` 
                    : undefined,
                }}
              >
                {weather.label}
              </button>
            ))}
          </div>
        </div>

        {/* Environment Status */}
        <div className="p-2 rounded-lg bg-slate-900/50 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                background: weatherCondition === 'clear' ? '#22c55e' :
                           weatherCondition === 'rain' ? '#3b82f6' :
                           weatherCondition === 'snow' ? '#a78bfa' : '#64748b',
                boxShadow: `0 0 8px ${
                  weatherCondition === 'clear' ? '#22c55e' :
                  weatherCondition === 'rain' ? '#3b82f6' :
                  weatherCondition === 'snow' ? '#a78bfa' : '#64748b'
                }`
              }}
            />
            <span>Active: {weatherCondition.charAt(0).toUpperCase() + weatherCondition.slice(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}