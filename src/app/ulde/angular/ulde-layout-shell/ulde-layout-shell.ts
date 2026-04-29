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
  $contentResult = input<UldeContentResult | null>(null);
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


  // const sidebar = document.getElementById("sidebarBox");
  @ViewChild('sidebar', { static: false }) sidebar!: ElementRef<HTMLElement>;
  // const resizer = document.getElementById("sidebarResizer");
  @ViewChild('sidebarResizer', { static: false }) resizer!: ElementRef<HTMLElement>;
  // @ViewChild('docbody', { static: false }) docbody!: ElementRef<HTMLElement>;
  private docBody: HTMLElement | null = null;

  constructor(
    public readonly scrollService: ScrollService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.$isBrowser.set(isBrowser);
  }


  ngAfterViewInit(): void {
    console.log(`Log: [UldeLayoutShell] ngAfterViewInit this.docbody`, this.docBody);
    if (!this.$isBrowser()) return;
    if (!this.sidebar || !this.resizer) return;
    console.log(`Log: [UldeLayoutShell] ngAfterViewInit this.docbody`, this.docBody);

    // this.eventRegister();
    // requestAnimationFrame(() => {
      this.docBody = document.getElementById('doc-body');
      console.log(`Log: [UldeLayoutShell] ngAfterViewInit this.docbody`, this.docBody);

      if (!this.docBody) return;
      console.log(`Log: [UldeLayoutShell] ngAfterViewInit this.docbody`, this.docBody);
      this.domHost.attach(this.docBody, this.injector);
      this.eventsRegister();

      this.restoreScroll(this.$inputDocId(), this.docBody);
    // });

  }

  ngOnDestroy(): void {
    this.resizer.nativeElement.removeEventListener("mousedown", this.mouseDownHandler);
    this.sidebar.nativeElement.removeEventListener("mousemove", this.mouseMoveHandler);
    this.sidebar.nativeElement.removeEventListener("mouseup", this.mouseUpHandler);
    this.docBody?.removeEventListener('ulde-link-click', this.uldeLinkClickHandler);

    this.docBody?.removeEventListener('ulde-scroll', this.uldeScrollHandler);

  }

  private eventsRegister() {

    // const sidebar = document.getElementById("sidebarBox");
    // const resizer = document.getElementById("sidebarResizer");
    // if (!this.sidebar || !this.resizer) return;
    // const docBody = document.getElementById('content');

    this.isResizing = false;

    this.resizer.nativeElement.addEventListener("mousedown", this.mouseDownHandler);
    this.sidebar.nativeElement.addEventListener("mousemove", this.mouseMoveHandler);
    this.sidebar.nativeElement.addEventListener("mouseup", this.mouseUpHandler);


    this.docBody?.addEventListener('ulde-link-click', this.uldeLinkClickHandler);
    this.docBody?.addEventListener('ulde-scroll', this.uldeScrollHandler);
    // this.docbody.nativeElement.addEventListener('ulde-scroll', this.uldeScrollHandler);

  }

  private onMouseDown(e: MouseEvent) {
    this.isResizing = true;
    this.sidebar.nativeElement.style.cursor = "e-resize";
    this.resizer.nativeElement.style.width = "10px";
    this.resizer.nativeElement.style.background = "#3f51b5";
    e.preventDefault();

  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isResizing) return;


    this.resizer.nativeElement.style.width = "10px";
    this.resizer.nativeElement.style.background = "#3f51b5";
    const newWidth = e.clientX;
    if (newWidth > 150 && newWidth < 500) { // min/max width
      this.sidebar.nativeElement.style.width = newWidth + "px";
    }
  }

  private onMouseUp(e: MouseEvent) {

    if (this.isResizing) {
      this.isResizing = false;
      this.sidebar.nativeElement.style.cursor = "";
      this.resizer.nativeElement.style.background = "transparent";
      this.resizer.nativeElement.style.width = "10px";

    }
  }


  private onUldeScroll(event: any): void {
    console.log(`Log: [UldeLayoutShell] onUldeScroll`, event);
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
    console.log(`Log: Onclick`, e);
    if (e.type === 'ulde-link-click') {
      const { linkId, destId } = e.detail;
      // this.handleInternalNavigation(linkId, destId);
    }
  }




  private handleInternalNavigation(linkId: string, destId: string) {
    if (linkId === '#docId') {
      if (destId && destId !== this.$inputDocId()) {
        this.$outputDocId.emit(destId);
        // this.$docId.set(destId);
        // this.$reload.update(n => n + 1);;
      }
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

    const overlay = viewer.parentElement!.querySelector('.doc-body-overlay') as HTMLElement;
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
