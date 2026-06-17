import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Initialize Supabase Client
const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("WARNING: SUPABASE_URL or SUPABASE_ANON_KEY is not defined in the environment. Falling back to local storage.");
    return null;
  }
  const cleanUrl = url.replace(/\/rest\/v1\/?$/, '');
  return createClient(cleanUrl, key);
};

const mapRowToPortfolio = (row: any) => {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    resumeData: row.resume_data || row.resumeData || {},
    templateId: row.template_id || row.templateId || 'creators-warmth',
    themeColor: row.theme_color || row.themeColor || 'royal-indigo',
    published: row.published !== undefined ? row.published : true,
    isPro: row.is_pro !== undefined ? row.is_pro : (row.isPro !== undefined ? row.isPro : false),
    brandingHidden: row.branding_hidden !== undefined ? row.branding_hidden : (row.brandingHidden !== undefined ? row.brandingHidden : false),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
};

const app = express();
const PORT = 3000;

// Body parsing with enlarged limit for resume files
app.use(express.json({ limit: '15mb' }));

// Ensure a reliable JSON-based storage file directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'portfolios.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

// Helper to read/write persistent portfolios
const readPortfolios = (): Record<string, any> => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};

const writePortfolios = (data: Record<string, any>) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Initialize GoogleGenAI SDK safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI features will require custom fallback.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY_FALLBACK",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

/**
 * Robust helper to call Gemini generateContent with automatic exponential backoff
 * and alternative model fallback when encountering 503 Unavailable, 429 Rate Limits,
 * or "high demand" errors.
 */
