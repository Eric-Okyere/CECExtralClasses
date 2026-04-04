import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ManageLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/lessons");
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
        <button onClick={()=> navigate("/create-quiz")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
          + Add New Lesson
        </button>
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
          <p className="text-2xl font-bold">{lessons.reduce((acc, curr) => acc + curr.quiz.length, 0)}</p>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded uppercase">
                  {lesson.level}
                </span>
                <span className="text-xs text-gray-400">ID: {lesson._id.slice(-6)}</span>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight uppercase">
                {lesson.subject}
              </h2>
              <p className="text-blue-600 font-medium text-sm mb-3">
                {lesson.strand}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1 italic">Sub-Strand</p>
                <p className="text-sm text-gray-700">{lesson.subStrand}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  Video Linked
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {lesson.quiz.length} Questions
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => navigate(`/lesson/${lesson._id}`)}  className="text-gray-600 hover:text-blue-600 font-medium text-sm px-3 py-1">
                Preview
              </button>
              <button className="text-gray-600 hover:text-blue-600 font-medium text-sm px-3 py-1">
                Edit
              </button>
              <button className="text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageLessons;