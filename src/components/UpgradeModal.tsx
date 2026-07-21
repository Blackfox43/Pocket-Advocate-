import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  X,
  Loader2,
  Lock,
} from "lucide-react";

const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "https://pocket-advocate-backend.onrender.com";

export interface UpgradeModalProps {
  isOpen?: boolean;
  planName?: string;
  billingCycle?: "monthly" | "lifetime";
  cardName?: string;
  cardNumber?: string;
  authToken?: string | null;
  onUpgradeSuccess?: (user: any) => void;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen = false,
  planName = "Pro",
  billingCycle = "monthly",
  cardName = "",
  cardNumber = "",
  authToken = "",
  onUpgradeSuccess = () => {},
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "success">("form");

  // Reset state when modal visibility toggles
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setErrorMessage(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Safely parse last 4 digits
  const safeCardNumber = cardNumber || "";
  const lastFour = safeCardNumber.length >= 4 ? safeCardNumber.slice(-4) : "4242";

  const handleUpgrade = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken || ""}`,
        },
        body: JSON.stringify({
          plan: `${planName} (${billingCycle === "lifetime" ? "Lifetime" : "Monthly"})`,
          paymentDetails: {
            cardName: cardName || "Cardholder",
            lastFour: lastFour,
          },
        }),
      });

      const responseText = await response.text();
      let data: any = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error("Received an invalid response format from the server.");
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Server responded with status ${response.status}`);
      }

      onUpgradeSuccess(data.user);
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong during payment authorization.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={loading ? undefined : onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 p-6 shadow-2xl z-10 overflow-hidden"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {step === "form" ? "Upgrade Subscription" : "Subscription Confirmed"}
                </h3>
                <p className="text-xs text-slate-400">
                  {step === "form" ? "Review plan and billing details" : "Your workspace access has been updated"}
                </p>
              </div>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Form Step */}
          {step === "form" ? (
            <div className="space-y-4 pt-4">
              {/* Selected Plan Summary Badge */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                    Selected Tier
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{planName} Tier</h4>
                  <p className="text-xs text-slate-400">
                    {billingCycle === "lifetime" ? "Lifetime Unlimited Access" : "Billed Monthly • Cancel Anytime"}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase font-mono">
                  {billingCycle}
                </span>
              </div>

              {/* Payment Card Summary */}
              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    Payment Method
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <Lock className="w-3 h-3" />
                    256-Bit SSL Encrypted
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                    {cardName || "Default Cardholder"}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    •••• •••• •••• {lastFour}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Confirm & Authorize
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Success Step */
            <div className="space-y-5 pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Upgrade Successful!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your account tier has been successfully upgraded to{" "}
                  <strong className="text-white">{planName}</strong>. All workspace limits have been updated.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                Return to Workspace
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UpgradeModal;
