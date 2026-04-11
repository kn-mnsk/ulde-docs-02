import {
  UldePlugin,
  UldePluginContext,
  UldeDocNode,
  UldeContentResult,
} from '../../../core/runtime/ulde.types';

export const ResolveLinksPlugin: UldePlugin = {
  meta: {
    id: 'ulde.resolve-links',
    kind: 'content',
    displayName: 'Internal Link Resolver',
    description: 'Supports both legacy (#docId:, #inlineId:) and standard markdown links.',
    version: '1.1.0',
    tags: ['links', 'navigation'],
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

    html = html.replace(/href="([^"]+)"/g, (_m, href) => {
      // -------------------------------------------------------
      // 1. Already-correct internal doc link → leave untouched
      // -------------------------------------------------------
      if (href.startsWith('#docId:')) {
        return `href="${href}"`;
      }

      // -------------------------------------------------------
      // 2. Already-correct inline link → leave untouched
      // -------------------------------------------------------
      if (href.startsWith('#inlineId:')) {
        return `href="${href}"`;
      }

      // -------------------------------------------------------
      // 3. Markdown file link → convert to docId
      // -------------------------------------------------------
      if (href.endsWith('.md')) {
        let clean = href.replace(/^\.\//, '').replace(/\.md$/, '');
        return `href="#docId:${clean}"`;
      }

      // -------------------------------------------------------
      // 4. Inline section link → convert to inlineId
      // -------------------------------------------------------
      if (href.startsWith('#')) {
        const id = href.substring(1);
        return `href="#inlineId:${id}"`;
      }

      // -------------------------------------------------------
      // 5. External links → leave untouched
      // -------------------------------------------------------
      return `href="${href}"`;
    });

    return {
      content: html,
      format: 'html',
      metadata: doc.metadata,
      diagnostics: [],
    };
  },
};
