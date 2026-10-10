import { Link } from "react-router-dom";
import { startPath } from "./useStartLearning";
import english from "../../assets/subjects/english.webp";
import mathematics from "../../assets/subjects/mathematics.webp";
import science from "../../assets/subjects/science.webp";
import computing from "../../assets/subjects/computing.webp";
import creativeArts from "../../assets/subjects/creative-arts.webp";
import careerTechnology from "../../assets/subjects/career-technology.webp";

// The subject name and topics are part of each poster, so the alt text repeats them for screen readers.
const POSTERS = [
  { src: english, alt: "English: reading comprehension, grammar and usage, writing skills, speaking and presentation, critical thinking" },
  { src: mathematics, alt: "Mathematics: number and operations, algebra, geometry, problem solving, logical thinking" },
  { src: science, alt: "Science: biology, chemistry, physics, scientific inquiry, real-life applications" },
  { src: computing, alt: "Computing: digital literacy, computer applications, programming basics, internet and online safety, creative digital projects" },
  { src: creativeArts, alt: "Creative Arts: visual arts, music, drama, dance, creative expression" },
  { src: careerTechnology, alt: "Career Technology: design and technology, practical skills, technical drawing, project work, real-world applications" },
];

export default function SubjectPosters() {
  const to = startPath();
  return (
    <section className="bg-white" aria-labelledby="posters-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 md:pb-24">
        <h2 id="posters-heading" className="font-display font-extrabold text-ink-deep text-3xl sm:text-4xl leading-tight tracking-[-0.015em]">
          Explore our subjects
        </h2>
        <p className="mt-3 text-lg text-slate-ink max-w-[52ch]">
          From reading and maths to science, computing, the arts and practical skills.
        </p>

        {/* Swipe row on phones, grid from tablet up */}
        <ul
          role="list"
          className="mt-10 -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 pb-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0"
        >
          {POSTERS.map((p) => (
            <li key={p.src} className="snap-start shrink-0 w-[78%] sm:w-auto">
              <Link
                to={to}
                className="block overflow-hidden rounded-2xl border border-rule bg-mist shadow-[0_16px_32px_-24px_rgba(22,25,87,0.55)] transition-transform hover:-translate-y-1 focus-visible:-translate-y-1"
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  width="512"
                  height="512"
                  loading="lazy"
                  decoding="async"
                  className="block w-full h-auto aspect-square object-cover"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
