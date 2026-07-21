import React, { useState, useEffect } from "react";
import { 
  User, Lock, Mail, FileText, Check, AlertCircle, LogOut, Loader2, Save, MapPin, Phone, Trash2, ArrowRight, ShieldCheck, Bookmark, Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, UserSavedDocument, AnalysisResult, SavedSession } from "../types";
import { jsPDF } from "jspdf";

interface AuthProfileProps {
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
  onOpenUpgrade?: () => void;
}

const escapeCSV = (val: string): string => {
  if (!val) return '""';
  const escaped = val.replace(/"/g, '""');
  return `"${escaped}"`;
};

const exportToCSV = (items: (UserSavedDocument | SavedSession)[], filename: string) => {
  const headers = [
    "ID",
    "Timestamp",
    "Title",
    "Category",
    "Opponent Name",
    "Risk Level",
    "Summary",
    "Violations",
    "Firm Reply",
    "Legal Reply",
    "Polite Reply",
    "Letter Content"
  ];

  const rows = items.map(item => {
    const res = item.result;
    const violationsStr = res?.violations?.map(v => `[${v.term}]: ${v.explanation} (${v.legalReference})`).join("\n") || "";
    const letter = 'letterContent' in item ? (item.letterContent || "") : "";
    
    return [
      item.id,
      new Date(item.timestamp).toLocaleString(),
      item.title,
      item.category,
      item.opponentName,
      res?.riskLevel || "",
      res?.summary || "",
      violationsStr,
      res?.replies?.firm?.text || "",
      res?.replies?.legal?.text || "",
      res?.replies?.polite?.text || "",
      letter
    ].map(escapeCSV).join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generatePDF = (items: (UserSavedDocument | SavedSession)[], filename: string, isPremium = false) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("AI POCKET ADVOCATE - DISPUTE ANALYSIS REPORT", margin, y);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, y, { align: "right" });
    
    doc.setFont("helvetica", "bold");
    if (isPremium) {
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text("★ VERIFIED PREMIUM LEGAL SHIELD ACTIVE", margin, y + 4.5);
    } else {
      doc.setTextColor(120, 113, 108); // stone-500
      doc.text("⚡ FREE STARTER EVALUATION (UPGRADE FOR COMPLIANCE SEALS)", margin, y + 4.5);
    }

    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.2);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);
    y += 12;
  };

  const addText = (text: string, size: number, style = "normal", color = [15, 23, 42], spacing = 4, indent = 0) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    const textHeight = lines.length * (size * 0.35) * 1.3;
    
    checkPageBreak(textHeight);
    doc.text(lines, margin + indent, y);
    y += textHeight + spacing;
  };

  const addDivider = (color = [203, 213, 225], thickness = 0.2, spacing = 5) => {
    checkPageBreak(thickness + spacing);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(thickness);
    doc.line(margin, y, pageWidth - margin, y);
    y += spacing;
  };

  drawPageHeader();

  items.forEach((item, index) => {
    if (index > 0) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }

    addText(item.title.toUpperCase(), 15, "bold", [15, 23, 42], 2);
    addText(`Category: ${item.category.toUpperCase()}  |  Opponent: ${item.opponentName}`, 10, "bold", [67, 56, 202], 3);
    addText(`Generated on: ${new Date(item.timestamp).toLocaleString()}`, 8.5, "normal", [100, 116, 139], 4);
    
    addDivider([67, 56, 202], 0.5, 5);

    const res = item.result;
    if (res) {
      const isHigh = res.riskLevel === "high";
      const isMedium = res.riskLevel === "medium";
      const riskColor = isHigh ? [220, 38, 38] : isMedium ? [217, 119, 6] : [5, 150, 105];
      const riskText = `RISK AUDIT: ${res.riskLevel.toUpperCase()}`;
      
      checkPageBreak(12);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 1, contentWidth, 8, "F");
      
      doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.rect(margin, y - 1, 1.5, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
      doc.text(riskText, margin + 4, y + 4.5);
      y += 11;

      addText("EXECUTIVE SUMMARY", 11, "bold", [15, 23, 42], 2);
      addText(res.summary, 9.5, "normal", [51, 65, 85], 5);

      addText("FLAGGED DEMANDS & RIGHTS AUDIT", 11, "bold", [15, 23, 42], 2.5);
      if (!res.violations || res.violations.length === 0) {
        addText("No severe rights violations or predatory terms detected.", 9.5, "italic", [100, 116, 139], 5);
      } else {
        res.violations.forEach((v, i) => {
          addText(`${i + 1}. FLAGGED TERM: "${v.term}"`, 9.5, "bold", [220, 38, 38], 1.5, 3);
          addText(`EXPLANATION: ${v.explanation}`, 9, "normal", [51, 65, 85], 1.5, 6);
          addText(`LEGAL AUTHORITY: ${v.legalReference}`, 9, "bold", [67, 56, 202], 3.5, 6);
        });
      }
  
      addDivider();

      addText("STRATEGIC VERBAL REPLY PLAYS", 11, "bold", [15, 23, 42], 3);
      
      if (res.replies) {
        if (res.replies.firm) {
          addText("FIRM & BOUNDARY-FOCUSED", 9.5, "bold", [15, 23, 42], 1.5, 3);
          addText(`"${res.replies.firm.text}"`, 9, "normal", [51, 65, 85], 1.5, 6);
          addText(`RATIONALE: ${res.replies.firm.rationale}`, 8, "italic", [100, 116, 139], 4, 6);
        }
        if (res.replies.legal) {
          addText("STATUTE-BASED LEGAL ARGUMENT", 9.5, "bold", [15, 23, 42], 1.5, 3);
          addText(`"${res.replies.legal.text}"`, 9, "normal", [51, 65, 85], 1.5, 6);
          addText(`RATIONALE: ${res.replies.legal.rationale}`, 8, "italic", [100, 116, 139], 4, 6);
        }
        if (res.replies.polite) {
          addText("POLITE & DE-ESCALATING STYLE", 9.5, "bold", [15, 23, 42], 1.5, 3);
          addText(`"${res.replies.polite.text}"`, 9, "normal", [51, 65, 85], 1.5, 6);
          addText(`RATIONALE: ${res.replies.polite.rationale}`, 8, "italic", [100, 116, 139], 4, 6);
        }
      }
    }

    const letter = 'letterContent' in item ? (item.letterContent || "") : "";
    if (letter) {
      addDivider();
      addText("CERTIFIED DISPUTE / DE-ESCALATION NOTICE", 11, "bold", [15, 23, 42], 3);
      addText(letter, 9, "normal", [51, 65, 85], 5, 4);
    }

    // Add visual watermark or premium call-to-action block in PDF
    if (isPremium) {
      addDivider([16, 185, 129], 0.4, 6);
      addText("★ CERTIFIED DISPUTE RECORD - VERIFIED PREMIUM MEMBER PROTECTION", 8.5, "bold", [5, 150, 105], 2);
      addText("This document was formatted and audited using official compliance models. Registered tracking seals and class-level compliance metrics are permanently active on this file.", 8, "normal", [71, 85, 105], 2);
    } else {
      addDivider([239, 68, 68], 0.4, 6);
      addText("⚠ UNOFFICIAL TRIAL TRIAL REPORT (MAILING LETTERHEAD STAMPS LOCKED)", 8.5, "bold", [220, 38, 38], 2);
      addText("To unlock certified formal letterhead seals, postal tracking numbers, and unlimited multi-turn AI consultation playbooks, upgrade to Premium Pro at AI Pocket Advocate.", 8, "normal", [100, 116, 139], 2);
    }
  });

  doc.save(filename);
};

