import { Link } from "react-router-dom";
import { Sparkles, Rocket } from "lucide-react";

export default function CTA() {
  const isLoggedIn = !!localStorage.getItem("user");

  return (
    <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white py-16 text-center px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl -z-0"></div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-blue-950 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 shadow-md">
          <Sparkles size={16} /> Start Your Success Journey
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Ready to Ace Your <span className="text-yellow-300">BECE Exams? 🚀</span>
        </h2>

        <p className="mt-4 text-blue-100 text-base sm:text-lg font-medium max-w-xl mx-auto">
          Join thousands of students across Ghana learning with fun video lessons and practice quizzes today.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to={isLoggedIn ? "/subjects" : "/login"}
            className="bg-yellow-400 text-blue-950 px-10 py-4 rounded-3xl font-black uppercase tracking-wider shadow-2xl hover:bg-yellow-300 hover:scale-105 transition-all text-base border-b-4 border-yellow-600 flex items-center gap-2"
          >
            <Rocket size={20} />
            {isLoggedIn ? "Continue Learning" : "Join Free Now"}
          </Link>
        </div>
      </div>
    </section>
  );
}