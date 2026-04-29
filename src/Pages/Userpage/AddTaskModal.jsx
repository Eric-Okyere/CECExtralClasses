import React, { useState } from "react";
import { X, Clock, BookOpen, Calendar } from "lucide-react";

export default function AddTaskModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    day: "Monday",
    subject: "Mathematics",
    startTime: "08:00",
    endTime: "09:00",
    task: "" // Matches your Mongoose schema field 'task'
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black uppercase italic text-slate-900">Create Schedule</h3>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Plan your study session</p>
          </div>
          <button onClick={onClose} className="bg-slate-50 p-3 rounded-2xl text-slate-400 hover:text-red-500 transition-colors">
            <X size={20}/>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Day Selection */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Select Day</label>
            <select 
              value={formData.day}
              className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none appearance-none"
              onChange={(e) => setFormData({...formData, day: e.target.value})}
            >
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Subject Selection */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Subject</label>
            <select 
              value={formData.subject}
              className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none appearance-none"
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            >
              <option>Mathematics</option>
              <option>Integrated Science</option>
              <option>English Language</option>
              <option>Social Studies</option>
              <option>Religious and Moral Education</option>
              <option>Career Technology</option>
            </select>
          </div>

          {/* Task Description */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Specific Task</label>
            <input 
              type="text"
              placeholder="e.g. Solve Algebra Quiz"
              className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 outline-none"
              onChange={(e) => setFormData({...formData, task: e.target.value})}
            />
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Start Time</label>
              <input 
                type="time" 
                value={formData.startTime}
                className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold outline-none" 
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">End Time</label>
              <input 
                type="time" 
                value={formData.endTime}
                className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold outline-none" 
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={() => onSave(formData)}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
          >
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
}