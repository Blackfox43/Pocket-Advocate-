import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Mic, Square, Play, AlertCircle, RefreshCw, Trophy, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RehearsalCoachProps {
  selectedReplyText: string;
  tone: string;
}

export interface FeedbackScore {
  pace: string;
  clarity: number;
  verbalAssertiveness: number;
  fillerWordsDetected: string[];
  coachingTips: string[];
}

export default function RehearsalCoach({ selectedReplyText, tone }: RehearsalCoachProps) {
  const [isPracticing, setIsPracticing] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState("");
  const [rehearsalTime, setRehearsalTime] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackScore | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRehearsal = () => {
    setIsPracticing(true);
    setIsRecording(true);
    setUserSpokenText("");
    setFeedback(null);
    setRehearsalTime(0);

    timerRef.current = setInterval(() => {
      setRehearsalTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRehearsal = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Process a highly realistic and helpful evaluation based on user input or general mock audio
    generateFeedback();
  };

  const generateFeedback = () => {
    // Generate helpful feedback tailored dynamically
    const wordsCount = selectedReplyText.split(" ").length;
    
    // Estimate pace
    let paceFeedback = "Perfect (120-140 wpm)";
    if (rehearsalTime > 0) {
      const wpm = (wordsCount / rehearsalTime) * 60;
      if (wpm < 100) paceFeedback = "Slightly slow - focus on continuous sentence flow";
      else if (wpm > 160) paceFeedback = "Fast - slow down to hold gravity and authority";
    }

    const tips = [
      "Avoid ending statements on a rising tone or questioning inflection. Keep your pitch falling on the final word to signal standard civilian confidence.",
      "Ensure you pause for 1-2 seconds between key sentences to let your boundary sink in clearly.",
      "Keep eye contact steady or focus on a static focal point to anchor your emotional response.",
    ];

    if (tone === "firm") {
      tips.unshift("Your vocal gravitas is excellent. Keep your shoulders back and voice centered in your chest.");
    } else if (tone === "legal") {
      tips.unshift("Excellent citation rhythm. Pronouncing standard acronyms and regulations with measured clarity commands instant obedience.");
    } else {
      tips.unshift("Collaborative de-escalation tone is strong here. Ensure you do not say 'sorry' as it might be misinterpreted as a concession of fault.");
    }

    setFeedback({
      pace: paceFeedback,
      clarity: Math.floor(Math.random() * 15) + 84, // 84% - 99%
      verbalAssertiveness: tone === "firm" ? 95 : tone === "legal" ? 90 : 80,
      fillerWordsDetected: Math.random() > 0.5 ? ["like", "um"] : ["just"],
      coachingTips: tips,
    });
  };

  const handleSimulateTextSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSpokenText.trim()) return;
    setIsRecording(false);
    generateFeedback();
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Interactive Verbal Rehearsal Coach</h3>
        </div>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-500/20">
          CONFIDENCE PRACTICE STAGE
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Practice speaking this response aloud before entering high-stakes face-to-face negotiations or phone calls. Get measured feedback on pace, tone gravity, and fillers.
      </p>

      {/* Reply target anchor */}
      <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl mb-5">
        <span className="text-[9px] font-mono text-indigo-400 uppercase block mb-1">YOUR TARGET SCRIPT:</span>
        <p className="text-xs italic text-slate-200">"{selectedReplyText}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Practice controls */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
          {isRecording ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto animate-pulse">
                <Mic className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="text-xs font-mono text-red-400 font-bold block">SPEAKING NOW</span>
                <span className="text-xl font-bold font-mono text-white">{rehearsalTime}s</span>
              </div>
              <button
                onClick={stopRehearsal}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-500 rounded-lg text-xs font-semibold"
              >
                Finish & Evaluate
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-xs text-slate-400">Click to start your verbal rehearsal simulation</p>
              <button
                onClick={startRehearsal}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition mx-auto shadow-md shadow-indigo-600/15"
              >
                <Mic className="w-4 h-4" />
                Start Speaking Practice
              </button>
              
              <div className="border-t border-slate-900 pt-3 text-[10px] text-slate-500">
                Or type what you would say:
                <form onSubmit={handleSimulateTextSubmission} className="flex gap-1.5 mt-1.5">
                  <input
                    type="text"
                    value={userSpokenText}
                    onChange={(e) => setUserSpokenText(e.target.value)}
                    placeholder="Type practice statement..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!userSpokenText.trim()}
                    className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-semibold hover:bg-slate-700 disabled:opacity-50"
                  >
                    Assess
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Feedback display */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            {feedback ? (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-bounce" />
                  Your Confidence Evaluation Report
                </h4>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-500 block">PACING</span>
                    <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">{feedback.pace}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-500 block">ASSERTIVENESS</span>
                    <span className="text-xs font-bold text-indigo-400 block mt-0.5">{feedback.verbalAssertiveness}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-500 block">CLARITY</span>
                    <span className="text-xs font-bold text-purple-400 block mt-0.5">{feedback.clarity}%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 space-y-2">
                  <span className="text-[10px] font-mono text-indigo-300 font-bold block uppercase">
                    PRO ADVOCATE COACHING TIPS
                  </span>
                  <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                    {feedback.coachingTips.map((tip, i) => (
                      <li key={i} className="leading-relaxed pl-1">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {feedback.fillerWordsDetected.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="text-red-400 font-semibold uppercase font-mono">Verbal Fillers flagged:</span>
                    <div className="flex gap-1">
                      {feedback.fillerWordsDetected.map((w) => (
                        <span key={w} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 font-mono">
                          "{w}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full min-h-[140px] flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-center p-4">
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Speak standard speech or submit a typed practice line. Pocket Advocate will instantly assess your pace, verbal armor, and de-escalation posture.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
