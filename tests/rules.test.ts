import test from "node:test";
import assert from "node:assert/strict";
import { createDemoState } from "../src/lib/demo-data";
import {
  canPublishArt,
  canUseTattooAtStudio,
  getProjectConflicts,
  getAllowedTattoos,
  makeProjectCopy,
  safeNextRoute,
  buildWhatsAppMessage,
} from "../src/lib/rules";

test("cross-studio references are excluded and personal references are retained", () => {
  const state = createDemoState();
  const original = state.projects.find(
    (project) => project.id === "project-lunar",
  )!;
  assert.equal(getProjectConflicts(original, "linha").length, 1);
  assert.deepEqual(
    getAllowedTattoos(original, "linha").map((item) => item.id),
    ["pt-personal"],
  );
  assert.equal(getProjectConflicts(original, "noir").length, 0);
  assert.equal(
    canUseTattooAtStudio({ ...original.tattoos[0], origin: "upload" }, "linha"),
    false,
  );
  assert.equal(
    canUseTattooAtStudio(
      { ...original.tattoos[0], ownerStudioId: undefined },
      "linha",
    ),
    false,
  );
});

test("copying for a different studio preserves the original and resets item IDs", () => {
  const original = createDemoState().projects[0];
  const before = structuredClone(original);
  const copy = makeProjectCopy(original, original.userId, "linha");
  assert.deepEqual(original, before);
  assert.notEqual(copy.id, original.id);
  assert.equal(copy.studioId, "linha");
  assert.equal(copy.tattoos.length, 1);
  assert.notEqual(copy.tattoos[0].id, original.tattoos[1].id);
  copy.tattoos[0].name = "Alterado";
  assert.equal(original.tattoos[1].name, before.tattoos[1].name);
});

test("local return routes preserve a destination and reject open redirects and auth loops", () => {
  assert.equal(
    safeNextRoute("/orcamentos?project=project-lunar&studio=noir"),
    "/orcamentos?project=project-lunar&studio=noir",
  );
  for (const unsafe of [
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "javascript:alert(1)",
    "/entrar?next=/admin",
    "/cadastro/",
    "/recuperar-senha",
    "/foo\nbar",
  ])
    assert.equal(safeNextRoute(unsafe), "/meus-projetos");
  assert.equal(safeNextRoute(null, "/estudio/painel"), "/estudio/painel");
});

test("basic studios can publish 25 arts and can replace an existing published art", () => {
  const state = createDemoState();
  const studio = state.studios.find((item) => item.id === "linha")!;
  const template = state.arts.find((item) => item.studioId === studio.id)!;
  const full = Array.from({ length: 25 }, (_, i) => ({
    ...template,
    id: `art-${i}`,
    published: true,
  }));
  assert.equal(canPublishArt(studio, full), false);
  assert.equal(canPublishArt(studio, full, "art-0"), true);
  assert.equal(canPublishArt(studio, full.slice(1)), true);
  assert.equal(canPublishArt({ ...studio, plan: "pro" }, full), true);
});

test("demo messages describe the request without asserting an actual send or price", () => {
  const quote = createDemoState().quotes[0];
  const text = buildWhatsAppMessage(quote);
  assert.match(text, /PT-2026-001 \(demonstração\)/);
  assert.match(text, /Serpente lunar/);
  assert.match(
    text,
    /valor e a disponibilidade serão definidos pelo profissional/,
  );
});

test("resets produce isolated fixture objects", () => {
  const first = createDemoState();
  first.studios[0].name = "Changed";
  first.projects[0].tattoos[0].name = "Changed";
  const second = createDemoState();
  assert.equal(second.studios[0].name, "Noir Tattoo Studio");
  assert.equal(second.projects[0].tattoos[0].name, "Serpente lunar");
});
