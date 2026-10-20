import type {
  Project,
  ProjectTattoo,
  QuoteRequest,
  Studio,
  TattooArt,
} from "./types";

export function id(prefix = "id"): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;
}

export function safeNextRoute(
  value: string | null | undefined,
  fallback = "/meus-projetos",
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(value)
  )
    return fallback;
  try {
    const route = new URL(value, "https://personalitatto.local");
    if (route.origin !== "https://personalitatto.local") return fallback;
    if (
      ["/entrar", "/cadastro", "/recuperar-senha"].includes(
        route.pathname.replace(/\/$/, ""),
      )
    )
      return fallback;
    return `${route.pathname}${route.search}${route.hash}`;
  } catch {
    return fallback;
  }
}

/** Owner metadata is authoritative even on malformed items marked as an upload. */
export function canUseTattooAtStudio(
  tattoo: ProjectTattoo,
  studioId: string,
): boolean {
  if (tattoo.ownerStudioId) return tattoo.ownerStudioId === studioId;
  return tattoo.origin === "upload";
}

export function getProjectConflicts(
  project: Project,
  studioId: string,
): ProjectTattoo[] {
  return project.tattoos.filter(
    (tattoo) => !canUseTattooAtStudio(tattoo, studioId),
  );
}

export function getAllowedTattoos(
  project: Project,
  studioId: string,
): ProjectTattoo[] {
  return project.tattoos.filter((tattoo) =>
    canUseTattooAtStudio(tattoo, studioId),
  );
}

export function makeProjectCopy(
  project: Project,
  userId: string,
  studioId?: string,
): Project {
  const timestamp = new Date().toISOString();
  return {
    ...structuredClone(project),
    id: id("project"),
    userId,
    name: `${project.name} · cópia`,
    studioId: studioId ?? project.studioId,
    tattoos: (studioId
      ? getAllowedTattoos(project, studioId)
      : project.tattoos
    ).map((tattoo) => ({ ...structuredClone(tattoo), id: id("tattoo") })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function canPublishArt(
  studio: Studio,
  arts: TattooArt[],
  excludeId?: string,
): boolean {
  return (
    studio.plan === "pro" ||
    arts.filter(
      (art) =>
        art.studioId === studio.id && art.published && art.id !== excludeId,
    ).length < 25
  );
}

export function buildWhatsAppMessage(quote: QuoteRequest): string {
  return [
    `Olá! Gostaria de solicitar um orçamento.`,
    `Referência: ${quote.id}${quote.isDemo ? " (demonstração)" : ""}`,
    `Cliente: ${quote.clientName}`,
    `Projeto: ${quote.projectName}`,
    `Artes: ${quote.items.map((item) => item.name).join(", ")}`,
    `Região: ${quote.region || "A combinar"}`,
    `Dimensões: ${quote.dimensions || "A combinar"}`,
    quote.notes ? `Observações: ${quote.notes}` : "",
    "O valor e a disponibilidade serão definidos pelo profissional.",
  ]
    .filter(Boolean)
    .join("\n");
}