async function generateContentWithRetry(
  gemini: any,
  params: { model: string; contents: any; config?: any },
  maxAttempts = 3
) {
  let lastError: any = null;
  const modelsToTry = [params.model, 'gemini-3.1-flash-lite'];

  for (const modelName of modelsToTry) {
    let attempt = 0;
    let delay = 1000; // start with 1 second delay
    while (attempt < maxAttempts) {
      try {
        console.log(`[Gemini API] Querying model ${modelName} (Attempt ${attempt + 1}/${maxAttempts})...`);
        const response = await gemini.models.generateContent({
          ...params,
          model: modelName
        });
        return response;
      } catch (error: any) {
        attempt++;
        lastError = error;
        const errMsg = error.message || String(error);
        
        // Match 503, UNAVAILABLE, 429, ResourceExhausted, and "high demand" / temporary overload alerts
        const isTemporary = errMsg.includes("503") || 
                            errMsg?.toLowerCase().includes("unavailable") || 
                            errMsg?.toLowerCase().includes("high demand") || 
                            errMsg?.toLowerCase().includes("overloaded") ||
                            errMsg?.toLowerCase().includes("rate limit") ||
                            errMsg?.toLowerCase().includes("resource exhausted") ||
                            errMsg.includes("429");
                            
        if (isTemporary && attempt < maxAttempts) {
          console.warn(`[Gemini API] Temporary error on ${modelName}: "${errMsg}". Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        } else {
          console.error(`[Gemini API] Failed on model ${modelName} (Attempt ${attempt}/${maxAttempts}):`, errMsg);
          break; // break the inner loop to shift to alternative model
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content after retries and model fallbacks");
}

// API: Parse Resume PDF / Text
app.post('/api/parse-resume', async (req, res) => {
  try {
    const { fileType, fileData, rawText } = req.body;

    const gemini = getGeminiClient();
    let promptSubject = "";

    // Build the request contents array
    const contents: any[] = [];

    if (fileType === 'pdf' && fileData) {
      // Pass base64 direct to Gemini
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: fileData, // raw base64 string
        }
      });
      promptSubject = "this uploaded PDF resume document";
    } else if (rawText) {
      contents.push({
        text: rawText
      });
      promptSubject = "this pasted raw text resume description";
    } else {
      return res.status(400).json({ error: "Missing resume data (need pdf base64 fileData or rawText)" });
    }

    const systemInstructions = `You are an expert ATS (Applicant Tracking System) parser and resume ingestion specialist.
Analyze ${promptSubject} very thoroughly. Extract clean, complete, and formatted information structure matching the specified JSON schema.
Ensure to map:
- Experience: all past employment history, keeping descriptions detailed as individual bullet list representations or paragraphs.
- Education: school, degree, dates.
- Skills: clear professional keywords.
- Projects: any portfolio items, GitHub repositories, or side projects with technology stacks.
- Contact/Links: email, LinkedIn, GitHub, etc. If missing, leave empty instead of fabricating values.
Generate stable/short IDs (e.g., 'exp1', 'exp2') for lists.`;

    contents.push(systemInstructions);

    const response = await generateContentWithRetry(gemini, {
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Candidate's full name" },
            title: { type: Type.STRING, description: "Professional title or headline" },
            summary: { type: Type.STRING, description: "Broad multi-sentence summary of experience" },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING, description: "E.g. Oct 2023 or Present" },
                  description: { type: Type.STRING, description: "Bullet points or narrative summary" }
                },
                required: ["id", "company", "role", "startDate", "endDate", "description"]
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING }
                },
                required: ["id", "institution", "degree", "startDate", "endDate"]
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            links: {
              type: Type.OBJECT,
              properties: {
                email: { type: Type.STRING },
                github: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                twitter: { type: Type.STRING },
                portfolio: { type: Type.STRING }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  url: { type: Type.STRING },
                  techStack: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["id", "title", "description"]
              }
            }
          },
          required: ["name", "title", "summary", "experience", "education", "skills", "links", "projects"]
        }
      }
    });

    const parsedJsonText = response.text || "{}";
    const parsedData = JSON.parse(parsedJsonText);
    res.json({ parsed: parsedData });
  } catch (error: any) {
    console.error("Resume parsing endpoint error:", error);
    res.status(500).json({ error: error.message || "Unable to parse resume through Gemini API" });
  }
});

// API: AI Enhancement Endpoint
app.post('/api/enhance', async (req, res) => {
  try {
    const { resume, promptType, specInstruction } = req.body;
    if (!resume) {
      return res.status(400).json({ error: "No resume data provided for expansion" });
    }

    const gemini = getGeminiClient();
    const promptInstructions = `You are a high-end corporate copywriter and website positioning architect.
We have a user's resume data:
${JSON.stringify(resume, null, 2)}

Provide an updated/enhanced copy of the resume. Reorganize into better, more engaging web portfolio headlines.
Tasks:
1. Re-phrase 'summary' into an elegant corporate introduction or bio paragraph.
2. Polish each 'experience' description to emphasize concrete accomplishments and impact. Keep them professional.
3. Formulate an incredibly snappy and compelling visual tagline/motto for their website headline.
${specInstruction ? `Additional Custom Directive: "${specInstruction}"` : ''}

Return the enhanced resume in JSON format matching the schema exactly. Keep same structural arrays but rewrite descriptions, summary, and title to be highly persuasive for a public portfolio.`;

    const response = await generateContentWithRetry(gemini, {
      model: 'gemini-3.5-flash',
      contents: promptInstructions,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            title: { type: Type.STRING },
            summary: { type: Type.STRING, description: "Polished multi-sentence bio paragraph" },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  role: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Polished achievements, using actionable copywriting" }
                },
                required: ["id", "company", "role", "startDate", "endDate", "description"]
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING }
                },
                required: ["id", "institution", "degree", "startDate", "endDate"]
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            links: {
              type: Type.OBJECT,
              properties: {
                email: { type: Type.STRING },
                github: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                twitter: { type: Type.STRING },
                portfolio: { type: Type.STRING }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING, description: "Polished project explanation" },
                  url: { type: Type.STRING },
                  techStack: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["id", "title", "description"]
              }
            }
          },
          required: ["name", "title", "summary", "experience", "education", "skills", "links", "projects"]
        }
      }
    });

    const parsedJsonText = response.text || "{}";
    const parsedData = JSON.parse(parsedJsonText);
    res.json({ enhanced: parsedData });
  } catch (error: any) {
    console.error("Enhancement endpoint error:", error);
    res.status(500).json({ error: error.message || "Failed to process enhancement rules" });
  }
});

// API: Supabase Integration Status and SQL generation
app.get('/api/supabase-status', async (req, res) => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return res.json({
      configured: false,
      connected: false,
      tableExists: false,
      error: 'Credentials missing in env files.'
    });
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error("Unable to construct Supabase client");
    }

    // Try reading one from portfolios table to verify existence
    const { error } = await supabase.from('portfolios').select('id').limit(1);

    if (error) {
      const tableMissing = error.message?.includes('relation') && error.message?.includes('does not exist');
      return res.json({
        configured: true,
        connected: !tableMissing,
        tableExists: false,
        error: error.message,
        code: error.code,
        sql: `create table if not exists portfolios (
  id text primary key,
  username text unique not null,
  resume_data jsonb not null default '{}'::jsonb,
  template_id text not null default 'creators-warmth',
  theme_color text not null default 'royal-indigo',
  published boolean not null default true,
  is_pro boolean not null default false,
  branding_hidden boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row-Level Security
alter table portfolios enable row level security;

-- Create policies for anonymous access
create policy "Allow public read-only access on portfolios"
  on portfolios for select
  using (true);

create policy "Allow all operations for anonymous clients"
  on portfolios for all
  using (true)
  with check (true);`
      });
    }

    return res.json({
      configured: true,
      connected: true,
      tableExists: true
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      connected: false,
      tableExists: false,
      error: err.message
    });
  }
});

// API: Resolve Portfolio by Username
app.get('/api/portfolios/:username', async (req, res) => {
  const { username } = req.params;
  const normalizedUsername = username.toLowerCase().trim();

  // Try Supabase first
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('username', normalizedUsername)
        .maybeSingle();

      if (!error && data) {
        return res.json(mapRowToPortfolio(data));
      }
      if (error) {
        console.warn("Supabase fetch failed", error.message);
      }
    } catch (err: any) {
      console.warn("Supabase fetch database error:", err.message);
    }
  }

  // Fallback to local storage
  const portfolios = readPortfolios();
  const match = Object.values(portfolios).find(
    (p: any) => p.username.toLowerCase() === normalizedUsername
  );

  if (!match) {
    return res.status(404).json({ error: "Portfolio not found in Supabase or local storage fallback" });
  }
  res.json(match);
});

// API: Save or Update Portfolio
app.post('/api/portfolios', async (req, res) => {
  const { portfolio } = req.body;
  if (!portfolio || !portfolio.username) {
    return res.status(400).json({ error: "Invalid portfolio payload" });
  }

  const normalizedUsername = portfolio.username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
  if (!normalizedUsername) {
    return res.status(400).json({ error: "Username must consist of valid alphanumeric tokens" });
  }

  // Check collision in Supabase first (if configured)
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: match, error: checkError } = await supabase
        .from('portfolios')
        .select('id, username')
        .eq('username', normalizedUsername)
        .maybeSingle();

      if (!checkError && match && match.id !== portfolio.id) {
        return res.status(400).json({ error: `The username '${normalizedUsername}' is already taken in Supabase.` });
      }
    } catch (err: any) {
      console.warn("Supabase collision check bypassed due to error:", err.message);
    }
  }

  // Check collision in Local fallback Database
  const portfolios = readPortfolios();
  const collision = Object.values(portfolios).find(
    (p: any) => p.id !== portfolio.id && p.username.toLowerCase() === normalizedUsername
  );

  if (collision) {
    return res.status(400).json({ error: `The username '${normalizedUsername}' is already taken in the local storage database.` });
  }

  // Update dates
  const newPortfolio = {
    ...portfolio,
    username: normalizedUsername,
    updatedAt: new Date().toISOString()
  };

  // Try saving to Supabase
  let savedToSupabase = false;
  let supabaseErrorDetails = null;

  if (supabase) {
    try {
      const { error } = await supabase
        .from('portfolios')
        .upsert({
          id: newPortfolio.id,
          username: normalizedUsername,
          resume_data: newPortfolio.resumeData || {},
          template_id: newPortfolio.templateId || 'creators-warmth',
          theme_color: newPortfolio.themeColor || 'royal-indigo',
          published: newPortfolio.published !== undefined ? newPortfolio.published : true,
          is_pro: newPortfolio.isPro || false,
          branding_hidden: newPortfolio.brandingHidden || false,
          updated_at: newPortfolio.updatedAt
        }, { onConflict: 'id' });

      if (!error) {
        savedToSupabase = true;
      } else {
        supabaseErrorDetails = error.message;
        console.error("Supabase upsert failed:", error.message);
      }
    } catch (err: any) {
      supabaseErrorDetails = err.message;
      console.error("Supabase upsert error:", err.message);
    }
  }

  // Always write to local storage as fallback/complement to ensure full state parity!
  portfolios[newPortfolio.id] = newPortfolio;
  writePortfolios(portfolios);

  res.json({
    success: true,
    portfolio: newPortfolio,
    savedToSupabase,
    supabaseErrorDetails
  });
});


// Start integration server
async function boot() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Folio Server] Live and listening at http://localhost:${PORT}`);
  });
}

boot().catch(err => {
  console.error("Critical server boot error:", err);
});
