import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUpdateUserRoleModalComponent } from './admin-update-user-role-modal.component';

describe('AdminUpdateUserRoleModalComponent', () => {
  let component: AdminUpdateUserRoleModalComponent;
  let fixture: ComponentFixture<AdminUpdateUserRoleModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminUpdateUserRoleModalComponent]
    });
    fixture = TestBed.createComponent(AdminUpdateUserRoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
