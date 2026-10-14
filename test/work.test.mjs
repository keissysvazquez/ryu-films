import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { JSDOM } from "jsdom";

const dist = new URL("../dist/", import.meta.url);
const read = (f) => readFileSync(new URL(f, dist), "utf8");

function load({ videos } = {}) {
  const dom = new JSDOM(read("index.html"), { runScripts: "outside-only", url: "https://ryufilms.com/" });
  const w = dom.window;
  w.matchMedia = () => ({ matches: true });
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); this.dispatchEvent(new w.Event("close")); };
  w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  w.HTMLMediaElement.prototype.pause = () => {};
  w.fetch = async () => ({ ok: true });
  w.eval(read("config.js"));
  w.eval(read("app.js"));
  w.eval(read("videos.js"));
  if (videos) w.RYU_VIDEOS = videos;
  w.eval(read("work.js"));
  return w;
}

const IG = "https://www.instagram.com/reel/AbC123_x-y/";
const sample = [
  { title: "A", category: "Music Videos", instagramUrl: IG, year: "2025" },
  { title: "B", category: "Aerial", instagramUrl: "https://www.instagram.com/p/XyZ789/" },
  { title: "C", category: "Aerial", instagramUrl: "PLACEHOLDER", coverImage: "assets/missing.jpg" },
];
const $ = (w, s) => w.document.querySelector(s);
const $$ = (w, s) => [...w.document.querySelectorAll(s)];

test("video list matches the requested Instagram links in order, with real covers", () => {
  const w = load();
  const codes = ["C6msNW1Ol1A", "CYDXCoorQAi", "CXOVGRmvPZn", "CTXWu_Jn6Gn", "COgpL9Cj-B-", "CNamRogD2bU", "CLAnbxzjLvC", "CCUB4MHjQye", "B0LULHkjzhZ", "BXDWWq3Arag"];
  const v = w.RYU_VIDEOS;
  assert.equal(v.length, 10);
  v.forEach((e, i) => {
    assert.ok(e.title && e.category && e.artist);
    assert.ok(e.instagramUrl.includes(codes[i]), `link ${i + 1}`);
    assert.doesNotMatch(JSON.stringify(e), /PLACEHOLDER/);
    assert.ok(existsSync(new URL(e.coverImage, dist)), `missing ${e.coverImage}`);
    assert.doesNotMatch(e.coverImage, /^https?:/);
    const head = readFileSync(new URL(e.coverImage, dist)).subarray(0, 3);
    assert.ok(head.equals(Buffer.from([0xff, 0xd8, 0xff])) || head[0] === 0x89, `not an image: ${e.coverImage}`);
  });
});
test("index.html has Work nav link, section after gallery, and a lightbox with .close", () => {
  const w = load();
  assert.ok($(w, 'nav a[href="#work"]'));
  assert.equal($(w, "#work").nextElementSibling.id, "gallery");
  assert.ok($(w, "#reel-dialog .close"));
});

test("renders one card per video and tabs only for used categories", () => {
  const w = load({ videos: sample });
  assert.equal($$(w, ".reel-card").length, 3);
  assert.deepEqual($$(w, ".reel-tab").map((b) => b.textContent), ["All", "Music Videos", "Aerial"]);
});

test("filtering shows only matching videos", () => {
  const w = load({ videos: sample });
  $$(w, ".reel-tab").find((b) => b.textContent === "Aerial").click();
  assert.equal($$(w, ".reel-card").length, 2);
  assert.equal($(w, ".reel-tab.is-active").textContent, "Aerial");
});

test("no iframe before opening; lazy loads Instagram embed on click", () => {
  const w = load({ videos: sample });
  assert.equal($$(w, "iframe").length, 0);
  $$(w, ".reel-card")[0].click();
  const f = $(w, "#reel-dialog iframe");
  assert.equal(f.src, "https://www.instagram.com/reel/AbC123_x-y/embed");
  assert.equal($(w, ".reel-link").href, IG);
  assert.equal($(w, ".reel-link").target, "_blank");
});

test("closing clears the embed; Escape/backdrop handlers close", () => {
  const w = load({ videos: sample });
  $$(w, ".reel-card")[0].click();
  $(w, "#reel-dialog").click();
  assert.ok(!$(w, "#reel-dialog").hasAttribute("open"));
  assert.equal($$(w, "#reel-dialog iframe").length, 0);
});

