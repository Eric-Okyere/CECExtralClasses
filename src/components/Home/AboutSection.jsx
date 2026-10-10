import { Link } from "react-router-dom";
import { startPath } from "./useStartLearning";

const PARENT_POINTS = [
  {
    title: "One account, every child",
    body: "Add each child with their own class. Switch between them from the menu.",
  },
  {
    title: "See how they are doing",
    body: "Scores, XP and finished lessons for each child, all in one place.",
  },
  {
    title: "Plan the week",
    body: "Build a study timetable together so extra classes fit around school.",
  },
  {
    title: "Tell us how your child learns",
    body: "Record any visual, hearing or learning needs when you set up their profile.",
  },
];

// Small illustration of the parent view. Names and numbers are examples.
function ParentPreview() {
  const kids = [
    { name: "Esi", cls: "Basic 4", done: 14, of: 20, xp: 112 },
    { name: "Kwame", cls: "Basic 8", done: 9, of: 24, xp: 64 },
  ];
  return (
    <div className="rounded-2xl bg-white border border-rule p-6 sm:p-7 shadow-[0_24px_48px_-32px_rgba(22,25,87,0.5)]">
      <p className="text-sm text-slate-ink">Example parent view</p>
      <ul className="mt-5 space-y-6">
        {kids.map((k) => (
          <li key={k.name}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display font-semibold text-xl text-ink-deep">{k.name}</span>
              <span className="text-sm text-slate-ink">{k.cls}</span>
            </div>
            <div className="mt-3 h-2.5 rounded-full bg-mist overflow-hidden" aria-hidden="true">
              <div className="h-full rounded-full bg-leaf" style={{ width: `${(k.done / k.of) * 100}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-sm text-slate-ink">
              <span>
                {k.done} of {k.of} lessons finished
              </span>
              <span className="font-bold text-flame-deep">{k.xp} XP</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutSection() {
  return (
    <>
      <section className="bg-mist">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="font-display font-extrabold text-ink-deep text-4xl leading-tight tracking-[-0.015em] max-w-[18ch]">
              For parents who want to keep an eye on things
            </h2>
            <dl className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-7">
              {PARENT_POINTS.map((p) => (
                <div key={p.title}>
                  <dt className="font-bold text-ink-deep">{p.title}</dt>
                  <dd className="mt-1.5 text-slate-ink leading-relaxed">{p.body}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ParentPreview />
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <h2 className="font-display font-extrabold text-ink-deep text-3xl sm:text-4xl leading-tight tracking-[-0.015em]">
            About CEC Extra Classes
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-[1.7] text-slate-ink">
            <p>
              CEC Extra Classes is an online learning platform from the Children’s Empowerment Center. It adds to
              what children learn in the classroom with affordable lessons and practice they can use at home,
              built on the official Ghanaian curriculum.
            </p>
            <p>
              Our mission is to make extra classes something learners enjoy and to make sure no student is left
              behind, whether they are catching up or moving ahead.
            </p>
          </div>
          <Link
            to={startPath()}
            className="mt-8 inline-block font-bold text-ink underline decoration-flame decoration-2 underline-offset-4 hover:text-flame-deep"
          >
            Set up your family account
          </Link>
        </div>
      </section>
    </>
  );
}
