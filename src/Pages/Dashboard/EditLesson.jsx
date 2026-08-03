import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Plus, Trash2, BookOpen, Layers, Save, 
  ArrowLeft, Loader2, Film, Type, X, Play, Hash 
} from "lucide-react";
import { API_BASE_URL } from "../../services/BaseUrl";

export default function EditLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // Data trees
  const [subjects, setSubjects] = useState([]);
  const [strands, setStrands] = useState([]);
  const [subStrands, setSubStrands] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState(null);

  // Form State storing ObjectIDs for taxonomy
  const [form, setForm] = useState({
    lessonName: "",
    lessonNumber: "",
    subject: "",    // Subject ObjectId
    strand: "",     // Strand ObjectId
    subStrand: "",  // SubStrand ObjectId
    level: "",
    existingVideos: [], 
    newVideos: [],      
    quiz: [],
  });

  const levels = ["JHS 1", "JHS 2", "JHS 3"];

  // Helper to extract a string ID from a populated object or raw ID string
  const extractId = (entity) => {
    if (!entity) return "";
    return typeof entity === "object" ? entity._id || "" : entity;
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Fetch complete subjects tree (with strands & subStrands)
        const subRes = await fetch(`${API_BASE_URL}subjects`);
        const subJson = await subRes.json();
        const subjectsData = subJson.data || [];
        setSubjects(subjectsData);

        // 2. Fetch target lesson
        const lessonRes = await fetch(`${API_BASE_URL}lessons/${id}`);
        const result = await lessonRes.json();

        if (result.success && result.data) {
          const lesson = result.data;

          const subjectId = extractId(lesson.subject);
          const strandId = extractId(lesson.strand);
          const subStrandId = extractId(lesson.subStrand);

          setForm({
            lessonName: lesson.lessonName || "",
            lessonNumber: lesson.lessonNumber || "",
            subject: subjectId,
            level: lesson.level || "",
            strand: strandId,
            subStrand: subStrandId,
            existingVideos: lesson.videos || [],
            newVideos: [],
            quiz: lesson.quiz || [],
          });

          // Cascade-populate dropdown arrays based on extracted ObjectIds
          const selectedSub = subjectsData.find(s => String(s._id) === String(subjectId));
          if (selectedSub && selectedSub.strands) {
            setStrands(selectedSub.strands);
            
            const selectedStrand = selectedSub.strands.find(
              st => String(st._id) === String(strandId) || st.title === lesson.strand
            );
            
            if (selectedStrand && selectedStrand.subStrands) {
              setSubStrands(selectedStrand.subStrands);
            }
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
    const selectedId = e.target.value;
    const selected = subjects.find((s) => String(s._id) === String(selectedId));
    
    setForm(prev => ({ ...prev, subject: selectedId, strand: "", subStrand: "" }));
    setStrands(selected ? selected.strands || [] : []);
    setSubStrands([]);
  };

  const handleStrandChange = (e) => {
    const selectedId = e.target.value;
    const selected = strands.find((s) => String(s._id) === String(selectedId));
    
    setForm(prev => ({ ...prev, strand: selectedId, subStrand: "" }));
    setSubStrands(selected ? selected.subStrands || [] : []);
  };

  const handleSubStrandChange = (e) => {
    const selectedId = e.target.value;
    setForm(prev => ({ ...prev, subStrand: selectedId }));
  };

  // --- HANDLERS: MEDIA ---
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (form.existingVideos.length + form.newVideos.length + files.length > 5) {
      alert("Maximum 5 videos allowed per lesson.");
      return;
    }
    const mapped = files.map((file, i) => ({
      file,
      title: `Part ${form.existingVideos.length + form.newVideos.length + i + 1}`
    }));
    setForm(prev => ({ ...prev, newVideos: [...prev.newVideos, ...mapped] }));
  };

  const removeExistingVideo = async (videoId) => {
    if (!window.confirm("Permanently delete this video from storage?")) return;
    
    setDeletingVideoId(videoId);
    try {
      const res = await fetch(`${API_BASE_URL}lessons/${id}/videos/${videoId}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (result.success) {
        setForm(p => ({ ...p, existingVideos: p.existingVideos.filter(v => v._id !== videoId) }));
      } else {
        alert("Failed to delete video: " + (result.msg || "Unknown error"));
      }
    } catch (err) {
      alert("Server error during deletion.");
    } finally {
      setDeletingVideoId(null);
    }
  };

  const removeNewVideo = (index) => {
    setForm(p => ({ ...p, newVideos: p.newVideos.filter((_, i) => i !== index) }));
  };

  // --- HANDLERS: QUIZ ---
  const addQuestion = () => {
    const newQuestion = {
      _id: `temp_${Date.now()}`,
      question: "", 
      options: ["", "", "", ""], 
      answer: "", 
      explanation: "" 
    };

    setForm(p => ({ ...p, quiz: [newQuestion, ...p.quiz] }));

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const updateQuestion = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.quiz];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, quiz: updated };
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setForm(prev => {
      const updatedQuiz = [...prev.quiz];
      const updatedOptions = [...updatedQuiz[qIndex].options];
      updatedOptions[optIndex] = value;
      updatedQuiz[qIndex] = { ...updatedQuiz[qIndex], options: updatedOptions };
      return { ...prev, quiz: updatedQuiz };
    });
  };

  const removeQuestion = (index) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setForm((prev) => ({
        ...prev,
        quiz: prev.quiz.filter((_, i) => i !== index),
      }));
    }
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    const formData = new FormData();
    formData.append("lessonName", form.lessonName);
    formData.append("lessonNumber", form.lessonNumber);
    formData.append("subject", form.subject);       // ObjectId string
    formData.append("strand", form.strand);         // ObjectId string
    formData.append("subStrand", form.subStrand);   // ObjectId string
    formData.append("level", form.level);
    formData.append("existingVideos", JSON.stringify(form.existingVideos));
    formData.append("quiz", JSON.stringify(form.quiz));

    form.newVideos.forEach(item => formData.append("videos", item.file));
    formData.append("titles", JSON.stringify(form.newVideos.map(v => v.title)));

    try {
      const res = await fetch(`${API_BASE_URL}lessons/${id}`, { 
        method: "PUT", 
        body: formData 
      });
      const result = await res.json();
      if (result.success) {
        alert("Lesson updated successfully.");
        navigate("/manage-lessons");
      } else {
        alert("Update failed: " + (result.msg || "Server validation error"));
      }
    } catch (err) {
      alert("Update failed. Please check network connection.");
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
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all mb-2"
            >
              <ArrowLeft size={14} /> Back to Repository
            </button>
            <h1 className="text-3xl font-black text-slate-800 uppercase italic">Edit Lesson</h1>
          </div>
          <button 
            form="edit-form" 
            type="submit" 
            disabled={updating} 
            className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.15em] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
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
                {/* Lesson Name */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 pl-1">Lesson Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="E.g., Intro to Algebra" 
                    value={form.lessonName} 
                    onChange={(e) => setForm({...form, lessonName: e.target.value})} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                {/* Lesson Number */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 pl-1">Lesson Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Hash size={14} />
                    </span>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      placeholder="E.g., 5" 
                      value={form.lessonNumber} 
                      onChange={(e) => setForm({...form, lessonNumber: e.target.value})} 
                      className="w-full pl-10 pr-4 p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Level Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 pl-1">Academic Level</label>
                  <select 
                    required 
                    value={form.level} 
                    onChange={(e) => setForm({...form, level: e.target.value})} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Level</option>
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Subject Dropdown (ObjectID) */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 pl-1">Subject</label>
                  <select 
                    required 
                    value={form.subject} 
                    onChange={handleSubjectChange} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Strand Dropdown (ObjectID) */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 pl-1">Strand</label>
                  <select 
                    required 
                    value={form.strand} 
                    onChange={handleStrandChange} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Strand</option>
                    {strands.map(s => {
                      const idVal = typeof s === "object" ? s._id : s;
                      const titleVal = typeof s === "object" ? (s.title || s.name) : s;
                      return (
                        <option key={idVal} value={idVal}>
                          {titleVal}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Sub-strand Dropdown (ObjectID) */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 pl-1">Sub-Strand</label>
                  <select 
                    required 
                    value={form.subStrand} 
                    onChange={handleSubStrandChange} 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Sub-strand</option>
                    {subStrands.map((ss) => {
                      const isObj = typeof ss === "object" && ss !== null;
                      const val = isObj ? ss._id : ss;
                      const title = isObj ? (ss.title || ss.name) : ss;

                      return (
                        <option key={val} value={val}>
                          {title}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </section>

            {/* Media Manager */}
            <section className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Film size={16}/> Media List
                </h2>
                <span className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black">
                  {form.existingVideos.length + form.newVideos.length}/5
                </span>
              </div>
              
              <div className="space-y-4 mb-8">
                {form.existingVideos.map((video) => (
                  <div key={video._id} className={`bg-white/5 border ${deletingVideoId === video._id ? 'border-red-500/50' : 'border-white/10'} p-4 rounded-2xl flex items-center justify-between group`}>
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                        {deletingVideoId === video._id ? <Loader2 size={12} className="animate-spin text-red-400" /> : <Play size={12} className="text-blue-400 ml-0.5" />}
                      </div>
                      <div className="truncate">
                        <p className={`text-[8px] font-black ${deletingVideoId === video._id ? 'text-red-400' : 'text-blue-400'} uppercase mb-1`}>
                          {deletingVideoId === video._id ? 'Purging...' : 'Live'}
                        </p>
                        <p className="text-[11px] font-bold truncate">{video.title}</p>
                      </div>
                    </div>
                    {deletingVideoId !== video._id && (
                      <button type="button" onClick={() => removeExistingVideo(video._id)} className="text-white/20 hover:text-red-500 transition-colors">
                        <X size={16}/>
                      </button>
                    )}
                  </div>
                ))}
                
                {form.newVideos.map((item, i) => (
                  <div key={i} className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[8px] font-black text-emerald-400 uppercase italic">New</p>
                      <button type="button" onClick={() => removeNewVideo(i)} className="text-blue-300/40 hover:text-red-400">
                        <X size={16}/>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl">
                      <Type size={12} className="text-blue-400"/>
                      <input 
                        type="text" 
                        value={item.title} 
                        onChange={(e) => {
                          const updated = [...form.newVideos];
                          updated[i].title = e.target.value;
                          setForm({ ...form, newVideos: updated });
                        }} 
                        className="bg-transparent border-none outline-none text-[10px] font-bold w-full text-white" 
                      />
                    </div>
                  </div>
                ))}
              </div>

              {form.existingVideos.length + form.newVideos.length < 5 && (
                <div className="relative group">
                  <input type="file" multiple accept="video/*" onChange={handleVideoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="w-full py-8 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-white/30 group-hover:border-blue-500 group-hover:text-blue-400 transition-all">
                    <Plus size={24}/>
                    <p className="text-[10px] font-black uppercase mt-2 tracking-widest">Append Video</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* MAIN ASSESSMENT AREA */}
          <div className="lg:col-span-8 space-y-6">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex justify-between items-center shadow-sm">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                 <Layers size={20} className="text-blue-600"/> Assessment ({form.quiz.length})
               </h2>
               <button type="button" onClick={addQuestion} className="bg-emerald-500 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition">
                 <Plus size={16}/> New Question
               </button>
             </div>

             <div ref={scrollContainerRef} className="space-y-6 max-h-[1000px] overflow-y-auto pr-4 custom-scrollbar pb-20">
                {form.quiz.map((q, index) => (
                  <div key={q._id || `quiz_${index}`} className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all">
                    <button type="button" onClick={() => removeQuestion(index)} className="absolute top-10 right-10 text-slate-200 hover:text-red-500 transition-colors">
                      <Trash2 size={24}/>
                    </button>
                    <div className="space-y-8">
                      <input 
                        type="text" 
                        placeholder="Question prompt..." 
                        value={q.question} 
                        onChange={(e) => updateQuestion(index, "question", e.target.value)} 
                        className="w-full text-2xl font-black italic border-b-2 border-slate-50 py-3 outline-none focus:border-blue-500 transition-all bg-transparent text-slate-800" 
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, i) => (
                          <div key={i} className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <input 
                              type="text" 
                              placeholder={`Option ${i+1}`} 
                              value={opt} 
                              onChange={(e) => updateOption(index, i, e.target.value)} 
                              className="w-full pl-12 pr-4 py-5 bg-slate-50 border-none rounded-[1.5rem] text-[11px] font-black uppercase focus:ring-2 ring-blue-500 transition-all" 
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <input 
                          type="text" 
                          placeholder="Correct Key..." 
                          value={q.answer} 
                          onChange={(e) => updateQuestion(index, "answer", e.target.value)} 
                          className="w-full p-5 bg-emerald-50 border-none rounded-[1.5rem] text-[11px] font-black text-emerald-700 uppercase" 
                        />
                        <input 
                          type="text" 
                          placeholder="Rationale..." 
                          value={q.explanation} 
                          onChange={(e) => updateQuestion(index, "explanation", e.target.value)} 
                          className="w-full p-5 bg-blue-50 border-none rounded-[1.5rem] text-[11px] font-medium text-blue-700 italic" 
                        />
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