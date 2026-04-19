import {
  Component, OnChanges, SimpleChanges, signal, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, Injector, input, output, PLATFORM_ID, Inject,
  Renderer2,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { isPlatformBrowser } from '@angular/common';
import { UldeService } from '../ulde.service';
import { UldeDomHostService } from '../ulde-dom-host.service';
import { UldeContentResult } from '../../core/runtime/ulde.types';
import { UldeDebugOverlay } from '../ulde-debug-overlay/ulde-debug-overlay';

import { readSessionState, writeSessionState } from '../../../docs-viewer/session-state.manage';
import { ScrollService } from '../../../docs-viewer/scroll.service';


@Component({
  selector: 'app-ulde-viewer',
  standalone: true,
  imports: [UldeDebugOverlay],
  templateUrl: './ulde-viewer.html',
  styleUrls: ['./ulde-viewer.scss'],
})
export class UldeViewer implements OnChanges, AfterViewInit, OnDestroy {

  protected readonly $title = signal("UdeViewer");

  private $isBrowser = signal<boolean>(false);

  $docId = input<string>('');
  // @Input() path!: string;
  contentRendered = output<HTMLElement>();

  private sanitizer = inject(DomSanitizer);
  sanitizedContent!: SafeHtml;


  private rafPending = false;

  @ViewChild('contentRoot', { static: false })
  contentRoot?: ElementRef<HTMLElement>;

  @ViewChild('uldeViewer', { static: false })
  uldeViewer?: ElementRef<HTMLElement>;

  private readonly ulde = inject(UldeService);
  // private readonly domHost = inject(UldeDomHostService);

  // ✔ The correct injector for DOM host
  private readonly injector = inject(Injector);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly rendered = signal<UldeContentResult | null>(null);

  // $isRendered = computed<boolean>(() => {
  //   return (this.rendered()) ? true : false;
  // });
  $isRendered = output<boolean>();

  private viewReady = false;


  // private scrollListener?: () => void;//
  // private scrollHandler = this.onScroll.bind(this);

  constructor(
    private scrollService: ScrollService,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.$isBrowser.set(isBrowser);

    if (isBrowser) {
      //
      // const root = document.getElementById('docsViewer');
      // console.log(`constructor`, root);
      // root?.addEventListener('scroll', this.scrollHandler);
      // this.scrollListener = this.renderer.listen(
      //   'window',
      //   'scroll',
      //   (event: Event) => this.onScroll(event),
      // );

    }
  }

  // ensures to write scrollPos at most once per animation frame (~60fps max).
  private onScroll(event: Event): void {

    console.log(`Log: onScroll`);
    if (!this.$isBrowser()) return;

    // console.log(`Log: onScroll`);
    // Capture the element synchronously — this is CRITICAL
    const el = event.currentTarget as HTMLElement;
    const docId = this.$docId() ?? '';

    if (!this.rafPending) {
      this.rafPending = true;

      // console.log(`Log: onScroll`);

      requestAnimationFrame(() => {
        const pos = el.scrollTop;
        const height = el.scrollHeight - el.clientHeight;
        this.scrollService.setPosition(docId, pos, height);
        writeSessionState({ scrollPos: pos }, this.$isBrowser());
        console.log(`Log: onScroll`, el);
        // if (this.debugScroll) {
        //   console.log('[DEBUG] scroll event → pos:', pos);
        // }

        this.rafPending = false;
      });
    }
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
    //     const root = document.getElementById('docsViewer');
    //     console.log(`ngOnChanges`, root);
    //     root?.addEventListener('scroll', this.scrollHandler);

    if (changes['$docId'] && this.$docId()) {
      await this.loadAndRender(this.$docId());

      // const rendered = (this.rendered()) ? true : false;

      if (this.rendered()) {


        const root = document.getElementById('docsViewer');
        console.log(`ngOnChanges`, root);
        // root?.addEventListener('scroll', this.scrollHandler);
        // this.scrollListener = this.renderer.listen(
        //   root,
        //   'scroll',
        //   (event: Event) => this.onScroll(event),
        // );


        this.updateSessionState(this.$docId());

        const content = this.rendered()?.content;
        if (!content) return;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(content);
        // const root = document.getElementById('contentRoot');
        // const root = this.contentRoot?.nativeElement;
        // if (!root) return;

        // console.log(`Log: UldeViewer ngOnChages \nroot= `, root);
        // console.log(`Log: UldeViewer ngOnChanges rendered= `, true, this.rendered()?.content);
        this.viewReady = true;
        // this.attachDomHostIfReady();
        this.$isRendered.emit(true);
      }
    }
  }

  ngAfterViewInit() {
    if (!this.$isBrowser()) return;
  }

  ngOnDestroy() {
    // this.domHost.detach();
    // if (this.scrollHandler) {
    //   this.uldeViewer?.nativeElement.removeEventListener('scroll', this.scrollHandler);
    // }
  }

  private attachDomHostIfReady() {

    const uldeViewer = this.uldeViewer?.nativeElement;

    console.log(`Log: UldeViewer attachDomHostIfReady() \nuldeViewer= `, uldeViewer);

    if (!uldeViewer) return;

    // this.domHost.attach(uldeViewer, this.injector);

  }

  private async loadAndRender(docId: string | undefined) {

    // console.log(`loadAndReady In`, this.viewReady);

    if (!docId) return;

    // private async loadAndRender(path: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const source = await this.ulde.loadDocMetaById(docId);

      const result = await this.ulde.renderFromSource(source);
      this.rendered.set(result);

      // const html = document.createElement('html');
      // html.innerHTML = result.content;
      // this.contentRendered.emit(html); // output to <app-docs-viewer/>

      // if (this.viewReady) {
      //   // console.log(`this.viewReady=`, this.viewReady);
      //   this.attachDomHostIfReady();
      //   this.domHost.update();
      // }

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





}
