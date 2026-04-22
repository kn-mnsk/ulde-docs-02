// src/app/ulde/core/runtime/ulde.types.ts

// ---------------------------------------------
// ULDE Core Identifiers
// ---------------------------------------------

export type UldePluginId = string; // e.g. "ulde.markdown"
export type UldePluginKind =
  | 'content'
  | 'metadata'
  | 'pipeline'
  | 'utility'
  | 'dom';

// ---------------------------------------------
// Diagnostics
// ---------------------------------------------

export type UldeDiagnosticLevel = 'info' | 'warning' | 'error';

export interface UldeDiagnostic {
  pluginId: UldePluginId;
  level: UldeDiagnosticLevel;
  message: string;
  code?: string;
  location?: {
    line?: number;
    column?: number;
    path?: string;
  };
}

// ---------------------------------------------
// Document Model
// ---------------------------------------------

export interface UldeDocNode {
  id: string;               // logical id or route
  path: string;             // "/guide/intro"
  title?: string;
  rawContent: string;       // original source (markdown, html, etc.)
  format: 'markdown' | 'html' | 'mdx' | 'custom';
  metadata: Record<string, unknown>;
}

export interface UldeContentSource {
  id: string;
  path: string; // e.g. "/getting-started"
  title?: string;
  format: UldeDocNode['format'];
  rawContent: string;
  metadata?: Record<string, unknown>;
}

export interface UldeContentResult {
  id?: string;
  path?: string;
  title?: string;
  content: string;          // transformed content (usually HTML)
  format: UldeDocNode['format'] | 'html';
  metadata: Record<string, unknown>;
  diagnostics: UldeDiagnostic[];
}


// ---------------------------------------------
// Logging
// ---------------------------------------------

export interface UldeLogger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

export interface UldeDomLogger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}
// ---------------------------------------------
// Plugin Context + Capabilities
// ---------------------------------------------

export interface UldePluginCapabilities {
  provides?: string[]; // capability ids this plugin provides
  consumes?: string[]; // capability ids this plugin depends on
}

export interface UldePluginContext {
  readonly pluginId: UldePluginId;
  readonly logger: UldeLogger;

  // Global ULDE config (read-only)
  getConfig<T = unknown>(key: string): T | undefined;

  // Plugin-local state
  getState<T = unknown>(key: string): T | undefined;
  setState<T = unknown>(key: string, value: T): void;

  // Cross-plugin capability lookup
  resolveCapability<T = unknown>(capabilityId: string): T | undefined;
}

// ---------------------------------------------
// Plugin Interface (String Phase)
// ---------------------------------------------

export interface UldePluginMeta {
  id: UldePluginId;
  kind: UldePluginKind;
  displayName: string;
  description?: string;
  version: string;
  author?: string;
  homepage?: string;
  tags?: string[];
}

export interface UldePlugin {
  readonly meta: UldePluginMeta;

  // Lifecycle
  onRegister?(ctx: UldePluginContext): void | Promise<void>;
  onActivate?(ctx: UldePluginContext): void | Promise<void>;
  onDeactivate?(ctx: UldePluginContext): void | Promise<void>;
  onDispose?(ctx: UldePluginContext): void | Promise<void>;

  // Capabilities
  provideCapabilities?(
    ctx: UldePluginContext
  ): UldePluginCapabilities | Promise<UldePluginCapabilities>;

  // Content Phase
  transformContent?(
    ctx: UldePluginContext,
    doc: UldeDocNode
  ): Promise<UldeContentResult> | UldeContentResult;

  transformMetadata?(
    ctx: UldePluginContext,
    doc: UldeDocNode
  ): Promise<Record<string, unknown>> | Record<string, unknown>;
}

// ---------------------------------------------
// DOM Plugin API (Hydration Phase)
// ---------------------------------------------

export interface UldeDomBudget {
  maxListeners: number;
  maxIntervals: number;
  maxTimeouts: number;
}

export interface UldeDomPluginContext {
  readonly pluginId: UldePluginId;
  readonly logger: UldeLogger;

  // Root element for this doc view
  readonly rootElement: HTMLElement;

  // Angular injector (optional)
  readonly injector?: import('@angular/core').Injector;

  // DOM budget enforcement
  readonly budget: UldeDomBudget;

  // Diagnostics
  reportDiagnostic(diag: UldeDiagnostic): void;

  // Overlay management
  registerOverlay(id: string, element: HTMLElement): void;
  unregisterOverlay(id: string): void;
}

export interface UldeDomPlugin {
  readonly meta: UldePluginMeta;
  onDomRegister?(ctx: UldeDomPluginContext): void | Promise<void>;
  onDomInit?(ctx: UldeDomPluginContext): void | Promise<void>;
  onDomUpdate?(ctx: UldeDomPluginContext): void | Promise<void>;
  onDomDestroy?(ctx: UldeDomPluginContext): void | Promise<void>;
}

// ---------------------------------------------
// Pipeline
// ---------------------------------------------

export interface UldePipelineStep {
  pluginId: UldePluginId;
  hook: 'transformContent' | 'transformMetadata';
  order: number;
}

export interface UldePipelineConfig {
  steps: UldePipelineStep[];
}

export interface UldePipeline {
  readonly config: UldePipelineConfig;

  runContent(doc: UldeDocNode): Promise<UldeContentResult>;
  runMetadata(doc: UldeDocNode): Promise<Record<string, unknown>>;
}

// ---------------------------------------------
// Registry
// ---------------------------------------------

export interface UldePluginRegistrationOptions {
  enabled?: boolean;
  order?: number;
}

export interface UldeRegisteredPlugin {
  plugin: UldePlugin;
  options: UldePluginRegistrationOptions;
  context: UldePluginContext;
  active: boolean;
}

export interface UldePluginRegistryConfig {
  globalConfig?: Record<string, unknown>;
}

export interface UldePluginRegistry {
  readonly config: UldePluginRegistryConfig;

  register(plugin: UldePlugin, options?: UldePluginRegistrationOptions): Promise<void>;
  unregister(pluginId: UldePluginId): Promise<void>;

  activate(pluginId: UldePluginId): Promise<void>;
  deactivate(pluginId: UldePluginId): Promise<void>;

  getPlugin(pluginId: UldePluginId): UldeRegisteredPlugin | undefined;
  listPlugins(): UldeRegisteredPlugin[];

  buildPipeline(): UldePipeline;

  dispose(): Promise<void>;
}

/* ---------------------------------------------------------
 * CONTENT PHASE PLUGIN
 * Runs on raw HTML string before DOM creation.
 * --------------------------------------------------------- */
export interface UldeContentPlugin {
  readonly id: UldePluginId;

  // Transform raw HTML before DOM creation
  transform?(html: string): string;

  // Optional diagnostics
  reportDiagnostic?(diag: UldeDiagnostic): void;
}


/* ---------------------------------------------------------
 * PLUGIN BUNDLE
 * Combines content-phase and DOM-phase plugins.
 * --------------------------------------------------------- */
export interface UldePluginBundle {
  readonly id: UldePluginId;

  // Optional content-phase plugin
  readonly content?: UldeContentPlugin;

  // Optional DOM-phase plugin
  readonly dom?: UldeDomPlugin;
}
