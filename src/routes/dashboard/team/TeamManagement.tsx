// src/routes/dashboard/team/TeamManagement.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { UserRole } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  Users,
  Plus,
  Mail,
  Shield,
  Stethoscope,
  UserCheck,
  Smartphone,
  CheckCircle2,
  MapPin,
  Radio,
} from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const { users, currentUser } = useAppStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('security');
  const [invitePhone, setInvitePhone] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Tactical invite credentials dispatched to ${inviteEmail}.`);
    setInviteEmail('');
    setInviteName('');
    setIsInviteModalOpen(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
      case 'org_admin':
      case 'security':
        return <Shield className="w-4 h-4 text-ag-yellow" />;
      case 'medical':
        return <Stethoscope className="w-4 h-4 text-ag-red" />;
      case 'event_manager':
        return <UserCheck className="w-4 h-4 text-ag-green" />;
      default:
        return <Users className="w-4 h-4 text-ag-blue" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">
            Operational Team & Tactical Staff
          </h2>
          <p className="text-xs text-ag-text-secondary font-mono">
            Roster of event managers, security squad leaders, medical units, and gate scanning personnel
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsInviteModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          Invite Responder / Staff
        </Button>
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((member) => (
          <Card key={member.id} className="space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-ag-border bg-ag-black">
                    <img
                      src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{member.full_name}</h4>
                    <div className="text-[11px] font-mono text-ag-text-secondary">{member.email}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Badge variant="blue" size="sm" className="flex items-center gap-1">
                  {getRoleIcon(member.role)}
                  <span>{member.role.replace('_', ' ').toUpperCase()}</span>
                </Badge>
                <span className="text-[10px] font-mono text-ag-green flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ag-green" /> ACTIVE ON DUTY
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-ag-border text-xs font-mono text-ag-text-muted flex items-center justify-between">
              <span>{member.phone || '+254 700 000 000'}</span>
              <span className="text-ag-blue">Channel #1 (Tactical)</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Tactical Staff Member"
        description="Grant access to scanner PWA, incident dispatch or command center"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Sgt. James Mwamburi"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="staff@antigravity.ke"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Role Assignment
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
              >
                <option value="security">Security Patrol Lead</option>
                <option value="medical">Medical / Paramedic Chief</option>
                <option value="event_manager">Event Manager</option>
                <option value="vendor">Vendor Station Staff</option>
              </select>
            </div>
            <Input
              label="Phone Number"
              placeholder="+254 7..."
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
