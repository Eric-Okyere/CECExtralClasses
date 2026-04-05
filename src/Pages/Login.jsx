import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser} from "../services/api"; // Ensure API_BASE_URL is exported here
import { 
  Save, Loader2, Mail, Lock, GraduationCap, 
  User, Heart, AlertCircle, ShieldCheck, ChevronDown 
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; 
import { API_BASE_URL } from "../services/BaseUrl";

const PhoneInputComponent = PhoneInput.default ? PhoneInput.default : PhoneInput;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Modal & Onboarding States
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

  // --- 1. HANDLE LOGIN ---
  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      
      // Store credentials immediately
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Check if profile is incomplete (e.g., no class level assigned)
      if (!data.user.studentProfile?.level) {
        setLoggedInUser(data.user);
        setShowModal(true);
      } else {
        navigate("/"); // Go straight to home if profile is done
      }
    } catch (err) {
      setError(err || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE PROFILE UPDATE (ONBOARDING) ---
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
          name: loggedInUser.name,       // Persist original name
          surname: loggedInUser.surname, // Persist original surname
          parentPhone: `+${extraInfo.parentPhone}` // Format for Ghana
        }),
      });

      const updatedData = await res.json();

      if (res.ok) {
        // Sync the new full user object to local storage
        localStorage.setItem("user", JSON.stringify(updatedData));
        setShowModal(false);
        navigate("/"); 
      } else {
        setError(updatedData.msg || "Failed to update profile.");
      }
    } catch (err) {
      setError("Connection error. Check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS ---
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
      
      {/* --- LOGIN CARD --- */}
      <div className="bg-white p-10 shadow-2xl rounded-[2.5rem] w-full max-w-md border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 uppercase">JHS HUB</h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">Access your lessons</p>
        </div>

        {error && !showModal && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6">
            <AlertCircle size={18} />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="password" 
              className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            onClick={handleLogin} 
            disabled={loading} 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In Account"}
          </button>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-xs font-medium">
              New here? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>

      {/* --- SETUP MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-lg w-full animate-in zoom-in duration-300 my-8">
            <h2 className="text-2xl font-black text-center mb-2 text-slate-800">Final Step 🎓</h2>
            <p className="text-center text-slate-400 text-sm mb-6 font-medium">Tell us a bit more to customize your experience</p>

            <div className="space-y-5">
              {/* Role Switcher */}
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

              {/* Class Level */}
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select 
                  className="w-full pl-12 pr-10 p-4 bg-slate-50 rounded-2xl outline-none font-bold appearance-none cursor-pointer border border-transparent focus:border-blue-500" 
                  value={extraInfo.level} 
                  onChange={(e) => setExtraInfo({...extraInfo, level: e.target.value})}
                >
                  <option value="">Current Grade</option>
                  <option value="JHS 1">JHS 1 (Basic 7)</option>
                  <option value="JHS 2">JHS 2 (Basic 8)</option>
                  <option value="JHS 3">JHS 3 (Basic 9)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>

              {/* Parent Fields */}
              {extraInfo.role === 'parent_managed' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none border border-transparent focus:border-blue-500" placeholder="Student First Name" value={extraInfo.childFirstName} onChange={(e) => setExtraInfo({...extraInfo, childFirstName: e.target.value})} />
                    <input className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none border border-transparent focus:border-blue-500" placeholder="Student Last Name" value={extraInfo.childLastName} onChange={(e) => setExtraInfo({...extraInfo, childLastName: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      className="w-full pl-12 pr-10 p-4 bg-slate-50 rounded-2xl text-sm font-bold appearance-none outline-none border border-transparent focus:border-blue-500" 
                      value={extraInfo.relationship} 
                      onChange={(e) => setExtraInfo({...extraInfo, relationship: e.target.value})}
                    >
                      <option value="">My relationship to student</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              )}

              {/* Age & Phone */}
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none border border-transparent focus:border-blue-500" 
                    type="number" 
                    placeholder={extraInfo.role === 'student' ? "Age" : "Student's Age"} 
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

              {error && (
                <p className="text-red-500 text-[10px] font-bold text-center">{error}</p>
              )}

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