import { useState } from "react";

// Real questions taken from CEC lesson quizzes.
const QUESTIONS = [
  {
    subject: "Mathematics",
    level: "Basic 7",
    topic: "Number and numeration",
    question: "What is the place value of 5 in 354?",
    options: ["5", "50", "500", "5000"],
    answer: "50",
    explanation: "5 is in the tens place, so its value is 50.",
  },
  {
    subject: "Religious and Moral Education",
    level: "Basic 7",
    topic: "God, His nature and attributes",
    question: "Which attribute of God describes Him as being all-knowing?",
    options: ["Omniscience", "Omnipotence", "Omnipresence", "Eternity"],
    answer: "Omniscience",
    explanation: "Omniscience means perfect knowledge of everything.",
  },
  {
    subject: "Mathematics",
    level: "Basic 7",
    topic: "Number and numeration",
    question: "Which is the largest number?",
    options: ["435", "543", "345", "534"],
    answer: "543",
    explanation: "Compare the hundreds first: 5 hundreds, then 4 tens beats 3 tens.",
  },
];

const Tick = () => (
  <svg viewBox="0 0 40 32" className="w-9 h-7 text-pen" aria-hidden="true">
    <path className="pen-stroke" d="M3 18 L14 28 L37 3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Cross = () => (
  <svg viewBox="0 0 32 32" className="w-7 h-7 text-pen" aria-hidden="true">
    <path className="pen-stroke" d="M5 5 L27 27 M27 5 L5 27" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default function ExerciseBook() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, done: 0 });

  const q = QUESTIONS[index];
  const answered = picked !== null;
  const correct = picked === q.answer;

  const choose = (option) => {
    if (answered) return;
    setPicked(option);
    setScore((s) => ({ right: s.right + (option === q.answer ? 1 : 0), done: s.done + 1 }));
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => (i + 1) % QUESTIONS.length);
  };

  return (
    <div className="relative">
      {/* Exercise book cover peeking out behind the page */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg bg-ink" aria-hidden="true" />

      <figure
        className="exercise-page relative rounded-lg border border-rule shadow-[0_20px_40px_-24px_rgba(22,25,87,0.45)] pl-16 pr-6 sm:pr-8 pt-5 pb-7 min-h-[29.25rem]"
        aria-label="Try a sample question"
      >
        <figcaption className="flex items-baseline justify-between gap-4 leading-8 text-sm text-slate-ink">
          <span>
            {q.subject}, {q.level}
          </span>
          <span className="font-hand text-2xl text-pen leading-none" aria-live="polite">
            {score.done > 0 ? `${score.right}/${score.done}` : ""}
          </span>
        </figcaption>
        <p className="text-sm text-slate-ink/80 leading-8">{q.topic}</p>

        <p className="font-display font-semibold text-ink-deep text-2xl leading-8 mt-8 mb-8 max-w-[22ch]">
          {q.question}
        </p>

        <ul role="list">
          {q.options.map((option, i) => {
            const isAnswer = option === q.answer;
            const isPicked = option === picked;
            const showTick = answered && isAnswer;
            const showCross = answered && isPicked && !isAnswer;
            return (
              <li key={option} className="relative">
                <span className="absolute -left-12 top-0 h-8 w-9 flex items-center justify-center">
                  {showTick && <Tick />}
                  {showCross && <Cross />}
                </span>
                <button
                  type="button"
                  onClick={() => choose(option)}
                  disabled={answered}
                  aria-pressed={isPicked}
                  className={[
                    "w-full text-left flex items-center gap-3 rounded-md px-3 h-8 text-lg transition-colors",
                    !answered && "hover:bg-flame/10 cursor-pointer",
                    isPicked && !isAnswer && "line-through decoration-pen decoration-2 text-slate-ink",
                    showTick && "text-ink-deep font-bold",
                    answered && !isPicked && !isAnswer && "text-slate-ink/60",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="text-slate-ink/70 w-5">{String.fromCharCode(97 + i)}.</span>
                  {option}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 min-h-[6rem]" aria-live="polite">
          {answered ? (
            <>
              <p className="font-hand text-pen text-[1.65rem] leading-8">
                {correct ? "Very good!" : `It's ${q.answer}.`} {q.explanation}
              </p>
              <button
                type="button"
                onClick={next}
                className="block leading-8 text-ink font-bold underline decoration-flame decoration-2 underline-offset-4 hover:text-flame-deep"
              >
                Next question
              </button>
            </>
          ) : (
            <p className="text-slate-ink leading-8">Pick an answer. The teacher will mark it.</p>
          )}
        </div>
      </figure>
    </div>
  );
}
