import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Environment } from '@react-three/drei';
import { Box } from '@mui/material';
import * as THREE from 'three';
import JewelleryModel from './JewelleryModel';

// Premium Loader Overlay - uses plain HTML/CSS so it renders cleanly inside Drei Html portal
function CanvasLoader({ darkMode }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '24px',
    }}>
      {/* Spinner ring */}
      <div style={{
        width: 44,
        height: 44,
        border: '4px solid rgba(255, 215, 0, 0.2)',
        borderTop: '4px solid #ffd700',
        borderRadius: '50%',
        animation: 'jewellery-spin 0.9s linear infinite',
      }} />
      <style>{`@keyframes jewellery-spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{
        color: darkMode ? '#e5e5e5' : '#1e293b',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        fontSize: '0.72rem',
        whiteSpace: 'nowrap',
      }}>Loading 3D Model...</span>
    </div>
  );
}

// Camera controller component to handle autoRotate pulsing zoom and omnidirectional orbit
function CameraController({ autoRotate, onManualInteraction }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useFrame((state) => {
    if (autoRotate) {
      const time = state.clock.getElapsedTime();
      
      // 1. Zoom pulse (distance) - oscillates smoothly between 4.0 and 5.2 to go right up to the borders without going outside
      const distance = 4.6 + Math.sin(time * 0.8) * 0.6;
      
      // 2. Rotate in every direction (horizontal orbit theta + vertical polar oscillation phi)
      const theta = time * 0.5; // continuous horizontal rotation
      const phi = Math.PI / 2.8 + Math.sin(time * 0.4) * (Math.PI / 8); // vertical sway up and down
      
      // Convert spherical coordinates to Cartesian camera positions
      camera.position.x = distance * Math.sin(phi) * Math.sin(theta);
      camera.position.y = distance * Math.cos(phi) + 0.25;
      camera.position.z = distance * Math.sin(phi) * Math.cos(theta);
      
      camera.lookAt(0, -0.2, 0);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!autoRotate} // Disable OrbitControls when auto-rotating so it doesn't fight the camera override
      enableZoom={true}
      minDistance={1.5}
      maxDistance={8.0}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.06}
      minPolarAngle={0}
      maxPolarAngle={Math.PI} // Allow complete orbital freedom manually
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
      onStart={onManualInteraction}
    />
  );
}

// Custom 3D background stage plane that stays centered behind the model relative to the camera,
// so it remains static during rotation but expands/zooms on manual zoom in
function StageBackground({ texture, visible }) {
  const meshRef = useRef();
  const opacityRef = useRef(1.0);

  useFrame((state) => {
    if (meshRef.current) {
      const dir = new THREE.Vector3();
      state.camera.getWorldDirection(dir);
      
      // Position the background plane directly behind the target along the camera's viewing axis
      const target = new THREE.Vector3(0, -0.2, 0);
      meshRef.current.position.copy(target).addScaledVector(dir, -1.8);
      
      // Face the camera perfectly
      meshRef.current.lookAt(state.camera.position);

      // Scale based on the viewport size at the default camera distance (4.5)
      // This handles screen resizing (fullscreen) but lets manual zoom expand the billboard!
      try {
        const tempCamera = state.camera.clone();
        const camDir = new THREE.Vector3().subVectors(state.camera.position, target).normalize();
        tempCamera.position.copy(target).addScaledVector(camDir, 4.5);
        
        const viewport = state.viewport.getCurrentViewport 
          ? state.viewport.getCurrentViewport(tempCamera, meshRef.current.position) 
          : state.viewport;
        
        const size = Math.min(viewport.width, viewport.height) * 0.95;
        meshRef.current.scale.set(size / 5.2, size / 5.2, 1);
      } catch (err) {
        console.warn('Failed to dynamically scale stage background:', err);
      }

      // Smoothly animate opacity
      const targetOpacity = visible ? 1.0 : 0.0;
      opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, targetOpacity, 0.1);
      meshRef.current.material.opacity = opacityRef.current;
      meshRef.current.visible = opacityRef.current > 0.01;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={-999}>
      <planeGeometry args={[5.2, 5.2]} />
      <meshBasicMaterial map={texture} transparent={true} depthWrite={false} opacity={1.0} />
    </mesh>
  );
}

export default function JewelleryCanvas({
  metalConfig,
  gemConfig,
  modelType,
  stlUrl,
  caratScale = 1.0,
  engravingText = '',
  autoRotate = false,
  canvasRef,
  darkMode = false,
}) {
  const [isManualInteracted, setIsManualInteracted] = useState(false);

  useEffect(() => {
    setIsManualInteracted(false);
  }, [autoRotate, stlUrl, modelType]);

  // Dynamically generate the background radial gradient texture with borders and shadows in canvas 2D
  const backgroundTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, 1024, 1024);

    // Geometry bounds matching 24px border radius style (scaled to 1024px canvas size)
    const x = 64;
    const y = 64;
    const w = 896;
    const h = 896;
    const r = 48; // corner radius

    // 1. Draw outer soft gold shadow (no solid fill/lines)
    ctx.save();
    ctx.shadowColor = 'rgba(255, 215, 0, 0.18)';
    ctx.shadowBlur = 80;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.01)'; // almost transparent fill, so only the shadow is visible
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Radial gradient in center:
    // radial-gradient(circle at center, rgba(255,215,0,0.35) 0%, rgba(255,215,0,0.18) 40%, rgba(255,215,0,0.08) 70%, rgba(255,215,0,0.00) 100%)
    ctx.save();
    const grad = ctx.createRadialGradient(512, 512, 0, 512, 512, 448);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0.35)');
    grad.addColorStop(0.4, 'rgba(255, 215, 0, 0.18)');
    grad.addColorStop(0.7, 'rgba(255, 215, 0, 0.08)');
    grad.addColorStop(1, 'rgba(255, 215, 0, 0.00)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(512, 512, 448, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Draw inset shadow (inset 0 0 120px rgba(255,215,0,0.35))
    // We clip drawing inside the path so outer area is untouched, then stroke inside with invisible line but solid shadow
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.clip();

    ctx.shadowColor = 'rgba(255, 215, 0, 0.35)';
    ctx.shadowBlur = 120;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.01)'; // completely transparent stroke line to avoid solid borders
    ctx.lineWidth = 16;
    ctx.stroke();
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: darkMode ? '#0a0c10' : '#f8fafc', // outer frame background matching active theme
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      {/* Gold Stage Box Wrapper: positioned 70px from all edges with overflow: hidden */}
      <Box
        sx={{
          position: 'absolute',
          top: 70,
          bottom: 70,
          left: 70,
          right: 70,
          borderRadius: '24px',
          border: darkMode ? '2px solid rgba(255, 215, 0, 0.4)' : '2px solid rgba(184, 151, 51, 0.55)',
          overflow: 'hidden', // hides any manual zoom overflow!
          boxShadow: darkMode
            ? '0 0 40px rgba(255,215,0,0.15)'
            : '0 0 20px rgba(184,151,51,0.08)',
        }}
      >
        <Canvas
          ref={canvasRef}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false }} // alpha: false to draw background color natively
          camera={{ position: [0, 2, 4.5], fov: 42 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Background color of scene matching active theme inside the WebGL context */}
          <color attach="background" args={[darkMode ? '#0a0c10' : '#f8fafc']} />
          
          {/* Subtle fog for premium depth feel */}
          <fog attach="fog" args={[darkMode ? '#0a0c10' : '#f8fafc', 5, 12]} />

          {/* Environment map for realistic reflections */}
          <Environment preset="studio" />

          {/* High-quality local studio lighting rig */}
          <ambientLight intensity={darkMode ? 0.75 : 0.9} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={darkMode ? 1.5 : 1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <directionalLight
            position={[-5, 4, -5]}
            intensity={darkMode ? 0.6 : 0.4}
            color={darkMode ? "#b0c4de" : "#e2e8f0"} // cool steel-blue fill light to balance gold speculars
          />
          <pointLight
            position={[0, 3, 2]}
            intensity={0.8}
            color="#ffffff"
          />
          {/* Subtle rim and gold accent fill lights to bring out shiny specular highlights on metal edges */}
          <pointLight
            position={[3, -2, -3]}
            intensity={0.6}
            color="#ffffff"
          />
          <pointLight
            position={[-3, 1, 3]}
            intensity={0.5}
            color="#ffe4b5" // warm golden-peach specular highlight
          />
          
          {/* View Manipulation Controls handled by CameraController */}
          <CameraController autoRotate={autoRotate} onManualInteraction={() => setIsManualInteracted(true)} />

          <Suspense fallback={<Html center style={{ pointerEvents: 'none' }}><CanvasLoader darkMode={darkMode} /></Html>}>
            {/* Dynamic 3D background stage plane - aligns to camera facing vector so it remains static during rotation but expands on manual zoom in */}
            <StageBackground texture={backgroundTexture} visible={!isManualInteracted} />

            {/* Dynamic Jewellery Model rendering */}
            <group position={[0, -0.2, 0]}>
              <JewelleryModel
                metalConfig={metalConfig}
                gemConfig={gemConfig}
                modelType={modelType}
                stlUrl={stlUrl}
                caratScale={caratScale}
                engravingText={engravingText}
              />
            </group>
          </Suspense>
        </Canvas>
      </Box>
    </Box>
  );
}
