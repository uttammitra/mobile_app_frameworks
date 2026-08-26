import { AppConfig, BlankHome } from './config';

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>
  )[c]!);

/** Blank Canvas layout — background image + optional heading/subheading with
 *  vertical position (`textPos`, 0 = top, 100 = bottom) and custom colours. */
export function blankHtml(input: BlankHome | undefined | null): string {
  const b = input ?? {};
  const pos = Number(b.textPos);
  const textPos = Number.isFinite(pos) ? Math.min(100, Math.max(0, pos)) : 50;
  const overlay =
    b.overlay === 'dark' ? 'rgba(0,0,0,.4)' : b.overlay === 'light' ? 'rgba(255,255,255,.4)' : 'transparent';
  const bg = b.bg ? `url('${b.bg}') center/cover no-repeat` : 'var(--background)';
  const headingColor = b.headingColor || '#FFFFFF';
  const subColor = b.subColor || '#FFFFFF';

  return `<section style="position:relative;min-height:100vh;background:${bg};text-align:center;overflow:hidden">
  <div style="position:absolute;inset:0;background:${overlay}"></div>
  <div style="position:absolute;left:0;right:0;top:${textPos}%;transform:translateY(-50%);padding:24px">
    ${b.heading ? `<h1 style="font-size:32px;margin:0 0 8px;font-weight:700;color:${esc(headingColor)}">${esc(b.heading)}</h1>` : ''}
    ${b.subheading ? `<p style="font-size:16px;margin:0;opacity:.95;color:${esc(subColor)}">${esc(b.subheading)}</p>` : ''}
  </div>
</section>`;
}

/**
 * Builds the home screen HTML. The CMS usually sends ready-made `home.html`;
 * `blank` and `sections[]` are rendered locally as a fallback so the app still
 * matches the dashboard preview when only structured data arrives.
 */
export function homeHtml(config: AppConfig | null): string {
  const home = (config?.home ?? {}) as any;

  if (home.layout === 'blank' && home.blank) return blankHtml(home.blank);
  if (typeof home.html === 'string' && home.html.trim()) return home.html as string;
  if (home.blank) return blankHtml(home.blank);

  const sections = Array.isArray(home.sections) ? home.sections : [];
  if (!sections.length) {
    return `<div style="padding:48px 20px;text-align:center;color:var(--text-secondary)">
      <h2 style="color:var(--text);margin:0 0 8px">${esc(config?.app?.name ?? 'Welcome')}</h2>
      <p style="margin:0">Add content to the Home layout in the dashboard.</p></div>`;
  }
  return sections.map(renderSection).join('\n');
}

function renderSection(section: any): string {
  const s = section ?? {};
  const d = s.data ?? s.props ?? s;
  if (typeof s.html === 'string' && s.html.trim()) return s.html;

  switch (s.type) {
    case 'hero':
      return `<section style="position:relative;min-height:260px;display:flex;flex-direction:column;justify-content:center;padding:28px 20px;
        background:${d.image ? `url('${d.image}') center/cover no-repeat` : 'var(--primary)'};color:#fff">
        ${d.image ? '<div style="position:absolute;inset:0;background:rgba(0,0,0,.35)"></div>' : ''}
        <div style="position:relative">
          <h1 style="margin:0 0 8px;font-size:28px;line-height:1.15">${esc(d.title)}</h1>
          ${d.subtitle ? `<p style="margin:0;opacity:.9">${esc(d.subtitle)}</p>` : ''}
        </div></section>`;
    case 'banner':
      return `<div style="margin:16px 20px;border-radius:var(--radius);overflow:hidden">
        ${d.image ? `<img src="${d.image}" alt="${esc(d.title)}" />` : ''}</div>`;
    case 'buttons':
      return `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:16px 20px">
        ${(d.items ?? []).map((b: any) => `<a href="${b.url ?? '#'}"
          style="display:block;text-align:center;padding:16px 10px;border-radius:var(--radius);
          background:var(--primary);color:#fff;text-decoration:none;font-weight:600">${esc(b.label)}</a>`).join('')}
      </div>`;
    case 'categories':
    case 'featured_menu':
    case 'offers':
      return `<section style="padding:8px 20px 16px">
        ${d.title ? `<h3 style="margin:12px 0;color:var(--text)">${esc(d.title)}</h3>` : ''}
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
          ${(d.items ?? []).map((it: any) => `<div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;background:var(--card)">
            ${it.image ? `<img src="${it.image}" alt="${esc(it.title)}" />` : ''}
            <div style="padding:10px"><strong style="display:block;color:var(--text)">${esc(it.title)}</strong>
            ${it.price ? `<span style="color:var(--primary);font-weight:600">${esc(it.price)}</span>` : ''}</div>
          </div>`).join('')}
        </div></section>`;
    case 'gallery':
      return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:16px 20px">
        ${(d.images ?? []).map((src: string) => `<img src="${src}" style="border-radius:8px" />`).join('')}</div>`;
    case 'map':
      return `<div style="padding:16px 20px"><iframe height="220" loading="lazy" style="border-radius:var(--radius)"
        src="https://www.google.com/maps?q=${encodeURIComponent(d.query ?? `${d.latitude},${d.longitude}`)}&output=embed"></iframe></div>`;
    case 'opening_hours':
      return `<section style="padding:16px 20px">
        <h3 style="margin:0 0 10px;color:var(--text)">${esc(d.title ?? 'Opening hours')}</h3>
        ${(d.items ?? []).map((r: any) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span>${esc(r.day)}</span><span style="color:var(--text-secondary)">${esc(r.hours)}</span></div>`).join('')}</section>`;
    case 'contact':
      return `<section style="padding:16px 20px;color:var(--text)">
        ${d.phone ? `<p><a href="tel:${d.phone}">${esc(d.phone)}</a></p>` : ''}
        ${d.email ? `<p><a href="mailto:${d.email}">${esc(d.email)}</a></p>` : ''}
        ${d.address ? `<p style="color:var(--text-secondary)">${esc(d.address)}</p>` : ''}</section>`;
    case 'custom_html':
      return String(d.html ?? '');
    default:
      return d.title
        ? `<section style="padding:16px 20px"><h3 style="color:var(--text);margin:0 0 6px">${esc(d.title)}</h3>
           ${d.text ? `<p style="color:var(--text-secondary);margin:0">${esc(d.text)}</p>` : ''}</section>`
        : '';
  }
}
