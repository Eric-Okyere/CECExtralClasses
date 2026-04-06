import { Link } from "react-router-dom";

export default function CTA() {
  // 1. Check if a user is currently logged in
  const isLoggedIn = !!localStorage.getItem("user");

  return (
    <section className="bg-blue-700 text-white py-20 text-center px-6 relative overflow-hidden">
      {/* Decorative background circle for a professional touch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          Ready to prepare for your <span className="text-yellow-400">BECE?</span>
        </h2>

        <p className="mt-4 text-blue-100 text-lg font-medium opacity-90">
          Join thousands of students across Ghana preparing for excellence. 
          Start your journey with CEC Extra Classes today.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to={isLoggedIn ? "/subjects" : "/login"}
            className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-yellow-400 hover:text-blue-900 transition-all active:scale-95 text-sm"
          >
            {isLoggedIn ? "Continue Learning" : "Join Now Us"}
          </Link>
          
          {/* {!isLoggedIn && (
            <Link
              to="/login"
              className="border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-sm"
            >
              Sign In
            </Link>
          )} */}
        </div>
      </div>
    </section>
  );
}