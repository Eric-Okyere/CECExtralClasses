import { Link } from "react-router-dom";
import ExerciseBook from "./ExerciseBook";
import Logo from "../../assets/Logo.jpeg";
import { isSignedIn, startPath } from "./useStartLearning";

export default function Hero() {
  const signedIn = isSignedIn();

  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-28 grid md:grid-cols-[1.05fr_1fr] gap-14 md:gap-16 items-center">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <img src={Logo} alt="CEC Extra Classes logo" className="h-16 w-16 sm:h-24 sm:w-24 object-contain shrink-0" />
            <div>
              <p className="font-display font-extrabold text-ink-deep text-xl leading-tight">CEC Extra Classes</p>
              <p className="font-hand text-leaf text-[1.3rem] sm:text-[1.7rem] leading-tight whitespace-nowrap">Where Learning Knows No Limit</p>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-ink-deep text-[2.6rem] leading-[1.05] sm:text-6xl sm:leading-[1.02] tracking-[-0.02em] max-w-[14ch]">
            Short video lessons, then a quiz that marks you straight away.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-ink max-w-[46ch]">
            Every lesson follows the Ghanaian curriculum your teachers use in class, one topic at a time.
            Watch, answer, see what you got right, and go into your exams ready.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              to={startPath()}
              className="inline-flex items-center justify-center rounded-xl bg-flame px-7 py-4 text-lg font-bold text-ink-deep shadow-[0_4px_0_var(--color-flame-deep)] hover:bg-[#f59a33] active:translate-y-[2px] active:shadow-[0_2px_0_var(--color-flame-deep)] transition"
            >
              {signedIn ? "Continue learning" : "Start learning free"}
            </Link>
            <a href="#subjects" className="font-bold text-ink underline decoration-rule decoration-2 underline-offset-4 hover:decoration-ink">
              See the subjects
            </a>
          </div>

          {!signedIn && (
            <p className="mt-5 text-sm text-slate-ink">Sign in with Google or your email address to begin.</p>
          )}
        </div>

        <ExerciseBook />
      </div>
    </section>
  );
}
