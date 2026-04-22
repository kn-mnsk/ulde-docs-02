// src/app/ulde/angular/ulde-dom-host.service.ts

import { Injectable, Injector, signal } from '@angular/core';
import {
  UldeDomPlugin,
  UldeDomPluginContext,
  UldeDomBudget,
  UldeDiagnostic,
  UldeLogger,
  UldePluginId,
} from '../core/runtime/ulde.types';

import { ConsoleLogger } from '../plugin-system/registry/plugin-registry';

@Injectable({ providedIn: 'root' })
export class UldeDomHostService {
  private rootElement: HTMLElement | null = null;
  private injector: Injector | null = null;

  private readonly domBudget: UldeDomBudget = {
    maxListeners: 100,
    maxIntervals: 10,
    maxTimeouts: 20,
  };

  private readonly overlays = new Map<string, HTMLElement>();
  private readonly plugins: UldeDomPlugin[] = [];

  private readonly logger!: UldeLogger;

  readonly diagnostics = signal<UldeDiagnostic[]>([]);

  registerDomPlugin(plugin: UldeDomPlugin) {
    this.plugins.push(plugin);

    // // new revision
    // if (plugin.onDomRegister) {
    //   this.runHook('onDomRegister');
    // }

  }

  attach(rootElement: HTMLElement, injector: Injector) {
    this.rootElement = rootElement;
    this.injector = injector;
    this.runHook('onDomRegister');
    this.runHook('onDomInit');
  }

  update(option?: { pluginId: string, data?: any }) {
    this.runHook('onDomUpdate');
  }

  detach() {
    this.runHook('onDomDestroy');
    this.rootElement = null;
    this.injector = null;
    this.overlays.clear();
    this.diagnostics.set([]);
  }

  private createContext(pluginId: string): UldeDomPluginContext {
    if (!this.rootElement) {
      throw new Error('UldeDomHostService: rootElement not attached');
    }

    return {
      pluginId: pluginId,
      logger: new ConsoleLogger(pluginId),
      rootElement: this.rootElement,
      injector: this.injector ?? undefined,
      budget: this.domBudget,
      reportDiagnostic: (diag: UldeDiagnostic) => {
        this.diagnostics.update((prev) => [...prev, diag]);
      },
      registerOverlay: (id: string, element: HTMLElement) => {
        this.overlays.set(id, element);
      },
      unregisterOverlay: (id: string) => {
        this.overlays.delete(id);
      },
    };
  }

  private async runHook(hook: 'onDomRegister' | 'onDomInit' | 'onDomUpdate' | 'onDomDestroy') {

    // console.log(`Log: [UldeDomHostService] runHook \nhook=`, hook, this.rootElement);

    if (!this.rootElement) return;

    // console.log(`Log: UldeDomHostService runHook \nhook= `, hook);

    for (const plugin of this.plugins) {
      const fn = plugin[hook];
      if (!fn) continue;
      // if (pluginId!==undefined) {
      //   if (plugin.meta.id !== pluginId) continue;
      // }

      // console.log(`Log: [runhook]`, pluginId, plugin.meta.id);

      const ctx = this.createContext(plugin.meta.id);
      try {
        // ctx.logger.info(`[ulde.runhook] ${plugin.meta.id} option=`, option);

        await fn.call(plugin, ctx);
      } catch (e) {
        this.diagnostics.update((prev) => [
          ...prev,
          {
            pluginId: plugin.meta.id,
            level: 'error',
            message: `${hook} failed`,
          },
        ]);
      }
    }
  }
}
