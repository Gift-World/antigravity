// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { LandingPage } from '@/routes/LandingPage';
import { Login } from '@/routes/auth/Login';
import { Register } from '@/routes/auth/Register';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHome } from '@/routes/dashboard/DashboardHome';
import { EventList } from '@/routes/dashboard/events/EventList';
import { CreateEvent } from '@/routes/dashboard/events/CreateEvent';
import { EventDetail } from '@/routes/dashboard/events/EventDetail';
import { LiveCommandCenter } from '@/components/live/LiveCommandCenter';
import { VenueManagement } from '@/routes/dashboard/venues/VenueManagement';
import { TicketManagement } from '@/routes/dashboard/tickets/TicketManagement';
import { IncidentsPage } from '@/routes/dashboard/incidents/IncidentsPage';
import { AnalyticsReports } from '@/routes/dashboard/analytics/AnalyticsReports';
import { TeamManagement } from '@/routes/dashboard/team/TeamManagement';
import { SettingsPage } from '@/routes/dashboard/settings/SettingsPage';
import { ScannerApp } from '@/routes/scanner/ScannerApp';
import { AttendeeLayout } from '@/routes/app/AttendeeLayout';
import { AttendeeEvents } from '@/routes/app/AttendeeEvents';
import { AttendeeTicket } from '@/routes/app/AttendeeTicket';
import { AttendeeGuardian } from '@/routes/app/AttendeeGuardian';
import { AttendeeWallet } from '@/routes/app/AttendeeWallet';
import { AttendeeSafety } from '@/routes/app/AttendeeSafety';
import { Loader2, Radio, Info } from 'lucide-react';

export const App: React.FC = () => {
  const { initData, isLoadingInitialData, isSupabaseConnected } = useAppStore();

  useEffect(() => {
    initData();
  }, [initData]);

  if (isLoadingInitialData) {
    return (
      <div className="h-screen w-screen bg-ag-black flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="w-12 h-12 rounded-xl bg-ag-surface border border-ag-blue flex items-center justify-center shadow-2xl">
          <Loader2 className="w-6 h-6 text-ag-blue animate-spin" />
        </div>
        <div className="space-y-1 text-center">
          <div className="font-display font-bold text-base tracking-wider uppercase">
            CONNECTING TO SUPABASE TELEMETRY
          </div>
          <div className="text-xs font-mono text-ag-text-secondary">
            Syncing crowd radar, events, and turnstile nodes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Offline Demo Mode Notification Banner if Supabase is offline */}
      {!isSupabaseConnected && (
        <div className="bg-ag-yellow-dim/80 border-b border-ag-yellow/30 text-ag-yellow text-[11px] font-mono py-1 px-4 text-center z-50 flex items-center justify-center gap-2">
          <Info className="w-3.5 h-3.5" />
          <span>Running in demo mode — no database connected</span>
        </div>
      )}

      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Live Event Command Center (Fullscreen Hero Cockpit) */}
        <Route path="/dashboard/events/:id/live" element={<LiveCommandCenter />} />

        {/* Organizer Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="events/:id/overview" element={<EventDetail />} />
          <Route path="venues" element={<VenueManagement />} />
          <Route path="tickets" element={<TicketManagement />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="analytics" element={<AnalyticsReports />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Gate Scanner Mobile PWA */}
        <Route path="/scanner" element={<ScannerApp />} />

        {/* Attendee Mobile PWA */}
        <Route path="/app" element={<AttendeeLayout />}>
          <Route index element={<AttendeeEvents />} />
          <Route path="tickets" element={<AttendeeTicket />} />
          <Route path="guardian" element={<AttendeeGuardian />} />
          <Route path="wallet" element={<AttendeeWallet />} />
          <Route path="safety" element={<AttendeeSafety />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
