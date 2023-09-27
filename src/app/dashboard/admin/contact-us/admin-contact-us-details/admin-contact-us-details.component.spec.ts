import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminContactUsDetailsComponent } from './admin-contact-us-details.component';

describe('AdminContactUsDetailsComponent', () => {
  let component: AdminContactUsDetailsComponent;
  let fixture: ComponentFixture<AdminContactUsDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminContactUsDetailsComponent]
    });
    fixture = TestBed.createComponent(AdminContactUsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
