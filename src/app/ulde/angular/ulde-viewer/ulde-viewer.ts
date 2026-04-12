import {
  Component, OnChanges, SimpleChanges, signal, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, Injector, input, output, PLATFORM_ID, Inject,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { UldeService } from '../ulde.service';
import { UldeDomHostService } from '../ulde-dom-host.service';
import { UldeContentResult } from '../../core/runtime/ulde.types';
import { UldeDebugOverlay } from '../ulde-debug-overlay/ulde-debug-overlay';

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

  docId = input<string>('');
  // @Input() path!: string;
  contentRendered = output<HTMLElement>();


  @ViewChild('contentRoot', { static: false })
  contentRoot?: ElementRef<HTMLElement>;

  @ViewChild('uldeViewer', { static: false })
  uldeViewer?: ElementRef<HTMLElement>;

  private readonly ulde = inject(UldeService);
  private readonly domHost = inject(UldeDomHostService);

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


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.$isBrowser.set(isBrowser);
  }

  async ngOnChanges(changes: SimpleChanges) {
    // if (!this.$isBrowser()) return;

    if (changes['docId'] && this.docId()) {
      await this.loadAndRender(this.docId());

      // const rendered = (this.rendered()) ? true : false;

      if (this.rendered()) {

        // const root = document.getElementById('contentRoot');
        const root = this.contentRoot?.nativeElement;
        console.log(`Log: UldeViewer ngOnChages \nroot= `, root);
        // console.log(`Log: UldeViewer ngOnChanges rendered= `, true, this.rendered()?.content);
        this.viewReady = true;
        this.attachDomHostIfReady();
        this.$isRendered.emit(true);
      }
    }
  }

  ngAfterViewInit() {
    if (!this.$isBrowser()) return;
  }

  ngOnDestroy() {
    this.domHost.detach();
  }

  private attachDomHostIfReadyOld() {


    const root = this.contentRoot?.nativeElement;
    console.log(`Log: UldeViewer attachDomHostIfReady() \nroot= `, root);

    if (!root) return;

    // ✔ Correct: pass the component's injector
    this.domHost.attach(root, this.injector);
  }
  private attachDomHostIfReady() {

    const uldeViewer = this.uldeViewer?.nativeElement;

    const blocks = uldeViewer?.getElementsByClassName('ulde-viewer_content');

    console.log(`Log: UldeViewer attachDomHostIfReady() \nuldeViewer= `, uldeViewer, blocks);

    if (!uldeViewer) return;
    this.domHost.attach(uldeViewer, this.injector);

  }

  private async loadAndRender(docId: string | undefined) {

    if (!docId) return;

    // private async loadAndRender(path: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const { text, path } = await this.ulde.loadDocById(docId);

      // console.log(`[UldeViewer][${this.docId()}] \npath=${path} \ntext=${text}`);
      // const raw = await this.fetchDoc(path);

      const result = await this.ulde.renderFromSource({
        id: docId,
        path: path,
        format: 'markdown',
        rawContent: text,
      });
      // const result = await this.ulde.renderFromSource({
      //   id: path,
      //   path,
      //   format: 'markdown',
      //   rawContent: raw,
      // });

      this.rendered.set(result);
      const html = document.createElement('html');
      html.innerHTML = result.content;
      this.contentRendered.emit(html);

      if (this.viewReady) {
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
}
