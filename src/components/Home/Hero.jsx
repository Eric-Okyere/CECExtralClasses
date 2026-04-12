import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
    <section className="bg-blue-600 text-white py-24 px-6 overflow-hidden relative">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
        
        <motion.div variants={textContainerVariants} initial="hidden" animate="visible">
          <motion.div variants={textItemVariants}>
            <span className="bg-blue-800 text-yellow-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block">
              CEC Extra Classes
            </span>
          </motion.div>

          <motion.h1 variants={textItemVariants} className="text-5xl md:text-7xl font-black leading-tight uppercase tracking-tighter">
            The Extra Edge <br />
            <span className="text-yellow-400 italic">To Succeed</span>
          </motion.h1>

          <motion.p variants={textItemVariants} className="mt-6 text-lg text-blue-100 font-medium max-w-md leading-relaxed">
            Empowering students with quality, affordable education structured on the 
            Ghanaian Curriculum. Turn classroom knowledge into lifelong understanding.
          </motion.p>

          <motion.div variants={textItemVariants} className="mt-10 flex flex-wrap gap-4">
            <button 
              onClick={handleGetStarted} 
              className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-black uppercase tracking-wider shadow-2xl hover:bg-yellow-400 hover:text-blue-900 transition-all active:scale-95 group"
            >
              {isLoggedIn ? "Continue Learning" : "Join Now"}
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button className="border-2 border-white/30 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all uppercase tracking-wide">
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          {/* Main Hero Image - Using a highly stable educational link */}
          <div className="relative z-10">
            <img
              src="https://img.freepik.com/free-photo/group-african-kids-paying-attention-class_23-2148892516.jpg?semt=ais_hybrid&w=740&q=80"
              alt="CEC Teacher and Students Learning"
              className="rounded-[3rem] shadow-2xl border-8 border-white/5 object-cover w-full h-[500px]"
              loading="lazy"
            />
            
            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 bg-yellow-400 text-blue-900 p-6 rounded-3xl shadow-2xl font-black rotate-[-4deg] hidden lg:block"
            >
              <p className="text-xl leading-none">BECE</p>
              <p className="text-xs uppercase opacity-80 mt-1">Simulations</p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-10 -right-6 bg-blue-800 text-white p-5 rounded-3xl shadow-2xl font-bold rotate-[4deg] hidden lg:block border-2 border-white/20"
            >
              <p className="text-sm uppercase tracking-widest">National Curriculum</p>
            </motion.div>
          </div>

          {/* Decorative Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-yellow-400/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        </motion.div>
      </div>
    </section>
  );
}