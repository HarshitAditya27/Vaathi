require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GEMINI_KEY = process.env.GOOGLE_API_KEY;
if (!GEMINI_KEY) console.warn("[server] Missing GOOGLE_API_KEY in .env");

const BASE = "https://generativelanguage.googleapis.com/v1";

// Candidate v1 model IDs (order matters). We’ll probe and cache the first that works.
const MODEL_CANDIDATES = [
  "models/gemini-1.5-flash-latest",
  "models/gemini-1.5-pro-latest",
  "models/gemini-1.5-flash-8b-latest",
  // fallback legacy aliases if needed:
  "models/gemini-1.5-flash",
  "models/gemini-1.5-pro",
];

let SELECTED_MODEL = null;

async function listModels() {
  const url = `${BASE}/models?key=${encodeURIComponent(GEMINI_KEY)}`;
  const r = await fetch(url);
  const raw = await r.text();
  if (!r.ok) throw new Error(`ListModels ${r.status}: ${raw}`);
  return JSON.parse(raw);
}

async function probeModel(id) {
  const url = `${BASE}/${id}:generateContent?key=${encodeURIComponent(
    GEMINI_KEY
  )}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: 'Return only: {"ok":true}' }] }],
    generationConfig: { temperature: 0.0, maxOutputTokens: 20 },
  };
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await r.text();
  if (!r.ok) {
    console.log(`[probe] ${id} → ${r.status}`);
    return false;
  }
  // basic sanity
  return raw.includes('"ok":true') || raw.includes("ok");
}

async function ensureModelSelected() {
  if (SELECTED_MODEL) return SELECTED_MODEL;
  for (const id of MODEL_CANDIDATES) {
    try {
      const ok = await probeModel(id);
      if (ok) {
        SELECTED_MODEL = id;
        console.log("[gemini] selected model:", SELECTED_MODEL);
        return SELECTED_MODEL;
      }
    } catch (_) {}
  }
  throw new Error("No compatible Gemini model found for this API key.");
}

async function geminiGenerateText(prompt) {
  const modelId = await ensureModelSelected();
  const url = `${BASE}/${modelId}:generateContent?key=${encodeURIComponent(
    GEMINI_KEY
  )}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 900 },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await resp.text();
  if (!resp.ok) {
    console.error("[gemini] HTTP", resp.status, raw.slice(0, 200));
    throw new Error(`Gemini error ${resp.status}`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from Gemini");
  }
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  return text || "";
}

function safeParseJSON(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {}
  const m = text.match(/\{[\s\S]*\}$/m);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {}
  }
  return fallback;
}

/* -------------------- ROUTES -------------------- */

app.get("/api/ping", (req, res) =>
  res.json({ ok: true, model: SELECTED_MODEL })
);

