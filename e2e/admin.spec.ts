import { expect, test, type Page } from "@playwright/test";
import { createDemoState } from "../src/lib/demo-data";
import type { DemoState, Role } from "../src/lib/types";

const storageKey = "personalitatto:demo:v1";

async function seed(
  page: Page,
  role?: Role,
  change?: (state: DemoState) => void,
) {
  const state = createDemoState();
  if (role)
    state.session =
      state.profiles.find((profile) => profile.role === role) ?? null;
  change?.(state);
  await page.addInitScript(
    ({ key, value }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(value));
    },
    { key: storageKey, value: state },
  );
  return state;
}

async function saved(page: Page): Promise<DemoState> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) || "{}"),
    storageKey,
  );
}

function addNoirArts(state: DemoState, count: number) {
  const template = state.arts.find((art) => art.studioId === "noir")!;
  const existing = state.arts.filter((art) => art.studioId === "noir").length;
  for (let index = existing; index < count; index += 1)
    state.arts.push({
      ...template,
      id: `qa-art-${index}`,
      name: `Arte de limite ${index + 1}`,
      published: true,
      publicDemo: false,
    });
}

test("studio and platform areas require an explicit demo role selection", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/estudio/painel");
  await expect(
    page.getByRole("heading", { name: "Entre no seu espaço." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Entrar como estúdio demo" }),
  ).toBeVisible();
  expect((await saved(page)).session).toBeNull();
  await page.getByRole("button", { name: "Entrar como estúdio demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Seu estúdio em movimento." }),
  ).toBeVisible();
  expect((await saved(page)).session?.studioId).toBe("noir");
  await page.goto("/admin");
  await expect(
    page.getByRole("button", { name: "Entrar como administrador demo" }),
  ).toBeVisible();
  expect((await saved(page)).session?.role).toBe("studio");
});

test("quotes group requests by client and update an individual request inline", async ({
  page,
}) => {
  await seed(page, "studio");
  await page.goto("/estudio/orcamentos");
  const alex = page.getByRole("button", {
    name: /Alex Morgan alex@example.com 2 pedidos/,
  });
  await expect(alex).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Entre a lua e a tinta" }),
  ).not.toBeVisible();
  await alex.click();
  await expect(alex).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("heading", { name: "Entre a lua e a tinta" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Minha próxima história" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Concluir pedido" }),
  ).toHaveCount(2);
  await page
    .getByRole("button", { name: "Ver prévia do projeto" })
    .first()
    .click();
  await expect(
    page.getByText("Referências preservadas no momento do pedido."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Concluir pedido" }).first().click();
  await expect(
    page.getByRole("button", { name: /Alex Morgan alex@example.com 1 pedido/ }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/estudio\/orcamentos\/?$/);
  expect(
    (await saved(page)).quotes.find((quote) => quote.id === "PT-2026-001")
      ?.status,
  ).toBe("completed");
  await page.getByRole("tab", { name: /Concluídos/ }).click();
  await expect(page.getByRole("button", { name: /Alex Morgan/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Júlia Ramos/ })).toBeVisible();
});

test("artwork can be created, edited, published publicly and removed without losing project snapshots", async ({
  page,
}) => {
  const original = await seed(page, "studio");
  await page.goto("/estudio/artes");
  await page.getByRole("button", { name: "Nova arte" }).click();
  await page
    .getByLabel("Nome da arte", { exact: true })
    .fill("Traço de teste autoral");
  await page.getByLabel("Estilo", { exact: true }).selectOption("Blackwork");
  await page
    .getByLabel("Descrição", { exact: true })
    .fill("Uma criação de demonstração para validar a galeria.");
  await page
    .getByLabel("Tags, separadas por vírgula")
    .fill("teste, autoral, teste");
  await page
    .getByRole("button", { name: "Usar arte demonstrativa rose" })
    .click();
  await page.getByLabel("Publicar na galeria do estúdio").check();
  await page.getByLabel("Disponibilizar na demonstração pública").check();
  await page.getByRole("button", { name: "Salvar arte" }).click();
  await expect(
    page.getByRole("heading", { name: "Traço de teste autoral" }),
  ).toBeVisible();
  let state = await saved(page);
  const art = state.arts.find(
    (item) => item.name === "Traço de teste autoral",
  )!;
  expect(art).toMatchObject({
    studioId: "noir",
    image: "/art/rose.svg",
    published: true,
    publicDemo: true,
    tags: ["teste", "autoral"],
  });
  await page.goto("/estudios/perfil/?id=noir");
  await expect(
    page.getByRole("heading", { name: "Traço de teste autoral" }),
  ).toBeVisible();
  await page.goto("/estudio/artes");
  await page
    .getByRole("button", { name: "Editar Traço de teste autoral", exact: true })
    .click();
  await page.getByLabel("Nome da arte", { exact: true }).fill("Traço revisado");
  await page.getByLabel("Disponibilizar na demonstração pública").uncheck();
  await page.getByRole("button", { name: "Salvar arte" }).click();
  await expect(
    page.getByRole("heading", { name: "Traço revisado" }),
  ).toBeVisible();
  state = await saved(page);
  expect(state.arts.find((item) => item.id === art.id)).toMatchObject({
    name: "Traço revisado",
    publicDemo: false,
  });
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Excluir Serpente lunar", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Serpente lunar", exact: true }),
  ).toHaveCount(0);
  state = await saved(page);
  expect(state.projects).toEqual(original.projects);
  expect(state.quotes).toEqual(original.quotes);
});

