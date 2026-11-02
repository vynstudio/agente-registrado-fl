// "Back soon" page shown by worker/index.js while MAINTENANCE is "on".
// Turn off: npx wrangler deploy --var MAINTENANCE:off  (or set "off" in wrangler.jsonc)

const page = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>En mantenimiento | Agente Registrado Florida</title>
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
  <div class="brand">Agente Registrado <span>Florida</span></div>
  <h1>Estamos en mantenimiento</h1>
  <p>Volvemos pronto.</p>
  <div class="other">
    <p lang="en"><strong>We're in maintenance.</strong> We'll be back soon.</p>
    <p lang="pt"><strong>Estamos em manutenção.</strong> Voltamos em breve.</p>
  </div>
</main>
</body>
</html>`;

export const maintenancePage = () => new Response(page, {
  status: 503,
  headers: {
    "content-type": "text/html; charset=utf-8",
    "retry-after": "3600",
    "cache-control": "no-store",
  },
});
