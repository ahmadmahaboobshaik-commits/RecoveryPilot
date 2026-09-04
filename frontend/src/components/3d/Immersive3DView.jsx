import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ThreeSceneCanvas from './ThreeSceneCanvas';
import RecoveryNetwork3D from './RecoveryNetwork3D';
import GlassCard3D from '../ui/GlassCard3D';
import { Box, Compass, Cpu, Zap, Activity, ShieldCheck, ArrowRight, RefreshCw, Layers } from 'lucide-react';

export default function Immersive3DView({ onNavigate, metrics, activities }) {
  const [cameraPreset, setCameraPreset] = useState('default');
  const [selectedNode, setSelectedNode] = useState(null);
  const [speed, setSpeed] = useState(1.0);
  const [density, setDensity] = useState('high');

  return (
    <div className="relative min-h-screen bg-[#070B14] text-slate-100 overflow-hidden pt-24 pb-16 px-4 sm:px-8">
      
      {/* Background 3D Canvas */}
      <ThreeSceneCanvas
        speed={speed}
        density={density}
        showCore={false}
        className="opacity-40"
      />

      {/* Header Controls Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              WEBGL 3D MATRIX SPAWN
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              60 FPS ACTIVE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Autonomous 3D Recovery Mesh
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Real-time 3D telemetry graph visualizing failed transactions, AI decision pathways, and instantaneous settlement execution. Hover or click 3D nodes to inspect packet data.
          </p>
        </div>

        {/* HUD Camera Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 backdrop-blur-xl">
          <span className="text-xs font-mono text-slate-400 px-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            CAMERA:
          </span>
          {[
            { id: 'default', label: 'Overview' },
            { id: 'core', label: 'AI Core' },
            { id: 'flow', label: 'Pipeline' },
            { id: 'orbital', label: 'Orbital' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setCameraPreset(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
                cameraPreset === btn.id
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 font-bold'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Viewport & Spatial Grid Layout */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 3D Viewport Box */}
        <div className="lg:col-span-8 relative">
          <GlassCard3D className="w-full h-[520px] p-2 flex flex-col justify-between border-cyan-500/30">
            {/* Viewport Header Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-400">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>INTERACTIVE RAYCASTER ACTIVE</span>
              </div>
              <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Speed:</span>
                <button
                  onClick={() => setSpeed((s) => (s === 1.0 ? 2.0 : s === 2.0 ? 0.5 : 1.0))}
                  className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-bold"
                >
                  {speed}x
                </button>
              </div>
            </div>

            {/* 3D Network Canvas */}
            <RecoveryNetwork3D
              cameraPreset={cameraPreset}
              onNodeSelect={setSelectedNode}
            />

            {/* Viewport Footer Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 pointer-events-none">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Nodes Connected: 9 Signal Paths</span>
              </span>
              <span>Left-click node to inspect data payload</span>
            </div>
          </GlassCard3D>
        </div>

        {/* Right Column: Spatial Telemetry & Node Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Node Inspector Drawer */}
          {selectedNode ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard3D className="p-6 border-cyan-500/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    3D NODE INSPECTOR
                  </span>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Close [X]
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{selectedNode.name}</h3>
                <p className="text-xs font-mono text-slate-400 mb-4">{selectedNode.id}</p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-slate-400">Node Type</span>
                    <span className="font-bold text-cyan-400">{selectedNode.type}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-slate-400">Value Payload</span>
                    <span className="font-bold text-emerald-400">{selectedNode.val}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-slate-400">Status / Diagnostic</span>
                    <span className="font-bold text-amber-400">{selectedNode.error}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate('command')}
                  className="w-full mt-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <span>Open in Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </GlassCard3D>
            </motion.div>
          ) : (
            <GlassCard3D className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Spatial Telemetry</h3>
                  <p className="text-xs text-slate-400 font-mono">Live 3D Pipeline Metrics</p>
                </div>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>AI Recovery Velocity</span>
                    <span className="text-emerald-400 font-bold">98.4%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-[98.4%]" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Routing Latency</span>
                    <span className="text-cyan-400 font-bold">12ms</span>
                  </div>
                  <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full w-[20%]" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Active Gateway Switches</span>
                    <span className="text-indigo-400 font-bold">Razorpay / UPI / Stripe</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <span className="text-[11px] font-mono text-slate-400">
                  Click any 3D node in the mesh viewport to trigger detailed packet breakdown.
                </span>
              </div>
            </GlassCard3D>
          )}

          {/* Quick Action Navigation */}
          <GlassCard3D className="p-5">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
              Quick 3D Navigation
            </h4>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <button
                onClick={() => onNavigate && onNavigate('command')}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 flex flex-col items-start gap-1 border border-slate-700/50 transition-all"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Command Center</span>
              </button>
              <button
                onClick={() => onNavigate && onNavigate('payments')}
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 flex flex-col items-start gap-1 border border-slate-700/50 transition-all"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Payments Matrix</span>
              </button>
            </div>
          </GlassCard3D>

        </div>
      </div>
    </div>
  );
}
