import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { 
  HiMenu, HiX, HiChevronDown, HiUser, 
  HiLogout, HiViewGrid, HiShieldCheck, HiArrowLeft 
} from "react-icons/hi"; 
import { MdHome, MdSubject } from "react-icons/md";
import { API_BASE_URL } from "../services/BaseUrl";
import Logo from "../assets/Logo.jpeg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [parentData, setParentData] = useState(null); 
  const [linkedChildren, setLinkedChildren] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // --- 1. INITIAL SESSION CHECK ---
  useEffect(() => {
    const checkUser = () => {
      const storedData = localStorage.getItem("user");
      const storedParent = localStorage.getItem("parentSession");

      if (storedData) {
        const parsed = JSON.parse(storedData);
        const currentUser = parsed.user || parsed;
        setUser(currentUser);

        if (storedParent) {
          setParentData(JSON.parse(storedParent));
        }

        // Fetch children only if the active session is a parent
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

  // --- 2. SILENT AUTO-SWITCH LOGIC ---
  useEffect(() => {
    const hasAutoSwitched = sessionStorage.getItem("autoSwitched");
    
    // If user is parent with exactly 1 child and hasn't auto-switched yet this session
    if (user?.role === "parent" && linkedChildren.length === 1 && !hasAutoSwitched) {
      sessionStorage.setItem("autoSwitched", "true");
      handleSwitchToChild(linkedChildren[0], true); // true = isAuto (Silent)
    }
  }, [user, linkedChildren]);

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

  // --- 3. SWITCHING LOGIC ---
  const handleSwitchToChild = (child, isAuto = false) => {
    // 1. Save parent session if we are moving from parent to child
    if (user.role === 'parent') {
      localStorage.setItem("parentSession", JSON.stringify(user));
      setParentData(user);
    }
    
    // 2. Update Storage
    localStorage.setItem("user", JSON.stringify(child));
    
    // 3. Update State immediately for Navbar UI
    setUser(child);
    setDropdownOpen(false);

    // 4. Navigation Control
    if (!isAuto) {
      // Manual switch: Go to dashboard and reload
      navigate(`/dashboard/${child._id}`);
      window.location.reload(); 
    } else {
      // Silent switch: Just log to console, stay on current page (e.g., Home)
      console.log("Automatically switched to Learner profile silently.");
    }
  };

  const handleBackToParent = () => {
    const storedParentString = localStorage.getItem("parentSession");
    
    if (storedParentString) {
      // Set flag so auto-switch doesn't trigger immediately again
      sessionStorage.setItem("autoSwitched", "true");
      
      localStorage.setItem("user", storedParentString);
      localStorage.removeItem("parentSession"); 
      
      setDropdownOpen(false);
      setMenuOpen(false);

      const storedParent = JSON.parse(storedParentString);
      const parentId = storedParent._id || storedParent.user?._id;
      
      if (parentId) navigate(`/profile/${parentId}`);
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("parentSession");
    sessionStorage.removeItem("autoSwitched"); 
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
                    <p className="text-[10px] font-black opacity-60 leading-none mb-0.5 uppercase tracking-tighter">{user.role}</p>
                    <p className="normal-case font-bold tracking-normal leading-none">
                      {user.name?.split(' ')[0]}
                    </p>
                  </div>
                  <HiChevronDown className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* DROPDOWN */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl py-4 text-slate-800 border border-slate-100 animate-in fade-in zoom-in duration-200 overflow-hidden">
                    
                    {user.role === 'child' && parentData && (
                      <div className="px-3 pb-3 border-b border-slate-50 mb-2">
                        <button 
                          onClick={handleBackToParent}
                          className="w-full bg-blue-50 text-blue-700 p-3 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all"
                        >
                          <HiArrowLeft /> Back to Parent Session
                        </button>
                      </div>
                    )}

                    <div className="px-6 py-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged in as</p>
                      <p className="text-xs font-black text-blue-700 truncate">{user.name}</p>
                    </div>

                    {user.role === "parent" && linkedChildren.length > 0 && (
                      <div className="px-4 py-2 mt-2 bg-slate-50/50">
                        <p className="text-[9px] font-black text-slate-400 uppercase px-2 mb-2 tracking-widest">Quick Switch</p>
                        <div className="space-y-1">
                          {linkedChildren.map((child) => (
                            <button
                              key={child._id}
                              onClick={() => handleSwitchToChild(child, false)}
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
                      <HiLogout size={18} /> Logout
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
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-white ${menuOpen ? "max-h-screen border-t border-slate-100" : "max-h-0"}`}>
        <div className="flex flex-col p-8 space-y-4">
          {user ? (
            <>
              <NavLink to="/" onClick={() => setMenuOpen(false)} className="text-slate-800 font-black uppercase text-xs">Home</NavLink>
              <NavLink to="/subjects" onClick={() => setMenuOpen(false)} className="text-slate-800 font-black uppercase text-xs">Subjects</NavLink>
              <div className="h-[1px] bg-slate-100" />
              <Link to={`/dashboard/${user._id}`} onClick={() => setMenuOpen(false)} className="text-blue-600 font-black uppercase text-xs">Dashboard</Link>
              <button onClick={handleLogout} className="text-red-500 font-black uppercase text-xs text-left">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)} className="text-slate-800 font-black uppercase text-xs">Login</NavLink>
              <NavLink to="/register" onClick={() => setMenuOpen(false)} className="text-blue-600 font-black uppercase text-xs">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}