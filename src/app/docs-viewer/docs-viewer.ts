import { AfterViewInit, Component, OnDestroy, OnInit, signal, input, computed, Inject, inject, PLATFORM_ID, ViewChild, ElementRef, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UldeViewer } from '../ulde/angular/ulde-viewer/ulde-viewer';
import { navigate } from '../global.utils/global.utils';
import { MatIconModule } from '@angular/material/icon';
import { take, firstValueFrom } from 'rxjs';
import { readSessionState, writeSessionState } from './session-state.manage';
import { UldeDomHostService } from '../ulde/angular/ulde-dom-host.service';

import mermaid from 'mermaid';

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
  // protected $docId = signal<string>('test.initialdoc');
  // protected $docId = signal<string | null>(null);
  private $reload = signal(0);

  /** Debug mode for scroll restoration */
  debugScroll = false;
  // debugScroll = true;
  $activeDocId = computed<{ docId: string, reloadCounter: number }>(() => ({
    docId: this.$docId() ?? this.$inputDocId(),
    reloadCounter: this.$reload()
  }));

  protected docTitle!: string | undefined;

  // keep a reference to the handler
  private clickHandler!: (e: Event) => void;
  // private clickHandler = this.onClick.bind(this);
  // private scrollHandler = this.onScroll.bind(this);

  private sanitizer = inject(DomSanitizer);

  // ✔ The correct injector for DOM host
  private readonly injector = inject(Injector);
  private readonly domHost = inject(UldeDomHostService);

  @ViewChild('docsViewer', { static: true }) docsViewer!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.$isBrowser.set(isBrowser);

  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    if (!this.$isBrowser()) return;

    this.domHost.attach(this.docsViewer.nativeElement, inject(Injector))

    // this.wireInternalLinks(this.docsViewer.nativeElement);
  }

  onContentRendered(isRendered: boolean) {
    // console.log(`Log: ${this.$title()} onContentRendered() root Html isRendred=`, isRendered);
    if (!isRendered) return;
    // if (!this.$isBrowser()) return;
    // if (!this.docsViewer.nativeElement) return;
    // this.wireInternalLinks(this.docsViewer.nativeElement);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // const rootViewChild = this.docsViewer.nativeElement;
        const root = document.getElementById('docsViewer');
        //     // console.log(`Log: ${this.$title()} onContentRendered() \nrootViewChild=`, rootViewChild, `\nroot=`, root);
        if (!root) {
          console.warn(`Warn: ${this.$title()} wireInternalLinks() \nroot=`, root);
          return;
        }

        //     // mermaid.initialize({ startOnLoad: false });
        //     // mermaid.run({ querySelector: '.language-mermaid' });

        //     this.domHost.update();
        this.domHost.attach(root, this.injector);
        this.wireInternalLinks(root);
      });
    });
  }

  private wireInternalLinks(root: HTMLElement) {

    console.log(`Log: ${this.$title()} wireInternalLinks() \nroot=`, root);

    const links = root.querySelectorAll<HTMLAnchorElement>('a[href]');

    this.clickHandler = (e: Event) => this.onClick(e, root);
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      // link.addEventListener('click', this.clickHandler.arguments(root));
      link.addEventListener('click', this.clickHandler);
    });
  }

  private onClick(e: Event, root: HTMLElement): void {

    e.preventDefault();
    e.stopPropagation();

    const anchor = e.currentTarget as HTMLAnchorElement;
    const href = (anchor.getAttribute('href'))?.split(':').flat() ?? null;

    if (!href) {
      console.warn(`Warn ${this.$title()} : On Click  Failed  Reference Not Found`);
      navigate(this.router, ['/fallback']);
      return;
    }
    const target = href; // remove leading '#'
    // const target = href.slice(1); // remove leading '#'

    // Pattern: docId or docId#inlineId
    const [linkId, destId] = target;
    // const [docId, inlineId] = target.split('#');

    // 1. Navigate to new doc
    if (linkId === "#docId") {
      if (destId && destId !== this.$docId()) {
        // if (docId && docId !== this.$docId()) {
        this.$docId.set(destId);
        // this.$docId.set(docId);
        this.$reload.update(n => n + 1);; // optional depending on your model
        return;
      }
    }

    // 2. Inline navigation within same doc
    if (linkId === "#inlineId") {
      // if (inlineId) {
      anchor.parentElement
      const el = root.querySelector<HTMLElement>(`#${destId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // highlight
        el.classList.add('inline-highlight');
        setTimeout(() => el.classList.remove('inline-highlight'), 1200);

        // make editable if needed
        if (!el.hasAttribute('contenteditable')) {
          el.setAttribute('contenteditable', 'true');
        }
      }
    }

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
