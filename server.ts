import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors"; // 1. Added CORS import
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";

// Load environment variables
dotenv.config();

const app = express();

// 2. Dynamic Port Selection for Render
const PORT = process.env.PORT || 3000; 

// 3. Enable CORS Configuration
// In production, change origin to your specific Vercel URL: "https://your-frontend.vercel.app"
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parse JSON request bodies up to 50MB (to allow audio base64 payload uploads)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add it to your secrets panel in Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// NOTE: Disk storage warning on Render Free Web Services
// A persistent database solution (PostgreSQL/Supabase) is strongly recommended for final rollout.
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], documents: [] }, null, 2), "utf8");
  }
}

function getDb() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return { users: [], documents: [] };
  }
}

function saveDb(data: any) {
  initDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Middleware to authenticate via Bearer token
function authenticateUser(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Sign-in required." });
  }
  const token = authHeader.split(" ")[1];
  const db = getDb();
  const user = db.users.find((u: any) => u.id === token);
  if (!user) {
    return res.status(401).json({ error: "Invalid session token. Please sign in again." });
  }
  req.user = user;
  next();
}

// Authentication - Register
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, name, password, address } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required." });
    }

    const db = getDb();
    const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "Email is already registered. Please sign in." });
    }

    const newUser = {
      id: "u_" + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      name,
      password, 
      address: address || "No address provided",
      created_at: new Date().toISOString(),
      isPremium: false,
      plan: "Free Starter"
    };

    db.users.push(newUser);
    saveDb(db);

    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ user: userWithoutPassword, token: newUser.id });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to register user." });
  }
});

// Authentication - Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const db = getDb();
    const user = db.users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    if (user.isPremium === undefined) {
      user.isPremium = false;
      user.plan = "Free Starter";
      saveDb(db);
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token: user.id });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to sign in." });
  }
});

// User Profile - Get current
app.get("/api/profile", authenticateUser, (req: any, res) => {
  const db = getDb();
  const user = db.users.find((u: any) => u.id === req.user.id);
  if (user && user.isPremium === undefined) {
    user.isPremium = false;
    user.plan = "Free Starter";
    saveDb(db);
  }
  const { password, ...userWithoutPassword } = user || req.user;
  res.json(userWithoutPassword);
});

