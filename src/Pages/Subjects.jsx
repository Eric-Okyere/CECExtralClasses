import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../services/BaseUrl";
import { Users, Search, BookOpen, ShieldCheck, UserCheck, X } from "lucide-react";

export default function Subjects() {
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [isParent, setIsParent] = useState(false);
  const navigate = useNavigate();

  // Standardize any occurrence of "JHS" to "Basic"
  const formatLevel = (levelStr) => {
    if (!levelStr) return '';
    return levelStr.replace(/\bJHS\b/gi, 'Basic');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedData = JSON.parse(storedUser);
      const currentUser = parsedData.user || parsedData;
      
      setIsAdmin(currentUser.admin === true);
      setIsParent(currentUser.role === "parent");

      const level = currentUser.learningProfile?.level || currentUser.studentProfile?.level;
      setUserLevel(level);
    }

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}subjects`);
        const subjectsArray = response.data.data || response.data || [];

        // Group levels under each unique subject name
        const grouped = subjectsArray.reduce((acc, curr) => {
          const existing = acc.find((s) => s.name.toLowerCase() === curr.name.toLowerCase());
          if (existing) {
            if (!existing.levels.some(l => l.toLowerCase() === curr.level.toLowerCase())) {
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
    const formattedClicked = formatLevel(clickedLevel).toLowerCase();
    const formattedUser = formatLevel(userLevel).toLowerCase();

    if (isAdmin || formattedClicked === formattedUser) {
      navigate(`/topics/${subjectName}/${clickedLevel}`);
    } else {
      alert(`Access Restricted: Your assigned level is ${formatLevel(userLevel) || "not assigned"}.`);
    }
  };

  const filteredSubjects = subjects.filter((sub) =>
    sub.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  // Parent view prompt
  if (!loading && isParent && !isAdmin) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-32 px-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
            <Users size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic mb-4">Switch to Student View</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-8 max-w-md">
            To view lessons and take quizzes, please switch to a student profile from your dashboard.
          </p>
          <button 
            className="flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-200 hover:scale-105 transition-all"
          >
            Click on your username in the navigation bar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white py-16 text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-400/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-yellow-300 mb-4">
            <BookOpen size={14} /> National Common Core Curriculum
          </span>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-tight">
            Learning <span className="text-yellow-400">Library</span>
          </h1>

          <p className="mt-3 text-blue-100 font-bold uppercase tracking-widest text-[11px] max-w-xl mx-auto flex items-center justify-center gap-2">
            {isAdmin ? (
              <span className="flex items-center gap-1.5 text-emerald-300"><ShieldCheck size={16} /> Admin Mode: Full Access</span>
            ) : userLevel ? (
              <span className="flex items-center gap-1.5"><UserCheck size={16} /> Assigned Level: {formatLevel(userLevel)}</span>
            ) : (
              "Explore Basic School Curriculum"
            )}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-3xl mx-auto -mt-7 px-6 relative z-20">
        <div className="relative flex items-center">
          <Search className="absolute left-6 text-gray-400" size={22} />
          <input
            type="text"
            placeholder="Search for subjects (e.g., Mathematics, Science)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-14 py-5 bg-white border border-gray-100 rounded-3xl shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-base font-bold text-slate-800 transition-all"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Loading Curriculum Hub...</p>
        </div>
      ) : (
        /* Subjects Grid */
        <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSubjects.map((subject) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-lg shadow-blue-100">
                      {subject.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic leading-none">{subject.name}</h2>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">
                        {subject.levels.length} {subject.levels.length === 1 ? 'Level' : 'Levels'} Available
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 my-6">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Select Academic Level</p>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {subject.levels.sort().map((level) => {
                      const formattedLevel = formatLevel(level);
                      const isUserLevel = userLevel && formatLevel(userLevel).toLowerCase() === formattedLevel.toLowerCase();
                      const showAsActive = isAdmin || isUserLevel;

                      return (
                        <button
                          key={level}
                          onClick={() => handleLevelClick(subject.name, level)}
                          className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all relative ${
                            showAsActive
                              ? "bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95" 
                              : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60 hover:opacity-80"
                          }`}
                        >
                          {formattedLevel}
                          {isUserLevel && !isAdmin && (
                            <span className="absolute -top-2 -right-1 bg-yellow-400 text-blue-950 text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm">
                              YOUR LEVEL
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSubjects.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] max-w-2xl mx-auto mt-12 border border-slate-100 shadow-sm p-8">
          <BookOpen className="mx-auto text-slate-300 mb-4" size={56} />
          <h3 className="text-xl font-black text-slate-800 uppercase">No Subjects Found</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
            We couldn't find any subject matching "{search}"
          </p>
          <button 
            onClick={() => setSearch('')}
            className="mt-6 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}