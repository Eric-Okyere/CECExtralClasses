import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, Phone, GraduationCap, Shield, 
  Loader2, Search, ExternalLink, Calendar, 
  Filter, Edit3, X, Save, User as UserIcon, 
  CheckCircle2, BookOpen, Eye, MessageSquare,
} from "lucide-react";
import { API_BASE_URL } from "../../services/BaseUrl";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "", surname: "", studentFirstName: "",
    studentLastName: "", level: "JHS 1", age: "",
    phoneNumber: "", role: "student"
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}auth/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) { console.error("Fetch error:", error); } 
    finally { setLoading(false); }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      surname: user.surname || "",
      studentFirstName: user.learningProfile?.firstName || "", // Check schema field names
      studentLastName: user.learningProfile?.lastName || "",
      level: user.learningProfile?.level || "JHS 1",
      age: user.learningProfile?.age || "",
      phoneNumber: user.parentDetails?.phoneNumber || "",
      role: user.role || "student"
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}auth/update-profile/${editingUser._id}`, {
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
          parentPhone: editForm.phoneNumber
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u._id === updated._id ? updated : u));
        setEditingUser(null);
      }
    } catch (err) { alert("Update failed"); }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      (user.name?.toLowerCase().includes(search)) || 
      (user.email?.toLowerCase().includes(search));
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 text-sm">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white"><Shield size={24} /></div>
            <h1 className="text-3xl font-black uppercase italic">Management Console</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to={"/all-subjects"}
              className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
            >
              <BookOpen size={16} />
              Manage Subjects
            </Link>

            <Link 
              to={"/manage-lessons"}
              className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
            >
              <BookOpen size={16} />
              Manage Lessons
            </Link>

            {/* Navigation Button to Feedback Dashboard */}
            <Link 
              to={"/admin/feedback"}
              className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-100"
            >
              <MessageSquare size={16} />
              View Feedback
            </Link>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
             <input 
              placeholder="Search..." 
              className="p-4 bg-white rounded-2xl border border-slate-100 outline-none w-full md:w-auto" 
              onChange={(e) => setSearchTerm(e.target.value)} 
             />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-8 py-6">Identity</th>
              <th className="px-6 py-6">Role</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/40 transition-all">
                {/* Role-based Identity rendering */}
                {user.role === "child" || user.role === "student" ? (
                  <td className="px-8 py-6 font-black">
                    {user.name} {user.surname}
                  </td>
                ) : (
                  <td className="px-8 py-6 font-black">
                    {user.name}
                  </td>
                )}

                <td className="px-6 py-6 uppercase font-bold text-[10px] text-blue-600">{user.role}</td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/admin/user/${user._id}`)}
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEditClick(user)} 
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- EDIT MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase italic">Update Member</h2>
              <button onClick={() => setEditingUser(null)}><X /></button>
            </div>
            <div className="space-y-4">
              <input 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" 
                value={editForm.name} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                placeholder="First Name" 
              />
              <input 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" 
                value={editForm.surname} 
                onChange={(e) => setEditForm({...editForm, surname: e.target.value})} 
                placeholder="Surname" 
              />
              <button 
                onClick={handleUpdate} 
                className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs"
              >
                <Save size={18} className="inline mr-2" /> Sync Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}