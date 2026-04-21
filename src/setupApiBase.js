/**
 * In dev, Vite proxies /api (see vite.config.js). In production, the static host
 * has no proxy, so fetch("/api/...") would hit the frontend and fail.
 * When VITE_API_BASE_URL (or VITE_API_URL) is set, rewrite same-origin API paths
 * to the real backend origin.
 */
const rawBase =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
const API_BASE = rawBase.replace(/\/+$/, "");

const PREFIXES = ["/api", "/uploads", "/thumbnails"];

function pathMatchesPrefix(pathname) {
  return PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function rewriteStringUrl(url) {
  if (!url.startsWith("/") || url.startsWith("//")) return null;
  const pathOnly = url.split(/[?#]/)[0];
  if (!pathMatchesPrefix(pathOnly)) return null;
  return `${API_BASE}${url}`;
}

function rewriteRequest(input) {
  try {
    const u = new URL(input.url);
    if (u.origin !== window.location.origin) return null;
    if (!pathMatchesPrefix(u.pathname)) return null;
    const next = `${API_BASE}${u.pathname}${u.search}${u.hash}`;
    return new Request(next, input);
  } catch {
    return null;
  }
}

if (import.meta.env.PROD && API_BASE) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === "string") {
      const next = rewriteStringUrl(input);
      if (next) return originalFetch(next, init);
    } else if (input instanceof Request) {
      const nextReq = rewriteRequest(input);
      if (nextReq) return originalFetch(nextReq, init);
    }
    return originalFetch(input, init);
  };
}
