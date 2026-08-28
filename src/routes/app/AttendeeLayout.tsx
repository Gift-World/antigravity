// src/routes/app/AttendeeLayout.tsx
import React from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { Ticket, Shield, Wallet, Compass, Sparkles, Radio } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const AttendeeLayout: React.FC = () => {
  const location = useLocation();
  const { events, activeEventId } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const navItems = [
    { label: 'Events', path: '/app', icon: <Sparkles className="w-5 h-5" /> },
    { label: 'My Tickets', path: '/app/tickets', icon: <Ticket className="w-5 h-5" /> },
    { label: 'Guardian', path: '/app/guardian', icon: <Shield className="w-5 h-5" /> },
    { label: 'Wallet', path: '/app/wallet', icon: <Wallet className="w-5 h-5" /> },
    { label: 'Live Safety', path: '/app/safety', icon: <Compass className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F5F9] text-[#12121A] flex flex-col max-w-md mx-auto shadow-2xl border-x border-[#E2E4EB] select-none">
      {/* Attendee App Top Header */}
      <header className="h-14 bg-white border-b border-[#E2E4EB] px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link to="/app" className="flex items-center gap-2">
          {/* Antigravity stylized A */}
          <div className="w-7 h-7 rounded-lg bg-[#0A0A0F] flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 100 100" fill="none">
              <path
                d="M50 18 L24 82 L38 82 L44 68 L56 68 L62 82 L76 82 Z"
                stroke="#00E676"
                strokeWidth="7"
                strokeLinejoin="round"
              />
              <path d="M50 38 L50 68" stroke="#00E676" strokeWidth="7" strokeLinecap="round" />
              <path
                d="M42 48 L50 38 L58 48"
                stroke="#00E676"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-display font-bold text-sm tracking-wider text-[#0A0A0F]">
            ANTIGRAVITY
          </span>
        </Link>

        {activeEvent?.status === 'live' && (
          <Link
            to="/app/safety"
            className="flex items-center gap-1.5 bg-[#FF1744]/10 text-[#FF1744] px-2.5 py-1 rounded-full text-xs font-mono font-bold border border-[#FF1744]/30 animate-pulse"
          >
            <Radio className="w-3 h-3 animate-ping" />
            <span>LIVE EVENT ACTIVE</span>
          </Link>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[#E2E4EB] px-2 py-1.5 flex items-center justify-around z-40 shadow-lg">
        {navItems.map((item) => {
          const isActive =
            item.path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-[8px] text-[11px] font-medium transition-colors ${
                isActive ? 'text-[#00A859] font-bold' : 'text-[#717182] hover:text-[#12121A]'
              }`}
            >
              <span className={isActive ? 'text-[#00A859]' : 'text-[#717182]'}>{item.icon}</span>
              <span className="mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
