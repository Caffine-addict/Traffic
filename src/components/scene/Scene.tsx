'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { City } from './City';
import { SafetyHeatmap } from './SafetyHeatmap';
import { Route3D } from './Route3D';
import { Simulations } from './Simulations';
import { TrafficController3D, Barricades3D } from './TrafficController';
import { InstancedVehicles, InstancedParticles } from './InstancedRendering';
import { DayNightCycle, WeatherEffects, EnhancedFog } from './EnvironmentEffects';
import { useAppStore } from '../../stores/appStore';

function Lights() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.5}
        castShadow
        color="#4fc3f7"
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-10, 15, -10]}
        intensity={0.2}
        color="#f472b6"
      />
      <pointLight position={[0, 8, 0]} color="#ffffff" intensity={0.3} />
      <hemisphereLight
        color="#4fc3f7"
        groundColor="#1a1a2e"
        intensity={0.3}
      />
    </>
  );
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7.5, -0.1, 5]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#080810" roughness={0.9} />
      </mesh>
    </>
  );
}

export function Scene() {
  const trafficLevel = useAppStore((state) => state.trafficLevel);
  const barricades = useAppStore((state) => state.barricades);
  const toggleBarricade = useAppStore((state) => state.toggleBarricade);
  const isNightMode = useAppStore((state) => state.isNightMode);
  const weatherCondition = useAppStore((state) => state.weatherCondition);

  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [12, 12, 12], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%)' }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={[isNightMode ? '#050510' : '#1a1a3a']} />
          <EnhancedFog />
          
          <DayNightCycle />
          <Lights />
          <Ground />
          
          <Stars 
            radius={80} 
            depth={40} 
            count={isNightMode ? 3000 : 1000} 
            factor={3} 
            fade 
            speed={0.5}
          />
          
          <City />
          <SafetyHeatmap />
          <Route3D />
          <Simulations />
          
          {/* Enhanced traffic with instancing */}
          <InstancedVehicles count={Math.floor(trafficLevel / 5) + 10} />
          <InstancedParticles count={weatherCondition === 'rain' ? 500 : 200} />
          <WeatherEffects />
          
          <TrafficController3D 
            trafficLevel={trafficLevel} 
            barricades={barricades} 
          />
          <Barricades3D 
            barricades={barricades} 
            onToggle={(id) => toggleBarricade(id)}
          />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={4}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate={false}
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}