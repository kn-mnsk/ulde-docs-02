import mermaid from 'mermaid';
import { UldePlugin } from '../../registry/plugin-registry';

export const MermaidPlugin: UldePlugin = {
  name: 'mermaid',
  phase: 'interactive',   // render AFTER HTML is in place
  async run(ctx: any) {

    console.log(`Log: Plugin name=${this.name} phase=${this.phase}\n run Before: ctx.html=`, ctx.html);

    // 1. Transform <pre><code class="language-mermaid">...</code></pre> into <div class="mermaid">...</div>
    ctx.html = ctx.html.replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
      (match: any, code: string) => {
        console.log(`Log: MermaidPlugin Replace: code=`, code);

        const decoded = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&');

        return `<div class="mermaid">${decoded.trim()}</div>`;
        // return `<div><pre class="mermaid">${decoded.trim()}</pre></div>`;
      }
    );


    // // 2. Mermaid must run only in the browser
    // if (typeof window === 'undefined') return;

    // console.log(`Log: MermaidPlugin After: ctx.html=`, ctx.html);
    // // 3. Initialize Mermaid (safe to call multiple times)
    // try {
    //   mermaid.initialize({ startOnLoad: false });
    //   await mermaid.run({ querySelector: '.mermaid' });
    //   // await mermaid.run();
    //   console.log(`Log: MermaidPlugin After Mermaid: ctx.html=`, ctx.html);
    // } catch (err) {
    //   console.error('[ULDE Mermaid Plugin] Failed to render diagram:', err);
    // }
  }
};
