// src/routes/LandingPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MeshCanvas } from '@/components/landing/MeshCanvas';
import { WaitlistModal } from '@/components/landing/WaitlistModal';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
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
  Wallet,
  FileSpreadsheet,
  Building,
  BarChart3,
  Flame,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, activeEventId } = useAppStore();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const features = [
    {
      title: 'Crowd Shield',
      category: 'Real-time Density Radar',
      desc: 'Predicts bottlenecks, tracks spatial crowd pressure per square meter across stadium sectors, and triggers autonomous safety directives before crushes occur.',
      icon: <Shield className="w-6 h-6 text-ag-green" />,
      color: 'border-ag-green/30 bg-ag-green-dim/10',
      badge: 'Autonomous AI',
      badgeVariant: 'green' as const,
    },
    {
      title: 'Guardian Mode',
      category: 'Phone Theft Prevention',
      desc: 'Tethers attendee devices to smart wristbands via BLE mesh. Instant 100dB wailing siren sounds and screen locks if severed in dense concert pits.',
      icon: <Smartphone className="w-6 h-6 text-ag-yellow" />,
      color: 'border-ag-yellow/30 bg-ag-yellow-dim/10',
      badge: 'BLE Mesh Tether',
      badgeVariant: 'yellow' as const,
    },
    {
      title: 'Smart Tickets',
      category: 'Cryptographic Passes',
      desc: 'SHA-256 device-bound QR passes that eliminate counterfeit screenshots. Zero-fraud turnstile validation with sub-second gate scanning.',
      icon: <Ticket className="w-6 h-6 text-ag-blue" />,
      color: 'border-ag-blue/30 bg-ag-blue-dim/10',
      badge: 'Anti-Counterfeit',
      badgeVariant: 'blue' as const,
    },
    {
      title: 'Cashless Wallet',
      category: 'M-Pesa Native Payments',
      desc: 'Instant STK push top-ups directly to digital wristband wallets. Rapid 1-tap cashless purchases at festival bars and food vendors.',
      icon: <Wallet className="w-6 h-6 text-ag-purple" />,
      color: 'border-ag-purple/30 bg-ag-purple-dim/10',
      badge: 'Safaricom Daraja',
      badgeVariant: 'purple' as const,
    },
    {
      title: 'Command Center',
      category: 'Real-time Ops Cockpit',
      desc: 'NASA-style mission control dashboard showing 13-sector heatmaps, turnstile flow velocity, triage dispatches, and emergency broadcast comms.',
      icon: <Radio className="w-6 h-6 text-ag-red" />,
      color: 'border-ag-red/30 bg-ag-red-dim/10',
      badge: 'Mission Control',
      badgeVariant: 'red' as const,
    },
    {
      title: 'Safety Reports',
      category: 'Post-Event Compliance',
      desc: 'Automated density curves over time, gate throughput timeline audits, incident response logs, and 1-click printable safety certification exports.',
      icon: <FileSpreadsheet className="w-6 h-6 text-ag-blue" />,
      color: 'border-ag-blue/30 bg-ag-blue-dim/10',
      badge: 'Audit & PDF',
      badgeVariant: 'blue' as const,
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Connect Your Venue Topography',
      desc: 'Import your stadium or festival layout (Nyayo Stadium, KICC, Carnivore, Uhuru Gardens). Configure sector capacities, gates, and safety thresholds.',
      icon: <Building className="w-5 h-5 text-ag-blue" />,
    },
    {
      num: '02',
      title: 'Sell Cryptographic Smart Tickets',
      desc: 'Attendees purchase passes via Safaricom M-Pesa STK Push. Tickets are cryptographically device-bound to hardware fingerprints to stop counterfeit sharing.',
      icon: <Ticket className="w-5 h-5 text-ag-green" />,
    },
    {
      num: '03',
      title: 'Go Live with Mission Control',
      desc: 'Launch real-time crowd heatmaps, monitor gate flow velocity, track BLE theft alarms, and broadcast instant tactical directives to security squads.',
      icon: <Radio className="w-5 h-5 text-ag-red" />,
    },
  ];

  return (
    <div className="min-h-screen bg-ag-black text-ag-text-primary selection:bg-ag-blue/30 selection:text-ag-green relative overflow-hidden flex flex-col font-sans">
      {/* Background BLE Mesh Constellation */}
      <MeshCanvas />

      {/* Navigation Header */}
      <header className="h-20 border-b border-ag-border/60 bg-ag-black/80 backdrop-blur-md px-6 md:px-16 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <AntigravityLogo size="md" />
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-mono text-ag-text-secondary">
            <a href="#mission" className="hover:text-white transition-colors">
              Why We Exist
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#command-center" className="hover:text-white transition-colors">
              Mission Control
            </a>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/scanner" target="_blank" className="hidden sm:inline-block">
              <Button size="sm" variant="outline" className="text-xs font-mono text-ag-green border-ag-green/40 hover:bg-ag-green/10">
                Gate Scanner PWA
              </Button>
            </Link>
            <Link to="/app" target="_blank" className="hidden sm:inline-block">
              <Button size="sm" variant="outline" className="text-xs font-mono text-ag-blue border-ag-blue/40 hover:bg-ag-blue/10">
                Attendee PWA
              </Button>
            </Link>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold shadow-lg shadow-ag-blue/20"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Organizer Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 md:pt-24 pb-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-ag-red-dim border border-ag-red/40 px-4 py-1.5 rounded-full text-xs font-mono text-ag-red animate-pulse shadow-lg shadow-ag-red/10">
            <Radio className="w-3.5 h-3.5" />
            <span>AFRICA’S FIRST REAL-TIME CROWD LIFE-SAFETY PLATFORM</span>
          </div>

          <div className="space-y-4 max-w-5xl mx-auto">
            <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.08] text-center">
              Never Lose Another Life to a Preventable Crush.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-ag-text-secondary max-w-3xl mx-auto font-sans leading-relaxed pt-2">
              ANTIGRAVITY is the force that counteracts the crushing gravity of crowds. We predict density surges before stampedes occur, stop phone theft via BLE mesh, and give African event organizers total operational control.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto sm:max-w-none">
            <Button
              size="lg"
              variant="danger"
              onClick={() => navigate(`/dashboard/events/${activeEvent.id}/live`)}
              className="w-full sm:w-auto text-sm font-bold shadow-2xl shadow-ag-red/30 px-8 h-12"
              leftIcon={<Radio className="w-4 h-4 animate-pulse" />}
            >
              Live Command Center Demo
            </Button>

            <Button
              size="lg"
              variant="primary"
              onClick={() => setIsWaitlistOpen(true)}
              className="w-full sm:w-auto text-sm font-bold shadow-xl shadow-ag-blue/20 px-8 h-12"
            >
              Request Early Access
            </Button>
          </div>

          {/* Quick Demo Mode Links */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="text-ag-text-muted">Direct Launch:</span>
            <Link
              to={`/dashboard/events/${activeEvent.id}/live`}
              className="bg-ag-surface hover:bg-ag-surface-hover border border-ag-border px-3 py-1.5 rounded-md text-white transition-colors flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-ag-red" />
              <span>Mission Control (Live Stadium)</span>
            </Link>
            <Link
              to="/scanner"
              target="_blank"
              className="bg-ag-surface hover:bg-ag-surface-hover border border-ag-border px-3 py-1.5 rounded-md text-ag-green transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-ag-green" />
              <span>Gate Scanner PWA</span>
            </Link>
            <Link
              to="/app"
              target="_blank"
              className="bg-ag-surface hover:bg-ag-surface-hover border border-ag-border px-3 py-1.5 rounded-md text-ag-blue transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-ag-blue" />
              <span>Attendee Smart App</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KAREN LOJORE STORY — THE EMOTIONAL ANCHOR */}
      <section id="mission" className="relative z-10 py-20 px-6 md:px-16 bg-ag-surface/40 border-y border-ag-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Story narrative */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-ag-red font-bold">
                <HeartHandshake className="w-4 h-4" />
                <span>IN MEMORIAM • WHY ANTIGRAVITY EXISTS</span>
              </div>

              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
                December 20, 2025. Nyayo National Stadium.
              </h2>

              <div className="space-y-4 text-sm sm:text-base text-ag-text-secondary leading-relaxed font-sans">
                <p>
                  On December 20, 2025, a 20-year-old Kenyan university student named{' '}
                  <strong className="text-white font-semibold">Karen Lojore</strong> was crushed to death in a stampede at Nyayo National Stadium in Nairobi during a concert.
                </p>
                <p>
                  There was no crowd monitoring. No density tracking. No automated alerts. No emergency egress directives. And zero accountability.
                </p>
                <p className="text-white font-medium bg-ag-black/50 p-4 rounded-[8px] border-l-4 border-ag-red">
                  "This keeps happening across live events in Africa because stadiums and festival grounds operate with zero safety technology. ANTIGRAVITY was built to make sure another life is never lost to a preventable crush."
                </p>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="p-5 border-ag-red/40 bg-gradient-to-br from-ag-red-dim/20 to-ag-surface space-y-2">
                <div className="font-display font-bold text-3xl text-ag-red">18,000 People</div>
                <div className="text-xs font-mono font-bold text-white uppercase">
                  Zero Visibility Without Telemetry
                </div>
                <p className="text-xs text-ag-text-secondary">
                  When turnstile flow exceeds sector escape thresholds, spatial panic builds in under 90 seconds.
                </p>
              </Card>

              <Card className="p-5 border-ag-yellow/40 bg-gradient-to-br from-ag-yellow-dim/20 to-ag-surface space-y-2">
                <div className="font-display font-bold text-3xl text-ag-yellow">68% Theft Rate</div>
                <div className="text-xs font-mono font-bold text-white uppercase">
                  Unprotected Concert Pits
                </div>
                <p className="text-xs text-ag-text-secondary">
                  Snatch-and-grab phone theft syndicates target compressed crowd sectors. Guardian Mode ends this.
                </p>
              </Card>

              <Card className="p-5 border-ag-green/40 bg-gradient-to-br from-ag-green-dim/20 to-ag-surface space-y-2">
                <div className="font-display font-bold text-3xl text-ag-green">0 Deaths Target</div>
                <div className="text-xs font-mono font-bold text-white uppercase">
                  Zero-Tolerance Life Safety
                </div>
                <p className="text-xs text-ag-text-secondary">
                  Autonomous spatial threshold alerts command barrier releases before critical density occurs.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3 STEPS) */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-ag-blue">
              SIMPLE DEPLOYMENT WORKFLOW
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              How ANTIGRAVITY Works in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <Card key={idx} className="p-6 space-y-4 bg-ag-surface border-ag-border hover:border-ag-blue/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-2xl text-ag-blue">{step.num}</span>
                  <div className="w-9 h-9 rounded-lg bg-ag-black border border-ag-border flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg text-white">{step.title}</h3>
                <p className="text-xs text-ag-text-secondary leading-relaxed font-sans">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ALL 6 CORE FEATURES GRID */}
      <section id="features" className="relative z-10 py-20 px-6 md:px-16 bg-ag-surface/30 border-t border-ag-border">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-ag-green">
              COMPLETE LIFE-SAFETY INFRASTRUCTURE
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Engineered for Stadium-Scale Reliability
            </h2>
            <p className="text-xs sm:text-sm text-ag-text-secondary font-mono">
              Six synchronized operational modules providing end-to-end crowd intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <Card key={idx} className={`p-6 space-y-4 border ${f.color} hover:shadow-xl transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-ag-black border border-ag-border">{f.icon}</div>
                  <Badge variant={f.badgeVariant} size="sm">
                    {f.badge}
                  </Badge>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-ag-text-muted">{f.category}</div>
                  <h3 className="font-display font-bold text-lg text-white mt-0.5">{f.title}</h3>
                </div>
                <p className="text-xs text-ag-text-secondary leading-relaxed font-sans">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* COMMAND CENTER HERO INTERACTIVE PREVIEW */}
      <section id="command-center" className="relative z-10 py-24 px-6 md:px-16 border-t border-ag-border">
        <div className="max-w-7xl mx-auto space-y-10 text-center">
          <div className="space-y-3 max-w-2xl mx-auto">
            <Badge variant="red" pulse size="md">
              THE MISSION CONTROL COCKPIT
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Real-time Situational Awareness at 60 FPS
            </h2>
            <p className="text-xs sm:text-sm text-ag-text-secondary font-mono">
              Live spatial heatmaps, turnstile flow velocity curves, incident responder dispatch, and tactical radio broadcasts.
            </p>
          </div>

          {/* Interactive Preview Mockup Box */}
          <div
            onClick={() => navigate(`/dashboard/events/${activeEvent.id}/live`)}
            className="group relative rounded-[16px] border-2 border-ag-border hover:border-ag-red/80 overflow-hidden shadow-2xl bg-ag-black cursor-pointer transition-all duration-300 transform hover:scale-[1.01]"
          >
            <div className="p-6 md:p-8 bg-gradient-to-br from-[#12121A] via-[#0A0A0F] to-[#12121A] space-y-6">
              {/* Cockpit Header */}
              <div className="flex items-center justify-between border-b border-ag-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-ag-red animate-ping" />
                  <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
                    {activeEvent.title} • LIVE COMMAND CENTER
                  </span>
                </div>
                <div className="font-mono text-xs text-ag-green font-bold bg-ag-green-dim px-2.5 py-1 rounded border border-ag-green/30">
                  12,847 / 18,000 ATTENDANCE (71.4%)
                </div>
              </div>

              {/* Center Action Banner */}
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-ag-red/20 border-2 border-ag-red text-ag-red flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                  <Radio className="w-10 h-10 animate-pulse" />
                </div>
                <div className="font-display font-bold text-2xl text-white">
                  CLICK TO LAUNCH LIVE COMMAND CENTER
                </div>
                <p className="text-xs font-mono text-ag-text-secondary max-w-md">
                  Experience the full-screen NASA-style operations cockpit with real-time crowd density telemetry and audio alarms.
                </p>
              </div>

              {/* Footer status line */}
              <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-ag-text-muted border-t border-ag-border pt-3 gap-2">
                <span>SECTOR: MAIN FLOOR NORTH (5.2/m² WARNING)</span>
                <span>GATE FLOW: 142 SCANS/MIN</span>
                <span>BLE MESH NODES: 1,420 ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-ag-border bg-ag-black px-6 md:px-16 py-12 text-xs font-mono text-ag-text-secondary">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AntigravityLogo size="sm" />
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div className="font-medium text-white">
              © 2026 ANTIGRAVITY | Nairobi, Kenya | Built to save lives
            </div>
            <div className="text-[11px] text-ag-text-muted">
              In loving memory of Karen Lojore (2005 – 2025)
            </div>
          </div>
        </div>
      </footer>

      {/* Early Access Modal */}
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  );
};
