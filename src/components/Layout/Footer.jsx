import { Link } from "react-router-dom";
import { Mail, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">

        {/* BRAND */}
        <div>
          <h2 className="text-white text-2xl font-bold mb-4">
            EduJHS
          </h2>
          <p className="text-sm leading-relaxed">
            Helping JHS students in Ghana succeed in BECE through
            engaging lessons, quizzes, and smart learning tools.
          </p>

          {/* SOCIALS */}
          <div className="flex gap-4 mt-6">
            <a href="#" className="hover:text-white transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Instagram size={20} />
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/subjects" className="hover:text-white">
                Subjects
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white">
                Login
              </Link>
            </li>
          </ul>
        </div>

        {/* SUBJECTS */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Subjects
          </h3>
          <ul className="space-y-3 text-sm">
            <li>Mathematics</li>
            <li>English Language</li>
            <li>Integrated Science</li>
            <li>Social Studies</li>
            <li>ICT</li>
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Subscribe
          </h3>
          <p className="text-sm mb-4">
            Get updates, new lessons, and exam tips.
          </p>

          <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
            <input
              type="email"
              placeholder="Your email"
              className="bg-transparent px-3 py-2 w-full text-sm outline-none"
            />
            <button className="bg-blue-600 px-3 py-2 hover:bg-blue-700">
              <Mail size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-800"></div>

      {/* BOTTOM */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">

        <p>
          © {new Date().getFullYear()} EduJHS Ghana. All rights reserved.
        </p>

         <p>
    Developed by{" "}
    <a
      href="https://linkpii.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline"
    >
      Linkpii
    </a>
  </p>

        <div className="flex gap-6">
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}