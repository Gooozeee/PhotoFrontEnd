# PhotoFrontEnd Specialist - React 18 TypeScript

**Your Project:** React 18 SPA with TypeScript (Vite, Vitest, Testing Library)
**Core Rule:** Container → Presentational → Services (data flows down, events up)

---

## 🏗️ Project Structure (THIS IS CRITICAL - match the REAL layout)

```
src/
├── components/                  # Presentational UI components (flat, NOT nested subfolders)
│   ├── GalleryBanner.tsx        # Home gallery section (albums filter + grid)
│   ├── GalleryImage.tsx         # Single image card in a grid
│   ├── SingleAlbumImage.tsx     # Album cover tile
│   ├── ImageModal.tsx           # Full-size image modal w/ caption + tags
│   ├── ImageSwitcher.tsx        # Prev/next navigation
│   ├── WelcomeImage.tsx         # Hero banner
│   ├── Layout.tsx, NavBar.tsx, Footer.tsx, DownArrow.tsx
│   └── *.test.tsx               # Colocated component tests
│
├── hooks/                       # Custom React hooks (data fetching + state)
│   ├── useImageGallery.ts       # Albums + paginated photos + cache + static fallback
│   └── staticGalleryData.ts     # Offline/static fallback dataset
│
├── lib/                         # Config & browser lib glue
│   ├── apiBaseUrl.ts            # resolveApiBaseUrl() - env + path resolution
│   ├── supabase.ts              # Supabase client
│   └── adminRedirectMessage.ts  # Cross-route admin messages
│
├── pages/                       # Route-level containers
│   ├── HomePage.tsx, SingleAlbumPage.tsx, SoftwareEngineeringPage.tsx
│   ├── NotFoundPage.tsx, UnderConstructionPage.tsx
│   └── admin/                   # Admin area (AdminShell, UploadPage, AlbumsPage,
│       │                        #   PhotosPage, MetadataQueuePage, RequireAdminSession,
│       │                        #   api.ts - admin API client, types.ts)
│
├── utils/                       # Pure functions, fully unit-tested
│   ├── getPreviewImageUrl.ts, getAlbumGridLayout.ts
│   ├── SplitArrayIntoParts.ts, scrollToPosition.ts, RetrieveNameFromFilePath.ts
│   └── ApiCache.ts              # Generic TTL cache used by hooks
│
├── test/setup.ts                # Vitest setup (jsdom, jest-dom)
└── App.tsx                      # Routes
```

**NOTE:** Components are FLAT under `components/` — do NOT invent `common/`, `features/`, or `layout/` subfolders. Follow the existing files.

---

## 🧱 Data Flow (the real pattern)

```
Service / API module (lib/apiBaseUrl + fetch inside hook, or pages/admin/api.ts)
    ↓
Custom Hook (useImageGallery.ts)  → caching (ApiCache / module Maps), inflight dedup,
    ↓                                static fallback when server unreachable
Container Page (HomePage.tsx / SingleAlbumPage.tsx) → owns state via hooks
    ↓
Presentational Component (GalleryBanner.tsx, ImageModal.tsx) → props only, NO fetch
```

**Rules:**
- **Pages (`pages/`)** = containers: own state via hooks, orchestrate data.
- **Components (`components/`)** = presentational: props in, events up. **NEVER call `fetch` inside a presentational component.** (`GalleryBanner` uses the `useImageGallery` hook — that is the sanctioned exception: it is a data-driven section, and it delegates fetching to the hook.)
- **Hooks (`hooks/`)** = all data fetching + state logic. Deduplicate in-flight requests, cache with TTL, and keep a **static fallback** for the public gallery so the site works when the free-tier backend is asleep.
- **Services/API calls**: public gallery fetch lives in the hook; admin API lives in `pages/admin/api.ts`. New API modules should go in `lib/` or `services/` following the `apiBaseUrl.ts` pattern.
- **Utils (`utils/`)** = pure functions only; every util gets a `.test.ts`.

---

## 💅 UI/UX Conventions

- **Theme**: dark (near-black `#09090B`), white text, `font-family: 'Archivo'` for headings and `'Space Grotesk'` for UI/labels.
- **Motion**: `framer-motion` — respect `useReducedMotion()`; keep entrance animations subtle (opacity + translate, ~0.4s, staggered `index * 0.08`).
- **Grid**: `grid-cols-2 lg:grid-cols-4` with 2px gaps; photos use `aspect-*` ratios and orientation-aware unit sizing (portrait 1×2, landscape 2×1) via `getAlbumGridLayout`.
- **Captions**: clamp to `MAX_CAPTION_CHARS = 80` via `clampCaption()` in `ImageModal.tsx`; render with `line-clamp-2`.
- **Loading/empty states**: show friendly "Waking up…" messaging for the free-tier cold start; use `role="status"` for accessibility.
- **Typography**: use `clamp()` for responsive type sizes.
- **Colors**: zinc palette (`zinc-500/600`), white/10 borders, `rounded-full` pill buttons for filters.

---

## ✅ Checklist Before Coding

- [ ] Route/page logic? → `pages/`
- [ ] Presentational UI? → `components/` (flat, colocated `.test.tsx`)
- [ ] Data fetching / state? → custom hook in `hooks/`
- [ ] API client? → `lib/` or `pages/admin/api.ts` (mirror `apiBaseUrl.ts`)
- [ ] Pure logic? → `utils/` with a `.test.ts`
- [ ] Did you add tests? → components, hooks, utils all need tests (Vitest + Testing Library)
- [ ] Did you run `npm run test` and `npm run build`?

---

## 🔄 When Adding a New Feature (real ordering)

1. Add/define types alongside the data (e.g., `GalleryPhoto` in `useImageGallery.ts`, or `pages/admin/types.ts`).
2. Add the API/query function (in the hook or `api.ts`).
3. Build the presentational component(s) under `components/`.
4. Wire the container (page) to the hook.
5. Add tests (component + hook + util).
6. Run `npm run test` (full suite) and `npm run build`.

---

## 🔒 Security / Secrets

- **NEVER** hardcode API keys, tokens, or admin credentials in source. Admin API keys live in the Vault / environment only.
- The admin area is guarded by `RequireAdminSession` (session-gated routes under `/admin/*`).
- Keep `Accept: application/json` on API fetches; never log tokens.

---

## 📦 Dependencies (already present — don't add without checking)

React 18, react-router-dom v6, framer-motion, TypeScript, Vite, Vitest, @testing-library/react + user-event + jest-dom, Tailwind CSS. Supabase client for auth. **Check `package.json` before adding anything new.**
