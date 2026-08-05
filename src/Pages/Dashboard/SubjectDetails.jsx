import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  GraduationCap, 
  Layers, 
  ListTree, 
  BookOpen, 
  Plus, 
  Trash2, 
  X, 
  AlertCircle,
  Code,
  FolderPlus
} from 'lucide-react';
import { API_BASE_URL } from '../../services/BaseUrl';

const SubjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [showStrandModal, setShowStrandModal] = useState(false);
  const [showSubStrandModal, setShowSubStrandModal] = useState(false);
  const [activeStrandId, setActiveStrandId] = useState(null);

  // Form Inputs
  const [newStrandTitle, setNewStrandTitle] = useState('');
  const [newSubStrandTitle, setNewSubStrandTitle] = useState('');
  const [newSubStrandCode, setNewSubStrandCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Base URL construction
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;

  // Fetch Subject Data
  const fetchSubjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}subjects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setSubject(response.data.data);
      } else {
        setError(response.data.msg || 'Failed to fetch subject details');
      }
    } catch (err) {
      console.error('Error fetching subject details:', err);
      setError(err.response?.data?.msg || 'Unable to load subject profile.');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, id]);

  useEffect(() => {
    fetchSubjectDetails();
  }, [fetchSubjectDetails]);

  // Handle Add Strand
  const handleAddStrand = async (e) => {
    e.preventDefault();
    if (!newStrandTitle.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${baseUrl}subjects/${id}/strands`,
        { title: newStrandTitle.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data.success) {
        setSubject(response.data.data);
        setNewStrandTitle('');
        setShowStrandModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to add strand');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Sub-Strand
  const handleAddSubStrand = async (e) => {
    e.preventDefault();
    if (!newSubStrandTitle.trim() || !activeStrandId) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${baseUrl}subjects/${id}/strands/${activeStrandId}/sub-strands`,
        { title: newSubStrandTitle.trim(), code: newSubStrandCode.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data.success) {
        setSubject(response.data.data);
        setNewSubStrandTitle('');
        setNewSubStrandCode('');
        setShowSubStrandModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to add sub-strand');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Strand Deletion
  const handleDeleteStrand = async (strandId, strandTitle) => {
    if (!window.confirm(`Are you sure you want to delete Strand "${strandTitle}" and all associated Sub-Strands?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${baseUrl}subjects/${id}/strands/${strandId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setSubject(response.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete strand');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-medium tracking-wide">Retrieving Curriculum Data...</p>
    </div>
  );

  if (error || !subject) return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-100 text-center">
      <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Subject Not Found</h2>
      <p className="text-gray-500 mt-2 mb-6 font-medium">{error || "The subject you requested does not exist."}</p>
      <button 
        onClick={() => navigate('/all-subjects')}
        className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
      >
        Return to Subjects
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Back Navigation & Main Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 rounded-2xl text-xs font-bold transition-all shadow-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStrandModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <Plus size={16} />
            Add Strand
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 mb-10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
              <GraduationCap size={40} />
            </div>
            <div>
              <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                {subject.level}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mt-2">
                {subject.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900">{subject.strands?.length || 0}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Strands</p>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900">
                {subject.strands?.reduce((acc, s) => acc + (s.subStrands?.length || 0), 0) || 0}
              </p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Strands</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strands & SubStrands Section */}
      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-2">
        <Layers className="text-blue-600" size={20} />
        Curriculum Strands
      </h2>

      {subject.strands && subject.strands.length > 0 ? (
        <div className="space-y-8">
          {subject.strands.map((strand, index) => (
            <div 
              key={strand._id} 
              className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm transition-all hover:shadow-md"
            >
              {/* Strand Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-600 text-xs font-black">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                      {strand.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      {strand.subStrands?.length || 0} Sub-strand(s) configured
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveStrandId(strand._id);
                      setShowSubStrandModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all"
                  >
                    <FolderPlus size={14} />
                    Add Sub-Strand
                  </button>

                  <button
                    onClick={() => handleDeleteStrand(strand._id, strand.title)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Strand"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* SubStrands Grid */}
              <div className="mt-6">
                {strand.subStrands && strand.subStrands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {strand.subStrands.map((sub) => (
                      <div 
                        key={sub._id} 
                        className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:bg-blue-50/50 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2.5 py-1 bg-white border border-gray-200 text-slate-700 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1">
                              <Code size={10} />
                              {sub.code || 'NO-CODE'}
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                              <BookOpen size={10} />
                              {sub.lessons?.length || 0} Lessons
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 leading-snug">
                            {sub.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <ListTree className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-xs text-gray-400 font-medium">No sub-strands created for this strand yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <ListTree className="mx-auto text-gray-200 mb-4" size={56} />
          <h3 className="text-xl font-black text-gray-800 uppercase">No Strands Added</h3>
          <p className="text-gray-400 mt-2 text-sm font-medium">Begin building this curriculum by adding its first strand.</p>
          <button 
            onClick={() => setShowStrandModal(true)}
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={16} />
            Create Strand
          </button>
        </div>
      )}

      {/* --- ADD STRAND MODAL --- */}
      {showStrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-black text-gray-900 uppercase">Add New Strand</h3>
              <button onClick={() => setShowStrandModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddStrand} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Strand Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Diversity of Matter"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  value={newStrandTitle}
                  onChange={(e) => setNewStrandTitle(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowStrandModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Strand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD SUB-STRAND MODAL --- */}
      {showSubStrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-black text-gray-900 uppercase">Add Sub-Strand</h3>
              <button onClick={() => setShowSubStrandModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubStrand} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Sub-Strand Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Living and Non-Living Things"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  value={newSubStrandTitle}
                  onChange={(e) => setNewSubStrandTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Code (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. B7.1.1.1"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  value={newSubStrandCode}
                  onChange={(e) => setNewSubStrandCode(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowSubStrandModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Sub-Strand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectDetails;