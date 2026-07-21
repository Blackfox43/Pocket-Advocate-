import React from 'react';
import { UserProfile } from '../types';
import { Language } from '../lib/translations';

export interface HeaderProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenUpgrade: () => void;
  onNavigateHowItWorks?: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenUpgrade,
  onNavigateHowItWorks,
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            A
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            AppEngine<span className="text-indigo-400">.ai</span>
          </span>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {onNavigateHowItWorks && (
            <button
              onClick={onNavigateHowItWorks}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block"
            >
              How It Works
            </button>
          )}

          {/* Language Selector */}
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="en">English (EN)</option>
            <option value="es">Español (ES)</option>
            <option value="fr">Français (FR)</option>
            <option value="de">Deutsch (DE)</option>
          </select>

          {/* Pro / Upgrade Badge */}
          <button
            onClick={onOpenUpgrade}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md transition-all transform hover:scale-105"
          >
            {currentUser?.tier === 'pro' || currentUser?.tier === 'lifetime' ? 'Pro Member' : 'Upgrade'}
          </button>

          {/* Auth State */}
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-2 text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-xs font-bold flex items-center justify-center text-white">
                  {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {currentUser.name || currentUser.email}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
