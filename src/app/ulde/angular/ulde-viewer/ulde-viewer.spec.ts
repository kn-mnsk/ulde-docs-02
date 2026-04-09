import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UldeViewer } from './ulde-viewer';

describe('UldeViewer', () => {
  let component: UldeViewer;
  let fixture: ComponentFixture<UldeViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UldeViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(UldeViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
