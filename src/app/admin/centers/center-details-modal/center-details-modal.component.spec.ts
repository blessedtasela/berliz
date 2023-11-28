import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterDetailsModalComponent } from './center-details-modal.component';

describe('CenterDetailsModalComponent', () => {
  let component: CenterDetailsModalComponent;
  let fixture: ComponentFixture<CenterDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterDetailsModalComponent]
    });
    fixture = TestBed.createComponent(CenterDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
