import { Link } from "react-router-dom";
import Logo from "../../assets/Logo.jpeg";
import { startPath } from "../Home/useStartLearning";

export default function Footer() {
  const learn = startPath();
  return (
    <footer className="bg-ink-deep text-white/75 font-body">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={Logo} alt="" className="h-11 w-11 rounded-lg bg-white object-contain p-0.5" />
            <span className="font-display font-extrabold text-xl text-white">CEC Extra Classes</span>
          </Link>
          <p className="mt-2 font-hand text-2xl text-[#7fd48f]">Where Learning Knows No Limit</p>
          <p className="mt-3 max-w-[36ch] leading-relaxed">
            Video lessons and quizzes for learners in Ghana, following the national curriculum.
          </p>
        </div>

        <nav aria-label="Learning">
          <h2 className="font-bold text-white">Learning</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link to={learn} className="hover:text-white">Subjects</Link></li>
            <li><Link to={learn === "/login" ? "/login" : "/timetable"} className="hover:text-white">Study timetable</Link></li>
            <li><Link to="/login" className="hover:text-white">Sign in</Link></li>
          </ul>
        </nav>

        <nav aria-label="About">
          <h2 className="font-bold text-white">About</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link to="/privacy-policy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms of service</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between gap-3 text-sm text-white/60">
          <p>© {new Date().getFullYear()} Children’s Empowerment Center. All rights reserved.</p>
          <p>
            Developed by{" "}
            <a href="https://linkpii.com" target="_blank" rel="noopener noreferrer" className="font-bold text-white/85 hover:text-white">
              Linkpii
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
