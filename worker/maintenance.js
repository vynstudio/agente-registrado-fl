// "Back soon" page shown by worker/index.js while MAINTENANCE is "on", in each brand's name and language.
// Turn off: npx wrangler deploy --var MAINTENANCE:off  (or set "off" in wrangler.jsonc)

const spanish = (brand) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>En mantenimiento | ${brand.name.es}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 24px;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
         background: #f7f8f7; color: #141414; }
  main { max-width: 560px; text-align: center; }
  .brand { font-weight: 600; font-size: 18px; margin-bottom: 40px; }
  .brand span { color: #fc5a0a; }
  h1 { font-size: clamp(28px, 6vw, 40px); line-height: 1.15; margin: 0 0 16px; font-weight: 500; }
  p { color: #5a5f5b; line-height: 1.6; margin: 0 0 12px; }
  .other { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e3e6e4; font-size: 14px; }
  .other p { margin-bottom: 8px; }
</style>
</head>
<body>
<main>
  <div class="brand">${brandName(brand, "es")}</div>
  <h1>Estamos en mantenimiento</h1>
  <p>Volvemos pronto.</p>
  <div class="other">
    <p lang="en"><strong>We're in maintenance.</strong> We'll be back soon.</p>
    <p lang="pt"><strong>Estamos em manutenção.</strong> Voltamos em breve.</p>
  </div>
</main>
</body>
</html>`;

// Diler Corporate is English only.
const english = (brand) => spanish(brand)
  .replace('<html lang="es">', '<html lang="en">')
  .replace(/<title>[^<]*<\/title>/, `<title>Under maintenance | ${brand.name.en}</title>`)
  .replace(/<div class="brand">[^]*?<\/div>/, `<div class="brand">${brandName(brand, "en")}</div>`)
  .replace(/<h1>[^]*<\/main>/, "<h1>We're under maintenance</h1>\n  <p>We'll be back soon.</p>\n</main>");

// Brand name with its highlighted word in the accent color.
const brandName = (brand, lang) => brand.name[lang].replace(brand.highlight, "<span>$1</span>");

export const maintenancePage = (brand) => new Response(brand.langs[0] === "es" ? spanish(brand) : english(brand), {
  status: 503,
  headers: {
    "content-type": "text/html; charset=utf-8",
    "retry-after": "3600",
    "cache-control": "no-store",
  },
});
