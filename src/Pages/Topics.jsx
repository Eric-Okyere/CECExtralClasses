import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ChevronDown, PlayCircle, CheckCircle2, Video, HelpCircle, User } from "lucide-react";
import { API_BASE_URL } from "../services/BaseUrl";

export default function Topics() {
  const { subject, level } = useParams();
  const navigate = useNavigate();

  const [strands, setStrands] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({});
  const [expandedSubStrands, setExpandedSubStrands] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Active Learner State
  const [activeProfile, setActiveProfile] = useState(null);
  const [userProgressMap, setUserProgressMap] = useState({});

  const levels = ["JHS 1", "JHS 2", "JHS 3"];
  const baseUrl = API_BASE_URL.replace(/\/$/, "");

  // Helper to safely resolve nested strings or objects
  const getStringVal = (val, fallback = "") => {
    if (!val) return fallback;
    if (typeof val === "string") return val;
    if (typeof val === "object" && val !== null) {
      return (
        val.title ||
        val.name ||
        val.subStrandName ||
        val.topic ||
        val.strandName ||
        val.level ||
        fallback
      );
    }
    return String(val);
  };

  // String normalizer for matching parameters
  const normalizeKey = (str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  };

  // 1. RESOLVE ACTIVE LEARNER PROFILE & LISTEN FOR PROFILE SWITCHES
  useEffect(() => {
    const syncActiveProfile = () => {
      try {
        const savedUser = localStorage.getItem("user");
        const activeChild = localStorage.getItem("activeChildProfile") || localStorage.getItem("activeLearner");
        
        let profile = null;
        if (activeChild) {
          profile = JSON.parse(activeChild);
        } else if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          profile = parsedUser?.user || parsedUser;
        }

        setActiveProfile(profile);
      } catch (err) {
        console.error("Error parsing user profiles:", err);
      }
    };

    syncActiveProfile();

    window.addEventListener("storage", syncActiveProfile);
    window.addEventListener("profileChanged", syncActiveProfile);
    window.addEventListener("focus", syncActiveProfile);

    return () => {
      window.removeEventListener("storage", syncActiveProfile);
      window.removeEventListener("profileChanged", syncActiveProfile);
      window.removeEventListener("focus", syncActiveProfile);
    };
  }, []);

  // 2. FETCH USER-SPECIFIC PROGRESS WHEN ACTIVE PROFILE CHANGES
  useEffect(() => {
    const fetchUserProgress = async () => {
      const activeId = activeProfile?._id || activeProfile?.id;
      if (!activeId) return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${baseUrl}/progress/user/${activeId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        const progressList = res.data?.data || res.data || [];
        const map = {};

        if (Array.isArray(progressList)) {
          progressList.forEach((p) => {
            // Key by lesson ID or lesson parameters
            if (p.lessonId) map[p.lessonId] = true;
            if (p.lessonNumber && p.subStrand) {
              const key = `${normalizeKey(p.subject)}_${normalizeKey(p.level)}_${normalizeKey(p.subStrand)}_${p.lessonNumber}`;
              map[key] = true;
            }
          });
        }
        setUserProgressMap(map);
      } catch (err) {
        console.warn("Could not fetch remote progress, falling back to scoped local storage:", err);
      }
    };

    fetchUserProgress();
  }, [activeProfile, baseUrl]);

  // 3. FETCH CURRICULUM DATA WITH STRICT LEVEL FILTERING
  useEffect(() => {
    const fetchTopicsAndLessons = async () => {
      if (!level) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [subjectsRes, lessonsRes] = await Promise.all([
          axios.get(`${baseUrl}/subjects`),
          axios.get(`${baseUrl}/lessons`, {
            params: { subject, level }
          })
        ]);

        const allSubjects = subjectsRes.data?.data || subjectsRes.data || [];
        const fetchedLessons = lessonsRes.data?.data || lessonsRes.data || [];

        const normSubjectParam = normalizeKey(subject);
        const normLevelParam = normalizeKey(level);

        // Match subject data primary on subject name and current level
        const currentSubjectData = allSubjects.find((s) => {
          const sName = normalizeKey(getStringVal(s.name || s.title));
          const sLevel = normalizeKey(getStringVal(s.level));
          return sName === normSubjectParam && (sLevel === normLevelParam || !sLevel);
        }) || allSubjects.find((s) => normalizeKey(getStringVal(s.name || s.title)) === normSubjectParam);

        if (currentSubjectData && currentSubjectData.strands) {
          setStrands(currentSubjectData.strands);
        } else {
          setStrands([]);
        }

        const map = {};

        if (Array.isArray(fetchedLessons)) {
          // Strict client-side filter: Ensure only lessons matching the target level are listed
          const levelFilteredLessons = fetchedLessons.filter((lesson) => {
            const lessonLevel = normalizeKey(getStringVal(lesson.level));
            return !lessonLevel || lessonLevel === normLevelParam;
          });

          levelFilteredLessons.forEach((lesson) => {
            const rawSubStrand = getStringVal(
              lesson.subStrand || lesson.subStrandName || lesson.topic
            );
            const subKey = normalizeKey(rawSubStrand);

            if (subKey) {
              if (!map[subKey]) map[subKey] = [];
              map[subKey].push(lesson);
            }
          });
        } else if (typeof fetchedLessons === "object" && fetchedLessons !== null) {
          Object.entries(fetchedLessons).forEach(([subName, list]) => {
            const subKey = normalizeKey(subName);
            if (Array.isArray(list)) {
              map[subKey] = list.filter((l) => {
                const lessonLevel = normalizeKey(getStringVal(l.level));
                return !lessonLevel || lessonLevel === normLevelParam;
              });
            } else {
              map[subKey] = list;
            }
          });
        }

        Object.keys(map).forEach((key) => {
          if (Array.isArray(map[key])) {
            map[key].sort(
              (a, b) => (Number(a.lessonNumber) || 0) - (Number(b.lessonNumber) || 0)
            );
          }
        });

        setLessonsMap(map);
      } catch (err) {
        console.error("Error fetching curriculum data:", err);
        setError("Failed to load curriculum data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicsAndLessons();
  }, [subject, level, baseUrl]);

  const toggleSubStrand = (subStrandTitle) => {
    setExpandedSubStrands((prev) => ({
      ...prev,
      [subStrandTitle]: prev[subStrandTitle] === undefined ? false : !prev[subStrandTitle]
    }));
  };

  // 4. CHECK USER-SCOPED LESSON COMPLETION
  const isLessonCompleted = (les, subStrandTitle) => {
    if (!les) return false;
    const activeId = activeProfile?._id || activeProfile?.id || "guest";
    const targetNum = les.lessonNumber || 1;
    const subNorm = normalizeKey(subStrandTitle);
    const subjNorm = normalizeKey(subject);
    const levelNorm = normalizeKey(level);

    // First check backend progress map
    if (userProgressMap[les._id]) return true;
    const scopedProgressKey = `${subjNorm}_${levelNorm}_${subNorm}_${targetNum}`;
    if (userProgressMap[scopedProgressKey]) return true;

    // Check user-scoped local storage entries
    return (
      localStorage.getItem(`completed_lesson_${activeId}_${les._id}`) === "true" ||
      localStorage.getItem(`completed_${activeId}_${subjNorm}_${levelNorm}_${subNorm}_${targetNum}`) === "true"
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        {/* ACTIVE LEARNER BANNER */}
        {activeProfile && (
          <div className="mb-6 flex items-center justify-between bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center uppercase text-sm">
                {activeProfile.name ? activeProfile.name.charAt(0) : <User size={18} />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Viewing Learning Topics For</p>
                <h2 className="text-sm font-black text-slate-800 uppercase">{activeProfile.name || "Student Profile"}</h2>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-200">
              Active Profile
            </span>
          </div>
        )}

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
                onClick={() =>
                  navigate(
                    `/topics/${encodeURIComponent(subject)}/${encodeURIComponent(lvl)}`
                  )
                }
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

        {/* STRANDS & SUB-STRANDS */}
        {level && !loading && strands.length > 0 ? (
          <div className="space-y-10">
            {strands.map((strand, index) => {
              const strandTitle = getStringVal(strand.title || strand.name || strand);

              return (
                <motion.div
                  key={strand._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
                >
                  <h2 className="text-lg md:text-xl font-black text-slate-800 mb-6 uppercase tracking-wide flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="w-2 h-7 bg-blue-600 rounded-full"></span>
                    STRAND: {strandTitle}
                  </h2>

                  <div className="space-y-8">
                    {strand.subStrands?.map((sub, subIndex) => {
                      const subStrandTitle = getStringVal(
                        sub.title || sub.name || sub.subStrandName || sub
                      );
                      const subKey = normalizeKey(subStrandTitle);

                      const subLessons = lessonsMap[subKey] || [];
                      const isExpanded = expandedSubStrands[subStrandTitle] !== false;

                      return (
                        <div
                          key={sub._id || subIndex}
                          className="bg-slate-50/50 rounded-2xl border border-slate-200/60 overflow-hidden p-5"
                        >
                          {/* SUB-STRAND HEADER */}
                          <div
                            onClick={() => toggleSubStrand(subStrandTitle)}
                            className="flex items-center justify-between pb-4 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                                SUB-STRAND: {subStrandTitle}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 text-xs font-bold uppercase">
                                {subLessons.length}{" "}
                                {subLessons.length === 1 ? "Lesson" : "Lessons"}
                              </span>
                              <ChevronDown
                                size={18}
                                className={`text-slate-400 transition-transform duration-300 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>

                          {/* LESSON CARDS GRID */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-2"
                              >
                                {subLessons.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {subLessons.map((les, lIdx) => {
                                      const completed = isLessonCompleted(
                                        les,
                                        subStrandTitle
                                      );
                                      const targetLessonNum =
                                        les.lessonNumber ?? (lIdx + 1);
                                      const lessonDisplayName =
                                        getStringVal(
                                          les.lessonName || les.title || les.name
                                        ) || `Lesson ${targetLessonNum}`;

                                      const activeId = activeProfile?._id || activeProfile?.id;

                                      return (
                                        <div
                                          key={les._id || lIdx}
                                          onClick={() =>
                                            navigate(
                                              `/lesson/${encodeURIComponent(
                                                subject
                                              )}/${encodeURIComponent(
                                                level
                                              )}/${encodeURIComponent(
                                                subStrandTitle
                                              )}/${targetLessonNum}?id=${les._id}${
                                                activeId ? `&learnerId=${activeId}` : ""
                                              }`
                                            )
                                          }
                                          className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between space-y-4 ${
                                            completed
                                              ? "border-emerald-200 bg-emerald-50/20"
                                              : "border-slate-200/80 hover:border-blue-500"
                                          }`}
                                        >
                                          <div>
                                            <div className="flex items-center justify-between mb-3">
                                              <div className="flex items-center gap-1.5">
                                                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                                  {level}
                                                </span>
                                                <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                                  Lesson {targetLessonNum}
                                                </span>
                                              </div>
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {subStrandTitle}
                                              </span>
                                            </div>

                                            <h3 className="font-black text-sm md:text-base text-slate-800 uppercase tracking-tight mb-1 line-clamp-2">
                                              {lessonDisplayName}
                                            </h3>

                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                              {subject}
                                            </p>
                                          </div>

                                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10px] font-black text-slate-500 uppercase">
                                            <div className="flex items-center gap-3">
                                              <span className="flex items-center gap-1">
                                                <Video
                                                  size={12}
                                                  className="text-rose-500"
                                                />
                                                {les.videosCount ??
                                                  les.videos?.length ??
                                                  (les.videoUrl ? 1 : 0)}{" "}
                                                Video
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <HelpCircle
                                                  size={12}
                                                  className="text-emerald-500"
                                                />
                                                {les.quizCount ??
                                                  les.quiz?.length ??
                                                  les.questions?.length ??
                                                  0}{" "}
                                                Questions
                                              </span>
                                            </div>

                                            <div>
                                              {completed ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-black">
                                                  <CheckCircle2 size={14} /> Done
                                                </span>
                                              ) : (
                                                <span className="flex items-center gap-1 text-blue-600 font-black hover:underline">
                                                  <PlayCircle size={14} /> Start
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const activeId = activeProfile?._id || activeProfile?.id;
                                      navigate(
                                        `/lesson/${encodeURIComponent(
                                          subject
                                        )}/${encodeURIComponent(
                                          level
                                        )}/${encodeURIComponent(
                                          subStrandTitle
                                        )}/1${activeId ? `?learnerId=${activeId}` : ""}`
                                      );
                                    }}
                                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-blue-50 text-blue-700 font-black text-xs uppercase hover:bg-blue-100 transition-colors"
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
              );
            })}
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