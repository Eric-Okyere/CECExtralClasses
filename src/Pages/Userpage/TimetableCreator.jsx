import React, { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";

export default function TimetableCreator() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [selectedDay, setSelectedDay] = useState("Monday");

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black uppercase italic tracking-tighter">My Study Schedule</h2>
        <button className="bg-blue-600 p-3 rounded-2xl text-white hover:scale-105 transition-transform">
          <Plus size={20} />
        </button>
      </header>

      {/* Day Selector (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
        {days.map(day => (
          <button 
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${
              selectedDay === day ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Time Slot List */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl group border border-transparent hover:border-blue-100 transition-all">
          <div className="w-16 text-center">
            <p className="text-[10px] font-black text-blue-600">08:00</p>
            <p className="text-[10px] font-bold text-slate-300">AM</p>
          </div>
          <div className="flex-grow">
            <h4 className="font-black text-slate-900 uppercase text-sm italic">Mathematics</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Algebra Basics</p>
          </div>
          <button className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
            <Trash2 size={18} />
          </button>
        </div>
        
        {/* Empty State */}
        <button className="w-full border-2 border-dashed border-slate-100 p-8 rounded-3xl text-slate-300 font-black uppercase text-[10px] hover:bg-slate-50 transition-all">
          + Add Study Session for {selectedDay}
        </button>
      </div>
    </div>
  );
}