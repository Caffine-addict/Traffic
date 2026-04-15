'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../stores/appStore';

interface InstancedVehiclesProps {
  count: number;
}

const VEHICLE_COLORS = [
  new THREE.Color('#3b82f6'),
  new THREE.Color('#22c55e'),
  new THREE.Color('#8b5cf6'),
  new THREE.Color('#ec4899'),
  new THREE.Color('#14b8a6'),
  new THREE.Color('#f59e0b'),
  new THREE.Color('#ef4444'),
];

export function InstancedVehicles({ count = 50 }: InstancedVehiclesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lightRefs = useRef<THREE.PointLight[]>([]);
  
  const trafficLevel = useAppStore((state) => state.trafficLevel);
  const barricades = useAppStore((state) => state.barricades);
  
  const activeBarricades = useMemo(() => barricades.filter(b => b.active), [barricades]);

  const vehicleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        x: Math.random() * 15,
        z: (i % 6) * 2 + 0.5,
        direction: i % 2 === 0 ? 1 : -1,
        speed: 0.3 + Math.random() * 0.4,
        lane: i % 6,
        color: VEHICLE_COLORS[i % VEHICLE_COLORS.length],
      });
    }
    return data;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useMemo(() => {
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      vehicleData[i].color.toArray(colors, i * 3);
    }
    return colors;
  }, [count, vehicleData]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const speedFactor = trafficLevel / 50;

    vehicleData.forEach((vehicle, i) => {
      const blocked = activeBarricades.some(b => {
        if (vehicle.direction > 0) {
          return b.z === vehicle.z && b.x > vehicle.x && b.x - vehicle.x < 0.5;
        } else {
          return b.z === vehicle.z && b.x < vehicle.x && vehicle.x - b.x < 0.5;
        }
      });

      const moveSpeed = blocked ? 0 : vehicle.speed * speedFactor * delta * 30;
      vehicle.x += vehicle.direction * moveSpeed;

      if (vehicle.x > 15) vehicle.x = 0;
      if (vehicle.x < 0) vehicle.x = 15;

      dummy.position.set(vehicle.x, 0.15, vehicle.z);
      dummy.rotation.y = vehicle.direction > 0 ? 0 : Math.PI;
      dummy.scale.setScalar(blocked ? 0.95 : 1);
      dummy.updateMatrix();
      
      if (meshRef.current) {
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
    });

    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry;
      geometry.setAttribute(
        'color',
        new THREE.InstancedBufferAttribute(colorArray, 3)
      );
    }
  }, [colorArray]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[0.4, 0.2, 0.25]} />
        <meshStandardMaterial 
          vertexColors 
          emissive="#06b6d4"
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </instancedMesh>
    </group>
  );
}

export function InstancedBuildings() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const nodes = useAppStore((state) => state.nodes);
  
  const count = useMemo(() => {
    return nodes.filter(n => n.type === 'intersection' && n.id.startsWith('n')).length;
  }, [nodes]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useMemo(() => {
    const colors = new Float32Array(count * 3);
    const baseColor = new THREE.Color('#1a1a2e');
    for (let i = 0; i < count; i++) {
      const node = nodes.filter(n => n.type === 'intersection' && n.id.startsWith('n'))[i];
      if (node) {
        if (node.crimeRate > 0.5) {
          baseColor.lerp(new THREE.Color('#4a1a1a'), node.crimeRate);
        }
        baseColor.toArray(colors, i * 3);
      }
    }
    return colors;
  }, [count, nodes]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    nodes.filter(n => n.type === 'intersection' && n.id.startsWith('n')).forEach((node, i) => {
      const height = 1 + Math.random() * 4 + node.trafficLevel * 3;
      
      dummy.position.set(node.x, height / 2, node.y);
      dummy.scale.set(0.4, height, 0.4);
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        vertexColors
        emissive="#4fc3f7"
        emissiveIntensity={0.15}
        roughness={0.7}
        metalness={0.3}
      />
    </instancedMesh>
  );
}

export function InstancedParticles({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = Math.random() * 18 - 2;
      pos[i * 3 + 1] = Math.random() * 10 + 1;
      pos[i * 3 + 2] = Math.random() * 12 - 2;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = -Math.random() * 0.02 - 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return pos;
  }, [count]);

  const velocities = useMemo(() => {
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = -Math.random() * 0.02 - 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return vel;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const posArray = meshRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] += velocities[i * 3 + 1];
      posArray[i * 3 + 2] += velocities[i * 3 + 2];
      
      if (posArray[i * 3 + 1] < 0) {
        posArray[i * 3 + 1] = 10;
        posArray[i * 3] = Math.random() * 18 - 2;
        posArray[i * 3 + 2] = Math.random() * 12 - 2;
      }
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [positions]);

  return (
    <points ref={meshRef} geometry={particleGeometry}>
      <pointsMaterial
        size={0.06}
        color="#4fc3f7"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}