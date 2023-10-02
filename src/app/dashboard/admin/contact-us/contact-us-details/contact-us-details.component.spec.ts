import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsDetailsComponent } from './contact-us-details.component';

describe('ContactUsDetailsComponent', () => {
  let component: ContactUsDetailsComponent;
  let fixture: ComponentFixture<ContactUsDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactUsDetailsComponent]
    });
    fixture = TestBed.createComponent(ContactUsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
