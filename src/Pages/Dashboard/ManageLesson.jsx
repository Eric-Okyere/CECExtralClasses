import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/BaseUrl";
import { Video, HelpCircle, Eye, Trash2, Layers, BookOpen, Hash } from "lucide-react";

const ManageLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}lessons`);
        const json = await response.json();
        if (json.success) setLessons(json.data);
      } catch (err) {
        console.error("Error fetching lessons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  // Simple placeholder for delete functionality
  const handleDelete = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}lessons/${lessonId}`, {
        method: "DELETE",
      });
      const json = await response.json();
      if (json.success) {
        setLessons(lessons.filter((l) => l._id !== lessonId));
        alert("Lesson deleted successfully!");
      } else {
        alert("Could not delete lesson.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Lesson Management</h1>
          <p className="text-sm text-gray-500">Manage curriculum content and quizzes</p>
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
          <p className="text-2xl font-bold">{[...new Set(lessons.map(l => l.subject))].length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-semibold">Active Quizzes</p>
          <p className="text-2xl font-bold">{lessons.reduce((acc, curr) => acc + (curr.quiz?.length || 0), 0)}</p>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between">
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
                    {lesson.level}
                  </span>
                  {lesson.lessonNumber && (
                    <span className="bg-slate-900 text-white text-xs font-black px-2 py-0.5 rounded flex items-center gap-0.5">
                      <Hash size={10} /> {lesson.lessonNumber}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">ID: {lesson._id.slice(-6)}</span>
              </div>
              
              {/* Lesson Name/Title & Subject Info */}
              <h2 className="text-xl font-black text-gray-900 mb-1 leading-tight uppercase">
                {lesson.lessonName || "Untitled Lesson"}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                <span>{lesson.subject}</span>
                <span>•</span>
                <span className="text-blue-600">{lesson.strand}</span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 italic flex items-center gap-1">
                  <Layers size={12} /> Sub-Strand
                </p>
                <p className="text-sm text-gray-700 font-medium">{lesson.subStrand || "N/A"}</p>
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
  );
};

export default ManageLessons;