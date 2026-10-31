import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import ValueProp from "./components/ValueProp";
import WhyCuarzo from "./components/WhyCuarzo";
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
        <ValueProp />
        <WhyCuarzo />
        <Pricing />
        <CustomWork />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
