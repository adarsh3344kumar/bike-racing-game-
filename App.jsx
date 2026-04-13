import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Text, Sky } from '@react-three/drei';
import * as THREE from 'three';

const useKeys = () => {
  const keys = useRef({ left: false, right: false, up: false, down: false, space: false });
  useEffect(() => {
    const onDown = (e) => {
      const k = e.key;
      if (k === 'ArrowLeft') keys.current.left = true;
      if (k === 'ArrowRight') keys.current.right = true;
      if (k === 'ArrowUp') keys.current.up = true;
      if (k === 'ArrowDown') keys.current.down = true;
      if (k === ' ') { keys.current.space = true; e.preventDefault(); }
    };
    const onUp = (e) => {
      const k = e.key;
      if (k === 'ArrowLeft') keys.current.left = false;
      if (k === 'ArrowRight') keys.current.right = false;
      if (k === 'ArrowUp') keys.current.up = false;
      if (k === 'ArrowDown') keys.current.down = false;
      if (k === ' ') keys.current.space = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);
  return keys;
};

const ENVS = {
  nature: { ground: '#4a8c3f', road: '#555555', fog: '#a8d8ea', sky: 'city', sunPos: [100, 60, 50] },
  desert: { ground: '#d4a959', road: '#8b7355', fog: '#f0d8a8', sky: 'sunset', sunPos: [100, 20, 50] },
  traffic: { ground: '#555555', road: '#333333', fog: '#c8c8d0', sky: 'dawn', sunPos: [80, 40, 60] },
};

const BIKE_COLORS = ['#e63946', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4'];
const AI_NAMES = ['VIPER', 'BLAZE', 'STORM', 'GHOST', 'NITRO'];

const Motorcycle = ({ groupRef, color = '#e63946', spinning, lean }) => {
  const wheelFRef = useRef();
  const wheelRRef = useRef();
  const bodyRef = useRef();

  useFrame((_, delta) => {
    const sp = spinning?.current || spinning || 0;
    if (wheelFRef.current) wheelFRef.current.rotation.x += sp * delta * 8;
    if (wheelRRef.current) wheelRRef.current.rotation.x += sp * delta * 8;
    if (bodyRef.current && lean) {
      bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, (lean.current || 0) * 0.25, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        {/* Rear wheel */}
        <group position={[0, 0.32, -0.7]} ref={wheelRRef}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.3, 0.1, 16, 32]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.3, 0.06, 16, 32]} />
            <meshStandardMaterial color="#333" roughness={0.6} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} rotation={[(Math.PI / 4) * i, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.5, 4]} />
              <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>

        {/* Front wheel */}
        <group position={[0, 0.32, 0.75]} ref={wheelFRef}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.3, 0.1, 16, 32]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.3, 0.06, 16, 32]} />
            <meshStandardMaterial color="#333" roughness={0.6} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} rotation={[(Math.PI / 4) * i, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.5, 4]} />
              <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>

        {/* Engine block */}
        <mesh position={[0, 0.42, -0.15]} castShadow>
          <boxGeometry args={[0.3, 0.28, 0.5]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Cylinder heads */}
        <mesh position={[0.18, 0.42, -0.15]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.08, 0.22, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.18, 0.42, -0.15]} rotation={[0, 0, -0.3]} castShadow>
          <boxGeometry args={[0.08, 0.22, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Frame - main tube */}
        <mesh position={[0, 0.65, 0.1]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Frame - down tube */}
        <mesh position={[0, 0.5, 0.35]} rotation={[0.8, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Rear frame */}
        <mesh position={[0, 0.55, -0.45]} rotation={[-0.4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Fuel tank */}
        <mesh position={[0, 0.82, 0.05]} castShadow>
          <capsuleGeometry args={[0.14, 0.35, 8, 16]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.25} />
        </mesh>
        {/* Tank stripe */}
        <mesh position={[0, 0.88, 0.05]}>
          <capsuleGeometry args={[0.04, 0.36, 4, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Seat */}
        <mesh position={[0, 0.8, -0.32]} castShadow>
          <boxGeometry args={[0.24, 0.06, 0.4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.82, -0.32]}>
          <boxGeometry args={[0.2, 0.04, 0.36]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.95} />
        </mesh>

        {/* Front fork tubes */}
        <mesh position={[0.06, 0.55, 0.55]} rotation={[0.35, 0, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.85, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[-0.06, 0.55, 0.55]} rotation={[0.35, 0, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.85, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Handlebars */}
        <mesh position={[0, 0.95, 0.6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
          <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Grips */}
        <mesh position={[0.28, 0.95, 0.6]}>
          <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
          <meshStandardMaterial color="#222" roughness={0.95} />
        </mesh>
        <mesh position={[-0.28, 0.95, 0.6]}>
          <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
          <meshStandardMaterial color="#222" roughness={0.95} />
        </mesh>
        {/* Mirrors */}
        <mesh position={[0.32, 1.0, 0.6]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[-0.32, 1.0, 0.6]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.05} />
        </mesh>

        {/* Headlight */}
        <mesh position={[0, 0.7, 0.78]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.5} metalness={0.3} roughness={0.2} />
        </mesh>

        {/* Tail light */}
        <mesh position={[0, 0.72, -0.6]}>
          <boxGeometry args={[0.12, 0.04, 0.03]} />
          <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.8} />
        </mesh>

        {/* Exhaust pipes */}
        <mesh position={[0.16, 0.32, -0.3]} rotation={[-0.2, 0, 0.1]}>
          <cylinderGeometry args={[0.025, 0.035, 0.6, 8]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.18, 0.25, -0.58]}>
          <cylinderGeometry args={[0.04, 0.035, 0.15, 8]} />
          <meshStandardMaterial color="#666" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Rear fender */}
        <mesh position={[0, 0.55, -0.65]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.22, 0.02, 0.3]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Front fender */}
        <mesh position={[0, 0.5, 0.78]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.2, 0.02, 0.25]} />
          <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Windscreen */}
        <mesh position={[0, 1.0, 0.65]} rotation={[-0.5, 0, 0]}>
          <planeGeometry args={[0.25, 0.2]} />
          <meshStandardMaterial color="#aaddff" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>

        {/* Fairing / body panels */}
        <mesh position={[0.15, 0.6, 0.2]} rotation={[0.1, 0.15, 0]} castShadow>
          <boxGeometry args={[0.03, 0.35, 0.6]} />
          <meshStandardMaterial color={color} metalness={0.35} roughness={0.3} />
        </mesh>
        <mesh position={[-0.15, 0.6, 0.2]} rotation={[0.1, -0.15, 0]} castShadow>
          <boxGeometry args={[0.03, 0.35, 0.6]} />
          <meshStandardMaterial color={color} metalness={0.35} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

const AIMotorcycle = ({ data, color, envType }) => {
  const ref = useRef();
  const spinVal = useRef(0);
  const leanVal = useRef(0);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.set(data.pos.x, 0, data.pos.z);
    ref.current.rotation.y = data.heading;
    spinVal.current = data.speed > 0.5 ? 1 : 0;
    leanVal.current = data.lean || 0;
  });

  return <Motorcycle groupRef={ref} color={color} spinning={spinVal} lean={leanVal} />;
};

