import { Component, inject, computed } from '@angular/core';
import { UldeDomHostService } from '../ulde-dom-host.service';

@Component({
  selector: 'app-ulde-debug-overlay',
  imports: [],
  templateUrl: './ulde-debug-overlay.html',
  styleUrl: './ulde-debug-overlay.scss',
})
export class UldeDebugOverlay {
  private readonly domHost = inject(UldeDomHostService);

  readonly diagnostics = computed(() => this.domHost.diagnostics());
}
