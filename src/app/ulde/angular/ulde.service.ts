// src/app/ulde/angular/ulde.service.ts

import { Injectable, inject, Injector } from '@angular/core';
import { createUldePluginRegistry, } from '../plugin-system/registry/plugin-registry';

import {
  UldePluginRegistry,
  UldePlugin,
  UldeDocNode,
  UldeContentSource,
  UldeContentResult,
} from '../core/runtime/ulde.types';

import { ContentEngine } from '../core/content-engine/content-engine';

// Built‑in plugins
import { HeadingAnchorsPlugin } from '../plugin-system/plugins/heading-anchors/heading-anchors.plugin';
import { MarkdownPlugin } from '../plugin-system/plugins/markdown/markdown.plugin';
// import { ResolveLinksPlugin } from '../plugin-system/plugins/resolve-links/resolve-links.plugin';
// import { KaTeXPlugin } from '../plugin-system/plugins/katex/katex.plugin';
import { ResolveLinksDomPlugin } from '../plugin-system/plugins/resolve-links/resolve-links.dom.plugin';
import { MermaidDomPlugin } from '../plugin-system/plugins/mermaid/mermaid.dom.plugin';
import { UldeDomHostService } from './ulde-dom-host.service';

// import { findDocPathById } from '../utils/docs/docs-lookup';
import { ScrollEventDomPlugin } from '../plugin-system/plugins/events/scroll-event.dom.plugin';
import { ThemeDomPlugin } from '../plugin-system/plugins/theme/theme.dom.plugin';
import { KatexDomPlugin } from '../plugin-system/plugins/katex/katex.dom.plugin';


@Injectable({ providedIn: 'root' })
export class UldeService {
  private readonly injector = inject(Injector);
  private readonly domHost = inject(UldeDomHostService);

  private readonly registry: UldePluginRegistry;
  private readonly contentEngine: ContentEngine;

  constructor() {
    // 1. Create registry
    this.registry = createUldePluginRegistry({
      globalConfig: {
        markdown: { enableGfm: true },
      },
    });

    // 2. Create content engine
    this.contentEngine = new ContentEngine(this.registry);

    // 3. Register built‑in plugins
    this.registerBuiltInPlugins();
  }

  // ---------------------------------------------
  // Plugin Registration
  // ---------------------------------------------

  private async registerBuiltInPlugins() {
    await this.registerPlugin(MarkdownPlugin);
    await this.registerPlugin(HeadingAnchorsPlugin);
    // await this.registerPlugin(KaTeXPlugin);
    // DOM plugins must be registered in the DOM host:
    this.domHost.registerDomPlugin(ThemeDomPlugin);
    this.domHost.registerDomPlugin(ResolveLinksDomPlugin);
    this.domHost.registerDomPlugin(ScrollEventDomPlugin);
    this.domHost.registerDomPlugin(KatexDomPlugin);

    this.domHost.registerDomPlugin(MermaidDomPlugin);
  }

  async registerPlugin(plugin: UldePlugin) {
    return this.registry.register(plugin);
  }

  listPlugins() {
    return this.registry.listPlugins();
  }

  async loadDocById(docId: string): Promise<{ text: string, path: string }> {
    return this.contentEngine.loadDocById(docId);
  }

  async loadDocMetaById(docId: string): Promise<UldeContentSource> {
    return this.contentEngine.loadDocMetaById(docId);
  }

  // ---------------------------------------------
  // Rendering API (used by <ulde-viewer>)
  // ---------------------------------------------

  async renderDoc(doc: UldeDocNode): Promise<UldeContentResult> {
    return this.contentEngine.renderDoc(doc);
  }

  async renderFromSourceOld(source: {
    id: string;
    path: string;
    title?: string;
    format: UldeDocNode['format'];
    rawContent: string;
    metadata?: Record<string, unknown>;
  }): Promise<UldeContentResult> {
    return this.contentEngine.renderFromSource(source);
  }


  async renderFromSource(source: UldeContentSource): Promise<UldeContentResult> {
    return this.contentEngine.renderFromSource(source);
  }

  // ---------------------------------------------
  // Advanced access
  // ---------------------------------------------

  getRegistry(): UldePluginRegistry {
    return this.registry;
  }
}
