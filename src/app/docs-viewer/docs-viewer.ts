import { AfterViewInit, Component, OnDestroy, OnInit, signal, input, computed, Inject, inject, PLATFORM_ID, ViewChild, ElementRef, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UldeViewer } from '../ulde/angular/ulde-viewer/ulde-viewer';
import { MatIconModule } from '@angular/material/icon';
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

  /** Debug mode for scroll restoration */
  debugScroll = false;
  // debugScroll = true;
  $activeDocId = computed<{ docId: string, reloadCounter: number }>(() => ({
    docId: this.$docId() ?? this.$inputDocId(),
    reloadCounter: this.$reload()
  }));

  protected docTitle!: string | undefined;

  // keep a reference to the handler
  private uUldeLinkClickHandler = this.onUldeLinkClick.bind(this);

  private readonly injector = inject(Injector);
  private readonly domHost = inject(UldeDomHostService);

  private root: HTMLElement | null = null;

  // @ViewChild('docsViewer', { static: true }) docsViewer!: ElementRef<HTMLElement>;

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
    if (!this.$isBrowser()) return;

  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.removeEventListener('ulde-link-click', this.uUldeLinkClickHandler);
      this.root = null;
    }
  }

  onContentRendered(isRendered: boolean) {
    // console.log(`Log: ${this.$title()} onContentRendered() root Html isRendred=`, isRendered);
    if (!isRendered) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // const rootViewChild = this.docsViewer.nativeElement;
        this.root = document.getElementById('docsViewer');
        // console.log(`Log: ${this.$title()} onContentRendered() \nrootViewChild=`, rootViewChild, `\nroot=`, root);
        if (!this.root) {
          console.warn(`Warn: ${this.$title()} wireInternalLinks() \nroot=`, this.root);
          return;
        }

        this.domHost.attach(this.root, this.injector);

        this.root.addEventListener('ulde-link-click', this.uUldeLinkClickHandler);

      });
    });
  }


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
      return;
    }
  }

  private scrollToInline(inlineId: string) {
    // Wait for ULDE to finish rendering (contentRendered event)
    requestAnimationFrame(() => {
      const el = this.root?.querySelector(`#${inlineId}`);
      if (!el) return;

      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      el.classList.add('inline-highlight');
      setTimeout(() => el.classList.remove('inline-highlight'), 1200);

      // Optional: make editable
      if (!el.hasAttribute('contenteditable')) {
        el.setAttribute('contenteditable', 'true');
      }
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


}
