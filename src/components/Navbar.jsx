import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { 
  HiMenu, HiX, HiChevronDown, HiUser, 
  HiLogout, HiViewGrid, HiShieldCheck, HiCog 
} from "react-icons/hi"; 
import { API_BASE_URL } from "../services/BaseUrl";
import Logo from "../assets/Logo.jpeg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [linkedChildren, setLinkedChildren] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkUser = () => {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const currentUser = parsed.user || parsed;
        setUser(currentUser);

        // Fetch children if parent is logged in
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
      const res = await fetch(`${API_BASE_URL}auth/children/${parentId}`);
      const data = await res.json();
      if (res.ok) setLinkedChildren(data);
    } catch (err) {
      console.error("Error fetching linked accounts:", err);
    }
  };

  const handleSwitchAccount = (child) => {
    localStorage.setItem("user", JSON.stringify(child));
    setUser(child);
    setDropdownOpen(false);
    navigate("/dashboard");
    window.location.reload(); 
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
                  className="flex items-center gap-2 bg-blue-800/50 pl-2 pr-4 py-1.5 rounded-2xl border border-white/10 hover:bg-blue-900 transition-all"
                >
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-black">
                    {user.name?.charAt(0)}
                  </div>
                  <span className="normal-case font-bold tracking-normal">
                    {user.name?.split(' ')[0]}
                  </span>
                  <HiChevronDown className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* DROPDOWN */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl py-4 text-slate-800 border border-slate-100 animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-2 border-b border-slate-50 mb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-xs font-black text-blue-700 truncate">{user.email || user.role}</p>
                    </div>

                    {/* ACCOUNT SWITCHING */}
                    {user.role === "parent" && linkedChildren.length > 0 && (
                      <div className="px-4 py-2">
                        <p className="text-[9px] font-black text-slate-300 uppercase px-2 mb-2 tracking-tighter">Switch Account</p>
                        {linkedChildren.map((child) => (
                          <button
                            key={child._id}
                            onClick={() => handleSwitchAccount(child)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-xl transition-colors text-left"
                          >
                            <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black">{child.name.charAt(0)}</div>
                            <span className="text-xs font-bold text-slate-600">{child.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="h-[1px] bg-slate-50 my-2" />

                    {/* NAVIGATION LINKS */}
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-6 py-2 hover:bg-slate-50 text-xs font-bold transition-colors">
                      <HiViewGrid size={18} className="text-blue-600" /> Dashboard
                    </Link>

                    {/* THE PROFILE BUTTON */}
                    <Link to={`/profile/${user._id}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-6 py-2 hover:bg-slate-50 text-xs font-bold transition-colors">
                      <HiUser size={18} className="text-blue-600" /> My Profile
                    </Link>

                    {user.admin && (
                      <Link to="/admindashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-6 py-2 hover:bg-red-50 text-red-600 font-black text-xs transition-colors">
                        <HiShieldCheck size={18} /> Admin Panel
                      </Link>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-6 py-2 mt-2 text-red-500 hover:bg-red-50 font-black text-xs transition-colors border-t border-slate-50 pt-4"
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
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-blue-800 ${menuOpen ? "max-h-screen border-t border-white/10" : "max-h-0"}`}>
        <div className="flex flex-col p-8 space-y-6 font-black uppercase tracking-widest text-sm">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          {user ? (
            <>
              <NavLink to="/subjects" onClick={() => setMenuOpen(false)}>Subjects</NavLink>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to={`/profile/${user._id}`} onClick={() => setMenuOpen(false)}>My Profile</NavLink>
              {user.admin && <NavLink to="/admindashboard" onClick={() => setMenuOpen(false)} className="text-red-400">Admin</NavLink>}
              <button onClick={handleLogout} className="bg-red-500 text-white py-4 rounded-2xl shadow-xl">Logout</button>
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