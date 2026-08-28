// src/routes/auth/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { supabaseService } from '@/lib/supabaseService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AntigravityLogo } from '@/components/ui/AntigravityLogo';
import { ArrowRight, Building, Mail, Lock, User } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Call Supabase Auth signUp
    await supabaseService.signUp(email, password, fullName, orgName);

    setIsLoading(false);
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
              className="w-full text-sm font-bold mt-2 shadow-lg shadow-ag-blue/20"
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
