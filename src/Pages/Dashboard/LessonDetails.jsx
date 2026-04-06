import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, Video, BookOpen, 
  CheckCircle2, Loader2, Info, Edit3, PlayCircle, List,
  Layers, Award, HelpCircle
} from "lucide-react";
import { API_BASE_URL } from "../../services/BaseUrl";

export default function LessonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}lessons/${id}`);
        const result = await res.json();
        if (result.success) setLesson(result.data);
      } catch (err) {
        console.error("Error fetching lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0F172A]">
      <Loader2 className="animate-spin text-blue-500 mb-6" size={50} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Initializing Core Modules...</p>
    </div>
  );

  if (!lesson) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-12 bg-white rounded-[3rem] shadow-xl">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black uppercase italic">Resource Offline</h2>
        <button onClick={() => navigate(-1)} className="mt-6 text-blue-600 font-bold uppercase text-xs">Return to Safety</button>
      </div>
    </div>
  );

  const currentVideo = lesson.videos?.[activeVideoIndex];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* BACKGROUND DECOR */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-10">
        
        {/* TOP NAV */}
        <header className="flex justify-between items-center mb-12">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-3 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
              <ChevronLeft size={16} />
            </div>
            Back to Curriculum
          </button>
          
          <button 
            onClick={() => navigate(`/edit-lesson/${id}`)}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-3"
          >
            <Edit3 size={14} className="text-blue-400" />
            Modify Asset
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* MAIN COLUMN (Video & Content) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* CINEMATIC PLAYER */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white p-3 rounded-[3.5rem] shadow-2xl border border-white">
                <div className="aspect-video bg-black rounded-[2.8rem] overflow-hidden shadow-2xl relative">
                  {currentVideo ? (
                    <video controls key={currentVideo.url} className="w-full h-full object-contain bg-black">
                      <source src={currentVideo.url} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Video size={60} className="text-slate-800 mb-4 animate-pulse" />
                      <p className="text-[10px] font-black text-slate-500 uppercase">Awaiting Media Feed...</p>
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6 flex gap-2">
                    <span className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {currentVideo?.title || "PART 01"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CURRICULUM DETAILS */}
          <div className="bg-white md:p-16 p-8 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
  {/* BACKGROUND DECOR - Adjusted size and position for mobile */}
  <div className="absolute -top-10 -right-10 md:-top-20 md:-right-20 opacity-[0.02] rotate-12 pointer-events-none">
    <BookOpen size={window.innerWidth < 768 ? 200 : 400} />
  </div>
  
  {/* Badges - Flex wrap handles small screens naturally */}
  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-10">
    <span className="px-4 py-2 md:px-5 md:py-2.5 bg-blue-50 text-blue-600 text-[8px] md:text-[9px] font-black uppercase rounded-full border border-blue-100 tracking-widest">
      {lesson.level}
    </span>
    <span className="px-4 py-2 md:px-5 md:py-2.5 bg-slate-50 text-slate-400 text-[8px] md:text-[9px] font-black uppercase rounded-full border border-slate-100 tracking-widest">
      {lesson.subject}
    </span>
  </div>

  {/* Main Title - Responsive font sizes: 3xl on mobile, 6xl on desktop */}
  <h1 className="text-3xl md:text-6xl font-black text-slate-900 uppercase italic leading-[1.1] mb-4 md:mb-6 tracking-tighter">
    {lesson.strand}
  </h1>

  {/* Sub-strand - Adjusted text size and spacing */}
  <p className="text-blue-500 font-black text-xs md:text-lg uppercase tracking-[0.15em] md:tracking-[0.2em] mb-8 md:mb-12 flex items-center gap-3 md:gap-4">
    <Layers size={window.innerWidth < 768 ? 16 : 20} className="shrink-0" />
    {lesson.subStrand}
  </p>
  
  {/* Stats Grid - 1 col on mobile, 2 on tablet, 4 on desktop */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pt-8 md:pt-12 border-t border-slate-50">
    <Stat 
      icon={<PlayCircle className="text-blue-500"/>} 
      label="Video Modules" 
      value={lesson.videos?.length || 0} 
    />
    <Stat 
      icon={<HelpCircle className="text-emerald-500"/>} 
      label="Quiz Items" 
      value={lesson.quiz?.length || 0} 
    />
  </div>
</div>
          </div>

          {/* SIDE COLUMN (Playlist & Quiz) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* PLAYLIST SECTION */}
            <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                <List size={18} className="text-blue-600"/> Lesson Pipeline
              </h3>
              <div className="space-y-3">
                {lesson.videos?.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVideoIndex(i)}
                    className={`w-full group flex items-center gap-5 p-5 rounded-[2rem] transition-all border-2 ${
                      activeVideoIndex === i 
                      ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-200 text-white' 
                      : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                      activeVideoIndex === i ? 'bg-white/20' : 'bg-white shadow-sm'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="text-left truncate">
                      <p className="text-[11px] font-black uppercase truncate">{v.title}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-tighter opacity-60`}>Digital Content</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* QUIZ BANK SECTION */}
            <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-2xl shadow-blue-900/40 flex flex-col max-h-[850px]">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
                  <Award className="text-blue-400" /> Assessment
                </h3>
                <span className="text-[10px] font-black bg-white/10 px-4 py-1 rounded-full text-blue-300">
                  {lesson.quiz?.length} ITEMS
                </span>
              </div>
              
              <div className="space-y-8 overflow-y-auto pr-3 custom-scrollbar">
                {lesson.quiz?.map((q, idx) => (
                  <div key={idx} className="space-y-5 pb-8 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-blue-500">Q{idx + 1}</span>
                       <div className="h-[1px] flex-grow bg-white/5"></div>
                    </div>

                    <p className="text-sm font-bold leading-relaxed text-slate-200">{q.question}</p>

                    <div className="grid grid-cols-1 gap-2.5">
                      {q.options?.map((opt, optIdx) => {
                        const isCorrect = opt === q.answer;
                        return (
                          <div 
                            key={optIdx} 
                            className={`p-4 rounded-2xl text-[11px] font-bold border flex items-center gap-4 transition-all ${
                              isCorrect 
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                              : 'bg-white/5 border-transparent text-slate-500'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black ${
                              isCorrect ? 'bg-emerald-500 text-white' : 'bg-white/10'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            {opt}
                            {isCorrect && <CheckCircle2 size={14} className="ml-auto" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-5 bg-blue-500/10 rounded-[2rem] border border-blue-500/20 flex gap-4">
                        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Explanation</p>
                          <p className="text-[11px] text-slate-400 italic leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}

// SMALL HELPER COMPONENT FOR STATS
function Stat({ icon, label, value }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
            </div>
        </div>
    )
}