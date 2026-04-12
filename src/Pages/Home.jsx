import AboutSection from "../components/Home/AboutSection";
import CTA from "../components/Home/CTA";
import Features from "../components/Home/Features";
import Hero from "../components/Home/Hero";
import SubjectsSection from "../components/Home/SubjectSection";
import Testimonials from "../components/Home/Testimonials";
import MainLayout from "../components/Layout/MainLayout";


export default function Home() {
  return (
    <MainLayout>
      <Hero />
      <AboutSection />
      <SubjectsSection />
      <Features />
      <Testimonials />
      <CTA />
    </MainLayout>
  );
}