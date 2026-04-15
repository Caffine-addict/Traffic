'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Node } from '../../lib/data/nycData';

interface NodeSelectorProps {
  value: string | null;
  onChange: (nodeId: string) => void;
  nodes: Node[];
  placeholder: string;
  label: string;
}

function NodeSelector({ value, onChange, nodes, placeholder, label }: NodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredNodes = useMemo(() => {
    if (!search) return nodes.slice(0, 20);
    return nodes
      .filter((n) => n.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 20);
  }, [nodes, search]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === value);
  }, [nodes, value]);

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-cyan-400 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gradient-to-r from-slate-800/95 to-slate-900/95 border border-cyan-500/30 rounded-lg text-left text-sm text-white hover:border-cyan-400/60 transition-all backdrop-blur"
        style={{ boxShadow: '0 0 20px rgba(6,182,212,0.15)' }}
      >
        {selectedNode ? selectedNode.name : placeholder}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-900/98 border border-cyan-500/40 rounded-lg shadow-2xl max-h-52 overflow-hidden backdrop-blur-lg">
          <div className="p-2 border-b border-cyan-500/20">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 bg-slate-950/80 border border-cyan-500/20 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  onChange(node.id);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-cyan-50 hover:bg-cyan-500/20 transition-colors"
              >
                {node.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RoutePanel() {
  const nodes = useAppStore((state) => state.nodes);
  const origin = useAppStore((state) => state.origin);
  const destination = useAppStore((state) => state.destination);
  const setOrigin = useAppStore((state) => state.setOrigin);
  const setDestination = useAppStore((state) => state.setDestination);
  const prioritizeSafety = useAppStore((state) => state.prioritizeSafety);
  const toggleSafetyPriority = useAppStore((state) => state.toggleSafetyPriority);
  const showHeatmap = useAppStore((state) => state.showHeatmap);
  const toggleHeatmap = useAppStore((state) => state.toggleHeatmap);
  const sensitivityLevel = useAppStore((state) => state.sensitivityLevel);
  const setSensitivityLevel = useAppStore((state) => state.setSensitivityLevel);

  return (
    <div 
      className="absolute top-4 left-4 w-80"
      style={{ 
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(8,10,18,0.98) 100%)',
        border: '1px solid rgba(6,182,212,0.3)',
        borderRadius: '16px',
        boxShadow: '0 0 40px rgba(6,182,212,0.2), inset 0 0 60px rgba(6,182,212,0.05)'
      }}
    >
      <div className="p-5">
        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
          <span className="text-3xl">🗽</span>
          <span style={{ textShadow: '0 0 20px rgba(79,195,247,0.5)' }}>
            UrbanPath AI
          </span>
          <span className="ml-auto text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
            LIVE
          </span>
        </h2>
        
        <div className="space-y-4">
          <NodeSelector
            value={origin}
            onChange={setOrigin}
            nodes={nodes}
            placeholder="📍 Select origin..."
            label="FROM"
          />
          
          <NodeSelector
            value={destination}
            onChange={setDestination}
            nodes={nodes}
            placeholder="🎯 Select destination..."
            label="TO"
          />
          
          <div className="flex gap-2">
            <button
              onClick={toggleSafetyPriority}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                prioritizeSafety
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600'
              }`}
              style={prioritizeSafety ? { boxShadow: '0 0 20px rgba(16,185,234,0.4)' } : {}}
            >
              🛡️ Safety
            </button>
            
            <button
              onClick={toggleHeatmap}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                showHeatmap
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600'
              }`}
              style={showHeatmap ? { boxShadow: '0 0 20px rgba(245,158,11,0.4)' } : {}}
            >
              🔴 Hotspots
            </button>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-cyan-400">Safety Sensitivity</span>
              <span className="text-xs font-bold text-white">{sensitivityLevel}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sensitivityLevel}
              onChange={(e) => setSensitivityLevel(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #8b5cf6 ${sensitivityLevel}%, #334155 ${sensitivityLevel}%, #334155 100%)`
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-500">Low</span>
              <span className="text-xs text-slate-500">High</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-cyan-500/20">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ boxShadow: '0 0 10px #22d3ee' }}></div>
            <span>3 AI Agents Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}