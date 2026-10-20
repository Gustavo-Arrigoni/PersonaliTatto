import { test, expect } from "@playwright/test";

test("public discovery filters and gallery details remain navigable", async ({
  page,
}) => {
  await page.goto("/estudios/");
  await page
    .getByRole("textbox", { name: "Pesquisar por estúdio, cidade ou estado" })
    .fill("sorocaba");
  await expect(page.getByText("2 estúdios", { exact: true })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Filtrar por estilo" })
    .selectOption("Fine line");
  await expect(page.getByText("1 estúdio", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Noir Tattoo Studio/ }).click();
  await expect(
    page.getByRole("heading", { name: "Noir Tattoo Studio", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Ver arte Serpente lunar, Blackwork" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Serpente lunar" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.goto("/galeria/");
  await page
    .getByRole("textbox", { name: "Pesquisar arte" })
    .fill("nenhuma-arte-com-esse-nome");
  await expect(
    page.getByRole("heading", { name: "Nenhuma arte encontrada." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.locator(".art-card")).toHaveCount(12);
});

test("hero renders a real WebGL scene and reduced motion stops the carousel", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A ARTE GANHA CORPO." }),
  ).toBeVisible();
  await expect(page.locator(".hero canvas")).toBeVisible();
  await page.screenshot({ path: "artifacts/hero-desktop.png" });
  expect(
    await page.locator(".hero canvas").evaluate((canvas) => {
      const node = canvas as HTMLCanvasElement;
      return (
        !!(node.getContext("webgl2") || node.getContext("webgl")) &&
        node.width > 0
      );
    }),
  ).toBeTruthy();
  expect(
    await page
      .locator(".hero-carousel-track")
      .evaluate((el) => getComputedStyle(el).animationIterationCount),
  ).toBe("1");
  expect(errors).toEqual([]);
});

test("WebGL-unavailable devices get an honest accessible fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/simulador/");
  await expect(
    page.getByText("Prévia 3D indisponível neste dispositivo"),
  ).toBeVisible();
  await expect(
    page.getByText("Ative o WebGL para explorar a esfera."),
  ).toBeVisible();
});

test("mobile landing navigation has no horizontal overflow and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A ARTE GANHA CORPO." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.screenshot({ path: "artifacts/menu-mobile.png" });
  await page
    .getByRole("navigation", { name: "Navegação mobile" })
    .getByRole("link", { name: /Explorar estúdios/ })
    .click();
  await expect(
    page.getByRole("heading", { name: /O lugar certo/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegação mobile" }),
  ).not.toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
