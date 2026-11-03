# IndexedDB and Native SQLite Storage for Paws & Pots

State: 🔄 in progress

## Problem & Vision

Potty records and the dog profile live in WebView `localStorage` as two JSON blobs (`pawspot_logs_v2`, `pawspot_profile_v2`). Every mutation serializes and rewrites the whole records array on the main thread, and the app reads those blobs synchronously into `useState`.

The owner intends to keep five or more years of history on one device — roughly 20,000 rows, and about 3–4 MB of JSON at 120–180 bytes per row. That sits at or past the 5 MB per-origin `localStorage` ceiling, which Chromium counts as UTF-16, and long before the ceiling is reached every tap pays a full-array `JSON.stringify` plus a synchronous write.

Move the browser onto IndexedDB first, then the Android app onto the platform SQLite database, both behind one async store contract with per-row writes. Every migration off `localStorage` after the first one is carried by a versioned backup file, so a phone swap stays possible.

## Goals

- Browser persistence on IndexedDB: async, transactional, per-row writes, no size ceiling, no wasm, no meaningful bundle growth.
- Android persistence on the platform SQLite database: no wasm in the APK.
- One async store contract implemented twice and chosen at runtime, so the same `dist` serves browser and APK.
- A versioned backup file carrying records and profile, with validated, confirmed, atomic restore.
- Storage that fails loudly: a blocking screen with Retry instead of silent fallback writes.

## Non-goals

- No automatic migration of the existing `localStorage` data. The first switch relies on exporting from the build installed today, which carries records only — the profile is re-entered by hand. The versioned file from later rows covers every migration after that.
- No React Native or Expo migration; the web layer stays React DOM inside Capacitor.
- No ORM and no hand-written native bridge — no Kotlin/KSP toolchain enters the Android build.
- No wasm SQLite anywhere: not precached in the PWA, not packaged in the APK.
- No SQL-side stats, filtering, paging, search, or multi-dog support; analysis keeps operating on the loaded array.
- No change to haptic and sound preferences; they stay as `localStorage` flags in `src/utils/haptics.ts`.
- No cloud sync or encryption.

## Decisions

- Web adapter uses `idb@8.x` over database `pawspot` v1, with stores `records` (keyPath `id`, `byTimestamp` index), `profile` (keyPath `id`) and `meta` (keyPath `key`).
- Android adapter uses `@capacitor-community/sqlite@8.x`, imported dynamically so the PWA never executes it; its wasm web side is never imported.
- Backend selection lives in `src/storage/index.ts`: `Capacitor.getPlatform() === 'android'` picks SQLite, everything else picks IndexedDB.
- The contract keeps its current shape from `src/storage/storeContract.ts` and stays the only thing the app imports.
- Backup format is `{ schemaVersion: 1, exportedAt, profile, logs }`; import still accepts the legacy bare array.
- Java 21 for both the app and the plugin, with `compileOptions` declared after `apply from: 'capacitor.build.gradle'` so `cap sync` cannot revert it.
- npm is the only package manager; `bun.lock` goes away.

## Iterations

⬜ pending · 🔄 in progress · ✅ done · ❌ dropped

| # | Iteration | Done when | State |
|---|-----------|-----------|-------|
| 1 | Replace the browser `localStorage` adapter with an IndexedDB adapter behind the existing contract | Add, undo, delete, clear-all and profile-save survive a hard reload; a fresh browser profile opens with zero records; `git grep localStorage` matches only `src/utils/haptics.ts` | ✅ |
| 2 | Export a versioned backup that includes the dog profile | Exporting produces `{schemaVersion, exportedAt, profile, logs}` and the downloaded file holds the current dog name and the full record count | ⬜ |
| 3 | Import a versioned backup, still accepting the legacy bare array | Re-importing a file from row 2 restores the exact record count and dog name; a pre-update bare array restores the records; a malformed file shows an error and leaves stored data unchanged | ⬜ |
| 4 | Retry on the blocking startup-failure screen | A forced store-init failure blocks the app with a Retry button; once the fault is cleared, Retry opens the app with the stored data intact | ⬜ |
| 5 | Add the SQLite plugin and Java 21 wiring without using it yet | `npm i @capacitor-community/sqlite`, `npx cap sync android` and `gradlew assembleDebug` all succeed; web build and PWA still pass; the app still runs on the IndexedDB adapter | ⬜ |
| 6 | Select the SQLite backend at runtime and implement the full contract on it | On device, add, undo, delete, clear-all and profile-save survive force-stop and relaunch; no record or profile read touches `localStorage` on Android | ⬜ |
| 7 | Dev-only sample seeding behind `VITE_SEED_SAMPLE_DATA` | With the flag set a fresh store opens with sample records and profile; unset it opens empty; relaunching never duplicates rows; the flag is documented in `.env.example` | ⬜ |
| 8 | Cleanup: drop `bun.lock`, delete dead storage code, keep SQLite wasm out of the precache | One lockfile remains; `localStorage` appears only in `haptics.ts`; the precache manifest carries no SQLite or wasm chunk; `npm run lint` and `npm run build` pass | ⬜ |
