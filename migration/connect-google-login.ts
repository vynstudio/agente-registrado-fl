// Turns on "Continue with Google" for the admin login in one run:
//   1. reads a Supabase access token from the clipboard: https://supabase.com/dashboard/account/tokens,
//      signed in with the account that owns this project
//   2. reads the Google OAuth client secret from the clipboard, from the "Agente Registrado admin login"
//      client in Google Cloud (project toro-admin-login)
//   3. enables the Google provider and adds the site's addresses to the allowed redirect URLs,
//      keeping the existing ones
// Nothing secret is printed or saved to disk.
//
//   node migration/connect-google-login.ts
import { createInterface } from "node:readline";
import { execFileSync } from "node:child_process";

const PROJECT_REF = "ofitimdebbncfdhvxwub";
const GOOGLE_CLIENT_ID = "2476420386-3v7gmdeji1p9l70dmbg062ngbr7r65g0.apps.googleusercontent.com";
const SITE_URL = "https://agenteregistradofl.com";
const REDIRECTS = ["https://agenteregistradofl.com/**", "http://localhost:8081/**"];

// Reads each key from the clipboard when Enter is pressed, so nothing has to be pasted into the terminal.
const rl = createInterface({ input: process.stdin, output: process.stdout });
async function fromClipboard(what: string, valid: (v: string) => boolean): Promise<string> {
  for (;;) {
    await new Promise<string>((resolve) => rl.question(`Copy the ${what}, then press Enter here: `, resolve));
    const value = execFileSync("pbpaste").toString().trim();
    if (valid(value)) { console.log(`  Got it (${value.length} characters).`); return value; }
    console.log(`  The clipboard doesn't hold the ${what} yet. Copy it and press Enter again.`);
  }
}

const token = await fromClipboard("Supabase access token (starts with sbp_)", (v) => v.startsWith("sbp_"));
const secret = await fromClipboard("Google client secret (starts with GOCSPX-)", (v) => v.startsWith("GOCSPX-"));
rl.close();
execFileSync("pbcopy", { input: "" }); // clear the secret from the clipboard

const api = async (method: string, body?: unknown) => {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Supabase ${method} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
};

console.log("Reading current sign-in settings...");
const current = await api("GET");
const allowList = new Set(String(current.uri_allow_list ?? "").split(",").map((s) => s.trim()).filter(Boolean));
REDIRECTS.forEach((r) => allowList.add(r));

console.log("Turning on Google sign-in...");
const updated = await api("PATCH", {
  external_google_enabled: true,
  external_google_client_id: GOOGLE_CLIENT_ID,
  external_google_secret: secret,
  site_url: current.site_url?.startsWith(SITE_URL) ? current.site_url : SITE_URL,
  uri_allow_list: [...allowList].join(","),
});
console.log(`Google sign-in: ${updated.external_google_enabled ? "on" : "OFF"}`);
console.log(`Site URL: ${updated.site_url}`);
console.log(`Redirect URLs: ${updated.uri_allow_list}`);
console.log("\nDone. Click \"Continue with Google\" on the admin login and pick hello@toromovers.com.");
