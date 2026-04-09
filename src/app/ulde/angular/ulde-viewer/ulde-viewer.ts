// src/app/ulde/angular/ulde-viewer/ulde-viewer.ts

import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

import { UldeService } from '../ulde.service';
import { UldeDomHostService } from '../ulde-dom-host.service';
import { UldeDocNode, UldeContentResult } from '../../core/runtime/ulde.types';
import { UldeDebugOverlay } from '../ulde-debug-overlay/ulde-debug-overlay';

@Component({
  selector: 'app-ulde-viewer',
  imports:[UldeDebugOverlay],
  standalone: true,
  templateUrl: './ulde-viewer.html',
  styleUrls: ['./ulde-viewer.scss'],
})
export class UldeViewer
  implements OnChanges, AfterViewInit, OnDestroy
{
  @Input() path!: string;

  @ViewChild('contentRoot', { static: false })
  contentRoot?: ElementRef<HTMLElement>;

  private readonly ulde = inject(UldeService);
  private readonly domHost = inject(UldeDomHostService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly rendered = signal<UldeContentResult | null>(null);

  private viewInitialized = false;

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['path'] && this.path) {
      await this.loadAndRender(this.path);
    }
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.attachDomHostIfReady();
  }

  ngOnDestroy() {
    this.domHost.detach();
  }

  private async loadAndRender(path: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const raw = await this.fetchDoc(path);

      const result = await this.ulde.renderFromSource({
        id: path,
        path,
        format: 'markdown',
        rawContent: raw,
      });

      this.rendered.set(result);

      if (this.viewInitialized) {
        this.attachDomHostIfReady();
        this.domHost.update();
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to load document');
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchDoc(path: string): Promise<string> {
    const url = `/assets/docs${path}.md`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Document not found: ${url}`);
    }

    return res.text();
  }

  private attachDomHostIfReady() {
    if (!this.contentRoot?.nativeElement) return;
    this.domHost.attach(this.contentRoot.nativeElement, inject(ElementRef).injector as any);
  }
}
