"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface Avatar3DProps {
  modelUrl: string;      // e.g. "/avatars/fullstack-developer.glb"
  size?: number;          // container size in px (default 80)
  autoRotate?: boolean;   // spin slowly (default true)
  rotateSpeed?: number;   // rotation speed (default 0.8)
  hovered?: boolean;      // speed up rotation on hover
}

function Model({ url, hovered }: { url: string; hovered?: boolean }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  // Auto-rotate the model
  useFrame((_, delta) => {
    if (ref.current) {
      const speed = hovered ? 2.5 : 0.6;
      ref.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={ref}>
      <primitive
        object={scene}
        scale={1}
        position={[0, -0.8, 0]}
      />
    </group>
  );
}

function FallbackBox() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#E5E7EB" />
    </mesh>
  );
}

export function Avatar3D({
  modelUrl,
  size = 80,
  hovered = false,
}: Avatar3DProps) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden" }}>
      <Canvas
        camera={{ position: [0, 0.3, 2.2], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <directionalLight position={[-2, 1, -1]} intensity={0.4} />

        <Suspense fallback={<FallbackBox />}>
          <Model url={modelUrl} hovered={hovered} />
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -0.85, 0]}
            opacity={0.3}
            blur={1.5}
            far={1}
          />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}

// Preload models
export function preloadAvatar(url: string) {
  useGLTF.preload(url);
}
