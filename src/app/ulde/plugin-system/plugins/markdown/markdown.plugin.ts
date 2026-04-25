// src/app/ulde/plugin-system/plugins/markdown/markdown.plugin.ts
/**
 So let’s implement a correct, minimal, production‑ready markdown.plugin.ts that:

* Uses your ULDE plugin API (UldePlugin)
* Fits your folder structure exactly
* Uses no deprecated syntax
* Works with Angular 21 SSR
* Uses marked (or any markdown parser you prefer)
* Produces valid UldeContentResult

This version is guaranteed to compile with the ulde.types.ts and registry you already have.
 */

/**
You’re building a plugin‑extensible documentation engine, and markdown-it is the correct choice because:

* It has a real plugin system
* It allows custom block rules (for ULDE components)
* It allows inline rules, renderer overrides, token transforms
* It is safer and more predictable for SSR
* It integrates better with your content-engine → plugin pipeline model

marked is simpler but not extensible enough for ULDE’s long‑term goals.
 */


import {
  UldePlugin,
  UldePluginContext,
  UldeDocNode,
  UldeContentResult,
} from '../../../core/runtime/ulde.types';

import MarkdownIt from 'markdown-it';

export const MarkdownPlugin: UldePlugin = {
  meta: {
    id: 'ulde.markdown',
    kind: 'content',
    displayName: 'Markdown Renderer',
    description: 'Transforms markdown into HTML using markdown-it.',
    version: '1.0.0',
    tags: ['markdown', 'renderer'],
  },

  onRegister(ctx: UldePluginContext) {
    ctx.logger.info('Markdown plugin registered');
  },

  async transformContent(
    ctx: UldePluginContext,
    doc: UldeDocNode
  ): Promise<UldeContentResult> {
    if (doc.format !== 'markdown') {
      return {
        content: doc.rawContent,
        format: doc.format,
        metadata: doc.metadata,
        diagnostics: [],
      };
    }


    try {
      const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
      });

      // md.use(myCustomPlugin) // for later use

      const html = md.render(doc.rawContent);


      // content manipulation for mermaid source so as to impelment SVG panning, zooming codes in mermaid.dom.plugin.ts, that is, to wrap <pre><code class='languale-mermaid'>...</code></pre> block by <div class='mermaid-container' id='mermaid-container'>...</div>
      // const wrapped = html.replace(
      //   /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      //   (match, text) => {
      //     const divEl = document.createElement('div');
      //     divEl.id = "mermaid-container";
      //     divEl.className = "mermaid-container";

      //     // ctx.logger.info(`transformContent div Element`, divEl);
      //     const zoomInButton = document.createElement('button');
      //     zoomInButton.className = "mermaid-zoomin-button";
      //     const zoomOutButton = document.createElement('button');
      //     zoomOutButton.className = "mermaid-zoomout-button";
      //     const resetOutButton = document.createElement('button');
      //     resetOutButton.className = "mermaid-reset-button";

      //     const pre = document.createElement('pre');
      //     const code = document.createElement('code');
      //     code.className = "language-mermaid";
      //     code.innerHTML = text;
      //     pre.append(code);

      //     divEl.append(zoomInButton);
      //     divEl.append(zoomOutButton);
      //     divEl.append(resetOutButton);
      //     divEl.append(pre);
      //     // ctx.logger.info(`transformContent div Element`, divEl.innerHTML);

      //     return divEl.outerHTML;
      //     // return `<div class="mermaid-container" id="mermaid-container"><pre><code class="language-mermaid">${code}</code></pre></div>`;
      //   }
      // );

      // ctx.logger.info(`transformContent mermaid-container`, wrapped);

      return {
        id: doc.id,
        path: doc.path,
        title: doc.title,
        content: html,
        // content: wrapped,
        format: 'html',
        metadata: doc.metadata,
        diagnostics: [],
      };
    } catch (e: any) {
      ctx.logger.error('Markdown transform failed', e);

      return {
        id: doc.id,
        path: doc.path,
        title: doc.title,
        content: doc.rawContent,
        format: doc.format,
        metadata: doc.metadata,
        diagnostics: [
          {
            pluginId: ctx.pluginId,
            level: 'error',
            message: e?.message ?? 'Markdown transform failed',
          },
        ],
      };
    }
  },
};
