"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleCheck,
  CreditCard,
  Eye,
  EyeOff,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Palette,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type {
  DemoState,
  Plan,
  QuoteRequest,
  QuoteStatus,
  Role,
  Studio,
  TattooArt,
} from "@/lib/types";
import { useDemo } from "@/lib/demo-store";
import { id } from "@/lib/rules";
import { PlanCards } from "./plans";
import styles from "./admin-panels.module.css";

type Section =
  | "painel"
  | "artes"
  | "orcamentos"
  | "equipe"
  | "perfil"
  | "assinatura"
  | "configuracoes";
const navigation = [
  { id: "painel", label: "Visão geral", icon: LayoutDashboard },
  { id: "orcamentos", label: "Orçamentos", icon: MessageSquare },
  { id: "artes", label: "Galeria de artes", icon: Palette },
  { id: "equipe", label: "Profissionais", icon: Users },
  { id: "perfil", label: "Perfil do estúdio", icon: Store },
  { id: "assinatura", label: "Assinatura", icon: CreditCard },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];
const headings: Record<Section, [string, string]> = {
  painel: ["Seu estúdio em movimento.", "Um panorama do seu espaço criativo."],
  artes: [
    "Seu traço, em destaque.",
    "Organize, publique e dê espaço às suas próximas criações.",
  ],
  orcamentos: [
    "Conversas que viram arte.",
    "Cada cliente tem uma história. Acompanhe os próximos capítulos.",
  ],
  equipe: [
    "Quem dá vida às ideias.",
    "Os artistas que fazem parte do seu estúdio.",
  ],
  perfil: [
    "A identidade do seu espaço.",
    "Apresente seu estúdio para quem procura uma nova história na pele.",
  ],
  assinatura: [
    "Um plano para o seu ritmo.",
    "Experimente as possibilidades do seu estúdio, sem cobrança.",
  ],
  configuracoes: [
    "Seu espaço, do seu jeito.",
    "Preferências e dados da sua demonstração.",
  ],
};
const date = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
const statusLabels: Record<QuoteStatus, string> = {
  pending: "Pendente",
  contacted: "Em contato",
  completed: "Concluído",
};
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
const makeId = () => id();

function withPlan(state: DemoState, studioId: string, plan: Plan): DemoState {
  let publishedCount = 0;
  return {
    ...state,
    studios: state.studios.map((studio) =>
      studio.id === studioId ? { ...studio, plan } : studio,
    ),
    arts: state.arts.map((art) => {
      if (art.studioId !== studioId || !art.published || plan === "pro")
        return art;
      publishedCount += 1;
      return publishedCount > 25
        ? { ...art, published: false, publicDemo: false }
        : art;
    }),
  };
}

function AccessGate({ role }: { role: Role }) {
  const { login } = useDemo();
  return (
    <div className="page-shell">
      <div className={styles.accessGate}>
        <span className={styles.accessIcon}>
          <ShieldCheck size={32} />
        </span>
        <span className="eyebrow">
          ÁREA {role === "admin" ? "DA PLATAFORMA" : "DO ESTÚDIO"}
        </span>
        <h1>Entre no seu espaço.</h1>
        <p className="muted">
          Este painel usa um perfil demonstrativo de{" "}
          {role === "admin" ? "administrador geral" : "estúdio"}. A sessão será
          alterada somente neste navegador.
        </p>
        <button className="button" onClick={() => login(role)}>
          Entrar como {role === "admin" ? "administrador demo" : "estúdio demo"}
          <ArrowUpRight size={17} />
        </button>
        <Link className={styles.subtleLink} href="/">
          Voltar para o início
        </Link>
        <small className="muted">
          Modo local de demonstração. Não é autenticação segura.
        </small>
      </div>
    </div>
  );
}

export function StudioPanel({ section }: { section: Section }) {
  const { state, ready } = useDemo();
  if (!ready)
    return (
      <div className="page-shell">
        <div className="empty-state">Preparando seu estúdio…</div>
      </div>
    );
  if (!state.session || !["studio", "admin"].includes(state.session.role))
    return <AccessGate role="studio" />;
  const studio = state.studios.find(
    (s) => s.id === (state.session?.studioId || "noir"),
  );
  if (!studio)
    return (
      <div className="page-shell">
        <div className="empty-state">
          <h1>Estúdio não encontrado.</h1>
          <Link href="/cadastro?tipo=estudio" className="button">
            Criar perfil demonstrativo
          </Link>
        </div>
      </div>
    );
  const pending = state.quotes.filter(
    (q) => q.studioId === studio.id && q.status !== "completed",
  ).length;
  return (
    <div className={`page-shell ${styles.dashboardShell}`}>
      <aside className={styles.sidebar}>
        <Link
          href={`/estudios/perfil/?id=${studio.id}`}
          className={styles.studioIdentity}
        >
          <span className={styles.monogram}>{studio.initials}</span>
          <span>
            <strong>{studio.name}</strong>
            <small>
              {studio.plan === "pro" ? "STUDIO PRO" : "PLANO BÁSICO"}{" "}
              <span>· DEMO</span>
            </small>
          </span>
        </Link>
        <span className={styles.navCaption}>SEU ESPAÇO</span>
        <nav aria-label="Painel do estúdio">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={`/estudio/${item.id}`}
              className={`${styles.navItem} ${section === item.id ? styles.navActive : ""}`}
              aria-current={section === item.id ? "page" : undefined}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              {item.id === "orcamentos" && pending > 0 && (
                <small>{pending}</small>
              )}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <span className={styles.onlineDot} />
          <span>
            Ambiente de demonstração
            <small>Seus dados ficam neste navegador</small>
          </span>
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.workspaceHeading}>
          <div>
            <span className="eyebrow">
              PAINEL DO ESTÚDIO{" "}
              <span className={styles.breadcrumb}>
                / {navigation.find((n) => n.id === section)?.label}
              </span>
            </span>
            <h1>{headings[section][0]}</h1>
            <p className="muted">{headings[section][1]}</p>
          </div>
          <Link
            href={`/estudios/perfil/?id=${studio.id}`}
            className={`button secondary ${styles.viewProfile}`}
          >
            <ArrowUpRight size={16} />
            Ver perfil público
          </Link>
        </header>
        {!studio.active && (
          <div className={styles.notice}>
            <EyeOff size={18} />
            <p>
              Este estúdio está desativado na demonstração e não aparece na
              descoberta pública. O administrador geral pode reativá-lo.
            </p>
          </div>
        )}
        {section === "painel" && <Overview studio={studio} />}
        {section === "artes" && <ArtsManager studio={studio} />}
        {section === "orcamentos" && <QuotesManager studio={studio} />}
        {section === "equipe" && <TeamManager studio={studio} />}
        {section === "perfil" && <ProfileEditor studio={studio} />}
        {section === "assinatura" && <SubscriptionPanel studio={studio} />}
        {section === "configuracoes" && <SettingsPanel studio={studio} />}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  foot,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  foot?: string;
}) {
  return (
    <article className={styles.stat}>
      <div className={styles.statLabel}>
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{foot || "Dados de demonstração"}</small>
    </article>
  );
}

