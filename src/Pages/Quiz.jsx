import Navbar from "../components/Navbar";
import QuizCard from "../components/QuizCard";

export default function Quiz() {
  return (
    <div>
      <Navbar />

      <div className="p-6">
        <QuizCard
          question="What is 1/2 + 1/2?"
          options={["1", "2", "1/4", "0"]}
          correctAnswer="1"
        />
      </div>
    </div>
  );
}