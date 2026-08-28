/**
 * EatApp — fully dynamic Expo config (plain JS on purpose).
 *
 * Expo reads this file with `expo config` on EAS Build. A .ts config can fail to
 * transpile there ("Unexpected token '{'"), so everything stays in CommonJS JS.
 *
 * Values come from, in order:
 *   1. environment variables (per build profile / set by the EatApp CMS)
 *   2. assets/config/app.json (written by scripts/fetch-config.js at build time)
 *   3. safe generic defaults
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const env = process.env;
const requestedBundleId = env.EATAPP_BUNDLE_ID || '';

// Expo evaluates this file before dependency installation. Pull the selected app
// synchronously now so every native value comes from the CMS for this build.
if (requestedBundleId && env.EATAPP_SKIP_CONFIG_FETCH !== '1') {
  try {
    execFileSync(process.execPath, [path.resolve(__dirname, 'scripts/fetch-config.js')], {
      cwd: __dirname,
      env: env,
      stdio: ['ignore', 2, 2],
    });
  } catch (e) {
    console.warn('[eatapp] Config sync skipped: ' + e.message);
  }
}

function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, rel), 'utf8'));
  } catch (e) {
    return {};
  }
}

function exists(rel) {
  return fs.existsSync(path.resolve(__dirname, rel));
}

const cms = readJson('assets/config/app.json');
const cmsApp = cms.app || {};
const theme = cms.theme || cms.design || {};
const splash = cms.splash || {};
const perms = cms.permissions || {};

const on = (key) => {
  const p = perms[key];
  return typeof p === 'object' && p !== null ? !!p.on : !!p;
};
const text = (key, fallback) => {
  const p = perms[key];
  const t = typeof p === 'object' && p !== null ? p.text : '';
  return (t && String(t).trim()) || fallback;
};

const ON_EAS = env.EAS_BUILD === 'true' || !!env.EAS_BUILD_PLATFORM;
const bundleId = requestedBundleId || cmsApp.bundleId || 'app.eatapp.demo';
if (requestedBundleId && cmsApp.bundleId && cmsApp.bundleId !== requestedBundleId) {
  console.warn('[eatapp] CMS config bundle mismatch; using ' + requestedBundleId + '.');
}
const appName = env.EATAPP_APP_NAME || cmsApp.name || 'EatApp';
const linkedExpoSlug = env.EATAPP_SLUG || cmsApp.expoSlug || '';
const slug =
  linkedExpoSlug ||
  cmsApp.slug ||
  appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
  'eatapp';

const version = env.EATAPP_VERSION || cmsApp.appVersion || '1.0.0';
const buildNumber = String(env.EATAPP_BUILD_NUMBER || cmsApp.buildNumber || 1);

const easProjectId =
  env.EAS_PROJECT_ID || env.EATAPP_EAS_PROJECT_ID || cmsApp.easProjectId || undefined;
const expoOwner =
  env.EAS_PROJECT_OWNER || env.EATAPP_EXPO_OWNER || cmsApp.expoOwner || undefined;

// EAS runs `eas build:internal` non-interactively: without extra.eas.projectId it
// aborts with "EAS project not configured ... run 'eas init'".
if (easProjectId && ON_EAS && !linkedExpoSlug) {
  throw new Error(
    '[eatapp] No Expo slug was supplied for linked EAS project "' +
      easProjectId +
      '". The CMS workflow must pass EATAPP_SLUG.',
  );
}

if (!easProjectId && ON_EAS) {
  throw new Error(
    '[eatapp] No EAS project id for bundle "' +
      bundleId +
      '". Set it in the EatApp CMS (App -> Credentials -> EAS project ID) or pass EAS_PROJECT_ID.',
  );
}

const oneSignalAppId =
  env.EATAPP_ONESIGNAL_APP_ID || (cms.onesignal && cms.onesignal.appId) || undefined;

// Assets downloaded by scripts/fetch-config.js; fall back to the repo defaults.
const icon = exists('assets/generated/icon.png')
  ? './assets/generated/icon.png'
  : exists('assets/icon.png')
    ? './assets/icon.png'
    : undefined;

const splashImage = exists('assets/generated/splash.png')
  ? './assets/generated/splash.png'
  : icon;

const splashColor = splash.backgroundColor || theme.primary || '#111827';

const plugins = ['expo-router'];

if (oneSignalAppId) {
  plugins.push(['onesignal-expo-plugin', { mode: env.EATAPP_ONESIGNAL_MODE || 'production' }]);
}

if (splashImage) {
  plugins.push([
    'expo-splash-screen',
    {
      image: splashImage,
      backgroundColor: splashColor,
      imageWidth: Number(env.EATAPP_SPLASH_WIDTH || 200),
      resizeMode: 'contain',
    },
  ]);
}

if (on('tracking')) {
  plugins.push([
    'expo-tracking-transparency',
    {
      userTrackingPermission: text(
        'tracking',
        'Allow tracking to personalise offers and measure campaigns.',
      ),
    },
  ]);
}

module.exports = ({ config }) => {
  const base = config || {};
  const baseIos = base.ios || {};
  const baseAndroid = base.android || {};

  const infoPlist = Object.assign({}, baseIos.infoPlist, {
    ITSAppUsesNonExemptEncryption: false,
  });
  if (on('push')) infoPlist.UIBackgroundModes = ['remote-notification'];
  if (on('camera'))
    infoPlist.NSCameraUsageDescription = text(
      'camera',
      'We use the camera so you can take and share photos in the app.',
    );
  if (on('microphone'))
    infoPlist.NSMicrophoneUsageDescription = text(
      'microphone',
      'We use the microphone for voice features in the app.',
    );
  if (on('location'))
    infoPlist.NSLocationWhenInUseUsageDescription = text(
      'location',
      'We use your location to show nearby venues, delivery times and directions.',
    );
  if (on('photos')) {
    infoPlist.NSPhotoLibraryUsageDescription = text(
      'photos',
      'We access your photos so you can upload images in the app.',
    );
    infoPlist.NSPhotoLibraryAddUsageDescription = text(
      'photos',
      'We save images you download to your photo library.',
    );
  }
  if (on('storage'))
    infoPlist.NSDocumentsFolderUsageDescription = text(
      'storage',
      'We store files so you can access your downloads offline.',
    );

  const entitlements = Object.assign({}, baseIos.entitlements);
  if (on('push')) entitlements['aps-environment'] = env.EATAPP_APS_ENV || 'production';

  const androidPermissions = ['INTERNET'];
  if (on('push')) androidPermissions.push('POST_NOTIFICATIONS', 'VIBRATE', 'RECEIVE_BOOT_COMPLETED');
  if (on('camera')) androidPermissions.push('CAMERA');
  if (on('microphone')) androidPermissions.push('RECORD_AUDIO');
  if (on('location')) androidPermissions.push('ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION');
  if (on('storage') || on('photos'))
    androidPermissions.push('READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE');

  return Object.assign({}, base, {
    name: appName,
    slug: slug,
    version: version,
    orientation: 'portrait',
    scheme: slug,
    userInterfaceStyle: theme.mode === 'dark' ? 'dark' : 'light',
    primaryColor: theme.primary || '#111827',
    ...(expoOwner ? { owner: expoOwner } : {}),
    ...(icon ? { icon: icon } : {}),

    ios: Object.assign({}, baseIos, {
      bundleIdentifier: bundleId,
      buildNumber: buildNumber,
      supportsTablet: true,
      infoPlist: infoPlist,
      entitlements: entitlements,
    }),

    android: Object.assign({}, baseAndroid, {
      package: bundleId,
      versionCode: Number(buildNumber) || 1,
      permissions: androidPermissions,
      ...(icon
        ? {
            adaptiveIcon: {
              foregroundImage: icon,
              backgroundColor: theme.primary || splashColor,
            },
          }
        : {}),
    }),

    plugins: plugins,

    extra: Object.assign({}, base.extra, {
      ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
      EATAPP_BUNDLE_ID: bundleId,
      EATAPP_APP_ID: cmsApp.id || env.EATAPP_APP_ID || null,
      EATAPP_API_URL:
        env.EATAPP_API_URL || 'https://mobileforge-studio.lovable.app/api/public/apps/config',
      EATAPP_ASSET_BASE_URL:
        env.EATAPP_ASSET_BASE_URL || 'https://mobileforge-studio.lovable.app',
      EATAPP_ONESIGNAL_APP_ID: oneSignalAppId || null,
    }),
  });
};
