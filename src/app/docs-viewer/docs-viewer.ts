import { AfterViewInit, Component, OnDestroy, OnInit, signal, input, computed, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UldeViewer } from '../ulde/angular/ulde-viewer/ulde-viewer';
import { navigate } from '../global.utils/global.utils';

@Component({
  selector: 'app-docs-viewer',
  imports: [UldeViewer],
  templateUrl: './docs-viewer.html',
  styleUrl: './docs-viewer.scss',
})
export class DocsViewer implements OnInit, AfterViewInit, OnDestroy {

  protected readonly $title = signal("DocsViewer");

  private $isBrowser = signal<boolean>(false);

  protected $isDarkMode = signal<boolean>(true);

  protected $inputDocId = input.required<string>(); // from DocsViewerDirective
  protected $docId = signal<string>('index');
  // protected $docId = signal<string | null>(null);
  private $reload = signal(0);

  $activeDocId = computed<{ docId: string, reloadCounter: number }>(() => ({
    docId: this.$docId() ?? this.$inputDocId(),
    reloadCounter: this.$reload()
  }));

  protected docTitle!: string | undefined;

  // keep a reference to the handler
  private clickHandler!: (e: Event) => void;
  // private clickHandler = this.onClick.bind(this);
  // private scrollHandler = this.onScroll.bind(this);


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

  }

  onContentRenderedOld(root: HTMLElement) {
    console.log(`Log: ${this.$title} root Html`, root);
    this.wireInternalLinksOld(root);
  }

  onContentRendered(isRendered: boolean) {
    console.log(`Log: ${this.$title} root Html`, isRendered);
    this.wireInternalLinks();
  }

  private wireInternalLinksOld(root: HTMLElement) {
    const links = root.querySelectorAll<HTMLAnchorElement>('a[href]');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      link.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const target = href.slice(1); // remove leading '#'

        // Pattern: docId or docId#inlineId
        const [docId, inlineId] = target.split('#');

        // 1. Navigate to new doc
        if (docId && docId !== this.$docId()) {
          this.$docId.set(docId);
          this.$reload.update(n => n + 1);; // optional depending on your model
          return;
        }

        // 2. Inline navigation within same doc
        if (inlineId) {
          const el = root.querySelector<HTMLElement>(`#${inlineId}`);
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
      });
    });
  }


  private wireInternalLinks() {
    const root = this.docsViewer.nativeElement;
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
}
