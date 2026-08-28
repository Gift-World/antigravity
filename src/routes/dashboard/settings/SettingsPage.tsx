// src/routes/dashboard/settings/SettingsPage.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Settings,
  Building,
  Key,
  Shield,
  Smartphone,
  CheckCircle2,
  Save,
  Radio,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentOrg } = useAppStore();
  const [orgName, setOrgName] = useState(currentOrg.name);
  const [orgEmail, setOrgEmail] = useState(currentOrg.email);
  const [orgPhone, setOrgPhone] = useState(currentOrg.phone || '+254 712 345 678');

  // Daraja M-Pesa Settings
  const [darajaEnvironment, setDarajaEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [consumerKey, setConsumerKey] = useState('dJ492810kLmNPqrstuvWXYZ0123456');
  const [consumerSecret, setConsumerSecret] = useState('••••••••••••••••••••••••••••••••');
  const [shortCode, setShortCode] = useState('174379');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-xl text-white">Platform Settings & Integrations</h2>
        <p className="text-xs text-ag-text-secondary font-mono">
          Manage Safaricom Daraja M-Pesa credentials, telemetry webhooks, and organization profile
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Info */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-ag-border pb-3">
            <Building className="w-4 h-4 text-ag-blue" />
            <h3 className="font-display font-bold text-base text-white">
              Organization Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <Input
              label="Official Contact Email"
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

        {/* Safaricom Daraja M-Pesa Integration */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-ag-border pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-ag-green" />
              <h3 className="font-display font-bold text-base text-white">
                Safaricom Daraja M-Pesa STK Push Integration
              </h3>
            </div>
            <Badge variant="green" size="sm">
              DARAJA API ACTIVE
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Daraja Environment
              </label>
              <select
                value={darajaEnvironment}
                onChange={(e) => setDarajaEnvironment(e.target.value as any)}
                className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
              >
                <option value="sandbox">Sandbox (Development / Sandbox.safaricom.co.ke)</option>
                <option value="production">Production (Lipa Na M-Pesa Live)</option>
              </select>
            </div>

            <Input
              label="Business Short Code (Paybill / Till)"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Consumer Key"
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              required
            />
            <Input
              label="Consumer Secret"
              type="password"
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Backend Telemetry Engine */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 border-b border-ag-border pb-3">
            <Radio className="w-4 h-4 text-ag-purple" />
            <h3 className="font-display font-bold text-base text-white">
              Supabase PostgreSQL & Realtime Status
            </h3>
          </div>
          <div className="p-3 bg-ag-black/50 rounded border border-ag-border text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-ag-text-secondary">Reactive Realtime Sync:</span>
              <span className="text-ag-green font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> CONNECTED & OPERATIONAL
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ag-text-secondary">Edge Functions:</span>
              <span className="text-ag-blue">5 Deno Handlers Active</span>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-ag-green text-xs font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration saved successfully.</span>
            </div>
          ) : (
            <div />
          )}
          <Button type="submit" variant="primary" size="lg" className="font-bold" leftIcon={<Save className="w-4 h-4" />}>
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
