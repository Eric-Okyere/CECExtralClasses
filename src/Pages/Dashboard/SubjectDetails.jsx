import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Edit, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { API_BASE_URL } from '../../services/BaseUrl';

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}subjects/${id}`);
        setSubject(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subject details");
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="font-medium">Loading Curriculum...</p>
    </div>
  );

  if (!subject) return <div className="p-10 text-center">Subject not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} /> All Subjects
          </button>
          <button 
            onClick={() => navigate(`/edit-subject/${id}`)}
            className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all"
          >
            <Edit size={16} /> Edit Curriculum
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-10">
        {/* --- Header Hero Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                {subject.level}
              </span>
              <div className="flex items-center text-gray-400 text-xs">
                <Calendar size={14} className="mr-1" />
                Updated: {new Date(subject.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 uppercase tracking-tight">
              {subject.name}
            </h1>
            <p className="text-gray-500 max-w-2xl">
              Official Ghana Common Core Programme (CCP) curriculum structure including all approved strands and sub-strands for the {subject.level} academic cycle.
            </p>
          </div>
          {/* Decorative background icon */}
          <BookOpen className="absolute -right-10 -bottom-10 text-gray-50 opacity-[0.03]" size={300} />
        </motion.div>

        {/* --- Curriculum Content --- */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Layers className="text-blue-600" size={20} />
            <h2 className="text-xl font-bold text-gray-800">Curriculum Strands ({subject.strands.length})</h2>
          </div>

          <div className="grid gap-6">
            {subject.strands.map((strand, sIndex) => (
              <motion.div 
                key={strand._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: sIndex * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Strand Header */}
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                      {sIndex + 1}
                    </span>
                    {strand.title}
                  </h3>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {strand.subStrands.length} Sub-strands
                  </span>
                </div>

                {/* Sub-strands Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strand.subStrands.map((sub, ssIndex) => (
                    <div 
                      key={ssIndex} 
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 border border-transparent hover:border-blue-100 hover:bg-white transition-all group"
                    >
                      <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                          {sub}
                        </p>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          Sub-strand {ssIndex + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State if no strands exist */}
        {subject.strands.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Content Configured</h3>
            <p className="text-gray-500 mb-6">This subject currently has no strands or sub-strands.</p>
            <button 
               onClick={() => navigate(`/edit-subject/${id}`)}
               className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              Add Strands Now
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubjectDetails;