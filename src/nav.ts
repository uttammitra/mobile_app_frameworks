import { Linking } from 'react-native';
import type { NavItem } from './config';

export const isCmsHost = (v?: string | null) => !!v && /mobileforge-studio\.lovable\.app/i.test(v);

export const isExternalUrl = (v?: string | null) => !!v && /^https?:\/\//i.test(v);

type Router = {
  push: (v: any) => void;
  replace: (v: any) => void;
};

type NavOpts = {
  /** Current pathname — tapping the active destination becomes a no-op. */
  current?: string;
  /** Replace the current screen instead of pushing a new one (tab behaviour). */
  replace?: boolean;
};

/** Resolves a CMS target to the pathname it will land on. */
export function resolvePathname(target: string) {
  if (isExternalUrl(target) && !isCmsHost(target)) return '/web';
  if (!target || target === '/') return '/';
  if (target === '/notifications') return '/notifications';
  return `/p/${target.replace(/^\//, '')}`;
}

/**
 * Resolves any CMS nav target (tab, app-bar button, submenu child) to a route.
 * The CMS puts external links in `route` (and sometimes `url`), so anything
 * starting with http(s) must open the in-app WebView instead of /p/[slug].
 *
 * Navigation is SINGLE INSTANCE: tapping the destination you are already on
 * does nothing, and tab-style targets replace the current screen so repeated
 * taps never stack duplicate screens behind the back button.
 */
export function openNavTarget(
  router: Router,
  item: Pick<NavItem, 'label' | 'route' | 'url' | 'action'>,
  opts: NavOpts = {},
) {
  const target = String(item.url || item.route || '').trim();

  if (/^(tel:|mailto:|sms:)/i.test(target)) {
    Linking.openURL(target).catch(() => {});
    return;
  }

  const dest = resolvePathname(target);
  const current = String(opts.current ?? '');
  const go = (v: any) => (opts.replace ? router.replace(v) : router.push(v));

  if (isExternalUrl(target) && !isCmsHost(target)) {
    go({ pathname: '/web', params: { url: target, title: item.label ?? '' } });
    return;
  }

  // Already here — do nothing instead of pushing another copy.
  if (current && (current === dest || (dest === '/' && current === '/index'))) return;

  if (dest === '/' || dest === '/notifications') {
    go(dest);
    return;
  }
  go({ pathname: '/p/[slug]', params: { slug: target.replace(/^\//, '') } });
}