// Road with lane markings
const Road = ({ envConfig, roadPoints }) => {
  const roadMesh = useMemo(() => {
    const shape = new THREE.Shape();
    const hw = 5;
    shape.moveTo(-hw, 0);
    shape.lineTo(hw, 0);
    shape.lineTo(hw, 1);
    shape.lineTo(-hw, 1);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group>
      {/* Main road segments */}
      {roadPoints.map((seg, i) => {
        if (i === 0) return null;
        const prev = roadPoints[i - 1];
        const dx = seg[0] - prev[0];
        const dz = seg[1] - prev[1];
        const len = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);
        const mx = (seg[0] + prev[0]) / 2;
        const mz = (seg[1] + prev[1]) / 2;
        return (
          <group key={i}>
            <mesh position={[mx, 0.02, mz]} rotation={[-Math.PI / 2, 0, -angle]} receiveShadow>
              <planeGeometry args={[10, len + 0.5]} />
              <meshStandardMaterial color={envConfig.road} roughness={0.85} />
            </mesh>
            {/* Road edge lines */}
            <mesh position={[mx + Math.cos(angle) * 4.5, 0.03, mz - Math.sin(angle) * 4.5]} rotation={[-Math.PI / 2, 0, -angle]}>
              <planeGeometry args={[0.15, len + 0.5]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
            <mesh position={[mx - Math.cos(angle) * 4.5, 0.03, mz + Math.sin(angle) * 4.5]} rotation={[-Math.PI / 2, 0, -angle]}>
              <planeGeometry args={[0.15, len + 0.5]} />
              <meshStandardMaterial color="#ffffff" roughness={0.5} />
            </mesh>
            {/* Center dashes */}
            {Array.from({ length: Math.floor(len / 4) }).map((_, j) => {
              const t = (j + 0.5) / Math.floor(len / 4);
              const px = prev[0] + dx * t;
              const pz = prev[1] + dz * t;
              return (
                <mesh key={j} position={[px, 0.03, pz]} rotation={[-Math.PI / 2, 0, -angle]}>
                  <planeGeometry args={[0.12, 1.5]} />
                  <meshStandardMaterial color="#ffdd44" roughness={0.5} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

// Environment objects
const NatureTree = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1.2, 0]} castShadow>
      <cylinderGeometry args={[0.15, 0.25, 2.4, 8]} />
      <meshStandardMaterial color="#6b4226" roughness={0.9} />
    </mesh>
    <mesh position={[0, 3.0, 0]} castShadow>
      <coneGeometry args={[1.3, 2.5, 8]} />
      <meshStandardMaterial color="#2d7a3a" roughness={0.8} />
    </mesh>
    <mesh position={[0, 3.8, 0]} castShadow>
      <coneGeometry args={[0.9, 1.8, 8]} />
      <meshStandardMaterial color="#3a9c4a" roughness={0.8} />
    </mesh>
  </group>
);

const Cactus = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1, 0]} castShadow>
      <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
      <meshStandardMaterial color="#2d7a3a" roughness={0.8} />
    </mesh>
    <mesh position={[0.25, 1.3, 0]} rotation={[0, 0, -0.8]} castShadow>
      <cylinderGeometry args={[0.08, 0.1, 0.8, 6]} />
      <meshStandardMaterial color="#358a40" roughness={0.8} />
    </mesh>
    <mesh position={[-0.2, 1.6, 0]} rotation={[0, 0, 0.7]} castShadow>
      <cylinderGeometry args={[0.07, 0.09, 0.6, 6]} />
      <meshStandardMaterial color="#358a40" roughness={0.8} />
    </mesh>
  </group>
);

const Rock = ({ position, scale = 1 }) => (
  <mesh position={position} scale={scale} castShadow>
    <dodecahedronGeometry args={[0.5, 0]} />
    <meshStandardMaterial color="#9e8e7e" roughness={0.95} />
  </mesh>
);

const Building = ({ position, height = 5, width = 3, color = '#8899aa' }) => (
  <group position={position}>
    <mesh position={[0, height / 2, 0]} castShadow>
      <boxGeometry args={[width, height, width]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
    {/* Windows */}
    {Array.from({ length: Math.floor(height / 1.5) }).map((_, row) =>
      Array.from({ length: Math.floor(width / 1.2) }).map((_, col) => (
        <mesh key={`${row}-${col}`}
          position={[
            (col - Math.floor(width / 1.2) / 2 + 0.5) * 1.0,
            row * 1.5 + 1.2,
            width / 2 + 0.01
          ]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshStandardMaterial
            color={Math.random() > 0.3 ? '#ffffaa' : '#445566'}
            emissive={Math.random() > 0.3 ? '#ffff66' : '#000000'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))
    )}
  </group>
);

const TrafficCone = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.02, 0]}>
      <boxGeometry args={[0.3, 0.04, 0.3]} />
      <meshStandardMaterial color="#222" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.2, 0]}>
      <coneGeometry args={[0.1, 0.35, 8]} />
      <meshStandardMaterial color="#ff6600" roughness={0.6} />
    </mesh>
  </group>
);

const StreetLight = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 2.5, 0]}>
      <cylinderGeometry args={[0.05, 0.08, 5, 8]} />
      <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0.4, 4.8, 0]} rotation={[0, 0, Math.PI / 4]}>
      <cylinderGeometry args={[0.03, 0.03, 1, 6]} />
      <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
    </mesh>
    <mesh position={[0.7, 4.95, 0]}>
      <boxGeometry args={[0.25, 0.1, 0.15]} />
      <meshStandardMaterial color="#ffffcc" emissive="#ffff88" emissiveIntensity={0.8} />
    </mesh>
    <pointLight position={[0.7, 4.8, 0]} intensity={2} distance={15} color="#ffeecc" />
  </group>
);

