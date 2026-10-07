import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Shield, Loader2, Search, Edit3, X, Save, 
  BookOpen, Eye, MessageSquare, Trash2, ShieldCheck, ShieldAlert, 
  Users, GraduationCap, UserCheck, Baby 
} from "lucide-react";
import { API_BASE_URL } from "../../services/BaseUrl";
import Avatar from "../../components/Avatar";
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
    admin: false,
  });

  // Level mapping dictionary
  const levelToBackendMap = {
    "Basic 7": "JHS 1",
    "Basic 8": "JHS 2",
    "Basic 9": "JHS 3",
  };

  const levelToFrontendMap = {
    "JHS 1": "Basic 7",
    "JHS 2": "Basic 8",
    "JHS 3": "Basic 9",
  };

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}auth/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) { 
      console.error("Fetch error:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleEditClick = (user) => {
    const rawLevel = user.learningProfile?.level || user.level || "Basic 7";
    const displayLevel = levelToFrontendMap[rawLevel] || rawLevel;

    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      surname: user.surname || "",
      email: user.email || "",
      role: user.role || "learner",
      level: displayLevel,
      age: user.learningProfile?.age || user.age || "",
      phoneNumber: user.parentDetails?.phoneNumber || user.phoneNumber || "",
      isVerified: user.isVerified ?? true,
      admin: user.admin ?? false,
    });
  };

  const handleUpdate = async () => {
    try {
      const backendLevel = levelToBackendMap[editForm.level] || editForm.level;

      const res = await fetch(`${API_BASE_URL}auth/adminupdate-user/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          surname: editForm.surname,
          email: editForm.email,
          role: editForm.role,
          level: backendLevel,
          age: editForm.age,
          phoneNumber: editForm.phoneNumber,
          isVerified: editForm.isVerified,
          admin: editForm.admin,
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

  const handleQuickToggleAdmin = async (userId, currentAdminStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}auth/toggle-admin/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin: !currentAdminStatus }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
      } else {
        alert("Failed to toggle admin status.");
      }
    } catch (error) {
      console.error("Toggle error:", error);
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

  const formatFullName = (name, surname) => {
    if (!name) return surname || "";
    if (!surname) return name;
    
    if (name.trim().toLowerCase().endsWith(surname.trim().toLowerCase())) {
      return name;
    }
    return `${name} ${surname}`.trim();
  };

  // Helper to format level display for learners & children
  const getUserDisplayLevel = (user) => {
    if (user.role !== "learner" && user.role !== "child") {
      return "—";
    }
    const rawLevel = user.learningProfile?.level || user.level;
    if (!rawLevel) return "Not set";
    return levelToFrontendMap[rawLevel] || rawLevel;
  };

  const totalUsers = users.length;
  const learnerCount = users.filter((u) => u.role === "learner").length;
  const parentCount = users.filter((u) => u.role === "parent").length;
  const childCount = users.filter((u) => u.role === "child").length;

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const fullName = formatFullName(user.name, user.surname).toLowerCase();
    const matchesSearch =
      fullName.includes(search) ||
      user.email?.toLowerCase().includes(search);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-10 text-sm">
        {/* HEADER & CONTROLS */}
        <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase italic">Management Console</h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Overview of users and platform administration
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <Link
                to={"/all-subjects"}
                className="flex items-center justify-center gap-2 px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
              >
                <BookOpen size={16} />
                Manage Subjects
              </Link>

              <Link
                to={"/manage-lessons"}
                className="flex items-center justify-center gap-2 px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
              >
                <BookOpen size={16} />
                Manage Lessons
              </Link>

              <Link
                to={"/admin/feedback"}
                className="flex items-center justify-center gap-2 px-4 py-3.5 sm:px-6 sm:py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-100"
              >
                <MessageSquare size={16} />
                View Feedback
              </Link>
            </div>
          </div>

          {/* STATS COUNTER CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <button
              onClick={() => setFilterRole("all")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                filterRole === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-slate-800 border-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[10px] font-black uppercase tracking-wider ${filterRole === "all" ? "text-blue-100" : "text-slate-400"}`}>
                  All Users
                </p>
                <Users size={18} className={filterRole === "all" ? "text-white" : "text-blue-600"} />
              </div>
              <p className="text-2xl font-black">{totalUsers}</p>
            </button>

            <button
              onClick={() => setFilterRole("learner")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                filterRole === "learner"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200"
                  : "bg-white text-slate-800 border-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[10px] font-black uppercase tracking-wider ${filterRole === "learner" ? "text-emerald-100" : "text-slate-400"}`}>
                  Learners
                </p>
                <GraduationCap size={18} className={filterRole === "learner" ? "text-white" : "text-emerald-600"} />
              </div>
              <p className="text-2xl font-black">{learnerCount}</p>
            </button>

            <button
              onClick={() => setFilterRole("parent")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                filterRole === "parent"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                  : "bg-white text-slate-800 border-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[10px] font-black uppercase tracking-wider ${filterRole === "parent" ? "text-purple-100" : "text-slate-400"}`}>
                  Parents
                </p>
                <UserCheck size={18} className={filterRole === "parent" ? "text-white" : "text-purple-600"} />
              </div>
              <p className="text-2xl font-black">{parentCount}</p>
            </button>

            <button
              onClick={() => setFilterRole("child")}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                filterRole === "child"
                  ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200"
                  : "bg-white text-slate-800 border-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[10px] font-black uppercase tracking-wider ${filterRole === "child" ? "text-amber-100" : "text-slate-400"}`}>
                  Children
                </p>
                <Baby size={18} className={filterRole === "child" ? "text-white" : "text-amber-600"} />
              </div>
              <p className="text-2xl font-black">{childCount}</p>
            </button>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                placeholder="Search by name or email..."
                className="p-4 pl-11 bg-white rounded-2xl border border-slate-100 outline-none w-full shadow-sm focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">
                Showing {filteredUsers.length} of {totalUsers} results
              </span>
              {filterRole !== "all" && (
                <button
                  onClick={() => setFilterRole("all")}
                  className="text-xs font-bold text-blue-600 hover:underline ml-2"
                >
                  Clear Role Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* USERS TABLE CONTAINER */}
        <div className="max-w-7xl mx-auto bg-white rounded-3xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 sm:px-8 py-5 sm:py-6">Identity</th>
                <th className="px-4 sm:px-6 py-5 sm:py-6">Role</th>
                <th className="px-4 sm:px-6 py-5 sm:py-6">Academic Level</th>
                <th className="px-4 sm:px-6 py-5 sm:py-6">Admin Access</th>
                <th className="px-6 sm:px-8 py-5 sm:py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-medium">
                    No users found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/40 transition-all">
                    <td className="px-6 sm:px-8 py-5 sm:py-6 font-black text-slate-800">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.picture}
                          name={user.name}
                          className="w-10 h-10 rounded-xl"
                          fallbackClassName="bg-indigo-50 text-indigo-600 font-black text-sm"
                        />
                        <div>
                          <p>{formatFullName(user.name, user.surname)}</p>
                          <p className="text-[11px] font-normal text-slate-400 break-all">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-5 sm:py-6 uppercase font-bold text-[10px] text-blue-600 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[9px] ${
                        user.role === "learner"
                          ? "bg-emerald-50 text-emerald-700"
                          : user.role === "parent"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* ACADEMIC LEVEL COLUMN */}
                    <td className="px-4 sm:px-6 py-5 sm:py-6 whitespace-nowrap font-bold text-xs text-slate-700">
                      {user.role === "learner" || user.role === "child" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs">
                          {getUserDisplayLevel(user)}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-normal">—</span>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-5 sm:py-6 whitespace-nowrap">
                      <button
                        onClick={() => handleQuickToggleAdmin(user._id, user.admin)}
                        title="Click to toggle admin permission"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                          user.admin
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {user.admin ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                        {user.admin ? "Admin" : "User"}
                      </button>
                    </td>

                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/user/${user._id}`)}
                          className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2.5 sm:p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                          title="Edit User"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="p-2.5 sm:p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* EDIT USER MODAL */}
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-3 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase italic">Edit Profile</h2>
                  <p className="text-xs text-slate-400 font-bold">
                    Update member records and access controls
                  </p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      First Name
                    </label>
                    <input
                      className="w-full p-3.5 sm:p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      Surname
                    </label>
                    <input
                      className="w-full p-3.5 sm:p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      value={editForm.surname}
                      onChange={(e) => setEditForm({ ...editForm, surname: e.target.value })}
                      placeholder="Surname"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full p-3.5 sm:p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Email Address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      Account Role
                    </label>
                    <select
                      className="w-full p-3.5 sm:p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    >
                      <option value="learner">Learner / Student</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      Academic Level
                    </label>
                    <select
                      className="w-full p-3.5 sm:p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      value={editForm.level}
                      onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                    >
                      <option value="Basic 7">Basic 7</option>
                      <option value="Basic 8">Basic 8</option>
                      <option value="Basic 9">Basic 9</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      className="w-full p-3.5 sm:p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full p-3.5 sm:p-4 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-800 text-xs">Email Verified</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Grant account verified status
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editForm.isVerified}
                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50/60 border border-amber-100 rounded-2xl">
                  <div>
                    <p className="font-bold text-amber-900 text-xs">Administrator Privilege</p>
                    <p className="text-[10px] text-amber-600 font-medium">
                      Grant full administrative rights
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={editForm.admin}
                    onChange={(e) => setEditForm({ ...editForm, admin: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  className="w-full bg-blue-600 text-white py-4 sm:py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-wider shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer"
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