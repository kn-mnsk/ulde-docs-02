import { Component, OnChanges, SimpleChanges, signal, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, Injector, input, output, PLATFORM_ID, Inject, } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { isPlatformBrowser } from '@angular/common';
import { UldeService } from '../ulde.service';
import { UldeContentResult } from '../../core/runtime/ulde.types';
import { UldeDebugOverlay } from '../ulde-debug-overlay/ulde-debug-overlay';

import { readSessionState, writeSessionState } from '../../../docs-viewer/session-state.manage';


@Component({
  selector: 'app-ulde-viewer',
  standalone: true,
  imports: [
    UldeDebugOverlay
  ],
  templateUrl: './ulde-viewer.html',
  styleUrls: ['./ulde-viewer.scss'],
})
export class UldeViewer implements OnChanges, AfterViewInit, OnDestroy {

  protected readonly $title = signal("UdeViewer");

  private $isBrowser = signal<boolean>(false);

  $docId = input<string>('');

  // contentRendered = output<HTMLElement>();

  private sanitizer = inject(DomSanitizer);
  sanitizedContent!: SafeHtml;

  // @ViewChild('ulde_viewer_root', { static: true }) uldeViewerRoot?: ElementRef<HTMLElement>;

  private readonly ulde = inject(UldeService);

  private readonly injector = inject(Injector);

  readonly $loading = signal(false);
  readonly $error = signal<string | null>(null);
  readonly $rendered = signal<UldeContentResult | null>(null);

  $isRendered = output<boolean>();
  $contentResult = output<UldeContentResult | null>();

  private viewReady = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.$isBrowser.set(isBrowser);

  }

  private updateSessionState(docId: string): void {
    const { docId: current } = readSessionState(this.$isBrowser());
    if (docId !== current) {
      // set current docId to previous odcId, set new docId to current docId;
      writeSessionState({ docId, prevDocId: current }, this.$isBrowser());

    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (!this.$isBrowser()) return;
    // //


    if (changes['$docId'] && this.$docId()) {
      await this.loadAndRender(this.$docId());

      // const root = this.uldeViewerRoot?.nativeElement;
      // console.log(`ngOnChanges`, root);

      if (this.$rendered()) {

        this.updateSessionState(this.$docId());

        const content = this.$rendered()?.content;
        if (!content) return;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(content);
        this.viewReady = true;
        this.$isRendered.emit(true);
        this.$contentResult.emit(this.$rendered())
      }
    }
  }

  ngAfterViewInit() {
    if (!this.$isBrowser()) return;
  }

  ngOnDestroy() {
  }

  private async loadAndRender(docId: string | undefined) {

    // console.log(`loadAndReady In`, this.viewReady);

    if (!docId) return;

    // private async loadAndRender(path: string) {
    this.$loading.set(true);
    this.$error.set(null);

    try {
      const source = await this.ulde.loadDocMetaById(docId);
      const result = await this.ulde.renderFromSource(source);
      this.$rendered.set(result);

    } catch (e: any) {
      this.$error.set(e?.message ?? 'Failed to load document');
    } finally {
      this.$loading.set(false);
    }
  }


}