test("Escape key closes the lightbox", () => {
  const w = load({ videos: sample });
  $$(w, ".reel-card")[0].click();
  $(w, "#reel-dialog").dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.ok(!$(w, "#reel-dialog").hasAttribute("open"));
});

test("clicking inside the player does not close it", () => {
  const w = load({ videos: sample });
  $$(w, ".reel-card")[0].click();
  $(w, ".reel-stage").click();
  assert.ok($(w, "#reel-dialog").hasAttribute("open"));
});

test("prev/next wrap around within the current filter", () => {
  const w = load({ videos: sample });
  $$(w, ".reel-card")[0].click();
  $(w, ".reel-prev").click();
  assert.equal($(w, "#reel-title").textContent, "C");
  $(w, ".reel-next").click();
  assert.equal($(w, "#reel-title").textContent, "A");
});

test("placeholder or unsafe URLs show a fallback with no iframe and no link", () => {
  const w = load({
    videos: [
      { title: "P", category: "Aerial", instagramUrl: "PLACEHOLDER: paste" },
      { title: "J", category: "Aerial", instagramUrl: "javascript:alert(1)" },
    ],
  });
  $$(w, ".reel-card")[0].click();
  assert.equal($$(w, "#reel-dialog iframe").length, 0);
  assert.ok($(w, ".reel-fallback"));
  assert.ok($(w, ".reel-link").hidden);
  $(w, ".reel-next").click();
  assert.equal($$(w, "#reel-dialog iframe").length, 0);
});

test("cards without a cover (or with a broken one) show the placeholder", () => {
  const w = load({ videos: sample });
  const cards = $$(w, ".reel-card");
  assert.ok(cards[0].classList.contains("no-cover"));
  assert.equal(cards[0].querySelector("img"), null);
  cards[2].querySelector("img").dispatchEvent(new w.Event("error"));
  assert.ok(cards[2].classList.contains("no-cover"));
  assert.equal(cards[2].querySelector(".reel-ph").textContent, "C");
});

test("video source can be swapped to Vimeo or MP4 via data", () => {
  const w = load({
    videos: [
      { title: "V", category: "Brand Films", instagramUrl: IG, videoUrl: "https://vimeo.com/123456" },
      { title: "M", category: "Brand Films", instagramUrl: IG, videoUrl: "https://example.com/a.mp4" },
    ],
  });
  $$(w, ".reel-card")[0].click();
  assert.match($(w, "#reel-dialog iframe").src, /^https:\/\/player\.vimeo\.com\/video\/123456/);
  $(w, ".reel-next").click();
  assert.equal($(w, "#reel-dialog video").src, "https://example.com/a.mp4");
});

test("cards are keyboard-focusable buttons with aria labels; titles are not parsed as HTML", () => {
  const w = load({ videos: [{ title: "<b>x</b>", category: "Aerial", instagramUrl: IG }] });
  const c = $(w, ".reel-card");
  assert.equal(c.tagName, "BUTTON");
  assert.match(c.getAttribute("aria-label"), /^Play /);
  assert.equal(c.querySelector("b"), null);
});

test("empty data hides the section and nav link", () => {
  const w = load({ videos: [] });
  assert.ok($(w, "#work").hidden);
  assert.ok($(w, 'a[href="#work"]').hidden);
});

test("first video of the current filter is the featured card, with artist then title below", () => {
  const w = load({ videos: sample });
  assert.ok($$(w, ".reel-card")[0].classList.contains("is-featured"));
  assert.equal($$(w, ".reel-card.is-featured").length, 1);
  $$(w, ".reel-tab").find((b) => b.textContent === "Aerial").click();
  const cards = $$(w, ".reel-card");
  assert.equal(cards[0].querySelector(".reel-card-title").textContent, "B");
  assert.ok(cards[0].classList.contains("is-featured"));
  const withArtist = load({ videos: [{ title: "T", artist: "Art", category: "Aerial", instagramUrl: IG }] });
  const info = $(withArtist, ".reel-info");
  assert.deepEqual([...info.children].map((c) => c.textContent), ["Art", "T"]);
  assert.equal($$(withArtist, ".reel-card .reel-play").length, 1);
});