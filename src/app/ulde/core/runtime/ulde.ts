import { ContentEngine } from '../content-engine/content-engine';
import { LayoutEngine } from '../layout-engine/layout-engine';
import { InteractiveEngine } from '../interactive-engine/interactive-engine';
import { PluginRegistry } from '../../plugin-system/registry/plugin-registry';
import { UldeContext } from './ulde-context';
import { HeadingAnchorsPlugin } from '../../plugin-system/plugins/heading-anchors/heading-anchors.plugin';
import { TimingPlugin } from '../../utils/timing/timing.plugin';
import { MermaidPlugin } from '../../plugin-system/plugins/mermaid/mermaid.plugin';

export class Ulde {
  private content = new ContentEngine();
  private layout = new LayoutEngine();
  private interactive = new InteractiveEngine();
  private plugins = new PluginRegistry();

  constructor() {
    // register built-in plugins here
    this.plugins.register(HeadingAnchorsPlugin);
    this.plugins.register(TimingPlugin);
    this.plugins.register(MermaidPlugin);
  }

  async render(path: string): Promise<UldeContext> {
    const ctx = new UldeContext(path);

    // content phase
    ctx.raw = await this.content.load(path);
    await this.plugins.runPhase('content', ctx);

    // post-content phase
    ctx.html = this.content.renderMarkdown(ctx.raw);
    ctx.html = this.content.resolveLinks(ctx.html);

    // await this.plugins.runPhase('post-content', ctx);

    // layout phase
    ctx.html = this.layout.renderShell(ctx.html);
    await this.plugins.runPhase('layout', ctx);

    // interactive phase
    ctx.html = this.interactive.mountDemos(ctx.html);
    await this.plugins.runPhase('interactive', ctx);

    // instrumentation phase
    await this.plugins.runPhase('instrumentation', ctx);

    return ctx;
  }
}
