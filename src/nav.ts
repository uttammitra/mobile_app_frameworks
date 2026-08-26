import { Linking } from 'react-native';
import type { NavItem } from './config';

export const isCmsHost = (v?: string | null) => !!v && /mobileforge-studio\.lovable\.app/i.test(v);

export const isExternalUrl = (v?: string | null) => !!v && /^https?:\/\//i.test(v);

/**
 * Resolves any CMS nav target (tab, app-bar button, submenu child) to a route.
 * The CMS puts external links in `route` (and sometimes `url`), so anything
 * starting with http(s) must open the in-app WebView instead of /p/[slug].
 */
export function openNavTarget(
  router: { push: (v: any) => void },
  item: Pick<NavItem, 'label' | 'route' | 'url' | 'action'>,
) {
  const target = String(item.url || item.route || '').trim();

  if (isExternalUrl(target) && !isCmsHost(target)) {
    router.push({ pathname: '/web', params: { url: target, title: item.label ?? '' } });
    return;
  }
  if (/^(tel:|mailto:|sms:)/i.test(target)) {
    Linking.openURL(target).catch(() => {});
    return;
  }
  if (!target || target === '/') {
    router.push('/');
    return;
  }
  if (target === '/notifications') {
    router.push('/notifications');
    return;
  }
  router.push({ pathname: '/p/[slug]', params: { slug: target.replace(/^\//, '') } });
}
