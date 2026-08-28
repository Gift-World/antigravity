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
  Smartphone,
  Ticket,
  ArrowRight,
  Sparkles,
  Building,
  HeartHandshake,
  CheckCircle2,
  Lock,
  Activity,
  Layers,
  Radio,
  Bell,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, activeEventId } = useAppStore();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const features = [
    {
      title: 'Crowd Density Monitoring',
      desc: 'See exactly how full each zone is in real time. Get instant alerts before gates or floor sections reach unsafe numbers.',
      icon: <Users className="w-6 h-6 text-ag-green" />,
      color: 'border-ag-green/30 bg-ag-green-dim/10',
      badge: 'Live Radar',
      badgeVariant: 'green' as const,
    },
    {
      title: 'Phone Theft Protection',
      desc: 'Guardian mode links your phone to a smart wristband. If disconnected in a dense crowd, your phone sounds a loud siren and locks instantly.',
      icon: <Smartphone className="w-6 h-6 text-ag-yellow" />,
      color: 'border-ag-yellow/30 bg-ag-yellow-dim/10',
      badge: 'Guardian Mode',
      badgeVariant: 'yellow' as const,
    },
    {
      title: 'Smart Tickets',
      desc: 'Secure QR tickets that cannot be copied or shared as screenshots. Fast sub-second scanning at stadium gates.',
      icon: <Ticket className="w-6 h-6 text-ag-blue" />,
      color: 'border-ag-blue/30 bg-ag-blue-dim/10',
      badge: 'No Counterfeits',
      badgeVariant: 'blue' as const,
    },
    {
      title: 'Live Alerts & Messages',
      desc: 'Send quick updates to your security team, medics, or specific zones with one tap during the event.',
      icon: <Bell className="w-6 h-6 text-ag-red" />,
      color: 'border-ag-red/30 bg-ag-red-dim/10',
      badge: 'Instant Alerts',
      badgeVariant: 'red' as const,
    },
    {
      title: 'Real-time Live View',
      desc: 'A simple, visual map of your venue showing live attendance, gate flow rates, and safety status at a glance.',
      icon: <Activity className="w-6 h-6 text-ag-purple" />,
      color: 'border-ag-purple/30 bg-ag-purple-dim/10',
      badge: 'Live View',
      badgeVariant: 'purple' as const,
    },
    {
      title: 'Safety Reports',
      desc: 'Automatic attendance graphs, gate entry reports, and safety logs ready for event authorities and police clearance.',
      icon: <Shield className="w-6 h-6 text-ag-blue" />,
      color: 'border-ag-blue/30 bg-ag-blue-dim/10',
      badge: 'Compliance',
      badgeVariant: 'blue' as const,
    },
  ];

  const steps = [
    {
      num: '01',
      title: '1. Connect Your Venue',
      desc: 'Choose your venue layout (Nyayo Stadium, KICC, Carnivore, Uhuru Gardens) and set zone capacities in seconds.',
      icon: <Building className="w-5 h-5 text-ag-blue" />,
    },
    {
      num: '02',
      title: '2. Sell Smart Tickets',
      desc: 'Attendees buy tickets with M-Pesa. Each ticket is locked to the attendee’s phone to prevent fake tickets.',
      icon: <Ticket className="w-5 h-5 text-ag-green" />,
    },
    {
      num: '03',
      title: '3. Open the Live Dashboard',
      desc: 'Watch gates scan in attendees, track live crowd density, and resolve incidents with your team in real time.',
      icon: <Activity className="w-5 h-5 text-ag-yellow" />,
    },
  ];

  const trustedPartners = [
    'Pulse Events Kenya',
    'Nairobi Festival Authority',
    'Blankets & Wine',
    'Tusker Oktobafest',
    'Sol Fest Nairobi',
  ];

  return (
    <div className="min-h-screen w-full bg-ag-black text-ag-text-primary selection:bg-ag-blue/30 selection:text-ag-green relative overflow-x-hidden flex flex-col font-sans">
      {/* Background BLE Mesh Constellation */}
      <MeshCanvas />

      {/* Navigation Header */}
      <header className="w-full h-20 border-b border-ag-border/60 bg-ag-black/85 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <AntigravityLogo size="md" />
          </Link>

          {/* Simple Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ag-text-secondary">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#story" className="hover:text-white transition-colors">
              Our Story
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsWaitlistOpen(true)}
              className="text-xs font-semibold"
            >
              Request Access
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold shadow-lg shadow-ag-blue/20"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 w-full pt-16 md:pt-24 pb-16 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-ag-green-dim border border-ag-green/40 px-4 py-1.5 rounded-full text-xs font-mono text-ag-green shadow-lg shadow-ag-green/10">
            <Shield className="w-3.5 h-3.5" />
            <span>REAL-TIME EVENT SAFETY PLATFORM FOR KENYA</span>
          </div>

          <div className="space-y-5 max-w-5xl mx-auto">
            <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.08] text-center max-w-4xl mx-auto">
              Never Lose Another Life to a Preventable Crush.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-ag-text-secondary max-w-3xl mx-auto font-sans leading-relaxed pt-1">
              ANTIGRAVITY shows you exactly how crowded every zone is, alerts you before danger happens, and protects phones from theft. Built for Kenyan events.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto sm:max-w-none">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto text-sm font-bold shadow-2xl shadow-ag-blue/30 px-8 h-12"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Live Dashboard
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsWaitlistOpen(true)}
              className="w-full sm:w-auto text-sm font-bold px-8 h-12 border-ag-border hover:bg-ag-surface"
            >
              Request Early Access
            </Button>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / PARTNERS SECTION */}
      <section className="relative z-10 w-full py-10 border-y border-ag-border/50 bg-ag-surface/30 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-4 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-ag-text-muted">
            Trusted by event organizers across Kenya
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 pt-2">
            {trustedPartners.map((partner, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-lg bg-ag-card/60 border border-ag-border text-xs md:text-sm font-semibold text-ag-text-secondary flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-ag-green animate-pulse" />
                <span>{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KAREN LOJORE STORY SECTION */}
      <section id="story" className="relative z-10 w-full py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 sm:p-12 border-ag-red/40 bg-gradient-to-b from-ag-red-dim/20 to-ag-black relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <HeartHandshake className="w-48 h-48 text-ag-red" />
            </div>

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-ag-red/20 border border-ag-red/40 text-ag-red text-xs font-mono">
                <span>WHY WE BUILT THIS</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight">
                December 20, 2025. Nyayo National Stadium.
              </h2>

              <div className="space-y-4 text-ag-text-secondary text-sm sm:text-base leading-relaxed">
                <p>
                  A 20-year-old Kenyan university student named <span className="text-white font-bold">Karen Lojore</span> attended a concert with her friends. When the headline act came on, crowd surges pushed forward with zero warning.
                </p>
                <p>
                  There was no density tracking, no gate pacing, and no automated alerts to safety teams. Karen lost her life in a preventable crush.
                </p>
                <p className="text-white font-medium">
                  We built ANTIGRAVITY so that no family in Kenya ever receives that phone call again.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative z-10 w-full py-20 px-6 sm:px-10 lg:px-16 border-t border-ag-border/50 bg-ag-surface/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-ag-text-secondary">
              Set up your event in 3 simple steps without complex equipment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <Card key={idx} className="p-6 sm:p-8 space-y-4 relative border-ag-border hover:border-ag-blue/50 transition-all">
                <div className="text-2xl font-mono font-bold text-ag-blue">
                  {step.num}
                </div>
                <div className="w-10 h-10 rounded-lg bg-ag-surface border border-ag-border flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-xs sm:text-sm text-ag-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" className="relative z-10 w-full py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Complete Event Safety Features
            </h2>
            <p className="text-sm sm:text-base text-ag-text-secondary">
              Everything you need to keep your attendees safe from entry to exit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <Card key={idx} className={`p-6 space-y-4 border ${feat.color} hover:scale-[1.01] transition-transform`}>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-ag-black border border-ag-border">
                    {feat.icon}
                  </div>
                  <Badge variant={feat.badgeVariant} size="sm">
                    {feat.badge}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-ag-text-secondary leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT & CTA BANNER */}
      <section id="contact" className="relative z-10 w-full py-20 px-6 sm:px-10 lg:px-16 border-t border-ag-border bg-gradient-to-b from-ag-black to-ag-surface/40">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">
            Ready to Protect Your Next Live Event?
          </h2>
          <p className="text-base text-ag-text-secondary max-w-xl mx-auto">
            Talk to our Nairobi operations team today or try the live demo dashboard instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto text-sm font-bold px-8 h-12 shadow-xl shadow-ag-blue/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Launch Live Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsWaitlistOpen(true)}
              className="w-full sm:w-auto text-sm font-bold px-8 h-12"
            >
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-8 border-t border-ag-border/50 bg-ag-black px-6 sm:px-10 lg:px-16 text-center text-xs font-mono text-ag-text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AntigravityLogo size="sm" />
            <span>— Life-safety for live events across Kenya</span>
          </div>
          <div>© 2026 ANTIGRAVITY. All rights reserved. Nairobi, Kenya.</div>
        </div>
      </footer>

      {/* Early Access Modal */}
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  );
};
