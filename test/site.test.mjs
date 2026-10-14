import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { JSDOM } from "jsdom";

const dist = new URL("../dist/", import.meta.url);
const read = (f) => readFileSync(new URL(f, dist), "utf8");

function load({ fetchImpl, config } = {}) {
  const dom = new JSDOM(read("index.html"), { runScripts: "outside-only", url: "https://ryufilms.com/" });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false });
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); this.dispatchEvent(new w.Event("close")); };
  w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  w.HTMLMediaElement.prototype.pause = () => {};
  w.fetch = fetchImpl ?? (async () => ({ ok: true }));
  w.eval(read("config.js"));
  if (config) Object.assign(w.RYU_CONFIG, config);
  w.eval(read("app.js"));
  return w;
}
const tick = () => new Promise((r) => setTimeout(r, 20));

test("config has 8 projects with existing poster files", () => {
  const w = load();
  const { projects } = w.RYU_CONFIG;
  assert.equal(projects.length, 8);
  for (const p of projects) {
    assert.ok(p.title && p.artist, "title and artist");
    assert.ok(existsSync(new URL(p.poster, dist)), `missing ${p.poster}`);
  }
});

test("every local asset referenced in index.html exists", () => {
  const refs = [...read("index.html").matchAll(/(?:src|href)="((?:assets\/|style\.css)[^"]*)"/g)].map((m) => m[1]);
  assert.ok(refs.length > 0);
  for (const r of refs) assert.ok(existsSync(new URL(r, dist)), `missing ${r}`);
});

test("renders a trailer tile and a gallery card per project", () => {
  const w = load();
  assert.equal(w.document.querySelectorAll(".trailer").length, 8);
  assert.equal(w.document.querySelectorAll(".project").length, 8);
});

test("clicking a project opens the preview dialog", () => {
  const w = load();
  w.document.querySelector(".project").click();
  assert.ok(w.document.querySelector("#work-dialog").hasAttribute("open"));
  assert.equal(w.document.querySelector("#work-title").textContent, w.RYU_CONFIG.projects[0].title);
});

test("Book Me buttons open the booking dialog", () => {
  const w = load();
  w.document.querySelector(".nav-book").click();
  assert.ok(w.document.querySelector("#booking-dialog").hasAttribute("open"));
});

test("booking email is configured and button says Send inquiry", () => {
  const w = load();
  assert.equal(w.RYU_CONFIG.bookingEmail, "raulduplessi@yahoo.com");
  assert.equal(w.document.querySelector("#inquiry-action").textContent, "Send inquiry");
});

function fill(w) {
  const f = w.document.querySelector("#inquiry");
  f.elements.name.value = "Ann";
  f.elements.email.value = "ann@example.com";
  f.elements.details.value = "Hello";
  return f;
}

test("submitting posts to /api/inquiry and shows success", async () => {
  let call;
  const w = load({ fetchImpl: async (url, opts) => { call = { url, opts }; return { ok: true }; } });
  fill(w).dispatchEvent(new w.Event("submit", { cancelable: true }));
  await tick();
  assert.equal(call.url, "/api/inquiry");
  assert.equal(JSON.parse(call.opts.body).email, "ann@example.com");
  assert.match(w.document.querySelector(".form-status").textContent, /sent/i);
});

test("failed send falls back to a mailto link", async () => {
  const w = load({ fetchImpl: async () => ({ ok: false, status: 502 }) });
  fill(w).dispatchEvent(new w.Event("submit", { cancelable: true }));
  await tick();
  assert.match(w.document.querySelector(".form-status").textContent, /email app/i);
});
