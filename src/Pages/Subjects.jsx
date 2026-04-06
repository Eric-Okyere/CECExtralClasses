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
  const [isAdmin, setIsAdmin] = useState(false); // State for admin status
  const navigate = useNavigate();

  useEffect(() => {
    // --- GET USER DATA FROM LOCALSTORAGE ---
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedData = JSON.parse(storedUser);
      
      // 1. Get the student's assigned level
      const level = parsedData.studentProfile?.level;
      setUserLevel(level);

      // 2. Check the "admin" property directly from your JSON structure
      if (parsedData.admin === true) {
        setIsAdmin(true);
      }
    }

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        // Using your local backend URL
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

  // --- 3. UPDATED NAVIGATION LOGIC ---
  // If isAdmin is true, it bypasses the level check and the alert entirely
  const handleLevelClick = (subjectName, clickedLevel) => {
    if (isAdmin || clickedLevel === userLevel) {
      navigate(`/topics/${subjectName}/${clickedLevel}`);
    } else {
      alert(`Please finish your current level (${userLevel || "assigned level"}) first.`);
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
        <h1 className="relative z-10 text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Choose a <span className="text-yellow-400">Subject</span>
        </h1>
        <p className="relative z-10 mt-4 text-blue-100 font-medium max-w-xl mx-auto">
          Access high-quality lessons and quizzes tailored for the Ghana Common Core Programme.
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="max-w-4xl mx-auto mt-8 px-6 relative z-20">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search for a subject (e.g. Science)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-5 pl-8 border-none rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-lg transition-all"
          />
          <div className="absolute right-5 top-5 text-blue-300 group-focus-within:text-blue-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
           <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Lessons...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-2xl mb-6 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="font-black text-xl">{subject.name.charAt(0)}</span>
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">{subject.name}</h2>
              <p className="text-slate-500 text-sm mb-6 font-medium">Select your current level to view curriculum strands and sub-strands.</p>

              <div className="flex flex-wrap gap-3">
                {subject.levels.sort().map((level) => {
                  // --- 4. STYLE LOGIC: If isAdmin is true, show all buttons as active Blue ---
                  const isActive = level === userLevel;
                  const showAsActive = isAdmin || isActive;

                  return (
                    <button
                      key={level}
                      onClick={() => handleLevelClick(subject.name, level)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                        showAsActive
                          ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 ring-offset-2" 
                          : "bg-slate-100 text-slate-400 opacity-40 grayscale hover:opacity-60"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredSubjects.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 font-bold uppercase tracking-widest">No subjects matching "{search}"</p>
        </div>
      )}
    </div>
  );
}