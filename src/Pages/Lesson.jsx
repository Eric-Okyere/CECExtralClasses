// src/pages/Lesson.jsx
import Navbar from "../components/Navbar";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";

import mathVideo from "../assets/Lesson.mp4";
import scienceVideo from "../assets/ScienceLesson.mp4";
import clapSound from "../assets/Clapping_Sound_Effect(256k).mp3";
import oohSound from "../assets/Ooh_-_Sound.mp3";

export default function Lesson() {
  const { subject, level, sub } = useParams();
  const decodedSub = decodeURIComponent(sub);
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const strand = decodeURIComponent(params.get("strand") || "");

  const [quizStarted, setQuizStarted] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSad, setShowSad] = useState(false);
  const [selected, setSelected] = useState(null);
  const [time, setTime] = useState(30);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  const clapAudio = useRef(null);
  const oohAudio = useRef(null);

  // ======================
  // MATH QUIZ
  // ======================
  const mathQuiz = [
    { question: "What is the place value of 5 in 354?", options: ["5", "50", "5 tens", "500"], answer: "50", explanation: "5 is in the tens place, so its value is 50." },
    { question: "Which is the largest number?", options: ["435", "543", "345", "534"], answer: "543", explanation: "543 is larger than 435, 345, and 534." },
    { question: "What is the smallest 3-digit number?", options: ["100", "101", "99", "110"], answer: "100", explanation: "100 is the smallest 3-digit number." },
    { question: "Convert 300 into hundreds and tens", options: ["3 hundreds 0 tens", "30 hundreds 0 tens", "3 tens 0 hundreds", "300 hundreds 0 tens"], answer: "3 hundreds 0 tens", explanation: "300 has 3 hundreds and 0 tens." },
    { question: "Which number comes next: 12, 22, 32, ?", options: ["42", "33", "52", "40"], answer: "42", explanation: "The pattern increases by 10 each time." },
    { question: "How many ones in 1,234?", options: ["4", "3", "2", "1"], answer: "4", explanation: "The ones place is 4." },
    { question: "What is 7 in the tens place worth?", options: ["7", "70", "700", "0.7"], answer: "70", explanation: "7 in the tens place is 70." },
    { question: "Which is an even number?", options: ["135", "246", "357", "579"], answer: "246", explanation: "246 ends in 6, an even number." },
    { question: "Write 1,056 in expanded form", options: ["1000 + 50 + 6", "1000 + 50 + 6 + 0", "1000 + 50 + 6 + 10", "100 + 0 + 50 + 6"], answer: "1000 + 50 + 6", explanation: "1,056 = 1000 + 50 + 6." },
    { question: "Round 467 to the nearest ten", options: ["470", "460", "400", "500"], answer: "470", explanation: "467 rounds to 470." },
    { question: "What is the digit in the hundreds place in 3,582?", options: ["5", "3", "8", "2"], answer: "5", explanation: "The hundreds digit is 5." },
    { question: "Convert 0.75 to fraction", options: ["3/4", "7/5", "1/2", "2/1"], answer: "3/4", explanation: "0.75 = 3/4." },
    { question: "Write 600 in words", options: ["Six hundred", "Six thousand", "Six hundred and six", "Six"], answer: "Six hundred", explanation: "600 in words is Six hundred." },
    { question: "Which number is divisible by 5?", options: ["120", "123", "127", "132"], answer: "120", explanation: "120 ends with 0, divisible by 5." },
    { question: "What is 9 tens plus 4 ones?", options: ["94", "90", "14", "100"], answer: "94", explanation: "9 tens = 90, plus 4 = 94." },
    { question: "Find the sum: 345 + 212", options: ["557", "555", "547", "5570"], answer: "557", explanation: "345 + 212 = 557." },
    { question: "Which is a 4-digit number?", options: ["3456", "456", "5678", "Both A and C"], answer: "Both A and C", explanation: "3456 and 5678 are 4-digit numbers." },
    { question: "Write 0.5 as a fraction", options: ["1/2", "5/10", "2/1", "1/5"], answer: "1/2", explanation: "0.5 = 1/2." },
    { question: "Which number is odd?", options: ["24", "35", "68", "12"], answer: "35", explanation: "35 is odd." },
    { question: "What is 2 hundreds + 3 tens + 4 ones?", options: ["234", "243", "324", "342"], answer: "234", explanation: "2 hundreds + 3 tens + 4 ones = 234." },
  ];

  // ======================
  // SCIENCE QUIZ
  // ======================
  const scienceQuiz = [
    { question: "What is matter?", options: ["Anything with mass and space", "Only solids", "Only liquids", "Only gases"], answer: "Anything with mass and space", explanation: "Matter is anything with mass and takes up space." },
    { question: "Which is a solid?", options: ["Water", "Air", "Stone", "Oil"], answer: "Stone", explanation: "Stone is solid." },
    { question: "Which is a liquid?", options: ["Milk", "Wood", "Iron", "Stone"], answer: "Milk", explanation: "Milk is a liquid." },
    { question: "Which is a gas?", options: ["Air", "Water", "Oil", "Sand"], answer: "Air", explanation: "Air is a gas." },
    { question: "Which material floats?", options: ["Wood", "Stone", "Iron", "Glass"], answer: "Wood", explanation: "Wood floats because it is less dense than water." },
    { question: "Which material sinks?", options: ["Feather", "Plastic", "Stone", "Leaf"], answer: "Stone", explanation: "Stone sinks in water." },
    { question: "Which conducts electricity?", options: ["Plastic", "Rubber", "Copper", "Wood"], answer: "Copper", explanation: "Copper is a good conductor." },
    { question: "Which is an insulator?", options: ["Copper", "Aluminium", "Plastic", "Iron"], answer: "Plastic", explanation: "Plastic does not conduct electricity." },
    { question: "Which is flexible?", options: ["Rubber", "Stone", "Glass", "Iron"], answer: "Rubber", explanation: "Rubber can bend easily." },
    { question: "Which is brittle?", options: ["Glass", "Rubber", "Plastic", "Wood"], answer: "Glass", explanation: "Glass breaks easily." },
    { question: "What is density?", options: ["Mass per volume", "Color", "Shape", "Weight"], answer: "Mass per volume", explanation: "Density = mass/volume." },
    { question: "Which is dense?", options: ["Feather", "Air", "Iron", "Foam"], answer: "Iron", explanation: "Iron is dense." },
    { question: "Melting is?", options: ["Solid to liquid", "Liquid to gas", "Gas to solid", "None"], answer: "Solid to liquid", explanation: "Melting turns solid into liquid." },
    { question: "Freezing is?", options: ["Liquid to solid", "Solid to gas", "Gas to liquid", "None"], answer: "Liquid to solid", explanation: "Freezing turns liquid into solid." },
    { question: "Which is transparent?", options: ["Glass", "Wood", "Metal", "Stone"], answer: "Glass", explanation: "Glass is transparent." },
    { question: "Which is opaque?", options: ["Glass", "Air", "Wood", "Water"], answer: "Wood", explanation: "Wood is opaque." },
    { question: "Which changes state when heated?", options: ["Ice", "Stone", "Wood", "Iron"], answer: "Ice", explanation: "Ice melts when heated." },
    { question: "What is flexibility?", options: ["Bending easily", "Hardness", "Weight", "Color"], answer: "Bending easily", explanation: "Flexibility is the ability to bend easily." },
    { question: "Which floats?", options: ["Leaf", "Stone", "Iron", "Glass"], answer: "Leaf", explanation: "Leaf floats on water." },
    { question: "Which sinks?", options: ["Wood", "Plastic", "Iron", "Leaf"], answer: "Iron", explanation: "Iron sinks in water." },
  ];

  // ======================
  // SELECT LESSON
  // ======================
  const lesson =
    subject === "Mathematics"
      ? { video: mathVideo, notes: "Math lesson notes", quiz: mathQuiz }
      : subject === "Integrated Science"
      ? { video: scienceVideo, notes: "Science lesson notes", quiz: scienceQuiz }
      : null;

  // ======================
  // TIMER
  // ======================
  useEffect(() => {
    if (!quizStarted || showScore) return;
    const timer = setInterval(() => {
      setTime(prev => (prev === 1 ? (setShowScore(true), 0) : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, showScore]);

  // ======================
  // HANDLE ANSWER
  // ======================
  const handleAnswer = (opt) => {
    setSelected(opt);
    let newScore = score;

    if (opt === lesson.quiz[currentQuestion].answer) {
      newScore++;
      setScore(newScore);
      setShowConfetti(true);
      clapAudio.current.play();
      setStreak(streak + 1);
      setXp(xp + 10);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      setShowSad(true);
      oohAudio.current.play();
      setStreak(0);
      setTimeout(() => setShowSad(false), 2000);
    }

    setTimeout(() => {
      const next = currentQuestion + 1;
      setSelected(null);
      if (next < lesson.quiz.length) {
        setCurrentQuestion(next);
        setTime(30);
      } else {
        setShowScore(true);
        localStorage.setItem(
          `${subject}-${level}-${decodedSub}`,
          JSON.stringify({
            score: newScore,
            total: lesson.quiz.length,
            strand,
          })
        );
      }
    }, 1000);
  };

  const handleStartQuiz = () => {
    if (!videoWatched) return alert("Watch the video first!");
    setQuizStarted(true);
  };

  const handleViewResults = () => navigate("/dashboard");

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={2000} gravity={0.5} />}
      {showSad && (
        <div className="fixed inset-0 flex items-center justify-center text-6xl animate-bounce z-50">
          😭😢😢😢😭😢
        </div>
      )}
      
      <audio ref={clapAudio} src={clapSound} />
      <audio ref={oohAudio} src={oohSound} />

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold">{subject} - {level}</h1>
        <p className="text-blue-600">{strand}</p>
        <p className="mb-4">{decodedSub}</p>

        {lesson && (
          <video className="w-full h-64 rounded mb-6" controls onEnded={() => setVideoWatched(true)}>
            <source src={lesson.video} type="video/mp4" />
          </video>
        )}

        {!quizStarted && (
          <button onClick={handleStartQuiz} className="bg-blue-600 text-white p-3 w-full rounded hover:bg-blue-700">
            Start Quiz
          </button>
        )}

        {quizStarted && lesson && lesson.quiz[currentQuestion] && (
          <div className="bg-white p-5 mt-4 rounded shadow">
            {!showScore ? (
              <>
                <p className="mb-2 font-semibold">Time: {time}s</p>
                <p className="mb-4">{lesson.quiz[currentQuestion].question}</p>

                {lesson.quiz[currentQuestion].options.map(opt => {
                  let color = "bg-blue-600";
                  if (selected) {
                    if (opt === lesson.quiz[currentQuestion].answer) color = "bg-green-500";
                    else if (opt === selected) color = "bg-red-500";
                  }
                  return (
                    <button key={opt} onClick={() => handleAnswer(opt)} className={`block w-full text-white p-2 mt-2 rounded ${color}`}>
                      {opt}
                    </button>
                  );
                })}

                {selected && lesson.quiz[currentQuestion].explanation && (
                  <p className="mt-3 text-sm text-gray-600">{lesson.quiz[currentQuestion].explanation}</p>
                )}

                <p className="mt-2 text-sm text-gray-700">Streak: {streak} | XP: {xp}</p>
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-4">🎉 Quiz Completed!</h2>
                <button onClick={handleViewResults} className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">
                  View Results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}