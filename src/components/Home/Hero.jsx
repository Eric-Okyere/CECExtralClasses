import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  // Check if a user is currently logged in
  const isLoggedIn = !!localStorage.getItem("user");

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/subjects");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="bg-blue-600 text-white py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-black leading-tight uppercase tracking-tighter">
            Learn Smarter, <br />
            <span className="text-yellow-400">Pass BECE</span> with Confidence
          </h1>

          <p className="mt-6 text-lg text-blue-100 font-medium max-w-md">
            Interactive video lessons, real-time quizzes, and personalized progress tracking designed specifically for JHS students in Ghana.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button 
              onClick={handleGetStarted} 
              className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-black uppercase tracking-wider shadow-xl hover:bg-yellow-400 hover:text-blue-900 transition-all active:scale-95"
            >
              {isLoggedIn ? "Continue Learning" : "Get Started"}
            </button>

            <button className="border-2 border-white/30 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all uppercase tracking-wide">
              Watch Demo
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Decorative Background Element */}
          <div className="absolute -inset-4 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          
          <img
            src="https://images.unsplash.com/photo-1588072432836-e10032774350"
            alt="Student Learning"
            className="relative rounded-[2rem] shadow-2xl border-4 border-white/10 object-cover w-full h-[400px]"
          />
        </motion.div>
      </div>
    </section>
  );
}