// src/routes/app/AttendeeLayout.tsx
import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
import { useAppStore } from '@/lib/store';
import { Ticket, Shield, HeartPulse, Smartphone } from 'lucide-react';
import { UserRole } from '@/types/database';

export const AttendeeLayout: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setUserRole } = useAppStore();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setUserRole(role);
    if (role === 'super_admin' || role === 'org_admin' || role === 'event_manager') {
      navigate('/dashboard');
    } else if (role === 'security' || role === 'medical') {
      navigate('/field');
    } else if (role === 'attendee') {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-ag-black text-ag-text-primary flex justify-center selection:bg-ag-blue/30 font-sans">
      {/* Mobile Shell Wrapper (Max 480px Centered) */}
      <div className="w-full max-w-md min-h-screen bg-ag-surface flex flex-col border-x border-ag-border shadow-2xl relative">
        {/* Top Header */}
        <header className="h-16 px-4 border-b border-ag-border bg-ag-surface/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2">
            <AntigravityLogo size="sm" />
          </Link>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                {currentUser.full_name || 'Attendee'}
              </div>
            </div>

            <select
              value={currentUser.role}
              onChange={handleRoleChange}
              aria-label="Switch Perspective"
              className="bg-ag-black border border-ag-border rounded-lg text-xs text-white px-2 py-1 focus:outline-none focus:border-ag-blue cursor-pointer"
            >
              <option value="super_admin">Admin</option>
              <option value="event_manager">Manager</option>
              <option value="security">Security</option>
              <option value="medical">Medical</option>
              <option value="attendee">Attendee</option>
            </select>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 pb-24 p-4 overflow-y-auto">
          <Outlet />
        </main>

        {/* 3 Simple Bottom Tabs: My Ticket, Safety, Guardian */}
        <nav className="fixed bottom-0 max-w-md w-full h-16 bg-ag-surface/98 border-t border-ag-border backdrop-blur-lg flex items-center justify-around z-40 px-2 py-1 shadow-2xl">
          <NavLink
            to="/app/tickets"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-ag-blue font-bold'
                  : 'text-ag-text-secondary hover:text-white'
              }`
            }
          >
            <Ticket className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">My Ticket</span>
          </NavLink>

          <NavLink
            to="/app/safety"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-ag-green font-bold'
                  : 'text-ag-text-secondary hover:text-white'
              }`
            }
          >
            <HeartPulse className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Safety</span>
          </NavLink>

          <NavLink
            to="/app/guardian"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'text-ag-yellow font-bold'
                  : 'text-ag-text-secondary hover:text-white'
              }`
            }
          >
            <Smartphone className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Guardian</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};
