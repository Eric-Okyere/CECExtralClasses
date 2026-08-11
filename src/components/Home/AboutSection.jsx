import { motion } from "framer-motion";
import { Sparkles, Heart, CheckCircle2, Target, Eye } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-20 px-6 bg-white relative overflow-hidden">
      {/* Background Subtle Blobs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-yellow-100 rounded-full blur-3xl -z-10 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl -z-10 opacity-60"></div>

      <div className="max-w-6xl mx-auto">
        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="bg-blue-100 text-blue-700 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3">
              <Heart size={14} className="fill-current text-rose-500" /> About CEC Extra Classes
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
              Making Quality Learning <br />
              <span className="text-blue-600">Fun & Accessible For Every Child! 🌟</span>
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4 font-medium">
              CEC Extra Classes is an engaging online educational platform initiated by the Children’s Empowerment Center (CEC).
              We supplement physical classroom learning by providing affordable, kid-friendly, and interactive study modules.
            </p>
            <p className="text-gray-600 leading-relaxed font-medium">
              Whether your child is catching up or stepping ahead, we make learning an exciting adventure built directly on the official Ghanaian Curriculum.
            </p>
          </motion.div>
          
          <div className="bg-gradient-to-br from-blue-50 to-amber-50/50 p-8 rounded-[2.5rem] border-2 border-blue-100/80 shadow-sm relative">
            <h4 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={20} /> What Sets Us Apart
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <p className="text-gray-700 text-sm font-semibold">Structured specifically for the Ghanaian Basic Curriculum.</p>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <p className="text-gray-700 text-sm font-semibold">Nurtures critical thinking through interactive challenges.</p>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                <p className="text-gray-700 text-sm font-semibold">Fun quizzes and instant feedback to build exam confidence.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 sm:p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Target size={24} className="text-yellow-300" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-wide">Our Mission</h3>
            </div>
            <p className="text-blue-100 leading-relaxed font-medium">
              To transform supplementary education into an inspiring and enjoyable foundation for success, ensuring no student is left behind by providing interactive resources, mentorship, and support.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 sm:p-10 bg-gradient-to-br from-yellow-400 to-amber-400 text-blue-950 rounded-[2.5rem] shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-950/10 p-3 rounded-2xl">
                <Eye size={24} className="text-blue-950" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-wide">Our Vision</h3>
            </div>
            <p className="font-semibold leading-relaxed text-blue-950/90">
              To be the leading children's learning platform across Ghana that turns supplementary study into a fun, rewarding, and lifelong key to academic excellence.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}