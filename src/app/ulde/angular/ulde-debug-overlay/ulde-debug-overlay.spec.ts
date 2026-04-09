import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UldeDebugOverlay } from './ulde-debug-overlay';

describe('UldeDebugOverlay', () => {
  let component: UldeDebugOverlay;
  let fixture: ComponentFixture<UldeDebugOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UldeDebugOverlay],
    }).compileComponents();

    fixture = TestBed.createComponent(UldeDebugOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
