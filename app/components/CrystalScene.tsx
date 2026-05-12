"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

function Crystal() {
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

    const merged = mergeGeometries([body, top, bot]);
    merged.computeVertexNormals();
    return merged;
  }, []);

  // Subtle float
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.07;
  });

  return (
    // Slight tilt so you immediately see it's 3D, not a flat shape
    <mesh ref={ref} geometry={geo} rotation={[0.18, 0.5, 0.06]} frustumCulled={false}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={0.3}
        samples={4}
        resolution={256}
        transmission={0.88}   // slight opacity so material itself is visible
        roughness={0.04}      // tiny roughness = visible surface highlights
        thickness={2.2}
        ior={1.52}
        chromaticAberration={0.07}
        anisotropy={0.25}
        distortion={0.05}
        distortionScale={0.08}
        temporalDistortion={0}
        color="#e8f4ff"       // near-white with faint blue — reads as clear glass
        attenuationDistance={5}
        attenuationColor="#ffffff"
      />
    </mesh>
  );
}

export default function CrystalScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 6.5], fov: 36 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}         // cap at 1.5× — retina-quality without 4× GPU cost
      style={{ background: "transparent" }}
    >
      {/* Environment gives the crystal something bright to refract/reflect */}
      <Environment preset="studio" environmentIntensity={1.2} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 4]} intensity={6} />
      <directionalLight position={[-5, 3, -3]} intensity={2} color="#3b6fcc" />
      <pointLight position={[4, 5, 3]}  intensity={5} color="#6b9fe8" />
      <pointLight position={[-4, -3, 5]} intensity={2} color="#ffffff" />
      <pointLight position={[0, -4, 2]} intensity={1.2} color="#1e4a8a" />

      <Crystal />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.0}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI * 0.72}
      />
    </Canvas>
  );
}
