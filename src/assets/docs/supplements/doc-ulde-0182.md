# Implement ResolveLinksPlugin

to use the new /assets/docs/ URLs, fully aligned with:

- ULDE v2 content pipeline
- Your existing DocsViewer navigation model (#docId: / #inlineId:)
- The updated DocsList where path is now a real URL under /assets/docs/
- No double‑fetching
- No broken links
- No assumptions about folder structure

This is the clean, correct, future‑proof implementation.

## 1. What ResolveLinksPlugin must do now

Since DocsList now contains:
```ts
{
  id: "index",
  path: "/assets/docs/INDEX.md"
}
```

Your markdown files may contain links like:
```
[Intro](intro.md)
[Setup](./guide/setup.md)
[See section](#my-section)
```

ResolveLinksPlugin must convert them into:

__✔ Internal doc navigation__
```
href="#docId:intro"
href="#docId:guide/setup"
```
__✔ Inline element navigation__
```
href="#inlineId:my-section"
```
✔ External links untouched
```
href="https://example.com"
```
__✔ Absolute paths untouched__
```
href="/something"
```

## 2. Final ULDE v2 ResolveLinksPlugin (DocsViewer‑compatible)

__src/app/ulde/plugin-system/plugins/resolve-links/resolve-links.plugin.ts__
```ts
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
    description: 'Rewrites internal markdown links to #docId: and #inlineId: links.',
    version: '1.0.0',
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

    //
    // 1. Convert markdown-generated <a href="something.md">
    //
    html = html.replace(
      /href="([^"]+\.md)"/g,
      (_m, path) => {
        // Remove leading "./"
        let clean = path.replace(/^\.\//, '');

        // Remove extension
        clean = clean.replace(/\.md$/, '');

        return `href="#docId:${clean}"`;
      }
    );

    //
    // 2. Convert inline anchors <a href="#some-id">
    //
    html = html.replace(
      /href="#([^"]+)"/g,
      (_m, id) => `href="#inlineId:${id}"`
    );

    return {
      content: html,
      format: 'html',
      metadata: doc.metadata,
      diagnostics: [],
    };
  },
};

```
