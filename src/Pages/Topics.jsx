import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ChevronDown, PlayCircle, CheckCircle2, BookOpen } from "lucide-react";
import { API_BASE_URL } from "../services/BaseUrl";

export default function Topics() {
  const { subject, level } = useParams();
  const navigate = useNavigate();

  const [strands, setStrands] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({});
  const [expandedSubStrands, setExpandedSubStrands] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Force re-render state when localStorage changes
  const [, setTick] = useState(0);

  const levels = ["JHS 1", "JHS 2", "JHS 3"];

  // Normalize Base URL to avoid broken route slashes
  const baseUrl = API_BASE_URL.replace(/\/$/, "");

  // 1. Listen for localStorage / window focus changes to keep progress state in sync
  useEffect(() => {
    const handleStorageChange = () => {
      setTick((prev) => prev + 1);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  // 2. Fetch Curriculum Data
  useEffect(() => {
    const fetchTopicsAndLessons = async () => {
      if (!level) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch subjects and lessons concurrently
        const [subjectsRes, lessonsRes] = await Promise.all([
          axios.get(`${baseUrl}/subjects`),
          axios.get(`${baseUrl}/lessons`)
        ]);

        const allSubjects = subjectsRes.data?.data || subjectsRes.data || [];
        const allLessons = lessonsRes.data?.data || lessonsRes.data || [];

        // Find the current subject matching level
        const currentSubjectData = allSubjects.find(
          (s) =>
            s.name?.trim().toLowerCase() === subject?.trim().toLowerCase() &&
            s.level?.trim().toLowerCase() === level?.trim().toLowerCase()
        );

        if (currentSubjectData && currentSubjectData.strands) {
          setStrands(currentSubjectData.strands);
        } else {
          setStrands([]);
        }

        // Map all lessons by normalized sub-strand string for easy lookup
        const map = {};
        allLessons.forEach((lesson) => {
          const lSubject = lesson.subject?.name || lesson.subject || "";
          const lLevel = lesson.level || "";

          if (
            lSubject.trim().toLowerCase() === subject?.trim().toLowerCase() &&
            lLevel.trim().toLowerCase() === level?.trim().toLowerCase()
          ) {
            // Support both Object and String formats for subStrand
            const rawSubStrand = typeof lesson.subStrand === "object" 
              ? lesson.subStrand?.title || lesson.subStrand?.name 
              : lesson.subStrand;

            const subKey = rawSubStrand?.trim().toLowerCase();
            if (subKey) {
              if (!map[subKey]) map[subKey] = [];
              map[subKey].push(lesson);
            }
          }
        });

        // Sort lessons inside each sub-strand by lessonNumber if present
        Object.keys(map).forEach((key) => {
          map[key].sort((a, b) => (a.lessonNumber || 0) - (b.lessonNumber || 0));
        });

        setLessonsMap(map);
      } catch (err) {
        console.error("Error fetching curriculum data:", err);
        setError("Failed to load curriculum.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicsAndLessons();
  }, [subject, level, baseUrl]);

  const toggleSubStrand = (subStrandTitle) => {
    setExpandedSubStrands((prev) => ({
      ...prev,
      [subStrandTitle]: !prev[subStrandTitle]
    }));
  };

  // Utility function to check if a lesson is completed in localStorage
  const isLessonCompleted = (les, subStrandTitle) => {
    const targetNum = les.lessonNumber || 1;
    const subNorm = subStrandTitle?.trim().toLowerCase();
    const subjNorm = subject?.trim().toLowerCase();
    const levelNorm = level?.trim().toLowerCase();

    // Check various possible progress keys stored across different environments
    const key1 = `${subject}-${level}-${subStrandTitle}-${les._id}`;
    const key2 = `completed-${subject}-${level}-${subStrandTitle}-${targetNum}`;
    const key3 = `completed_${subjNorm}_${levelNorm}_${subNorm}_${targetNum}`;
    const key4 = `completed_lesson_${les._id}`;
    const key5 = `completed_${les._id}`;

    return (
      localStorage.getItem(key1) === "true" ||
      localStorage.getItem(key2) === "true" ||
      localStorage.getItem(key3) === "true" ||
      localStorage.getItem(key4) === "true" ||
      localStorage.getItem(key5) === "true"
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20">
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
                className="cursor-pointer bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 text-center font-black text-slate-700 hover:shadow-xl transition-all"
              >
                {lvl}
              </motion.div>
            ))}
          </div>
        )}

        {/* LOADING STATE */}
        {level && loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">
              Loading Lessons...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="text-center py-10 bg-red-50 text-red-600 rounded-2xl mb-6">
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* STRANDS & SUB-STRANDS WITH LESSONS */}
        {level && !loading && strands.length > 0 ? (
          <div className="space-y-8">
            {strands.map((strand, index) => (
              <motion.div
                key={strand._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
              >
                <h2 className="text-xl font-black text-blue-700 mb-6 uppercase tracking-wide flex items-center">
                  <span className="w-2 h-8 bg-yellow-400 mr-4 rounded-full"></span>
                  {strand.title}
                </h2>

                <div className="space-y-4">
                  {strand.subStrands?.map((sub, subIndex) => {
                    const subStrandTitle = typeof sub === "string" ? sub : sub.title || sub.name;
                    const subKey = subStrandTitle?.trim().toLowerCase();
                    const subLessons = lessonsMap[subKey] || [];
                    const isExpanded = expandedSubStrands[subStrandTitle];

                    return (
                      <div
                        key={sub._id || subIndex}
                        className="bg-slate-50/70 rounded-2xl border border-slate-200/60 overflow-hidden"
                      >
                        {/* SUB-STRAND HEADER BAR */}
                        <div
                          onClick={() => toggleSubStrand(subStrandTitle)}
                          className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen size={18} className="text-blue-600" />
                            <span className="font-black text-sm md:text-base text-slate-800 uppercase">
                              {subStrandTitle}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                              {subLessons.length} {subLessons.length === 1 ? "Lesson" : "Lessons"}
                            </span>
                            <ChevronDown
                              size={18}
                              className={`text-slate-400 transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* LESSONS LIST DROPDOWN */}
                        <AnimatePresence>
                          {(isExpanded || subLessons.length === 0) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-slate-200/60 bg-white p-4 space-y-2"
                            >
                              {subLessons.length > 0 ? (
                                subLessons.map((les, lIdx) => {
                                  const completed = isLessonCompleted(les, subStrandTitle);
                                  const targetLessonNum = les.lessonNumber ?? (lIdx + 1);

                                  return (
                                    <button
                                      key={les._id || lIdx}
                                      onClick={() =>
                                        navigate(
                                          `/lesson/${subject}/${level}/${encodeURIComponent(
                                            subStrandTitle
                                          )}/${targetLessonNum}`
                                        )
                                      }
                                      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all text-left group ${
                                        completed
                                          ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50"
                                          : "border-slate-100 hover:border-blue-500 hover:bg-blue-50/50"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {completed ? (
                                          <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                                        ) : (
                                          <PlayCircle
                                            size={20}
                                            className="text-blue-500 group-hover:scale-110 transition-transform shrink-0"
                                          />
                                        )}
                                        <div>
                                          <p
                                            className={`text-xs font-black uppercase ${
                                              completed ? "text-emerald-900" : "text-slate-700"
                                            }`}
                                          >
                                            {les.lessonNumber ? `Lesson ${les.lessonNumber}: ` : ""}
                                            {les.lessonName || `Part ${lIdx + 1}`}
                                          </p>
                                          {les.videos?.length > 0 && (
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                              {les.videos.length}{" "}
                                              {les.videos.length === 1 ? "Video" : "Videos"} •{" "}
                                              {les.quiz?.length || 0} Quiz Questions
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      <div>
                                        {completed ? (
                                          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 font-black text-[10px] px-3 py-1 rounded-full uppercase">
                                            Completed ✓
                                          </span>
                                        ) : (
                                          <span className="text-blue-600 font-black text-[10px] uppercase group-hover:translate-x-1 transition-transform inline-block">
                                            Start →
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })
                              ) : (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/lesson/${subject}/${level}/${encodeURIComponent(
                                        subStrandTitle
                                      )}/1`
                                    )
                                  }
                                  className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-blue-50 text-blue-700 font-black text-xs uppercase hover:bg-blue-100 transition-colors"
                                >
                                  <span>Launch {subStrandTitle} Module</span>
                                  <span>Go →</span>
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          level &&
          !loading && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                Curriculum not yet available for this level.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}