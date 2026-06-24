# Medira — Security posture

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
