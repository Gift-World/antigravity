// src/routes/auth/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Building, Mail, Lock, User } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
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
            Register Event Promotion Organization
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-6 space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Organization Name"
              placeholder="e.g. Pulse Events Kenya"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
              required
            />

            <Input
              label="Admin Full Name"
              placeholder="e.g. Brian Ochieng"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Corporate Email"
              type="email"
              placeholder="admin@pulseevents.co.ke"
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
              Create Organization Account
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-ag-text-muted font-mono">
          <span>Already registered? </span>
          <Link to="/login" className="text-ag-blue hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
