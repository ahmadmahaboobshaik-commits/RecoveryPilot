import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import FloatingNav from './components/navigation/FloatingNav';
import CinematicVideoBackground from './components/landing/CinematicVideoBackground';
import ArchitecturalBackground from './components/3d/ArchitecturalBackground';
import VesperLanding from './components/landing/VesperLanding';
import CommandCenterView from './components/dashboard/CommandCenterView';
import PaymentsExplorerView from './components/payments/PaymentsExplorerView';
import PaymentDetailModal from './components/payments/PaymentDetailModal';
import DecisionWorkbenchView from './components/workbench/DecisionWorkbenchView';
import BatchRecoveryView from './components/batch/BatchRecoveryView';
import AuditTrailView from './components/audit/AuditTrailView';
import SystemStatusView from './components/system/SystemStatusView';
import Immersive3DView from './components/3d/Immersive3DView';
import CustomCursor from './components/ui/CustomCursor';
import { api } from './services/api';

export default function RecoveryApp() {
  const [activePage, setActivePage] = useState(() => window.location.hash.replace('#', '') || 'landing');
  const [healthStatus, setHealthStatus] = useState('checking');
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  // Sync Telemetry from backend
  const fetchGlobalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, m, a] = await Promise.all([
        api.getHealth().catch(() => ({ status: 'offline' })),
        api.getMetrics().catch(() => null),
        api.getActivity(50).catch(() => [])
      ]);
      setHealthStatus(h?.status === 'ok' ? 'ok' : 'offline');
      if (m) setMetrics(m);
      if (a) setActivities(a);
    } catch (err) {
      setHealthStatus('offline');
      setError(err.message || 'Failed to sync with backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(fetchGlobalData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Hash Navigation
  const navigateTo = (page) => {
    window.location.hash = page;
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const page = window.location.hash.replace('#', '') || 'landing';
      setActivePage(page);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#11100F] text-[#F4F1EC] font-sans selection:bg-[#7D4047]/30 selection:text-white overflow-x-hidden">
      
      {/* Shared Architectural 3D Background Layer */}
      <ArchitecturalBackground opacity={0.25} />

      {/* Cinematic Ambient Background Scrim */}
      <CinematicVideoBackground />
      
      {/* Ambient Cursor */}
      <CustomCursor />

      {/* Floating Navigation */}
      <FloatingNav
        activePage={activePage}
        onNavigate={navigateTo}
        backendHealth={healthStatus}
      />

      {/* Main Experience Router */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {activePage === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <VesperLanding
                metrics={metrics}
                activities={activities}
                onOpenCommandCenter={() => navigateTo('command')}
                onSelectPayment={setSelectedPaymentId}
              />
            </motion.div>
          )}

          {activePage === '3d-showcase' && (
            <motion.div
              key="3d-showcase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Immersive3DView
                metrics={metrics}
                activities={activities}
                onNavigate={navigateTo}
              />
            </motion.div>
          )}

          {activePage === 'command' && (
            <motion.div
              key="command"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <CommandCenterView
                metrics={metrics}
                activities={activities}
                loading={loading}
                error={error}
                onRefresh={fetchGlobalData}
                onSelectPayment={setSelectedPaymentId}
                onNavigate={navigateTo}
              />
            </motion.div>
          )}

          {activePage === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <PaymentsExplorerView
                onSelectPayment={setSelectedPaymentId}
              />
            </motion.div>
          )}

          {activePage === 'decisions' && (
            <motion.div
              key="decisions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <DecisionWorkbenchView
                onSelectPayment={setSelectedPaymentId}
              />
            </motion.div>
          )}

          {activePage === 'batch' && (
            <motion.div
              key="batch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <BatchRecoveryView
                onSelectPayment={setSelectedPaymentId}
              />
            </motion.div>
          )}

          {activePage === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <AuditTrailView
                onSelectPayment={setSelectedPaymentId}
              />
            </motion.div>
          )}

          {activePage === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <SystemStatusView
                healthStatus={healthStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Payment Detail Modal Drawer */}
      {selectedPaymentId && (
        <PaymentDetailModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
          onRefreshData={fetchGlobalData}
        />
      )}

      {/* Dark Architectural Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#090909]/90 backdrop-blur-md py-10 px-6 sm:px-12 text-center text-xs font-mono text-[#817B75]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16B879]" />
            <span className="font-bold text-[#F4F1EC]">RecoveryPilot · Autonomous Revenue Recovery System</span>
          </div>
          <div>
            <span>Verified Settlement Architecture · Powered by Claude AI & Razorpay</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
