import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Calculator, 
  BookOpen, 
  FlaskConical, 
  Globe, 
  Monitor, 
  Settings, 
  HandHelping,
  Sparkles
} from "lucide-react";

export default function SubjectsSection() {
  const navigate = useNavigate();

  const subjects = [
    { name: "Mathematics", icon: <Calculator size={28} />, color: "bg-blue-500", text: "text-blue-600", desc: "Numbers, Shapes & Problem Solving", emoji: "📐" },
    { name: "English Language", icon: <BookOpen size={28} />, color: "bg-amber-500", text: "text-amber-600", desc: "Reading, Writing & Grammar Fun", emoji: "📚" },
    { name: "Integrated Science", icon: <FlaskConical size={28} />, color: "bg-emerald-500", text: "text-emerald-600", desc: "Experiments, Nature & Discovery", emoji: "🔬" },
    { name: "Social Studies", icon: <Globe size={28} />, color: "bg-purple-500", text: "text-purple-600", desc: "Our Culture, World & Society", emoji: "🌍" },
    { name: "ICT", icon: <Monitor size={28} />, color: "bg-cyan-500", text: "text-cyan-600", desc: "Computers, Coding & Technology", emoji: "💻" },
    { name: "Career Technology", icon: <Settings size={28} />, color: "bg-rose-500", text: "text-rose-600", desc: "Designing, Making & Skills", emoji: "🛠️" },
    { name: "RME", icon: <HandHelping size={28} />, color: "bg-yellow-500", text: "text-yellow-600", desc: "Values, Morals & Living Well", emoji: "🌟" }
  ];

  return (
    <section className="py-20 px-6 bg-amber-50/40 relative">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <span className="bg-yellow-200 text-yellow-900 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3 border border-yellow-300">
              <Sparkles size={14} /> Ghanaian Curriculum
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              Explore Fun <span className="text-blue-600">Learning Subjects</span>
            </h2>
            <p className="text-gray-600 mt-3 font-medium">
              Choose your favorite subject and start exploring exciting lessons, fun quizzes, and BECE prep today!
            </p>
          </div>
          
          <button 
            onClick={() => navigate("/subjects")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md hover:scale-105 transition-all text-sm"
          >
            Explore All Subjects →
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => navigate("/subjects")}
              className="bg-white p-7 rounded-[2.5rem] shadow-sm hover:shadow-xl border-2 border-gray-100 cursor-pointer group transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`${subject.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:rotate-6 transition-transform`}>
                  {subject.icon}
                </div>
                <span className="text-2xl">{subject.emoji}</span>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                {subject.name}
              </h3>
              
              <p className="text-gray-500 mt-2 text-xs font-semibold leading-relaxed">
                {subject.desc}
              </p>

              <div className="mt-6 flex items-center text-blue-600 font-black text-xs uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                Start Playing & Learning <span className="ml-1">→</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}