'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Vehicle {
  id: number;
  x: number;
  y: number;
  direction: number;
  speed: number;
  type: 'car' | 'bus' | 'taxi';
}

const COLORS = {
  car: ['#3b82f6', '#22c55e', '#8b5cf6'],
  bus: '#ef4444',
  taxi: '#fbbf24',
};

function VehicleModel({ vehicle }: { vehicle: Vehicle }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = vehicle.type === 'bus' 
    ? COLORS.bus 
    : vehicle.type === 'taxi' 
      ? COLORS.taxi 
      : COLORS.car[vehicle.id % 3];

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x += vehicle.direction * vehicle.speed * 0.015;
      
      if (meshRef.current.position.x > 15) meshRef.current.position.x = 0;
      if (meshRef.current.position.x < 0) meshRef.current.position.x = 15;
      
      meshRef.current.position.z = vehicle.y + Math.sin(state.clock.elapsedTime + vehicle.id * 0.5) * 0.08;
    }
  });

  return (
    <group ref={meshRef} position={[vehicle.x, 0.12, vehicle.y]}>
      <mesh>
        <boxGeometry args={[vehicle.type === 'bus' ? 0.5 : 0.35, 0.15, 0.22]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      <pointLight position={[0, 0.4, 0]} color={color} intensity={0.8} distance={2.5} />
    </group>
  );
}

function PedestrianModel({ id }: { id: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startX = useMemo(() => Math.random() * 14, []);
  const startY = useMemo(() => Math.random() * 9, []);
  const vx = useMemo(() => (Math.random() - 0.5) * 0.03, []);
  const vy = useMemo(() => (Math.random() - 0.5) * 0.03, []);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x += vx;
      meshRef.current.position.z += vy;
      
      if (meshRef.current.position.x > 14 || meshRef.current.position.x < 0.5) {
        meshRef.current.position.x = startX;
      }
      if (meshRef.current.position.z > 9 || meshRef.current.position.z < 0.5) {
        meshRef.current.position.z = startY;
      }
    }
  });

  const colors = ['#f472b6', '#a78bfa', '#22d3ee', '#34d399'];
  
  return (
    <mesh ref={meshRef} position={[startX, 0.25, startY]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial 
        color={colors[id % colors.length]} 
        emissive={colors[id % colors.length]} 
        emissiveIntensity={0.6} 
      />
    </mesh>
  );
}

function FloatingOrb({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const startPos = useMemo(() => ({
    x: Math.random() * 16,
    y: 1 + Math.random() * 8,
    z: Math.random() * 10,
  }), []);
  
  const speed = useMemo(() => 0.2 + Math.random() * 0.3, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.x = startPos.x + Math.sin(t * speed + offset) * 1.5;
      meshRef.current.position.y = startPos.y + Math.sin(t * speed * 0.5 + offset) * 0.8;
      meshRef.current.position.z = startPos.z + Math.cos(t * speed + offset) * 1;
    }
  });

  const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981'];
  
  return (
    <mesh ref={meshRef} position={[startPos.x, startPos.y, startPos.z]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial 
        color={colors[index % colors.length]} 
        emissive={colors[index % colors.length]} 
        emissiveIntensity={1}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

export function Simulations() {
  const vehicles = useMemo<Vehicle[]>(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 14,
      y: (i % 6) * 2 + 0.5,
      direction: i % 2 === 0 ? 1 : -1,
      speed: 0.4 + Math.random() * 0.6,
      type: i % 5 === 0 ? 'bus' : i % 3 === 0 ? 'taxi' : 'car',
    }));
  }, []);

  const pedestrians = useMemo(() => Array.from({ length: 20 }, (_, i) => i), []);
  const orbs = useMemo(() => Array.from({ length: 30 }, (_, i) => i), []);

  return (
    <group>
      {vehicles.map((v) => (
        <VehicleModel key={v.id} vehicle={v} />
      ))}
      {pedestrians.map((i) => (
        <PedestrianModel key={`ped-${i}`} id={i} />
      ))}
      {orbs.map((i) => (
        <FloatingOrb key={`orb-${i}`} index={i} />
      ))}
    </group>
  );
}