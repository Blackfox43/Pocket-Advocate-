import { Shield, BookOpen, AlertCircle, Info, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

interface HeaderProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Header({ currentUser, onOpenAuth, onLogout }: HeaderProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="relative border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand logo & tagline */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-bold text-xl tracking-tight text-white">
                AI Pocket Advocate
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ACTIVE ASSIST
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Defend your civilian, tenant, & employee rights during verbal disputes.
            </p>
          </div>
        </div>

        {/* Action button & guide trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer"
          >
            <Info className="w-4 h-4 text-indigo-400" />
            How it works
          </button>
          
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Dashboard ({currentUser.name.split(" ")[0]})</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Sign In / Profile</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            67% tenants unaware of basic rights
          </div>
        </div>
      </div>

      {/* Slide-out Guidance overlay */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 border-b border-slate-800 bg-slate-900 shadow-2xl p-6"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Pocket Advocate Playbook
                </h3>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-mono text-indigo-400 font-bold block mb-1">STEP 1</span>
                  <p className="font-semibold text-white mb-1">Record or Type</p>
                  <p className="text-slate-400 leading-relaxed">
                    Capture live audio or paste verbal demands from landlords, bosses, or insurance claims.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-mono text-indigo-400 font-bold block mb-1">STEP 2</span>
                  <p className="font-semibold text-white mb-1">AI Rights Detection</p>
                  <p className="text-slate-400 leading-relaxed">
                    Our server-side Gemini system transcribes, checks against standard regulations, and isolates predatory claims.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-mono text-indigo-400 font-bold block mb-1">STEP 3</span>
                  <p className="font-semibold text-white mb-1">Whisper Three Replies</p>
                  <p className="text-slate-400 leading-relaxed">
                    Instantly copy or speak "Firm", "Legal", or "Polite" reply templates crafted to level the playing field.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/30 flex items-start gap-2 text-xs text-indigo-300">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip for High Stakes:</strong> Run simulations with our preset dialogues to see how to hold your ground before entering meetings or calls. Always consult formal legal aid for official legal counsel.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
