import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

function GlowOrb() {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.6}>
        <MeshDistortMaterial
          color="#1E40AF"
          speed={4}
          distort={0.5}
          radius={1}
          emissive="#1E40AF"
          emissiveIntensity={2}
          roughness={0}
          metalness={1}
        />
      </Sphere>
    </Float>
  );
}

export default function DarkMedicalScene() {
  return (
    <div className="w-full h-[500px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#60A5FA" />
        <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={2} color="#3B82F6" />
        <GlowOrb />
      </Canvas>
    </div>
  );
}
