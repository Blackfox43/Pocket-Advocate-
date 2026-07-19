import { PRESET_SCENARIOS } from "../data/presets";
import { PresetScenario } from "../types";
import { Home, Briefcase, FileText, AlertTriangle, ArrowRight } from "lucide-react";

interface ScenarioSelectorProps {
  onSelect: (scenario: PresetScenario) => void;
  selectedId?: string;
}

export default function ScenarioSelector({ onSelect, selectedId }: ScenarioSelectorProps) {
  
  const getIcon = (category: string) => {
    switch (category) {
      case "landlord":
        return <Home className="w-4 h-4 text-emerald-400" />;
      case "employer":
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case "insurance":
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case "landlord":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "employer":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "insurance":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Or Select a High-Stakes Verbal Scenario simulation
        </h3>
        <span className="text-[10px] text-indigo-400 font-mono">CHOOSE TO PLAYGROUND</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {PRESET_SCENARIOS.map((scenario) => {
          const isSelected = selectedId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className={`group text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-950/40"
                  : "border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50"
              }`}
            >
              {/* Highlight backdrop accent */}
              <div
                className={`absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${getBadgeColor(
                      scenario.category
                    )}`}
                  >
                    {getIcon(scenario.category)}
                    {scenario.category.toUpperCase()}
                  </span>
                  
                  <span className="text-[10px] text-slate-500 font-mono">
                    {scenario.opponentRole}
                  </span>
                </div>

                <h4 className="font-sans font-semibold text-sm text-white group-hover:text-indigo-400 transition-colors duration-200">
                  {scenario.title}
                </h4>
                
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {scenario.topic}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500">
                <span className="font-medium text-slate-400 truncate max-w-[150px]">
                  Opponent: {scenario.opponentName}
                </span>
                
                <span className="flex items-center gap-1 text-indigo-400 text-[11px] font-medium opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shrink-0">
                  Load Setup
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
