export const getAIContent = async (topic) => {
  const mock = {
    topic,
    explanation: `In simple terms, ${topic} is an important concept that helps us understand key ideas easily.`,
    quiz: [
      {
        q: `What is the main purpose of ${topic}?`,
        a: "To explain core principles.",
      },
      {
        q: `Why is ${topic} important?`,
        a: "It helps in understanding deeper topics.",
      },
      { q: `Give one example related to ${topic}.`, a: "Example answer." },
    ],
  };
  await new Promise((res) => setTimeout(res, 1000)); // Simulate delay
  return mock;
};

export const getRoadmap = async ({
  goal,
  skills,
  hoursPerWeek,
  durationWeeks,
}) => {
  // Basic mock logic to shape a sensible plan
  const weeks = Math.min(Math.max(parseInt(durationWeeks || 4, 10), 2), 12);
  const hours = Math.min(Math.max(parseInt(hoursPerWeek || 5, 10), 2), 30);

  const normalize = (t) => (t || "").trim() || "General fundamentals";
  const g = normalize(goal);
  const s = normalize(skills);

  const plan = Array.from({ length: weeks }).map((_, i) => {
    const week = i + 1;
    const focus =
      week === 1
        ? `Foundations of ${g}`
        : week === 2
        ? `Core concepts & patterns for ${g}`
        : week === weeks
        ? `Capstone: apply ${g} end-to-end`
        : `Feature/Topic focus ${week - 1}`;

    return {
      week,
      focus,
      objectives: [
        `Understand key ideas for ${g} at week ${week}`,
        `Bridge from current skills (${s}) to new concepts`,
      ],
      tasks: [
        `Study for ~${Math.round(hours * 0.6)}h: notes + examples`,
        `Practice for ~${Math.round(hours * 0.4)}h: build 1–2 small exercises`,
      ],
      resources: [
        { title: `${g} – official docs/guide`, url: "#" },
        { title: `Intro video: ${g}`, url: "#" },
      ],
      assessment: `End of week ${week}: explain ${g} to a friend in 5 min; list 3 takeaways.`,
    };
  });

  // Simulate latency
  await new Promise((r) => setTimeout(r, 800));

  return {
    goal: g,
    skills: s,
    hoursPerWeek: hours,
    durationWeeks: weeks,
    plan,
    summary:
      `This plan helps you move from "${s}" to "${g}" in ${weeks} weeks ` +
      `with ~${hours} hrs/week. Each week balances study, practice, and reflection.`,
  };
};
