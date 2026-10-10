import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import Logo from "../assets/Logo.jpeg";
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

//   const handleRegister = async () => {
//   const { name, surname, email, password, confirmPassword } = formData;

//   // ... (keep your existing validations)

//   setLoading(true);
//   setMessage("");

//   try {
//     // 🚀 Pass the fields as a single object (excluding confirmPassword)
//     await registerUser({ name, surname, email, password });
     
//     navigate("/login", { 
//       state: { msg: "Registration successful! Log in to continue." } 
//     });
//   } catch (err) {
//     // This will now catch the "throw" from your api.js
//     setMessage(typeof err === 'string' ? err : "Connection to server failed");
//   } finally {
//     setLoading(false);
//   }
// };



const handleRegister = async () => {
    const { name, surname, email, password, confirmPassword } = formData;

    // Validation
    if (!name || !surname || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 🚀 Send data to backend
      await registerUser({ name, surname, email, password });
     
      // Redirect to Verify Email page (pass email so they don't have to re-type it)
      sessionStorage.setItem("pendingVerificationEmail", email.trim().toLowerCase());
      navigate("/verify-email", { state: { email: email.trim().toLowerCase() } });
      
    } catch (err) {
      setMessage(err || "Connection to server failed");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 shadow-2xl rounded-[2.5rem] w-full max-w-md border border-gray-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <img src={Logo} alt="CEC Extra Classes logo" className="w-20 h-20 mx-auto mb-3 object-contain" />
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Create your CEC account</h2>
          <p className="font-hand text-green-600 text-2xl mt-1">Where Learning Knows No Limit</p>
        </div>

        {/* Error Messaging */}
        {message && (
          <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-xs mb-6 border border-red-100 font-bold animate-in zoom-in duration-200">
            <AlertCircle size={18} />
            {message}
          </div>
        )}

        <div className="space-y-4">
          {/* First Name & Surname Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  name="name"
                  className="w-full pl-11 p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" 
                  placeholder="Kojo" 
                  value={formData.name} 
                  onChange={handleChange} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Surname</label>
              <input 
                name="surname"
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" 
                placeholder="Mensah" 
                value={formData.surname} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                name="email"
                type="email"
                className="w-full pl-11 p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" 
                placeholder="email@example.com" 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Create Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Create Password</label>
              {formData.password.length > 0 && (
                <span className={`text-[9px] font-bold ${formData.password.length >= 5 ? 'text-green-500' : 'text-red-400'}`}>
                  {formData.password.length >= 5 ? 'Secure' : 'Too Short'}
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                name="password"
                type="password" 
                className="w-full pl-11 p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium" 
                placeholder="Min. 8 characters" 
                value={formData.password} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Confirm Password</label>
            <div className="relative">
              <ShieldCheck className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formData.confirmPassword ? (formData.password === formData.confirmPassword ? 'text-green-500' : 'text-red-400') : 'text-gray-300'}`} size={18} />
              <input 
                name="confirmPassword"
                type="password" 
                className={`w-full pl-11 p-4 bg-gray-50 border rounded-2xl outline-none transition-all text-sm font-medium ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword 
                  ? "border-red-200 focus:ring-red-400" 
                  : "border-transparent focus:ring-blue-500/20 focus:border-blue-500"
                }`} 
                placeholder="Repeat password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Main Action Button */}
          <button 
            onClick={handleRegister} 
            disabled={loading}
            className="bg-blue-600 text-white w-full py-5 rounded-[1.5rem] font-black mt-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex justify-center items-center gap-3 group active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20}/>
            ) : (
              <>
                Register Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="mt-10 pt-6 border-t border-gray-50 text-center">
          <p className="text-gray-400 text-xs font-bold">
            Already a member?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}