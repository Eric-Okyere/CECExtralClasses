// src/pages/Topics.jsx
import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Topics() {
  const { subject, level } = useParams();
  const navigate = useNavigate();

  const levels = ["JHS 1", "JHS 2", "JHS 3"];

  // =========================
  // MATHEMATICS
  // =========================
  const mathematicsContent = {
    "Strand 1: Number": [
      "Sub-strand 1: Number and Numeration Systems",
      "Sub-strand 2: Number Operations",
      "Sub-strand 3: Fractions, Decimals and Percentages",
      "Sub-strand 4: Number: Ratios and Proportion",
    ],
    "Strand 2: Algebra": [
      "Sub-strand 1: Patterns and Relations",
      "Sub-strand 2: Algebraic Expressions",
      "Sub-strand 3: Variables and Equations",
    ],
    "Strand 3: Geometry and Measurement": [
      "Sub-strand 1: Shape and Space",
      "Sub-strand 2: Measurement",
      "Sub-strand 3: Position and Transformation",
    ],
    "Strand 4: Handling Data": [
      "Sub-strand 1: Data",
      "Sub-strand 2: Chance or Probability",
    ],
  };

  // =========================
  // INTEGRATED SCIENCE (JHS 1–3)
  // =========================
  const scienceContent = {
    "Strand 1: Diversity of Matter": [
      "Sub-strand 1: Materials",
      "Sub-strand 2: Living Cells",
    ],
    "Strand 2: Cycles": [
      "Sub-strand 1: Earth Science",
      "Sub-strand 2: Life Cycle of Organisms",
      "Sub-strand 3: Crop Production",
      "Sub-strand 4: Animal Production",
    ],
    "Strand 3: Systems": [
      "Sub-strand 1: The Human Body System",
      "Sub-strand 2: The Solar System",
      "Sub-strand 3: Ecosystem",
      "Sub-strand 4: Farming Systems",
    ],
    "Strand 4: Forces and Energy": [
      "Sub-strand 1: Energy",
      "Sub-strand 2: Electricity and Electronics",
      "Sub-strand 3: Conversion and Conservation of Energy",
      "Sub-strand 4: Force and Motion",
      "Sub-strand 5: Agricultural Tools",
    ],
    "Strand 5: Humans and the Environment": [
      "Sub-strand 1: Waste Management",
      "Sub-strand 2: Human Health",
      "Sub-strand 3: Science and Industry",
      "Sub-strand 4: Climate Change and Green Economy",
      "Sub-strand 5: Understanding the Environment",
    ],
  };

  // =========================
  // SELECT CONTENT
  // =========================
  let topics = null;

  if (subject === "Mathematics") {
    topics = mathematicsContent;
  } else if (subject === "Integrated Science") {
    topics = scienceContent;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {subject} {level && `- ${level}`}
        </h1>

        {/* ========================= */}
        {/* LEVEL SELECT */}
        {/* ========================= */}
        {!level && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {levels.map((lvl) => (
              <motion.div
                key={lvl}
                whileHover={{ scale: 1.05 }}
                onClick={() =>
                  navigate(`/topics/${subject}/${lvl}`)
                }
                className="cursor-pointer bg-white p-6 rounded-xl shadow text-center"
              >
                {lvl}
              </motion.div>
            ))}
          </div>
        )}

        {/* ========================= */}
        {/* STRANDS + SUBSTRANDS */}
        {/* ========================= */}
        {level && topics && (
          <div className="space-y-6">
            {Object.entries(topics).map(([strand, subs]) => (
              <div
                key={strand}
                className="bg-white p-5 rounded shadow"
              >
                <h2 className="font-semibold text-blue-700 mb-3">
                  {strand}
                </h2>

                <ul className="space-y-2">
                  {subs.map((sub) => {
                    const progress = localStorage.getItem(
                      `${subject}-${level}-${sub}`
                    );

                    return (
                      <li
                        key={sub}
                        onClick={() =>
                          navigate(
                            `/lesson/${subject}/${level}/${encodeURIComponent(
                              sub
                            )}?strand=${encodeURIComponent(strand)}`
                          )
                        }
                        className={`px-3 py-2 rounded cursor-pointer ${
                          progress
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 hover:bg-blue-50"
                        }`}
                      >
                        {sub} {progress && "✅"}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ========================= */}
        {/* FALLBACK */}
        {/* ========================= */}
        {level && !topics && (
          <p className="text-center text-gray-500">
            Topics for {subject} coming soon...
          </p>
        )}
      </div>
    </div>
  );
}