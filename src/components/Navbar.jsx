import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi"; // Install react-icons if you haven't
import Logo from "../assets/Logo.jpeg";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        const userData = parsed.user ? parsed.user : parsed;
        setUser(userData);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    navigate("/login");
  };

  const activeStyle = ({ isActive }) => 
    isActive 
      ? "text-yellow-300 font-bold md:border-b-2 md:border-yellow-300 pb-1" 
      : "hover:text-gray-200 transition duration-300";

  return (
    <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* --- LOGO SECTION --- */}
        <Link to="/" className="group flex items-center gap-3 z-[60]">
          <img 
            src={Logo} 
            alt="Logo" 
            className="w-10 h-10 rounded-full border-2 border-white/30 object-cover animate-[spin_10s_linear_infinite] group-hover:[transform:rotateY(360deg)] transition-transform duration-1000" 
          />
         <div className="flex flex-col w-fit">
          <h1 className="font-black text-xl tracking-tighter leading-none uppercase flex justify-between">
            <span>CEC Extra</span>
            <span className="text-yellow-400 ml-1">Classes</span>
          </h1>
          
          {/* This span uses flex justify-between to force the text to fill the 100% width of the H1 above it */}
          <span className="text-[8px] uppercase font-bold text-blue-200 opacity-80 flex justify-between w-full tracking-[0.1em]">
            {"Where Learning Knows No Limit".split("").map((char, index) => (
              <span key={index}>{char === " " ? "\u00A0" : char}</span>
            ))}
          </span>
        </div>
        </Link>

        {/* --- MOBILE HAMBURGER BUTTON --- */}
        <button 
          className="md:hidden text-3xl focus:outline-none z-[60]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiX /> : <HiMenu />}
        </button>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex space-x-8 items-center text-sm uppercase tracking-wider font-semibold">
          <NavLink to="/" className={activeStyle}>Home</NavLink>
          {user ? (
            <>
              <NavLink to="/subjects" className={activeStyle}>Subjects</NavLink>
              <NavLink to="/dashboard" className={activeStyle}>Dashboard</NavLink>
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                <span className="text-blue-100 italic normal-case font-medium">Hi, {user.name}</span>
                <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded-xl text-xs hover:bg-red-600 transition-all">Logout</button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className={activeStyle}>Login</NavLink>
              <NavLink to="/register" className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-full hover:bg-white transition-all font-bold">Register</NavLink>
            </>
          )}
        </div>

        {/* --- MOBILE OVERLAY MENU --- */}
        <div className={`
          fixed inset-0 bg-blue-800 flex flex-col items-center justify-center space-y-8 text-2xl font-bold transition-all duration-500 md:hidden
          ${menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        `}>
          <NavLink to="/" onClick={() => setMenuOpen(false)} className={activeStyle}>Home</NavLink>
          
          {user ? (
            <>
              <NavLink to="/subjects" onClick={() => setMenuOpen(false)} className={activeStyle}>Subjects</NavLink>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className={activeStyle}>Dashboard</NavLink>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)} className={activeStyle}>AdminDashboard</NavLink>
              <div className="pt-8 flex flex-col items-center gap-4">
                <span className="text-blue-200 text-sm">Signed in as {user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 px-8 py-3 rounded-full text-lg shadow-xl"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)} className={activeStyle}>Login</NavLink>
              <NavLink 
                to="/register" 
                onClick={() => setMenuOpen(false)}
                className="bg-yellow-400 text-blue-900 px-10 py-3 rounded-full"
              >
                Register Now
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}