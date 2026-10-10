import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../services/BaseUrl";
import { startPath } from "./useStartLearning";

// Friendly names for levels stored in the database. Any other level is shown as it is stored.
const LEVEL_LABELS = { "JHS 1": "Basic 7", "JHS 2": "Basic 8", "JHS 3": "Basic 9" };
const levelLabel = (level) => LEVEL_LABELS[level] || level;

// Sort levels in school order: KG, Basic/Primary 1-9 (JHS 1-3 = Basic 7-9), then SHS.
const levelRank = (level = "") => {
  const l = level.toUpperCase();
  const n = parseInt(l.match(/\d+/)?.[0] || "0", 10);
  if (l.startsWith("KG") || l.startsWith("NURSERY") || l.startsWith("CRECHE")) return n;
  if (l.startsWith("JHS")) return 100 + 6 + n;
  if (l.startsWith("SHS")) return 200 + n;
  if (l.startsWith("BASIC") || l.startsWith("PRIMARY") || l.startsWith("CLASS") || l.startsWith("B")) return 100 + n;
  return 300 + n;
};

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

  // Tabs come from the levels that actually have subjects in the database.
  const classes = useMemo(() => {
    const levels = [...new Set((subjects || []).map((s) => s.level).filter(Boolean))];
    return levels.sort((a, b) => levelRank(a) - levelRank(b) || a.localeCompare(b)).map((level) => ({ level, label: levelLabel(level) }));
  }, [subjects]);
  const current = classes[Math.min(active, Math.max(classes.length - 1, 0))];

  const rows = useMemo(() => {
    const live = current ? (subjects || []).filter((s) => s.level === current.level) : [];
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
  }, [subjects, current]);

  const onKeyDown = (e) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + classes.length) % classes.length;
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
            Lessons are arranged the way your textbook is: subject, then strand, then sub-strand.
            {classes.length > 1 ? " Pick your class to see what is ready." : ""}
          </p>

          {classes.length > 1 && (
          <div role="tablist" aria-label="Class" className="mt-8 flex flex-wrap gap-1 rounded-xl bg-white p-1 border border-rule w-fit max-w-full" onKeyDown={onKeyDown}>
            {classes.map((c, i) => (
              <button
                key={c.label}
                role="tab"
                type="button"
                aria-selected={current?.level === c.level}
                tabIndex={current?.level === c.level ? 0 : -1}
                onClick={() => setActive(i)}
                className={`px-5 py-2.5 rounded-lg font-bold transition-colors ${
                  current?.level === c.level ? "bg-ink text-white" : "text-ink hover:bg-mist"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          )}
        </div>

        <div role={classes.length > 1 ? "tabpanel" : undefined} aria-label={current?.label || "Subjects"}>
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
