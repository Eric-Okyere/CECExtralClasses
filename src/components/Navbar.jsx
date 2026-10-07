import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { 
  HiMenu, HiX, HiChevronDown, HiUser, 
  HiLogout, HiViewGrid, HiShieldCheck, HiArrowLeft, HiSwitchHorizontal 
} from "react-icons/hi"; 
import { MdHome, MdSubject } from "react-icons/md";
import { API_BASE_URL } from "../services/BaseUrl";
import Logo from "../assets/Logo.jpeg";
import Avatar from "./Avatar";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [parentData, setParentData] = useState(null); 
  const [linkedChildren, setLinkedChildren] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // --- HELPER LOGOUT METHOD ---
  const performLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("parentSession");
    sessionStorage.removeItem("autoSwitched"); 
    setUser(null);
    setMenuOpen(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  // --- 1. INITIAL SESSION CHECK WITH DATABASE VALIDATION ---
  useEffect(() => {
    const checkUser = async () => {
      const storedData = localStorage.getItem("user");
      const storedParent = localStorage.getItem("parentSession");

      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          const currentUser = parsed.user || parsed;
          const userId = currentUser?._id || currentUser?.id;

          // Step 1: Immediate check for missing ID in localStorage
          if (!userId) {
            performLogout();
            return;
          }

          // Step 2: Validate against backend database to check if user still exists
          const token = localStorage.getItem("token");
          const verifyRes = await fetch(`${API_BASE_URL}auth/user/${userId}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          // If the server returns 404 (Not Found) or 401 (Unauthorized), user was deleted
          if (verifyRes.status === 404 || verifyRes.status === 401) {
            console.warn("User account no longer exists in database. Logging out...");
            performLogout();
            return;
          }

          if (verifyRes.ok) {
            const dbUserData = await verifyRes.json();
            setUser(dbUserData); // Sync state with fresh DB data
          } else {
            // Fallback to cached data if endpoint returns non-404 error (e.g., server glitch)
            setUser(currentUser);
          }

          if (storedParent) {
            setParentData(JSON.parse(storedParent));
          }

          if (currentUser.role === "parent") {
            fetchChildren(userId);
          }
        } catch (err) {
          console.error("Error validating session:", err);
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
    
    if (user?.role === "parent" && linkedChildren.length === 1 && !hasAutoSwitched) {
      sessionStorage.setItem("autoSwitched", "true");
      handleSwitchToChild(linkedChildren[0], true);
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
    if (user.role === 'parent') {
      localStorage.setItem("parentSession", JSON.stringify(user));
      setParentData(user);
    }
    
    localStorage.setItem("user", JSON.stringify(child));
    setUser(child);
    setDropdownOpen(false);
    setMenuOpen(false);

    if (!isAuto) {
      navigate(`/dashboard/${child._id}`);
      window.location.reload(); 
    }
  };

  const handleBackToParent = () => {
    const storedParentString = localStorage.getItem("parentSession");
    
    if (storedParentString) {
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

  // --- 4. LOGOUT WITH CONFIRMATION ---
  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    performLogout();
  };

  const activeStyle = ({ isActive }) => 
    `px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 ${
      isActive 
        ? "text-flame bg-white/10 font-bold" 
        : "text-white/90 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="bg-ink-deep/95 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-50 font-sans shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setMenuOpen(false)}>
          <div className="relative p-0.5 rounded-xl bg-gradient-to-tr from-flame to-flame-deep shadow-sm group-hover:scale-105 transition-transform duration-200">
            <img src={Logo} alt="CEC Logo" className="w-9 h-9 rounded-[10px] object-cover" />
          </div>
          <div className="leading-tight">
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              CEC <span className="text-flame font-black">Extra Classes</span>
            </h1>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center space-x-1 border-r border-white/10 pr-6">
            <NavLink to="/" className={activeStyle}>HOME</NavLink>
            {user && (
              <NavLink to="/subjects" className={activeStyle}>LESSONS</NavLink>
            )}
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-3 pl-2.5 pr-3.5 py-1.5 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-flame/50 ${
                    user.role === 'child' 
                      ? 'bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-950/70' 
                      : 'bg-ink/80 border-white/20 hover:bg-ink'
                  }`}
                >
                  <Avatar
                    src={user.picture}
                    name={user.name}
                    className="w-7 h-7 rounded-full shadow-md"
                    fallbackClassName="bg-gradient-to-tr from-flame to-flame-deep text-ink-deep font-extrabold text-xs"
                  />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-white/65 uppercase tracking-widest leading-none mb-0.5">
                      {user.role}
                    </p>
                    <p className="text-xs font-semibold leading-none truncate max-w-[100px]">
                      {user.name?.split(' ')[0]}
                    </p>
                  </div>
                  <HiChevronDown className={`text-white/65 text-sm transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-flame" : ""}`} />
                </button>

                {/* DESKTOP DROPDOWN MENU */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-ink-deep text-white rounded-2xl shadow-2xl py-2 border border-white/10 animate-in fade-in zoom-in-95 duration-150 overflow-hidden z-50">
                    
                    {/* Return to Parent Option */}
                    {user.role === 'child' && parentData && (
                      <div className="px-2 pt-1 pb-2">
                        <button 
                          onClick={handleBackToParent}
                          className="w-full bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all"
                        >
                          <HiArrowLeft className="text-sm" /> Switch to Parent Session
                        </button>
                      </div>
                    )}

                    {/* Account Header */}
                    <div className="px-4 py-3 bg-ink/40 border-y border-white/10 mb-1">
                      <p className="text-[10px] font-extrabold text-white/65 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{user.name}</p>
                    </div>

                    {/* Parent Quick Switcher */}
                    {user.role === "parent" && linkedChildren.length > 0 && (
                      <div className="px-3 py-2 my-1">
                        <p className="text-[10px] font-extrabold text-white/65 uppercase px-2 mb-1.5 tracking-wider flex items-center gap-1.5">
                          <HiSwitchHorizontal className="text-flame" /> Switch Learner
                        </p>
                        <div className="space-y-1">
                          {linkedChildren.map((child) => (
                            <button
                              key={child._id}
                              onClick={() => handleSwitchToChild(child, false)}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-ink rounded-xl transition-colors text-left group"
                            >
                              <div className="w-6 h-6 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg flex items-center justify-center text-xs font-bold group-hover:bg-emerald-500 group-hover:text-ink-deep transition-colors">
                                {child.name.charAt(0)}
                              </div>
                              <span className="text-xs font-semibold text-white/80 group-hover:text-white truncate">{child.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation Menu Links */}
                    <div className="py-1">
                      <Link 
                        to={`/dashboard/${user._id}`} 
                        onClick={() => setDropdownOpen(false)} 
                        className="flex items-center gap-3 px-4 py-2 hover:bg-ink text-xs font-medium text-white/80 hover:text-white transition-colors"
                      >
                        <HiViewGrid className="text-base text-flame" /> Dashboard
                      </Link>

                      <Link 
                        to={`/profile/${user._id}`} 
                        onClick={() => setDropdownOpen(false)} 
                        className="flex items-center gap-3 px-4 py-2 hover:bg-ink text-xs font-medium text-white/80 hover:text-white transition-colors"
                      >
                        <HiUser className="text-base text-flame" /> My Profile
                      </Link>

                      {user.admin && (
                        <Link 
                          to="/admindashboard" 
                          onClick={() => setDropdownOpen(false)} 
                          className="flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                          <HiShieldCheck className="text-base" /> Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-white/10 pt-1 mt-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors"
                      >
                        <HiLogout className="text-base" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink to="/login" className="text-xs font-bold text-white/80 hover:text-white px-3 py-1.5 transition-colors">
                Login
              </NavLink>
              <Link 
                to="/login" 
                className="bg-flame text-ink-deep hover:bg-[#f59a33] px-4 py-1.5 rounded-lg text-xs font-black shadow-md transition-all duration-200"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE BUTTON */}
        <button 
          className="md:hidden p-2 rounded-xl text-white/80 hover:text-white hover:bg-ink focus:outline-none transition-colors" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      <div className={`md:hidden transition-all duration-300 ease-in-out bg-ink-deep border-b border-white/10 overflow-hidden ${menuOpen ? "max-h-[85vh] overflow-y-auto" : "max-h-0"}`}>
        <div className="p-4 space-y-4">
          {user ? (
            <>
              {/* Mobile Profile Card */}
              <div className="flex items-center justify-between p-3 bg-ink/80 rounded-xl border border-white/15">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.picture}
                    name={user.name}
                    className="w-10 h-10 rounded-full shadow-sm"
                    fallbackClassName="bg-flame text-ink-deep font-black text-sm"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] font-semibold text-flame uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>
              </div>

              {/* Back to Parent Action Card */}
              {user.role === 'child' && parentData && (
                <button 
                  onClick={handleBackToParent}
                  className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-400 p-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-colors"
                >
                  <HiArrowLeft /> Return to Parent Session
                </button>
              )}

              {/* Primary Links */}
              <div className="space-y-1">
                <NavLink to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white font-medium text-xs hover:bg-ink rounded-xl transition-colors">
                  <MdHome className="text-base text-flame" /> Home
                </NavLink>
                <NavLink to="/subjects" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white font-medium text-xs hover:bg-ink rounded-xl transition-colors">
                  <MdSubject className="text-base text-flame" /> Lessons
                </NavLink>
                <Link to={`/dashboard/${user._id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white font-medium text-xs hover:bg-ink rounded-xl transition-colors">
                  <HiViewGrid className="text-base text-flame" /> Dashboard
                </Link>
                <Link to={`/profile/${user._id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-white/80 hover:text-white font-medium text-xs hover:bg-ink rounded-xl transition-colors">
                  <HiUser className="text-base text-flame" /> My Profile
                </Link>
                {user.admin && (
                  <Link to="/admindashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-red-400 font-bold text-xs hover:bg-red-500/10 rounded-xl transition-colors">
                    <HiShieldCheck className="text-base" /> Admin Panel
                  </Link>
                )}
              </div>

              {/* Mobile Quick Learner Switcher */}
              {user.role === "parent" && linkedChildren.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[10px] font-extrabold text-white/65 uppercase tracking-wider px-2 mb-2">Switch Learner</p>
                  <div className="space-y-1">
                    {linkedChildren.map((child) => (
                      <button
                        key={child._id}
                        onClick={() => handleSwitchToChild(child, false)}
                        className="w-full flex items-center gap-3 px-3 py-2 bg-ink/40 hover:bg-ink rounded-xl transition-colors text-left"
                      >
                        <div className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-xs font-bold">
                          {child.name.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-white/80">{child.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-2">
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-400 font-bold text-xs hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                >
                  <HiLogout className="text-base" /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <NavLink to="/" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-white/80 font-medium text-xs">Home</NavLink>
              <NavLink to="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-white/80 font-medium text-xs">Login</NavLink>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="bg-flame text-ink-deep text-center py-2.5 rounded-xl font-black text-xs shadow-md">
                Register / Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}