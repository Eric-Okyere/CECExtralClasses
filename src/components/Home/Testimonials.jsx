export default function Testimonials() {
  const data = [
    { text: "This app helped me pass maths!", name: "Ama" },
    { text: "Great for BECE prep!", name: "Kofi" },
    { text: "I learn anytime!", name: "Adjoa" },
  ];

  return (
    <section className="bg-gray-100 py-16 px-6">
      <h2 className="text-3xl font-bold text-center">
        What Students Say
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-6xl mx-auto">
        {data.map((t, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">“{t.text}”</p>
            <h4 className="mt-4 font-semibold">– {t.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}