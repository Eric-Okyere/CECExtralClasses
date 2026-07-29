import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Confetti from "react-confetti";
import Navbar from "../components/Navbar";
import { 
  ChevronLeft, Lock, CheckCircle2, 
  List, FileX, ArrowRight, Timer as TimerIcon, 
  Play, Users, BookOpen, Layers, Volume2, VolumeX, RotateCcw
} from "lucide-react";
import { API_BASE_URL } from "../services/BaseUrl";

// Audio Assets
import clapSound from "../assets/Clapping_Sound_Effect(256k).mp3";
import oohSound from "../assets/Ooh_-_Sound.mp3";

export default function LessonView() {
  const { subject, level, subStrand, lessonNumber } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
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

  // --- UPDATED QUIZ TIMER TO 30 SECONDS ---
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  // --- AUDIO REFS & LOGIC ---
  const clapAudioRef = useRef(new Audio(clapSound));
  const oohAudioRef = useRef(new Audio(oohSound));

  useEffect(() => {
    if (isMuted) {
      clapAudioRef.current.pause();
      clapAudioRef.current.currentTime = 0;
      oohAudioRef.current.pause();
      oohAudioRef.current.currentTime = 0;
    }
  }, [isMuted]);

  const playClap = () => {
    if (!isMuted) {
      clapAudioRef.current.currentTime = 0;
      clapAudioRef.current.play().catch((err) => console.log("Audio play error:", err));
    }
  };

  const playOoh = () => {
    if (!isMuted) {
      oohAudioRef.current.currentTime = 0;
      oohAudioRef.current.play().catch((err) => console.log("Audio play error:", err));
    }
  };

  // --- Helper to save completion status to localStorage matching Topics.jsx checks ---
  const markLessonAsCompleted = (lessonObj, finalScore) => {
    try {
      const rawSubStrand = decodeURIComponent(subStrand || "").trim();
      const targetNum = lessonObj?.lessonNumber || lessonNumber || 1;

      // 1. Set boolean string flags for instant Topics.jsx evaluation
      if (lessonObj?._id) {
        localStorage.setItem(`${subject}-${level}-${rawSubStrand}-${lessonObj._id}`, "true");
        localStorage.setItem(`completed_${lessonObj._id}`, "true");
        localStorage.setItem(`completed_lesson_${lessonObj._id}`, "true");
      }

      localStorage.setItem(`completed-${subject}-${level}-${rawSubStrand}-${targetNum}`, "true");
      localStorage.setItem(`completed_${subject}_${level}_${rawSubStrand}_${targetNum}`, "true");

      // Save structured payload
      const completionData = JSON.stringify({
        completed: true,
        score: finalScore,
        completedAt: new Date().toISOString()
      });
      localStorage.setItem(`progress_data_${lessonObj?._id || targetNum}`, completionData);
    } catch (err) {
      console.error("Failed to set completion status in localStorage:", err);
    }
  };

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
            console.error("Using local user state", userErr);
          }
        }

        const response = await axios.get(`${API_BASE_URL}lessons`);
        const allLessons = response.data.data || [];
        const decodedSub = decodeURIComponent(subStrand || "").trim().toLowerCase();
        
        const foundLesson = allLessons.find((l) => {
          const matchSubject = l.subject?.toLowerCase() === subject?.toLowerCase();
          const matchLevel = l.level?.toLowerCase() === level?.toLowerCase();
          
          if (lessonNumber) {
            return matchSubject && matchLevel && String(l.lessonNumber) === String(lessonNumber);
          }

          const matchSubStrand = l.subStrand?.toLowerCase() === decodedSub || 
                                 l.subStrand?.toLowerCase().includes(decodedSub);
          return matchSubject && matchLevel && matchSubStrand;
        });

        if (foundLesson) {
          setLesson(foundLesson);
          const unlockedList = freshUser?.unlockedLessons || [];
          const alreadyUnlocked = unlockedList.some(ul => 
            ul.subject?.toLowerCase() === subject?.toLowerCase() &&
            (ul.subStrand?.toLowerCase() === decodedSub || String(ul.lessonNumber) === String(foundLesson.lessonNumber))
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
  }, [subject, level, subStrand, lessonNumber]);

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

  // --- SYNC PROGRESS TO BACKEND & LOCAL STORAGE ---
  const syncProgressAndXP = async (finalCorrectCount) => {
    try {
      const token = localStorage.getItem("token");
      const userId = user?._id || user?.user?._id;
      const earnedXP = finalCorrectCount * 2;
      const decodedSubStrand = decodeURIComponent(subStrand || "").trim();

      // 1. Mark in local storage
      markLessonAsCompleted(lesson, finalCorrectCount);

      // 2. Save progress to database
      await axios.post(
        `${API_BASE_URL}progress/save`, 
        {
          user: userId,
          subject,
          level,
          strand: lesson?.strand || "",
          subStrand: decodedSubStrand,
          lessonNumber: lesson?.lessonNumber || lessonNumber,
          score: finalCorrectCount,
          total: lesson?.quiz?.length || 0,
          xp: earnedXP
        }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // 3. Update local user state
      const updatedUser = { ...user };
      if (updatedUser.learningProfile) {
        updatedUser.learningProfile.xp = (updatedUser.learningProfile.xp || 0) + earnedXP;
      } else if (updatedUser.user?.learningProfile) {
        updatedUser.user.learningProfile.xp = (updatedUser.user.learningProfile.xp || 0) + earnedXP;
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
          const decodedSubStrand = decodeURIComponent(subStrand || "").trim();

          await axios.post(`${API_BASE_URL}auth/unlock-lesson`, {
            userId: userId,
            lessonData: { 
              subject, 
              level, 
              subStrand: decodedSubStrand,
              lessonNumber: lesson?.lessonNumber || lessonNumber 
            }
          });
          
          const updatedUser = { ...user };
          if (!updatedUser.unlockedLessons) updatedUser.unlockedLessons = [];
          const existsLocally = updatedUser.unlockedLessons.some(ul => 
            ul.subStrand?.toLowerCase() === decodedSubStrand.toLowerCase() ||
            String(ul.lessonNumber) === String(lesson?.lessonNumber || lessonNumber)
          );

          if (!existsLocally) {
            updatedUser.unlockedLessons.push({ 
              subject, 
              level, 
              subStrand: decodedSubStrand,
              lessonNumber: lesson?.lessonNumber || lessonNumber
            });
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
    setTimeLeft(30); // RESET TO 30s FOR NEXT QUESTION
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setCorrectAnswersCount(0);
    setFeedback(null);
    setSelectedOption(null);
    setTimeLeft(30); // RESET TO 30s FOR RESTARTED QUIZ
    setIsQuizStarted(true);
  };

  const displayLessonNumber = lesson?.lessonNumber || lessonNumber;

  if (!loading && user?.role === "parent" && !user?.admin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
            <Users size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic mb-4">Switch to Student View</h2>
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-8">Please switch to a student profile to view this lesson.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 pt-10 animate-pulse space-y-8">
        <div className="h-4 w-24 bg-slate-200 rounded-full"></div>
        <div className="space-y-3">
          <div className="h-4 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-96 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 h-[420px] bg-slate-200 rounded-[3rem]"></div>
          <div className="lg:col-span-5 h-[500px] bg-slate-200 rounded-[3.5rem]"></div>
        </div>
      </div>
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

  const totalVideos = lesson.videos?.length || 0;
  const videosWatchedCount = watchedVideos.length;
  const videoProgressPercent = totalVideos > 0 ? (videosWatchedCount / totalVideos) * 50 : 50;
  const quizProgressPercent = currentQuestionIndex > 0 ? ((currentQuestionIndex + 1) / quizItems.length) * 50 : 0;
  const totalLessonProgress = Math.min(100, Math.round(videoProgressPercent + quizProgressPercent));

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 relative overflow-x-hidden">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={500} />}
      {feedback === 'wrong' && (
        <div className="fixed inset-0 flex items-center justify-center text-6xl animate-bounce z-50 pointer-events-none">😢</div>
      )}
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 pt-10">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase hover:text-slate-600 transition-colors">
              <ChevronLeft size={14}/> Back
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-[10px] font-black uppercase"
            >
              {isMuted ? <VolumeX size={16} className="text-red-500"/> : <Volume2 size={16} className="text-blue-600"/>}
              <span>{isMuted ? "Muted" : "Sound On"}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {subject} • {level}
            </span>
            {lesson.strand && (
              <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Layers size={12} /> Strand: {lesson.strand}
              </span>
            )}
            {displayLessonNumber != null && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Lesson #{displayLessonNumber}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-black text-slate-900 uppercase italic leading-tight">
            {lesson.lessonName ? lesson.lessonName : lesson.subStrand}
          </h1>

          {lesson.lessonName && (
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mt-1 flex items-center gap-1">
              <BookOpen size={14} className="text-blue-500" /> Sub-strand: {lesson.subStrand}
            </p>
          )}

          <div className="mt-6 bg-slate-200 h-2.5 w-full rounded-full overflow-hidden flex">
            <div 
              className="bg-blue-600 h-full transition-all duration-500" 
              style={{ width: `${totalLessonProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase mt-2">
            <span>Progress: {totalLessonProgress}% Completed</span>
            <span>{videosWatchedCount}/{totalVideos} Videos Watched</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-3 rounded-[3rem] shadow-xl border border-white">
              <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden select-none">
                {currentVideo?.url ? (
                  <video 
                    controls 
                    controlsList="nodownload no-remote-playback"
                    disablePictureInPicture
                    disableRemotePlayback
                    onContextMenu={(e) => e.preventDefault()}
                    key={currentVideo?.url} 
                    className="w-full h-full" 
                    onEnded={() => handleVideoEnded(currentVideo?._id)}
                  >
                    <source src={currentVideo?.url} type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black uppercase text-xs">Video content loading...</div>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-600">Now Playing • Part {activeVideoIndex + 1}</p>
                <h4 className="text-sm font-black text-slate-800 uppercase">{currentVideo?.title || `Video Part ${activeVideoIndex + 1}`}</h4>
              </div>
              {watchedVideos.includes(currentVideo?._id) ? (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase">
                  <CheckCircle2 size={12} /> Watched
                </span>
              ) : (
                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase">
                  In Progress
                </span>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100">
               <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><List size={14}/> Video Pipeline</h3>
               <div className="flex flex-wrap gap-2">
                 {lesson.videos?.map((v, i) => (
                   <button 
                    key={v._id || i} 
                    onClick={() => setActiveVideoIndex(i)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${activeVideoIndex === i ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}
                   >
                     {watchedVideos.includes(v._id) ? '✓ ' : ''}Part {i+1}{v.title ? `: ${v.title}` : ''}
                   </button>
                 ))}
               </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl min-h-[600px] flex flex-col relative overflow-hidden">
              {!isQuizLocked && isQuizStarted && !feedback && currentQuestionIndex < quizItems.length && (
                <div className="absolute top-0 left-0 h-1.5 bg-blue-500 transition-all duration-1000 linear" style={{ width: `${(timeLeft / 30) * 100}%` }} />
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
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Test what you've learned in {lesson.lessonName || lesson.subStrand}</p>
                  <button 
                    onClick={() => setIsQuizStarted(true)}
                    className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                  >
                    Start Quiz
                  </button>
                </div>
              ) : currentQuestionIndex < quizItems.length ? (
                <div className="flex-grow flex flex-col">
                  <p className="text-lg font-bold leading-tight mb-8">{currentQuiz?.question}</p>
                  <div className="space-y-3 mb-8">
                    {currentQuiz?.options?.map((opt, i) => {
                      const isCorrect = opt === currentQuiz.answer;
                      const isSelected = selectedOption === opt;
                      let btnClass = "bg-white/5 border-transparent text-slate-400 hover:bg-white/10";
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
                        <button onClick={nextQuestion} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-colors">
                          {isLastQuestion ? "View Results" : "Next Challenge"} <ArrowRight size={16}/>
                        </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <CheckCircle2 size={60} className="text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-black uppercase italic">Lesson Mastered!</h2>
                  <p className="text-blue-400 font-black text-xl mt-2 mb-8">Score: {correctAnswersCount * 2} XP</p>
                  
                  <div className="space-y-3 w-full">
                    <button 
                      onClick={handleRestartQuiz}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                      <RotateCcw size={14} /> Retake Quiz
                    </button>
                    <button 
                      onClick={() => navigate(`/dashboard/${user?._id || user?.user?._id}`)} 
                      className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-colors"
                    >
                      View Result in Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}