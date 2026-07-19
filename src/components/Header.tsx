import { Shield, AlertCircle, Info, User, Globe } from "lucide-react";
import { UserProfile } from "../types";
import { Language, languages, translations } from "../lib/translations";

interface HeaderProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenUpgrade?: () => void;
  onNavigateHowItWorks?: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Header({ 
  currentUser, 
  onOpenAuth, 
  onLogout, 
  onOpenUpgrade, 
  onNavigateHowItWorks,
  currentLanguage,
  onLanguageChange
}: HeaderProps) {
  const t = translations[currentLanguage];

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
                {t.brandName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
                {t.activeAssist}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.brandTagline}
            </p>
          </div>
        </div>

        {/* Action button & guide trigger & Language Selector */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 hover:border-slate-700 focus-within:border-indigo-500 transition-all duration-200">
            <Globe className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-xs text-slate-300 hover:text-white font-medium focus:outline-none cursor-pointer pr-1"
              id="language-select"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-950 text-slate-300">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onNavigateHowItWorks}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer"
            id="how-it-works-btn"
          >
            <Info className="w-4 h-4 text-indigo-400" />
            {t.howItWorks}
          </button>
          
          {currentUser?.isPremium ? (
            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold font-sans shadow-sm shadow-amber-500/5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              ✨ Premium Pro
            </span>
          ) : (
            onOpenUpgrade && (
              <button
                onClick={onOpenUpgrade}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/15 border border-indigo-500/20"
                id="upgrade-to-pro-btn"
              >
                <span>{t.upgradeToPro}</span>
              </button>
            )
          )}

          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950 border border-indigo-800/60 hover:bg-indigo-900 text-indigo-300 transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-950/10"
              id="dashboard-btn"
            >
              <User className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>{t.dashboard} ({currentUser.name.split(" ")[0]})</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 cursor-pointer"
              id="signin-btn"
            >
              <User className="w-4 h-4 shrink-0 text-slate-400" />
              <span>{t.signInProfile}</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t.telemetryText}
          </div>
        </div>
      </div>
    </header>
  );
}
