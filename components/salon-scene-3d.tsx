'use client'

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function LuxuryArmchair() {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.15
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.65, 0]}>
      {/* Base em Latão / Rose Gold */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.95, 1, 0.08, 48]} />
        <meshStandardMaterial color="#fb7185" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Coluna Central */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.7, 32]} />
        <meshStandardMaterial color="#4c0519" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Assento de Couro Rosa Rose Velvet */}
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[0.95, 0.18, 0.9]} />
        <meshStandardMaterial color="#9f1239" roughness={0.35} />
      </mesh>

      {/* Encosto Anatómico de Couro Rosa Velvet */}
      <mesh position={[0, 1.4, -0.4]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.95, 1, 0.14]} />
        <meshStandardMaterial color="#9f1239" roughness={0.35} />
      </mesh>

      {/* Braços com Pormenores em Rose Gold */}
      {[-0.52, 0.52].map((x, i) => (
        <group key={i} position={[x, 1.1, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.09, 0.4, 0.75]} />
            <meshStandardMaterial color="#4c0519" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <boxGeometry args={[0.11, 0.04, 0.77]} />
            <meshStandardMaterial color="#f472b6" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Apoio de Pés Rose Gold */}
      <mesh position={[0, 0.25, 0.65]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.32]} />
        <meshStandardMaterial color="#fb7185" metalness={0.85} roughness={0.2} />
      </mesh>
    </group>
  )
}

function ArchMirror() {
  return (
    <group position={[0, 1.25, -1.25]}>
      {/* Moldura de Arco em Rose Gold */}
      <mesh>
        <boxGeometry args={[2.3, 3.4, 0.08]} />
        <meshStandardMaterial color="#f472b6" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Luz Quente Rosa Traseira (Backlight Halo) */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.45, 3.55, 0.02]} />
        <meshBasicMaterial color="#fbcfe8" toneMapped={false} />
      </mesh>
      {/* Espelho Cristal Refletivo */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[2.1, 3.2]} />
        <meshStandardMaterial color="#ffffff" metalness={0.96} roughness={0.03} />
      </mesh>
    </group>
  )
}

function LuxuryCosmeticsBottle() {
  const bottleRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (bottleRef.current) {
      bottleRef.current.rotation.y += 0.008
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5} position={[1.45, 0.45, 0.2]}>
      <group
        ref={bottleRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.15 : 1}
      >
        {/* Frasco Rosa de Alta Cosmetologia */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.5, 32]} />
          <meshPhysicalMaterial
            color="#e11d48"
            transmission={0.8}
            opacity={0.95}
            transparent
            roughness={0.1}
            ior={1.45}
          />
        </mesh>
        {/* Doseador Metálico Rose Gold */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshStandardMaterial color="#fb7185" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  )
}

function MinimalScissors() {
  const scissorsRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (scissorsRef.current) {
      scissorsRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 1.2) * 0.1
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6} position={[-1.45, 0.55, 0.2]}>
      <group ref={scissorsRef} rotation={[0, 0, Math.PI / 6]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.04, 0.65, 0.012]} />
          <meshStandardMaterial color="#881337" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.04, 0.2, 0.005]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.04, 0.65, 0.012]} />
          <meshStandardMaterial color="#f472b6" metalness={0.95} roughness={0.15} />
        </mesh>
      </group>
    </Float>
  )
}

export default function SalonScene3D() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-[2.5rem] border border-rose-200 bg-[#fff5f7] shadow-2xl shadow-rose-500/10">
      <div className="absolute left-6 top-6 z-10">
        <span className="rounded-full border border-rose-200 bg-white/90 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-rose-800 backdrop-blur-md shadow-sm">
          Studio 3D Interativo — Atelier Rose
        </span>
      </div>

      <div className="absolute right-6 top-6 z-10 text-xs font-medium text-rose-400">
        Rode para explorar em 3D
      </div>

      <Canvas className="h-full w-full cursor-grab active:cursor-grabbing">
        <PerspectiveCamera makeDefault position={[0, 1.2, 4.3]} fov={48} />

        {/* Iluminação Quente de Estúdio com Tons Rosa */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 9, 6]} intensity={1.4} color="#fbcfe8" castShadow />
        <pointLight position={[-4, 4, -1]} intensity={0.9} color="#fb7185" />
        <pointLight position={[3, -1, 3]} intensity={0.5} color="#fda4af" />

        <ArchMirror />
        <LuxuryArmchair />
        <LuxuryCosmeticsBottle />
        <MinimalScissors />

        <ContactShadows position={[0, -0.7, 0]} opacity={0.4} scale={6} blur={2.5} far={4} color="#881337" />
        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2 + 0.02} minPolarAngle={Math.PI / 4} rotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
