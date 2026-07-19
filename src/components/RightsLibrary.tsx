import { useState } from "react";
import { BookOpen, Search, ShieldCheck, Home, Briefcase, FileText, ChevronDown, ChevronUp, Scale, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ResourceItem {
  title: string;
  act: string;
  category: "landlord" | "employer" | "insurance" | "general";
  summary: string;
  keyRule: string;
}

export default function RightsLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "landlord" | "employer" | "insurance">("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const libraryData: ResourceItem[] = [
    {
      title: "Security Deposit Return Deadlines",
      act: "State Security Deposit Laws (e.g. CA Civ. Code § 1950.5)",
      category: "landlord",
      summary: "Most states require landlords to return security deposits or provide an itemized list of deductions for damages within a specific legal timeframe after move-out.",
      keyRule: "Deductions for standard wear and tear (e.g. minor paint fading, routine cleaning) are illegal. Deadlines range from 14 to 30 days depending on the state.",
    },
    {
      title: "Overtime Pay Regulations",
      act: "Fair Labor Standards Act (FLSA) - 29 U.S.C. § 207",
      category: "employer",
      summary: "Non-exempt employees must receive overtime pay for hours worked over 40 per workweek at a rate not less than 1.5 times their regular rate.",
      keyRule: "Employers cannot offer 'comp time' in lieu of cash overtime pay, nor can they demand voluntary unpaid weekend auditing work.",
    },
    {
      title: "Bad Faith Claims Denial",
      act: "Unfair Claims Settlement Practices Act (State Insurance Codes)",
      category: "insurance",
      summary: "Insurance companies owe a duty of good faith and fair dealing to policyholders. They must investigate, process, and pay legitimate claims promptly.",
      keyRule: "Denying a claim automatically using arbitrary algorithms without performing an actual field inspection can constitute illegal bad faith behavior.",
    },
    {
      title: "Quiet Enjoyment and Landlord Entry",
      act: "Covenant of Quiet Enjoyment & Entry Notice Laws",
      category: "landlord",
      summary: "Every tenant is entitled to quiet enjoyment of their home. Landlords cannot enter without prior formal notice except in emergencies.",
      keyRule: "Landlords must provide written notice (typically 24 or 48 hours) before accessing the unit for standard repairs or inspections.",
    },
    {
      title: "Retaliatory Eviction & Demotion Protections",
      act: "Whistleblower & Retaliation Protection Regulations",
      category: "employer",
      summary: "It is unlawful for a landlord or employer to punish, demote, fire, or evict an individual for asserting their basic civil rights.",
      keyRule: "Filing a formal safety complaint, requesting overtime pay, or raising code violations creates a strong legal presumption of protection against retaliation.",
    },
    {
      title: "Constructive Eviction Standards",
      act: "Implied Warranty of Habitability",
      category: "landlord",
      summary: "Landlords must maintain properties in safe, sanitary, and fully liveable condition. This includes heat, running water, locks, and structural safety.",
      keyRule: "Failure to fix severe violations (like toxic black mold, missing heat in winter) allows tenants to withhold rent or repair-and-deduct in many jurisdictions.",
    }
  ];

  const filteredData = libraryData.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.act.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Interactive Rights & Regulations Library</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">STATE & NATIONAL CIVIC CODES</span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Quickly look up foundational civilian protections. These standard acts and regulations protect everyday citizens from unfair exploitation.
      </p>

      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search regulations (e.g., FLSA, deposit)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 outline-none transition"
          />
        </div>

        {/* Categories Tab Pill */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
          {(["all", "landlord", "employer", "insurance"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-medium capitalize transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-2">
        {filteredData.length === 0 ? (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20 text-center text-xs text-slate-500">
            No matching regulations or acts found in this lookup.
          </div>
        ) : (
          filteredData.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-800/80 bg-slate-950/40 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="w-full text-left p-3.5 flex items-start justify-between gap-4 hover:bg-slate-900/20 transition"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {item.category === "landlord" && <Home className="w-3.5 h-3.5 text-emerald-400" />}
                      {item.category === "employer" && <Briefcase className="w-3.5 h-3.5 text-blue-400" />}
                      {item.category === "insurance" && <FileText className="w-3.5 h-3.5 text-purple-400" />}
                      {item.category === "general" && <Scale className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-mono text-indigo-400/80 truncate mt-0.5">
                        {item.act}
                      </p>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800/40 bg-slate-900/10 px-4 pb-4 pt-3 text-xs"
                    >
                      <div className="space-y-2.5 pl-8">
                        <div>
                          <span className="font-mono text-[9px] text-slate-500 block mb-0.5">OVERVIEW</span>
                          <p className="text-slate-300 leading-relaxed">
                            {item.summary}
                          </p>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono text-[9px] text-emerald-400 block mb-0.5">CRITICAL PROTECTION / KEY RULE</span>
                            <p className="text-slate-200 font-sans leading-relaxed">
                              {item.keyRule}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/30 flex items-center gap-2 text-[10px] text-indigo-300">
        <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>Use these references when editing notice templates or asserting claims to bolster credibility.</span>
      </div>
    </div>
  );
}