// Inspect what models your key can see
app.get("/api/gemini-models", async (req, res) => {
  try {
    const models = await listModels();
    res.json({
      count: models.models?.length ?? 0,
      names: (models.models || []).map((m) => m.name),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Study Guide
app.post("/api/study-guide", async (req, res) => {
  try {
    const { topic } = req.body || {};
    if (!topic) return res.status(400).json({ error: "topic is required" });

    const prompt = `
You are EduMind. Respond ONLY with valid JSON in this schema:
{"topic":"<topic>","explanation":"<4-8 sentence explanation>","quiz":[{"q":"...","a":"..."},{"q":"...","a":"..."},{"q":"...","a":"..."}]}
No markdown, no code fences, no extra text.
Topic: ${topic}`;

    const text = await geminiGenerateText(prompt);
    const parsed = safeParseJSON(text, {
      topic,
      explanation: text || "No response",
      quiz: [],
    });
    if (!Array.isArray(parsed.quiz)) parsed.quiz = [];
    res.json(parsed);
  } catch (e) {
    console.error("[study-guide]", e.message);
    res.status(200).json({
      topic: req.body?.topic,
      explanation: "Fallback: definition, 2–3 key ideas, 1 simple example.",
      quiz: [
        { q: "State one key idea.", a: "Answer varies." },
        { q: "Why is it important?", a: "Because…" },
        { q: "Give one example.", a: "Example…" },
      ],
    });
  }
});

// Roadmap
app.post("/api/roadmap", async (req, res) => {
  try {
    const {
      goal,
      skills,
      hoursPerWeek = 8,
      durationWeeks = 4,
    } = req.body || {};
    if (!goal) return res.status(400).json({ error: "goal is required" });

    const prompt = `
You are EduMind. Respond ONLY with valid JSON in exactly this schema:
{
 "goal":"<goal>",
 "skills":"<skills>",
 "hoursPerWeek":<number>,
 "durationWeeks":<number>,
 "summary":"<brief plan overview>",
 "plan":[
   {
     "week":1,
     "focus":"<focus>",
     "objectives":["<objective1>","<objective2>"],
     "tasks":["<task1>","<task2>"],
     "resources":[{"title":"<title>","url":"<url or #>"}],
     "assessment":"<how to self-check>"
   }
 ]
}
Rules:
- Create exactly ${durationWeeks} weeks.
- Distribute time: ~60% study and ~40% practice from ${hoursPerWeek} hrs/week.
- No markdown, no extra text outside JSON.

Inputs:
Goal: ${goal}
Current skills: ${skills || "N/A"}
Hours/week: ${hoursPerWeek}
Duration (weeks): ${durationWeeks}
`;

    const text = await geminiGenerateText(prompt);
    const parsed = safeParseJSON(text, {
      goal,
      skills,
      hoursPerWeek,
      durationWeeks,
      summary: text || "No response",
      plan: [],
    });

    parsed.goal = parsed.goal || goal;
    parsed.skills = parsed.skills ?? (skills || "");
    parsed.hoursPerWeek = Number(parsed.hoursPerWeek ?? hoursPerWeek);
    parsed.durationWeeks = Number(parsed.durationWeeks ?? durationWeeks);
    if (!Array.isArray(parsed.plan)) parsed.plan = [];

    res.json(parsed);
  } catch (e) {
    console.error("[roadmap]", e.message);
    // deterministic fallback
    const weeks = Math.min(
      Math.max(parseInt(req.body?.durationWeeks || 4, 10), 2),
      12
    );
    const hours = Math.min(
      Math.max(parseInt(req.body?.hoursPerWeek || 8, 10), 2),
      30
    );
    const g = req.body?.goal || "General Goal";
    const s = req.body?.skills || "General fundamentals";
    const plan = Array.from({ length: weeks }).map((_, i) => ({
      week: i + 1,
      focus:
        i + 1 === 1
          ? `Foundations of ${g}`
          : i + 1 === weeks
          ? `Capstone: apply ${g}`
          : `Core topic ${i}`,
      objectives: [
        `Understand key ideas for ${g} (week ${i + 1})`,
        `Connect from current skills (${s})`,
      ],
      tasks: [
        `Study ~${Math.round(hours * 0.6)}h (notes + examples)`,
        `Practice ~${Math.round(hours * 0.4)}h (1–2 exercises)`,
      ],
      resources: [{ title: `${g} overview`, url: "#" }],
      assessment: `End of week ${i + 1}: explain ${g} in 5 minutes.`,
    }));
    res.status(200).json({
      goal: g,
      skills: s,
      hoursPerWeek: hours,
      durationWeeks: weeks,
      summary: `Fallback roadmap for ${g} over ${weeks} weeks at ~${hours} hrs/week.`,
      plan,
    });
  }
});

app.listen(PORT, async () => {
  console.log(`[server] running on http://localhost:${PORT}`);
  try {
    await ensureModelSelected();
  } catch (e) {
    console.error("[gemini] model selection failed:", e.message);
    console.error(
      "Tip: hit GET /api/gemini-models to see what your key supports."
    );
  }
});
