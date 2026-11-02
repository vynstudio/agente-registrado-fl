// The same app serves two brands of Diler Services, LLC, picked by the domain the
// visitor is on. worker/index.js uses this file too, for each brand's search tags.
//  - Agente Registrado Florida (agenteregistradofl.com): Spanish first, also English and Portuguese.
//  - Diler Corporate (dilercorporate.com): English only, for US and international founders.
export type BrandId = "arf" | "diler";
type Lang = "en" | "es" | "pt";

export interface Brand {
  id: BrandId;
  /** Brand name in each site language. */
  name: Record<Lang, string>;
  /** Part of the name shown in the accent color. */
  highlight: RegExp;
  domain: string;
  origin: string;
  hosts: string[];
  /** Languages offered; the first one is the default for new visitors. */
  langs: Lang[];
  /** Files in public/ for the browser icons and the link-preview image. */
  icons: { ico: string; svg: string; apple: string };
  ogImage: string;
}

export const BRANDS: Record<BrandId, Brand> = {
  arf: {
    id: "arf",
    name: { en: "Florida Registered Agent", es: "Agente Registrado Florida", pt: "Agente Registrado da Flórida" },
    highlight: /(Fl[oó]rida)/,
    domain: "agenteregistradofl.com",
    origin: "https://agenteregistradofl.com",
    hosts: ["agenteregistradofl.com", "www.agenteregistradofl.com"],
    langs: ["es", "en", "pt"],
    icons: { ico: "/favicon.ico", svg: "/favicon.svg", apple: "/apple-touch-icon.png" },
    ogImage: "/og-image.jpg",
  },
  diler: {
    id: "diler",
    name: { en: "Diler Corporate", es: "Diler Corporate", pt: "Diler Corporate" },
    highlight: /(Corporate)/,
    domain: "dilercorporate.com",
    origin: "https://dilercorporate.com",
    hosts: ["dilercorporate.com", "www.dilercorporate.com"],
    langs: ["en"],
    icons: { ico: "/favicon-diler.ico", svg: "/favicon-diler.svg", apple: "/apple-touch-icon-diler.png" },
    ogImage: "/og-image-diler.jpg",
  },
};

/** The brand for a hostname; anything unknown (preview, localhost) is Agente Registrado Florida. */
export const brandForHost = (host: string): Brand =>
  Object.values(BRANDS).find((b) => b.hosts.includes(host)) ?? BRANDS.arf;

// In the browser. On preview and local addresses, ?brand=diler (or ?brand=arf) switches the
// brand for testing and is remembered for the tab.
const detect = (): Brand => {
  if (typeof window === "undefined") return BRANDS.arf;
  const { hostname, search } = window.location;
  const isPublic = Object.values(BRANDS).some((b) => b.hosts.includes(hostname));
  if (isPublic) return brandForHost(hostname);
  try {
    const asked = new URLSearchParams(search).get("brand");
    if (asked === "arf" || asked === "diler") sessionStorage.setItem("brand", asked);
    const saved = sessionStorage.getItem("brand");
    if (saved === "arf" || saved === "diler") return BRANDS[saved];
  } catch { /* storage blocked: use the default brand */ }
  return BRANDS.arf;
};

export const BRAND_CONFIG: Brand = detect();
