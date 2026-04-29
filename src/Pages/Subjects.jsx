import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../services/BaseUrl";

export default function Subjects() {
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedData = JSON.parse(storedUser);
      const currentUser = parsedData.user || parsedData;
      
      // Get the level from learningProfile (matches your profile component)
      const level = currentUser.learningProfile?.level || currentUser.studentProfile?.level;
      setUserLevel(level);

      if (currentUser.admin === true) {
        setIsAdmin(true);
      }
    }

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}subjects`);
        const subjectsArray = response.data.data || [];

        const grouped = subjectsArray.reduce((acc, curr) => {
          const existing = acc.find((s) => s.name === curr.name);
          if (existing) {
            if (!existing.levels.includes(curr.level)) {
              existing.levels.push(curr.level);
            }
          } else {
            acc.push({ 
              name: curr.name, 
              levels: [curr.level] 
            });
          }
          return acc;
        }, []);

        setSubjects(grouped);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleLevelClick = (subjectName, clickedLevel) => {
    // Admins can go anywhere, users can only click their specific level
    if (isAdmin || clickedLevel === userLevel) {
      navigate(`/topics/${subjectName}/${clickedLevel}`);
    } else {
      alert(`Access Restricted: Your assigned level is ${userLevel || "not set"}. Please contact your parent or admin.`);
    }
  };

  const filteredSubjects = subjects.filter((sub) =>
    sub.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      {/* HEADER */}
      <div className="bg-blue-700 text-white py-16 text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        <h1 className="relative z-10 text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
          Learning <span className="text-yellow-400">Library</span>
        </h1>
        <p className="relative z-10 mt-4 text-blue-100 font-bold uppercase tracking-widest text-[10px] max-w-xl mx-auto">
          {userLevel ? `Curriculum for ${userLevel}` : "Explore JHS Curriculum"}
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-4xl mx-auto mt-8 px-6 relative z-20">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-6 pl-8 border-none rounded-3xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-lg transition-all font-bold"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Loading Subject Data...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 relative overflow-hidden group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-lg shadow-blue-100">
                  {subject.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic leading-none">{subject.name}</h2>
              </div>

              <div className="space-y-4">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Available Levels</p>
                <div className="flex flex-wrap gap-3">
                  {subject.levels.sort().map((level) => {
                    const isUserLevel = level === userLevel;
                    const showAsActive = isAdmin || isUserLevel;

                    return (
                      <button
                        key={level}
                        onClick={() => handleLevelClick(subject.name, level)}
                        className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all relative ${
                          showAsActive
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-100 ring-2 ring-blue-500 ring-offset-2 scale-105" 
                            : "bg-slate-50 text-black blur-[2px] grayscale opacity-50 cursor-not-allowed hover:blur-none transition-all duration-500"
                        }`}
                      >
                        {level}
                        {isUserLevel && !isAdmin && (
                          <span className="absolute -top-2 -right-1 bg-yellow-400 text-blue-900 text-[8px] px-2 py-0.5 rounded-full shadow-sm">Current</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredSubjects.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No matching curriculum found</p>
        </div>
      )}
    </div>
  );
}