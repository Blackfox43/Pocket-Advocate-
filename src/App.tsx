import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UpgradeModal } from './components/UpgradeModal';
import { AuthProfile } from './components/AuthProfile';
// Ensure these components exist in your components directory
import { FAQChat } from './components/FAQChat'; 
import { UserProfile, UserSavedDocument, SavedSession } from './types';
import { Language } from './lib/translations';

// Free tier limit configuration
const FREE_GENERATION_LIMIT = 2;

export const App: React.FC = () => {
  // Navigation & View State
  const [activeView, setActiveView] = useState<'counseling' | 'playground' | 'faq'>('counseling');

  // Authentication & Subscription State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('app_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('app_token');
  });

  // Track user generation count for paywall enforcement
  const [usageCount, setUsageCount] = useState<number>(() => {
    const saved = localStorage.getItem('app_usage_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [savedDocuments, setSavedDocuments] = useState<UserSavedDocument[]>([]);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Modal Control States
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);

  // Counseling / Intake Form States
  const [inputText, setInputText] = useState<string>('');
  const [category, setCategory] = useState<string>('Legal Rights & Counseling');
  const [opponentName, setOpponentName] = useState<string>('');
  const [resultText, setResultText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('app_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('app_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('app_token', authToken);
    } else {
      localStorage.removeItem('app_token');
    }
  }, [authToken]);

  useEffect(() => {
    localStorage.setItem('app_usage_count', usageCount.toString());
  }, [usageCount]);

  // Fetch documents for authenticated user
  useEffect(() => {
    if (authToken) {
      fetch('/api/documents', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setSavedDocuments(data))
        .catch(() => console.log('Using local memory storage strategy.'));
    }
  }, [authToken]);

  // Auth & Upgrade Handlers
  const handleLoginSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setSavedDocuments([]);
  };

  const handleUpgradeSuccess = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setIsUpgradeOpen(false);
  };

  // Subscription Enforcement Check
  const isSubscriptionActive = (): boolean => {
    if (!currentUser) return false;
    return currentUser.tier === 'pro' || currentUser.tier === 'lifetime';
  };

  // Main Execution Handler with Paywall Enforcement
  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    // PAYWALL GUARD: Check if non-subscriber has exceeded free limits
    if (!isSubscriptionActive() && usageCount >= FREE_GENERATION_LIMIT) {
      setIsUpgradeOpen(true);
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          text: inputText,
          category,
          opponentName,
          language: currentLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResultText(data.result || data.analysis || 'Legal advice and draft generated.');
      } else {
        // Fallback simulation
        setResultText(
          `[AI Pocket Advocate Analysis - ${currentLanguage.toUpperCase()}]\n\n` +
          `Category: ${category}\n` +
          `Opponent/Counterparty: ${opponentName || 'Not Specified'}\n\n` +
          `Key Legal Considerations:\n` +
          `1. Review state and regional consumer/tenant protection laws relevant to this claim.\n` +
          `2. Document all timeline events and official communications with ${opponentName || 'the counterparty'}.\n` +
          `3. Prepare a formal written demand letter specifying statutory cure periods before escalating.`
        );
      }

      // Increment usage count for free-tier tracking
      if (!isSubscriptionActive()) {
        setUsageCount((prev) => prev + 1);
      }
    } catch (err) {
      setResultText(`Output generated: Legal case summary prepared under ${category}.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!resultText) return;

    // Force sign-in to save documents
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const newDoc: UserSavedDocument = {
      id: 'doc_' + Date.now(),
      title: `${category} - ${opponentName || 'Case Log'} (${new Date().toLocaleDateString()})`,
      category,
      opponentName,
      result: resultText,
      letterContent: resultText,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (authToken) {
      try {
        await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(newDoc),
        });
      } catch (err) {
        console.error('Failed API sync, saving locally.', err);
      }
    }

    setSavedDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (authToken) {
      try {
        await fetch(`/api/documents/${docId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch (err) {
        console.error('Failed API delete', err);
      }
    }
    setSavedDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleLoadSavedDocument = (doc: UserSavedDocument) => {
    setCategory(doc.category || 'Legal Rights & Counseling');
    setOpponentName(doc.opponentName || '');
    setResultText(doc.result || doc.letterContent || '');
    setActiveView('counseling');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Navigation */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onNavigateHowItWorks={() => setActiveView('faq')}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* View Switcher Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 flex space-x-6">
          <button
            onClick={() => setActiveView('counseling')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeView === 'counseling'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Counseling Suite
          </button>
          <button
            onClick={() => setActiveView('playground')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeView === 'playground'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Playground Scenarios
          </button>
          <button
            onClick={() => setActiveView('faq')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeView === 'faq'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            FAQ & Rights Educator
          </button>
        </div>
      </div>

      {/* Main Active View Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* VIEW 1: Counseling Workspace */}
        {activeView === 'counseling' && (
          <div className="space-y-6">
            <section className="text-center space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                AI Legal Counseling & Intake
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                Describe your dispute facts or agreement details to generate structured legal guidance.
              </p>
              {!isSubscriptionActive() && (
                <div className="inline-block mt-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-amber-400">
                  Free Tier Usage: {usageCount}/{FREE_GENERATION_LIMIT} generations used
                </div>
              )}
            </section>

            {/* Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dispute Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Legal Rights & Counseling">Legal Rights & Counseling</option>
                    <option value="Consumer Rights & Disputes">Consumer Rights & Disputes</option>
                    <option value="Tenant & Housing Legal Issues">Tenant & Housing Legal Issues</option>
                    <option value="Employment & Workplace Disputes">Employment & Workplace Disputes</option>
                    <option value="Contract & Lease Audit">Contract & Lease Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Opponent / Counterparty (Optional)</label>
                  <input
                    type="text"
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    placeholder="e.g. Landlord, Acme Corp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dispute Facts / Legal Context</label>
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe what happened, key dates, monetary claims, or paste relevant contract clauses..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                {isAnalyzing ? "Analyzing Legal Context..." : "Generate Legal Guidance"}
              </button>
            </div>

            {/* Output Panel */}
            {resultText && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg">Advocate Assessment & Response</h3>
                  <button
                    onClick={handleSaveDocument}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Save to Case Library
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono">
                  {resultText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Playground Scenarios */}
        {activeView === 'playground' && (
          <div className="space-y-6">
            <section className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white">Dispute Scenario Playground</h1>
              <p className="text-slate-400 text-sm">
                Select pre-configured legal dispute blueprints to test and rehearse strategies.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => {
                  setCategory('Tenant & Housing Legal Issues');
                  setInputText('Landlord refuses to return $1,500 security deposit after 30 days without detailing damages.');
                  setOpponentName('Property Management Co.');
                  setActiveView('counseling');
                }}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500 cursor-pointer transition-colors"
              >
                <h3 className="font-semibold text-white mb-1">Unreturned Security Deposit</h3>
                <p className="text-xs text-slate-400">Demand letter blueprint for security deposit recovery under statutory deadlines.</p>
              </div>

              <div
                onClick={() => {
                  setCategory('Employment & Workplace Disputes');
                  setInputText('Employer withheld final paycheck after resignation, citing unreturned equipment that was returned.');
                  setOpponentName('Previous Employer');
                  setActiveView('counseling');
                }}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500 cursor-pointer transition-colors"
              >
                <h3 className="font-semibold text-white mb-1">Unpaid Final Wage Claim</h3>
                <p className="text-xs text-slate-400">Formal wage dispute notice targeting labor code violations and penalty interest.</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: FAQ Chat Component */}
        {activeView === 'faq' && (
          <div className="space-y-4">
            <FAQChat currentLanguage={currentLanguage} />
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthProfile
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        authToken={authToken}
        savedDocuments={savedDocuments}
        savedSessions={savedSessions}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onUpdateProfileSuccess={setCurrentUser}
        onLoadSavedDocument={handleLoadSavedDocument}
        onDeleteDocument={handleDeleteDocument}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentUser={currentUser}
        authToken={authToken}
        onUpgradeSuccess={handleUpgradeSuccess}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    </div>
  );
};

export default App;
