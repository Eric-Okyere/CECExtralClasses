import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { 
  HiMenu, 
  HiX, 
  HiChevronDown, 
  HiUser, 
  HiLogout, 
  HiViewGrid, 
  HiShieldCheck 
} from "react-icons/hi"; 
import Logo from "../assets/Logo.jpeg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkUser = () => {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Handle nested user object or direct object
        setUser(parsed.user || parsed);
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
        
        {/* LOGO SECTION */}
        <Link to="/" className="flex items-center gap-3">
          <img src={Logo} alt="CEC Logo" className="w-12 h-12 rounded-xl object-cover border border-white/20" />
          <div className="hidden sm:block">
            <h1 className="font-black text-lg tracking-tighter leading-none uppercase">
              CEC <span className="text-yellow-400">Extra Classes</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-blue-200 font-bold opacity-80">
              Learning Without Limits
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-wide">
          <NavLink to="/" className={activeStyle}>Home</NavLink>
          
          {user ? (
            <div className="flex items-center gap-6">
              <NavLink to="/subjects" className={activeStyle}>Subjects</NavLink>
              
              {/* USER PROFILE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-blue-800 pl-2 pr-4 py-1.5 rounded-2xl border border-white/10 hover:bg-blue-900 transition-all"
                >
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full border-2 border-yellow-400 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold uppercase">
                      {user.name?.charAt(0)}
                    </div>
                  )}

                  <span className="normal-case text-sm font-medium">
                    Hi, {user.name?.split(' ')[0]}
                  </span>
                  <HiChevronDown className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* DROPDOWN MENU */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 text-slate-800 animate-in fade-in zoom-in duration-200 border border-slate-100">
                    <div className="px-4 py-3 border-b border-slate-100 mb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-xs font-bold truncate text-blue-700">{user.email}</p>
                    </div>

                    {/* ADMIN PANEL (Only if user.admin is true) */}
                    {user.admin && (
                      <Link to="/admindashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors text-red-600 font-black">
                        <HiShieldCheck size={18} /> Admin Panel
                      </Link>
                    )}

                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors">
                      <HiViewGrid size={18} className="text-blue-600" /> Dashboard
                    </Link>
                    
                    {/* DYNAMIC PROFILE LINK */}
                    <Link 
                      to={`/profile/${user._id || user.id}`} 
                      onClick={() => setDropdownOpen(false)} 
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <HiUser size={18} className="text-blue-600" /> My Profile
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 mt-2 border-t border-slate-100 text-red-500 hover:bg-red-50 transition-colors font-bold"
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
              <Link to="/register" className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                Register Now
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-3xl text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-blue-800 ${menuOpen ? "max-h-screen border-t border-white/10" : "max-h-0"}`}>
        <div className="flex flex-col p-6 space-y-5 font-bold uppercase tracking-widest text-center">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          {user ? (
            <>
              <NavLink to="/subjects" onClick={() => setMenuOpen(false)}>Subjects</NavLink>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to={`/profile/${user._id || user.id}`} onClick={() => setMenuOpen(false)}>My Profile</NavLink>
              
              {user.admin && (
                <NavLink to="/admindashboard" onClick={() => setMenuOpen(false)} className="text-yellow-400">Admin Panel</NavLink>
              )}
              
              <button onClick={handleLogout} className="bg-red-500 text-white py-3 rounded-xl mt-4 shadow-lg active:scale-95 transition-transform">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-yellow-400 text-blue-900 py-3 rounded-xl">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}