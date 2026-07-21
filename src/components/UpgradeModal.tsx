import React, { useState } from 'react';

// Fallback to your production Render URL if env variable isn't set
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pocket-advocate-backend.onrender.com';

interface UpgradeModalProps {
  planName: string;
  billingCycle: 'monthly' | 'lifetime';
  cardName: string;
  cardNumber: string;
  authToken: string;
  onUpgradeSuccess: (user: any) => void;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  planName,
  billingCycle,
  cardName,
  cardNumber,
  authToken,
  onUpgradeSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleUpgrade = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          plan: `${planName} (${billingCycle === 'lifetime' ? 'Lifetime' : 'Monthly'})`,
          paymentDetails: {
            cardName,
            lastFour: cardNumber.slice(-4),
          },
        }),
      });

      // Read raw text first to avoid crashing if response is HTML or empty
      const textData = await response.text();
      let data: any = {};

      if (textData) {
        try {
          data = JSON.parse(textData);
        } catch {
          throw new Error('Received an invalid non-JSON response from the server.');
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Server error: ${response.status}`);
      }

      onUpgradeSuccess(data.user);
      setStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong during payment processing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-container">
      {step === 'form' ? (
        <div>
          <h3>Confirm Upgrade</h3>
          {errorMessage && <p className="error-text" style={{ color: 'red' }}>{errorMessage}</p>}
          <button onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm & Pay'}
          </button>
          <button onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      ) : (
        <div>
          <h3>Upgrade Successful!</h3>
          <p>Your account status has been updated.</p>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};
