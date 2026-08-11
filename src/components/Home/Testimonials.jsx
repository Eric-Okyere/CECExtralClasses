import { motion } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      text: "The video lessons are super clear and fun! Science used to be hard, but CEC Extra Classes made it my favorite subject. I feel super ready for my BECE!",
      name: "Ama Mensah",
      role: "JHS 3 Student",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=facearea&facepad=2&ixlib=rb-1.2.1",
      badge: "Integrated Science Champion 🔬"
    },
    {
      text: "I love doing the online quizzes on my tablet! I can review topics whenever I want after school. It feels like playing a learning game!",
      name: "Kofi Boateng",
      role: "JHS 2 Student",
      image: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=400&auto=format&fit=facearea&facepad=2&ixlib=rb-1.2.1",
      badge: "Math Whiz 📐"
    },
    {
      text: "The practice tests look just like our real exams! Getting my scores instantly helps me fix mistakes quickly.",
      name: "Adjoa Sarfo",
      role: "JHS 3 Student",
      image: "https://images.unsplash.com/photo-1563212876-0004928b584a?q=80&w=400&auto=format&fit=facearea&facepad=2&ixlib=rb-1.2.1",
      badge: "BECE Prep Star ⭐"
    },
  ];

  return (
    <section className="bg-white py-20 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-700 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3">
            <MessageSquare size={14} /> Student Stories
          </span>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black text-gray-900"
          >
            Loved By Students Across Ghana 🇬🇭
          </motion.h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="bg-amber-50/30 p-8 rounded-[2.5rem] border-2 border-amber-100/80 shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <div className="flex text-amber-400 gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={18} className="fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 italic text-sm leading-relaxed mb-6 font-medium">
                  “{t.text}”
                </p>
              </div>

              <div>
                <div className="mb-4">
                  <span className="bg-yellow-200 text-yellow-950 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                    {t.badge}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={t.image} 
                    alt={t.name} 
                    className="w-12 h-12 rounded-2xl border-2 border-yellow-400 object-cover shadow-sm"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/100x100/1d4ed8/ffffff?text=" + t.name.charAt(0);
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 leading-none">{t.name}</h4>
                    <span className="text-xs text-blue-600 font-bold uppercase">{t.role}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}