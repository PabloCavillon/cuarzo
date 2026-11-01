import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import ValueProp from "./components/ValueProp";
import Team from "./components/Team";
import WhyCuarzo from "./components/WhyCuarzo";
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
        <Team />
        <WhyCuarzo />
        <CustomWork />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
