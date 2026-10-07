import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "../services/BaseUrl";

export default function VerifyEmail() {
  const [code, setCode] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState("");
  const [resending, setResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  // Email comes from the registration redirect; kept in sessionStorage so a refresh doesn't lose it.
  const [email, setEmail] = useState(
    () => location.state?.email || sessionStorage.getItem("pendingVerificationEmail") || ""
  );
  const inputRefs = useRef([]);

  const handlePaste = (e) => {
    const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    const next = new Array(6).fill("").map((_, i) => digits[i] || "");
    setCode(next);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const handleResend = async () => {
    if (!email) {
      setError("Enter your email address first.");
      return;
    }
    setResending(true);
    setError("");
    setInfo("");
    try {
      const response = await fetch(`${API_BASE_URL}auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) setInfo("A new code has been sent. Check your inbox (and spam folder).");
      else setError(data.msg || "Could not resend the code. Try again shortly.");
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setResending(false);
    }
  };

  const handleChange = (element, index) => {
    if (!/^\d?$/.test(element.value)) return false;

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
      const response = await fetch(`${API_BASE_URL}auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.removeItem("pendingVerificationEmail");
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
        {location.state?.email || sessionStorage.getItem("pendingVerificationEmail") ? (
          <p className="text-slate-400 text-sm mt-2 font-medium">
            We sent a code to <span className="text-slate-700 font-bold">{email}</span>
          </p>
        ) : (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            placeholder="Enter the email you registered with"
            className="mt-4 w-full border-2 border-slate-100 bg-slate-50 rounded-xl px-4 py-3 text-sm font-semibold focus:border-blue-500 outline-none"
          />
        )}

        {info && (
          <div className="mt-6 flex items-center gap-2 bg-blue-50 text-blue-700 p-4 rounded-2xl text-xs font-bold border border-blue-100">
            <Mail size={16} /> {info}
          </div>
        )}

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
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength="1"
              onPaste={handlePaste}
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
          Didn't receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-blue-600 uppercase ml-1 hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </p>
      </div>
    </div>
  );
}