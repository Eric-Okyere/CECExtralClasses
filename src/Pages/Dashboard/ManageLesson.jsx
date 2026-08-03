import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/BaseUrl";
import { 
  Video, 
  HelpCircle, 
  Eye, 
  Trash2, 
  Layers, 
  Hash, 
  Search, 
  Filter, 
  ArrowUpDown, 
  X,
  BookOpen,
  FolderTree
} from "lucide-react";

export default function ManageLessons() {
  const [lessons, setLessons] = useState([]);
  const [subjectsTree, setSubjectsTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedStrand, setSelectedStrand] = useState("ALL");
  const [selectedSubStrand, setSelectedSubStrand] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [sortBy, setSortBy] = useState("lessonNumber-asc");

  const levels = ["JHS 1", "JHS 2", "JHS 3"];

  // Fetch Lessons and Subjects Taxonomy Tree
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsRes, subjectsRes] = await Promise.all([
          fetch(`${API_BASE_URL}lessons`),
          fetch(`${API_BASE_URL}subjects`)
        ]);

        const lessonsJson = await lessonsRes.json();
        const subjectsJson = await subjectsRes.json();

        if (lessonsJson.success) setLessons(lessonsJson.data || []);
        if (subjectsJson.success) setSubjectsTree(subjectsJson.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LOOKUP MAPS FOR RAW OBJECT IDs ---
  const taxonomyLookups = useMemo(() => {
    const subjectsMap = new Map();
    const strandsMap = new Map();
    const subStrandsMap = new Map();

    subjectsTree.forEach((sub) => {
      if (sub._id) subjectsMap.set(String(sub._id), sub.name || sub.title);

      if (Array.isArray(sub.strands)) {
        sub.strands.forEach((st) => {
          if (st._id) strandsMap.set(String(st._id), st.title || st.name);

          if (Array.isArray(st.subStrands)) {
            st.subStrands.forEach((sst) => {
              if (typeof sst === "object" && sst !== null) {
                if (sst._id) subStrandsMap.set(String(sst._id), sst.title || sst.name);
              }
            });
          }
        });
      }
    });

    return { subjectsMap, strandsMap, subStrandsMap };
  }, [subjectsTree]);

  // SAFELY EXTRACT HUMAN-READABLE NAMES
  const getSubjectName = (lesson) => {
    if (!lesson?.subject) return "Unassigned Subject";
    if (typeof lesson.subject === "object" && lesson.subject !== null) {
      return lesson.subject.name || lesson.subject.title || "Unassigned Subject";
    }
    return taxonomyLookups.subjectsMap.get(String(lesson.subject)) || lesson.subject;
  };

  const getStrandName = (lesson) => {
    if (!lesson?.strand) return "Uncategorized Strand";
    if (typeof lesson.strand === "object" && lesson.strand !== null) {
      return lesson.strand.title || lesson.strand.name || "Uncategorized Strand";
    }
    return taxonomyLookups.strandsMap.get(String(lesson.strand)) || lesson.strand;
  };

  const getSubStrandName = (lesson) => {
    if (!lesson?.subStrand) return "General Sub-Strand";
    if (typeof lesson.subStrand === "object" && lesson.subStrand !== null) {
      return lesson.subStrand.title || lesson.subStrand.name || "General Sub-Strand";
    }
    return taxonomyLookups.subStrandsMap.get(String(lesson.subStrand)) || lesson.subStrand;
  };

  // Extract unique subjects dynamically
  const subjectsList = useMemo(() => {
    const list = lessons.map((l) => getSubjectName(l)).filter(Boolean);
    return [...new Set(list)];
  }, [lessons, taxonomyLookups]);

  // Extract unique strands dynamically
  const strandsList = useMemo(() => {
    const filtered = selectedSubject === "ALL" 
      ? lessons 
      : lessons.filter(l => getSubjectName(l) === selectedSubject);
    const list = filtered.map((l) => getStrandName(l)).filter(Boolean);
    return [...new Set(list)];
  }, [lessons, selectedSubject, taxonomyLookups]);

  // Extract unique sub-strands dynamically
  const subStrandsList = useMemo(() => {
    const filtered = lessons.filter(l => {
      const matchSubj = selectedSubject === "ALL" || getSubjectName(l) === selectedSubject;
      const matchStrand = selectedStrand === "ALL" || getStrandName(l) === selectedStrand;
      return matchSubj && matchStrand;
    });
    const list = filtered.map((l) => getSubStrandName(l)).filter(Boolean);
    return [...new Set(list)];
  }, [lessons, selectedSubject, selectedStrand, taxonomyLookups]);

  // Filter & Sort Logic
  const filteredAndSortedLessons = useMemo(() => {
    return lessons
      .filter((lesson) => {
        const subject = getSubjectName(lesson);
        const strand = getStrandName(lesson);
        const subStrand = getSubStrandName(lesson);

        const matchesSearch =
          !searchTerm ||
          (lesson.lessonName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          strand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subStrand.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSubject = selectedSubject === "ALL" || subject === selectedSubject;
        const matchesStrand = selectedStrand === "ALL" || strand === selectedStrand;
        const matchesSubStrand = selectedSubStrand === "ALL" || subStrand === selectedSubStrand;
        const matchesLevel = selectedLevel === "ALL" || lesson.level === selectedLevel;

        return matchesSearch && matchesSubject && matchesStrand && matchesSubStrand && matchesLevel;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "lessonNumber-asc":
            return (Number(a.lessonNumber) || 0) - (Number(b.lessonNumber) || 0);
          case "lessonNumber-desc":
            return (Number(b.lessonNumber) || 0) - (Number(a.lessonNumber) || 0);
          case "title-asc":
            return (a.lessonName || "").localeCompare(b.lessonName || "");
          case "title-desc":
            return (b.lessonName || "").localeCompare(a.lessonName || "");
          case "quiz-desc":
            return (b.quiz?.length || 0) - (a.quiz?.length || 0);
          case "quiz-asc":
            return (a.quiz?.length || 0) - (b.quiz?.length || 0);
          default:
            return 0;
        }
      });
  }, [lessons, searchTerm, selectedSubject, selectedStrand, selectedSubStrand, selectedLevel, sortBy, taxonomyLookups]);

  // Group lessons by Strand -> Sub-Strand
  const groupedLessons = useMemo(() => {
    const groups = {};
    filteredAndSortedLessons.forEach((lesson) => {
      const strandKey = getStrandName(lesson);
      const subStrandKey = getSubStrandName(lesson);

      if (!groups[strandKey]) {
        groups[strandKey] = {};
      }
      if (!groups[strandKey][subStrandKey]) {
        groups[strandKey][subStrandKey] = [];
      }
      groups[strandKey][subStrandKey].push(lesson);
    });
    return groups;
  }, [filteredAndSortedLessons, taxonomyLookups]);

  const handleDelete = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}lessons/${lessonId}`, {
        method: "DELETE",
      });
      const json = await response.json();
      if (json.success) {
        setLessons(lessons.filter((l) => l._id !== lessonId));
      } else {
        alert("Could not delete lesson.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubject("ALL");
    setSelectedStrand("ALL");
    setSelectedSubStrand("ALL");
    setSelectedLevel("ALL");
    setSortBy("lessonNumber-asc");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lesson Management</h1>
          <p className="text-sm text-gray-500">Manage curriculum content organized by Strand & Sub-Strand</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate("/all-subjects")} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg transition duration-200">
            All Subjects
          </button>
          <button onClick={() => navigate("/create-quiz")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200">
            + Add New Lesson
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-semibold">Total Lessons</p>
          <p className="text-2xl font-bold">{lessons.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-semibold">Subjects</p>
          <p className="text-2xl font-bold">{subjectsList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-semibold">Active Quizzes</p>
          <p className="text-2xl font-bold">{lessons.reduce((acc, curr) => acc + (curr.quiz?.length || 0), 0)}</p>
        </div>
      </div>

      {/* Control Panel: Search, Filters & Sorting */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search lesson, strand, sub-strand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(searchTerm || selectedSubject !== "ALL" || selectedStrand !== "ALL" || selectedSubStrand !== "ALL" || selectedLevel !== "ALL" || sortBy !== "lessonNumber-asc") && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-600 font-bold uppercase hover:underline"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <Filter size={14} className="text-gray-500 shrink-0" />
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedStrand("ALL");
                setSelectedSubStrand("ALL");
              }}
              className="bg-transparent focus:outline-none text-gray-700 font-medium text-xs uppercase cursor-pointer w-full"
            >
              <option value="ALL">All Subjects</option>
              {subjectsList.map((subj) => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <FolderTree size={14} className="text-gray-500 shrink-0" />
            <select
              value={selectedStrand}
              onChange={(e) => {
                setSelectedStrand(e.target.value);
                setSelectedSubStrand("ALL");
              }}
              className="bg-transparent focus:outline-none text-gray-700 font-medium text-xs uppercase cursor-pointer w-full"
            >
              <option value="ALL">All Strands</option>
              {strandsList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <Layers size={14} className="text-gray-500 shrink-0" />
            <select
              value={selectedSubStrand}
              onChange={(e) => setSelectedSubStrand(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 font-medium text-xs uppercase cursor-pointer w-full"
            >
              <option value="ALL">All Sub-Strands</option>
              {subStrandsList.map((sst) => (
                <option key={sst} value={sst}>{sst}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 font-medium text-xs uppercase cursor-pointer w-full"
            >
              <option value="ALL">All Levels</option>
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <ArrowUpDown size={14} className="text-gray-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-700 font-medium text-xs cursor-pointer w-full"
            >
              <option value="lessonNumber-asc">Lesson # (Low to High)</option>
              <option value="lessonNumber-desc">Lesson # (High to Low)</option>
              <option value="title-asc">Title (A - Z)</option>
              <option value="title-desc">Title (Z - A)</option>
              <option value="quiz-desc">Questions (Most First)</option>
              <option value="quiz-asc">Questions (Least First)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6 text-xs font-semibold uppercase text-gray-500 tracking-wider">
        Showing {filteredAndSortedLessons.length} of {lessons.length} Lessons
      </div>

      {filteredAndSortedLessons.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No lessons found</h3>
          <p className="text-sm text-gray-500 mb-4">Try adjusting your search terms or filters.</p>
          <button onClick={clearFilters} className="text-blue-600 hover:underline font-semibold text-sm">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.keys(groupedLessons).map((strandName) => (
            <div key={strandName} className="space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-blue-600 pb-2">
                <FolderTree className="text-blue-600" size={20} />
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-wide">
                  Strand: {strandName}
                </h2>
              </div>

              {Object.keys(groupedLessons[strandName]).map((subStrandName) => (
                <div key={subStrandName} className="pl-2 md:pl-4 space-y-4">
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                    <Layers size={14} className="text-slate-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider">
                      Sub-Strand: {subStrandName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {groupedLessons[strandName][subStrandName].map((lesson) => (
                      <div
                        key={lesson._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between"
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              {lesson.level && (
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
                                  {lesson.level}
                                </span>
                              )}
                              {lesson.lessonNumber && (
                                <span className="bg-slate-900 text-white text-xs font-black px-2 py-0.5 rounded flex items-center gap-0.5">
                                  <Hash size={10} /> {lesson.lessonNumber}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">ID: {lesson._id.slice(-6)}</span>
                          </div>

                          <h2 className="text-xl font-black text-gray-900 mb-1 leading-tight uppercase">
                            {lesson.lessonName || "Untitled Lesson"}
                          </h2>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">
                            <span>{getSubjectName(lesson)}</span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Video size={16} className="text-red-500" />
                              <span className="font-semibold text-xs uppercase text-gray-500">
                                {lesson.videos?.length || 0} {lesson.videos?.length === 1 ? "Video" : "Videos"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HelpCircle size={16} className="text-green-500" />
                              <span className="font-semibold text-xs uppercase text-gray-500">
                                {lesson.quiz?.length || 0} Questions
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-3">
                          <button
                            onClick={() => navigate(`/lesson/${lesson._id}`)}
                            className="text-gray-600 hover:text-blue-600 font-black uppercase text-xs tracking-wider px-3 py-1 flex items-center gap-1.5"
                          >
                            <Eye size={14} /> Preview
                          </button>
                          <button
                            onClick={() => handleDelete(lesson._id)}
                            className="text-red-500 hover:text-red-700 font-black uppercase text-xs tracking-wider px-3 py-1 flex items-center gap-1.5"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}