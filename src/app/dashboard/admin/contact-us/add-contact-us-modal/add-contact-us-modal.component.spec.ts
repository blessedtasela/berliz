import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContactUsModalComponent } from './add-contact-us-modal.component';

describe('AddContactUsModalComponent', () => {
  let component: AddContactUsModalComponent;
  let fixture: ComponentFixture<AddContactUsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddContactUsModalComponent]
    });
    fixture = TestBed.createComponent(AddContactUsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
