'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../stores/appStore';
import { Node } from '../../lib/data/nycData';

interface BuildingProps {
  x: number;
  y: number;
  height: number;
  crimeRate: number;
}

function Building({ x, y, height, crimeRate }: BuildingProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  const color = useMemo(() => {
    const palette = [
      '#1a1a2e', '#16213e', '#1f3460', '#253d5b',
      '#2d4a6f', '#1e3a5f', '#0f3460', '#182840'
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      const windowsOn = Math.sin(t * 0.5 + x * 10) > 0.3;
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.emissiveIntensity = windowsOn ? 0.4 + Math.sin(t * 2) * 0.2 : 0.1;
      }
    }
  });

  const buildingHeight = height + Math.random() * 2;
  const windowRows = Math.floor(buildingHeight / 0.4);

  return (
    <group position={[x, 0, y]}>
      {/* Main building body */}
      <mesh ref={meshRef} position={[0, buildingHeight / 2, 0]}>
        <boxGeometry args={[0.4, buildingHeight, 0.4]} />
        <meshStandardMaterial
          color={color}
          emissive="#4fc3f7"
          emissiveIntensity={0.2}
          roughness={0.6}
          metalness={0.4}
          envMapIntensity={0.8}
        />
      </mesh>
      
      {/* Window lights */}
      {[...Array(Math.min(windowRows, 8))].map((_, i) => (
        <mesh key={i} position={[0.21, 0.3 + i * 0.35, 0]}>
          <planeGeometry args={[0.15, 0.2]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#ffd54f" : "#ff9800"}
            emissive={i % 2 === 0 ? "#ffd54f" : "#ff9800"}
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

interface LandmarkProps {
  x: number;
  y: number;
  height: number;
  name: string;
  type: string;
}

function Landmark({ x, y, height, name, type }: LandmarkProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current && type === 'landmark') {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  if (height === 0) {
    return (
      <group position={[x, 0, y]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 2.5]} />
          <meshStandardMaterial color="#22c55e" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.3, 8]} />
          <meshStandardMaterial color="#166534" />
        </mesh>
      </group>
    );
  }

  const landmarkColor = type === 'station' ? '#3b82f6' : '#f59e0b';
  const landmarkEmissive = type === 'station' ? '#60a5fa' : '#fbbf24';

  return (
    <group ref={groupRef} position={[x, 0, y]}>
      {/* Main structure */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.6, height, 0.6]} />
        <meshStandardMaterial
          color={landmarkColor}
          emissive={landmarkEmissive}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      
      {/* Glowing top */}
      <mesh position={[0, height + 0.3, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={landmarkColor}
          emissive={landmarkEmissive}
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      <pointLight
        position={[0, height + 0.8, 0]}
        color={landmarkColor}
        intensity={4}
        distance={5}
      />
    </group>
  );
}

export function City() {
  const nodes = useAppStore((state) => state.nodes);
  const landmarks = useAppStore((state) => state.landmarks);

  const intersectionNodes = useMemo(() => {
    return nodes.filter((n) => n.type === 'intersection' && n.id.startsWith('n'));
  }, [nodes]);

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[7.5, -0.05, 5]}>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#0a0a14" roughness={0.9} />
      </mesh>
      
      {/* Roads grid */}
      <gridHelper args={[20, 40, '#1e3a5f', '#0f172a']} position={[7.5, 0.02, 5]} />
      
      {/* Buildings */}
      {intersectionNodes.map((node) => (
        <Building
          key={node.id}
          x={node.x}
          y={node.y}
          height={1 + Math.random() * 4 + node.trafficLevel * 4}
          crimeRate={node.crimeRate}
        />
      ))}
      
      {/* Landmarks */}
      {landmarks.map((landmark) => (
        <Landmark
          key={landmark.id}
          x={landmark.x}
          y={landmark.y}
          height={landmark.height}
          name={landmark.name}
          type={landmark.type}
        />
      ))}
    </group>
  );
}