import React, { useState } from "react";
import { getRoadmap } from "../service/aiService";

export default function RoadmapForm({ onRoadmap }) {
  const [goal, setGoal] = useState("");
  const [skills, setSkills] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeRoadmapLocal = (out) => {
    try {
      let rd = typeof out === "string" ? JSON.parse(out) : out;
      if (
        rd &&
        typeof rd.summary === "string" &&
        rd.summary.trim().startsWith("{")
      ) {
        rd = JSON.parse(rd.summary);
      }
      rd.hoursPerWeek = Number(rd.hoursPerWeek || 0);
      rd.durationWeeks = Number(rd.durationWeeks || 0);
      rd.plan = Array.isArray(rd.plan) ? rd.plan : [];
      return rd;
    } catch {
      return out;
    }
  };

  const submit = async () => {
    if (!goal.trim()) return;
    setLoading(true);

    try {
      const data = await getRoadmap({
        goal,
        skills,
        hoursPerWeek,
        durationWeeks,
      });
      const rd = normalizeRoadmapLocal(data);
      onRoadmap({ ...rd, date: Date.now() });
    } catch (err) {
      console.error("Roadmap generation error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4 p-4 border rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold">Generate Study Roadmap</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Target Goal</label>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="e.g. Learn React.js"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Current Skills</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="e.g. HTML, CSS, JavaScript basics"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Hours per week</label>
        <input
          type="number"
          value={hoursPerWeek}
          onChange={(e) => setHoursPerWeek(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="e.g. 8"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Duration (weeks)</label>
        <input
          type="number"
          value={durationWeeks}
          onChange={(e) => setDurationWeeks(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="e.g. 6"
        />
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Roadmap"}
      </button>
    </div>
  );
}
