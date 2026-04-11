import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  signal,
  inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Injector,
  input,
  output,
  computed,
} from '@angular/core';

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
  docId = input<string>('');
  // @Input() path!: string;
  contentRendered = output<HTMLElement>();

  @ViewChild('contentRoot', { static: false })
  contentRoot?: ElementRef<HTMLElement>;

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

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['docId'] && this.docId()) {
      await this.loadAndRender(this.docId());
      this.$isRendered.emit((this.rendered()) ? true : false)
    }
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.attachDomHostIfReady();
    // if (!this.docId()) {
    //   this.loadAndRender('initialdoc'); // for initial loading
    // }
  }

  ngOnDestroy() {
    this.domHost.detach();
  }

  private attachDomHostIfReady() {
    if (!this.contentRoot?.nativeElement) return;

    // ✔ Correct: pass the component's injector
    this.domHost.attach(this.contentRoot.nativeElement, this.injector);
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
