import { useState } from "react";
import TopicInput from "./components/TopicInput";
import QuizSection from "./components/QuizSection";
import HistoryList from "./components/HistoryList";
import RoadmapForm from "./components/RoadmapForm";
import RoadmapView from "./components/RoadmapView";

function App() {
  const [activeTab, setActiveTab] = useState("study"); // 'study' | 'roadmap'

  // Study Guide state
  const [studyResult, setStudyResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Roadmap state
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapHistory, setRoadmapHistory] = useState([]);

  const handleStudyResult = (data) => {
    const entry = { ...data, date: Date.now() };
    setStudyResult(entry);
    setHistory([entry, ...history]);
  };

  const handleSelectHistory = (index) => {
    setStudyResult(history[index]);
  };

  const handleRoadmap = (data) => {
    setRoadmap(data);
    setRoadmapHistory([data, ...roadmapHistory]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">🎓 Vaathi</h1>
        <p className="text-gray-600">
          AI Learning Companion — Study Guides, Quizzes & Personalized Roadmaps
        </p>

        <div className="mt-4 inline-flex rounded-md overflow-hidden border">
          <button
            onClick={() => setActiveTab("study")}
            className={`px-4 py-2 ${
              activeTab === "study" ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Study Guide
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-4 py-2 ${
              activeTab === "roadmap" ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Roadmap
          </button>
        </div>
      </header>

      {activeTab === "study" && (
        <>
          <TopicInput onResult={handleStudyResult} />

          {studyResult && (
            <div className="max-w-lg mx-auto bg-gray-50 shadow rounded-lg p-4 mt-6">
              <h3 className="text-xl font-semibold mb-2">
                🧠 Simplified Explanation
              </h3>
              <p className="text-gray-700">{studyResult.explanation}</p>
            </div>
          )}

          {studyResult && <QuizSection quiz={studyResult.quiz} />}

          {history.length > 0 && (
            <HistoryList history={history} onSelect={handleSelectHistory} />
          )}
        </>
      )}

      {activeTab === "roadmap" && (
        <>
          <RoadmapForm onRoadmap={handleRoadmap} />
          <RoadmapView roadmap={roadmap} />

          {roadmapHistory.length > 0 && (
            <div className="max-w-2xl mx-auto mt-6">
              <h4 className="font-semibold mb-2">🗂 Roadmap History</h4>
              <ul className="list-disc list-inside">
                {roadmapHistory.map((r, i) => (
                  <li key={i} className="text-gray-700">
                    {r.goal} — {r.durationWeeks} weeks, {r.hoursPerWeek}{" "}
                    hrs/week
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
