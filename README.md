# EatApp Framework v11 — clean React Native / Expo repo

One repo builds **every** app in the EatApp CMS. Nothing here is per-customer:
the bundle ID, EAS project ID, version and build number arrive as workflow
inputs from the CMS, and all content/branding is fetched from the CMS API at
build time and at runtime.

## Setup (once)

```bash
# in an EMPTY repo folder — copy every file from this zip in, then:
rm -rf node_modules package-lock.json yarn.lock ios android
npm install
git add -A && git commit -m "EatApp framework v11" && git push
```

Do **not** commit `package-lock.json` (it is gitignored on purpose). Without a
lockfile EAS runs `npm install` instead of `npm ci`, so the
`npm ci ... EUSAGE / Missing: ... from lock file` and `ERESOLVE` build
failures cannot happen again.

Then in Expo: link this GitHub repo to each EAS project (Project → GitHub →
Connect). Nothing else per app.

## Local commands (only if you want to run it on your Mac)

```bash
EATAPP_BUNDLE_ID=com.company.bkstakeaway \
EAS_PROJECT_ID=30c33451-038d-41b2-b1f6-7cf4f2cd6d8d \
npx expo start
```

Never create `app.config.ts` — only `app.config.js` exists here, on purpose.

## What each file does

| File | Purpose |
| --- | --- |
| `app.config.js` | Builds the native config from the CMS payload: name, slug, icon, splash, bundle id, version/build number, permissions, OneSignal, `extra.eas.projectId`. |
| `scripts/fetch-config.js` | Runs before install/build, downloads the app's config + icon + splash into `assets/`. |
| `eas.json` | Node 20.19.4, `image: latest` (Xcode 26 / iOS 26 SDK — fixes ITMS‑90725), `appVersionSource: local` so the CMS-calculated version wins. |
| `.eas/workflows/*.yml` | Accept `bundle_id`, `eas_project_id`, `app_version`, `build_number` from the CMS and export them as env. |
| `app/` | expo-router screens: home, dynamic CMS page, external web view. |
| `src/` | Config loader + cache, theme, HTML renderer (same font stack as the dashboard preview), tab bar with parent/child drawer submenus. |
| `.npmrc` | `legacy-peer-deps=true` so peer warnings never fail installs. |

## Versions

Expo SDK 54 · React Native 0.81.4 · React 19.1 · Node 20.19.4 — all pinned to
one consistent set. Do not run `npx expo install --fix` against a newer
canary; it is what pulled in react-native 0.86 and broke the lockfile.

## Runtime behaviour

1. Renders instantly from the AsyncStorage cache (or the config bundled at build time).
2. Fetches `/api/public/apps/config` with `X-App-Bundle` + `If-None-Match`.
3. Hot-reloads theme, navigation, home and pages when the payload changes — no rebuild for content edits.
4. Registers OneSignal with `onesignal.appId` from the config.

Rebuild only when bundle ID, permissions, icon, splash or certificates change.
