import { motion } from "framer-motion";
import { Smile } from "lucide-react";

export default function Features() {
  const features = [
    { 
      icon: "👨‍🏫", 
      title: "Friendly Facilitators", 
      desc: "Our lessons are led by caring teachers who break down difficult topics into easy steps." 
    },
    { 
      icon: "🇬🇭", 
      title: "Ghanaian Curriculum", 
      desc: "Lessons strictly follow national standards, keeping children aligned with school work." 
    },
    { 
      icon: "⏰", 
      title: "Learn At Your Pace", 
      desc: "No rushing! Replay lessons and practice whenever and wherever you want." 
    },
    { 
      icon: "✍️", 
      title: "BECE Exam Readiness", 
      desc: "Practice with fun simulations and quizzes that prepare students with confidence." 
    },
    { 
      icon: "📱", 
      title: "Any Device, Anywhere", 
      desc: "Seamlessly study on phones, tablets, or computers from the comfort of home." 
    },
    { 
      icon: "🚀", 
      title: "Explore & Step Ahead", 
      desc: "Encouraging curious minds to discover new subjects beyond standard textbooks." 
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: "easeOut" } 
    },
  };

  return (
    <section className="bg-amber-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <span className="bg-yellow-100 text-yellow-900 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3">
              <Smile size={16} className="text-yellow-600" /> The CEC Advantage
            </span>
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black text-gray-900"
          >
            Why Kids & Parents Love CEC! ❤️
          </motion.h3>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto font-medium">
            We bridge classroom gaps with engaging media, making supplementary learning fun, memorable, and highly effective.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((f) => (
            <motion.div 
              key={f.title}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white p-8 rounded-3xl border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-yellow-300 transition-all cursor-default relative group"
            >
              <div className="text-4xl mb-4 bg-yellow-50 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}