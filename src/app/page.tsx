import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Calculator from "@/components/Calculator";
import SuccessCases from "@/components/SuccessCases";
import FreeLibrary from "@/components/FreeLibrary";
import Blog from "@/components/Blog";
import Booking from "@/components/Booking";
import AutoQuote from "@/components/AutoQuote";
import AIChat from "@/components/AIChat";
import Resources from "@/components/Resources";
import Testimonials from "@/components/Testimonials";
import Dashboard from "@/components/Dashboard";
import Community from "@/components/Community";
import Promotion from "@/components/Promotion";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Calculator />
        <SuccessCases />
        <FreeLibrary />
        <Blog />
        <Booking />
        <AutoQuote />
        <AIChat />
        <Resources />
        <Testimonials />
        <Dashboard />
        <Community />
        <Promotion />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
