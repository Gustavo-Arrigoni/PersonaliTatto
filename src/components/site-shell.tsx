"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Menu,
  X,
  ArrowRight,
  LogOut,
  UserRound,
  Instagram,
  MoveUpRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDemo } from "@/lib/demo-store";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="PersonaliTatto — início">
      <svg
        width="30"
        height="38"
        viewBox="0 0 30 38"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 1 27 8v15L15 37 3 23V8L15 1Z"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <path
          d="M15 7v23M8 11l14 12M22 11 8 23M10 7l10 23M20 7 10 30"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <path
          d="m3 8 12 7 12-7M3 23l12-8 12 8"
          stroke="currentColor"
          strokeWidth=".7"
        />
      </svg>
      {!compact && (
        <span>
          personali<span className="brand-light">tatto</span>
          <i>®</i>
        </span>
      )}
    </Link>
  );
}
const nav = [
  { href: "/", label: "Início" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/estudios/", label: "Explorar estúdios" },
  { href: "/galeria/", label: "Galeria" },
  { href: "/planos/", label: "Sou tatuador" },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { state, logout } = useDemo();
  useEffect(() => {
    const run = () => setScrolled(window.scrollY > 20);
    run();
    window.addEventListener("scroll", run, { passive: true });
    return () => window.removeEventListener("scroll", run);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);
  const destination =
    state.session?.role === "admin"
      ? "/admin/"
      : state.session?.role === "studio"
        ? "/estudio/painel/"
        : "/meus-projetos/";
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-wrap">
          <Brand />
          <nav className="desktop-nav" aria-label="Navegação principal">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={pathname === n.href ? "active" : ""}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <span className="demo-pill">
              <span /> DEMO
            </span>
            {state.session ? (
              <>
                <Link href={destination} className="account-link">
                  <UserRound size={16} />
                  <span>{state.session.name.split(" ")[0]}</span>
                </Link>
                <button
                  type="button"
                  className="icon-button logout"
                  title="Sair do perfil de demonstração"
                  onClick={logout}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link className="login-link" href="/entrar/">
                  Entrar
                </Link>
                <Link className="button nav-cta" href="/cadastro/">
                  Criar conta <ArrowUpRight size={15} />
                </Link>
              </>
            )}
            <button
              className="icon-button menu-toggle"
              aria-label={menu ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {menu && (
        <nav className="mobile-nav" aria-label="Navegação mobile">
          {nav.map((n, i) => (
            <Link key={n.href} href={n.href} onClick={() => setMenu(false)}>
              <span className="muted">0{i + 1}</span>
              {n.label}
              <ArrowUpRight />
            </Link>
          ))}
          <Link href="/simulador/" onClick={() => setMenu(false)}>
            Abrir prévia 3D <ArrowUpRight />
          </Link>
          <Link
            href={state.session ? destination : "/entrar/"}
            onClick={() => setMenu(false)}
          >
            {state.session ? "Minha área" : "Entrar na conta"}
            <UserRound />
          </Link>
          <p className="muted">
            Ambiente de demonstração. Dados salvos apenas neste navegador.
          </p>
        </nav>
      )}
      <main id="conteudo">{children}</main>
      <footer className="site-footer">
        <div className="container footer-top">
          <div>
            <Brand />
            <p>
              Histórias na pele.
              <br />
              Identidade em cada traço.
            </p>
            <span className="footer-demo">MVP VISUAL · DADOS FICTÍCIOS</span>
          </div>
          <div>
            <span className="footer-label">EXPLORE</span>
            <Link href="/estudios/">
              Encontre seu estúdio <MoveUpRight size={13} />
            </Link>
            <Link href="/galeria/">Galeria de artes</Link>
            <Link href="/simulador/">Prévia do simulador 3D</Link>
            <Link href="/meus-projetos/">Meus projetos</Link>
          </div>
          <div>
            <span className="footer-label">PARA PROFISSIONAIS</span>
            <Link href="/planos/">Conheça os planos</Link>
            <Link href="/cadastro/?tipo=profissional">
              Cadastre seu estúdio
            </Link>
            <Link href="/estudio/painel/">Área do estúdio</Link>
            <Link href="/admin/">Administração demo</Link>
          </div>
          <div>
            <span className="footer-label">VAMOS CONVERSAR</span>
            <Link href="/contato/">
              Entre em contato <ArrowUpRight size={14} />
            </Link>
            <Link href="/sobre/">Sobre o projeto</Link>
            <span className="social-note">
              <Instagram size={17} /> Redes sociais em breve
            </span>
            <Link href="/cadastro/" className="footer-join">
              Sua próxima história começa aqui <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 PersonaliTatto. Feito para quem carrega arte.</span>
          <div>
            <Link href="/termos/">Termos de uso</Link>
            <Link href="/privacidade/">Privacidade</Link>
            <span className="made-in">
              CRIADO NO BRASIL <span>✳</span>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
