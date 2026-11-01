"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const SIDES = 6;

// Height and radius of each hexagonal ring, top to bottom: a double-terminated quartz.
const RINGS: [number, number][] = [[0.8, 0.52], [-0.8, 0.62]];
const TOP: [number, number, number] = [0, 1.58, 0];
const BOTTOM: [number, number, number] = [0, -1.28, 0];

function ringPoint(ring: number, side: number): [number, number, number] {
  const [y, r] = RINGS[ring];
  const a = (side / SIDES) * Math.PI * 2;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
}

function edgeSegments() {
  const points: [number, number, number][] = [];
  for (let s = 0; s < SIDES; s++) {
    const next = (s + 1) % SIDES;
    points.push(TOP, ringPoint(0, s));
    points.push(ringPoint(0, s), ringPoint(0, next));
    points.push(ringPoint(0, s), ringPoint(1, s));
    points.push(ringPoint(1, s), ringPoint(1, next));
    points.push(ringPoint(1, s), BOTTOM);
  }
  return points;
}

const EDGES = edgeSegments();

// Solid body under the edges: same outline, bottom to top.
const BODY = new THREE.LatheGeometry(
  [new THREE.Vector2(0, BOTTOM[1]), new THREE.Vector2(RINGS[1][1], RINGS[1][0]), new THREE.Vector2(RINGS[0][1], RINGS[0][0]), new THREE.Vector2(0, TOP[1])],
  SIDES,
  Math.PI / 2,
).toNonIndexed();
BODY.computeVertexNormals();

function Crystal() {
  return (
    <group position={[0, -0.08, 0]} rotation={[0.18, 0.5, 0.06]}>
      <mesh geometry={BODY}>
        <meshPhysicalMaterial
          color="#7dd3fc"
          metalness={0.15}
          roughness={0.06}
          clearcoat={1}
          iridescence={1}
          iridescenceIOR={1.8}
          envMapIntensity={1.8}
          flatShading
          transparent
          opacity={0.75}
        />
      </mesh>
      <Line points={EDGES} segments color="#e0f2fe" lineWidth={1.5} />
    </group>
  );
}

export default function CrystalScene() {
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  // No drawing while the hero is off screen.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(box.current!);
    return () => observer.disconnect();
  }, []);

  return (
    // OrbitControls turns off touch scrolling inline: vertical swipes must still move the page.
    <div ref={box} aria-hidden className="h-full [&>div]:touch-pan-y!">
      <Canvas
        // Without auto-rotation nothing moves until someone drags the crystal.
        frameloop={!visible ? "never" : still ? "demand" : "always"}
        camera={{ position: [0, 0, 6.8], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        {/* Synthetic environment — no external fetch, CSP-safe */}
        <Environment resolution={256}>
          <Lightformer position={[0, 8, -6]} scale={12} intensity={5} color="#38bdf8" />
          <Lightformer position={[6, 4, 4]} scale={8} intensity={5} color="#38bdf8" />
          <Lightformer position={[-6, 2, 2]} scale={9} intensity={6} color="#818cf8" />
          <Lightformer position={[0, -6, 4]} scale={6} intensity={4} color="#00f0ff" />
          <Lightformer position={[6, 0, -7]} scale={7} intensity={6} color="#00f0ff" />
        </Environment>

        <Crystal />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!still}
          autoRotateSpeed={1}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI * 0.72}
        />
      </Canvas>
    </div>
  );
}
