import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (f) => readFileSync(new URL(`../dist/${f}`, import.meta.url), "utf8");
const css = read("theme.css");

test("theme.css is loaded after style.css", () => {
  const html = read("index.html");
  assert.ok(html.indexOf('href="theme.css"') > html.indexOf('href="style.css"'));
});

test("theme defines the brand palette variables", () => {
  for (const c of ["#0e0a09", "#1a1210", "#5c0f14", "#8b1a1f", "#c9a24a", "#e6c77a", "#0f3b2e", "#f2e6d0", "#b8a994", "#ff3355"]) {
    assert.ok(css.toLowerCase().includes(c), `missing ${c}`);
  }
});

test("theme respects prefers-reduced-motion", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce[\s\S]*animation:\s*none/);
});

test("decorative overlays never intercept clicks", () => {
  assert.match(css, /body::after\s*{[^}]*pointer-events:\s*none/);
});
