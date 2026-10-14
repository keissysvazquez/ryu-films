import { test } from "node:test";
import assert from "node:assert/strict";
import { handleRequest } from "../src/handler.js";

const env = { FROM_EMAIL: "from@example.com", TO_EMAIL: "to@example.com" };
const valid = { name: "Ann", email: "ann@example.com", type: "Music video", details: "Shoot in June" };
const post = (body, raw) =>
  new Request("https://x.test/api/inquiry", { method: "POST", body: raw ?? JSON.stringify(body) });

test("sends an email for a valid inquiry", async () => {
  let sent;
  const res = await handleRequest(post(valid), env, async (m) => { sent = m; });
  assert.equal(res.status, 200);
  assert.equal(sent.to, "to@example.com");
  assert.equal(sent.from, "from@example.com");
  assert.equal(sent.replyTo, "ann@example.com");
  assert.match(sent.subject, /Music video from Ann/);
  assert.match(sent.text, /Shoot in June/);
});

test("unknown project type falls back to Other film project", async () => {
  let sent;
  await handleRequest(post({ ...valid, type: "Hacked" }), env, async (m) => { sent = m; });
  assert.match(sent.subject, /Other film project/);
});

test("strips newlines from header-bound fields (header injection)", async () => {
  let sent;
  await handleRequest(post({ ...valid, name: "Ann\r\nBcc: evil@x.com" }), env, async (m) => { sent = m; });
  assert.doesNotMatch(sent.subject, /[\r\n]/);
});

for (const [label, body] of [
  ["missing name", { ...valid, name: "" }],
  ["missing details", { ...valid, details: "  " }],
  ["bad email", { ...valid, email: "nope" }],
]) {
  test(`rejects ${label}`, async () => {
    let called = false;
    const res = await handleRequest(post(body), env, async () => { called = true; });
    assert.equal(res.status, 400);
    assert.equal(called, false);
  });
}

test("rejects invalid JSON and non-object bodies", async () => {
  const noop = async () => {};
  assert.equal((await handleRequest(post(null, "{bad"), env, noop)).status, 400);
  assert.equal((await handleRequest(post(null, "null"), env, noop)).status, 400);
});

test("rejects non-POST with 405 and unknown path with 404", async () => {
  const noop = async () => {};
  const get = await handleRequest(new Request("https://x.test/api/inquiry"), env, noop);
  assert.equal(get.status, 405);
  const other = await handleRequest(new Request("https://x.test/api/other", { method: "POST" }), env, noop);
  assert.equal(other.status, 404);
});

test("returns 502 when sending fails", async () => {
  const orig = console.error;
  console.error = () => {};
  const res = await handleRequest(post(valid), env, async () => { throw new Error("boom"); });
  console.error = orig;
  assert.equal(res.status, 502);
});

test("truncates oversized details", async () => {
  let sent;
  await handleRequest(post({ ...valid, details: "a".repeat(10000) }), env, async (m) => { sent = m; });
  assert.ok(sent.text.length < 5200);
});
