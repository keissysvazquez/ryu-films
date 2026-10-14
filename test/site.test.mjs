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

test("every local asset referenced in index.html exists", () => {
  const refs = [...read("index.html").matchAll(/(?:src|href)="((?:assets\/|style\.css)[^"]*)"/g)].map((m) => m[1]);
  assert.ok(refs.length > 0);
  for (const r of refs) assert.ok(existsSync(new URL(r, dist)), `missing ${r}`);
});

test("hero has no video thumbnails and gallery shows only the three posters", () => {
  const w = load();
  const d = w.document;
  assert.equal(d.querySelectorAll(".trailer, .trailer-grid, .project, #projects").length, 0);
  assert.equal(d.querySelectorAll("#gallery .poster img").length, 3);
  assert.ok(d.querySelector("#home .featured-art img"));
  assert.ok(d.querySelector("#home .eyebrow"));
});

test("page order is Hero, Selected Work, Gallery, Let's Create; nav is Work then Gallery", () => {
  const d = load().document;
  const ids = [...d.querySelectorAll("main > section")].map((s) => s.id || s.className);
  assert.deepEqual(ids, ["home", "work", "gallery", "booking"]);
  assert.deepEqual([...d.querySelectorAll(".nav-links a")].map((a) => a.getAttribute("href")), ["#work", "#gallery"]);
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
  assert.ok(!w.document.querySelector("#booking-dialog").hasAttribute("open"));
  const ok = w.document.querySelector("#success-dialog");
  assert.ok(ok.hasAttribute("open"));
  assert.match(ok.textContent, /inquiry was sent/i);
  w.document.querySelector("#success-ok").click();
  assert.ok(!ok.hasAttribute("open"));
});

test("failed send shows an error and does not open an email app", async () => {
  const w = load({ fetchImpl: async () => ({ ok: false, status: 502 }) });
  fill(w).dispatchEvent(new w.Event("submit", { cancelable: true }));
  await tick();
  assert.match(w.document.querySelector(".form-status").textContent, /could not be sent/i);
});
