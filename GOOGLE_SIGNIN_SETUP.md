# Google Sign-In — exact setup steps (Medira)

The **code is done**. `GOOGLE_WEB_CLIENT_ID` is already set in `src/services/auth.js`. These
are the one-time **console** steps (the only thing I can't do for you). Google sign-in runs
only in the **dev/production build**, not Expo Go — use **"Continue as guest"** in Expo Go.

Current values:
- **Web client ID:** `151508520584-djbdol8l704m92p8aqj602hstvoc8dea.apps.googleusercontent.com`
- **Package name (testing):** `com.example.medira`  ← will change before Play launch (see note)
- **Supabase project:** `bjxhnkwgtnkxyotzdzcw`

---

## Step 1 — Get your app's SHA-1 (from the EAS keystore)

```powershell
cd "G:\prescription-project\PrescriptionDetection-1\expo"
npx eas-cli credentials
```
→ **Android** → **development** profile → **Keystore** → copy the **SHA-1 Fingerprint**.

(For production later, repeat for the **production** profile — it has a different SHA-1.)

---

## Step 2 — Google Cloud Console → create the Android OAuth client

https://console.cloud.google.com → select the project that owns the Web client ID above.

1. **APIs & Services → OAuth consent screen**
   - User type **External**, app name **Medira**, your support email.
   - While it is in **"Testing"**, add your own Google account under **Test users**.
   - (When ready for the public, click **Publish app**.)
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID → Android**
   - **Package name:** `com.example.medira`
   - **SHA-1:** paste the value from Step 1.
   - **Create**, then copy the new **Android client ID**.

---

## Step 3 — Supabase → enable Google

Dashboard → project `bjxhnkwgtnkxyotzdzcw` → **Authentication → Sign In / Providers → Google**:
1. **Enable** the provider.
2. In **Client IDs** (the "Authorized Client IDs" field) paste **both**, comma-separated:
   - the **Web client ID** (from the top of this file), and
   - the **Android client ID** (from Step 2).
3. **Save.**

---

## Step 4 — Enable guest sign-in (so "Continue as guest" works)

Supabase → **Authentication → Sign In / Providers** → enable **"Allow anonymous sign-ins"**.

---

## Step 5 — Test

Install the dev build → tap **Continue with Google** → it should sign you in. If it fails,
double-check the SHA-1 matches the build profile you installed, and that you're a listed
**test user**.

---

## ⚠️ Before Google Play launch

`com.example.*` is **not allowed** on Google Play, and the package name is **permanent**.
Pick a real one (e.g. `com.adityavalaki.medira`) **before** first upload, then:
- Add a **new Android OAuth client** with that package + your **production** keystore SHA-1.
- Add both that client ID and the Web client ID to Supabase.
- Publish the OAuth consent screen.
