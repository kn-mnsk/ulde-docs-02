// src/app/ulde/utils/dom/dom-budget.ts

import { UldeDomBudget } from '../../core/runtime/ulde.types';

export class DomBudgetTracker {
  private listeners = 0;
  private intervals = 0;
  private timeouts = 0;

  constructor(private readonly budget: UldeDomBudget) {}

  canAddListener(): boolean {
    return this.listeners < this.budget.maxListeners;
  }

  addedListener(): void {
    this.listeners++;
  }

  canAddInterval(): boolean {
    return this.intervals < this.budget.maxIntervals;
  }

  addedInterval(): void {
    this.intervals++;
  }

  canAddTimeout(): boolean {
    return this.timeouts < this.budget.maxTimeouts;
  }

  addedTimeout(): void {
    this.timeouts++;
  }
}
