"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Quartz crystal: hexagonal prism body + pointed tip, merged into one mesh
// (one mesh = one transmission render pass = cheaper than two meshes)
function Crystal() {
  const ref = useRef<THREE.Mesh>(null);

  const geo = useMemo(() => {
    const body = new THREE.CylinderGeometry(0.38, 0.48, 2.6, 6, 1);
    const tip  = new THREE.ConeGeometry(0.38, 1.05, 6);
    tip.translate(0, 1.825, 0); // place base of cone at top of cylinder (y=1.3)
    const merged = mergeGeometries([body, tip]);
    merged.computeVertexNormals();
    return merged;
  }, []);

  // Subtle idle bob when not interacted with
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.06;
  });

  return (
    <mesh ref={ref} geometry={geo}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={0.25}
        samples={4}          // keep low for perf — still looks great
        resolution={256}     // FBO size; 256 is fast and sharp enough
        transmission={0.97}
        roughness={0.018}
        thickness={2.0}
        ior={1.52}           // real quartz IOR
        chromaticAberration={0.055}
        anisotropy={0.18}
        distortion={0.07}
        distortionScale={0.12}
        temporalDistortion={0}
        color="#c2d8ff"
        attenuationDistance={3.5}
        attenuationColor="#e8f2ff"
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
      {/* Lights only — no HDR preset download */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[6, 10, 4]} intensity={5} />
      <directionalLight position={[-5, 3, -3]} intensity={1.5} color="#3b6fcc" />
      <pointLight position={[4, 5, 3]}  intensity={4} color="#6b9fe8" />
      <pointLight position={[-5, -4, 5]} intensity={1.5} color="#ffffff" />
      {/* Rim light from below for depth */}
      <pointLight position={[0, -4, 2]} intensity={0.8} color="#1e4a8a" />

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
