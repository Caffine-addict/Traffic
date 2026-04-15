'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VehicleData {
  id: number;
  x: number;
  z: number;
  direction: number;
  speed: number;
  type: 'car' | 'bus' | 'taxi' | 'police' | 'ambulance';
  lane: number;
  stopped: boolean;
  targetX: number;
}

interface Barricade {
  id: number;
  x: number;
  z: number;
  active: boolean;
}

interface TrafficControllerProps {
  trafficLevel: number;
  barricades: Barricade[];
  onBarricadeToggle?: (id: number) => void;
}

const VEHICLE_COLORS = {
  car: '#3b82f6',
  bus: '#ef4444',
  taxi: '#fbbf24',
  police: '#1e3a8a',
  ambulance: '#ffffff',
};

const CAR_COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#14b8a6'];

function TrafficController({ trafficLevel, barricades }: TrafficControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [vehicles, setVehicles] = useState<VehicleData[]>(() => {
    const v: VehicleData[] = [];
    const count = Math.floor(trafficLevel / 10) + 5;
    
    for (let i = 0; i < count; i++) {
      const lane = i % 6;
      v.push({
        id: i,
        x: Math.random() * 14,
        z: lane * 2 + 0.5,
        direction: i % 2 === 0 ? 1 : -1,
        speed: 0.3 + Math.random() * 0.4,
        type: i % 8 === 0 ? 'bus' : i % 6 === 0 ? 'taxi' : i % 15 === 0 ? 'police' : 'car',
        lane,
        stopped: false,
        targetX: 0,
      });
    }
    return v;
  });

  const activeBarricades = useMemo(() => barricades.filter(b => b.active), [barricades]);

  useFrame((state, delta) => {
    setVehicles(prev => prev.map(vehicle => {
      const posX = vehicle.x + vehicle.direction * vehicle.speed * (trafficLevel / 50) * delta * 60;
      
      const blocked = activeBarricades.some(b => {
        if (vehicle.direction > 0) {
          return b.z === vehicle.z && b.x > vehicle.x && b.x - vehicle.x < 0.5;
        } else {
          return b.z === vehicle.z && b.x < vehicle.x && vehicle.x - b.x < 0.5;
        }
      });
      
      let newX = blocked ? vehicle.x : (posX > 15 ? 0 : posX < 0 ? 15 : posX);
      let newSpeed = blocked ? 0 : 0.3 + Math.random() * 0.4;
      
      return {
        ...vehicle,
        x: newX,
        speed: newSpeed,
        stopped: blocked,
      };
    }));
  });

  return (
    <group ref={groupRef}>
      {vehicles.map(vehicle => (
        <Vehicle key={vehicle.id} vehicle={vehicle} />
      ))}
    </group>
  );
}

function Vehicle({ vehicle }: { vehicle: VehicleData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = vehicle.type === 'car' 
    ? CAR_COLORS[vehicle.id % CAR_COLORS.length] 
    : (VEHICLE_COLORS[vehicle.type] || '#3b82f6');
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = vehicle.x;
      if (vehicle.stopped) {
        meshRef.current.scale.setScalar(0.95);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const size = vehicle.type === 'bus' ? [0.5, 0.2, 0.25] : [0.35, 0.18, 0.22];

  return (
    <group ref={meshRef} position={[vehicle.x, 0.15, vehicle.z]}>
      <mesh>
        <boxGeometry args={size as [number, number, number]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={vehicle.stopped ? 0.1 : 0.5}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {vehicle.type === 'police' && (
        <pointLight position={[0, 0.5, 0]} intensity={vehicle.stopped ? 0 : 1} color="#ff0000" distance={3} />
      )}
      
      {vehicle.type === 'ambulance' && (
        <pointLight position={[0, 0.5, 0]} intensity={vehicle.stopped ? 0 : 1} color="#ff0000" distance={3} />
      )}
      
      <pointLight 
        position={[vehicle.direction > 0 ? 0.3 : -0.3, 0.3, 0]} 
        intensity={vehicle.stopped ? 0 : 0.5} 
        color={vehicle.direction > 0 ? "#ffaa00" : "#ff0000"} 
        distance={2} 
      />
    </group>
  );
}

function BarricadeMarker({ barricade, onClick }: { barricade: Barricade; onClick?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && barricade.active) {
      meshRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  if (!barricade.active) return null;

  return (
    <group position={[barricade.x, 0, barricade.z]} onClick={onClick}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.3, 0.5, 0.3]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
      </mesh>
      <pointLight position={[0, 0.8, 0]} color="#ef4444" intensity={2} distance={3} />
    </group>
  );
}

export function TrafficController3D({ trafficLevel, barricades }: TrafficControllerProps) {
  return (
    <group>
      <TrafficController trafficLevel={trafficLevel} barricades={barricades} />
    </group>
  );
}

export function Barricades3D({ barricades, onToggle }: { barricades: Barricade[]; onToggle?: (id: number) => void }) {
  return (
    <group>
      {barricades.map((barricade) => (
        <BarricadeMarker 
          key={barricade.id} 
          barricade={barricade} 
          onClick={() => onToggle?.(barricade.id)}
        />
      ))}
    </group>
  );
}