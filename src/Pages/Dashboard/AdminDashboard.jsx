import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Added Import
import { 
  Users, Phone, GraduationCap, Shield, 
  Loader2, Search, ExternalLink, Calendar, 
  Filter, Edit3, X, Save, User as UserIcon, 
  CheckCircle2, BookOpen // 2. Added BookOpen Icon
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate(); // 3. Initialized Navigate
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    surname: "",
    studentFirstName: "",
    studentLastName: "",
    level: "JHS 1",
    age: "",
    phoneNumber: "",
    role: "student"
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) { console.error("Fetch error:", error); } finally { setLoading(false); }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      surname: user.surname || "",
      studentFirstName: user.studentProfile?.firstName || "",
      studentLastName: user.studentProfile?.lastName || "",
      level: user.studentProfile?.level || "JHS 1",
      age: user.studentProfile?.age || "",
      phoneNumber: user.parentDetails?.phoneNumber || "",
      role: user.role || "student"
    });
  };

 const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/auth/update-profile/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          surname: editForm.surname,
          role: editForm.role,
          level: editForm.level,
          childFirstName: editForm.studentFirstName, 
          childLastName: editForm.studentLastName,
          childAge: editForm.age,
          parentPhone: editForm.phoneNumber.startsWith('+') 
            ? editForm.phoneNumber 
            : `+${editForm.phoneNumber}` 
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u._id === updated._id ? updated : u));
        setEditingUser(null);
      } else {
        const errorData = await res.json();
        alert(errorData.msg || "Failed to update member.");
      }
    } catch (err) { 
      alert("Connection error. Is the server running?");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.studentProfile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900 text-sm">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg text-white"><Shield size={24} /></div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">Management Console</h1>
              </div>
              <p className="text-slate-400 font-medium uppercase text-[10px] tracking-[0.2em]">Live Database Monitoring</p>
            </div>

            {/* --- 4. NEW: MANAGE LESSONS BUTTON --- */}
            <button 
              onClick={() => navigate("/manage-lessons")}
              className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm active:scale-95"
            >
              <BookOpen size={16} />
              Manage Lessons
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select className="px-6 p-4 bg-white rounded-2xl border border-slate-100 font-bold shadow-sm" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="parent_managed">Parents</option>
            </select>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Search..." className="w-full pl-12 p-4 bg-white rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500/10 font-medium shadow-sm" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-8 py-6">Identity</th>
                <th className="px-6 py-6 text-center">Role</th>
                <th className="px-6 py-6">Academic Profile</th>
                <th className="px-6 py-6 text-center">Age</th>
                <th className="px-6 py-6 text-center">Engagement</th>
                <th className="px-6 py-6">WhatsApp</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/40 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-md">{user.name?.charAt(0)}</div>
                      <div>
                        <p className="font-black text-slate-800">{user.name} {user.surname}</p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${user.role === 'student' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>{user.role === 'student' ? 'Student' : 'Parent'}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2"><GraduationCap size={16} className="text-blue-500" /><span className="font-black text-slate-700">{user.studentProfile?.level || "Unset"}</span></div>
                    {user.studentProfile?.firstName && (
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold uppercase italic"><UserIcon size={12} /> {user.studentProfile.firstName} {user.studentProfile.lastName}</div>
                    )}
                  </td>
                  <td className="px-6 py-6 text-center"><div className="inline-flex items-center justify-center w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 font-black text-slate-700">{user.studentProfile?.age || "—"}</div></td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">{user.xp || 0} XP</span>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(dot => <div key={dot} className={`w-1.5 h-1.5 rounded-full ${dot <= (user.streak || 0) ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-slate-200'}`} />)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <a href={`https://wa.me/${user.parentDetails?.phoneNumber?.replace(/[^0-9]/g, '')}`} target="_blank" className="font-bold text-slate-700 hover:text-blue-600 flex items-center gap-2"><Phone size={14} className="text-green-600" /> {user.parentDetails?.phoneNumber || "No Phone"}</a>
                  </td>
                  <td className="px-8 py-6 text-right"><button onClick={() => handleEditClick(user)} className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"><Edit3 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 uppercase italic">Update Member</h2>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Account Type</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                  <button onClick={() => setEditForm({...editForm, role: 'student'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black ${editForm.role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>STUDENT</button>
                  <button onClick={() => setEditForm({...editForm, role: 'parent_managed'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black ${editForm.role === 'parent_managed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>PARENT</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 ml-1">ACCOUNT HOLDER</label>
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border border-transparent focus:border-blue-500" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} placeholder="First Name" />
                  <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border border-transparent focus:border-blue-500" value={editForm.surname} onChange={(e) => setEditForm({...editForm, surname: e.target.value})} placeholder="Surname" />
                </div>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-black text-blue-600 ml-1 uppercase tracking-widest">Student Profile</label>
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none font-bold border border-transparent focus:border-blue-500" value={editForm.studentFirstName} onChange={(e) => setEditForm({...editForm, studentFirstName: e.target.value})} placeholder="Student First Name" />
                  <input className="w-full p-4 bg-blue-50/50 rounded-2xl outline-none font-bold border border-transparent focus:border-blue-500" value={editForm.studentLastName} onChange={(e) => setEditForm({...editForm, studentLastName: e.target.value})} placeholder="Student Last Name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold appearance-none" value={editForm.level} onChange={(e) => setEditForm({...editForm, level: e.target.value})}><option value="JHS 1">JHS 1</option><option value="JHS 2">JHS 2</option><option value="JHS 3">JHS 3</option></select>
                <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editForm.age} onChange={(e) => setEditForm({...editForm, age: e.target.value})} placeholder="Age" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 ml-1">WHATSAPP</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editForm.phoneNumber} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} />
              </div>
              <button onClick={handleUpdate} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black mt-4 hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"><Save size={18} /> Sync Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}