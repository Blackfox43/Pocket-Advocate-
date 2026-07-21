import React, { useState } from 'react';
import { UserProfile } from '../types';

export interface UpgradeModalProps {
  isOpen?: boolean;
  planName?: string;
  billingCycle?: "monthly" | "lifetime";
  cardName?: string;
  cardNumber?: string;
  authToken?: string | null;
  currentUser?: UserProfile | null;
  onUpgradeSuccess?: (user: UserProfile) => void;
  onOpenAuth?: () => void;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen = true,
  planName = "Pro Plan",
  billingCycle = "monthly",
  cardName: initialCardName = "",
  cardNumber: initialCardNumber = "",
  authToken,
  currentUser,
  onUpgradeSuccess,
  onOpenAuth,
  onClose,
}) => {
  const [cycle, setCycle] = useState<"monthly" | "lifetime">(billingCycle);
  const [cardName, setCardName] = useState(initialCardName);
  const [cardNumber, setCardNumber] = useState(initialCardNumber);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      if (onOpenAuth) {
        onClose();
        onOpenAuth();
      } else {
        setError("Please sign in to complete your upgrade.");
      }
      return;
    }

    setIsProcessing(true);

    try {
      // Simulated processing latency / backend endpoint call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const updatedUser: UserProfile = {
        ...currentUser,
        tier: cycle === 'lifetime' ? 'lifetime' : 'pro',
      };

      if (onUpgradeSuccess) {
        onUpgradeSuccess(updatedUser);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full">
            Unlock Full Access
          </span>
          <h2 className="text-2xl font-bold text-white mt-3">Upgrade to {planName}</h2>
          <p className="text-sm text-slate-400 mt-1">
            Get unlimited generation, advanced analysis models, and cloud synchronization.
          </p>
        </div>

        {/* Plan Switcher */}
        <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setCycle('monthly')}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              cycle === 'monthly'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly ($19/mo)
          </button>
          <button
            type="button"
            onClick={() => setCycle('lifetime')}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              cycle === 'lifetime'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lifetime ($149)
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Card Number
            </label>
            <input
              type="text"
              required
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4532 •••• •••• 8890"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {isProcessing
                ? "Processing Upgrade..."
                : !currentUser
                ? "Sign In & Upgrade"
                : `Pay ${cycle === 'monthly' ? '$19.00' : '$149.00'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
