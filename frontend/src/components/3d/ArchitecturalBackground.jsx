import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ArchitecturalBackground({ opacity = 0.25 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x11100f, 0.018);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 25);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    container.appendChild(renderer.domElement);

    // Parent group for background geometry
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -5);
    scene.add(archGroup);

    // 1. Layered Metallic Architectural Slabs
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x1a1816,
      roughness: 0.6,
      metalness: 0.8,
      transparent: true,
      opacity: opacity * 0.9
    });

    const slab1Geo = new THREE.BoxGeometry(18, 0.4, 12);
    const slab1 = new THREE.Mesh(slab1Geo, slabMat);
    slab1.position.set(6, -4, -2);
    slab1.rotation.y = -Math.PI / 8;
    slab1.rotation.x = Math.PI / 12;
    archGroup.add(slab1);

    const slab2Geo = new THREE.BoxGeometry(14, 0.3, 10);
    const slab2 = new THREE.Mesh(slab2Geo, slabMat);
    slab2.position.set(-7, 3, -6);
    slab2.rotation.y = Math.PI / 6;
    slab2.rotation.x = -Math.PI / 14;
    archGroup.add(slab2);

    // 2. Rounded Technical Platforms (Torus & Cylinders)
    const ringGeo = new THREE.TorusGeometry(7.5, 0.04, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x7d4047, // Vintage Rosewood copper/burgundy reflection
      transparent: true,
      opacity: opacity * 0.75
    });
    const platformRing = new THREE.Mesh(ringGeo, ringMat);
    platformRing.position.set(5, 0, -4);
    platformRing.rotation.x = Math.PI / 3;
    archGroup.add(platformRing);

    // 3. Fine Technical Grid & Node Infrastructure
    const gridGeo = new THREE.BufferGeometry();
    const particleCount = 180;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorRosewood = new THREE.Color(0x7d4047);
    const colorGreige = new THREE.Color(0xb7b0a8);
    const colorSage = new THREE.Color(0x16b879);
    const colorCyan = new THREE.Color(0x00a9c7);

    const nodeColors = [colorRosewood, colorGreige, colorSage, colorCyan];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;

      const c = nodeColors[Math.floor(Math.random() * nodeColors.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    gridGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    gridGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const gridMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: opacity * 0.85,
      blending: THREE.AdditiveBlending
    });

    const nodeNodes = new THREE.Points(gridGeo, gridMat);
    archGroup.add(nodeNodes);

    // 4. Subtle Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xf4f1ec, 0.35);
    scene.add(ambientLight);

    const dirLightRosewood = new THREE.DirectionalLight(0x7d4047, 0.7);
    dirLightRosewood.position.set(15, 12, 10);
    scene.add(dirLightRosewood);

    const dirLightSage = new THREE.DirectionalLight(0x16b879, 0.4);
    dirLightSage.position.set(-15, -10, 5);
    scene.add(dirLightSage);

    // Controlled Mouse Parallax (NO FAST AUTO-SPIN)
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      targetMouseX = (x / window.innerWidth - 0.5) * 2;
      targetMouseY = (y / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth lerp mouse parallax (X: max ±2°, Y: max ±3°)
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      archGroup.rotation.y = mouseX * 0.035; // ~2 degrees
      archGroup.rotation.x = -mouseY * 0.052; // ~3 degrees

      camera.position.x = mouseX * 0.6;
      camera.position.y = 4 - mouseY * 0.4;
      camera.lookAt(0, 0, 0);

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
  }, [opacity]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ overflow: 'hidden' }}
    />
  );
}

export default ArchitecturalBackground;
