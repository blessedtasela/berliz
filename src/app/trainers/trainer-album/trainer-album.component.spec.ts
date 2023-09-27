import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerAlbumComponent } from './trainer-album.component';

describe('TrainerAlbumComponent', () => {
  let component: TrainerAlbumComponent;
  let fixture: ComponentFixture<TrainerAlbumComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerAlbumComponent]
    });
    fixture = TestBed.createComponent(TrainerAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
