"use client";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-shell error-page">
      <span className="eyebrow">UMA PAUSA NO TRAÇO</span>
      <h1>Algo saiu do desenho.</h1>
      <p className="muted">
        Não foi possível carregar esta área. Tente novamente.
      </p>
      <div className="inline-actions" style={{ justifyContent: "center" }}>
        <button onClick={reset} className="button">
          <RotateCcw size={15} />
          Tentar novamente
        </button>
        <Link href="/" className="button secondary">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
