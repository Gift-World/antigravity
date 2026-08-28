// src/components/layout/DashboardLayout.tsx
import React from 'react';
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

  return (
    <div className="min-h-screen bg-ag-black flex text-ag-text-primary">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        {/* Critical Emergency Overlay Banner if triggered */}
        {criticalFlashAlert && (
          <div className="bg-ag-red border-b border-white/20 text-white px-4 py-3 flex items-center justify-between shadow-2xl animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-ag-red flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 font-bold animate-spin" />
              </div>
              <div>
                <div className="font-display font-bold text-sm tracking-wider uppercase">
                  CRITICAL INCIDENT ALERT
                </div>
                <div className="text-xs font-mono text-white/90">{criticalFlashAlert.message}</div>
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

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
