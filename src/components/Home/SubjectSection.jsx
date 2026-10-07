import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../services/BaseUrl";
import { startPath } from "./useStartLearning";

const CLASSES = [
  { label: "Basic 7", level: "JHS 1" },
  { label: "Basic 8", level: "JHS 2" },
  { label: "Basic 9", level: "JHS 3" },
];

// Shown while loading, or if the server can't be reached.
const CCP_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Science",
  "Social Studies",
  "Computing",
  "Career Technology",
  "Religious and Moral Education",
];

// Logo colours, one per subject, used only as a small marker.
const MARKERS = ["bg-flame", "bg-leaf", "bg-sky", "bg-ink", "bg-pen"];

const toTitle = (s = "") =>
  s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(And|Of|The)\b/g, (m) => m.toLowerCase());

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function SubjectsSection() {
  const [active, setActive] = useState(0);
  const [subjects, setSubjects] = useState(null); // null = loading / unavailable

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}subjects`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (!cancelled && Array.isArray(json?.data)) setSubjects(json.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    const level = CLASSES[active].level;
    const live = (subjects || []).filter((s) => s.level === level);
    if (live.length === 0) {
      return CCP_SUBJECTS.map((name) => ({ name, strands: null, lessons: null }));
    }
    return live
      .map((s) => {
        const strands = s.strands?.length || 0;
        const subStrands = (s.strands || []).flatMap((st) => st.subStrands || []);
        const lessons = subStrands.reduce((n, ss) => n + (ss?.lessons?.length || 0), 0);
        return { name: toTitle(s.name), strands, lessons };
      })
      .sort((a, b) => (b.lessons || 0) - (a.lessons || 0) || a.name.localeCompare(b.name));
  }, [subjects, active]);

  const onKeyDown = (e) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + CLASSES.length) % CLASSES.length;
    setActive(next);
    e.currentTarget.querySelectorAll('[role="tab"]')[next]?.focus();
  };

  return (
    <section id="subjects" className="bg-mist scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24 grid lg:grid-cols-[1fr_1.6fr] gap-12">
        <div>
          <h2 className="font-display font-extrabold text-ink-deep text-4xl leading-tight tracking-[-0.015em]">
            Your class, your subjects
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-ink max-w-[40ch]">
            Lessons are arranged the way your textbook is: subject, then strand, then sub-strand. Pick your
            class to see what is ready.
          </p>

          <div role="tablist" aria-label="Class" className="mt-8 inline-flex rounded-xl bg-white p-1 border border-rule" onKeyDown={onKeyDown}>
            {CLASSES.map((c, i) => (
              <button
                key={c.label}
                role="tab"
                type="button"
                aria-selected={active === i}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${
                  active === i ? "bg-ink text-white" : "text-ink hover:bg-mist"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div role="tabpanel" aria-label={CLASSES[active].label}>
          <ul className="divide-y divide-rule border-y border-rule">
            {rows.map((row, i) => (
              <li key={row.name}>
                <Link
                  to={startPath()}
                  className="group flex items-center gap-4 py-5 px-1 hover:bg-white/70 transition-colors"
                >
                  <span className={`h-9 w-1.5 rounded-full ${MARKERS[i % MARKERS.length]}`} aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-display font-semibold text-xl text-ink-deep group-hover:text-ink">
                      {row.name}
                    </span>
                    {row.strands !== null && (
                      <span className="block text-sm text-slate-ink mt-0.5">{plural(row.strands, "strand")}</span>
                    )}
                  </span>
                  {row.lessons !== null && (
                    <span className={`text-sm font-bold whitespace-nowrap ${row.lessons ? "text-leaf" : "text-slate-ink/70"}`}>
                      {row.lessons ? plural(row.lessons, "lesson") : "Coming soon"}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
