import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTrainerPhotoModalComponent } from './update-trainer-photo-modal.component';

describe('UpdateTrainerPhotoModalComponent', () => {
  let component: UpdateTrainerPhotoModalComponent;
  let fixture: ComponentFixture<UpdateTrainerPhotoModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateTrainerPhotoModalComponent]
    });
    fixture = TestBed.createComponent(UpdateTrainerPhotoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
