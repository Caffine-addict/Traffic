'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../stores/appStore';

export function DayNightCycle() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  
  const isNight = useAppStore((state) => state.isNightMode);

  useFrame((state) => {
    if (sunRef.current) {
      const targetIntensity = isNight ? 0.1 : 0.8;
      sunRef.current.intensity = THREE.MathUtils.lerp(
        sunRef.current.intensity,
        targetIntensity,
        0.02
      );
    }
    
    if (ambientRef.current) {
      const targetIntensity = isNight ? 0.15 : 0.4;
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        targetIntensity,
        0.02
      );
    }
  });

  return (
    <>
      <directionalLight
        ref={sunRef}
        position={[10, 20, 10]}
        intensity={isNight ? 0.1 : 0.8}
        castShadow
        color={isNight ? '#4fc3f7' : '#ffffff'}
        shadow-mapSize={[2048, 2048]}
      />
      <ambientLight
        ref={ambientRef}
        intensity={isNight ? 0.15 : 0.4}
      />
      <hemisphereLight
        ref={hemiRef}
        color={isNight ? '#1a1a3a' : '#4fc3f7'}
        groundColor={isNight ? '#0a0a14' : '#1a1a2e'}
        intensity={isNight ? 0.2 : 0.5}
      />
    </>
  );
}

export function WeatherEffects() {
  const rainRef = useRef<THREE.Points>(null);
  const weatherCondition = useAppStore((state) => state.weatherCondition);
  
  const rainCount = 1000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = Math.random() * 20 - 5;
      pos[i * 3 + 1] = Math.random() * 15;
      pos[i * 3 + 2] = Math.random() * 15 - 2;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!rainRef.current || weatherCondition !== 'rain') return;
    
    const posArray = rainRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < rainCount; i++) {
      posArray[i * 3 + 1] -= delta * 15;
      
      if (posArray[i * 3 + 1] < 0) {
        posArray[i * 3 + 1] = 15;
        posArray[i * 3] = Math.random() * 20 - 5;
        posArray[i * 3 + 2] = Math.random() * 15 - 2;
      }
    }
    
    rainRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (weatherCondition !== 'rain') return null;

  const rainGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [positions]);

  return (
    <points ref={rainRef} geometry={rainGeometry}>
      <pointsMaterial
        size={0.05}
        color="#a0c4ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function EnhancedFog() {
  const isNight = useAppStore((state) => state.isNightMode);
  const weatherCondition = useAppStore((state) => state.weatherCondition);
  
  return (
    <fog 
      attach="fog" 
      args={[
        isNight ? '#050510' : '#1a1a3a', 
        weatherCondition === 'fog' ? 5 : (isNight ? 10 : 30), 
        isNight ? 35 : 60
      ]} 
    />
  );
}