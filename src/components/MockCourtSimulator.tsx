import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  Send, 
  Scale, 
  Check, 
  User, 
  Award, 
  HelpCircle, 
  Flame, 
  AlertCircle,
  HelpCircle as QuestionIcon,
  MessageSquare,
  Bot,
  RefreshCw,
  Trophy,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

interface MockCourtSimulatorProps {
  currentUser: UserProfile | null;
  onOpenUpgrade: () => void;
  authToken: string | null;
}

interface Message {
  id: string;
  sender: "user" | "judge";
  text: string;
  score?: number; // feedback evaluation score
  notes?: string; // coaching advice on user's statement
}

export default function MockCourtSimulator({ currentUser, onOpenUpgrade, authToken }: MockCourtSimulatorProps) {
  const isPremium = currentUser?.isPremium === true;

  const [simulationActive, setSimulationActive] = useState(false);
  const [role, setRole] = useState<"landlord" | "employer" | "insurance" | "general">("landlord");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number | null>(null);
  const [coachingSummary, setCoachingSummary] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const startSimulation = async () => {
    setMessages([]);
    setPerformanceScore(null);
    setCoachingSummary("");
    setLoading(true);
    setSimulationActive(true);

    const initialGreeting: Record<string, string> = {
      landlord: "This is Arbitrator Henderson. I have reviewed the landlord's demand for immediate lease termination and outstanding security deposit retention. Let us begin. Tell me, tenant: on what legal basis do you dispute the $2,500 withholding for carpet replacement?",
      employer: "I am HR Director Sterling. Regarding your claim for unpaid weekend hours and retrospective overtime compliance, Apex Corp maintains all hours were voluntary and classified as exempt auditing. What evidence do you possess that suggests you were ordered to work?",
      insurance: "This is Chief Claims Inspector Vance. Your claim for complete plumbing failure coverage was denied based on the 'pre-existing deterioration' exclusion. Why do you believe this exclusion does not apply to your sudden water pipe breach?",
      general: "I am Hearing Officer Justice. We are here to evaluate your dispute claims. Please state your grievance clearly and tell me what remedy or policy compromise you are officially seeking today."
    };

    setTimeout(() => {
      setMessages([
        {
          id: "msg_init",
          sender: "judge",
          text: initialGreeting[role]
        }
      ]);
      setCurrentPrompt(initialGreeting[role]);
      setLoading(false);
    }, 800);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsgText = inputText;
    const userMsgId = "user_" + Math.random().toString(36).substr(2, 9);
    
    // Add user message to state
    setMessages(prev => [...prev, {
      id: userMsgId,
      sender: "user",
      text: userMsgText
    }]);
    
    setInputText("");
    setLoading(true);

    try {
      // Direct call to Gemini backend via /api/faq-chat proxy or custom instructions
      const response = await fetch("/api/faq-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: `You are simulating an opposing arbitrator/judge in a dispute.
Opponent role: ${role}.
Judge just said: "${currentPrompt}".
User replied: "${userMsgText}".
Provide the judge's next cross-examination response (interrogating or pushing back on the user's logic).
Provide your response strictly structured in three parts separated by '---':
Part 1: The Judge's direct, slightly firm, realistic cross-examination response (asking a tough question or questioning user's logic).
Part 2: An integrity score for the user's response from 0 to 100 (just the number).
Part 3: Brief, 1-2 sentence legal coaching tip for the user (how they could improve their response, e.g. citing specific regulations or avoiding emotional arguments).`,
          category: role
        })
      });

      if (!response.ok) {
        throw new Error("Failed to consult the AI Arbitrator.");
      }

      const data = await response.json();
      const rawText = data.answer;

      // Parse the response parts
      const parts = rawText.split("---");
      const judgeResponse = parts[0]?.trim() || "I hear your argument, but you must provide stronger justification under standard regulations.";
      const rawScore = parseInt(parts[1]?.trim() || "75", 10);
      const score = isNaN(rawScore) ? 75 : rawScore;
      const coachingTip = parts[2]?.trim() || "Cite state statues directly to disarm arbitrary denials and stand firm.";

      setMessages(prev => {
        // Find the user message we just sent and add score/notes to it
        const updated = prev.map(msg => {
          if (msg.id === userMsgId) {
            return {
              ...msg,
              score,
              notes: coachingTip
            };
          }
          return msg;
        });

        // Append Judge's reply
        return [
          ...updated,
          {
            id: "judge_" + Math.random().toString(36).substr(2, 9),
            sender: "judge",
            text: judgeResponse
          }
        ];
      });

      setCurrentPrompt(judgeResponse);

      // Dynamically adjust total cumulative performance score
      setPerformanceScore(prev => {
        if (prev === null) return score;
        return Math.round((prev + score) / 2);
      });

    } catch (err) {
      console.error(err);
      // Fallback response
      setMessages(prev => [
        ...prev,
        {
          id: "judge_err",
          sender: "judge",
          text: "I see. In standard tribunals, you must be extremely clear. How do you respond to the counterpoint that the timeline of notifications was not adhered to?"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const terminateSimulation = () => {
    setSimulationActive(false);
    if (performanceScore && performanceScore > 85) {
      setCoachingSummary("Excellent preparation! You consistently cited regulations, avoided emotional concessions, and maintained airtight logical boundaries. You are highly ready for a real negotiation.");
    } else if (performanceScore) {
      setCoachingSummary("Good start, but you can strengthen your leverage. Try to quote specific statutory codes (like CA Civil Code § 1950.5 or FLSA regulations) rather than simply explaining the unfairness of the situation. Re-run standard intake analysis to review recommended templates.");
    }
  };

  // 1. GATED PREMIUM VIEW (If user is not premium)
  if (!isPremium) {
    return (
      <div className="w-full max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/25 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="relative p-8 md:p-12 text-center space-y-8 overflow-hidden">
          {/* Decorative glowing background elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />

          {/* Premium Lock Badge */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30 shadow-xl shadow-amber-950/25">
            <Lock className="w-9 h-9 text-amber-400 animate-pulse" />
            <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full font-sans tracking-wide">
              PRO
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
              AI Mock Court Arbitrator Room
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Do not walk into a high-stakes negotiation or legal tribunal cold. Test your arguments and prepare under professional fire with our interactive Opposing Arbitrator Simulator.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Scale className="w-4 h-4 text-indigo-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">Interactive Roleplay</h4>
              <p className="text-[10px] text-slate-400 leading-normal">
                Choose to face an aggressive corporate HR director, an evasive insurance adjuster, or a greedy landlord agent.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">Real-time Scorecard</h4>
              <p className="text-[10px] text-slate-400 leading-normal">
                Receive instant performance and argument-strength grading (0-100) after every verbal response you make.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-200">Targeted Coaching</h4>
              <p className="text-[10px] text-slate-400 leading-normal">
                AI outlines exactly which legal terms or citation acts were omitted and recommends stronger phrasing rules.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 max-w-md mx-auto space-y-3">
            <button
              onClick={onOpenUpgrade}
              className="w-full py-3 rounded-2xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all cursor-pointer shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2"
            >
              ✨ Upgrade to Premium Pro &bull; Unlock Arbitrator <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </button>
            <p className="text-[10px] text-slate-500 font-mono">
              Unlock unlimited consulting, premium letterheads, and our interactive Mock Court suite for a one-time fee.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE PREMIUM WORKSPACE
  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/25 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col h-[75vh]">
      
      {/* Header bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Scale className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Mock Court Arbitrator Room
              <span className="text-[8px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                PREMIUM ACTIVE
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Test and evaluate your dispute arguments under cross-examination pressure.</p>
          </div>
        </div>

        {simulationActive && (
          <div className="flex items-center gap-3">
            {performanceScore !== null && (
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Current Performance Score</span>
                <span className={`text-xs font-bold font-mono ${performanceScore > 85 ? "text-emerald-400" : performanceScore > 65 ? "text-amber-400" : "text-red-400"}`}>
                  {performanceScore} / 100
                </span>
              </div>
            )}
            <button
              onClick={terminateSimulation}
              className="bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 text-[10px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              Stop & Coach
            </button>
          </div>
        )}
      </div>

      {!simulationActive ? (
        /* Configuration Stage */
        <div className="flex-1 p-6 flex flex-col justify-center items-center text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>

          <div className="max-w-md space-y-1">
            <h4 className="text-sm font-bold text-white">Select Your Cross-Examiner Opposition</h4>
            <p className="text-xs text-slate-400">Configure which party you will face in the virtual tribunal simulation room.</p>
          </div>

          {/* Opponent Cards Grid */}
          <div className="grid grid-cols-2 gap-3.5 w-full max-w-xl text-left">
            <div 
              onClick={() => setRole("landlord")}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                role === "landlord" 
                  ? "bg-slate-950 border-indigo-500" 
                  : "bg-slate-950/30 border-slate-850 hover:border-slate-850"
              }`}
            >
              <h5 className="text-xs font-bold text-white">Landlord Agent</h5>
              <p className="text-[10px] text-slate-500 mt-1">Disputes regarding carpets, security deposit delays, or wear & tear exclusions.</p>
            </div>

            <div 
              onClick={() => setRole("employer")}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                role === "employer" 
                  ? "bg-slate-950 border-indigo-500" 
                  : "bg-slate-950/30 border-slate-850 hover:border-slate-850"
              }`}
            >
              <h5 className="text-xs font-bold text-white">HR Policy Director</h5>
              <p className="text-[10px] text-slate-500 mt-1">Disputes regarding mandatory unpaid overtime, exempt status, or retaliatory measures.</p>
            </div>

            <div 
              onClick={() => setRole("insurance")}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                role === "insurance" 
                  ? "bg-slate-950 border-indigo-500" 
                  : "bg-slate-950/30 border-slate-850 hover:border-slate-850"
              }`}
            >
              <h5 className="text-xs font-bold text-white">Claims Adjuster Inspector</h5>
              <p className="text-[10px] text-slate-500 mt-1">Disputes regarding damage claim denials, algorithmic exclusions, or structural breaches.</p>
            </div>

            <div 
              onClick={() => setRole("general")}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                role === "general" 
                  ? "bg-slate-950 border-indigo-500" 
                  : "bg-slate-950/30 border-slate-850 hover:border-slate-850"
              }`}
            >
              <h5 className="text-xs font-bold text-white">Adversary Hearing Officer</h5>
              <p className="text-[10px] text-slate-500 mt-1">A generic dispute hearing officer challenging any consumer grievance or compromise.</p>
            </div>
          </div>

          {coachingSummary && (
            <div className="w-full max-w-xl p-4 rounded-xl bg-slate-950 border border-slate-850 text-left space-y-2">
              <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                Arbitrator's Feedback Report
              </h5>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{coachingSummary}</p>
            </div>
          )}

          <button
            onClick={startSimulation}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-indigo-600/15"
          >
            Launch Active Tribunal Simulation &rarr;
          </button>
        </div>
      ) : (
        /* Active Chat Simulator Workspace */
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/50">
          
          {/* Scrollable messages container */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
                  msg.sender === "user" 
                    ? "bg-indigo-950 border-indigo-800 text-indigo-300" 
                    : "bg-slate-900 border-slate-800 text-amber-400"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                </div>

                <div className="space-y-1.5">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>

                  {/* Feedback Overlay for User Statements */}
                  {msg.sender === "user" && (msg.score !== undefined || msg.notes) && (
                    <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1.5 text-left shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                          REAL-TIME ARGUMENT FEEDBACK
                        </span>
                        {msg.score !== undefined && (
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            msg.score > 85 ? "bg-emerald-500/10 text-emerald-400" : msg.score > 65 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            Integrity: {msg.score}/100
                          </span>
                        )}
                      </div>
                      {msg.notes && (
                        <p className="text-[10px] text-slate-400 font-sans italic">
                          💡 {msg.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="bg-slate-900 border border-slate-800 text-slate-500 text-xs p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Arbitrator evaluating counterpoints...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Interactive footer input */}
          <div className="p-4 border-t border-slate-850 bg-slate-950">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                disabled={loading}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your strategic defense argument here (e.g. 'Under Section 1950.5, I requested an itemization within 21 days...')"
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none placeholder:text-slate-600 font-sans"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition cursor-pointer flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
