import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  GraduationCap, 
  ListChecks, 
  AlertCircle, 
  Eye, 
  Search, 
  Filter, 
  XCircle,
  CirclePlus,
  Trash2
} from 'lucide-react';
import { API_BASE_URL } from '../../services/BaseUrl';

const AllSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');

  const navigate = useNavigate();

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}subjects`);
      const data = response.data.data || [];
      setSubjects(data);
      setFilteredSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Dynamically extract unique academic levels from fetched subjects
  const availableLevels = useMemo(() => {
    const levels = subjects.map(s => s.level).filter(Boolean);
    return ['All Levels', ...Array.from(new Set(levels))];
  }, [subjects]);

  // Handle Filtering Logic
  useEffect(() => {
    let result = subjects;

    if (searchTerm.trim()) {
      result = result.filter(sub => 
        sub.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
    }

    if (selectedLevel !== 'All Levels') {
      result = result.filter(sub => sub.level === selectedLevel);
    }

    setFilteredSubjects(result);
  }, [searchTerm, selectedLevel, subjects]);

  const handleDeleteSubject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}subjects/${id}`);
      setSubjects(prev => prev.filter(sub => sub._id !== id));
    } catch (error) {
      alert(error.response?.data?.msg || "Failed to delete subject");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
       <p className="text-gray-500 font-medium tracking-wide">Syncing Curriculum...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            Curriculum <span className="text-blue-600">Hub</span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Ghana Common Core Programme Management</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/create-subject")}
            className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95"
          >
            <CirclePlus size={16} />
            Create Subject
          </button>

          <span className="px-4 py-3 bg-blue-50 text-blue-700 text-xs font-black rounded-2xl uppercase tracking-widest shadow-sm">
            {filteredSubjects.length} of {subjects.length} Subjects
          </span>
        </div>
      </header>

      {/* --- Search and Filter Bar --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search by subject name (e.g. Science)..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative min-w-[180px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-11 pr-8 py-3.5 bg-white border border-gray-200 rounded-2xl appearance-none focus:ring-4 focus:ring-blue-50 outline-none font-bold text-gray-700 shadow-sm transition-all"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {availableLevels.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSubjects.map((subject) => (
            <div 
              key={subject._id} 
              className="group bg-white border border-gray-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                    <GraduationCap size={28} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter mb-1">Academic Level</span>
                    <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-lg">
                      {subject.level}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-800 leading-none mb-3 uppercase tracking-tighter">
                  {subject.name}
                </h3>

                <div className="space-y-2 mb-8">
                  {(subject.strands?.length || 0) > 0 ? (
                    <div className="inline-flex items-center text-emerald-600 px-2.5 py-1 bg-emerald-50 rounded-md text-[10px] font-black uppercase">
                      <ListChecks size={12} className="mr-1.5" />
                      {subject.strands.length} Strands Ready
                    </div>
                  ) : (
                    <div className="inline-flex items-center text-rose-500 px-2.5 py-1 bg-rose-50 rounded-md text-[10px] font-black uppercase">
                      <AlertCircle size={12} className="mr-1.5" />
                      Empty Curriculum
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="h-[1px] bg-gray-100 w-full mb-6"></div>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate(`/subject-details/${subject._id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                  >
                    <Eye size={18} />
                    View Details
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => navigate(`/edit-subject/${subject._id}`)}
                      className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-3 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    <button 
                      onClick={() => handleDeleteSubject(subject._id, subject.name)}
                      className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-3 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-all border border-transparent"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <XCircle className="mx-auto text-gray-200 mb-4" size={64} />
          <h2 className="text-2xl font-black text-gray-800 uppercase">No matching subjects</h2>
          <p className="text-gray-400 mt-2 font-medium">Try adjusting your search or level filters.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedLevel('All Levels'); }}
            className="mt-6 text-blue-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AllSubjects;