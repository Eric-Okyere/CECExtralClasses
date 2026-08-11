import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Plus, Trash2, ArrowLeft, Loader2, List, BookOpen, Layers } from 'lucide-react';
import { API_BASE_URL } from '../../services/BaseUrl';

const EditSubjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState({ name: '', level: '', strands: [] });

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}subjects/${id}`);
        const data = res.data.data;

        // Safely format data into initial component state
        const formattedSubject = {
          ...data,
          name: data?.name || '',
          level: data?.level || '',
          strands: (data?.strands || []).map((strand) => ({
            ...strand,
            _tempId: strand._id || crypto.randomUUID(),
            title: strand?.title || '',
            subStrands: (strand?.subStrands || []).map((ss) => {
              if (typeof ss === 'string') {
                return { _id: ss, _tempId: ss, title: '', code: '' };
              }
              return {
                ...ss,
                _tempId: ss._id || crypto.randomUUID(),
                title: ss?.title || '',
                code: ss?.code || ''
              };
            })
          }))
        };

        setSubject(formattedSubject);
      } catch (err) {
        alert("Could not load subject data");
        navigate('/all-subjects');
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [id, navigate]);

  // Top-level Subject fields (Name, Level)
  const handleSubjectChange = (field, value) => {
    setSubject((prev) => ({ ...prev, [field]: value }));
  };

  // Immutable Strand title update
  const handleStrandChange = (sIndex, field, value) => {
    setSubject((prev) => ({
      ...prev,
      strands: prev.strands.map((strand, i) =>
        i === sIndex ? { ...strand, [field]: value } : strand
      )
    }));
  };

  // Immutable SubStrand update (Title, Code)
  const handleSubStrandChange = (sIndex, ssIndex, field, value) => {
    setSubject((prev) => ({
      ...prev,
      strands: prev.strands.map((strand, i) => {
        if (i !== sIndex) return strand;
        return {
          ...strand,
          subStrands: strand.subStrands.map((ss, j) =>
            j === ssIndex ? { ...ss, [field]: value } : ss
          )
        };
      })
    }));
  };

  const addStrand = () => {
    setSubject((prev) => ({
      ...prev,
      strands: [
        ...prev.strands,
        {
          _tempId: crypto.randomUUID(),
          title: '',
          subStrands: [{ _tempId: crypto.randomUUID(), title: '', code: '' }]
        }
      ]
    }));
  };

  const addSubStrand = (sIndex) => {
    setSubject((prev) => ({
      ...prev,
      strands: prev.strands.map((strand, i) => {
        if (i !== sIndex) return strand;
        return {
          ...strand,
          subStrands: [
            ...(strand.subStrands || []),
            { _tempId: crypto.randomUUID(), title: '', code: '' }
          ]
        };
      })
    }));
  };

  const removeStrand = (sIndex) => {
    if (window.confirm("Are you sure you want to delete this entire Strand?")) {
      setSubject((prev) => ({
        ...prev,
        strands: prev.strands.filter((_, i) => i !== sIndex)
      }));
    }
  };

  const removeSubStrand = (sIndex, ssIndex) => {
    setSubject((prev) => ({
      ...prev,
      strands: prev.strands.map((strand, i) => {
        if (i !== sIndex) return strand;
        return {
          ...strand,
          subStrands: strand.subStrands.filter((_, j) => j !== ssIndex)
        };
      })
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Clean and construct full payload matching controller expectations
      const payload = {
        name: subject.name.trim(),
        level: subject.level.trim(),
        strands: subject.strands.map((strand) => ({
          ...(strand._id && strand._id.length === 24 ? { _id: strand._id } : {}),
          title: strand.title.trim(),
          subStrands: (strand.subStrands || []).map((ss) => ({
            ...(ss._id && ss._id.length === 24 ? { _id: ss._id } : {}),
            title: ss.title ? ss.title.trim() : '',
            code: ss.code ? ss.code.trim() : ''
          }))
        }))
      };

      await axios.put(`${API_BASE_URL}subjects/${id}`, payload);
      alert("Subject updated successfully!");
      navigate('/all-subjects');
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed. Check backend logs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition font-medium"
      >
        <ArrowLeft size={20} /> Back to Subjects
      </button>

      <form onSubmit={handleUpdate} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Subject Info Section */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <List className="text-blue-600" size={28} />
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Edit Subject</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> Subject Name
              </label>
              <input 
                type="text"
                className="w-full bg-white p-3.5 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-lg font-bold text-gray-800 transition-all shadow-sm"
                value={subject.name}
                onChange={(e) => handleSubjectChange('name', e.target.value)}
                placeholder="e.g., Integrated Science"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Layers size={14} /> Level
              </label>
              <input 
                type="text"
                className="w-full bg-white p-3.5 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-lg font-bold text-gray-800 transition-all shadow-sm"
                value={subject.level}
                onChange={(e) => handleSubjectChange('level', e.target.value)}
                placeholder="e.g., JHS 1"
                required
              />
            </div>
          </div>
        </div>

        {/* Dynamic Strands & Sub-Strands */}
        <div className="p-8 space-y-10">
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">Strands & Sub-Strands</h3>
              <button 
                type="button" 
                onClick={addStrand} 
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition shadow-lg shadow-gray-200"
              >
                <Plus size={18} /> New Strand
              </button>
            </div>

            {subject.strands.map((strand, sIndex) => (
              <div key={strand._tempId} className="p-8 border border-gray-100 rounded-[2rem] bg-gray-50/30 relative hover:border-blue-100 transition-all">
                <button 
                  type="button" 
                  onClick={() => removeStrand(sIndex)}
                  className="absolute top-6 right-6 text-gray-300 hover:text-rose-500 transition-colors"
                  title="Remove Strand"
                >
                  <Trash2 size={20} />
                </button>

                <div className="mb-8">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 block">
                    Strand {sIndex + 1}
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter Strand Title..."
                    className="w-full text-xl font-black bg-transparent border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2 transition-all placeholder:text-gray-300"
                    value={strand.title}
                    onChange={(e) => handleStrandChange(sIndex, 'title', e.target.value)}
                    required
                  />
                </div>

                <div className="ml-2 md:ml-6 space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">
                    Sub-strands for Strand {sIndex + 1}
                  </label>
                  
                  {strand.subStrands.map((ss, ssIndex) => (
                    <div key={ss._tempId} className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400">
                        {sIndex + 1}.{ssIndex + 1}
                      </div>

                      <input 
                        type="text"
                        placeholder="Code (e.g., B7.1.1)"
                        className="w-full md:w-32 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 focus:border-blue-500 outline-none text-xs font-bold transition-all"
                        value={ss.code || ''}
                        onChange={(e) => handleSubStrandChange(sIndex, ssIndex, 'code', e.target.value)}
                      />

                      <input 
                        type="text"
                        placeholder={`Enter Sub-strand ${ssIndex + 1} title...`}
                        className="flex-1 w-full bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 focus:border-blue-500 outline-none text-sm font-medium transition-all"
                        value={ss.title || ''}
                        onChange={(e) => handleSubStrandChange(sIndex, ssIndex, 'title', e.target.value)}
                        required
                      />

                      <button 
                        type="button" 
                        onClick={() => removeSubStrand(sIndex, ssIndex)}
                        className="text-gray-300 hover:text-rose-500 transition-all p-2"
                        title="Remove Sub-strand"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => addSubStrand(sIndex)} 
                    className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-800 mt-4 ml-2 uppercase tracking-widest transition-colors"
                  >
                    <Plus size={14} /> Add Sub-strand
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-100 transition-all active:scale-[0.99] uppercase tracking-widest"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Save size={24} /> Save {subject.name || 'Subject'} Updates
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSubjectForm;