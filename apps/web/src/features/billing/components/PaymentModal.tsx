import React, { useState } from 'react';
import { X, Check, IndianRupee, CreditCard, Smartphone, ShieldAlert } from 'lucide-react';
import { PaymentMode } from '@medicalink/shared';

// Mock Stripe Component
const StripeCardElementMock = () => (
  <div className="p-3 border border-slate-300 rounded-lg bg-slate-50 flex items-center justify-between">
    <div className="flex space-x-2">
      <div className="w-12 h-8 bg-indigo-200 rounded flex items-center justify-center text-[10px] font-bold text-indigo-700">VISA</div>
      <div className="text-slate-400 font-mono tracking-widest flex items-center">
        •••• •••• •••• 4242
      </div>
    </div>
    <div className="text-slate-400 text-sm">12/28 | CVC</div>
  </div>
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentData: any) => void;
  balanceAmount: number;
}

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, balanceAmount }) => {
  const [overrideState, setOverrideState] = useState<{ amount?: number; mode?: PaymentMode; reference?: string; cashReceived?: number } | null>(null);

  const amount = overrideState?.amount ?? balanceAmount;
  const mode = overrideState?.mode ?? PaymentMode.CASH;
  const reference = overrideState?.reference ?? '';
  const cashReceived = overrideState?.cashReceived ?? 0;

  const setAmount = (val: any) => setOverrideState(prev => ({ ...prev, amount: typeof val === 'function' ? val(prev?.amount ?? balanceAmount) : val }));
  const setMode = (val: PaymentMode) => setOverrideState(prev => ({ ...prev, mode: val }));
  const setReference = (val: string) => setOverrideState(prev => ({ ...prev, reference: val }));
  const setCashReceived = (val: any) => setOverrideState(prev => ({ ...prev, cashReceived: typeof val === 'function' ? val(prev?.cashReceived ?? 0) : val }));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > balanceAmount) return;
    
    // Auto-generate reference for card mock
    const finalReference = mode === PaymentMode.CARD ? `ch_mock_${Math.random().toString(36).substring(2, 10)}` : reference;
    
    onConfirm({ mode, amount, reference: finalReference });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Collect Payment</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-indigo-600 mb-1">Remaining Balance</p>
            <p className="text-3xl font-black text-indigo-700">₹{balanceAmount.toLocaleString('en-IN')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode(PaymentMode.CASH)}
                className={`flex items-center justify-center p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  mode === PaymentMode.CASH 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <IndianRupee size={18} className="mr-2" /> Cash
              </button>
              <button
                type="button"
                onClick={() => setMode(PaymentMode.CARD)}
                className={`flex items-center justify-center p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  mode === PaymentMode.CARD 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <CreditCard size={18} className="mr-2" /> Card
              </button>
              <button
                type="button"
                onClick={() => setMode(PaymentMode.UPI)}
                className={`flex items-center justify-center p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  mode === PaymentMode.UPI 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Smartphone size={18} className="mr-2" /> UPI
              </button>
              <button
                type="button"
                onClick={() => setMode(PaymentMode.INSURANCE)}
                className={`flex items-center justify-center p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  mode === PaymentMode.INSURANCE 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <ShieldAlert size={18} className="mr-2" /> Insurance
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Paying Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                max={balanceAmount}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-lg"
              />
            </div>

            {mode === PaymentMode.CASH && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cash Received (₹)</label>
                <input
                  type="number"
                  min={amount}
                  value={cashReceived || ''}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  placeholder="Amount given by patient"
                  className="w-full rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {cashReceived > amount && (
                  <p className="mt-2 text-sm font-medium text-emerald-600">
                    Change to return: ₹{(cashReceived - amount).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}

            {(mode === PaymentMode.UPI || mode === PaymentMode.NEFT) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Reference No.</label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., UTR"
                  className="w-full rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                />
              </div>
            )}

            {mode === PaymentMode.CARD && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Stripe Secure Payment</label>
                <StripeCardElementMock />
                <div className="flex items-center text-xs text-slate-500 mt-2">
                  <ShieldAlert size={12} className="mr-1 text-emerald-600" /> Payment is secured by Stripe 256-bit encryption
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0 || amount > balanceAmount || ((mode === PaymentMode.UPI) && !reference)}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={18} className="mr-2" /> Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
