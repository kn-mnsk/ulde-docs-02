// src/app/ulde/plugin-system/plugins/heading-anchors/heading-anchors.plugin.ts
/**
Your old version was based on a simple string‑replace transform.
But now ULDE uses:

* UldePlugin
* UldePluginContext
* UldeDocNode
* UldeContentResult

So we need to update the plugin to:

* use the new types
* follow the new lifecycle
* avoid deprecated patterns
* be SSR‑safe
* work with HTML output from markdown-it

And most importantly:

* This plugin must run AFTER the Markdown plugin, so it should operate on HTML.

Below is the correct, fully updated, ULDE‑v2‑compatible heading-anchors.plugin.ts.
 */


import {
  UldePlugin,
  UldePluginContext,
  UldeDocNode,
  UldeContentResult,
} from '../../../core/runtime/ulde.types';

export const HeadingAnchorsPlugin: UldePlugin = {
  meta: {
    id: 'ulde.heading-anchors',
    kind: 'content',
    displayName: 'Heading Anchors',
    description: 'Injects id attributes into <h1>–<h6> headings for deep linking.',
    version: '1.0.0',
    tags: ['anchors', 'headings', 'navigation'],
  },

  onRegister(ctx: UldePluginContext) {
    ctx.logger.info('HeadingAnchors plugin registered');
  },

  async transformContent(
    ctx: UldePluginContext,
    doc: UldeDocNode
  ): Promise<UldeContentResult> {
    // Only operate on HTML output (after markdown plugin)
    if (doc.format !== 'html') {
      return {
        content: doc.rawContent,
        format: doc.format,
        metadata: doc.metadata,
        diagnostics: [],
      };
    }

    try {
      // Regex: <h1>Title</h1> → <h1 id="title">Title</h1>, except for <h1 id="...">Title</h1>
      const contentWithAnchors = doc.rawContent.replace(
        /<h([1-6])\b(?![^>]*\bid\s*=)[^>]*>([^<]+)<\/h\1>/g,
        // /<h([1-6])>([^<]+)<\/h\1>/g,
        (_match, level, text) => {
          const id = text
            .toLowerCase()
            .trim()
            .replace(/[^\w]+/g, '-') // replace non-word chars with hyphens
            .replace(/^-+|-+$/g, ''); // trim hyphens

          const header = `<h${level} id="${id}">${text}</h${level}>`;
          console.log(`Log: heading-anchots.plugin.ts header=`, header);

          return `<h${level} id="${id}">${text}</h${level}>`;
        }
      );

      // console.log(`Log: HeadingAnchorsPlugin \ncontentWithAnchors=\n`, contentWithAnchors);

      return {
        id: doc.id,
        path: doc.path,
        title: doc.title,
        content: contentWithAnchors,
        format: 'html',
        metadata: doc.metadata,
        diagnostics: [],
      };
    } catch (e: any) {
      ctx.logger.error('HeadingAnchors transform failed', e);

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
            message: e?.message ?? 'HeadingAnchors transform failed',
          },
        ],
      };
    }
  },
};
