import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Confetti from "react-confetti";
import Navbar from "../components/Navbar";
import { 
  ChevronLeft, Video, Lock, CheckCircle2, 
  Award, List, Loader2, FileX, ArrowRight, Timer as TimerIcon, Play, Users
} from "lucide-react";
import { API_BASE_URL } from "../services/BaseUrl";

// Audio Assets
import clapSound from "../assets/Clapping_Sound_Effect(256k).mp3";
import oohSound from "../assets/Ooh_-_Sound.mp3";

export default function LessonView() {
  const { subject, level, subStrand } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed?.user ? parsed.user : parsed;
  });
  
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState([]);
  const [isQuizLocked, setIsQuizLocked] = useState(true);
  const [isQuizStarted, setIsQuizStarted] = useState(false); 
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); 
  const [showConfetti, setShowConfetti] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  const playClap = () => new Audio(clapSound).play();
  const playOoh = () => new Audio(oohSound).play();

  // --- 1. FETCH LESSON DATA & CHECK UNLOCK STATUS ---
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        const userId = user?._id || user?.user?._id;
        let freshUser = user;

        if (userId) {
            try {
                const userRes = await axios.get(`${API_BASE_URL}auth/user/${userId}`);
                freshUser = userRes.data;
                setUser(freshUser);
                localStorage.setItem("user", JSON.stringify(freshUser));
            } catch (userErr) {
                console.error("Using local data", userErr);
            }
        }

        const response = await axios.get(`${API_BASE_URL}lessons`);
        const allLessons = response.data.data || [];
        const decodedSub = decodeURIComponent(subStrand || "").trim().toLowerCase();
        
        const foundLesson = allLessons.find((l) => 
          l.subject?.toLowerCase() === subject?.toLowerCase() && 
          l.level?.toLowerCase() === level?.toLowerCase() &&
          (l.subStrand?.toLowerCase() === decodedSub || l.subStrand?.toLowerCase().includes(decodedSub))
        );

        if (foundLesson) {
          setLesson(foundLesson);
          const unlockedList = freshUser?.unlockedLessons || [];
          const alreadyUnlocked = unlockedList.some(ul => 
            ul.subject?.toLowerCase() === subject?.toLowerCase() &&
            ul.subStrand?.toLowerCase() === decodedSub
          );

          if (alreadyUnlocked || !foundLesson.videos?.length) {
            setIsQuizLocked(false);
            setWatchedVideos(foundLesson.videos?.map(v => v._id) || []);
          }
        } else {
          setError("Lesson not found");
        }
      } catch (err) {
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [subject, level, subStrand]);

  // --- 2. TIMER LOGIC ---
  useEffect(() => {
    if (!isQuizLocked && isQuizStarted && !feedback && (lesson?.quiz?.length || 0) > currentQuestionIndex) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isQuizLocked, isQuizStarted, currentQuestionIndex, feedback]);

  const handleTimeOut = () => {
    clearInterval(timerRef.current);
    setFeedback('wrong');
    playOoh();
    checkIfQuizFinished(correctAnswersCount);
  };

  const syncProgressAndXP = async (finalCorrectCount) => {
    try {
      const token = localStorage.getItem("token");
      const userId = user?._id || user?.user?._id;
      const earnedXP = finalCorrectCount * 2;

      await axios.post(`${API_BASE_URL}progress/save`, {
        user: userId,
        subject,
        level,
        subStrand,
        score: finalCorrectCount,
        total: lesson.quiz.length,
        xp: earnedXP
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = { ...user };
      if (updatedUser.learningProfile) {
        updatedUser.learningProfile.xp += earnedXP;
      } else if (updatedUser.user?.learningProfile) {
        updatedUser.user.learningProfile.xp += earnedXP;
      }
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error("Failed to sync progress:", err);
    }
  };

  const handleVideoEnded = async (videoId) => {
    if (!watchedVideos.includes(videoId)) {
      const updated = [...watchedVideos, videoId];
      setWatchedVideos(updated);
      
      if (updated.length === (lesson?.videos?.length || 0)) {
        setIsQuizLocked(false); 
        try {
          const userId = user?._id || user?.user?._id;
          await axios.post(`${API_BASE_URL}auth/unlock-lesson`, {
            userId: userId,
            lessonData: { subject, level, subStrand: decodeURIComponent(subStrand || "").trim() }
          });
          
          const updatedUser = { ...user };
          if (!updatedUser.unlockedLessons) updatedUser.unlockedLessons = [];
          const existsLocally = updatedUser.unlockedLessons.some(ul => 
            ul.subStrand === decodeURIComponent(subStrand || "").trim()
          );

          if (!existsLocally) {
            updatedUser.unlockedLessons.push({ subject, level, subStrand: decodeURIComponent(subStrand || "").trim() });
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } catch (err) {
          console.error("Failed to persist unlock status", err);
        }
      }
    }
  };

  const handleOptionClick = (option, correctAnswer) => {
    if (feedback || timeLeft === 0) return;
    clearInterval(timerRef.current);
    setSelectedOption(option);

    let updatedCorrectCount = correctAnswersCount;
    if (option === correctAnswer) {
      setFeedback('correct');
      setShowConfetti(true);
      updatedCorrectCount += 1;
      setCorrectAnswersCount(updatedCorrectCount);
      playClap();
      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      setFeedback('wrong');
      playOoh();
    }
    checkIfQuizFinished(updatedCorrectCount);
  };

  const checkIfQuizFinished = (count) => {
    if (currentQuestionIndex === (lesson?.quiz?.length || 0) - 1) {
      syncProgressAndXP(count);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    setTimeLeft(15);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  // --- LOGIC: PARENT VIEW RESTRICTION ---
  if (!loading && user?.role === "parent" && !user?.admin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
            <Users size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic mb-4">Switch to Student View</h2>
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-8">Please switch to a student profile to start this lesson.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-blue-600">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-black uppercase tracking-widest text-[10px]">Loading Lesson...</p>
    </div>
  );

  if (!lesson || error) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
          <FileX size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 uppercase italic mb-4">Lesson Not Available</h2>
        <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Back</button>
      </div>
    </div>
  );

  const currentVideo = lesson.videos?.[activeVideoIndex];
  const quizItems = lesson.quiz || [];
  const currentQuiz = quizItems[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizItems.length - 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 relative overflow-x-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={500} />}
      {feedback === 'wrong' && (
        <div className="fixed inset-0 flex items-center justify-center text-6xl animate-bounce z-50 pointer-events-none">😢</div>
      )}
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        <header className="mb-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase mb-4"><ChevronLeft size={14}/> Back</button>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic">{lesson.subStrand}</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-3 rounded-[3rem] shadow-xl border border-white">
              <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden">
                {currentVideo?.url ? (
                  <video controls key={currentVideo?.url} className="w-full h-full" onEnded={() => handleVideoEnded(currentVideo?._id)}>
                    <source src={currentVideo?.url} type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black uppercase text-xs">Video content loading...</div>
                )}
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

          <div className="lg:col-span-5">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl min-h-[600px] flex flex-col relative overflow-hidden">
              {!isQuizLocked && isQuizStarted && !feedback && currentQuestionIndex < quizItems.length && (
                <div className="absolute top-0 left-0 h-1.5 bg-blue-500 transition-all duration-1000 linear" style={{ width: `${(timeLeft / 15) * 100}%` }} />
              )}
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                  <TimerIcon size={18} className={timeLeft < 5 ? "text-red-500 animate-pulse" : "text-blue-400"} />
                  <span className={`text-lg font-black ${timeLeft < 5 ? "text-red-500" : "text-white"}`}>{timeLeft}s</span>
                </div>
                <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full">{currentQuestionIndex + 1} / {quizItems.length}</span>
              </div>
              {isQuizLocked ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4"><Lock className="text-slate-600" /></div>
                  <p className="text-xs font-black uppercase text-slate-500 px-6 italic">Watch all videos to unlock the quiz</p>
                </div>
              ) : !isQuizStarted ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20"><Play className="text-white fill-current" size={32} /></div>
                  <h3 className="text-2xl font-black uppercase italic mb-2">Quiz Ready!</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Test what you've learned</p>
                  <button 
                    onClick={() => setIsQuizStarted(true)}
                    className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                  >
                    Start Lesson Quiz
                  </button>
                </div>
              ) : currentQuestionIndex < quizItems.length ? (
                <div className="flex-grow flex flex-col">
                  <p className="text-lg font-bold leading-tight mb-8">{currentQuiz?.question}</p>
                  <div className="space-y-3 mb-8">
                    {currentQuiz?.options?.map((opt, i) => {
                      const isCorrect = opt === currentQuiz.answer;
                      const isSelected = selectedOption === opt;
                      let btnClass = "bg-white/5 border-transparent text-slate-400";
                      if (feedback && isCorrect) btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg";
                      if (feedback === 'wrong' && isSelected && !isCorrect) btnClass = "bg-red-500 border-red-500 text-white";
                      return (
                        <button key={i} disabled={!!feedback} onClick={() => handleOptionClick(opt, currentQuiz.answer)} className={`w-full p-5 rounded-2xl border-2 text-left text-xs font-black transition-all flex items-center gap-4 ${btnClass}`}>
                          <span className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center">{String.fromCharCode(65+i)}</span>{opt}
                        </button>
                      );
                    })}
                  </div>
                  {feedback && (
                    <div className="mt-auto animate-in fade-in slide-in-from-bottom-4">
                       <p className="text-[10px] text-slate-500 uppercase font-black mb-4 tracking-tighter">Tip: <span className="text-slate-300 font-medium lowercase">{currentQuiz?.explanation}</span></p>
                       <button onClick={nextQuestion} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3">
                         {isLastQuestion ? "View Results" : "Next Challenge"} <ArrowRight size={16}/>
                       </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <CheckCircle2 size={60} className="text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-black uppercase italic">Lesson Mastered!</h2>
                  <p className="text-blue-400 font-black text-xl mt-2 mb-10">Score: {correctAnswersCount * 2} XP</p>
                  <button 
                    onClick={() => navigate(`/dashboard/${user?._id || user?.user?._id}`)} 
                    className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    View Result in Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}