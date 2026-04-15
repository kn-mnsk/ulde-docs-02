import {
  UldeDomPlugin,
  UldeDomPluginContext,
} from '../../../core/runtime/ulde.types';

import mermaid from 'mermaid';

export const MermaidPlugin: UldeDomPlugin = {
  meta: {
    id: 'ulde.mermaid',
    kind: 'dom',
    displayName: 'Mermaid Renderer',
    description: 'Renders Mermaid diagrams inside <pre><code class="language-mermaid"> blocks.',
    version: '1.0.0',
    tags: ['mermaid', 'diagrams'],
  },

  onDomRegister(ctx: UldeDomPluginContext) {
    ctx.logger.info(`onDomRegister, `);
  },

  async onDomInit(ctx: UldeDomPluginContext) {
    ctx.logger.info(`onDomInit ${this.meta.description} `);

    mermaid.initialize({ startOnLoad: true });

    mermaid.run({ querySelector: '.language-mermaid' });
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
