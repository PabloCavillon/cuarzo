import Reveal from "./components/Reveal";
import "./cuarzo.css";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="landing flex-1">
      <Reveal />
      {children}
    </div>
  );
}
