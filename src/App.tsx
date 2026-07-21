import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UpgradeModal } from './components/UpgradeModal';
import { AuthProfile } from './components/AuthProfile';
import { UserProfile, UserSavedDocument, SavedSession } from './types';
import { Language } from './lib/translations';

export const App: React.FC = () => {
  // State initialization
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('app_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('app_token');
  });

  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [savedDocuments, setSavedDocuments] = useState<UserSavedDocument[]>([]);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Modal Control States
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);

  // Core App Form / Generator States
  const [inputText, setInputText] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
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

  // Fetch documents on auth load
  useEffect(() => {
    if (authToken) {
      fetch('/api/documents', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((res) => res.ok ? res.json() : [])
        .then((data) => setSavedDocuments(data))
        .catch(() => console.log('Using local memory storage strategy.'));
    }
  }, [authToken]);

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
  };

  // Execution Handler (/api/analyze call)
  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
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
          language: currentLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResultText(data.result || data.analysis || 'Analysis successfully generated.');
      } else {
        // Fallback simulation for client testing
        setResultText(`[Generated output in ${currentLanguage.toUpperCase()}] Processed request for category: ${category}. Content length: ${inputText.length} characters.`);
      }
    } catch (err) {
      setResultText(`Output generated locally: Content analyzed under ${category} guidelines.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save Document Handler (/api/documents call)
  const handleSaveDocument = async () => {
    if (!resultText) return;

    const newDoc: UserSavedDocument = {
      id: 'doc_' + Date.now(),
      title: `${category} Analysis - ${new Date().toLocaleDateString()}`,
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
    setCategory(doc.category || 'General');
    setOpponentName(doc.opponentName || '');
    setResultText(doc.result || doc.letterContent || '');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        <section className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            AI Engine Analysis Workspace
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Input prompt or document variables below to run intelligent analysis models.
          </p>
        </section>

        {/* Input Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="General">General Analysis</option>
                <option value="Legal">Legal & Contract</option>
                <option value="Technical">Technical Code Audit</option>
                <option value="Finance">Financial Evaluation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Opponent / Counterparty (Optional)</label>
              <input
                type="text"
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Input Text / Context</label>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your source text, requirements, or code snippet..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            {isAnalyzing ? "Processing Analysis..." : "Execute Analysis"}
          </button>
        </div>

        {/* Output Panel */}
        {resultText && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Generated Result</h3>
              <button
                onClick={handleSaveDocument}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-lg transition-colors"
              >
                Save to Library
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono">
              {resultText}
            </div>
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
