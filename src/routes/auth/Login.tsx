// src/routes/auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Shield, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { users, setCurrentUser } = useAppStore();
  const [email, setEmail] = useState('admin@antigravity.ke');
  const [password, setPassword] = useState('Demo2026!');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const match = users.find((u) => u.email === email) || users[0];
      setCurrentUser(match);
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  const handleQuickDemoSwitch = (roleEmail: string) => {
    setEmail(roleEmail);
    const match = users.find((u) => u.email === roleEmail) || users[0];
    setCurrentUser(match);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-ag-black flex items-center justify-center p-4 selection:bg-ag-blue/30 selection:text-ag-green">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-ag-surface border border-ag-blue/50 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6" viewBox="0 0 100 100" fill="none">
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
            <span className="font-display font-bold text-xl tracking-wider text-white">
              ANTIGRAVITY
            </span>
          </Link>
          <p className="text-xs text-ag-text-secondary font-mono">
            Mission Control & Stadium Operations Portal
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@antigravity.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-sm font-bold mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Command Center
            </Button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="pt-3 border-t border-ag-border space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ag-text-muted text-center">
              1-Click Demo Profiles
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('admin@antigravity.ke')}
                className="p-2 bg-ag-black/60 hover:bg-ag-surface-hover border border-ag-border rounded text-ag-blue text-left transition-colors truncate"
              >
                👤 Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('evans.security@antigravity.ke')}
                className="p-2 bg-ag-black/60 hover:bg-ag-surface-hover border border-ag-border rounded text-ag-yellow text-left transition-colors truncate"
              >
                🛡️ Security Lead
              </button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-ag-text-muted font-mono">
          <span>Need an organizer account? </span>
          <Link to="/register" className="text-ag-blue hover:underline">
            Register Organization
          </Link>
        </div>
      </div>
    </div>
  );
};
