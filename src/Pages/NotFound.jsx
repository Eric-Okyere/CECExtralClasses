import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        {/* Visual Element */}
        <div className="relative mb-8 flex justify-center">
          <div className="absolute inset-0 bg-blue-100 blur-3xl rounded-full opacity-50 animate-pulse"></div>
          <div className="relative bg-white p-8 rounded-[3rem] shadow-xl shadow-blue-100/50">
            <AlertCircle size={80} className="text-blue-600 mx-auto" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-8xl font-black text-slate-900 italic tracking-tighter mb-2">404</h1>
        <h2 className="text-2xl font-black uppercase italic text-slate-800 mb-4 tracking-tight">
          Page Not Found
        </h2>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-10 leading-relaxed">
          The lesson or dashboard you are looking for has been moved or doesn't exist.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            Go Back
          </button>
          
          <button 
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all"
          >
            <Home size={18} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}