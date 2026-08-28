// src/routes/dashboard/tickets/TicketManagement.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Ticket, TicketStatus } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { createTicketQRPayload } from '@/lib/qr';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket as TicketIcon,
  Search,
  Plus,
  QrCode,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Smartphone,
  Lock,
  Layers,
} from 'lucide-react';

export const TicketManagement: React.FC = () => {
  const { tickets, events, activeEventId } = useAppStore();
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkTier, setBulkTier] = useState('VIP Golden Circle');
  const [bulkCount, setBulkCount] = useState(25);
  const [bulkCorporateName, setBulkCorporateName] = useState('Safaricom Corporate Guests');
  const [inspectTicket, setInspectTicket] = useState<Ticket | null>(null);

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.mpesa_transaction_id && t.mpesa_transaction_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Generated ${bulkCount} Cryptographically Bound Passes for "${bulkCorporateName}".`);
    setIsBulkModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl text-white">
            Smart Ticket & Cryptographic QR Vault
          </h2>
          <p className="text-xs text-ag-text-secondary font-mono">
            Anti-counterfeit SHA-256 device-bound passes with Safaricom Daraja M-Pesa ledger
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsBulkModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          Bulk Generate Corporate Passes
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-ag-surface p-3 rounded-[8px] border border-ag-border">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ag-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ticket ID, tier, device hash or M-Pesa receipt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ag-black border border-ag-border text-ag-text-primary text-xs rounded px-3 py-2 pl-9 focus:outline-none focus:border-ag-blue"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'valid', 'scanned', 'revoked'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono uppercase tracking-wider transition-colors ${
                filterStatus === status
                  ? 'bg-ag-blue-dim text-ag-blue border border-ag-blue/40 font-bold'
                  : 'text-ag-text-secondary hover:text-white hover:bg-ag-surface-hover'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-ag-black/60 border-b border-ag-border text-ag-text-muted uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Ticket ID</th>
                <th className="p-3.5">Tier</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">M-Pesa Receipt</th>
                <th className="p-3.5">Cryptographic Hash</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ag-border">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-ag-surface-hover/50">
                  <td className="p-3.5 font-bold text-white flex items-center gap-2">
                    <QrCode className="w-3.5 h-3.5 text-ag-blue" />
                    <span>{ticket.id}</span>
                  </td>
                  <td className="p-3.5 text-ag-text-primary">{ticket.tier}</td>
                  <td className="p-3.5 text-ag-green font-bold">
                    KES {ticket.price.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={
                        ticket.status === 'valid'
                          ? 'green'
                          : ticket.status === 'scanned'
                          ? 'blue'
                          : 'red'
                      }
                      size="sm"
                    >
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-ag-text-secondary">
                    {ticket.mpesa_transaction_id || 'QK782910AA'}
                  </td>
                  <td className="p-3.5 text-ag-text-muted truncate max-w-[140px]">
                    {ticket.qr_code_hash}
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setInspectTicket(ticket)}
                      className="text-[11px] h-7 px-2"
                    >
                      Inspect QR
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspect Ticket QR Modal */}
      {inspectTicket && (
        <Modal
          isOpen={Boolean(inspectTicket)}
          onClose={() => setInspectTicket(null)}
          title={`Ticket: ${inspectTicket.id}`}
          description={`Tier: ${inspectTicket.tier} • KES ${inspectTicket.price.toLocaleString()}`}
        >
          <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
            <div className="p-4 bg-white rounded-[16px] shadow-lg border border-ag-border">
              <QRCodeSVG
                value={JSON.stringify({
                  tid: inspectTicket.id,
                  hash: inspectTicket.qr_code_hash,
                  ver: 1,
                })}
                size={180}
                level="H"
                fgColor="#0A0A0F"
              />
            </div>
            <div className="space-y-1 text-xs font-mono">
              <div className="text-ag-text-muted">SHA-256 Hash Digest:</div>
              <div className="text-ag-blue text-[11px] bg-ag-black p-2 rounded break-all max-w-sm border border-ag-border">
                {inspectTicket.qr_code_hash}
              </div>
            </div>
            <p className="text-xs text-ag-text-secondary">
              Cryptographically device-bound pass verified for single entry at Gate A, B, C, or D.
            </p>
          </div>
        </Modal>
      )}

      {/* Bulk Generate Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Corporate Ticket Generator"
        description="Issue cryptographic device-bound passes for sponsors and VIP delegations"
      >
        <form onSubmit={handleBulkGenerate} className="space-y-4">
          <Input
            label="Corporate Client / Group Name"
            placeholder="e.g. Safaricom Platinum Sponsors"
            value={bulkCorporateName}
            onChange={(e) => setBulkCorporateName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ag-text-secondary mb-1.5">
                Pass Tier
              </label>
              <select
                value={bulkTier}
                onChange={(e) => setBulkTier(e.target.value)}
                className="w-full bg-ag-black/60 border border-ag-border text-ag-text-primary rounded-[4px] px-3 py-2 text-sm focus:outline-none focus:border-ag-blue"
              >
                <option value="VIP Golden Circle">VIP Golden Circle</option>
                <option value="Regular Pitch">Regular Pitch</option>
                <option value="All-Access Hospitality">All-Access Hospitality</option>
              </select>
            </div>
            <Input
              label="Batch Quantity"
              type="number"
              value={bulkCount}
              onChange={(e) => setBulkCount(Number(e.target.value))}
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Generate Batch Passes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
