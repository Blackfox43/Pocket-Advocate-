import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Lock, 
  Sparkles, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Info, 
  ShieldCheck, 
  Stamp, 
  Award,
  ChevronDown,
  RefreshCw,
  FileCheck2,
  Trash2,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, UserSavedDocument } from "../types";

interface CertifiedLetterheadStudioProps {
  currentUser: UserProfile | null;
  authToken: string | null;
  savedDocuments: UserSavedDocument[];
  onOpenUpgrade: () => void;
  onPreviewLetter: (letterText: string) => void;
}

type TemplateType = "cease_and_desist" | "statutory_demand" | "settlement_offer" | "standard";
type FontStyle = "serif" | "sans" | "mono";

export default function CertifiedLetterheadStudio({
  currentUser,
  authToken,
  savedDocuments,
  onOpenUpgrade,
  onPreviewLetter
}: CertifiedLetterheadStudioProps) {
  const isPremium = currentUser?.isPremium === true;

  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [template, setTemplate] = useState<TemplateType>("cease_and_desist");
  const [font, setFont] = useState<FontStyle>("serif");
  const [userName, setUserName] = useState(currentUser?.name || "Emma Watson");
  const [userAddress, setUserAddress] = useState(currentUser?.address || "123 Main Street, Apt 4B");
  const [opponentName, setOpponentName] = useState("Henderson Property Management");
  const [opponentAddress, setOpponentAddress] = useState("456 Oak Lane, Suite 100\nSan Francisco, CA 94102");
  const [letterDate, setLetterDate] = useState(new Date().toLocaleDateString());
  const [customBody, setCustomBody] = useState("");
  const [customTitle, setCustomTitle] = useState("FORMAL DISPUTE NOTICE");
  const [copied, setCopied] = useState(false);
  const [trackingNumber] = useState(() => "REG-US-" + Math.floor(100000 + Math.random() * 900000) + "-SF");

  // Load from selected saved consultation document if they have any
  useEffect(() => {
    if (selectedDocId) {
      const doc = savedDocuments.find(d => d.id === selectedDocId);
      if (doc) {
        setOpponentName(doc.opponentName || "Opposing Representative");
        
        // Auto extract top recommended firm reply text to body
        if (doc.result?.replies?.firm?.text) {
          setCustomBody(doc.result.replies.firm.text);
        } else if (doc.result?.summary) {
          setCustomBody(doc.result.summary);
        }
        
        if (doc.category === "landlord") {
          setCustomTitle("STATUTORY NOTICE TO REMEDY TENANCY BREACH");
          setOpponentAddress("Henderson Property Management Office\n456 Oak Lane, Suite 100");
        } else if (doc.category === "employer") {
          setCustomTitle("FORMAL EXHAUSTION OF ADMINISTRATIVE REMEDIES & WAGE CLAIM");
          setOpponentAddress("Marcus Vance, General Manager\nApex Corp Headquarters");
        } else if (doc.category === "insurance") {
          setCustomTitle("NOTICE OF INTENT TO SUE FOR BAD FAITH DENIAL OF CLAIM");
          setOpponentAddress("Claims Compliance Department\nZenith Mutual Group HQ");
        } else {
          setCustomTitle("FORMAL NOTICE OF DISPUTE & RESOLUTION OFFER");
          setOpponentAddress(`${doc.opponentName}\nCompliance & Operations Dept.`);
        }
      }
    }
  }, [selectedDocId, savedDocuments]);

  // Set default body if none provided
  useEffect(() => {
    if (!customBody) {
      setCustomBody("I am writing to formally dispute the current demands regarding this outstanding matter. Specifically, under relevant regional codes and civilian protections, the current action constitutes an unfair and non-compliant policy.");
    }
  }, []);

  const getTemplateContent = () => {
    let opening = "";
    let closing = "";

    if (template === "cease_and_desist") {
      opening = `DEMAND TO CEASE AND DESIST REPETITIVE HARASSMENT & UNLAWFUL CLAIMS\n\nThis letter constitutes formal notice that your current demands and persistent communication actions are hereby disputed under civil code.`;
      closing = `Failure to cease and desist these non-compliant, retaliatory, or deceptive collection attempts within ten (10) calendar days will leave me with no alternative but to escalate this dispute directly to consumer protection watchdogs or formal state tribunals. Please govern your actions accordingly.`;
    } else if (template === "statutory_demand") {
      opening = `STATUTORY DEMAND FOR IMMEDIATE PERFORMANCE AND REMEDY\n\nThis constitutes a formal statutory notice and immediate demand for full compliance. I hereby invoke statutory protections governing standard billing, habitability, or employment terms.`;
      closing = `You have fifteen (15) business days to provide an itemized financial audit or fully remedy the physical and contractual defects described. Failure to satisfy this formal statutory notice will constitute a material breach, and I shall seek all legal remedies and compensatory interest available under state statutes.`;
    } else if (template === "settlement_offer") {
      opening = `FORMAL OFFER OF COMPROMISE AND RESOLUTION FOR SETTLEMENT\n\nIn the interest of resolving this dispute professionally without resorting to protracted administrative tribunals or public record litigation, I submit the following formal offer of compromise.`;
      closing = `This offer is made strictly for negotiation purposes. Upon your written confirmation of compromise, we shall execute a mutual release agreement resolving all claims. This offer shall remain open for seven (7) business days.`;
    } else {
      opening = `FORMAL CONTEXT NOTICE OF CIVIL DISPUTE\n\nI am writing in reference to the outstanding dispute regarding this matter. Specifically, I wish to formally document my position and request resolution.`;
      closing = `Please confirm receipt of this notice in writing within three (3) business days so we may proceed with establishing a professional dispute file.`;
    }

    return { opening, closing };
  };

  const generateFullLetter = () => {
    const { opening, closing } = getTemplateContent();
    const border = "=".repeat(64);
    
    let letter = "";
    if (isPremium) {
      letter += `CERTIFIED MAIL • REGISTERED SERVICE ARTICLE: ${trackingNumber}\n`;
      letter += `AI ADVOCATE REGISTERED CITIZEN STAMP • COMPLIANCE ID: Advocate-${Math.floor(10000 + Math.random() * 90000)}\n`;
      letter += `${border}\n\n`;
    }
    
    letter += `Date: ${letterDate}\n\n`;
    letter += `FROM:\n${userName}\n${userAddress}\n\n`;
    letter += `TO:\n${opponentName}\n${opponentAddress}\n\n`;
    letter += `RE: ${customTitle}\n\n`;
    letter += `Dear ${opponentName || "Representative"},\n\n`;
    letter += `${opening}\n\n`;
    letter += `STATEMENT OF FACTS & TERMS DISPUTED:\n${customBody}\n\n`;
    letter += `${closing}\n\n`;
    letter += `Sincerely,\n\n___________________________\n${userName}`;

    return letter;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullLetter());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateFullLetter()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `certified_dispute_notice.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFontClass = () => {
    if (font === "serif") return "font-serif tracking-normal leading-relaxed";
    if (font === "mono") return "font-mono tracking-tight leading-normal text-xs";
    return "font-sans tracking-normal leading-relaxed";
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/25 backdrop-blur-md overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Stamp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Certified Legal Letterhead Studio</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Format, draft, and brand professional dispute letters with certified registered-mail stamp layouts.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-slate-500 uppercase">Registered Tracking Unit</span>
          <span className="bg-indigo-950 border border-indigo-900 px-2 py-1 rounded text-indigo-300 font-bold">
            {trackingNumber}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Control Column (Inputs & Options) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Saved consult dropdown preloader */}
          {savedDocuments.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
              <label className="block text-[10px] font-mono font-bold uppercase text-indigo-400">
                Pre-load Consultation Facts
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 outline-none"
              >
                <option value="">-- Choose a Saved Consultation --</option>
                {savedDocuments.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title.length > 38 ? doc.title.substring(0, 38) + "..." : doc.title}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-500 leading-normal">
                Preloads dispute facts, opposing details, and recommended replies directly into the template editor.
              </p>
            </div>
          )}

          {/* Letter Settings Workspace */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Letterhead Settings</h4>

            {/* Template Selector */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Standard Action Template</label>
              <select
                value={template}
                onChange={(e: any) => setTemplate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              >
                <option value="cease_and_desist">Demand to Cease & Desist</option>
                <option value="statutory_demand">Statutory Demand Notice</option>
                <option value="settlement_offer">Offer of Compromise Settlement</option>
                <option value="standard">Standard Professional Resolution Notice</option>
              </select>
            </div>

            {/* Font Style */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Typography Font Family</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setFont("serif")}
                  className={`py-1 rounded transition ${font === "serif" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Serif (Formal)
                </button>
                <button
                  onClick={() => setFont("sans")}
                  className={`py-1 rounded transition ${font === "sans" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Sans (Modern)
                </button>
                <button
                  onClick={() => setFont("mono")}
                  className={`py-1 rounded transition ${font === "mono" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Mono (System)
                </button>
              </div>
            </div>

            {/* Contact Details Fields */}
            <div className="space-y-2.5 pt-2 border-t border-slate-900">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Your Mailing Address</label>
                <input
                  type="text"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Opponent Name / Enterprise</label>
                <input
                  type="text"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Opposing Representative Address</label>
                <textarea
                  value={opponentAddress}
                  onChange={(e) => setOpponentAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-xs text-slate-200 outline-none font-sans resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Notice Letterhead Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none font-sans uppercase font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Statement of Dispute & Facts</label>
                <textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-xs text-slate-200 outline-none font-sans"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Printable Letterhead Stage (The Live Sheet View) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-end gap-2 text-xs font-semibold">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy Raw Text"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
            <button
              onClick={() => onPreviewLetter(generateFullLetter())}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg transition shadow-lg shadow-indigo-600/15 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Export PDF
            </button>
          </div>

          {/* Letter Sheet Stage Container */}
          <div className="relative w-full aspect-[1/1.41] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-900 p-8 md:p-12 flex flex-col justify-between">
            
            {/* The actual letter content (blurred if not premium) */}
            <div className={`flex-1 flex flex-col justify-between h-full ${!isPremium ? "blur-md select-none opacity-50 pointer-events-none" : ""}`}>
              <div>
                {/* Certified Registered Header Banner */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6 font-mono text-[9px] uppercase font-bold text-slate-800">
                  <div className="flex items-center gap-1">
                    <Stamp className="w-4 h-4 text-slate-900" />
                    <span>Certified Mail Delivery Article</span>
                  </div>
                  <div>
                    <span>Registered Tracking ID:</span>
                    <span className="ml-1 text-indigo-700 underline font-extrabold">{trackingNumber}</span>
                  </div>
                </div>

                {/* Sender Address */}
                <div className={`text-right text-[10px] font-sans ${getFontClass()} mb-8 text-slate-700`}>
                  <div className="font-extrabold text-slate-950 uppercase">{userName}</div>
                  <div>{userAddress}</div>
                  <div>Date: {letterDate}</div>
                </div>

                {/* Recipient Address */}
                <div className={`text-left text-[10px] font-sans ${getFontClass()} mb-6 text-slate-700`}>
                  <div className="font-mono text-[8px] uppercase font-bold text-slate-500 mb-1">PREPARED FOR MAILING TO:</div>
                  <div className="font-extrabold text-slate-950 uppercase">{opponentName}</div>
                  <div className="whitespace-pre-wrap">{opponentAddress}</div>
                </div>

                {/* Subject Title */}
                <div className="border-t border-b border-slate-200 py-2.5 mb-6 text-[10px] uppercase font-extrabold text-slate-900 font-mono tracking-tight bg-slate-50 px-2 flex justify-between items-center">
                  <span>RE: {customTitle}</span>
                  <span className="text-[8px] bg-slate-900 text-white font-bold px-1 py-0.5 rounded uppercase">LEGAL NOTIFICATION</span>
                </div>

                {/* Salutation */}
                <div className={`text-[11px] mb-4 ${getFontClass()} font-extrabold text-slate-950`}>
                  Dear {opponentName || "Representative"},
                </div>

                {/* Template Opening */}
                <div className={`text-[10px] mb-4 ${getFontClass()} text-slate-800 leading-relaxed font-medium`}>
                  {getTemplateContent().opening}
                </div>

                {/* Custom Body Facts */}
                <div className={`text-[10px] mb-4 ${getFontClass()} text-slate-800 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded font-medium`}>
                  <div className="font-mono text-[8px] uppercase text-slate-400 font-bold mb-1">FACTS & ASSERTED DEFENSE STATEMENT:</div>
                  {customBody}
                </div>

                {/* Template Closing */}
                <div className={`text-[10px] mb-4 ${getFontClass()} text-slate-800 leading-relaxed font-medium`}>
                  {getTemplateContent().closing}
                </div>
              </div>

              {/* Sign-off section */}
              <div className="mt-8 border-t border-slate-100 pt-4 flex justify-between items-end">
                <div className={`text-[10px] ${getFontClass()} text-slate-700`}>
                  <div>Sincerely,</div>
                  <div className="h-10 mt-2 border-b border-dashed border-slate-300 w-36" />
                  <div className="font-bold text-slate-900 uppercase mt-1">{userName}</div>
                </div>

                <div className="text-right flex flex-col items-end font-mono text-[8px] text-slate-400 uppercase">
                  <span>Advocate Seal Verified</span>
                  <span className="font-bold text-slate-800">CLASS A COMPLIANCE</span>
                </div>
              </div>

            </div>

            {/* Premium Locked Paywall Overlay */}
            {!isPremium && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-sm shadow-2xl space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/10">
                    <Lock className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1">
                      Certified Templates Locked
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      The official printable certified letterhead format with verified compliance tracking numbers and registration seals is exclusive to Premium Pro members.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={onOpenUpgrade}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                    >
                      ✨ Upgrade to Premium Pro
                    </button>
                    <span className="text-[9px] font-mono text-slate-500 mt-2 block">
                      Instantly prints, exports, and copies in full unblurred layout!
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
