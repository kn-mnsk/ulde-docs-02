import {
  UldeDomPlugin,
  UldeDomPluginContext,
} from '../../../core/runtime/ulde.types';

// import mermaid from 'mermaid';

function onClick(e: Event, root: HTMLElement): void {

    e.preventDefault();
    e.stopPropagation();

    const anchor = e.currentTarget as HTMLAnchorElement;
    const href = (anchor.getAttribute('href'))?.split(':').flat() ?? null;

    if (!href) {
      console.warn(`Warn ${this.$title()} : On Click  Failed  Reference Not Found`);
      navigate(this.router, ['/fallback']);
      return;
    }
    const target = href; // remove leading '#'
    // const target = href.slice(1); // remove leading '#'

    // Pattern: docId or docId#inlineId
    const [linkId, destId] = target;
    // const [docId, inlineId] = target.split('#');

    // 1. Navigate to new doc
    if (linkId === "#docId") {
      if (destId && destId !== this.$docId()) {
        // if (docId && docId !== this.$docId()) {
        this.$docId.set(destId);
        // this.$docId.set(docId);
        this.$reload.update(n => n + 1);; // optional depending on your model
        return;
      }
    }

    // 2. Inline navigation within same doc
    if (linkId === "#inlineId") {
      // if (inlineId) {
      anchor.parentElement
      const el = root.querySelector<HTMLElement>(`#${destId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // highlight
        el.classList.add('inline-highlight');
        setTimeout(() => el.classList.remove('inline-highlight'), 1200);

        // make editable if needed
        if (!el.hasAttribute('contenteditable')) {
          el.setAttribute('contenteditable', 'true');
        }
      }
    }

// declare function clickHandler(): (e: Event) => void;// = {};

export const  ResolveLinksPlugin: UldeDomPlugin = {
  meta: {
    id: 'ulde.resolve-links',
    kind: 'dom',
    displayName: 'Internal Link Resolver',
    description: 'Supports both legacy (#docId:, #inlineId:) and standard markdown links.',
    version: '1.0.0',
    tags: ['links', 'navigation'],
  },

  onDomRegister(ctx: UldeDomPluginContext) {
    ctx.logger.info(`onDomRegister, `);
  },

  async onDomInit(ctx: UldeDomPluginContext) {
    ctx.logger.info(`onDomInit ${this.meta.description} `);

    const links = .querySelectorAll<HTMLAnchorElement>('a[href]');

    const clickHandler = (e: Event) => this.onClick(e, root);
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      // link.addEventListener('click', this.clickHandler.arguments(root));
      link.addEventListener('click', clickHandler);
    });
  }

  },

  async onDomUpdate(ctx: UldeDomPluginContext) {
    // Optional: re-render on updates

    // ctx.logger.info(`onDomUpdate ${this.meta.description}`);
    // // mermaid.initialize({ startOnLoad: false });

    // mermaid.run({ querySelector: '.language-mermaid' });
  },

  async onDomDestroy(ctx: UldeDomPluginContext) {
    // Optional: cleanup
  },
};
