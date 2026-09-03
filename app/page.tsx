import NavbarTransparent from "./section/NavbarTransparent";
import Hero from "./section/Hero";
import Problem from "./section/Problem";
import Features from "./components/Features";
import AppShowcase from "./components/AppShowcase";
import EnergyEstimate from "./section/EnergyEstimate";
import HowItWorks from "./components/HowItWorks";
import FinalCta from "./components/FinalCta";
import Footer from "./section/Footer";

export default function Home() {
  return (
    <main id="top" className="overflow-x-clip bg-farad-ivory text-farad-ink">
      <NavbarTransparent />
      <Hero />
      <Problem />
      <Features />
      <AppShowcase />
      <EnergyEstimate />
      <HowItWorks />
      <FinalCta />
      <Footer />
    </main>
  );
}
