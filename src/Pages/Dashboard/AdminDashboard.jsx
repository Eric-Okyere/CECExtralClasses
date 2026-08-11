import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, Phone, GraduationCap, Shield, 
  Loader2, Search, ExternalLink, Calendar, 
  Filter, Edit3, X, Save, User as UserIcon, 
  CheckCircle2, BookOpen, Eye, MessageSquare, Trash2
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
    name: "",
    surname: "",
    email: "",
    role: "learner",
    level: "Basic 7",
    age: "",
    phoneNumber: "",
    isVerified: true,
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
      email: user.email || "",
      role: user.role || "learner",
      level: user.learningProfile?.level || "Basic 7",
      age: user.learningProfile?.age || "",
      phoneNumber: user.parentDetails?.phoneNumber || "",
      isVerified: user.isVerified ?? true,
    });
  };

  const handleUpdate = async () => {
    try {
      // Calling the dedicated admin update endpoint
      const res = await fetch(`${API_BASE_URL}auth/update-user/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          surname: editForm.surname,
          email: editForm.email,
          role: editForm.role,
          level: editForm.level,
          age: editForm.age,
          phoneNumber: editForm.phoneNumber,
          isVerified: editForm.isVerified,
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
        setEditingUser(null);
      } else {
        const errorData = await res.json();
        alert(errorData.msg || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed. Please check connection.");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${userName || "this user"}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}auth/user/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
      } else {
        const errorData = await response.json();
        alert(errorData.msg || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("An error occurred while deleting the user.");
    }
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
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                      title="View Profile"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEditClick(user)} 
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                      title="Edit User"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user._id, user.name)} 
                      className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- EXPANDED FULL USER EDIT MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase italic">Edit Profile</h2>
                <p className="text-xs text-slate-400 font-bold">Update member records and access controls</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">First Name</label>
                  <input 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                    placeholder="First Name" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Surname</label>
                  <input 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" 
                    value={editForm.surname} 
                    onChange={(e) => setEditForm({...editForm, surname: e.target.value})} 
                    placeholder="Surname" 
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                  placeholder="Email Address" 
                />
              </div>

              {/* Role & Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Account Role</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  >
                    <option value="learner">Learner / Student</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Academic Level</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    value={editForm.level}
                    onChange={(e) => setEditForm({...editForm, level: e.target.value})}
                  >
                    <option value="Basic 7">Basic 7</option>
                    <option value="Basic 8">Basic 8</option>
                    <option value="Basic 9">Basic 9</option>
                  </select>
                </div>
              </div>

              {/* Age & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Age</label>
                  <input 
                    type="number"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" 
                    value={editForm.age} 
                    onChange={(e) => setEditForm({...editForm, age: e.target.value})} 
                    placeholder="Age" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="tel"
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500" 
                    value={editForm.phoneNumber} 
                    onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} 
                    placeholder="Phone Number" 
                  />
                </div>
              </div>

              {/* Account Status / Verified Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-slate-800 text-xs">Email Verified</p>
                  <p className="text-[10px] text-slate-400 font-medium">Grant account verified status</p>
                </div>
                <input 
                  type="checkbox"
                  checked={editForm.isVerified}
                  onChange={(e) => setEditForm({...editForm, isVerified: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleUpdate} 
                className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-wider shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all mt-4 flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}