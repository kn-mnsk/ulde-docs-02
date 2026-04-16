import {
  UldeContentPlugin,
  UldeDomPlugin,
  UldePluginBundle,
  UldeDomPluginContext
} from '../../../core/runtime/ulde.types';

/* ---------------------------------------------------------
 *  CONTENT PHASE
 *  Rewrites Markdown links into ULDE internal link format:
 *    [Guide](guide/setup.md)   → href="#docId:guide/setup"
 *    [Section](#intro)         → href="#inlineId:intro"
 *    External links untouched
 * --------------------------------------------------------- */
const ResolveLinksContentPlugin: UldeContentPlugin = {
  id: 'resolve-links-content',

  transform(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const anchors = doc.querySelectorAll<HTMLAnchorElement>('a[href]');

    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;

      // 1. External links → untouched
      if (/^(https?:)?\/\//.test(href)) return;

      // 2. Markdown doc links: "something.md"
      if (href.endsWith('.md')) {
        const docId = href.replace(/\.md$/, '');
        a.setAttribute('href', `#docId:${docId}`);
        return;
      }

      // 3. Inline section links: "#section-id"
      if (href.startsWith('#')) {
        const sectionId = href.slice(1);
        a.setAttribute('href', `#inlineId:${sectionId}`);
        return;
      }

      // 4. Already in ULDE format → leave untouched
      if (href.startsWith('#docId:') || href.startsWith('#inlineId:')) {
        return;
      }
    });

    return doc.body.innerHTML;
  }
};


/* ---------------------------------------------------------
 *  DOM PHASE
 *  Intercepts clicks on internal links:
 *    href="#docId:guide/setup"
 *    href="#inlineId:intro"
 *
 *  Emits:
 *    CustomEvent('ulde-link-click', { detail: { linkId, destId } })
 *
 *  DocsViewer listens and performs navigation.
 * --------------------------------------------------------- */
const ResolveLinksDomPlugin: UldeDomPlugin = {
  meta: {
    id: 'ulde.resolve-links-dom',
    kind: 'dom',
    displayName: 'Internal Link Resolver',
    description: 'Supports both legacy (#docId:, #inlineId:) and standard markdown links.',
    version: '1.0.0',
    tags: ['links', 'navigation'],
  },

  onDomInit(ctx: UldeDomPluginContext) {
    const root = ctx.rootElement;

    const anchors = root.querySelectorAll<HTMLAnchorElement>('a[href]');

    anchors.forEach(a => {
      const raw = a.getAttribute('href');
      if (!raw || !raw.startsWith('#')) return;

      a.addEventListener('click', (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        // Pattern: "#docId:guide/setup" → ['#docId', 'guide/setup']
        // Pattern: "#inlineId:intro"    → ['#inlineId', 'intro']
        const [linkId, destId] = raw.split(':');

        root.dispatchEvent(new CustomEvent('ulde-link-click', {
          bubbles: true,
          detail: { linkId, destId }
        }));
      });
    });
  }
};


/* ---------------------------------------------------------
 *  BUNDLE EXPORT
 * --------------------------------------------------------- */
export const ResolveLinksPlugin: UldePluginBundle = {
  id: 'resolve-links',
  content: ResolveLinksContentPlugin,
  dom: ResolveLinksDomPlugin
};
