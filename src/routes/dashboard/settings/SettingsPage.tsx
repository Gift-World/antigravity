// src/routes/dashboard/settings/SettingsPage.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Building,
  Smartphone,
  CheckCircle2,
  Save,
  Play,
  Pause,
  Database,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    currentOrg,
    isSimulationActive,
    toggleSimulation,
    isSupabaseConnected,
  } = useAppStore();

  const [orgName, setOrgName] = useState(currentOrg.name);
  const [orgEmail, setOrgEmail] = useState(currentOrg.email);
  const [orgPhone, setOrgPhone] = useState(currentOrg.phone || '+254 712 345 678');
  const [darajaEnvironment, setDarajaEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [shortCode, setShortCode] = useState('174379');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Settings</h2>
        <p className="text-xs text-ag-text-secondary">
          Manage your organization details, M-Pesa payments, and demo preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Info */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-ag-border pb-3">
            <Building className="w-4 h-4 text-ag-blue" />
            <h3 className="font-bold text-base text-white">Organization Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <Input
              label="Contact Email"
              type="email"
              value={orgEmail}
              onChange={(e) => setOrgEmail(e.target.value)}
              required
            />
          </div>

          <Input
            label="Support Phone (Kenya)"
            value={orgPhone}
            onChange={(e) => setOrgPhone(e.target.value)}
          />
        </Card>

        {/* Demo Simulation Mode Toggle */}
        <Card className="p-6 space-y-4 border-ag-border bg-ag-surface">
          <div className="flex items-center justify-between border-b border-ag-border pb-3">
            <div>
              <h3 className="font-bold text-base text-white">Demo Data Generator</h3>
              <p className="text-xs text-ag-text-secondary mt-0.5">
                Simulate live gate entries, turnstile scanning, and crowd flow for testing.
              </p>
            </div>
            <Button
              type="button"
              variant={isSimulationActive ? 'primary' : 'outline'}
              onClick={toggleSimulation}
              className={`h-10 px-4 font-bold text-xs ${
                isSimulationActive ? 'bg-ag-green text-black hover:bg-ag-green/90' : ''
              }`}
              leftIcon={isSimulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isSimulationActive ? 'Simulation Active' : 'Simulation Paused'}
            </Button>
          </div>
        </Card>

        {/* Safaricom M-Pesa Settings */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-ag-border pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-ag-green" />
              <h3 className="font-bold text-base text-white">
                Safaricom Lipa Na M-Pesa STK Push
              </h3>
            </div>
            <Badge variant="green" size="sm">
              M-PESA READY
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ag-text-secondary">Environment</label>
              <select
                value={darajaEnvironment}
                onChange={(e) => setDarajaEnvironment(e.target.value as any)}
                className="w-full bg-ag-black border border-ag-border rounded-lg p-2.5 text-xs text-white"
              >
                <option value="sandbox">Sandbox (Testing / Demo)</option>
                <option value="production">Production (Live Paybill / Till)</option>
              </select>
            </div>

            <Input
              label="Business Till / Paybill Number"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Database Status */}
        <Card className="p-5 space-y-2 border-ag-border bg-ag-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-ag-purple" />
              <span className="font-bold text-sm text-white">Database Status</span>
            </div>
            <Badge variant={isSupabaseConnected ? 'green' : 'yellow'} size="sm">
              {isSupabaseConnected ? 'CONNECTED' : 'OFFLINE DEMO'}
            </Badge>
          </div>
          <p className="text-xs text-ag-text-secondary">
            {isSupabaseConnected
              ? 'Real-time PostgreSQL connection is active with Supabase.'
              : 'Running in local demo mode with sample data.'}
          </p>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-ag-green text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </div>
          ) : (
            <div />
          )}
          <Button type="submit" variant="primary" size="lg" className="h-11 px-8 font-bold">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
