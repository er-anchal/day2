import React, { useRef, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { Center } from '@react-three/drei';
import * as THREE from 'three';

export default function JewelleryModel({
  metalConfig,
  gemConfig,
  modelType = 'procedural_ring', // 'procedural_ring', 'procedural_pendant', 'procedural_bangle', 'procedural_article', 'stl_model'
  stlUrl = null,
  caratScale = 1.0,
  engravingText = '',
}) {

  // Detect file type from the extension
  const fileType = useMemo(() => {
    if (!stlUrl) return 'stl';
    const cleanUrl = stlUrl.split('?')[0];
    const ext = cleanUrl.split('.').pop().toLowerCase();
    // '3dm' is a Rhino production file — not renderable by STLLoader, skip it
    if (['stl', 'glb', 'gltf', 'obj', '3dm'].includes(ext)) {
      return ext;
    }
    return 'stl';
  }, [stlUrl]);


  // Create Metal Material
  const metalMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: metalConfig.color,
      metalness: metalConfig.metalness !== undefined ? metalConfig.metalness : 1.0,
      roughness: metalConfig.roughness !== undefined ? Math.max(metalConfig.roughness, 0.05) : 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 2.5,
      bumpScale: 0.05,
    });
  }, [metalConfig]);

  // Create Gemstone Material (Stunning physical refraction effect)
  const gemMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: gemConfig.color,
      metalness: 0.0,
      roughness: 0.02,
      transmission: 0.9,
      thickness: 1.0,
      ior: gemConfig.ior || (gemConfig.color === '#ffffff' ? 2.417 : 1.76), // Index of refraction
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.5,
      side: THREE.DoubleSide, // Ensure back faces are visible to catch reflections
    });
  }, [gemConfig]);

  // Tiny accent gem material (diamonds)
  const accentGemMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0.0,
      roughness: 0.02,
      transmission: 0.9,
      thickness: 0.5,
      ior: 2.417,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.0,
      side: THREE.DoubleSide,
    });
  }, []);

  // 1. Procedural Luxury Ring
  const renderProceduralRing = () => {
    // We construct a stunning multi-part ring model procedurally
    return (
      <group>
        {/* Ring Shank (Band) */}
        <mesh material={metalMaterial} castShadow receiveShadow>
          <torusGeometry args={[1.2, 0.18, 32, 120]} />
        </mesh>

        {/* Dynamic Engraving (Visual text in 3D using canvas texturing or placement) */}
        {engravingText && (
          <group position={[0, -1.0, 0]} rotation={[0, 0, 0]}>
            {/* Simple representation: plate on the inside */}
            <mesh material={metalMaterial} position={[0, 0.05, 0]}>
              <boxGeometry args={[0.6, 0.02, 0.15]} />
            </mesh>
          </group>
        )}

        {/* Gemstone Setting / Crown (Prongs) */}
        <group position={[0, 1.25, 0]}>
          {/* Prong base ring */}
          <mesh material={metalMaterial} position={[0, -0.05, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.25, 0.08, 16]} />
          </mesh>

          {/* Individual Prongs */}
          <group>
            {[0, 90, 180, 270].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const prongRadius = 0.28;
              return (
                <mesh
                  key={idx}
                  material={metalMaterial}
                  position={[Math.sin(rad) * prongRadius, 0.15, Math.cos(rad) * prongRadius]}
                  rotation={[0, 0, -rad * 0.15]}
                  castShadow
                >
                  <cylinderGeometry args={[0.035, 0.035, 0.35, 8]} />
                </mesh>
              );
            })}
          </group>

          {/* Main Gemstone (Brilliant Cut Cut Diamond Geometry) */}
          <group scale={[caratScale, caratScale, caratScale]} position={[0, 0.12, 0]}>
            {/* Gem Crown / Face */}
            <mesh material={gemMaterial} castShadow>
              <coneGeometry args={[0.35, 0.3, 8, 1, false]} />
            </mesh>
            {/* Gem Pavilion (Inverted cone underneath for light bounces) */}
            <mesh
              material={gemMaterial}
              position={[0, -0.22, 0]}
              rotation={[Math.PI, 0, 0]}
              castShadow
            >
              <coneGeometry args={[0.35, 0.45, 8, 1, false]} />
            </mesh>
          </group>
        </group>

        {/* Pavé Shoulder Diamonds (Side Accent Stones) */}
        <group>
          {[-1, 1].map((side) => (
            <group key={side}>
              {[15, 25, 35, 45].map((angle, idx) => {
                const rad = (angle * Math.PI) / 180 * side;
                const r = 1.2;
                return (
                  <group
                    key={idx}
                    position={[Math.sin(rad) * r, Math.cos(rad) * r, 0]}
                    rotation={[0, 0, -rad]}
                  >
                    {/* Metal bezel holder */}
                    <mesh material={metalMaterial} position={[0, 0.09, 0]}>
                      <cylinderGeometry args={[0.07, 0.06, 0.04, 8]} />
                    </mesh>
                    {/* Accent stone */}
                    <mesh material={accentGemMaterial} position={[0, 0.11, 0]}>
                      <sphereGeometry args={[0.05, 12, 12]} />
                    </mesh>
                  </group>
                );
              })}
            </group>
          ))}
        </group>
      </group>
    );
  };

  // 2. Procedural Luxury Pendant
  const renderProceduralPendant = () => {
    return (
      <group>
        {/* Bail (hanging ring) */}
        <mesh material={metalMaterial} position={[0, 1.4, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.25, 0.06, 16, 48]} />
        </mesh>

        {/* Main Tear-Drop / Halo Pendant Frame */}
        <mesh material={metalMaterial} position={[0, 0.2, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.8, 0.12, 16, 80]} />
        </mesh>

        {/* Center Stone Prong Mount */}
        <mesh material={metalMaterial} position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.35, 0.1, 16]} />
        </mesh>

        {/* Center Pendant Stone */}
        <group scale={[caratScale, caratScale, caratScale]} position={[0, 0.2, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={gemMaterial} castShadow>
            <coneGeometry args={[0.42, 0.25, 8, 1]} />
          </mesh>
          <mesh material={gemMaterial} position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[0.42, 0.35, 8, 1]} />
          </mesh>
        </group>

        {/* Accent stones in Halo surrounding the center */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const r = 0.8;
          return (
            <mesh
              key={idx}
              material={accentGemMaterial}
              position={[Math.sin(rad) * r, Math.cos(rad) * r + 0.2, 0.08]}
              castShadow
            >
              <sphereGeometry args={[0.06, 8, 8]} />
            </mesh>
          );
        })}
      </group>
    );
  };

  // 3. Procedural Luxury Bangle (Bracelet)
  const renderProceduralBangle = () => {
    return (
      <group>
        {/* Main Bangle Band */}
        <mesh material={metalMaterial} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[1.5, 0.14, 24, 100]} />
        </mesh>

        {/* Multiple gemstones arranged around the perimeter */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const r = 1.5;
          return (
            <group
              key={idx}
              position={[Math.sin(rad) * r, 0, Math.cos(rad) * r]}
              rotation={[0, -rad, 0]}
            >
              {/* Outer gem settings */}
              <mesh material={metalMaterial} position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.13, 0.11, 0.08, 8]} />
              </mesh>
              {/* Gemstone */}
              <mesh material={gemMaterial} position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
                <sphereGeometry args={[0.09, 12, 12]} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  };

  // 4. Procedural Article (Stunning Diamond Jewellery Box / Base)
  const renderProceduralArticle = () => {
    return (
      <group>
        {/* Luxury display cushion base */}
        <mesh material={metalMaterial} position={[0, -0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.8, 2.0, 0.35, 32]} />
        </mesh>
        
        {/* Velvet cushion insert */}
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[1.68, 1.68, 0.15, 32]} />
          <meshPhysicalMaterial color="#0b1326" roughness={0.95} metalness={0.0} />
        </mesh>

        {/* Standing crown ornament */}
        <group position={[0, 0.3, 0]}>
          <mesh material={metalMaterial} castShadow>
            <torusGeometry args={[0.6, 0.08, 16, 64]} />
          </mesh>
          <mesh material={gemMaterial} position={[0, 0.7, 0]} scale={[caratScale, caratScale, caratScale]}>
            <dodecahedronGeometry args={[0.22, 1]} />
          </mesh>
          
          {/* Arch wire prongs */}
          {[0, 120, 240].map((angle, idx) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <mesh
                key={idx}
                material={metalMaterial}
                position={[Math.sin(rad) * 0.4, 0.3, Math.cos(rad) * 0.4]}
                rotation={[0.2, rad, 0]}
              >
                <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
              </mesh>
            );
          })}
        </group>
      </group>
    );
  };

  // Render the appropriate geometry inside Center
  return (
    <Center>
      {modelType === 'stl_model' && stlUrl ? (
        // .3dm is a Rhino production file — cannot be rendered by STLLoader/WebGL, skip silently
        fileType === '3dm' ? null
        : fileType === 'glb' || fileType === 'gltf' ? (
          <GLTFModelMesh
            url={stlUrl}
            metalMaterial={metalMaterial}
            gemMaterial={gemMaterial}
          />
        ) : fileType === 'obj' ? (
          <OBJModelMesh
            url={stlUrl}
            metalMaterial={metalMaterial}
            gemMaterial={gemMaterial}
          />
        ) : (
          <STLModelMesh
            stlUrl={stlUrl}
            metalMaterial={metalMaterial}
          />
        )
      ) : modelType === 'procedural_pendant' ? (
        renderProceduralPendant()
      ) : modelType === 'procedural_bangle' ? (
        renderProceduralBangle()
      ) : modelType === 'procedural_article' ? (
        renderProceduralArticle()
      ) : (
        // Fallback to Procedural Luxury Ring
        renderProceduralRing()
      )}
    </Center>
  );
}

