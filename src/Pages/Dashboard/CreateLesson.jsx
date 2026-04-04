import { useState, useEffect } from "react";
import { 
  Video, Plus, Trash2, BookOpen, Layers, 
  Save, X, Type, Loader2, Play 
} from "lucide-react";

export default function CreateLesson() {
  const [subjects, setSubjects] = useState([]);
  const [strands, setStrands] = useState([]);
  const [subStrands, setSubStrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    subjectId: "",
    subjectName: "",
    strand: "",
    subStrand: "",
    level: "",
    videos: [], // Changed from null to array
    quiz: [],
  });

  const levels = ["JHS 1", "JHS 2", "JHS 3"];

  useEffect(() => {
    fetch("http://localhost:5001/api/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data.data || data)) // Handle nested data if necessary
      .catch(console.error);
  }, []);

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    const selected = subjects.find((s) => s._id === subjectId);
    setForm({ 
      ...form, 
      subjectId, 
      subjectName: selected?.name || "", 
      strand: "", 
      subStrand: "" 
    });
    setStrands(selected ? selected.strands : []);
    setSubStrands([]);
  };

  const handleStrandChange = (e) => {
    const strandTitle = e.target.value;
    const selected = strands.find((s) => s.title === strandTitle);
    setForm({ ...form, strand: strandTitle, subStrand: "" });
    setSubStrands(selected ? selected.subStrands : []);
  };

  // --- VIDEO HANDLERS ---
  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (form.videos.length + files.length > 5) return alert("Max 5 videos allowed.");
    
    const newEntries = files.map((file, i) => ({
      file,
      title: `Part ${form.videos.length + i + 1}`
    }));
    
    setForm({ ...form, videos: [...form.videos, ...newEntries] });
  };

  const removeVideo = (index) => {
    setForm({ ...form, videos: form.videos.filter((_, i) => i !== index) });
  };

  const updateVideoTitle = (index, title) => {
    const updated = [...form.videos];
    updated[index].title = title;
    setForm({ ...form, videos: updated });
  };

  // --- QUIZ HANDLERS ---
  const addQuestion = () => {
    setForm({
      ...form,
      quiz: [...form.quiz, { question: "", options: ["", "", "", ""], answer: "", explanation: "" }],
    });
  };

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

  const removeQuestion = (index) => {
    setForm({ ...form, quiz: form.quiz.filter((_, i) => i !== index) });
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.videos.length === 0) return alert("Upload at least one video.");
    if (form.quiz.length === 0) return alert("Add at least one question.");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("subject", form.subjectName);
    formData.append("level", form.level);
    formData.append("strand", form.strand);
    formData.append("subStrand", form.subStrand);
    
    // Send files and titles separately for the backend to map them
    form.videos.forEach(v => formData.append("videos", v.file));
    formData.append("titles", JSON.stringify(form.videos.map(v => v.title)));
    formData.append("quiz", JSON.stringify(form.quiz));

    try {
      const res = await fetch("http://localhost:5001/api/lessons", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        alert("Lesson published!");
        window.location.reload();
      }
    } catch (err) {
      alert("Error publishing lesson.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tight">Lesson Builder</h1>
          <p className="text-slate-500 font-medium">Create interactive curriculum assets for JHS students.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            {/* Taxonomy */}
            <section className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
              <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><BookOpen size={16}/> Categorization</h2>
              <select required value={form.level} onChange={(e) => setForm({...form, level: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase focus:ring-2 ring-blue-500">
                <option value="">Select Level</option>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>

              <select required value={form.subjectId} onChange={handleSubjectChange} className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase focus:ring-2 ring-blue-500">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>

              <select required value={form.strand} onChange={handleStrandChange} className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase focus:ring-2 ring-blue-500">
                <option value="">Select Strand</option>
                {strands.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
              </select>

              <select required value={form.subStrand} onChange={(e) => setForm({...form, subStrand: e.target.value})} className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase focus:ring-2 ring-blue-500">
                <option value="">Select Sub-strand</option>
                {subStrands.map((ss, i) => <option key={i} value={ss}>{ss}</option>)}
              </select>
            </section>

            {/* Video Manager */}
            <section className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
              <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Video size={16}/> Media Manager</h2>
              
              <div className="space-y-3 mb-6">
                {form.videos.map((v, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                       <Play size={12} className="text-blue-400" />
                       <button type="button" onClick={() => removeVideo(i)} className="text-white/20 hover:text-red-500"><X size={14}/></button>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                      <Type size={10} className="text-slate-500"/>
                      <input 
                        type="text" value={v.title} 
                        onChange={(e) => updateVideoTitle(i, e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] font-bold w-full" 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative group">
                <input type="file" multiple accept="video/*" onChange={handleVideoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-full py-6 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/30 group-hover:border-blue-500 transition-all">
                  <Plus size={20}/>
                  <span className="text-[10px] font-black uppercase mt-1">Add Video</span>
                </div>
              </div>
            </section>

            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
              {loading ? "Processing..." : "Publish Lesson"}
            </button>
          </div>

          <div className="lg:col-span-8 space-y-4">
             <div className="flex justify-between items-center bg-white p-6 rounded-3xl border shadow-sm">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers size={20} className="text-blue-600"/> Assessment Builder</h2>
               <button type="button" onClick={addQuestion} className="bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-lg shadow-emerald-100 flex items-center gap-2">
                 <Plus size={14}/> Add Question
               </button>
             </div>

             <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
                {form.quiz.map((q, index) => (
                  <div key={index} className="bg-white p-8 rounded-[2.5rem] border shadow-sm relative group hover:border-blue-200 transition-all">
                    <button type="button" onClick={() => removeQuestion(index)} className="absolute top-6 right-6 text-slate-200 hover:text-red-500 transition">
                      <Trash2 size={20}/>
                    </button>
                    <input type="text" placeholder="Question Text" value={q.question} onChange={(e) => updateQuestion(index, "question", e.target.value)} className="w-full mb-6 p-2 text-xl font-black italic border-b-2 border-slate-50 focus:border-blue-500 outline-none" />
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {q.options.map((opt, i) => (
                        <input key={i} type="text" placeholder={`Option ${i+1}`} value={opt} onChange={(e) => updateOption(index, i, e.target.value)} className="p-3 bg-slate-50 border-none rounded-xl text-[11px] font-bold focus:ring-2 ring-blue-500" />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Correct Answer" value={q.answer} onChange={(e) => updateQuestion(index, "answer", e.target.value)} className="p-3 bg-emerald-50 border-none rounded-xl text-[11px] font-black text-emerald-700 uppercase" />
                      <input type="text" placeholder="Explanation" value={q.explanation} onChange={(e) => updateQuestion(index, "explanation", e.target.value)} className="p-3 bg-blue-50 border-none rounded-xl text-[11px] font-medium text-blue-700 italic" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}