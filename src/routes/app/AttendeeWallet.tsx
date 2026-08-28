// src/routes/app/AttendeeWallet.tsx
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { MpesaModal } from '@/components/attendee/MpesaModal';
import { QRCodeSVG } from 'qrcode.react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Coffee,
  Beer,
  Utensils,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AttendeeWallet: React.FC = () => {
  const { wallets, currentUser, transactions, topupWallet, spendCashless } = useAppStore();

  const wallet = wallets[currentUser.id] || {
    id: 'w_demo',
    user_id: currentUser.id,
    event_id: 'e1',
    balance: 4250,
    currency: 'KES',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState(2000);
  const [isSpending, setIsSpending] = useState(false);

  const userTransactions = transactions.filter((t) => t.wallet_id === wallet.id || true);

  const handleTopupSuccess = async (mpesaPhone: string) => {
    await topupWallet(topupAmount, mpesaPhone);
  };

  const handleQuickBuy = async (item: string, price: number) => {
    try {
      setIsSpending(true);
      await spendCashless(price, `${item} (Food Court #4)`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSpending(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-[#12121A] via-[#1E1E2D] to-[#0A0A0F] rounded-[20px] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E676] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CASHLESS WRISTBAND WALLET</span>
            </span>
            <span className="text-[10px] font-mono text-white/60">KES NATIVE</span>
          </div>

          <div>
            <div className="text-xs text-white/70">Available Balance</div>
            <div className="font-display font-bold text-3xl text-white tracking-tight">
              KES {wallet.balance.toLocaleString()}
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="md"
              variant="success"
              onClick={() => setIsTopupModalOpen(true)}
              className="w-full bg-[#00A859] hover:bg-[#00924d] text-white font-bold text-xs"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Top Up with M-Pesa STK
            </Button>
          </div>
        </div>
      </div>

      {/* Cashless Barcode Pass for Vendors */}
      <div className="bg-white rounded-[14px] border border-[#E2E4EB] p-4 text-center space-y-3 shadow-sm">
        <div className="text-xs font-bold text-[#12121A]">Vendor Scan Code</div>
        <p className="text-[11px] text-[#717182]">
          Present this QR code at any bar or food court counter for instant 1-tap cashless checkout.
        </p>

        <div className="p-3 bg-[#F8F9FC] border border-[#E2E4EB] rounded-[12px] inline-block mx-auto">
          <QRCodeSVG value={`ANTIGRAVITY_WALLET:${wallet.id}`} size={140} level="M" fgColor="#12121A" />
        </div>
        <div className="text-[10px] font-mono text-[#717182]">Wallet ID: {wallet.id.substring(0, 16)}...</div>
      </div>

      {/* Fast Demo Spending Simulator (Quick Buy) */}
      <div className="bg-white rounded-[14px] border border-[#E2E4EB] p-4 space-y-2.5 shadow-sm">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#717182]">
          Instant Demo Vendor Simulators
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickBuy('Tusker Lager (500ml)', 350)}
            disabled={isSpending || wallet.balance < 350}
            className="text-xs bg-[#F8F9FC] text-[#12121A] border-[#E2E4EB] justify-start"
            leftIcon={<Beer className="w-3.5 h-3.5 text-amber-500" />}
          >
            Tusker (KES 350)
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleQuickBuy('Nyama Choma Platter', 750)}
            disabled={isSpending || wallet.balance < 750}
            className="text-xs bg-[#F8F9FC] text-[#12121A] border-[#E2E4EB] justify-start"
            leftIcon={<Utensils className="w-3.5 h-3.5 text-orange-500" />}
          >
            Choma (KES 750)
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-[14px] border border-[#E2E4EB] p-4 space-y-3 shadow-sm">
        <div className="text-xs font-bold text-[#12121A]">Recent Activity</div>
        <div className="space-y-2">
          {userTransactions.length === 0 ? (
            <p className="text-xs text-[#717182] text-center py-3">No transactions yet.</p>
          ) : (
            userTransactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 bg-[#F8F9FC] rounded-[8px] border border-[#E2E4EB] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      tx.transaction_type === 'topup'
                        ? 'bg-[#00A859]/10 text-[#00A859]'
                        : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {tx.transaction_type === 'topup' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-[#12121A]">{tx.description}</div>
                    <div className="text-[10px] font-mono text-[#717182]">
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div
                  className={`font-mono font-bold ${
                    tx.transaction_type === 'topup' ? 'text-[#00A859]' : 'text-[#12121A]'
                  }`}
                >
                  {tx.transaction_type === 'topup' ? '+' : '-'}KES {tx.amount.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* M-Pesa Topup Modal */}
      <MpesaModal
        isOpen={isTopupModalOpen}
        onClose={() => setIsTopupModalOpen(false)}
        amount={topupAmount}
        title="Top Up Cashless Wallet"
        description="Enter amount and Safaricom number for instant balance credit"
        onSuccess={handleTopupSuccess}
      />
    </div>
  );
};
