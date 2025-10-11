import { useState } from "react";
import { getRoadmap } from "../service/aiService";

export default function RoadmapForm({ onRoadmap }) {
  const [goal, setGoal] = useState("");
  const [skills, setSkills] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    const data = await getRoadmap({
      goal,
      skills,
      hoursPerWeek,
      durationWeeks,
    });
    onRoadmap({ ...data, date: Date.now() });
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-4 mt-6">
      <h2 className="text-2xl font-semibold mb-3">
        🧭 Build Your Learning Roadmap
      </h2>

      <label className="text-sm text-gray-700">Your target goal*</label>
      <input
        className="w-full border p-2 rounded-md mb-3"
        placeholder='e.g., "Frontend Developer", "Data Structures in C#"'
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />

      <label className="text-sm text-gray-700">
        Your current skills (comma-separated)
      </label>
      <input
        className="w-full border p-2 rounded-md mb-3"
        placeholder='e.g., "HTML, CSS, basic JS"'
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700">Hours per week</label>
          <input
            type="number"
            min="2"
            max="30"
            className="w-full border p-2 rounded-md"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Duration (weeks)</label>
          <input
            type="number"
            min="2"
            max="12"
            className="w-full border p-2 rounded-md"
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded-md"
      >
        {loading ? "Generating..." : "Generate Roadmap"}
      </button>
    </div>
  );
}
