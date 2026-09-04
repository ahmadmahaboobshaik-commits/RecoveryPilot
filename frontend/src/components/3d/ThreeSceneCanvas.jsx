import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeSceneCanvas({
  interactive = true,
  density = 'medium',
  className = '',
  opacity = 0.35,
  showCore = true
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x171717, 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(4, 2, 22);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // Group for objects sitting in right negative space behind content
    const mainGroup = new THREE.Group();
    mainGroup.position.set(5, 0, -2);
    scene.add(mainGroup);

    if (showCore) {
      // Outer Thin Spatial Ring 1 (Vintage Rosewood Accent)
      const ringGeo1 = new THREE.TorusGeometry(5.2, 0.03, 16, 120);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: 0x7d4047,
        transparent: true,
        opacity: opacity * 0.8
      });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 4;
      ring1.rotation.y = Math.PI / 6;
      mainGroup.add(ring1);

      // Outer Thin Spatial Ring 2 (Soft Graphite)
      const ringGeo2 = new THREE.TorusGeometry(6.5, 0.02, 16, 120);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0x6f6a64,
        transparent: true,
        opacity: opacity * 0.6
      });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = -Math.PI / 3;
      ring2.rotation.z = Math.PI / 8;
      mainGroup.add(ring2);

      // Inner Architectural Geodesic Frame (Silver / Slate)
      const innerGeo = new THREE.IcosahedronGeometry(3.0, 2);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0xddd5cd,
        wireframe: true,
        transparent: true,
        opacity: opacity * 0.7,
        roughness: 0.5,
        metalness: 0.8
      });
      const innerFrame = new THREE.Mesh(innerGeo, innerMat);
      mainGroup.add(innerFrame);

      // Floating Translucent Glass Central Plane
      const planeGeo = new THREE.CircleGeometry(2.2, 32);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x4a6b53,
        transparent: true,
        opacity: opacity * 0.15,
        side: THREE.DoubleSide
      });
      const glassPlane = new THREE.Mesh(planeGeo, planeMat);
      glassPlane.rotation.x = Math.PI / 3;
      mainGroup.add(glassPlane);
    }

    // Ambient Signal Nodes
    const particleCount = density === 'high' ? 250 : 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorChoices = [
      new THREE.Color(0x7d4047), // Vintage Rosewood
      new THREE.Color(0xddd5cd), // Warm Greige
      new THREE.Color(0x4a6b53), // Soft Sage
      new THREE.Color(0x38bdf8)  // Technical Blue
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const col = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: opacity * 0.8,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particleSystem);

    // Studio Lighting (Subtle white, rosewood, sage)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x7d4047, 0.8);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x4a6b53, 0.6);
    dirLight2.position.set(-10, -10, 5);
    scene.add(dirLight2);

    // Mouse Parallax Interaction (NO CONTINUOUS ROTATION)
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (event) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      targetMouseX = (x / rect.width - 0.5) * 2;
      targetMouseY = (y / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Mouse Parallax: ±3° Y-rotation, ±2° X-rotation (NO CONTINUOUS ROTATION)
      mainGroup.rotation.y = mouseX * 0.052;
      mainGroup.rotation.x = -mouseY * 0.035;

      camera.position.x = 4 + mouseX * 0.8;
      camera.position.y = 2 - mouseY * 0.5;
      camera.lookAt(2, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive, density, opacity, showCore]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
      style={{ overflow: 'hidden' }}
    />
  );
}
