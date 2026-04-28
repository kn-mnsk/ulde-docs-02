import { AfterViewInit, Component, ElementRef, input, ViewChild, Inject, PLATFORM_ID, signal, OnDestroy } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { UldeContentResult } from '../../core/runtime/ulde.types';
import { UldeDebugOverlay } from '../ulde-debug-overlay/ulde-debug-overlay';

import { isPlatformBrowser } from '@angular/common';
import { RouterEvent, RouterLink } from '@angular/router';

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
  $contentResult = input<UldeContentResult | null>(null);
  $html = input<SafeHtml | string>('');

  private mouseDownHandler = this.onMouseDown.bind(this);
  private mouseMoveHandler = this.onMouseMove.bind(this);
  private mouseUpHandler = this.onMouseUp.bind(this);

  private isResizing!: boolean;

  // const sidebar = document.getElementById("sidebarBox");
  @ViewChild('sidebar', { static: false }) sidebar!: ElementRef<HTMLElement>;
  // const resizer = document.getElementById("sidebarResizer");
  @ViewChild('sidebarResizer', { static: false }) resizer!: ElementRef<HTMLElement>;
  // @ViewChild('sidebar', { static: false }) sidebar!: ElementRef<HTMLElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);
    this.$isBrowser.set(isBrowser);
  }


  ngAfterViewInit(): void {
    if (!this.$isBrowser()) return;
    if (!this.sidebar || !this.resizer) return;
    this.eventRegister();
  }

  ngOnDestroy(): void {
    this.resizer.nativeElement.removeEventListener("mousedown", this.mouseDownHandler);
    this.sidebar.nativeElement.removeEventListener("mousemove", this.mouseMoveHandler);
    this.sidebar.nativeElement.removeEventListener("mouseup", this.mouseUpHandler);

  }

  private eventRegister() {

    // const sidebar = document.getElementById("sidebarBox");
    // const resizer = document.getElementById("sidebarResizer");
    if (!this.sidebar || !this.resizer) return;

    this.isResizing = false;

    this.resizer.nativeElement.addEventListener("mousedown", this.mouseDownHandler);
    this.sidebar.nativeElement.addEventListener("mousemove", this.mouseMoveHandler);
    this.sidebar.nativeElement.addEventListener("mouseup", this.mouseUpHandler);

  }

  private onMouseDown(e: MouseEvent) {
    this.isResizing = true;
    this.sidebar.nativeElement.style.cursor = "e-resize";
    e.preventDefault();

  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isResizing) return;
    const newWidth = e.clientX;
    if (newWidth > 150 && newWidth < 500) { // min/max width
      this.sidebar.nativeElement.style.width = newWidth + "px";
    }
  }

  private onMouseUp(e: MouseEvent) {

    if (this.isResizing) {
      this.isResizing = false;
      this.sidebar.nativeElement.style.cursor = "";
    }
  }

}
