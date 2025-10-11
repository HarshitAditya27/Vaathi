import React from "react";

function RoadmapView({ roadmap }) {
  if (!roadmap) return null;

  return (
    <div className="max-w-2xl mx-auto bg-gray-50 shadow rounded-lg p-4 mt-6">
      <h3 className="text-xl font-semibold mb-2">
        📅 Your Personalized Roadmap
      </h3>
      <p className="text-gray-700 mb-4">{roadmap.summary}</p>

      <div className="space-y-4">
        {roadmap.plan.map((w) => (
          <div key={w.week} className="bg-white border rounded-md p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                Week {w.week}: {w.focus}
              </h4>
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Objectives</p>
              <ul className="list-disc list-inside text-gray-700">
                {w.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Tasks</p>
              <ul className="list-disc list-inside text-gray-700">
                {w.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Resources</p>
              <ul className="list-disc list-inside text-blue-700">
                {w.resources.map((r, i) => (
                  <li key={i}>
                    <a
                      href={r.url}
                      onClick={(e) => e.preventDefault()}
                      className="hover:underline"
                    >
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Assessment:</span> {w.assessment}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoadmapView;
