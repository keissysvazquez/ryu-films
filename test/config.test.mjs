import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cfg = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const json = JSON.parse(cfg);

test("wrangler config serves dist and runs the worker only for /api/*", () => {
  assert.equal(json.assets.directory, "dist");
  assert.deepEqual(json.assets.run_worker_first, ["/api/*"]);
});

test("dev environment is a separate worker with its own bindings", () => {
  const dev = json.env.dev;
  assert.notEqual(dev.name, json.name);
  assert.equal(dev.assets.directory, "dist");
  assert.ok(dev.send_email.some((b) => b.name === "EMAIL"));
  assert.ok(dev.vars.TO_EMAIL && dev.vars.FROM_EMAIL);
});
