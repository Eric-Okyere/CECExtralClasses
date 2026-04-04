import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { 
  Save, Loader2, Mail, Lock, GraduationCap, 
  User, Heart, AlertCircle, ShieldCheck, ChevronDown 
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; 

const PhoneInputComponent = PhoneInput.default ? PhoneInput.default : PhoneInput;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [extraInfo, setExtraInfo] = useState({
    level: "", role: "student", childFirstName: "", childLastName: "", 
    childAge: "", relationship: "", parentPhone: "", 
  });

  const handlePhoneChange = (value) => {
    if (value.startsWith("2330")) {
      const corrected = "233" + value.substring(4);
      setExtraInfo({ ...extraInfo, parentPhone: corrected });
    } else {
      setExtraInfo({ ...extraInfo, parentPhone: value });
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
      setError(err || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const base = extraInfo.level && extraInfo.childAge && extraInfo.parentPhone.length >= 10 && !extraInfo.parentPhone.startsWith("2330");
    if (extraInfo.role === 'student') return base;
    return base && extraInfo.childFirstName && extraInfo.childLastName && extraInfo.relationship;
  };


  const handleUpdateProfile = async () => {
  try {
    const res = await fetch(`http://localhost:5001/api/auth/update-profile/${loggedInUser._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...extraInfo,
        parentPhone: `+${extraInfo.parentPhone}` // Formats for Ghana +233
      }),
    });

    if (res.ok) {
      const updatedUser = await res.json();
      // Update local storage so the app knows the profile is now complete
      localStorage.setItem("user", JSON.stringify(updatedUser));
      // Redirect to the dashboard
      navigate("/");
    } else {
      const errorData = await res.json();
      setError(errorData.msg || "Failed to update profile.");
    }
  } catch (err) {
    setError("Connection error. Please check your server.");
  }
};




  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC] px-4 font-sans text-slate-900">
      
      {/* --- LOGIN CARD --- */}
      <div className="bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2.5rem] w-full max-w-md border border-slate-100 transition-all">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 uppercase">JHS HUB</h2>
          <p className="text-slate-400 text-sm mt-1 font-medium">Log in to your account</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 animate-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all font-medium" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="password" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-blue-500 transition-all font-medium" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-200">
            {loading ? <Loader2 className="animate-spin" /> : "Sign In Account"}
          </button>

           <div className="mt-8 text-center">
          <p className="text-slate-400 text-xs font-medium">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register now</Link>
          </p>
        </div>
        </div>
      </div>

      {/* --- SETUP MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-lg w-full animate-in zoom-in duration-300 my-8">
            <h2 className="text-2xl font-black text-center mb-6 text-slate-800">Profile Setup 🎓</h2>

            <div className="space-y-5">
              {/* Role Switcher */}
              <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-2">
                <button onClick={() => setExtraInfo({...extraInfo, role: 'student'})} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${extraInfo.role === 'student' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>I am the Student</button>
                <button onClick={() => setExtraInfo({...extraInfo, role: 'parent_managed'})} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${extraInfo.role === 'parent_managed' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>I am a Parent</button>
              </div>

              {/* Class Level Selection with Down Arrow */}
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

              {/* Parent Only Fields */}
              {extraInfo.role === 'parent_managed' && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none border border-transparent focus:border-blue-500" placeholder="Child First Name" value={extraInfo.childFirstName} onChange={(e) => setExtraInfo({...extraInfo, childFirstName: e.target.value})} />
                    <input className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none border border-transparent focus:border-blue-500" placeholder="Child Last Name" value={extraInfo.childLastName} onChange={(e) => setExtraInfo({...extraInfo, childLastName: e.target.value})} />
                  </div>
                  
                  {/* Relationship Select with Down Arrow */}
                  <div className="relative">
                    <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      className="w-full pl-12 pr-10 p-4 bg-slate-50 rounded-2xl text-sm font-bold appearance-none outline-none border border-transparent focus:border-blue-500 transition-all" 
                      value={extraInfo.relationship} 
                      onChange={(e) => setExtraInfo({...extraInfo, relationship: e.target.value})}
                    >
                      <option value="">Relationship to Student</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>
              )}

              {/* Shared Age & Phone */}
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input className="w-full pl-12 p-4 bg-slate-50 rounded-2xl text-sm font-medium outline-none border border-transparent focus:border-blue-500" type="number" placeholder={extraInfo.role === 'student' ? "How old are you?" : "Child's Age"} value={extraInfo.childAge} onChange={(e) => setExtraInfo({...extraInfo, childAge: e.target.value})} />
                </div>

                <div className="phone-wrapper relative">
                  <PhoneInputComponent 
                    country={"gh"} 
                    value={extraInfo.parentPhone} 
                    onChange={handlePhoneChange} 
                    containerClass="!w-full" 
                    inputClass={`!w-full !h-[58px] !bg-slate-50 !border-none !rounded-2xl !pl-14 !text-sm !font-bold ${extraInfo.parentPhone.startsWith("2330") ? 'ring-2 ring-red-500' : ''}`} 
                    buttonClass="!bg-transparent !border-none !pl-3" 
                  />
                  {extraInfo.parentPhone.startsWith("2330") && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 flex items-center gap-1"><AlertCircle size={10} /> No leading '0' after +233</p>
                  )}
                </div>
              </div>

              <button 
                onClick={handleUpdateProfile} // 👈 Change this from handleLogin
                disabled={!isFormValid()} 
                className="w-full bg-green-600 text-white py-5 rounded-[1.5rem] font-black mt-2 hover:bg-green-700 transition shadow-xl shadow-green-100 flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-200"
              >
                <Save size={20} /> Complete Setup
              </button>


       
            </div>
          </div>
        </div>
      )}

      <style>{`
        .react-tel-input .selected-flag { background: transparent !important; }
        .react-tel-input .flag-dropdown { border: none !important; background: transparent !important; }
        .react-tel-input .country-list { border-radius: 1.5rem !important; box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important; }
      `}</style>
    </div>
  );
}