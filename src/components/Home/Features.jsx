import { motion } from "framer-motion";

export default function Features() {
  const features = [
    { 
      icon: "👨‍🏫", 
      title: "Qualified Facilitators", 
      desc: "Our lessons are led by professional and qualified teachers dedicated to your success." 
    },
    { 
      icon: "🇬🇭", 
      title: "National Curriculum", 
      desc: "Lessons are specifically structured on the Ghanaian Curriculum to give you the best standard in basic education." 
    },
    { 
      icon: "⏰", 
      title: "Learn Anytime", 
      desc: "The platform is not time-bound; you can learn at your own convenience from any location." 
    },
    { 
      icon: "✍️", 
      title: "Exam Readiness", 
      desc: "Experience simulations of what to expect in your final BECE exams with quick feedback for improvement." 
    },
    { 
      icon: "📱", 
      title: "Study Anywhere", 
      desc: "With a mobile phone, tablet, or laptop, any place can become your classroom." 
    },
    { 
      icon: "🚀", 
      title: "Advanced Learning", 
      desc: "Beyond textbooks, you can choose to study ahead of your grade and explore world-related topics." 
    },
  ];

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Time between each card appearing
      },
    },
  };

  // Animation variants for individual cards
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  };

  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-blue-700 font-black text-sm uppercase tracking-widest mb-2"
          >
            The CEC Advantage
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Why Choose CEC Extra Classes?
          </motion.h3>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We bridge the gap between public and private school resources, ensuring every student has access to the best supplementary education.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((f) => (
            <motion.div 
              key={f.title}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0px 20px 30px rgba(0,0,0,0.05)" 
              }}
              className="bg-white p-8 rounded-3xl border border-gray-100 transition-all cursor-default"
            >
              <div className="text-4xl mb-4 bg-blue-50 w-16 h-16 flex items-center justify-center rounded-2xl">
                {f.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}