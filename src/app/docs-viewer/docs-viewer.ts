import { AfterViewInit, Component, OnDestroy, OnInit, signal, input, computed, Inject, inject, PLATFORM_ID, ViewChild, ElementRef, Injector, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UldeViewer } from '../ulde/angular/ulde-viewer/ulde-viewer';
import { MatIconModule } from '@angular/material/icon';


import { ScrollService } from './scroll.service';
import { SessionComponent } from '../pages/docs/docs-meta';
import { readSessionState, writeSessionState } from './session-state.manage';
import { UldeDomHostService } from '../ulde/angular/ulde-dom-host.service';

@Component({
  selector: 'app-docs-viewer',
  imports: [UldeViewer, MatIconModule],
  templateUrl: './docs-viewer.html',
  styleUrl: './docs-viewer.scss',
})
export class DocsViewer implements OnInit, AfterViewInit, OnDestroy {

  protected readonly $title = signal("DocsViewer");

  private $isBrowser = signal<boolean>(false);

  protected $isDarkMode = signal<boolean>(true);

  protected $inputDocId = input.required<string>(); // from DocsViewerDirective
  protected $docId = signal<string>('initialdoc');
  private $reload = signal(0);

  $activeDocId = computed<{ docId: string, reloadCounter: number }>(() => ({
    docId: this.$docId() ?? this.$inputDocId(),
    reloadCounter: this.$reload()
  }));

  protected docTitle!: string | undefined;

  private rafPending = false;
  /** Debug mode for scroll restoration */
  debugScroll = false;
  // debugScroll = true;
  // keep a reference to the handler
  private uldeLinkClickHandler = this.onUldeLinkClick.bind(this);
  private uldeScrollHandler = this.onUldeScroll.bind(this);

  // private removeScrollListener?: () => void;
  // private removeKeydownListener?: () => void;
  private removeBeforeUnloadListener?: () => void;


  private readonly injector = inject(Injector);
  private readonly domHost = inject(UldeDomHostService);

  private root: HTMLElement | null = null;

  @ViewChild('docsViewer', { static: true }) docsViewer!: ElementRef<HTMLElement>;

  constructor(
    protected scrollService: ScrollService,
    private renderer: Renderer2,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.$isBrowser.set(isBrowser);


    if (isBrowser) {
      this.initTheme();
      this.initGlobalListeners();
      this.ensureInitialSessionState();
    }

  }

  // -------------------------
  // Lifecycle hooks
  // -------------------------
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    if (!this.$isBrowser()) return;

