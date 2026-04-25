import {
  UldePluginId,
  UldeDomPlugin,
  UldeDomPluginContext,
} from '../../../core/runtime/ulde.types';

import mermaid from 'mermaid';
import Panzoom from '@panzoom/panzoom'
import { mermaidConfigDefault, mermaidConfigDarkTheme, mermaidConfigLightTheme, SessionState } from '../../../../pages/docs/docs-meta';
import { readSessionState } from '../../../../docs-viewer/session-state.manage';

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
    // const mermaidNodes = ctx.rootElement.querySelectorAll<HTMLElement>('.language-mermaid');
    // ctx.logger.info(`onDomInit NodeListOf<HTMLElement>`, mermaidNodes);

    // A callback to call after each diagram is rendered.
    const postRenderCB = (id: any) => {

      // mermaid code block <pre><code class="language-container">...</code></pre> by mardown-it
      const mermaidNodes = ctx.rootElement.querySelectorAll<HTMLElement>('.language-mermaid');
      console.log(`onDomInit NodeListOf<HTMLElement>`, mermaidNodes);

      mermaidNodes.forEach((currentNode, index) => {
        console.log(`onDomInit NodeListOf<HTMLElement>`, index, id);

        // if (id === index) {
        // ctx.logger.info(`onDomInit mermaid node`, currentNode);
        const Id = `#mermaid-${id}`;
        const svg = currentNode.querySelector(Id);
          console.log(`onDomInit NodeListOf<HTMLElement>`, `#mermaid-${id}`, svg, currentNode);
        if (!svg) return;

        // Initialize Panzoom
        const panzoom = Panzoom(svg as SVGElement, {
          maxScale: 5,
          minScale: 0.5,
          step: 0.1,
        });

        const mermaidContainer = document.createElement('div');
        mermaidContainer.className = "mermaid-container";
        const buttonContainer = document.createElement('div');
        buttonContainer.className = "mermaid-button-container";
        // zooin
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
        mermaidContainer.appendChild(buttonContainer);

        // currentNode.insertBefore(buttonContainer, currentNode)
        const preNode = currentNode.parentNode;
        //     if (!preNode) return;
        preNode?.insertBefore(mermaidContainer, currentNode);

        // // console.log(`[onDomInit] new Node before replace`, preNode.be);
        mermaidContainer.appendChild(currentNode);
        // preNode.insertBefore(mermaidContainer, currentNode);
        // mermaidContainer.appendChild(currentNode);


        // mermaidContainer.appendChild(buttonContainer);


        // currentNode.replaceChild(newNode, currentNode);
        // currentNode.insertAdjacentElement('beforebegin', newNode);

        ctx.logger.info(`onDomInit newNode  after replace index=${index}`, mermaidContainer);
        // ctx.logger.info(`transformContent div Element`, divEl.innerHTML);
        // }
      });

    }

    await mermaid.run({
      querySelector: '.language-mermaid',
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
