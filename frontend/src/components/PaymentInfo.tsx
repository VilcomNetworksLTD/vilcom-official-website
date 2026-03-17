import { Copy, CheckCircle2, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface PaymentInfoProps {
  emeraldMbrId?: string | null;
}

const PaymentInfo = ({ emeraldMbrId }: PaymentInfoProps) => {
  const paybill = import.meta.env.VITE_MPESA_PAYBILL ?? '522522';
  const [copiedPaybill, setCopiedPaybill] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const copyToClipboard = async (text: string, type: 'paybill' | 'account') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'paybill') {
        setCopiedPaybill(true);
        setTimeout(() => setCopiedPaybill(false), 2000);
      } else {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
      }
    } catch {
      // Fallback: silently ignore — not critical
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-500/15 to-emerald-600/10 backdrop-blur-md border border-green-500/25 rounded-2xl p-6 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Pay via M-Pesa Paybill</p>
          <p className="text-slate-400 text-xs">Use your unique account number below</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Paybill */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Paybill Number</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-white font-bold text-xl tracking-wide">{paybill}</p>
            <button
              id="copy-paybill-btn"
              onClick={() => copyToClipboard(paybill, 'paybill')}
              className="text-slate-400 hover:text-green-400 transition-colors"
              title="Copy paybill number"
            >
              {copiedPaybill ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-slate-500 text-xs mb-1">Account Number</p>
          <div className="flex items-center justify-between gap-2">
            {emeraldMbrId ? (
              <>
                <p className="text-white font-bold text-xl tracking-wide">{emeraldMbrId}</p>
                <button
                  id="copy-account-btn"
                  onClick={() => copyToClipboard(emeraldMbrId, 'account')}
                  className="text-slate-400 hover:text-green-400 transition-colors"
                  title="Copy account number"
                >
                  {copiedAccount ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </>
            ) : (
              <span className="text-amber-400 text-sm font-medium italic">Pending setup…</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-xs leading-relaxed">
        When paying via Lipa na M-Pesa Paybill, enter your <strong className="text-slate-400">account number</strong> exactly as shown above so your payment is allocated automatically.
      </p>
    </div>
  );
};

export default PaymentInfo;
