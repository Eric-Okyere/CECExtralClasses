import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Plus, Trash2, ArrowLeft, Loader2, List } from 'lucide-react';
import { API_BASE_URL } from '../../services/BaseUrl';

const EditSubjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState({ name: '', level: '', strands: [] });

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}subjects/${id}`);
        setSubject(res.data.data);
        setLoading(false);
      } catch (err) {
        alert("Could not load subject data");
        navigate('/all-subjects');
      }
    };
    fetchSubject();
  }, [id, navigate]);

  const handleStrandChange = (sIndex, field, value) => {
    const updatedStrands = [...subject.strands];
    updatedStrands[sIndex][field] = value;
    setSubject({ ...subject, strands: updatedStrands });
  };

  const handleSubStrandChange = (sIndex, ssIndex, value) => {
    const updatedStrands = [...subject.strands];
    updatedStrands[sIndex].subStrands[ssIndex] = value;
    setSubject({ ...subject, strands: updatedStrands });
  };

  const addStrand = () => {
    setSubject({
      ...subject,
      strands: [...subject.strands, { title: '', subStrands: [''] }]
    });
  };

  const addSubStrand = (sIndex) => {
    const updatedStrands = [...subject.strands];
    updatedStrands[sIndex].subStrands.push('');
    setSubject({ ...subject, strands: updatedStrands });
  };

  const removeStrand = (sIndex) => {
    if (window.confirm("Are you sure you want to delete this entire Strand?")) {
      const updatedStrands = subject.strands.filter((_, i) => i !== sIndex);
      setSubject({ ...subject, strands: updatedStrands });
    }
  };

  const removeSubStrand = (sIndex, ssIndex) => {
    const updatedStrands = [...subject.strands];
    updatedStrands[sIndex].subStrands = updatedStrands[sIndex].subStrands.filter((_, i) => i !== ssIndex);
    setSubject({ ...subject, strands: updatedStrands });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API_BASE_URL}subjects/${id}/update`, subject);
      alert("Curriculum updated successfully!");
      navigate('/all-subjects');
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed");
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition font-medium">
        <ArrowLeft size={20} /> All Subjects
      </button>

      <form onSubmit={handleUpdate} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <List className="text-blue-600" size={24} />
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{subject.name}</h2>
          </div>
          <span className="inline-block px-4 py-1 bg-blue-600 text-white rounded-lg text-xs font-black tracking-widest uppercase">
            {subject.level}
          </span>
        </div>

        <div className="p-8 space-y-10">
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">Curriculum Content</h3>
              <button type="button" onClick={addStrand} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition shadow-lg shadow-gray-200">
                <Plus size={18} /> New Strand
              </button>
            </div>

            {subject.strands.map((strand, sIndex) => (
              <div key={sIndex} className="p-8 border border-gray-100 rounded-[2rem] bg-gray-50/30 relative hover:border-blue-100 transition-all">
                {/* Delete Strand Button */}
                <button 
                  type="button" 
                  onClick={() => removeStrand(sIndex)}
                  className="absolute top-6 right-6 text-gray-300 hover:text-rose-500 transition-colors"
                  title="Remove Strand"
                >
                  <Trash2 size={20} />
                </button>

                {/* Strand Number & Title */}
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

                {/* Sub-strands List */}
                <div className="ml-4 md:ml-10 space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">
                    Sub-strands for Strand {sIndex + 1}
                  </label>
                  
                  {strand.subStrands.map((ss, ssIndex) => (
                    <div key={ssIndex} className="flex items-center gap-4 group">
                      <div className="flex-shrink-0 w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                        {sIndex + 1}.{ssIndex + 1}
                      </div>
                      <input 
                        type="text"
                        placeholder={`Enter Sub-strand ${ssIndex + 1} detail...`}
                        className="flex-1 bg-white p-3 rounded-xl border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium transition-all shadow-sm"
                        value={ss}
                        onChange={(e) => handleSubStrandChange(sIndex, ssIndex, e.target.value)}
                        required
                      />
                      {strand.subStrands.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeSubStrand(sIndex, ssIndex)}
                          className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => addSubStrand(sIndex)} 
                    className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-800 mt-6 ml-14 uppercase tracking-widest transition-colors"
                  >
                    <Plus size={14} /> Add Sub-strand {sIndex + 1}.{strand.subStrands.length + 1}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.99] uppercase tracking-widest">
            <Save size={24} /> Save {subject.name} Updates
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSubjectForm;