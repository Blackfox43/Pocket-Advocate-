export interface Violation {
  term: string;
  explanation: string;
  legalReference: string;
}

export interface ReplyOption {
  text: string;
  rationale: string;
}

export interface Replies {
  firm: ReplyOption;
  legal: ReplyOption;
  polite: ReplyOption;
}

export interface AnalysisResult {
  transcript: string;
  negotiationType: "landlord" | "employer" | "insurance" | "general";
  riskLevel: "low" | "medium" | "high";
  summary: string;
  violations: Violation[];
  replies: Replies;
}

export interface PresetScenario {
  id: string;
  title: string;
  category: "landlord" | "employer" | "insurance" | "general";
  opponentName: string;
  opponentRole: string;
  topic: string;
  text: string;
}

export interface SavedSession {
  id: string;
  timestamp: string;
  title: string;
  category: "landlord" | "employer" | "insurance" | "general";
  opponentName: string;
  result: AnalysisResult;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  address: string;
  phone?: string;
  created_at: string;
}

export interface UserSavedDocument {
  id: string;
  userId: string;
  timestamp: string;
  title: string;
  category: "landlord" | "employer" | "insurance" | "general";
  opponentName: string;
  result: AnalysisResult;
  letterContent?: string;
}

