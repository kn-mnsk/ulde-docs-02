import { UldePlugin } from '../../plugin-system/registry/plugin-registry';

export const TimingPlugin: UldePlugin = {
  name: 'timing',
  phase: 'instrumentation',
  run(ctx) {
    console.log(`[ULDE] Rendered ${ctx.path} at ${new Date().toISOString()}`);
  }
};
