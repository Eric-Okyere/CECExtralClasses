import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { 
  HiFire, HiPlus, HiChevronRight, HiX, HiSave, HiArrowLeft,
  HiMail, HiPhone, HiUserGroup, HiIdentification, HiAcademicCap
} from "react-icons/hi";
import { API_BASE_URL } from "../services/BaseUrl";

const Loader2 = ({ className }) => (
  <div className={`w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`} />
);

export default function Profile() {
  const [user, setUser] = useState(null); 
  const [loggedInUser, setLoggedInUser] = useState(null); 
  const [children, setChildren] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for the Registration Modal
  const [newChild, setNewChild] = useState({ 
    firstName: "", 
    lastName: "", 
    age: "", 
    level: "" 
  });
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (!storedData) {
      navigate("/login");
      return;
    }

    const parsed = JSON.parse(storedData);
    const me = parsed.user || parsed;
    setLoggedInUser(me);

    const targetId = id || me._id;
    fetchProfile(targetId);
  }, [id, navigate]);

  const fetchProfile = async (targetId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}auth/user/${targetId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setUser(data);
        if (data.role === 'parent') {
          fetchChildren(data._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile");
    }
  };

  const fetchChildren = async (parentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}auth/children/${parentId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setChildren(data);
    } catch (err) {
      console.error("Failed to fetch children");
    }
  };

  const handleAddChild = async () => {
    if (!newChild.firstName || !newChild.lastName || !newChild.level) {
      alert("Please fill in the Student's Name and Level");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}auth/add-child`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          ...newChild, 
          parentId: user._id 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setChildren([...children, data]); 
        setShowAddModal(false); 
        setNewChild({ firstName: "", lastName: "", age: "", level: "" }); 
      } else {
        alert(data.msg || "Error registering student");
      }
    } catch (err) {
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="!border-blue-600 !w-10 !h-10 mb-4" />
      <p className="font-black text-slate-400 text-xs uppercase tracking-widest">Syncing Profile...</p>
    </div>
  );

  const contactEmail = user.role === 'child' ? user.parentId?.email : user.email;
  const contactPhone = user.role === 'child' ? user.parentId?.parentDetails?.phoneNumber : user.parentDetails?.phoneNumber;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-white rounded-[3.5rem] p-2 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="bg-blue-700 rounded-[3rem] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-[2.5rem] rotate-6 scale-105 opacity-20"></div>
                <div className="w-36 h-36 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-[2.5rem] flex items-center justify-center text-blue-900 text-5xl font-black relative z-10 shadow-2xl uppercase">
                  {user.name?.charAt(0)}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                    {user.name} <span className="text-blue-200">{user.surname}</span>
                  </h1>
                  <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {user.role} Profile
                  </span>
                  
                  {/* SWITCH BACK TO PARENT BUTTON (Visible only to child views) */}
                  {user.role === 'child' && (
                    <button 
                      onClick={() => navigate(`/profile/${user.parentId?._id || user.parentId}`)}
                      className="bg-white/10 hover:bg-white/20 transition-all px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 flex items-center gap-2"
                    >
                      <HiArrowLeft size={12}/> View Parent Profile
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                  {/* Contact Info Cards */}
                  <div className="flex items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/5">
                    <div className="bg-white/10 p-2 rounded-xl text-blue-200"><HiMail size={18} /></div>
                    <div className="truncate text-left">
                      <p className="text-[9px] font-black text-blue-300 uppercase tracking-tighter">{user.role === 'child' ? "Parent Email" : "Email"}</p>
                      <p className="text-sm font-bold truncate">{contactEmail || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/5">
                    <div className="bg-white/10 p-2 rounded-xl text-green-300"><HiPhone size={18} /></div>
                    <div className="text-left">
                      <p className="text-[9px] font-black text-blue-300 uppercase tracking-tighter">{user.role === 'child' ? "Emergency" : "Phone"}</p>
                      <p className="text-sm font-bold">{contactPhone ? `+${contactPhone}` : "N/A"}</p>
                    </div>
                  </div>

                  {user.role === 'child' ? (
                    <>
                      <div className="flex items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/5">
                        <div className="bg-white/10 p-2 rounded-xl text-orange-300"><HiAcademicCap size={18} /></div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-blue-300 uppercase tracking-tighter">Grade</p>
                          <p className="text-sm font-bold">{user.learningProfile?.level || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/5">
                        <div className="bg-white/10 p-2 rounded-xl text-yellow-300"><HiFire size={18} /></div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-blue-300 uppercase tracking-tighter">Progress</p>
                          <p className="text-sm font-bold">{user.learningProfile?.xp || 0} XP</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/5">
                        <div className="bg-white/10 p-2 rounded-xl text-orange-300"><HiIdentification size={18} /></div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-blue-300 uppercase tracking-tighter">Role</p>
                          <p className="text-sm font-bold">{user.parentDetails?.relationship || "Guardian"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/5">
                        <div className="bg-white/10 p-2 rounded-xl text-yellow-300"><HiUserGroup size={18} /></div>
                        <div className="text-left">
                          <p className="text-[9px] font-black text-blue-300 uppercase tracking-tighter">Students</p>
                          <p className="text-sm font-bold">{children.length} Enrolled</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MANAGED STUDENTS SECTION (Visible only if user is a parent) --- */}
        {user.role === 'parent' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 px-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Managed Students</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Select a student to view details</p>
              </div>
              
              {/* TRIGGER BUTTON: Only visible to the Parent */}
              {loggedInUser?.role === 'parent' && (
                <button 
                  onClick={() => setShowAddModal(true)} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                  <HiPlus size={18} /> Register Child
                </button>
              )}
            </div>

            <div className="grid gap-4">
              {children.map((child) => (
                <motion.div 
                  key={child._id}
                  whileHover={{ x: 10 }}
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer"
                  onClick={() => navigate(`/profile/${child._id}`)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 rounded-[1.2rem] flex items-center justify-center text-blue-600 text-xl font-black">{child.name?.charAt(0)}</div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase mb-2">{child.name} {child.surname}</h4>
                      <div className="flex gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md">{child.learningProfile?.level}</span>
                        <span className="text-[10px] font-black text-orange-500 uppercase bg-orange-50 px-2 py-1 rounded-md">{child.learningProfile?.xp} XP</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {child.learningProfile?.isPaid ? (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl uppercase tracking-widest">Paid</span>
                    ) : (
                      <span className="text-[10px] font-black bg-red-100 text-red-700 px-3 py-1.5 rounded-xl uppercase tracking-widest">Not Paid</span>
                    )}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <HiChevronRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* --- REGISTRATION MODAL --- */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <HiX size={24}/>
                </button>
                
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <HiAcademicCap size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase italic">Child Enrollment</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all" 
                      placeholder="First Name" 
                      value={newChild.firstName} 
                      onChange={(e) => setNewChild({...newChild, firstName: e.target.value})} 
                    />
                    <input 
                      className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all" 
                      placeholder="Last Name" 
                      value={newChild.lastName} 
                      onChange={(e) => setNewChild({...newChild, lastName: e.target.value})} 
                    />
                  </div>

                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all" 
                    value={newChild.level} 
                    onChange={(e) => setNewChild({...newChild, level: e.target.value})}
                  >
                    <option value="">Select Level</option>
                    <option value="JHS 1">JHS 1</option>
                    <option value="JHS 2">JHS 2</option>
                    <option value="JHS 3">JHS 3</option>
                  </select>

                  <input 
                    type="number" 
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all" 
                    placeholder="Age" 
                    value={newChild.age} 
                    onChange={(e) => setNewChild({...newChild, age: e.target.value})} 
                  />

                  <button 
                    onClick={handleAddChild} 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 mt-6 disabled:opacity-50"
                  >
                    {loading ? <Loader2 /> : <><HiSave size={20}/> Complete Registration</>}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}