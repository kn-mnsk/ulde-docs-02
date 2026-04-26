import {
  UldePluginId,
  UldeDomPlugin,
  UldeDomPluginContext,
} from '../../../core/runtime/ulde.types';

import mermaid from 'mermaid';
import Panzoom from '@panzoom/panzoom'
import { mermaidConfigDefault, mermaidConfigDarkTheme, mermaidConfigLightTheme, SessionState } from '../../../../pages/docs/docs-meta';
import { readSessionState } from '../../../../docs-viewer/session-state.manage';
import { merge } from 'rxjs';

let handler!: (event: WheelEvent) => void;
let container!: HTMLElement;
let zoomInHandlers: Array<{ button: HTMLButtonElement, handler: (e: Event) => void }> = [];
let zoomOutHandlers: Array<{ button: HTMLButtonElement, handler: (e: Event) => void }> = [];
let resetHandlers: Array<{ button: HTMLButtonElement, handler: (e: Event) => void }> = [];
export const MermaidDomPlugin: UldeDomPlugin = {
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

    const root = ctx.rootElement;


    // mermaid initializing in sync with docTeme;
    const { docTheme } = readSessionState(true) as SessionState || 'dark';
    ctx.logger.info(`onDomInit theme=${docTheme}`);
    mermaid.initialize((docTheme === 'dark') ? mermaidConfigDarkTheme : mermaidConfigLightTheme);

    /*
    Source - https://stackoverflow.com/a/79199554
    Posted by grappler
    Retrieved 2026-04-23, License - CC BY-SA 4.0
    */

    // mermaid code block <pre><code class="language-container">...</code></pre> by mardown-it
    const mermaidNodes = root.querySelectorAll<HTMLElement>('.language-mermaid');
    // ctx.logger.info(`onDomInit NodeListOf<HTMLElement>`, mermaidNodes);

    // A callback to call after each diagram is rendered.
    const postRenderCB = (svgId: any) => {
      const selectorId = "#" + svgId;
      const svg = root.querySelector(selectorId) as SVGElement;

      // console.log(`onDomInit svg id=${svgId}`, svg);
      if (!svg) return;
      // Initialize Panzoom
      const panzoom = Panzoom(svg as SVGElement, {
        maxScale: 5,
        minScale: 0.5,
        step: 0.1,
      });

      // codeNode: <code class="language-mermaid">...</code>
      const codeNode = svg.parentNode;
      const pre = codeNode?.parentElement;
      if (!pre) return;
      pre.className = "mermaid-container";
      // console.log(`code parent`, pre);

      const mermaidContainer = document.createElement('div');
      mermaidContainer.className = "mermaid-container";
      const buttonContainer = document.createElement('div');
      buttonContainer.className = "mermaid-button-container";
      // zoomin
      const zoomIn = document.createElement('button');
      zoomIn.className = "mermaid-zoomin-button";
      zoomIn.innerText = "+";
      const handlerIn = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        panzoom.zoomIn({ animate: true });
      };
      zoomIn.addEventListener('click', handlerIn);
      zoomInHandlers.push({ button: zoomIn, handler: handlerIn });
      // zoomout
      const zoomOut = document.createElement('button');
      zoomOut.className = "mermaid-zoomout-button";
      zoomOut.innerText = "-";
      const handlerOut = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        panzoom.zoomOut({ animate: true });
      };
      zoomOut.addEventListener('click', handlerOut);
      zoomOutHandlers.push({ button: zoomOut, handler: handlerOut });
      // rset
      const reset = document.createElement('button');
      reset.className = "mermaid-reset-button";
      reset.innerText = "reset";
      const handlerReset = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        panzoom.reset({ animate: false });
      };
      reset.addEventListener('click', handlerReset);
      resetHandlers.push({ button: reset, handler: handlerReset });

      buttonContainer.appendChild(zoomIn);
      buttonContainer.appendChild(zoomOut);
      buttonContainer.appendChild(reset);

      pre?.insertBefore(buttonContainer, codeNode);

    }


    await mermaid.run({
      nodes: mermaidNodes,
      postRenderCallback: postRenderCB,
    });

  },

  async onDomUpdate(ctx: UldeDomPluginContext) {
    // Optional: re-render on updates
  },

  async onDomDestroy(ctx: UldeDomPluginContext) {
    // Optional: cleanup
    zoomInHandlers.forEach(({ button, handler }) => {
      button.removeEventListener('click', handler);
    });
    zoomInHandlers = [];

    zoomOutHandlers.forEach(({ button, handler }) => {
      button.removeEventListener('click', handler);
    });
    zoomOutHandlers = [];

    resetHandlers.forEach(({ button, handler }) => {
      button.removeEventListener('click', handler);
    });
    resetHandlers = [];

  },
};
