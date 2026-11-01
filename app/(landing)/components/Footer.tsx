import FooterClient from "./FooterClient";

export default function Footer() {
  return (
    <footer className="border-t border-(--line)">
      <FooterClient />
      <div aria-hidden className="wordmark overflow-hidden pt-4">CUARZO</div>
    </footer>
  );
}
