import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUpdateUserModalComponent } from './admin-update-user-modal.component';

describe('AdminUpdateUserModalComponent', () => {
  let component: AdminUpdateUserModalComponent;
  let fixture: ComponentFixture<AdminUpdateUserModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminUpdateUserModalComponent]
    });
    fixture = TestBed.createComponent(AdminUpdateUserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
