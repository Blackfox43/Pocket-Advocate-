import React, { useState } from "react";
import { X, Check, ShieldCheck, CreditCard, Sparkles, Star, Lock, RefreshCw, AlertCircle, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  authToken: string | null;
  onUpgradeSuccess: (updatedUser: UserProfile) => void;
  onOpenAuth: () => void;
}

type BillingCycle = "monthly" | "lifetime";

export default function UpgradeModal({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onUpgradeSuccess,
  onOpenAuth
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "enterprise">("pro");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("lifetime");
  const [step, setStep] = useState<"plans" | "payment" | "success">("plans");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Payment form states
  const [cardName, setCardName] = useState(currentUser?.name || "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardFocused, setCardFocused] = useState(false); // flip effect

  if (!isOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.substring(0, 16);
    // Format card number with spaces every 4 digits
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formattedValue);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.substring(0, 4);
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }
    setCardExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.substring(0, 3);
    setCardCvv(value);
  };

  const planName = selectedPlan === "pro" ? "Premium Pro Advocate" : "Enterprise Legal Shield";
  const planPrice = selectedPlan === "pro" 
    ? (billingCycle === "lifetime" ? "$29.00" : "$9.99")
    : (billingCycle === "lifetime" ? "$149.00" : "$49.99");
  
  const planDurationLabel = billingCycle === "lifetime" ? "one-time payment" : "/ month";

  const handleProcessUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !authToken) {
      setErrorMessage("Please sign in or create an account before upgrading.");
      return;
    }

    if (!cardName || cardNumber.replace(/\s/g, "").length < 15 || cardExpiry.length < 5 || cardCvv.length < 3) {
      setErrorMessage("Please fill out all payment details with valid test credentials.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/profile/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          plan: `${planName} (${billingCycle === "lifetime" ? "Lifetime" : "Monthly"})`,
          paymentDetails: { cardName, lastFour: cardNumber.slice(-4) }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      onUpgradeSuccess(data.user);
      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong during payment authorization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Premium Benefits / Visual Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/20">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">AI Pocket Advocate</span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
              Level the playing field with Premium Legal Armour
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Unlock professional-grade dispute frameworks, unlimited consultations, and certified-mail print letterheads.
            </p>

            {/* List of features */}
            <div className="mt-8 space-y-4">
              <div className="flex gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Premium Formal Letterheads</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Generate, print, and save high-fidelity PDF letters styled with certified registered-mail stamp layouts.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Guided Intake Wizard</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Let our interactive prompt flow structure your complex tenant, employee, or policyholder disputes step-by-step.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Unlimited Multi-turn AI Q&A</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Continuous deep consultations without daily limits or credit-based blocks on high-fidelity AI models.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">No Watermarks or Subheaders</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Clean, formal document structure ready to deliver to landlords, adjusters, corporate HR, or service bureaus.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-indigo-900/40 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-slate-400 font-mono">100% Risk-Free. Cancel or modify anytime.</span>
          </div>
        </div>

        {/* Right Side: Checkout and Action Panel */}
        <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[70vh] md:max-h-full">
          {/* Dismiss button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer z-15"
          >
            <X className="w-5 h-5" />
          </button>

          <AnimatePresence mode="wait">
            {step === "plans" && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                        Choose Your Plan
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Select a budget-friendly layout customized for your dispute volume.</p>
                    </div>
                    {/* Billing Cycle Switcher */}
                    <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-850 text-[10px] font-mono">
                      <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-2.5 py-1 rounded-md transition ${billingCycle === "monthly" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingCycle("lifetime")}
                        className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${billingCycle === "lifetime" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
                      >
                        Lifetime
                        <span className="bg-emerald-500/15 text-emerald-400 text-[8px] font-bold px-1 rounded uppercase">Best</span>
                      </button>
                    </div>
                  </div>

                  {/* Plans Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {/* Plan 1: Pro Advocate */}
                    <div 
                      onClick={() => setSelectedPlan("pro")}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between h-44 ${
                        selectedPlan === "pro" 
                          ? "bg-slate-950/60 border-indigo-500/90 shadow-lg shadow-indigo-500/5" 
                          : "bg-slate-950/20 border-slate-850 hover:border-slate-800"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" /> Pro Advocate
                          </span>
                          {selectedPlan === "pro" && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">Designed for single cases, active claims, and tenants requiring high-leverage printable notices.</p>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1 mt-3">
                          <span className="text-xl font-bold text-white">{billingCycle === "lifetime" ? "$29" : "$9.99"}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{billingCycle === "lifetime" ? "once" : "/ mo"}</span>
                        </div>
                        <p className="text-[8px] text-indigo-400 font-mono uppercase tracking-wider mt-1">Unlock Instant Letterhead & Guided Intake</p>
                      </div>
                    </div>

                    {/* Plan 2: Enterprise Legal Shield */}
                    <div 
                      onClick={() => setSelectedPlan("enterprise")}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between h-44 ${
                        selectedPlan === "enterprise" 
                          ? "bg-slate-950/60 border-indigo-500/90 shadow-lg shadow-indigo-500/5" 
                          : "bg-slate-950/20 border-slate-850 hover:border-slate-800"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <Bookmark className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" /> Shield Shield
                          </span>
                          {selectedPlan === "enterprise" && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">For small businesses, legal advocates, or policyholder portfolios handling multiple dispute files.</p>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1 mt-3">
                          <span className="text-xl font-bold text-white">{billingCycle === "lifetime" ? "$149" : "$49.99"}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{billingCycle === "lifetime" ? "once" : "/ mo"}</span>
                        </div>
                        <p className="text-[8px] text-indigo-400 font-mono uppercase tracking-wider mt-1 font-bold">Includes Multi-user & API Sync</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 mt-6 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Selected Tier</span>
                      <span className="font-semibold text-white">{planName}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Schedule Billing</span>
                      <span className="font-semibold text-white">{billingCycle === "lifetime" ? "Lifetime Unlimited License" : "Monthly Auto-renew"}</span>
                    </div>
                    <div className="border-t border-slate-900 my-2 pt-2 flex justify-between font-bold text-white">
                      <span>Total Due Today</span>
                      <span className="text-indigo-400 font-mono">{planPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-900 mt-6 flex flex-col sm:flex-row gap-3">
                  {!currentUser ? (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAuth();
                      }}
                      className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 text-center cursor-pointer shadow-lg shadow-indigo-600/15"
                    >
                      Sign In / Register to Upgrade
                    </button>
                  ) : (
                    <button
                      onClick={() => setStep("payment")}
                      className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 text-center cursor-pointer shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2"
                    >
                      Proceed to Secure Billing <Lock className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <button 
                    onClick={() => setStep("plans")}
                    className="text-[10px] font-mono text-indigo-400 hover:text-white mb-2 inline-flex items-center gap-1 cursor-pointer"
                  >
                    &larr; BACK TO PLANS
                  </button>
                  <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                    Secure Payment Terminal
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This is a secure simulation with test credentials. No actual funds will be charged.
                  </p>
                </div>

                {/* Simulated Credit Card Graphic */}
                <div className="relative w-full h-36 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-900 text-white p-5 overflow-hidden flex flex-col justify-between shadow-xl">
                  {/* Subtle watermarks */}
                  <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
                  <div className="absolute top-2 right-4 text-[9px] font-mono uppercase text-indigo-300 font-bold tracking-widest">
                    AI Advocate Secure
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="w-10 h-7 rounded bg-amber-500/30 border border-amber-500/20" />
                    <CreditCard className="w-6 h-6 text-indigo-200" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm font-mono tracking-widest block h-5">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </span>
                    <div className="flex justify-between items-end">
                      <div className="max-w-[70%]">
                        <span className="text-[8px] uppercase tracking-wider text-indigo-300 block">Cardholder</span>
                        <span className="text-[10px] font-bold block truncate h-4 uppercase">
                          {cardName || "EMMA WATSON"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase tracking-wider text-indigo-300 block">Expiry</span>
                        <span className="text-[10px] font-bold font-mono block h-4">
                          {cardExpiry || "MM/YY"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Fields Form */}
                <form onSubmit={handleProcessUpgrade} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-2 text-red-400 text-xs items-start">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{errorMessage}</p>
                    </div>
                  )}

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="e.g. Emma Watson"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                        Credit Card Number
                      </label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4111 2222 3333 4444"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="12/28"
                          className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={handleCvvChange}
                          placeholder="•••"
                          className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-900 flex gap-2 justify-end">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setStep("plans")}
                      className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 rounded-xl text-xs transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:opacity-80 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Authorizing...
                        </>
                      ) : (
                        <>
                          Pay {planPrice} & Upgrade
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 py-8 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-2">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Upgrade Successful!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Welcome to <span className="text-indigo-400 font-bold">{planName}</span>! All premium limits, PDF exports, and registered letterheads are now fully unlocked on your account.
                  </p>
                </div>

                <div className="w-full p-4 rounded-xl bg-slate-950/40 border border-slate-850 text-left text-[11px] space-y-1 text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Account Tier</span>
                    <span className="text-emerald-400 font-bold">PREMIUM PRO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>License Type</span>
                    <span className="text-white">{billingCycle === "lifetime" ? "Lifetime License" : "Monthly Recurrent"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authorized Amount</span>
                    <span className="text-white font-bold">{planPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <span className="text-emerald-400 font-bold uppercase">APPROVED</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  Return to Dashboard &bull; Access Premium
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
