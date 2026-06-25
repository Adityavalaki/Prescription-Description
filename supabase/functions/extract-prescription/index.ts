// extract-prescription — hardened + richer extraction
// (header doctor/clinic + per-medicine name, strength, form, per_day, instruction, duration).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const DAILY_LIMIT = 40;
const MAX_B64_CHARS = 9_000_000;

const PROMPT = `You are an expert at reading handwritten medical prescriptions (including Indian
clinical shorthand). Extract the prescription as STRUCTURED JSON. Be careful and
literal — only report what is written.

First, read the LETTERHEAD / header, if visible:
- "doctor" — the prescribing doctor's name (e.g. "Dr. A. Mehta"). "" if not visible.
- "clinic" — the clinic / hospital / practice name on the letterhead. "" if not visible.

Then, for EACH medicine/drug, output these fields:

1. "name" — the medicine's NAME ONLY (no strength, no form word). The BRAND name
   (e.g. "Crocin") OR the GENERIC / active-ingredient name (e.g. "Paracetamol") is
   equally acceptable.

2. "strength" — the dose strength written with it, e.g. "500 mg", "40 mg", "5 ml",
   "650 mg", "60 k". Use "" if none is written.

3. "form" — EXACTLY one of: "tablet", "capsule", "syrup", "injection", "drops",
   "cream", "other". Infer from the form word (Tab→tablet, Cap→capsule, Syp/Syr→syrup,
   Inj→injection, Gtt/drops→drops, Oint/cream/gel→cream). Default "tablet" if a pill is
   implied but unclear.

4. "per_day" — doses at MORNING-AFTERNOON-NIGHT as three numbers, e.g. "1-0-1"
   (1 morning, 0 afternoon, 1 night). Rules:
   - "OD"/once daily → "1-0-0"; "BD"/twice → "1-0-1"; "TDS"/thrice → "1-1-1"; "QID" → "1-1-1".
   - More than 1 unit per dose → use that number (2 at night → "0-0-2").
   - Taken only when needed → exactly "SOS".
   - NOT a daily schedule (once a week/month, every 6 hours) → write that phrase literally.
   - Frequency not written → "".

5. "instruction" — when to take it relative to food/sleep. EXACTLY one of: "after food",
   "before food", "empty stomach", "at bedtime", "with water", or "" if not written.
   Map: p.c. / बाद → "after food"; a.c. / पहले → "before food"; खाली पेट → "empty stomach";
   h.s. / रात / at night → "at bedtime".

6. "duration" — TOTAL course length. Express in WEEKS (7 days = 1 week, 1 month ~ 4
   weeks, 1 year = 52 weeks; decimals ok, e.g. "1.4 weeks"). EXCEPTION: if 7 days or
   fewer, give DAYS instead (e.g. "5 days"). Use "" if not written.

Ignore diagnoses, tests, diet, and lifestyle advice — medicines only.

Return ONLY valid JSON in exactly this shape, nothing else:
{"doctor":"","clinic":"","medicines":[{"name":"","strength":"","form":"","per_day":"","instruction":"","duration":""}]}`;

const KNOWN = ["crocin","meftal","allegra","ambrolite","ascoril","nasivion","augmentin","moxikind",
"mahacef","moflox","rantac","sompraz","esotrab","famocid","ondem","folvite","celin","shelcal",
"calcimax","supracal","calcirol","corcal","depura","uprise","lumia","arachitol","lupi","thyronorm",
"volini","dynapar","aceproxyvon","zerodol","acedal","altraday","nexito","naxdom","becosules",
"glycomet","janumet","volix","pregalin","montek","ventolin","levolin","rifagut","atorvas","dilzem",
"ursocol","voricon","betadine","sporlac","bifilac","vizylac","chymoral","rejunex","cartigen",
"nutrolin","karvol","paracetamol","amoxicillin","ondansetron","cefixime","ofloxacin","metformin",
"vertin","unienzym","udiliv","mucaine","spasrin","vomisa","gutbilee","enerzal","bortezomib",
"cabergoline","unidol","normaxin","neopride","clonazepam","haptob","hadjod","nerviday","pantoprazole","ibuprofen"];

const FORM_WORDS = new Set(["tab","tabs","tablet","tablets","cap","caps","capsule","capsules",
"syp","syr","syrup","inj","injection","oint","ointment","gel","cream","drops","drop","t","c","powder","sachet","neb","nebulization"]);

