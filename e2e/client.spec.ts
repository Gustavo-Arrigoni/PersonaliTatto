import { test as base, expect, type Page } from "@playwright/test";
import type { DemoState } from "../src/lib/types";

const storageKey = "personalitatto:demo:v1";
const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (
          message.type() === "error" &&
          /hydration|uncaught|TypeError|ReferenceError/i.test(message.text())
        )
          errors.push(message.text());
      });
      await use(errors);
      expect(errors, "No browser runtime or hydration errors").toEqual([]);
    },
    { auto: true },
  ],
});

async function localState(page: Page): Promise<DemoState> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "{}"),
    storageKey,
  );
}

async function goto(page: Page, destination: string) {
  await page.goto(destination);
  await expect(page.locator('[data-demo-ready="true"]')).toBeAttached();
}

async function loginClient(page: Page, next?: string) {
  await goto(
    page,
    `/entrar/${next ? `?next=${encodeURIComponent(next)}` : ""}`,
  );
  await page.getByRole("button", { name: "Cliente demo", exact: true }).click();
  await expect(page).toHaveURL(
    next ? new RegExp(next.split("?")[0]) : /meus-projetos/,
  );
  await expect
    .poll(async () => (await localState(page)).session?.id)
    .toBe("client-demo");
}

async function expectNoOverflow(page: Page) {
  const viewport = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    width: innerWidth,
  }));
  expect(viewport.content).toBeLessThanOrEqual(viewport.width + 1);
}

