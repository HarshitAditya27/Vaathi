export default function RoadmapView({ roadmap }) {
  if (!roadmap) return null;

  const plan = Array.isArray(roadmap.plan) ? roadmap.plan : [];

  return (
    <div className="space-y-4 p-4 border rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold">Your Personalized Roadmap</h3>

      {/* Summary */}
      {typeof roadmap.summary === "string" ? (
        <p className="text-sm leading-6">{roadmap.summary}</p>
      ) : null}

      {/* Plan Weeks */}
      <div className="space-y-3">
        {plan.map((w) => (
          <div key={w.week} className="rounded-xl border p-4 bg-gray-50">
            <div className="font-medium">
              Week {w.week}: {w.focus}
            </div>

            {/* Objectives */}
            <div className="mt-2">
              <div className="text-sm font-semibold">Objectives</div>
              <ul className="list-disc pl-5">
                {(w.objectives || []).map((o, i) => (
                  <li key={i} className="text-sm">
                    {o}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tasks */}
            <div className="mt-2">
              <div className="text-sm font-semibold">Tasks</div>
              <ul className="list-disc pl-5">
                {(w.tasks || []).map((t, i) => (
                  <li key={i} className="text-sm">
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="mt-2">
              <div className="text-sm font-semibold">Resources</div>
              <ul className="list-disc pl-5">
                {(w.resources || []).map((r, i) => (
                  <li key={i} className="text-sm">
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-600"
                      >
                        {r.title || r.url}
                      </a>
                    ) : (
                      <span>{r.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Assessment */}
            {w.assessment ? (
              <div className="mt-2 text-sm">
                <span className="font-semibold">Assessment: </span>
                {w.assessment}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
