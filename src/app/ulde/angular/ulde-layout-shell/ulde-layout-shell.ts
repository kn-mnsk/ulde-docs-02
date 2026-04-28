import { Component, input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { UldeContentResult } from '../../core/runtime/ulde.types';
import { UldeDebugOverlay } from '../ulde-debug-overlay/ulde-debug-overlay';

@Component({
  selector: 'app-ulde-layout-shell',
  imports: [UldeDebugOverlay],
  templateUrl: './ulde-layout-shell.html',
  styleUrl: './ulde-layout-shell.scss',
})
export class UldeLayoutShell {
  $loading = input<boolean>(false);
  $error = input<boolean | null>(null);
  $contentResult = input<UldeContentResult | null>(null);
  $html = input<SafeHtml | string>('');
}
