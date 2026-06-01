import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ─────────────────────────────────────────────
   Displaced plane mesh — original photo + depth displacement
───────────────────────────────────────────── */
function DepthMesh({ imageUrl, depthCanvas, controls }) {
  const meshRef = useRef();

  // ① Original photo → color texture (what the user actually sees)
  // ② Greyscale depth canvas → displacement map (creates the 3D shape)
  const [imageTex, dispTex] = useMemo(() => {
    // Use TextureLoader for the original image URL
    const it = new THREE.TextureLoader().load(imageUrl);
    it.colorSpace = THREE.SRGBColorSpace;

    // CanvasTexture from greyscale depth — no dataURL roundtrip
    const dt = new THREE.CanvasTexture(depthCanvas);
    dt.needsUpdate = true;

    return [it, dt];
  }, [imageUrl, depthCanvas]);

  // Dispose GPU resources on unmount to prevent memory leaks
  useEffect(() => () => { imageTex.dispose(); dispTex.dispose(); }, [imageTex, dispTex]);

  // Mouse-driven parallax (smooth lerp each frame)
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      mouse.current.y * controls.rotationStrength * -0.015,
      0.05
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      mouse.current.x * controls.rotationStrength *  0.015,
      0.05
    );
    // Subtle floating breathe
    meshRef.current.rotation.z = Math.sin(Date.now() * 0.0003) * 0.004;
  });

  // Aspect-correct plane size from the depth canvas dimensions
  const aspect = depthCanvas.width / depthCanvas.height;
  const pw = aspect >= 1 ? 3 : 3 * aspect;
  const ph = aspect >= 1 ? 3 / aspect : 3;

  return (
    <mesh ref={meshRef}>
      {/* High subdivision for smooth displacement */}
      <planeGeometry args={[pw, ph, 256, 256]} />
      <meshStandardMaterial
        map={imageTex}                                     /* ← original photo */
        displacementMap={dispTex}                          /* ← greyscale depth */
        displacementScale={controls.displacement * 0.3}
        roughness={0.55}
        metalness={0.05}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Scene — lights + mesh + orbit controls
───────────────────────────────────────────── */
function Scene({ imageUrl, depthCanvas, controls }) {
  return (
    <>
      <ambientLight intensity={controls.lightIntensity * 0.7} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={controls.lightIntensity * 1.1}
        castShadow
      />
      <pointLight position={[-3, -2, 3]} intensity={controls.lightIntensity * 0.35} color="#4f7fc0" />
      <DepthMesh imageUrl={imageUrl} depthCanvas={depthCanvas} controls={controls} />
      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={1.5}
        maxDistance={6}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   Public export
───────────────────────────────────────────── */
const DepthViewer3D = ({ imageUrl, depthCanvas, controls }) => (
  <Canvas
    style={{ width: '100%', height: '100%', display: 'block' }}
    camera={{ position: [0, 0, 3.5], fov: 50 }}
    dpr={[1, 2]}
    gl={{ antialias: true, powerPreference: 'high-performance' }}
  >
    <Scene imageUrl={imageUrl} depthCanvas={depthCanvas} controls={controls} />
  </Canvas>
);

export default DepthViewer3D;

