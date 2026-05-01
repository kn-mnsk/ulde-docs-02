//

import {
  UldeDomPlugin,
  UldeDomPluginContext,
} from '../../../core/runtime/ulde.types';

/**
 * internallinks is a NodeList — not stable after DOM updates
NodeList is live in some browsers and static in others.
ULDE DOM updates may replace the entire subtree.

So:

You may remove listeners from elements that no longer exist

You may fail to remove listeners from replaced nodes
 */
// let internallinks: NodeListOf<HTMLAnchorElement> | null = null;
// let clickHandler: (e: Event) => void;


let handlers: Array<{ link: HTMLAnchorElement, handler: (e: Event) => void }> = [];

export const ResolveLinksDomPlugin: UldeDomPlugin = {
  meta: {
    id: 'ulde.resolve-links-dom',
    kind: 'dom',
    displayName: 'Internal Link Resolver',
    description: 'Supports both legacy (#docId:, #inlineId:) and standard markdown links.',
    version: '1.0.0',
    tags: ['links', 'navigation'],
  },

  onDomRegister(ctx: UldeDomPluginContext) {
    ctx.logger.info(`onDomRegister`);

  },

  onDomInit(ctx: UldeDomPluginContext) {
    ctx.logger.info(`onDomInit`);

    const root = ctx.rootElement;
    if (!root) return;

    requestAnimationFrame(() => {

      requestAnimationFrame(() => {


        const links = root.querySelectorAll<HTMLAnchorElement>('a[href]');
        console.log(`[ULDE] [resolve-links.dom.plugin] onDomInit links=`, links);

        links.forEach(link => {
          const initialHref = link.getAttribute('href');
          if (!initialHref || !initialHref.startsWith('#')) return;

          const handler = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
            // This is fine only if the link never changes.
            // But ULDE DOM plugins may mutate attributes later.
            // here get again to prevent mutation
            const raw = link.getAttribute('href');
            if (!raw) return;

            const [linkId, destId] = raw.split(':');
            // linkId = '#docId' or '#inlineId'
            // destId = 'guide/setup' or '2-key-features'
            ctx.logger.info(`onDomINit linkId=${linkId} destId=${destId}`);
            root.dispatchEvent(new CustomEvent('ulde-link-click', {
              bubbles: true,
              detail: { linkId, destId }
            }));
          };

          // link.addEventListener('ulde-link-click', clickHandler);
          link.addEventListener('click', handler);
          handlers.push({ link, handler });

          console.log(`[ULDE] [resolve-links.dom.plugin] onDomInit link=`, link);
        });

      });
    });
  },

  onDomUpdate(ctx: UldeDomPluginContext) {
    // Optional: re-render on updates
  },

  onDomDestroy(ctx: UldeDomPluginContext) {
    // Optional: cleanup
    handlers.forEach(({ link, handler }) => {
      link.removeEventListener('click', handler);
    });
    handlers = [];
  },

}

