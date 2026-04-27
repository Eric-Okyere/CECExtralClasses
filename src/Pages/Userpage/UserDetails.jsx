import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Mail, Phone, Calendar, 
  Shield, User as UserIcon, Book, Award,
  Users, CheckCircle2, AlertCircle, Zap
} from "lucide-react";
import { API_BASE_URL } from "../../services/BaseUrl";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Ensure your backend .populates("parentId")
        const res = await fetch(`${API_BASE_URL}auth/user/${id}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          console.error("User not found");
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 text-xs uppercase tracking-widest">Loading Profile</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-black text-slate-800">User Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold uppercase text-xs">Return to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
      {/* --- NAVIGATION --- */}
      <div className="max-w-5xl mx-auto mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
        >
          <ArrowLeft size={16} /> Back to Management Console
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* --- MAIN IDENTITY CARD --- */}
        <div className="bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <UserIcon size={120} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-100">
              {user.name?.charAt(0)}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-4xl font-black text-slate-800 uppercase italic tracking-tight">
                  {user.name} {user.surname}
                </h1>
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  user.role === 'child' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {user.role}
                </span>
                {user.admin && (
                  <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600">
                    Admin
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-400 font-bold text-xs uppercase">
                <div className="flex items-center gap-2"><Mail size={14} className="text-blue-500"/> {user.parentId?.email || user.email || "No Email Linked"}</div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-green-500"/> 
                  {user.parentDetails?.phoneNumber || user.parentId?.parentDetails?.phoneNumber || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- GUARDIAN / PARENT SECTION (Conditional) --- */}
        {user.role === 'child' && user.parentId && (
          <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Users size={16} /> Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Parent Name</p>
                <p className="font-black text-slate-800">{user.parentId.name} {user.parentId.surname}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Parent Email</p>
                <p className="font-bold text-indigo-600 lowercase">{user.parentId.email}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Emergency Contact</p>
                <p className="font-bold text-slate-800">
                  {user.parentId.parentDetails?.phoneNumber || "Same as account"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- STATS & METADATA GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Academic Profile */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Book size={16} className="text-blue-500" /> Academic Journey
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-slate-400 font-bold text-xs uppercase">Grade Level</span>
                <span className="font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg">
                  {user.learningProfile?.level || "Unset"}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-slate-400 font-bold text-xs uppercase">Learning Points</span>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-orange-500 fill-orange-500" />
                  <span className="font-black text-orange-600">{user.learningProfile?.xp || 0} XP</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-xs uppercase">Account Status</span>
                <span className={`font-black text-[10px] px-3 py-1 rounded-lg uppercase ${
                  user.learningProfile?.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                }`}>
                  {user.learningProfile?.isPaid ? 'Premium Access' : 'Free Tier'}
                </span>
              </div>
            </div>
          </div>

          {/* System Data */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Shield size={16} className="text-indigo-500" /> System Records
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-slate-400 font-bold text-xs uppercase">Verification</span>
                <div className="flex items-center gap-2">
                  {user.isVerified ? (
                    <><CheckCircle2 size={16} className="text-emerald-500" /> <span className="font-black text-emerald-600">Verified</span></>
                  ) : (
                    <><AlertCircle size={16} className="text-orange-400" /> <span className="font-black text-orange-400">Pending</span></>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-slate-400 font-bold text-xs uppercase">Registration Date</span>
                <span className="font-black text-slate-700">
                  {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold text-xs uppercase">Unique ID</span>
                <span className="font-mono text-[9px] bg-slate-50 px-2 py-1 rounded-md text-slate-400 select-all">
                  {user._id}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}