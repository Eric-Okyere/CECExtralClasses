import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Subjects() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const subjects = [
    {
      name: "Mathematics",
      levels: ["JHS 1", "JHS 2", "JHS 3"],
    },
    {
      name: "English Language",
      levels: ["JHS 1", "JHS 2", "JHS 3"],
    },
    {
      name: "Integrated Science",
      levels: ["JHS 1", "JHS 2", "JHS 3"],
    },
    {
      name: "Social Studies",
      levels: ["JHS 1", "JHS 2", "JHS 3"],
    },
    {
      name: "Ghanaian Language",
      levels: ["JHS 1", "JHS 2", "JHS 3"],
    },
    {
      name: "ICT",
      levels: ["JHS 1", "JHS 2", "JHS 3"],
    },
    {
      name: "RME",
      levels: ["JHS 1", "JHS 2", "JHS 3"],
    },
    {
      name: "Career Technology",
      levels: ["JHS 1", "JHS 2", "JHS 3"],
    },
  ];

  const filteredSubjects = subjects.filter((sub) =>
    sub.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* HEADER */}
      <div className="bg-blue-600 text-white py-12 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-bold">Choose a Subject</h1>
        <p className="mt-3 text-lg">Select a subject to start learning</p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <input
          type="text"
          placeholder="Search subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* SUBJECT GRID */}
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredSubjects.map((subject, index) => (
          <motion.div
            key={subject.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            // onClick={() => navigate(`/topics/${subject.name}`)} // ✅ CLICK SUBJECT
            className="cursor-pointer bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-3">{subject.name}</h2>

            <div className="flex flex-wrap gap-2">
              {subject.levels.map((level) => (
                <button
                  key={level}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ prevent card click
                    navigate(`/topics/${subject.name}/${level}`);
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredSubjects.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No subjects found.
        </p>
      )}
    </div>
  );
}