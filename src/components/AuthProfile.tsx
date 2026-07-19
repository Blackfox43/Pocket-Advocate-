import React, { useState, useEffect } from "react";
import { 
  User, Lock, Mail, FileText, Check, AlertCircle, LogOut, Loader2, Save, MapPin, Phone, Trash2, ArrowRight, ShieldCheck, Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, UserSavedDocument, AnalysisResult } from "../types";

interface AuthProfileProps {
  currentUser: UserProfile | null;
  authToken: string | null;
  savedDocuments: UserSavedDocument[];
  onLoginSuccess: (user: UserProfile, token: string) => void;
  onLogout: () => void;
  onUpdateProfileSuccess: (user: UserProfile) => void;
  onLoadSavedDocument: (doc: UserSavedDocument) => void;
  onDeleteDocument: (docId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthProfile({
  currentUser,
  authToken,
  savedDocuments,
  onLoginSuccess,
  onLogout,
  onUpdateProfileSuccess,
  onLoadSavedDocument,
  onDeleteDocument,
  isOpen,
  onClose
}: AuthProfileProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditAddress(currentUser.address);
      setEditPhone(currentUser.phone || "");
    }
  }, [currentUser]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const body = isRegistering 
      ? { email, password, name, address }
      : { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      onLoginSuccess(data.user, data.token);
      setSuccessMsg(isRegistering ? "Registration successful! Welcome." : "Welcome back!");
      setTimeout(() => setSuccessMsg(null), 3000);
      
      // Clear forms
      setEmail("");
      setPassword("");
      setName("");
      setAddress("");
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: editName,
          address: editAddress,
          phone: editPhone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      onUpdateProfileSuccess(data);
      setIsEditingProfile(false);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm">
          {/* Backdrop dismiss */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Sliding panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  {currentUser ? "User Profile & Dashboard" : "Sign In to AI Advocate"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-950 border border-slate-850 hover:border-slate-800 transition"
              >
                Close Panel
              </button>
            </div>

            {/* Error or Success notification banner */}
            {error && (
              <div className="p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2 text-xs text-emerald-400">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Main content body */}
            {!currentUser ? (
              /* Signed-out flow: Register / Login */
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-5 text-center bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Create an account to securely save documents, manage multiple custom disputes, and customize your mailing address on formal de-escalation notice letters.
                    </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {isRegistering && (
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder="Emma Watson"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    {isRegistering && (
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Your Mailing Address (For Notice Letters)</label>
                        <input
                          type="text"
                          placeholder="e.g., 123 Main Street, Apt 4B, Boston MA"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/10 mt-6"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          {isRegistering ? "Create Free Account" : "Access Account"}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="mt-8 border-t border-slate-850 pt-4 text-center">
                  <button
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setError(null);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {isRegistering 
                      ? "Already have an account? Sign In here" 
                      : "New user? Register a free profile here"}
                  </button>
                </div>
              </div>
            ) : (
              /* Signed-in flow: View Profile, Edit Profile, List Saved Docs */
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* User Profile Card */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-indigo-600/15 flex items-center justify-center border border-indigo-500/25">
                          <span className="text-xs font-bold text-indigo-400">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">{currentUser.name}</h3>
                          <p className="text-[10px] text-slate-500 font-mono">{currentUser.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2.5 py-1 rounded transition"
                      >
                        {isEditingProfile ? "Cancel" : "Edit Info"}
                      </button>
                    </div>

                    {isEditingProfile ? (
                      <form onSubmit={handleUpdateProfileSubmit} className="space-y-3 pt-2 border-t border-slate-900">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-0.5">Your Name</label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-0.5">Mailing Address</label>
                          <input
                            type="text"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase mb-0.5">Phone Number</label>
                          <input
                            type="text"
                            placeholder="Optional"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition mt-2"
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Changes
                        </button>
                      </form>
                    ) : (
                      <div className="pt-2 border-t border-slate-900 text-xs text-slate-400 space-y-2.5">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase font-mono block">Mailing Address</span>
                            <span className="text-slate-300 font-sans">{currentUser.address || "No address added"}</span>
                          </div>
                        </div>
                        {currentUser.phone && (
                          <div className="flex items-start gap-2">
                            <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Phone Number</span>
                              <span className="text-slate-300 font-sans">{currentUser.phone}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Saved Documents Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                        My Saved Documents ({savedDocuments.length})
                      </h4>
                    </div>

                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {savedDocuments.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                          No saved documents yet. Perform a consult and press "Save to Profile" to store it securely here.
                        </div>
                      ) : (
                        savedDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-750 transition flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  {doc.category}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {new Date(doc.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-white mt-1.5 truncate">
                                {doc.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                Opponent: {doc.opponentName}
                              </p>
                              
                              <button
                                onClick={() => {
                                  onLoadSavedDocument(doc);
                                  onClose();
                                }}
                                className="mt-2 text-[10px] font-mono text-indigo-400 hover:text-white flex items-center gap-1"
                              >
                                View Report & Notice
                              </button>
                            </div>

                            <button
                              onClick={() => onDeleteDocument(doc.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition shrink-0"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-850 pt-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Session: {currentUser.id}
                  </span>
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
