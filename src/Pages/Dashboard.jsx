import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import AddTaskModal from "./Userpage/AddTaskModal"; 
import { API_BASE_URL } from "../services/BaseUrl";
import { 
  Loader2, BookOpen, Trophy, BarChart3, 
  ChevronRight, ArrowRight, Clock, Calendar
} from "lucide-react";

export default function Dashboard() {
  // --- STATE ---
  const [user] = useState(JSON.parse(localStorage.getItem("user")));
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

  // --- FETCH USER-SPECIFIC DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = user?._id || user?.user?._id;
        if (!userId) return;

        // Fetches only data belonging to the logged-in user
        const [progressRes, timetableRes] = await Promise.all([
          axios.get(`${API_BASE_URL}progress/user/${userId}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get(`${API_BASE_URL}timetable`, { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);

        if (progressRes.data.success) setCompletedTopics(progressRes.data.data);
        if (timetableRes.data.success) setTimetable(timetableRes.data.data);

      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // --- SAVE UNIQUE TIMETABLE SESSION ---
  const handleSaveTimetable = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const { day, ...slotData } = formData;

      // This POSTs to your specific user record on the backend
      const response = await axios.post(`${API_BASE_URL}timetable`, {
        day: day,
        timeSlots: [slotData] 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      if (response.data.success) {
        // Re-fetch to ensure the unique view is updated
        const updated = await axios.get(`${API_BASE_URL}timetable`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTimetable(updated.data.data);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Could not save to your personal timetable.");
    }
  };

  // Calculations for Stats
  const totalScore = completedTopics.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const totalQuestions = completedTopics.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const filteredTopics = filter === "All" 
    ? completedTopics 
    : completedTopics.filter(t => t.subject.trim().toLowerCase() === filter.trim().toLowerCase());

  const currentDayData = timetable.find(t => t.day === activeDay);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6 pt-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
            Learner Profile
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Personal Workspace for {user?.name || "Student"}</p>
        </header>

        {/* 🎯 SUBJECT FILTERS (WITH SCROLL HINT) */}
        <div className="relative mb-8 group">
          <div className="absolute right-0 bottom-10 -translate-y-1/2 z-10 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pl-10 pr-2 pointer-events-none md:hidden">
            <div className="bg-white p-2 rounded-full shadow-lg border border-slate-100 animate-pulse">
              <ChevronRight size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-3 whitespace-nowrap pr-12 ml-4">
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setFilter(subj)}
                  className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    filter === subj ? "bg-blue-600 mt-1 text-white shadow-xl ring-2 ring-blue-600 ring-offset-2" : "bg-white text-slate-400 border border-slate-200"
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
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
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
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col justify-center relative overflow-hidden">
            <Trophy className="text-yellow-400 mb-4" size={36} />
            <p className="text-5xl font-black italic mb-2">{totalScore}</p>
            <p className="text-[10px] font-black uppercase opacity-50">Total Questions Correct</p>
          </div>
        </div>

        {/* 📅 UNIQUE WEEKLY TIMETABLE */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={20} />
              <h2 className="font-black uppercase text-xs tracking-widest text-slate-400">My Study Schedule</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all ${
                    activeDay === day ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400"
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {!currentDayData || currentDayData.timeSlots.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-50 rounded-[2rem]">
                <p className="text-[10px] font-black text-slate-300 uppercase">No session for {activeDay}</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-2 text-blue-600 font-black uppercase text-[9px]">+ Plan Now</button>
              </div>
            ) : (
              currentDayData.timeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                  <div className="text-center min-w-[70px]">
                    <p className="text-[10px] font-black text-slate-900">{slot.startTime}</p>
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
            className="w-full mt-8 flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 transition-all group"
          >
            Add Study Session <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>

        {/* 📚 LEARNING HISTORY */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="text-blue-600" size={20} />
            <h2 className="font-black uppercase text-xs tracking-widest text-slate-400">
              Learning History ({filteredTopics.length})
            </h2>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="py-24 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                 <BookOpen className="text-slate-200" size={32} />
               </div>
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Nothing here yet for {filter}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTopics.map((item, index) => (
                <div
                  key={index}
                  className="group bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 p-6 rounded-[2rem] transition-all border border-transparent hover:border-slate-100 flex flex-col md:flex-row md:items-center justify-between"
                >
                  {/* ... same topic list items ... */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 font-black">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                          {item.level}
                        </span>
                        <p className="font-black text-slate-900 uppercase italic text-sm">
                          {item.subject}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mb-0.5">{item.strand}</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{item.subStrand}</p>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-0 flex items-center justify-between md:justify-end gap-10">
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Final Score</p>
                       <p className="font-black text-slate-900 text-xl italic">{item.score} <span className="text-slate-300 text-xs not-italic">/ {item.total}</span></p>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner ${
                      (item.score / item.total) >= 0.7 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {Math.round((item.score / item.total) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTimetable} />
    </div>
  );
}