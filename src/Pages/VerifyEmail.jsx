import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function VerifyEmail() {
  const [code, setCode] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ""; // Get email from registration redirect
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setExtendedCode(element.value, index);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const setExtendedCode = (value, index) => {
    let newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.msg || "Invalid code. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
      <div className="bg-white p-8 shadow-2xl rounded-[2.5rem] w-full max-w-md border border-slate-100 text-center">
        
        <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
          <Mail size={32} />
        </div>

        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Verify Your Email</h2>
        <p className="text-slate-400 text-sm mt-2 font-medium">
          We sent a code to <span className="text-slate-700 font-bold">{email}</span>
        </p>

        {error && (
          <div className="mt-6 flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div className="mt-6 flex items-center gap-2 bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-bold border border-green-100">
            <CheckCircle2 size={16} /> Success! Redirecting to login...
          </div>
        )}

        <div className="flex justify-between gap-2 mt-10">
          {code.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 border-2 border-slate-100 bg-slate-50 rounded-xl text-center text-xl font-black focus:border-blue-500 focus:bg-white outline-none transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || success}
          className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black mt-10 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex justify-center items-center gap-3 disabled:bg-slate-200"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Verify Account"}
        </button>

        <p className="mt-8 text-slate-400 text-xs font-bold">
          Didn't receive a code? <button className="text-blue-600 uppercase ml-1 hover:underline">Resend</button>
        </p>
      </div>
    </div>
  );
}