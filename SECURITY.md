# Medira — Security posture

## 🔎 Audit results — 24 June 2026 (verified)

- ✅ **No secrets in the codebase.** Full scan (excl. node_modules) for service-role keys,
  API keys, JWTs, PEM blocks — **0 found**. The app ships only the **publishable** anon key.
- ✅ **RLS is LIVE and enforced.** Queried every table (`profiles`, `medicines`, `doses`,
  `prescriptions`, `sos_contacts`, `scan_events`) over the REST API using only the public
  anon key (no user login). **Every table returned `[]`** — an attacker with the shipped key
  cannot read any user's data.
- ✅ **No dangerous code.** No `eval` / `new Function` / `child_process`; the `.exec()` hits are
  regex matches. No cleartext `http://`. DB queries are parameterized (PostgREST); the one
  string-built filter only uses **UUID-validated** ids → no SQL injection.
- ✅ **Client config safe** — publishable key only, `detectSessionInUrl: false`, HTTPS only.

### Findings / recommendations
- **MEDIUM (cost, not data) — FIXED in code, ⏳ deploy pending:** the Edge Function now
  **verifies the JWT via the auth server** (`admin.auth.getUser`) instead of trusting a decoded
  claim, so a forged token can't impersonate a user or get a fresh rate-limit bucket — it falls
  back to IP-based limiting. The updated `supabase/functions/extract-prescription/index.ts` is
  ready; **redeploy it** when the Supabase connection is back (it can't be deployed right now).
- **LOW–MED (device compromise) — FIXED:** the auth session now uses **`expo-secure-store`**
  (hardware-backed Keystore/Keychain encryption) via `src/backend/secureStorage.js`, with a
  safe AsyncStorage fallback and transparent chunking. Tokens are encrypted at rest.
- **LOW (privacy):** medicine reminders show the medicine name on the lock screen
  (`lockscreenVisibility: PUBLIC`). Set to `PRIVATE` to hide content from onlookers (trade-off:
  less glanceable).
- **INFO:** the mobile scan flow does **not** store prescription images — only the extracted
  text — which minimises sensitive data at rest.
- **ACTION:** rotate the OpenAI/Anthropic keys shared in chat earlier (benchmark only, not in
  the app) — treat anything shared in plaintext as compromised.

---


## ✅ Already in place (verified)

- **No secrets in the app bundle.** The app ships only the **publishable** Supabase anon key
  (`sb_publishable_…`), which is designed to be public. The **Gemini AI key** and the
  **service-role key** live **only** in the Supabase Edge Function / server — never in the app.
- **Row-Level Security (RLS)** is enabled on every table (`profiles`, `medicines`, `doses`,
  `prescriptions`, `sos_contacts`, `scan_events`). Each user can read/write **only their own
  rows** (`auth.uid() = user_id`).
- **Private prescription storage** — the `prescriptions` bucket is private, with per-user
  folder policies; images are not publicly accessible.
- **Rate limiting & abuse logging** — the Edge Function caps scans per identity per 24h and
  logs usage in `scan_events` (service-role only, no public policy).
- **All traffic is HTTPS/TLS** (Supabase + Gemini). Android blocks cleartext by default.
- **Auth sessions** are persisted via the Supabase client with auto-refresh; tokens are not
  logged or exposed.
- **`.gitignore` hardened** to keep `.env`, keystores, `google-services.json`, and any
  `secret*.txt` out of the repo.
- **Release builds are minified/obfuscated** (Hermes + R8) by EAS for the production profile.

## 🔧 Do these in the dashboards (one-time)

1. **Run Supabase Advisors:** Dashboard → **Advisors → Security** → resolve any warnings
   (confirms RLS, function search_path, exposed columns, etc.).
2. **Auth settings:** Authentication → URL config / providers — keep only the providers you
   use (Google + anonymous). Set a sensible **site URL** / allowed redirect if applicable.
3. **Storage:** confirm the `prescriptions` bucket is **private** (it is in the migration).
4. **Backups:** on Supabase Pro, enable **daily backups** before launch.

## 🔐 Optional hardening (nice-to-have)

- **Encrypted session storage:** move the Supabase auth session from AsyncStorage to
  `expo-secure-store` (Keystore/Keychain-backed) for defense on rooted/jailbroken devices.
  Needs chunking for large tokens — ask if you want this wired in.
- **Reconsider `CALL_PHONE`:** the auto-dial permission can slow Play review; the dialer
  fallback works without it. Drop it for v1 if you want a smoother approval.

## ⚠️ Key rotation reminder

The OpenAI and Anthropic API keys that were shared earlier in chat (used only for the
offline benchmark, **not** in the app) should be **rotated/revoked** in their dashboards,
since anything shared in plaintext should be treated as compromised.
