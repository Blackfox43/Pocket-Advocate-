import { useState, useEffect } from "react";
import { 
  Shield, 
  Scale, 
  MessageSquareText, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Lock, 
  ArrowRight,
  Landmark,
  UserCheck,
  Bookmark,
  ClipboardCheck,
  MessageSquareCode,
  BookOpen,
  FileCheck2,
  Mic,
  Stamp,
  Gavel,
  MessageSquare,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import Header from "./components/Header";
import AudioRecorder from "./components/AudioRecorder";
import ScenarioSelector from "./components/ScenarioSelector";
import AnalysisDisplay from "./components/AnalysisDisplay";
import SessionHistory from "./components/SessionHistory";
import RightsLibrary from "./components/RightsLibrary";
import AuthProfile from "./components/AuthProfile";
import IntakeWizard from "./components/IntakeWizard";
import FAQChat from "./components/FAQChat";
import FormalPrintPreview from "./components/FormalPrintPreview";
import UpgradeModal from "./components/UpgradeModal";
import RehearsalCoach from "./components/RehearsalCoach";
import CertifiedLetterheadStudio from "./components/CertifiedLetterheadStudio";
import MockCourtSimulator from "./components/MockCourtSimulator";
import HowItWorks from "./components/HowItWorks";

import { PRESET_SCENARIOS } from "./data/presets";
import { SavedSession, AnalysisResult, PresetScenario, UserProfile, UserSavedDocument } from "./types";
import { Language, translations } from "./lib/translations";

export default function App() {
  const [activeView, setActiveView] = useState<"counseling" | "playground" | "faq" | "library" | "rehearsal" | "letterhead" | "arbitrator" | "howitworks">("counseling");
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  const [rehearsalScript, setRehearsalScript] = useState("Under state housing codes, landlord entry requires 24 hours written notice. Please provide a formal request in writing before attempting to schedule an inspection.");
  const [rehearsalTone, setRehearsalTone] = useState("firm");
  const [activeInputTab, setActiveInputTab] = useState<"voice" | "text" | "intake">("voice");
  const [textInput, setTextInput] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [category, setCategory] = useState<"landlord" | "employer" | "insurance" | "general">("landlord");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>(undefined);

  // Print Preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLetterText, setPreviewLetterText] = useState("");

  // Authentication & Profile states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [savedDocuments, setSavedDocuments] = useState<UserSavedDocument[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Load history & session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pocket_advocate_sessions");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
        // Load the most recent session by default if available
        if (parsed.length > 0) {
          setActiveResult(parsed[0].result);
          setOpponentName(parsed[0].opponentName);
          setCategory(parsed[0].category);
          setCurrentSessionId(parsed[0].id);
        }
      }

      const storedUser = localStorage.getItem("pocket_advocate_user");
      const storedToken = localStorage.getItem("pocket_advocate_token");
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setAuthToken(storedToken);
        fetchSavedDocuments(storedToken);
      }
    } catch (e) {
      console.error("Failed to load historical sessions:", e);
    }
  }, []);

  const fetchSavedDocuments = async (token: string) => {
    try {
      const response = await fetch("/api/documents", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedDocuments(data);
      }
    } catch (e) {
      console.error("Failed to fetch saved documents:", e);
    }
  };

  const handleLoginSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem("pocket_advocate_user", JSON.stringify(user));
    localStorage.setItem("pocket_advocate_token", token);
    fetchSavedDocuments(token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setSavedDocuments([]);
    localStorage.removeItem("pocket_advocate_user");
    localStorage.removeItem("pocket_advocate_token");
  };

  const handleUpdateProfileSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem("pocket_advocate_user", JSON.stringify(user));
  };

  const handleSaveDocumentToProfile = async (title: string, letterContent?: string) => {
    if (!activeResult) return;
    if (!authToken) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title,
          category,
          opponentName: opponentName || "Opposing Party",
          result: activeResult,
          letterContent
        })
      });

      if (response.ok) {
        const savedDoc = await response.json();
        setSavedDocuments([savedDoc, ...savedDocuments]);
        alert("Document successfully saved to your Profile Dashboard!");
      } else {
        const err = await response.json();
        alert(`Failed to save: ${err.error || "Unknown error"}`);
      }
    } catch (e) {
      alert("Failed to save document to your profile.");
    }
  };

  const handleDeleteSavedDocument = async (docId: string) => {
    if (!authToken) return;
    if (!window.confirm("Are you sure you want to delete this saved document?")) return;

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setSavedDocuments(savedDocuments.filter(d => d.id !== docId));
      }
    } catch (e) {
      console.error("Failed to delete document:", e);
    }
  };

  const handleLoadSavedDocument = (doc: UserSavedDocument) => {
    setActiveResult(doc.result);
    setOpponentName(doc.opponentName);
    setCategory(doc.category);
    setTextInput(doc.result.transcript);
  };

  // Save history to localStorage on change
  const saveSessions = (updated: SavedSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem("pocket_advocate_sessions", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save sessions to localStorage:", e);
    }
  };

  // Select a preset to test immediately
  const handleSelectPreset = (preset: PresetScenario) => {
    setSelectedPresetId(preset.id);
    setTextInput(preset.text);
    setOpponentName(preset.opponentName);
    setCategory(preset.category);
    setActiveInputTab("text");
    
    // Automatically trigger analysis for seamless demo interaction!
    handleAnalyze(preset.text, preset.opponentName, preset.category, preset.id);
  };

  // Perform Gemini full-stack rights analysis
  const handleAnalyze = async (
    inputText: string, 
    oppName: string, 
    cat: "landlord" | "employer" | "insurance" | "general",
    presetId?: string
  ) => {
    setIsProcessing(true);
    setError(null);

    const targetOpponentName = oppName.trim() || "Opposing Party";

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          category: cat,
          language
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed. Please check server logs.");
      }

      const result: AnalysisResult = await response.json();
      
      // Save session in local history
      const newSession: SavedSession = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        title: presetId 
          ? PRESET_SCENARIOS.find(p => p.id === presetId)?.title || `Dispute with ${targetOpponentName}`
          : `Dispute with ${targetOpponentName}`,
        category: cat,
        opponentName: targetOpponentName,
        result,
      };

      const updatedSessions = [newSession, ...sessions];
      saveSessions(updatedSessions);
      setActiveResult(result);
      setCurrentSessionId(newSession.id);

    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "Something went wrong while consulting the AI Advocate.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle recorded audio ready payload
  const handleAudioReady = async (base64Data: string, mimeType: string) => {
    setIsProcessing(true);
    setError(null);
    const targetOpponentName = opponentName.trim() || "Verbal Opponent";

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: {
            data: base64Data,
            mimeType,
          },
          category,
          language
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Audio analysis failed.");
      }

      const result: AnalysisResult = await response.json();

      const newSession: SavedSession = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        title: `Verbal Recording with ${targetOpponentName}`,
        category,
        opponentName: targetOpponentName,
        result,
      };

      const updatedSessions = [newSession, ...sessions];
      saveSessions(updatedSessions);
      setActiveResult(result);
      setCurrentSessionId(newSession.id);
      
      // Synchronize text input display with transcribed result for confirmation
      setTextInput(result.transcript);

    } catch (err: any) {
      console.error("Audio Analysis Error:", err);
      setError(err.message || "Failed to process audio or retrieve transcription analysis.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore/view historical session
  const handleSelectSession = (session: SavedSession) => {
    setActiveResult(session.result);
    setOpponentName(session.opponentName);
    setCategory(session.category);
    setTextInput(session.result.transcript);
    setCurrentSessionId(session.id);
    setSelectedPresetId(undefined);
  };

  // Delete historical session
  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    saveSessions(updated);
    
    if (currentSessionId === id) {
      if (updated.length > 0) {
        handleSelectSession(updated[0]);
      } else {
        setActiveResult(null);
        setCurrentSessionId(null);
        setTextInput("");
        setOpponentName("");
      }
    }
  };

  // Clear all sessions
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to permanently clear all saved advocate consultations?")) {
      saveSessions([]);
      setActiveResult(null);
      setCurrentSessionId(null);
      setTextInput("");
      setOpponentName("");
    }
  };

  // Start fresh consultation
  const handleStartFresh = () => {
    setActiveResult(null);
    setCurrentSessionId(null);
    setTextInput("");
    setOpponentName("");
    setSelectedPresetId(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Premium Header Component */}
      <Header 
        currentUser={currentUser} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        onLogout={handleLogout} 
        onOpenUpgrade={() => setIsUpgradeOpen(true)} 
        onNavigateHowItWorks={() => setActiveView("howitworks")}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      {/* Top-level Sub-navigation Tab bar */}
      <div className="bg-slate-900/40 border-b border-slate-900 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveView("howitworks")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeView === "howitworks"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              {t.howItWorks}
            </button>
            <button
              onClick={() => setActiveView("counseling")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeView === "counseling"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              {t.counselingSuite}
            </button>
            <button
              onClick={() => setActiveView("playground")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeView === "playground"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              {t.playground}
            </button>
            <button
              onClick={() => setActiveView("faq")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeView === "faq"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
              {t.aiChat}
            </button>
            <button
              onClick={() => setActiveView("library")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeView === "library"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              {t.rightsLibrary}
            </button>
            <button
              onClick={() => setActiveView("rehearsal")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                activeView === "rehearsal"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              {t.rehearsalCoach}
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 border-l border-slate-900 pl-4">
            <button
              onClick={() => setActiveView("letterhead")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer relative ${
                activeView === "letterhead"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <Stamp className="w-3.5 h-3.5 text-amber-400" />
              {t.letterhead}
              {!currentUser?.isPremium && (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView("arbitrator")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer relative ${
                activeView === "arbitrator"
                  ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              <Gavel className="w-3.5 h-3.5 text-amber-400" />
              {t.mockArbitrator}
              {!currentUser?.isPremium && (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <AnimatePresence mode="wait">
        {activeView === "howitworks" && (
          <motion.main 
            key="howitworks-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8"
          >
            <HowItWorks onNavigateToView={(view) => setActiveView(view)} />
          </motion.main>
        )}

        {activeView === "counseling" && (
          <motion.main 
            key="counseling-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            {/* Left Column: Input Channels (Mic, Copier) & Presets */}
            <section className="lg:col-span-5 space-y-6">
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm shadow-xl space-y-5">
                
                {/* Input toggle tabs */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-full sm:w-auto">
                    <button
                      onClick={() => setActiveInputTab("intake")}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
                        activeInputTab === "intake"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      Guided Intake
                    </button>
                    <button
                      onClick={() => setActiveInputTab("voice")}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
                        activeInputTab === "voice"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Record Voice
                    </button>
                    <button
                      onClick={() => {
                        setActiveInputTab("text");
                        setSelectedPresetId(undefined);
                      }}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
                        activeInputTab === "text"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Text Copier
                    </button>
                  </div>

                  {activeResult && (
                    <button
                      onClick={handleStartFresh}
                      className="text-[10px] font-mono text-indigo-400 hover:text-white flex items-center gap-1 bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/15 cursor-pointer ml-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      NEW CONSULT
                    </button>
                  )}
                </div>

                {/* Context Inputs: Category Selector & Opponent Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                      Dispute Category
                    </label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 outline-none transition-all duration-150"
                    >
                      <option value="landlord">Tenant vs. Landlord</option>
                      <option value="employer">Employee vs. Boss</option>
                      <option value="insurance">Policyholder vs. Insurance</option>
                      <option value="general">General Dispute</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                      Opposing Representative Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Henderson (Landlord)"
                      value={opponentName}
                      onChange={(e) => setOpponentName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 placeholder:text-slate-600 outline-none transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Channel Display */}
                <div className="space-y-4">
                  {activeInputTab === "intake" ? (
                    /* 0. Guided Intake Wizard Channel */
                    <IntakeWizard 
                      category={category} 
                      onApplyIntakeText={(text) => {
                        setTextInput(text);
                        setActiveInputTab("text");
                      }} 
                    />
                  ) : activeInputTab === "voice" ? (
                    /* 1. Voice Record Channel */
                    <AudioRecorder 
                      onAudioReady={handleAudioReady} 
                      isProcessing={isProcessing} 
                    />
                  ) : (
                    /* 2. Manual Text Copier Console */
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5">
                          Copied Conversation / Verbal Statement
                        </label>
                        <textarea
                          placeholder="Paste verbal demands, phone summaries, or letters here to extract your legal rights and whispers reply templates..."
                          rows={5}
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 rounded-xl p-3.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none resize-none transition-all duration-150 leading-relaxed font-sans"
                        />
                      </div>

                      <button
                        onClick={() => handleAnalyze(textInput, opponentName, category, selectedPresetId)}
                        disabled={isProcessing || !textInput.trim()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] shadow-lg shadow-indigo-600/15 cursor-pointer"
                      >
                        {isProcessing ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin text-white" />
                            AI Advocate Counseling...
                          </>
                        ) : (
                          <>
                            <Scale className="w-4 h-4" />
                            Advocate Now
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </div>

              {/* Interactive AI FAQ Chatbot Companion (Small inline card) */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-white">Legal Companion FAQ Chat</h4>
                  </div>
                  <button 
                    onClick={() => setActiveView("faq")} 
                    className="text-[9px] font-mono text-indigo-400 hover:underline cursor-pointer"
                  >
                    Open Full Desk &rarr;
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Got quick questions about standard code parameters or rights? Tap below or open our dedicated FAQ Desk page.
                </p>
                <button
                  onClick={() => setActiveView("faq")}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                >
                  Ask AI Companion
                </button>
              </div>

              {/* Interactive Preset Simulator Playground (Small inline card) */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white">Interactive Scenario Library</h4>
                  </div>
                  <button 
                    onClick={() => setActiveView("playground")} 
                    className="text-[9px] font-mono text-indigo-400 hover:underline cursor-pointer"
                  >
                    Browse All &rarr;
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Want to practice or research pre-configured case study blueprints before your actual tribunal?
                </p>
                <button
                  onClick={() => setActiveView("playground")}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                >
                  Browse Scenario Presets
                </button>
              </div>
            </section>

            {/* Right Column: Active Advocate report & Secure Local History */}
            <section className="lg:col-span-7 space-y-6">
              <AnimatePresence mode="wait">
                {activeResult ? (
                  /* Active Advocate Consultation Report */
                  <motion.div
                    key="active-result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-display font-bold text-lg text-white">
                          {t.consultationTitle}
                        </h2>
                        <p className="text-xs text-slate-400">
                          {t.consultationSub}
                        </p>
                      </div>
                      
                      {currentUser ? (
                        <button
                          onClick={() => handleSaveDocumentToProfile(`Consultation with ${opponentName || "Opposing Party"} (${new Date().toLocaleDateString()})`)}
                          className="flex items-center gap-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-white font-semibold transition cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          {t.saveToProfile}
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsAuthOpen(true)}
                          className="flex items-center gap-1.5 text-[11px] bg-slate-900 border border-slate-800 hover:bg-slate-850 px-3 py-1.5 rounded-lg text-slate-300 font-semibold transition cursor-pointer"
                        >
                          <Lock className="w-3 h-3 text-slate-500" />
                          {t.signInToSave}
                        </button>
                      )}
                    </div>

                    <AnalysisDisplay 
                      result={activeResult} 
                      opponentName={opponentName || "Opposing Party"} 
                      currentUser={currentUser}
                      language={language}
                      onSaveLetter={(letterText) => handleSaveDocumentToProfile(`Notice to ${opponentName || "Opposing Party"} (${new Date().toLocaleDateString()})`, letterText)}
                      onPreviewLetter={(letterText) => {
                        if (!currentUser || !currentUser.isPremium) {
                          setPreviewLetterText(letterText);
                          setIsUpgradeOpen(true);
                        } else {
                          setPreviewLetterText(letterText);
                          setIsPreviewOpen(true);
                        }
                      }}
                    />
                  </motion.div>
                ) : (
                  /* Idle/Placeholder screen explaining features beautifully */
                  <motion.div
                    key="idle-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 rounded-2xl border border-slate-800/80 bg-slate-900/10 backdrop-blur-sm text-center max-w-xl mx-auto py-12 space-y-6"
                  >
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-xl shadow-indigo-950/20">
                      <Shield className="w-7 h-7" />
                    </div>

                    <div>
                      <h3 className="font-sans font-bold text-lg text-white">
                        {t.idleTitle}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                        {t.idleSubtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-xs text-slate-300 max-w-md mx-auto text-left pl-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold font-mono">
                          1
                        </span>
                        <p className="leading-relaxed">
                          {t.idleStep1}
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono">
                          2
                        </span>
                        <p className="leading-relaxed">
                          {t.idleStep2}
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold font-mono">
                          3
                        </span>
                        <p className="leading-relaxed">
                          {t.idleStep3}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-900 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5" />
                        {t.standardActs}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        {t.civicProtection}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Consultation History Dashboard */}
              <SessionHistory
                sessions={sessions}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onClearAll={handleClearAll}
                currentSessionId={currentSessionId || undefined}
              />
            </section>
          </motion.main>
        )}

        {activeView === "playground" && (
          <motion.main 
            key="playground-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6"
          >
            <div className="text-center max-w-xl mx-auto space-y-2 mb-4">
              <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Dispute Scenario Playground</h3>
              <p className="text-xs text-slate-400">
                Explore tenant, employee, and insurance policyholder protection tactics. Select a scenario blueprint and click to load it instantly into your Counseling workspace to run analysis.
              </p>
            </div>
            
            <ScenarioSelector 
              onSelect={(presetId) => {
                handleSelectPreset(presetId);
                setActiveView("counseling");
              }} 
              selectedId={selectedPresetId} 
            />
          </motion.main>
        )}

        {activeView === "faq" && (
          <motion.main 
            key="faq-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6"
          >
            <div className="text-center max-w-xl mx-auto space-y-2 mb-4">
              <div className="mx-auto w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Legal Companion FAQ Desk</h3>
              <p className="text-xs text-slate-400">
                Ask general regulatory questions about tenancy laws, Fair Labor Standards Act provisions, or insurance bad-faith protocols.
              </p>
            </div>
            
            <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-6">
              <FAQChat category={category} />
            </div>
          </motion.main>
        )}

        {activeView === "library" && (
          <motion.main 
            key="library-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6"
          >
            <div className="text-center max-w-xl mx-auto space-y-2 mb-4">
              <div className="mx-auto w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive Rights & Codes Library</h3>
              <p className="text-xs text-slate-400">
                Search federal regulations, state statutes, and standard civil defense frameworks directly.
              </p>
            </div>
            
            <RightsLibrary />
          </motion.main>
        )}

        {activeView === "rehearsal" && (
          <motion.main 
            key="rehearsal-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6"
          >
            <div className="text-center max-w-xl mx-auto space-y-2 mb-6">
              <div className="mx-auto w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Speech Rehearsal Studio</h3>
              <p className="text-xs text-slate-400">
                Speak clearly, test your pitch dynamics, and practice delivering assertive verbal templates correctly.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">1. Prepare Your Script</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Preset Template Tones</label>
                  <select
                    value={rehearsalTone}
                    onChange={(e) => {
                      setRehearsalTone(e.target.value);
                      if (activeResult) {
                        setRehearsalScript(activeResult.replies[e.target.value as "firm" | "legal" | "polite"]?.text || "");
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-200 outline-none transition"
                  >
                    <option value="firm">Firm & Boundary-focused</option>
                    <option value="legal">Legal & Statute-focused</option>
                    <option value="polite">Polite & De-escalating</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Load Script From</label>
                  <button
                    onClick={() => {
                      if (activeResult) {
                        setRehearsalScript(activeResult.replies[rehearsalTone as "firm" | "legal" | "polite"]?.text || "");
                      } else {
                        setRehearsalScript("Under state housing codes, landlord entry requires 24 hours written notice. Please provide a formal request in writing before attempting to schedule an inspection.");
                      }
                    }}
                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition font-semibold cursor-pointer"
                  >
                    {activeResult ? "⚡ Load Active Consult Replies" : "✍️ Load Practice Lease Template"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Script Text (Edit to customize)</label>
                <textarea
                  rows={4}
                  value={rehearsalScript}
                  onChange={(e) => setRehearsalScript(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none font-sans leading-relaxed"
                  placeholder="Enter custom response text to practice speaking..."
                />
              </div>
            </div>

            <RehearsalCoach selectedReplyText={rehearsalScript} tone={rehearsalTone} />
          </motion.main>
        )}

        {activeView === "letterhead" && (
          <motion.main 
            key="letterhead-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8"
          >
            <CertifiedLetterheadStudio
              currentUser={currentUser}
              authToken={authToken}
              savedDocuments={savedDocuments}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
              onPreviewLetter={(text) => {
                setPreviewLetterText(text);
                setIsPreviewOpen(true);
              }}
            />
          </motion.main>
        )}

        {activeView === "arbitrator" && (
          <motion.main 
            key="arbitrator-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8"
          >
            <MockCourtSimulator
              currentUser={currentUser}
              authToken={authToken}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
            />
          </motion.main>
        )}
      </AnimatePresence>

      {/* Slide-out User Profile & Dashboard Drawer */}
      <AuthProfile
        currentUser={currentUser}
        authToken={authToken}
        savedDocuments={savedDocuments}
        savedSessions={sessions}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onUpdateProfileSuccess={handleUpdateProfileSuccess}
        onLoadSavedDocument={handleLoadSavedDocument}
        onDeleteDocument={handleDeleteSavedDocument}
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {/* Premium Printable Notice Letterhead Preview Modal */}
      <FormalPrintPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        letterContent={previewLetterText}
        opponentName={opponentName}
      />

      {/* Interactive Monetization Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentUser={currentUser}
        authToken={authToken}
        onUpgradeSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
          localStorage.setItem("pocket_advocate_user", JSON.stringify(updatedUser));
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Footer legal guidelines & safety indicator */}
      <footer className="border-t border-slate-900 py-4 px-6 mt-12 bg-slate-950/40 text-center text-[10px] text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 AI Pocket Advocate. Defending everyday civilians from predatory legal terms.
          </span>
          <span className="font-mono text-[9px] text-slate-500/80 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            EDUCATIONAL GUIDANCE PLATFORM • NOT OFFICIAL ATTORNEY COUNSEL
          </span>
        </div>
      </footer>
    </div>
  );
}
