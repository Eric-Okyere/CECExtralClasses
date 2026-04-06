import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiFire, HiLightningBolt, HiUser, HiMail, HiAcademicCap, HiTrash, HiPencilAlt } from "react-icons/hi";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setUser(parsed.user || parsed);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you absolutely sure? This will permanently delete your learning progress and account data.")) {
      try {
        // Replace with your actual API call: await deleteUserAccount(user._id);
        localStorage.clear();
        navigate("/register");
      } catch (err) {
        alert("Error deleting account. Please try again.");
      }
    }
  };

  if (!user) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-blue-700 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative">
            {user.picture ? (
              <img src={user.picture} alt="Profile" className="w-32 h-32 rounded-3xl border-4 border-white/20 object-cover shadow-lg" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-32 h-32 bg-yellow-400 rounded-3xl flex items-center justify-center text-blue-900 text-4xl font-black shadow-lg">
                {user.name?.charAt(0)}
              </div>
            )}
            {user.admin && (
              <span className="absolute -bottom-2 -right-2 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-md">Admin</span>
            )}
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black uppercase tracking-tight">{user.name}</h1>
            <p className="text-blue-200 font-medium">{user.email}</p>
            
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                <HiFire className="text-orange-400 text-xl" />
                <span className="font-bold">{user.streak || 0} Day Streak</span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                <HiLightningBolt className="text-yellow-400 text-xl" />
                <span className="font-bold">{user.xp || 0} XP</span>
              </div>
            </div>
          </div>

          <button className="bg-white text-blue-700 p-3 rounded-2xl hover:bg-yellow-400 transition-all shadow-lg active:scale-95">
            <HiPencilAlt size={24} />
          </button>
        </div>

        {/* --- DETAILS GRID --- */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          
          {/* Student Profile Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
              <HiAcademicCap className="text-blue-600 text-lg" /> Academic Profile
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold">Student Full Name</label>
                <p className="font-bold text-slate-800">{user.studentProfile?.firstName || user.name} {user.studentProfile?.lastName || user.surname}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold">Class/Level</label>
                  <p className="font-bold text-slate-800">{user.studentProfile?.level || "Not Set"}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold">Age</label>
                  <p className="font-bold text-slate-800">{user.studentProfile?.age || "Not Set"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Parental/Account Details Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
              <HiUser className="text-blue-600 text-lg" /> Account Context
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold">Role</label>
                <p className="font-bold text-blue-600 uppercase text-sm">{user.role?.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold">Parent Contact</label>
                <p className="font-bold text-slate-800">{user.parentDetails?.phoneNumber || "No contact provided"}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- DANGER ZONE --- */}
        {/* <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-red-700 font-black uppercase text-sm">Danger Zone</h4>
              <p className="text-red-600/70 text-xs font-medium">Permanently remove your account and all associated data.</p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
            >
              <HiTrash /> Delete Account
            </button>
          </div>
        </div> */}

      </div>
    </div>
  );
}