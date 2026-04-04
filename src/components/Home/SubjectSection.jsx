import { Link } from "react-router-dom";

export default function SubjectsSection() {
  const subjects = [
    "Mathematics",
    "English Language",
    "Integrated Science",
    "Social Studies",
    "ICT",
  ];

  return (
    <section className="py-16 px-6">
      <h2 className="text-3xl font-bold text-center">
        Popular Subjects
      </h2>

      <Link to="/subjects">
        <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-6xl mx-auto">
          {subjects.map((subject) => (
            <div
              key={subject}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold">{subject}</h3>
              <p className="text-gray-500 mt-2">
                Learn with videos and quizzes.
              </p>
            </div>
          ))}
        </div>
      </Link>
    </section>
  );
}