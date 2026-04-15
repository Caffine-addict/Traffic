'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CrimeHotspot } from '../../lib/data/nycData';
import { useAppStore } from '../../stores/appStore';

interface Hotspot3DProps {
  hotspot: CrimeHotspot;
  visible: boolean;
}

function HotspotMarker({ hotspot, visible }: Hotspot3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const color = useMemo(() => {
    switch (hotspot.type) {
      case 'theft':
        return '#f59e0b';
      case 'assault':
        return '#ef4444';
      case 'burglary':
        return '#8b5cf6';
      default:
        return '#ef4444';
    }
  }, [hotspot.type]);

  useFrame((state) => {
    if (meshRef.current && visible) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + hotspot.severity) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  if (!visible) return null;

  return (
    <group position={[hotspot.x, 0.2, hotspot.y]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3 * hotspot.severity, 16, 16]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      <pointLight color={color} intensity={1} distance={2} />
    </group>
  );
}

export function SafetyHeatmap() {
  const crimeHotspots = useAppStore((state) => state.crimeHotspots);
  const showHeatmap = useAppStore((state) => state.showHeatmap);

  return (
    <group>
      {crimeHotspots.map((hotspot, index) => (
        <HotspotMarker
          key={`hotspot-${index}`}
          hotspot={hotspot}
          visible={showHeatmap}
        />
      ))}
    </group>
  );
}