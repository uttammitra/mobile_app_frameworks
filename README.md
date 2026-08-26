# EatApp mobile framework — v12

One repo builds **every** app in the EatApp CMS. You never edit anything here per app.

## Setup (once, ~2 minutes)

1. Create an **empty** GitHub repo and copy every file from this zip into it.
2. Commit and push. **Do not run `npm install` locally.** You do not need node_modules,
   an `.env` file, or the EAS CLI on your Mac.
3. In [expo.dev](https://expo.dev) → your project → **GitHub** → connect this repository.
   Leave **Base directory** blank (not `/`).
4. Go to the EatApp CMS → an app → **Save & Publish**. The CMS dispatches the workflow,
   Expo checks out this repo, and everything else is automatic.

That's it. No local install step exists, so there are no local dependency errors.

## Why installs used to fail

- **No `package-lock.json` is committed** (it's in `.gitignore`). EAS therefore runs
  `npm install` instead of `npm ci`, so a stale lockfile can never produce
  `npm error code EUSAGE` / `Missing: … from lock file` again.
- **`.npmrc` sets `legacy-peer-deps=true`**, which absorbs the OneSignal / expo-font
  peer conflicts that caused `ERESOLVE could not resolve`.
- Dependency versions are pinned to exactly what Expo SDK 54 expects
  (`npx expo install --check` reports "Dependencies are up to date").

## Why `expo` commands no longer crash

`app.config.js` used to throw when the CMS config wasn't reachable, which broke
`expo config`, `expo install --fix` and Expo's GitHub integration with
`No EAS project id for bundle "app.eatapp.demo"`.

It now degrades gracefully: without `EATAPP_BUNDLE_ID` it produces a valid generic
config, and it only demands an EAS project id while actually running on EAS Build.

## How a build gets its data

The CMS dispatches `.eas/workflows/build-ios.yml` / `build-android.yml` with inputs:

| input | example |
| --- | --- |
| `bundle_id` | `com.company.bkstakeaway` |
| `eas_project_id` | `30c33451-…` |
| `app_version` | `7.0.2` |
| `build_number` | `53` |

`scripts/fetch-config.js` then pulls `/api/public/apps/config` for that bundle and writes
`assets/config/app.json` plus the downloaded icon/splash images. `app.config.js` reads
those to produce the name, slug, bundle id, version, build number, permissions,
OneSignal plugin and splash screen. At runtime `src/config.ts` re-fetches the same
endpoint so content changes appear without a rebuild.

## Optional: running it locally

Only if you want the Expo Go preview:

```bash
npm install
EATAPP_BUNDLE_ID=com.company.bkstakeaway npx expo start -c
```

## Notes

- Only `app.config.js` exists — delete any leftover `app.config.ts`.
- `eas.json` pins Node `20.19.4` and iOS image `latest` (Xcode 26) so App Store Connect
  stops rejecting uploads with ITMS-90725.
