import {
  UldeDomPlugin,
  UldeDomPluginContext,
} from '../../../core/runtime/ulde.types';

import renderMathInElement from "katex/contrib/auto-render";
// import 'katex/dist/katex.min.css';
export const KatexDomPlugin: UldeDomPlugin = {
  meta: {
    id: 'ulde.katex',
    kind: 'dom',
    displayName: 'KaTex Renderer',
    description: 'Renders inline and block math using KaTeX.',
    version: '1.0.0',
    tags: ['math', 'katex'],
  },

  onDomRegister(ctx: UldeDomPluginContext) {
    ctx.logger.info(`onDomRegister, `);
  },

  async onDomInit(ctx: UldeDomPluginContext) {
    // ctx.logger.info(`onDomInit`);
    const root = ctx.rootElement;
    renderMathInElement(root, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\begin{equation}", right: "\\end{equation}", display: true },
        { left: "\\begin{align}", right: "\\end{align}", display: true },
        { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
        { left: "\\begin{gather}", right: "\\end{gather}", display: true },
        { left: "\\begin{CD}", right: "\\end{CD}", display: true },
        { left: "\\[", right: "\\]", display: true }
      ],
      errorCallback: (err) => {
        console.error('Error Katex.plugin renderMathInElement', JSON.stringify(`${err}`));
      },
      throwOnError: true,
      errorColor: "#ff0000",
      output: "htmlAndMathml",
      minRuleThickness: 0.05,
      strict: true,

    });
  },

  async onDomUpdate(ctx: UldeDomPluginContext) {
    // Optional: re-render on updates
  },

  async onDomDestroy(ctx: UldeDomPluginContext) {
    // Optional: cleanup
  },

}
