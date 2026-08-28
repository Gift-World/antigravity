// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Live Event Command Center (Fullscreen Hero View, No Sidebar) */}
      <Route path="/dashboard/events/:id/live" element={<LiveCommandCenter />} />

      {/* Organizer Dashboard (Desktop Operations Shell) */}
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

      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
