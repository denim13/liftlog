# LiftLog PWA — Deploy Guide

A science-based PPL workout tracker that installs on your phone like a native app.

---

## 🚀 Deploy to Your Phone in ~10 Minutes

### Step 1 — Install Node.js (if you don't have it)
Download from: https://nodejs.org (choose LTS version)
Verify install: open Terminal and run `node -v`

---

### Step 2 — Set up the project

Unzip the `liftlog-pwa` folder, then in Terminal:

```bash
cd liftlog-pwa
npm install
```

This installs all dependencies (React, Vite, PWA plugin). Takes ~1 minute.

---

### Step 3 — Test it locally (optional but recommended)

```bash
npm run dev
```

Opens at http://localhost:5173 — you'll see the full app.
Press Ctrl+C to stop.

---

### Step 4 — Create a GitHub repo

1. Go to https://github.com and sign in (create free account if needed)
2. Click **New repository**
3. Name it `liftlog`, set to **Public**, click **Create repository**
4. In Terminal (inside your liftlog-pwa folder):

```bash
git init
git add .
git commit -m "Initial LiftLog PWA"
git branch -M main
git remote add origin https://github.com/denim13/liftlog.git

git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

### Step 5 — Deploy with Vercel (free)

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New → Project**
3. Find and select your `liftlog` repo
4. Vercel auto-detects Vite — just click **Deploy**
5. Done! You'll get a URL like: `https://liftlog-abc123.vercel.app`

Every time you push changes to GitHub, Vercel redeploys automatically.

---

### Step 6 — Install on your phone 📱

**iPhone (Safari):**
1. Open your Vercel URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down → tap **Add to Home Screen**
4. Tap **Add** — LiftLog icon appears on your home screen!

**Android (Chrome):**
1. Open your Vercel URL in Chrome
2. Tap the three-dot menu
3. Tap **Add to Home screen** or **Install app**
4. Tap **Add** — done!

The app works fully offline after first load. Your data is stored locally on the device.

---

## 🛠 Making Changes

To edit exercises, weights, or anything else:
- Edit `src/App.jsx` — the `DAYS` array at the top controls all workouts
- Save the file → Vite hot-reloads instantly in your browser
- Push to GitHub → Vercel auto-deploys in ~30 seconds

---

## 📦 Tech Stack

- **React 18** — UI
- **Vite 5** — Build tool (lightning fast)
- **vite-plugin-pwa** — Service worker + manifest generation
- **localStorage** — Persistent data storage on device
- **Vercel** — Free hosting with auto-deploy

---

## 💾 Data & Backup

Your workout data is stored in `localStorage` on each device. To back it up or transfer:
1. Open the app in Chrome desktop
2. Open DevTools → Application → Local Storage
3. Copy the value for `liftlog-workout-data-v1`

For multi-device sync in the future, you'd add a backend (Supabase free tier is a great option).

---

Built with ❤️ — Go get those gains.
