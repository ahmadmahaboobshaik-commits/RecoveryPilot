import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SAMPLE_NODES = [
  { id: 'node-1', name: 'Failed Payment #PAY-8821', type: 'FAILED', val: '₹42,500', error: 'CARD_LIMIT_EXCEEDED', pos: [-8, 2, 0], color: 0x9a5a62 },
  { id: 'node-2', name: 'Failed Payment #PAY-9104', type: 'FAILED', val: '₹18,900', error: 'NETWORK_TIMEOUT', pos: [-8, -2, 2], color: 0x9a5a62 },
  { id: 'node-3', name: 'Failed Payment #PAY-9540', type: 'FAILED', val: '₹1,25,000', error: 'AUTH_CHALLENGE_FAILED', pos: [-8, 0, -3], color: 0x9a5a62 },
  { id: 'node-4', name: 'Claude AI Engine', type: 'AI_DIAGNOSIS', val: 'Active Model v4.2', error: 'Analyzing Patterns...', pos: [0, 0, 0], color: 0x38bdf8 },
  { id: 'node-5', name: 'UPI Dynamic Router', type: 'ROUTER', val: 'Latency: 14ms', error: 'Switching Gateways...', pos: [2, 3, -1], color: 0x415a77 },
  { id: 'node-6', name: 'Razorpay Auto-Retry', type: 'EXECUTOR', val: 'Batch Active', error: 'Executing Action', pos: [3, -2, 1], color: 0x415a77 },
  { id: 'node-7', name: 'Recovered Settlement #SET-1029', type: 'RECOVERED', val: '₹42,500', error: 'SUCCESS (100%)', pos: [8, 3, 1], color: 0x34d399 },
  { id: 'node-8', name: 'Recovered Settlement #SET-1030', type: 'RECOVERED', val: '₹18,900', error: 'SUCCESS (100%)', pos: [8, -1, -2], color: 0x34d399 },
  { id: 'node-9', name: 'Recovered Settlement #SET-1031', type: 'RECOVERED', val: '₹1,25,000', error: 'SUCCESS (100%)', pos: [8, 1, 2], color: 0x34d399 }
];

const CONNECTIONS = [
  { from: 0, to: 3 },
  { from: 1, to: 3 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 6 },
  { from: 4, to: 7 },
  { from: 5, to: 8 }
];

export default function RecoveryNetwork3D({ onNodeSelect, cameraPreset = 'default' }) {
  const mountRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 2, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const nodeMeshes = [];
    const pulseParticles = [];

    // Create 3D Nodes
    SAMPLE_NODES.forEach((nodeData) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...nodeData.pos);

      // Core Sphere
      const radius = nodeData.type === 'AI_DIAGNOSIS' ? 1.3 : 0.7;
      const sphereGeo = new THREE.IcosahedronGeometry(radius, 2);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: nodeData.color,
        emissive: nodeData.color,
        emissiveIntensity: 0.35,
        roughness: 0.4,
        metalness: 0.6,
        flatShading: true
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.userData = nodeData;
      nodeGroup.add(sphere);

      // Outer Halo Ring
      const ringGeo = new THREE.RingGeometry(radius + 0.25, radius + 0.35, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: nodeData.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      nodeGroup.add(ring);

      mainGroup.add(nodeGroup);
      nodeMeshes.push(sphere);
    });

    // Create 3D Curved Conduits & Pulse Particles
    CONNECTIONS.forEach((conn) => {
      const startPos = new THREE.Vector3(...SAMPLE_NODES[conn.from].pos);
      const endPos = new THREE.Vector3(...SAMPLE_NODES[conn.to].pos);
      const midPos = new THREE.Vector3()
        .addVectors(startPos, endPos)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2));

      const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, endPos);
      const points = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x4a4a4a,
        transparent: true,
        opacity: 0.3
      });
      const line = new THREE.Line(lineGeo, lineMat);
      mainGroup.add(line);

      // Pulse Energy Mesh moving along curve
      const pulseGeo = new THREE.SphereGeometry(0.14, 10, 10);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      mainGroup.add(pulseMesh);
      pulseParticles.push({ mesh: pulseMesh, curve, progress: Math.random() });
    });

    // Ambient Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Raycaster for Mouse Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouse.x = (x / rect.width) * 2 - 1;
      mouse.y = -(y / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        setHoveredNode(hitObject.userData);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        container.style.cursor = 'pointer';

        // Subtle hover illumination
        hitObject.material.emissiveIntensity = 0.8;
      } else {
        nodeMeshes.forEach(mesh => {
          mesh.material.emissiveIntensity = 0.35;
        });
        setHoveredNode(null);
        container.style.cursor = 'default';
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0 && onNodeSelect) {
        onNodeSelect(intersects[0].object.userData);
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // Camera preset positions
    const targetCameraPos = new THREE.Vector3(0, 2, 16);
    if (cameraPreset === 'core') targetCameraPos.set(0, 0, 8);
    if (cameraPreset === 'flow') targetCameraPos.set(-4, 4, 14);
    if (cameraPreset === 'orbital') targetCameraPos.set(12, 8, 12);

    let animationFrameId;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;

      // Camera lerp
      camera.position.lerp(targetCameraPos, 0.03);
      camera.lookAt(0, 0, 0);

      // Animate Pulse Particles along conduits (NO ROTATION OF MAIN SCENE)
      pulseParticles.forEach((p) => {
        p.progress += dt * 0.3;
        if (p.progress > 1) p.progress = 0;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [cameraPreset]);

  return (
    <div className="relative w-full h-full min-h-[450px]">
      <div ref={mountRef} className="w-full h-full absolute inset-0" />

      {/* Interactive 3D Tooltip */}
      {hoveredNode && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-4 py-3 bg-[#0B0B0C]/95 backdrop-blur-xl border border-white/16 rounded-xl shadow-2xl text-white min-w-[220px]"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              {hoveredNode.type}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <h4 className="text-sm font-semibold text-slate-100">{hoveredNode.name}</h4>
          <div className="mt-2 flex items-center justify-between text-xs text-[#A5A19A] font-mono">
            <span>Value:</span>
            <span className="font-bold text-emerald-400">{hoveredNode.val}</span>
          </div>
          <div className="mt-1 text-[11px] text-[#6F6C67] font-mono italic">
            {hoveredNode.error}
          </div>
        </div>
      )}
    </div>
  );
}
