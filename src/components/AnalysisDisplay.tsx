import { useState, useEffect, useRef } from "react";
import { AnalysisResult, UserProfile } from "../types";
import { 
  AlertTriangle, 
  Check, 
  Copy, 
  ShieldAlert, 
  Scale, 
  HeartHandshake, 
  Gavel, 
  ChevronDown, 
  ChevronUp,
  FileWarning,
  Volume2,
  VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import DisputeLetterBuilder from "./DisputeLetterBuilder";
import RehearsalCoach from "./RehearsalCoach";
import { Language, translations } from "../lib/translations";

const GLOSSARY_DICTIONARY: Record<string, string> = {
  "security deposit": "A refundable sum of money paid to a landlord before moving in to cover potential damages beyond normal wear and tear.",
  "wear and tear": "Reasonable decline in the condition of a property or asset due to normal, everyday usage. Landlords cannot legally charge you to repair or replace this.",
  "constructive eviction": "When a landlord fails to maintain basic living conditions (like heat or water), making the apartment unliveable and forcing you to move out.",
  "warranty of habitability": "A legal guarantee that your rental home is safe, sanitary, and fit for human habitation, including functioning plumbing, heat, and locks.",
  "implied warranty": "An automatic, unwritten legal guarantee that comes with certain agreements (like a safe home) even if not stated in the lease.",
  "habitability": "The basic standard of physical safety, cleanliness, and security required for a home to be legally fit to live in.",
  "flsa": "Fair Labor Standards Act - The federal US law establishing minimum wage, overtime pay eligibility, and recordkeeping standards.",
  "fair labor standards act": "The federal US law establishing minimum wage, overtime pay eligibility, and recordkeeping standards.",
  "bad faith": "When an insurance company intentionally denies, delays, or underpays a legitimate claim without a reasonable or honest justification.",
  "overtime": "Extra pay required (minimum 1.5x regular pay) for hours worked beyond 40 hours in a single workweek.",
  "retaliatory eviction": "An illegal attempt by a landlord to evict or penalize a tenant simply because the tenant complained about repairs or reported code violations.",
  "addendum": "An additional document attached to an existing contract (like a lease) that adds, removes, or modifies specific terms.",
  "liquidated damages": "A set amount of money specified in a contract to be paid if one party breaks a specific agreement.",
  "whistleblower": "An employee who reports illegal activity or safety violations committed by their employer to authorities, protected legally from retaliation.",
  "comp time": "Compensatory time off given instead of cash overtime pay. This is generally illegal for non-exempt private-sector employees."
};

function renderTextWithGlossary(text: string) {
  if (!text) return "";

  const sortedKeys = Object.keys(GLOSSARY_DICTIONARY).sort((a, b) => b.length - a.length);
  const escapedKeys = sortedKeys.map(key => key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedKeys.join('|')})\\b`, 'gi');

  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    const lowerPart = part.toLowerCase();
    const definition = GLOSSARY_DICTIONARY[lowerPart];

    if (definition) {
      return (
        <span key={index} className="relative group inline cursor-help border-b border-dashed border-indigo-400 text-indigo-300 hover:text-indigo-200 transition-colors">
          {part}
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-slate-900 border border-slate-850 text-slate-200 text-xs leading-normal shadow-2xl opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-250 z-50 normal-case font-normal text-left">
            <span className="font-mono text-[9px] text-indigo-400 font-bold block mb-1 uppercase tracking-wider">
              Legal Glossary definition
            </span>
            {definition}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-850 -z-10 translate-y-[1px]" />
          </span>
        </span>
      );
    }

    return part;
  });
}

interface AnalysisDisplayProps {
  result: AnalysisResult;
  opponentName: string;
  currentUser?: UserProfile | null;
  onSaveLetter?: (letterText: string) => void;
  onPreviewLetter?: (letterText: string) => void;
  language?: Language;
}

type ToneTab = "firm" | "legal" | "polite";

export default function AnalysisDisplay({ 
  result, 
  opponentName, 
  currentUser, 
  onSaveLetter,
  onPreviewLetter,
  language = "en"
}: AnalysisDisplayProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<ToneTab>("firm");
  const [copied, setCopied] = useState(false);
  const [expandedViolations, setExpandedViolations] = useState<Record<number, boolean>>({});

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSupported(true);
      
      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        // Filter primarily for English or system default
        const englishVoices = allVoices.filter(v => v.lang.toLowerCase().includes("en"));
        const availableVoices = englishVoices.length > 0 ? englishVoices : allVoices;
        setVoices(availableVoices);

        if (availableVoices.length > 0) {
          // Choose a default (prefer natural or standard English voices if available)
          const preferred = availableVoices.find(v => 
            v.name.includes("Natural") || 
            v.name.includes("Google US English") || 
            v.name.includes("Zira") || 
            v.name.includes("David")
          ) || availableVoices[0];
          setSelectedVoiceName(preferred.name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cancel speech when tab or result changes to avoid overlapping sounds
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeTab, result]);

  const handleSpeak = () => {
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = activeReply.text;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Apply voice
    if (selectedVoiceName) {
      const selectedVoice = voices.find(v => v.name === selectedVoiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Adapt rates and pitches according to tone archetype
    if (activeTab === "firm") {
      utterance.rate = 0.85; // Slow, unyielding, powerful delivery
      utterance.pitch = 0.95; // Deeper authority
    } else if (activeTab === "legal") {
      utterance.rate = 0.95; // Standard, professional, legal precision
      utterance.pitch = 1.0;
    } else {
      utterance.rate = 1.05; // Brighter, cooperative, friendly speed
      utterance.pitch = 1.08; // Higher pitch
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleViolation = (index: number) => {
    setExpandedViolations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getRiskStyles = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return {
          bg: "bg-red-500/10 border-red-500/20",
          text: "text-red-400",
          badge: "bg-red-500 text-slate-950",
          label: `${t.riskLevel}: ${t.riskHigh}`
        };
      case "medium":
        return {
          bg: "bg-amber-500/10 border-amber-500/20",
          text: "text-amber-400",
          badge: "bg-amber-500 text-slate-950",
          label: `${t.riskLevel}: ${t.riskMedium}`
        };
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20",
          text: "text-emerald-400",
          badge: "bg-emerald-500 text-slate-950",
          label: `${t.riskLevel}: ${t.riskLow}`
        };
    }
  };

  const risk = getRiskStyles(result.riskLevel);
  const activeReply = result.replies[activeTab];

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Card */}
      <div className={`p-5 rounded-2xl border ${risk.bg} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 ${risk.text}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded ${risk.badge}`}>
                {risk.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Category: {result.negotiationType.toUpperCase()}
              </span>
            </div>
            
            <p className="text-sm font-medium text-white mt-1.5 leading-relaxed">
              {renderTextWithGlossary(result.summary)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Detected Shady Terms / Pressure Tactics */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <FileWarning className="w-4.5 h-4.5 text-amber-500" />
          {t.violationsTitle}
        </h3>

        {result.violations.length === 0 ? (
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 text-center text-xs text-slate-400">
            {t.violationsEmpty}
          </div>
        ) : (
          <div className="space-y-3">
            {result.violations.map((violation, i) => {
              const isExpanded = !!expandedViolations[i];
              return (
                <div 
                  key={i} 
                  className="rounded-xl border border-slate-800/80 bg-slate-950/40 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleViolation(i)}
                    className="w-full text-left p-4 flex items-start justify-between gap-4 hover:bg-slate-900/40 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mt-0.5 font-mono">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 italic">
                          "{violation.term}"
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {violation.explanation}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800/60 bg-slate-900/20 px-4 pb-4 pt-3 text-xs"
                      >
                        <div className="space-y-3 pl-8">
                          <div>
                            <span className="font-mono text-[10px] text-amber-400 block mb-1">
                              WHY THIS IS SHADY
                            </span>
                            <p className="text-slate-300 leading-relaxed">
                              {renderTextWithGlossary(violation.explanation)}
                            </p>
                          </div>
                          
                          <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-2">
                            <Scale className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-mono text-[10px] text-indigo-300 block mb-0.5">
                                PROTECTIVE REFERENCE / REGULATION
                              </span>
                              <p className="text-slate-300 font-sans leading-relaxed">
                                {renderTextWithGlossary(violation.legalReference)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Whisper Reply Whisper Hub */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm relative overflow-hidden">
        {/* Subtle accent backdrop */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Gavel className="w-4.5 h-4.5 text-indigo-400" />
              {t.responseArmorTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {language === "en" ? "Select a tone based on your verbal negotiation style." : 
               language === "es" ? "Seleccione un tono según su estilo de negociación." :
               language === "zh" ? "根据您的沟通风格选择话术语气。" :
               "Chọn một tông giọng phù hợp với phong cách đàm phán của bạn."}
            </p>
          </div>

          {/* Tone Selector Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(["firm", "legal", "polite"] as ToneTab[]).map((tone) => (
              <button
                key={tone}
                onClick={() => setActiveTab(tone)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                  activeTab === tone
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tone === "firm" ? (language === "en" ? "Firm" : language === "es" ? "Firme" : language === "zh" ? "强硬" : "Cứng Rắn") :
                 tone === "legal" ? (language === "en" ? "Legal" : language === "es" ? "Legal" : language === "zh" ? "法律" : "Pháp Lý") :
                 (language === "en" ? "Polite" : language === "es" ? "Cortés" : language === "zh" ? "礼貌" : "Lịch Sự")}
              </button>
            ))}
          </div>
        </div>

        {/* Reply Body Content */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800/60">
            <span className="text-[10px] font-mono tracking-wider text-indigo-400 font-medium flex items-center gap-1 shrink-0">
              {activeTab === "firm" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              {activeTab === "legal" && <Scale className="w-3.5 h-3.5 text-indigo-400" />}
              {activeTab === "polite" && <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />}
              {language === "en" ? `ACTIVE ADVOCATE PREVIEW (${activeTab.toUpperCase()})` :
               language === "es" ? `PREVIZUALIZACIÓN DE DEFENSA ACTIVA (${activeTab.toUpperCase()})` :
               language === "zh" ? `口袋法律卫士话术预览 (${activeTab.toUpperCase()})` :
               `XEM TRƯỚC PHƯƠNG ÁN ĐỐI PHÓ (${activeTab.toUpperCase()})`}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {/* Text-to-Speech (TTS) Engine Controls */}
              {speechSupported && (
                <div className="flex items-center gap-1.5">
                  {voices.length > 0 && (
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => setSelectedVoiceName(e.target.value)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-300 text-[10px] rounded-lg px-2 py-1 outline-none max-w-[140px] truncate transition-colors cursor-pointer"
                      title="Select Voice"
                    >
                      {voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          🗣️ {voice.name.replace("Microsoft", "").replace("Google", "").replace("Desktop", "").trim()}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={handleSpeak}
                    className={`flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1 border transition-all duration-250 ${
                      isSpeaking
                        ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                        : "bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
                    }`}
                    title={isSpeaking ? "Stop Speaking" : "Speak Reply Template"}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        <span>{t.stopText}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{t.speakText}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={() => handleCopy(activeReply.text)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1 transition-all duration-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.copiedText}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyText}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-sm text-slate-200 italic font-medium leading-relaxed font-sans bg-slate-900/30 p-4 rounded-lg border border-slate-900 mb-4">
            "{activeReply.text}"
          </div>

          <div className="text-xs">
            <span className="font-mono text-[10px] text-slate-400 block mb-1">
              {t.rationaleLabel.toUpperCase()}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {renderTextWithGlossary(activeReply.rationale)}
            </p>
          </div>

          {/* Dedicated copy-to-clipboard button */}
          <div className="mt-5 pt-4 border-t border-slate-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 font-sans">
              Press to copy the full <strong className="text-indigo-400 font-semibold capitalize">{activeTab}</strong> response for emails, messages, or text threads.
            </span>
            <button
              onClick={() => handleCopy(activeReply.text)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-200" />
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rehearsal Practice Arena Component */}
      <RehearsalCoach selectedReplyText={activeReply.text} tone={activeTab} />

      {/* Formal Dispute Letter Generator Component */}
      <DisputeLetterBuilder
        category={result.negotiationType}
        opponentName={opponentName}
        selectedReplyText={activeReply.text}
        tone={activeTab}
        currentUser={currentUser}
        onSaveLetter={onSaveLetter}
        onPreviewLetter={onPreviewLetter}
      />
    </div>
  );
}
