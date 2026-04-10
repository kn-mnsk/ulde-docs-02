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

  async onDomInit(ctx: UldeDomPluginContext) {
    mermaid.initialize({ startOnLoad: false });

    const blocks = ctx.rootElement.querySelectorAll(
      'pre code.language-mermaid'
    );

    blocks.forEach((codeEl, index) => {
      const parent = codeEl.parentElement!;
      const graph = codeEl.textContent ?? '';

      const id = `mermaid-${ctx.pluginId}-${index}`;

      const container = document.createElement('div');
      container.classList.add('mermaid');
      container.id = id;
      container.textContent = graph;

      parent.replaceWith(container);

      mermaid.run({ nodes: [container] });
    });
  },

  async onDomUpdate(ctx: UldeDomPluginContext) {
    // Optional: re-render on updates
  },

  async onDomDestroy(ctx: UldeDomPluginContext) {
    // Optional: cleanup
  },
};
