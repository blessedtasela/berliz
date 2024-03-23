import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainersAlbumComponent } from './trainers-album.component';

describe('TrainersAlbumComponent', () => {
  let component: TrainersAlbumComponent;
  let fixture: ComponentFixture<TrainersAlbumComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainersAlbumComponent]
    });
    fixture = TestBed.createComponent(TrainersAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