type Parsed = { medicines: Record<string, string>[]; doctor: string; clinic: string };
function parseJson(text: string): Parsed {
  const empty: Parsed = { medicines: [], doctor: "", clinic: "" };
  const t = (text ?? "").trim().replace(/^```(json)?/, "").replace(/```$/, "").trim();
  const pick = (s: string): Parsed | null => {
    try {
      const d = JSON.parse(s);
      if (d && Array.isArray(d.medicines)) {
        return { medicines: d.medicines, doctor: typeof d.doctor === "string" ? d.doctor : "", clinic: typeof d.clinic === "string" ? d.clinic : "" };
      }
    } catch (_e) { /* */ }
    return null;
  };
  return pick(t) ?? pick((t.match(/\{[\s\S]*\}/) || [""])[0]) ?? empty;
}
function confidence(name: string) {
  const words = (name ?? "").toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w && !FORM_WORDS.has(w));
  const root = words[0] ?? "";
  if (!root || root.length < 3) return "low";
  return KNOWN.some((k) => k.includes(root) || root.includes(k) || (root.length > 3 && k.startsWith(root.slice(0, 4)))) ? "high" : "low";
}
// Resolve a TRUSTWORTHY identity: VERIFY the JWT via the auth server (not just decode it),
// so a forged token can't impersonate a user or get a fresh rate-limit bucket. Unverified /
// anonymous callers fall back to their IP, which is then rate-limited the same way.
async function resolveIdentity(req: Request, admin: ReturnType<typeof createClient>) {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  let userId: string | null = null;
  if (token && token.split(".").length === 3) {
    try {
      const { data } = await admin.auth.getUser(token); // validates signature + expiry server-side
      userId = data.user?.id ?? null;
    } catch (_e) { /* invalid/expired → treat as anonymous */ }
  }
  return { userId, identity: userId ? ("user:" + userId) : ("ip:" + ip) };
}

Deno.serve(async (req: Request) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  const t0 = Date.now();
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { userId, identity } = await resolveIdentity(req, admin);

  try {
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) return json({ error: "GEMINI_API_KEY secret is not set" }, 500);

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count } = await admin.from("scan_events")
      .select("id", { count: "exact", head: true })
      .eq("identity", identity).gte("created_at", since);
    if ((count ?? 0) >= DAILY_LIMIT) return json({ error: "Daily scan limit reached. Please try again tomorrow." }, 429);

    const { path, image_b64, mime } = await req.json();
    let b64 = "";
    let mediaType = mime || "image/jpeg";
    if (image_b64) {
      if (image_b64.length > MAX_B64_CHARS) return json({ error: "Image too large — please use a smaller photo." }, 413);
      b64 = image_b64;
    } else if (path) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
      const { data: blob, error: dlErr } = await userClient.storage.from("prescriptions").download(path);
      if (dlErr || !blob) return json({ error: "download: " + (dlErr?.message ?? "not found") }, 400);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let bin = ""; const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
      b64 = btoa(bin); mediaType = "image/jpeg";
    } else {
      return json({ error: "missing 'image_b64' or 'path'" }, 400);
    }

    const body = {
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mediaType, data: b64 } }] }],
      generationConfig: { response_mime_type: "application/json" },
    };

    let parsed: Parsed = { medicines: [], doctor: "", clinic: "" };
    let lastErr = "";
    for (let attempt = 0; attempt < 4; attempt++) {
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
        { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body) });
      if (r.ok) { const j = await r.json(); parsed = parseJson(j?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""); lastErr = ""; break; }
      lastErr = `gemini ${r.status}: ${(await r.text()).slice(0, 200)}`;
      if (attempt < 3) await new Promise((res) => setTimeout(res, 3000 * (attempt + 1)));
    }

    const out = (lastErr ? [] : parsed.medicines).map((m) => ({
      name: m.name ?? "",
      strength: m.strength ?? "",
      form: m.form ?? "",
      per_day: m.per_day ?? "",
      instruction: m.instruction ?? "",
      duration: m.duration ?? m.stock ?? "",
      confidence: confidence(m.name ?? ""),
    })).filter((m) => m.name.trim().length > 0);

    admin.from("scan_events").insert({ user_id: userId, identity, ok: !lastErr, med_count: out.length, ms: Date.now() - t0 }).then(() => {});
    if (lastErr) return json({ error: lastErr }, 502);
    return json({ medicines: out, doctor: lastErr ? "" : parsed.doctor, clinic: lastErr ? "" : parsed.clinic });
  } catch (e) {
    admin.from("scan_events").insert({ user_id: userId, identity, ok: false, med_count: 0, ms: Date.now() - t0 }).then(() => {});
    return json({ error: String(e) }, 500);
  }
});