// Sub-component to load GLB/GLTF models and apply metal/gem materials dynamically based on mesh names
function GLTFModelMesh({ url, metalMaterial, gemMaterial }) {
  const gltf = useLoader(GLTFLoader, url);
  const copiedScene = useMemo(() => {
    const scene = gltf.scene.clone();
    scene.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        // Dynamically detect if this mesh component is a gemstone based on name metadata
        if (
          name.includes('gem') ||
          name.includes('stone') ||
          name.includes('diamond') ||
          name.includes('ruby') ||
          name.includes('emerald') ||
          name.includes('sapphire') ||
          name.includes('crystal')
        ) {
          child.material = gemMaterial;
        } else {
          child.material = metalMaterial;
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return scene;
  }, [gltf, metalMaterial, gemMaterial]);

  return (
    <primitive
      object={copiedScene}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[0.07, 0.07, 0.07]}
    />
  );
}

// Sub-component to load OBJ models and apply metal/gem materials dynamically based on mesh names
function OBJModelMesh({ url, metalMaterial, gemMaterial }) {
  const obj = useLoader(OBJLoader, url);
  const copiedObj = useMemo(() => {
    const scene = obj.clone();
    scene.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        // Dynamically detect if this mesh component is a gemstone based on name metadata
        if (
          name.includes('gem') ||
          name.includes('stone') ||
          name.includes('diamond') ||
          name.includes('ruby') ||
          name.includes('emerald') ||
          name.includes('sapphire') ||
          name.includes('crystal')
        ) {
          child.material = gemMaterial;
        } else {
          child.material = metalMaterial;
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return scene;
  }, [obj, metalMaterial, gemMaterial]);

  return (
    <primitive
      object={copiedObj}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[0.07, 0.07, 0.07]}
    />
  );
}

// Sub-component to dynamically load the STL CAD model mesh (renders exactly what is designed in the file)
function STLModelMesh({ stlUrl, metalMaterial }) {
  const loadedStlGeometry = useLoader(STLLoader, stlUrl);
  return (
    <mesh
      geometry={loadedStlGeometry}
      material={metalMaterial}
      castShadow
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]} // STL models are often vertically oriented in Y/Z differently
      scale={[0.07, 0.07, 0.07]} // standard scaling down to fit viewer beautifully
    />
  );
}
