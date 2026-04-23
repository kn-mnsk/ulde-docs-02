import {
  UldePluginId,
  UldeDomPlugin,
  UldeDomPluginContext,
} from '../../../core/runtime/ulde.types';

import { SessionState } from '../../../../pages/docs/docs-meta';
import { readSessionState } from '../../../../docs-viewer/session-state.manage';

export const ThemeDomPlugin: UldeDomPlugin = {
  meta: {
    id: 'ulde.theme',
    kind: 'dom',
    displayName: 'Theme Setting',
    description: 'Set Document Theme',
    version: '1.0.0',
    tags: ['theme', 'dark', 'light'],
  },

  onDomRegister(ctx: UldeDomPluginContext) {
    ctx.logger.info(`onDomRegister, `);
  },

  async onDomInit(ctx: UldeDomPluginContext) {
    // ctx.logger.info(`onDomInit`);

    const { docTheme } = readSessionState(true) as SessionState;
    document.documentElement.setAttribute('data-theme', docTheme);

    ctx.logger.info(`onDomInit theme=${docTheme}`);

  },

  async onDomUpdate(ctx: UldeDomPluginContext) {
    // Optional: re-render on updates
  },

  async onDomDestroy(ctx: UldeDomPluginContext) {
    // Optional: cleanup
  },
};
