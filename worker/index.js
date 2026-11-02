// Cloudflare Worker in front of the static site (see wrangler.jsonc).
// The site serves two brands, picked by domain (src/lib/brand.ts): Agente Registrado Florida on
// agenteregistradofl.com (Spanish) and Diler Corporate on dilercorporate.com (English).
// - Sends www and http:// visitors to the brand's https:// domain (one address per page for Google).
// - Writes each page's title, description, canonical link, icons and structured data into the
//   HTML in the brand's language, so search engines and link previews see them without JavaScript.
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
import { BRANDS, brandForHost } from "../src/lib/brand";

const PUBLIC_HOSTS = new Set(Object.values(BRANDS).flatMap((b) => b.hosts));

// Text in the brand's main language (English text is the translation key), with {brand} and
// {domain} filled in.
const inLang = (brand, text) => {
  const lang = brand.langs[0];
  const out = lang === "en" ? text : translations[text]?.[lang] ?? text;
  return out.replaceAll("{brand}", brand.name[lang]).replaceAll("{domain}", brand.domain);
};

// Pages that render in the browser but should not appear in search results.
const PRIVATE = /^\/(admin(\/.*)?|checkout\/return)$/;
const BLOG_POST = /^\/blog\/[a-z0-9-]+$/;

const schemas = (brand) => {
  const name = brand.name[brand.langs[0]];
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${brand.origin}/#organization`,
    name,
    ...(brand.id === "arf" && { alternateName: ["Florida Registered Agent", "Agente Registrado da Flórida"] }),
    legalName: "Diler Services, LLC",
    url: `${brand.origin}/`,
    image: `${brand.origin}${brand.ogImage}`,
    description: inLang(brand, SEO_PAGES["/"].description),
    ...(brand.id === "arf" && { areaServed: { "@type": "State", name: "Florida" } }),
    knowsLanguage: ["es", "en", "pt"],
    telephone: PHONE.tel,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: PHONE.tel,
      contactType: "customer service",
      areaServed: brand.id === "arf" ? "US" : "Worldwide",
      availableLanguage: ["Spanish", "English", "Portuguese"],
    },
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: `${brand.origin}/`,
    inLanguage: brand.langs[0],
    publisher: { "@id": `${brand.origin}/#organization` },
  };
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: inLang(brand, f.question),
      acceptedAnswer: { "@type": "Answer", text: inLang(brand, f.answer) },
    })),
  };
  return { organization, website, faqPage };
};
const SCHEMAS = Object.fromEntries(Object.values(BRANDS).map((b) => [b.id, schemas(b)]));

const json = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

// Rewrites the head of index.html for one page.
const withHead = (response, brand, { title, description, url, robots, structuredData = [] }) => {
  const set = (attr) => ({ element: (el) => el.setAttribute(attr.name, attr.value) });
  const lang = brand.langs[0];
  const image = `${brand.origin}${brand.ogImage}`;
  let rewriter = new HTMLRewriter()
    .on("html", set({ name: "lang", value: lang }))
    .on("title", { element: (el) => el.setInnerContent(title) })
    .on('meta[property="og:site_name"]', set({ name: "content", value: brand.name[lang] }))
    .on('meta[property="og:locale"]', set({ name: "content", value: lang === "es" ? "es_US" : "en_US" }))
    .on('meta[property="og:image"], meta[name="twitter:image"]', set({ name: "content", value: image }))
    .on('meta[property="og:image:alt"]', set({ name: "content", value: `${brand.name[lang]}: ${inLang(brand, SEO_PAGES["/"].title)}` }))
    .on('link[rel="icon"][type="image/svg+xml"]', set({ name: "href", value: brand.icons.svg }))
    .on('link[rel="icon"]:not([type])', set({ name: "href", value: brand.icons.ico }))
    .on('link[rel="apple-touch-icon"]', set({ name: "href", value: brand.icons.apple }))
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

const page = async (env, request, brand, status, head) => {
  const shell = await env.ASSETS.fetch(new Request(new URL("/", request.url), request));
  const response = new Response(shell.body, { status, headers: shell.headers });
  if (head.robots) response.headers.set("x-robots-tag", head.robots);
  return withHead(response, brand, head);
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const publicHost = PUBLIC_HOSTS.has(url.hostname);
    // Preview and other addresses get Agente Registrado Florida.
    const brand = brandForHost(url.hostname);
    const ORIGIN = brand.origin;
    const BRAND = brand.name[brand.langs[0]];
    const { organization, website, faqPage } = SCHEMAS[brand.id];

    if (publicHost && (url.hostname !== brand.domain || url.protocol === "http:")) {
      return Response.redirect(`${ORIGIN}${url.pathname}${url.search}`, 301);
    }
    if (url.pathname === "/api/alert-email") return alertEmail(request, env);
    if (env.MAINTENANCE === "on" && publicHost) return maintenancePage(brand);

    // The sitemap and robots.txt list agenteregistradofl.com addresses; other brands get their own domain.
    if ((url.pathname === "/sitemap.xml" || url.pathname === "/robots.txt") && brand.id !== "arf") {
      const file = await env.ASSETS.fetch(request);
      const body = (await file.text()).replaceAll(BRANDS.arf.origin, ORIGIN);
      return new Response(body, { status: file.status, headers: file.headers });
    }

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
      return page(env, request, brand, 200, {
        title: `${inLang(brand, seo.title)} | ${BRAND}`,
        description: inLang(brand, seo.description),
        url: `${ORIGIN}${path}`,
        structuredData: path === "/" ? [organization, website, faqPage] : [organization],
      });
    }
    if (BLOG_POST.test(path)) {
      // The post's own title is set in the browser once it loads.
      return page(env, request, brand, 200, {
        title: `${inLang(brand, SEO_PAGES["/blog"].title)} | ${BRAND}`,
        description: inLang(brand, SEO_PAGES["/blog"].description),
        url: `${ORIGIN}${path}`,
      });
    }
    if (PRIVATE.test(path)) {
      return page(env, request, brand, 200, { title: BRAND, url: `${ORIGIN}${path}`, robots: "noindex" });
    }
    return page(env, request, brand, 404, { title: `${inLang(brand, "Page not found")} | ${BRAND}`, url: `${ORIGIN}${path}`, robots: "noindex" });
  },
};
