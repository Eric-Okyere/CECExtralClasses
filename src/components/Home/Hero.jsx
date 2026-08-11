import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, GraduationCap, Award, BookOpen, Play, Rocket } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user");

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/subjects");
    } else {
      navigate("/login");
    }
  };

  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const textItemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800 text-white pt-10 pb-16 px-6 overflow-hidden relative">
      {/* Background Decorative Playful Shapes */}
      <div className="absolute top-10 left-10 text-yellow-300 opacity-20 animate-spin-slow">
        <Sparkles size={80} />
      </div>
      <div className="absolute bottom-10 right-10 text-pink-400 opacity-20 animate-bounce">
        <Rocket size={90} />
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        <motion.div variants={textContainerVariants} initial="hidden" animate="visible">
          <motion.div variants={textItemVariants}>
            <span className="bg-yellow-400 text-blue-950 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-6 inline-flex items-center gap-2 shadow-lg border-2 border-yellow-200">
              <GraduationCap size={18} /> CEC Kids & JHS Learning Zone
            </span>
          </motion.div>

          <motion.h1 variants={textItemVariants} className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
            Fun & Smart Way To <br />
            <span className="text-yellow-300 drop-shadow-md">Learn & Succeed! 🚀</span>
          </motion.h1>

          <motion.p variants={textItemVariants} className="mt-6 text-lg text-blue-100 font-medium max-w-md leading-relaxed">
            Interactive, colorful lessons aligned with the Ghanaian Curriculum. Master your subjects with fun quizzes, videos, and BECE prep!
          </motion.p>

          <motion.div variants={textItemVariants} className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={handleGetStarted} 
              className="bg-yellow-400 text-blue-950 px-8 py-4 rounded-3xl font-black text-lg shadow-xl hover:bg-yellow-300 hover:scale-105 transition-all active:scale-95 flex items-center gap-3 group border-b-4 border-yellow-600"
            >
              <span>{isLoggedIn ? "Continue Learning" : "Start Learning Today"}</span>
              <span className="bg-blue-900 text-white rounded-full p-1.5 transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
            <button className="bg-blue-800/80 hover:bg-blue-800 border-2 border-blue-400/40 px-6 py-4 rounded-3xl font-bold hover:scale-105 transition-all flex items-center gap-2 text-blue-100">
              <Play size={18} className="fill-current text-yellow-400" /> Watch Demo
            </button>
          </motion.div>

          {/* Quick Stats Badges for Children & Parents */}
          <motion.div variants={textItemVariants} className="mt-10 flex items-center gap-6 border-t border-blue-500/40 pt-6">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-400/20 p-2 rounded-xl text-yellow-300">
                <BookOpen size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Ghanaian Curriculum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-green-400/20 p-2 rounded-xl text-green-300">
                <Award size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">BECE Ready</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Interactive Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="relative z-10">
            <img
              src="https://img.freepik.com/free-photo/group-african-kids-paying-attention-class_23-2148892516.jpg?semt=ais_hybrid&w=740&q=80"
              alt="CEC Children Learning Together"
              className="rounded-[3rem] shadow-2xl border-8 border-white/20 object-cover w-full h-[460px]"
              loading="lazy"
            />
            
            {/* Floating Interactive Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-yellow-400 text-blue-950 p-5 rounded-3xl shadow-2xl font-black rotate-[-3deg] hidden sm:flex items-center gap-3 border-4 border-white"
            >
              <div className="bg-blue-900 text-yellow-300 p-3 rounded-2xl">
                <Award size={24} />
              </div>
              <div>
                <p className="text-lg font-black leading-none">BECE Prep</p>
                <p className="text-xs font-bold text-blue-900 opacity-90 mt-1">Interactive Quizzes</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-8 -right-6 bg-white text-blue-950 p-4 rounded-3xl shadow-2xl font-bold rotate-[4deg] hidden sm:flex items-center gap-3 border-4 border-yellow-300"
            >
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-sm font-black uppercase">100% Kid Friendly</p>
                <p className="text-[10px] text-gray-500 font-bold">Fun & Easy Lessons</p>
              </div>
            </motion.div>
          </div>

          {/* Decorative Backing Blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-300/30 rounded-full blur-[90px] -z-10"></div>
        </motion.div>

      </div>
    </section>
  );
}