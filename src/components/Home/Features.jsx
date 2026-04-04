export default function Features() {
  const features = [
    { icon: "🎥", title: "Video Lessons", desc: "Easy explanations" },
    { icon: "📝", title: "Interactive Quizzes", desc: "Test yourself" },
    { icon: "📊", title: "Track Progress", desc: "See improvement" },
  ];

  return (
    <section className="bg-white py-16 px-6">
      <h2 className="text-3xl font-bold text-center">
        Why Choose EduJHS?
      </h2>

      <div className="grid md:grid-cols-3 gap-8 mt-10 max-w-6xl mx-auto">
        {features.map((f) => (
          <div key={f.title} className="text-center">
            <div className="text-4xl">{f.icon}</div>
            <h3 className="text-xl font-semibold mt-4">{f.title}</h3>
            <p className="text-gray-500 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}