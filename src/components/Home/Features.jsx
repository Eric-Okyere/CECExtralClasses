// "How a lesson works" — the real flow of a CEC lesson, in order.
const STEPS = [
  {
    title: "Watch the video parts",
    body: "Each sub-strand is taught in short video parts. Pause and replay as often as you like.",
  },
  {
    title: "The quiz unlocks",
    body: "Once you have watched every part, the quiz opens. Each question gives you 30 seconds.",
  },
  {
    title: "See what you got right",
    body: "Every answer is marked straight away, with a short explanation when you miss one.",
  },
  {
    title: "Track your progress",
    body: "Your score and XP are saved to your dashboard, so you can see which topics still need work.",
  },
];

export default function Features() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-24">
        <h2 className="font-display font-extrabold text-ink-deep text-4xl leading-tight tracking-[-0.015em] max-w-[20ch]">
          How a lesson works
        </h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-4 md:gap-8 relative">
          {/* the line that joins the steps on wide screens */}
          <span className="hidden md:block absolute left-0 right-0 top-5 h-0.5 bg-rule" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <span
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full font-display font-extrabold text-lg ${
                  i === STEPS.length - 1 ? "bg-leaf text-white" : "bg-white text-ink border-2 border-ink"
                }`}
              >
                {i + 1}
              </span>
              <h3 className="mt-5 font-display font-semibold text-xl text-ink-deep">{s.title}</h3>
              <p className="mt-2 text-slate-ink leading-relaxed max-w-[32ch]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
