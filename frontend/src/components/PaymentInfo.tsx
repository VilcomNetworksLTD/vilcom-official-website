// src/components/PaymentInfo.tsx
// Drop-in replacement — accepts live paybill + MBR ID from dashboard API

import { useState } from 'react';
import { Copy, Check, CreditCard } from 'lucide-react';

interface PaymentInfoProps {
  emeraldMbrId?: string | null;
  paybill?: string | null;        // passed from dashboard API
}

const PaymentInfo = ({ emeraldMbrId, paybill }: PaymentInfoProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Fallback to env var if not passed from API
  const paybillNumber = paybill ?? import.meta.env.VITE_MPESA_PAYBILL ?? '—';
  const accountNumber = emeraldMbrId ?? null;

  const copy = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center border border-green-500/30">
          <CreditCard className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Pay via M-Pesa</h2>
          <p className="text-slate-400 text-xs">Paybill payment</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Paybill */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Business Number</p>
            <p className="text-white font-bold text-lg font-mono tracking-wide">
              {paybillNumber}
            </p>
          </div>
          {paybillNumber !== '—' && (
            <button
              onClick={() => copy(paybillNumber, 'paybill')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              title="Copy paybill"
            >
              {copiedField === 'paybill'
                ? <Check className="w-4 h-4 text-green-400" />
                : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Account Number */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Account Number</p>
            <p className="text-white font-bold text-lg font-mono tracking-wide">
              {accountNumber ?? 'Setting up...'}
            </p>
          </div>
          {accountNumber && (
            <button
              onClick={() => copy(accountNumber, 'account')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              title="Copy account number"
            >
              {copiedField === 'account'
                ? <Check className="w-4 h-4 text-green-400" />
                : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      {accountNumber ? (
        <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
          <p className="text-green-300/80 text-xs leading-relaxed">
            📱 M-Pesa → Lipa na M-Pesa → Pay Bill →
            Business No: <strong>{paybillNumber}</strong> →
            Account No: <strong>{accountNumber}</strong>
          </p>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <p className="text-amber-300/80 text-xs">
            Your M-Pesa account number is being set up. Please contact support if this persists.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentInfo;