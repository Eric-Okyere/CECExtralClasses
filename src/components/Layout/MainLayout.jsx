import FeedbackModal from "../FeedbackModal";
import Navbar from "../Navbar";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />

      <main className="grow">
        {children}
      </main>

      <FeedbackModal />

      <Footer />
    </div>
  );
}