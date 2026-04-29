import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { 
  HiMenu, HiX, HiChevronDown, HiUser, 
  HiLogout, HiViewGrid, HiShieldCheck, HiArrowLeft 
} from "react-icons/hi"; 
import { API_BASE_URL } from "../services/BaseUrl";
import Logo from "../assets/Logo.jpeg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [parentData, setParentData] = useState(null); // To store the original parent session
  const [linkedChildren, setLinkedChildren] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkUser = () => {
      const storedData = localStorage.getItem("user");
      const storedParent = localStorage.getItem("parentSession");

      if (storedData) {
        const parsed = JSON.parse(storedData);
        const currentUser = parsed.user || parsed;
        setUser(currentUser);

        // Keep track of the actual parent if we are currently switched to a child
        if (storedParent) {
          setParentData(JSON.parse(storedParent));
        }

        // Only fetch children if the current active user is a parent
        if (currentUser.role === "parent") {
          fetchChildren(currentUser._id);
        }
      }
    };

    checkUser();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("storage", checkUser);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("storage", checkUser);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchChildren = async (parentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}auth/children/${parentId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setLinkedChildren(data);
    } catch (err) {
      console.error("Error fetching linked accounts:", err);
    }
  };

  // --- SWITCH TO CHILD ---
  const handleSwitchToChild = (child) => {
    // Save the current parent (if not already acting as a child)
    if (user.role === 'parent') {
      localStorage.setItem("parentSession", JSON.stringify(user));
    }
    
    localStorage.setItem("user", JSON.stringify(child));
    setDropdownOpen(false);
    navigate("/dashboard");
    window.location.reload(); 
  };

  // --- SWITCH BACK TO PARENT ---
  const handleBackToParent = () => {
    const storedParent = localStorage.getItem("parentSession");
    if (storedParent) {
      localStorage.setItem("user", storedParent);
      localStorage.removeItem("parentSession"); // Clear the temporary session
      setDropdownOpen(false);
      navigate("/dashboard");
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("parentSession");
    setUser(null);
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  const activeStyle = ({ isActive }) => 
    `transition duration-300 ${isActive ? "text-yellow-400 font-bold" : "hover:text-yellow-200"}`;

  return (
    <nav className="bg-blue-700 text-white shadow-xl sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <img src={Logo} alt="CEC Logo" className="w-10 h-10 rounded-lg object-cover" />
          <div className="hidden sm:block leading-none">
            <h1 className="font-black text-lg uppercase italic tracking-tighter">
              CEC <span className="text-yellow-400">Classes</span>
            </h1>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center space-x-8 text-xs font-black uppercase tracking-widest">
          <NavLink to="/" className={activeStyle}>Home</NavLink>
          
          {user ? (
            <div className="flex items-center gap-6">
              <NavLink to="/subjects" className={activeStyle}>Subjects</NavLink>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-2xl border transition-all ${
                    user.role === 'child' ? 'bg-emerald-600/50 border-emerald-400' : 'bg-blue-800/50 border-white/10'
                  }`}
                >
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-black shadow-inner">
                    {user.name?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black opacity-60 leading-none mb-0.5">{user.role}</p>
                    <p className="normal-case font-bold tracking-normal leading-none">
                      {user.name?.split(' ')[0]}
                    </p>
                  </div>
                  <HiChevronDown className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* DROPDOWN */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl py-4 text-slate-800 border border-slate-100 animate-in fade-in zoom-in duration-200 overflow-hidden">
                    
                    {/* Switch back to parent option (if currently a child) */}
                    {user.role === 'child' && parentData && (
                      <div className="px-3 pb-3 border-b border-slate-50 mb-2">
                        <button 
                          onClick={handleBackToParent}
                          className="w-full bg-blue-50 text-blue-700 p-3 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all"
                        >
                          <HiArrowLeft /> Back to {parentData.name.split(' ')[0]}
                        </button>
                      </div>
                    )}

                    <div className="px-6 py-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Account</p>
                      <p className="text-xs font-black text-blue-700 truncate">{user.email || user.role}</p>
                    </div>

                    {/* ACCOUNT SWITCHING LIST (Parent Only) */}
                    {user.role === "parent" && linkedChildren.length > 0 && (
                      <div className="px-4 py-2 mt-2 bg-slate-50/50">
                        <p className="text-[9px] font-black text-slate-400 uppercase px-2 mb-2 tracking-widest">Switch Student</p>
                        <div className="space-y-1">
                          {linkedChildren.map((child) => (
                            <button
                              key={child._id}
                              onClick={() => handleSwitchToChild(child)}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-left group"
                            >
                              <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-[11px] font-black group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                {child.name.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-600">{child.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="h-[1px] bg-slate-100 my-2" />

                    {/* NAV LINKS */}
                    <div className="space-y-0.5">
                      <Link to={`/dashboard/${user._id}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-6 py-2.5 hover:bg-slate-50 text-xs font-bold transition-colors">
                        <HiViewGrid size={18} className="text-blue-600" /> Dashboard
                      </Link>

                      <Link to={`/profile/${user._id}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-6 py-2.5 hover:bg-slate-50 text-xs font-bold transition-colors">
                        <HiUser size={18} className="text-blue-600" /> My Profile
                      </Link>

                      {user.admin && (
                        <Link to="/admindashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-6 py-2.5 hover:bg-red-50 text-red-600 font-black text-xs transition-colors">
                          <HiShieldCheck size={18} /> Admin Panel
                        </Link>
                      )}
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-6 py-3 mt-2 text-red-500 hover:bg-red-50 font-black text-xs transition-colors border-t border-slate-100"
                    >
                      <HiLogout size={18} /> Logout Session
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink to="/login" className="hover:text-yellow-400 transition-colors">Login</NavLink>
              <Link to="/register" className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-xl font-black shadow-lg hover:scale-105 transition-all">
                Join
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-3xl" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-blue-800 ${menuOpen ? "max-h-screen border-t border-white/10" : "max-h-0"}`}>
        <div className="flex flex-col p-8 space-y-6 font-black uppercase tracking-widest text-sm">
          {user?.role === 'child' && parentData && (
             <button onClick={handleBackToParent} className="bg-white/10 p-4 rounded-2xl flex items-center gap-2">
               <HiArrowLeft /> Switch back to {parentData.name.split(' ')[0]}
             </button>
          )}
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          {user ? (
            <>
              <NavLink to="/subjects" onClick={() => setMenuOpen(false)}>Subjects</NavLink>
              <NavLink to={`/dashboard/${user._id}`} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to={`/profile/${user._id}`} onClick={() => setMenuOpen(false)}>My Profile</NavLink>
              {user.admin && <NavLink to="/admindashboard" onClick={() => setMenuOpen(false)} className="text-red-400">Admin</NavLink>}
              <button onClick={handleLogout} className="bg-red-500 text-white py-4 rounded-2xl shadow-xl">Logout Session</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-yellow-400 text-blue-900 py-4 rounded-2xl text-center">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}