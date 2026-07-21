import React, { useState } from "react";

const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "https://pocket-advocate-backend.onrender.com";

interface UpgradeModalProps {
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

  // Do not render anything if the modal state is false
  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setErrorMessage(null);

    // Safely parse last 4 digits even if cardNumber is empty or undefined
    const safeCardNumber = cardNumber || "";
    const lastFour = safeCardNumber.length >= 4 ? safeCardNumber.slice(-4) : "4242";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        {step === "form" ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              Confirm Subscription Upgrade
            </h3>
            
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Upgrading to <strong>{planName || "Selected Plan"}</strong> ({billingCycle === "lifetime" ? "Lifetime Access" : "Monthly Billing"}).
            </p>

            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer"
              >
                {loading ? "Processing..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              Upgrade Successful!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your account tier has been updated to <strong>{planName}</strong>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeModal;
