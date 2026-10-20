import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div className="page-shell error-page">
      <span className="eyebrow">FORA DO DESENHO / 404</span>
      <h1>
        Esse traço ainda
        <br />
        não existe.
      </h1>
      <p className="muted">A página que você procura não foi encontrada.</p>
      <Link href="/" className="button">
        <ArrowLeft size={16} /> Voltar ao início
      </Link>
    </div>
  );
}
