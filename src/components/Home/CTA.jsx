import { Link } from "react-router-dom";
import { isSignedIn, startPath } from "./useStartLearning";

export default function CTA() {
  const signedIn = isSignedIn();
  return (
    <section className="bg-ink text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight tracking-[-0.015em] max-w-[20ch]">
            {signedIn ? "Pick up where you left off." : "Start with one lesson today."}
          </h2>
          <p className="mt-3 text-lg text-white/80">Where learning knows no limit.</p>
        </div>
        <Link
          to={startPath()}
          className="self-start md:self-auto inline-flex items-center justify-center rounded-xl bg-flame px-8 py-4 text-lg font-bold text-ink-deep shadow-[0_4px_0_var(--color-flame-deep)] hover:bg-[#f59a33] active:translate-y-[2px] active:shadow-[0_2px_0_var(--color-flame-deep)] transition"
        >
          {signedIn ? "Continue learning" : "Start learning free"}
        </Link>
      </div>
    </section>
  );
}
