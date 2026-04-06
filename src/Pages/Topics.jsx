import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Topics() {
  const { subject, level } = useParams();
  const navigate = useNavigate();

  const [strands, setStrands] = useState([]); // This will store the strands array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const levels = ["JHS 1", "JHS 2", "JHS 3"];

  useEffect(() => {
    const fetchTopics = async () => {
      if (!level) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get("http://localhost:5001/api/subjects/");
        const allSubjects = response.data.data || [];

        // Find the specific object matching BOTH the name and the level
        const currentSubjectData = allSubjects.find(
          (s) => s.name === subject && s.level === level
        );

        if (currentSubjectData && currentSubjectData.strands) {
          setStrands(currentSubjectData.strands);
        } else {
          setStrands([]); // No strands found for this selection
        }
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError("Failed to load curriculum.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subject, level]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tight">
            {subject}
          </h1>
          {level && (
            <span className="inline-block mt-3 px-6 py-1.5 bg-blue-600 text-white text-xs font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-200">
              {level}
            </span>
          )}
        </div>

        {/* LEVEL SELECTOR */}
        {!level && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {levels.map((lvl) => (
              <motion.div
                key={lvl}
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(`/topics/${subject}/${lvl}`)}
                className="cursor-pointer bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 text-center font-black text-slate-700"
              >
                {lvl}
              </motion.div>
            ))}
          </div>
        )}

        {/* LOADING */}
        {level && loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
          </div>
        )}

        {/* STRANDS & SUB-STRANDS */}
        {level && !loading && strands.length > 0 ? (
          <div className="space-y-8">
            {strands.map((strand, index) => (
              <motion.div
                key={strand._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
              >
                <h2 className="text-xl font-black text-blue-700 mb-6 uppercase tracking-wide flex items-center">
                  <span className="w-2 h-8 bg-yellow-400 mr-4 rounded-full"></span>
                  {strand.title}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {strand.subStrands.map((sub, subIndex) => {
                    const progress = localStorage.getItem(`${subject}-${level}-${sub}`);

                    return (
                      <button
                        key={subIndex}
                        onClick={() =>
                          // Navigate using the unique identifiers for this lesson
                          navigate(`/lesson/${subject}/${level}/${encodeURIComponent(sub)}`)
                        }
                        className={`group flex items-center justify-between px-6 py-5 rounded-2xl border-2 transition-all text-left ${
                          progress
                            ? "bg-green-50 border-green-200 text-green-800"
                            : "bg-slate-50 border-transparent hover:border-blue-400 hover:bg-white hover:shadow-md"
                        }`}
                      >
                        <span className="font-bold text-sm md:text-base leading-snug">
                          {sub}
                        </span>
                        
                        <div className="ml-4">
                          {progress ? (
                            <span className="bg-green-500 text-white p-1 rounded-full text-xs">✔</span>
                          ) : (
                            <span className="text-blue-500 font-black text-xs opacity-0 group-hover:opacity-100">GO →</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          level && !loading && (
            <div className="text-center py-20">
              <p className="text-slate-400 font-black uppercase tracking-widest">
                Curriculum not yet available for this level.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}