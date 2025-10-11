// Study Guide (topic -> explanation + quiz)
export const getAIContent = async (topic) => {
  try {
    const res = await fetch("/api/study-guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("[client] study-guide error:", e.message);
    // fallback so UI always works
    return {
      topic,
      explanation: `In simple terms, ${topic} is ... (fallback)`,
      quiz: [
        { q: `What is ${topic}?`, a: "..." },
        { q: `Why important?`, a: "..." },
        { q: `One example`, a: "..." },
      ],
    };
  }
};

// ---- Helper to normalize roadmap payloads from the server/LLM ----
const normalizeRoadmap = (out) => {
  // If server returned a stringified JSON, parse it
  let rd = typeof out === "string" ? JSON.parse(out) : out;

  // Some providers accidentally put the whole JSON inside "summary"
  if (
    rd &&
    typeof rd.summary === "string" &&
    rd.summary.trim().startsWith("{")
  ) {
    rd = JSON.parse(rd.summary);
  }

  // Coerce numbers
  rd.hoursPerWeek = Number(rd.hoursPerWeek || 0);
  rd.durationWeeks = Number(rd.durationWeeks || 0);

  // Ensure arrays exist
  rd.plan = Array.isArray(rd.plan) ? rd.plan : [];
  rd.plan = rd.plan.map((w, i) => ({
    week: Number(w?.week ?? i + 1),
    focus: w?.focus ?? "",
    objectives: Array.isArray(w?.objectives) ? w.objectives : [],
    tasks: Array.isArray(w?.tasks) ? w.tasks : [],
    resources: Array.isArray(w?.resources) ? w.resources : [],
    assessment: w?.assessment ?? "",
  }));

  return rd;
};

// Roadmap (skills+goal -> weekly plan)
export const getRoadmap = async ({
  goal,
  skills,
  hoursPerWeek,
  durationWeeks,
}) => {
  try {
    const res = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, skills, hoursPerWeek, durationWeeks }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json(); // could be object OR stringified JSON
    return normalizeRoadmap(raw); // <- always return a clean object
  } catch (e) {
    console.error("[client] roadmap error:", e.message);

    // Safe fallback that matches your UI schema
    const weeks = Number(durationWeeks || 4);
    const hours = Number(hoursPerWeek || 8);
    return {
      goal,
      skills,
      hoursPerWeek: hours,
      durationWeeks: weeks,
      summary: `Fallback roadmap for ${goal}`,
      plan: Array.from({ length: weeks }).map((_, i) => ({
        week: i + 1,
        focus: i === 0 ? `Foundations of ${goal}` : `Core topic ${i}`,
        objectives: ["Understand concepts", "Practice basics"],
        tasks: [
          `Study ~${Math.round(hours * 0.6)}h`,
          `Practice ~${Math.round(hours * 0.4)}h`,
        ],
        resources: [{ title: `${goal} intro`, url: "#" }],
        assessment: `Summarize week ${i + 1} learning.`,
      })),
    };
  }
};
