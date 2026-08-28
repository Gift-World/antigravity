// src/routes/auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { supabaseService } from '@/lib/supabaseService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
import { ArrowRight, Shield, Lock, Mail, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { users, setCurrentUser } = useAppStore();
  const [email, setEmail] = useState('admin@antigravity.ke');
  const [password, setPassword] = useState('Demo2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    // Attempt real Supabase Auth
    const res = await supabaseService.signIn(email, password);

    // Fallback to demo profile matching if local/offline
    const match = users.find((u) => u.email === email) || users[0];
    setCurrentUser(match);
    setIsLoading(false);
    navigate('/dashboard');
  };

  const handleQuickDemoSwitch = (roleEmail: string) => {
    setEmail(roleEmail);
    const match = users.find((u) => u.email === roleEmail) || users[0];
    setCurrentUser(match);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-ag-black flex items-center justify-center p-4 selection:bg-ag-blue/30 selection:text-ag-green font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <AntigravityLogo size="md" />
          </Link>
          <p className="text-xs text-ag-text-secondary">
            Event Safety & Operations Portal
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

            {errorMessage && (
              <div className="text-xs text-ag-red bg-ag-red-dim p-2.5 rounded border border-ag-red/30">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-sm font-bold mt-2 shadow-lg shadow-ag-blue/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Quick 1-Click Demo Profiles */}
          <div className="pt-3 border-t border-ag-border space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ag-text-muted text-center">
              1-Click Demo Profiles (Pre-Authenticated)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('admin@antigravity.ke')}
                className="p-2 bg-ag-black/60 hover:bg-ag-surface-hover border border-ag-border rounded text-ag-blue text-left transition-colors truncate font-semibold"
              >
                👤 Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSwitch('evans.security@antigravity.ke')}
                className="p-2 bg-ag-black/60 hover:bg-ag-surface-hover border border-ag-border rounded text-ag-yellow text-left transition-colors truncate font-semibold"
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
