import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCvModalComponent } from './view-cv-modal.component';

describe('ViewCvModalComponent', () => {
  let component: ViewCvModalComponent;
  let fixture: ComponentFixture<ViewCvModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCvModalComponent]
    });
    fixture = TestBed.createComponent(ViewCvModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
