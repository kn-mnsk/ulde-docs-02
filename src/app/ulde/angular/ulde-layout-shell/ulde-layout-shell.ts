import { AfterViewInit, Component, ElementRef, input, ViewChild, Inject, PLATFORM_ID, signal, OnDestroy, inject, Injector, output } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { UldeContentResult } from '../../core/runtime/ulde.types';
import { UldeDebugOverlay } from '../ulde-debug-overlay/ulde-debug-overlay';

import { isPlatformBrowser } from '@angular/common';
import { RouterEvent, RouterLink } from '@angular/router';
import { ScrollService } from '../../../docs-viewer/scroll.service';
import { writeSessionState } from '../../../docs-viewer/session-state.manage';
import { UldeDomHostService } from '../ulde-dom-host.service';


@Component({
  selector: 'app-ulde-layout-shell',
  imports: [UldeDebugOverlay, RouterLink],
  templateUrl: './ulde-layout-shell.html',
  styleUrl: './ulde-layout-shell.scss',
})
export class UldeLayoutShell implements AfterViewInit, OnDestroy {

  private $isBrowser = signal<boolean>(false);

  $loading = input<boolean>(false);
  $error = input<boolean | null>(null);
  // $contentResult = input.required<UldeContentResult>();
  // $contentResult = input<UldeContentResult | null>(null);
  $html = input.required<SafeHtml | string>();
  $inputDocId = input.required<string>();
  $outputDocId = output<string>();

  private mouseDownHandler = this.onMouseDown.bind(this);
  private mouseMoveHandler = this.onMouseMove.bind(this);
  private mouseUpHandler = this.onMouseUp.bind(this);


  private uldeScrollHandler = this.onUldeScroll.bind(this);
  private uldeLinkClickHandler = this.onUldeLinkClick.bind(this);


  private rafPending = false;
  /** Debug mode for scroll restoration */
  debugScroll = false;

  private isResizing!: boolean;

  private readonly injector = inject(Injector);
  private readonly domHost = inject(UldeDomHostService);

  @ViewChild('uldeLayoutSidebar', { static: false }) uldeLayoutSidebar!: ElementRef<HTMLElement>;
  @ViewChild('uldeLayoutSidebarResizer', { static: false }) uldeLayoutSidebarResizer!: ElementRef<HTMLElement>;
  @ViewChild('uldeLayoutMain', { static: false }) uldeLayoutMain!: ElementRef<HTMLElement>;

  constructor(
    public readonly scrollService: ScrollService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.$isBrowser.set(isBrowser);
  }


  ngAfterViewInit(): void {
    if (!this.$isBrowser()) return;
    if (!this.uldeLayoutSidebar || !this.uldeLayoutSidebarResizer) return;
    const uldeLayoutMain = this.uldeLayoutMain.nativeElement;
    console.log(`Log: [UldeLayoutShell] ngAfterViewInit uldelayoutmain`, uldeLayoutMain);
    if (!uldeLayoutMain) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.domHost.attach(uldeLayoutMain, this.injector);
        this.eventsRegister();
        this.restoreScroll(this.$inputDocId(), uldeLayoutMain);

      });
    });
  }

  ngOnDestroy(): void {
    this.uldeLayoutSidebarResizer.nativeElement.removeEventListener("mousedown", this.mouseDownHandler);
    this.uldeLayoutSidebar.nativeElement.removeEventListener("mousemove", this.mouseMoveHandler);
    this.uldeLayoutSidebar.nativeElement.removeEventListener("mouseup", this.mouseUpHandler);
    this.uldeLayoutMain?.nativeElement.removeEventListener('ulde-link-click', this.uldeLinkClickHandler);

    this.uldeLayoutMain?.nativeElement.removeEventListener('ulde-scroll', this.uldeScrollHandler);

  }

  private eventsRegister() {

    this.isResizing = false;

    this.uldeLayoutSidebarResizer.nativeElement.addEventListener("mousedown", this.mouseDownHandler);
    this.uldeLayoutSidebar.nativeElement.addEventListener("mousemove", this.mouseMoveHandler);
    this.uldeLayoutSidebar.nativeElement.addEventListener("mouseup", this.mouseUpHandler);

    this.uldeLayoutMain?.nativeElement.addEventListener('ulde-link-click', this.uldeLinkClickHandler);
    this.uldeLayoutMain?.nativeElement.addEventListener('ulde-scroll', this.uldeScrollHandler);

  }

  private onMouseDown(e: MouseEvent) {
    this.isResizing = true;
    this.uldeLayoutSidebar.nativeElement.style.cursor = "e-resize";
    this.uldeLayoutSidebarResizer.nativeElement.style.width = "10px";
    this.uldeLayoutSidebarResizer.nativeElement.style.background = "#4a87f8";
    e.preventDefault();

  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isResizing) return;

    this.uldeLayoutSidebarResizer.nativeElement.style.width = "10px";
    this.uldeLayoutSidebarResizer.nativeElement.style.background = " #4a87f8";
    const newWidth = e.clientX;
    if (newWidth > 150 && newWidth < 500) { // min/max width
      this.uldeLayoutSidebar.nativeElement.style.width = newWidth + "px";
    }
  }

  private onMouseUp(e: MouseEvent) {
    if (this.isResizing) {
      this.isResizing = false;
      this.uldeLayoutSidebar.nativeElement.style.cursor = "";
      this.uldeLayoutSidebarResizer.nativeElement.style.background = "transparent";
      this.uldeLayoutSidebarResizer.nativeElement.style.width = "10px";

    }
  }

  private onUldeScroll(event: any): void {
    console.log(`Log: [UldeLayoutShell] onUldeScroll`);
    if (event.type === 'ulde-scroll') {
      const { pos, height } = event.detail;

      const docId = this.$inputDocId() ?? '';
      // const docId = this.$activeDocId().docId ?? '';

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


  private onUldeLinkClick(e: any) {
    console.log(`Log: [UldeLayoutShell] Onclick`, e);
    if (e.type === 'ulde-link-click') {
      const { linkId, destId } = e.detail;
      this.handleInternalNavigation(linkId, destId);
    }
  }


  private handleInternalNavigation(linkId: string, destId: string) {
    if (linkId === '#docId') {
      if (destId && destId !== this.$inputDocId()) {
        this.$outputDocId.emit(destId);
        // this.$docId.set(destId);
        // this.$reload.update(n => n + 1);;
      }
      this.$outputDocId.emit(destId);
      return;
    }

    if (linkId === '#inlineId') {
      this.scrollToInline(destId);

      return;
    }
  }

  private scrollToInline(inlineId: string) {
    // Wait for ULDE to finish rendering (contentRendered event)
    // requestAnimationFrame(() => {
    // console.log(`Log: scrollToInline this.root=`, this.root);

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


  private restoreScroll(docId: string, viewer: HTMLElement): void {

    const savedPos = this.scrollService.getPosition(docId);

    const overlay = viewer.parentElement!.querySelector('.ulde-layout-main_overlay') as HTMLElement;
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
