"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Images,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  ShieldCheck,
  UserRound,
  Instagram,
  Info,
  MessageCircle,
} from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import type { Studio, TattooArt } from "@/lib/types";

export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function StudioCard({ studio }: { studio: Studio }) {
  const { state } = useDemo();
  const count = state.arts.filter(
    (a) => a.studioId === studio.id && a.published,
  ).length;
  return (
    <Link href={`/estudios/perfil/?id=${studio.id}`} className="studio-card">
      <div className="studio-image">
        <img
          src={studio.image}
          alt={`Ambiente ilustrativo do ${studio.name}`}
          loading="lazy"
        />
        <span className="studio-badge">
          {studio.plan === "pro" ? "STUDIO PRO" : "ESTÚDIO INDEPENDENTE"}
        </span>
        <div className="studio-initials">{studio.initials}</div>
      </div>
      <div className="studio-info">
        <h3>{studio.name}</h3>
        <span className="studio-location">
          <MapPin size={11} />
          {studio.city}, {studio.state}
        </span>
        <div className="studio-tags">
          {studio.styles.slice(0, 3).map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>
        <div className="studio-card-bottom">
          <span>
            <Images size={12} />
            {count} artes na galeria
          </span>
          <span>
            Conhecer estúdio <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
export function ArtCard({
  art,
  onSelect,
}: {
  art: TattooArt;
  onSelect: (a: TattooArt) => void;
}) {
  const { state } = useDemo();
  const studio = state.studios.find((s) => s.id === art.studioId);
  return (
    <button
      className="art-card"
      onClick={() => onSelect(art)}
      aria-label={`Ver arte ${art.name}, ${art.style}`}
    >
      <div className="art-image">
        <span className="art-image-label">
          FLASH / {art.style.toUpperCase()}
        </span>
        <img src={art.image} alt={art.name} loading="lazy" />
        <span className="art-watermark">PERSONALITATTO®</span>
        <span className="art-view">
          <ArrowUpRight size={15} />
        </span>
      </div>
      <div className="art-info">
        <div>
          <h3>{art.name}</h3>
          <p>{studio?.name || "Arte independente"}</p>
        </div>
        <ArrowUpRight size={16} />
      </div>
    </button>
  );
}
export function ArtDialog({
  art,
  onClose,
}: {
  art: TattooArt | null;
  onClose: () => void;
}) {
  const { state } = useDemo();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!art) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = ref.current?.querySelectorAll<HTMLElement>(
          'a[href],button,[tabindex="0"]',
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [art, onClose]);
  if (!art) return null;
  const studio = state.studios.find((s) => s.id === art.studioId);
  const author = state.members.find((m) => m.id === art.authorId);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="art-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="art-title"
        ref={ref}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Fechar detalhes da arte"
        >
          <X size={18} />
        </button>
        <img src={art.image} alt={art.name} />
        <div className="art-modal-content">
          <span className="eyebrow">DESENHO ORIGINAL / DEMO</span>
          <h2 id="art-title">{art.name}</h2>
          <p>{art.description}</p>
          <div className="studio-tags">
            {art.tags.map((t) => (
              <span className="chip" key={t}>
                #{t}
              </span>
            ))}
          </div>
          <div className="art-metadata">
            <span>
              <UserRound size={13} />
              {author?.name || "Artista do estúdio"}
            </span>
            <Link href={`/estudios/perfil/?id=${studio?.id}`}>
              <MapPin size={13} style={{ display: "inline", marginRight: 6 }} />
              {studio?.name}
            </Link>
            <span>
              <ShieldCheck size={13} />
              Arte vinculada ao estúdio de origem
            </span>
          </div>
          <Link
            className="button"
            href={`/simulador/?art=${art.id}&studio=${art.studioId}`}
            onClick={onClose}
          >
            Adicionar a um projeto <ArrowRight size={15} />
          </Link>
          <p style={{ fontSize: 9, marginTop: 15, marginBottom: 0 }}>
            A prévia atual utiliza uma esfera. A projeção de tatuagens sobre o
            corpo será disponibilizada na próxima fase.
          </p>
        </div>
      </div>
    </div>
  );
}
export function StudiosExplorer() {
  const { state } = useDemo();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [style, setStyle] = useState("");
  const studios = state.studios.filter((s) => s.active);
  const cities = [...new Set(studios.map((s) => s.city))].sort();
  const regions = [...new Set(studios.map((s) => s.state))].sort();
  const styles = [...new Set(studios.flatMap((s) => s.styles))].sort();
  const filtered = studios.filter(
    (s) =>
      (!search ||
        normalize(
          `${s.name} ${s.city} ${s.state} ${s.styles.join(" ")}`,
        ).includes(normalize(search))) &&
      (!city || s.city === city) &&
      (!region || s.state === region) &&
      (!style || s.styles.includes(style)),
  );
  const clear = () => {
    setSearch("");
    setCity("");
    setRegion("");
    setStyle("");
  };
  return (
    <div className="page-shell">
      <div className="breadcrumb">
        <Link href="/">Início</Link>
        <ChevronRight size={12} />
        <span>Explorar estúdios</span>
      </div>
      <div className="discovery-top">
        <div className="page-heading" style={{ marginBottom: 0 }}>
          <span className="eyebrow">ENCONTRE SUA CONEXÃO</span>
          <h1>
            O lugar certo para
            <br />a sua próxima história.
          </h1>
          <p>
            {state.session ? `Olá, ${state.session.name.split(" ")[0]}. ` : ""}
            Conheça artistas, descubra estilos e encontre um estúdio que fala a
            sua língua.
          </p>
        </div>
        <Link className="button secondary" href="/meus-projetos/">
          Meus projetos <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="filters">
        <label className="search-field">
          <span className="sr-only">
            Pesquisar por estúdio, cidade ou estado
          </span>
          <Search size={17} />
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busque por estúdio, cidade ou estilo"
          />
        </label>
        <select
          className="input"
          value={city}
          aria-label="Filtrar por cidade"
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Todas as cidades</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="input"
          value={region}
          aria-label="Filtrar por estado"
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">Todos os estados</option>
          {regions.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="input"
          value={style}
          aria-label="Filtrar por estilo"
          onChange={(e) => setStyle(e.target.value)}
        >
          <option value="">Todos os estilos</option>
          {styles.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="results-row">
        <span>
          <b>
            {filtered.length} {filtered.length === 1 ? "estúdio" : "estúdios"}
          </b>{" "}
          para descobrir
        </span>
        <span>Estabelecimentos fictícios · demonstração</span>
      </div>
      {filtered.length ? (
        <div className="studio-grid">
          {filtered.map((s) => (
            <StudioCard key={s.id} studio={s} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={30} style={{ margin: "auto" }} />
          <h3>Nenhum estúdio por aqui.</h3>
          <p>Tente outra cidade, nome ou estilo.</p>
          <button className="button secondary" onClick={clear}>
            Limpar filtros
          </button>
        </div>
      )}
      <p className="future-note">
        <MapPin size={13} />
        Busca por proximidade estará disponível em uma próxima versão, com sua
        autorização.
      </p>
    </div>
  );
}
export function Gallery() {
  const { state } = useDemo();
  const [search, setSearch] = useState("");
  const [style, setStyle] = useState("Todos");
  const [tag, setTag] = useState("");
  const [selected, setSelected] = useState<TattooArt | null>(null);
  const arts = state.arts.filter(
    (a) =>
      a.published && state.studios.some((s) => s.id === a.studioId && s.active),
  );
  const styles = ["Todos", ...new Set(arts.map((a) => a.style))];
  const tags = [...new Set(arts.flatMap((a) => a.tags))].sort();
  const filtered = arts.filter(
    (a) =>
      (style === "Todos" || a.style === style) &&
      (!tag || a.tags.includes(tag)) &&
      normalize(`${a.name} ${a.tags.join(" ")} ${a.description}`).includes(
        normalize(search),
      ),
  );
  return (
    <div className="page-shell">
      <div className="breadcrumb">
        <Link href="/">Início</Link>
        <ChevronRight size={12} />
        <span>Galeria</span>
      </div>
      <div className="page-heading">
        <span className="eyebrow">UM UNIVERSO DE POSSIBILIDADES</span>
        <h1>Encontre seu próximo traço.</h1>
        <p>
          Do primeiro flash à ideia que não sai da cabeça. Explore a seleção de
          artes dos nossos estúdios de demonstração.
        </p>
      </div>
      <div className="style-tabs">
        {styles.map((s) => (
          <button
            key={s}
            className={`style-tab ${s === style ? "active" : ""}`}
            onClick={() => setStyle(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="filters">
        <label className="search-field">
          <span className="sr-only">Pesquisar arte</span>
          <Search size={17} />
          <input
            className="input"
            placeholder="Encontre uma arte pelo nome ou inspiração"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="input"
          aria-label="Filtrar por tag"
        >
          <option value="">Todas as tags</option>
          {tags.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="results-row">
        <span>
          <b>{filtered.length} artes</b> na sua seleção
        </span>
        <span>
          <SlidersHorizontal
            size={12}
            style={{ display: "inline", marginRight: 6 }}
          />
          Curadoria demonstrativa
        </span>
      </div>
      {filtered.length ? (
        <div className="art-grid">
          {filtered.map((a) => (
            <ArtCard key={a.id} art={a} onSelect={setSelected} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>Nenhuma arte encontrada.</h3>
          <p>Outros traços esperam por você.</p>
          <button
            className="button secondary"
            onClick={() => {
              setSearch("");
              setStyle("Todos");
              setTag("");
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
      <p className="gallery-caption">
        <ShieldCheck size={13} />
        As artes pertencem aos seus estúdios de origem. Tags não limitam as
        regiões do corpo.
      </p>
      <ArtDialog art={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
export function StudioProfile() {
  const { state, ready, notify } = useDemo();
  const [studioId, setStudioId] = useState("noir");
  const [style, setStyle] = useState("Todos");
  const [artist, setArtist] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TattooArt | null>(null);
  useEffect(() => {
    setStudioId(
      new URLSearchParams(window.location.search).get("id") || "noir",
    );
  }, []);
  const studio = state.studios.find((s) => s.id === studioId && s.active);
  if (!ready)
    return <div className="page-shell sphere-loading">CARREGANDO ESTÚDIO…</div>;
  if (!studio)
    return (
      <div className="page-shell empty-state">
        <h1>Estúdio indisponível.</h1>
        <p>
          O estúdio não foi encontrado ou está desativado nesta demonstração.
        </p>
        <Link className="button" href="/estudios/">
          Explorar outros estúdios
        </Link>
      </div>
    );
  const members = state.members.filter((m) => m.studioId === studio.id);
  const allArts = state.arts.filter(
    (a) => a.studioId === studio.id && a.published,
  );
  const arts = allArts.filter(
    (a) =>
      (style === "Todos" || a.style === style) &&
      (!artist || a.authorId === artist) &&
      normalize(`${a.name} ${a.tags.join(" ")}`).includes(normalize(search)),
  );
  return (
    <>
      <div className="studio-cover">
        <img src={studio.image} alt={`Imagem ilustrativa do ${studio.name}`} />
      </div>
      <div className="page-shell studio-profile">
        <div className="studio-profile-head">
          <div className="profile-brand">
            <div className="profile-monogram">{studio.initials}</div>
            <div>
              <span className="eyebrow">
                {studio.plan === "pro" ? "STUDIO PRO" : "ESTÚDIO INDEPENDENTE"}{" "}
                · DEMONSTRAÇÃO
              </span>
              <h1>{studio.name}</h1>
              <span className="studio-location">
                <MapPin size={13} />
                {studio.city}, {studio.state}
              </span>
            </div>
          </div>
          <div className="inline-actions">
            <button
              className="button secondary"
              onClick={() =>
                notify(
                  "Contato demonstrativo. Nenhuma mensagem será enviada a terceiros.",
                )
              }
            >
              <MessageCircle size={15} />
              Contato demo
            </button>
            <Link className="button" href={`/simulador/?studio=${studio.id}`}>
              Criar meu projeto <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <div className="studio-about">
          <div>
            <p>{studio.description}</p>
            <div className="studio-tags">
              {studio.styles.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="studio-contact">
            <div>
              <MapPin size={15} />
              <span>
                {studio.address}
                <br />
                <small>
                  Endereço ilustrativo · {studio.city}, {studio.state}
                </small>
              </span>
            </div>
            <div>
              <Instagram size={15} />
              <span>
                {studio.instagram}
                <br />
                <small>Perfil fictício, sem link externo</small>
              </span>
            </div>
            <div>
              <ShieldCheck size={15} />
              <span>Artes autorais vinculadas a este estúdio</span>
            </div>
          </div>
        </div>
        <div className="section-title">
          <div>
            <span className="eyebrow">PORTFÓLIO SELECIONADO</span>
            <h2>A arte fala por si.</h2>
          </div>
          <span className="muted" style={{ fontSize: 11 }}>
            {allArts.length} artes publicadas
          </span>
        </div>
        <div className="style-tabs">
          {["Todos", ...new Set(allArts.map((a) => a.style))].map((s) => (
            <button
              key={s}
              className={`style-tab ${style === s ? "active" : ""}`}
              onClick={() => setStyle(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="filters">
          <label className="search-field">
            <span className="sr-only">Buscar arte do estúdio</span>
            <Search size={16} />
            <input
              className="input"
              value={search}
              placeholder="Buscar por nome ou tag"
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {studio.plan === "pro" && (
            <select
              className="input"
              aria-label="Filtrar por artista"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            >
              <option value="">Todos os artistas</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {arts.length ? (
          <div className="art-grid">
            {arts.map((a) => (
              <ArtCard key={a.id} art={a} onSelect={setSelected} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Nenhuma arte nessa seleção.</p>
            <button
              className="button secondary"
              onClick={() => {
                setStyle("Todos");
                setSearch("");
                setArtist("");
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}
        <div style={{ marginTop: 60 }}>
          <span className="eyebrow">QUEM ASSINA OS TRAÇOS</span>
          <h2 style={{ fontSize: 28, marginTop: 15 }}>
            Conheça {studio.plan === "pro" ? "os artistas" : "o artista"}.
          </h2>
          <div className="team-list">
            {members
              .slice(0, studio.plan === "pro" ? undefined : 1)
              .map((m) => (
                <div className="team-member" key={m.id}>
                  <div className="team-avatar">{m.initials}</div>
                  <div>
                    <h3>{m.name}</h3>
                    <p>{m.specialty}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="notice" style={{ marginTop: 40 }}>
          <Info size={17} />
          <p>
            Este é um perfil fictício para validar a plataforma. Imagens
            ilustrativas, assinaturas simuladas e contatos desativados.
          </p>
        </div>
      </div>
      <ArtDialog art={selected} onClose={() => setSelected(null)} />
    </>
  );
}
