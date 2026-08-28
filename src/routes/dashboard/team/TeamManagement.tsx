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
  CheckCircle2,
} from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const { users } = useAppStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('security');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invite sent to ${inviteEmail}.`);
    setInviteEmail('');
    setInviteName('');
    setIsInviteModalOpen(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
      case 'org_admin':
      case 'security':
        return <Shield className="w-3.5 h-3.5 text-ag-yellow" />;
      case 'medical':
        return <Stethoscope className="w-3.5 h-3.5 text-ag-red" />;
      case 'event_manager':
        return <UserCheck className="w-3.5 h-3.5 text-ag-green" />;
      default:
        return <Users className="w-3.5 h-3.5 text-ag-blue" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Team & Staff</h2>
          <p className="text-xs text-ag-text-secondary">
            Manage your event organizers, security personnel, medics, and gate scanning crew
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsInviteModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold h-10 px-4"
        >
          Invite Member
        </Button>
      </div>

      {/* Staff Roster Grid */}
      {users.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-ag-surface border border-ag-border flex items-center justify-center mx-auto text-ag-text-muted">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">No Team Members Found</h3>
            <p className="text-xs text-ag-text-secondary max-w-sm mx-auto">
              Invite event managers, security personnel, and medics to coordinate crowd safety.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsInviteModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Invite Member
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((member) => (
            <Card key={member.id} className="p-4 space-y-3 flex flex-col justify-between border-ag-border bg-ag-surface">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-ag-border bg-ag-black shrink-0">
                    <img
                      src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate">{member.full_name}</h4>
                    <div className="text-xs text-ag-text-secondary truncate">{member.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="blue" size="sm" className="flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    <span>{member.role.replace('_', ' ').toUpperCase()}</span>
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t border-ag-border text-xs text-ag-text-muted flex items-center justify-between">
                <span>{member.phone || '+254 700 000 000'}</span>
                <span className="text-ag-green font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-4 font-sans">
          <Input
            label="Full Name"
            placeholder="e.g. John Kamau"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="john@pulseevents.co.ke"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ag-text-secondary">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="w-full bg-ag-black border border-ag-border rounded-lg p-2.5 text-xs text-white"
            >
              <option value="event_manager">Event Manager</option>
              <option value="security">Security Officer</option>
              <option value="medical">Medical / First Aid</option>
              <option value="super_admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-ag-border">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
