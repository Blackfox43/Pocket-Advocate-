import React, { useState } from "react";
import { 
  ClipboardCheck, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, ShieldCheck, Scale, FileText, HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface IntakeWizardProps {
  category: "landlord" | "employer" | "insurance" | "general";
  onApplyIntakeText: (text: string) => void;
}

interface Question {
  id: string;
  text: string;
  options: { label: string; value: string; weight: "critical" | "warning" | "safe" }[];
}

export default function IntakeWizard({ category, onApplyIntakeText }: IntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Dynamic Questions based on current selected category
  const getQuestionsForCategory = (): Question[] => {
    switch (category) {
      case "landlord":
        return [
          {
            id: "issue",
            text: "What is the primary tenant issue you are currently facing?",
            options: [
              { label: "Security deposit withholder or excessive deductions", value: "Security deposit withholding", weight: "critical" },
              { label: "Uninhabitable living conditions / Repair neglect", value: "Habitability & repair failures", weight: "critical" },
              { label: "Illegal eviction threats or lease termination", value: "Eviction threat", weight: "critical" },
              { label: "Landlord harassment or landlord entering without notice", value: "Harassment & privacy violation", weight: "warning" },
            ]
          },
          {
            id: "timeframe",
            text: "How long has this issue or lease violation been ongoing?",
            options: [
              { label: "More than 30 days", value: "More than 30 days without resolution", weight: "critical" },
              { label: "15 to 30 days", value: "15-30 days", weight: "warning" },
              { label: "Less than 15 days", value: "Less than 15 days", weight: "safe" },
            ]
          },
          {
            id: "documentation",
            text: "Do you have photos, emails, rent receipts, or text messages documenting this?",
            options: [
              { label: "Yes, I have thorough documentation and written logs", value: "Thorough proof and written logs", weight: "safe" },
              { label: "Some written messages, but no formal files", value: "Partial message trail", weight: "warning" },
              { label: "No documentation or proof exists yet", value: "No current logs or files", weight: "critical" },
            ]
          },
          {
            id: "notice",
            text: "Have you sent a formal, written demand letter or written notice to the landlord?",
            options: [
              { label: "No, only text messages/phone calls", value: "No formal written demand sent yet", weight: "warning" },
              { label: "Yes, and they ignored it or refused to comply", value: "Formal demand was ignored/refused", weight: "critical" },
              { label: "Not applicable", value: "N/A", weight: "safe" },
            ]
          }
        ];
      case "employer":
        return [
          {
            id: "issue",
            text: "What is the primary workplace violation or concern?",
            options: [
              { label: "Unpaid hours, off-the-clock work, or missing overtime pay", value: "Unpaid hours & overtime pay", weight: "critical" },
              { label: "Denied rest/meal breaks or continuous working shifts", value: "Denied meal/rest breaks", weight: "warning" },
              { label: "Boss retaliating because I spoke up or complained", value: "Workplace retaliation", weight: "critical" },
              { label: "Misclassified as 1099 Contractor instead of W2 Employee", value: "1099/W2 Misclassification", weight: "critical" },
            ]
          },
          {
            id: "records",
            text: "Do you have personal logs of hours worked, schedules, or paystubs?",
            options: [
              { label: "Yes, complete hourly timesheets and paystub records", value: "Complete personal schedules & paystubs", weight: "safe" },
              { label: "Partial calendar notes, but no official paystubs", value: "Partial calendar logs", weight: "warning" },
              { label: "No logs or records of hours worked", value: "No current logs", weight: "critical" },
            ]
          },
          {
            id: "exempt",
            text: "Are you paid an hourly wage (non-exempt) or salaried?",
            options: [
              { label: "Hourly wage / Non-exempt status", value: "Hourly / Non-exempt", weight: "safe" },
              { label: "Salaried employee performing non-administrative tasks", value: "Salaried with non-administrative tasks", weight: "warning" },
              { label: "1099 Independent contractor performing core work", value: "Misclassified 1099 status", weight: "critical" },
            ]
          }
        ];
      case "insurance":
        return [
          {
            id: "issue",
            text: "What is the primary claim issue you are facing?",
            options: [
              { label: "Wrongful denial of a covered property or medical claim", value: "Wrongful coverage denial", weight: "critical" },
              { label: "Severe delays (more than 40 days) in claim review/decision", value: "Unreasonable claim delay", weight: "critical" },
              { label: "Lowball estimate that doesn't cover actual repair costs", value: "Underpaid/Lowball claims estimate", weight: "warning" },
              { label: "Claims adjuster refuses to return calls or respond", value: "Claims department silent/ghosting", weight: "warning" },
            ]
          },
          {
            id: "estimate",
            text: "Do you have independent repair contractor estimates or damage reports?",
            options: [
              { label: "Yes, professional itemized quotes from contractors", value: "Independent contractor repair estimates", weight: "safe" },
              { label: "No, only the adjuster's estimate", value: "No independent adjusters or reports", weight: "warning" },
            ]
          },
          {
            id: "written",
            text: "Did the insurance company provide a written explanation referencing specific policy terms?",
            options: [
              { label: "No, they just denied it verbally or via a brief email", value: "No formal written policy explanation", weight: "critical" },
              { label: "Yes, but they are misinterpreting my policy language", value: "Incorrect policy exclusions referenced", weight: "warning" },
              { label: "Not applicable / Still waiting", value: "N/A", weight: "safe" },
            ]
          }
        ];
      default:
        return [
          {
            id: "issue",
            text: "What is the main legal or financial concern?",
            options: [
              { label: "Unfair fee, bill surcharge, or hidden charges", value: "Unfair billing or hidden fees", weight: "warning" },
              { label: "Breach of contract or broken formal agreement", value: "Breach of contract agreement", weight: "critical" },
              { label: "Consumer protection or false advertising violation", value: "Consumer protection violation", weight: "warning" },
            ]
          },
          {
            id: "evidence",
            text: "Do you have a signed copy of the original contract or invoice?",
            options: [
              { label: "Yes, fully signed contract and receipt logs", value: "Signed agreements and invoice logs", weight: "safe" },
              { label: "No, only verbal agreements or email threads", value: "Only verbal/email confirmation", weight: "warning" },
            ]
          }
        ];
    }
  };

  const questions = getQuestionsForCategory();

  const handleOptionSelect = (optionValue: string) => {
    const nextAnswers = { ...answers, [questions[currentStep].id]: optionValue };
    setAnswers(nextAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setShowResults(false);
  };

  const calculateRiskDetails = () => {
    let criticalCount = 0;
    let warningCount = 0;

    questions.forEach((q) => {
      const selectedValue = answers[q.id];
      const option = q.options.find((o) => o.value === selectedValue);
      if (option?.weight === "critical") criticalCount++;
      if (option?.weight === "warning") warningCount++;
    });

    let riskLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
    let colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    let summaryText = "";

    if (criticalCount >= 2) {
      riskLevel = "HIGH";
      colorClass = "text-red-400 bg-red-500/10 border-red-500/20";
      summaryText = "Critical violations identified. You have statutory grounds to issue an immediate formal demand letter citing precise state regulations.";
    } else if (criticalCount === 1 || warningCount >= 2) {
      riskLevel = "MEDIUM";
      colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      summaryText = "Actionable violations found. A formal written de-escalation notice is highly recommended to protect your rights before escalating to small claims.";
    } else {
      riskLevel = "LOW";
      colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      summaryText = "Early stage or low legal risk. Proceed with structured, written correspondence to establish a robust paper trail.";
    }

    return { riskLevel, colorClass, summaryText, criticalCount, warningCount };
  };

  const handleGenerateSummaryText = () => {
    const { riskLevel, summaryText } = calculateRiskDetails();
    
    // Construct case description
    let text = `INTAKE DIAGNOSTIC SUMMARY:\n`;
    text += `- Category: ${category.toUpperCase()}\n`;
    text += `- Calculated Risk Level: ${riskLevel}\n`;
    questions.forEach((q) => {
      text += `- ${q.text}: ${answers[q.id] || "N/A"}\n`;
    });
    text += `\nSUMMARY FINDINGS:\n${summaryText}\n\n`;
    text += `Hello, I would like to analyze the following case description to generate a formal dispute letter and check legal references:\n\n`;
    
    // Create detailed case text based on category
    if (category === "landlord") {
      text += `My landlord is committing a potential lease violation related to ${answers["issue"]}. This issue has been going on for ${answers["timeframe"]}. I have ${answers["documentation"]} and ${answers["notice"]}. Please review my rights under landlord-tenant law.`;
    } else if (category === "employer") {
      text += `My employer has failed to comply with workplace labor laws regarding ${answers["issue"]}. I have ${answers["records"]}. My pay structure is ${answers["exempt"]}. Please evaluate FLSA compliance.`;
    } else if (category === "insurance") {
      text += `The claims department is committing bad faith or policy violations regarding ${answers["issue"]}. I have ${answers["estimate"]} and ${answers["written"]}. Please evaluate my statutory consumer rights.`;
    } else {
      text += `We have a contract dispute or consumer protection concern regarding ${answers["issue"]}. I have ${answers["evidence"]}. Please check legal remedies.`;
    }

    onApplyIntakeText(text);
  };

  return (
    <div className="bg-slate-950/40 rounded-2xl border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
        <ClipboardCheck className="w-4 h-4 text-indigo-400" />
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          Case Intake Pre-Screener
        </h3>
        <span className="text-[9px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-500/20 ml-auto">
          Wizard
        </span>
      </div>

      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Progress bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Question {currentStep + 1} of {questions.length}</span>
              <span>{Math.round(((currentStep + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>

            <p className="text-xs font-semibold text-white leading-relaxed">
              {questions[currentStep]?.text}
            </p>

            <div className="space-y-2.5 pt-1">
              {questions[currentStep]?.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleOptionSelect(opt.value)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-indigo-500 hover:bg-slate-900/60 text-xs text-slate-300 hover:text-white font-medium transition cursor-pointer flex items-center justify-between gap-2"
                >
                  <span>{opt.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Intake Assessment Results Display */}
            {(() => {
              const { riskLevel, colorClass, summaryText } = calculateRiskDetails();
              return (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${colorClass}`}>
                    {riskLevel === "HIGH" ? (
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <Scale className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider">
                        Risk & De-escalation Assessment
                      </div>
                      <h4 className="text-sm font-bold mt-1">
                        {riskLevel} RISK PROFILE
                      </h4>
                      <p className="text-xs leading-relaxed opacity-90 mt-1.5 font-sans">
                        {summaryText}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-xl space-y-2.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">
                      Selected Responses Summary
                    </span>
                    <div className="space-y-1.5 text-[11px] text-slate-400">
                      {questions.map((q) => (
                        <div key={q.id} className="flex justify-between gap-4 border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-slate-500 truncate max-w-[200px]">{q.text}</span>
                          <span className="font-semibold text-slate-300 text-right shrink-0">{answers[q.id]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Re-Assess
                    </button>

                    <button
                      onClick={handleGenerateSummaryText}
                      className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Apply & Pre-Fill Editor
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