const Car = ({ position, color = '#3366cc' }) => (
  <group position={position}>
    <mesh position={[0, 0.35, 0]} castShadow>
      <boxGeometry args={[1.8, 0.5, 3.5]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.7, -0.3]} castShadow>
      <boxGeometry args={[1.6, 0.45, 2.0]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
    </mesh>
    {/* Windows */}
    <mesh position={[0, 0.75, 0.55]}>
      <planeGeometry args={[1.3, 0.35]} />
      <meshStandardMaterial color="#88ccff" transparent opacity={0.6} />
    </mesh>
    {/* Wheels */}
    {[[-0.8, 0.2, 1], [0.8, 0.2, 1], [-0.8, 0.2, -1], [0.8, 0.2, -1]].map((p, i) => (
      <mesh key={i} position={p} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

const EnvironmentObjects = ({ envType, roadPoints }) => {
  const objects = useMemo(() => {
    const objs = { trees: [], cacti: [], rocks: [], buildings: [], cones: [], lights: [], cars: [] };
    const rng = (seed) => {
      let s = seed;
      return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    };
    const rand = rng(42 + envType.length * 7);

    const isOnRoad = (x, z) => {
      for (let i = 1; i < roadPoints.length; i++) {
        const ax = roadPoints[i - 1][0], az = roadPoints[i - 1][1];
        const bx = roadPoints[i][0], bz = roadPoints[i][1];
        const dx = bx - ax, dz = bz - az;
        const len = Math.sqrt(dx * dx + dz * dz);
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (len * len)));
        const px = ax + t * dx, pz = az + t * dz;
        const dist = Math.sqrt((x - px) ** 2 + (z - pz) ** 2);
        if (dist < 8) return true;
      }
      return false;
    };

    if (envType === 'nature') {
      for (let i = 0; i < 80; i++) {
        const x = (rand() - 0.5) * 180;
        const z = (rand() - 0.5) * 180;
        if (!isOnRoad(x, z)) objs.trees.push([x, 0, z]);
      }
      for (let i = 0; i < 30; i++) {
        const x = (rand() - 0.5) * 120;
        const z = (rand() - 0.5) * 120;
        if (!isOnRoad(x, z)) objs.rocks.push({ pos: [x, 0.2, z], scale: 0.3 + rand() * 0.5 });
      }
    } else if (envType === 'desert') {
      for (let i = 0; i < 50; i++) {
        const x = (rand() - 0.5) * 180;
        const z = (rand() - 0.5) * 180;
        if (!isOnRoad(x, z)) objs.cacti.push([x, 0, z]);
      }
      for (let i = 0; i < 50; i++) {
        const x = (rand() - 0.5) * 180;
        const z = (rand() - 0.5) * 180;
        if (!isOnRoad(x, z)) objs.rocks.push({ pos: [x, 0.15, z], scale: 0.5 + rand() * 1.5 });
      }
    } else if (envType === 'traffic') {
      for (let i = 0; i < 35; i++) {
        const x = (rand() - 0.5) * 120;
        const z = (rand() - 0.5) * 120;
        if (!isOnRoad(x, z)) {
          const h = 3 + rand() * 10;
          const w = 2 + rand() * 3;
          const colors = ['#778899', '#8899aa', '#667788', '#99aabb', '#889988'];
          objs.buildings.push({ pos: [x, 0, z], h, w, color: colors[Math.floor(rand() * colors.length)] });
        }
      }
      for (let i = 1; i < roadPoints.length; i++) {
        const ax = roadPoints[i - 1][0], az = roadPoints[i - 1][1];
        const bx = roadPoints[i][0], bz = roadPoints[i][1];
        const dx = bx - ax, dz = bz - az;
        const len = Math.sqrt(dx * dx + dz * dz);
        const nx = -dz / len, nz = dx / len;
        for (let j = 0; j < len; j += 20) {
          const t = j / len;
          const px = ax + dx * t;
          const pz = az + dz * t;
          objs.lights.push([px + nx * 6, 0, pz + nz * 6]);
        }
      }
      for (let i = 0; i < 10; i++) {
        const seg = Math.floor(rand() * (roadPoints.length - 1)) + 1;
        const ax = roadPoints[seg - 1][0], az = roadPoints[seg - 1][1];
        const bx = roadPoints[seg][0], bz = roadPoints[seg][1];
        const t = rand();
        const dx = bx - ax, dz = bz - az;
        const len = Math.sqrt(dx * dx + dz * dz);
        const nx = -dz / len, nz = dx / len;
        const offset = (rand() > 0.5 ? 1 : -1) * (3 + rand() * 2);
        const carColors = ['#cc3333', '#3366cc', '#33aa33', '#888888', '#dddd33'];
        objs.cars.push({ pos: [ax + dx * t + nx * offset, 0, az + dz * t + nz * offset], angle: Math.atan2(dx, dz), color: carColors[Math.floor(rand() * 5)] });
      }
    }
    return objs;
  }, [envType, roadPoints]);

  return (
    <group>
      {objects.trees.map((p, i) => <NatureTree key={`t${i}`} position={p} />)}
      {objects.cacti.map((p, i) => <Cactus key={`c${i}`} position={p} />)}
      {objects.rocks.map((r, i) => <Rock key={`r${i}`} position={r.pos} scale={r.scale} />)}
      {objects.buildings.map((b, i) => <Building key={`b${i}`} position={b.pos} height={b.h} width={b.w} color={b.color} />)}
      {objects.lights.map((p, i) => <StreetLight key={`l${i}`} position={p} />)}
      {objects.cars.map((c, i) => (
        <group key={`car${i}`} position={c.pos} rotation={[0, c.angle, 0]}>
          <Car color={c.color} position={[0, 0, 0]} />
        </group>
      ))}
    </group>
  );
};

// Checkpoint gates
const Checkpoint = ({ position, angle, active }) => {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current && active) {
      ref.current.children.forEach(c => {
        if (c.material && c.material.emissiveIntensity !== undefined) {
          c.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
        }
      });
    }
  });
  const gateColor = active ? '#00ff88' : '#444444';
  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, -angle, 0]} ref={ref}>
      <mesh position={[-3, 2.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 5, 8]} />
        <meshStandardMaterial color={gateColor} emissive={gateColor} emissiveIntensity={active ? 0.5 : 0} />
      </mesh>
      <mesh position={[3, 2.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 5, 8]} />
        <meshStandardMaterial color={gateColor} emissive={gateColor} emissiveIntensity={active ? 0.5 : 0} />
      </mesh>
      <mesh position={[0, 5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 6, 8]} />
        <meshStandardMaterial color={gateColor} emissive={gateColor} emissiveIntensity={active ? 0.5 : 0} />
      </mesh>
    </group>
  );
};

