"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

function Crystal({ still }: { still: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  const geo = useMemo(() => {
    // Real quartz proportions: wide hexagonal body, double-terminated
    // (pointed at both ends — that's what quartz actually looks like)

    // Main body: tapered, slightly wider at base
    const body = new THREE.CylinderGeometry(0.52, 0.62, 1.6, 6, 1);
    // body top at y=+0.8, bottom at y=-0.8

    // Top pyramid (taller = more dramatic)
    const top = new THREE.ConeGeometry(0.52, 0.78, 6);
    top.translate(0, 1.19, 0);
    // top base at y=0.8, apex at y=1.58

    // Bottom pyramid (shorter — secondary termination)
    const bot = new THREE.ConeGeometry(0.62, 0.48, 6);
    bot.rotateX(Math.PI); // flip so apex points down
    bot.translate(0, -1.04, 0);
    // bot base at y=-0.8, apex at y=-1.28

    // Non-indexed so every face keeps its own normal: hard facets, not a smooth blob.
    const merged = mergeGeometries([body, top, bot]).toNonIndexed();
    merged.computeVertexNormals();
    return merged;
  }, []);

  // Subtle float
  useFrame((state) => {
    if (!ref.current || still) return;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.07;
  });

  return (
    // Slight tilt so you immediately see it's 3D, not a flat shape
    <mesh ref={ref} geometry={geo} rotation={[0.18, 0.5, 0.06]} frustumCulled={false}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={0.3}
        samples={4}
        resolution={512}
        transmission={1}
        roughness={0.04}      // tiny roughness = visible surface highlights
        thickness={2.2}
        ior={1.52}
        chromaticAberration={0.07}
        anisotropy={0.25}
        distortion={0.05}
        distortionScale={0.08}
        temporalDistortion={0}
        color="#dfe9ff"
        attenuationDistance={3}
        attenuationColor="#5f8dff"
      />
    </mesh>
  );
}

export default function CrystalScene() {
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  // No drawing while the hero is off screen: the glass material is expensive.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(box.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="h-full">
    <Canvas
      frameloop={visible ? "always" : "never"}
      camera={{ position: [0, 0.2, 7.4], fov: 36 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}         // cap at 1.5× — retina-quality without 4× GPU cost
    >
      {/* Same color as the hero: the glass refracts the page behind it */}
      <color attach="background" args={["#071033"]} />

      {/* Synthetic environment — no external fetch, CSP-safe */}
      <Environment resolution={256}>
        <Lightformer position={[0,  8, -6]} scale={12} intensity={5}  color="#bcd2ff" />
        <Lightformer position={[6,  4,  4]} scale={8}  intensity={4}  color="#c8deff" />
        <Lightformer position={[-6, 2, -2]} scale={8}  intensity={3}  color="#3b6fcc" />
        <Lightformer position={[0, -6,  4]} scale={6}  intensity={2}  color="#6b9fe8" />
        <Lightformer position={[0,  2,  8]} scale={10} intensity={3}  color="#bcd2ff" />
        {/* Behind and to the right: gives the far faces an edge against the night ground */}
        <Lightformer position={[6, 0, -7]} scale={7} intensity={6} color="#9dbcff" />
      </Environment>
            <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 4]} intensity={2} />
      <directionalLight position={[-5, 3, -3]} intensity={1.5} color="#3b6fcc" />
      {/* Rim: keeps the far faces separated from the night ground */}
      <directionalLight position={[5, 1, -4]} intensity={3} color="#9dbcff" />

      <Crystal still={still} />

      {/* One thin orbit: the only ornament on the page */}
      <mesh rotation={[1.32, 0.28, 0]}>
        <torusGeometry args={[1.6, 0.005, 8, 160]} />
        <meshBasicMaterial color="#8fb2ff" />
      </mesh>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!still}
        autoRotateSpeed={1.0}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI * 0.72}
      />
    </Canvas>
    </div>
  );
}
