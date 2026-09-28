// src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useSimulationEngine } from '@/lib/simulation';
import { useAppStore } from '@/lib/store';
import { AlertTriangle, X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  // Start simulation background tick
  useSimulationEngine();

  const { criticalFlashAlert, dismissCriticalFlash } = useAppStore();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ag-black flex text-ag-text-primary">
      {/* Sidebar Navigation */}
      <DashboardSidebar isOpen={isMobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      {isMobileNavOpen && <button aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-40 bg-ag-black/75 backdrop-blur-sm md:hidden" />}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenNavigation={() => setMobileNavOpen(true)} />

        {/* Critical Emergency Overlay Banner if triggered */}
        {criticalFlashAlert && (
          <div className="bg-ag-red border-b border-white/20 text-white px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 shadow-2xl animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-ag-red flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 font-bold animate-spin" />
              </div>
              <div>
                <div className="font-display font-bold text-sm tracking-wider uppercase">
                  CRITICAL INCIDENT ALERT
                </div>
                <div className="max-w-[270px] truncate text-xs font-mono text-white/90 sm:max-w-none">{criticalFlashAlert.message}</div>
              </div>
            </div>
            <button
              onClick={dismissCriticalFlash}
              className="p-1 rounded hover:bg-black/20 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <main className="flex-1 w-full max-w-7xl p-4 sm:p-6 md:p-8 mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
