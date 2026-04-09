import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UldeLayoutShell } from './ulde-layout-shell';

describe('UldeLayoutShell', () => {
  let component: UldeLayoutShell;
  let fixture: ComponentFixture<UldeLayoutShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UldeLayoutShell],
    }).compileComponents();

    fixture = TestBed.createComponent(UldeLayoutShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
