import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProfilePhotoModalComponent } from './update-profile-photo-modal.component';

describe('UpdateProfilePhotoModalComponent', () => {
  let component: UpdateProfilePhotoModalComponent;
  let fixture: ComponentFixture<UpdateProfilePhotoModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateProfilePhotoModalComponent]
    });
    fixture = TestBed.createComponent(UpdateProfilePhotoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
