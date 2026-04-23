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

    const { docTheme } = readSessionState(true) as SessionState || 'dark';
    // let theme = localStorage.getItem('theme');
    ctx.logger.info(`onDomInit theme=${docTheme}`);
    mermaid.initialize((docTheme === 'dark') ? mermaidConfigDarkTheme : mermaidConfigLightTheme);

    /*
    Source - https://stackoverflow.com/a/79199554
    Posted by grappler
    Retrieved 2026-04-23, License - CC BY-SA 4.0
    */
    const postRenderCB = (id: any) => {

      const containers = document.querySelectorAll<HTMLDivElement>(".mermaid-container");
      if (!containers) return;

      containers.forEach((container: HTMLDivElement) => {
        const svgElement = container.querySelector("svg");
        if (!svgElement) return;

        // Initialize Panzoom
        const panzoom = Panzoom(svgElement, {
          maxScale: 5,
          minScale: 0.5,
          step: 0.1,
        });

        const zoomin = document.querySelector<HTMLButtonElement>('.mermaid-zoomin-button');
        if (zoomin) {
          const handler = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
            panzoom.zoomIn({ animate: true });
          };
          zoomin.addEventListener('click', handler);
          zoomInHandlers.push({ button: zoomin, handler });

        }

        const zoomout = document.querySelector<HTMLButtonElement>('.mermaid-zoomout-button');
        if (zoomout) {
          const handler = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
            panzoom.zoomOut({ animate: true });
          };

          zoomout.addEventListener('click', handler);
          zoomOutHandlers.push({ button: zoomout, handler });
        }

        const reset = document.querySelector<HTMLButtonElement>('.mermaid-reset-button');
        if (reset) {
          const handler = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
            panzoom.reset({ animate: false });
          };

          reset.addEventListener('click', handler);
          resetHandlers.push({ button: reset, handler });
        }

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