// Define global API Base URL resolution outside component
const API_BASE = "https://pocket-advocate-backend.onrender.com";

export default function AuthProfile({
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
  onOpenUpgrade
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

  const handleExportSingleCSV = (doc: UserSavedDocument | SavedSession) => {
    const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    exportToCSV([doc], `dispute_${safeTitle}.csv`);
  };

  const handleExportSinglePDF = (doc: UserSavedDocument | SavedSession) => {
    const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    generatePDF([doc], `dispute_${safeTitle}.pdf`, currentUser?.isPremium === true);
  };

  const handleExportAllCSV = () => {
    if (savedDocuments.length === 0) return;
    exportToCSV(savedDocuments, `all_saved_disputes_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportAllPDF = () => {
    if (savedDocuments.length === 0) return;
    generatePDF(savedDocuments, `all_saved_disputes_${new Date().toISOString().split('T')[0]}.pdf`, currentUser?.isPremium === true);
  };

  const handleExportSessionsCSV = () => {
    if (!savedSessions || savedSessions.length === 0) return;
    exportToCSV(savedSessions, `local_dispute_sessions_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportSessionsPDF = () => {
    if (!savedSessions || savedSessions.length === 0) return;
    generatePDF(savedSessions, `local_dispute_sessions_${new Date().toISOString().split('T')[0]}.pdf`, currentUser?.isPremium === true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const url = `${API_BASE}${endpoint}`;
    
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
      const response = await fetch(`${API_BASE}/api/profile`, {
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

                  {savedSessions && savedSessions.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                        <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          Local Workspace Data ({savedSessions.length})
                        </h4>
                        <div className="flex gap-1.5">
                          <button
                            onClick={handleExportSessionsCSV}
                            className="text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded cursor-pointer transition"
                          >
                            CSV
                          </button>
                          <button
                            onClick={handleExportSessionsPDF}
                            className="text-[10px] bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded cursor-pointer transition"
                          >
                            PDF
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        You have {savedSessions.length} active consultation sessions in your temporary local browser cache. Export them to secure your files, or sign in to synchronize.
                      </p>
                    </div>
                  )}
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
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">{currentUser.email}</span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              currentUser.isPremium 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                : "bg-slate-850 text-slate-400 border border-slate-800"
                            }`}>
                              {currentUser.isPremium ? (currentUser.plan || "Premium Pro") : "Free Starter"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!currentUser.isPremium && onOpenUpgrade && (
                          <button
                            onClick={onOpenUpgrade}
                            className="text-[9px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 shadow shadow-indigo-600/15"
                          >
                            ✨ Upgrade
                          </button>
                        )}
                        <button
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                          className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2.5 py-1 rounded transition"
                        >
                          {isEditingProfile ? "Cancel" : "Edit Info"}
                        </button>
                      </div>
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
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                        My Saved Documents ({savedDocuments.length})
                      </h4>
                      {savedDocuments.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleExportAllCSV}
                            className="text-[10px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded cursor-pointer transition flex items-center gap-1"
                            title="Export all documents as CSV"
                          >
                            CSV
                          </button>
                          <button
                            onClick={handleExportAllPDF}
                            className="text-[10px] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded cursor-pointer transition flex items-center gap-1"
                            title="Export all documents as PDF"
                          >
                            PDF
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
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
                              
                              <div className="flex items-center gap-2.5 mt-2.5 pt-1.5 border-t border-slate-900/60">
                                <button
                                  onClick={() => {
                                    onLoadSavedDocument(doc);
                                    onClose();
                                  }}
                                  className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                                >
                                  View Details
                                </button>
                                <span className="text-slate-800 text-[10px]">•</span>
                                <button
                                  onClick={() => handleExportSingleCSV(doc)}
                                  className="text-[10px] font-mono text-slate-500 hover:text-white cursor-pointer"
                                  title="Export this document as CSV"
                                >
                                  CSV
                                </button>
                                <span className="text-slate-800 text-[10px]">•</span>
                                <button
                                  onClick={() => handleExportSinglePDF(doc)}
                                  className="text-[10px] font-mono text-slate-500 hover:text-indigo-400 cursor-pointer"
                                  title="Export this document as PDF"
                                >
                                  PDF
                                </button>
                              </div>
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

                  {/* Local Workspace Sessions Section (when logged in) */}
                  {savedSessions && savedSessions.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-850">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          Local Sessions ({savedSessions.length})
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={handleExportSessionsCSV}
                            className="text-[10px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition"
                            title="Export all local sessions as CSV"
                          >
                            CSV
                          </button>
                          <button
                            onClick={handleExportSessionsPDF}
                            className="text-[10px] bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition"
                            title="Export all local sessions as PDF"
                          >
                            PDF
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {savedSessions.map((session) => (
                          <div
                            key={session.id}
                            className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {session.category}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {new Date(session.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <h5 className="text-[11px] font-bold text-white mt-1 truncate">
                                {session.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                Opponent: {session.opponentName}
                              </p>
                              <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-900/40">
                                <button
                                  onClick={() => handleExportSingleCSV(session)}
                                  className="text-[9px] font-mono text-slate-400 hover:text-white cursor-pointer"
                                  title="Export session as CSV"
                                >
                                  CSV
                                </button>
                                <span className="text-slate-800 text-[10px]">•</span>
                                <button
                                  onClick={() => handleExportSinglePDF(session)}
                                  className="text-[9px] font-mono text-slate-400 hover:text-emerald-400 cursor-pointer"
                                  title="Export session as PDF"
                                >
                                  PDF
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