function Overview({ studio }: { studio: Studio }) {
  const { state } = useDemo();
  const quotes = state.quotes.filter((q) => q.studioId === studio.id);
  const arts = state.arts.filter((a) => a.studioId === studio.id);
  return (
    <>
      <div className={styles.stats}>
        <Stat
          label="Orçamentos pendentes"
          value={quotes.filter((q) => q.status !== "completed").length}
          icon={<MessageSquare size={17} />}
          foot="Novas ideias esperando por você"
        />
        <Stat
          label="Orçamentos concluídos"
          value={quotes.filter((q) => q.status === "completed").length}
          icon={<CircleCheck size={17} />}
          foot="Histórias que avançaram"
        />
        <Stat
          label="Artes publicadas"
          value={arts.filter((a) => a.published).length}
          icon={<Palette size={17} />}
          foot={
            studio.plan === "pro"
              ? "Publicações ilimitadas no Pro"
              : "De 25 publicações disponíveis"
          }
        />
        <Stat
          label="Clientes interessados"
          value={new Set(quotes.map((q) => q.clientId)).size}
          icon={<Users size={17} />}
          foot="Pessoas únicas nos seus pedidos"
        />
      </div>
      <div className={styles.overviewGrid}>
        <section className={styles.surface}>
          <div className={styles.sectionHead}>
            <div>
              <span className="eyebrow">SEU PRÓXIMO CAPÍTULO</span>
              <h2>Pedidos recentes</h2>
            </div>
            <Link className={styles.subtleLink} href="/estudio/orcamentos">
              Ver todos
              <ArrowUpRight size={15} />
            </Link>
          </div>
          {quotes.length ? (
            <div className={styles.recentList}>
              {[...quotes]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, 4)
                .map((quote) => (
                  <Link
                    key={quote.id}
                    href="/estudio/orcamentos"
                    className={styles.recentRow}
                  >
                    <span className={styles.avatar}>
                      {initials(quote.clientName)}
                    </span>
                    <span>
                      <strong>{quote.clientName}</strong>
                      <small>
                        {quote.projectName} · {date(quote.createdAt)}
                      </small>
                    </span>
                    <span
                      className={`${styles.status} ${styles[quote.status]}`}
                    >
                      {statusLabels[quote.status]}
                    </span>
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
            </div>
          ) : (
            <div className="empty-state">
              As próximas ideias dos seus clientes aparecerão aqui.
            </div>
          )}
        </section>
        <section className={`${styles.surface} ${styles.profileFeature}`}>
          <Store size={25} />
          <span className="eyebrow">SEU ESTÚDIO NA PLATAFORMA</span>
          <h2>
            O primeiro contato
            <br />
            começa no perfil.
          </h2>
          <p className="muted">
            Mantenha seus estilos, endereço e apresentação sempre atualizados.
          </p>
          <Link href="/estudio/perfil" className="button secondary">
            Editar meu perfil
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
      <section className={styles.surface}>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">A SUA ASSINATURA EM CADA TRAÇO</span>
            <h2>Da sua galeria</h2>
          </div>
          <Link className={styles.subtleLink} href="/estudio/artes">
            Gerenciar artes
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className={styles.artStrip}>
          {arts.slice(0, 4).map((art) => (
            <div key={art.id} className={styles.miniArt}>
              <div>
                <img src={art.image} alt={art.name} />
              </div>
              <span>{art.name}</span>
              <small>{art.published ? "Publicada" : "Rascunho"}</small>
            </div>
          ))}
          <Link className={styles.newArtTile} href="/estudio/artes">
            <Plus size={24} />
            <span>Criar uma nova arte</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function ArtsManager({ studio }: { studio: Studio }) {
  const { state, update, notify } = useDemo();
  const [editing, setEditing] = useState<TattooArt | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const arts = state.arts.filter((a) => a.studioId === studio.id);
  const published = arts.filter((a) => a.published).length;
  const matches = arts.filter(
    (a) =>
      `${a.name} ${a.style} ${a.tags.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "all" ||
        (filter === "published" ? a.published : !a.published)),
  );
  function save(art: TattooArt) {
    if (
      art.published &&
      studio.plan === "basic" &&
      published - (arts.find((a) => a.id === art.id)?.published ? 1 : 0) >= 25
    ) {
      notify(
        "O Básico permite 25 artes publicadas. Oculte uma arte ou simule o Studio Pro.",
      );
      return;
    }
    update((s) => ({
      ...s,
      arts: s.arts.some((a) => a.id === art.id)
        ? s.arts.map((a) =>
            a.id === art.id && a.studioId === studio.id ? art : a,
          )
        : [...s.arts, art],
    }));
    setEditing(null);
    notify("Arte salva na sua galeria de demonstração.");
  }
  function toggle(art: TattooArt) {
    if (!art.published && studio.plan === "basic" && published >= 25) {
      notify("Limite de 25 publicações. Oculte outra arte para abrir espaço.");
      return;
    }
    update((s) => ({
      ...s,
      arts: s.arts.map((a) =>
        a.id === art.id && a.studioId === studio.id
          ? {
              ...a,
              published: !a.published,
              publicDemo: a.published ? false : a.publicDemo,
            }
          : a,
      ),
    }));
    notify(
      art.published
        ? "Arte movida para rascunhos. Projetos existentes foram preservados."
        : "Arte publicada na galeria.",
    );
  }
  function remove(art: TattooArt) {
    if (
      !window.confirm(
        `Excluir “${art.name}” da galeria? As referências já salvas em projetos e pedidos serão preservadas.`,
      )
    )
      return;
    update((s) => ({
      ...s,
      arts: s.arts.filter(
        (a) => !(a.id === art.id && a.studioId === studio.id),
      ),
    }));
    notify(
      "Arte excluída da galeria. Os projetos existentes foram preservados.",
    );
  }
  return (
    <>
      <div className={styles.toolbar}>
        <div>
          <strong>{arts.length} artes no seu acervo</strong>
          <p className="muted">
            {published} publicadas{" "}
            {studio.plan === "basic"
              ? "/ limite de 25"
              : "· publicações ilimitadas"}
          </p>
        </div>
        <button className="button" onClick={() => setEditing("new")}>
          <Plus size={17} />
          Nova arte
        </button>
      </div>
      {editing && (
        <ArtEditor
          key={typeof editing === "string" ? "new" : editing.id}
          studio={studio}
          initial={editing === "new" ? undefined : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
      <div className={styles.filterBar}>
        <label className={styles.search}>
          <Search size={17} />
          <input
            aria-label="Buscar artes por nome, estilo ou tag"
            placeholder="Buscar por nome, estilo ou tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          className={styles.select}
          aria-label="Status de publicação"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todas as artes</option>
          <option value="published">Publicadas</option>
          <option value="draft">Rascunhos</option>
        </select>
      </div>
      {matches.length ? (
        <div className={styles.artsGrid}>
          {matches.map((art) => (
            <article className={styles.artCard} key={art.id}>
              <div className={styles.artImage}>
                <img src={art.image} alt={art.name} />
                <span
                  className={`${styles.status} ${art.published ? styles.completed : styles.pending}`}
                >
                  {art.published ? "Publicada" : "Rascunho"}
                </span>
                {art.publicDemo && (
                  <span className={styles.demoArt}>DEMO PÚBLICA</span>
                )}
              </div>
              <div className={styles.artInfo}>
                <span className="eyebrow">{art.style}</span>
                <h3>{art.name}</h3>
                <p className="muted">
                  {state.members.find((m) => m.id === art.authorId)?.name ||
                    studio.name}
                </p>
                <div className={styles.tags}>
                  {art.tags.slice(0, 3).map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </div>
                <div className={styles.artActions}>
                  <button
                    onClick={() => setEditing(art)}
                    title={`Editar ${art.name}`}
                    aria-label={`Editar ${art.name}`}
                  >
                    <Pencil size={15} />
                    Editar
                  </button>
                  <button
                    onClick={() => toggle(art)}
                    title={art.published ? "Ocultar arte" : "Publicar arte"}
                  >
                    {art.published ? <EyeOff size={15} /> : <Eye size={15} />}
                    {art.published ? "Ocultar" : "Publicar"}
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => remove(art)}
                    aria-label={`Excluir ${art.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Palette size={28} />
          <h3>Nenhuma arte por aqui.</h3>
          <p className="muted">
            Tente outra busca ou comece a construir a sua galeria.
          </p>
          <button
            className="button secondary"
            onClick={() => setEditing("new")}
          >
            Cadastrar uma arte
          </button>
        </div>
      )}
    </>
  );
}

function ArtEditor({
  studio,
  initial,
  onSave,
  onCancel,
}: {
  studio: Studio;
  initial?: TattooArt;
  onSave: (art: TattooArt) => void;
  onCancel: () => void;
}) {
  const { state } = useDemo();
  const [image, setImage] = useState(initial?.image || "/art/serpent.svg");
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [isReading, setIsReading] = useState(false);
  const members = state.members.filter((m) => m.studioId === studio.id);
  const activeMembers = studio.plan === "pro" ? members : members.slice(0, 1);
  async function readFile(file?: File) {
    if (!file) return;
    setFileError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setFileError("Escolha uma imagem PNG, JPG ou WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError("A imagem deve ter até 2 MB para a demonstração local.");
      return;
    }
    setIsReading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setIsReading(false);
    };
    reader.onerror = () => {
      setFileError("Não foi possível ler a imagem. Tente outro arquivo.");
      setIsReading(false);
    };
    reader.readAsDataURL(file);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (isReading || !image) return;
    const text = (name: string) => String(data.get(name) || "").trim();
    if (text("name").length < 2 || !text("style") || !text("author")) {
      setFormError(
        "Informe o nome, o estilo e o profissional responsável pela arte.",
      );
      return;
    }
    setFormError("");
    onSave({
      id: initial?.id || makeId(),
      studioId: studio.id,
      name: text("name"),
      description: text("description"),
      style: text("style"),
      tags: [
        ...new Set(
          text("tags")
            .split(",")
            .map((t) => t.trim().replace(/^#/, ""))
            .filter(Boolean),
        ),
      ].slice(0, 12),
      authorId: text("author"),
      image,
      published: data.has("published"),
      publicDemo: data.has("published") && data.has("publicDemo"),
      details: text("details"),
    });
  }
  return (
    <section className={`${styles.surface} ${styles.editor}`}>
      <div className={styles.sectionHead}>
        <div>
          <span className="eyebrow">SEU ACERVO AUTORAL</span>
          <h2>{initial ? "Editar arte" : "Uma nova criação"}</h2>
        </div>
        <button
          className={styles.iconButton}
          onClick={onCancel}
          aria-label="Fechar formulário"
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={submit} className={styles.artForm}>
        <div>
          <div className={styles.uploadPreview}>
            <img src={image} alt="Prévia da arte selecionada" />
          </div>
          <label className={`button secondary ${styles.uploadLabel}`}>
            <ImagePlus size={16} />
            {isReading ? "Lendo imagem…" : "Enviar imagem"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => void readFile(e.target.files?.[0])}
            />
          </label>
          <p className={styles.helpText}>
            PNG, JPG ou WebP · até 2 MB.
            <br />
            Use PNG transparente para destacar o seu traço.
          </p>
          {fileError && (
            <p role="alert" className={styles.error}>
              {fileError}
            </p>
          )}
          <span className={styles.helpText}>
            Ou escolha uma arte demonstrativa:
          </span>
          <div className={styles.samples}>
            {["serpent", "moth", "rose", "dagger", "tiger", "swallow"].map(
              (sample) => (
                <button
                  type="button"
                  key={sample}
                  onClick={() => {
                    setImage(`/art/${sample}.svg`);
                    setFileError("");
                  }}
                  className={
                    image === `/art/${sample}.svg` ? styles.selectedSample : ""
                  }
                  aria-label={`Usar arte demonstrativa ${sample}`}
                  aria-pressed={image === `/art/${sample}.svg`}
                >
                  <img src={`/art/${sample}.svg`} alt="" />
                </button>
              ),
            )}
          </div>
        </div>
        <div className={styles.formArea}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              Nome da arte
              <input
                name="name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={initial?.name}
                placeholder="Uma ideia que merece nome"
              />
            </label>
            <label className={styles.field}>
              Estilo
              <select
                name="style"
                aria-label="Estilo"
                required
                defaultValue={initial?.style || ""}
              >
                <option value="" disabled>
                  Selecione o estilo
                </option>
                {[
                  ...new Set([
                    ...(initial?.style ? [initial.style] : []),
                    ...studio.styles,
                    "Blackwork",
                    "Fine line",
                    "Tradicional",
                    "Neo tradicional",
                    "Old school",
                    "Realismo",
                    "Oriental",
                    "Geométrico",
                    "Botânico",
                    "Lettering",
                    "Dotwork",
                    "Pontilhismo",
                    "Minimalista",
                    "Outro",
                  ]),
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              Descrição
              <textarea
                name="description"
                rows={3}
                maxLength={700}
                defaultValue={initial?.description}
                placeholder="Conte a inspiração por trás deste desenho…"
              />
            </label>
            <label className={styles.field}>
              Profissional responsável
              <select
                name="author"
                aria-label="Profissional responsável"
                required
                defaultValue={
                  activeMembers.some((m) => m.id === initial?.authorId)
                    ? initial?.authorId
                    : activeMembers[0]?.id
                }
              >
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
                {!activeMembers.length && (
                  <option value="">Cadastre um profissional primeiro</option>
                )}
              </select>
            </label>
            <label className={styles.field}>
              Tags, separadas por vírgula
              <input
                name="tags"
                maxLength={250}
                defaultValue={initial?.tags.join(", ")}
                placeholder="serpente, natureza, contraste"
              />
            </label>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              Detalhes adicionais
              <textarea
                name="details"
                maxLength={1000}
                rows={2}
                defaultValue={initial?.details}
                placeholder="Informações sobre o desenho, tamanho sugerido ou disponibilidade."
              />
            </label>
          </div>
          <p className={styles.helpText}>
            As tags organizam sua galeria. Elas não limitam regiões do corpo. A
            remoção automática de fundo será um recurso futuro.
          </p>
          <label className={styles.checkbox}>
            <input
              name="published"
              type="checkbox"
              defaultChecked={initial?.published ?? false}
            />
            <span>
              Publicar na galeria do estúdio
              <small>
                Artes ocultas continuam preservadas nos projetos existentes.
              </small>
            </span>
          </label>
          <label className={styles.checkbox}>
            <input
              name="publicDemo"
              type="checkbox"
              defaultChecked={initial?.publicDemo ?? false}
            />
            <span>
              Disponibilizar na demonstração pública
              <small>
                Quando publicada, a arte pode aparecer no carrossel da página
                inicial.
              </small>
            </span>
          </label>
          {formError && (
            <p role="alert" className={styles.error}>
              {formError}
            </p>
          )}
          <div className={styles.formActions}>
            <button
              type="button"
              className="button secondary"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button"
              disabled={isReading || !activeMembers.length}
            >
              <Check size={16} />
              Salvar arte
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function QuotesManager({ studio }: { studio: Studio }) {
  const { state, update, notify } = useDemo();
  const [tab, setTab] = useState<"pending" | "completed">("pending");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [contact, setContact] = useState<QuoteRequest | null>(null);
  const quotes = state.quotes.filter((q) => q.studioId === studio.id);
  const filtered = quotes.filter(
    (q) =>
      (tab === "completed"
        ? q.status === "completed"
        : q.status !== "completed") &&
      `${q.clientName} ${q.clientEmail} ${q.projectName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const groups = Array.from(new Set(filtered.map((q) => q.clientId))).map(
    (clientId) => ({
      clientId,
      requests: filtered.filter((q) => q.clientId === clientId),
    }),
  );
  function changeStatus(id: string, status: QuoteStatus) {
    update((s) => ({
      ...s,
      quotes: s.quotes.map((q) =>
        q.id === id && q.studioId === studio.id ? { ...q, status } : q,
      ),
    }));
    notify(`Pedido marcado como ${statusLabels[status].toLowerCase()}.`);
  }
  const message = contact
    ? `Olá, ${contact.clientName}! Aqui é do ${studio.name}. Recebemos o pedido ${contact.id} para o projeto “${contact.projectName}”. Vamos conversar sobre a sua ideia?`
    : "";
  return (
    <>
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Situação dos orçamentos"
      >
        <button
          role="tab"
          aria-selected={tab === "pending"}
          className={tab === "pending" ? styles.activeTab : ""}
          onClick={() => setTab("pending")}
        >
          Pendentes
          <span>{quotes.filter((q) => q.status !== "completed").length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "completed"}
          className={tab === "completed" ? styles.activeTab : ""}
          onClick={() => setTab("completed")}
        >
          Concluídos
          <span>{quotes.filter((q) => q.status === "completed").length}</span>
        </button>
      </div>
      <div className={styles.filterBar}>
        <label className={styles.search}>
          <Search size={17} />
          <input
            aria-label="Buscar cliente ou projeto"
            placeholder="Buscar cliente ou projeto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <span className={styles.resultCount}>
          {groups.length} {groups.length === 1 ? "cliente" : "clientes"} ·{" "}
          {filtered.length} pedidos
        </span>
      </div>
      <div className={styles.quoteGroups}>
        {groups.map((group) => {
          const client = group.requests[0];
          const expanded = open.includes(group.clientId);
          const key = `client-${group.clientId}-${tab}`;
          return (
            <article
              key={group.clientId}
              className={`${styles.clientCard} ${expanded ? styles.expandedCard : ""}`}
            >
              <button
                className={styles.clientSummary}
                onClick={() =>
                  setOpen((ids) =>
                    expanded
                      ? ids.filter((id) => id !== group.clientId)
                      : [...ids, group.clientId],
                  )
                }
                aria-expanded={expanded}
                aria-controls={key}
              >
                <span className={styles.avatar}>
                  {initials(client.clientName)}
                </span>
                <span className={styles.clientName}>
                  <strong>{client.clientName}</strong>
                  <small>{client.clientEmail}</small>
                </span>
                <span className={styles.clientCount}>
                  {group.requests.length}{" "}
                  {group.requests.length === 1 ? "pedido" : "pedidos"}
                  <small>{date(client.createdAt)}</small>
                </span>
                <ChevronDown
                  size={18}
                  className={expanded ? styles.rotated : ""}
                />
              </button>
              <div
                id={key}
                className={`${styles.expansion} ${expanded ? styles.expansionOpen : ""}`}
                inert={!expanded}
              >
                <div>
                  {group.requests.map((quote) => (
                    <div key={quote.id} className={styles.quoteDetail}>
                      <div className={styles.quoteHead}>
                        <div>
                          <span className="eyebrow">
                            PEDIDO #{quote.id.slice(-8).toUpperCase()}
                          </span>
                          <h3>{quote.projectName}</h3>
                          <small className="muted">
                            {date(quote.createdAt)} · {quote.items.length}{" "}
                            {quote.items.length === 1
                              ? "arte selecionada"
                              : "artes selecionadas"}
                          </small>
                        </div>
                        <span
                          className={`${styles.status} ${styles[quote.status]}`}
                        >
                          {statusLabels[quote.status]}
                        </span>
                      </div>
                      <div className={styles.quoteItems}>
                        {quote.items.map((item) => (
                          <div key={item.id}>
                            <img src={item.image} alt={item.name} />
                            <span>
                              {item.name}
                              <small>
                                {item.origin === "upload"
                                  ? "Imagem própria do cliente"
                                  : "Arte do estúdio"}
                              </small>
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.quoteMetadata}>
                        <div>
                          <small>REGIÃO PRETENDIDA</small>
                          <span>
                            {quote.region || "A combinar com o artista"}
                          </span>
                        </div>
                        <div>
                          <small>DIMENSÃO APROXIMADA</small>
                          <span>
                            {quote.dimensions || "A combinar com o artista"}
                          </span>
                        </div>
                      </div>
                      <div className={styles.quoteNotes}>
                        <span className="eyebrow">A IDEIA DO CLIENTE</span>
                        <p>
                          {quote.notes ||
                            "O cliente não incluiu observações adicionais."}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={styles.subtleLink}
                        onClick={() =>
                          setPreview(preview === quote.id ? null : quote.id)
                        }
                      >
                        <Eye size={15} />
                        {preview === quote.id
                          ? "Recolher prévia do projeto"
                          : "Ver prévia do projeto"}
                        <ChevronDown size={14} />
                      </button>
                      {preview === quote.id && (
                        <div className={styles.projectPreview}>
                          <span className="eyebrow">
                            {quote.projectName} · REFERÊNCIAS DO PEDIDO
                          </span>
                          <div>
                            {quote.items.map((item) => (
                              <img
                                key={item.id}
                                src={item.image}
                                alt={item.name}
                              />
                            ))}
                          </div>
                          <small className="muted">
                            Referências preservadas no momento do pedido. O
                            simulador humano será implementado em uma próxima
                            fase.
                          </small>
                        </div>
                      )}
                      <div className={styles.quoteActions}>
                        <button
                          className="button secondary"
                          onClick={() => setContact(quote)}
                        >
                          <MessageSquare size={15} />
                          WhatsApp demonstrativo
                        </button>
                        <label className={styles.statusSelect}>
                          Status
                          <select
                            value={quote.status}
                            onChange={(e) =>
                              changeStatus(
                                quote.id,
                                e.target.value as QuoteStatus,
                              )
                            }
                            aria-label={`Status do pedido ${quote.id}`}
                          >
                            <option value="pending">Pendente</option>
                            <option value="contacted">Em contato</option>
                            <option value="completed">Concluído</option>
                          </select>
                        </label>
                        {quote.status !== "completed" && (
                          <button
                            className="button"
                            onClick={() => changeStatus(quote.id, "completed")}
                          >
                            <Check size={15} />
                            Concluir pedido
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!groups.length && (
        <div className="empty-state">
          <MessageSquare size={28} />
          <h3>
            {search
              ? "Nenhum cliente encontrado."
              : tab === "pending"
                ? "Tudo em dia por aqui."
                : "Um espaço para suas próximas histórias."}
          </h3>
          <p className="muted">
            {search
              ? "Tente buscar outro nome ou projeto."
              : tab === "pending"
                ? "Novos pedidos serão organizados por cliente nesta aba."
                : "Os pedidos concluídos aparecerão agrupados por cliente."}
          </p>
        </div>
      )}
      {contact && (
        <div className={styles.modalBackdrop} onClick={() => setContact(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sectionHead}>
              <span className="eyebrow">CONTATO DEMONSTRATIVO</span>
              <button
                className={styles.iconButton}
                onClick={() => setContact(null)}
                aria-label="Fechar contato"
              >
                <X size={20} />
              </button>
            </div>
            <h2 id="contact-title">A conversa começa com uma ideia.</h2>
            <p className="muted">
              Este cliente é fictício. Nenhum WhatsApp será aberto ou mensagem
              enviada. Você pode copiar o texto para validar o fluxo.
            </p>
            <div className={styles.messagePreview}>{message}</div>
            <button
              className="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(message);
                  notify("Mensagem demonstrativa copiada.");
                } catch {
                  notify("Selecione e copie o texto da mensagem acima.");
                }
              }}
            >
              Copiar mensagem
              <ArrowUpRight size={16} />
            </button>
          </section>
        </div>
      )}
    </>
  );
}

function TeamManager({ studio }: { studio: Studio }) {
  const { state, update, notify } = useDemo();
  const [adding, setAdding] = useState(false);
  const members = state.members.filter((m) => m.studioId === studio.id);
  const active = studio.plan === "pro" ? members : members.slice(0, 1);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (studio.plan !== "pro") return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const specialty = String(data.get("specialty") || "").trim();
    if (name.length < 2 || specialty.length < 2) {
      notify(
        "Informe um nome e uma especialidade com pelo menos 2 caracteres.",
      );
      return;
    }
    update((s) => ({
      ...s,
      members: [
        ...s.members,
        {
          id: makeId(),
          studioId: studio.id,
          name,
          specialty,
          initials: initials(name),
        },
      ],
    }));
    setAdding(false);
    notify("Profissional adicionado à equipe.");
  }
  function remove(id: string) {
    if (studio.plan !== "pro") return;
    if (members.length === 1) {
      notify("Mantenha pelo menos um profissional no estúdio.");
      return;
    }
    const fallback = members.find((m) => m.id !== id)!;
    if (
      !window.confirm(
        "Remover este profissional? As artes serão vinculadas ao primeiro profissional da equipe e os projetos existentes serão preservados.",
      )
    )
      return;
    update((s) => ({
      ...s,
      members: s.members.filter(
        (m) => !(m.id === id && m.studioId === studio.id),
      ),
      arts: s.arts.map((a) =>
        a.studioId === studio.id && a.authorId === id
          ? { ...a, authorId: fallback.id }
          : a,
      ),
    }));
    notify("Equipe atualizada. As artes foram preservadas.");
  }
  return (
    <>
      <div className={styles.toolbar}>
        <div>
          <strong>
            {active.length}{" "}
            {active.length === 1
              ? "profissional ativo"
              : "profissionais ativos"}
          </strong>
          <p className="muted">
            {studio.plan === "pro"
              ? "Uma galeria, várias identidades."
              : "O plano Básico inclui 1 tatuador."}
          </p>
        </div>
        {studio.plan === "pro" ? (
          <button className="button" onClick={() => setAdding(!adding)}>
            <Plus size={17} />
            Adicionar profissional
          </button>
        ) : (
          <Link href="/estudio/assinatura" className="button secondary">
            Conhecer o Studio Pro
            <ArrowUpRight size={16} />
          </Link>
        )}
      </div>
      {studio.plan === "basic" && members.length > 1 && (
        <div className={styles.notice}>
          <Users size={19} />
          <p>
            Os demais profissionais foram preservados e ficam inativos no
            Básico. Ao voltar para o Studio Pro, toda a equipe estará disponível
            novamente.
          </p>
        </div>
      )}
      {adding && studio.plan === "pro" && (
        <form className={styles.surface} onSubmit={add}>
          <div className={styles.sectionHead}>
            <h2>Uma nova assinatura no estúdio.</h2>
            <button
              className={styles.iconButton}
              type="button"
              onClick={() => setAdding(false)}
              aria-label="Fechar formulário"
            >
              <X size={19} />
            </button>
          </div>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              Nome do profissional
              <input
                name="name"
                required
                minLength={2}
                maxLength={80}
                placeholder="Como o artista é conhecido?"
              />
            </label>
            <label className={styles.field}>
              Especialidade
              <input
                name="specialty"
                required
                minLength={2}
                maxLength={120}
                placeholder="Blackwork, Fine line…"
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button className="button" type="submit">
              <Plus size={16} />
              Adicionar à equipe
            </button>
          </div>
        </form>
      )}
      <div className={styles.teamGrid}>
        {members.map((member, index) => (
          <article
            className={`${styles.surface} ${studio.plan === "basic" && index > 0 ? styles.archivedMember : ""}`}
            key={member.id}
          >
            <div className={styles.memberTop}>
              <span className={styles.memberAvatar}>{member.initials}</span>
              {studio.plan === "pro" && (
                <button
                  className={styles.iconButton}
                  onClick={() => remove(member.id)}
                  aria-label={`Remover ${member.name}`}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <span className="eyebrow">
              {studio.plan === "basic" && index > 0
                ? "PRESERVADO · INATIVO NO BÁSICO"
                : "ARTISTA DO ESTÚDIO"}
            </span>
            <h3>{member.name}</h3>
            <p className="muted">{member.specialty}</p>
            <div className={styles.memberFooter}>
              <Palette size={15} />
              {
                state.arts.filter(
                  (a) => a.studioId === studio.id && a.authorId === member.id,
                ).length
              }{" "}
              artes no acervo
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function ProfileEditor({ studio }: { studio: Studio }) {
  const { update, notify } = useDemo();
  const [image, setImage] = useState(studio.image);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) || "").trim();
    if (text("name").length < 2 || text("description").length < 10) {
      setError("Preencha o nome e uma descrição com pelo menos 10 caracteres.");
      return;
    }
    if (image && !/^(https?:\/\/|\/|data:image\/)/.test(image)) {
      setError(
        "Use uma URL de imagem com https:// ou um caminho iniciado por /.",
      );
      return;
    }
    setError("");
    update((s) => ({
      ...s,
      studios: s.studios.map((item) =>
        item.id === studio.id
          ? {
              ...item,
              name: text("name"),
              initials: initials(text("name")),
              description: text("description"),
              city: text("city"),
              state: text("state").toUpperCase(),
              address: text("address"),
              styles: [
                ...new Set(
                  text("styles")
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                ),
              ],
              instagram: text("instagram"),
              whatsapp: text("whatsapp"),
              image,
            }
          : item,
      ),
    }));
    notify("Perfil do estúdio atualizado nesta demonstração.");
  }
  return (
    <form className={styles.surface} onSubmit={submit}>
      <div
        className={styles.profileCover}
        style={{
          backgroundImage: `linear-gradient(0deg,rgba(8,14,19,.8),rgba(8,14,19,.12)),url("${image}")`,
        }}
      >
        <span className={styles.monogram}>{studio.initials}</span>
        <span>
          <strong>{studio.name}</strong>
          <small>
            {studio.city}, {studio.state}
          </small>
        </span>
      </div>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          Nome do estúdio
          <input
            name="name"
            defaultValue={studio.name}
            required
            minLength={2}
            maxLength={80}
          />
        </label>
        <label className={styles.field}>
          Estilos, separados por vírgula
          <input
            name="styles"
            defaultValue={studio.styles.join(", ")}
            required
            maxLength={250}
          />
        </label>
        <label className={`${styles.field} ${styles.fullWidth}`}>
          Apresentação
          <textarea
            name="description"
            rows={4}
            defaultValue={studio.description}
            required
            minLength={10}
            maxLength={1500}
          />
        </label>
        <label className={styles.field}>
          Cidade
          <input
            name="city"
            defaultValue={studio.city}
            required
            minLength={2}
            maxLength={80}
          />
        </label>
        <label className={styles.field}>
          Estado
          <select
            name="state"
            aria-label="Estado"
            defaultValue={studio.state}
            required
          >
            {[
              "AC",
              "AL",
              "AP",
              "AM",
              "BA",
              "CE",
              "DF",
              "ES",
              "GO",
              "MA",
              "MT",
              "MS",
              "MG",
              "PA",
              "PB",
              "PR",
              "PE",
              "PI",
              "RJ",
              "RN",
              "RS",
              "RO",
              "RR",
              "SC",
              "SP",
              "SE",
              "TO",
            ].map((uf) => (
              <option key={uf}>{uf}</option>
            ))}
          </select>
        </label>
        <label className={`${styles.field} ${styles.fullWidth}`}>
          Endereço comercial
          <input
            name="address"
            defaultValue={studio.address}
            required
            minLength={5}
            maxLength={180}
          />
        </label>
        <label className={styles.field}>
          Instagram
          <input
            name="instagram"
            defaultValue={studio.instagram}
            maxLength={180}
            placeholder="@seuestudio"
          />
        </label>
        <label className={styles.field}>
          WhatsApp com DDD
          <input
            name="whatsapp"
            defaultValue={studio.whatsapp}
            pattern="[+0-9 ()-]{10,20}"
            maxLength={20}
            placeholder="(15) 99999-0000"
          />
          <small>Número fictício no modo demonstrativo.</small>
        </label>
        <label className={`${styles.field} ${styles.fullWidth}`}>
          Imagem de capa (URL)
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            maxLength={2000}
            placeholder="https://…"
          />
          <small>Use uma imagem própria ou com permissão de uso.</small>
        </label>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.formActions}>
        <Link
          className="button secondary"
          href={`/estudios/perfil/?id=${studio.id}`}
        >
          Ver perfil público
          <ArrowUpRight size={16} />
        </Link>
        <button className="button" type="submit">
          <Check size={16} />
          Salvar alterações
        </button>
      </div>
    </form>
  );
}

function SubscriptionPanel({ studio }: { studio: Studio }) {
  const { state, update, notify } = useDemo();
  const arts = state.arts.filter(
    (a) => a.studioId === studio.id && a.published,
  ).length;
  const members = state.members.filter((m) => m.studioId === studio.id).length;
  function select(plan: Plan) {
    if (plan === studio.plan) return;
    if (
      plan === "basic" &&
      !window.confirm(
        "Simular o plano Básico? Apenas as primeiras 25 artes permanecem publicadas e 1 profissional fica ativo. As demais artes serão rascunhos e os demais profissionais serão preservados para uma futura volta ao Pro.",
      )
    )
      return;
    update((s) => withPlan(s, studio.id, plan));
    notify(
      `Plano ${plan === "pro" ? "Studio Pro" : "Básico"} ativado na demonstração. Nenhuma cobrança foi realizada.`,
    );
  }
  return (
    <>
      <div className={`${styles.surface} ${styles.subscriptionSummary}`}>
        <span className={styles.subscriptionIcon}>
          <CreditCard size={25} />
        </span>
        <div>
          <span className="eyebrow">ASSINATURA DEMONSTRATIVA</span>
          <h2>{studio.plan === "pro" ? "Studio Pro" : "Básico"}</h2>
          <p className="muted">
            {arts} artes publicadas ·{" "}
            {studio.plan === "pro" ? members : Math.min(1, members)}{" "}
            {members === 1 ? "profissional ativo" : "profissionais ativos"}
          </p>
        </div>
        <span className={styles.status}>Sem cobrança</span>
      </div>
      <PlanCards current={studio.plan} onSelect={select} />
      <p className={styles.footnote}>
        O plano Básico permite 25 artes publicadas simultaneamente e 1
        profissional ativo. Ao reduzir o plano, os excedentes são preservados.
        No Pro, “ilimitado” se refere às publicações, sujeito a limites técnicos
        razoáveis. Não há pagamento ou renovação automática nesta versão.
      </p>
    </>
  );
}

function SettingsPanel({ studio }: { studio: Studio }) {
  const { state, logout, reset, notify } = useDemo();
  const router = useRouter();
  return (
    <>
      <section className={styles.surface}>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">SUA SESSÃO</span>
            <h2>Um ambiente para experimentar.</h2>
          </div>
          <ShieldCheck size={22} />
        </div>
        <div className={styles.settingsRows}>
          <div>
            <span>
              Perfil demonstrativo<strong>{state.session?.name}</strong>
            </span>
            <span className="muted">{state.session?.email}</span>
          </div>
          <div>
            <span>
              Estúdio vinculado<strong>{studio.name}</strong>
            </span>
            <span className={styles.status}>
              {studio.plan === "pro" ? "Studio Pro" : "Básico"}
            </span>
          </div>
          <div>
            <span>
              Armazenamento<strong>Local, neste navegador</strong>
            </span>
            <span className="muted">Sem autenticação de produção</span>
          </div>
        </div>
        <div className={styles.formActions}>
          <button
            className="button secondary"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            <LogOut size={16} />
            Sair da demonstração
          </button>
        </div>
      </section>
      <section className={`${styles.surface} ${styles.resetPanel}`}>
        <span className="eyebrow">RECOMEÇAR A EXPERIÊNCIA</span>
        <h2>Uma tela em branco.</h2>
        <p className="muted">
          Restaure os estúdios, artes, projetos e pedidos fictícios para o
          estado inicial. Todas as alterações locais da demonstração serão
          removidas e a sessão será encerrada.
        </p>
        <button
          className={styles.dangerButton}
          onClick={() => {
            if (
              window.confirm(
                "Restaurar todos os dados de demonstração deste navegador? Suas alterações locais serão removidas.",
              )
            ) {
              reset();
              notify("Demonstração restaurada para os dados iniciais.");
              router.push("/");
            }
          }}
        >
          Restaurar demonstração
          <ArrowDownLeft size={16} />
        </button>
      </section>
    </>
  );
}

export function AdminPanel() {
  const { state, ready, update, notify } = useDemo();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!ready)
    return (
      <div className="page-shell">
        <div className="empty-state">Preparando a plataforma…</div>
      </div>
    );
  if (state.session?.role !== "admin") return <AccessGate role="admin" />;
  const studios = state.studios.filter(
    (s) =>
      `${s.name} ${s.city} ${s.state}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "all" ||
        (filter === "active"
          ? s.active
          : filter === "inactive"
            ? !s.active
            : s.plan === filter)),
  );
  function plan(id: string, value: Plan) {
    if (
      value === "basic" &&
      !window.confirm(
        "Alterar este estúdio para o Básico na demonstração? Artes acima de 25 serão preservadas como rascunhos e apenas 1 profissional ficará ativo.",
      )
    )
      return;
    update((s) => withPlan(s, id, value));
    notify("Plano demonstrativo atualizado. Nenhuma cobrança foi realizada.");
  }
  return (
    <div className="page-shell">
      <header className={styles.adminHeading}>
        <div>
          <span className="eyebrow">
            ADMINISTRAÇÃO GERAL{" "}
            <span className={styles.breadcrumb}>/ AMBIENTE DEMONSTRATIVO</span>
          </span>
          <h1 className="page-heading">Uma visão de toda a cena.</h1>
          <p className="muted">
            Acompanhe os estúdios e os movimentos da sua plataforma.
          </p>
        </div>
        <span className={styles.adminBadge}>
          <ShieldCheck size={16} />
          Administrador demo
        </span>
      </header>
      <div className={styles.stats}>
        <Stat
          label="Estúdios cadastrados"
          value={state.studios.length}
          icon={<Store size={17} />}
          foot={`${state.studios.filter((s) => s.active).length} ativos na plataforma`}
        />
        <Stat
          label="Clientes cadastrados"
          value={state.profiles.filter((p) => p.role === "client").length}
          icon={<Users size={17} />}
        />
        <Stat
          label="Artes publicadas"
          value={state.arts.filter((a) => a.published).length}
          icon={<Palette size={17} />}
        />
        <Stat
          label="Pedidos registrados"
          value={state.quotes.length}
          icon={<MessageSquare size={17} />}
        />
      </div>
      <div className={styles.adminOverview}>
        <section className={styles.surface}>
          <span className="eyebrow">ASSINATURAS SIMULADAS</span>
          <div className={styles.planDistribution}>
            <div>
              <span className={styles.distributionKey} />
              Básico
              <strong>
                {state.studios.filter((s) => s.plan === "basic").length}
              </strong>
              <small>R$ 49,90/mês planejado</small>
            </div>
            <div>
              <span className={`${styles.distributionKey} ${styles.proKey}`} />
              Studio Pro
              <strong>
                {state.studios.filter((s) => s.plan === "pro").length}
              </strong>
              <small>R$ 79,90/mês planejado</small>
            </div>
          </div>
          <div className={styles.distributionBar}>
            <span
              style={{
                width: `${state.studios.length ? (state.studios.filter((s) => s.plan === "basic").length / state.studios.length) * 100 : 0}%`,
              }}
            />
            <span />
          </div>
        </section>
        <section className={`${styles.surface} ${styles.adminNote}`}>
          <ShieldCheck size={25} />
          <div>
            <h3>Uma operação de demonstração.</h3>
            <p className="muted">
              Alterações afetam apenas os dados deste navegador. Planos,
              permissões e assinaturas são simulados. Nenhuma cobrança é feita.
            </p>
          </div>
        </section>
      </div>
      <section className={styles.surface}>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">QUEM FAZ PARTE</span>
            <h2>Estúdios da plataforma</h2>
          </div>
          <span className="chip">{studios.length} estúdios</span>
        </div>
        <div className={styles.filterBar}>
          <label className={styles.search}>
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar estúdio, cidade ou estado…"
              aria-label="Buscar estúdios cadastrados"
            />
          </label>
          <select
            className={styles.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filtrar estúdios"
          >
            <option value="all">Todos os estúdios</option>
            <option value="active">Ativos</option>
            <option value="inactive">Desativados</option>
            <option value="basic">Plano Básico</option>
            <option value="pro">Studio Pro</option>
          </select>
        </div>
        <div className={styles.adminStudioList}>
          {studios.map((studio) => (
            <article key={studio.id} className={styles.adminStudio}>
              <button
                className={styles.adminStudioSummary}
                aria-expanded={expanded === studio.id}
                onClick={() =>
                  setExpanded(expanded === studio.id ? null : studio.id)
                }
              >
                <span className={styles.monogram}>{studio.initials}</span>
                <span className={styles.clientName}>
                  <strong>{studio.name}</strong>
                  <small>
                    {studio.city}, {studio.state}
                  </small>
                </span>
                <span className={styles.planPill}>
                  {studio.plan === "pro" ? "Studio Pro" : "Básico"}
                </span>
                <span
                  className={`${styles.status} ${studio.active ? styles.completed : styles.pending}`}
                >
                  {studio.active ? "Ativo" : "Desativado"}
                </span>
                <ChevronDown
                  size={17}
                  className={expanded === studio.id ? styles.rotated : ""}
                />
              </button>
              {expanded === studio.id && (
                <div className={styles.adminStudioDetail}>
                  <p className="muted">{studio.description}</p>
                  <div className={styles.quoteMetadata}>
                    <div>
                      <small>ENDEREÇO</small>
                      <span>
                        {studio.address} · {studio.city}/{studio.state}
                      </span>
                    </div>
                    <div>
                      <small>CONTATO CADASTRADO</small>
                      <span>
                        {studio.whatsapp || "Não informado"} ·{" "}
                        {studio.isDemo ? "Fictício" : "Não verificado"}
                      </span>
                    </div>
                    <div>
                      <small>RESPONSÁVEL</small>
                      <span>
                        {state.profiles.find((p) => p.studioId === studio.id)
                          ?.name || "Perfil demonstrativo"}
                        <br />
                        {state.profiles.find((p) => p.studioId === studio.id)
                          ?.email || "Sem e-mail cadastrado"}
                      </span>
                    </div>
                    <div>
                      <small>ESTILOS</small>
                      <span>{studio.styles.join(" · ")}</span>
                    </div>
                  </div>
                  <div className={styles.adminCounts}>
                    <span>
                      <Palette size={15} />
                      {
                        state.arts.filter(
                          (a) => a.studioId === studio.id && a.published,
                        ).length
                      }{" "}
                      artes publicadas
                    </span>
                    <span>
                      <Users size={15} />
                      {studio.plan === "pro"
                        ? state.members.filter((m) => m.studioId === studio.id)
                            .length
                        : Math.min(
                            1,
                            state.members.filter(
                              (m) => m.studioId === studio.id,
                            ).length,
                          )}{" "}
                      profissionais ativos
                    </span>
                    <span>
                      <MessageSquare size={15} />
                      {
                        state.quotes.filter((q) => q.studioId === studio.id)
                          .length
                      }{" "}
                      pedidos
                    </span>
                  </div>
                  <div className={styles.adminControls}>
                    <label className={styles.statusSelect}>
                      Plano demonstrativo
                      <select
                        value={studio.plan}
                        aria-label="Plano demonstrativo"
                        onChange={(e) =>
                          plan(studio.id, e.target.value as Plan)
                        }
                      >
                        <option value="basic">Básico</option>
                        <option value="pro">Studio Pro</option>
                      </select>
                    </label>
                    <button
                      className="button secondary"
                      onClick={() => {
                        update((s) => ({
                          ...s,
                          studios: s.studios.map((item) =>
                            item.id === studio.id
                              ? { ...item, active: !item.active }
                              : item,
                          ),
                        }));
                        notify(
                          studio.active
                            ? "Estúdio desativado na descoberta pública."
                            : "Estúdio reativado na descoberta pública.",
                        );
                      }}
                    >
                      {studio.active ? <EyeOff size={16} /> : <Eye size={16} />}
                      {studio.active ? "Desativar estúdio" : "Ativar estúdio"}
                    </button>
                    <Link
                      href={`/estudios/perfil/?id=${studio.id}`}
                      className={styles.subtleLink}
                    >
                      Ver perfil público
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
        {!studios.length && (
          <div className="empty-state">
            Nenhum estúdio corresponde à sua busca.
          </div>
        )}
      </section>
      <p className={styles.footnote}>
        No ambiente conectado, o acesso administrativo deverá ser validado no
        servidor e protegido por políticas de dados. Este painel local serve
        para validar a experiência.
      </p>
    </div>
  );
}
