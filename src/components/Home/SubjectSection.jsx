import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Calculator, 
  BookOpen, 
  FlaskConical, 
  Globe, 
  Monitor, 
  Settings, 
  HandHelping // Fixed name: singular "Hand" instead of "Hands"
} from "lucide-react";

export default function SubjectsSection() {
  const navigate = useNavigate();

  const subjects = [
    { name: "Mathematics", icon: <Calculator />, color: "bg-blue-500", desc: "Algebra, Geometry & Arithmetic" },
    { name: "English Language", icon: <BookOpen />, color: "bg-orange-500", desc: "Grammar, Literature & Composition" },
    { name: "Integrated Science", icon: <FlaskConical />, color: "bg-green-500", desc: "Biology, Physics & Chemistry" },
    { name: "Social Studies", icon: <Globe />, color: "bg-purple-500", desc: "Our Environment & Governance" },
    { name: "ICT", icon: <Monitor />, color: "bg-cyan-500", desc: "Computing & Digital Literacy" },
    { name: "Career Technology", icon: <Settings />, color: "bg-red-500", desc: "Technical Drawing & Design" },
    { name: "RME", icon: <HandHelping />, color: "bg-yellow-500", desc: "Moral & Religious Education" }
  ];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-blue-700 font-black text-sm uppercase tracking-widest mb-2 block"
            >
              Curriculum Based
            </motion.span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Explore Our Key <span className="text-blue-600">JHS Subjects</span>
            </h2>
            <p className="text-gray-600 mt-4 font-medium">
              Every lesson is structured on the Ghanaian Curriculum to ensure you get the extra edge needed for BECE success.
            </p>
          </div>
          
          <button 
            onClick={() => navigate("/subjects")}
            className="text-blue-700 font-bold border-b-2 border-blue-700 pb-1 hover:text-blue-500 hover:border-blue-500 transition-all"
          >
            View All Subjects
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => navigate("/subjects")}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 cursor-pointer group hover:shadow-xl hover:shadow-blue-900/5 transition-all"
            >
              <div className={`${subject.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                {subject.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {subject.name}
              </h3>
              
              <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                {subject.desc}
              </p>

              <div className="mt-6 flex items-center text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Start Learning <span className="ml-2">→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}