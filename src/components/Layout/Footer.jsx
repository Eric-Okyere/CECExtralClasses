import { Link } from "react-router-dom";
import { Mail, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* TOP SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

        {/* BRAND */}
        <div>
          <h2 className="text-white text-2xl font-black tracking-tight mb-4 uppercase">
            EduJHS
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Helping JHS students in Ghana succeed in BECE through
            engaging lessons, quizzes, and smart learning tools.
          </p>

          {/* SOCIALS */}
          <div className="flex gap-4 mt-6">
            <a 
              href="#" 
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Facebook size={18} />
            </a>
            <a 
              href="#" 
              aria-label="Twitter"
              className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Twitter size={18} />
            </a>
            <a 
              href="#" 
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm font-medium">
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/all-subjects" className="hover:text-white transition-colors">
                Subjects
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white transition-colors">
                Login
              </Link>
            </li>
          </ul>
        </div>

        {/* SUBJECTS */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
            Core Subjects
          </h3>
          <ul className="space-y-3 text-sm text-slate-400 font-medium">
            <li>Mathematics</li>
            <li>English Language</li>
            <li>Integrated Science</li>
            <li>Social Studies</li>
            <li>ICT</li>
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
            Subscribe
          </h3>
          <p className="text-sm text-slate-400 mb-4 font-medium">
            Get updates, new lessons, and exam tips.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
            <input
              type="email"
              placeholder="Your email"
              className="bg-transparent px-4 py-2.5 w-full text-sm text-white placeholder-slate-500 outline-none"
            />
            <button 
              type="submit" 
              aria-label="Submit Email"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 transition-colors flex items-center justify-center"
            >
              <Mail size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-slate-900"></div>

      {/* BOTTOM SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-slate-500 gap-4">
        <p>
          © {new Date().getFullYear()} EduJHS Ghana. All rights reserved.
        </p>

        <p>
          Developed by{" "}
          <a
            href="https://linkpii.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 font-bold transition-colors"
          >
            Linkpii
          </a>
        </p>

        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-slate-300 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}