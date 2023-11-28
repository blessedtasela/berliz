import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateContactUsModalComponent } from './update-contact-us-modal.component';

describe('UpdateContactUsModalComponent', () => {
  let component: UpdateContactUsModalComponent;
  let fixture: ComponentFixture<UpdateContactUsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateContactUsModalComponent]
    });
    fixture = TestBed.createComponent(UpdateContactUsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