const TRACK = [
  [0, 0], [0, 30], [0, 60], [15, 85], [35, 95],
  [60, 90], [75, 70], [80, 45], [70, 20], [55, 0],
  [40, -20], [20, -25], [0, -15], [0, 0]
];

const GameScene = ({ score, setScore, lap, setLap, speed, setSpeed, position: posState, setPosition, envType, aiData, setAiData, setPlayerRank, setRaceTime, raceTime }) => {
  const bikeRef = useRef();
  const keys = useKeys();
  const { camera } = useThree();
  const spinning = useRef(0);
  const lean = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const heading = useRef(0);
  const bikePos = useRef(new THREE.Vector3(0, 0, 0));
  const currentCheckpoint = useRef(1);
  const lapStartTime = useRef(0);

  const envConfig = ENVS[envType];

  const checkpoints = useMemo(() => {
    const cps = [];
    for (let i = 1; i < TRACK.length - 1; i++) {
      const dx = TRACK[i][0] - TRACK[i - 1][0];
      const dz = TRACK[i][1] - TRACK[i - 1][1];
      cps.push({ pos: TRACK[i], angle: Math.atan2(dx, dz) });
    }
    return cps;
  }, []);

  // AI state
  const aiState = useRef(
    AI_NAMES.map((name, i) => ({
      pos: new THREE.Vector3((i + 1) * 2 - 5, 0, -3),
      heading: 0,
      speed: 0,
      targetSpeed: 6 + Math.random() * 3,
      waypointIdx: 1,
      lean: 0,
      lapCount: 0,
      checkpoint: 1,
      name,
    }))
  );

  useFrame((state, delta) => {
    if (!bikeRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Player controls
    const maxSpeed = 14;
    const accel = 8;
    const turnSpeed = 2.2;
    let currentSpeed = velocity.current.length();

    if (keys.current.space) {
      if (keys.current.down) {
        currentSpeed = Math.max(currentSpeed - accel * dt, -maxSpeed * 0.4);
      } else {
        currentSpeed = Math.min(currentSpeed + accel * dt, maxSpeed);
      }
    } else {
      currentSpeed *= (1 - 3 * dt);
      if (Math.abs(currentSpeed) < 0.1) currentSpeed = 0;
    }

    const turnAmount = turnSpeed * dt * Math.min(currentSpeed / 3, 1);
    if (keys.current.left) {
      heading.current += turnAmount;
      lean.current = THREE.MathUtils.lerp(lean.current, -1, 0.1);
    } else if (keys.current.right) {
      heading.current -= turnAmount;
      lean.current = THREE.MathUtils.lerp(lean.current, 1, 0.1);
    } else {
      lean.current = THREE.MathUtils.lerp(lean.current, 0, 0.1);
    }

    const dir = new THREE.Vector3(Math.sin(heading.current), 0, Math.cos(heading.current));
    velocity.current.copy(dir.multiplyScalar(currentSpeed));
    spinning.current = currentSpeed > 0.5 ? 1 : currentSpeed < -0.3 ? -1 : 0;

    bikePos.current.add(velocity.current.clone().multiplyScalar(dt));
    bikePos.current.x = THREE.MathUtils.clamp(bikePos.current.x, -95, 95);
    bikePos.current.z = THREE.MathUtils.clamp(bikePos.current.z, -40, 110);

    bikeRef.current.position.copy(bikePos.current);
    bikeRef.current.rotation.y = heading.current;

    setSpeed(Math.abs(Math.round(currentSpeed * 12)));

    // Camera
    const camOffset = new THREE.Vector3(
      Math.sin(heading.current + Math.PI) * 5,
      2.5 + currentSpeed * 0.05,
      Math.cos(heading.current + Math.PI) * 5
    );
    camera.position.lerp(bikePos.current.clone().add(camOffset), 0.06);
    camera.lookAt(bikePos.current.clone().add(new THREE.Vector3(0, 0.8, 0)));

    // Checkpoint detection
    const cpIdx = currentCheckpoint.current - 1;
    if (cpIdx < checkpoints.length) {
      const cp = checkpoints[cpIdx];
      const dist = Math.sqrt((bikePos.current.x - cp.pos[0]) ** 2 + (bikePos.current.z - cp.pos[1]) ** 2);
      if (dist < 6) {
        currentCheckpoint.current++;
        setScore(s => s + 100);
        if (currentCheckpoint.current > checkpoints.length) {
          currentCheckpoint.current = 1;
          setLap(l => l + 1);
          setScore(s => s + 500);
        }
      }
    }

    // Race time
    setRaceTime(t => t + dt);

    // AI update
    const aiStates = aiState.current;
    const playerProgress = (lap * checkpoints.length + currentCheckpoint.current);
    let playerRank = 1;

    aiStates.forEach((ai, idx) => {
      const target = TRACK[ai.waypointIdx];
      const dx = target[0] - ai.pos.x;
      const dz = target[1] - ai.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const targetHeading = Math.atan2(dx, dz);

      let angleDiff = targetHeading - ai.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      ai.heading += angleDiff * 3 * dt;
      ai.lean = -angleDiff * 0.5;

      ai.speed = THREE.MathUtils.lerp(ai.speed, ai.targetSpeed, dt * 2);
      if (Math.abs(angleDiff) > 0.5) ai.speed *= 0.98;

      ai.pos.x += Math.sin(ai.heading) * ai.speed * dt;
      ai.pos.z += Math.cos(ai.heading) * ai.speed * dt;

      if (dist < 5) {
        ai.waypointIdx++;
        ai.checkpoint++;
        if (ai.waypointIdx >= TRACK.length) {
          ai.waypointIdx = 1;
          ai.lapCount++;
          ai.checkpoint = 1;
        }
      }

      const aiProgress = (ai.lapCount * checkpoints.length + ai.checkpoint);
      if (aiProgress > playerProgress) playerRank++;

      setAiData(prev => {
        const next = [...prev];
        next[idx] = { pos: { x: ai.pos.x, z: ai.pos.z }, heading: ai.heading, speed: ai.speed, lean: ai.lean };
        return next;
      });
    });

    setPlayerRank(playerRank);
  });

  return (
    <>
      <ambientLight intensity={envType === 'traffic' ? 0.3 : 0.5} color={envType === 'desert' ? '#fff5e0' : '#ffffff'} />
      <directionalLight
        position={envConfig.sunPos}
        intensity={envType === 'desert' ? 2 : 1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.001}
        shadow-normalBias={0.02}
      />
      <hemisphereLight args={[
        envType === 'desert' ? '#ffd090' : envType === 'traffic' ? '#8899bb' : '#88bbff',
        envConfig.ground, 0.4
      ]} />

      <fog attach="fog" args={[envConfig.fog, 40, 120]} />

      <Sky
        sunPosition={envConfig.sunPos}
        turbidity={envType === 'desert' ? 20 : 8}
        rayleigh={envType === 'desert' ? 0.5 : 2}
      />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color={envConfig.ground} roughness={0.95} />
      </mesh>

      <Road envConfig={envConfig} roadPoints={TRACK} />

      {checkpoints.map((cp, i) => (
        <Checkpoint key={i} position={cp.pos} angle={cp.angle} active={i === currentCheckpoint.current - 1} />
      ))}

      <Motorcycle groupRef={bikeRef} color="#e63946" spinning={spinning} lean={lean} />

      {aiData.map((data, i) => (
        <AIMotorcycle key={i} data={data} color={BIKE_COLORS[i % BIKE_COLORS.length]} envType={envType} />
      ))}

      <EnvironmentObjects envType={envType} roadPoints={TRACK} />
    </>
  );
};

const formatTime = (t) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const ms = Math.floor((t % 1) * 100);
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

export default function App() {
  const [score, setScore] = useState(0);
  const [lap, setLap] = useState(1);
  const [speed, setSpeed] = useState(0);
  const [envType, setEnvType] = useState('nature');
  const [gameStarted, setGameStarted] = useState(false);
  const [playerRank, setPlayerRank] = useState(1);
  const [raceTime, setRaceTime] = useState(0);
  const [aiData, setAiData] = useState(
    AI_NAMES.map((_, i) => ({
      pos: { x: (i + 1) * 2 - 5, z: -3 },
      heading: 0,
      speed: 0,
      lean: 0,
    }))
  );

  const startGame = (env) => {
    setEnvType(env);
    setGameStarted(true);
    setScore(0);
    setLap(1);
    setRaceTime(0);
  };

  if (!gameStarted) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', sans-serif", color: '#fff',
        overflow: 'hidden'
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ fontSize: 14, letterSpacing: 6, color: '#666', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase' }}>3D</div>
        <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: 4, marginBottom: 4, textTransform: 'uppercase' }}>MOTO RUSH</div>
        <div style={{ fontSize: 13, color: '#888', letterSpacing: 3, marginBottom: 50, textTransform: 'uppercase' }}>Championship Racing</div>

        <div style={{ fontSize: 12, color: '#555', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>Select Track</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 50 }}>
          {[
            { key: 'nature', label: 'FOREST', sub: 'Winding trails', icon: '🌲' },
            { key: 'desert', label: 'DESERT', sub: 'Sandy dunes', icon: '🏜️' },
            { key: 'traffic', label: 'CITY', sub: 'Urban streets', icon: '🏙️' },
          ].map(env => (
            <button key={env.key} onClick={() => startGame(env.key)} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '24px 32px',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s',
              width: 160,
              textAlign: 'center',
            }}
              onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{env.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>{env.label}</div>
              <div style={{ fontSize: 11, color: '#777', marginTop: 6 }}>{env.sub}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 24, fontSize: 12, color: '#555' }}>
          <span><kbd style={kbdStyleDark}>SPACE</kbd> Throttle</span>
          <span><kbd style={kbdStyleDark}>← →</kbd> Steer</span>
          <span><kbd style={kbdStyleDark}>↓</kbd> Reverse</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas shadows camera={{ position: [0, 4, -8], fov: 55 }}>
        <GameScene
          score={score} setScore={setScore}
          lap={lap} setLap={setLap}
          speed={speed} setSpeed={setSpeed}
          envType={envType}
          aiData={aiData} setAiData={setAiData}
          setPlayerRank={setPlayerRank}
          raceTime={raceTime} setRaceTime={setRaceTime}
        />
      </Canvas>

      {/* Top HUD Bar */}
      <div style={{
        position: 'fixed', top: 12, left: 12, right: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        fontFamily: "'Inter', sans-serif", zIndex: 10, pointerEvents: 'none',
      }}>
        {/* Left: Position & Lap */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={hudCard}>
            <div style={hudLabel}>POSITION</div>
            <div style={{ ...hudValue, color: playerRank === 1 ? '#00ff88' : '#ff6644' }}>
              {playerRank}<span style={{ fontSize: 13, color: '#888' }}>/{AI_NAMES.length + 1}</span>
            </div>
          </div>
          <div style={hudCard}>
            <div style={hudLabel}>LAP</div>
            <div style={hudValue}>{lap}<span style={{ fontSize: 13, color: '#888' }}>/5</span></div>
          </div>
        </div>

        {/* Center: Time */}
        <div style={{ ...hudCard, minWidth: 140, textAlign: 'center' }}>
          <div style={hudLabel}>TIME</div>
          <div style={{ ...hudValue, fontVariantNumeric: 'tabular-nums' }}>{formatTime(raceTime)}</div>
        </div>

        {/* Right: Score */}
        <div style={hudCard}>
          <div style={hudLabel}>SCORE</div>
          <div style={{ ...hudValue, color: '#ffcc00' }}>{score.toLocaleString()}</div>
        </div>
      </div>

      {/* Bottom center: Speedometer */}
      <div style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        fontFamily: "'Inter', sans-serif", zIndex: 10, pointerEvents: 'none',
      }}>
        <div style={{
          ...hudCard, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px',
        }}>
          <div>
            <div style={hudLabel}>SPEED</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: speed > 130 ? '#ff4444' : '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {speed} <span style={{ fontSize: 12, fontWeight: 500, color: '#888' }}>KM/H</span>
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: '#666' }}>
            <span><kbd style={kbdStyleDark}>SPACE</kbd> Go</span>
            <span><kbd style={kbdStyleDark}>← →</kbd> Steer</span>
          </div>
        </div>
      </div>

      {/* Leaderboard - bottom right */}
      <div style={{
        position: 'fixed', bottom: 16, right: 12,
        fontFamily: "'Inter', sans-serif", zIndex: 10, pointerEvents: 'none',
      }}>
        <div style={{ ...hudCard, padding: '10px 14px', minWidth: 140 }}>
          <div style={{ ...hudLabel, marginBottom: 6 }}>LEADERBOARD</div>
          {[{ name: 'YOU', rank: playerRank, color: '#e63946' }, ...AI_NAMES.map((n, i) => ({ name: n, rank: i + (i >= playerRank - 1 ? 2 : 1), color: BIKE_COLORS[i] }))]
            .sort((a, b) => a.rank - b.rank)
            .map((r, i) => (
              <div key={r.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '3px 0', fontSize: 11, fontWeight: r.name === 'YOU' ? 700 : 500,
                color: r.name === 'YOU' ? '#fff' : '#888',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: i === 0 ? '#ffcc00' : i === 1 ? '#ccc' : i === 2 ? '#cd7f32' : '#555', fontWeight: 700 }}>{i + 1}.</span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                  {r.name}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Back button */}
      <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 20, marginTop: 56 }}>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
    </div>
  );
}

const hudCard = {
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: 10,
  padding: '8px 16px',
  border: '1px solid rgba(255,255,255,0.08)',
};

const hudLabel = {
  fontSize: 10,
  fontWeight: 600,
  color: '#666',
  letterSpacing: 2,
  textTransform: 'uppercase',
  marginBottom: 2,
};

const hudValue = {
  fontSize: 22,
  fontWeight: 800,
  color: '#fff',
};

const kbdStyleDark = {
  display: 'inline-block',
  padding: '2px 6px',
  fontSize: 10,
  fontFamily: "'Inter', sans-serif",
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.15)',
  fontWeight: 600,
  color: '#999',
};