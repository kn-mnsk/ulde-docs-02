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

    console.log(`Log: [mermaid.plugin] onDomInit \nctx.rootElement=`, ctx.rootElement);

    // const blocks = ctx.rootElement.getElementsByClassName('language-mermaid pre');
    const blocks = document.querySelectorAll('code.language-mermaid');
    // const blocks = ctx.rootElement.querySelectorAll('code.language-mermaid');

    console.log(`Log: [mermaid.plugin] onDomInit \nblocks=`, blocks);

    blocks?.forEach((codeEl, index) => {

      const parent = codeEl.parentElement!;
      const graph = codeEl.textContent ?? '';

      const id = `mermaid-${ctx.pluginId}-${index}`;

      const container = document.createElement('div');
      container.classList.add('mermaid');
      container.id = id;
      container.textContent = graph;

      parent.replaceWith(container);

      console.log(`Log: [mermaid.plugin] onDomInit \ncontainer=`, container);


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
