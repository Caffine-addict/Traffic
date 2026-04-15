'use client';

import dynamic from 'next/dynamic';
import { RoutePanel } from '../components/ui/RoutePanel';
import { ResultsPanel } from '../components/ui/ResultsPanel';
import { Dashboard } from '../components/ui/Dashboard';
import { TrafficPanel } from '../components/ui/TrafficPanel';
import { EnvironmentPanel } from '../components/ui/EnvironmentPanel';

const Scene = dynamic(() => import('../components/scene/Scene').then(mod => mod.Scene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-slate-400">Loading 3D City...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Scene />
      
      <RoutePanel />
      <ResultsPanel />
      <Dashboard />
      <TrafficPanel />
      <EnvironmentPanel />
      
      <div className="absolute bottom-4 right-4 text-xs text-slate-600">
        Powered by AI Agents • UrbanPath AI System
      </div>
    </div>
  );
}