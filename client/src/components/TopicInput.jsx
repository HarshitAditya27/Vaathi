import { useState } from "react";
import { getAIContent } from "../service/aiService";

function TopicInput({ onResult }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const aiData = await getAIContent(topic);
    onResult(aiData);
    setTopic("");
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-4 mt-6">
      <h2 className="text-2xl font-semibold mb-2">📘 Enter a Topic to Learn</h2>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full border p-2 rounded-md"
        placeholder="e.g., Photosynthesis, Blockchain, Newton's Laws"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 mt-3 rounded-md"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Study Guide"}
      </button>
    </div>
  );
}

export default TopicInput;
