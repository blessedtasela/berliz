import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEmailModalComponent } from './update-email-modal.component';

describe('UpdateEmailModalComponent', () => {
  let component: UpdateEmailModalComponent;
  let fixture: ComponentFixture<UpdateEmailModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateEmailModalComponent]
    });
    fixture = TestBed.createComponent(UpdateEmailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
