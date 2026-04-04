// src/pages/BeceExam.jsx
import { useState, useEffect } from "react";

export default function BeceExam() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(1800); // 30 mins
  const [finished, setFinished] = useState(false);

  const questions = [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
    {
      question: "What is 10 ÷ 2?",
      options: ["2", "5", "10", "8"],
      answer: "5",
    },
    // 👉 add up to 50 questions
  ];

  useEffect(() => {
    if (finished) return;

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev === 1) {
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finished]);

  const handleAnswer = (opt) => {
    if (opt === questions[current].answer) {
      setScore(score + 1);
    }

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        BECE Practice Exam
      </h1>

      <p className="text-red-500 font-bold mb-3">
        Time: {Math.floor(time / 60)}:
        {time % 60}
      </p>

      {finished ? (
        <div>
          <h2 className="text-xl font-bold">
            Final Score: {score}/{questions.length}
          </h2>
        </div>
      ) : (
        <div>
          <p className="mb-4">
            {questions[current].question}
          </p>

          {questions[current].options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="block w-full bg-blue-600 text-white p-2 mb-2 rounded"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}