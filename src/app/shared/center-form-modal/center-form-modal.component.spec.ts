import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterFormModalComponent } from './center-form-modal.component';

describe('CenterFormModalComponent', () => {
  let component: CenterFormModalComponent;
  let fixture: ComponentFixture<CenterFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterFormModalComponent]
    });
    fixture = TestBed.createComponent(CenterFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