// User Profile - Upgrade / Change subscription tier
app.post("/api/profile/upgrade", authenticateUser, async (req: any, res) => {
  try {
    const { plan, paymentDetails } = req.body;
    const db = getDb();
    const userIndex = db.users.findIndex((u: any) => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User profile not found." });
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (plan === "Free Starter" || !plan) {
      db.users[userIndex].isPremium = false;
      db.users[userIndex].plan = "Free Starter";
    } else {
      db.users[userIndex].isPremium = true;
      db.users[userIndex].plan = plan;
    }

    saveDb(db);

    const { password: _, ...updatedUser } = db.users[userIndex];
    res.json({
      success: true,
      message: `Successfully updated plan to ${plan}`,
      user: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to upgrade subscription tier." });
  }
});

// User Profile - Update profile
app.put("/api/profile", authenticateUser, (req: any, res) => {
  try {
    const { name, address, phone } = req.body;
    const db = getDb();
    const userIndex = db.users.findIndex((u: any) => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User profile not found." });
    }

    db.users[userIndex].name = name || db.users[userIndex].name;
    db.users[userIndex].address = address || db.users[userIndex].address;
    db.users[userIndex].phone = phone !== undefined ? phone : db.users[userIndex].phone;

    saveDb(db);

    const { password: _, ...updatedUser } = db.users[userIndex];
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// User Documents - Get all saved for current user
app.get("/api/documents", authenticateUser, (req: any, res) => {
  try {
    const db = getDb();
    const userDocs = db.documents.filter((d: any) => d.userId === req.user.id);
    res.json(userDocs);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch saved documents." });
  }
});

// User Documents - Save new document
app.post("/api/documents", authenticateUser, (req: any, res) => {
  try {
    const { title, category, opponentName, result, letterContent } = req.body;
    if (!title || !category || !result) {
      return res.status(400).json({ error: "Title, category, and analysis results are required." });
    }

    const db = getDb();
    const newDoc = {
      id: "doc_" + Math.random().toString(36).substr(2, 9),
      userId: req.user.id,
      timestamp: new Date().toISOString(),
      title,
      category,
      opponentName: opponentName || "Opponent",
      result,
      letterContent
    };

    db.documents.push(newDoc);
    saveDb(db);

    res.json(newDoc);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save document." });
  }
});

// User Documents - Delete
app.delete("/api/documents/:id", authenticateUser, (req: any, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const docIndex = db.documents.findIndex((d: any) => d.id === id && d.userId === req.user.id);

    if (docIndex === -1) {
      return res.status(404).json({ error: "Document not found or access denied." });
    }

    db.documents.splice(docIndex, 1);
    saveDb(db);

    res.json({ success: true, message: "Document deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete document." });
  }
});

// API endpoint to analyze audio or text conversations for legal rights
app.post("/api/analyze", async (req, res) => {
  try {
    const { text, audio, category, language } = req.body;

    if (!text && !audio) {
      res.status(400).json({ error: "Please provide either conversation text or recorded audio." });
      return;
    }

    const ai = getGeminiClient();

    let contents: any[] = [];
    let promptText = "";

    if (audio && audio.data && audio.mimeType) {
      contents.push({
        inlineData: {
          mimeType: audio.mimeType,
          data: audio.data,
        },
      });
      promptText = `Transcribe this recorded verbal conversation and perform a thorough rights advocacy analysis. `;
    } else {
      promptText = `Analyze the following copy-pasted conversation transcript for potential rights violations and shady demands:
---
${text}
---
`;
    }

    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish (Español)",
      zh: "Chinese (中文)",
      vi: "Vietnamese (Tiếng Việt)"
    };
    const targetLanguage = languageNames[language] || "English";

    promptText += `
Context Category (optional instruction, prioritize finding rights issues in this field): ${category || "General / Miscellaneous"}

Analyze this interaction carefully. Your task is to:
1. Provide a clean transcription or recreation of the verbal conversation.
2. Determine if any demands, statements, or terms are shady, pressure tactics, deceptive, or potentially violate standard civilian/consumer/tenant/employee rights.
3. Identify standard regulations or legal concepts (like tenant rights, Fair Labor Standards Act for employees, bad faith tactics for insurance, standard service warranties, etc.) that the user should be aware of.
4. Draft three guidance response options the user can say or write:
   - "firm": Assertive, direct, and sets strong, unyielding boundaries.
   - "legal": Professional and references standard rights, laws, or guidelines that demand compliance.
   - "polite": Softened, cooperative but protective, to keep things civil while not yielding any rights.
5. Provide a summary of the situation, along with a helpful disclaimer that this is educational guidance, not official legal counsel.

CRITICAL LANGUAGE REQUIREMENT:
The user's preferred language is ${targetLanguage}.
All user-facing fields in the generated JSON MUST be fully translated and written in ${targetLanguage}.
This includes:
- 'summary' (written in ${targetLanguage})
- 'violations' (all properties 'term', 'explanation', 'legalReference' must be in ${targetLanguage})
- 'replies' (both 'text' and 'rationale' for 'firm', 'legal', and 'polite' must be fully translated into ${targetLanguage})
The 'transcript' field should be represented in ${targetLanguage} if translated, or if the original input was in another language, translate it to ${targetLanguage} so the user can easily read it.

Ensure you respond in valid JSON format matching the requested schema. Do not include markdown wraps around the JSON inside the response (or if you do, ensure it parses as standard JSON).`;

    contents.push({ text: promptText });

    const systemInstruction = `You are AI Pocket Advocate, an expert legal rights guide. You help everyday tenants, employees, insurance policyholders, and customers level the playing field against landlords, bosses, or agents during negotiations. Identify pressure tactics, shady clauses, or rights violations, and provide reply templates (firm, legal, and polite). Always include a supportive, protective vibe and a brief educational disclaimer. You MUST output all response text in ${targetLanguage} when requested.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcript: {
              type: Type.STRING,
              description: "Transcribed text from the audio, or the processed/polished version of the input text if text was provided.",
            },
            negotiationType: {
              type: Type.STRING,
              description: "One of: landlord, employer, insurance, or general.",
            },
            riskLevel: {
              type: Type.STRING,
              description: "One of: low, medium, or high, depending on how shady or severe the violations are.",
            },
            summary: {
              type: Type.STRING,
              description: "A summary of what happened, highlighting major concerns and a brief friendly disclaimer that this is educational guidance, not official legal counsel.",
            },
            violations: {
              type: Type.ARRAY,
              description: "List of detected shady statements, pressure tactics, or potential rights violations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  term: {
                    type: Type.STRING,
                    description: "The specific shady phrase, demand, or argument used by the opposing party.",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Why this demand is suspicious, unfair, or potentially illegal.",
                  },
                  legalReference: {
                    type: Type.STRING,
                    description: "General legal principle, standard tenant/employee/consumer protection laws, or acts (e.g. security deposit timelines, overtime laws, bad faith claims) to reference.",
                  }
                },
                required: ["term", "explanation", "legalReference"]
              }
            },
            replies: {
              type: Type.OBJECT,
              properties: {
                firm: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: "Assertive, clear, and direct reply that sets boundaries immediately." },
                    rationale: { type: Type.STRING, description: "Why/when to use this assertive reply." }
                  },
                  required: ["text", "rationale"]
                },
                legal: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: "A highly informed reply that professionally references standard legal protections or rights." },
                    rationale: { type: Type.STRING, description: "When to use this legal reference reply (e.g., if they push back or persist)." }
                  },
                  required: ["text", "rationale"]
                },
                polite: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: "A collaborative, cooperative, yet protective reply to de-escalate tension." },
                    rationale: { type: Type.STRING, description: "When to use this de-escalation reply." }
                  },
                  required: ["text", "rationale"]
                }
              },
              required: ["firm", "legal", "polite"]
            }
          },
          required: ["transcript", "negotiationType", "riskLevel", "summary", "violations", "replies"]
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response generated from Gemini.");
    }

    const data = JSON.parse(responseText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze conversation. Please make sure your Gemini API key is configured correctly."
    });
  }
});

// AI-Powered Legal FAQ Chatbot Endpoint
app.post("/api/faq-chat", async (req, res) => {
  try {
    const { question, category, language } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Please enter a question." });
    }

    const ai = getGeminiClient();
    const resolvedCategory = category || "general";

    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish (Español)",
      zh: "Chinese (中文)",
      vi: "Vietnamese (Tiếng Việt)"
    };
    const targetLanguage = languageNames[language] || "English";

    const systemPrompt = `You are the AI Pocket Advocate General Legal Rights Educator. Your job is to answer user questions about ${resolvedCategory} rights in a structured, clear, and highly educational manner. 
Always divide your response into three clear sections:
1. "The Simple Answer": 1-2 sentences summarizing the rule.
2. "Under the Law": Explaining the exact statutory principles (e.g. 21-day or 30-day deadlines for deposits, FLSA requirements for overtime, or policyholder timelines for claims).
3. "De-escalation Advice": Actions they can take to raise this directly and professionally with their opponent.

CRITICAL LANGUAGE REQUIREMENT:
The user's preferred language is ${targetLanguage}. You MUST write the ENTIRE response (all three sections, plus the educational disclaimer) in ${targetLanguage}. Do not write in English unless English is the selected language.

Remember: Include a standard educational disclaimer that this is for educational purposes and not a substitute for formal attorney counsel. Keep answers concise, direct, and empathetic. Do not use markdown headers that are too deep.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `Category: ${resolvedCategory}\nQuestion: ${question}` }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2
      }
    });

    const answer = response.text || "No response received from AI model.";
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate AI response." });
  }
});

// 4. Cleaned up standalone API Execution Server 
// (Decoupled from serving Vite static assets since Vercel handles that natively)
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`AI Pocket Advocate API backend running on port ${PORT}`)
});