test("demo login preserves a protected destination and project changes survive reload", async ({
  page,
}) => {
  await goto(page, "/meus-projetos/");
  await expect(
    page.getByRole("heading", { name: "Suas ideias merecem um lugar." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Entrar para continuar" }).click();
  await expect(page).toHaveURL(/entrar.*next=/);
  await page.getByRole("button", { name: "Cliente demo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Meus projetos." }),
  ).toBeVisible();
  await page.getByRole("searchbox", { name: "Buscar projetos" }).fill("lua");
  await expect(
    page.getByRole("heading", { name: "Entre a lua e a tinta", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Minha próxima história", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Duplicar Entre a lua e a tinta",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Entre a lua e a tinta · cópia",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Renomear Entre a lua e a tinta · cópia",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Novo nome do projeto" })
    .fill("Lua · projeto revisado");
  await page.getByRole("button", { name: "Salvar nome", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Lua · projeto revisado", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Lua · projeto revisado", exact: true }),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        (await localState(page)).projects.filter(
          (project) => project.userId === "client-demo",
        ).length,
    )
    .toBe(4);
  await page
    .getByRole("button", {
      name: "Excluir Lua · projeto revisado",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Excluir projeto", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Lua · projeto revisado", exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(
      async () =>
        (await localState(page)).projects.filter(
          (project) => project.userId === "client-demo",
        ).length,
    )
    .toBe(3);
  await page
    .getByRole("button", { name: "Criar novo projeto", exact: true })
    .click();
  await expect(page).toHaveURL(/simulador.*project=/);
  await page
    .getByRole("textbox", { name: "Nome do projeto" })
    .fill("Memórias em preto");
  await page
    .getByRole("button", { name: "Serpente lunar", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Salvar projeto", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (await localState(page)).projects.find(
          (project) => project.name === "Memórias em preto",
        )?.tattoos.length,
    )
    .toBe(1);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Nome do projeto" }),
  ).toHaveValue("Memórias em preto");
  await expect(
    page.getByRole("button", { name: "Remover Serpente lunar", exact: true }),
  ).toBeVisible();
  const saved = await localState(page);
  const original = saved.projects.find(
    (project) => project.id === "project-lunar",
  )!;
  expect(original.tattoos).toHaveLength(2);
  expect(
    saved.projects.find((project) => project.id === "project-julia")?.userId,
  ).toBe("client-julia");
  expect(
    saved.projects.find((project) => project.name === "Memórias em preto")
      ?.model,
  ).toBe("sphere-preview");
});

test("cross-studio conflict hides only this request and a clean copy preserves the original", async ({
  page,
}) => {
  await loginClient(page, "/orcamentos/?project=project-lunar&studio=linha");
  await expect(
    page.getByText("1 arte pertence a outro estúdio."),
  ).toBeVisible();
  const submit = page.getByRole("button", {
    name: "Registrar pedido de demonstração",
    exact: true,
  });
  await expect(submit).toBeDisabled();
  const original = structuredClone(
    (await localState(page)).projects.find(
      (project) => project.id === "project-lunar",
    )!,
  );
  await page
    .getByRole("button", { name: "Ocultar temporariamente", exact: true })
    .click();
  await expect(submit).toBeEnabled();
  await page
    .getByRole("textbox", { name: "Região do corpo", exact: true })
    .fill("Antebraço");
  await page
    .getByRole("textbox", {
      name: "Dimensões aproximadas (opcional)",
      exact: true,
    })
    .fill("12 × 8 cm");
  await page
    .getByRole("textbox", { name: "Observações (opcional)", exact: true })
    .fill("Referência pessoal para ajustar com o artista.");
  await submit.click();
  await expect(
    page.getByRole("heading", { name: "Seu pedido demo está organizado." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "WhatsApp indisponível no demo" }),
  ).toBeDisabled();
  let state = await localState(page);
  const quote = state.quotes.at(-1)!;
  expect(quote.studioId).toBe("linha");
  expect(quote.items).toHaveLength(1);
  expect(quote.items[0].origin).toBe("upload");
  expect(quote.items.some((item) => item.ownerStudioId === "noir")).toBe(false);
  expect(state.projects.find((project) => project.id === original.id)).toEqual(
    original,
  );
  await goto(page, "/orcamentos/?project=project-lunar&studio=linha");
  await page
    .getByRole("button", { name: "Criar cópia sem essas artes", exact: true })
    .click();
  await expect(page.getByText("1 arte pertence a outro estúdio.")).toHaveCount(
    0,
  );
  await expect
    .poll(
      async () =>
        (await localState(page)).projects.filter(
          (project) => project.name === `${original.name} · cópia`,
        ).length,
    )
    .toBe(1);
  state = await localState(page);
  const copy = state.projects.find(
    (project) => project.name === `${original.name} · cópia`,
  )!;
  expect(copy.studioId).toBe("linha");
  expect(copy.userId).toBe("client-demo");
  expect(copy.tattoos).toHaveLength(1);
  expect(copy.tattoos[0].origin).toBe("upload");
  expect(state.projects.find((project) => project.id === original.id)).toEqual(
    original,
  );
  await page.reload();
  expect(
    (await localState(page)).projects.find(
      (project) => project.id === original.id,
    ),
  ).toEqual(original);
});

test("a client request appears inside one expandable studio client group", async ({
  page,
}) => {
  await loginClient(page, "/orcamentos/?project=project-lunar&studio=noir");
  await page
    .getByRole("textbox", { name: "Região do corpo", exact: true })
    .fill("Braço");
  await page
    .getByRole("textbox", { name: "Observações (opcional)", exact: true })
    .fill("Pedido integrado do teste de cliente.");
  await page
    .getByRole("button", {
      name: "Registrar pedido de demonstração",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Seu pedido demo está organizado." }),
  ).toBeVisible();
  const quote = (await localState(page)).quotes.at(-1)!;
  await goto(page, "/entrar/");
  await page.getByRole("button", { name: "Estúdio demo", exact: true }).click();
  await expect(page).toHaveURL(/estudio\/painel/);
  await goto(page, "/estudio/orcamentos/");
  await expect(page.getByRole("tab", { name: "Pendentes" })).toBeVisible();
  const group = page.getByRole("button", { name: /Alex Morgan.*3 pedidos/ });
  await expect(group).toHaveCount(1);
  await expect(group).toHaveAttribute("aria-expanded", "false");
  await group.click();
  await expect(group).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("Pedido integrado do teste de cliente.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", {
      name: `Status do pedido ${quote.id}`,
      exact: true,
    })
    .selectOption("completed");
  await page.getByRole("tab", { name: "Concluídos" }).click();
  await expect(
    page.getByRole("button", { name: /Alex Morgan.*1 pedido/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Alex Morgan.*1 pedido/ }).click();
  await expect(
    page.getByText("Pedido integrado do teste de cliente.", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        (await localState(page)).quotes.find((item) => item.id === quote.id)
          ?.status,
    )
    .toBe("completed");
});

test("registration validates fields, persists only a local profile and keeps safe redirects", async ({
  page,
}) => {
  await goto(page, "/cadastro/?next=%2Fmeus-projetos%2F");
  await page
    .getByRole("button", { name: "Criar perfil de demonstração", exact: true })
    .click();
  await expect(
    page.getByText("Informe seu nome.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Informe um e-mail válido.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Seu nome", exact: true })
    .fill("Cliente Novo");
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("cliente.novo@example.com");
  await page
    .getByLabel("Crie uma senha", { exact: true })
    .fill("SenhaFicticia123");
  await page
    .getByLabel("Confirme a senha", { exact: true })
    .fill("Diferente123");
  await page
    .getByRole("button", { name: "Criar perfil de demonstração", exact: true })
    .click();
  await expect(
    page.getByText("As senhas precisam ser iguais.", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Confirme a senha", { exact: true })
    .fill("SenhaFicticia123");
  await page
    .getByRole("button", { name: "Criar perfil de demonstração", exact: true })
    .click();
  await expect(page).toHaveURL(/meus-projetos/);
  await expect(
    page.getByRole("heading", { name: "Toda história começa com uma ideia." }),
  ).toBeVisible();
  const state = await localState(page);
  expect(state.session?.name).toBe("Cliente Novo");
  expect(state.session?.role).toBe("client");
  const persisted = await page.evaluate(
    (key) => localStorage.getItem(key),
    storageKey,
  );
  expect(persisted).not.toContain("SenhaFicticia123");
  expect(persisted).not.toContain("password");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Toda história começa com uma ideia." }),
  ).toBeVisible();
  const localOrigin = new URL(page.url()).origin;
  await goto(page, "/entrar/?next=https%3A%2F%2Fexample.com");
  await page.getByRole("button", { name: "Cliente demo", exact: true }).click();
  await expect(page).toHaveURL(/\/meus-projetos\/?$/);
  expect(new URL(page.url()).origin).toBe(localOrigin);
});

test("professional registration creates its own studio, planned subscription and member", async ({
  page,
}) => {
  await goto(page, "/cadastro/?tipo=estudio&plano=pro");
  await expect(
    page.getByRole("button", { name: "Sou tatuador", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("textbox", { name: "Nome do responsável", exact: true })
    .fill("Artista Demo");
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill("artista.novo@example.com");
  await page
    .getByLabel("Crie uma senha", { exact: true })
    .fill("SenhaFicticia123");
  await page
    .getByLabel("Confirme a senha", { exact: true })
    .fill("SenhaFicticia123");
  await page
    .getByRole("textbox", { name: "Nome do estúdio", exact: true })
    .fill("Traço Novo Demo");
  await page
    .getByRole("textbox", { name: "WhatsApp com DDD", exact: true })
    .fill("(15) 99999-0000");
  await page
    .getByRole("textbox", { name: "Cidade", exact: true })
    .fill("Sorocaba");
  await page
    .getByRole("textbox", { name: "Endereço comercial", exact: true })
    .fill("Endereço fictício, 123");
  await page
    .getByRole("textbox", { name: "Sobre seu estúdio", exact: true })
    .fill("Perfil fictício para validar o fluxo de cadastro profissional.");
  await expect(
    page.getByRole("combobox", { name: "Plano de demonstração", exact: true }),
  ).toHaveValue("pro");
  await page
    .getByRole("button", { name: "Criar estúdio de demonstração", exact: true })
    .click();
  await expect(page).toHaveURL(/estudio\/painel/);
  await expect(
    page.getByRole("heading", { name: "Seu estúdio em movimento." }),
  ).toBeVisible();
  const state = await localState(page);
  expect(state.session?.role).toBe("studio");
  const studio = state.studios.find(
    (entry) => entry.id === state.session?.studioId,
  )!;
  expect(studio.name).toBe("Traço Novo Demo");
  expect(studio.plan).toBe("pro");
  expect(studio.isDemo).toBe(true);
  expect(
    state.members.filter((member) => member.studioId === studio.id),
  ).toHaveLength(1);
  expect(JSON.stringify(state)).not.toContain("SenhaFicticia123");
});

test("discovery filters and mobile client screens stay inside a 390px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await goto(page, "/estudios/");
  await page
    .getByRole("combobox", { name: "Filtrar por cidade", exact: true })
    .selectOption("Campinas");
  await expect(
    page.getByRole("heading", { name: "Linha Fina Atelier", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".studio-card")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Filtrar por estilo", exact: true })
    .selectOption("Blackwork");
  await expect(
    page.getByRole("heading", { name: "Nenhum estúdio por aqui." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Limpar filtros", exact: true })
    .click();
  await expect(page.locator(".studio-card")).toHaveCount(6);
  await expectNoOverflow(page);
  await goto(page, "/entrar/");
  await expectNoOverflow(page);
  await page.screenshot({ path: "artifacts/login-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Cliente demo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Meus projetos." }),
  ).toBeVisible();
  await expectNoOverflow(page);
  await page.screenshot({
    path: "artifacts/projects-mobile.png",
    fullPage: true,
  });
  await goto(page, "/orcamentos/?project=project-lunar&studio=linha");
  await expect(
    page.getByRole("button", { name: "Ocultar temporariamente", exact: true }),
  ).toBeVisible();
  await expectNoOverflow(page);
  await page.screenshot({ path: "artifacts/quote-mobile.png", fullPage: true });
});
