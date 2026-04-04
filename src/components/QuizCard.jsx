import { useState } from "react";

export default function QuizCard({ question, options, correctAnswer }) {
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("");

  const checkAnswer = () => {
    if (selected === correctAnswer) {
      setResult("Correct!");
    } else {
      setResult("Wrong!");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="mb-4">{question}</h2>

      {options.map((opt) => (
        <div key={opt}>
          <label>
            <input
              type="radio"
              value={opt}
              onChange={(e) => setSelected(e.target.value)}
            />{" "}
            {opt}
          </label>
        </div>
      ))}

      <button
        onClick={checkAnswer}
        className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
      >
        Submit
      </button>

      {result && <p className="mt-2">{result}</p>}
    </div>
  );
}