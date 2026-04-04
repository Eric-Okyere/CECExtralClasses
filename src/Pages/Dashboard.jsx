import Navbar from "../components/Navbar";
import { useState } from "react";

export default function Dashboard() {
  const user = localStorage.getItem("user");

  const [filter, setFilter] = useState("All");

  // ✅ Only get learning progress keys
  const progressKeys = Object.keys(localStorage).filter((key) =>
    key.includes("JHS")
  );

  let totalScore = 0;
  let totalQuestions = 0;

  const completedTopics = [];

  progressKeys.forEach((key) => {
    try {
      const data = JSON.parse(localStorage.getItem(key));

      // ✅ Skip invalid data
      if (!data || typeof data !== "object") return;

      const [subject, level, sub] = key.split("-");

      totalScore += data.score || 0;
      totalQuestions += data.total || 0;

      completedTopics.push({
        subject,
        level,
        sub,
        strand: data.strand || "Unknown Strand",
        score: data.score,
        total: data.total,
      });
    } catch (error) {
      // ✅ Ignore non-JSON values (like JWT tokens)
      console.warn("Skipped invalid localStorage key:", key);
    }
  });

  const percentage =
    totalQuestions > 0
      ? Math.round((totalScore / totalQuestions) * 100)
      : 0;

  // ✅ Filter by subject
  const filteredTopics =
    filter === "All"
      ? completedTopics
      : completedTopics.filter((t) => t.subject === filter);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {user || "Student"}
        </h1>

        {/* 🎯 FILTER */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {["All", "Mathematics", "Integrated Science"].map((subj) => (
            <button
              key={subj}
              onClick={() => setFilter(subj)}
              className={`px-3 py-1 rounded ${
                filter === subj
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* 📊 PROGRESS */}
        <div className="bg-white p-5 rounded shadow mb-6">
          <h2 className="font-semibold mb-2">Overall Progress</h2>

          <div className="w-full bg-gray-200 rounded h-4">
            <div
              className="bg-blue-600 h-4 rounded"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <p className="mt-2">{percentage}% completed</p>
        </div>

        {/* 📚 COMPLETED TOPICS */}
        <div className="bg-white p-5 rounded shadow">
          <h2 className="font-semibold mb-3">
            Completed Topics
          </h2>

          {filteredTopics.length === 0 ? (
            <p>No topics completed yet.</p>
          ) : (
            <ul className="space-y-3">
              {filteredTopics.map((item, index) => (
                <li
                  key={index}
                  className="bg-green-100 p-3 rounded"
                >
                  <p className="font-semibold">
                    {item.subject} - {item.level}
                  </p>

                  <p className="text-sm text-blue-600">
                    {item.strand}
                  </p>

                  <p className="text-sm">
                    {item.sub}
                  </p>

                  <p className="mt-1 font-medium">
                    Score: {item.score}/{item.total}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}