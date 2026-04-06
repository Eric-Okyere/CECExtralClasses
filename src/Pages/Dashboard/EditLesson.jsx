import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Plus, Trash2, BookOpen, Layers, Save, 
  ArrowLeft, Loader2, Film, Type, CheckCircle2, Info, X, Play 
} from "lucide-react";
import { API_BASE_URL } from "../../services/BaseUrl";


export default function EditLesson() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data for Dropdowns
  const [subjects, setSubjects] = useState([]);
  const [strands, setStrands] = useState([]);
  const [subStrands, setSubStrands] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    subject: "",
    strand: "",
    subStrand: "",
    level: "",
    existingVideos: [], 
    newVideos: [],      
    quiz: [],
  });

  const levels = ["JHS 1", "JHS 2", "JHS 3"];

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch subjects
        const subRes = await fetch(`${API_BASE_URL}subjects`);
        const subJson = await subRes.json();
        const subjectsData = subJson.data || [];
        setSubjects(subjectsData);

        // Fetch current lesson
        const lessonRes = await fetch(`${API_BASE_URL}lessons/${id}`);
        const result = await lessonRes.json();

        if (result.success && result.data) {
          const lesson = result.data;
          setForm({
            subject: lesson.subject,
            level: lesson.level,
            strand: lesson.strand,
            subStrand: lesson.subStrand,
            existingVideos: lesson.videos || [],
            newVideos: [],
            quiz: lesson.quiz || [],
          });

          // Pre-populate dropdown selections
          const selectedSub = subjectsData.find(s => s.name === lesson.subject);
          if (selectedSub) {
            setStrands(selectedSub.strands || []);
            const selectedStrand = selectedSub.strands.find(s => s.title === lesson.strand);
            if (selectedStrand) setSubStrands(selectedStrand.subStrands || []);
          }
        }
      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // --- HANDLERS: DROPDOWNS ---
  const handleSubjectChange = (e) => {
    const name = e.target.value;
    const selected = subjects.find((s) => s.name === name);
    setForm({ ...form, subject: name, strand: "", subStrand: "" });
    setStrands(selected ? selected.strands : []);
    setSubStrands([]);
  };

  const handleStrandChange = (e) => {
    const title = e.target.value;
    const selected = strands.find((s) => s.title === title);
    setForm({ ...form, strand: title, subStrand: "" });
    setSubStrands(selected ? selected.subStrands : []);
  };

  // --- HANDLERS: MEDIA ---
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (form.existingVideos.length + form.newVideos.length + files.length > 5) {
      alert("Maximum 5 videos allowed per asset.");
      return;
    }
    const mapped = files.map((file, i) => ({
      file,
      title: `Part ${form.existingVideos.length + form.newVideos.length + i + 1}`
    }));
    setForm(prev => ({ ...prev, newVideos: [...prev.newVideos, ...mapped] }));
  };

  const removeExistingVideo = async (videoId) => {
    if (!window.confirm("Permanently delete this video from Cloudinary?")) return;
    
    setDeletingVideoId(videoId);
    try {
      const res = await fetch(`${API_BASE_URL}lessons/${id}/videos/${videoId}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (result.success) {
        setForm(p => ({ ...p, existingVideos: p.existingVideos.filter(v => v._id !== videoId) }));
      } else {
        alert("Failed to delete video: " + result.msg);
      }
    } catch (err) {
      alert("Server error during deletion.");
    } finally {
      setDeletingVideoId(null);
    }
  };

  const removeNewVideo = (index) => setForm(p => ({ ...p, newVideos: p.newVideos.filter((_, i) => i !== index) }));

  // --- HANDLERS: QUIZ ---
  const addQuestion = () => setForm(p => ({ ...p, quiz: [...p.quiz, { question: "", options: ["", "", "", ""], answer: "", explanation: "" }] }));
  const updateQuestion = (index, field, value) => {
    const updated = [...form.quiz];
    updated[index][field] = value;
    setForm({ ...form, quiz: updated });
  };
  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...form.quiz];
    updated[qIndex].options[optIndex] = value;
    setForm({ ...form, quiz: updated });
  };
  const removeQuestion = (index) => setForm(p => ({ ...p, quiz: p.quiz.filter((_, i) => i !== index) }));

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    const formData = new FormData();
    formData.append("subject", form.subject);
    formData.append("level", form.level);
    formData.append("strand", form.strand);
    formData.append("subStrand", form.subStrand);
    formData.append("existingVideos", JSON.stringify(form.existingVideos));
    formData.append("quiz", JSON.stringify(form.quiz));

    // Append new files and their titles
    form.newVideos.forEach(item => formData.append("videos", item.file));
    formData.append("titles", JSON.stringify(form.newVideos.map(v => v.title)));

    try {
      const res = await fetch(`${API_BASE_URL}lessons/${id}`, { method: "PUT", body: formData });
      const result = await res.json();
      if (result.success) {
        alert("Curriculum updated successfully.");
        navigate("/manage-lessons");
      }
    } catch (err) {
      alert("Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Workspace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all mb-2">
              <ArrowLeft size={14} /> Back to Repository
            </button>
            <h1 className="text-3xl font-black text-slate-800 uppercase italic">Edit Curriculum Asset</h1>
          </div>
          <button form="edit-form" type="submit" disabled={updating} className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.15em] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
            {updating ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
            {updating ? "Processing Media..." : "Save Changes"}
          </button>
        </div>

        <form id="edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <BookOpen size={16}/> Taxonomy Details
              </h2>
              <div className="space-y-4">
                <select required value={form.level} onChange={(e) => setForm({...form, level: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Level</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select required value={form.subject} onChange={handleSubjectChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                </select>
                <select required value={form.strand} onChange={handleStrandChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Strand</option>
                  {strands.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                </select>
                <select required value={form.subStrand} onChange={(e) => setForm({...form, subStrand: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Sub-strand</option>
                  {subStrands.map((ss, i) => <option key={i} value={ss}>{ss}</option>)}
                </select>
              </div>
            </section>

            {/* Media Manager */}
            <section className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Film size={16}/> Media List
                </h2>
                <span className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black">{form.existingVideos.length + form.newVideos.length}/5</span>
              </div>
              
              <div className="space-y-4 mb-8">
                {form.existingVideos.map((video) => (
                  <div key={video._id} className={`bg-white/5 border ${deletingVideoId === video._id ? 'border-red-500/50' : 'border-white/10'} p-4 rounded-2xl flex items-center justify-between group`}>
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                        {deletingVideoId === video._id ? <Loader2 size={12} className="animate-spin text-red-400" /> : <Play size={12} className="text-blue-400 ml-0.5" />}
                      </div>
                      <div className="truncate">
                        <p className={`text-[8px] font-black ${deletingVideoId === video._id ? 'text-red-400' : 'text-blue-400'} uppercase mb-1`}>{deletingVideoId === video._id ? 'Purging...' : 'Live'}</p>
                        <p className="text-[11px] font-bold truncate">{video.title}</p>
                      </div>
                    </div>
                    {deletingVideoId !== video._id && (
                      <button type="button" onClick={() => removeExistingVideo(video._id)} className="text-white/20 hover:text-red-500 transition-colors"><X size={16}/></button>
                    )}
                  </div>
                ))}
                
                {form.newVideos.map((item, i) => (
                  <div key={i} className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[8px] font-black text-emerald-400 uppercase italic">New</p>
                      <button type="button" onClick={() => removeNewVideo(i)} className="text-blue-300/40 hover:text-red-400"><X size={16}/></button>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl">
                      <Type size={12} className="text-blue-400"/>
                      <input type="text" value={item.title} onChange={(e) => {
                        const updated = [...form.newVideos];
                        updated[i].title = e.target.value;
                        setForm({ ...form, newVideos: updated });
                      }} className="bg-transparent border-none outline-none text-[10px] font-bold w-full text-white" />
                    </div>
                  </div>
                ))}
              </div>

              {form.existingVideos.length + form.newVideos.length < 5 && (
                <div className="relative group">
                  <input type="file" multiple accept="video/*" onChange={handleVideoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="w-full py-8 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-white/30 group-hover:border-blue-500 group-hover:text-blue-400 transition-all">
                    <Plus size={24}/><p className="text-[10px] font-black uppercase mt-2 tracking-widest">Append Video</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* MAIN AREA */}
          <div className="lg:col-span-8 space-y-6">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-center shadow-sm">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                 <Layers size={20} className="text-blue-600"/> Assessment ({form.quiz.length})
               </h2>
               <button type="button" onClick={addQuestion} className="bg-emerald-500 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition">
                 <Plus size={16}/> New Question
               </button>
             </div>

             <div className="space-y-6 max-h-[1000px] overflow-y-auto pr-4 custom-scrollbar pb-20">
                {form.quiz.map((q, index) => (
                  <div key={index} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all">
                    <button type="button" onClick={() => removeQuestion(index)} className="absolute top-10 right-10 text-slate-200 hover:text-red-500 transition-colors">
                      <Trash2 size={24}/>
                    </button>
                    <div className="space-y-8">
                      <input type="text" placeholder="Question prompt..." value={q.question} onChange={(e) => updateQuestion(index, "question", e.target.value)} className="w-full text-2xl font-black italic border-b-2 border-slate-50 py-3 outline-none focus:border-blue-500 transition-all bg-transparent text-slate-800" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, i) => (
                          <div key={i} className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">{String.fromCharCode(65 + i)}</span>
                            <input type="text" placeholder={`Option ${i+1}`} value={opt} onChange={(e) => updateOption(index, i, e.target.value)} className="w-full pl-12 pr-4 py-5 bg-slate-50 border-none rounded-[1.5rem] text-[11px] font-black uppercase focus:ring-2 ring-blue-500 transition-all" />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <input type="text" placeholder="Correct Key..." value={q.answer} onChange={(e) => updateQuestion(index, "answer", e.target.value)} className="w-full p-5 bg-emerald-50 border-none rounded-[1.5rem] text-[11px] font-black text-emerald-700 uppercase" />
                        <input type="text" placeholder="Rationale..." value={q.explanation} onChange={(e) => updateQuestion(index, "explanation", e.target.value)} className="w-full p-5 bg-blue-50 border-none rounded-[1.5rem] text-[11px] font-medium text-blue-700 italic" />
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </form>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}