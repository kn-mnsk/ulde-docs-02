export const PluginPhases = [
  'content',
  'post-content',
  'layout',
  'interactive',
  'instrumentation'
] as const;

export type PluginPhase = (typeof PluginPhases)[number];
