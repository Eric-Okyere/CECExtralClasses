import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Confetti from "react-confetti";
import Navbar from "../components/Navbar";
import { 
  ChevronLeft, Video, Lock, CheckCircle2, 
  Award, List, Loader2, AlertCircle, ArrowRight, RefreshCcw, FileX
} from "lucide-react";

// Audio Assets
import clapSound from "../assets/Clapping_Sound_Effect(256k).mp3";
import oohSound from "../assets/Ooh_-_Sound.mp3";
import { API_BASE_URL } from "../services/BaseUrl";

export default function LessonView() {
  const { subject, level, subStrand } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [isQuizLocked, setIsQuizLocked] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); 
  const [showConfetti, setShowConfetti] = useState(false);

  const playClap = () => new Audio(clapSound).play();
  const playOoh = () => new Audio(oohSound).play();

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}lessons`);
        const allLessons = response.data.data || [];
        const decodedSub = decodeURIComponent(subStrand).trim().toLowerCase();
        
        const foundLesson = allLessons.find((l) => 
          l.subject.toLowerCase() === subject.toLowerCase() && 
          l.level.toLowerCase() === level.toLowerCase() &&
          (l.subStrand.toLowerCase() === decodedSub || l.subStrand.toLowerCase().includes(decodedSub))
        );

        if (foundLesson) {
          setLesson(foundLesson);
          if (!foundLesson.videos?.length) setIsQuizLocked(false);
        } else {
          setLesson(null); // Ensure lesson is explicitly null
        }
      } catch (err) {
        setError("Server connection failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [subject, level, subStrand]);

  const handleVideoEnded = (videoId) => {
    if (!watchedVideos.includes(videoId)) {
      const updated = [...watchedVideos, videoId];
      setWatchedVideos(updated);
      if (updated.length === lesson.videos.length) setIsQuizLocked(false);
    }
  };

  const handleOptionClick = (option, correctAnswer) => {
    if (feedback) return;
    setSelectedOption(option);
    if (option === correctAnswer) {
      setFeedback('correct');
      setShowConfetti(true);
      playClap();
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      setFeedback('wrong');
      playOoh();
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setSelectedOption(null);
  };

  // 1. LOADING STATE
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-blue-600">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-black uppercase tracking-widest text-[10px]">Loading Lesson...</p>
    </div>
  );

  // 2. NOT AVAILABLE / ERROR STATE
  if (!lesson || error) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
          <FileX size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase italic mb-4">Lesson Not Available</h2>
        <p className="text-slate-500 max-w-md font-medium leading-relaxed mb-10">
          We are currently working on this module for <span className="text-blue-600 font-bold uppercase">{subject} ({level})</span>. Check back soon for new videos and quizzes!
        </p>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
        >
          <ChevronLeft size={18}/> Back to Topics
        </button>
      </div>
    </div>
  );

  const currentVideo = lesson.videos?.[activeVideoIndex];
  const quizItems = lesson.quiz || [];
  const currentQuiz = quizItems[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizItems.length - 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 relative overflow-x-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={2000} gravity={0.2} />}
      
      {feedback === 'wrong' && (
        <div className="fixed inset-0 flex items-center justify-center text-6xl animate-bounce z-50 pointer-events-none">
          😭😢😢😢😭😢
        </div>
      )}

      <Navbar />
      
      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        <header className="mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase mb-4"><ChevronLeft size={14}/> Back</button>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic">{lesson.subStrand}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* VIDEO SECTION */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-3 rounded-[3rem] shadow-xl border border-white">
              <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden">
                <video controls key={currentVideo?.url} className="w-full h-full" onEnded={() => handleVideoEnded(currentVideo?._id)}>
                  <source src={currentVideo?.url} type="video/mp4" />
                </video>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100">
               <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><List size={14}/> Video Pipeline</h3>
               <div className="flex flex-wrap gap-2">
                 {lesson.videos?.map((v, i) => (
                   <button 
                    key={v._id} 
                    onClick={() => setActiveVideoIndex(i)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${activeVideoIndex === i ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-transparent text-slate-500'}`}
                   >
                     {watchedVideos.includes(v._id) ? '✓ ' : ''}Part {i+1}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* QUIZ SECTION */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl min-h-[600px] flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black uppercase italic flex items-center gap-3"><Award className="text-blue-400" /> Assessment</h3>
                <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full">{currentQuestionIndex + 1} / {quizItems.length}</span>
              </div>

              {isQuizLocked ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4"><Lock className="text-slate-600" /></div>
                  <p className="text-xs font-black uppercase text-slate-500">Complete all videos to unlock</p>
                </div>
              ) : currentQuestionIndex < quizItems.length ? (
                <div className="flex-grow flex flex-col">
                  <p className="text-lg font-bold leading-tight mb-8">{currentQuiz?.question}</p>
                  
                  <div className="space-y-3 mb-8">
                    {currentQuiz?.options.map((opt, i) => {
                      const isCorrect = opt === currentQuiz.answer;
                      const isSelected = selectedOption === opt;
                      
                      let btnClass = "bg-white/5 border-transparent text-slate-400";
                      if (feedback && isCorrect) btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20";
                      if (feedback === 'wrong' && isSelected && !isCorrect) btnClass = "bg-red-500 border-red-500 text-white";

                      return (
                        <button 
                          key={i} 
                          disabled={!!feedback}
                          onClick={() => handleOptionClick(opt, currentQuiz.answer)}
                          className={`w-full p-5 rounded-2xl border-2 text-left text-xs font-black transition-all flex items-center gap-4 ${btnClass}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center">{String.fromCharCode(65+i)}</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {feedback && (
                    <div className="mt-auto animate-in fade-in slide-in-from-bottom-4">
                       <p className="text-[10px] text-slate-500 uppercase font-black mb-4">Explanation: <span className="text-slate-300 italic font-medium lowercase">{currentQuiz.explanation}</span></p>
                       <button 
                        onClick={isLastQuestion ? restartQuiz : nextQuestion} 
                        className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
                       >
                         {isLastQuestion ? "Restart Quiz" : "Next Challenge"} <ArrowRight size={16}/>
                       </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <CheckCircle2 size={60} className="text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-black uppercase italic">Lesson Mastered!</h2>
                  <button onClick={() => navigate(-1)} className="mt-8 text-blue-400 font-black uppercase text-xs">Return to Curriculum</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}