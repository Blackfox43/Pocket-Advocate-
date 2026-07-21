import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogOut,
  Mail,
  Lock,
  X,
  FileText,
  Trash2,
  ArrowRight,
  Download,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Search
} from 'lucide-react';

export interface SavedDocument {
  id: string;
  title: string;
  category: string;
  opponentName: string;
  timestamp: string | number | Date;
  content?: string;
  result?: {
    riskLevel?: 'high' | 'medium' | 'low';
    summary?: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

export interface AuthProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  isAuthenticated: boolean;
  savedDocuments: SavedDocument[];
  onLogin: (credentials: { email: string; password?: string }) => void;
  onSignUp: (data: { name: string; email: string; password?: string }) => void;
  onLogout: () => void;
  onLoadSavedDocument: (doc: SavedDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onExportAllCSV?: () => void;
}

export const AuthProfile: React.FC<AuthProfileProps> = ({
  isOpen,
  onClose,
  user,
  isAuthenticated,
  savedDocuments = [],
  onLogin,
  onSignUp,
  onLogout,
  onLoadSavedDocument,
  onDeleteDocument,
  onExportAllCSV
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onSignUp({ name, email, password });
    } else {
      onLogin({ email, password });
    }
  };

  const handleExportSingleCSV = (doc: SavedDocument) => {
    const csvRows = [
      ['ID', 'Title', 'Category', 'Opponent', 'Risk Level', 'Date'],
      [
        `"${doc.id}"`,
        `"${doc.title.replace(/"/g, '""')}"`,
        `"${doc.category}"`,
        `"${doc.opponentName.replace(/"/g, '""')}"`,
        `"${doc.result?.riskLevel || 'N/A'}"`,
        `"${new Date(doc.timestamp).toLocaleDateString()}"`
      ]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${doc.title.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSinglePDF = (doc: SavedDocument) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.title} - Export</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; }
              .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
              .title { font-size: 22px; font-weight: bold; margin: 0 0 8px 0; color: #0f172a; }
              .meta { font-size: 13px; color: #64748b; display: flex; gap: 16px; align-items: center; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
              .high { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
              .medium { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
              .low { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
              .section { margin-top: 20px; }
              .section-title { font-size: 14px; font-weight: bold; color: #334155; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
              .content-box { font-family: monospace; font-size: 12px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; word-break: break-word; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">${doc.title}</h1>
              <div class="meta">
                <span>Category: <strong>${doc.category}</strong></span>
                <span>Opponent: <strong>${doc.opponentName}</strong></span>
                <span>Date: <strong>${new Date(doc.timestamp).toLocaleDateString()}</strong></span>
                ${doc.result?.riskLevel ? `<span class="badge ${doc.result.riskLevel}">${doc.result.riskLevel} risk</span>` : ''}
              </div>
            </div>
            <div class="section">
              <div class="section-title">Document Summary / Record</div>
              <div class="content-box">${doc.content || doc.result?.summary || 'No raw body content recorded for this entry.'}</div>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredDocs = savedDocuments.filter(
    doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.opponentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        />

        {/* Sliding Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAuthenticated ? 'Account Workspace' : isSignUp ? 'Create Account' : 'Sign In'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAuthenticated
                      ? 'Manage saved documents & preferences'
                      : 'Access your cloud documents & sync workspace'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              {!isAuthenticated ? (
                /* Authentication Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white rounded-xl py-2.5 pl-9 pr-3 text-xs placeholder:text-slate-600 outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white rounded-xl py-2.5 pl-9 pr-3 text-xs placeholder:text-slate-600 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white rounded-xl py-2.5 pl-9 pr-3 text-xs placeholder:text-slate-600 outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer mt-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    {isSignUp ? 'Register Account' : 'Authenticate Workspace'}
                  </button>

                  <div className="pt-3 text-center border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-xs text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                    >
                      {isSignUp
                        ? 'Already have an account? Sign In'
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              ) : (
                /* User Profile & Saved Workspace Documents */
                <div className="space-y-6">
                  {/* Profile Card Header */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/20">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{user?.name || 'Authenticated User'}</h4>
                      <p className="text-xs text-slate-400 truncate">{user?.email || 'user@workspace.internal'}</p>
                      <div className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Active Session • Cloud Sync Engaged</span>
                      </div>
                    </div>
                  </div>

                  {/* Saved Documents Section Header */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Saved Records ({savedDocuments.length})
                        </h4>
                      </div>
                      {onExportAllCSV && savedDocuments.length > 0 && (
                        <button
                          onClick={onExportAllCSV}
                          className="text-[10px] font-bold text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          Export All (CSV)
                        </button>
                      )}
                    </div>

                    {/* Filter Input */}
                    {savedDocuments.length > 0 && (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search saved files, opponents, categories..."
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 text-white rounded-xl py-2 pl-8 pr-3 text-[11px] placeholder:text-slate-600 outline-none transition"
                        />
                      </div>
                    )}

                    {/* Documents List */}
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredDocs.length === 0 ? (
                        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/30">
                          <Sparkles className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                          <p className="text-xs font-medium text-slate-400">
                            {searchQuery ? 'No records match your query' : 'No saved documents found'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {searchQuery ? 'Try adjusting your search criteria' : 'Generated reports and drafts will appear here.'}
                          </p>
                        </div>
                      ) : (
                        filteredDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex items-start justify-between gap-3 group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-slate-900 border border-slate-800 text-slate-400">
                                  {doc.category}
                                </span>
                                {doc.result?.riskLevel && (
                                  <span
                                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                      doc.result.riskLevel === 'high'
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : doc.result.riskLevel === 'medium'
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    }`}
                                  >
                                    {doc.result.riskLevel} risk
                                  </span>
                                )}
                              </div>
                              <h5 className="text-xs font-bold text-white truncate mt-1">{doc.title}</h5>
                              <p className="text-[10px] text-slate-400 truncate">
                                vs. {doc.opponentName} • {new Date(doc.timestamp).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Item Action Controls */}
                            <div className="flex items-center gap-1 shrink-0 mt-0.5">
                              <button
                                onClick={() => onLoadSavedDocument(doc)}
                                className="p-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                                title="Load into active workspace"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleExportSingleCSV(doc)}
                                className="px-1.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[9px] font-mono transition cursor-pointer"
                                title="Export CSV"
                              >
                                CSV
                              </button>
                              <button
                                onClick={() => handleExportSinglePDF(doc)}
                                className="px-1.5 py-1 rounded bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 text-[9px] font-mono transition cursor-pointer"
                                title="Export PDF"
                              >
                                PDF
                              </button>
                              <button
                                onClick={() => onDeleteDocument(doc.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer"
                                title="Delete Document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Footer & Sign Out */}
            {isAuthenticated && (
              <div className="p-6 border-t border-slate-800 bg-slate-900/50 shrink-0">
                <button
                  onClick={onLogout}
                  className="w-full bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default AuthProfile;
