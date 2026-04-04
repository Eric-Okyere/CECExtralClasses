import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="bg-blue-600 text-white py-16 text-center">
      <h2 className="text-3xl font-bold">
        Start Learning Today
      </h2>

      <p className="mt-4">
        Join thousands of students preparing for BECE
      </p>

      <Link
        to="/register"
        className="mt-6 inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold"
      >
        Get Started
      </Link>
    </section>
  );
}