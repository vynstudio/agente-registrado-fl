// Cloudflare Worker in front of the static site (see wrangler.jsonc).
// - Sends www and http:// visitors to https://agenteregistradofl.com (one address per page for Google).
// - Writes each page's Spanish title, description, canonical link and structured data into the
//   HTML, so search engines and link previews see them without running JavaScript.
// - Answers unknown addresses with a real 404 and keeps private pages out of search results.
// - Emails owner alerts sent by the Supabase functions (worker/alert-email.js).
// - When MAINTENANCE is "on", visitors to the public domain get a "back soon" page
//   (HTTP 503, so search engines keep the site indexed); the *.workers.dev preview
//   keeps serving the real site so we can keep testing.
import { SEO_PAGES } from "../src/content/seo";
import { faqs } from "../src/content/faqs";
import { translations } from "../src/i18n/translations";
import { PHONE } from "../src/lib/contact";
import { maintenancePage } from "./maintenance";
import { alertEmail } from "./alert-email";

const ORIGIN = "https://agenteregistradofl.com";
const PUBLIC_HOSTS = new Set(["agenteregistradofl.com", "www.agenteregistradofl.com"]);
const BRAND = "Agente Registrado Florida";
const es = (text) => translations[text]?.es ?? text;

// Pages that render in the browser but should not appear in search results.
const PRIVATE = /^\/(admin(\/.*)?|checkout\/return)$/;
const BLOG_POST = /^\/blog\/[a-z0-9-]+$/;

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${ORIGIN}/#organization`,
  name: BRAND,
  alternateName: ["Florida Registered Agent", "Agente Registrado da Flórida"],
  legalName: "Diler Services, LLC",
  url: `${ORIGIN}/`,
  image: `${ORIGIN}/og-image.jpg`,
  description: es(SEO_PAGES["/"].description),
  areaServed: { "@type": "State", name: "Florida" },
  knowsLanguage: ["es", "en", "pt"],
  telephone: PHONE.tel,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: PHONE.tel,
    contactType: "customer service",
    areaServed: "US",
    availableLanguage: ["Spanish", "English", "Portuguese"],
  },
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND,
  url: `${ORIGIN}/`,
  inLanguage: "es",
  publisher: { "@id": `${ORIGIN}/#organization` },
};

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: es(f.question),
    acceptedAnswer: { "@type": "Answer", text: es(f.answer) },
  })),
};

const json = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

// Rewrites the head of index.html for one page.
const withHead = (response, { title, description, url, robots, structuredData = [] }) => {
  const set = (attr) => ({ element: (el) => el.setAttribute(attr.name, attr.value) });
  let rewriter = new HTMLRewriter()
    .on("title", { element: (el) => el.setInnerContent(title) })
    .on('meta[property="og:url"]', set({ name: "content", value: url }))
    .on('link[rel="canonical"]', set({ name: "href", value: url }))
    .on('meta[property="og:title"], meta[name="twitter:title"]', set({ name: "content", value: title }))
    .on("head", {
      element: (el) => el.append(
        (robots ? `<meta name="robots" content="${robots}">` : "") + structuredData.map(json).join(""),
        { html: true },
      ),
    });
  if (description) {
    rewriter = rewriter.on('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]',
      set({ name: "content", value: description }));
  }
  return rewriter.transform(response);
};

const page = async (env, request, status, head) => {
  const shell = await env.ASSETS.fetch(new Request(new URL("/", request.url), request));
  const response = new Response(shell.body, { status, headers: shell.headers });
  if (head.robots) response.headers.set("x-robots-tag", head.robots);
  return withHead(response, head);
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const publicHost = PUBLIC_HOSTS.has(url.hostname);

    if (publicHost && (url.hostname !== "agenteregistradofl.com" || url.protocol === "http:")) {
      return Response.redirect(`${ORIGIN}${url.pathname}${url.search}`, 301);
    }
    if (url.pathname === "/api/alert-email") return alertEmail(request, env);
    if (env.MAINTENANCE === "on" && publicHost) return maintenancePage();

    // Google Search Console ownership file: served at its exact .html address (no redirect).
    if (/^\/google[0-9a-f]+\.html$/.test(url.pathname)) {
      return env.ASSETS.fetch(new Request(new URL(url.pathname.slice(0, -5), url), request));
    }
    // Files (scripts, images, sitemap...) are served as they are.
    if (/\.[a-z0-9]+$/i.test(url.pathname)) return env.ASSETS.fetch(request);

    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : "/";
    if (path !== url.pathname) return Response.redirect(`${url.origin}${path}${url.search}`, 301);

    const seo = SEO_PAGES[path];
    if (seo) {
      return page(env, request, 200, {
        title: `${es(seo.title)} | ${BRAND}`,
        description: es(seo.description),
        url: `${ORIGIN}${path}`,
        structuredData: path === "/" ? [organization, website, faqPage] : [organization],
      });
    }
    if (BLOG_POST.test(path)) {
      // The post's own title is set in the browser once it loads.
      return page(env, request, 200, {
        title: `${es(SEO_PAGES["/blog"].title)} | ${BRAND}`,
        description: es(SEO_PAGES["/blog"].description),
        url: `${ORIGIN}${path}`,
      });
    }
    if (PRIVATE.test(path)) {
      return page(env, request, 200, { title: BRAND, url: `${ORIGIN}${path}`, robots: "noindex" });
    }
    return page(env, request, 404, { title: `${es("Page not found")} | ${BRAND}`, url: `${ORIGIN}${path}`, robots: "noindex" });
  },
};
