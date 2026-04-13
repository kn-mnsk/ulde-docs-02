// src/app/ulde/plugin-system/registry/plugin-registry.ts

import {
  UldePlugin,
  UldePluginId,
  UldePluginContext,
  UldePluginRegistry,
  UldePluginRegistryConfig,
  UldePluginRegistrationOptions,
  UldeRegisteredPlugin,
  UldePipeline,
  UldePipelineConfig,
  UldePipelineStep,
  UldeDocNode,
  UldeContentResult,
  UldeDiagnostic,
  UldeLogger,
} from '../../core/runtime/ulde.types';

/**
 * Simple in-memory logger implementation.
 * You can later route this to your real logging utils.
 */
class ConsoleLogger implements UldeLogger {

  constructor(private readonly pluginId: UldePluginId) { }

  info(message: string, data?: unknown): void {
    console.info(`[ULDE][${this.pluginId}] ${message}`, data ?? '');
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[ULDE][${this.pluginId}] ${message}`, data ?? '');
  }

  error(message: string, data?: unknown): void {
    console.error(`[ULDE][${this.pluginId}] ${message}`, data ?? '');
  }
}

/**
 * Plugin-local state store.
 */
class PluginStateStore {
  private state = new Map<string, unknown>();

  get<T = unknown>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  set<T = unknown>(key: string, value: T): void {
    this.state.set(key, value);
  }
}

/**
 * Registry-scoped capability map.
 * capabilityId -> provider pluginId -> value
 */
type CapabilityMap = Map<string, Map<UldePluginId, unknown>>;

/**
 * Concrete implementation of UldePluginContext.
 */
class DefaultPluginContext implements UldePluginContext {
  private readonly stateStore = new PluginStateStore();
  readonly logger!: UldeLogger;  // avoid  the error caused by readonly logger: UldeLogger = new ConsoleLogger(this.pluginId);

  constructor(
    public readonly pluginId: UldePluginId,
    private readonly globalConfig: Record<string, unknown> | undefined,
    private readonly capabilities: CapabilityMap
  ) {
    this.logger = new ConsoleLogger(this.pluginId);
  }

  // readonly logger: UldeLogger = new ConsoleLogger(this.pluginId);

  getConfig<T = unknown>(key: string): T | undefined {
    return this.globalConfig?.[key] as T | undefined;
  }

  getState<T = unknown>(key: string): T | undefined {
    return this.stateStore.get<T>(key);
  }

  setState<T = unknown>(key: string, value: T): void {
    this.stateStore.set<T>(key, value);
  }

  resolveCapability<T = unknown>(capabilityId: string): T | undefined {
    const providers = this.capabilities.get(capabilityId);
    if (!providers) return undefined;
    // naive: return first provider's value
    const first = Array.from(providers.values())[0];
    return first as T | undefined;
  }
}

/**
 * Concrete pipeline implementation.
 */
class DefaultUldePipeline implements UldePipeline {
  constructor(
    public readonly config: UldePipelineConfig,
    private readonly plugins: Map<UldePluginId, UldeRegisteredPlugin>
  ) { }

  async runContent(doc: UldeDocNode): Promise<UldeContentResult> {
    let currentId: string | undefined = doc.id;
    let currentPath: string | undefined = doc.path;
    let currentTitle: string |undefined = doc.title;
    let currentContent: string = doc.rawContent;
    let currentFormat: UldeDocNode['format'] | 'html' = doc.format;
    let currentMetadata: Record<string, unknown> = { ...doc.metadata };
    const diagnostics: UldeDiagnostic[] = [];

    const contentSteps = this.config.steps
      .filter((s) => s.hook === 'transformContent')
      .sort((a, b) => a.order - b.order);

    for (const step of contentSteps) {
      const reg = this.plugins.get(step.pluginId);
      if (!reg || !reg.plugin.transformContent) continue;

      const ctx = reg.context;
      try {
        const result = await reg.plugin.transformContent(ctx, {
          ...doc,
          rawContent: currentContent,
          format: currentFormat,
          metadata: currentMetadata,
        });

        currentContent = result.content;
        currentFormat = result.format;
        currentMetadata = { ...currentMetadata, ...result.metadata };
        diagnostics.push(...(result.diagnostics ?? []));
      } catch (e: any) {
        diagnostics.push({
          pluginId: step.pluginId,
          level: 'error',
          message: e?.message ?? 'transformContent failed',
        });
        ctx.logger.error('transformContent failed', e);
      }
    }

    return {
      id: currentId,
      path: currentPath,
      title: currentTitle,
      content: currentContent,
      format: currentFormat,
      metadata: currentMetadata,
      diagnostics,
    };
  }

  async runMetadata(doc: UldeDocNode): Promise<Record<string, unknown>> {
    let currentMetadata: Record<string, unknown> = { ...doc.metadata };

    const metadataSteps = this.config.steps
      .filter((s) => s.hook === 'transformMetadata')
      .sort((a, b) => a.order - b.order);

    for (const step of metadataSteps) {
      const reg = this.plugins.get(step.pluginId);
      if (!reg || !reg.plugin.transformMetadata) continue;

      const ctx = reg.context;
      try {
        const result = await reg.plugin.transformMetadata(ctx, {
          ...doc,
          metadata: currentMetadata,
        });
        currentMetadata = { ...currentMetadata, ...result };
      } catch (e: any) {
        ctx.logger.error('transformMetadata failed', e);
      }
    }

    return currentMetadata;
  }
}

/**
 * Concrete registry implementation.
 */
class DefaultUldePluginRegistry implements UldePluginRegistry {
  readonly config: UldePluginRegistryConfig;

  private readonly plugins = new Map<UldePluginId, UldeRegisteredPlugin>();
  private readonly capabilities: CapabilityMap = new Map();

  constructor(config: UldePluginRegistryConfig) {
    this.config = config;
  }

  async register(
    plugin: UldePlugin,
    options?: UldePluginRegistrationOptions
  ): Promise<void> {
    const id = plugin.meta.id;
    if (this.plugins.has(id)) {
      throw new Error(`Plugin already registered: ${id}`);
    }

    const ctx = new DefaultPluginContext(
      id,
      this.config.globalConfig,
      this.capabilities
    );

    const reg: UldeRegisteredPlugin = {
      plugin,
      options: {
        enabled: options?.enabled ?? true,
        order: options?.order ?? 0,
      },
      context: ctx,
      active: false,
    };

    this.plugins.set(id, reg);

    if (plugin.onRegister) {
      await plugin.onRegister(ctx);
    }

    if (plugin.provideCapabilities) {
      const caps = await plugin.provideCapabilities(ctx);
      this.registerCapabilities(id, caps);
    }

    if (reg.options.enabled) {
      await this.activate(id);
    }
  }

  async unregister(pluginId: UldePluginId): Promise<void> {
    const reg = this.plugins.get(pluginId);
    if (!reg) return;

    if (reg.active && reg.plugin.onDeactivate) {
      await reg.plugin.onDeactivate(reg.context);
    }

    if (reg.plugin.onDispose) {
      await reg.plugin.onDispose(reg.context);
    }

    this.removeCapabilities(pluginId);
    this.plugins.delete(pluginId);
  }

  async activate(pluginId: UldePluginId): Promise<void> {
    const reg = this.plugins.get(pluginId);
    if (!reg) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }
    if (reg.active) return;

    if (reg.plugin.onActivate) {
      await reg.plugin.onActivate(reg.context);
    }
    reg.active = true;
  }

  async deactivate(pluginId: UldePluginId): Promise<void> {
    const reg = this.plugins.get(pluginId);
    if (!reg || !reg.active) return;

    if (reg.plugin.onDeactivate) {
      await reg.plugin.onDeactivate(reg.context);
    }
    reg.active = false;
  }

  getPlugin(pluginId: UldePluginId): UldeRegisteredPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  listPlugins(): UldeRegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  buildPipeline(): UldePipeline {
    const steps: UldePipelineStep[] = [];

    for (const [id, reg] of this.plugins.entries()) {
      if (!reg.active) continue;

      const order = reg.options.order ?? 0;

      if (reg.plugin.transformContent) {
        steps.push({
          pluginId: id,
          hook: 'transformContent',
          order,
        });
      }

      if (reg.plugin.transformMetadata) {
        steps.push({
          pluginId: id,
          hook: 'transformMetadata',
          order,
        });
      }
    }

    const config: UldePipelineConfig = { steps };
    return new DefaultUldePipeline(config, this.plugins);
  }

  async dispose(): Promise<void> {
    for (const [id, reg] of this.plugins.entries()) {
      if (reg.active && reg.plugin.onDeactivate) {
        await reg.plugin.onDeactivate(reg.context);
      }
      if (reg.plugin.onDispose) {
        await reg.plugin.onDispose(reg.context);
      }
      this.removeCapabilities(id);
    }
    this.plugins.clear();
  }

  // ---- internal: capabilities ----

  private registerCapabilities(
    pluginId: UldePluginId,
    caps: { provides?: string[]; consumes?: string[] }
  ): void {
    if (!caps.provides) return;

    for (const capId of caps.provides) {
      let providers = this.capabilities.get(capId);
      if (!providers) {
        providers = new Map<UldePluginId, unknown>();
        this.capabilities.set(capId, providers);
      }
      // For now, we just store a boolean "true" as the value.
      // Later you can store actual capability objects.
      providers.set(pluginId, true);
    }
  }

  private removeCapabilities(pluginId: UldePluginId): void {
    for (const [capId, providers] of this.capabilities.entries()) {
      if (providers.has(pluginId)) {
        providers.delete(pluginId);
      }
      if (providers.size === 0) {
        this.capabilities.delete(capId);
      }
    }
  }
}

/**
 * Factory function used by Angular integration (UldeService).
 */
export function createUldePluginRegistry(
  config: UldePluginRegistryConfig
): UldePluginRegistry {
  return new DefaultUldePluginRegistry(config);
}
