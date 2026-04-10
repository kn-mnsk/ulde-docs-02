// src/app/ulde/utils/timing/timing.plugin.ts

/**
This plugin will:

* run during the content phase
* log timing information
* return the content unchanged

follow the ULDE v2 plugin contract exactly
 */

import {
  UldePlugin,
  UldePluginContext,
  UldeDocNode,
  UldeContentResult,
} from '../../core/runtime/ulde.types';

export const TimingPlugin: UldePlugin = {
  meta: {
    id: 'ulde.timing',
    kind: 'utility',
    displayName: 'Timing Plugin',
    description: 'Logs render timing for each document.',
    version: '1.0.0',
    tags: ['timing', 'performance'],
  },

  onRegister(ctx: UldePluginContext) {
    ctx.logger.info('Timing plugin registered');
  },

  async transformContent(
    ctx: UldePluginContext,
    doc: UldeDocNode
  ): Promise<UldeContentResult> {
    const start = performance.now();

    // Pass-through: do not modify content
    const result: UldeContentResult = {
      content: doc.rawContent,
      format: doc.format,
      metadata: doc.metadata,
      diagnostics: [],
    };

    const end = performance.now();

    ctx.logger.info(
      `Rendered ${doc.path} in ${(end - start).toFixed(2)}ms`
    );

    return result;
  },
};
