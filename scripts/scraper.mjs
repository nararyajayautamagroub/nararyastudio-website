#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";

const args = process.argv.slice(2);
const get = (name, fallback = "") => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] ?? fallback) : fallback;
};
const urls = args.filter((x) => /^https?:\/\//i.test(x));
const configPath = get("--config");
const out = get("--out", "scrape-output.json");
const allOrigins = args.includes("--all-origins");
const sameOrigin = args.includes("--same-origin") || !allOrigins;
const ignoreRobots = args.includes("--ignore-robots");
const maxPages = Math.min(200, Math.max(1, Number(get("--max-pages", "50")) || 50));
const timeoutMs = Math.min(30000, Math.max(2000, Number(get("--timeout", "10000")) || 10000));
const delayMs = Math.min(5000, Math.max(100, Number(get("--delay", "300")) || 300));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const robotsCache = new Map();

function absolute(base, href) {
  try {
    const u = new URL(href, base);
    return /^https?:$/i.test(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}

function strip(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}

function attr(tag, name) {
  const m = tag.match(new RegExp(name + "\\s*=\\s*[\"']([^\"']*)[\"']", "i"));
  return m?.[1]?.trim() || null;
}

function meta(html, name, property) {
  const re = property ? new RegExp("<meta[^>]+property=[\"']" + property + "[\"'][^>]*>", "i") : new RegExp("<meta[^>]+name=[\"']" + name + "[\"'][^>]*>", "i");
  const tag = html.match(re)?.[0];
  return tag ? attr(tag, "content") : null;
}

function canonical(html, base) {
  const tag = html.match(/<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]*>/i)?.[0];
  return tag ? absolute(base, attr(tag, "href") || "") : null;
}

function jsonLd(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    try { return JSON.parse(m[1]); } catch { return null; }
  }).filter(Boolean);
}

function links(html, base) {
  const found = [];
  for (const m of html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)) {
    const u = absolute(base, m[1]);
    if (u && !found.includes(u)) found.push(u);
  }
  return found;
}

function pathAllowed(path, rules) {
  for (const rule of rules) {
    const normalized = rule.trim();
    if (!normalized) continue;
    if (normalized.endsWith("$")) {
      if (path === normalized.slice(0, -1)) return false;
    } else if (path.startsWith(normalized)) {
      return false;
    }
  }
  return true;
}

async function robotsFor(origin) {
  if (ignoreRobots) return { disallow: [] };
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  const result = { disallow: [] };
  try {
    const res = await fetch(new URL("/robots.txt", origin), {
      headers: { "user-agent": "NARARYA-STUDIO-Scraper/1.0" },
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) {
      robotsCache.set(origin, result);
      return result;
    }
    const lines = (await res.text()).split(/\r?\n/);
    let applies = false;
    let rules = [];
    for (const raw of lines) {
      const line = raw.split("#")[0].trim();
      const colon = line.indexOf(":");
      if (colon < 0) continue;
      const key = line.slice(0, colon).trim().toLowerCase();
      const value = line.slice(colon + 1).trim();
      if (key === "user-agent") {
        applies = value === "*" || value.toLowerCase() === "nararya-studio-scraper";
        if (applies) rules = [];
      } else if (applies && key === "disallow" && value) {
        rules.push(value);
      }
    }
    result.disallow = rules;
    robotsCache.set(origin, result);
    return result;
  } catch {
    robotsCache.set(origin, result);
    return result;
  }
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "NARARYA-STUDIO-Scraper/1.0",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    return { url: res.url || url, status: res.status, contentType: res.headers.get("content-type") || "", ok: res.ok, body: await res.text() };
  } finally {
    clearTimeout(timer);
  }
}

async function loadConfig() {
  if (!configPath) return [];
  const parsed = JSON.parse(await fs.readFile(configPath, "utf8"));
  return Array.isArray(parsed) ? parsed : (parsed.sources || []);
}

async function main() {
  const configured = await loadConfig();
  const targets = [...urls, ...configured.map((x) => typeof x === "string" ? x : x.url)].filter(Boolean);
  if (!targets.length) {
    console.error("Gunakan: npm run scrape -- https://example.com --out scrape-output.json");
    process.exitCode = 2;
    return;
  }

  const queue = [...new Set(targets)];
  const seen = new Set();
  const results = [];

  while (queue.length && results.length < maxPages) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);

    try {
      const parsed = new URL(url);
      const robots = await robotsFor(parsed.origin);
      if (!ignoreRobots && !pathAllowed(parsed.pathname, robots.disallow)) {
        results.push({ url, status: 0, ok: false, skipped: true, reason: "robots.txt disallows this path", fetchedAt: new Date().toISOString() });
        console.log("[skip] robots.txt " + url);
        continue;
      }

      const page = await fetchPage(url);
      const item = { url: page.url, status: page.status, ok: page.ok, contentType: page.contentType, fetchedAt: new Date().toISOString() };

      if (page.contentType.includes("html") || /<html[\s>]/i.test(page.body)) {
        item.title = page.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || null;
        item.description = meta(page.body, "description");
        item.canonical = canonical(page.body, page.url);
        item.og = { title: meta(page.body, "", "og:title"), description: meta(page.body, "", "og:description"), image: meta(page.body, "", "og:image") };
        item.headings = [...page.body.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)].slice(0, 50).map((m) => ({ level: Number(m[1]), text: strip(m[2]).slice(0, 300) }));
        item.text = strip(page.body).slice(0, 20000);
        item.jsonLd = jsonLd(page.body);

        let next = links(page.body, page.url);
        if (sameOrigin) next = next.filter((x) => new URL(x).origin === new URL(page.url).origin);
        for (const link of next) {
          const linkUrl = new URL(link);
          const linkRobots = await robotsFor(linkUrl.origin);
          if (!ignoreRobots && !pathAllowed(linkUrl.pathname, linkRobots.disallow)) continue;
          if (!seen.has(link) && queue.length < maxPages) queue.push(link);
        }
      } else {
        item.body = page.body.slice(0, 20000);
      }

      results.push(item);
      console.log("[" + results.length + "] " + page.status + " " + page.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ url, status: 0, ok: false, error: message, fetchedAt: new Date().toISOString() });
      console.error("[error] " + url + ": " + message);
    }

    await sleep(delayMs);
  }

  await fs.writeFile(out, JSON.stringify({ generatedAt: new Date().toISOString(), count: results.length, results }, null, 2), "utf8");
  console.log("Selesai: " + results.length + " halaman -> " + out);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
