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
  Search,
  Check,
  Calendar,
  Building,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeamManagement: React.FC = () => {
  const navigate = useNavigate();
  const { users, currentUser, events, addUser } = useAppStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('security');
  const [inviteEventId, setInviteEventId] = useState<string>(events[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isEventManager = currentUser.role === 'event_manager';
  if (isEventManager) {
    return (
      <div className="p-12 text-center space-y-4 font-sans max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-ag-surface border border-ag-border flex items-center justify-center mx-auto text-ag-yellow">
          <Users className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg">Admin Permission Required</h3>
          <p className="text-xs text-ag-text-secondary">
            Only Super Admins and Organization Admins can invite and manage team members and staff rosters.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    addUser({
      full_name: inviteName.trim(),
      email: inviteEmail.trim(),
      phone: invitePhone.trim() || '+254 700 000 000',
      role: inviteRole,
      avatar_url: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=120`,
    });

    setSuccessToast(`Invited ${inviteName} as ${inviteRole.replace('_', ' ')}`);
    setTimeout(() => setSuccessToast(null), 4000);

    setInviteEmail('');
    setInviteName('');
    setInvitePhone('');
    setIsInviteModalOpen(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
      case 'org_admin':
        return <Shield className="w-3.5 h-3.5 text-ag-yellow" />;
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="bg-ag-green-dim/90 border border-ag-green/40 text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg animate-fade-in">
          <Check className="w-4 h-4 text-ag-green shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Team & Event Crew</h2>
          <p className="text-xs text-ag-text-secondary">
            Onboard, invite, and assign event coordinators, security units, paramedics, and turnstile crew
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsInviteModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold h-10 px-4"
        >
          Invite Staff Member
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ag-text-muted" />
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-ag-surface border border-ag-border rounded-lg text-xs text-white placeholder:text-ag-text-muted focus:outline-none focus:border-ag-blue"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'super_admin', 'event_manager', 'security', 'medical'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedRoleFilter === role
                  ? 'bg-ag-blue text-white font-bold'
                  : 'bg-ag-surface border border-ag-border text-ag-text-secondary hover:text-white'
              }`}
            >
              {role === 'all'
                ? 'All Staff'
                : role === 'super_admin'
                ? 'Admins'
                : role === 'event_manager'
                ? 'Managers'
                : role === 'security'
                ? 'Security'
                : 'Medical'}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Roster Grid */}
      {filteredUsers.length === 0 ? (
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
            Invite Staff Member
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((member) => (
            <Card key={member.id} className="p-4 space-y-3 flex flex-col justify-between border-ag-border bg-ag-surface hover:border-ag-border-focus transition-all">
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
                  <CheckCircle2 className="w-3 h-3" /> Ready on Field
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite & Onboard Staff Member">
        <form onSubmit={handleInvite} className="space-y-4 font-sans">
          <Input
            label="Full Name"
            placeholder="e.g. Evans Mutua"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="evans@security.ke"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <Input
            label="Mobile Phone (for SMS / WhatsApp dispatch)"
            placeholder="+254 712 345 678"
            value={invitePhone}
            onChange={(e) => setInvitePhone(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ag-text-secondary">Assigned Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="w-full bg-ag-black border border-ag-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-ag-blue"
            >
              <option value="security">Security Officer (Field Patrol & Incident Reporting)</option>
              <option value="medical">Medical / Paramedic (Triage & SOS Dispatch)</option>
              <option value="event_manager">Event Manager (Operations & Live Control)</option>
              <option value="super_admin">Organization Administrator</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ag-text-secondary">Assign to Event</label>
            <select
              value={inviteEventId}
              onChange={(e) => setInviteEventId(e.target.value)}
              className="w-full bg-ag-black border border-ag-border rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-ag-blue"
            >
              <option value="">All Organization Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.event_date})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-ag-border">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invite & Assign
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
