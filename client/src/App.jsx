import { useState } from "react";
import TopicInput from "./components/TopicInput";

function App() {
  const [result, setResult] = useState(null);

  const handleResult = (data) => {
    setResult(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white p-6">
      <h1 className="text-3xl font-bold text-center text-blue-700">
        🎓 Vaathi
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Your AI Learning Companion
      </p>

      <TopicInput onResult={handleResult} />

      {result && (
        <div className="max-w-lg mx-auto bg-gray-50 shadow rounded-lg p-4 mt-6">
          <h3 className="text-xl font-semibold mb-2">
            🧠 Simplified Explanation
          </h3>
          <p className="text-gray-700">{result.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default App;
