# Diler Corporate — website (draft)

English-only website for Diler Corporate, a brand of Diler Services, LLC.
Separate from the Agente Registrado Florida app in this repository; nothing here is built or deployed with it.

Status: home page only, waiting for approval. Buttons point to sections on the page for now.

## See it on your computer

```bash
cd diler-corporate
python3 -m http.server 8080
```

Then open http://localhost:8080. (Opening `index.html` directly in a browser also works.)

Plain HTML and CSS, no build step. Fonts: Source Serif 4 and IBM Plex Sans (Google Fonts).
Prices match `src/lib/catalog.ts`; keep them in sync until checkout is connected.
