import Navbar from "../Navbar";
import Footer from "./Footer";

// The feedback button is added for every page in App.jsx, so it is not repeated here.
export default function MainLayout({ children }) {
  return (
    <div className="landing bg-white min-h-screen flex flex-col font-body text-slate-ink antialiased">
      <Navbar />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}
