import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../services/BaseUrl";

// Paystack sends the learner back here with ?reference=... after paying.
// The server double-checks the payment with Paystack before unlocking premium.
export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const reference = params.get("reference") || params.get("trxref");
  const [state, setState] = useState(() => {
    if (!reference) return { status: "error", message: "No payment reference was found." };
    if (!localStorage.getItem("token"))
      return { status: "error", message: "Please log in, then open this page again to confirm your payment." };
    return { status: "loading", message: "" };
  });

  useEffect(() => {
    if (!reference || !localStorage.getItem("token")) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}payments/verify/${encodeURIComponent(reference)}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.success) {
          setState({ status: "success", message: "Payment confirmed. Premium lessons are now unlocked!" });
        } else {
          setState({ status: "error", message: data.message || data.msg || "We couldn't confirm this payment yet." });
        }
      } catch {
        if (!cancelled) setState({ status: "error", message: "Could not reach the server. Please refresh to try again." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 px-4">
      <div className="bg-white p-8 shadow-2xl rounded-[2.5rem] w-full max-w-md border border-slate-100 text-center">
        {state.status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-800">Confirming your payment…</h2>
          </>
        )}
        {state.status === "success" && (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-800">Thank you!</h2>
            <p className="text-slate-500 text-sm mt-2">{state.message}</p>
          </>
        )}
        {state.status === "error" && (
          <>
            <AlertCircle className="w-14 h-14 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-800">Payment not confirmed</h2>
            <p className="text-slate-500 text-sm mt-2">{state.message}</p>
            {reference && (
              <p className="text-slate-400 text-xs mt-4">
                Reference: <span className="font-mono">{reference}</span>
              </p>
            )}
          </>
        )}
        {state.status !== "loading" && (
          <Link
            to="/"
            className="inline-block mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all"
          >
            Continue learning
          </Link>
        )}
      </div>
    </div>
  );
}
