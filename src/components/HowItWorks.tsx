import { 
  Shield, 
  Scale, 
  Mic, 
  FileCheck2, 
  MessageSquare, 
  BookOpen, 
  Stamp, 
  Gavel, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  FileText, 
  Volume2, 
  AlertCircle 
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface HowItWorksProps {
  onNavigateToView: (view: "counseling" | "playground" | "faq" | "library" | "rehearsal" | "letterhead" | "arbitrator") => void;
}

export default function HowItWorks({ onNavigateToView }: HowItWorksProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [demoInput, setDemoInput] = useState<"landlord" | "employer" | "insurance">("landlord");

  const steps = [
    {
      title: "1. Capture Verbal Dialogue or Intake",
      short: "Record live conversations, paste texts, or complete our intake wizard.",
      icon: Mic,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      details: "Pocket Advocate provides multiple avenues of secure entry. Use the record button to speak directly, paste copied letters/emails into our text copier, or let our Guided Intake Wizard build the case context step-by-step. All data is processed using safe, local session memory to protect your privacy."
    },
    {
      title: "2. Deep AI Audit & Rights Violation Check",
      short: "Our server-side Gemini auditor tests claims against standard codes & civil acts.",
      icon: Cpu,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      details: "Once submitted, our server-side engine scans the dialogue for legal violations. It cross-references standard frameworks like the Fair Housing Act (for tenants), the Fair Labor Standards Act (FLSA for employees), or Bad Faith statutes (for policyholders), instantly tagging predatory or illegal actions."
    },
    {
      title: "3. Formulate Tactical Response Armor",
      short: "Deploy customized Firm, Legal, or Polite verbal armor scripts.",
      icon: Scale,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      details: "Pocket Advocate crafts three highly tailored responses for any situation. Whether you need to hold boundaries with 'Firm', invoke specific codes with 'Legal', or maintain diplomatic channels with 'Polite', you'll have perfect tactical scripts ready to copy, print as certified notices, or speak aloud."
    }
  ];

  const demoScenarios = {
    landlord: {
      raw: "Landlord: 'I don't care if there's mold in the kitchen, you pay rent on the 1st or I'm changing the locks tomorrow.'",
      violations: [
        "Constructive Eviction threat (self-help locks change is illegal)",
        "Breach of Implied Warranty of Habitability (failing to remedy toxic mold)"
      ],
      replies: {
        firm: "I cannot agree to a lock change. Under state law, any attempt to lock me out without a court order is illegal.",
        legal: "State law prohibits self-help evictions. Under standard civil code, you must maintain a habitable unit free of mold before executing normal landlord actions.",
        polite: "I want to settle rent, but the mold must be addressed first. Changing the locks tomorrow would violate tenant-landlord regulations."
      }
    },
    employer: {
      raw: "Boss: 'You have to stay 3 hours late to finish the inventory, but don't log it on your timesheet. Just take a longer lunch next week.'",
      violations: [
        "FLSA Overtime Off-the-Clock Violation",
        "Record-keeping evasion / illegal wage deferral"
      ],
      replies: {
        firm: "I am happy to help, but I must log all hours worked on today's timesheet. Working off-the-clock violates company policy and labor laws.",
        legal: "Under the Fair Labor Standards Act (FLSA), all hours worked must be paid in the pay period earned, including overtime. Deferring hours is prohibited.",
        polite: "I want to help with inventory, but to stay compliant with labor laws, we need to ensure all hours are recorded and paid on this pay period."
      }
    },
    insurance: {
      raw: "Claims Agent: 'The water pipe burst is pre-existing wear-and-tear. We can only pay $500 for cleanup, and if you appeal, the offer is void.'",
      violations: [
        "Bad Faith insurance practice (coercive claims handling)",
        "Invalidation threat for regulatory appeals"
      ],
      replies: {
        firm: "I reject this assessment. I have a right to seek a formal appeal without forfeiting claims coverage.",
        legal: "Under state insurance bad-faith protocols, threatening to void an offer due to an appeal is prohibited. Please provide a formal written denial.",
        polite: "I would like a certified copy of the policy section on pre-existing wear. I will proceed with my appeal rights as outlined by law."
      }
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <div className="relative text-center max-w-3xl mx-auto space-y-4">
        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full -z-10" />
        <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-950/20">
          <Cpu className="w-7 h-7" />
        </div>
        <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
          Leveling the Legal Playing Field, <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            One Conversation at a Time.
          </span>
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          AI Pocket Advocate serves as your automated civilian rights defense companion, analyzing predatory statements from corporate landlords, employers, and insurers on demand.
        </p>
      </div>

      {/* Interactive Step-by-Step Walkthrough */}
      <div className="bg-slate-900/10 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-8">
        <div className="border-b border-slate-900 pb-5">
          <h3 className="text-lg font-bold text-slate-200">The Advocate Core Engine</h3>
          <p className="text-xs text-slate-400 mt-1">
            Tap on each step to explore how Pocket Advocate audits claims and designs defensive communication templates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step list selector */}
          <div className="lg:col-span-5 space-y-3">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer ${
                    isActive 
                      ? "bg-slate-900/60 border-indigo-500/30 shadow-lg shadow-indigo-950/20" 
                      : "bg-transparent border-slate-900 hover:border-slate-800 hover:bg-slate-900/10"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${step.color}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold transition-colors duration-150 ${isActive ? "text-white" : "text-slate-300"}`}>
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-snug mt-1 font-sans">
                      {step.short}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive view container */}
          <div className="lg:col-span-7 bg-slate-950/60 border border-slate-900 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-400 uppercase">
                Active Component Insight
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                STABLE RELEASE v1.4
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide font-mono flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                {steps[activeStep].title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {steps[activeStep].details}
              </p>
            </div>

            {/* Visual simulation box depending on active step */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900/40 border border-slate-900 space-y-3">
              {activeStep === 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>INPUT PORT ACTIVE</span>
                    <span>MEM: SECURE LOCAL</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                    <Mic className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 bg-purple-500/20 rounded-full w-4/5 animate-pulse" />
                      <div className="h-1.5 bg-slate-800 rounded-full w-2/3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="flex-1 text-[11px] text-slate-400 font-mono italic">
                      "I have paid my security deposit, but they refuse..."
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>GEMINI RIGHTS ENGINE</span>
                    <span>LATENCY: ~850MS</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="p-2 bg-slate-950 rounded border border-slate-900 flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/5 border border-emerald-500/10 px-1 rounded">DETECTED</span>
                      <span className="text-[11px] text-slate-300 font-sans">Tenant lock-out threat</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-slate-900 flex items-center gap-2">
                      <span className="text-[10px] text-sky-400 font-mono bg-sky-500/5 border border-sky-500/10 px-1 rounded">REFERENCE</span>
                      <span className="text-[11px] text-slate-300 font-mono text-xs">Standard Housing Act Article 12</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>RESPONSE COPIER BLUEPRINTS</span>
                    <span>1-CLICK DEPLOYABLE</span>
                  </div>
                  <div className="space-y-1.5 text-[10px] font-sans">
                    <div className="bg-slate-950 p-2 rounded border border-indigo-500/10 text-indigo-300">
                      <strong>Firm Defense:</strong> "Under state housing code, landlords cannot self-evict..."
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-900 text-slate-400">
                      <strong>Polite Boundary:</strong> "Let's reach an agreement regarding the unit repairs..."
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demonstration Playground Sandbox */}
      <div className="bg-slate-900/10 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-200">Interactive Audit Sandbox</h3>
          <p className="text-xs text-slate-400 mt-1">
            Pick a representative dispute context to see how Pocket Advocate processes verbal demands in real time.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900/80 max-w-md">
          <button
            onClick={() => setDemoInput("landlord")}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              demoInput === "landlord"
                ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Tenant vs. Landlord
          </button>
          <button
            onClick={() => setDemoInput("employer")}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              demoInput === "employer"
                ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Employee vs. Boss
          </button>
          <button
            onClick={() => setDemoInput("insurance")}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              demoInput === "insurance"
                ? "bg-indigo-600 text-white shadow shadow-indigo-600/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Insurance Dispute
          </button>
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">
              Raw Opponent Verbal Claim (Inputted)
            </span>
            <p className="text-xs text-slate-300 italic font-sans leading-relaxed p-4 bg-slate-900/40 rounded-xl border border-slate-900">
              {demoScenarios[demoInput].raw}
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-red-400/80 block uppercase font-bold">
                Detected Code Violations / Claims
              </span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {demoScenarios[demoInput].violations.map((v, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Output */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold">
              Formulated Response Armor Options
            </span>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block mb-1">
                  Firm & Clear Boundary
                </span>
                <p className="text-slate-300 leading-normal">
                  "{demoScenarios[demoInput].replies.firm}"
                </p>
              </div>

              <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-900">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">
                  Legal & Statute-Focused
                </span>
                <p className="text-slate-300 leading-normal">
                  "{demoScenarios[demoInput].replies.legal}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Suite Features List */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-lg font-bold text-white">Interactive Defense Modules</h3>
          <p className="text-xs text-slate-400 mt-1">
            Pocket Advocate includes an entire suite of defensive self-advocacy modules. Click below to open them directly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigateToView("counseling")}
            className="p-5 text-left bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl space-y-2 group cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-max group-hover:bg-indigo-500 group-hover:text-white transition">
              <Scale className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">Counseling Suite</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Capture or input verbal statements to perform a full legal rights audit and access whisper template armor.
            </p>
          </button>

          <button
            onClick={() => onNavigateToView("playground")}
            className="p-5 text-left bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl space-y-2 group cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-max group-hover:bg-emerald-500 group-hover:text-white transition">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Scenario Playground</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Interact with pre-configured blueprint case files regarding common tenant, workplace, and claim disputes.
            </p>
          </button>

          <button
            onClick={() => onNavigateToView("faq")}
            className="p-5 text-left bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl space-y-2 group cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 w-max group-hover:bg-teal-500 group-hover:text-white transition">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-teal-400 transition">Legal AI Chat</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Inquire with our smart Legal AI companion desk regarding code references, state regulations, or negotiation tactics.
            </p>
          </button>

          <button
            onClick={() => onNavigateToView("library")}
            className="p-5 text-left bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl space-y-2 group cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 w-max group-hover:bg-sky-500 group-hover:text-white transition">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition">Rights Library</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Explore standardized civic acts and labor statutes to understand the official rules protecting your welfare.
            </p>
          </button>

          <button
            onClick={() => onNavigateToView("rehearsal")}
            className="p-5 text-left bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl space-y-2 group cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-max group-hover:bg-purple-500 group-hover:text-white transition">
              <Mic className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition">Vocal Rehearsal Coach</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Practice delivering boundary lines clearly. Analyze speech pace, pitch dynamics, and tone assertiveness.
            </p>
          </button>

          <button
            onClick={() => onNavigateToView("letterhead")}
            className="p-5 text-left bg-slate-900/20 border border-slate-900 hover:border-slate-800 rounded-2xl space-y-2 group cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-max group-hover:bg-amber-500 group-hover:text-white transition">
              <Stamp className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition">Certified Letterhead</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Draft formal notice letters referencing specific statutory violations with styled, printable layouts.
            </p>
          </button>
        </div>
      </div>

      {/* Safety Notice and Educational Disclaimer Card */}
      <div className="p-5 rounded-2xl border border-indigo-500/10 bg-indigo-950/5 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">Educational Platform Notice</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            AI Pocket Advocate does not provide certified attorney representation or official legal advice. All tools, audits, statute references, and dialogue replies are curated for general civilian rights literacy and educational simulation only. Always verify critical housing or wage claims with professional legal aid bureaus or qualified attorneys.
          </p>
        </div>
      </div>
    </div>
  );
}
