import React, { useState } from 'react';
import { UserProfile, UserSavedDocument, SavedSession } from '../types';

export interface AuthProfileProps {
  currentUser: UserProfile | null;
  authToken: string | null;
  savedDocuments: UserSavedDocument[];
  savedSessions?: SavedSession[];
  onLoginSuccess: (user: UserProfile, token: string) => void;
  onLogout: () => void;
  onUpdateProfileSuccess: (user: UserProfile) => void;
  onLoadSavedDocument: (doc: UserSavedDocument) => void;
  onDeleteDocument: (docId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade: () => void;
}

export const AuthProfile: React.FC<AuthProfileProps> = ({
  currentUser,
  authToken,
  savedDocuments,
  savedSessions = [],
  onLoginSuccess,
  onLogout,
  onUpdateProfileSuccess,
  onLoadSavedDocument,
  onDeleteDocument,
  isOpen,
  onClose,
  onOpenUpgrade,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simulated server Auth token generation
      await new Promise((res) => setTimeout(res, 800));
      
      const mockUser: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        name: name || email.split('@')[0],
        tier: 'free',
      };
      
      const mockToken = 'jwt_' + Math.random().toString(36).substring(2);
      onLoginSuccess(mockUser, mockToken);
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {currentUser ? (
          /* Logged In Profile & Saved Workspace */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{currentUser.name || "User Profile"}</h2>
                <p className="text-sm text-slate-400">{currentUser.email}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                  {currentUser.tier || 'Free'} Tier
                </span>
                {currentUser.tier === 'free' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUpgrade();
                    }}
                    className="block text-xs text-amber-400 hover:underline mt-1"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>

            {/* Saved Documents Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Saved Documents ({savedDocuments.length})
              </h3>
              {savedDocuments.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-800 rounded-lg">
                  No saved documents found in your library.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {savedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
                    >
                      <div className="truncate mr-3">
                        <p className="text-xs font-semibold text-slate-200 truncate">{doc.title}</p>
                        <p className="text-[10px] text-slate-500">{doc.category} • {doc.createdAt}</p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => {
                            onLoadSavedDocument(doc);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="px-2 py-1 text-xs bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Modal (Login / Sign Up) */
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              {isSignUp
                ? "Sign up to sync your documents across device sessions."
                : "Sign in to access your saved workspace items."}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Smith"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 text-sm"
              >
                {isLoading ? "Authenticating..." : isSignUp ? "Sign Up" : "Sign In"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
              >
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
