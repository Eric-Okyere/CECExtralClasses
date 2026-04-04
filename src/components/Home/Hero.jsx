import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="bg-blue-600 text-white py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold">
            Learn Smarter, Pass BECE with Confidence
          </h1>

          <p className="mt-6 text-lg">
            Video lessons, quizzes, and progress tracking for JHS students.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">
              Get Started
            </button>

            <button className="border border-white px-6 py-3 rounded-lg">
              Watch Demo
            </button>
          </div>
        </motion.div>

        <motion.img
          src="https://images.unsplash.com/photo-1588072432836-e10032774350"
          className="rounded-xl shadow-lg"
        />
      </div>
    </section>
  );
}