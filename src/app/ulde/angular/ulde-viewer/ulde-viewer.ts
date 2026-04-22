import { Component, OnChanges, SimpleChanges, signal, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, Injector, input, output, PLATFORM_ID, Inject, Renderer2, computed, effect, } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { isPlatformBrowser } from '@angular/common';
import { UldeService } from '../ulde.service';
import { UldeContentResult } from '../../core/runtime/ulde.types';
import { UldeDebugOverlay } from '../ulde-debug-overlay/ulde-debug-overlay';

import { readSessionState, writeSessionState } from '../../../docs-viewer/session-state.manage';
import { ScrollService } from '../../../docs-viewer/scroll.service';
import { UldeDomHostService } from '../ulde-dom-host.service';


@Component({
  selector: 'app-ulde-viewer',
  standalone: true,
  imports: [
    UldeDebugOverlay
  ],
  templateUrl: './ulde-viewer.html',
  styleUrls: ['./ulde-viewer.scss'],
})
export class UldeViewer implements AfterViewInit, OnDestroy {
  // export class UldeViewer implements OnChanges, AfterViewInit, OnDestroy {

  protected readonly $title = signal("UdeViewer");

  private $isBrowser = signal<boolean>(false);

  $docId = input.required<{ docId: string, reloadCounter: number }>();

  // private $reload = signal(0);
  // $activeDocId = computed<{ docId: string, reloadCounter: number }>(() => ({
  //   docId: this.$docId(),
  //   reloadCounter: this.$reload()
  // }));
  // contentRendered = output<HTMLElement>();

  private sanitizer = inject(DomSanitizer);
  sanitizedContent!: SafeHtml;

  // @ViewChild('ulde_viewer_root', { static: false }) uldeViewerRoot?: ElementRef<HTMLElement>;

  private readonly ulde = inject(UldeService);

  // private readonly injector = inject(Injector);
  // private readonly domHost = inject(UldeDomHostService);

  protected loading: boolean = false;
  protected error: boolean | null = null;
  protected contentResult: UldeContentResult | null = null;

  $isContentRendered = output<{ isRendered: boolean, docId: string }>();
  // $contentResult = output<UldeContentResult | null>();

  private viewReady = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.$isBrowser.set(isBrowser);

    effect(() => {
      const docId = this.$docId().docId;
      this.effectWrapper(docId);
    });

  }

  private updateSessionState(docId: string): void {
    const { docId: current } = readSessionState(this.$isBrowser());
    if (docId !== current) {
      // set current docId to previous odcId, set new docId to current docId;
      writeSessionState({ docId, prevDocId: current }, this.$isBrowser());

    }
  }

  private async effectWrapper(docId: string) {
    // if (this.$rendered() !== null) return;
    if (!this.$isBrowser()) return;
    // if (!this.$rendered()) return;

    console.log(`Log: [${this.$title()}] effectWrapper`);
    // console.log(`Log: [${this.$title()}] changes['$docId']=${changes['$docId'].currentValue}, this.$docId()=${this.$docId()}`)



    await this.loadAndRender(docId);

    if (this.contentResult) {

      this.updateSessionState(docId);

      const content = this.contentResult?.content;
      if (!content) return;

      this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(content);

      this.viewReady = true;
      this.$isContentRendered.emit({ isRendered: true, docId: docId });
    }

  }

  // async ngOnChanges(changes: SimpleChanges) {
  //   if (!this.$isBrowser()) return;

  //   console.log(`Log: [${this.$title()}] OnChanges=`, changes);
  //   // console.log(`Log: [${this.$title()}] changes['$docId']=${changes['$docId'].currentValue}, this.$docId()=${this.$docId()}`)

  //   if (changes['$docId'] && this.$docId()) {

  //     await this.loadAndRender(this.$docId());

  //     if (this.$rendered()) {

  //       this.updateSessionState(this.$docId());

  //       const content = this.$rendered()?.content;
  //       if (!content) return;

  //       this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(content);

  //       this.viewReady = true;
  //       this.$isContentRendered.emit({isRendered: true, docId: this.$docId()});
  //     }
  //   }
  // }


  ngAfterViewInit() {
    if (!this.$isBrowser()) return;
  }

  ngOnDestroy() {
  }

  private async loadAndRender(docId: string | undefined) {

    if (!docId) return;

    this.loading = true;;
    // this.$loading.set(true);
    this.error = null;

    try {
      const source = await this.ulde.loadDocMetaById(docId);
      this.contentResult = await this.ulde.renderFromSource(source);

    } catch (e: any) {
      this.error = e?.message ?? 'Failed to load document';
    } finally {
      this.loading = false;
    }
  }

}
