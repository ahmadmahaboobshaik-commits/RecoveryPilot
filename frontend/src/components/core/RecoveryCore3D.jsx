import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

export function RecoveryCore3D({
  className = '',
  scrollProgress = 0, // 0.0 to 1.0 continuous scroll
  interactive = true
}) {
  const containerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 0, 11.5); // Initial far distance

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch {
      setWebglSupported(false);
      return;
    }

    // Warm Light Space Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const directLight1 = new THREE.DirectionalLight(0x0284c7, 2.5);
    directLight1.position.set(6, 8, 8);
    scene.add(directLight1);

    const directLight2 = new THREE.DirectionalLight(0x8b5cf6, 2.0);
    directLight2.position.set(-6, -6, -4);
    scene.add(directLight2);

    const heartLight = new THREE.PointLight(0x8b5cf6, 3.0, 14);
    heartLight.position.set(0, 0, 0);
    scene.add(heartLight);

    const ringPointLight = new THREE.PointLight(0x0284c7, 3.0, 10);
    ringPointLight.position.set(0, 3.3, 0.5);
    scene.add(ringPointLight);

    // Root Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 1. Inner Living Nucleus (Technological Heart)
    const nucleusGeo = new THREE.IcosahedronGeometry(1.35, 4);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.9,
      roughness: 0.25,
      metalness: 0.75
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleus);

    // 2. Outer Liquid Glass Torus
    const ringGeo = new THREE.TorusGeometry(3.3, 0.25, 32, 140);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.96,
      opacity: 0.92,
      transparent: true,
      roughness: 0.04,
      ior: 1.58,
      thickness: 1.8,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      attenuationColor: new THREE.Color(0x0284c7),
      attenuationDistance: 2.0
    });
    const liquidRing = new THREE.Mesh(ringGeo, ringMat);
    coreGroup.add(liquidRing);

    // 3. Circular Safety Gate
    const policyGateGeo = new THREE.TorusGeometry(4.3, 0.018, 16, 120);
    const policyGateMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.18
    });
    const policyGate = new THREE.Mesh(policyGateGeo, policyGateMat);
    coreGroup.add(policyGate);

    // 4. Hero Lifecycle Payment Particle
    const heroParticleGeo = new THREE.SphereGeometry(0.14, 20, 20);
    const heroParticleMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 2.8,
      roughness: 0.1
    });
    const heroParticle = new THREE.Mesh(heroParticleGeo, heroParticleMat);
    scene.add(heroParticle);

    // 5. Ambient Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    const cCoral = new THREE.Color(0xef4444);
    const cViolet = new THREE.Color(0x8b5cf6);
    const cCyan = new THREE.Color(0x0284c7);
    const cEmerald = new THREE.Color(0x10b981);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.2 + Math.random() * 3.2;
      angles[i] = angle;
      radii[i] = radius;
      speeds[i] = 0.002 + Math.random() * 0.004;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.0;

      const col = radius > 4.2 ? cCoral : radius > 3.2 ? cViolet : radius > 2.4 ? cCyan : cEmerald;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const ambientParticles = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(ambientParticles);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouseX = x * 0.16;
      targetMouseY = y * 0.12;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Soft Mouse Parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      coreGroup.rotation.y = mouseX * 0.12;
      coreGroup.rotation.x = mouseY * 0.10;
      coreGroup.position.x = mouseX * 0.35;
      coreGroup.position.y = mouseY * 0.25;

      // Biological Inhale/Hold/Exhale/Pause rhythm
      const breathPhase = (elapsedTime * 1.2) % (Math.PI * 2);
      const breath = Math.pow(Math.sin(breathPhase), 4) * 0.08;

      nucleus.scale.set(1 + breath * 1.3, 1 + breath * 1.3, 1 + breath * 1.3);
      liquidRing.scale.set(1 + breath * 0.3, 1 + breath * 0.3, 1 + breath * 0.3);

      // Light travelling smoothly through glass ring perimeter
      const lightAngle = elapsedTime * 0.6;
      ringPointLight.position.set(Math.cos(lightAngle) * 3.3, Math.sin(lightAngle) * 3.3, 0.4);

      // Scroll-Driven Camera Dolly (Linear, no continuous orbital spinning)
      const p = Math.min(Math.max(scrollProgress, 0), 1);
      let targetCamZ = 11.5;
      let targetCamY = 0;

      if (p < 0.2) {
        targetCamZ = 11.5 - (p / 0.2) * 2.5; // 11.5 -> 9.0
        targetCamY = 0;
      } else if (p < 0.5) {
        const t = (p - 0.2) / 0.3;
        targetCamZ = 9.0 - t * 1.8; // 9.0 -> 7.2
        targetCamY = t * 0.2;
      } else if (p < 0.75) {
        const t = (p - 0.5) / 0.25;
        targetCamZ = 7.2 - t * 1.4; // 7.2 -> 5.8
        targetCamY = 0.2 - t * 0.2;
      } else {
        const t = (p - 0.75) / 0.25;
        targetCamZ = 5.8 + t * 2.7; // 5.8 -> 8.5
        targetCamY = 0;
      }

      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;

      // Hero Payment Particle Trajectory along the 6 Lifecycle Stages
      if (p < 0.18) {
        heroParticleMat.color.setHex(0xef4444);
        heroParticleMat.emissive.setHex(0xef4444);
        heroParticle.position.set(
          3.6 + Math.cos(elapsedTime * 0.5) * 0.2,
          2.0 + Math.sin(elapsedTime * 0.5) * 0.2,
          1.8
        );
      } else if (p < 0.38) {
        heroParticleMat.color.setHex(0xef4444);
        heroParticleMat.emissive.setHex(0xef4444);
        const t = (p - 0.18) / 0.20;
        const radius = 3.6 - t * 0.4;
        const angle = lightAngle + 1.2;
        heroParticle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.4);
      } else if (p < 0.56) {
        heroParticleMat.color.setHex(0x8b5cf6);
        heroParticleMat.emissive.setHex(0x8b5cf6);
        const t = (p - 0.38) / 0.18;
        const radius = 3.2 - t * 1.5;
        const angle = lightAngle + 1.8;
        heroParticle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.2);
        nucleusMat.emissiveIntensity = 1.1;
      } else if (p < 0.74) {
        heroParticleMat.color.setHex(0x0284c7);
        heroParticleMat.emissive.setHex(0x0284c7);
        policyGateMat.opacity = 0.55;
        const t = (p - 0.56) / 0.18;
        const radius = 1.7 + t * 1.5;
        const angle = lightAngle + 2.4;
        heroParticle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.3);
      } else if (p < 0.88) {
        heroParticleMat.color.setHex(0x0284c7);
        heroParticleMat.emissive.setHex(0x0284c7);
        const t = (p - 0.74) / 0.14;
        heroParticle.position.set(2.2 + t * 2.2, Math.sin(elapsedTime * 1.5) * 0.4, 0.5);
      } else {
        heroParticleMat.color.setHex(0x10b981);
        heroParticleMat.emissive.setHex(0x10b981);
        const t = (p - 0.88) / 0.12;
        const radius = 2.8 * (1 - t);
        const angle = elapsedTime * 1.5;
        heroParticle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.1);
        nucleusMat.emissive.setHex(0x10b981);
        nucleusMat.emissiveIntensity = 1.4 + breath * 2.5;
        heartLight.color.setHex(0x10b981);
      }

      // Ambient particle drift
      const posAttr = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        angles[i] += speeds[i];
        const rad = radii[i] + Math.sin(elapsedTime * 0.5 + i) * 0.05;
        posAttr.array[i * 3] = Math.cos(angles[i]) * rad;
        posAttr.array[i * 3 + 1] = Math.sin(angles[i]) * rad;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      policyGateGeo.dispose();
      policyGateMat.dispose();
      heroParticleGeo.dispose();
      heroParticleMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [scrollProgress, interactive, prefersReducedMotion]);

  return (
    <div className={`relative w-full h-full select-none pointer-events-none ${className}`} ref={containerRef}>
      {!webglSupported && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-96 h-96 rounded-full border border-slate-900/10 bg-gradient-to-tr from-violet-600/10 via-cyan-500/10 to-transparent blur-xl" />
        </div>
      )}
    </div>
  );
}

export default RecoveryCore3D;
