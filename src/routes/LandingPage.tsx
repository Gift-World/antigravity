// src/routes/LandingPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MeshCanvas } from '@/components/landing/MeshCanvas';
import { WaitlistModal } from '@/components/landing/WaitlistModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import {
  Shield,
  Radio,
  Smartphone,
  Ticket,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  QrCode,
  Activity,
  HeartHandshake,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, activeEventId } = useAppStore();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  return (
    <div className="min-h-screen bg-ag-black text-ag-text-primary selection:bg-ag-blue/30 selection:text-ag-green relative overflow-hidden flex flex-col font-sans">
      {/* Dynamic Background BLE Mesh Network */}
      <MeshCanvas />

      {/* Navigation Header */}
      <header className="h-20 border-b border-ag-border/60 bg-ag-black/70 backdrop-blur-md px-6 sm:px-12 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-ag-surface border border-ag-blue/50 flex items-center justify-center shadow-lg group-hover:border-ag-green transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#448AFF" />
                  <stop offset="100%" stopColor="#00E676" />
                </linearGradient>
              </defs>
              <path
                d="M50 18 L24 82 L38 82 L44 68 L56 68 L62 82 L76 82 Z"
                stroke="url(#navLogoGrad)"
                strokeWidth="7"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path d="M50 38 L50 68" stroke="url(#navLogoGrad)" strokeWidth="7" strokeLinecap="round" />
              <path
                d="M42 48 L50 38 L58 48"
                stroke="url(#navLogoGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-wider text-white">
              ANTIGRAVITY
            </span>
            <span className="text-[9px] font-mono text-ag-green tracking-widest block uppercase">
              CROWD INTELLIGENCE
            </span>
          </div>
        </Link>

        {/* Quick Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-ag-text-secondary">
          <a href="#mission" className="hover:text-white transition-colors">
            Mission
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Platform Pillars
          </a>
          <a href="#command-center" className="hover:text-white transition-colors">
            Command Center
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/scanner" target="_blank" className="hidden sm:inline-block">
            <Button size="sm" variant="outline" className="text-xs font-mono">
              Gate Scanner
            </Button>
          </Link>
          <Link to="/app" target="_blank" className="hidden sm:inline-block">
            <Button size="sm" variant="outline" className="text-xs font-mono">
              Attendee App
            </Button>
          </Link>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Launch Dashboard
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 pb-24 px-6 sm:px-12 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-ag-red-dim border border-ag-red/40 px-3.5 py-1.5 rounded-full text-xs font-mono text-ag-red animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          <span>AFRICA’S FIRST REAL-TIME CROWD LIFE-SAFETY PLATFORM</span>
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Never Lose Another Life to a Preventable Crush.
        </h1>

        <p className="text-base sm:text-lg text-ag-text-secondary max-w-2xl mx-auto font-sans leading-relaxed">
          ANTIGRAVITY counteracts the crushing gravity of live event crowds. We predict density surges before stampedes occur, stop phone theft via BLE mesh, and empower promoters with NASA-grade mission control.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            variant="danger"
            onClick={() => navigate(`/dashboard/events/${activeEvent.id}/live`)}
            className="w-full sm:w-auto text-sm font-bold shadow-xl shadow-ag-red/30"
            leftIcon={<Radio className="w-4 h-4" />}
          >
            Live Command Center Demo
          </Button>

          <Button
            size="lg"
            variant="primary"
            onClick={() => setIsWaitlistOpen(true)}
            className="w-full sm:w-auto text-sm font-bold shadow-xl shadow-ag-blue/20"
          >
            Request Early Access
          </Button>
        </div>

        {/* Interactive App Switcher Pill Links */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <span className="text-ag-text-muted">Direct Demos:</span>
          <Link
            to={`/dashboard/events/${activeEvent.id}/live`}
            className="bg-ag-surface hover:bg-ag-surface-hover border border-ag-border px-3 py-1.5 rounded-md text-white transition-colors"
          >
            🚀 Mission Control (Desktop)
          </Link>
          <Link
            to="/scanner"
            target="_blank"
            className="bg-ag-surface hover:bg-ag-surface-hover border border-ag-border px-3 py-1.5 rounded-md text-ag-green transition-colors"
          >
            📱 Gate Scanner PWA (Mobile)
          </Link>
          <Link
            to="/app"
            target="_blank"
            className="bg-ag-surface hover:bg-ag-surface-hover border border-ag-border px-3 py-1.5 rounded-md text-ag-blue transition-colors"
          >
            🎟️ Attendee PWA (Mobile)
          </Link>
        </div>
      </section>

      {/* WHY THIS EXISTS — KAREN LOJORE TRIBUTE & PROBLEM SECTION */}
      <section id="mission" className="relative z-10 py-20 px-6 sm:px-12 bg-ag-surface/40 border-y border-ag-border">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-mono uppercase tracking-widest text-ag-red flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" />
              <span>THE REAL-WORLD URGENCY</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
              18,000 People. Zero Visibility. Zero Second Chances.
            </h2>
            <p className="text-sm sm:text-base text-ag-text-secondary leading-relaxed">
              On December 20, 2025, a 20-year-old Kenyan university student named{' '}
              <strong className="text-white">Karen Lojore</strong> was crushed to death in a stampede at Nyayo National Stadium during a concert. There was no crowd monitoring, no density tracking, no automated alerts, and no accountability.
            </p>
            <p className="text-sm sm:text-base text-ag-text-secondary leading-relaxed">
              This keeps happening across Africa because live venues have zero safety technology. ANTIGRAVITY was engineered to eliminate stampedes forever.
            </p>
          </div>

          {/* Hard Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <Card className="space-y-2 border-ag-red/30 bg-ag-red-dim/20">
              <div className="font-display font-bold text-3xl sm:text-4xl text-ag-red">
                1,200+
              </div>
              <div className="text-xs font-mono font-bold text-white uppercase">
                Global Stampede Fatalities
              </div>
              <p className="text-[11px] text-ag-text-secondary">
                Crush incidents at concerts and stadiums each decade without predictive spatial radar.
              </p>
            </Card>

            <Card className="space-y-2 border-ag-yellow/30 bg-ag-yellow-dim/20">
              <div className="font-display font-bold text-3xl sm:text-4xl text-ag-yellow">
                68%
              </div>
              <div className="text-xs font-mono font-bold text-white uppercase">
                Concert Phone Thefts
              </div>
              <p className="text-[11px] text-ag-text-secondary">
                Of African concert attendees report phone pickpocketing or snatch-and-grab theft in crowded pits.
              </p>
            </Card>

            <Card className="space-y-2 border-ag-blue/30 bg-ag-blue-dim/20">
              <div className="font-display font-bold text-3xl sm:text-4xl text-ag-blue">
                0 Platforms
              </div>
              <div className="text-xs font-mono font-bold text-white uppercase">
                Existed for Event Safety
              </div>
              <p className="text-[11px] text-ag-text-secondary">
                Until Antigravity built the world’s first integrated African crowd telemetry operating system.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 3 CORE PILLARS SECTION */}
      <section id="features" className="relative z-10 py-24 px-6 sm:px-12 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-ag-green">
            THREE PILLARS OF LIFE-SAFETY
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            SpaceX-Grade Telemetry Built for Live Venues
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Crowd Shield */}
          <Card className="space-y-4 p-6 bg-gradient-to-b from-ag-surface to-ag-black border-ag-green/30">
            <div className="w-12 h-12 rounded-xl bg-ag-green-dim border border-ag-green flex items-center justify-center text-ag-green">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">1. Crowd Shield Radar</h3>
            <p className="text-xs text-ag-text-secondary leading-relaxed">
              Real-time spatial density monitoring per square meter across stadium sectors. Automatically predicts bottlenecks, warns security at 4.5/m², and opens egress gates at 5.5/m² before surges become fatal.
            </p>
            <ul className="text-[11px] font-mono text-ag-green space-y-1.5 pt-2">
              <li className="flex items-center gap-2">✓ 13-Sector Heatmap Visualizer</li>
              <li className="flex items-center gap-2">✓ Predictive Bottleneck AI</li>
              <li className="flex items-center gap-2">✓ Automated Egress Directives</li>
            </ul>
          </Card>

          {/* Pillar 2: Guardian Mode */}
          <Card className="space-y-4 p-6 bg-gradient-to-b from-ag-surface to-ag-black border-ag-yellow/30">
            <div className="w-12 h-12 rounded-xl bg-ag-yellow-dim border border-ag-yellow flex items-center justify-center text-ag-yellow">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">2. Guardian Mode Anti-Theft</h3>
            <p className="text-xs text-ag-text-secondary leading-relaxed">
              Pairs attendee phones with smart wristbands or secondary devices via BLE mesh. If the tether disconnects, a high-decibel siren sounds, the screen locks with a tamper banner, and GPS coordinates stream to the command center.
            </p>
            <ul className="text-[11px] font-mono text-ag-yellow space-y-1.5 pt-2">
              <li className="flex items-center gap-2">✓ Continuous BLE Signal Tether</li>
              <li className="flex items-center gap-2">✓ Auto-Locking Distress Screen</li>
              <li className="flex items-center gap-2">✓ Shake & Triple-Tap SOS Panic</li>
            </ul>
          </Card>

          {/* Pillar 3: Smart Tickets & M-Pesa Cashless */}
          <Card className="space-y-4 p-6 bg-gradient-to-b from-ag-surface to-ag-black border-ag-blue/30">
            <div className="w-12 h-12 rounded-xl bg-ag-blue-dim border border-ag-blue flex items-center justify-center text-ag-blue">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">3. Cryptographic Smart Passes</h3>
            <p className="text-xs text-ag-text-secondary leading-relaxed">
              Device-bound SHA-256 encrypted QR passes that eliminate counterfeit screenshots and fraud. Native Safaricom Daraja M-Pesa STK push integration with instant wristband cashless wallets.
            </p>
            <ul className="text-[11px] font-mono text-ag-blue space-y-1.5 pt-2">
              <li className="flex items-center gap-2">✓ Zero-Fraud Hardware Fingerprint</li>
              <li className="flex items-center gap-2">✓ Lipa na M-Pesa STK Native</li>
              <li className="flex items-center gap-2">✓ Fast Cashless Vendor Checkout</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* COMMAND CENTER PREVIEW SECTION */}
      <section id="command-center" className="relative z-10 py-20 px-6 sm:px-12 bg-ag-surface/30 border-t border-ag-border">
        <div className="max-w-6xl mx-auto space-y-8 text-center">
          <div className="space-y-2">
            <Badge variant="red" pulse size="md">
              THE MISSION CONTROL HERO SCREEN
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Complete Situational Awareness in Real Time
            </h2>
            <p className="text-xs sm:text-sm text-ag-text-secondary max-w-xl mx-auto font-mono">
              Live heatmaps, gate flow bar charts, incident tracking, and tactical comms broadcasting.
            </p>
          </div>

          <div
            onClick={() => navigate(`/dashboard/events/${activeEvent.id}/live`)}
            className="group relative rounded-[16px] border-2 border-ag-border hover:border-ag-red/60 overflow-hidden shadow-2xl bg-ag-black cursor-pointer transition-all duration-300 transform hover:scale-[1.01]"
          >
            {/* Mockup Preview Graphic */}
            <div className="aspect-[16/9] bg-gradient-to-br from-[#12121A] to-[#0A0A0F] p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-ag-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-ag-red animate-ping" />
                  <span className="font-display font-bold text-sm text-white uppercase">
                    AFROBEATS FESTIVAL NAIROBI 2026 • LIVE COMMAND CENTER
                  </span>
                </div>
                <div className="font-mono text-xs text-ag-green font-bold">12,847 / 18,000 INGRESS</div>
              </div>

              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-ag-red/20 border-2 border-ag-red text-ag-red flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                    <Radio className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="font-display font-bold text-xl text-white">
                    CLICK TO ENTER LIVE COMMAND CENTER
                  </div>
                  <p className="text-xs font-mono text-ag-text-secondary">
                    Full screen interactive demo with live spatial radar, gate scans, and tactical comms
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-ag-text-muted border-t border-ag-border pt-2">
                <span>SECTOR 6: MAIN FLOOR NORTH (5.2/m² WARNING)</span>
                <span>GATE A: 48 SCANS/MIN</span>
                <span>BLE MESH: 1,420 ACTIVE NODES</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-ag-border bg-ag-black px-6 sm:px-12 py-10 text-xs font-mono text-ag-text-secondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-white">ANTIGRAVITY</span>
            <span>© 2026 • Nairobi, Kenya</span>
          </div>

          <div className="flex items-center gap-6">
            <span>In memory of Karen Lojore</span>
            <span>•</span>
            <button onClick={() => setIsWaitlistOpen(true)} className="text-ag-blue hover:underline">
              Request Deployment
            </button>
          </div>
        </div>
      </footer>

      {/* Waitlist Early Access Modal */}
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  );
};
