import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUpdateUserProfilePhotoModalComponent } from './admin-update-user-profile-photo-modal.component';

describe('AdminUpdateUserProfilePhotoModalComponent', () => {
  let component: AdminUpdateUserProfilePhotoModalComponent;
  let fixture: ComponentFixture<AdminUpdateUserProfilePhotoModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminUpdateUserProfilePhotoModalComponent]
    });
    fixture = TestBed.createComponent(AdminUpdateUserProfilePhotoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
