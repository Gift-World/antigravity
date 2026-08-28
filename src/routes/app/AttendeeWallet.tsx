// src/routes/app/AttendeeWallet.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MpesaModal } from '@/components/attendee/MpesaModal';
import { QRCodeSVG } from 'qrcode.react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  Beer,
  Coffee,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AttendeeWallet: React.FC = () => {
  const { currentUser, wallets, transactions, spendCashless, topupWallet } = useAppStore();
  const wallet = wallets[currentUser.id] || {
    id: 'w1',
    balance: 2500,
    currency: 'KES',
    mpesa_phone: '+254712345678',
  };

  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState(1000);
  const [phone, setPhone] = useState(wallet.mpesa_phone || '+254 712 345 678');
  const [isProcessing, setIsProcessing] = useState(false);

  const userTransactions = transactions.filter((t) => t.wallet_id === wallet.id || true).slice(0, 10);

  const handleSpendMock = async (amount: number, item: string) => {
    try {
      setIsProcessing(true);
      await spendCashless(amount, item);
      setIsProcessing(false);
    } catch (err: any) {
      alert(err.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  const handleTopupSubmit = async () => {
    setIsTopupModalOpen(false);
    await topupWallet(topupAmount, phone);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="text-center space-y-1">
        <h2 className="font-display font-bold text-xl text-white">
          Cashless Wristband Wallet
        </h2>
        <p className="text-xs text-ag-text-secondary font-mono">
          Lipa Na M-Pesa Native Fast Bar Checkout
        </p>
      </div>

      {/* Main Balance Display Card */}
      <Card className="p-6 bg-gradient-to-br from-ag-surface via-ag-black to-ag-surface border-2 border-ag-green/40 shadow-2xl text-center space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-ag-text-secondary">
          <span>Wristband Balance</span>
          <Badge variant="green" size="sm">
            ACTIVE NFC / QR
          </Badge>
        </div>

        <div>
          <div className="text-xs font-mono text-ag-text-muted">Available Funds</div>
          <div className="font-display font-bold text-4xl text-white tracking-tight mt-1">
            KES {wallet.balance.toLocaleString()}
          </div>
        </div>

        {/* Top Up via M-Pesa Button */}
        <Button
          size="lg"
          variant="primary"
          onClick={() => setIsTopupModalOpen(true)}
          className="w-full font-bold text-sm h-12 shadow-xl shadow-ag-green/20"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Top Up via M-Pesa
        </Button>
      </Card>

      {/* Quick Spend Simulator (Drinks & Food) */}
      <Card className="p-4 space-y-3 bg-ag-surface border-ag-border">
        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-ag-text-muted">
          Festival Vendor Stations (Demo 1-Tap)
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSpendMock(350, 'Cold Tusker Lager')}
            disabled={isProcessing || wallet.balance < 350}
            className="p-3 rounded-[8px] bg-ag-black/60 hover:bg-ag-surface-hover border border-ag-border flex flex-col items-center justify-center space-y-1 text-center transition-colors disabled:opacity-50"
          >
            <Beer className="w-5 h-5 text-ag-yellow" />
            <span className="text-xs font-bold text-white">Tusker Lager</span>
            <span className="text-[10px] font-mono text-ag-green font-semibold">KES 350</span>
          </button>

          <button
            onClick={() => handleSpendMock(600, 'Nyama Choma Platter')}
            disabled={isProcessing || wallet.balance < 600}
            className="p-3 rounded-[8px] bg-ag-black/60 hover:bg-ag-surface-hover border border-ag-border flex flex-col items-center justify-center space-y-1 text-center transition-colors disabled:opacity-50"
          >
            <Coffee className="w-5 h-5 text-ag-orange" />
            <span className="text-xs font-bold text-white">Nyama Choma</span>
            <span className="text-[10px] font-mono text-ag-green font-semibold">KES 600</span>
          </button>
        </div>
      </Card>

      {/* Transaction History List */}
      <Card className="p-4 space-y-3 bg-ag-surface border-ag-border">
        <div className="flex items-center justify-between pb-2 border-b border-ag-border">
          <div className="font-display font-bold text-xs uppercase tracking-wider text-white">
            Transaction History
          </div>
          <span className="text-[10px] font-mono text-ag-text-muted">Last 10 Actions</span>
        </div>

        <div className="space-y-2">
          {userTransactions.map((tx) => {
            const isTopup = tx.transaction_type === 'topup';
            return (
              <div
                key={tx.id}
                className="p-2.5 rounded bg-ag-black/40 border border-ag-border flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isTopup ? 'bg-ag-green-dim text-ag-green' : 'bg-ag-blue-dim text-ag-blue'
                    }`}
                  >
                    {isTopup ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-white truncate max-w-[170px]">
                      {tx.description}
                    </div>
                    <div className="text-[10px] text-ag-text-muted">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className={`font-bold ${isTopup ? 'text-ag-green' : 'text-white'}`}>
                  {isTopup ? '+' : '-'} KES {tx.amount.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* M-Pesa Topup Modal */}
      <MpesaModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        amount={topupAmount}
        phoneNumber={phone}
        onSuccess={handleTopupSubmit}
      />
    </div>
  );
};
