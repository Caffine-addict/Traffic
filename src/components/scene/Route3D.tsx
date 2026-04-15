'use client';

import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../stores/appStore';
import { getPathCoordinates } from '../../lib/algorithms/pathfinding';

export function Route3D() {
  const routeResult = useAppStore((state) => state.routeResult);
  const nodes = useAppStore((state) => state.nodes);
  const showRoute = useAppStore((state) => state.showRoute);

  const { pathCoordinates, safetyColor } = useMemo(() => {
    if (!routeResult) {
      return { pathCoordinates: [], safetyColor: '#22c55e' };
    }

    const coords = getPathCoordinates(routeResult.path, nodes);
    
    const safetyScore = routeResult.safetyScore.overall;
    let color = '#22c55e';
    if (safetyScore >= 80) color = '#22c55e';
    else if (safetyScore >= 60) color = '#84cc16';
    else if (safetyScore >= 40) color = '#eab308';
    else if (safetyScore >= 20) color = '#f97316';
    else color = '#ef4444';

    return { pathCoordinates: coords, safetyColor: color };
  }, [routeResult, nodes]);

  const tubeGeometry = useMemo(() => {
    if (pathCoordinates.length < 2) return null;

    const points = pathCoordinates.map(
      (coord) => new THREE.Vector3(coord.x, 0.2, coord.y)
    );

    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, pathCoordinates.length * 4, 0.08, 8, false);
  }, [pathCoordinates]);

  if (!showRoute || !tubeGeometry || pathCoordinates.length === 0) return null;

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial 
          color={safetyColor} 
          emissive={safetyColor}
          emissiveIntensity={0.7}
        />
      </mesh>

      <mesh position={[pathCoordinates[0].x, 0.25, pathCoordinates[0].y]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>

      <mesh position={[
        pathCoordinates[pathCoordinates.length - 1].x,
        0.25,
        pathCoordinates[pathCoordinates.length - 1].y
      ]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
      </mesh>

      <pointLight
        position={[pathCoordinates[0].x, 1.5, pathCoordinates[0].y]}
        color="#22c55e"
        intensity={3}
        distance={5}
      />
      <pointLight
        position={[
          pathCoordinates[pathCoordinates.length - 1].x,
          1.5,
          pathCoordinates[pathCoordinates.length - 1].y
        ]}
        color="#ef4444"
        intensity={3}
        distance={5}
      />
    </group>
  );
}