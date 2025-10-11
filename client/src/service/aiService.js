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
