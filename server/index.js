require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const AGENT_ENDPOINT = (process.env.AGENT_ENDPOINT || "").replace(/\/+$/, "");
const AGENT_KEY = process.env.AGENT_ACCESS_KEY || "";

if (!AGENT_ENDPOINT || !AGENT_KEY) {
  console.error("[server] Missing AGENT_ENDPOINT or AGENT_ACCESS_KEY in .env");
}

// --- Helper to call Gradient Agent ---
async function callAgent(messages) {
  const url = `${AGENT_ENDPOINT}/api/v1/chat/completions`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AGENT_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      stream: false,
      include_retrieval_info: false,
      include_functions_info: false,
      include_guardrails_info: false,
    }),
  });

  const raw = await resp.text();
  if (!resp.ok) {
    console.error("[agent error]", resp.status, raw.slice(0, 200));
    throw new Error(`Agent error ${resp.status}`);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from agent");
  }

  return data?.choices?.[0]?.message?.content || "";
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

// ---------------- ROUTES ----------------

// Study Guide
app.post("/api/study-guide", async (req, res) => {
  try {
    const { topic } = req.body || {};
    if (!topic) return res.status(400).json({ error: "topic is required" });

    const userMsg = {
      role: "user",
      content: `MODE: STUDY_GUIDE\nTopic: ${topic}\nReturn JSON only using the study-guide schema.`,
    };

    const content = await callAgent([userMsg]);
    const parsed = safeParseJSON(content, {
      topic,
      explanation: content || "No response",
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

    const userMsg = {
      role: "user",
      content: `MODE: ROADMAP\nGoal: ${goal}\nSkills: ${
        skills || "N/A"
      }\nHours/week: ${hoursPerWeek}\nDuration: ${durationWeeks}\nReturn JSON only using the roadmap schema.`,
    };

    const content = await callAgent([userMsg]);
    const parsed = safeParseJSON(content, {
      goal,
      skills,
      hoursPerWeek,
      durationWeeks,
      summary: content || "No response",
      plan: [],
    });

    if (!Array.isArray(parsed.plan)) parsed.plan = [];
    res.json(parsed);
  } catch (e) {
    console.error("[roadmap]", e.message);
    res.status(200).json({
      goal: req.body?.goal,
      skills: req.body?.skills,
      hoursPerWeek: req.body?.hoursPerWeek || 8,
      durationWeeks: req.body?.durationWeeks || 4,
      summary: "Fallback roadmap",
      plan: [],
    });
  }
});

app.listen(PORT, () =>
  console.log(`[server] running on http://localhost:${PORT}`)
);
