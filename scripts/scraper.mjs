#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";

const args = process.argv.slice(2);
const USER_AGENT = "NARARYA-STUDIO-Scraper/2.0";
const get = (name, fallback = "") => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] ?? fallback : fallback;
};
const has = (name) => args.includes(name);
const urls = args.filter((value) => /^https?:\/\//i.test(value));
const configPath = get("--config");
const out = get("--out", "scrape-output.json");
const allOrigins = has("--all-origins");
const sameOrigin = has("--same-origin") || !allOrigins;
const ignoreRobots = has("--ignore-robots");
const maxPages = Math.min(200, Math.max(1, Number(get("--max-pages", "50")) || 50));
const timeoutMs = Math.min(30000, Math.max(2000, Number(get("--timeout", "10000")) || 10000));
const delayMs = Math.min(5000, Math.max(0, Number(get("--delay", "300")) || 300));
const retries = Math.min(3, Math.max(0, Number(get("--retries", "1")) || 1));
const maxBodyBytes = Math.min(10 * 1024 * 1024, Math.max(64 * 1024, Number(get("--max-body-bytes", "2097152")) || 2097152));
const robotsCache = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeUrl(raw, base) {
  try {
    const url = new URL(raw, base);
    if (!/^https?:$/i.test(url.protocol)) return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function getAttr(tag, name) {
  const escaped = name.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(escaped + "\\s*=\\s*[\\\"']([^\\\"']*)[\\\"']", "i");
  return expression.exec(tag)?.[1]?.trim() || null;
}

function strip(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function meta(html, name, property) {
  const attrName = property ? "property" : "name";
  const key = property || name;
  const expression = new RegExp("<meta[^>]+" + attrName + "=[\\\"']" + key.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&") + "[\\\"'][^>]*>", "i");
  const tag = expression.exec(html)?.[0];
  return tag ? decodeEntities(getAttr(tag, "content") || "") || null : null;
}

function canonical(html, base) {
  const tag = /<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]*>/i.exec(html)?.[0];
  return tag ? normalizeUrl(getAttr(tag, "href") || "", base) : null;
}

function jsonLd(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function links(html, base) {
  const found = [];
  for (const match of html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)) {
    const raw = match[1].trim();
    if (/^(?:mailto|tel|javascript|data):/i.test(raw)) continue;
    const url = normalizeUrl(raw, base);
    if (url && !found.includes(url)) found.push(url);
  }
  return found;
}

function ruleRegex(rule) {
  const value = rule.trim();
  if (!value) return null;
  const anchored = value.endsWith("$");
  const body = anchored ? value.slice(0, -1) : value;
  const escaped = body.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp("^" + escaped + (anchored ? "$" : ""), "i");
}

function parseRobots(text) {
  const groups = [];
  let agents = [];
  let directives = [];

  function flush() {
    if (agents.length) groups.push({ agents: [...agents], directives: [...directives] });
    agents = [];
    directives = [];
  }

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#", 1)[0].trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === "user-agent") {
      if (agents.length && directives.length) flush();
      agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && agents.length) {
      directives.push({ type: key, value });
    }
  }
  flush();

  const token = USER_AGENT.toLowerCase();
  const product = token.split(/[\/\s]/)[0];
  const specific = groups.filter((group) => group.agents.includes(product) || group.agents.includes(token));
  const selected = specific.length ? specific : groups.filter((group) => group.agents.includes("*"));
  const rules = [];

  for (const group of selected) {
    for (const directive of group.directives) {
      const matcher = ruleRegex(directive.value);
      if (matcher) rules.push({ ...directive, matcher, length: directive.value.length });
    }
  }
  return rules;
}

function pathAllowed(pathname, rules) {
  let winner = null;
  for (const rule of rules) {
    if (!rule.matcher.test(pathname)) continue;
    if (!winner || rule.length > winner.length || (rule.length === winner.length && rule.type === "allow")) {
      winner = rule;
    }
  }
  return winner ? winner.type === "allow" : true;
}

async function getRobots(origin) {
  if (ignoreRobots) return [];
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  let rules = [];
  try {
    const response = await fetch(new URL("/robots.txt", origin), {
      headers: { "user-agent": USER_AGENT, accept: "text/plain,*/*;q=0.2" },
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (response.ok) rules = parseRobots(await response.text());
  } catch {}
  robotsCache.set(origin, rules);
  return rules;
}

async function fetchPage(url) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      const contentType = response.headers.get("content-type") || "";
      const contentLength = Number(response.headers.get("content-length") || 0);
      if (contentLength > maxBodyBytes) {
        return { url: response.url || url, status: response.status, contentType, ok: false, body: "", tooLarge: true };
      }
      const body = await response.text();
      if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
        return { url: response.url || url, status: response.status, contentType, ok: false, body: "", tooLarge: true };
      }
      return { url: response.url || url, status: response.status, contentType, ok: response.ok, body };
    } catch (error) {
      lastError = error;
      if (attempt < retries) await sleep(Math.min(1500, 250 * 2 ** attempt));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError || new Error("fetch gagal");
}

async function loadConfig() {
  if (!configPath) return [];
  const parsed = JSON.parse(await fs.readFile(configPath, "utf8"));
  return Array.isArray(parsed) ? parsed : Array.isArray(parsed.sources) ? parsed.sources : [];
}

function configuredUrl(entry) {
  return typeof entry === "string" ? entry : entry?.url;
}

async function main() {
  const configured = await loadConfig();
  const targets = [...urls, ...configured.map(configuredUrl)]
    .map((value) => normalizeUrl(value))
    .filter(Boolean);

  if (!targets.length) {
    console.error("Gunakan: npm run scrape -- https://example.com --out scrape-output.json");
    process.exitCode = 2;
    return;
  }

  const queue = [...new Set(targets)];
  const queued = new Set(queue);
  const seen = new Set();
  const results = [];

  while (queue.length && results.length < maxPages) {
    const url = queue.shift();
    queued.delete(url);
    if (!url || seen.has(url)) continue;
    seen.add(url);

    try {
      const parsed = new URL(url);
      const robots = await getRobots(parsed.origin);
      if (!ignoreRobots && !pathAllowed(parsed.pathname, robots)) {
        results.push({ url, status: 0, ok: false, skipped: true, reason: "robots.txt disallows this path", fetchedAt: new Date().toISOString() });
        console.log("[skip] robots.txt " + url);
        continue;
      }

      const page = await fetchPage(url);
      const item = {
        url: page.url,
        status: page.status,
        ok: page.ok,
        contentType: page.contentType,
        fetchedAt: new Date().toISOString()
      };

      if (page.tooLarge) {
        item.error = "Response body exceeds --max-body-bytes";
      } else if (page.contentType.includes("html") || /<html[\s>]/i.test(page.body)) {
        item.title = decodeEntities(page.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim() || null;
        item.description = meta(page.body, "description");
        item.canonical = canonical(page.body, page.url);
        item.og = {
          title: meta(page.body, "", "og:title"),
          description: meta(page.body, "", "og:description"),
          image: meta(page.body, "", "og:image")
        };
        item.headings = [...page.body.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)]
          .slice(0, 50)
          .map((match) => ({ level: Number(match[1]), text: strip(match[2]).slice(0, 300) }));
        item.text = strip(page.body).slice(0, 20000);
        item.jsonLd = jsonLd(page.body);

        let next = links(page.body, page.url);
        if (sameOrigin) {
          const origin = new URL(page.url).origin;
          next = next.filter((link) => new URL(link).origin === origin);
        }
        for (const link of next) {
          if (seen.has(link) || queued.has(link) || results.length + queue.length >= maxPages) continue;
          const linkUrl = new URL(link);
          const linkRules = await getRobots(linkUrl.origin);
          if (!ignoreRobots && !pathAllowed(linkUrl.pathname, linkRules)) continue;
          queue.push(link);
          queued.add(link);
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

    if (delayMs) await sleep(delayMs);
  }

  const payload = JSON.stringify({
    generatedAt: new Date().toISOString(),
    scraperVersion: "2.0",
    options: { sameOrigin, ignoreRobots, maxPages, timeoutMs, delayMs, retries, maxBodyBytes },
    count: results.length,
    results
  }, null, 2);

  const temporary = out + ".tmp";
  await fs.writeFile(temporary, payload, "utf8");
  await fs.rename(temporary, out);
  console.log("Selesai: " + results.length + " halaman -> " + out);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
