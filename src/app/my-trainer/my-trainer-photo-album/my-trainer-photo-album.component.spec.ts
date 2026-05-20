import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerPhotoAlbumComponent } from './my-trainer-photo-album.component';

describe('MyTrainerPhotoAlbumComponent', () => {
  let component: MyTrainerPhotoAlbumComponent;
  let fixture: ComponentFixture<MyTrainerPhotoAlbumComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerPhotoAlbumComponent]
    });
    fixture = TestBed.createComponent(MyTrainerPhotoAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
