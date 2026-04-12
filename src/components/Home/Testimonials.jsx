import { motion } from "framer-motion";

export default function Testimonials() {
  const testimonials = [
    {
      text: "The video lessons are so clear! I used to struggle with Integrated Science, but CEC Extra Classes made the concepts easy to understand. I feel ready for my BECE!",
      name: "Ama Mensah",
      role: "JHS 3 Student",
      // HIGH STABLE IMAGE: Young Black female student, smiling
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=facearea&facepad=2&ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9",
      rating: 5
    },
    {
      text: "I love that I can learn at my own pace. Whether it's late at night or early morning, the platform is always there. It’s the best supplementary tool for any Ghanaian student.",
      name: "Kofi Boateng",
      role: "JHS 2 Student",
      // HIGH STABLE IMAGE: Young Black male student, focused
      image: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=400&auto=format&fit=facearea&facepad=2&ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9",
      rating: 5
    },
    {
      text: "The timed practice tests are exactly like the real exams. The quick feedback helped me identify my weak spots in Mathematics and improve instantly.",
      name: "Adjoa Sarfo",
      role: "JHS 3 Student",
      // HIGH STABLE IMAGE: Young Black female student, studying
      image: "https://images.unsplash.com/photo-1563212876-0004928b584a?q=80&w=400&auto=format&fit=facearea&facepad=2&ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9",
      rating: 5
    },
  ];

  return (
    <section className="bg-white py-24 px-6 relative overflow-hidden">
      {/* Decorative background accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-yellow-400 to-blue-600 opacity-20"></div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-blue-700 font-black text-sm uppercase tracking-widest mb-2"
          >
            Success Stories
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900"
          >
            Trusted by Students Across Ghana
          </motion.h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10 }}
              className="bg-gray-50 p-8 rounded-[2rem] shadow-sm border border-gray-100 relative"
            >
              {/* Star Rating */}
              <div className="flex text-yellow-400 mb-4">
                {[...Array(t.rating)].map((_, index) => (
                  <span key={index} className="text-lg">★</span>
                ))}
              </div>

              <p className="text-gray-600 italic leading-relaxed mb-8">
                “{t.text}”
              </p>

              <div className="flex items-center gap-4">
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="w-12 h-12 rounded-full border-2 border-blue-600 object-cover"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/100x100/1d4ed8/ffffff?text=" + t.name.charAt(0);
                  }}
                />
                <div>
                  <h4 className="font-bold text-gray-900 leading-none">{t.name}</h4>
                  <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">{t.role}</span>
                </div>
              </div>

              {/* Decorative Quote Icon */}
              <div className="absolute top-6 right-8 text-6xl text-blue-100 font-serif leading-none select-none">
                ”
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}