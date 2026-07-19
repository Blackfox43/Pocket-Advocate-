import { SavedSession } from "../types";
import { History, Calendar, Trash2, Home, Briefcase, FileText, ChevronRight, MessageSquareCode } from "lucide-react";

interface SessionHistoryProps {
  sessions: SavedSession[];
  onSelectSession: (session: SavedSession) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  currentSessionId?: string;
}

export default function SessionHistory({
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  currentSessionId,
}: SessionHistoryProps) {

  const getIcon = (category: string) => {
    switch (category) {
      case "landlord":
        return <Home className="w-3.5 h-3.5 text-emerald-400" />;
      case "employer":
        return <Briefcase className="w-3.5 h-3.5 text-blue-400" />;
      case "insurance":
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <MessageSquareCode className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/10 text-center">
        <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-300">No session history yet</p>
        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
          Record or type verbal disputes above. Your analysis transcripts will appear here securely.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          Secure Local History
        </h3>
        <button
          onClick={onClearAll}
          className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition-colors duration-150"
        >
          CLEAR ALL
        </button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {sessions.map((session) => {
          const isSelected = currentSessionId === session.id;
          return (
            <div
              key={session.id}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                isSelected
                  ? "border-indigo-500/80 bg-indigo-950/25"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/30"
              }`}
            >
              <button
                onClick={() => onSelectSession(session)}
                className="flex-1 text-left flex items-start gap-3 min-w-0"
              >
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(session.category)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-indigo-400 transition-colors duration-150">
                    {session.title || "Untitled Dispute"}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="truncate max-w-[100px]">vs. {session.opponentName}</span>
                    <span className="text-slate-600 font-mono">•</span>
                    <span className="flex items-center gap-1 shrink-0 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(session.timestamp)}
                    </span>
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors duration-150" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
