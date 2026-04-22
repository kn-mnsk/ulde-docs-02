import {
  UldePluginId,
  UldeDomPlugin,
  UldeDomPluginContext,
} from '../../../core/runtime/ulde.types';

import mermaid from 'mermaid';
import { mermaidConfigDefault, mermaidConfigDarkTheme, mermaidConfigLightTheme } from '../../../../pages/docs/docs-meta';

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
    // ctx.logger.info(`onDomInit`);


    let theme = localStorage.getItem('theme');
    ctx.logger.info(`onDomInit theme=${theme}`);
    if (!theme) {
      theme = 'dark';
    }
    // const thema = option?.data;
    // mermaid.initialize(mermaidConfigDefault);
    mermaid.initialize((theme === 'dark') ? mermaidConfigDarkTheme : mermaidConfigLightTheme);

    mermaid.run({ querySelector: '.language-mermaid' });
  },

  async onDomUpdate(ctx: UldeDomPluginContext) {
    // Optional: re-render on updates
  },

  async onDomDestroy(ctx: UldeDomPluginContext) {
    // Optional: cleanup
  },
};
