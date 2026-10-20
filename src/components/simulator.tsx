"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Box,
  Check,
  ImagePlus,
  Info,
  LockKeyhole,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Sun,
  X,
} from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { id } from "@/lib/rules";
import type { Project, ProjectTattoo, TattooArt } from "@/lib/types";
import { Model3DViewer } from "./model-3d-viewer";

const DRAFT_KEY = "personalitatto:preview-draft";

export function ModelSelector() {
  return (
    <div>
      <h2>01 / Visualização</h2>
      <div className="sim-model">
        <Box size={26} strokeWidth={1.3} />
        <div>
          Esfera interativa<small>MODELO TEMPORÁRIO · MVP</small>
        </div>
      </div>
      <div className="future-control" style={{ marginTop: 12 }}>
        Modelos humanos{" "}
        <small>
          FASE 2 <LockKeyhole size={8} style={{ display: "inline" }} />
        </small>
      </div>
    </div>
  );
}
export function SkinToneSelector() {
  return (
    <div>
      <h2>02 / Tom de pele</h2>
      <div className="future-control">
        Personalização <small>EM BREVE</small>
      </div>
      <div
        className="skin-swatches"
        aria-label="Exemplos de tons de pele, disponíveis na próxima fase"
      >
        {["#ead7c0", "#cdac8d", "#b48a67", "#8b5d44", "#573d30"].map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}
export function RegionSelector() {
  return (
    <div>
      <h2>03 / Região do corpo</h2>
      <div className="future-control">
        Seleção anatômica <small>FASE 2</small>
      </div>
      <p className="muted" style={{ fontSize: 9, lineHeight: 1.9 }}>
        As artes poderão ser posicionadas livremente no modelo humano.
      </p>
    </div>
  );
}
export function TattooEditor() {
  return (
    <div>
      <h2>Personalização da arte</h2>
      {[
        "Posição e escala",
        "Rotação e espelhamento",
        "Opacidade e projeção",
      ].map((t) => (
        <div className="future-control" key={t}>
          {t}
          <LockKeyhole size={10} />
        </div>
      ))}
      <p
        className="muted"
        style={{ fontSize: 9, lineHeight: 1.9, marginBottom: 0 }}
      >
        Disponível com os modelos humanos. A esfera não recebe tatuagens nesta
        prévia.
      </p>
    </div>
  );
}

export function Simulator() {
  const { state, ready, update, notify } = useDemo();
  const [name, setName] = useState("Minha próxima história");
  const [tattoos, setTattoos] = useState<ProjectTattoo[]>([]);
  const [projectId, setProjectId] = useState("");
  const [studioId, setStudioId] = useState("");
  const [rotation, setRotation] = useState(true);
  const [light, setLight] = useState<"steel" | "contrast">("steel");
  const [resetKey, setResetKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [returnTo, setReturnTo] = useState("/simulador/");
  useEffect(() => {
    if (!ready || loaded) return;
    const p = new URLSearchParams(window.location.search);
    setReturnTo(`/simulador/${window.location.search}`);
    const project = state.projects.find(
      (pr) => pr.id === p.get("project") && pr.userId === state.session?.id,
    );
    if (project) {
      setName(project.name);
      setTattoos(project.tattoos);
      setProjectId(project.id);
      setStudioId(project.studioId || "");
    } else if (p.has("project"))
      notify(
        "Projeto não encontrado neste perfil. Você pode criar um novo projeto.",
      );
    const art = state.arts.find((a) => a.id === p.get("art") && a.published);
    if (art && !project)
      setTattoos([
        {
          id: id("tattoo"),
          artId: art.id,
          name: art.name,
          image: art.image,
          origin: "studio",
          ownerStudioId: art.studioId,
        },
      ]);
    if (!project) setStudioId(p.get("studio") || art?.studioId || "");
    if (!project && state.session?.role === "client") {
      try {
        const stored = window.sessionStorage.getItem(DRAFT_KEY);
        if (stored) {
          const draft = JSON.parse(stored) as {
            name?: string;
            tattoos?: ProjectTattoo[];
            studioId?: string;
          };
          if (typeof draft.name === "string" && Array.isArray(draft.tattoos)) {
            setName(draft.name.slice(0, 80));
            setTattoos(
              draft.tattoos.filter(
                (t) =>
                  typeof t.id === "string" &&
                  typeof t.name === "string" &&
                  typeof t.image === "string" &&
                  ["upload", "studio"].includes(t.origin),
              ),
            );
            setStudioId(
              typeof draft.studioId === "string" ? draft.studioId : "",
            );
          }
          window.sessionStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        /* A draft is optional when session storage is unavailable. */
      }
    }
    setLoaded(true);
  }, [ready, loaded, state.projects, state.arts, state.session, notify]);
  const arts = state.arts.filter(
    (a) =>
      a.published &&
      (!studioId || a.studioId === studioId) &&
      state.studios.some((s) => s.id === a.studioId && s.active),
  );
  const add = (a: TattooArt) => {
    if (tattoos.some((t) => t.artId === a.id)) {
      setTattoos((t) => t.filter((x) => x.artId !== a.id));
      return;
    }
    setTattoos((t) => [
      ...t,
      {
        id: id("tattoo"),
        artId: a.id,
        name: a.name,
        image: a.image,
        origin: "studio",
        ownerStudioId: a.studioId,
      },
    ]);
  };
  const save = () => {
    if (state.session?.role !== "client") {
      notify("Entre em um perfil de demonstração para salvar seu projeto.");
      return;
    }
    if (!name.trim()) {
      notify("Dê um nome ao seu projeto.");
      return;
    }
    const now = new Date().toISOString();
    const existing = state.projects.find(
      (p) => p.id === projectId && p.userId === state.session!.id,
    );
    const project: Project = {
      id: existing?.id || id("project"),
      name: name.trim().slice(0, 80),
      userId: state.session.id,
      model: "sphere-preview",
      studioId: studioId || undefined,
      tattoos,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    update((s) => ({
      ...s,
      projects: existing
        ? s.projects.map((p) => (p.id === project.id ? project : p))
        : [project, ...s.projects],
    }));
    setProjectId(project.id);
    window.history.replaceState({}, "", `/simulador/?project=${project.id}`);
    notify(
      "Projeto salvo neste navegador. As artes são referências, sem projeção 3D.",
    );
  };
  const preserveDraft = () => {
    try {
      window.sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ name, tattoos, studioId }),
      );
    } catch {
      notify(
        "Não foi possível guardar a seleção temporária. Suas alterações ainda estão nesta tela.",
      );
    }
  };
  const upload = (file?: File) => {
    if (!file) return;
    setUploadError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setUploadError("Escolha uma imagem PNG, JPG ou WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("O limite por imagem é 2 MB nesta demonstração.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () =>
      setUploadError("Não foi possível ler a imagem. Tente outra vez.");
    reader.onload = () => {
      setTattoos((t) => [
        ...t,
        {
          id: id("tattoo"),
          name: file.name.replace(/\.[^.]+$/, "").slice(0, 60),
          image: String(reader.result),
          origin: "upload",
        },
      ]);
      notify(
        "Referência adicionada. A remoção de fundo será implementada na fase 2.",
      );
    };
    reader.readAsDataURL(file);
  };
  const studio = state.studios.find((s) => s.id === studioId);
  return (
    <div className="page-shell sim-page">
      <div className="sim-top">
        <div>
          <Link className="text-link" href="/estudios/" style={{ fontSize: 9 }}>
            <ArrowLeft size={12} /> Voltar à visão geral
          </Link>
          <h1>Seu espaço de criação.</h1>
          <p>
            {studio
              ? `Projeto com ${studio.name}`
              : "Explore possibilidades. Reúna suas referências."}
          </p>
        </div>
        <Link className="button secondary" href="/meus-projetos/">
          Meus projetos <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="notice" style={{ marginBottom: 22 }}>
        <Info size={16} />
        <p>
          <strong>Prévia de interface.</strong> A esfera é uma demonstração 3D
          interativa. As artes ficam na sua seleção como referências; os modelos
          humanos e a projeção na pele serão implementados na fase 2.
        </p>
      </div>
      <div className="sim-workspace">
        <aside className="sim-sidebar">
          <ModelSelector />
          <SkinToneSelector />
          <RegionSelector />
        </aside>
        <div className="sim-center">
          <div className="sim-center-grid" />
          <div className="sim-center-label">
            VIEWPORT / ESFERA 3D
            <span>ARRASTE PARA GIRAR · SCROLL OU PINÇA PARA ZOOM</span>
          </div>
          <div className="sim-canvas">
            <Model3DViewer
              autoRotate={rotation}
              lightMode={light}
              resetKey={resetKey}
            />
          </div>
          <div className="sim-controls">
            <button
              className="icon-button"
              onClick={() => setResetKey((k) => k + 1)}
              title="Restaurar visão"
              aria-label="Restaurar visão"
            >
              <RotateCcw size={15} />
            </button>
            <button
              className={`icon-button ${rotation ? "selected" : ""}`}
              onClick={() => setRotation(!rotation)}
              title={
                rotation
                  ? "Pausar rotação automática"
                  : "Ativar rotação automática"
              }
              aria-label={
                rotation
                  ? "Pausar rotação automática"
                  : "Ativar rotação automática"
              }
              aria-pressed={rotation}
            >
              {rotation ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              className={`icon-button ${light === "contrast" ? "selected" : ""}`}
              onClick={() =>
                setLight((l) => (l === "steel" ? "contrast" : "steel"))
              }
              title="Alternar iluminação"
              aria-label="Alternar iluminação"
              aria-pressed={light === "contrast"}
            >
              <Sun size={16} />
            </button>
            <span>3D EM TEMPO REAL</span>
          </div>
        </div>
        <aside className="sim-sidebar right">
          <div>
            <h2>
              Seleção de artes{" "}
              <span className="muted">
                / {tattoos.length.toString().padStart(2, "0")}
              </span>
            </h2>
            {tattoos.length ? (
              tattoos.map((t) => (
                <div className="sim-selected" key={t.id}>
                  <img src={t.image} alt={t.name} />
                  <div>
                    <strong>{t.name}</strong>
                    <small>
                      {t.origin === "upload"
                        ? "IMAGEM PRÓPRIA"
                        : "ARTE DO ESTÚDIO"}
                    </small>
                  </div>
                  <button
                    onClick={() =>
                      setTattoos((ts) => ts.filter((x) => x.id !== t.id))
                    }
                    aria-label={`Remover ${t.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            ) : (
              <p className="muted" style={{ fontSize: 10, lineHeight: 1.9 }}>
                Sua história começa com uma ideia. Escolha uma arte na galeria
                abaixo ou envie uma referência.
              </p>
            )}
          </div>
          <TattooEditor />
          <div className="sim-save">
            <label className="field">
              <span className="sr-only">Nome do projeto</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                placeholder="Nome do seu projeto"
              />
            </label>
            {state.session?.role === "client" ? (
              <button className="button" onClick={save}>
                <Save size={13} />
                Salvar projeto
              </button>
            ) : (
              <Link
                href={`/entrar/?next=${encodeURIComponent(returnTo)}`}
                onClick={preserveDraft}
                className="button"
              >
                {state.session
                  ? "Usar perfil de cliente"
                  : "Entrar para salvar"}{" "}
                <ArrowUpRight size={12} />
              </Link>
            )}
            <small>
              Dados locais de demonstração. Nenhuma tatuagem é projetada sobre a
              esfera.
            </small>
            {projectId && (
              <Link
                className="text-link"
                style={{ fontSize: 10, marginTop: 12, gridColumn: "1/-1" }}
                href={`/orcamentos/?project=${projectId}${studioId ? `&studio=${studioId}` : ""}`}
              >
                Solicitar orçamento demo <ArrowUpRight size={12} />
              </Link>
            )}
          </div>
        </aside>
      </div>
      <section className="sim-gallery">
        <div className="section-title">
          <div>
            <span className="eyebrow">ESCOLHA O PRÓXIMO TRAÇO</span>
            <h2>Inspiração para o seu projeto.</h2>
          </div>
          <Link className="text-link" href="/galeria/">
            Galeria completa <ArrowUpRight size={13} />
          </Link>
        </div>
        <label
          className="field"
          style={{ maxWidth: 260, marginBottom: 20, fontSize: 10 }}
        >
          Galeria do estúdio
          <select
            value={studioId}
            onChange={(e) => setStudioId(e.target.value)}
          >
            <option value="">Todos os estúdios</option>
            {state.studios
              .filter((s) => s.active)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        </label>
        <div className="sim-gallery-grid">
          {arts.slice(0, 11).map((a) => (
            <button
              key={a.id}
              className={`sim-art ${tattoos.some((t) => t.artId === a.id) ? "selected" : ""}`}
              onClick={() => add(a)}
              aria-pressed={tattoos.some((t) => t.artId === a.id)}
            >
              <img src={a.image} alt="" loading="lazy" />
              <span>
                {a.name}
                {tattoos.some((t) => t.artId === a.id) ? (
                  <Check size={12} />
                ) : (
                  <Plus size={12} />
                )}
              </span>
            </button>
          ))}
          <label className="sim-upload">
            <ImagePlus size={24} strokeWidth={1.3} />
            Enviar minha referência
            <small>
              PNG, JPG ou WebP · até 2 MB
              <br />
              Sem remoção de fundo nesta fase
            </small>
            <input
              type="file"
              className="sr-only"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {uploadError && (
          <p className="sim-error" role="alert">
            {uploadError}
          </p>
        )}
      </section>
    </div>
  );
}
