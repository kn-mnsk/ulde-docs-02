
import {
  UldeDomPlugin,
  UldeDomPluginContext,
} from '../../../core/runtime/ulde.types';

/**
 *
*/

let handler!: (event: Event) => void;
let root!: HTMLElement;

export const ScrollEventDomPlugin: UldeDomPlugin = {
  meta: {
    id: 'ulde.scroll-event-dom',
    kind: 'dom',
    displayName: 'Scroll Event Listener',
    description: 'Add Scroll Event',
    version: '1.0.0',
    tags: ['event', 'scroll'],
  },

  onDomRegister(ctx: UldeDomPluginContext) {
    ctx.logger.info(`onDomRegister`);

  },


  onDomInit(ctx: UldeDomPluginContext) {
    root = ctx.rootElement;
    ctx.logger.info(`onDomINit root`, root);

    handler = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      // ctx.logger.info(`onDomINit`);

      const pos = root.scrollTop;
      const height = root.scrollHeight - root.clientHeight;

      // console.log(`[ulde.scroll-event] onDomInit pos=${pos} height=${height}`);
      root.dispatchEvent(new CustomEvent('ulde-scroll', {
        bubbles: true,
        detail: { pos, height }
      }));
    };

    root.addEventListener('scroll', handler);

  },

  onDomUpdate(ctx: UldeDomPluginContext) {
    // Optional: re-render on updates
  },

  onDomDestroy(ctx: UldeDomPluginContext) {
    // Optional: cleanup
    root.removeEventListener('click', handler);
    handler = () => {};
    root.innerHTML = '';
  },

}

