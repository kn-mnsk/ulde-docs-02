import {
  UldePlugin,
  UldePluginContext,
  UldeDocNode,
  UldeContentResult,
} from '../../../core/runtime/ulde.types';

import katex from 'katex';
// import 'katex/dist/katex.min.css';

export const KaTeXPlugin: UldePlugin = {
  meta: {
    id: 'ulde.katex',
    kind: 'content',
    displayName: 'KaTeX Renderer',
    description: 'Renders inline and block math using KaTeX.',
    version: '1.0.0',
    tags: ['math', 'katex'],
  },

  onRegister(ctx: UldePluginContext) {
    ctx.logger.info('KaTeX plugin registered');
  },

  async transformContent(
    ctx: UldePluginContext,
    doc: UldeDocNode
  ): Promise<UldeContentResult> {
    if (doc.format !== 'html') {
      return {
        content: doc.rawContent,
        format: doc.format,
        metadata: doc.metadata,
        diagnostics: [],
      };
    }

    let html = doc.rawContent;

    // Block math: $$ ... $$
    html = html.replace(/\$\$([^$]+)\$\$/g, (_m, expr) => {
      try {
        return katex.renderToString(expr, { displayMode: true });
      } catch (e) {
        ctx.logger.error('KaTeX block render failed', e);
        return _m;
      }
    });

    // Inline math: $ ... $
    html = html.replace(/\$([^$]+)\$/g, (_m, expr) => {
      try {
        return katex.renderToString(expr, { displayMode: false });
      } catch (e) {
        ctx.logger.error('KaTeX inline render failed', e);
        return _m;
      }
    });

    return {
      content: html,
      format: 'html',
      metadata: doc.metadata,
      diagnostics: [],
    };
  },
};
