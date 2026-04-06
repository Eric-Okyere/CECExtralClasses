import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api"; 
import { 
  Save, Loader2, Mail, Lock, GraduationCap, 
  User, Heart, AlertCircle, ShieldCheck, ChevronDown,
  Phone, MessageCircle // 1. Added these icons
} from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; 
import { API_BASE_URL } from "../services/BaseUrl";
import Logo from "../assets/Logo.jpeg";

const PhoneInputComponent = PhoneInput.default ? PhoneInput.default : PhoneInput;

export default function Login() {
  // ... (keep all your existing state and functions)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [extraInfo, setExtraInfo] = useState({
    level: "", 
    role: "student", 
    childFirstName: "", 
    childLastName: "", 
    childAge: "", 
    relationship: "", 
    parentPhone: "", 
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (!data.user.studentProfile?.level) {
          setLoggedInUser(data.user);
          setShowModal(true);
        } else {
          navigate("/");
        }
      } else {
        setError(data.msg || "Google authentication failed.");
      }
    } catch (err) {
      setError("Server connection error during Google login.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (!data.user.studentProfile?.level) {
        setLoggedInUser(data.user);
        setShowModal(true);
      } else {
        navigate("/"); 
      }
    } catch (err) {
      setError(err || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}auth/update-profile/${loggedInUser._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...extraInfo,
          name: loggedInUser.name,
          surname: loggedInUser.surname,
          parentPhone: `+${extraInfo.parentPhone}` 
        }),
      });
      const updatedData = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(updatedData));
        setShowModal(false);
        navigate("/"); 
      } else {
        setError(updatedData.msg || "Failed to update profile.");
      }
    } catch (err) {
      setError("Connection error. Check if your server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value) => {
    if (value.startsWith("2330")) {
      const corrected = "233" + value.substring(4);
      setExtraInfo({ ...extraInfo, parentPhone: corrected });
    } else {
      setExtraInfo({ ...extraInfo, parentPhone: value });
    }
  };

  const isFormValid = () => {
    const base = extraInfo.level && extraInfo.childAge && extraInfo.parentPhone.length >= 10;
    if (extraInfo.role === 'student') return base;
    return base && extraInfo.childFirstName && extraInfo.childLastName && extraInfo.relationship;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC] px-4 font-sans text-slate-900">
      
      <div className="bg-white p-10 shadow-2xl rounded-[2.5rem] w-full max-w-md border border-slate-100 animate-in fade-in duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img src={Logo} alt="CEC Logo" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">CEC Extra Classes</h2>
          <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide uppercase">Where Learning Knows No Limit</p>
        </div>

        {error && !showModal && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 font-bold text-xs">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center w-full gap-2 text-slate-200">
              <div className="h-[1px] bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Register with us</span>
              <div className="h-[1px] bg-slate-100 flex-1"></div>
            </div>
            
            <GoogleLogin 
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
              theme="outline"
              shape="pill"
              size="large"
              width="100%"
            />
          </div>

         

          {/* --- CONTACT BUTTONS SECTION --- */}
          <div className="pt-6 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-300 uppercase text-center mb-4 tracking-widest">Need help? Contact support</p>
            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://wa.me/233209317581" // Replace with your WhatsApp number
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#25D366] rounded-2xl text-xs font-bold hover:bg-[#25D366] hover:text-white transition-all active:scale-95"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a 
                href="tel:+233209317581" // Replace with your phone number
                className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95"
              >
                <Phone size={16} />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* --- SETUP MODAL --- */}
      {/* (Keep your existing modal code exactly as it is) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-lg w-full animate-in zoom-in duration-300 my-8">
            <h2 className="text-2xl font-black text-center mb-2 text-slate-800 uppercase">Profile Setup 🎓</h2>
            <p className="text-center text-slate-400 text-sm mb-6 font-medium">Customize your learning experience</p>

            <div className="space-y-5">
              <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-2">
                <button 
                  onClick={() => setExtraInfo({...extraInfo, role: 'student'})} 
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${extraInfo.role === 'student' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
                >
                  Student
                </button>
                <button 
                  onClick={() => setExtraInfo({...extraInfo, role: 'parent_managed'})} 
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${extraInfo.role === 'parent_managed' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
                >
                  Parent / Guardian
                </button>
              </div>

              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select 
                  className="w-full pl-12 pr-10 p-4 bg-slate-50 rounded-2xl outline-none font-bold appearance-none cursor-pointer border border-transparent focus:border-blue-500 transition-all" 
                  value={extraInfo.level} 
                  onChange={(e) => setExtraInfo({...extraInfo, level: e.target.value})}
                >
                  <option value="">Select Grade Level</option>
                  <option value="JHS 1">JHS 1 (Basic 7)</option>
                  <option value="JHS 2">JHS 2 (Basic 8)</option>
                  <option value="JHS 3">JHS 3 (Basic 9)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>

              {extraInfo.role === 'parent_managed' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-blue-500" placeholder="Child First Name" value={extraInfo.childFirstName} onChange={(e) => setExtraInfo({...extraInfo, childFirstName: e.target.value})} />
                    <input className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-blue-500" placeholder="Child Last Name" value={extraInfo.childLastName} onChange={(e) => setExtraInfo({...extraInfo, childLastName: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      className="w-full pl-12 pr-10 p-4 bg-slate-50 rounded-2xl text-sm font-bold appearance-none outline-none border border-transparent focus:border-blue-500" 
                      value={extraInfo.relationship} 
                      onChange={(e) => setExtraInfo({...extraInfo, relationship: e.target.value})}
                    >
                      <option value="">Relationship</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-blue-500" 
                    type="number" 
                    placeholder={extraInfo.role === 'student' ? "How old are you?" : "Child's Age"} 
                    value={extraInfo.childAge} 
                    onChange={(e) => setExtraInfo({...extraInfo, childAge: e.target.value})} 
                  />
                </div>

                <div className="phone-wrapper relative">
                  <PhoneInputComponent 
                    country={"gh"} 
                    value={extraInfo.parentPhone} 
                    onChange={handlePhoneChange} 
                    containerClass="!w-full" 
                    inputClass={`!w-full !h-[58px] !bg-slate-50 !border-none !rounded-2xl !pl-14 !text-sm !font-bold`} 
                    buttonClass="!bg-transparent !border-none !pl-3" 
                  />
                </div>
              </div>

              <button 
                onClick={handleUpdateProfile} 
                disabled={!isFormValid() || loading} 
                className="w-full bg-green-600 text-white py-5 rounded-[1.5rem] font-black mt-2 hover:bg-green-700 transition shadow-xl shadow-green-100 flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-200"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save & Continue</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .react-tel-input .selected-flag { background: transparent !important; }
        .react-tel-input .flag-dropdown { border: none !important; background: transparent !important; }
      `}</style>
    </div>
  );
}