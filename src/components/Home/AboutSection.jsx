import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-blue-700 font-black text-sm uppercase tracking-widest mb-2">About Us</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Supplementing Education for Every Student [cite: 6]
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              CEC Extra Classes is an online educational platform initiated by the Children’s Empowerment Center (CEC)[cite: 5]. 
              We supplement physical classroom education by providing affordable and widely accessible quality education[cite: 6, 7].
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you’re looking to catch up, keep up, or get ahead, we help turn classroom knowledge into lifelong understanding[cite: 12].
            </p>
          </motion.div>
          
          <div className="bg-blue-50 p-8 rounded-3xl border-2 border-blue-100">
            <h4 className="text-xl font-bold text-blue-800 mb-4">Our Commitment</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <p className="text-gray-700 text-sm">Lessons structured on the Ghanaian Curriculum </p>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <p className="text-gray-700 text-sm">Nurturing critical thinking and problem-solving </p>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <p className="text-gray-700 text-sm">Interactive quizzes and timed practice tests [cite: 14]</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-10 bg-blue-600 text-white rounded-3xl shadow-xl"
          >
            <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Our Mission [cite: 16]</h3>
            <p className="text-blue-100 leading-relaxed">
              To transform supplementary education into a powerful foundation for success ensuring no student is left behind by making quality learning resources, mentorship, and personalized support accessible to all.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-10 bg-yellow-400 text-blue-900 rounded-3xl shadow-xl"
          >
            <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Our Vision [cite: 16]</h3>
            <p className="font-medium leading-relaxed">
              To be the leading online platform that transforms supplementary education into a cornerstone of academic success across the country.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}