import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import WhyCuarzo from "./components/WhyCuarzo";
import ValueProp from "./components/ValueProp";
import Portfolio from "./components/Portfolio";
import Pricing from "./components/Pricing";
import CustomWork from "./components/CustomWork";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <WhyCuarzo />
        <ValueProp />
        <Portfolio />
        <Pricing />
        <CustomWork />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
