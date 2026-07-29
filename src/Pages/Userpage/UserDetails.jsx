import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Mail, Phone, Calendar, 
  Shield, User as UserIcon, Book, Award,
  Users, CheckCircle2, AlertCircle, Zap, ExternalLink, GraduationCap,
  HeartPulse, Accessibility, Flame, Lock, FileCheck, Clock
} from "lucide-react";
import { API_BASE_URL } from "../../services/BaseUrl";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndChildren = async () => {
      try {
        setLoading(true);
        // 1. Fetch main user profile
        const res = await fetch(`${API_BASE_URL}auth/user/${id}`);
        const data = await res.json();

        if (res.ok) {
          setUser(data);

          // 2. If children are populated on the user object, use them directly
          if (data.children && Array.isArray(data.children) && data.children.length > 0) {
            setChildren(data.children);
          } else {
            // 3. Fallback: Fetch all users and filter by parentId if role is parent
            const usersRes = await fetch(`${API_BASE_URL}auth/users`);
            if (usersRes.ok) {
              const allUsers = await usersRes.json();
              const linkedChildren = allUsers.filter(u => 
                u.parentId?._id === id || u.parentId === id
              );
              setChildren(linkedChildren);
            }
          }
        } else {
          console.error("User not found");
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndChildren();
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
            {user.picture ? (
              <img 
                src={user.picture} 
                alt={`${user.name}'s profile`} 
                className="w-32 h-32 rounded-[2.5rem] object-cover shadow-xl shadow-blue-100" 
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-100">
                {user.name?.charAt(0)}
              </div>
            )}
            
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
                {user.gender && (
                  <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                    {user.gender}
                  </span>
                )}
                {user.admin && (
                  <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600">
                    Admin
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-400 font-bold text-xs uppercase">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-blue-500"/> 
                  {user.email || user.parentId?.email || "No Email Linked"}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-green-500"/> 
                  {user.parentDetails?.phoneNumber || user.parentId?.parentDetails?.phoneNumber || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- GUARDIAN / PARENT SECTION --- */}
        {(user.role === 'child' || user.parentDetails?.phoneNumber || user.parentDetails?.relationship) && (
          <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Users size={16} /> Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Parent / Guardian Name</p>
                <p className="font-black text-slate-800">
                  {user.parentId ? `${user.parentId.name} ${user.parentId.surname}` : "Not linked"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Parent Email</p>
                <p className="font-bold text-indigo-600 lowercase">{user.parentId?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Phone Number</p>
                <p className="font-bold text-slate-800">
                  {user.parentDetails?.phoneNumber || user.parentId?.parentDetails?.phoneNumber || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Relationship</p>
                <p className="font-bold text-slate-800">
                  {user.parentDetails?.relationship || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- DISABILITY / ACCESSIBILITY PROFILE --- */}
        <div className={`p-8 rounded-[2.5rem] border shadow-sm ${
          user.disabilityProfile?.hasDisability 
            ? 'bg-amber-50/60 border-amber-200/60' 
            : 'bg-white border-slate-100'
        }`}>
          <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${
            user.disabilityProfile?.hasDisability ? 'text-amber-700' : 'text-slate-400'
          }`}>
            <Accessibility size={18} className={user.disabilityProfile?.hasDisability ? "text-amber-600" : "text-blue-500"} /> 
            Special Educational Needs & Disability Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-block ${
                user.disabilityProfile?.hasDisability ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {user.disabilityProfile?.hasDisability ? "Has Special Needs" : "No Disability"}
              </span>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Category / Type</p>
              <p className="font-black text-slate-800">{user.disabilityProfile?.type || "None"}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Details / Diagnosis</p>
              <p className="font-bold text-slate-700 text-xs">{user.disabilityProfile?.details || "None provided"}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Accommodations Needed</p>
              <p className="font-bold text-slate-700 text-xs">{user.disabilityProfile?.accommodationsNeeded || "None specified"}</p>
            </div>
          </div>
        </div>

        {/* --- LINKED CHILDREN SECTION (When viewing a Parent) --- */}
        {(user.role === 'parent' || children.length > 0) && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-600" /> Linked Children ({children.length})
              </h3>
            </div>

            {children.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-2xl text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No child accounts linked to this parent yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((child) => (
                  <div 
                    key={child._id}
                    onClick={() => navigate(`/admin/user/${child._id}`)}
                    className="p-5 bg-slate-50 hover:bg-blue-50/60 rounded-2xl border border-slate-100 transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 font-black rounded-xl flex items-center justify-center text-lg">
                        {child.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                          {child.name} {child.surname}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                          <span>{child.learningProfile?.level || "No Level"}</span>
                          <span>•</span>
                          <span className="text-orange-500 font-black">{child.learningProfile?.xp || 0} XP</span>
                          {child.gender && (
                            <>
                              <span>•</span>
                              <span>{child.gender}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button className="p-2 text-slate-400 group-hover:text-blue-600 group-hover:bg-white rounded-lg transition-all">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- STATS & METADATA GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Academic Profile */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Book size={16} className="text-blue-500" /> Academic Journey
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-400 font-bold text-xs uppercase">Grade Level</span>
                <span className="font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg">
                  {user.learningProfile?.level || "Unset"}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-400 font-bold text-xs uppercase">Age</span>
                <span className="font-black text-slate-800 bg-slate-50 px-3 py-1 rounded-lg">
                  {user.learningProfile?.age ? `${user.learningProfile.age} yrs` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-400 font-bold text-xs uppercase">Learning Points</span>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-orange-500 fill-orange-500" />
                  <span className="font-black text-orange-600">{user.learningProfile?.xp || 0} XP</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-400 font-bold text-xs uppercase">Daily Streak</span>
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-red-500 fill-red-500" />
                  <span className="font-black text-slate-800">{user.learningProfile?.streak || 0} Days</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-400 font-bold text-xs uppercase">Unlocked Lessons</span>
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-indigo-500" />
                  <span className="font-black text-slate-800">{user.unlockedLessons?.length || 0} Unlocked</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400 font-bold text-xs uppercase">Account Tier</span>
                <span className={`font-black text-[10px] px-3 py-1 rounded-lg uppercase ${
                  user.learningProfile?.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {user.learningProfile?.isPaid ? 'Premium Access' : 'Free Tier'}
                </span>
              </div>
            </div>
          </div>

          {/* System Records & Verification */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Shield size={16} className="text-indigo-500" /> System Records
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-400 font-bold text-xs uppercase">Verification</span>
                <div className="flex items-center gap-2">
                  {user.isVerified ? (
                    <><CheckCircle2 size={16} className="text-emerald-500" /> <span className="font-black text-emerald-600">Verified</span></>
                  ) : (
                    <><AlertCircle size={16} className="text-orange-400" /> <span className="font-black text-orange-400">Pending</span></>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-400 font-bold text-xs uppercase">Accepted Terms</span>
                <div className="flex items-center gap-2">
                  {user.acceptedTerms ? (
                    <><FileCheck size={16} className="text-emerald-500" /> <span className="font-black text-emerald-600">Accepted</span></>
                  ) : (
                    <><AlertCircle size={16} className="text-slate-400" /> <span className="font-black text-slate-400">Not Accepted</span></>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-400 font-bold text-xs uppercase">Registration Date</span>
                <span className="font-black text-slate-700">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <span className="text-slate-400 font-bold text-xs uppercase">Last Updated</span>
                <span className="font-black text-slate-700">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
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