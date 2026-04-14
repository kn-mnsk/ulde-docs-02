import {
  UldePlugin,
  UldePluginContext,
  UldeDocNode,
  UldeContentResult,
} from '../../../core/runtime/ulde.types';

import katex from 'katex';
import renderMathInElement from "katex/contrib/auto-render";
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

    let html: string = doc.rawContent;

    const container = document.createElement('div');
    container.innerHTML = html;
    renderMathInElement(container, {
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

    html = container.outerHTML;

    // console.log(`Log: katex.plugin.ts transmerfomative: container`, container, `\n html=`, html);

    // Regex: strip surrounding <div>content</div>
    const htmlWithoutDiv = html.replace(
      /<div>([^<]+)<\/div>/g,
      (_match, text) => {
        return text;
      }
    );

    // console.log(`Log: katex.plugin.ts transmerfomative: \n final html=`, htmlWithoutDiv);


    return {
      id: doc.id,
      path: doc.path,
      title: doc.title,
      content: htmlWithoutDiv,
      format: 'html',
      metadata: doc.metadata,
      diagnostics: [],
    };
  },
};
