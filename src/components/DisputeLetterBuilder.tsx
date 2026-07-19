import { useState, useEffect } from "react";
import { Replies, UserProfile } from "../types";
import { FileText, Copy, Check, Download, Edit3, Save, Bookmark, Printer } from "lucide-react";

interface DisputeLetterBuilderProps {
  category: "landlord" | "employer" | "insurance" | "general";
  opponentName: string;
  selectedReplyText: string;
  tone: string;
  currentUser?: UserProfile | null;
  onSaveLetter?: (letterText: string) => void;
  onPreviewLetter?: (letterText: string) => void;
}

export default function DisputeLetterBuilder({
  category,
  opponentName,
  selectedReplyText,
  tone,
  currentUser,
  onSaveLetter,
  onPreviewLetter,
}: DisputeLetterBuilderProps) {
  const [userName, setUserName] = useState("Emma Watson");
  const [userAddress, setUserAddress] = useState("123 Main Street, Apt 4B");
  const [opponentAddress, setOpponentAddress] = useState("");
  const [letterDate, setLetterDate] = useState(new Date().toLocaleDateString());
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-generate some addresses based on presets if left empty, and populate user profile details if authenticated
  useEffect(() => {
    if (category === "landlord") {
      setOpponentAddress("Henderson Property Management Office\n456 Oak Lane, Suite 100");
    } else if (category === "employer") {
      setOpponentAddress("Marcus Vance, General Manager\nApex Corp Headquarters");
    } else {
      setOpponentAddress(`${opponentName}\nClaims & Compliance Department`);
    }

    if (currentUser) {
      setUserName(currentUser.name);
      setUserAddress(currentUser.address || "123 Main Street, Apt 4B");
    } else {
      setUserName("Emma Watson");
      setUserAddress("123 Main Street, Apt 4B");
    }
  }, [category, opponentName, currentUser]);

  const generateLetterContent = () => {
    const header = `FORMAL DISPUTE NOTICE\n\nDate: ${letterDate}\n\nFrom:\n${userName}\n${userAddress}\n\nTo:\n${opponentAddress}\n\nRE: Formal Dispute & Notice of Rights Asserted\n\nDear ${opponentName || "Sir/Madam"},\n\n`;
    
    const body = `I am writing in reference to our recent conversation and the demands or statements put forward regarding this matter.\n\nSpecifically, I wish to clarify my position and formally assert my rights:\n\n"${selectedReplyText}"\n\n`;
    
    const closing = `Please confirm receipt of this notice in writing within three (3) business days. It is my sincere hope that we can resolve this matter professionally and in full compliance with standard regulatory guidelines.\n\nSincerely,\n\n___________________________\n${userName}`;

    return header + body + closing;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateLetterContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generateLetterContent()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `pocket_advocate_notice_${category}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Dispute Letter & Notice Builder</h3>
        </div>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-500/20">
          FORMAL DOCUMENT GENERATOR
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Transform your active <strong className="text-slate-200 capitalize">{tone}</strong> response into an official legal dispute letter. Fill in your information below to populate the document fields instantly.
      </p>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Your Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Your Address / Contact Info</label>
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Opponent Mailing Address / Title</label>
            <textarea
              value={opponentAddress}
              onChange={(e) => setOpponentAddress(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-xs text-slate-200 outline-none resize-none leading-normal"
            />
          </div>
        </div>
      </div>

      {/* Document Letter Preview Stage */}
      <div className="relative bg-slate-950 border border-slate-800/60 rounded-xl p-5 font-mono text-xs text-slate-300 h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
        <div className="absolute top-3 right-3 flex items-center gap-2 flex-wrap justify-end max-w-[80%]">
          {onPreviewLetter && (
            <button
              onClick={() => onPreviewLetter(generateLetterContent())}
              className="flex items-center gap-1.5 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded text-[10px] text-emerald-400 font-semibold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Export HTML
            </button>
          )}

          {onSaveLetter && (
            <button
              onClick={() => onSaveLetter(generateLetterContent())}
              className="flex items-center gap-1.5 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white px-2.5 py-1 rounded text-[10px] text-indigo-400 font-semibold transition cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Save Letter
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white px-2.5 py-1 rounded text-[10px] text-slate-400 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Formatted"}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white px-2.5 py-1 rounded text-[10px] text-slate-400 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Download TXT
          </button>
        </div>
        
        <div className="pr-4 border-l-2 border-slate-800 pl-3">
          {generateLetterContent()}
        </div>
      </div>
    </div>
  );
}