test("Basic enforces 25 simultaneous publications and only one active professional", async ({
  page,
}) => {
  await seed(page, "studio", (state) => {
    state.studios.find((studio) => studio.id === "noir")!.plan = "basic";
    addNoirArts(state, 25);
    state.arts.push({
      ...state.arts[0],
      id: "qa-draft",
      name: "Rascunho para publicação",
      published: false,
      publicDemo: false,
    });
  });
  await page.goto("/estudio/artes");
  const draft = page.locator("article").filter({
    has: page.getByRole("heading", { name: "Rascunho para publicação" }),
  });
  await draft.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Limite de 25 publicações",
  );
  expect(
    (await saved(page)).arts.find((art) => art.id === "qa-draft")?.published,
  ).toBe(false);
  const original = page.locator("article").filter({
    has: page.getByRole("heading", { name: "Serpente lunar", exact: true }),
  });
  await original.getByRole("button", { name: "Ocultar", exact: true }).click();
  await draft.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(draft.getByText("Publicada", { exact: true })).toBeVisible();
  expect(
    (await saved(page)).arts.filter(
      (art) => art.studioId === "noir" && art.published,
    ),
  ).toHaveLength(25);
  await page.goto("/estudio/equipe");
  await expect(
    page.getByText("1 profissional ativo", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Adicionar profissional" }),
  ).toHaveCount(0);
  await expect(page.getByText("PRESERVADO · INATIVO NO BÁSICO")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Conhecer o Studio Pro" }),
  ).toBeVisible();
});

test("downgrading preserves excess arts, team records, projects and quotes", async ({
  page,
}) => {
  const original = await seed(page, "studio", (state) =>
    addNoirArts(state, 30),
  );
  await page.goto("/estudio/assinatura");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Simular plano Básico" }).click();
  await expect(page.getByRole("status")).toContainText("Básico ativado");
  let state = await saved(page);
  expect(state.arts.filter((art) => art.studioId === "noir")).toHaveLength(30);
  expect(
    state.arts.filter((art) => art.studioId === "noir" && art.published),
  ).toHaveLength(25);
  expect(state.members).toEqual(original.members);
  expect(state.projects).toEqual(original.projects);
  expect(state.quotes).toEqual(original.quotes);
  await page.goto("/estudio/equipe");
  await expect(
    page.getByText("1 profissional ativo", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Luca Reis" })).toBeVisible();
  await page.goto("/estudio/assinatura");
  await page.getByRole("button", { name: "Simular plano Studio Pro" }).click();
  await page.goto("/estudio/equipe");
  await expect(
    page.getByText("2 profissionais ativos", { exact: true }),
  ).toBeVisible();
  state = await saved(page);
  expect(state.arts.filter((art) => art.studioId === "noir")).toHaveLength(30);
  expect(state.projects).toEqual(original.projects);
});

test("studio panel only displays and changes data belonging to the session studio", async ({
  page,
}) => {
  const original = await seed(page, "studio", (state) => {
    const session = state.profiles.find(
      (profile) => profile.id === "studio-demo",
    )!;
    session.studioId = "linha";
    state.session = session;
  });
  await page.goto("/estudio/artes");
  await expect(
    page.getByRole("heading", { name: "Rosa essencial" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Serpente lunar" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Editar Rosa essencial", exact: true })
    .click();
  await page
    .getByLabel("Nome da arte", { exact: true })
    .fill("Rosa essencial revisada");
  await page.getByRole("button", { name: "Salvar arte" }).click();
  await expect(
    page.getByRole("heading", { name: "Rosa essencial revisada" }),
  ).toBeVisible();
  const state = await saved(page);
  expect(state.arts.filter((art) => art.studioId !== "linha")).toEqual(
    original.arts.filter((art) => art.studioId !== "linha"),
  );
  await page.goto("/estudio/orcamentos");
  await expect(page.getByText("Tudo em dia por aqui.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Alex Morgan/ })).toHaveCount(
    0,
  );
});

test("platform admin changes a studio plan and activation reflected in discovery", async ({
  page,
}) => {
  await seed(page, "admin");
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Uma visão de toda a cena." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Noir Tattoo Studio Sorocaba, SP/ })
    .click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByLabel("Plano demonstrativo", { exact: true })
    .selectOption("basic");
  await expect(page.getByRole("status")).toContainText(
    "Plano demonstrativo atualizado",
  );
  await page
    .getByRole("button", { name: "Desativar estúdio", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Ativar estúdio", exact: true }),
  ).toBeVisible();
  const state = await saved(page);
  expect(state.studios.find((studio) => studio.id === "noir")).toMatchObject({
    active: false,
    plan: "basic",
  });
  expect(state.studios.find((studio) => studio.id === "linha")).toMatchObject({
    active: true,
    plan: "basic",
  });
  await page.goto("/estudios");
  await expect(
    page.getByRole("heading", { name: "Noir Tattoo Studio", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Linha Fina Atelier", exact: true }),
  ).toBeVisible();
});

test("studio quotes and global admin remain within the 390px mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page, "studio");
  await page.goto("/estudio/orcamentos");
  await page
    .getByRole("button", { name: /Alex Morgan alex@example.com 2 pedidos/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Entre a lua e a tinta" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  await page.screenshot({
    path: "artifacts/admin-studio-mobile.png",
    fullPage: true,
  });
  await page.goto("/admin");
  await page
    .getByRole("button", { name: "Entrar como administrador demo" })
    .click();
  await page
    .getByRole("button", { name: /Noir Tattoo Studio Sorocaba, SP/ })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
  const dismissNotice = page.getByRole("button", {
    name: "Fechar notificação",
  });
  if (await dismissNotice.isVisible()) await dismissNotice.click();
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    (document.activeElement as HTMLElement | null)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "artifacts/admin-platform-mobile.png",
    fullPage: true,
  });
});
