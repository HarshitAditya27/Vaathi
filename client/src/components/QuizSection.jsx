import React from "react";

function QuizSection({ quiz }) {
  if (!quiz || quiz.length === 0) return null;

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-4 mt-6">
      <h3 className="text-xl font-semibold mb-3">📝 Quick Quiz</h3>
      {quiz.map((q, i) => (
        <div key={i} className="mb-3">
          <p className="font-medium">
            Q{i + 1}. {q.q}
          </p>
          <p className="text-sm text-gray-600 mt-1">Answer: {q.a}</p>
        </div>
      ))}
    </div>
  );
}

export default QuizSection;
