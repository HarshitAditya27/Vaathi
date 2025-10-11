require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GEMINI_KEY = process.env.GOOGLE_API_KEY;

if (!GEMINI_KEY) console.warn("[server] Missing GOOGLE_API_KEY in .env");

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
// fast + inexpensive; good for hackathon
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// tiny helper to parse JSON-only outputs
function safeParseJSON(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {}
  // try to extract last JSON block
  const m = text.match(/\{[\s\S]*\}$/m);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {}
  }
  return fallback;
}

// ---------- ROUTES -------------

// Study guide: { topic } -> { topic, explanation, quiz:[{q,a} x3] }
app.post("/api/study-guide", async (req, res) => {
  try {
    const { topic } = req.body || {};
    if (!topic) return res.status(400).json({ error: "topic is required" });

    const prompt = `
You are EduMind. Respond ONLY with valid JSON in exactly this shape:
{"topic":"<topic>","explanation":"<4-8 sentence student-friendly explanation>","quiz":[{"q":"<question1>","a":"<short answer1>"},{"q":"<question2>","a":"<short answer2>"},{"q":"<question3>","a":"<short answer3>"}]}
Do not include markdown or code fences. No extra text.
Topic: ${topic}`;

    const resp = await model.generateContent(prompt);
    const text = resp.response.text() || "";
    const parsed = safeParseJSON(text, {
      topic,
      explanation: text || "No response",
      quiz: [],
    });
    if (!Array.isArray(parsed.quiz)) parsed.quiz = [];
    return res.json(parsed);
  } catch (e) {
    console.error("[study-guide]", e.message);
    // Fallback so demo never breaks
    return res.status(200).json({
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

// Roadmap: { goal, skills, hoursPerWeek, durationWeeks } -> plan JSON
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
You are EduMind. Respond ONLY with valid JSON in exactly this shape:
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
- Use exactly the provided durationWeeks (one object per week).
- Balance hours: ~60% study, ~40% practice based on hoursPerWeek.
- No markdown, no extra text outside JSON.

Inputs:
Goal: ${goal}
Current skills: ${skills || "N/A"}
Hours/week: ${hoursPerWeek}
Duration (weeks): ${durationWeeks}
`;

    const resp = await model.generateContent(prompt);
    const text = resp.response.text() || "";
    const parsed = safeParseJSON(text, {
      goal,
      skills,
      hoursPerWeek,
      durationWeeks,
      summary: text || "No response",
      plan: [],
    });

    // light normalization
    parsed.goal = parsed.goal || goal;
    parsed.skills = parsed.skills ?? (skills || "");
    parsed.hoursPerWeek = Number(parsed.hoursPerWeek ?? hoursPerWeek);
    parsed.durationWeeks = Number(parsed.durationWeeks ?? durationWeeks);
    if (!Array.isArray(parsed.plan)) parsed.plan = [];

    return res.json(parsed);
  } catch (e) {
    console.error("[roadmap]", e.message);
    // Deterministic fallback
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
    return res.status(200).json({
      goal: g,
      skills: s,
      hoursPerWeek: hours,
      durationWeeks: weeks,
      summary: `Fallback roadmap for ${g} over ${weeks} weeks at ~${hours} hrs/week.`,
      plan,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
