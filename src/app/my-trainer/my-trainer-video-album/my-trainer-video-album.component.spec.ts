import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerVideoAlbumComponent } from './my-trainer-video-album.component';

describe('MyTrainerVideoAlbumComponent', () => {
  let component: MyTrainerVideoAlbumComponent;
  let fixture: ComponentFixture<MyTrainerVideoAlbumComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerVideoAlbumComponent]
    });
    fixture = TestBed.createComponent(MyTrainerVideoAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
