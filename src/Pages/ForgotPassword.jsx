import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Loader2, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { API_BASE_URL } from "../services/BaseUrl";

const MIN_PASSWORD = 8;

const post = async (path, body) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white outline-none";

// Step 1: enter email -> we email a 6-digit code.
// Step 2: enter the code and a new password.
export default function ForgotPassword() {
  const [step, setStep] = useState("email"); // "email" | "reset" | "done"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const sendCode = async (e) => {
    e?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError("Enter the email address you signed up with.");
      return;
    }
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const { ok, data } = await post("auth/forgot-password", { email: clean });
      if (ok) {
        setEmail(clean);
        setStep("reset");
        setInfo("If an account exists for that email, a 6-digit code is on its way. Check your inbox and spam folder.");
      } else {
        setError(data.msg || "Could not send the code. Try again shortly.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from the email.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Your new password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { ok, data } = await post("auth/reset-password", { email, code: code.trim(), password });
      if (ok) {
        setStep("done");
      } else {
        setError(data.msg || "Could not reset your password.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
      <div className="bg-white p-8 sm:p-10 shadow-2xl rounded-[2.5rem] w-full max-w-md border border-slate-100">
        <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
          {step === "done" ? <CheckCircle2 size={32} /> : <KeyRound size={32} />}
        </div>

        {step === "done" ? (
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-800">Password changed</h1>
            <p className="text-slate-500 text-sm mt-3">
              You can now sign in with your new password. Any other devices you were signed in on have been signed out.
            </p>
            <Link
              to="/login"
              className="mt-8 block w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-slate-800 text-center">Reset your password</h1>
            <p className="text-slate-500 text-sm mt-2 text-center">
              {step === "email"
                ? "Enter the email you signed up with and we'll send you a code."
                : <>Enter the code we sent to <span className="font-bold text-slate-700">{email}</span> and choose a new password.</>}
            </p>

            {error && (
              <div role="alert" className="mt-6 flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}
            {info && !error && (
              <div className="mt-6 flex items-start gap-2 bg-blue-50 text-blue-700 p-4 rounded-2xl text-xs font-bold border border-blue-100">
                <Mail size={16} className="shrink-0 mt-0.5" /> {info}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={sendCode} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="fp-email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Send reset code"}
                </button>
              </form>
            ) : (
              <form onSubmit={resetPassword} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="fp-code" className="block text-sm font-semibold text-slate-700 mb-1.5">6-digit code</label>
                  <input
                    id="fp-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className={`${inputClass} tracking-[0.4em] text-center text-lg font-bold`}
                  />
                </div>
                <div>
                  <label htmlFor="fp-pass" className="block text-sm font-semibold text-slate-700 mb-1.5">New password</label>
                  <input
                    id="fp-pass"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder={`At least ${MIN_PASSWORD} characters`}
                  />
                </div>
                <div>
                  <label htmlFor="fp-confirm" className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm new password</label>
                  <input
                    id="fp-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Change password"}
                </button>
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={loading}
                  className="w-full text-sm font-semibold text-blue-600 hover:underline disabled:opacity-50"
                >
                  Send a new code
                </button>
              </form>
            )}

            <p className="mt-8 text-center text-sm text-slate-500">
              Remembered it?{" "}
              <Link to="/login" className="font-bold text-blue-600 hover:underline">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
