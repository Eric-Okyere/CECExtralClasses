import React, { useState } from "react";
import { Plus, Trash2, Save, BookOpen, Layers, Loader2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/BaseUrl";

export default function CreateSubjectForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Levels available in the Ghana CCP curriculum
  const levels = ["JHS 1", "JHS 2", "JHS 3"];

  const [formData, setFormData] = useState({
    name: "",
    level: "JHS 1",
    strands: [{ title: "", subStrands: [""] }]
  });

  // --- Dynamic Handlers ---
  const addStrand = () => {
    setFormData({
      ...formData,
      strands: [...formData.strands, { title: "", subStrands: [""] }]
    });
  };

  const removeStrand = (sIndex) => {
    const newStrands = formData.strands.filter((_, i) => i !== sIndex);
    setFormData({ ...formData, strands: newStrands });
  };

  const updateStrandTitle = (sIndex, value) => {
    const newStrands = [...formData.strands];
    newStrands[sIndex].title = value;
    setFormData({ ...formData, strands: newStrands });
  };

  const addSubStrand = (sIndex) => {
    const newStrands = [...formData.strands];
    newStrands[sIndex].subStrands.push("");
    setFormData({ ...formData, strands: newStrands });
  };

  const removeSubStrand = (sIndex, subIndex) => {
    const newStrands = [...formData.strands];
    newStrands[sIndex].subStrands = newStrands[sIndex].subStrands.filter((_, i) => i !== subIndex);
    setFormData({ ...formData, strands: newStrands });
  };

  const updateSubStrand = (sIndex, subIndex, value) => {
    const newStrands = [...formData.strands];
    newStrands[sIndex].subStrands[subIndex] = value;
    setFormData({ ...formData, strands: newStrands });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`${formData.name} for ${formData.level} saved successfully!`);
        navigate("/admindashboard");
      } else {
        alert(data.msg || "Error creating subject");
      }
    } catch (err) {
      alert("Check your server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-8 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Header & Level Selection */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Curriculum Builder</h1>
                <p className="text-slate-500 font-medium text-sm">Define subject scope and sequence.</p>
              </div>
              
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {levels.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, level: lvl })}
                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${
                      formData.level === lvl 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Mathematics"
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Strands Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Layers size={16} /> Strands for {formData.level}
              </h2>
              <button 
                type="button" 
                onClick={addStrand}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-all shadow-lg active:scale-95"
              >
                <Plus size={14} /> Add Strand
              </button>
            </div>

            {formData.strands.map((strand, sIndex) => (
              <div key={sIndex} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 relative transition-all hover:shadow-md">
                
                {formData.strands.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeStrand(sIndex)}
                    className="absolute top-8 right-8 text-slate-200 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2 italic">Strand {sIndex + 1}</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Strand 1: Number"
                      className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-300"
                      value={strand.title}
                      onChange={(e) => updateStrandTitle(sIndex, e.target.value)}
                    />
                  </div>

                  {/* Sub-strands */}
                  <div className="pl-6 border-l-2 border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Sub-Strands</span>
                      <button 
                        type="button" 
                        onClick={() => addSubStrand(sIndex)}
                        className="text-[9px] font-black uppercase text-blue-500 hover:underline"
                      >
                        + Add Sub
                      </button>
                    </div>

                    {strand.subStrands.map((sub, subIndex) => (
                      <div key={subIndex} className="flex gap-2">
                        <input 
                          type="text" 
                          required
                          placeholder={`Sub-strand ${subIndex + 1}`}
                          className="flex-1 bg-white border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-600 outline-none focus:border-blue-200"
                          value={sub}
                          onChange={(e) => updateSubStrand(sIndex, subIndex, e.target.value)}
                        />
                        {strand.subStrands.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeSubStrand(sIndex, subIndex)}
                            className="text-slate-200 hover:text-red-400 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-slate-900 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:bg-slate-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              {loading ? "Saving..." : `Publish ${formData.name} - ${formData.level}`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}