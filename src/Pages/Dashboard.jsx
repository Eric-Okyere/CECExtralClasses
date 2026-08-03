import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import AddTaskModal from "./Userpage/AddTaskModal"; 
import { API_BASE_URL } from "../services/BaseUrl";
import { 
  Loader2, BookOpen, Trophy, BarChart3, 
  ChevronRight, ArrowRight, Calendar, PlusCircle
} from "lucide-react";

export default function Dashboard() {
  const { userId: paramUserId } = useParams();

  // --- STATE WITH SAFE USER PARSING ---
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed?.user ? parsed.user : parsed;
    } catch {
      return null;
    }
  });

  const [completedTopics, setCompletedTopics] = useState([]);
  const [timetable, setTimetable] = useState([]); 
  const [activeDay, setActiveDay] = useState("Monday");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const subjects = [
    "All", "Mathematics", "Integrated Science", 
    "English Language", "Social Studies", "Religious and Moral Education", "Career Technology"
  ];

  const isMongoId = (str) => typeof str === "string" && /^[0-9a-fA-F]{24}$/.test(str);

  const getStrandDisplay = (item) => {
    const strand = item.strand;
    if (!strand) return item.strandName || item.strandTitle || "";
    if (typeof strand === "object") return strand.title || strand.strandName || strand.name || "";
    if (isMongoId(strand)) return item.strandName || item.strandTitle || "";
    return strand;
  };

  const getSubStrandDisplay = (item) => {
    const subStrand = item.subStrand;
    if (!subStrand) return item.subStrandName || item.subStrandTitle || "";
    if (typeof subStrand === "object") return subStrand.title || subStrand.subStrandName || subStrand.name || "";
    if (isMongoId(subStrand)) return item.subStrandName || item.subStrandTitle || "";
    return subStrand;
  };

  const getLessonDisplay = (item) => {
    if (typeof item.lessonName === "string" && item.lessonName.trim() !== "") {
      return item.lessonName;
    }
    const lesson = item.lesson || item.topic || item.topicName || item.quizTitle || item.topicTitle || item.title;
    if (!lesson) return "";
    if (typeof lesson === "object") return lesson.lessonName || lesson.title || lesson.name || lesson.topicName || "";
    if (isMongoId(lesson)) return item.topicName || item.title || "";
    return lesson;
  };

  // --- FETCH USER & DASHBOARD DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Safe check across multiple local storage or route formats
        const targetUserId = paramUserId || user?._id || user?.id;

        if (!targetUserId) {
          setLoading(false);
          return;
        }

        const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        const [userRes, progressRes, timetableRes] = await Promise.all([
          axios.get(`${API_BASE_URL}auth/user/${targetUserId}`, authHeader).catch((err) => {
            console.error("User endpoint error:", err);
            return null;
          }),
          axios.get(`${API_BASE_URL}progress/user/${targetUserId}`, authHeader).catch((err) => {
            console.error("Progress endpoint error:", err);
            return null;
          }),
          axios.get(`${API_BASE_URL}timetable`, authHeader).catch(() => null)
        ]);

        if (userRes?.data) {
          const freshUser = userRes.data.user || userRes.data;
          setUser(freshUser);
        }

        if (progressRes?.data?.success) {
          setCompletedTopics(progressRes.data.data || []);
        } else if (Array.isArray(progressRes?.data)) {
          // Handle backend responses returning array directly
          setCompletedTopics(progressRes.data);
        }
        
        if (timetableRes?.data?.success) {
          setTimetable(timetableRes.data.data || []);
        }

      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [paramUserId]);

  const handleSaveTimetable = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const { day, ...slotData } = formData;

      const response = await axios.post(
        `${API_BASE_URL}timetable`, 
        { day, timeSlots: [slotData] }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const updated = await axios.get(`${API_BASE_URL}timetable`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTimetable(updated.data.data || []);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Could not save to your personal timetable.");
    }
  };

  const { totalScore, totalQuestions, percentage } = useMemo(() => {
    const score = completedTopics.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const questions = completedTopics.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const pct = questions > 0 ? Math.round((score / questions) * 100) : 0;
    return { totalScore: score, totalQuestions: questions, percentage: pct };
  }, [completedTopics]);

  const filteredTopics = useMemo(() => {
    if (filter === "All") return completedTopics;
    return completedTopics.filter(
      (t) => t.subject?.trim().toLowerCase() === filter.trim().toLowerCase()
    );
  }, [completedTopics, filter]);

  const currentDayData = useMemo(() => {
    return timetable.find(
      (t) => t.day?.trim().toLowerCase() === activeDay.trim().toLowerCase()
    );
  }, [timetable, activeDay]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6 pt-10">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
              Learner Profile
            </h1>
            {user?.role && (
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                user.role === 'child' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role}
              </span>
            )}
          </div>
          <p className="text-slate-500 font-medium tracking-tight">
            Personal Workspace for {user?.name} {user?.surname || ""}
          </p>
        </header>

        {/* 🎯 SUBJECT FILTERS */}
        <div className="relative mb-8 group">
          <div className="absolute right-0 bottom-10 -translate-y-1/2 z-10 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pl-10 pr-2 pointer-events-none md:hidden">
            <div className="bg-white p-2 rounded-full shadow-lg border border-slate-100 animate-pulse">
              <ChevronRight size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-3 whitespace-nowrap pr-12">
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setFilter(subj)}
                  className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    filter === subj 
                      ? "bg-blue-600 text-white shadow-xl ring-2 ring-blue-600 ring-offset-2" 
                      : "bg-white text-slate-400 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 📊 STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-blue-600" size={20} />
              <h2 className="font-black uppercase text-xs tracking-widest text-slate-400">Curriculum Mastery</h2>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-5 mb-4 overflow-hidden p-1">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-end">
               <div className="flex items-baseline">
                  <span className="text-5xl font-black italic text-slate-900">{percentage}%</span>
                  <span className="text-slate-400 font-bold text-xs ml-2 uppercase">Mastery</span>
               </div>
               <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-xs uppercase">
                 {user?.learningProfile?.xp || 0} XP
               </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col justify-center relative overflow-hidden shadow-lg">
            <Trophy className="text-yellow-400 mb-4" size={36} />
            <p className="text-5xl font-black italic mb-2">{totalScore}</p>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">
              Total Questions Correct ({totalQuestions} Answered)
            </p>
          </div>
        </div>
        
        {/* 📚 LEARNING HISTORY */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="text-blue-600" size={20} />
            <h2 className="font-black uppercase text-xs tracking-widest text-slate-400">
              Learning History ({filteredTopics.length})
            </h2>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="py-24 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                 <BookOpen className="text-slate-300" size={32} />
               </div>
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                 No recorded activity for {filter}
               </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTopics.map((item, index) => {
                const strandName = getStrandDisplay(item);
                const subStrandName = getSubStrandDisplay(item);
                const lessonName = getLessonDisplay(item);
                const itemPercentage = item.total > 0 ? Math.round((item.score / item.total) * 100) : 0;

                return (
                  <div
                    key={item._id || index}
                    className="group bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 p-6 rounded-[2rem] transition-all border border-transparent hover:border-slate-100 flex flex-col md:flex-row md:items-center justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 font-black shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {item.level && (
                            <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                              {item.level}
                            </span>
                          )}
                          <p className="font-black text-slate-900 uppercase italic text-sm">
                            {item.subject}
                          </p>
                        </div>

                        {lessonName && (
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-0.5">
                            Lesson: {lessonName}
                          </h3>
                        )}
                        {strandName && (
                          <p className="text-xs font-bold text-slate-600 mb-0.5">
                            Strand: {strandName}
                          </p>
                        )}
                        {subStrandName && (
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                            Sub-Strand: {subStrandName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 md:mt-0 flex items-center justify-between md:justify-end gap-8">
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                           Final Score
                         </p>
                         <p className="font-black text-slate-900 text-xl italic">
                           {item.score} <span className="text-slate-400 text-xs not-italic">/ {item.total}</span>
                         </p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner shrink-0 ${
                        itemPercentage >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {itemPercentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 📅 WEEKLY TIMETABLE */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={20} />
              <h2 className="font-black uppercase text-xs tracking-widest text-slate-400">My Study Schedule</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all ${
                    activeDay === day 
                      ? "bg-slate-900 text-white shadow-md" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {!currentDayData || !currentDayData.timeSlots || currentDayData.timeSlots.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  No session scheduled for {activeDay}
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="inline-flex items-center gap-1.5 text-blue-600 font-black uppercase text-[10px] hover:underline"
                >
                  <PlusCircle size={14} /> Plan Now
                </button>
              </div>
            ) : (
              currentDayData.timeSlots.map((slot, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100"
                >
                  <div className="text-center min-w-[80px]">
                    <p className="text-[11px] font-black text-slate-900">{slot.startTime}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">to {slot.endTime}</p>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-slate-900 uppercase italic text-sm">{slot.subject}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{slot.task}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-8 flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all group shadow-md"
          >
            Add Study Session <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>

      </div>

      <AddTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveTimetable} 
      />
    </div>
  );
}