    this.restoreFromSessionState();
  }

  ngOnDestroy(): void {
    this.cleanupDocsViewer(this.root);

    console.log(`Log ${this.$title()} ngOnDestroy Completed`);

  }

  private cleanupDocsViewer(viewer: HTMLElement | null) {
    if (viewer) {
      viewer.removeEventListener('ulde-link-click', this.uldeLinkClickHandler);
      viewer.removeEventListener('scroll', this.uldeScrollHandler);
      viewer = null;
    }

    // if (this.removeScrollListener) {
    //   this.removeScrollListener();
    //   this.removeScrollListener = undefined;
    // }

    if (this.removeBeforeUnloadListener) {
      this.removeBeforeUnloadListener();
      this.removeBeforeUnloadListener = undefined;
    }

    // App-level cleanup
    this.scrollService.setLastDocId(null);

  }

  private ensureInitialSessionState(): void {
    // Ensure there is at least a baseline state
    const current = readSessionState(this.$isBrowser());
    writeSessionState(current, this.$isBrowser());
  }

  // -------------------------
  // Browser-only initialization
  // -------------------------

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  private initGlobalListeners(): void {
    // this.removeScrollListener = this.renderer.listen(
    //   document,
    //   'scroll',
    //   (event: Event) => this.onScroll(event),
    // );
    // Before unload: mark refresh
    this.removeBeforeUnloadListener = this.renderer.listen(
      window,
      'beforeunload',
      (event: BeforeUnloadEvent) => this.onBeforeUnload(event),
    );
  }


  // -------------------------
  // Refresh / restore logic
  // -------------------------

  private async restoreFromSessionState(): Promise<void> {
    const state = readSessionState(this.$isBrowser());

    // console.log(`Log: ${this.$title()} restoreFromSessionState()` +   `\nstate=${JSON.stringify(state, null, 2)}`);

    if (!state.refreshed) {
      // Normal start - show App template which is main screen
      return;
    }

    // Refresh flow
    if (state.component === 'App') {
      // Refreshed while on App: just clear refreshed flag
      writeSessionState({
        docId: null,
        prevDocId: null,
        refreshed: false,
        scrollPos: 0
      },
        this.$isBrowser()
      );

      return;
    }

    if (state.component === 'DocsViewer') {
      // Refreshed while viewing DocsViewer: restore doc + scroll
      const docId = state.docId ?? 'initialdoc';
      const scrollPos = state.scrollPos ?? 0;

      writeSessionState({ refreshed: false }, this.$isBrowser());

      this.scrollService.setPosition(docId, scrollPos, 0);
      // this.$isVisible.set(true);
      this.$docId.set(docId);

      // console.log(`Log: ${this.$title()} restoreFromSessionState() DocsViewer Refresh` + `\nRestored docId=${docId}, scrollPos=${scrollPos}`);

      return;
    }

    // Fallback: no opinion, just clear refresh bit
    writeSessionState({ refreshed: false }, this.$isBrowser());
  }


  private onBeforeUnload(event: BeforeUnloadEvent): void {
    // Mark that a refresh/unload is happening
    writeSessionState({ refreshed: true }, this.$isBrowser());

    // Optionally: let ScrollService push last scrollPos into sessionState
    // before unload, or keep that responsibility entirely on scroll events.
  }


  onContentRendered(isRendered: boolean) {
    // console.log(`Log: ${this.$title()} onContentRendered() root Html isRendred=`, isRendered);

    if (!isRendered || !this.$isBrowser()) return;

    this.cleanupDocsViewer(this.root);

    requestAnimationFrame(() => {
      // const rootViewChild = this.docsViewer.nativeElement;

      this.root = document.getElementById('docsViewer');
      // console.log(`Log: ${this.$title()} onContentRendered() \nrootViewChild=`, rootViewChild, `\nroot=`, root);
      if (!this.root) {
        console.warn(`Warn: ${this.$title()} wireInternalLinks() \nroot=`, this.root);
        return;
      }


      this.domHost.attach(this.root, this.injector);

      this.root.addEventListener('ulde-link-click', this.uldeLinkClickHandler);
      this.root.addEventListener('ulde-scroll', this.uldeScrollHandler);

      this.restoreScroll(this.$docId(), this.root);

    });
  }

  private onUldeScroll(event: any): void {
    console.log(`Log: onUldeScroll`, event);
    if (event.type === 'ulde-scroll') {
      const { pos, height } = event.detail;

      const docId = this.$activeDocId().docId ?? '';

      if (!this.rafPending) {
        this.rafPending = true;
        // this.handleInternalNavigation(linkId, destId);
      }

      requestAnimationFrame(() => {
        this.scrollService.setPosition(docId, pos, height);
        writeSessionState({ scrollPos: pos }, this.$isBrowser());

        if (this.debugScroll) {
          console.log('[DEBUG] ulde-scroll event → pos:', pos);
        }

        this.rafPending = false;
      });
    }

  }

  // // ensures to write scrollPos at most once per animation frame (~60fps max).
  // private onScroll(event: Event): void {

  //   console.log(`Log: onScroll`);
  //   if (!this.$isBrowser()) return;

  //   console.log(`Log: onScroll`);
  //   // Capture the element synchronously — this is CRITICAL
  //   const el = event.currentTarget as HTMLElement;
  //   const docId = this.$activeDocId().docId ?? '';

  //   if (!this.rafPending) {
  //     this.rafPending = true;

  //     console.log(`Log: onScroll`);

  //     requestAnimationFrame(() => {
  //       const pos = el.scrollTop;
  //       const height = el.scrollHeight - el.clientHeight;
  //       this.scrollService.setPosition(docId, pos, height);
  //       writeSessionState({ scrollPos: pos }, this.$isBrowser());

  //       if (this.debugScroll) {
  //         console.log('[DEBUG] scroll event → pos:', pos);
  //       }

  //       this.rafPending = false;
  //     });
  //   }
  // }

  private onUldeLinkClick(e: any) {
    console.log(`Log: Onclick`, e);
    if (e.type === 'ulde-link-click') {
      const { linkId, destId } = e.detail;
      this.handleInternalNavigation(linkId, destId);
    }
  }

  private handleInternalNavigation(linkId: string, destId: string) {
    if (linkId === '#docId') {
      if (destId && destId !== this.$docId()) {
        this.$docId.set(destId);
        this.$reload.update(n => n + 1);;
      }
      return;
    }

    if (linkId === '#inlineId') {
      this.scrollToInline(destId);
      // setTimeout(() => el.classList.remove('inline-highlight'), 1000); // short delay time time may not hightlight

      return;
    }
  }

  private scrollToInline(inlineId: string) {
    // Wait for ULDE to finish rendering (contentRendered event)
    // requestAnimationFrame(() => {
    console.log(`Log: this.root=`, this.root);

    const el = document.getElementById(inlineId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    requestAnimationFrame(() => {
      el.classList.add('inline-highlight');  // whwn backward scrolling, no hihglight??
      setTimeout(() => el.classList.remove('inline-highlight'), 1000); // short delay time time may not hightlight

      // // Optional: make editable
      if (!el.hasAttribute('contenteditable')) {
        el.setAttribute('contenteditable', 'true');
      }
    });

  }


  private updateSessionState(docId: string): void {
    const { docId: current } = readSessionState(this.$isBrowser());
    if (docId !== current) {
      // set current docId to previous odcId, set new docId to current docId;
      writeSessionState({ docId, prevDocId: current }, this.$isBrowser());

    }
  }


  private restoreScroll(docId: string, viewer: HTMLElement): void {

    const savedPos = this.scrollService.getPosition(docId);

    const overlay = viewer.parentElement!.querySelector('.viewer-overlay') as HTMLElement;
    if (!overlay) {
      console.warn('Overlay not found — scroll hiding disabled.');
      viewer.scrollTop = savedPos;
      return;
    }

    if (this.debugScroll) {
      this.timeline.clear();
      this.mark("start");
      overlay.style.background = 'rgba(255,0,0,0.4)';
      console.log('[DEBUG] Scroll restore start → pos:', savedPos);
    }

    overlay.classList.remove('hidden'); // show overlay immediately

    viewer.scrollTop = savedPos;

    requestAnimationFrame(() => {
      if (this.debugScroll) this.mark("after-first-raf");

      requestAnimationFrame(() => {
        overlay.classList.add('hidden'); // always hide overlay

        if (this.debugScroll) {
          this.mark("overlay-hidden");
          console.log('[DEBUG] Scroll restore complete');

          const max = viewer.scrollHeight - viewer.clientHeight;
          const percent = max > 0 ? (savedPos / max) * 100 : 0;

          this.showScrollDebugOverlay({
            restored: savedPos,
            max,
            percent,
          });
        }
      });
    });
  }


  protected toggleTheme(event: Event): void {
    event.preventDefault();
    // console.log(`Log ${this.title()} toogleTheme event`, event);
    this.$isDarkMode.set(!this.$isDarkMode());

    const newTheme = this.$isDarkMode() ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme); // Save preference

    // force effect to reload markdown, in order to enable thema chage
    this.$reload.update(n => n + 1);
  }

  protected backToIndex(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }
    // this.scrollService.setPosition('initialdoc', 0, 0);
    this.$docId.set('initialdoc');
    // force effect to reload markdown in case the activeDocId is the same as previously
    this.$reload.update(n => n + 1);

  }

  protected backToPrevious(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }
    // this.scrollService.setPosition('initialdoc', 0, 0);
    const prevDocId = readSessionState(this.$isBrowser()).prevDocId;
    if (!prevDocId) return;

    this.$docId.set(prevDocId);
    // force effect to reload markdown in case the activeDocId is the same as previously
    this.$reload.update(n => n + 1);
  }


  /* ---------------------------------------------------------
     Debug Tools
  --------------------------------------------------------- */

  private timeline = new Map<string, number>();

  private mark(label: string) {
    this.timeline.set(label, performance.now());
  }

  private exportTimeline(): Record<string, number> {
    const base = [...this.timeline.values()][0] ?? 0;
    const out: Record<string, number> = {};
    for (const [k, v] of this.timeline.entries()) {
      out[k] = Math.round(v - base);
    }
    return out;
  }

  private showScrollDebugOverlay(info: {
    restored: number;
    max: number;
    percent: number;
  }) {
    if (!this.debugScroll) return;

    const timeline = this.exportTimeline();

    const overlay = document.createElement('div');
    overlay.className = 'dv-scroll-debug-overlay';

    overlay.innerHTML = `
    <div class="dv-title">Scroll Restoration Debug</div>
    <div>Restored: <strong>${info.restored}px</strong></div>
    <div>Max: <strong>${info.max}px</strong></div>
    <div>Percent: <strong>${info.percent.toFixed(1)}%</strong></div>

    <div class="dv-subtitle">Timeline (ms)</div>
    ${Object.entries(timeline)
        .map(([k, v]) => `<div>${k}: ${v}</div>`)
        .join('')}
  `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });

    setTimeout(() => {
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 300);
    }, 10000);
  }


}
